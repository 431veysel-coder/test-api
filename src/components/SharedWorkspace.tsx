/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Users,
  BookOpen,
  Activity,
  Cpu,
  Smartphone,
  Plus,
  Bot,
  User,
  Sparkles,
  Cloud,
  CheckCircle2,
  Clock,
  Play,
  Download,
  QrCode,
  ShieldCheck,
  Zap,
  RotateCw,
  FolderGit2,
} from "lucide-react";
import { useFirebase } from "../context/FirebaseContext";
import { ProjectConfig } from "../types";

interface SharedWorkspaceProps {
  project: ProjectConfig;
  onNavigateTab: (tab: string) => void;
}

export const SharedWorkspace: React.FC<SharedWorkspaceProps> = ({ project, onNavigateTab }) => {
  const { notes, addNote, user } = useFirebase();

  const [activeSubTab, setActiveSubTab] = useState<"notes" | "automations" | "production" | "preview">("notes");

  // New Note Modal
  const [showAddNoteModal, setShowAddNoteModal] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newCategory, setNewCategory] = useState<"general" | "architecture" | "jvm" | "vscode" | "dependencies" | "build" | "cache">("architecture");
  const [newContent, setNewContent] = useState<string>("");
  const [authorType, setAuthorType] = useState<"user" | "ai">("user");
  const [notification, setNotification] = useState<string | null>(null);

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      await addNote({
        title: `${authorType === "ai" ? "🤖 [AI Ajan] " : "👤 "} ${newTitle}`,
        category: newCategory,
        content: newContent,
        tags: ["shared-workspace", authorType, newCategory],
      });
      setShowAddNoteModal(false);
      setNewTitle("");
      setNewContent("");
      setNotification("Ortak not başarıyla kaydedildi ve tüm ajanlarla senkronize edildi!");
      setTimeout(() => setNotification(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-slate-100 text-sm md:text-base">
                Ortak Çalışma Alanı (Shared AI & Human Workspace)
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/40 text-indigo-300 text-[10px] font-mono">
                Collaborative Intelligence
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Kullanıcı ve yapay zeka ajanlarının ortaklaşa not aldığı, otomasyonları izlediği, üretim sürecini ve mobil önizlemeyi yönettiği birleşik merkez.
            </p>
          </div>
        </div>

        {/* Workspace 4-Way Nav */}
        <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs flex-wrap">
          <button
            onClick={() => setActiveSubTab("notes")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "notes"
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Ortak Notlar ({notes.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("automations")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "automations"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Otomasyon Takip</span>
          </button>

          <button
            onClick={() => setActiveSubTab("production")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "production"
                ? "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Üretim Bölümü</span>
          </button>

          <button
            onClick={() => setActiveSubTab("preview")}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === "preview"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Önizleme Bölümü</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* SECTION 1: SHARED NOTES (ORTAK NOTLAR) */}
      {activeSubTab === "notes" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-bold text-white text-sm">Ortak Notlar & Karar Defteri</h3>
              <p className="text-xs text-slate-400">
                Hem siz hem de AI mobil mimarları (Gemini/Claude) buraya öğrenilenleri, yapılacakları ve mimari kararları düşer.
              </p>
            </div>
            <button
              onClick={() => setShowAddNoteModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Yeni Ortak Not Ekle</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map((note) => {
              const isAi = note.title.includes("🤖") || note.tags?.includes("ai");
              return (
                <div
                  key={note.id}
                  className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3 shadow-lg flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                        {note.category.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        {isAi ? <Bot className="w-3 h-3 text-purple-400" /> : <User className="w-3 h-3 text-cyan-400" />}
                        {isAi ? "Yapay Zeka" : "Kullanıcı"}
                      </span>
                    </div>

                    <h4 className="font-bold text-white text-sm leading-snug">{note.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <div className="flex items-center gap-1 flex-wrap">
                      {note.tags?.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add Note Modal */}
          {showAddNoteModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="font-bold text-white text-sm">Ortak Not Defterine Ekle</h3>
                  <button onClick={() => setShowAddNoteModal(false)} className="text-slate-400 hover:text-white">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleCreateNote} className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Yazar Kimliği:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAuthorType("user")}
                        className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                          authorType === "user"
                            ? "bg-cyan-600/20 border-cyan-500 text-cyan-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <User className="w-3.5 h-3.5" />
                        <span>Kullanıcı (Siz)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAuthorType("ai")}
                        className={`p-2 rounded-xl border text-center font-bold flex items-center justify-center gap-1.5 ${
                          authorType === "ai"
                            ? "bg-purple-600/20 border-purple-500 text-purple-300"
                            : "bg-slate-950 border-slate-800 text-slate-400"
                        }`}
                      >
                        <Bot className="w-3.5 h-3.5" />
                        <span>Yapay Zeka Ajanı</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Kategori:</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                    >
                      <option value="architecture">Mobil Mimari & Kotlin</option>
                      <option value="build">Derleme, Gradle & NDK</option>
                      <option value="learned">Öğrenilen Dersler</option>
                      <option value="todo">Yapılacaklar (TODO)</option>
                      <option value="not_to_do">Yapılmayacaklar (NOT-TO-DO)</option>
                      <option value="security">Güvenlik & Keystore</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Başlık:</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Örn: Android 15 16KB Sayfa Hizalama Kuralı..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">İçerik:</label>
                    <textarea
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      placeholder="Not detayları, kod parçaları veya yönergeler..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 h-24 focus:outline-none resize-none font-mono"
                      required
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddNoteModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold hover:bg-slate-700"
                    >
                      İptal
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow"
                    >
                      Notu Kaydet
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: AUTOMATION MONITOR (OTOMASYON TAKİP) */}
      {activeSubTab === "automations" && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-bold text-white text-sm">Canlı Otomasyon Takip & İşlem Merkezi</h3>
              <p className="text-xs text-slate-400">
                Tarayıcı ve terminal otomasyonlarının anlık durumları, cron zamanlayıcıları ve geçmiş başarı oranları.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("automations")}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>Otomasyonlar Stüdyosuna Git</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400">Tarayıcı Görevleri</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">3 Aktif Akış</div>
              <p className="text-xs text-slate-400">Android 15 NDK ve Google Play politikaları tarayıcıları devrede.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">Terminal Shell Betikleri</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-2xl font-bold font-mono text-white">3 Aktif Betik</div>
              <p className="text-xs text-slate-400">Gradle assembleRelease, zipalign ve SQLite bakım otomasyonları hazır.</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-400">Genel Başarı Oranı</span>
                <span className="text-xs font-mono text-emerald-400">%100</span>
              </div>
              <div className="text-2xl font-bold font-mono text-white">0 Hata</div>
              <p className="text-xs text-slate-400">Tüm otonom test ve derleme zincirleri son 24 saatte hatasız tamamlandı.</p>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: PRODUCTION STUDIO (ÜRETİM BÖLÜMÜ) */}
      {activeSubTab === "production" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Mobil Üretim & Derleme Montaj Hattı</h3>
                <p className="text-xs text-slate-400">
                  Aktif proje: <span className="text-cyan-300 font-mono">{project.packageName}</span> (v{project.versionName})
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigateTab("build")}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
                >
                  <Cpu className="w-4 h-4" />
                  <span>Derleme Motorunu Başlat</span>
                </button>
              </div>
            </div>

            {/* Pipeline Stage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">1. AŞAMA</span>
                <h4 className="text-xs font-bold text-white">Modül Sentezi</h4>
                <p className="text-[11px] text-slate-400">{project.activeModules.length} Modül bağlı ve aktif</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-indigo-400 font-bold">2. AŞAMA</span>
                <h4 className="text-xs font-bold text-white">Kotlin 2.0 / K2</h4>
                <p className="text-[11px] text-slate-400">K2 Compiler + Jetpack Compose 1.7</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-purple-400 font-bold">3. AŞAMA</span>
                <h4 className="text-xs font-bold text-white">R8 Karartma & NDK</h4>
                <p className="text-[11px] text-slate-400">16KB Sayfa Hizalama + DEX Shrink</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 font-bold">4. AŞAMA</span>
                <h4 className="text-xs font-bold text-white">Paketleme & İmza</h4>
                <p className="text-[11px] text-slate-400">Keystore v2+v3+v4 İmzalı APK/AAB</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: UNIVERSAL LIVE PREVIEW (ÖNİZLEME BÖLÜMÜ) */}
      {activeSubTab === "preview" && (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-sm">Canlı Mobil Cihaz Önizlemesi</h3>
                <p className="text-xs text-slate-400">
                  Android 15 (API 35) Pixel 9 Pro simülasyonu ve gerçek telefona yükleme seçenekleri.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab("preview")}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all flex items-center gap-1.5"
              >
                <Smartphone className="w-4 h-4" />
                <span>Tam Ekran Simülatöre Git</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              {/* Phone Frame Representation */}
              <div className="mx-auto w-64 h-[440px] rounded-[36px] bg-slate-950 border-4 border-slate-800 p-3 shadow-2xl relative flex flex-col justify-between">
                <div className="w-20 h-4 bg-slate-800 rounded-full mx-auto mb-2" />

                <div className="flex-1 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 p-3 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-cyan-400">
                      <span>{project.name}</span>
                      <span>v{project.versionName}</span>
                    </div>

                    <div className="w-full h-24 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-300 text-xs font-bold">
                      Canlı Uygulama Ekranı
                    </div>

                    <div className="space-y-1">
                      <div className="h-3 w-3/4 bg-slate-800 rounded" />
                      <div className="h-2.5 w-1/2 bg-slate-800/60 rounded" />
                    </div>
                  </div>

                  <div className="text-[10px] text-center text-emerald-400 font-mono py-1 rounded bg-emerald-950/40 border border-emerald-800/40">
                    ✓ API 35 (Android 15) Uyumlu
                  </div>
                </div>

                <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
              </div>

              {/* Install Options & Artifacts */}
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>APK Doğrudan İndirme</span>
                  </span>
                  <p className="text-xs text-slate-400">
                    Derlenen universal ve release APK dosyalarını cihazınıza indirip anında test edebilirsiniz.
                  </p>
                  <a
                    href="#download"
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigateTab("build");
                    }}
                    className="inline-block px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow"
                  >
                    APK Paketini İndir (v{project.versionName})
                  </a>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-emerald-400" />
                    <span>Telefona Kablosuz Yükleme (ADB / WiFi)</span>
                  </span>
                  <p className="text-xs text-slate-400">
                    Cihazınızın kamerasını kullanarak QR kod ile APK'yı kablosuz ağ üzerinden yükleyin.
                  </p>
                  <div className="text-xs font-mono text-emerald-300">adb connect 192.168.1.100:5555</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
