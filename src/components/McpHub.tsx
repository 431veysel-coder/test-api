import React, { useState } from "react";
import {
  Cpu,
  Bot,
  Terminal,
  Play,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  Zap,
  CheckCircle2,
  Layers,
  Database,
  Globe,
  Code2,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

interface McpTool {
  name: string;
  description: string;
  inputSchema: any;
}

export const McpHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"tools" | "agent" | "config">("tools");
  const [selectedTool, setSelectedTool] = useState<string>("build_apk_bundle");
  const [toolParams, setToolParams] = useState<string>(
    JSON.stringify(
      {
        projectName: "MyApp",
        packageName: "com.droidcraft.app",
        versionName: "1.0.0",
        language: "kotlin",
        buildType: "release_apk",
        modules: ["camerax_pro", "room_sqlite"],
        minify: true,
      },
      null,
      2
    )
  );
  const [toolResult, setToolResult] = useState<string | null>(null);
  const [isExecutingTool, setIsExecutingTool] = useState<boolean>(false);
  const [copiedConfig, setCopiedConfig] = useState<string | null>(null);

  // Autonomous Agent state
  const [agentGoal, setAgentGoal] = useState<string>(
    "CameraX modülünü projeye bağla, Debian ortamında test et ve imzalı Release APK üret"
  );
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [agentTrace, setAgentTrace] = useState<any[] | null>(null);
  const [agentFinalResult, setAgentFinalResult] = useState<string | null>(null);

  const mcpTools: McpTool[] = [
    {
      name: "build_apk_bundle",
      description: "Android APK veya Google Play AAB bulut derleme motorunu tetikler; SHA-256 ve indirme bağlantısını döner.",
      inputSchema: {
        packageName: "com.company.app",
        buildType: "release_apk",
        language: "kotlin",
        modules: ["camerax_pro"],
      },
    },
    {
      name: "run_debian_command",
      description: "Debian 12 (Bookworm) aarch64 Linux container ortamında root/user bash komutları çalıştırır.",
      inputSchema: { command: "apt update && neofetch" },
    },
    {
      name: "query_database",
      description: "Dahili SQLite veritabanında SQL sorguları yürütür veya toplanan web verilerini okur.",
      inputSchema: { sql: "SELECT * FROM extracted_web_data LIMIT 5" },
    },
    {
      name: "scrape_web_page",
      description: "Hedef URL'i tarayıcı motoruyla canlı çeker; DOM başlıklarını ve veri bloklarını ayıklar.",
      inputSchema: { url: "https://developer.android.com/about/versions/15" },
    },
    {
      name: "inspect_apk_package",
      description: "Derlenmiş APK paketini tersine mühendislikle inceler; izinleri ve DEX metod sayısını döker.",
      inputSchema: { apkFileName: "app-release.apk" },
    },
    {
      name: "search_mobile_knowledge",
      description: "Android 15 API 35, Jetpack Compose 1.7 ve NDK r27c hakkında teknik kuralları sorgular.",
      inputSchema: { query: "16KB page alignment in NDK r27c" },
    },
    {
      name: "list_supported_languages",
      description: "Desteklenen 10 dil (Kotlin 2.1, Java 23, Flutter 3.27, RN 0.77, C++23 NDK, Rust) ve derleyici matrisini döner.",
      inputSchema: {},
    },
    {
      name: "generate_mobile_code",
      description: "Jetpack Compose ekranı, AndroidManifest veya build.gradle.kts kodlarını otonom sentezler.",
      inputSchema: { template: "compose_screen", packageName: "com.droidcraft.app", modules: ["camerax_pro"] },
    },
    {
      name: "manage_debian_packages",
      description: "Debian 12 Bookworm container içinde APT ile paket kurar, kaldırır veya listeler.",
      inputSchema: { action: "install", packageName: "libopencv-dev" },
    },
    {
      name: "read_system_metrics",
      description: "Bulut derleyici ve Debian container CPU, RAM, disk ve aktif arka plan servislerini döner.",
      inputSchema: {},
    },
  ];

  const handleSelectTool = (tName: string) => {
    setSelectedTool(tName);
    const found = mcpTools.find((t) => t.name === tName);
    if (found) {
      setToolParams(JSON.stringify(found.inputSchema, null, 2));
    }
    setToolResult(null);
  };

  const executeMcpTool = async () => {
    setIsExecutingTool(true);
    setToolResult(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(toolParams);
      } catch (e) {
        parsedArgs = {};
      }

      const res = await fetch("/api/mcp/rpc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now(),
          method: "tools/call",
          params: {
            name: selectedTool,
            arguments: parsedArgs,
          },
        }),
      });

      const data = await res.json();
      setToolResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setToolResult(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsExecutingTool(false);
    }
  };

  const dispatchAutonomousAgent = async () => {
    if (!agentGoal.trim() || isAgentRunning) return;
    setIsAgentRunning(true);
    setAgentTrace(null);
    setAgentFinalResult(null);

    try {
      const res = await fetch("/api/agent/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal: agentGoal }),
      });
      const data = await res.json();
      if (data.success) {
        setAgentTrace(data.executionTrace);
        setAgentFinalResult(data.finalResult);
      }
    } catch (err: any) {
      setAgentFinalResult(`Ajan çalışma hatası: ${err.message}`);
    } finally {
      setIsAgentRunning(false);
    }
  };

  const originUrl = typeof window !== "undefined" ? window.location.origin : "https://app.droidcraft.cloud";

  const claudeConfig = JSON.stringify(
    {
      mcpServers: {
        droidcraft: {
          url: `${originUrl}/api/mcp/rpc`,
          type: "http",
          capabilities: ["tools", "resources"],
        },
      },
    },
    null,
    2
  );

  const cursorConfig = JSON.stringify(
    {
      mcp: {
        servers: [
          {
            name: "droidcraft-cloud-studio",
            endpoint: `${originUrl}/api/mcp/rpc`,
            protocol: "jsonrpc-2.0",
          },
        ],
      },
    },
    null,
    2
  );

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedConfig(id);
    setTimeout(() => setCopiedConfig(null), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold mb-2">
              <Bot className="w-3.5 h-3.5" /> Model Context Protocol (MCP) Standard Server
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Yapay Zeka (AI) Bağlantı, Yetenek & MCP Hub
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              Claude, Cursor, Windsurf, Gemini ve otonom yapay zeka ajanlarının DroidCraft'a doğrudan bağlanarak Debian Linux ortamını yönetmesi, APK derlemesi yapması ve veritabanı sorgulaması için tasarlanmıştır.
            </p>
          </div>

          {/* Protocol Metadata Badge */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1">
            <div className="text-slate-400 text-[11px]">Protokol & Endpoint:</div>
            <div className="font-mono text-cyan-300 font-bold text-[11px] truncate">
              POST /api/mcp/rpc (JSON-RPC 2.0)
            </div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> 6 MCP Yeteneği Açık
            </div>
          </div>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: "tools", label: "MCP Araçları & Test Konsolu", icon: Zap },
          { id: "agent", label: "Otonom AI Ajan Simülatörü", icon: Bot },
          { id: "config", label: "Claude & Cursor MCP Yapılandırması", icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: MCP Tools Explorer & Live Execution */}
      {activeTab === "tools" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Tools List (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
            <span className="font-bold text-slate-200 text-xs block pb-2 border-b border-slate-800">
              Yapay Zekaya Sunulan MCP Araçları ({mcpTools.length})
            </span>

            <div className="space-y-1.5">
              {mcpTools.map((tool) => (
                <button
                  key={tool.name}
                  onClick={() => handleSelectTool(tool.name)}
                  className={`w-full p-3 rounded-xl border text-left transition-all space-y-1 ${
                    selectedTool === tool.name
                      ? "border-cyan-500 bg-cyan-950/40 text-white shadow-md shadow-cyan-500/10"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2 font-mono font-bold text-xs text-cyan-400">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{tool.name}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                    {tool.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Interactive Tool Invocation Console (8 cols) */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-xs">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-cyan-400 font-bold">mcp://tools/{selectedTool}</span>
              </div>
              <button
                onClick={executeMcpTool}
                disabled={isExecutingTool}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                {isExecutingTool ? (
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                <span>Aracı Çalıştır (Call MCP Tool)</span>
              </button>
            </div>

            <div className="p-4 space-y-4 flex-1 overflow-y-auto">
              {/* Input Params */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">
                  Girdi Parametreleri (JSON Schema):
                </label>
                <textarea
                  rows={6}
                  value={toolParams}
                  onChange={(e) => setToolParams(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-cyan-300 focus:outline-none focus:border-cyan-500 resize-none"
                />
              </div>

              {/* JSON-RPC Output Result */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-semibold">
                  MCP JSON-RPC 2.0 Yanıtı (AI Model Output):
                </label>
                <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 min-h-[180px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {toolResult || "// 'Aracı Çalıştır' butonuna basarak yapay zekanın alacağı MCP çıktısını görüntüleyin."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Autonomous AI Agent Goal Dispatcher */}
      {activeTab === "agent" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
          <div className="space-y-1 border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span>Otonom Mobil AI Ajanı (Autonomous Agent Dispatcher)</span>
            </h2>
            <p className="text-slate-400 text-xs">
              Yapay zeka ajanı, verdiğiniz üst düzey hedefi MCP araçlarını sırayla çağırarak otonom şekilde çözer.
            </p>
          </div>

          {/* Goal Input Bar */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300">
              Ajanın Görevi (Objective / Goal):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={agentGoal}
                onChange={(e) => setAgentGoal(e.target.value)}
                placeholder="Örn: Android 15 için CameraX ve Room veritabanını entegre et, Debian ortamında test yap"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={dispatchAutonomousAgent}
                disabled={isAgentRunning || !agentGoal.trim()}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all ${
                  isAgentRunning
                    ? "bg-slate-800 text-slate-500"
                    : "bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-lg shadow-cyan-500/20 active:scale-95"
                }`}
              >
                {isAgentRunning ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                <span>Ajanı Görevlendir</span>
              </button>
            </div>

            {/* Quick Preset Goals */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
              <span className="text-slate-400">Hızlı Hedef Şablonları:</span>
              {[
                "CameraX modülünü projeye bağla, Debian ortamında test et ve imzalı Release APK üret",
                "Android 15 için NDK r27c 16KB sayfa hizalamasını ve ProGuard DEX kurallarını doğrula",
                "Debian 12 container içine libopencv-dev kur ve C++ CMake NDK derlemesi yap",
                "Android Developers sitesinden sürüm notlarını kazı ve dahili SQLite veritabanına kaydet",
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setAgentGoal(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-300 border border-slate-700/60 transition-all text-left"
                >
                  ⚡ {preset.slice(0, 38)}...
                </button>
              ))}
            </div>
          </div>

          {/* Execution Trace */}
          {agentTrace && (
            <div className="space-y-3 pt-2">
              <span className="text-xs font-semibold text-cyan-300 block">
                Ajan Çalışma İzi & MCP Araç Çağrıları (Execution Trace):
              </span>
              <div className="space-y-2 font-mono text-xs">
                {agentTrace.map((step) => (
                  <div
                    key={step.step}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[11px]">
                      {step.step}
                    </div>
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-400">tool_call: {step.tool}()</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.2 rounded">
                          {step.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] font-sans">{step.output}</p>
                    </div>
                  </div>
                ))}
              </div>

              {agentFinalResult && (
                <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 font-semibold font-sans">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{agentFinalResult}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Claude Desktop & Cursor MCP Config */}
      {activeTab === "config" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Claude Desktop Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs flex items-center gap-2">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>Claude Desktop MCP Yapılandırması</span>
              </h3>
              <button
                onClick={() => copyText(claudeConfig, "claude")}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                {copiedConfig === "claude" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig === "claude" ? "Kopyalandı!" : "Kopyala"}</span>
              </button>
            </div>
            <p className="text-slate-400 text-xs">
              Bu JSON içeriğini <code className="text-cyan-300">claude_desktop_config.json</code> dosyanıza ekleyin.
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
              {claudeConfig}
            </pre>
          </div>

          {/* Cursor Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-xs flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Cursor / Windsurf MCP Yapılandırması</span>
              </h3>
              <button
                onClick={() => copyText(cursorConfig, "cursor")}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:underline"
              >
                {copiedConfig === "cursor" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedConfig === "cursor" ? "Kopyalandı!" : "Kopyala"}</span>
              </button>
            </div>
            <p className="text-slate-400 text-xs">
              Cursor IDE Ayarları &gt; Features &gt; MCP altında endpoint olarak ekleyin.
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] text-emerald-300 overflow-x-auto border border-slate-800">
              {cursorConfig}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
