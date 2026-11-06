import React, { useState, useRef, useEffect } from "react";
import {
  Terminal as TerminalIcon,
  Play,
  RotateCcw,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Trash2,
  Sparkles,
  Layers,
  Cpu,
  Download,
  ShieldCheck,
  FolderOpen,
} from "lucide-react";

interface TerminalLine {
  id: string;
  type: "input" | "output" | "error" | "info";
  text: string;
  timestamp: string;
}

export const TermuxTerminal: React.FC = () => {
  const [activeSession, setActiveSession] = useState<string>("session-1");
  const [sessions, setSessions] = useState([
    { id: "session-1", name: "1: bash (main)" },
    { id: "session-2", name: "2: gradle & logcat" },
    { id: "session-3", name: "3: python & apktool" },
  ]);

  const [inputCommand, setInputCommand] = useState<string>("");
  const [commandHistory, setCommandHistory] = useState<string[]>([
    "termux-info",
    "pkg update",
    "ls -la",
  ]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [copied, setCopied] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const [lines, setLines] = useState<Record<string, TerminalLine[]>>({
    "session-1": [
      {
        id: "l-1",
        type: "info",
        text: `Welcome to Termux Android Linux Environment!
Documentation: https://termux.dev
Community:     https://github.com/termux/termux-app
API Level:     Android 15 (Vanilla Ice Cream / aarch64)
Storage:       /data/data/com.termux/files/home

Working with packages:
 * Search:  pkg search <query>
 * Install: pkg install <package>
 * Update:  pkg update

Type 'termux-info' or 'help' to see mobile toolchains and quick commands.`,
        timestamp: "16:20:00",
      },
      {
        id: "l-2",
        type: "input",
        text: "u0_a182@localhost:~$ termux-info",
        timestamp: "16:20:02",
      },
      {
        id: "l-3",
        type: "output",
        text: `Termux Android Build Environment:
OS: Android 15 (Vanilla Ice Cream / API 35)
Kernel: Linux 6.6.21-android15-g938fa22 aarch64
CPU: 8 cores arm64-v8a (ARM Cortex-X4 / Cortex-A720)
Termux Packages: v0.118.1
Installed Toolchains:
  - openjdk-21 (21.0.5 LTS)
  - kotlin 2.1.0 / kotlinc
  - clang / llvm 18.1.8
  - rust 1.83.0 / cargo-apk
  - python 3.12.7
  - flutter 3.27.1 / dart 3.6.0
  - nodejs 22.14.0 / npm 10.9.0
  - apktool 2.9.3 & apksigner
Storage: 256GB UFS 4.0 (/storage/emulated/0 accessible)`,
        timestamp: "16:20:03",
      },
    ],
    "session-2": [
      {
        id: "l-s2-1",
        type: "info",
        text: "Session 2: Android Gradle Daemon & Logcat Stream Ready.",
        timestamp: "16:20:00",
      },
    ],
    "session-3": [
      {
        id: "l-s3-1",
        type: "info",
        text: "Session 3: Python 3.12.7 & Apktool Decompilation Workspace.",
        timestamp: "16:20:00",
      },
    ],
  });

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const currentLines = lines[activeSession] || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines, activeSession]);

  const runCommand = async (cmdToRun?: string) => {
    const cmd = (cmdToRun !== undefined ? cmdToRun : inputCommand).trim();
    if (!cmd || isExecuting) return;

    if (cmd === "clear") {
      setLines((prev) => ({ ...prev, [activeSession]: [] }));
      setInputCommand("");
      return;
    }

    const timestamp = new Date().toLocaleTimeString();
    const inputLine: TerminalLine = {
      id: "line-" + Date.now(),
      type: "input",
      text: `u0_a182@localhost:~$ ${cmd}`,
      timestamp,
    };

    setLines((prev) => ({
      ...prev,
      [activeSession]: [...(prev[activeSession] || []), inputLine],
    }));

    setCommandHistory((prev) => [cmd, ...prev.filter((c) => c !== cmd)]);
    setHistoryIndex(-1);
    setInputCommand("");
    setIsExecuting(true);

    try {
      const res = await fetch("/api/terminal/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();

      const outputLine: TerminalLine = {
        id: "line-out-" + Date.now(),
        type: data.exitCode !== 0 ? "error" : "output",
        text: data.output || `Process finished with exit code ${data.exitCode || 0}`,
        timestamp: new Date().toLocaleTimeString(),
      };

      setLines((prev) => ({
        ...prev,
        [activeSession]: [...(prev[activeSession] || []), outputLine],
      }));
    } catch (err: any) {
      setLines((prev) => ({
        ...prev,
        [activeSession]: [
          ...(prev[activeSession] || []),
          {
            id: "line-err-" + Date.now(),
            type: "error",
            text: `Termux execution error: ${err.message}`,
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      }));
    } finally {
      setIsExecuting(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      runCommand();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
        setHistoryIndex(nextIndex);
        setInputCommand(commandHistory[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex > 0) {
        const prevIndex = historyIndex - 1;
        setHistoryIndex(prevIndex);
        setInputCommand(commandHistory[prevIndex]);
      } else {
        setHistoryIndex(-1);
        setInputCommand("");
      }
    }
  };

  const insertKey = (keyText: string) => {
    if (keyText === "TAB") {
      setInputCommand((prev) => prev + "  ");
    } else if (keyText === "UP") {
      if (commandHistory.length > 0) {
        setInputCommand(commandHistory[0]);
      }
    } else {
      setInputCommand((prev) => prev + keyText);
    }
    inputRef.current?.focus();
  };

  const copyTerminalOutput = () => {
    const text = currentLines.map((l) => l.text).join("\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const quickCommands = [
    { label: "termux-info", cmd: "termux-info", desc: "Donanım & Toolchain Bilgisi" },
    { label: "pkg update", cmd: "pkg update", desc: "Paket Listesini Güncelle" },
    { label: "apktool d", cmd: "apktool d app-release.apk", desc: "APK Tersine Mühendislik" },
    { label: "apksigner verify", cmd: "apksigner verify --verbose app-release.apk", desc: "İmza Doğrula" },
    { label: "python test", cmd: "python3 -c \"print('Termux Python 3.12 Engine OK')\"", desc: "Python Çalıştır" },
    { label: "ls -la", cmd: "ls -la", desc: "Dizin Listele" },
  ];

  return (
    <div
      className={`p-4 md:p-6 max-w-7xl mx-auto space-y-4 ${
        isFullscreen ? "fixed inset-0 z-50 bg-[#060a12] p-4 max-w-none overflow-y-auto" : ""
      }`}
    >
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold font-mono">
            $_
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Termux Android Linux Terminali (Tam Entegre Shell)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/40 text-emerald-400 text-[10px] font-mono">
                aarch64 Android 15
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Gerçek dünyada kullanılan Termux paket yöneticisi (pkg/apt), Clang, OpenJDK-21, Python 3.12, APKTool ve Apksigner ortamı.
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={copyTerminalOutput}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all"
            title="Terminal Çıktısını Kopyala"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? "Kopyalandı" : "Çıktıyı Kopyala"}</span>
          </button>

          <button
            onClick={() => setLines((prev) => ({ ...prev, [activeSession]: [] }))}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:text-rose-400 text-slate-400 transition-colors"
            title="Temizle (clear)"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:text-cyan-400 text-slate-400 transition-colors"
            title={isFullscreen ? "Küçült" : "Tam Ekran"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Terminal Window Frame */}
      <div className="bg-[#050810] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col font-mono text-xs">
        {/* Termux Tab Bar */}
        <div className="bg-[#0a0f1d] px-3 py-2 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {sessions.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSession(s.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold font-mono transition-all flex items-center gap-1.5 ${
                  activeSession === s.id
                    ? "bg-[#050810] text-emerald-400 border border-slate-700/80 shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{s.name}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span className="hidden sm:inline text-slate-500">UTF-8 • Linux aarch64</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/50">
              u0_a182
            </span>
          </div>
        </div>

        {/* Quick Commands Quick-Toolbar */}
        <div className="bg-[#080d1a] px-3 py-1.5 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
          <span className="text-slate-500 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Hızlı:
          </span>
          {quickCommands.map((qc, i) => (
            <button
              key={i}
              onClick={() => runCommand(qc.cmd)}
              className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-800/80 whitespace-nowrap transition-colors"
              title={qc.desc}
            >
              {qc.label}
            </button>
          ))}
        </div>

        {/* Terminal Screen Body */}
        <div
          onClick={() => inputRef.current?.focus()}
          className={`p-4 overflow-y-auto space-y-1.5 cursor-text text-slate-200 select-text ${
            isFullscreen ? "h-[70vh]" : "h-[460px]"
          }`}
        >
          {currentLines.map((l) => {
            if (l.type === "input") {
              return (
                <div key={l.id} className="text-cyan-400 font-bold leading-relaxed">
                  {l.text}
                </div>
              );
            }
            if (l.type === "info") {
              return (
                <div key={l.id} className="text-emerald-400 leading-relaxed whitespace-pre-wrap">
                  {l.text}
                </div>
              );
            }
            if (l.type === "error") {
              return (
                <div key={l.id} className="text-rose-400 font-semibold leading-relaxed whitespace-pre-wrap">
                  {l.text}
                </div>
              );
            }
            return (
              <div key={l.id} className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {l.text}
              </div>
            );
          })}

          {/* Active Prompt Row */}
          <div className="flex items-center gap-2 pt-1">
            <span className="text-emerald-400 font-bold shrink-0">
              u0_a182@localhost:~$
            </span>
            <input
              ref={inputRef}
              type="text"
              value={inputCommand}
              onChange={(e) => setInputCommand(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isExecuting}
              autoFocus
              className="flex-1 bg-transparent text-white font-mono outline-none border-none p-0 selection:bg-emerald-500/40"
              placeholder={isExecuting ? "Çalıştırılıyor..." : ""}
            />
            {isExecuting && (
              <div className="w-3 h-3 border-2 border-emerald-400/40 border-t-emerald-400 rounded-full animate-spin shrink-0" />
            )}
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Termux Mobile Touch Keyboard Helper Accessory Row */}
        <div className="bg-[#0b1022] border-t border-slate-800 p-2 flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1">
            {["ESC", "TAB", "CTRL", "ALT", "-", "/", "HOME", "UP", "END", "PGUP", "PGDN"].map(
              (key) => (
                <button
                  key={key}
                  onClick={() => insertKey(key)}
                  className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[11px] font-mono active:scale-95 transition-all"
                >
                  {key}
                </button>
              )
            )}
          </div>

          <button
            onClick={() => runCommand()}
            disabled={isExecuting || !inputCommand.trim()}
            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1 shrink-0 transition-colors"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>ENTER</span>
          </button>
        </div>
      </div>
    </div>
  );
};
