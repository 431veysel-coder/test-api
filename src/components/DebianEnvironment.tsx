import React, { useState, useEffect, useRef } from "react";
import {
  Terminal,
  Cpu,
  Package,
  HardDrive,
  Activity,
  Play,
  RotateCcw,
  Download,
  Check,
  CheckCircle2,
  Trash2,
  Sparkles,
  Server,
  Layers,
  Search,
} from "lucide-react";

interface DebianPackage {
  name: string;
  version: string;
  status: "installed" | "available";
  category: string;
  sizeMb: number;
  description: string;
}

export const DebianEnvironment: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"terminal" | "packages" | "services">("terminal");
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [commandInput, setCommandInput] = useState<string>("");
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [packages, setPackages] = useState<DebianPackage[]>([]);
  const [packageSearch, setPackageSearch] = useState<string>("");
  const [installSuccess, setInstallSuccess] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPackages();
    // Default welcome screen
    setTerminalOutput([
      `Debian GNU/Linux 12 (bookworm) [aarch64] - DroidCraft Container Sandbox`,
      `Linux 6.6.21-droidcraft-proot #1 SMP PREEMPT Thu Nov 5 16:30:00 UTC 2026`,
      `The programs included with the Debian GNU/Linux system are free software.`,
      `Type 'neofetch', 'apt update', or 'htop' to inspect the environment.`,
      `------------------------------------------------------------------------`,
    ]);
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch("/api/debian/packages");
      const data = await res.json();
      if (data.packages) {
        setPackages(data.packages);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalOutput]);

  const executeCommand = async (cmdToRun?: string) => {
    const cmd = (cmdToRun !== undefined ? cmdToRun : commandInput).trim();
    if (!cmd || isExecuting) return;

    if (cmd === "clear") {
      setTerminalOutput([]);
      setCommandInput("");
      return;
    }

    setTerminalOutput((prev) => [...prev, `root@droidcraft-debian:~# ${cmd}`]);
    setCommandInput("");
    setIsExecuting(true);

    try {
      const res = await fetch("/api/debian/exec", {
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

  const handleInstallPackage = async (pkgName: string) => {
    try {
      const res = await fetch("/api/debian/install", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageName: pkgName }),
      });
      const data = await res.json();
      if (data.success) {
        setInstallSuccess(data.message);
        fetchPackages();
        setTimeout(() => setInstallSuccess(null), 3000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredPackages = packages.filter(
    (p) =>
      p.name.toLowerCase().includes(packageSearch.toLowerCase()) ||
      p.description.toLowerCase().includes(packageSearch.toLowerCase()) ||
      p.category.toLowerCase().includes(packageSearch.toLowerCase())
  );

  const quickDebianCommands = [
    { label: "neofetch", cmd: "neofetch" },
    { label: "os-release", cmd: "cat /etc/os-release" },
    { label: "apt update", cmd: "apt update" },
    { label: "ps aux", cmd: "ps aux" },
    { label: "gcc --version", cmd: "gcc --version" },
    { label: "cmake --version", cmd: "cmake --version" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Hardware Metrics */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-950/60 border border-rose-800/50 text-rose-300 text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              Debian GNU/Linux 12 (Bookworm) Proot Sandboxed OS
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Pre-Configured Debian 12 Linux Çevre Ortamı
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              Yapay zeka modelleri ve mobil geliştiriciler için GCC, Clang 18, OpenJDK 21, Rust 1.83, Python 3.12, CMake ve Android SDK araçlarıyla kurulu gelen tam Linux çalışma alanı.
            </p>
          </div>

          {/* Linux System Metrics Cards */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div className="text-slate-500 text-[10px]">RAM Kullanımı</div>
              <div className="text-cyan-400 font-bold">1.4 GB / 16 GB</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div className="text-slate-500 text-[10px]">Disk Alanı (SSD)</div>
              <div className="text-emerald-400 font-bold">24.8 GB / 256 GB</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5">
              <div className="text-slate-500 text-[10px]">Mimari</div>
              <div className="text-indigo-400 font-bold">aarch64 (ARMv9)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs">
        {[
          { id: "terminal", label: "Debian Root Shell", icon: Terminal },
          { id: "packages", label: "APT Paket Yöneticisi & Depolar", icon: Package },
          { id: "services", label: "Arka Plan Servisleri & Prosesler", icon: Server },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-semibold transition-all ${
                isActive
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Debian Root Terminal */}
      {activeTab === "terminal" && (
        <div className="bg-[#05070f] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
          {/* Header */}
          <div className="bg-[#0b0e1a] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-slate-300 font-bold ml-2 text-[11px]">
                root@droidcraft-debian:~# (bash 5.2.15)
              </span>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800/50">
              Debian 12 Bookworm
            </span>
          </div>

          {/* Quick Command Buttons */}
          <div className="bg-[#080b15] px-4 py-1.5 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
            <span className="text-slate-500 shrink-0">Hızlı Komutlar:</span>
            {quickDebianCommands.map((qc, i) => (
              <button
                key={i}
                onClick={() => executeCommand(qc.cmd)}
                className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-rose-300 border border-slate-800/80 whitespace-nowrap transition-colors"
              >
                {qc.label}
              </button>
            ))}
          </div>

          {/* Terminal Output */}
          <div
            onClick={() => inputRef.current?.focus()}
            className="p-4 h-[480px] overflow-y-auto space-y-1 text-slate-200 select-text"
          >
            {terminalOutput.map((line, idx) => (
              <div
                key={idx}
                className={`leading-relaxed whitespace-pre-wrap ${
                  line.startsWith("root@")
                    ? "text-rose-400 font-bold"
                    : line.includes("Debian GNU/Linux")
                    ? "text-cyan-300"
                    : "text-slate-300"
                }`}
              >
                {line}
              </div>
            ))}

            {/* Prompt input */}
            <div className="flex items-center gap-2 pt-1">
              <span className="text-rose-400 font-bold shrink-0">
                root@droidcraft-debian:~#
              </span>
              <input
                ref={inputRef}
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && executeCommand()}
                disabled={isExecuting}
                autoFocus
                className="flex-1 bg-transparent text-white font-mono outline-none border-none p-0 selection:bg-rose-500/40"
                placeholder={isExecuting ? "Yürütülüyor..." : ""}
              />
              {isExecuting && (
                <div className="w-3 h-3 border-2 border-rose-400/40 border-t-rose-400 rounded-full animate-spin shrink-0" />
              )}
            </div>
            <div ref={bottomRef} />
          </div>
        </div>
      )}

      {/* Tab 2: Visual APT Package Manager */}
      {activeTab === "packages" && (
        <div className="space-y-4">
          {installSuccess && (
            <div className="bg-emerald-950/80 border border-emerald-800/60 p-3 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>{installSuccess}</span>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Debian depolarında paket ara (opencv, ffmpeg, gcc, cmake...)"
                value={packageSearch}
                onChange={(e) => setPackageSearch(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Yüklü Paket: <span className="text-rose-400 font-bold">{packages.filter((p) => p.status === "installed").length}</span> / {packages.length}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPackages.map((pkg) => (
              <div
                key={pkg.name}
                className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 flex flex-col justify-between text-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white font-mono">{pkg.name}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        pkg.status === "installed"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/50"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {pkg.status === "installed" ? "Kurulu" : "Kullanılabilir"}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    v{pkg.version} • {pkg.category} • {pkg.sizeMb} MB
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                    {pkg.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  {pkg.status === "available" ? (
                    <button
                      onClick={() => handleInstallPackage(pkg.name)}
                      className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                      <span>apt install</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Sistemde Aktif
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Running Services & Processes Monitor */}
      {activeTab === "services" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-200">
              <Server className="w-4 h-4 text-cyan-400" />
              <span>Debian 12 Container Prosesleri (ps aux / htop)</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
              5 Aktif Daemon
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px]">
              <thead>
                <tr className="border-b border-slate-800 text-slate-500">
                  <th className="py-2 px-3">PID</th>
                  <th className="py-2 px-3">Servis / Komut</th>
                  <th className="py-2 px-3">Durum</th>
                  <th className="py-2 px-3">Bellek</th>
                  <th className="py-2 px-3">İşlev</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-rose-400">1</td>
                  <td className="py-2 px-3 font-semibold text-white">/sbin/init</td>
                  <td className="py-2 px-3 text-emerald-400">active (running)</td>
                  <td className="py-2 px-3">18 MB</td>
                  <td className="py-2 px-3 text-slate-400 font-sans text-xs">Debian Sistem Yöneticisi</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-rose-400">482</td>
                  <td className="py-2 px-3 font-semibold text-white">GradleDaemon (JDK 21)</td>
                  <td className="py-2 px-3 text-emerald-400">active (running)</td>
                  <td className="py-2 px-3">420 MB</td>
                  <td className="py-2 px-3 text-slate-400 font-sans text-xs">Android Gradle Hızlı Derleme</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-rose-400">610</td>
                  <td className="py-2 px-3 font-semibold text-white">node /app/applet/server.ts</td>
                  <td className="py-2 px-3 text-emerald-400">active (running)</td>
                  <td className="py-2 px-3">95 MB</td>
                  <td className="py-2 px-3 text-slate-400 font-sans text-xs">DroidCraft Cloud OS & MCP Sunucusu</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-rose-400">814</td>
                  <td className="py-2 px-3 font-semibold text-white">adb server</td>
                  <td className="py-2 px-3 text-emerald-400">active (running)</td>
                  <td className="py-2 px-3">42 MB</td>
                  <td className="py-2 px-3 text-slate-400 font-sans text-xs">Android Debug Köprüsü</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-3 text-rose-400">920</td>
                  <td className="py-2 px-3 font-semibold text-white">sqlite3 daemon</td>
                  <td className="py-2 px-3 text-emerald-400">active (running)</td>
                  <td className="py-2 px-3">24 MB</td>
                  <td className="py-2 px-3 text-slate-400 font-sans text-xs">Dahili Veritabanı Motoru</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
