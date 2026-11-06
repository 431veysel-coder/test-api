/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Header } from "./components/Header";
import { ModuleCanvas } from "./components/ModuleCanvas";
import { BuildEngine } from "./components/BuildEngine";
import { CodeSynthesizer } from "./components/CodeSynthesizer";
import { DeviceSimulator } from "./components/DeviceSimulator";
import { AiAssetStudio } from "./components/AiAssetStudio";
import { GeminiChatbot } from "./components/GeminiChatbot";
import { ProjectManagement } from "./components/ProjectManagement";
import { TeamChat } from "./components/TeamChat";
import { RemoteApiPanel } from "./components/RemoteApiPanel";
import { DocumentationView } from "./components/DocumentationView";
import { TermuxTerminal } from "./components/TermuxTerminal";
import { BrowserDataEngine } from "./components/BrowserDataEngine";
import { DatabaseStudio } from "./components/DatabaseStudio";
import { LinuxContainerStudio } from "./components/LinuxContainerStudio";
import { GitHubHybridHub } from "./components/GitHubHybridHub";
import { AutomationsStudio } from "./components/AutomationsStudio";
import { UnifiedPublicApiHub } from "./components/UnifiedPublicApiHub";
import { AgentPluginHub } from "./components/AgentPluginHub";
import { AdvancedSettingsHub } from "./components/AdvancedSettingsHub";
import { DeveloperControlCenter } from "./components/DeveloperControlCenter";
import { McpHub } from "./components/McpHub";
import { FirebaseStudio } from "./components/FirebaseStudio";
import { FirebaseProvider } from "./context/FirebaseContext";
import { BuildLogRecord, ProjectConfig } from "./types";
import { Locale } from "./data/translations";

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>("canvas");
  const [locale, setLocale] = useState<Locale>("tr");
  const [theme, setTheme] = useState<"dark" | "cyber" | "light">("dark");
  const [isOffline, setIsOffline] = useState<boolean>(
    typeof navigator !== "undefined" ? !navigator.onLine : false
  );
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [lastBuild, setLastBuild] = useState<BuildLogRecord | null>(null);

  const [project, setProject] = useState<ProjectConfig>(() => {
    // Attempt local storage persistence for offline mode
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("droidcraft_project");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return {
      id: "proj-core-01",
      name: "DroidCraft Core Pro",
      packageName: "com.droidcraft.app",
      versionName: "2.4.1",
      versionCode: 104,
      minSdk: 24,
      targetSdk: 35, // Android 15
      language: "kotlin",
      activeModules: [
        "camerax_pro",
        "biometric_auth",
        "room_sqlite",
        "fcm_push",
        "r8_proguard_security",
      ],
      minifyEnabled: true,
      shrinkResources: true,
      signingScheme: "v2_v3_v4",
      themeColor: "#06b6d4",
    };
  });

  // Offline / Online listeners
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("droidcraft_project", JSON.stringify(project));
    }
  }, [project]);

  // Quick build trigger from Header CTA
  const handleQuickBuild = () => {
    setCurrentTab("build");
  };

  return (
    <FirebaseProvider>
      <div
        className={`min-h-screen transition-colors duration-200 ${
          theme === "cyber"
            ? "bg-[#060c18] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
            : theme === "light"
            ? "bg-slate-100 text-slate-900 selection:bg-indigo-500/20"
            : "bg-[#090d16] text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200"
        }`}
      >
        {/* Offline Alert Strip if network drops */}
        {isOffline && (
          <div className="bg-amber-600/90 text-white text-xs px-4 py-1.5 text-center font-medium flex items-center justify-center gap-2 shadow-sm">
            <span>⚠️ Çevrimdışı Çalışma Modu: Ağ bağlantısı kesildi. Tüm modül ve mimari düzenlemeleriniz yerel tarayıcı belleğinde güvenle saklanmaktadır.</span>
          </div>
        )}

        {/* Navigation Header */}
        <Header
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          project={project}
          setProject={setProject}
          locale={locale}
          setLocale={setLocale}
          theme={theme}
          setTheme={setTheme}
          isOffline={isOffline}
          onQuickBuild={handleQuickBuild}
          isBuilding={isBuilding}
        />

        {/* Main Tab Content Display */}
        <main className="pb-16 md:pb-8">
          {currentTab === "canvas" && (
            <ModuleCanvas
              project={project}
              setProject={setProject}
              onGoToCode={() => setCurrentTab("code")}
              onGoToBuild={() => setCurrentTab("build")}
            />
          )}

          {currentTab === "build" && (
            <BuildEngine
              project={project}
              setProject={setProject}
              isBuilding={isBuilding}
              setIsBuilding={setIsBuilding}
              lastBuild={lastBuild}
              setLastBuild={setLastBuild}
            />
          )}

          {currentTab === "github" && (
            <GitHubHybridHub project={project} />
          )}

          {currentTab === "code" && (
            <CodeSynthesizer
              project={project}
              setProject={setProject}
              onBuild={() => setCurrentTab("build")}
            />
          )}

          {currentTab === "firebase" && (
            <FirebaseStudio
              currentProject={project}
              onLoadProject={(cfg) => setProject((prev) => ({ ...prev, ...cfg }))}
            />
          )}

          {currentTab === "debian" && <LinuxContainerStudio />}

          {currentTab === "mcp" && <McpHub />}

          {currentTab === "termux" && <TermuxTerminal />}

          {currentTab === "browser" && <BrowserDataEngine />}

          {currentTab === "automations" && <AutomationsStudio />}

          {currentTab === "public_apis" && <UnifiedPublicApiHub />}

          {currentTab === "agent_plugin" && <AgentPluginHub />}

          {currentTab === "settings" && <AdvancedSettingsHub project={project} setProject={setProject} />}

          {currentTab === "control_center" && <DeveloperControlCenter />}

          {currentTab === "database" && <DatabaseStudio />}

          {currentTab === "preview" && <DeviceSimulator project={project} />}

          {currentTab === "asset" && (
            <AiAssetStudio project={project} setProject={setProject} />
          )}

          {currentTab === "chat" && (
            <GeminiChatbot onNavigateTab={(tab) => setCurrentTab(tab)} />
          )}

          {currentTab === "project" && <ProjectManagement project={project} />}

          {currentTab === "team" && <TeamChat />}

          {currentTab === "api" && <RemoteApiPanel project={project} />}

          {currentTab === "docs" && <DocumentationView />}
        </main>
      </div>
    </FirebaseProvider>
  );
}
