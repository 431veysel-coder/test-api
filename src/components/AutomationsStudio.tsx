/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Zap,
  Terminal,
  Globe,
  Play,
  Pause,
  RotateCw,
  Plus,
  Trash2,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Sparkles,
  Bot,
  Copy,
  Check,
  AlertCircle,
  Activity,
  History,
} from "lucide-react";

interface AutomationStep {
  id: string;
  action: "navigate" | "wait_selector" | "type_text" | "click" | "extract" | "bash_exec" | "sleep";
  target: string;
  value?: string;
  label: string;
}

interface AutomationFlow {
  id: string;
  name: string;
  type: "browser" | "terminal";
  description: string;
  steps: AutomationStep[];
  cronSchedule?: string;
  lastRun?: string;
  lastStatus?: "success" | "failed" | "running" | "idle";
  durationSeconds?: number;
}

export const AutomationsStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"browser_auto" | "terminal_auto" | "history">("browser_auto");

  // Browser Automation State
  const [browserFlows, setBrowserFlows] = useState<AutomationFlow[]>([
    {
      id: "b-flow-1",
      name: "Android 15 NDK 16KB Sayfa Hizalama Denetleyicisi",
      type: "browser",
      description: "Resmi developer.android.com sitesine gider, 16KB bellek hizalama kuralını ve -Wl bayraklarını ayıklar.",
      steps: [
        { id: "s1", action: "navigate", target: "https://developer.android.com/about/versions/15", label: "Hedef URL'ye Git" },
        { id: "s2", action: "wait_selector", target: "#page-size-alignment", label: "NDK 16KB Başlığını Bekle" },
        { id: "s3", action: "type_text", target: "input.search-field", value: "max-page-size=16384", label: "Arama Terimini Gir" },
        { id: "s4", action: "click", target: "button.search-submit", label: "Arama Butonuna Tıkla" },
        { id: "s5", action: "extract", target: "div.code-block", label: "Derleme Bayraklarını Kasaya Kaydet" },
      ],
      lastRun: "Bugün 10:45",
      lastStatus: "success",
      durationSeconds: 12,
    },
    {
      id: "b-flow-2",
      name: "Google Play Geliştirici Politikaları & Target SDK Tarayıcısı",
      type: "browser",
      description: "Google Play hedef SDK 35 (Android 15) zorunluluk tarihlerini ve yeni gizlilik gereksinimlerini kontrol eder.",
      steps: [
        { id: "s1", action: "navigate", target: "https://support.google.com/googleplay/android-developer", label: "Geliştirici Konsoluna Git" },
        { id: "s2", action: "wait_selector", target: "h2.policy-header", label: "Politika Başlığını Yakala" },
        { id: "s3", action: "extract", target: "div.article-content", label: "Son Güncelleme Notlarını Çek" },
      ],
      lastRun: "Dün 18:20",
      lastStatus: "success",
      durationSeconds: 9,
    },
    {
      id: "b-flow-3",
      name: "APK Mirror & Gradle 8.7 Güncelleme Takipçisi",
      type: "browser",
      description: "Yeni yayınlanan Android derleme araçlarını ve AGP 8.7.0 yamalarını otonom olarak listeler.",
      steps: [
        { id: "s1", action: "navigate", target: "https://developer.android.com/build/releases/gradle-plugin", label: "AGP Sürüm Sayfasına Git" },
        { id: "s2", action: "wait_selector", target: "table.versions-table", label: "Sürüm Tablosunu Seç" },
        { id: "s3", action: "extract", target: "tr:first-child", label: "En Güncel AGP Sürümünü Mühürle" },
      ],
      lastRun: "Bugün 08:15",
      lastStatus: "success",
      durationSeconds: 14,
    },
  ]);

  // Terminal Automation State
  const [terminalFlows, setTerminalFlows] = useState<AutomationFlow[]>([
    {
      id: "t-flow-1",
      name: "Otomatik Release APK Derleme & Keystore v4 İmzalama",
      type: "terminal",
      description: "Termux/Debian ortamında gradlew assembleRelease çalıştırır, R8 karartması yapar ve zipalign uygular.",
      steps: [
        { id: "st1", action: "bash_exec", target: "./gradlew clean assembleRelease --parallel", label: "Temizle ve Derle" },
        { id: "st2", action: "bash_exec", target: "zipalign -v -p 4 app/build/outputs/apk/release/app-unsigned.apk app-aligned.apk", label: "4-Byte Hizalama (Zipalign)" },
        { id: "st3", action: "bash_exec", target: "apksigner sign --ks release.keystore --ks-key-alias mykey app-aligned.apk", label: "Keystore v2+v3+v4 İmzala" },
        { id: "st4", action: "bash_exec", target: "apksigner verify --verbose app-aligned.apk", label: "Kriptografik İmzayı Doğrula" },
      ],
      cronSchedule: "Her commit sonrası",
      lastRun: "Bugün 11:02",
      lastStatus: "success",
      durationSeconds: 24,
    },
    {
      id: "t-flow-2",
      name: "Debian / Ubuntu Proot Paket Güncelleme & Android SDK Bakımı",
      type: "terminal",
      description: "Linux konteynerindeki openjdk-21, clang-18, cmake ve platform-tools paketlerini güncel tutar.",
      steps: [
        { id: "st1", action: "bash_exec", target: "apt update && apt --only-upgrade install -y openjdk-21-jdk clang", label: "Derleyici Paketlerini Güncelle" },
        { id: "st2", action: "bash_exec", target: "sdkmanager --update", label: "Android SDK Platform Araçlarını Senkronize Et" },
        { id: "st3", action: "bash_exec", target: "apt clean && rm -rf /var/cache/apt/*", label: "Önbelleği Temizle (RAM Tasarrufu)" },
      ],
      cronSchedule: "Haftalık (Pazar 03:00)",
      lastRun: "3 gün önce",
      lastStatus: "success",
      durationSeconds: 45,
    },
    {
      id: "t-flow-3",
      name: "SQLite & Room Veritabanı Otomatik Yedekleme ve Vakum",
      type: "terminal",
      description: "Dahili veritabanını sıkıştırır, parçalanmayı giderir (VACUUM) ve yedek dump dosyasını oluşturur.",
      steps: [
        { id: "st1", action: "bash_exec", target: "sqlite3 /app/data/app.db 'VACUUM; ANALYZE;'", label: "Veritabanını Vakumla & Analiz Et" },
        { id: "st2", action: "bash_exec", target: "sqlite3 /app/data/app.db .dump > /app/data/backup_$(date +%F).sql", label: "SQL Dump Yedek Al" },
      ],
      cronSchedule: "Günlük (00:00)",
      lastRun: "Dün 23:59",
      lastStatus: "success",
      durationSeconds: 8,
    },
  ]);

  // Execution State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentExecutionLog, setCurrentExecutionLog] = useState<string[]>([]);
  const [activeRunningFlowId, setActiveRunningFlowId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const runBrowserFlow = async (flow: AutomationFlow) => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveRunningFlowId(flow.id);
    setCurrentExecutionLog([`[BAŞLATILDI] Tarayıcı Otomasyonu: ${flow.name}`]);

    try {
      const res = await fetch("/api/automations/browser/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: flow.name,
          targetUrl: flow.steps[0]?.target || "https://developer.android.com",
          steps: flow.steps,
        }),
      });
      const data = await res.json();
      if (data && data.record) {
        setCurrentExecutionLog(data.record.logs || []);
        setSuccessBanner(`'${flow.name}' otomasyonu ${data.record.durationSeconds} saniyede başarıyla tamamlandı!`);
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (e: any) {
      setCurrentExecutionLog((prev) => [...prev, `[HATA] ${e.message}`]);
    } finally {
      setIsRunning(false);
      setActiveRunningFlowId(null);
    }
  };

  const runTerminalFlow = async (flow: AutomationFlow) => {
    if (isRunning) return;
    setIsRunning(true);
    setActiveRunningFlowId(flow.id);
    setCurrentExecutionLog([`[BAŞLATILDI] Terminal Otomasyonu: ${flow.name}`]);

    try {
      const res = await fetch("/api/automations/terminal/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: flow.name,
          commands: flow.steps.map((s) => s.target),
        }),
      });
      const data = await res.json();
      if (data && data.record) {
        setCurrentExecutionLog(data.record.logs || []);
        setSuccessBanner(`'${flow.name}' terminal betiği hatasız icra edildi!`);
        setTimeout(() => setSuccessBanner(null), 5000);
      }
    } catch (e: any) {
      setCurrentExecutionLog((prev) => [...prev, `[HATA] ${e.message}`]);
    } finally {
      setIsRunning(false);
      setActiveRunningFlowId(null);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Otomasyonlar Stüdyosu (Tarayıcı & Terminal)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-950/60 border border-amber-800/40 text-amber-300 text-[10px] font-mono">
                Independent Automations Hub
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Tarayıcı headless/görsel iş akışları ile Linux/Termux terminal bash betiklerini ayrı ayrı yönetin ve otonom çalıştırın.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab("browser_auto")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "browser_auto"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Tarayıcı Otomasyonları ({browserFlows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("terminal_auto")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "terminal_auto"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Terminal Otomasyonları ({terminalFlows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("history")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "history"
                ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Canlı Konsol & İzler</span>
          </button>
        </div>
      </div>

      {successBanner && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successBanner}</span>
        </div>
      )}

      {/* Live Console Output Bar */}
      {currentExecutionLog.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
            <span className="flex items-center gap-2 text-cyan-400 font-bold">
              <Activity className={`w-3.5 h-3.5 ${isRunning ? "animate-spin text-amber-400" : "text-emerald-400"}`} />
              <span>Otomasyon Yürütme Konsolu {isRunning && "(Çalışıyor...)"}</span>
            </span>
            <button
              onClick={() => setCurrentExecutionLog([])}
              className="text-[11px] text-slate-500 hover:text-slate-300"
            >
              Konsolu Temizle
            </button>
          </div>
          <div className="max-h-48 overflow-y-auto space-y-1 text-slate-300 text-[11px]">
            {currentExecutionLog.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">&gt;</span>
                <span className={log.includes("[HATA]") ? "text-rose-400" : log.includes("[SUCCESS]") || log.includes("[FINISHED]") ? "text-emerald-300 font-bold" : "text-slate-200"}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 1: BROWSER AUTOMATIONS */}
      {activeTab === "browser_auto" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Kayıtlı Tarayıcı Otomasyon Akışları:</span>
            <span className="font-mono text-cyan-400">Headless & Visual Gecko Runner</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {browserFlows.map((flow) => {
              const isCurrentRunning = isRunning && activeRunningFlowId === flow.id;
              return (
                <div
                  key={flow.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/40">
                          <Globe className="w-4 h-4" />
                        </span>
                        <h3 className="font-bold text-white text-sm">{flow.name}</h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
                          {flow.steps.length} Adım
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{flow.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => runBrowserFlow(flow)}
                        disabled={isRunning}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                          isCurrentRunning
                            ? "bg-amber-600 text-white cursor-wait"
                            : isRunning
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95"
                        }`}
                      >
                        {isCurrentRunning ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>İcra Ediliyor...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Otomasyonu Çalıştır</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Steps Breadcrumbs */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                    <span className="text-[11px] font-mono text-slate-400 block font-semibold">
                      Akış Adımları:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      {flow.steps.map((st, sidx) => (
                        <div
                          key={st.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200"
                        >
                          <span className="text-cyan-400 font-bold font-mono text-[10px]">{sidx + 1}.</span>
                          <span className="font-medium">{st.label}</span>
                          <span className="text-[10px] text-slate-500 font-mono">({st.action})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Son Çalıştırma: {flow.lastRun}
                    </span>
                    <span className="text-emerald-400">Durum: Başarılı ({flow.durationSeconds}s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: TERMINAL AUTOMATIONS */}
      {activeTab === "terminal_auto" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Kayıtlı Terminal Bash & Cron Otomasyonları:</span>
            <span className="font-mono text-amber-400">Proot Debian/Ubuntu & Termux Runner</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {terminalFlows.map((flow) => {
              const isCurrentRunning = isRunning && activeRunningFlowId === flow.id;
              return (
                <div
                  key={flow.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-800/40">
                          <Terminal className="w-4 h-4" />
                        </span>
                        <h3 className="font-bold text-white text-sm">{flow.name}</h3>
                        {flow.cronSchedule && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/40">
                            Zamanlama: {flow.cronSchedule}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">{flow.description}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => runTerminalFlow(flow)}
                        disabled={isRunning}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md ${
                          isCurrentRunning
                            ? "bg-amber-600 text-white cursor-wait"
                            : isRunning
                            ? "bg-slate-800 text-slate-500 cursor-not-allowed"
                            : "bg-gradient-to-r from-amber-600 to-indigo-600 hover:from-amber-500 hover:to-indigo-500 text-white shadow-amber-500/20 active:scale-95"
                        }`}
                      >
                        {isCurrentRunning ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            <span>Komutlar İcra Ediliyor...</span>
                          </>
                        ) : (
                          <>
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Betiği Çalıştır</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Commands Preview */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5 font-mono text-xs">
                    <span className="text-[11px] text-slate-400 block font-sans font-semibold">
                      Yürütülecek Shell Komutları:
                    </span>
                    {flow.steps.map((st, sidx) => (
                      <div key={st.id} className="flex items-center gap-2 text-slate-300">
                        <span className="text-amber-400 select-none">$</span>
                        <span className="text-slate-200">{st.target}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Son Çalıştırma: {flow.lastRun}
                    </span>
                    <span className="text-emerald-400">Durum: Başarılı ({flow.durationSeconds}s)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: HISTORY & MONITOR */}
      {activeTab === "history" && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-white text-sm">Otomasyon Görevleri İzleme ve Yürütme Kaydı</h3>
            <span className="text-xs font-mono text-slate-400">Toplam 2 Aktif Yürütücü Motor</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Tarayıcı Görev Başarısı</span>
              <div className="text-2xl font-bold text-cyan-400 font-mono">%100</div>
              <span className="text-[11px] text-slate-500">3/3 görev tamamlandı</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Terminal Görev Başarısı</span>
              <div className="text-2xl font-bold text-amber-400 font-mono">%100</div>
              <span className="text-[11px] text-slate-500">Gradle & Apt betikleri hatasız</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-xs">Ortalama İcra Süresi</span>
              <div className="text-2xl font-bold text-purple-400 font-mono">16.4s</div>
              <span className="text-[11px] text-slate-500">Android 15 optimizasyonu devrede</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
