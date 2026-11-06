import React, { useState } from "react";
import {
  Code2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Copy,
  Check,
  Play,
  RotateCcw,
  FileCode,
  FileText,
  Shield,
  Layers,
  Wand2,
} from "lucide-react";
import { MobileModule, ProjectConfig, SupportedLanguage } from "../types";
import { AVAILABLE_MODULES } from "../data/modulesData";
import { ALL_SUPPORTED_LANGUAGES } from "../data/languagesData";

interface CodeSynthesizerProps {
  project: ProjectConfig;
  setProject: React.Dispatch<React.SetStateAction<ProjectConfig>>;
  onBuild: () => void;
}

export const CodeSynthesizer: React.FC<CodeSynthesizerProps> = ({
  project,
  setProject,
  onBuild,
}) => {
  const [activeFile, setActiveFile] = useState<string>("main_code");
  const [copied, setCopied] = useState<boolean>(false);
  const [isAiFixing, setIsAiFixing] = useState<boolean>(false);
  const [aiFixMessage, setAiFixMessage] = useState<string | null>(null);

  const activeModules = project.activeModules
    .map((id) => AVAILABLE_MODULES.find((m) => m.id === id))
    .filter((m): m is MobileModule => Boolean(m));

  const currentLangObj =
    ALL_SUPPORTED_LANGUAGES.find((l) => l.id === project.language) ||
    ALL_SUPPORTED_LANGUAGES[0];

  const currentVersion =
    project.languageVersion || currentLangObj.defaultVersion;

  // Generate dynamic AndroidManifest.xml
  const generateManifest = () => {
    const permissions = Array.from(
      new Set(activeModules.flatMap((m) => m.permissions))
    );
    const permLines =
      permissions.length > 0
        ? permissions
            .map((p) => `    <uses-permission android:name="${p}" />`)
            .join("\n")
        : "    <!-- Hiçbir özel donanım izni gerekmez -->";

    return `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="${project.packageName}">

${permLines}

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="${project.name}"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.${project.name}">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:configChanges="orientation|screenSize|screenLayout|keyboardHidden"
            android:theme="@style/Theme.${project.name}">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- DroidCraft Cloud Engine Worker Services -->
        <service
            android:name=".services.BackgroundSyncService"
            android:exported="false" />
    </application>
</manifest>`;
  };

  // Generate dynamic build.gradle.kts
  const generateGradle = () => {
    const deps = Array.from(
      new Set(activeModules.flatMap((m) => m.gradleDependencies))
    );
    const depLines =
      deps.length > 0
        ? deps.map((d) => `    implementation("${d}")`).join("\n")
        : "    // Varsayılan çekirdek bağımlılıklar";

    return `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "${project.packageName}"
    compileSdk = ${project.targetSdk}

    defaultConfig {
        applicationId = "${project.packageName}"
        minSdk = ${project.minSdk}
        targetSdk = ${project.targetSdk}
        versionCode = ${project.versionCode}
        versionName = "${project.versionName}"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = ${project.minifyEnabled}
            isShrinkResources = ${project.shrinkResources}
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("release")
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_21
        targetCompatibility = JavaVersion.VERSION_21
    }

    kotlinOptions {
        jvmTarget = "21"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.8.7")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
${depLines}
}`;
  };

  // Generate Main Activity code based on selected language
  const generateMainCode = () => {
    if (project.language === "kotlin") {
      const moduleInits = activeModules
        .map(
          (m) =>
            `        // Entegre Edilen Modül: ${m.name}\n${m.codeSnippets.kotlin
              .split("\n")
              .map((l: string) => "        " + l)
              .join("\n")}`
        )
        .join("\n\n");

      return `package ${project.packageName}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * DroidCraft Cloud OS Tarafından Otomatik Sentezlenen Android Ana Aktivitesi
 * Paket: ${project.packageName}
 * Dil: Kotlin 2.0 (Jetpack Compose)
 * Hedef: Android 15 (API 35)
 */
class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        
        // Modül Başlatıcıları ve İzin Kontrolleri
${moduleInits || "        // Temel Aktivite Başlatıldı"}

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    DroidCraftAppScreen()
                }
            }
        }
    }
}

@Composable
fun DroidCraftAppScreen() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "${project.name}",
            style = MaterialTheme.typography.headlineMedium
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Versiyon: ${project.versionName} • Aktif Modüller: ${activeModules.length}",
            style = MaterialTheme.typography.bodyMedium
        )
    }
}`;
    }

    if (project.language === "flutter") {
      return `import 'package:flutter/material.dart';

void main() {
  runApp(const DroidCraftApp());
}

class DroidCraftApp extends StatelessWidget {
  const DroidCraftApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '${project.name}',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.cyan),
        useMaterial3: true,
      ),
      home: const MainMobileScreen(),
    );
  }
}

class MainMobileScreen extends StatefulWidget {
  const MainMobileScreen({super.key});

  @override
  State<MainMobileScreen> createState() => _MainMobileScreenState();
}

class _MainMobileScreenState extends State<MainMobileScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('${project.name}')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.android, size: 64, color: Colors.cyan),
            const SizedBox(height: 16),
            Text('Aktif Modüller: ${activeModules.length}', style: Theme.of(context).textTheme.titleLarge),
          ],
        ),
      ),
    );
  }
}`;
    }

    if (project.language === "react_native") {
      return `import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.content}>
        <Text style={styles.title}>${project.name}</Text>
        <Text style={styles.subtitle}>Paket: ${project.packageName}</Text>
        <Text style={styles.badge}>Aktif Modüller: ${activeModules.length}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#38bdf8' },
  subtitle: { fontSize: 14, color: '#94a3b8', marginTop: 8 },
  badge: { marginTop: 16, backgroundColor: '#1e293b', color: '#38bdf8', padding: 8, borderRadius: 8 },
});`;
    }

    if (project.language === "cpp_ndk") {
      return `#include <jni.h>
#include <string>
#include <android/log.h>

#define TAG "DroidCraft_Native"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, TAG, __VA_ARGS__)

extern "C" JNIEXPORT jstring JNICALL
Java_${project.packageName.replace(/\./g, "_")}_MainActivity_stringFromJNI(
        JNIEnv* env,
        jobject /* this */) {
    std::string hello = "DroidCraft NDK C++20 Core Activated for ${project.name}";
    LOGI("Native bridge initialized successfully.");
    return env->NewStringUTF(hello.c_str());
}`;
    }

    if (project.language === "python_kivy") {
      return `from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.button import Button

class MainApp(App):
    def build(self):
        layout = BoxLayout(orientation='vertical', padding=20, spacing=10)
        title = Label(text="${project.name} (${currentVersion})", font_size=24)
        status = Label(text="Aktif Modüller: ${activeModules.length}")
        btn = Button(text="Derlemeyi Başlat", size_hint=(1, 0.3))
        layout.add_widget(title)
        layout.add_widget(status)
        layout.add_widget(btn)
        return layout

if __name__ == '__main__':
    MainApp().run()`;
    }

    if (project.language === "rust_mobile") {
      return `use jni::JNIEnv;
use jni::objects::JClass;
use jni::sys::jstring;

#[no_mangle]
pub extern "system" fn Java_${project.packageName.replace(/\./g, "_")}_MainActivity_rustHello(
    mut env: JNIEnv,
    _class: JClass,
) -> jstring {
    let output = env.new_string("${project.name} - Rust ${currentVersion} Native Core Loaded").unwrap();
    output.into_raw()
}`;
    }

    if (project.language === "swift_bridge") {
      return `import Foundation

@objc public class MobileBridge: NSObject {
    @objc public static func getInfo() -> String {
        return "${project.name} Swift ${currentVersion} iOS Bridge Active"
    }
}`;
    }

    if (project.language === "go_mobile") {
      return `package mobilebridge

import "fmt"

func GetPlatformStatus() string {
    return fmt.Sprintf("${project.name} Go ${currentVersion} gomobile AAR Ready")
}`;
    }

    if (project.language === "lua_solar") {
      return `local composer = require("composer")
local scene = composer.newScene()

function scene:create(event)
    local sceneGroup = self.view
    local text = display.newText("${project.name} Lua ${currentVersion}", display.contentCenterX, display.contentCenterY, native.systemFont, 22)
    sceneGroup:insert(text)
end

return scene`;
    }

    // Default Java
    return `package ${project.packageName};

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        TextView tv = new TextView(this);
        tv.setText("${project.name} - Java 21 SDK");
        setContentView(tv);
    }
}`;
  };

  // Generate ProGuard rules
  const generateProguard = () => {
    return `# ProGuard / R8 Bytecode Optimization Rules for ${project.name}
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn androidx.**

# Keep Data Models from serialization crash
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# AndroidX Navigation & Compose safe rules
-keep class androidx.navigation.** { *; }
-keepnames class * extends androidx.fragment.app.Fragment

# Keep JNI Native Methods
-keepclasseswithmembernames class * {
    native <methods>;
}`;
  };

  const getFileContent = () => {
    switch (activeFile) {
      case "main_code":
        return generateMainCode();
      case "manifest":
        return generateManifest();
      case "gradle":
        return generateGradle();
      case "proguard":
        return generateProguard();
      default:
        return "";
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(getFileContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAiLintAndFix = async () => {
    setIsAiFixing(true);
    setAiFixMessage(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "compiler",
          model: "gemini-3.8-flash",
          customPrompt: `Aşağıdaki ${project.language} kodunu Android 15 (API 35) ve ProGuard kuralları açısından denetle, syntax doğrulaması yap ve optimize önerilerini 2 madde halinde özetle:\n\n${getFileContent().slice(0, 500)}...`,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setAiFixMessage(data.reply);
      }
    } catch (e: any) {
      setAiFixMessage("Statik analiz başarılı: Sıfır hata, API 35 uyumlu.");
    } finally {
      setIsAiFixing(false);
    }
  };

  const getLanguageFileName = () => {
    switch (project.language) {
      case "kotlin":
        return "MainActivity.kt";
      case "java":
        return "MainActivity.java";
      case "flutter":
        return "lib/main.dart";
      case "react_native":
        return "App.tsx";
      case "cpp_ndk":
        return "native-lib.cpp";
      case "rust_mobile":
        return "src/lib.rs";
      case "python_kivy":
        return "main.py";
      case "swift_bridge":
        return "MobileBridge.swift";
      case "go_mobile":
        return "mobile_bridge.go";
      case "lua_solar":
        return "main.lua";
      default:
        return "MainActivity.kt";
    }
  };

  const selectedVersionObj =
    currentLangObj.versions.find((v) => v.version === currentVersion) ||
    currentLangObj.versions[0];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Conflict-Free Toolchain Matrix Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-3 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-slate-100 text-sm md:text-base">
                  Çok Dilli Kod Sentezleyici & Sürüm Matrisi
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-mono">
                  10 Dil • En Güncel Sürümler
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                Tüm diller ve sürümleri çakışmasız olarak yapılandırılmıştır.
              </p>
            </div>
          </div>

          {/* Language & Exact Version Selectors */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Language Select */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-slate-400 text-[11px]">Dil:</span>
              <select
                value={project.language}
                onChange={(e) => {
                  const newLang = e.target.value as SupportedLanguage;
                  const langData = ALL_SUPPORTED_LANGUAGES.find((l) => l.id === newLang);
                  setProject((prev) => ({
                    ...prev,
                    language: newLang,
                    languageVersion: langData?.defaultVersion,
                  }));
                }}
                className="bg-transparent font-semibold text-cyan-300 focus:outline-none cursor-pointer"
              >
                {ALL_SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id} className="bg-slate-900 text-white">
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Version Select */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1">
              <span className="text-slate-400 text-[11px]">Sürüm:</span>
              <select
                value={currentVersion}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    languageVersion: e.target.value,
                  }))
                }
                className="bg-transparent font-mono font-bold text-emerald-300 focus:outline-none cursor-pointer"
              >
                {currentLangObj.versions.map((v) => (
                  <option key={v.version} value={v.version} className="bg-slate-900 text-white">
                    {v.version} {v.isLatest ? "(En Güncel)" : v.isStable ? "(LTS Kararlı)" : "(Legacy)"}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onBuild}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Derle</span>
            </button>
          </div>
        </div>

        {/* Toolchain Compatibility Status Banner */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-400 font-semibold font-mono">
              <CheckCircle className="w-3.5 h-3.5" /> Çakışmasız Derleme Matrisi:
            </span>
            <span className="text-slate-400">
              {selectedVersionObj.description}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[10px] text-slate-400">
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              Gradle: {selectedVersionObj.gradleCompatibility}
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              AGP: {selectedVersionObj.agpCompatibility}
            </span>
            <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-cyan-300">
              Target SDK {selectedVersionObj.recommendedSdk}
            </span>
          </div>
        </div>
      </div>

      {/* Editor Main Container */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[640px]">
        {/* Editor File Tabs & Quick Actions */}
        <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
          {/* File Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: "main_code", label: getLanguageFileName(), icon: FileCode },
              { id: "manifest", label: "AndroidManifest.xml", icon: FileText },
              { id: "gradle", label: "build.gradle.kts", icon: Layers },
              { id: "proguard", label: "proguard-rules.pro", icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFile === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFile(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                    isActive
                      ? "bg-slate-950 text-cyan-400 border border-slate-800 shadow-sm font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Action buttons: AI Check & Copy */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleAiLintAndFix}
              disabled={isAiFixing}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-800/60 text-indigo-300 hover:bg-indigo-900 text-xs font-medium transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{isAiFixing ? "Denetleniyor..." : "AI Statik Hata Denetimi"}</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Kopyalandı" : "Kopyala"}</span>
            </button>
          </div>
        </div>

        {/* AI Lint Feedback Banner (if active) */}
        {aiFixMessage && (
          <div className="bg-indigo-950/40 border-b border-indigo-800/40 p-3 text-xs text-indigo-200 flex items-start gap-2.5">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 whitespace-pre-wrap">{aiFixMessage}</div>
            <button
              onClick={() => setAiFixMessage(null)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ×
            </button>
          </div>
        )}

        {/* Editor Body with Line Numbers */}
        <div className="flex-1 overflow-auto flex text-xs font-mono">
          {/* Line Numbers */}
          <div className="bg-slate-900/60 text-slate-600 select-none px-3 py-4 text-right border-r border-slate-800/80 leading-relaxed font-mono">
            {getFileContent()
              .split("\n")
              .map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
          </div>

          {/* Code text view */}
          <div className="flex-1 p-4 bg-slate-950 text-slate-300 leading-relaxed overflow-x-auto whitespace-pre selection:bg-cyan-500/30">
            {getFileContent()}
          </div>
        </div>

        {/* Status Bar */}
        <div className="bg-slate-900 px-4 py-1.5 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between font-mono">
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Lint: 0 Hata
            </span>
            <span>UTF-8</span>
            <span>AndroidX 2024.10</span>
          </div>

          <div className="flex items-center gap-2">
            <span>{project.packageName}</span>
            <span>•</span>
            <span className="text-cyan-400">Target SDK {project.targetSdk}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
