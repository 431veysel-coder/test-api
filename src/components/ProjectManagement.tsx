import React, { useState, useEffect } from "react";
import {
  Kanban,
  Clock,
  FileText,
  Plus,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Tag,
  User,
  Calendar,
  Download,
  Share2,
  Sparkles,
} from "lucide-react";
import { KanbanTask, ProjectConfig } from "../types";

interface ProjectManagementProps {
  project: ProjectConfig;
}

export const ProjectManagement: React.FC<ProjectManagementProps> = ({ project }) => {
  const [tasks, setTasks] = useState<KanbanTask[]>([]);
  const [activeTimerSeconds, setActiveTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [currentTimerTask, setCurrentTimerTask] = useState<string>("Sürüm v2.4 Modül Entegrasyonu");
  const [showNewTaskModal, setShowNewTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>("");
  const [newTaskPriority, setNewTaskPriority] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      if (data.tasks) {
        setTasks(data.tasks);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setActiveTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const hrs = Math.floor(mins / 60);
    return `${hrs.toString().padStart(2, "0")}:${(mins % 60)
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const moveTaskStatus = async (taskId: string, newStatus: KanbanTask["status"]) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          priority: newTaskPriority,
          status: "backlog",
          assignee: { name: "Ahmet Yılmaz", avatar: "👨‍💻", role: "Mobile Lead" },
          tags: ["Mobile", "Android 15"],
          timeSpentMinutes: 0,
        }),
      });
      const data = await res.json();
      if (data.task) {
        setTasks((prev) => [data.task, ...prev]);
        setNewTaskTitle("");
        setShowNewTaskModal(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const generateSprintReport = () => {
    const doneTasks = tasks.filter((t) => t.status === "done");
    const inProgress = tasks.filter((t) => t.status === "in_progress");
    const totalMinutes = tasks.reduce((acc, t) => acc + t.timeSpentMinutes, 0);

    const report = `# DROIDCRaft MOBİL GELİŞTİRME & SPRINT RAPORU
Tarih: ${new Date().toLocaleDateString("tr-TR")}
Proje: ${project.name} (${project.packageName})
Versiyon: ${project.versionName} (Kod: ${project.versionCode})
Hedef SDK: Android 15 (API 35) • Dil: ${project.language.toUpperCase()}

---

## 1. SPRINT PERFORMANS ÖZETİ
- Toplam Görev Sayısı: ${tasks.length}
- Tamamlanan Görevler: ${doneTasks.length} (%${Math.round((doneTasks.length / (tasks.length || 1)) * 100)})
- Devam Eden Görevler: ${inProgress.length}
- Harcanan Toplam Zaman: ${Math.round(totalMinutes / 60)} saat ${totalMinutes % 60} dakika

## 2. TAMAMLANAN MİLESTONELAR
${doneTasks.map((t) => `- [x] ${t.title} (${t.priority.toUpperCase()} - ${t.assignee.name})`).join("\n")}

## 3. DEVAM EDEN GÖREVLER
${inProgress.map((t) => `- [ ] ${t.title} (Sorumlu: ${t.assignee.name})`).join("\n")}

## 4. GÜVENLİK & DERLEME BEYANI
- ProGuard / R8 Bytecode Karartması: ${project.minifyEnabled ? "AKTİF" : "DEVRE DIŞI"}
- İmza Doğrulama Şeması: ${project.signingScheme.toUpperCase()}
- Rapor Durumu: Otomatik Üretildi (DroidCraft Cloud OS)`;

    setGeneratedReport(report);
  };

  const columns = [
    { id: "backlog", label: "Talep Havuzu (Backlog)", badge: "bg-slate-800 text-slate-300" },
    { id: "in_progress", label: "Geliştirmede (In Progress)", badge: "bg-cyan-950 text-cyan-400 border border-cyan-800/50" },
    { id: "review", label: "Kod İnceleme (Review)", badge: "bg-indigo-950 text-indigo-300 border border-indigo-800/50" },
    { id: "done", label: "Tamamlandı (Done)", badge: "bg-emerald-950 text-emerald-300 border border-emerald-800/50" },
  ];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner: Time Tracker & Sprint Velocity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Pomodoro / Active Task Time Tracker (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Geliştirici Zaman Yönetimi (Time Tracker)</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
              Sprint 24
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-center space-y-2">
            <div className="text-[11px] text-slate-400 truncate">
              Aktif Görev: <span className="text-slate-200 font-semibold">{currentTimerTask}</span>
            </div>
            <div className="text-3xl md:text-4xl font-mono font-bold text-cyan-400 tracking-wider">
              {formatTimer(activeTimerSeconds)}
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  isTimerRunning
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                }`}
              >
                {isTimerRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isTimerRunning ? "Duraklat" : "Zamanlayıcıyı Başlat"}</span>
              </button>
              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setActiveTimerSeconds(0);
                }}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                title="Sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Sprint Hızı (Velocity)</div>
              <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">38 Puan</div>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <div className="text-slate-400 text-[11px]">Sprint Bitişi</div>
              <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">3 Gün Kaldı</div>
            </div>
          </div>
        </div>

        {/* Right: Automated Reporting Suite (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Otomatik Raporlama ve Sürüm Bülteni</span>
              </div>
              <button
                onClick={generateSprintReport}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-semibold shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Rapor Üret (1 Tıkla)</span>
              </button>
            </div>

            <p className="text-slate-400 text-xs mt-2">
              Sprint görevlerini, tamamlanan modülleri, derleme sürelerini ve test sonuçlarını anında kurumsal bir bültene dönüştürün.
            </p>
          </div>

          {generatedReport ? (
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-cyan-300">Markdown Rapor Önizleme:</span>
                <button
                  onClick={() => {
                    const blob = new Blob([generatedReport], { type: "text/markdown" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `droidcraft-sprint-report-v${project.versionName}.md`;
                    a.click();
                  }}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:underline"
                >
                  <Download className="w-3 h-3" />
                  <span>İndir (.md)</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
                {generatedReport}
              </pre>
            </div>
          ) : (
            <div className="p-6 border border-dashed border-slate-800 rounded-xl bg-slate-950/40 text-center text-slate-500 text-xs">
              Yukarıdaki 'Rapor Üret' butonuna basarak otomatik sprint dokümantasyonunu sentezleyin.
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Kanban className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white text-base">
              Yazılım Ekibi Görev & Süreç Panosu (Kanban)
            </h2>
          </div>

          <button
            onClick={() => setShowNewTaskModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Görev Ekle</span>
          </button>
        </div>

        {/* 4 Column Kanban Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 flex flex-col min-h-[460px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800 mb-3">
                  <h3 className="font-bold text-xs text-slate-200">{col.label}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${col.badge}`}>
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks List */}
                <div className="flex-1 space-y-2.5 overflow-y-auto">
                  {colTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition-all space-y-2 shadow-sm text-xs group"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-slate-100 group-hover:text-cyan-300 transition-colors">
                          {t.title}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded shrink-0 ${
                            t.priority === "critical"
                              ? "bg-rose-950 text-rose-300 border border-rose-800/50"
                              : t.priority === "high"
                              ? "bg-amber-950 text-amber-300 border border-amber-800/50"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <p className="text-slate-400 text-[11px] line-clamp-2">{t.description}</p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span>{t.assignee.avatar}</span>
                          <span className="truncate max-w-[80px]">{t.assignee.name.split(" ")[0]}</span>
                        </div>

                        <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500">
                          <Clock className="w-3 h-3 text-cyan-400" />
                          <span>{t.timeSpentMinutes}dk</span>
                        </div>
                      </div>

                      {/* Quick Move Status Selector */}
                      <div className="pt-1 flex items-center justify-between text-[10px]">
                        <span className="text-slate-500">Taşı:</span>
                        <div className="flex gap-1">
                          {columns
                            .filter((c) => c.id !== t.status)
                            .map((targetCol) => (
                              <button
                                key={targetCol.id}
                                onClick={() => moveTaskStatus(t.id, targetCol.id as any)}
                                className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                              >
                                {targetCol.id.slice(0, 3)}
                              </button>
                            ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-base">Yeni Geliştirme Görevi Oluştur</h3>
            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">Görev Başlığı:</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kotlin 2.0 Coroutines akış optimizasyonu"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">Öncelik:</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik (Bloker)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-white font-bold"
                >
                  Görevi Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
