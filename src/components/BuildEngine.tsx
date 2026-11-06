import React, { useState, useEffect, useRef } from "react";
import {
  Cpu,
  Play,
  Download,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Clock,
  HardDrive,
  Copy,
  Check,
  Terminal,
  ExternalLink,
  RefreshCw,
  Sliders,
} from "lucide-react";
import { BuildLogRecord, BuildType, ProjectConfig } from "../types";

interface BuildEngineProps {
  project: ProjectConfig;
  setProject: React.Dispatch<React.SetStateAction<ProjectConfig>>;
  isBuilding: boolean;
  setIsBuilding: (b: boolean) => void;
  lastBuild: BuildLogRecord | null;
  setLastBuild: (b: BuildLogRecord | null) => void;
}

export const BuildEngine: React.FC<BuildEngineProps> = ({
  project,
  setProject,
  isBuilding,
  setIsBuilding,
  lastBuild,
  setLastBuild,
}) => {
  const [selectedBuildType, setSelectedBuildType] = useState<BuildType>("release_apk");
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [currentStepText, setCurrentStepText] = useState<string>("");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState<boolean>(false);
  const [buildHistory, setBuildHistory] = useState<BuildLogRecord[]>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Fetch build history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/build/history");
      const data = await res.json();
      if (data.builds) {
        setBuildHistory(data.builds);
        if (!lastBuild && data.builds.length > 0) {
          setLastBuild(data.builds[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load build history", e);
    }
  };

  // Auto-scroll logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [liveLogs]);

  const runBuild = async () => {
    if (isBuilding) return;
    setIsBuilding(true);
    setProgressPercent(5);
    setCurrentStepText("Derleme ortamı hazırlanıyor...");
    setLiveLogs([
      `[DROIDCRAFT-INIT] Cloud Build Daemon v4.8 (Worker: Frankfurt-Node-01)`,
      `[CONFIG] Package: ${project.packageName} | Version: ${project.versionName} (${project.versionCode})`,
      `[TARGET] Android SDK 35 (Vanilla Ice Cream) | Min SDK: ${project.minSdk}`,
      `[LANG] ${project.language.toUpperCase()} | Modules: ${project.activeModules.length} aktif`,
    ]);

    // Simulated progress steps with realistic Android build stages
    const steps = [
      { text: "Bağımlılıklar çözümleniyor (Maven Central, Google Maven)...", progress: 20 },
      { text: "AAPT2 ile XML layoutlar ve kaynaklar derleniyor...", progress: 40 },
      { text: "D8/R8 ile bytecode ve DEX üretimi yapılıyor...", progress: 65 },
      { text: "ProGuard kural karartması ve dead-code temizliği yapılıyor...", progress: 80 },
      { text: "APK paketleniyor ve zipalign (4-byte alignment) uygulanıyor...", progress: 92 },
      { text: "Keystore V2+V3+V4 imzası atılıyor ve SHA-256 mühürleniyor...", progress: 98 },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        setProgressPercent(step.progress);
        setCurrentStepText(step.text);
        setLiveLogs((prev) => [
          ...prev,
          `[STEP ${currentStep + 1}/${steps.length}] ${step.text}`,
        ]);
        currentStep++;
      }
    }, 600);

    try {
      const response = await fetch("/api/build/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: project.name,
          packageName: project.packageName,
          versionName: project.versionName,
          versionCode: project.versionCode,
          language: project.language,
          buildType: selectedBuildType,
          modules: project.activeModules,
          minify: project.minifyEnabled,
          signingScheme: project.signingScheme,
        }),
      });

      const data = await response.json();
      clearInterval(interval);

      if (data.success && data.build) {
        setProgressPercent(100);
        setCurrentStepText("Derleme başarıyla tamamlandı!");
        setLiveLogs(data.build.logs);
        setLastBuild(data.build);
        setBuildHistory((prev) => [data.build, ...prev]);
      }
    } catch (err: any) {
      clearInterval(interval);
      setLiveLogs((prev) => [
        ...prev,
        `[FATAL] Bulut derleme motoru hatası: ${err.message}`,
      ]);
    } finally {
      setIsBuilding(false);
    }
  };

  const copySha = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Control Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Build Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <h2 className="font-bold text-slate-100 text-sm">
                Derleme & Paketleme Parametreleri
              </h2>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              Gradle 8.7 / AGP 8.4
            </span>
          </div>

          {/* Package Format Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Çıktı Paket Formatı:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                { id: "release_apk", title: "Release APK", desc: "İmzalı & Optimize (Direkt Kurulum)" },
                { id: "debug_apk", title: "Debug APK", desc: "Test & Logcat için" },
                { id: "aab_bundle", title: "Play Store (AAB)", desc: "Android App Bundle" },
                { id: "universal_apk", title: "Universal APK", desc: "Tüm CPU mimarileri (Fat APK)" },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSelectedBuildType(opt.id as BuildType)}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    selectedBuildType === opt.id
                      ? "border-cyan-500 bg-cyan-950/30 text-white shadow-md shadow-cyan-500/10"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="font-semibold text-xs flex items-center justify-between">
                    <span>{opt.title}</span>
                    {selectedBuildType === opt.id && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{opt.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Version, SDK & Keystore Options */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Versiyon Adı:</label>
              <input
                type="text"
                value={project.versionName}
                onChange={(e) =>
                  setProject((prev) => ({ ...prev, versionName: e.target.value }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Versiyon Kodu:</label>
              <input
                type="number"
                value={project.versionCode}
                onChange={(e) =>
                  setProject((prev) => ({
                    ...prev,
                    versionCode: parseInt(e.target.value) || 1,
                  }))
                }
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Optimization switches */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">ProGuard / R8 Bytecode Minify</span>
                <p className="text-[10px] text-slate-400">DEX boyutunu küçültür ve tersine mühendisliği zorlaştırır</p>
              </div>
              <input
                type="checkbox"
                checked={project.minifyEnabled}
                onChange={(e) =>
                  setProject((prev) => ({ ...prev, minifyEnabled: e.target.checked }))
                }
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-slate-200">Kaynak Sıkıştırma (shrinkResources)</span>
                <p className="text-[10px] text-slate-400">Kullanılmayan res/drawables ve ses dosyalarını atar</p>
              </div>
              <input
                type="checkbox"
                checked={project.shrinkResources}
                onChange={(e) =>
                  setProject((prev) => ({ ...prev, shrinkResources: e.target.checked }))
                }
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Keystore Signature Scheme */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-xs">
            <label className="font-semibold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>İmza Şeması (Apksigner Scheme):</span>
            </label>
            <select
              value={project.signingScheme}
              onChange={(e) =>
                setProject((prev) => ({
                  ...prev,
                  signingScheme: e.target.value as any,
                }))
              }
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            >
              <option value="v2_v3_v4">V2 + V3 + V4 (Önerilen - Android 7.0 to 15 Tam Uyum)</option>
              <option value="v1">V1 Jar İmzalama (Eski Cihazlar)</option>
            </select>
          </div>

          {/* Start Build Button */}
          <button
            onClick={runBuild}
            disabled={isBuilding}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              isBuilding
                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 via-indigo-600 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-white shadow-cyan-500/25 active:scale-98"
            }`}
          >
            {isBuilding ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Bulut Motoru Derliyor (%{progressPercent})...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Bulutta Derle ve Paketi Üret</span>
              </>
            )}
          </button>
        </div>

        {/* Right: Live Terminal & Build Telemetry (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col h-[520px] shadow-2xl overflow-hidden font-mono text-xs">
          {/* Terminal Window Header */}
          <div className="bg-slate-900 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-slate-300 font-semibold ml-2 text-[11px] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                droidcraft-builder@worker-eu-frankfurt:~
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px]">
              <span className="text-slate-500">Auto-Scroll: On</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">ANSI 256</span>
            </div>
          </div>

          {/* Progress Bar (Visible while building) */}
          {isBuilding && (
            <div className="bg-slate-900/90 border-b border-slate-800 p-2.5">
              <div className="flex items-center justify-between text-[11px] text-cyan-300 mb-1">
                <span>{currentStepText}</span>
                <span className="font-bold">%{progressPercent}</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-indigo-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Scrollable Terminal Output */}
          <div className="flex-1 p-4 overflow-y-auto space-y-1 text-slate-300 selection:bg-cyan-500/40">
            {liveLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Cpu className="w-8 h-8 opacity-40 text-slate-400 animate-pulse" />
                <p>Derleme motoru beklemede. Başlatmak için sol taraftaki butona basın.</p>
              </div>
            ) : (
              liveLogs.map((line, idx) => {
                let colorClass = "text-slate-300";
                if (line.includes("[SUCCESS]") || line.includes("SUCCESSFUL"))
                  colorClass = "text-emerald-400 font-bold";
                else if (line.includes("[FATAL]") || line.includes("ERROR"))
                  colorClass = "text-rose-400 font-bold";
                else if (line.includes("[STEP"))
                  colorClass = "text-cyan-300";
                else if (line.includes("[CONFIG]") || line.includes("[INIT]"))
                  colorClass = "text-indigo-300";
                else if (line.includes("[GRADLE]"))
                  colorClass = "text-amber-300";

                return (
                  <div key={idx} className={`${colorClass} leading-relaxed break-all`}>
                    {line}
                  </div>
                );
              })
            )}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>

      {/* Latest Generated Artifact Showcase & Verification */}
      {lastBuild && (
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-800/40 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">
                  Paket Üretimi Başarılı: {lastBuild.projectName}-{lastBuild.version}.apk
                </h3>
                <p className="text-slate-400 text-xs">
                  {lastBuild.buildType.toUpperCase()} • {lastBuild.fileSizeMb} MB • {lastBuild.durationSeconds} saniyede derlendi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* QR Code button */}
              <button
                onClick={() => setShowQrModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>QR İle Telefona Yükle</span>
              </button>

              {/* Download APK button */}
              <a
                href={lastBuild.downloadUrl}
                download
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>APK İndir ({lastBuild.fileSizeMb} MB)</span>
              </a>
            </div>
          </div>

          {/* SHA-256 Hash and Signature Verification */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 bg-slate-950/80 border border-slate-800 rounded-xl p-3 text-xs">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-slate-400 font-semibold text-[11px] shrink-0">
                SHA-256 Doğrulama Özeti:
              </span>
              <code className="text-cyan-300 font-mono text-[11px] truncate">
                {lastBuild.sha256}
              </code>
            </div>

            <button
              onClick={() => copySha(lastBuild.sha256)}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-cyan-300 shrink-0 self-end md:self-auto"
            >
              {copiedSha ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSha ? "Kopyalandı!" : "Hash Kopyala"}</span>
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal for Direct Mobile Installation */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto">
              <QrCode className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base">
                Fiziksel Cihaza Doğrudan Yükle
              </h3>
              <p className="text-slate-400 text-xs mt-1">
                Android telefonunuzun kamerasını veya QR okuyucusunu bu koda tutarak APK paketini anında indirin ve kurun.
              </p>
            </div>

            {/* Generated QR Code SVG Visualization */}
            <div className="p-4 bg-white rounded-xl inline-block shadow-inner mx-auto">
              <svg
                className="w-48 h-48"
                viewBox="0 0 100 100"
                fill="black"
              >
                {/* SVG pattern simulating QR Code */}
                <rect width="100" height="100" fill="white" />
                <rect x="10" y="10" width="25" height="25" fill="black" />
                <rect x="15" y="15" width="15" height="15" fill="white" />
                <rect x="18" y="18" width="9" height="9" fill="black" />

                <rect x="65" y="10" width="25" height="25" fill="black" />
                <rect x="70" y="15" width="15" height="15" fill="white" />
                <rect x="73" y="18" width="9" height="9" fill="black" />

                <rect x="10" y="65" width="25" height="25" fill="black" />
                <rect x="15" y="70" width="15" height="15" fill="white" />
                <rect x="18" y="73" width="9" height="9" fill="black" />

                {/* Random matrix bits */}
                <rect x="40" y="12" width="6" height="6" fill="black" />
                <rect x="52" y="15" width="6" height="12" fill="black" />
                <rect x="42" y="25" width="8" height="6" fill="black" />
                <rect x="12" y="45" width="6" height="12" fill="black" />
                <rect x="25" y="42" width="10" height="6" fill="black" />
                <rect x="42" y="42" width="16" height="16" fill="black" />
                <rect x="46" y="46" width="8" height="8" fill="white" />
                <rect x="65" y="45" width="10" height="6" fill="black" />
                <rect x="80" y="42" width="8" height="14" fill="black" />
                <rect x="42" y="65" width="12" height="6" fill="black" />
                <rect x="60" y="65" width="8" height="10" fill="black" />
                <rect x="75" y="62" width="15" height="8" fill="black" />
                <rect x="45" y="78" width="8" height="12" fill="black" />
                <rect x="65" y="80" width="22" height="8" fill="black" />
              </svg>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              URL: {typeof window !== "undefined" ? window.location.origin : ""}/api/download/{lastBuild?.id || "latest"}
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              Kapat
            </button>
          </div>
        </div>
      )}

      {/* Build History Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-slate-200 text-sm">
              Geçmiş Derleme Kayıtları ({buildHistory.length})
            </h3>
          </div>
          <button
            onClick={fetchHistory}
            className="p-1 hover:text-cyan-400 text-slate-500 transition-colors"
            title="Yenile"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2 px-3 font-semibold">Derleme ID</th>
                <th className="py-2 px-3 font-semibold">Proje</th>
                <th className="py-2 px-3 font-semibold">Format</th>
                <th className="py-2 px-3 font-semibold">Dil</th>
                <th className="py-2 px-3 font-semibold">Boyut</th>
                <th className="py-2 px-3 font-semibold">Süre</th>
                <th className="py-2 px-3 font-semibold">Tarih</th>
                <th className="py-2 px-3 font-semibold text-right">Eylem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
              {buildHistory.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-cyan-400">{b.id}</td>
                  <td className="py-2.5 px-3 font-sans">
                    <div>{b.projectName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{b.packageName}</div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300">
                      {b.buildType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-400">{b.language}</td>
                  <td className="py-2.5 px-3 text-emerald-400">{b.fileSizeMb} MB</td>
                  <td className="py-2.5 px-3">{b.durationSeconds}s</td>
                  <td className="py-2.5 px-3 text-slate-500 text-[11px] font-sans">
                    {new Date(b.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <a
                      href={b.downloadUrl}
                      download
                      className="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-sans"
                    >
                      <Download className="w-3 h-3" />
                      <span>İndir</span>
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
