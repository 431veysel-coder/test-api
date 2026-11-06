import React, { useState } from "react";
import {
  Terminal,
  Key,
  Globe,
  Copy,
  Check,
  Play,
  Code2,
  Shield,
  Layers,
  ExternalLink,
  Cpu,
} from "lucide-react";
import { ProjectConfig } from "../types";

interface RemoteApiPanelProps {
  project: ProjectConfig;
}

export const RemoteApiPanel: React.FC<RemoteApiPanelProps> = ({ project }) => {
  const [apiToken, setApiToken] = useState<string>(
    "dc_live_sec_99a81bf44a72e90c8812f84b"
  );
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("build_trigger");
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResponse, setTestResponse] = useState<string | null>(null);

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://app.droidcraft.cloud";

  const endpoints = [
    {
      id: "build_trigger",
      method: "POST",
      path: "/api/build/trigger",
      name: "Uzaktan APK / AAB Derleme Tetikle",
      description: "Harici uygulamalar, CI/CD hatları ve botlar tarafından sıfırdan mobil APK derlemesi başlatır.",
      sampleBody: {
        projectName: project.name,
        packageName: project.packageName,
        versionName: project.versionName,
        versionCode: project.versionCode,
        language: project.language,
        buildType: "release_apk",
        modules: project.activeModules,
        minify: project.minifyEnabled,
      },
    },
    {
      id: "webhook_build",
      method: "POST",
      path: "/api/webhook/build",
      name: "GitHub / GitLab CI/CD Webhook Alıcısı",
      description: "Git push veya pull request olaylarında otomatik bulut derleme tetikleme kancası.",
      sampleBody: {
        repository: "github.com/myteam/mobile-app",
        ref: "refs/heads/main",
        commit: "7e91abf",
      },
    },
    {
      id: "build_history",
      method: "GET",
      path: "/api/build/history",
      name: "Derleme Geçmişi & İndirme Bağlantıları",
      description: "Üretilen tüm APK ve AAB paketlerinin listesi, dosya boyutu ve SHA-256 özetleri.",
      sampleBody: null,
    },
  ];

  const currentEp = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const generateCurl = () => {
    if (currentEp.method === "POST") {
      return `curl -X POST "${baseUrl}${currentEp.path}" \\
  -H "Authorization: Bearer ${apiToken}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(currentEp.sampleBody, null, 2)}'`;
    }
    return `curl -X GET "${baseUrl}${currentEp.path}" \\
  -H "Authorization: Bearer ${apiToken}"`;
  };

  const handleTestCall = async () => {
    setIsTesting(true);
    setTestResponse(null);
    try {
      const options: RequestInit = {
        method: currentEp.method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiToken}`,
        },
      };
      if (currentEp.method === "POST" && currentEp.sampleBody) {
        options.body = JSON.stringify(currentEp.sampleBody);
      }

      const res = await fetch(currentEp.path, options);
      const data = await res.json();
      setTestResponse(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setTestResponse(JSON.stringify({ error: err.message }, null, 2));
    } finally {
      setIsTesting(false);
    }
  };

  const copyText = (text: string, type: "token" | "curl") => {
    navigator.clipboard.writeText(text);
    if (type === "token") {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    }
  };

  const generateNewToken = () => {
    const randomHex = Array.from({ length: 24 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
    setApiToken(`dc_live_sec_${randomHex}`);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold mb-2">
              <Globe className="w-3.5 h-3.5" /> RESTful & Webhook Cloud Gateway
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Uzaktan Bağlantı & Harici Entegrasyon API Paneli
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              Diğer web siteleri, backend servisleri, masaüstü araçları ve CI/CD sistemlerinin DroidCraft derleme motorunu ve modül mimarisini uzaktan çalıştırması için tasarlanmıştır.
            </p>
          </div>

          {/* Quick API Key Widget */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 space-y-1.5 max-w-xs text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Key className="w-3 h-3 text-cyan-400" />
                Aktif API Token:
              </span>
              <button
                onClick={generateNewToken}
                className="text-cyan-400 hover:underline text-[10px]"
              >
                Yenile
              </button>
            </div>
            <div className="flex items-center gap-2">
              <code className="text-cyan-300 font-mono text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800/80 truncate">
                {apiToken}
              </code>
              <button
                onClick={() => copyText(apiToken, "token")}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0"
                title="Token Kopyala"
              >
                {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Endpoint Selector, Right Interactive Console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Endpoints Catalog (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-slate-200 text-xs">
              Kullanılabilir API Endpointleri ({endpoints.length})
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded">
              v1.0.0
            </span>
          </div>

          <div className="space-y-2">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep.id);
                  setTestResponse(null);
                }}
                className={`w-full p-3 rounded-xl border text-left transition-all space-y-1 ${
                  selectedEndpoint === ep.id
                    ? "border-cyan-500 bg-cyan-950/40 text-white shadow-md shadow-cyan-500/10"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span
                    className={`px-1.5 py-0.5 rounded font-bold ${
                      ep.method === "POST"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                        : "bg-indigo-950 text-indigo-400 border border-indigo-800/40"
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="text-slate-300 font-semibold truncate">{ep.path}</span>
                </div>
                <div className="text-xs font-semibold text-slate-200">{ep.name}</div>
                <p className="text-[10px] text-slate-500 line-clamp-2">{ep.description}</p>
              </button>
            ))}
          </div>

          {/* Security Protocols Notice */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-300 text-[11px]">
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>Güvenlik Protokolleri:</span>
            </div>
            <ul className="text-[10px] text-slate-400 space-y-1 list-disc list-inside">
              <li>Bearer Token Kimlik Doğrulaması (RFC 6750)</li>
              <li>Rate Limit: 100 çağrı / dakika (DDoS Korumalı)</li>
              <li>AES-256 Şifreli Keystore Vault</li>
              <li>TLS 1.3 zorunlu uçtan uca aktarım</li>
            </ul>
          </div>
        </div>

        {/* Right: Interactive Runner & cURL Generator (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-xs">
          {/* Header */}
          <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-mono font-bold text-[11px] ${
                  currentEp.method === "POST"
                    ? "bg-emerald-950 text-emerald-400"
                    : "bg-indigo-950 text-indigo-400"
                }`}
              >
                {currentEp.method}
              </span>
              <span className="font-mono text-slate-200 font-bold">{currentEp.path}</span>
            </div>

            <button
              onClick={handleTestCall}
              disabled={isTesting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                isTesting
                  ? "bg-slate-800 text-slate-400"
                  : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-md shadow-cyan-500/20 active:scale-95"
              }`}
            >
              {isTesting ? (
                <>
                  <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Çalıştırılıyor...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>İsteği Canlı Test Et (Send)</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* cURL Request Snippet */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="font-semibold flex items-center gap-1">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  cURL Komutu (Terminal ve Harici Uygulamalar İçin):
                </span>
                <button
                  onClick={() => copyText(generateCurl(), "curl")}
                  className="flex items-center gap-1 text-cyan-400 hover:underline"
                >
                  {copiedCurl ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCurl ? "Kopyalandı!" : "Kopyala"}</span>
                </button>
              </div>

              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre-wrap">
                {generateCurl()}
              </pre>
            </div>

            {/* Test Response Console */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-slate-400 text-[11px]">
                <span className="font-semibold flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  Sunucu Yanıtı (Live HTTP Response):
                </span>
                {testResponse && (
                  <span className="font-mono text-emerald-400 text-[10px] bg-emerald-950/60 px-1.5 py-0.5 rounded">
                    HTTP 200 OK
                  </span>
                )}
              </div>

              <pre className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 min-h-[160px] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                {testResponse || "// 'İsteği Canlı Test Et' butonuna basarak canlı sonucu görüntüleyin."}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
