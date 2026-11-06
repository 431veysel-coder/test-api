/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  FolderGit2,
  GitBranch,
  GitCommit,
  Cpu,
  Smartphone,
  Cloud,
  CheckCircle2,
  Play,
  Download,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
  Terminal,
  Shield,
  Layers,
  FileCode,
  Zap,
} from "lucide-react";
import { ProjectConfig } from "../types";

interface GitHubHybridHubProps {
  project: ProjectConfig;
}

export const GitHubHybridHub: React.FC<GitHubHybridHubProps> = ({ project }) => {
  const [repoUrl, setRepoUrl] = useState("https://github.com/droidcraft-cloud/android-mobile-core");
  const [branch, setBranch] = useState("main");
  const [isConnected, setIsConnected] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [commitSha, setCommitSha] = useState("7f4c91a");
  const [commitMessage, setCommitMessage] = useState("feat(android): add Jetpack Compose 1.7 UI & CameraX 1.4");
  const [detectedFramework, setDetectedFramework] = useState("Kotlin 2.0 (Jetpack Compose / Gradle 8.7)");

  // Hybrid Build Mode: "hybrid_device" | "cloud_cluster" | "github_actions"
  const [buildMode, setBuildMode] = useState<"hybrid_device" | "cloud_cluster" | "github_actions">("hybrid_device");
  const [buildType, setBuildType] = useState<"release_apk" | "debug_apk" | "aab_bundle">("release_apk");
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [lastBuildResult, setLastBuildResult] = useState<{
    buildId: string;
    downloadUrl: string;
    duration: number;
    sha: string;
  } | null>(null);

  const [workflowYml, setWorkflowYml] = useState<string>("");
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  useEffect(() => {
    fetch("/api/github/workflow-template")
      .then((r) => r.text())
      .then((text) => setWorkflowYml(text))
      .catch(() => {});
  }, []);

  const handleConnectRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) return;
    setIsConnecting(true);

    try {
      const res = await fetch("/api/github/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, branch }),
      });
      const data = await res.json();
      if (data.success && data.repo) {
        setIsConnected(true);
        setCommitSha(data.repo.lastCommitSha);
        setCommitMessage(data.repo.lastCommitMessage);
        setDetectedFramework(data.repo.detectedFramework);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleTriggerHybridBuild = async () => {
    setIsBuilding(true);
    setBuildLogs([
      `[BAŞLATILIYOR] ${
        buildMode === "hybrid_device"
          ? "📱 Cihaz Üstü Hibrit Derleyici"
          : buildMode === "cloud_cluster"
          ? "☁️ Bulut İşçi Kümesi (FastBuild)"
          : "🐙 GitHub Actions Runner CI/CD"
      } modu aktif edildi...`,
      `[GIT] Depo: ${repoUrl} | Şube: ${branch} (Commit: ${commitSha})`,
      `[KONTROL] Hedef paket: ${project.packageName} | Hedef SDK: API ${project.targetSdk} (Android 15)`,
      `[GRADLE] Gradle 8.7 daemon ayağa kaldırıldı, OpenJDK 21 LTS doğrulandı.`,
      `[NDK] C++ kütüphaneleri 16KB sayfa hizalaması (-Wl,-z,max-page-size=16384) kontrol ediliyor...`,
      `[R8/PROGUARD] Bayt kodu optimizasyonu ve DEX küçültme çalıştırılıyor...`,
      `[PAKETLEME] APK imzalanıyor (Android v2+v3+v4 cryptographic scheme)...`,
    ]);

    try {
      const res = await fetch("/api/github/trigger-hybrid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: buildMode, buildType }),
      });
      const data = await res.json();
      if (data.logs) {
        setBuildLogs(data.logs);
      }
      setLastBuildResult({
        buildId: data.buildId,
        downloadUrl: data.downloadUrl,
        duration: data.durationSeconds,
        sha: data.commitSha,
      });
    } catch (err: any) {
      setBuildLogs((prev) => [...prev, `[HATA]: ${err.message}`]);
    } finally {
      setIsBuilding(false);
    }
  };

  const copyWorkflow = () => {
    navigator.clipboard.writeText(workflowYml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <FolderGit2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              GitHub & Hibrit Mobil Derleme Merkezi
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                Hybrid CI/CD Pipeline
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Mobil APK ve AAB derleme yoğunluğunu ister <strong>cihaz üstü yerel hibrit derleyicide</strong>, ister{" "}
            <strong>bulut işçi kümesinde</strong>, isterseniz doğrudan <strong>GitHub Actions runner</strong>'larında
            çalıştırın.
          </p>
        </div>

        {/* Mode Quick Badge */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
          <div className="text-left text-xs">
            <div className="text-slate-400 text-[10px]">Aktif Derleme Modu:</div>
            <div className="font-bold text-cyan-300">
              {buildMode === "hybrid_device"
                ? "📱 Cihaz Üstü Hibrit"
                : buildMode === "cloud_cluster"
                ? "☁️ Bulut İşçi Kümesi"
                : "🐙 GitHub Actions"}
            </div>
          </div>
        </div>
      </div>

      {/* GitHub Repository Connection Card */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-white flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <span>GitHub Depo Bağlantısı (Git Repository Link)</span>
          </h2>
          {isConnected && (
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Bağlı ve Senkronize
            </span>
          )}
        </div>

        <form onSubmit={handleConnectRepo} className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
          <div className="md:col-span-8">
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">GitHub Depo URL</label>
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/kullanici/android-projesi"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] text-slate-400 font-semibold block mb-1">Şube (Branch)</label>
            <input
              type="text"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              placeholder="main"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={isConnecting}
              className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95"
            >
              {isConnecting ? (
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
              <span>Depoyu Bağla</span>
            </button>
          </div>
        </form>

        {/* Connected Repo Details */}
        {isConnected && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 font-mono text-[11px]">
            <div>
              <span className="text-slate-500">Son Commit:</span>
              <div className="text-cyan-300 font-bold flex items-center gap-1 mt-0.5">
                <GitCommit className="w-3.5 h-3.5 text-indigo-400" />
                <span>{commitSha}</span>
              </div>
              <div className="text-slate-400 text-[10px] truncate">{commitMessage}</div>
            </div>

            <div>
              <span className="text-slate-500">Tespit Edilen Çatı:</span>
              <div className="text-emerald-300 font-bold mt-0.5">{detectedFramework}</div>
              <div className="text-slate-400 text-[10px]">Gradle 8.7 & AGP 8.7.0 Uyumlu</div>
            </div>

            <div>
              <span className="text-slate-500">Hedef Mobil Paket:</span>
              <div className="text-white font-bold mt-0.5">{project.packageName}</div>
              <div className="text-slate-400 text-[10px]">Android 15 (API {project.targetSdk})</div>
            </div>
          </div>
        )}
      </div>

      {/* Hybrid Build Controller Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Mode Selection & Trigger (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-xs font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Hibrit Derleme Motorunu Seçin</span>
          </h3>

          <div className="space-y-2.5">
            {[
              {
                id: "hybrid_device",
                title: "📱 Cihaz Üstü Hibrit Derleyici (Edge)",
                desc: "İnternet kopsa dahi cihaz kaynakları ve yerel Gradle daemon ile en hızlı artımlı derleme.",
                badge: "Tavsiye Edilen",
              },
              {
                id: "cloud_cluster",
                title: "☁️ Bulut İşçi Kümesi (Cloud FastBuild)",
                desc: "Uzak Frankfurt / İstanbul 32 çekirdekli worker sunucularında paralel derleme.",
                badge: "32-Core Cloud",
              },
              {
                id: "github_actions",
                title: "🐙 GitHub Actions Runner (CI/CD)",
                desc: "Doğrudan GitHub Actions workflow'unu tetikler ve GitHub sunucularında derletir.",
                badge: "GitHub CI",
              },
            ].map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setBuildMode(m.id as any)}
                className={`w-full p-3 rounded-xl border text-left transition-all space-y-1 ${
                  buildMode === m.id
                    ? "bg-cyan-950/40 border-cyan-500/70 text-white shadow-lg shadow-cyan-950/30"
                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300">{m.title}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {m.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
              </button>
            ))}
          </div>

          <div className="space-y-2 pt-2">
            <label className="text-[11px] text-slate-400 font-semibold block">Paket Türü</label>
            <div className="grid grid-cols-3 gap-2 text-xs font-bold">
              {[
                { id: "release_apk", label: "Release APK" },
                { id: "debug_apk", label: "Debug APK" },
                { id: "aab_bundle", label: "Play AAB" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setBuildType(t.id as any)}
                  className={`py-2 rounded-xl border text-center transition-all ${
                    buildType === t.id
                      ? "bg-indigo-600 text-white border-indigo-500"
                      : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleTriggerHybridBuild}
            disabled={isBuilding}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg ${
              isBuilding
                ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 text-white shadow-cyan-500/20 active:scale-95"
            }`}
          >
            {isBuilding ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
            <span>{isBuilding ? "Hibrit Derleniyor..." : "Hibrit Derlemeyi Başlat"}</span>
          </button>
        </div>

        {/* Right: Build Terminal Logs & Artifacts (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Terminal Logs */}
          <div className="bg-[#050811] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs flex flex-col h-[320px]">
            <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-2 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-slate-300 font-semibold">Hibrit Derleme Konsolu (Output Stream)</span>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded">
                {isBuilding ? "Derleniyor..." : "Hazır"}
              </span>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-1 text-slate-300">
              {buildLogs.length === 0 ? (
                <div className="text-slate-600 text-center pt-24 text-xs">
                  Derlemeyi başlatmak için sol taraftaki butona tıklayın.
                </div>
              ) : (
                buildLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`leading-relaxed ${
                      log.includes("[FINISHED]")
                        ? "text-emerald-400 font-bold"
                        : log.includes("[HATA]")
                        ? "text-rose-400 font-bold"
                        : log.startsWith("[BUILD]") || log.startsWith("[SIGN]")
                        ? "text-cyan-300"
                        : "text-slate-300"
                    }`}
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Download Box if build succeeded */}
          {lastBuildResult && (
            <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-700/60 flex items-center justify-between gap-4 animate-fadeIn">
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hibrit Derleme Tamamlandı! ({lastBuildResult.duration}s)</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  ID: {lastBuildResult.buildId} • Commit: {lastBuildResult.sha.slice(0, 7)}
                </div>
              </div>
              <a
                href={lastBuildResult.downloadUrl}
                download
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Paketi İndir ({buildType.toUpperCase()})</span>
              </a>
            </div>
          )}

          {/* GitHub Actions Workflow Generator Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>.github/workflows/android-build.yml</span>
              </span>
              <button
                onClick={copyWorkflow}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1 transition-colors"
              >
                {copiedWorkflow ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWorkflow ? "Kopyalandı!" : "YAML Kopyala"}</span>
              </button>
            </div>
            <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-300 max-h-36 overflow-y-auto leading-relaxed">
              {workflowYml}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
