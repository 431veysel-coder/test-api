/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Globe,
  ArrowLeft,
  RotateCw,
  Search,
  Lock,
  Download,
  Database,
  ExternalLink,
  Monitor,
  Code2,
  Check,
  Sparkles,
  Layers,
  MousePointer,
  Play,
  Bot,
  Zap,
  Trash2,
  HardDrive,
  Cloud,
  CheckCircle2,
  Compass,
  Sliders,
  Shield,
  Eye,
  Terminal,
} from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";

interface VaultItem {
  id: string;
  url: string;
  title: string;
  snippet: string;
  selector: string;
  tag: string;
  agentMission: string;
  timestamp: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export const BrowserDataEngine: React.FC = () => {
  const { user, addNote } = useFirebase();

  // Navigation & View
  const [mainTab, setMainTab] = useState<"live_render" | "search_portal" | "ai_agent" | "vault">("live_render");
  const [browserEngine, setBrowserEngine] = useState<"firefox" | "chromium">("firefox");
  const [urlInput, setUrlInput] = useState<string>("https://developer.android.com/about/versions/15");
  const [currentUrl, setCurrentUrl] = useState<string>("https://developer.android.com/about/versions/15");
  const [iframeSrc, setIframeSrc] = useState<string>(
    "/api/browser/render-page?url=" + encodeURIComponent("https://developer.android.com/about/versions/15") + "&engine=firefox"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Search Engine State
  const [searchQuery, setSearchQuery] = useState<string>("Android 15 NDK 16KB Page Alignment");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Extracted Data Vault State
  const [vaultItems, setVaultItems] = useState<VaultItem[]>([]);
  const [vaultSearch, setVaultSearch] = useState<string>("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  // Live Visual AI Agent Cursor State
  const [agentRunning, setAgentRunning] = useState<boolean>(false);
  const [agentCursor, setAgentCursor] = useState<{
    x: number;
    y: number;
    visible: boolean;
    clicking: boolean;
    action: string;
    label: string;
    typingText: string;
  }>({
    x: 100,
    y: 80,
    visible: false,
    clicking: false,
    action: "IDLE",
    label: "AI Agent",
    typingText: "",
  });
  const [agentLogs, setAgentLogs] = useState<{ step: number; log: string; time: string }[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>(
    "Android 15 NDK 16KB Sayfa Hizalama Dokümanını Araştır ve Kod Örneklerini Çıkar"
  );

  const iframeRef = useRef<HTMLIFrameElement>(null);

  const fetchVault = async () => {
    try {
      const res = await fetch("/api/browser/vault");
      const data = await res.json();
      if (data.items) {
        setVaultItems(data.items);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchVault();

    // Listen for extracted DOM messages from inside iframe
    const handleWindowMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "DROIDCRAFT_EXTRACT_DOM") {
        saveToVault({
          title: event.data.title || "Canlı Web Sayfası",
          url: event.data.url || currentUrl,
          snippet: "Iframe üzerinden taranarak kaydedildi.",
          selector: "body",
          tag: "Live Page Extraction",
        });
      }
    };

    window.addEventListener("message", handleWindowMessage);
    return () => window.removeEventListener("message", handleWindowMessage);
  }, [currentUrl]);

  const handleNavigate = (destUrl?: string) => {
    let dest = destUrl || urlInput;
    if (!dest.trim()) return;

    if (!dest.startsWith("http://") && !dest.startsWith("https://")) {
      dest = "https://" + dest;
    }

    setIsLoading(true);
    setSaveSuccessMessage(null);
    setCurrentUrl(dest);
    setUrlInput(dest);
    setIframeSrc(`/api/browser/render-page?url=${encodeURIComponent(dest)}&engine=${browserEngine}`);
    setMainTab("live_render");

    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };

  const handleSearch = async (queryToRun?: string) => {
    const q = queryToRun || searchQuery;
    if (!q.trim()) return;

    setIsSearching(true);
    try {
      const res = await fetch(`/api/browser/search?q=${encodeURIComponent(q)}&engine=${browserEngine}`);
      const data = await res.json();
      if (data && Array.isArray(data.results)) {
        setSearchResults(data.results);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  // Perform initial search on mount
  useEffect(() => {
    handleSearch("Android 15 NDK 16KB Page Alignment");
  }, []);

  const saveToVault = async (itemData: {
    title: string;
    url: string;
    snippet: string;
    selector?: string;
    tag?: string;
  }) => {
    try {
      const res = await fetch("/api/browser/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: itemData.title,
          url: itemData.url,
          snippet: itemData.snippet,
          selector: itemData.selector || "body",
          tag: itemData.tag || "Web Vault",
          agentMission: "Kullanıcı / Ajan Doğrudan Çekimi",
        }),
      });
      const data = await res.json();
      if (data.item) {
        setVaultItems((prev) => [data.item, ...prev]);
        setSaveSuccessMessage(`'${itemData.title.slice(0, 35)}...' başarıyla Veri Deposuna kaydedildi!`);
        setTimeout(() => setSaveSuccessMessage(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Save Vault Item into Firebase Notes
  const handleSaveToFirebase = async (item: VaultItem) => {
    try {
      await addNote({
        title: `[Web Verisi] ${item.title}`,
        category: "general",
        content: `Kaynak: ${item.url}\nEtiket: ${item.tag}\n\nİçerik:\n${item.snippet}`,
        tags: ["web-vault", item.tag.toLowerCase(), "research"],
      });
      setSaveSuccessMessage("Veri başarıyla Firebase Firestore 'Öğrenilenler / Notlar' veritabanına aktarıldı!");
      setTimeout(() => setSaveSuccessMessage(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  // Run Visual AI Agent Autonomous Mission
  const startAutonomousAgentBrowsing = async () => {
    if (agentRunning) return;
    setAgentRunning(true);
    setAgentLogs([]);
    setSaveSuccessMessage(null);
    setMainTab("ai_agent");

    try {
      const res = await fetch("/api/browser/agent-run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mission: selectedMission,
          targetUrl: currentUrl,
        }),
      });
      const data = await res.json();

      if (data && data.steps) {
        for (let i = 0; i < data.steps.length; i++) {
          const step = data.steps[i];
          const now = new Date().toLocaleTimeString();

          setAgentCursor({
            x: step.cursor.x,
            y: step.cursor.y,
            visible: true,
            clicking: step.action === "CLICK",
            action: step.action,
            label: "AI Agent",
            typingText: step.action === "TYPE_TEXT" ? step.text || "" : "",
          });

          setAgentLogs((prev) => [...prev, { step: step.step, log: step.log, time: now }]);
          await new Promise((resolve) => setTimeout(resolve, 800));
        }

        if (data.harvestedItem) {
          setVaultItems((prev) => [data.harvestedItem, ...prev]);
          setSaveSuccessMessage(`Yapay zeka görevi tamamlandı! '${data.harvestedItem.title}' depoya eklendi.`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTimeout(() => {
        setAgentCursor((prev) => ({ ...prev, clicking: false, action: "COMPLETED" }));
        setAgentRunning(false);
      }, 500);
    }
  };

  const filteredVault = vaultItems.filter(
    (v) =>
      v.title.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      v.snippet.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      v.tag.toLowerCase().includes(vaultSearch.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Engine Controller */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Dahili Web Tarayıcı & Canlı Proxy Gezinti Motoru
              </h2>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono border ${
                  browserEngine === "firefox"
                    ? "bg-orange-950/60 border-orange-700/50 text-orange-300"
                    : "bg-cyan-950/60 border-cyan-700/50 text-cyan-300"
                }`}
              >
                {browserEngine === "firefox" ? "🦊 Mozilla Firefox (Gecko 132)" : "🌐 Chromium V8 Engine"}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Gerçek web sitelerini canlı HTML/CSS olarak görüntüleyin, Google'da arama yapın, yapay zeka imlecini izleyin ve teknik verileri depolayın.
            </p>
          </div>
        </div>

        {/* Browser Engine Toggle & Main View Switcher */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Dual Engine Switcher */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => {
                setBrowserEngine("firefox");
                setIframeSrc(`/api/browser/render-page?url=${encodeURIComponent(currentUrl)}&engine=firefox`);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                browserEngine === "firefox"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mozilla Firefox Bağımsız Gecko Motoru (Gizlilik Odaklı & Katı İzleme Koruması)"
            >
              <span>🦊 Firefox Gecko</span>
            </button>
            <button
              onClick={() => {
                setBrowserEngine("chromium");
                setIframeSrc(`/api/browser/render-page?url=${encodeURIComponent(currentUrl)}&engine=chromium`);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                browserEngine === "chromium"
                  ? "bg-cyan-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Chromium / V8 Yüksek Hızlı Android WebView Motoru"
            >
              <span>🌐 Chromium V8</span>
            </button>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setMainTab("live_render")}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                mainTab === "live_render"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Canlı Sayfa</span>
            </button>

            <button
              onClick={() => setMainTab("search_portal")}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                mainTab === "search_portal"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Google Arama</span>
            </button>

            <button
              onClick={() => setMainTab("ai_agent")}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                mainTab === "ai_agent"
                  ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI İmleç</span>
            </button>

            <button
              onClick={() => setMainTab("vault")}
              className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                mainTab === "vault"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <HardDrive className="w-3.5 h-3.5" />
              <span>Veri Deposu ({vaultItems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {saveSuccessMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{saveSuccessMessage}</span>
        </div>
      )}

      {/* Browser Address & Controls Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2.5 flex items-center gap-2 shadow-lg">
        <button
          onClick={() => handleNavigate("https://developer.android.com/about/versions/15")}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Ana Sayfaya Dön"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleNavigate(currentUrl)}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          title="Yenile"
        >
          <RotateCw className={`w-4 h-4 ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
        </button>

        {/* Quick presets */}
        <div className="hidden md:flex items-center gap-1 text-[11px] font-mono">
          <button
            onClick={() => handleNavigate("https://developer.android.com/about/versions/15")}
            className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            Android 15
          </button>
          <button
            onClick={() => handleNavigate("https://developer.android.com/jetpack/compose")}
            className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            Compose
          </button>
          <button
            onClick={() => handleNavigate("https://github.com/android")}
            className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800"
          >
            GitHub
          </button>
        </div>

        <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
            placeholder="URL girin (örn. developer.android.com veya google.com)..."
            className="flex-1 bg-transparent text-slate-200 focus:outline-none font-mono"
          />
        </div>

        <button
          onClick={() => handleNavigate()}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
        >
          Sayfayı Aç
        </button>
      </div>

      {/* VIEW TAB 1: LIVE WEBPAGE PROXY (REAL HTML / CSS / DOM) */}
      {mainTab === "live_render" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs px-2 text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Canlı Sayfa Görüntüleyici Aktif:</span>
              <span className="text-slate-200 font-mono truncate max-w-md">{currentUrl}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  saveToVault({
                    title: `Canlı URL: ${currentUrl}`,
                    url: currentUrl,
                    snippet: "Kullanıcı tarafından canlı proxy sayfasından kaydedildi.",
                    tag: "Manual Page",
                  })
                }
                className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800/50 text-cyan-300 font-bold flex items-center gap-1"
              >
                <Database className="w-3.5 h-3.5" />
                <span>Sayfayı Kasaya Kaydet</span>
              </button>
              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Yeni Sekmede Aç</span>
              </a>
            </div>
          </div>

          {/* The Real Interactive IFrame Browser Viewport */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[620px] h-[720px]">
            {isLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs font-mono text-cyan-300">
                  {browserEngine === "firefox" ? "Mozilla Firefox Gecko" : "Chromium V8"} Motoru Sayfayı Yüklüyor...
                </span>
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={iframeSrc}
              className="w-full h-full border-0 bg-white"
              title="DroidCraft Live Web Viewport"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>
      )}

      {/* VIEW TAB 2: GOOGLE & LIVE WEB SEARCH PORTAL */}
      {mainTab === "search_portal" && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Google & Açık Ağ Arama Portalı</h3>
                <p className="text-xs text-slate-400">
                  Android 15, Gradle, Kotlin, NDK veya genel web konularında canlı arama yapın ve sonuçları tek tıkla canlı tarayıcıda açın.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Aramak istediğiniz terimi yazın (örn. Android 15 16KB NDK r27c)..."
                  className="flex-1 bg-transparent text-slate-100 focus:outline-none"
                />
              </div>
              <button
                onClick={() => handleSearch()}
                disabled={isSearching}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-600 hover:from-indigo-400 hover:to-cyan-500 text-white font-bold text-xs shadow-md transition-all shrink-0"
              >
                {isSearching ? "Aranıyor..." : "Google'da Ara"}
              </button>
            </div>

            {/* Quick search chips */}
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-slate-500 text-[11px]">Hızlı Aramalar:</span>
              {[
                "Android 15 NDK 16KB Page Alignment",
                "Jetpack Compose 1.7 Performance",
                "Gradle 8.7 Android Gradle Plugin",
                "Termux Proot Debian aarch64",
                "ProGuard R8 rules Android 15",
              ].map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setSearchQuery(chip);
                    handleSearch(chip);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 text-[11px] transition-colors"
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>

          {/* Search Results List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span>Arama Sonuçları ({searchResults.length} Sonuç):</span>
              <span className="font-mono text-cyan-400">Motor: {browserEngine.toUpperCase()}</span>
            </div>

            {searchResults.map((result, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                      {result.source}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1 hover:text-cyan-400 transition-colors">
                      {result.title}
                    </h4>
                    <span className="text-xs text-cyan-500 font-mono break-all">{result.url}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleNavigate(result.url)}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1"
                    >
                      <Monitor className="w-3.5 h-3.5" />
                      <span>Sayfayı Aç</span>
                    </button>
                    <button
                      onClick={() =>
                        saveToVault({
                          title: result.title,
                          url: result.url,
                          snippet: result.snippet,
                          tag: result.source,
                        })
                      }
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="Kasaya Ekle"
                    >
                      <Database className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{result.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW TAB 3: VISUAL AI AGENT CURSOR SIMULATOR */}
      {mainTab === "ai_agent" && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/30 shadow-lg space-y-3">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400 animate-pulse" />
                <span className="text-xs font-bold text-white">Yapay Zeka Görsel Tarama Ajanı (Visual AI Agent):</span>
              </div>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedMission}
                  onChange={(e) => setSelectedMission(e.target.value)}
                  disabled={agentRunning}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 max-w-md truncate"
                >
                  <option value="Android 15 NDK 16KB Sayfa Hizalama Dokümanını Araştır ve Kod Örneklerini Çıkar">
                    Android 15 NDK 16KB Sayfa Hizalamasını Araştır
                  </option>
                  <option value="Jetpack Compose 1.7 Yeni Bileşenlerini ve Performans Kurallarını Çıkar">
                    Jetpack Compose 1.7 Performans Kurallarını Çıkar
                  </option>
                  <option value="GitHub Termux Kaynak Kodunu ve Buildozer Kütüphanelerini İncele">
                    GitHub Termux Kaynak Kodunu İncele
                  </option>
                </select>

                <button
                  onClick={startAutonomousAgentBrowsing}
                  disabled={agentRunning}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 ${
                    agentRunning
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white shadow-md shadow-purple-500/20 active:scale-95"
                  }`}
                >
                  {agentRunning ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>{agentRunning ? "Ajan Geziniyor..." : "Ajanı Canlı Başlat"}</span>
                </button>
              </div>
            </div>

            {/* Live Agent Activity Timeline */}
            {agentLogs.length > 0 && (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono space-y-1">
                <span className="text-purple-400 font-bold block">Canlı Ajan Hareket İzi:</span>
                <div className="max-h-24 overflow-y-auto space-y-0.5 text-slate-300">
                  {agentLogs.map((log) => (
                    <div key={log.step} className="flex items-center gap-2">
                      <span className="text-slate-500">[{log.time}]</span>
                      <span className="text-indigo-400">Adım {log.step}:</span>
                      <span>{log.log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Interactive Agent Virtual Canvas */}
          <div className="relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl min-h-[500px] p-6 space-y-6">
            {/* Virtual AI Mouse Cursor Overlay */}
            {agentCursor.visible && (
              <div
                style={{
                  transform: `translate(${agentCursor.x}px, ${agentCursor.y}px)`,
                  transition: "transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)",
                }}
                className="absolute pointer-events-none z-50 flex items-start gap-1"
              >
                <div className="relative">
                  <MousePointer className="w-5 h-5 text-purple-400 fill-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                  {agentCursor.clicking && (
                    <span className="absolute -inset-2 rounded-full border-2 border-purple-300 animate-ping" />
                  )}
                </div>
                <div className="bg-purple-950/90 border border-purple-500/60 rounded-md px-1.5 py-0.5 text-[10px] font-mono text-purple-300 shadow-lg whitespace-nowrap">
                  {agentCursor.label} • {agentCursor.action}
                </div>
              </div>
            )}

            <div className="border-b border-slate-800 pb-4 space-y-2">
              <span className="text-[11px] font-mono text-purple-400 bg-purple-950/50 px-2 py-0.5 rounded border border-purple-800/40">
                Ajan Simülasyon Sahası ({browserEngine.toUpperCase()})
              </span>
              <h1 className="text-lg md:text-xl font-bold text-white tracking-tight">
                Android 15 NDK & Modül Mimarisi Araştırma Alanı
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed">
                Yapay zeka modelleri sitelere girdiğinde mouse koordinatları, form yazı yazma eylemleri ve tıklamaları bu tuvalde görselleşir.
              </p>
            </div>

            {/* Simulated in-page search input (targeted by AI cursor) */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-1 text-xs">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-purple-300">
                  {agentCursor.typingText || "Yapay zeka arama hedefi (#search-box)..."}
                </span>
              </div>
              <button className="px-3 py-1 rounded-lg bg-purple-600 text-white font-bold text-[11px]">
                Ajan Ara
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-cyan-400">16KB Sayfa Hizalama Analizi</span>
                <p className="text-xs text-slate-300 font-mono">
                  NDK derleyicisinde -Wl,-z,max-page-size=16384 bayrağı zorunludur. Android 15 cihazlarında ELF yüklemesi bu olmadan çöker.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-xs font-bold text-emerald-400">AGP 8.7 & Gradle Daemon</span>
                <p className="text-xs text-slate-300 font-mono">
                  Kotlin 2.0 K2 compiler varsayılan olarak devrededir. R8 karartma kuralları %30 daha hızlı yürütülür.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW TAB 4: EXTRACTED DATA VAULT REPOSITORY */}
      {mainTab === "vault" && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm md:text-base">
                  Ayıklanan Veri Kasası (Extracted Data Vault)
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Web sayfalarından, Google aramalarından ve yapay zeka ajanlarından toplanan tüm teknik veriler bu depoda saklanır.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={vaultSearch}
                  onChange={(e) => setVaultSearch(e.target.value)}
                  placeholder="Depoda ara..."
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-48"
                />
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/40">
                {filteredVault.length} Kayıt
              </span>
            </div>
          </div>

          {filteredVault.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
              <HardDrive className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-400">Veri Kasasında kayıt bulunamadı</p>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Tarayıcı görünümünden veya arama portalından teknik bilgileri tek tıkla depoya ekleyebilirsiniz.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredVault.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        {item.tag}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1.5 leading-snug">{item.title}</h4>
                      <span className="text-[11px] text-slate-400 font-mono break-all block mt-0.5">
                        {item.url}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleSaveToFirebase(item)}
                        className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800/40 transition-colors"
                        title="Firebase Firestore Notlarına Aktar"
                      >
                        <Cloud className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                    {item.snippet}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                    <span>Görev: {item.agentMission}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
