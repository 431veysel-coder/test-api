/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Sliders,
  Cpu,
  Shield,
  Terminal,
  Globe,
  Database,
  Key,
  FolderGit2,
  Save,
  CheckCircle2,
  RefreshCw,
  Server,
  Zap,
  Lock,
  Smartphone,
  Layers,
  Wrench,
} from "lucide-react";
import { ProjectConfig, SupportedLanguage } from "../types";

interface AdvancedSettingsHubProps {
  project: ProjectConfig;
  setProject: React.Dispatch<React.SetStateAction<ProjectConfig>>;
}

export const AdvancedSettingsHub: React.FC<AdvancedSettingsHubProps> = ({
  project,
  setProject,
}) => {
  const [activeTab, setActiveTab] = useState<"compiler" | "modder" | "editor" | "security" | "environment" | "gateway">("compiler");
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  // Form states initialized from project
  const [projectName, setProjectName] = useState<string>(project.name);
  const [packageName, setPackageName] = useState<string>(project.packageName);
  const [versionName, setVersionName] = useState<string>(project.versionName);
  const [versionCode, setVersionCode] = useState<number>(project.versionCode);
  const [targetSdk, setTargetSdk] = useState<number>(project.targetSdk);
  const [minSdk, setMinSdk] = useState<number>(project.minSdk);
  const [language, setLanguage] = useState<SupportedLanguage>(project.language);
  const [minifyEnabled, setMinifyEnabled] = useState<boolean>(project.minifyEnabled);
  const [shrinkResources, setShrinkResources] = useState<boolean>(project.shrinkResources);
  const [signingScheme, setSigningScheme] = useState<"v1" | "v2_v3_v4">(project.signingScheme);
  const [themeColor, setThemeColor] = useState<string>(project.themeColor);

  // Advanced Modder & Assembler Options
  const [ndkPageAlignment, setNdkPageAlignment] = useState<boolean>(true);
  const [kotlinK2Compiler, setKotlinK2Compiler] = useState<boolean>(true);
  const [gradleParallel, setGradleParallel] = useState<boolean>(true);
  const [dexDeobfuscation, setDexDeobfuscation] = useState<boolean>(false);
  const [prootSandboxMode, setProotSandboxMode] = useState<string>("debian_bookworm");
  const [defaultBrowserEngine, setDefaultBrowserEngine] = useState<string>("firefox_gecko_132");

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setProject((prev) => ({
      ...prev,
      name: projectName,
      packageName,
      versionName,
      versionCode,
      targetSdk,
      minSdk,
      language,
      minifyEnabled,
      shrinkResources,
      signingScheme,
      themeColor,
    }));

    setSavedSuccess("Gelişmiş geliştirici, montaj ve derleyici ayarları başarıyla kaydedildi ve sisteme mühürlendi!");
    setTimeout(() => setSavedSuccess(null), 4000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Gelişmiş Geliştirici, Montajcı & Modlayıcı Ayarları
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-[10px] font-mono">
                Master Control Center
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Android SDK sürümleri, R8/ProGuard optimizasyonları, NDK 16KB sayfa hizalama bayrakları, Proot sandbox ve API geçit ayarları.
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all shrink-0"
        >
          <Save className="w-4 h-4" />
          <span>Ayarları Kaydet & Uygula</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{savedSuccess}</span>
        </div>
      )}

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs overflow-x-auto no-scrollbar">
        {[
          { id: "compiler", label: "Derleyici & SDK", icon: Cpu },
          { id: "modder", label: "Modlayıcı & APK Montajı", icon: Wrench },
          { id: "editor", label: "Proje Metadata", icon: Layers },
          { id: "security", label: "İmza & R8 Güvenlik", icon: Shield },
          { id: "environment", label: "Linux Konteyner & Proot", icon: Server },
          { id: "gateway", label: "API Gateway & Ajan", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings Form Content */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* TAB 1: COMPILER & SDK SETTINGS */}
        {activeTab === "compiler" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Cpu className="w-4 h-4 text-cyan-400" />
                <span>Android SDK & Dil Sürümü Yapılandırması</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-400 font-semibold">Ana Programlama Dili:</label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="kotlin">Kotlin 2.1.0 (Jetpack Compose / K2 Compiler)</option>
                    <option value="java">Java 21 LTS / 23</option>
                    <option value="flutter">Flutter 3.27.1 / Dart 3.6</option>
                    <option value="react_native">React Native 0.77 (New Architecture)</option>
                    <option value="cpp_ndk">C++23 (NDK r27c / CMake 3.28)</option>
                    <option value="rust_mobile">Rust 1.83 (cargo-apk)</option>
                    <option value="python_kivy">Python 3.12 / Kivy</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Target SDK (Hedef):</label>
                    <select
                      value={targetSdk}
                      onChange={(e) => setTargetSdk(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value={35}>API 35 (Android 15)</option>
                      <option value={34}>API 34 (Android 14)</option>
                      <option value={33}>API 33 (Android 13)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Min SDK (En Düşük):</label>
                    <select
                      value={minSdk}
                      onChange={(e) => setMinSdk(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                    >
                      <option value={24}>API 24 (Android 7.0)</option>
                      <option value={21}>API 21 (Android 5.0)</option>
                      <option value={26}>API 26 (Android 8.0)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Kotlin K2 Compiler Optimizasyonu</span>
                    <span className="text-slate-400 text-[11px]">Derleme süresini %40 hızlandırır, tip çıkarımını güçlendirir.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={kotlinK2Compiler}
                    onChange={(e) => setKotlinK2Compiler(e.target.checked)}
                    className="w-4 h-4 accent-cyan-500 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Gradle Daemon & Bellek Yürütme Ayarları</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Paralel Gradle Yürütme (--parallel)</span>
                    <span className="text-slate-400 text-[11px]">Çoklu modül projelerinde eşzamanlı derleme sağlar.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={gradleParallel}
                    onChange={(e) => setGradleParallel(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 font-mono text-[11px] text-slate-300">
                  <span className="text-cyan-400 font-bold block">gradle.properties Varsayılanları:</span>
                  <p>org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m</p>
                  <p>org.gradle.caching=true</p>
                  <p>org.gradle.configureondemand=true</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MODDER & APK ASSEMBLER */}
        {activeTab === "modder" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Wrench className="w-4 h-4 text-purple-400" />
              <span>Gelişmiş APK Montajcısı & NDK Modlayıcı Ayarları</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">NDK 16KB Bellek Sayfa Hizalaması</span>
                  <span className="text-slate-400 text-[11px]">-Wl,-z,max-page-size=16384 (Android 15 C++ çökmelerini önler)</span>
                </div>
                <input
                  type="checkbox"
                  checked={ndkPageAlignment}
                  onChange={(e) => setNdkPageAlignment(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">DEX Deobfuscation (Kod Çözme Analizi)</span>
                  <span className="text-slate-400 text-[11px]">Sınıf ve metot isimlerini analiz için okunabilir tutar.</span>
                </div>
                <input
                  type="checkbox"
                  checked={dexDeobfuscation}
                  onChange={(e) => setDexDeobfuscation(e.target.checked)}
                  className="w-4 h-4 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROJECT METADATA */}
        {activeTab === "editor" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Uygulama Kimliği ve Metadata Düzenleyicisi</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Proje Adı:</label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Paket Kimliği (Package Name):</label>
                <input
                  type="text"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Sürüm Adı (Version Name):</label>
                <input
                  type="text"
                  value={versionName}
                  onChange={(e) => setVersionName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Sürüm Kodu (Version Code):</label>
                <input
                  type="number"
                  value={versionCode}
                  onChange={(e) => setVersionCode(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SECURITY & SIGNING */}
        {activeTab === "security" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>R8 Code Shrinker & Kriptografik İmza Yapılandırması</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">R8 / ProGuard Bytecode Minify</span>
                  <span className="text-slate-400 text-[11px]">Kullanılmayan sınıfları ve metotları temizleyerek APK boyutunu küçültür.</span>
                </div>
                <input
                  type="checkbox"
                  checked={minifyEnabled}
                  onChange={(e) => setMinifyEnabled(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <span className="font-bold text-white block">Kaynak Kod Sıkıştırma (Shrink Resources)</span>
                  <span className="text-slate-400 text-[11px]">Kullanılmayan resim ve XML varlıklarını derlemeden atar.</span>
                </div>
                <input
                  type="checkbox"
                  checked={shrinkResources}
                  onChange={(e) => setShrinkResources(e.target.checked)}
                  className="w-4 h-4 accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-slate-400 font-semibold">Android İmza Şeması (Signing Scheme):</label>
                <select
                  value={signingScheme}
                  onChange={(e) => setSigningScheme(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                >
                  <option value="v2_v3_v4">APK Signature Scheme v2 + v3 + v4 (Android 15 Play Store Zorunlu)</option>
                  <option value="v1">JAR Signing (v1 Legacy)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ENVIRONMENT & PROOT */}
        {activeTab === "environment" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Proot Linux Konteyner & Tarayıcı Motor Seçimi</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Varsayılan Linux SandBox:</label>
                <select
                  value={prootSandboxMode}
                  onChange={(e) => setProotSandboxMode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="debian_bookworm">Debian 12 (Bookworm) aarch64 (Kararlı & Optimize)</option>
                  <option value="ubuntu_noble">Ubuntu 24.04 LTS (Noble Numbat) aarch64 (Snap & Bulut)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 font-semibold">Varsayılan Dahili Tarayıcı Motoru:</label>
                <select
                  value={defaultBrowserEngine}
                  onChange={(e) => setDefaultBrowserEngine(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="firefox_gecko_132">Mozilla Firefox (Gecko 132 - Gizlilik ve İzleme Koruması)</option>
                  <option value="chromium_v8_130">Chromium V8 (130 - Yüksek Hızlı Web Rendering)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: API GATEWAY & AGENT */}
        {activeTab === "gateway" && (
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
              <Globe className="w-4 h-4 text-blue-400" />
              <span>Unified Public APIs Gateway & Agent Plugin Güvenliği</span>
            </h3>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-cyan-400 font-bold block">Gateway Durumu: Aktif (HTTPS / Proxy Mode)</span>
              <p className="text-slate-300">Tüm 50+ halka açık API ve ajan eklenti çağrıları sunucu tarafında önbelleklenmekte ve CORS süzgecinden geçmektedir.</p>
              <p className="text-slate-400">Master Token: <code className="text-amber-300">dc_agent_master_token_2026</code></p>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
