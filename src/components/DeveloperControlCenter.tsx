/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  Server,
  Play,
  Square,
  Pause,
  RotateCw,
  ShieldCheck,
  Zap,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Trash2,
  Sparkles,
  Layers,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Gauge,
  AlertCircle
} from "lucide-react";

interface ServiceStatus {
  id: string;
  name: string;
  type: "container" | "shell" | "compiler" | "gateway";
  status: "running" | "paused" | "stopped";
  cpuUsage: string;
  memoryMb: number;
  uptime: string;
  description: string;
}

interface MemoryInsight {
  id: string;
  severity: "high" | "medium" | "low" | "info";
  component: string;
  message: string;
  actionRecommendation: string;
}

interface MemoryMetrics {
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  linuxContainerMb: number;
  gradleDaemonMb: number;
  browserBufferMb: number;
  sqliteBufferMb: number;
  totalAppUsedMb: number;
  totalSystemMb: number;
  usagePercentage: number;
  pressureLevel: "optimal" | "caution" | "warning" | "critical";
}

interface MemoryResponse {
  timestamp: string;
  metrics: MemoryMetrics;
  purgeHistory: {
    lastPurgeTime: string;
    totalPurgesCount: number;
    lastReclaimedMb: number;
  };
  insights: MemoryInsight[];
}

export const DeveloperControlCenter: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      id: "srv-debian",
      name: "Debian 12 (Bookworm) Proot SandBox",
      type: "container",
      status: "running",
      cpuUsage: "3.2%",
      memoryMb: 1420,
      uptime: "4 saat 22 dk",
      description: "GCC, Clang-18 ve OpenJDK 21 içeren ana Debian Linux çekirdeği.",
    },
    {
      id: "srv-ubuntu",
      name: "Ubuntu 24.04 LTS (Noble Numbat)",
      type: "container",
      status: "stopped",
      cpuUsage: "0.0%",
      memoryMb: 0,
      uptime: "Kapalı",
      description: "İkili dışlama kuralı gereği şu an RAM tasarrufu için durduruldu.",
    },
    {
      id: "srv-termux",
      name: "Termux Bash & ADB Bridge Daemon",
      type: "shell",
      status: "running",
      cpuUsage: "0.8%",
      memoryMb: 42,
      uptime: "14 gün",
      description: "Gerçek cihaz üstü USB / TCP ADB köprüsü ve termux tty sunucusu.",
    },
    {
      id: "srv-build",
      name: "Gradle 8.7 & R8 Build Engine",
      type: "compiler",
      status: "running",
      cpuUsage: "14.6%",
      memoryMb: 680,
      uptime: "12 dk (Son Derleme)",
      description: "Android 15 (API 35) APK/AAB paketleme ve zipalign arka plan daemon'u.",
    },
    {
      id: "srv-gateway",
      name: "Unified Public APIs Gateway & MCP",
      type: "gateway",
      status: "running",
      cpuUsage: "0.4%",
      memoryMb: 110,
      uptime: "14 gün",
      description: "50+ halka açık API ve JSON-RPC 2.0 yapay zeka ajan eklenti sunucusu.",
    },
  ]);

  const [globalNotification, setGlobalNotification] = useState<string | null>(null);
  const [memoryData, setMemoryData] = useState<MemoryResponse | null>(null);
  const [loadingMemory, setLoadingMemory] = useState<boolean>(false);
  const [optimizingMemory, setOptimizingMemory] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);

  const fetchMemoryInsights = async () => {
    try {
      setLoadingMemory(true);
      const res = await fetch("/api/memory/insights");
      if (res.ok) {
        const json: MemoryResponse = await res.json();
        setMemoryData(json);
      }
    } catch (e) {
      console.error("Bellek metrikleri çekilemedi", e);
    } finally {
      setLoadingMemory(false);
    }
  };

  const handleOptimizeMemory = async () => {
    try {
      setOptimizingMemory(true);
      const res = await fetch("/api/memory/optimize", { method: "POST" });
      if (res.ok) {
        const json = await res.json();
        setGlobalNotification(json.message);
        setTimeout(() => setGlobalNotification(null), 6000);
        await fetchMemoryInsights();
      }
    } catch (e) {
      setGlobalNotification("Bellek temizleme işlemi başarısız oldu.");
      setTimeout(() => setGlobalNotification(null), 4000);
    } finally {
      setOptimizingMemory(false);
    }
  };

  useEffect(() => {
    fetchMemoryInsights();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchMemoryInsights();
    }, 6000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleServiceAction = (id: string, action: "start" | "pause" | "stop") => {
    setServices((prev) =>
      prev.map((srv) => {
        if (srv.id === id) {
          const newStatus = action === "start" ? "running" : action === "pause" ? "paused" : "stopped";
          const mem = newStatus === "stopped" ? 0 : srv.memoryMb || 250;
          const cpu = newStatus === "stopped" ? "0.0%" : "2.1%";
          return {
            ...srv,
            status: newStatus,
            memoryMb: mem,
            cpuUsage: cpu,
            uptime: newStatus === "stopped" ? "Kapalı" : "Yeni başlatıldı",
          };
        }
        return srv;
      })
    );

    const srvName = services.find((s) => s.id === id)?.name || "Servis";
    const actionText = action === "start" ? "başlatıldı" : action === "pause" ? "bekletildi" : "durduruldu";
    setGlobalNotification(`'${srvName}' başarıyla ${actionText}.`);
    setTimeout(() => setGlobalNotification(null), 4000);
    fetchMemoryInsights();
  };

  const totalMemoryUsed = services.reduce((acc, s) => acc + s.memoryMb, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Gelişmiş Geliştirici Kontrol Paneli & Servis Yöneticisi
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-300 text-[10px] font-mono">
                Live Telemetry & Daemon Control
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Debian, Ubuntu, Termux ve Build Engine servislerinin durumlarını izleyin, proaktif bellek yönetimiyle kaynak sızıntılarını önleyin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 text-xs transition-all ${
              autoRefresh
                ? "bg-emerald-950/40 border-emerald-800/50 text-emerald-300"
                : "bg-slate-950 border-slate-800 text-slate-400"
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? "animate-pulse text-emerald-400" : ""}`} />
            <span>{autoRefresh ? "Oto Canlı (6s)" : "Canlı Akış Kapalı"}</span>
          </button>
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-1.5">
            <span className="text-slate-400 block text-[10px]">Toplam RAM Tüketimi</span>
            <span className="text-cyan-400 font-bold text-sm">
              {memoryData ? memoryData.metrics.totalAppUsedMb : totalMemoryUsed} MB / 16384 MB
            </span>
          </div>
        </div>
      </div>

      {globalNotification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{globalNotification}</span>
        </div>
      )}

      {/* PROACTIVE MEMORY GUARD & LEAK AWARENESS PANEL */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800/50 text-cyan-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                Proaktif Bellek Yönetimi ve Sızıntı Farkındalık Sistemi
                <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 text-[10px] font-mono">
                  LeakAware Pro v2.4
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Node.js V8 Heap, Linux Proot RAM, Gradle Daemon ve arabelleklerin anlık izolasyonu ve otonom optimize edilmesi.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMemoryInsights}
              disabled={loadingMemory}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all text-xs flex items-center gap-1.5"
              title="Metrikleri Yenile"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingMemory ? "animate-spin text-cyan-400" : ""}`} />
            </button>
            <button
              onClick={handleOptimizeMemory}
              disabled={optimizingMemory}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Sparkles className={`w-4 h-4 ${optimizingMemory ? "animate-spin" : ""}`} />
              <span>{optimizingMemory ? "Süpürülüyor..." : "1-Tık Proaktif Bellek Temizleme & GC"}</span>
            </button>
          </div>
        </div>

        {memoryData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Pressure Gauge Card */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" /> Bellek Basıncı
                </span>
                <span
                  className={`px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold ${
                    memoryData.metrics.pressureLevel === "optimal"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                      : memoryData.metrics.pressureLevel === "caution"
                      ? "bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                      : memoryData.metrics.pressureLevel === "warning"
                      ? "bg-amber-950 text-amber-300 border border-amber-800/60"
                      : "bg-rose-950 text-rose-300 border border-rose-800/60"
                  }`}
                >
                  {memoryData.metrics.pressureLevel}
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white font-mono">
                  %{memoryData.metrics.usagePercentage}
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      memoryData.metrics.usagePercentage > 85
                        ? "bg-rose-500"
                        : memoryData.metrics.usagePercentage > 70
                        ? "bg-amber-500"
                        : "bg-gradient-to-r from-emerald-500 to-cyan-500"
                    }`}
                    style={{ width: `${memoryData.metrics.usagePercentage}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-900">
                <span>Toplam Tüketim:</span>
                <span className="text-cyan-300 font-bold">{memoryData.metrics.totalAppUsedMb} MB</span>
              </div>
            </div>

            {/* V8 Node Heap Metrics */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-slate-400 font-mono text-xs flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-emerald-400" /> Node.js V8 Engine Heap
              </span>
              <div>
                <div className="text-xl font-bold text-white font-mono">
                  {memoryData.metrics.heapUsedMb} <span className="text-xs text-slate-400 font-normal">/ {memoryData.metrics.heapTotalMb} MB</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  RSS: <strong className="text-slate-200">{memoryData.metrics.rssMb} MB</strong>
                </p>
              </div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> V8 GC Aktif (Heap Sızıntısı Yok)
              </div>
            </div>

            {/* Linux & Daemon Allocation */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-slate-400 font-mono text-xs flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-indigo-400" /> Linux & Daemon RAM
              </span>
              <div className="space-y-1 text-xs font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Linux Konteyner:</span>
                  <span className="text-indigo-300 font-bold">{memoryData.metrics.linuxContainerMb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gradle Daemon:</span>
                  <span className="text-indigo-300 font-bold">{memoryData.metrics.gradleDaemonMb} MB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gecko/V8 Buffer:</span>
                  <span className="text-indigo-300 font-bold">{memoryData.metrics.browserBufferMb} MB</span>
                </div>
              </div>
              <div className="text-[10px] text-slate-500 font-mono border-t border-slate-900 pt-1">
                İkili Dışlama: Aktif Korumalı
              </div>
            </div>

            {/* Purge Stats */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-2">
              <span className="text-slate-400 font-mono text-xs flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" /> Süpürme İstatistikleri
              </span>
              <div>
                <div className="text-lg font-bold text-amber-300 font-mono">
                  {memoryData.purgeHistory.totalPurgesCount} Temizlik Yapıldı
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Son Temizlik: <strong className="text-slate-200">{new Date(memoryData.purgeHistory.lastPurgeTime).toLocaleTimeString()}</strong>
                </p>
              </div>
              <div className="text-[10px] text-teal-300 font-mono border-t border-slate-900 pt-1 flex justify-between">
                <span>Son Kazanım:</span>
                <span className="font-bold">+{memoryData.purgeHistory.lastReclaimedMb} MB</span>
              </div>
            </div>
          </div>
        )}

        {/* Proactive Awareness Insights List */}
        {memoryData && memoryData.insights && (
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-cyan-400" /> Proaktif Sızıntı & İyileştirme Önerileri
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {memoryData.insights.map((ins) => (
                <div
                  key={ins.id}
                  className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{ins.component}</span>
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase ${
                        ins.severity === "high"
                          ? "bg-rose-950 text-rose-300"
                          : ins.severity === "medium"
                          ? "bg-amber-950 text-amber-300"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {ins.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-snug">{ins.message}</p>
                  <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-cyan-400">
                    <span>Aksiyon: {ins.actionRecommendation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Services Grid */}
      <div className="space-y-3">
        <h3 className="font-bold text-slate-200 text-sm flex items-center gap-2">
          <Server className="w-4 h-4 text-emerald-400" /> Sistem Servisleri ve Daemon Yönetimi
        </h3>
        <div className="grid grid-cols-1 gap-4">
          {services.map((srv) => {
            const isRunning = srv.status === "running";
            const isPaused = srv.status === "paused";
            const isStopped = srv.status === "stopped";

            return (
              <div
                key={srv.id}
                className={`p-5 rounded-2xl border transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isRunning
                    ? "bg-slate-900/90 border-slate-800 hover:border-slate-700"
                    : isPaused
                    ? "bg-amber-950/20 border-amber-800/40"
                    : "bg-slate-950/60 border-slate-800/60 opacity-75"
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-3 h-3 rounded-full ${
                        isRunning ? "bg-emerald-400 animate-pulse" : isPaused ? "bg-amber-400" : "bg-rose-500"
                      }`}
                    />
                    <h3 className="font-bold text-white text-sm md:text-base">{srv.name}</h3>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono border ${
                        isRunning
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/40"
                          : isPaused
                          ? "bg-amber-950/60 text-amber-300 border-amber-800/40"
                          : "bg-rose-950/60 text-rose-300 border-rose-800/40"
                      }`}
                    >
                      {isRunning ? "Çalışıyor" : isPaused ? "Bekletiliyor" : "Durduruldu"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{srv.description}</p>
                  <div className="flex items-center gap-4 text-[11px] font-mono text-slate-500 pt-1">
                    <span>CPU: <strong className="text-slate-300">{srv.cpuUsage}</strong></span>
                    <span>RAM: <strong className="text-slate-300">{srv.memoryMb} MB</strong></span>
                    <span>Çalışma Süresi: <strong className="text-slate-300">{srv.uptime}</strong></span>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {isStopped ? (
                    <button
                      onClick={() => handleServiceAction(srv.id, "start")}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Başlat</span>
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleServiceAction(srv.id, isPaused ? "start" : "pause")}
                        className={`px-3 py-2 rounded-xl font-bold text-xs shadow transition-all flex items-center gap-1.5 ${
                          isPaused
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                            : "bg-amber-600 hover:bg-amber-500 text-white"
                        }`}
                      >
                        {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                        <span>{isPaused ? "Devam Et" : "Beklet"}</span>
                      </button>

                      <button
                        onClick={() => handleServiceAction(srv.id, "stop")}
                        className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
                      >
                        <Square className="w-3.5 h-3.5 fill-current" />
                        <span>Durdur</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

