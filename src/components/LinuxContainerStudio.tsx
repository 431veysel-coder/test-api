/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Cpu,
  Package,
  HardDrive,
  Activity,
  Play,
  RotateCcw,
  Power,
  PowerOff,
  Check,
  CheckCircle2,
  Trash2,
  Sparkles,
  Server,
  Layers,
  Search,
  Shield,
  Zap,
} from "lucide-react";

interface LinuxPackage {
  name: string;
  version: string;
  status: "installed" | "available";
  category: string;
  sizeMb: number;
  description: string;
}

interface ContainerStatus {
  activeOS: "debian" | "ubuntu" | "none";
  isRunning: boolean;
  osName: string;
  kernel: string;
  memory: { usedMb: number; totalMb: number; freeMb: number };
  cpuLoad: string;
  savingActive: boolean;
  services: { name: string; pid: number; status: string; mem: string }[];
}

export const LinuxContainerStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"terminal" | "packages" | "services" | "power">("terminal");
  const [status, setStatus] = useState<ContainerStatus | null>(null);
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [packages, setPackages] = useState<LinuxPackage[]>([]);
  const [packageSearch, setPackageSearch] = useState<string>("");
  const [isSwitchingOS, setIsSwitchingOS] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/linux/status");
      const data: ContainerStatus = await res.json();
      setStatus(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/linux/packages");
      const data = await res.json();
      if (data.packages) {
        setPackages(data.packages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchPackages();
    setTerminalOutput([
      `DroidCraft Multi-OS Linux Container Studio (Mutual Exclusion Sandbox)`,
      `Kural: Cihaza aşırı yük binmesini engellemek için Debian 12 ve Ubuntu 24.04 aynı anda ÇALIŞAMAZ.`,
      `İhtiyaç halinde tek tıkla geçiş yapabilir veya cihazı dinlendirmek için tamamen kapatabilirsiniz.`,
      `Komutlar: 'neofetch', 'cat /etc/os-release', 'apt update', 'htop', 'gcc --version'`,
      `------------------------------------------------------------------------`,
    ]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalOutput]);

  const switchContainerOS = async (targetOS: "debian" | "ubuntu" | "none") => {
    if (status?.activeOS === targetOS || isSwitchingOS) return;
    setIsSwitchingOS(true);
    setNotification(`Konteyner durumu güncelleniyor... Hedef: ${targetOS.toUpperCase()}`);

    try {
      const res = await fetch("/api/linux/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetOS }),
      });
      const data = await res.json();

      setTerminalOutput((prev) => [
        ...prev,
        `\n>>> [SİSTEM BİLDİRİMİ]: ${data.log || data.message}`,
        targetOS !== "none"
          ? `[BAŞLATILDI]: ${targetOS === "ubuntu" ? "Ubuntu 24.04 LTS (Noble)" : "Debian 12 (Bookworm)"} root kabuğu hazır.`
          : `[KAPATILDI]: Bellek ve işlemci serbest bırakıldı.`,
      ]);

      await fetchStatus();
      await fetchPackages();
      setNotification(data.message);
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      setNotification(`Geçiş hatası: ${err.message}`);
    } finally {
      setIsSwitchingOS(false);
    }
  };

  const executeCommand = async (cmdToRun?: string) => {
    const cmd = (cmdToRun !== undefined ? cmdToRun : commandInput).trim();
    if (!cmd || isExecuting) return;

    if (cmd === "clear") {
      setTerminalOutput([]);
      setCommandInput("");
      return;
    }

    const currentPrompt =
      status?.activeOS === "ubuntu"
        ? "root@droidcraft-ubuntu:~#"
        : status?.activeOS === "debian"
        ? "root@droidcraft-debian:~#"
        : "system@container-offline:~$";

    setTerminalOutput((prev) => [...prev, `${currentPrompt} ${cmd}`]);
    setCommandInput("");
    setIsExecuting(true);

    try {
      const res = await fetch("/api/linux/exec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (data.output) {
        setTerminalOutput((prev) => [...prev, data.output]);
      }
    } catch (err: any) {
      setTerminalOutput((prev) => [...prev, `Bash error: ${err.message}`]);
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const installPackage = async (pkgName: string) => {
    try {
      const res = await fetch("/api/linux/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageName: pkgName }),
      });
      const data = await res.json();
      setTerminalOutput((prev) => [...prev, `[APT]: ${data.message}`]);
      await fetchPackages();
    } catch (e: any) {
      console.error(e);
    }
  };

  const filteredPackages = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(packageSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner & Mutual Exclusion Controls */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Linux Konteyner İşletim Sistemi
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/40">
                Karşılıklı Dışlama (Tekil Çalışma)
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Cihaza aşırı yük binmesini engellemek için <strong>Debian 12</strong> ve <strong>Ubuntu 24.04</strong> ortamları
            ihtiyaca göre çalıştırılır; biri açıldığında diğeri otomatik durur. İhtiyaç yoksa cihazı yormamak için kapatılabilir.
          </p>
        </div>

        {/* Mutual Exclusion Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
          <button
            onClick={() => switchContainerOS("debian")}
            disabled={isSwitchingOS}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              status?.activeOS === "debian"
                ? "bg-rose-950/80 text-rose-300 border border-rose-700/60 shadow-lg shadow-rose-950/40"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>Debian 12 (Bookworm)</span>
          </button>

          <button
            onClick={() => switchContainerOS("ubuntu")}
            disabled={isSwitchingOS}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              status?.activeOS === "ubuntu"
                ? "bg-orange-950/80 text-orange-300 border border-orange-700/60 shadow-lg shadow-orange-950/40"
                : "text-slate-400 hover:text-white hover:bg-slate-900"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-400" />
            <span>Ubuntu 24.04 LTS (Noble)</span>
          </button>

          <button
            onClick={() => switchContainerOS("none")}
            disabled={isSwitchingOS}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              status?.activeOS === "none"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-700/60"
                : "text-slate-400 hover:text-rose-400 hover:bg-slate-900"
            }`}
            title="Konteyneri Kapatarak Cihaz RAM ve İşlemcisini Dinlendirin"
          >
            <PowerOff className="w-3.5 h-3.5" />
            <span>Kapat (RAM Tasarrufu)</span>
          </button>
        </div>
      </div>

      {/* Notification Strip */}
      {notification && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 text-xs flex items-center gap-2 animate-fadeIn">
          <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Aktif İşletim Sistemi</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                status?.isRunning ? "bg-emerald-400 animate-pulse" : "bg-slate-600"
              }`}
            />
            <span className="truncate">{status?.osName || "Yükleniyor..."}</span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>RAM Kullanımı</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-sm font-mono font-bold text-indigo-300">
            {status?.memory.usedMb || 0} MB / 16,384 MB
          </div>
          <div className="text-[10px] text-slate-500">
            {status?.savingActive ? "Tasarruf modu devrede (0 MB)" : "Yalnızca 1 OS aktif"}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Konteyner Durumu</span>
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400">
            {status?.isRunning ? "Proot Sandbox Aktif" : "Durduruldu"}
          </div>
          <div className="text-[10px] text-slate-500">Çift yük engelleme garantili</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>Yüklü Araçlar</span>
            <Package className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-sm font-mono font-bold text-amber-300">
            {packages.filter((p) => p.status === "installed").length} Paket
          </div>
          <div className="text-[10px] text-slate-500">Android SDK 35, Clang 18, JDK 21</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("terminal")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "terminal" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Etkileşimli Terminal ({status?.activeOS.toUpperCase()})</span>
        </button>
        <button
          onClick={() => setActiveTab("packages")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "packages" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>APT Paket Yöneticisi ({packages.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === "services" ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30" : "text-slate-400 hover:text-white"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>Konteyner Servisleri ({status?.services.length || 0})</span>
        </button>
      </div>

      {/* TAB 1: TERMINAL */}
      {activeTab === "terminal" && (
        <div className="space-y-3">
          {/* Quick command pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-slate-400 text-[11px]">Hızlı Komutlar:</span>
            {[
              "neofetch",
              "cat /etc/os-release",
              "apt update",
              "gcc --version",
              "clang-18 --version",
              "rustc --version",
              "htop",
              "free -m",
            ].map((cmd) => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-300 border border-slate-800 font-mono text-[11px] transition-all"
              >
                $ {cmd}
              </button>
            ))}
          </div>

          {/* Terminal Console */}
          <div className="bg-[#050811] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-[520px]">
            <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 text-[11px]">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-slate-300 font-semibold ml-2">
                  {status?.activeOS === "ubuntu"
                    ? "Ubuntu 24.04 (Noble) - aarch64 Bash"
                    : status?.activeOS === "debian"
                    ? "Debian 12 (Bookworm) - aarch64 Bash"
                    : "Konteyner Durduruldu"}
                </span>
              </div>
              <button
                onClick={() => setTerminalOutput([])}
                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                Temizle
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-1 text-slate-200">
              {terminalOutput.map((line, index) => (
                <div
                  key={index}
                  className={`leading-relaxed whitespace-pre-wrap ${
                    line.startsWith("root@") || line.startsWith(">>>")
                      ? "text-cyan-400 font-bold"
                      : line.includes("[HATA]")
                      ? "text-rose-400 font-bold"
                      : line.includes("[SUCCESS]")
                      ? "text-emerald-400 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  {line}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input Line */}
            <div className="bg-slate-950 px-4 py-3 border-t border-slate-800/80 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">
                {status?.activeOS === "ubuntu"
                  ? "root@droidcraft-ubuntu:~#"
                  : status?.activeOS === "debian"
                  ? "root@droidcraft-debian:~#"
                  : "system@offline:~$"}
              </span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeCommand()}
                disabled={status?.activeOS === "none" || isExecuting}
                placeholder={
                  status?.activeOS === "none"
                    ? "Konteyner kapalı. Lütfen yukarıdan Debian veya Ubuntu'yu başlatın..."
                    : "Komut girin (ör: apt update, neofetch, cmake --version)..."
                }
                className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none"
              />
              {isExecuting && (
                <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PACKAGES */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
              <input
                type="text"
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                placeholder="Paket ara (ör: gcc, openjdk, cmake, opencv)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              {filteredPackages.length} Paket Listelendi ({status?.activeOS.toUpperCase()})
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.name}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-white font-mono">{pkg.name}</h4>
                    <div className="text-[10px] text-slate-400 font-mono">v{pkg.version} • {pkg.category}</div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      pkg.status === "installed"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {pkg.status === "installed" ? "Yüklü" : "Mevcut"}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2">{pkg.description}</p>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500 font-mono">{pkg.sizeMb} MB</span>
                  {pkg.status !== "installed" ? (
                    <button
                      onClick={() => installPackage(pkg.name)}
                      className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[10px] transition-colors"
                    >
                      APT ile Kur
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Hazır
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SERVICES */}
      {activeTab === "services" && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Aktif Konteyner Daemon'ları ({status?.activeOS.toUpperCase()})</span>
            </h3>

            {status?.services.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Konteyner durdurulduğu için aktif daemon bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2">
                {status?.services.map((svc) => (
                  <div
                    key={svc.pid}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between font-mono text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div>
                        <span className="font-bold text-white">{svc.name}</span>
                        <span className="text-slate-500 ml-2">PID: {svc.pid}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-slate-400">
                      <span>{svc.mem}</span>
                      <span className="text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded text-[10px]">
                        {svc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
