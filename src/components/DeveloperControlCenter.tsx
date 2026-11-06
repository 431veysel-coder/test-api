/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Activity,
  Cpu,
  Server,
  Terminal,
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
              Debian, Ubuntu, Termux ve Build Engine servislerinin çalışma durumlarını izleyin, CPU/RAM tüketimlerini görün ve yönetin.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2">
            <span className="text-slate-400 block text-[10px]">Toplam RAM Tüketimi</span>
            <span className="text-cyan-400 font-bold text-sm">{totalMemoryUsed} MB / 16384 MB</span>
          </div>
        </div>
      </div>

      {globalNotification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{globalNotification}</span>
        </div>
      )}

      {/* Services Grid */}
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
                      className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
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
  );
};
