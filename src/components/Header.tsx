import React from "react";
import {
  Boxes,
  Cpu,
  Code2,
  Smartphone,
  Sparkles,
  MessageSquare,
  Kanban,
  Users,
  Terminal,
  BookOpen,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  Globe,
  Database,
  Server,
  Bot,
  Play,
  Download,
  ShieldCheck,
  Cloud,
  FolderGit2,
  Zap,
  Share2,
  Sliders,
  Activity,
  Layers,
} from "lucide-react";
import { PWAInstallButton } from "./PWAInstallButton";
import { ProjectConfig } from "../types";
import { Locale, TRANSLATIONS } from "../data/translations";

interface HeaderProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  project: ProjectConfig;
  setProject: React.Dispatch<React.SetStateAction<ProjectConfig>>;
  locale: Locale;
  setLocale: (loc: Locale) => void;
  theme: "dark" | "cyber" | "light";
  setTheme: (t: "dark" | "cyber" | "light") => void;
  isOffline: boolean;
  onQuickBuild: () => void;
  isBuilding: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  project,
  locale,
  setLocale,
  theme,
  setTheme,
  isOffline,
  onQuickBuild,
  isBuilding,
}) => {
  const t = TRANSLATIONS[locale] || TRANSLATIONS.tr;

  const navItems = [
    { id: "overview", label: "Master Dashboard", icon: Layers, badge: "Hub" },
    { id: "canvas", label: t.navCanvas, icon: Boxes },
    { id: "build", label: t.navBuild, icon: Cpu, badge: "APK/AAB" },
    { id: "github", label: "GitHub & Hibrit Derleme", icon: FolderGit2, badge: "CI/CD" },
    { id: "code", label: t.navCode, icon: Code2 },
    { id: "firebase", label: t.navFirebase || "Firebase & Bulut", icon: Cloud, badge: "Firestore" },
    { id: "debian", label: "Linux OS (Debian/Ubuntu)", icon: Server, badge: "İkili OS" },
    { id: "mcp", label: t.navMcp || "MCP & AI Hub", icon: Bot, badge: "Claude/Cursor" },
    { id: "termux", label: t.navTermux || "Termux Shell", icon: Terminal, badge: "Linux" },
    { id: "browser", label: t.navBrowser || "Tarayıcı & Veri", icon: Globe, badge: "Ajan" },
    { id: "automations", label: "Otomasyonlar", icon: Zap, badge: "Hub" },
    { id: "public_apis", label: "Unified Public APIs", icon: Share2, badge: "Gateway" },
    { id: "agent_plugin", label: "Agent Plugin API", icon: Cpu, badge: "Eklenti" },
    { id: "settings", label: "Gelişmiş Ayarlar", icon: Sliders, badge: "Master" },
    { id: "control_center", label: "Kontrol Paneli", icon: Activity, badge: "Daemon" },
    { id: "database", label: t.navDatabase || "Dahili Veritabanı", icon: Database },
    { id: "preview", label: t.navPreview, icon: Smartphone },
    { id: "asset", label: t.navAsset, icon: Sparkles, highlight: true },
    { id: "chat", label: t.navChat, icon: MessageSquare },
    { id: "project", label: t.navProject, icon: Kanban },
    { id: "team", label: t.navTeam, icon: Users },
    { id: "api", label: t.navApi, icon: Terminal },
    { id: "docs", label: t.navDocs, icon: BookOpen },
  ];

  return (
    <header className="border-b border-slate-800 bg-[#0d1322]/95 backdrop-blur-md sticky top-0 z-50 transition-colors">
      {/* Top Banner & Project Metadata */}
      <div className="px-4 py-2 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-bold text-base tracking-tight text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-emerald-400 p-[2px] shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0b0f19] rounded-[6px] flex items-center justify-center text-cyan-400 font-black text-sm">
                DC
              </div>
            </div>
            <span>DroidCraft <span className="text-cyan-400 font-mono text-xs px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/50">Cloud OS</span></span>
          </div>

          <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-800 text-slate-400">
            <span className="text-slate-500 font-mono">{project.packageName}</span>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
              v{project.versionName} ({project.versionCode})
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 font-mono text-[11px] flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> API {project.targetSdk} (Android 15)
            </span>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-2.5">
          {/* PWA In-App Install Prompt */}
          <PWAInstallButton />

          {/* Offline/Online status badge */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${
              isOffline
                ? "bg-amber-950/50 text-amber-300 border-amber-800/50"
                : "bg-emerald-950/50 text-emerald-300 border-emerald-800/40"
            }`}
            title={isOffline ? t.offlineNotice : t.onlineNotice}
          >
            {isOffline ? <WifiOff className="w-3 h-3 text-amber-400 animate-pulse" /> : <Wifi className="w-3 h-3 text-emerald-400" />}
            <span className="hidden sm:inline">{isOffline ? "Çevrimdışı (Yerel)" : "Bulut Senkron"}</span>
          </div>

          {/* Language selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <Globe className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as Locale)}
              className="bg-transparent text-slate-300 text-xs px-1 py-0.5 outline-none cursor-pointer"
            >
              <option value="tr" className="bg-slate-900 text-white">TR (Türkçe)</option>
              <option value="en" className="bg-slate-900 text-white">EN (English)</option>
              <option value="de" className="bg-slate-900 text-white">DE (Deutsch)</option>
              <option value="es" className="bg-slate-900 text-white">ES (Español)</option>
            </select>
          </div>

          {/* Theme Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setTheme(theme === "dark" ? "cyber" : theme === "cyber" ? "light" : "dark")}
              className="p-1 hover:text-cyan-400 text-slate-300 transition-colors"
              title="Tema Değiştir"
            >
              {theme === "light" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
          </div>

          {/* Quick Build Action CTA Button */}
          <button
            onClick={onQuickBuild}
            disabled={isBuilding}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-md transition-all ${
              isBuilding
                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 hover:shadow-cyan-500/40 active:scale-95"
            }`}
          >
            {isBuilding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{t.buildingStatus}</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{t.quickBuild}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Tabs Navigation Bar */}
      <nav className="px-3 flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex items-center gap-1.5 py-2.5 px-3 text-xs font-medium whitespace-nowrap border-b-2 transition-all relative ${
                isActive
                  ? "border-cyan-400 text-cyan-300 bg-cyan-950/20 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className="ml-0.5 px-1 py-0.2 rounded text-[10px] font-mono bg-indigo-900/60 text-indigo-300 border border-indigo-700/50">
                  {item.badge}
                </span>
              )}
              {item.highlight && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
