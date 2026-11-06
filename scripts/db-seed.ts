import { initializeDatabase, db } from "../src/db/index";
import { schema } from "../src/db/schema";
import { v4 as uuidv4 } from "uuid";

async function main() {
  console.log("[DB Seed] Starting database seeding...");
  await initializeDatabase();

  // Default project
  const projectId = "proj-core-01";
  await db.insert(schema.projects).values({
    id: projectId,
    name: "DroidCraft Core Pro",
    packageName: "com.droidcraft.app",
    versionName: "2.4.1",
    versionCode: 104,
    minSdk: 24,
    targetSdk: 35,
    language: "kotlin",
    activeModules: ["camerax_pro", "biometric_auth", "room_sqlite", "fcm_push", "r8_proguard_security"],
    minifyEnabled: true,
    shrinkResources: true,
    signingScheme: "v2_v3_v4",
    themeColor: "#06b6d4",
  }).onConflictDoUpdate({
    target: schema.projects.id,
    set: { updatedAt: Date.now() },
  });

  // Build history
  const builds = [
    {
      id: "build-1042",
      projectId,
      projectName: "DroidCraft Core Demo",
      packageName: "com.droidcraft.core",
      version: "2.4.1",
      versionCode: 104,
      buildType: "release_apk",
      language: "Kotlin (Jetpack Compose)",
      status: "success",
      durationSeconds: 38,
      fileSizeMb: 11.2,
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      downloadUrl: "#download-build-1042",
      modulesCount: 7,
      logs: JSON.stringify([
        "[INFO] Gradle Daemon started (daemon count: 1)",
        "[INFO] Task :app:preBuild UP-TO-DATE",
        "[INFO] Task :app:compileReleaseKotlin UP-TO-DATE",
        "[INFO] Task :app:processReleaseResources (AAPT2 optimized)",
        "[INFO] Task :app:minifyReleaseWithR8 (Rules: proguard-rules.pro)",
        "[INFO] Total DEX count: 1 (Single DEX mode achieved)",
        "[INFO] Task :app:packageRelease",
        "[INFO] Task :app:zipalignRelease",
        "[INFO] Task :app:signReleaseBundle (V2+V3+V4 apksigner verified)",
        "[SUCCESS] BUILD SUCCESSFUL in 38s (24 tasks executed)",
      ]),
    },
    {
      id: "build-1041",
      projectId,
      projectName: "DroidCraft Core Demo",
      packageName: "com.droidcraft.core",
      version: "2.4.0",
      versionCode: 103,
      buildType: "aab_bundle",
      language: "Kotlin (Jetpack Compose)",
      status: "success",
      durationSeconds: 45,
      fileSizeMb: 14.8,
      sha256: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
      downloadUrl: "#download-build-1041",
      modulesCount: 7,
      logs: JSON.stringify([
        "[INFO] Building AAB for Play Store",
        "[SUCCESS] BUILD SUCCESSFUL in 45s",
      ]),
    },
  ];

  for (const build of builds) {
    await db.insert(schema.builds).values(build).onConflictDoUpdate({
      target: schema.builds.id,
      set: build,
    });
  }

  // Agent Plugin Master Token
  await db.insert(schema.agentPluginTokens).values({
    token: "dc_agent_master_token_2026",
    agentName: "Master Control Agent",
    permissions: ["terminal", "browser", "build", "database"],
    rateLimitPerMin: 60,
    isActive: true,
  }).onConflictDoUpdate({
    target: schema.agentPluginTokens.token,
    set: { isActive: true, rateLimitPerMin: 60 },
  });

  // Sample tasks
  const tasks = [
    {
      id: "task-1",
      title: "CameraX 1.4 API Entegrasyonu & 60 FPS Video Yakalama",
      description: "Android 15 uyumluluğu için Camera2Interop ve HDR10 desteği ekle.",
      status: "in_progress",
      priority: "high",
      assigneeName: "Ahmet Yılmaz",
      assigneeAvatar: "👨‍💻",
      assigneeRole: "Mobile Lead",
      timeSpentMinutes: 180,
      tags: JSON.stringify(["CameraX", "NDK", "Performance"]),
      dueDate: "2026-11-10",
    },
    {
      id: "task-2",
      title: "ProGuard / R8 Kural Optimize Edilmesi (DEX Shrink)",
      description: "APK boyutunu 18MB'tan 9.4MB seviyesine çekmek için kullanılmayan Kotlin runtime sınıflarını ayıkla.",
      status: "done",
      priority: "critical",
      assigneeName: "Zeynep Kaya",
      assigneeAvatar: "👩‍💻",
      assigneeRole: "DevOps & Build Specialist",
      timeSpentMinutes: 240,
      tags: JSON.stringify(["R8", "ProGuard", "Optimization"]),
      dueDate: "2026-11-06",
    },
    {
      id: "task-3",
      title: "Play In-App Billing v7.0 & Subscription Flow",
      description: "Abonelik yenileme, RTDN (Real-time Developer Notifications) webhook altyapısı.",
      status: "review",
      priority: "medium",
      assigneeName: "Can Demir",
      assigneeAvatar: "🧑‍🚀",
      assigneeRole: "Backend & Integrations",
      timeSpentMinutes: 95,
      tags: JSON.stringify(["Billing", "Google Play"]),
      dueDate: "2026-11-08",
    },
    {
      id: "task-4",
      title: "Biyometrik Kimlik Doğrulama (BiometricPrompt) Modülü",
      description: "Parmak izi ve yüz tanıma için CryptoObject destekli modül entegrasyonu.",
      status: "backlog",
      priority: "medium",
      assigneeName: "Elif Sarı",
      assigneeAvatar: "👩‍🎨",
      assigneeRole: "Security & UI Engineer",
      timeSpentMinutes: 30,
      tags: JSON.stringify(["Security", "Biometrics"]),
      dueDate: "2026-11-14",
    },
  ];

  for (const task of tasks) {
    await db.insert(schema.tasks).values(task).onConflictDoUpdate({
      target: schema.tasks.id,
      set: task,
    });
  }

  // Sample chat messages
  const messages = [
    {
      id: "msg-1",
      senderName: "Ahmet Yılmaz",
      senderAvatar: "👨‍💻",
      senderRole: "Mobile Lead",
      isBot: false,
      content: "Selam ekip! Android 15 (Vanilla Ice Cream / API 35) hedefleme derleme testlerini başarıyla tamamladık.",
      timestamp: "10:14",
    },
    {
      id: "msg-2",
      senderName: "DroidCraft AI Bot",
      senderAvatar: "⚡",
      senderRole: "CI/CD Automator",
      isBot: true,
      content: "Otomatik Derleme Raporu: v2.4.1-rc3 Release APK derlemesi 42 saniyede tamamlandı. SHA-256 doğrulandı. Boyut: 11.2 MB.",
      timestamp: "10:15",
      fileAttachment: JSON.stringify({ name: "app-release-v2.4.1.apk", size: "11.2 MB", type: "application/vnd.android.package-archive" }),
    },
    {
      id: "msg-3",
      senderName: "Zeynep Kaya",
      senderAvatar: "👩‍💻",
      senderRole: "DevOps & Build Specialist",
      isBot: false,
      content: "R8 kuralları harika çalıştı. APK boyutu %38 küçüldü. Şimdi Play Store AAB paketini imzalamaya hazırlıyorum.",
      timestamp: "10:18",
    },
  ];

  for (const msg of messages) {
    await db.insert(schema.chatMessages).values(msg).onConflictDoUpdate({
      target: schema.chatMessages.id,
      set: msg,
    });
  }

  // Device telemetry
  const devices = [
    { deviceId: "dev-pixel-9-pro", model: "Google Pixel 9 Pro", osVersion: "Android 15 (API 35)", cpuArch: "arm64-v8a", batteryLevel: 94, lastPing: Date.now() },
    { deviceId: "dev-s24-ultra", model: "Samsung Galaxy S24 Ultra", osVersion: "One UI 7 / Android 15", cpuArch: "arm64-v8a", batteryLevel: 82, lastPing: Date.now() - 60000 },
    { deviceId: "dev-iphone-16", model: "Apple iPhone 16 Pro", osVersion: "iOS 18.2", cpuArch: "arm64e", batteryLevel: 89, lastPing: Date.now() - 120000 },
  ];

  for (const device of devices) {
    await db.insert(schema.deviceTelemetry).values(device).onConflictDoUpdate({
      target: schema.deviceTelemetry.deviceId,
      set: device,
    });
  }

  // Services
  const services = [
    {
      id: "srv-debian",
      name: "Debian 12 (Bookworm) Proot SandBox",
      type: "container",
      status: "running",
      cpuUsage: "3.2%",
      memoryMb: 1420,
      uptime: "4 saat 22 dk",
      description: "GCC, Clang-18 ve OpenJDK 21 içeren ana Debian Linux çekirdeği.",
      config: JSON.stringify({ distro: "debian_bookworm", arch: "aarch64" }),
    },
    {
      id: "srv-ubuntu",
      name: "Ubuntu 24.04 LTS (Noble Numbat)",
      type: "container",
      status: "stopped",
      cpuUsage: "0.0%",
      memoryMb: 0,
      uptime: "Kapalı",
      description: "İkili dışlama kuralı gereği şu an RAM tasarrufu için durduruldu.",
      config: JSON.stringify({ distro: "ubuntu_noble", arch: "aarch64" }),
    },
    {
      id: "srv-termux",
      name: "Termux Bash & ADB Bridge Daemon",
      type: "shell",
      status: "running",
      cpuUsage: "0.8%",
      memoryMb: 42,
      uptime: "14 gün",
      description: "Gerçek cihaz üstü USB / TCP ADB köprüsü ve termux tty sunucusu.",
      config: JSON.stringify({ bridge: "adb_tcp", port: 5555 }),
    },
    {
      id: "srv-build",
      name: "Gradle 8.7 & R8 Build Engine",
      type: "compiler",
      status: "running",
      cpuUsage: "14.6%",
      memoryMb: 680,
      uptime: "12 dk (Son Derleme)",
      description: "Android 15 (API 35) APK/AAB paketleme ve zipalign arka plan daemon'u.",
      config: JSON.stringify({ gradle: "8.7", jdk: "21" }),
    },
    {
      id: "srv-gateway",
      name: "Unified Public APIs Gateway & MCP",
      type: "gateway",
      status: "running",
      cpuUsage: "0.4%",
      memoryMb: 110,
      uptime: "14 gün",
      description: "50+ halka açık API ve JSON-RPC 2.0 yapay zeka ajan eklenti sunucusu.",
      config: JSON.stringify({ apis: 50, mcp: true }),
    },
  ];

  for (const svc of services) {
    await db.insert(schema.services).values(svc).onConflictDoUpdate({
      target: schema.services.id,
      set: svc,
    });
  }

  // Web extractions
  const extractions = [
    { id: "ext-1", sourceUrl: "https://developer.android.com/about/versions/15", title: "Android 15 Features & APIs", extractedField: "API 35 Vanilla Ice Cream", contentSnippet: "Private Space, 16KB page support, Predictive Back animations, Edge-to-edge default" },
    { id: "ext-2", sourceUrl: "https://github.com/termux/termux-app", title: "Termux Android Terminal Emulator", extractedField: "v0.118.1 Release", contentSnippet: "APT package manager, busybox, clang, python, proot-distro Linux containers" },
    { id: "ext-3", sourceUrl: "https://hub.docker.com/_/alpine", title: "Alpine Linux Container Base", extractedField: "musl libc & APK tools", contentSnippet: "Ultra-compact 5MB base image for sandboxed Android build workers" },
  ];

  for (const ext of extractions) {
    await db.insert(schema.webExtractions).values(ext).onConflictDoUpdate({
      target: schema.webExtractions.id,
      set: ext,
    });
  }

  console.log("[DB Seed] Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("[DB Seed] Failed:", err);
  process.exit(1);
});