export interface LanguageVersionInfo {
  version: string;
  isLatest?: boolean;
  isStable?: boolean;
  isLegacy?: boolean;
  description: string;
  gradleCompatibility: string;
  agpCompatibility: string;
  recommendedSdk: number;
  releaseYear: string;
  features: string[];
}

export interface DetailedLanguage {
  id: string;
  name: string;
  category: string;
  icon: string;
  extension: string;
  buildTool: string;
  versions: LanguageVersionInfo[];
  defaultVersion: string;
  starterTemplate: string;
}

export const ALL_SUPPORTED_LANGUAGES: DetailedLanguage[] = [
  {
    id: "kotlin",
    name: "Kotlin",
    category: "Modern Android Native",
    icon: "Code2",
    extension: ".kt",
    buildTool: "Gradle 8.7 / AGP 8.7.0",
    defaultVersion: "2.1.0",
    versions: [
      {
        version: "2.1.0",
        isLatest: true,
        description: "En Güncel - Varsayılan K2 Derleyici, Compose Multiplatform 1.7, Guarded Conditions",
        gradleCompatibility: "8.7+",
        agpCompatibility: "8.7.0+",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["K2 Compiler default", "Subtyping improvements", "Direct Compose 1.7 support"],
      },
      {
        version: "2.0.21",
        isStable: true,
        description: "LTS Kararlı - Kurumsal Android 15 Üretim Standartı",
        gradleCompatibility: "8.5 - 8.7",
        agpCompatibility: "8.4 - 8.6",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["Stable K2 compiler", "Compose compiler plugin", "Lambda memoization"],
      },
      {
        version: "1.9.24",
        isLegacy: true,
        description: "Geriye Dönük Uyumluluk (Legacy K1 Derleyici & Eski Kütüphaneler)",
        gradleCompatibility: "8.0 - 8.4",
        agpCompatibility: "8.1 - 8.3",
        recommendedSdk: 34,
        releaseYear: "2023",
        features: ["Legacy K1 frontend", "Old synthetic plugins"],
      },
    ],
    starterTemplate: `package com.droidcraft.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent { Text("Kotlin 2.1.0 K2 Native Core") }
    }
}`,
  },
  {
    id: "java",
    name: "Java SDK",
    category: "Enterprise JVM Core",
    icon: "Coffee",
    extension: ".java",
    buildTool: "Gradle 8.7 / AGP 8.4.1",
    defaultVersion: "21 LTS",
    versions: [
      {
        version: "23",
        isLatest: true,
        description: "En Güncel JDK 23 - Scoped Values, Markdown Dokümantasyon Yorumları, Vector API",
        gradleCompatibility: "8.7+",
        agpCompatibility: "8.7.0",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["Scoped Values", "Markdown Comments", "Primitive types in patterns"],
      },
      {
        version: "21 LTS",
        isStable: true,
        description: "Standart Android 15 LTS - AGP 8+ Zorunlu Java Sürümü, Sanal İş Parçacıkları (Virtual Threads)",
        gradleCompatibility: "8.5+",
        agpCompatibility: "8.4+",
        recommendedSdk: 35,
        releaseYear: "2023",
        features: ["Virtual Threads (Loom)", "Record Patterns", "Sequenced Collections"],
      },
      {
        version: "17 LTS",
        isStable: false,
        description: "Geniş Ekosistem Uyumu - Eski Gradle Eklentileri İçin",
        gradleCompatibility: "7.4 - 8.4",
        agpCompatibility: "7.4 - 8.2",
        recommendedSdk: 33,
        releaseYear: "2021",
        features: ["Sealed Classes", "Pattern Matching switch"],
      },
      {
        version: "11 LTS",
        isLegacy: true,
        description: "Legacy Android 10-12 Kütüphaneleri",
        gradleCompatibility: "7.0 - 7.6",
        agpCompatibility: "7.0 - 7.3",
        recommendedSdk: 31,
        releaseYear: "2018",
        features: ["Standard HTTP Client", "var syntax in lambdas"],
      },
      {
        version: "8",
        isLegacy: true,
        description: "Desugaring Desteğiyle Eski Cihaz Uyumu",
        gradleCompatibility: "6.0 - 7.2",
        agpCompatibility: "4.0 - 7.0",
        recommendedSdk: 28,
        releaseYear: "2014",
        features: ["Core Java 8 desugared"],
      },
    ],
    starterTemplate: `package com.droidcraft.app;

import android.os.Bundle;
import androidx.appcompat.app.AppCompatActivity;

public class MainActivity extends AppCompatActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }
}`,
  },
  {
    id: "flutter",
    name: "Flutter / Dart",
    category: "Cross-Platform Framework",
    icon: "Smartphone",
    extension: ".dart",
    buildTool: "Flutter Engine / Gradle 8.5",
    defaultVersion: "Flutter 3.27.1 / Dart 3.6",
    versions: [
      {
        version: "Flutter 3.27.1 / Dart 3.6",
        isLatest: true,
        description: "En Güncel - Impeller GPU Vulkan Renderer, Dart 3.6 Makro Sistemi Önizlemesi",
        gradleCompatibility: "8.5+",
        agpCompatibility: "8.3.0+",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["Impeller Vulkan default on Android", "Dart 3.6 Enhanced Records", "Cupertino iOS 18 widgets"],
      },
      {
        version: "Flutter 3.24.5 / Dart 3.5",
        isStable: true,
        description: "Kararlı Kurumsal Sürüm - Geniş Topluluk Paket Uyumu",
        gradleCompatibility: "8.3+",
        agpCompatibility: "8.2.0+",
        recommendedSdk: 34,
        releaseYear: "2024",
        features: ["Stable Impeller OpenGL fallback", "Dart 3.5 Type inference"],
      },
      {
        version: "Flutter 3.19.6 / Dart 3.3",
        isLegacy: true,
        description: "Eski Projeler İçin Arşiv Sürümü",
        gradleCompatibility: "7.6 - 8.1",
        agpCompatibility: "7.4 - 8.0",
        recommendedSdk: 33,
        releaseYear: "2023",
        features: ["Skia renderer legacy"],
      },
    ],
    starterTemplate: `import 'package:flutter/material.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return const MaterialApp(home: Scaffold(body: Center(child: Text('Flutter 3.27.1 Impeller'))));
  }
}`,
  },
  {
    id: "react_native",
    name: "React Native (TypeScript)",
    category: "Cross-Platform Framework",
    icon: "Layers",
    extension: ".tsx",
    buildTool: "Metro / Gradle 8.6",
    defaultVersion: "0.77.0",
    versions: [
      {
        version: "0.77.0",
        isLatest: true,
        description: "En Güncel - New Architecture (TurboModules & Fabric C++) varsayılan aktif",
        gradleCompatibility: "8.6+",
        agpCompatibility: "8.4.0+",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["New Architecture by default", "React 19 support", "Hermes bytecode v96"],
      },
      {
        version: "0.76.5",
        isStable: true,
        description: "Kararlı New Architecture - Stabil TurboModules & Bridgeless Mode",
        gradleCompatibility: "8.5+",
        agpCompatibility: "8.3.0+",
        recommendedSdk: 34,
        releaseYear: "2024",
        features: ["Bridgeless mode stable", "Fast refresh improvements"],
      },
      {
        version: "0.72.15",
        isLegacy: true,
        description: "Old Architecture (Köprü Modu / Eski Paketler)",
        gradleCompatibility: "7.5 - 8.0",
        agpCompatibility: "7.4 - 8.0",
        recommendedSdk: 33,
        releaseYear: "2023",
        features: ["Old Async Bridge", "Legacy paper renderer"],
      },
    ],
    starterTemplate: `import React from 'react';
import { View, Text } from 'react-native';

export default function App() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>React Native 0.77 New Architecture</Text>
    </View>
  );
}`,
  },
  {
    id: "cpp_ndk",
    name: "C++ / Android NDK",
    category: "Native High Performance",
    icon: "Cpu",
    extension: ".cpp",
    buildTool: "CMake 3.28 / Ninja",
    defaultVersion: "C++23 / NDK r27c",
    versions: [
      {
        version: "C++23 / NDK r27c",
        isLatest: true,
        description: "En Güncel NDK - LLVM Clang 18, 16KB Sayfa Boyutu Desteği (Android 15)",
        gradleCompatibility: "8.7+",
        agpCompatibility: "8.4+",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["16KB page alignment", "LLVM 18 libc++", "C++23 std::expected & mdspan"],
      },
      {
        version: "C++20 / NDK r26d",
        isStable: true,
        description: "Kararlı NDK LTS - Vulkan 1.3 & OpenGL ES 3.2",
        gradleCompatibility: "8.5+",
        agpCompatibility: "8.2+",
        recommendedSdk: 34,
        releaseYear: "2023",
        features: ["C++20 Concepts", "Coroutines", "Designated initializers"],
      },
      {
        version: "C++17 / NDK r25c",
        isLegacy: true,
        description: "Eski Donanım Uyumu",
        gradleCompatibility: "7.4 - 8.1",
        agpCompatibility: "7.3 - 8.0",
        recommendedSdk: 33,
        releaseYear: "2022",
        features: ["C++17 filesystem", "std::string_view"],
      },
    ],
    starterTemplate: `#include <jni.h>
#include <string>

extern "C" JNIEXPORT jstring JNICALL
Java_com_droidcraft_app_MainActivity_stringFromJNI(JNIEnv* env, jobject) {
    return env->NewStringUTF("C++23 NDK r27c Native Engine Active");
}`,
  },
  {
    id: "rust_mobile",
    name: "Rust Mobile",
    category: "Memory Safe Systems",
    icon: "Shield",
    extension: ".rs",
    buildTool: "cargo-apk / ndk-build",
    defaultVersion: "Rust 1.83.0",
    versions: [
      {
        version: "Rust 1.83.0",
        isLatest: true,
        description: "En Güncel - aarch64-linux-android, JNI 0.21, Native Activity Bindings",
        gradleCompatibility: "8.7",
        agpCompatibility: "8.4",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["const context stabilization", "JNI 0.21 binding", "android_activity crate"],
      },
      {
        version: "Rust 1.80.0",
        isStable: true,
        description: "Kararlı LTS Sürümü",
        gradleCompatibility: "8.5",
        agpCompatibility: "8.2",
        recommendedSdk: 34,
        releaseYear: "2024",
        features: ["Exclusive range patterns", "LazyLock stabilization"],
      },
    ],
    starterTemplate: `use jni::JNIEnv;
use jni::objects::JClass;
use jni::sys::jstring;

#[no_mangle]
pub extern "system" fn Java_com_droidcraft_app_MainActivity_rustHello(
    mut env: JNIEnv,
    _class: JClass,
) -> jstring {
    let output = env.new_string("Rust 1.83.0 Android Native Code").unwrap();
    output.into_raw()
}`,
  },
  {
    id: "python_kivy",
    name: "Python / Chaquopy & Kivy",
    category: "Scripting & AI",
    icon: "Terminal",
    extension: ".py",
    buildTool: "Chaquopy 15.0 / Buildozer",
    defaultVersion: "Python 3.12.7",
    versions: [
      {
        version: "Python 3.12.7",
        isLatest: true,
        description: "En Güncel - Chaquopy 15.0 & NumPy, OpenCV, PyTorch Mobile",
        gradleCompatibility: "8.5+",
        agpCompatibility: "8.3.1+",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["Isolated Subinterpreters", "Improved f-strings", "Faster GIL performance"],
      },
      {
        version: "Python 3.11.9",
        isStable: true,
        description: "Kararlı Kivy Buildozer Engine",
        gradleCompatibility: "8.0+",
        agpCompatibility: "8.1+",
        recommendedSdk: 34,
        releaseYear: "2023",
        features: ["TaskGroup in asyncio", "Specialized adaptive interpreter"],
      },
    ],
    starterTemplate: `from kivy.app import App
from kivy.uix.label import Label

class MobileApp(App):
    def build(self):
        return Label(text='Python 3.12.7 Mobile Studio')

if __name__ == '__main__':
    MobileApp().run()`,
  },
  {
    id: "swift_bridge",
    name: "Swift / iOS Bridge",
    category: "Cross-Platform Bridge",
    icon: "Apple",
    extension: ".swift",
    buildTool: "Swift Package Manager / Xcode 16",
    defaultVersion: "Swift 6.0",
    versions: [
      {
        version: "Swift 6.0",
        isLatest: true,
        description: "En Güncel - Complete Concurrency, C++23 Bidirectional Interop",
        gradleCompatibility: "N/A",
        agpCompatibility: "N/A",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["Data-race safety guaranteed", "128-bit integer support", "Direct C++ interoperability"],
      },
      {
        version: "Swift 5.10",
        isStable: true,
        description: "Kararlı Xcode 15 LTS",
        gradleCompatibility: "N/A",
        agpCompatibility: "N/A",
        recommendedSdk: 34,
        releaseYear: "2023",
        features: ["Strict concurrency checking", "Sendable checking"],
      },
    ],
    starterTemplate: `import Foundation

@objc public class MobileBridge: NSObject {
    @objc public static func getInfo() -> String {
        return "Swift 6.0 iOS Bridge Active"
    }
}`,
  },
  {
    id: "go_mobile",
    name: "Go Mobile (gomobile)",
    category: "Microservices & Cryptography",
    icon: "Zap",
    extension: ".go",
    buildTool: "gomobile bind 1.23",
    defaultVersion: "Go 1.23.4",
    versions: [
      {
        version: "Go 1.23.4",
        isLatest: true,
        description: "En Güncel - Range-over-func iterators, gomobile bind AAR paketi",
        gradleCompatibility: "8.5",
        agpCompatibility: "8.2.0",
        recommendedSdk: 35,
        releaseYear: "2024",
        features: ["Iterators in for loops", "Telemetry opt-in", "New unique package"],
      },
      {
        version: "Go 1.22.8",
        isStable: true,
        description: "Kararlı LTS Sürüm",
        gradleCompatibility: "8.2",
        agpCompatibility: "8.1.0",
        recommendedSdk: 34,
        releaseYear: "2024",
        features: ["For-loop variable scoping fix", "Enhanced routing in net/http"],
      },
    ],
    starterTemplate: `package mobilebridge

import "fmt"

func GetPlatformStatus() string {
    return fmt.Sprintf("Go 1.23 Mobile Core Ready")
}`,
  },
  {
    id: "lua_solar",
    name: "Lua / Solar2D Mobile",
    category: "2D Casual Games",
    icon: "Gamepad",
    extension: ".lua",
    buildTool: "Solar2D Builder / Gradle 8.2",
    defaultVersion: "Lua 5.4.7",
    versions: [
      {
        version: "Lua 5.4.7",
        isLatest: true,
        description: "En Güncel - Generational GC, <const> ve <close> Değişkenleri",
        gradleCompatibility: "8.2",
        agpCompatibility: "8.1.0",
        recommendedSdk: 34,
        releaseYear: "2024",
        features: ["Generational garbage collector", "To-be-closed variables", "Improved random number generator"],
      },
      {
        version: "LuaJIT 2.1",
        isStable: true,
        description: "Ultra Hızlı JIT Motoru",
        gradleCompatibility: "8.0",
        agpCompatibility: "7.4.0",
        recommendedSdk: 33,
        releaseYear: "2023",
        features: ["Trace compiler", "FFI library for direct C calls"],
      },
    ],
    starterTemplate: `local composer = require("composer")
local scene = composer.newScene()

function scene:create(event)
    local sceneGroup = self.view
    local text = display.newText("Lua 5.4 Solar2D Mobile", display.contentCenterX, display.contentCenterY, native.systemFont, 20)
    sceneGroup:insert(text)
end

return scene`,
  },
];
