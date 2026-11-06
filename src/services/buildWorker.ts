import { spawn, SpawnOptions } from "child_process";
import { promises as fs } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { v4 as uuidv4 } from "uuid";
import { buildRepo } from "../db/repositories";
import { createHash } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface BuildConfig {
  projectId: string;
  projectName: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  language: string;
  buildType: "debug_apk" | "release_apk" | "aab_bundle" | "universal_apk";
  modules: string[];
  minify: boolean;
  shrinkResources: boolean;
  signingScheme: string;
}

export interface BuildProgress {
  type: "log" | "progress" | "done" | "error";
  message?: string;
  progress?: number;
  step?: string;
  buildId?: string;
  downloadUrl?: string;
  sha256?: string;
  fileSizeMb?: number;
  durationSeconds?: number;
  error?: string;
}

export async function runRealBuild(
  config: BuildConfig,
  onProgress: (progress: BuildProgress) => void
): Promise<{ success: boolean; buildId: string; downloadUrl?: string; sha256?: string; fileSizeMb?: number; durationSeconds?: number; error?: string }> {
  const buildId = `build-${uuidv4().slice(0, 8)}`;
  const workDir = join(tmpdir(), `droidcraft-build-${buildId}`);
  const startTime = Date.now();

  try {
    onProgress({ type: "log", message: `[DROIDCRAFT-BUILD] Starting build ${buildId}`, buildId });
    onProgress({ type: "progress", progress: 5, step: "Preparing build environment...", buildId });

    await fs.mkdir(workDir, { recursive: true });

    // Generate project structure
    onProgress({ type: "log", message: `[CONFIG] Generating project structure for ${config.packageName}`, buildId });
    onProgress({ type: "progress", progress: 10, step: "Generating project files...", buildId });
    await generateProjectStructure(workDir, config);

    // Download Gradle wrapper if needed
    onProgress({ type: "progress", progress: 15, step: "Setting up Gradle wrapper...", buildId });
    await setupGradleWrapper(workDir);

    // Run actual Gradle build
    onProgress({ type: "progress", progress: 20, step: "Starting Gradle build...", buildId });
    onProgress({ type: "log", message: `[GRADLE] Executing ./gradlew assemble${capitalize(config.buildType.replace("_", ""))} --no-daemon`, buildId });

    const gradleTask = getGradleTask(config.buildType);
    const result = await runGradleBuild(workDir, gradleTask, (line) => {
      onProgress({ type: "log", message: line, buildId });
      // Parse progress from Gradle output
      const progress = parseGradleProgress(line);
      if (progress > 0) {
        onProgress({ type: "progress", progress: Math.min(20 + progress * 0.7, 95), step: extractGradleStep(line), buildId });
      }
    });

    if (result.code !== 0) {
      throw new Error(`Gradle build failed with exit code ${result.code}`);
    }

    // Find output artifact
    onProgress({ type: "progress", progress: 96, step: "Locating build artifact...", buildId });
    const artifact = await findBuildArtifact(workDir, config.buildType);

    if (!artifact) {
      throw new Error("Build completed but artifact not found");
    }

    // Calculate SHA-256
    onProgress({ type: "progress", progress: 98, step: "Calculating SHA-256...", buildId });
    const fileBuffer = await fs.readFile(artifact.path);
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex");
    const fileSizeMb = Math.round(fileBuffer.length / 1024 / 1024 * 10) / 10;

    // In production, upload to storage (S3, MinIO, etc.) and return real URL
    const downloadUrl = `/api/build/download/${buildId}/${artifact.name}`;

    const durationSeconds = Math.round((Date.now() - startTime) / 1000);

    onProgress({ type: "progress", progress: 100, step: "Build completed successfully!", buildId });
    onProgress({ type: "done", buildId, downloadUrl, sha256, fileSizeMb, durationSeconds, buildId });

    // Save to database
    await buildRepo.create({
      id: buildId,
      projectId: config.projectId,
      projectName: config.projectName,
      packageName: config.packageName,
      version: config.versionName,
      versionCode: config.versionCode,
      buildType: config.buildType,
      language: config.language,
      status: "success",
      durationSeconds,
      fileSizeMb,
      sha256,
      downloadUrl,
      modulesCount: config.modules.length,
      logs: [], // Could store logs if needed
    });

    return { success: true, buildId, downloadUrl, sha256, fileSizeMb, durationSeconds };

  } catch (error: any) {
    const durationSeconds = Math.round((Date.now() - startTime) / 1000);
    onProgress({ type: "error", error: error.message, buildId });
    onProgress({ type: "done", buildId, durationSeconds, error: error.message, buildId });

    await buildRepo.create({
      id: buildId,
      projectId: config.projectId,
      projectName: config.projectName,
      packageName: config.packageName,
      version: config.versionName,
      versionCode: config.versionCode,
      buildType: config.buildType,
      language: config.language,
      status: "failed",
      durationSeconds,
      fileSizeMb: 0,
      sha256: "",
      downloadUrl: "",
      modulesCount: config.modules.length,
      logs: [error.message],
    });

    return { success: false, buildId, durationSeconds, error: error.message };
  }
}

async function generateProjectStructure(workDir: string, config: BuildConfig) {
  const gradleFiles = generateGradleFiles(config);
  const sourceFiles = generateSourceFiles(config);

  for (const [relPath, content] of Object.entries({ ...gradleFiles, ...sourceFiles })) {
    const fullPath = join(workDir, relPath);
    await fs.mkdir(dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
  }
}

function generateGradleFiles(config: BuildConfig) {
  const isKotlin = config.language.toLowerCase().includes("kotlin");
  const isCompose = config.modules.some(m => m.includes("compose")) || config.language.includes("Compose");

  return {
    "settings.gradle.kts": `pluginManagement {
  repositories {
    gradlePluginPortal()
    google()
    mavenCentral()
  }
}
dependencyResolutionManagement {
  repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
  repositories {
    google()
    mavenCentral()
  }
}
rootProject.name = "${config.projectName}"
include(":app")`,

    "gradle.properties": `org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.caching=true
org.gradle.configureondemand=true
org.gradle.parallel=true
android.useAndroidX=true
android.enableJetifier=true
kotlin.code.style=official
android.nonTransitiveRClass=true`,

    "app/build.gradle.kts": `plugins {
  id("com.android.application") version "8.4.1" apply false
  id("org.jetbrains.kotlin.android") version "2.0.0" apply false
  ${isKotlin ? 'id("com.google.devtools.ksp") version "2.0.0-1.0.14" apply false' : ""}
}

plugins {
  id("com.android.application")
  id("org.jetbrains.kotlin.android")
  ${isKotlin ? 'id("com.google.devtools.ksp")' : ""}
  ${isCompose ? 'id("org.jetbrains.kotlin.plugin.compose")' : ""}
}

android {
  namespace = "${config.packageName}"
  compileSdk = 35

  defaultConfig {
    applicationId = "${config.packageName}"
    minSdk = ${config.minSdk}
    targetSdk = ${config.targetSdk}
    versionCode = ${config.versionCode}
    versionName = "${config.versionName}"
    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    vectorDrawables {
      useSupportLibrary = true
    }
  }

  signingConfigs {
    create("release") {
      // Configure via environment variables or keystore file
      storeFile = file("../keystore/release.keystore")
      storePassword = System.getenv("KEYSTORE_PASSWORD") ?: "android"
      keyAlias = "release"
      keyPassword = System.getenv("KEY_PASSWORD") ?: "android"
    }
  }

  buildTypes {
    release {
      isMinifyEnabled = ${config.minify}
      isShrinkResources = ${config.shrinkResources}
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro"
      )
      signingConfig = signingConfigs.getByName("release")
      ${config.signingScheme === "v2_v3_v4" ? `
      vndk {
        signingConfig.enableV1Signing = false
        signingConfig.enableV2Signing = true
        signingConfig.enableV3Signing = true
        signingConfig.enableV4Signing = true
      }` : ""}
    }
    debug {
      isDebuggable = true
      isMinifyEnabled = false
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
    freeCompilerArgs += listOf("-Xopt-in=kotlin.RequiresOptIn")
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "1.5.12"
  }

  packagingOptions {
    resources {
      excludes += "/META-INF/{AL2.0,LGPL2.1,LICENSE,NOTICE}"
    }
  }
}

dependencies {
  val core_ktx = "1.13.1"
  val lifecycle_version = "2.8.2"
  val activity_version = "1.9.0"
  val compose_bom = "2024.08.00"
  val material3 = "1.3.0"
  val room_version = "2.6.1"
  val camerax_version = "1.4.0"
  val biometric_version = "1.2.0-alpha04"
  val firebase_bom = "33.1.1"

  implementation(platform("androidx.compose:compose-bom:${compose_bom}"))
  implementation("androidx.compose.material3:material3")
  implementation("androidx.activity:activity-compose:${activity_version}")
  implementation("androidx.lifecycle:lifecycle-runtime-compose:${lifecycle_version}")
  implementation("androidx.core:core-ktx:${core_ktx}")

  // Room
  implementation("androidx.room:room-runtime:${room_version}")
  implementation("androidx.room:room-ktx:${room_version}")
  ksp("androidx.room:room-compiler:${room_version}")

  // CameraX
  implementation("androidx.camera:camera-core:${camerax_version}")
  implementation("androidx.camera:camera-camera2:${camerax_version}")
  implementation("androidx.camera:camera-lifecycle:${camerax_version}")
  implementation("androidx.camera:camera-view:${camerax_version}")
  implementation("androidx.camera:camera-video:${camerax_version}")
  implementation("androidx.camera:camera-mlkit-vision:${camerax_version}")

  // Biometric
  implementation("androidx.biometric:biometric:${biometric_version}")

  // Firebase
  implementation(platform("com.google.firebase:firebase-bom:${firebase_bom}"))
  implementation("com.google.firebase:firebase-analytics-ktx")
  implementation("com.google.firebase:firebase-messaging-ktx")
  implementation("com.google.firebase:firebase-crashlytics-ktx")

  // Testing
  testImplementation("junit:junit:4.13.2")
  androidTestImplementation("androidx.test.ext:junit:1.2.1")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
  androidTestImplementation("androidx.compose.ui:ui-test-junit4")
  debugImplementation("androidx.compose.ui:ui-tooling")
  debugImplementation("androidx.compose.ui:ui-tooling-preview")
}`,

    "app/proguard-rules.pro": `# DroidCraft ProGuard Rules
-keep class com.droidcraft.** { *; }
-keepclassmembers class com.droidcraft.** { *; }

# Room
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class *
-keep @androidx.room.Dao class *

# CameraX
-keep class androidx.camera.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }

# Kotlin Coroutines
-keep class kotlinx.coroutines.** { *; }

# Serialization
-keep class kotlinx.serialization.** { *; }`,

    "app/src/main/AndroidManifest.xml": `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${config.packageName}">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.BIOMETRIC_STRONG" />
    <uses-permission android:name="android.permission.USE_BIOMETRIC" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CAMERA" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />

    <application
        android:name=".DroidCraftApplication"
        android:allowBackup="false"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.DroidCraft"
        android:usesCleartextTraffic="false"
        android:networkSecurityConfig="@xml/network_security_config">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTop"
            android:theme="@style/Theme.DroidCraft.NoActionBar"
            android:windowSoftInputMode="adjustResize">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <meta-data
            android:name="com.google.firebase.messaging.default_notification_channel_id"
            android:value="default_channel" />
    </application>
</manifest>`,
  };
}

function generateSourceFiles(config: BuildConfig) {
  const packagePath = config.packageName.replace(/\./g, "/");
  return {
    `app/src/main/java/${packagePath}/DroidCraftApplication.kt`: `package ${config.packageName}

import android.app.Application
import com.google.firebase.ktx.Firebase

class DroidCraftApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        Firebase.initializeApp(this)
    }
}`,

    `app/src/main/java/${packagePath}/MainActivity.kt`: `package ${config.packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalContext
import com.google.firebase.analytics.FirebaseAnalytics
import ${config.packageName}.ui.theme.Theme.DroidCraft

class MainActivity : ComponentActivity() {
    private lateinit var firebaseAnalytics: FirebaseAnalytics

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        firebaseAnalytics = FirebaseAnalytics.getInstance(this)
        setContent { DroidCraftScreen() }
    }
}

@Composable
fun DroidCraftScreen() {
    val context = LocalContext.current
    Surface(
        modifier = Modifier.fillMaxSize(),
        color = androidx.compose.material3.MaterialTheme.colorScheme.background
    ) {
        androidx.compose.foundation.layout.Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = androidx.compose.foundation.layout.Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = "DroidCraft Cloud OS", fontSize = 32.sp)
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(16.dp))
            Text(text = "v${config.versionName} (${config.versionCode})", fontSize = 16.sp, color = androidx.compose.material3.MaterialTheme.colorScheme.onSurfaceVariant)
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.padding(24.dp))
            Button(onClick = { firebaseAnalytics.logEvent("button_click", null) }) {
                Text(text = "Test Firebase Analytics", fontSize = 18.sp)
            }
        }
    }
}`,

    `app/src/main/java/${packagePath}/ui/theme/Theme.kt`: `package ${config.packageName}.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF06B6D4),
    secondary = Color(0xFF8B5CF6),
    tertiary = Color(0xFF22D3EE),
    background = Color(0xFF090D16),
    surface = Color(0xFF0D1322),
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.Black,
    onBackground = Color.White,
    onSurface = Color.White,
)

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF0891B2),
    secondary = Color(0xFF7C3AED),
    tertiary = Color(0xFF06B6D4),
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    onPrimary = Color.White,
    onSecondary = Color.White,
    onTertiary = Color.Black,
    onBackground = Color.Black,
    onSurface = Color.Black,
)

@Composable
fun DroidCraft(
    darkTheme: Boolean = true,
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme,
        typography = androidx.compose.material3.Typography(),
        content = content
    )
}`,

    "app/src/main/res/values/strings.xml": `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <string name="app_name">DroidCraft Cloud OS</string>
</resources>`,

    "app/src/main/res/xml/network_security_config.xml": `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.droidcraft.local</domain>
        <domain includeSubdomains="true">github.com</domain>
    </domain-config>
    <debug-overrides>
        <trust-anchors>
            <certificates src="system" />
        </trust-anchors>
    </debug-overrides>
</network-security-config>`,
  };
}

async function setupGradleWrapper(workDir: string) {
  const wrapperDir = join(workDir, "gradle", "wrapper");
  await fs.mkdir(wrapperDir, { recursive: true });

  const wrapperProps = `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.7-bin.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`;

  await fs.writeFile(join(wrapperDir, "gradle-wrapper.properties"), wrapperProps);

  // Create minimal gradlew scripts
  const gradlew = `#!/bin/sh
exec java -jar gradle/wrapper/gradle-wrapper.jar "$@"
`;
  await fs.writeFile(join(workDir, "gradlew"), gradlew, { mode: 0o755 });

  const gradlewBat = `@echo off
java -jar gradle/wrapper/gradle-wrapper.jar %*
`;
  await fs.writeFile(join(workDir, "gradlew.bat"), gradlewBat);
}

function getGradleTask(buildType: string): string {
  switch (buildType) {
    case "debug_apk": return "assembleDebug";
    case "release_apk": return "assembleRelease";
    case "aab_bundle": return "bundleRelease";
    case "universal_apk": return "assembleUniversalRelease";
    default: return "assembleRelease";
  }
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function runGradleBuild(
  workDir: string,
  task: string,
  onLog: (line: string) => void
): Promise<{ code: number }> {
  return new Promise((resolve) => {
    const child = spawn("./gradlew", [task, "--no-daemon", "--info"], {
      cwd: workDir,
      env: { ...process.env, GRADLE_OPTS: "-Xmx4g", JAVA_HOME: process.env.JAVA_HOME || "/usr/lib/jvm/java-21-openjdk" },
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdoutBuffer = "";
    let stderrBuffer = "";

    child.stdout?.on("data", (data) => {
      const lines = (stdoutBuffer + data.toString()).split("\n");
      stdoutBuffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) onLog(line.trim());
      }
    });

    child.stderr?.on("data", (data) => {
      const lines = (stderrBuffer + data.toString()).split("\n");
      stderrBuffer = lines.pop() || "";
      for (const line of lines) {
        if (line.trim()) onLog(line.trim());
      }
    });

    child.on("close", (code) => {
      if (stdoutBuffer.trim()) onLog(stdoutBuffer.trim());
      if (stderrBuffer.trim()) onLog(stderrBuffer.trim());
      resolve({ code: code || 0 });
    });

    child.on("error", (err) => {
      onLog(`[ERROR] Failed to spawn gradle: ${err.message}`);
      resolve({ code: 1 });
    });

    // Timeout after 10 minutes
    setTimeout(() => {
      child.kill("SIGKILL");
      onLog("[ERROR] Build timeout (10 minutes)");
      resolve({ code: 1 });
    }, 10 * 60 * 1000);
  });
}

function parseGradleProgress(line: string): number {
  const taskMatch = line.match(/Task\s+:\w+:(\w+)/);
  if (taskMatch) {
    const task = taskMatch[1];
    if (task.includes("compile") || task.includes("Compile")) return 30;
    if (task.includes("process") || task.includes("Process")) return 40;
    if (task.includes("minify") || task.includes("Minify") || task.includes("R8")) return 60;
    if (task.includes("dex") || task.includes("Dex")) return 70;
    if (task.includes("package") || task.includes("Package")) return 80;
    if (task.includes("zipalign") || task.includes("ZipAlign")) return 90;
    if (task.includes("sign") || task.includes("Sign")) return 95;
  }
  return 0;
}

function extractGradleStep(line: string): string {
  const match = line.match(/Task\s+:\w+:(\w+)/);
  if (match) {
    return `Running task: ${match[1]}`;
  }
  if (line.includes("BUILD SUCCESSFUL")) return "Build completed";
  if (line.includes("BUILD FAILED")) return "Build failed";
  return "Building...";
}

async function findBuildArtifact(workDir: string, buildType: string): Promise<{ path: string; name: string } | null> {
  const appBuildDir = join(workDir, "app", "build", "outputs");

  if (buildType === "aab_bundle") {
    const bundleDir = join(appBuildDir, "bundle");
    try {
      const entries = await fs.readdir(bundleDir, { recursive: true });
      const aab = entries.find(e => e.endsWith(".aab"));
      if (aab) return { path: join(bundleDir, aab), name: aab };
    } catch {}
  } else {
    const apkDir = join(appBuildDir, "apk");
    try {
      const entries = await fs.readdir(apkDir, { recursive: true });
      const apk = entries.find(e => e.endsWith(".apk") && !e.endsWith("-unaligned.apk"));
      if (apk) return { path: join(apkDir, apk), name: apk };
    } catch {}
  }

  return null;
}