/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Boxes,
  Cpu,
  Code2,
  Cloud,
  Server,
  Bot,
  Terminal,
  Globe,
  Zap,
  Share2,
  Database,
  Smartphone,
  Sparkles,
  MessageSquare,
  Kanban,
  Users,
  BookOpen,
  Search,
  Command,
  ChevronRight,
  Layers,
  ShieldCheck,
  FolderGit2,
  ExternalLink,
  CheckCircle2,
  Sliders,
  Activity,
  Compass,
} from "lucide-react";
import { ProjectConfig } from "../types";
import { Locale, TRANSLATIONS } from "../data/translations";

interface MasterNavigationHubProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  project: ProjectConfig;
  locale: Locale;
  setLocale: (loc: Locale) => void;
  theme: "dark" | "cyber" | "light";
  setTheme: (t: "dark" | "cyber" | "light") => void;
  isOffline: boolean;
  onQuickBuild: () => void;
  isBuilding: boolean;
}

export const MasterNavigationHub: React.FC<MasterNavigationHubProps> = ({
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
  const [activeCategory, setActiveCategory] = useState<"all" | "core" | "cloud_ai" | "devops" | "workspace">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { id: "all", label: "Tüm Modüller & Akışlar" },
    { id: "core", label: "🏗️ Mimari & Modül Sentezleyici" },
    { id: "cloud_ai", label: "🤖 Yapay Zeka, Tarayıcı & API Hub" },
    { id: "devops", label: "⚡ Derleme, GitHub & Linux OS" },
    { id: "workspace", label: "👥 Proje, Takım & Veritabanı" },
  ];

  const modulesMap = [
    {
      id: "canvas",
      title: "Modül Canvas & Mimar",
      desc: "Sürükle-bırak mantığıyla Android modülleri ekleme, Room SQLite, CameraX ve biyometrik auth yapılandırması.",
      icon: Boxes,
      category: "core",
      badge: "Sürükle Bırak",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      id: "build",
      title: "APK / AAB Derleme Motoru",
      desc: "Android 15 (API 35) standardında Gradle 8.7 derlemesi, R8 bytecode karartması ve imzalama yöneticisi.",
      icon: Cpu,
      category: "devops",
      badge: "APK 11.2MB",
      color: "from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30",
    },
    {
      id: "github",
      title: "GitHub & Hibrit Derleme",
      desc: "Depo bağlama, şube yönetimi, otomatik .github/workflows/android-build.yml üretimi ve hibrit CI/CD tetikleyici.",
      icon: FolderGit2,
      category: "devops",
      badge: "CI/CD",
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
    {
      id: "code",
      title: "Kod Sentezleyici & Editor",
      desc: "Kotlin 2.0, Jetpack Compose ve C++ NDK 16KB bellek hizalama kurallarına uygun gerçek zamanlı kod üretimi.",
      icon: Code2,
      category: "core",
      badge: "Kotlin / C++",
      color: "from-blue-500/20 to-emerald-500/20 text-blue-400 border-blue-500/30",
    },
    {
      id: "firebase",
      title: "Firebase Firestore & Bulut",
      desc: "Çoklu rol (RBAC), güvenlik kuralları, canlı notlar, projeler, dependency ve önbellek yönetimi.",
      icon: Cloud,
      category: "workspace",
      badge: "Enterprise",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      id: "debian",
      title: "Linux OS (Debian 12 & Ubuntu 24.04)",
      desc: "Karşılıklı dışlama (Mutual Exclusion) mimarisiyle çalışan, sıfır RAM sızıntılı Proot konteyner stüdyosu.",
      icon: Server,
      category: "devops",
      badge: "İkili OS",
      color: "from-emerald-500/20 to-cyan-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      id: "mcp",
      title: "MCP & AI Hub (JSON-RPC)",
      desc: "Claude ve Cursor ajanlarının doğrudan bağlanıp sistem metriklerini okuduğu ve araç çalıştırdığı JSON-RPC protokolü.",
      icon: Bot,
      category: "cloud_ai",
      badge: "JSON-RPC",
      color: "from-indigo-500/20 to-violet-500/20 text-indigo-300 border-indigo-500/30",
    },
    {
      id: "termux",
      title: "Termux Linux Shell",
      desc: "Gerçek cihaz üstü bash terminali, apt paket yöneticisi, htop ve derleme denetçisi.",
      icon: Terminal,
      category: "devops",
      badge: "Bash",
      color: "from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30",
    },
    {
      id: "browser",
      title: "Tarayıcı & Görsel Yapay Zeka Ajanı",
      desc: "Firefox Gecko vs Chromium V8 motorları, canlı sayfa render proxy, arama portalı ve AI görsel imleç takibi.",
      icon: Globe,
      category: "cloud_ai",
      badge: "Çift Motor",
      color: "from-cyan-500/20 to-teal-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      id: "automations",
      title: "Otomasyonlar Hub (Tarayıcı & Terminal)",
      desc: "Headless tarayıcı görevleri ve zamanlanmış (cron) terminal bash betikleri otonom yürütme merkezi.",
      icon: Zap,
      category: "cloud_ai",
      badge: "Otonom",
      color: "from-amber-500/20 to-yellow-500/20 text-amber-300 border-amber-500/30",
    },
    {
      id: "public_apis",
      title: "Unified Public APIs Gateway",
      desc: "50+ halka açık API (CoinGecko, Hava Durumu, NASA, GitHub vb.) tek geçit üzerinden yönlendirme ve anahtar kasası.",
      icon: Share2,
      category: "cloud_ai",
      badge: "Gateway",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30",
    },
    {
      id: "agent_plugin",
      title: "Agent Plugin API",
      desc: "Claude, ChatGPT ve Cursor için doğrudan terminal, tarayıcı ve build motoru çağırma REST eklentisi.",
      icon: Compass,
      category: "cloud_ai",
      badge: "Eklenti",
      color: "from-purple-500/20 to-indigo-500/20 text-purple-300 border-purple-500/30",
    },
    {
      id: "database",
      title: "Dahili SQLite Veritabanı Stüdyosu",
      desc: "Tablo sorgulama, satır ekleme, şema analizi ve JSON/CSV dışa aktarım yöneticisi.",
      icon: Database,
      category: "workspace",
      badge: "SQLite",
      color: "from-emerald-500/20 to-green-500/20 text-emerald-300 border-emerald-500/30",
    },
    {
      id: "preview",
      title: "Cihaz Simülatörü",
      desc: "Google Pixel 9 Pro ve Samsung Galaxy S24 Ultra kabuklarında canlı önizleme ve ekran görüntüsü alma.",
      icon: Smartphone,
      category: "core",
      badge: "Simülatör",
      color: "from-teal-500/20 to-cyan-500/20 text-teal-300 border-teal-500/30",
    },
    {
      id: "asset",
      title: "AI Görsel & Asset Stüdyosu",
      desc: "Gemini 3 Pro görsel modeli ile launcher icon, splash screen ve hero banner tasarımı.",
      icon: Sparkles,
      category: "core",
      badge: "Gemini AI",
      color: "from-pink-500/20 to-rose-500/20 text-pink-300 border-pink-500/30",
    },
    {
      id: "chat",
      title: "Çok Sağlayıcılı AI Asistanı",
      desc: "Google Gemini, Claude 3.5 Sonnet, OpenAI GPT-4o, DeepSeek V3 ve yerel Ollama model switcher.",
      icon: MessageSquare,
      category: "workspace",
      badge: "Multi-Model",
      color: "from-indigo-500/20 to-cyan-500/20 text-indigo-300 border-indigo-500/30",
    },
    {
      id: "project",
      title: "Kanban & Sürüm Takibi",
      desc: "Görev panosu, sprint önceliklendirme ve zaman yönetimi araçları.",
      icon: Kanban,
      category: "workspace",
      badge: "Agile",
      color: "from-orange-500/20 to-amber-500/20 text-orange-300 border-orange-500/30",
    },
    {
      id: "team",
      title: "Ekip İçi Anlık Mesajlaşma",
      desc: "Mobil mühendisler, DevOps ve Güvenlik uzmanları arası gerçek zamanlı dosya ve log paylaşımı.",
      icon: Users,
      category: "workspace",
      badge: "Chat",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-300 border-cyan-500/30",
    },
    {
      id: "docs",
      title: "Kapsamlı Eğitim & Destek Dokümantasyonu",
      desc: "Android 15 kılavuzları, API referansları ve mimari şemalar.",
      icon: BookOpen,
      category: "workspace",
      badge: "Wiki",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30",
    },
  ];

  const filteredModules = modulesMap.filter((mod) => {
    const matchesCat = activeCategory === "all" || mod.category === activeCategory;
    const matchesSearch =
      mod.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.badge.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search & Category Filter Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-2 flex-1 max-w-lg bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Modül, araç veya sistem ara (örn. APK, Firebase, Terminal, API)..."
            className="flex-1 bg-transparent text-slate-100 focus:outline-none"
          />
        </div>

        {/* Categories Tab */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as any)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold"
                  : "bg-slate-950 text-slate-400 hover:text-white border border-slate-800/80"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interlinked Modules Grid (Professional Obsidian / VS Code Theme Style) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredModules.map((mod) => {
          const Icon = mod.icon;
          const isActive = currentTab === mod.id;
          return (
            <div
              key={mod.id}
              onClick={() => setCurrentTab(mod.id)}
              className={`group p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between shadow-lg relative overflow-hidden ${
                isActive
                  ? "bg-slate-900/90 border-cyan-500 shadow-cyan-500/10 ring-1 ring-cyan-500/30"
                  : "bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80"
              }`}
            >
              {/* Glow Accent */}
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full bg-cyan-500/5 blur-2xl pointer-events-none group-hover:bg-cyan-500/10 transition-colors" />

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 bg-gradient-to-tr ${mod.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-300 border border-slate-800">
                    {mod.badge}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors flex items-center justify-between">
                    <span>{mod.title}</span>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{mod.desc}</p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-500">Kategori: {mod.category.toUpperCase()}</span>
                <span className={isActive ? "text-cyan-400 font-bold" : "text-slate-400 group-hover:text-slate-200"}>
                  {isActive ? "Aktif Görünüm →" : "Aç →"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
