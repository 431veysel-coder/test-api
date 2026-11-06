/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Cpu,
  Terminal,
  Globe,
  Play,
  Key,
  Shield,
  Copy,
  Check,
  Zap,
  CheckCircle2,
  Code2,
  Server,
  Activity,
  Database,
  History,
  Radio,
  Lock,
} from "lucide-react";

interface AuditLog {
  id: string;
  agentName: string;
  token: string;
  endpoint: string;
  actionSummary: string;
  status: string;
  responseMs: number;
  timestamp: string;
}

export const AgentPluginHub: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>("dc_agent_master_token_2026");
  const [agentNameInput, setAgentNameInput] = useState<string>("Claude / Cursor AI Assistant");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<"terminal" | "browser" | "build" | "database">("terminal");
  const [payloadInput, setPayloadInput] = useState<string>(
    JSON.stringify({ command: "./gradlew assembleRelease --no-daemon" }, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  // Audit Logs & SSE Stream
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [sseConnected, setSseConnected] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"console" | "audit" | "docs">("console");

  const fetchAuditLogs = async () => {
    try {
      const res = await fetch("/api/agent/plugin/audit?limit=20");
      if (res.ok) {
        const data = await res.json();
        setAuditLogs(data.logs || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    // SSE Event Source Connection
    const es = new EventSource("/api/agent/plugin/stream");
    es.addEventListener("connected", () => {
      setSseConnected(true);
    });
    es.addEventListener("audit", (ev: MessageEvent) => {
      try {
        const newLog: AuditLog = JSON.parse(ev.data);
        setAuditLogs((prev) => [newLog, ...prev.slice(0, 19)]);
      } catch (e) {
        // ignore
      }
    });

    es.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      es.close();
    };
  }, []);

  const handleExecutePlugin = async () => {
    setIsExecuting(true);
    setResponseOutput(null);

    let url = "/api/agent/plugin/terminal";
    if (selectedEndpoint === "browser") url = "/api/agent/plugin/browser";
    if (selectedEndpoint === "build") url = "/api/agent/plugin/build";
    if (selectedEndpoint === "database") url = "/api/agent/plugin/database";

    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(payloadInput);
      } catch (e) {
        parsedBody = { raw: payloadInput };
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenInput}`,
        },
        body: JSON.stringify(parsedBody),
      });

      const data = await res.json();
      setResponseOutput(data);
      fetchAuditLogs();
    } catch (err: any) {
      setResponseOutput({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  const copySnippet = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Agent Plugin API Katmanı (Yapay Zeka Doğrudan Erişim Hub)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-purple-950/60 border border-purple-800/40 text-purple-300 text-[10px] font-mono">
                Direct AI Integration & Audit Engine
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Claude, Cursor, ChatGPT veya harici AI ajanlarının DroidCraft terminaline, tarayıcısına, derleme motoruna ve veritabanına doğrudan komut gönderme protokolü.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 flex items-center gap-1.5">
            <Radio className={`w-3.5 h-3.5 ${sseConnected ? "text-emerald-400 animate-pulse" : "text-slate-500"}`} />
            <span>{sseConnected ? "SSE Canlı Akış" : "Canlı Akış Hazır"}</span>
          </span>
          <span className="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 font-mono flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Kalıcı Token & Rate Limit (60/dk)</span>
          </span>
        </div>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("console")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "console"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
              : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>Ajan Test Konsolu</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("audit");
            fetchAuditLogs();
          }}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
              : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>Ajan Denetim Günlüğü (Audit Log)</span>
        </button>

        <button
          onClick={() => setActiveTab("docs")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === "docs"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
              : "bg-slate-950 text-slate-400 border border-slate-800 hover:text-white"
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          <span>REST & JSON-RPC Dokümantasyonu</span>
        </button>
      </div>

      {/* Main Content Areas */}
      {activeTab === "console" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Plugin Playground (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-purple-400 fill-purple-400" />
                  <h3 className="font-bold text-white text-sm">Agent Plugin Test Konsolu</h3>
                </div>
                <span className="text-xs font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/40">
                  v2.4
                </span>
              </div>

              {/* Endpoint Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Hedef Eklenti Servisi:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: "terminal", label: "Terminal Exec", icon: Terminal },
                    { id: "browser", label: "Browser Scrape", icon: Globe },
                    { id: "build", label: "Build Pipeline", icon: Cpu },
                    { id: "database", label: "Database Query", icon: Database },
                  ].map((ep) => {
                    const Icon = ep.icon;
                    const active = selectedEndpoint === ep.id;
                    return (
                      <button
                        key={ep.id}
                        onClick={() => {
                          setSelectedEndpoint(ep.id as any);
                          if (ep.id === "terminal")
                            setPayloadInput(JSON.stringify({ command: "./gradlew assembleRelease --no-daemon" }, null, 2));
                          if (ep.id === "browser")
                            setPayloadInput(JSON.stringify({ url: "https://developer.android.com/about/versions/15", action: "scrape" }, null, 2));
                          if (ep.id === "build")
                            setPayloadInput(JSON.stringify({ buildType: "release_apk", packageName: "com.droidcraft.app" }, null, 2));
                          if (ep.id === "database")
                            setPayloadInput(JSON.stringify({ action: "query", table: "extracted_web_data", filter: "Android" }, null, 2));
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          active
                            ? "bg-purple-600 text-white border-purple-500 shadow-md"
                            : "bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{ep.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Token & Payload */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Agent Token (Bearer):</label>
                <input
                  type="text"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">JSON İstek Gövdesi (Payload):</label>
                <textarea
                  value={payloadInput}
                  onChange={(e) => setPayloadInput(e.target.value)}
                  rows={5}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-purple-300 font-mono focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <button
                onClick={handleExecutePlugin}
                disabled={isExecuting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold text-xs shadow-lg shadow-purple-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Ajan Komutu İcra Ediliyor...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    <span>Eklenti Komutunu Gönder</span>
                  </>
                )}
              </button>
            </div>

            {/* Response Inspector */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Eklenti Yanıtı (JSON Response):</span>
                </span>
                {responseOutput && (
                  <button
                    onClick={() => copySnippet(JSON.stringify(responseOutput, null, 2))}
                    className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white"
                    title="Kopyala"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {responseOutput ? (
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-auto max-h-60 leading-relaxed">
                  {JSON.stringify(responseOutput, null, 2)}
                </pre>
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs font-mono">
                  Henüz komut çalıştırılmadı. Sol panelden istek gönderin.
                </div>
              )}
            </div>
          </div>

          {/* Right: Quick Docs & Active Stream Feeds (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-white text-sm">Desteklenen Ajan Uç Noktaları</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-cyan-400 font-bold block">1. Terminal Exec API</span>
                  <span className="font-mono text-slate-400 block text-[11px]">POST /api/agent/plugin/terminal</span>
                  <p className="text-slate-300">Debian/Ubuntu/Termux sandox ortamında bash komutları icra eder.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-purple-400 font-bold block">2. Browser Scrape API</span>
                  <span className="font-mono text-slate-400 block text-[11px]">POST /api/agent/plugin/browser</span>
                  <p className="text-slate-300">Web sayfalarını tarar, başlık ve DOM snippet verilerini döner.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-emerald-400 font-bold block">3. Build Pipeline API</span>
                  <span className="font-mono text-slate-400 block text-[11px]">POST /api/agent/plugin/build</span>
                  <p className="text-slate-300">APK/AAB paketleme, R8 karartma ve indirme bağlantısı üretir.</p>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="font-mono text-amber-400 font-bold block">4. Database Query API</span>
                  <span className="font-mono text-slate-400 block text-[11px]">POST /api/agent/plugin/database</span>
                  <p className="text-slate-300">SQLite veritabanı tablolarını sorgular, şema okur ve yeni veri ekler.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log View */}
      {activeTab === "audit" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Canlı Ajan Denetim Günlüğü (Audit Trail Log)</span>
            </h3>
            <button
              onClick={fetchAuditLogs}
              className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs hover:text-white"
            >
              Yenile
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                  <th className="p-3">Zaman</th>
                  <th className="p-3">Ajan Adı</th>
                  <th className="p-3">Uç Nokta</th>
                  <th className="p-3">Aksiyon</th>
                  <th className="p-3">Durum</th>
                  <th className="p-3">Süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.length > 0 ? (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30">
                      <td className="p-3 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                      <td className="p-3 text-cyan-300 font-bold">{log.agentName}</td>
                      <td className="p-3 text-purple-300">{log.endpoint}</td>
                      <td className="p-3 text-slate-300">{log.actionSummary}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status === "success"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                              : "bg-rose-950 text-rose-400 border border-rose-800"
                          }`}
                        >
                          {log.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400">{log.responseMs} ms</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-slate-500">
                      Henüz denetim kaydı oluşmadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Docs View */}
      {activeTab === "docs" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4 text-xs text-slate-300">
          <h3 className="font-bold text-white text-sm">Gelişmiş REST & SSE Ajan Entegrasyonu</h3>
          <p>
            Tüm yapay zeka istemcileri (Claude Desktop, Cursor, ChatGPT Custom GPTs) DroidCraft Cloud OS uç noktalarını standart JSON formatında çağırabilir.
          </p>

          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-purple-300 font-mono text-xs overflow-auto">
{`// Örnek cURL İsteği (Veritabanı Sorgulama):
curl -X POST https://ais-dev-74pbi3ixjc6lqanqmkdjfo-417478630955.europe-west3.run.app/api/agent/plugin/database \\
  -H "Authorization: Bearer dc_agent_master_token_2026" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "query",
    "table": "extracted_web_data",
    "filter": "Android 15"
  }'`}
          </pre>
        </div>
      )}
    </div>
  );
};

