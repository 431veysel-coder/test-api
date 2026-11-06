#!/usr/bin/env tsx
/**
 * DroidCraft MCP Server - STDIO Transport
 * 
 * This allows Claude Desktop, Cursor, VS Code to connect directly
 * to DroidCraft tools via the Model Context Protocol.
 * 
 * Usage in claude_desktop_config.json:
 * {
 *   "mcpServers": {
 *     "droidcraft": {
 *       "command": "npx",
 *       "args": ["droidcraft-mcp"],
 *       "cwd": "/path/to/droidcraft"
 *     }
 *   }
 * }
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { initializeDatabase } from "./src/db/index";
import { projectRepo, buildRepo, agentTokenRepo, vaultRepo, taskRepo, chatRepo, deviceRepo, serviceRepo, webExtractionRepo } from "./src/db/repositories";
import { runRealBuild, BuildConfig } from "./src/services/buildWorker";

await initializeDatabase();

const server = new McpServer({
  name: "droidcraft",
  version: "2.4.1",
  description: "DroidCraft Cloud OS - Android Development Platform MCP Server",
});

// ============================================
// PROJECT MANAGEMENT TOOLS
// ============================================

server.tool(
  "list_projects",
  "List all Android projects",
  {},
  async () => {
    const projects = await projectRepo.getAll();
    return { content: [{ type: "text", text: JSON.stringify(projects, null, 2) }] };
  }
);

server.tool(
  "get_project",
  "Get project details by ID",
  { projectId: z.string() },
  async ({ projectId }) => {
    const project = await projectRepo.getById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);
    return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
  }
);

server.tool(
  "create_project",
  "Create a new Android project",
  {
    name: z.string(),
    packageName: z.string(),
    versionName: z.string().default("1.0.0"),
    versionCode: z.number().default(1),
    minSdk: z.number().default(24),
    targetSdk: z.number().default(35),
    language: z.enum(["kotlin", "java", "flutter", "react_native", "cpp_ndk", "rust_mobile", "python_kivy"]).default("kotlin"),
    activeModules: z.array(z.string()).default([]),
    minifyEnabled: z.boolean().default(true),
    shrinkResources: z.boolean().default(true),
    signingScheme: z.enum(["v1", "v2_v3_v4"]).default("v2_v3_v4"),
    themeColor: z.string().default("#06b6d4"),
  },
  async (params) => {
    const project = await projectRepo.create(params);
    return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
  }
);

server.tool(
  "update_project",
  "Update project configuration",
  {
    projectId: z.string(),
    name: z.string().optional(),
    packageName: z.string().optional(),
    versionName: z.string().optional(),
    versionCode: z.number().optional(),
    minSdk: z.number().optional(),
    targetSdk: z.number().optional(),
    language: z.enum(["kotlin", "java", "flutter", "react_native", "cpp_ndk", "rust_mobile", "python_kivy"]).optional(),
    activeModules: z.array(z.string()).optional(),
    minifyEnabled: z.boolean().optional(),
    shrinkResources: z.boolean().optional(),
    signingScheme: z.enum(["v1", "v2_v3_v4"]).optional(),
    themeColor: z.string().optional(),
  },
  async ({ projectId, ...params }) => {
    const project = await projectRepo.update(projectId, params);
    return { content: [{ type: "text", text: JSON.stringify(project, null, 2) }] };
  }
);

// ============================================
// BUILD TOOLS
// ============================================

server.tool(
  "trigger_build",
  "Trigger a real Android build (APK/AAB)",
  {
    projectId: z.string(),
    buildType: z.enum(["debug_apk", "release_apk", "aab_bundle", "universal_apk"]).default("release_apk"),
  },
  async ({ projectId, buildType }) => {
    const project = await projectRepo.getById(projectId);
    if (!project) throw new Error(`Project ${projectId} not found`);

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

    return new Promise((resolve) => {
      runRealBuild(config, (progress) => {
        if (progress.type === "done") {
          if (progress.error) {
            resolve({ content: [{ type: "text", text: `Build failed: ${progress.error}` }], isError: true });
          } else {
            resolve({ content: [{ type: "text", text: `Build successful!\nBuild ID: ${progress.buildId}\nDownload: ${progress.downloadUrl}\nSHA-256: ${progress.sha256}\nSize: ${progress.fileSizeMb} MB\nDuration: ${progress.durationSeconds}s` }] });
          }
        }
      });
    });
  }
);

server.tool(
  "list_builds",
  "List build history for a project",
  { projectId: z.string().optional(), limit: z.number().default(20) },
  async ({ projectId, limit }) => {
    let builds;
    if (projectId) {
      builds = await buildRepo.getByProject(projectId);
    } else {
      builds = await buildRepo.getAll(limit);
    }
    return { content: [{ type: "text", text: JSON.stringify(builds, null, 2) }] };
  }
);

server.tool(
  "get_build",
  "Get build details by ID",
  { buildId: z.string() },
  async ({ buildId }) => {
    const build = await buildRepo.getById(buildId);
    if (!build) throw new Error(`Build ${buildId} not found`);
    return { content: [{ type: "text", text: JSON.stringify(build, null, 2) }] };
  }
);

// ============================================
// AGENT PLUGIN TOOLS
// ============================================

server.tool(
  "create_agent_token",
  "Create a new Agent Plugin token for external AI access",
  {
    agentName: z.string(),
    permissions: z.array(z.enum(["terminal", "browser", "build", "database"])).default(["terminal", "browser", "build", "database"]),
    rateLimitPerMin: z.number().default(30),
    expiresInDays: z.number().optional(),
  },
  async ({ agentName, permissions, rateLimitPerMin, expiresInDays }) => {
    const token = `dc_agent_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
    const expiresAt = expiresInDays ? Date.now() + expiresInDays * 24 * 60 * 60 * 1000 : undefined;
    await agentTokenRepo.create(token, agentName, permissions);
    return { content: [{ type: "text", text: `Token created: ${token}\nAgent: ${agentName}\nPermissions: ${permissions.join(", ")}\nRate Limit: ${rateLimitPerMin}/min${expiresAt ? `\nExpires: ${new Date(expiresAt).toISOString()}` : ""}` }] };
  }
);

server.tool(
  "list_agent_tokens",
  "List all Agent Plugin tokens",
  {},
  async () => {
    const tokens = await agentTokenRepo.getAll();
    return { content: [{ type: "text", text: JSON.stringify(tokens, null, 2) }] };
  }
);

server.tool(
  "get_agent_audit_log",
  "Get audit log for an agent token",
  { token: z.string(), limit: z.number().default(100) },
  async ({ token, limit }) => {
    const logs = await agentTokenRepo.getByToken(token);
    return { content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] };
  }
);

// ============================================
// TERMINAL / COMMAND EXECUTION
// ============================================

server.tool(
  "run_command",
  "Execute a shell command in the Debian container",
  { command: z.string(), workDir: z.string().optional() },
  async ({ command, workDir }) => {
    // This would connect to the actual container
    // For now, return a mock response
    return { content: [{ type: "text", text: `[MOCK] Command executed: ${command}\nWorkDir: ${workDir || "/"}\n\nNote: Real terminal execution requires container connection.` }] };
  }
);

// ============================================
// WEB BROWSER / SCRAPING
// ============================================

server.tool(
  "scrape_webpage",
  "Scrape a webpage using headless browser",
  { url: z.string(), action: z.enum(["scrape", "screenshot", "pdf"]).default("scrape") },
  async ({ url, action }) => {
    // This would use the BrowserDataEngine
    return { content: [{ type: "text", text: `[MOCK] Scraped ${url} with action: ${action}\n\nNote: Real scraping requires browser engine connection.` }] };
  }
);

// ============================================
// VAULT / DATA STORAGE
// ============================================

server.tool(
  "save_to_vault",
  "Save extracted data to vault",
  {
    url: z.string(),
    title: z.string(),
    snippet: z.string().optional(),
    selector: z.string().optional(),
    tag: z.string().optional(),
    agentMission: z.string().optional(),
    extractedData: z.any().optional(),
  },
  async (data) => {
    const item = await vaultRepo.create(data);
    return { content: [{ type: "text", text: `Saved to vault: ${item.id}` }] };
  }
);

server.tool(
  "search_vault",
  "Search vault items",
  { query: z.string().optional(), tag: z.string().optional(), limit: z.number().default(20) },
  async ({ query, tag, limit }) => {
    const items = await vaultRepo.getAll(query, tag, limit);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  }
);

// ============================================
// TASK MANAGEMENT
// ============================================

server.tool(
  "list_tasks",
  "List all tasks",
  {},
  async () => {
    const tasks = await taskRepo.getAll();
    return { content: [{ type: "text", text: JSON.stringify(tasks, null, 2) }] };
  }
);

server.tool(
  "create_task",
  "Create a new task",
  {
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(["backlog", "in_progress", "review", "done"]).default("backlog"),
    priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
    assigneeName: z.string().optional(),
    assigneeAvatar: z.string().optional(),
    assigneeRole: z.string().optional(),
    tags: z.array(z.string()).default([]),
    dueDate: z.string().optional(),
  },
  async (data) => {
    const task = await taskRepo.create(data);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  }
);

server.tool(
  "update_task",
  "Update a task",
  {
    taskId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["backlog", "in_progress", "review", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "critical"]).optional(),
    assigneeName: z.string().optional(),
    timeSpentMinutes: z.number().optional(),
    tags: z.array(z.string()).optional(),
    dueDate: z.string().optional(),
  },
  async ({ taskId, ...data }) => {
    const task = await taskRepo.update(taskId, data);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  }
);

// ============================================
// DEVICE TELEMETRY
// ============================================

server.tool(
  "list_devices",
  "List connected devices",
  {},
  async () => {
    const devices = await deviceRepo.getAll();
    return { content: [{ type: "text", text: JSON.stringify(devices, null, 2) }] };
  }
);

// ============================================
// SERVICES MANAGEMENT
// ============================================

server.tool(
  "list_services",
  "List all system services",
  {},
  async () => {
    const services = await serviceRepo.getAll();
    return { content: [{ type: "text", text: JSON.stringify(services, null, 2) }] };
  }
);

server.tool(
  "control_service",
  "Control a service (start/pause/stop)",
  { serviceId: z.string(), action: z.enum(["start", "pause", "stop"]) },
  async ({ serviceId, action }) => {
    const statusMap = { start: "running", pause: "paused", stop: "stopped" };
    await serviceRepo.updateStatus(serviceId, statusMap[action]);
    return { content: [{ type: "text", text: `Service ${serviceId} ${action}ed` }] };
  }
);

// ============================================
// WEB EXTRACTIONS
// ============================================

server.tool(
  "list_web_extractions",
  "List web extraction history",
  { limit: z.number().default(20) },
  async ({ limit }) => {
    const extractions = await webExtractionRepo.getAll(limit);
    return { content: [{ type: "text", text: JSON.stringify(extractions, null, 2) }] };
  }
);

// ============================================
// START SERVER
// ============================================

const transport = new StdioServerTransport();
await server.connect(transport);

console.error("[MCP] DroidCraft MCP Server running on STDIO transport");
console.error("[MCP] Available tools:", Object.keys(server._tools).join(", "));