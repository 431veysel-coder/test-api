/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
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
} from "lucide-react";

export const AgentPluginHub: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>("dc_agent_master_token_2026");
  const [agentNameInput, setAgentNameInput] = useState<string>("Claude / Cursor AI Assistant");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Playground state
  const [selectedEndpoint, setSelectedEndpoint] = useState<"terminal" | "browser" | "build">("terminal");
  const [payloadInput, setPayloadInput] = useState<string>(
    JSON.stringify({ command: "./gradlew assembleRelease --no-daemon" }, null, 2)
  );
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const handleAuth = async () => {
    try {
      const res = await fetch("/api/agent/plugin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenInput, agentName: agentNameInput }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleExecutePlugin = async () => {
    setIsExecuting(true);
    setResponseOutput(null);

    let url = "/api/agent/plugin/terminal";
    if (selectedEndpoint === "browser") url = "/api/agent/plugin/browser";
    if (selectedEndpoint === "build") url = "/api/agent/plugin/build";

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
                Direct AI Integration
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Claude, Cursor, ChatGPT veya harici AI ajanlarının DroidCraft terminaline, tarayıcısına ve derleme motoruna doğrudan komut gönderebilmesi için güvenli API protokolü.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-xs font-mono flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Plugin Yetkisi Aktif</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Playground & Documentation */}
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
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "terminal", label: "Terminal Exec", icon: Terminal },
                  { id: "browser", label: "Browser Scrape", icon: Globe },
                  { id: "build", label: "Build Pipeline", icon: Cpu },
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

        {/* Right: Documentation & MCP / Agent Integration Guide (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Code2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Yapay Zeka Modelleri İçin Eklenti Kılavuzu</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Claude, GPT-4o, Gemini veya Cursor gibi harici yapay zeka ajanları, aşağıdaki standart REST uç noktalarını kullanarak DroidCraft ekosistemine doğrudan bağlanabilir.
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-mono text-cyan-400 font-bold block">1. Terminal Komut Çalıştırma</span>
                <span className="font-mono text-slate-400 block text-[11px]">POST /api/agent/plugin/terminal</span>
                <p className="text-slate-300">Debian/Ubuntu/Termux korumalı sandox ortamında bash komutları icra eder.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-mono text-purple-400 font-bold block">2. Tarayıcı & Web Tarama</span>
                <span className="font-mono text-slate-400 block text-[11px]">POST /api/agent/plugin/browser</span>
                <p className="text-slate-300">Belirtilen URL adresini tarar, başlığı ve DOM snippet verilerini yapay zekaya döner.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="font-mono text-emerald-400 font-bold block">3. APK & AAB Derleme Tetikleyici</span>
                <span className="font-mono text-slate-400 block text-[11px]">POST /api/agent/plugin/build</span>
                <p className="text-slate-300">R8 kod karartması, imzalama ve APK indirme bağlantısı dahil tam paketleme döngüsünü başlatır.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/50 text-xs text-purple-200 space-y-1">
              <span className="font-bold block">💡 Güvenlik & Yetkilendirme Notu:</span>
              <span>Tüm isteklerde Header olarak <code className="font-mono text-cyan-300">Authorization: Bearer dc_agent_master_token_2026</code> gönderilmesi zorunludur.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
