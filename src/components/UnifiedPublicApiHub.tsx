/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Globe,
  Key,
  Send,
  Copy,
  Check,
  Search,
  Filter,
  Code2,
  Database,
  ExternalLink,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Trash2,
  Plus,
  Play,
  RotateCw,
  Server,
  Cloud,
} from "lucide-react";

interface PublicApiSpec {
  id: string;
  name: string;
  category: "crypto" | "weather" | "developer" | "geo" | "news" | "general" | "science" | "ai";
  description: string;
  baseUrl: string;
  authType: "No-Auth" | "ApiKey" | "Bearer";
  authHeaderOrQueryKey?: string;
  defaultWorkingKey?: string;
  sampleEndpoint: string;
  docsUrl: string;
}

interface StoredApiKey {
  id: string;
  apiId: string;
  apiName: string;
  keyLabel: string;
  keyValue: string;
  isPublicDefault: boolean;
  notes: string;
  updatedAt: string;
}

export const UnifiedPublicApiHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"catalog" | "playground" | "vault" | "gateway_docs">("catalog");
  const [catalog, setCatalog] = useState<PublicApiSpec[]>([]);
  const [keys, setKeys] = useState<StoredApiKey[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedAuthFilter, setSelectedAuthFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Playground State
  const [selectedApi, setSelectedApi] = useState<PublicApiSpec | null>(null);
  const [endpointInput, setEndpointInput] = useState<string>("");
  const [httpMethod, setHttpMethod] = useState<"GET" | "POST">("GET");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [selectedCodeLang, setSelectedCodeLang] = useState<"kotlin" | "curl" | "dart" | "fetch">("kotlin");

  // New Key Form State
  const [showAddKeyModal, setShowAddKeyModal] = useState<boolean>(false);
  const [newKeyApiId, setNewKeyApiId] = useState<string>("open-meteo");
  const [newKeyLabel, setNewKeyLabel] = useState<string>("");
  const [newKeyValue, setNewKeyValue] = useState<string>("");
  const [newKeyNotes, setNewKeyNotes] = useState<string>("");

  // Notification Banner
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCatalogAndKeys = async () => {
    try {
      const [catRes, keysRes] = await Promise.all([
        fetch("/api/public-apis/catalog"),
        fetch("/api/public-apis/keys"),
      ]);
      const catData = await catRes.json();
      const keysData = await keysRes.json();

      if (catData.catalog) {
        setCatalog(catData.catalog);
        if (!selectedApi && catData.catalog.length > 0) {
          setSelectedApi(catData.catalog[0]);
          setEndpointInput(catData.catalog[0].sampleEndpoint);
        }
      }
      if (keysData.keys) {
        setKeys(keysData.keys);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchCatalogAndKeys();
  }, []);

  const handleSelectApiForTest = (api: PublicApiSpec) => {
    setSelectedApi(api);
    setEndpointInput(api.sampleEndpoint);
    setActiveTab("playground");
    setResponsePayload(null);
    setLatencyMs(null);
    setResponseStatus(null);
  };

  const executeGatewayRequest = async () => {
    if (!selectedApi) return;
    setIsExecuting(true);
    setResponsePayload(null);

    const startTime = Date.now();
    try {
      let cleanEndpoint = endpointInput;
      if (!cleanEndpoint.startsWith("/")) {
        cleanEndpoint = "/" + cleanEndpoint;
      }

      // Execute via Unified Gateway Proxy
      const gatewayUrl = `/api/gateway/${selectedApi.id}${cleanEndpoint}`;
      const res = await fetch(gatewayUrl, {
        method: httpMethod,
        headers: { Accept: "application/json" },
      });

      const latency = Date.now() - startTime;
      setLatencyMs(latency);
      setResponseStatus(res.status);

      const data = await res.json();
      setResponsePayload(data);
    } catch (err: any) {
      setResponsePayload({ error: err.message });
      setResponseStatus(500);
      setLatencyMs(Date.now() - startTime);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyValue.trim()) return;

    try {
      const matched = catalog.find((c) => c.id === newKeyApiId);
      const res = await fetch("/api/public-apis/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiId: newKeyApiId,
          apiName: matched ? matched.name : newKeyApiId,
          keyLabel: newKeyLabel || "Özel Anahtar",
          keyValue: newKeyValue,
          notes: newKeyNotes,
        }),
      });
      const data = await res.json();
      if (data.key) {
        setKeys((prev) => [data.key, ...prev]);
        setShowAddKeyModal(false);
        setNewKeyValue("");
        setNewKeyLabel("");
        setNewKeyNotes("");
        setNotification(`Anahtar başarıyla kaydedildi! Gateway yönlendirmelerinde otomatik kullanılacak.`);
        setTimeout(() => setNotification(null), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteKey = async (id: string) => {
    try {
      await fetch(`/api/public-apis/keys/${id}`, { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
      setNotification("Anahtar başarıyla kaldırıldı.");
      setTimeout(() => setNotification(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Generate Code Snippet for selected API
  const generateSnippet = () => {
    if (!selectedApi) return "";
    const endpoint = endpointInput.startsWith("/") ? endpointInput : "/" + endpointInput;
    const fullGatewayUrl = `https://ais-dev-74pbi3ixjc6lqanqmkdjfo-417478630955.europe-west3.run.app/api/gateway/${selectedApi.id}${endpoint}`;

    if (selectedCodeLang === "kotlin") {
      return `// Android Kotlin (OkHttp / Retrofit) ile Tek Birleşik Gateway Erişimi
val client = OkHttpClient()
val request = Request.Builder()
    .url("${fullGatewayUrl}")
    .addHeader("Accept", "application/json")
    .addHeader("X-DroidCraft-Client", "Android-API-35")
    .build()

client.newCall(request).enqueue(object : Callback {
    override fun onFailure(call: Call, e: IOException) {
        Log.e("API_GATEWAY", "Hata: \${e.message}")
    }
    override fun onResponse(call: Call, response: Response) {
        val json = response.body?.string()
        Log.d("API_GATEWAY", "Yanıt: \$json")
    }
})`;
    }

    if (selectedCodeLang === "curl") {
      return `# Linux Termux / cURL Üzerinden Tek Gateway Çağrısı
curl -X ${httpMethod} \\
  "${fullGatewayUrl}" \\
  -H "Accept: application/json"`;
    }

    if (selectedCodeLang === "dart") {
      return `// Flutter / Dart HTTP Erişimi
import 'package:http/http.dart' as http;
import 'dart:convert';

final response = await http.get(
  Uri.parse('${fullGatewayUrl}'),
  headers: {'Accept': 'application/json'},
);

if (response.statusCode == 200) {
  final data = jsonDecode(response.body);
  print('Gateway Yanıtı: $data');
}`;
    }

    return `// JavaScript / TypeScript Fetch Erişimi
const response = await fetch('${fullGatewayUrl}', {
  method: '${httpMethod}',
  headers: { 'Accept': 'application/json' }
});
const result = await response.json();
console.log('Gateway Sonucu:', result);`;
  };

  const filteredCatalog = catalog.filter((api) => {
    const matchesCat = selectedCategory === "all" || api.category === selectedCategory;
    const matchesAuth =
      selectedAuthFilter === "all" ||
      (selectedAuthFilter === "no_auth" && api.authType === "No-Auth") ||
      (selectedAuthFilter === "api_key" && api.authType !== "No-Auth");
    const matchesSearch =
      api.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      api.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesAuth && matchesSearch;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Unified Public APIs Hub & Halka Açık API Geçidi
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 text-[10px] font-mono">
                Single Gateway Architecture
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Halka açık yayınlanan tüm API'leri tek bir güvenli URL (`/api/gateway/*`) üzerinden yönlendirin, anahtarları saklayın ve mobil uygulamanızda kullanın.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveTab("catalog")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "catalog"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>API Kataloğu ({catalog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("playground")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "playground"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            <span>Test Konsolu</span>
          </button>

          <button
            onClick={() => setActiveTab("vault")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "vault"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Anahtar Deposu ({keys.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("gateway_docs")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "gateway_docs"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Tek Gateway Kılavuzu</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* TAB 1: PUBLIC APIS CATALOG */}
      {activeTab === "catalog" && (
        <div className="space-y-4">
          {/* Filters & Search */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="API adı, kategori veya terim ara..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Tüm Kategoriler</option>
                <option value="academic">🎓 Akademik Makale & Araştırma (OpenAlex, arXiv, PubMed...)</option>
                <option value="open_data">🏛️ Açık Veri Platformları (Wikidata, Data.gov, Zenodo...)</option>
                <option value="crypto">Kripto & Döviz</option>
                <option value="weather">Hava Durumu</option>
                <option value="developer">Geliştirici & Kod</option>
                <option value="geo">Coğrafya & IP</option>
                <option value="science">Bilim & Uzay</option>
                <option value="general">Genel & Eğlence</option>
              </select>

              <select
                value={selectedAuthFilter}
                onChange={(e) => setSelectedAuthFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Tüm Kimlik Doğrulamalar</option>
                <option value="no_auth">Anahtarsız (No-Auth)</option>
                <option value="api_key">Anahtarlı (ApiKey / Demo)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
              <span>{filteredCatalog.length} API listeleniyor</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCatalog.map((api) => {
              const hasKey = keys.some((k) => k.apiId === api.id);
              return (
                <div
                  key={api.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                        {api.category.toUpperCase()}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                          api.authType === "No-Auth"
                            ? "bg-emerald-950/50 text-emerald-400 border-emerald-800/40"
                            : "bg-amber-950/50 text-amber-300 border-amber-800/40"
                        }`}
                      >
                        {api.authType} {hasKey && "✓ Anahtar Hazır"}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-sm leading-snug">{api.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{api.description}</p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div className="p-2 rounded-lg bg-slate-950 border border-slate-800/80 text-[11px] font-mono text-slate-400 truncate">
                      <span className="text-cyan-400 font-bold">Örnek:</span> {api.sampleEndpoint}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectApiForTest(api)}
                        className="flex-1 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Gateway Test Et</span>
                      </button>
                      <a
                        href={api.docsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title="Resmi Dokümantasyon"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: INTERACTIVE PLAYGROUND (CANLI GATEWAY TESTİ) */}
      {activeTab === "playground" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Request Builder (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
                  <h3 className="font-bold text-white text-sm">Canlı İstek Oluşturucu</h3>
                </div>
                {selectedApi && (
                  <span className="text-xs font-mono text-cyan-300 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
                    {selectedApi.id}
                  </span>
                )}
              </div>

              {/* API Selector */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Hedef API Seçimi:</label>
                <select
                  value={selectedApi?.id || ""}
                  onChange={(e) => {
                    const found = catalog.find((c) => c.id === e.target.value);
                    if (found) {
                      setSelectedApi(found);
                      setEndpointInput(found.sampleEndpoint);
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                >
                  {catalog.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.authType})
                    </option>
                  ))}
                </select>
              </div>

              {/* Method & Endpoint Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">
                  Birleşik Gateway Yolu (/api/gateway/{selectedApi?.id || ":apiId"}...):
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={httpMethod}
                    onChange={(e) => setHttpMethod(e.target.value as "GET" | "POST")}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-cyan-400 font-bold focus:outline-none"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                  <input
                    type="text"
                    value={endpointInput}
                    onChange={(e) => setEndpointInput(e.target.value)}
                    placeholder="/endpoint?param=value"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Execution CTA */}
              <button
                onClick={executeGatewayRequest}
                disabled={isExecuting}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-emerald-500 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                {isExecuting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Gateway Üzerinden Yönlendiriliyor...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Gateway Üzerinden Gönder</span>
                  </>
                )}
              </button>

              {/* Gateway Routing Details */}
              {selectedApi && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono space-y-1 text-slate-400">
                  <div className="flex items-center justify-between">
                    <span>Upstream Base URL:</span>
                    <span className="text-slate-300 truncate max-w-xs">{selectedApi.baseUrl}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Kimlik Tipi:</span>
                    <span className="text-emerald-400 font-bold">{selectedApi.authType}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CORS Koruması:</span>
                    <span className="text-cyan-400 font-bold">Sunucu Tarafı Bypass</span>
                  </div>
                </div>
              )}
            </div>

            {/* Code Generator Card */}
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  <span>Mobil Entegrasyon Kodu:</span>
                </span>
                <div className="flex items-center gap-1 text-[11px]">
                  {(["kotlin", "curl", "dart", "fetch"] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedCodeLang(lang)}
                      className={`px-2 py-0.5 rounded font-mono transition-colors ${
                        selectedCodeLang === lang
                          ? "bg-cyan-600 text-white"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
                  {generateSnippet()}
                </pre>
                <button
                  onClick={() => copyToClipboard(generateSnippet())}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Kodu Kopyala"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Response Inspector (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl min-h-[500px] flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-white text-sm">Canlı Gateway Yanıtı</h3>
                  </div>
                  {responseStatus && (
                    <div className="flex items-center gap-2 font-mono text-xs">
                      <span
                        className={`px-2 py-0.5 rounded font-bold ${
                          responseStatus >= 200 && responseStatus < 300
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                        }`}
                      >
                        HTTP {responseStatus}
                      </span>
                      {latencyMs !== null && (
                        <span className="text-slate-400">{latencyMs} ms</span>
                      )}
                    </div>
                  )}
                </div>

                {responsePayload ? (
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-auto max-h-[460px] leading-relaxed">
                      {JSON.stringify(responsePayload, null, 2)}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(responsePayload, null, 2))}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shadow"
                      title="JSON Yanıtını Kopyala"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ) : (
                  <div className="p-16 text-center text-slate-500 space-y-2">
                    <Globe className="w-8 h-8 mx-auto text-slate-600" />
                    <p className="text-xs">Sol paneldeki 'Gateway Üzerinden Gönder' butonuna basarak canlı JSON yanıtını buraya çekin.</p>
                  </div>
                )}
              </div>

              {responsePayload && (
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Yönlendirme Başarılı</span>
                  <span className="text-cyan-400">X-DroidCraft-Gateway: true</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KEY VAULT (HALKA AÇIK & ÖZEL ANAHTAR DEPOSU) */}
      {activeTab === "vault" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-bold text-white text-sm">Halka Açık & Özel API Anahtarları Deposu</h3>
              <p className="text-xs text-slate-400">
                Kaydettiğiniz tüm anahtarlar tek bir gateway üzerinden otomatik olarak ilgili API isteğine eklenir.
              </p>
            </div>
            <button
              onClick={() => setShowAddKeyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Anahtar Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-300 border border-amber-800/40">
                      {k.apiName}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1">{k.keyLabel}</h4>
                  </div>
                  {!k.isPublicDefault && (
                    <button
                      onClick={() => handleDeleteKey(k.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between text-slate-300">
                  <span className="truncate max-w-xs">{k.keyValue}</span>
                  <button
                    onClick={() => copyToClipboard(k.keyValue)}
                    className="text-slate-400 hover:text-white"
                    title="Kopyala"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">{k.notes}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                  <span>API ID: {k.apiId}</span>
                  <span>{k.isPublicDefault ? "Halka Açık Demo Anahtarı" : "Özel Anahtar"}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Key Modal */}
          {showAddKeyModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">Yeni API Anahtarı Kaydet</h3>
                  <button
                    onClick={() => setShowAddKeyModal(false)}
                    className="text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddKey} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Hedef API:</label>
                    <select
                      value={newKeyApiId}
                      onChange={(e) => setNewKeyApiId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    >
                      {catalog.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Anahtar Başlığı / Etiket:</label>
                    <input
                      type="text"
                      value={newKeyLabel}
                      onChange={(e) => setNewKeyLabel(e.target.value)}
                      placeholder="Örn: Pro Hesap Anahtarım"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">API Anahtarı Değeri (Token / Secret):</label>
                    <input
                      type="text"
                      value={newKeyValue}
                      onChange={(e) => setNewKeyValue(e.target.value)}
                      placeholder="Bearer token veya API Key..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Notlar (İsteğe bağlı):</label>
                    <textarea
                      value={newKeyNotes}
                      onChange={(e) => setNewKeyNotes(e.target.value)}
                      placeholder="Kota limitleri, açıklama vb..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 h-20 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddKeyModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700 transition-colors"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-all shadow-md"
                    >
                      Anahtarı Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: UNIFIED GATEWAY ARCHITECTURE GUIDE */}
      {activeTab === "gateway_docs" && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">
              Tek Birleşik Gateway (`/api/gateway/:apiId/...`) Nasıl Çalışır?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mobil uygulamalarınızın onlarca farklı dış API sunucusuyla ayrı ayrı uğraşması yerine, DroidCraft tek bir merkezi geçit görevi görür.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-cyan-400 font-bold text-sm">1. Tek Bir Uç Nokta</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tüm istekler doğrudan <code className="text-cyan-300 font-mono">/api/gateway/:apiId</code> adresine yönlendirilir. Uygulamanız sadece tek bir temel URL bilir.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-emerald-400 font-bold text-sm">2. Otomatik Anahtar Enjeksiyonu</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                İstemcinin gizli API anahtarlarını taşımasına gerek yoktur. Gateway, hedef servis için kayıtlı tokeni otomatik olarak ekler.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-purple-400 font-bold text-sm">3. CORS & Bot Filtresi Yok</span>
              <p className="text-xs text-slate-400 leading-relaxed">
                Mobil tarayıcı veya web istemcisinde CORS hataları yaşanmaz. Tüm yönlendirmeler sunucu tarafında gerçekleşir.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
