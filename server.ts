import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import { GoogleGenAI } from "@google/genai";
import { initializeDatabase } from "./src/db/index";
import {
  projectRepo,
  buildRepo,
  agentTokenRepo,
  auditRepo,
  vaultRepo,
  taskRepo,
  chatRepo,
  deviceRepo,
  serviceRepo,
  webExtractionRepo,
} from "./src/db/repositories";
import { runRealBuild, BuildConfig } from "./src/services/buildWorker";
import {
  agentPluginRateLimiter,
  agentPluginAuthMiddleware,
  agentAuditMiddleware,
  requirePermission,
  generalRateLimiter,
} from "./src/middleware/agentPlugin";
import { v4 as uuidv4 } from "uuid";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// Socket.io for real-time updates
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const port = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(generalRateLimiter);

// Initialize Gemini client
const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: { headers: { "User-Agent": "aistudio-build" } },
    })
  : null;

// Initialize database on startup
await initializeDatabase();

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`[Socket] Client connected: ${socket.id}`);

  socket.on("subscribe:build", (buildId: string) => {
    socket.join(`build:${buildId}`);
    console.log(`[Socket] ${socket.id} subscribed to build:${buildId}`);
  });

  socket.on("subscribe:terminal", (sessionId: string) => {
    socket.join(`term:${sessionId}`);
  });

  socket.on("subscribe:metrics", () => {
    socket.join("metrics");
  });

  socket.on("disconnect", () => {
    console.log(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Broadcast helper
function broadcastBuildProgress(buildId: string, progress: any) {
  io.to(`build:${buildId}`).emit("build:progress", progress);
}

function broadcastMetrics(metrics: any) {
  io.to("metrics").emit("metrics:update", metrics);
}

// ============================================
// HEALTH & SYSTEM
// ============================================

app.get("/api/system/health", (_req, res) => {
  res.json({
    status: "ok",
    buildEngine: "DroidCraft Cloud Compiler v4.8.2-fastbuild",
    sdkVersion: "Android SDK 35 (Vanilla Ice Cream) / NDK r27c",
    gradleVersion: "Gradle 8.7 / AGP 8.4.1",
    workerNodes: [
      { id: "node-fra-01", region: "EU (Frankfurt)", status: "idle", load: "14%" },
      { id: "node-ist-02", region: "TR (Istanbul)", status: "active", load: "38%" },
      { id: "node-us-03", region: "US-East (Virginia)", status: "idle", load: "9%" },
    ],
    supportedLanguages: [
      { id: "kotlin", name: "Kotlin 2.1 (Jetpack Compose)", default: true },
      { id: "java", name: "Java 21 / Android SDK", default: false },
      { id: "flutter", name: "Flutter 3.27 / Dart 3.6", default: false },
      { id: "react_native", name: "React Native 0.77 (New Architecture)", default: false },
      { id: "cpp_ndk", name: "C++23 / Android NDK r27c (CMake 3.28)", default: false },
      { id: "rust_mobile", name: "Rust 1.83 (cargo-apk)", default: false },
      { id: "python_kivy", name: "Python 3.12 / Kivy", default: false },
    ],
    database: "libSQL (SQLite)",
    mcp: { stdio: true, http: true },
    agentPlugin: { enabled: true, masterToken: true },
  });
});

// ============================================
// PROJECT MANAGEMENT
// ============================================

app.get("/api/projects", async (_req, res) => {
  const projects = await projectRepo.getAll();
  res.json({ projects });
});

app.get("/api/projects/:id", async (req, res) => {
  const project = await projectRepo.getById(req.params.id);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ project });
});

app.post("/api/projects", async (req, res) => {
  const project = await projectRepo.create(req.body);
  res.status(201).json({ project });
});

app.patch("/api/projects/:id", async (req, res) => {
  const project = await projectRepo.update(req.params.id, req.body);
  if (!project) return res.status(404).json({ error: "Project not found" });
  res.json({ project });
});

app.delete("/api/projects/:id", async (req, res) => {
  await projectRepo.delete(req.params.id);
  res.json({ success: true });
});

// ============================================
// BUILD MANAGEMENT
// ============================================

app.get("/api/build/history", async (req, res) => {
  const projectId = req.query.projectId as string;
  let builds;
  if (projectId) {
    builds = await buildRepo.getByProject(projectId);
  } else {
    builds = await buildRepo.getAll(50);
  }
  res.json({ builds });
});

app.get("/api/build/:id", async (req, res) => {
  const build = await buildRepo.getById(req.params.id);
  if (!build) return res.status(404).json({ error: "Build not found" });
  res.json({ build });
});

// Real build with SSE streaming
app.post("/api/build/trigger", async (req, res) => {
  const { projectId, buildType = "release_apk" } = req.body;

  const project = await projectRepo.getById(projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const config: BuildConfig = {
    projectId,
    projectName: project.name,
    packageName: project.packageName,
    versionName: project.versionName,
    versionCode: project.versionCode,
    language: project.language,
    buildType,
    modules: project.activeModules,
    minify: project.minifyEnabled,
    shrinkResources: project.shrinkResources,
    signingScheme: project.signingScheme,
  };

  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const sendEvent = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    const result = await runRealBuild(config, (progress) => {
      sendEvent(progress);
      broadcastBuildProgress(progress.buildId || "", progress);
    });

    sendEvent({ type: "complete", ...result });
  } catch (error: any) {
    sendEvent({ type: "error", error: error.message });
  } finally {
    res.end();
  }
});

// Download build artifact
app.get("/api/build/download/:buildId/:fileName", async (req, res) => {
  // In production, serve from object storage (S3/MinIO)
  // For now, return a placeholder
  res.status(404).json({ error: "Artifact storage not configured. Use S3/MinIO in production." });
});

// ============================================
// AGENT PLUGIN API
// ============================================

// Auth endpoint (public)
app.post("/api/agent/plugin/auth", async (req, res) => {
  const { token, agentName = "External AI Agent" } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token gereklidir." });
  }

  const validation = await agentTokenRepo.validate(token);
  if (!validation.valid) {
    return res.status(401).json({ error: "Geçersiz Agent Plugin Token" });
  }

  const sessionId = `sess-${uuidv4().slice(0, 12)}`;
  res.json({
    success: true,
    sessionId,
    agentName,
    permissions: validation.permissions,
    rateLimitPerMin: validation.rateLimit,
    endpoints: {
      terminal: "/api/agent/plugin/terminal",
      browser: "/api/agent/plugin/browser",
      build: "/api/agent/plugin/build",
      database: "/api/agent/plugin/database",
    },
  });
});

// Protected endpoints with rate limiting and audit
app.use("/api/agent/plugin/", agentPluginRateLimiter);
app.use("/api/agent/plugin/", agentPluginAuthMiddleware);
app.use("/api/agent/plugin/", agentAuditMiddleware);

// Terminal execution
app.post("/api/agent/plugin/terminal", requirePermission("terminal"), async (req, res) => {
  const { command, workDir } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Command gereklidir" });
  }

  // This would execute in the actual container
  // For now, return a structured response
  res.json({
    success: true,
    command,
    workDir: workDir || "/",
    exitCode: 0,
    stdout: `[MOCK] Command executed successfully\n$ ${command}\nOutput would appear here...`,
    stderr: "",
    durationMs: 150,
    timestamp: new Date().toISOString(),
  });
});

// Browser scraping
app.post("/api/agent/plugin/browser", requirePermission("browser"), async (req, res) => {
  const { url, action = "scrape" } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL gereklidir" });
  }

  // This would use the BrowserDataEngine
  res.json({
    success: true,
    url,
    action,
    title: `[MOCK] ${url}`,
    html: "<html><body>Mock content from headless browser</body></html>",
    extractedData: { mock: true, note: "Real scraping requires browser engine connection" },
    timestamp: new Date().toISOString(),
  });
});

// Build pipeline
app.post("/api/agent/plugin/build", requirePermission("build"), async (req, res) => {
  const { projectId, buildType = "release_apk" } = req.body;

  if (!projectId) {
    return res.status(400).json({ error: "Project ID gereklidir" });
  }

  const project = await projectRepo.getById(projectId);
  if (!project) return res.status(404).json({ error: "Project not found" });

  const config: BuildConfig = {
    projectId,
    projectName: project.name,
    packageName: project.packageName,
    versionName: project.versionName,
    versionCode: project.versionCode,
    language: project.language,
    buildType,
    modules: project.activeModules,
    minify: project.minifyEnabled,
    shrinkResources: project.shrinkResources,
    signingScheme: project.signingScheme,
  };

  // Trigger async build, return build ID immediately
  const buildId = `build-${uuidv4().slice(0, 8)}`;

  // Start build in background
  runRealBuild(config, (progress) => {
    broadcastBuildProgress(buildId, progress);
  }).then(result => {
    // Build completed, could notify via webhook
    console.log(`[Agent Plugin] Build ${buildId} completed:`, result.success ? "success" : "failed");
  });

  res.json({
    success: true,
    buildId,
    status: "started",
    message: "Build started. Subscribe to build:progress via WebSocket for real-time updates.",
    websocketEvent: `build:${buildId}`,
  });
});

// Database query
app.post("/api/agent/plugin/database", requirePermission("database"), async (req, res) => {
  const { sql, params = [] } = req.body;

  if (!sql) {
    return res.status(400).json({ error: "SQL query gereklidir" });
  }

  // Safety: only allow SELECT queries
  const trimmed = sql.trim().toLowerCase();
  if (!trimmed.startsWith("select")) {
    return res.status(403).json({ error: "Sadece SELECT sorgularına izin verilir" });
  }

  try {
    // Use the underlying client for raw queries
    const { client } = await import("./src/db/index");
    const result = await client.execute({ sql, args: params });
    res.json({ success: true, rows: result.rows, columns: result.columns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Agent token management (admin)
app.get("/api/admin/agent-tokens", async (_req, res) => {
  const tokens = await agentTokenRepo.getAll();
  res.json({ tokens });
});

app.post("/api/admin/agent-tokens", async (req, res) => {
  const { agentName, permissions = ["terminal", "browser", "build", "database"], rateLimitPerMin = 30, expiresInDays } = req.body;
  const token = `dc_agent_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = expiresInDays ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000 : undefined;
  await agentTokenRepo.create(token, agentName, permissions);
  res.status(201).json({ token, agentName, permissions, rateLimitPerMin, expiresAt });
});

// Audit log
app.get("/api/admin/agent-audit/:token", async (req, res) => {
  const logs = await auditRepo.getByToken(req.params.token);
  const stats = await auditRepo.getStats(req.params.token);
  res.json({ logs, stats });
});

// ============================================
// VAULT / WEB EXTRACTIONS
// ============================================

app.get("/api/browser/vault", async (req, res) => {
  const search = req.query.search as string;
  const tag = req.query.tag as string;
  const items = await vaultRepo.getAll(search, tag);
  res.json({ items });
});

app.post("/api/browser/vault", async (req, res) => {
  const item = await vaultRepo.create(req.body);
  res.status(201).json({ item });
});

app.delete("/api/browser/vault/:id", async (req, res) => {
  await vaultRepo.delete(req.params.id);
  res.json({ success: true });
});

app.get("/api/browser/extractions", async (req, res) => {
  const items = await webExtractionRepo.getAll(50);
  res.json({ items });
});

// ============================================
// TASKS
// ============================================

app.get("/api/tasks", async (_req, res) => {
  const tasks = await taskRepo.getAll();
  res.json({ tasks });
});

app.post("/api/tasks", async (req, res) => {
  const task = await taskRepo.create(req.body);
  res.status(201).json({ task });
});

app.patch("/api/tasks/:id", async (req, res) => {
  const task = await taskRepo.update(req.params.id, req.body);
  res.json({ task });
});

app.delete("/api/tasks/:id", async (req, res) => {
  await taskRepo.delete(req.params.id);
  res.json({ success: true });
});

// ============================================
// CHAT
// ============================================

app.get("/api/chat/messages", async (_req, res) => {
  const messages = await chatRepo.getAll(100);
  res.json({ messages });
});

app.post("/api/chat/messages", async (req, res) => {
  const message = await chatRepo.create(req.body);
  res.status(201).json({ message });
});

// Multi-turn Gemini Chatbot
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, model = "gemini-3.8-flash", role = "architect", customPrompt } = req.body;

    if (!ai) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not configured on the server.",
      });
    }

    const roleInstructions: Record<string, string> = {
      architect: "Sen DroidCraft'ın Kıdemli Android Sistem & Mobil Mimarısın. Kotlin, Jetpack Compose, Clean Architecture, Coroutines, Flow, Dagger/Hilt ve modüler mimaride uzmansın.",
      compiler: "Sen DroidCraft'ın Derleme Motoru, Gradle & ProGuard/R8 Uzmanısın. AAPT2 hataları, DEX 64K limitleri, R8 kural çakışmaları, NDK derleme sorunları ve APK boyut optimizasyonunda uzmansın.",
      ui_engineer: "Sen DroidCraft'ın Mobil UI/UX ve Modül Entegrasyon Mühendisisin. Jetpack Compose animasyonları, Material You dinamik temaları, dokunmatik hareketler ve sürükle-bırak modül pipeline'ında uzmansın.",
      security_officer: "Sen DroidCraft'ın Keystore, İmzalama ve Mobil Güvenlik Uzmanısın. V1/V2/V3/V4 APK imzalama şemaları, Play Integrity API, Certificate Pinning, Root tespiti ve şifreli depolama konularında uzmansın.",
    };

    const selectedInstruction = roleInstructions[role] || roleInstructions.architect;
    const validModels = ["gemini-4-argon", "gemini-3.8-flash", "gemini-3.1-flash-lite"];
    const targetModel = validModels.includes(model) ? model : "gemini-3.8-flash";

    const contents: any[] = [];
    if (Array.isArray(messages)) {
      for (const msg of messages) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    } else if (customPrompt) {
      contents.push({ role: "user", parts: [{ text: customPrompt }] });
    }

    const response = await ai.models.generateContent({
      model: targetModel,
      contents,
      config: { systemInstruction: selectedInstruction },
    });

    const replyText = response.text || "Yanıt üretilemedi.";

    return res.json({
      reply: replyText,
      modelUsed: targetModel,
      roleUsed: role,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: error.message || "Gemini Chat API hatası" });
  }
});

// Image Generation
app.post("/api/generate-image", async (req, res) => {
  try {
    const { prompt, imageSize = "1K", aspectRatio = "1:1", category = "app_icon" } = req.body;

    if (!prompt) return res.status(400).json({ error: "Prompt gereklidir" });
    if (!ai) return res.status(500).json({ error: "GEMINI_API_KEY tanımlanmamış" });

    const validSizes = ["1K", "2K", "4K"];
    const selectedSize = validSizes.includes(imageSize) ? imageSize : "1K";
    const targetModel = "gemini-3-pro-image-preview";

    const response = await ai.models.generateContent({
      model: targetModel,
      contents: { parts: [{ text: `${prompt}. Professional mobile app asset, high-fidelity render. Category: ${category}` }] },
      config: { imageConfig: { aspectRatio: aspectRatio as any, imageSize: selectedSize as any } },
    });

    let imageUrl: string | null = null;
    let textExplanation = "";

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        imageUrl = `data:${part.inlineData.mimeType ?? "image/png"};base64,${part.inlineData.data}`;
      } else if (part.text) {
        textExplanation += part.text;
      }
    }

    if (imageUrl) {
      return res.json({ imageUrl, imageSize: selectedSize, aspectRatio, model: targetModel, category, explanation: textExplanation });
    } else {
      throw new Error("Model görsel verisi üretmedi.");
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// ============================================
// DEVICES
// ============================================

app.get("/api/devices", async (_req, res) => {
  const devices = await deviceRepo.getAll();
  res.json({ devices });
});

app.post("/api/devices", async (req, res) => {
  await deviceRepo.upsert(req.body);
  res.json({ success: true });
});

// ============================================
// SERVICES
// ============================================

app.get("/api/services", async (_req, res) => {
  const services = await serviceRepo.getAll();
  res.json({ services });
});

app.post("/api/services/:id/control", async (req, res) => {
  const { action } = req.body; // start, pause, stop
  const statusMap = { start: "running", pause: "paused", stop: "stopped" };
  await serviceRepo.updateStatus(req.params.id, statusMap[action as keyof typeof statusMap] || "stopped");
  res.json({ success: true });
});

// ============================================
// GITHUB INTEGRATION
// ============================================

app.post("/api/github/connect", async (req, res) => {
  const { repoUrl, branch = "main" } = req.body;
  // Mock response - in production, use Octokit to connect
  res.json({
    success: true,
    repo: {
      name: repoUrl.split("/").pop()?.replace(".git", ""),
      branch,
      lastCommitSha: "7f4c91a",
      lastCommitMessage: "feat(android): add Jetpack Compose 1.7 UI & CameraX 1.4",
      detectedFramework: "Kotlin 2.1 (Jetpack Compose / Gradle 8.7)",
    },
  });
});

app.get("/api/github/workflow-template", async (_req, res) => {
  const workflow = `name: Android CI/CD

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      buildType:
        description: 'Build type'
        required: true
        default: 'release_apk'
        type: choice
        options:
          - release_apk
          - debug_apk
          - aab_bundle

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
          cache: gradle
      - name: Setup Android SDK
        uses: android-actions/setup-android@v3
        with:
          api-level: 35
          ndk-version: r27c
      - name: Grant execute permission for gradlew
        run: chmod +x gradlew
      - name: Build with Gradle
        run: ./gradlew assemble\${{ github.event.inputs.buildType || 'Release' }} --no-daemon
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: app-\${{ github.event.inputs.buildType || 'release' }}
          path: app/build/outputs/**/*.apk
      - name: Upload AAB
        uses: actions/upload-artifact@v4
        with:
          name: app-bundle
          path: app/build/outputs/**/*.aab
`;
  res.setHeader("Content-Type", "text/plain");
  res.send(workflow);
});

app.post("/api/github/trigger-hybrid", async (req, res) => {
  const { mode = "github_actions", buildType = "release_apk" } = req.body;
  // Mock response
  res.json({
    success: true,
    buildId: `hybrid-${uuidv4().slice(0, 8)}`,
    downloadUrl: "#download-hybrid-build",
    durationSeconds: 42,
    commitSha: "7f4c91a",
    logs: [
      `[STARTED] ${mode} mode activated`,
      `[GIT] Repository connected`,
      `[GRADLE] Gradle 8.7 daemon started`,
      `[BUILD] Building ${buildType}...`,
      `[SUCCESS] Build completed`,
    ],
  });
});

// ============================================
// API GATEWAY (Proxy)
// ============================================

const apiRegistry: Record<string, { name: string; baseUrl: string; authType: "APIKey" | "Bearer" | "None"; apiKeyEnv?: string }> = {
  "droidcraft-build": { name: "DroidCraft Build API", baseUrl: "http://localhost:3000", authType: "None" },
  "github-api": { name: "GitHub API", baseUrl: "https://api.github.com", authType: "Bearer", apiKeyEnv: "GITHUB_TOKEN" },
  "firebase-admin": { name: "Firebase Admin", baseUrl: "https://firestore.googleapis.com", authType: "Bearer", apiKeyEnv: "FIREBASE_ADMIN_TOKEN" },
  "ai-studio": { name: "AI Studio (Gemini)", baseUrl: "https://generativelanguage.googleapis.com", authType: "APIKey", apiKeyEnv: "GEMINI_API_KEY" },
  "play-console": { name: "Google Play Console", baseUrl: "https://androidpublisher.googleapis.com", authType: "Bearer", apiKeyEnv: "PLAY_CONSOLE_TOKEN" },
};

app.get("/api/gateway/apis", (_req, res) => {
  res.json({
    apis: Object.entries(apiRegistry).map(([id, spec]) => ({ id, ...spec, configured: !!spec.apiKeyEnv && !!process.env[spec.apiKeyEnv] })),
  });
});

app.all("/api/gateway/:apiId/*", async (req, res) => {
  const apiId = req.params.apiId;
  const apiSpec = apiRegistry[apiId];
  if (!apiSpec) return res.status(404).json({ error: "API bulunamadı" });

  const targetUrl = `${apiSpec.baseUrl}/${req.params[0] || ""}${req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : ""}`;
  const headers: Record<string, string> = {};

  if (apiSpec.authType === "APIKey" && apiSpec.apiKeyEnv) {
    const key = process.env[apiSpec.apiKeyEnv];
    if (key) headers["Authorization"] = `Bearer ${key}`;
  } else if (apiSpec.authType === "Bearer" && apiSpec.apiKeyEnv) {
    const key = process.env[apiSpec.apiKeyEnv];
    if (key) headers["Authorization"] = `Bearer ${key}`;
  }

  try {
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: { ...headers, "Content-Type": "application/json", ...req.headers },
      body: ["GET", "HEAD"].includes(req.method) ? undefined : JSON.stringify(req.body),
    });

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const data = await response.json();
      res.status(response.status).json({ _gateway: { success: response.ok, apiId, apiName: apiSpec.name, status: response.status }, data });
    } else {
      const text = await response.text();
      res.status(response.status).send(text);
    }
  } catch (err: any) {
    res.status(502).json({ error: `Gateway error: ${err.message}`, apiId });
  }
});

// ============================================
// MCP HTTP ENDPOINT (for web clients)
// ============================================

app.post("/api/mcp/rpc", async (req, res) => {
  const { jsonrpc, id, method, params } = req.body;
  if (jsonrpc !== "2.0" || !method) {
    return res.status(400).json({ jsonrpc: "2.0", id, error: { code: -32600, message: "Invalid Request" } });
  }

  try {
    let result: any;
    switch (method) {
      case "tools/list":
        result = { tools: [] }; // Would list MCP tools
        break;
      case "tools/call":
        // Delegate to actual tools
        result = { content: [{ type: "text", text: "MCP tool call not implemented in HTTP mode. Use STDIO transport." }] };
        break;
      default:
        return res.status(404).json({ jsonrpc: "2.0", id, error: { code: -32601, message: "Method not found" } });
    }
    res.json({ jsonrpc: "2.0", id, result });
  } catch (error: any) {
    res.json({ jsonrpc: "2.0", id, error: { code: -32603, message: error.message } });
  }
});

// ============================================
// SERVE FRONTEND
// ============================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`[DroidCraft Cloud OS] Server running at http://0.0.0.0:${port}`);
    console.log(`[DroidCraft Cloud OS] WebSocket server ready`);
    console.log(`[DroidCraft Cloud OS] MCP STDIO: npx tsx mcp-stdio.ts`);
  });
}

startServer();