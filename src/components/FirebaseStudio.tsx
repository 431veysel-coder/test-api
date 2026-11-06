/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import {
  Database,
  Cloud,
  FileText,
  FolderGit2,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lightbulb,
  Plus,
  Trash2,
  LogIn,
  LogOut,
  Shield,
  Activity,
  Layers,
  Code,
  Sliders,
  Cpu,
  Package,
  Server,
  Zap,
  HardDrive,
  ExternalLink,
  RefreshCw,
  Search,
  Tag,
  Check,
} from "lucide-react";
import { useFirebase, FirebaseNote, KnowledgeItem } from "../context/FirebaseContext";
import { ProjectConfig } from "../types";

interface FirebaseStudioProps {
  currentProject: ProjectConfig;
  onLoadProject: (config: Partial<ProjectConfig>) => void;
}

export const FirebaseStudio: React.FC<FirebaseStudioProps> = ({
  currentProject,
  onLoadProject,
}) => {
  const {
    user,
    authLoading,
    connectionStatus,
    signInWithGoogle,
    signOut,
    notes,
    addNote,
    deleteNote,
    cloudProjects,
    saveProjectToCloud,
    deleteCloudProject,
    knowledgeItems,
    addKnowledgeItem,
    toggleKnowledgeStatus,
    deleteKnowledgeItem,
    devConfig,
    saveDevConfig,
    refreshConnection,
  } = useFirebase();

  const [activeSubTab, setActiveSubTab] = useState<
    "notes" | "projects" | "knowledge" | "vscode_jvm" | "cache" | "overview"
  >("overview");

  // Notes Form State
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [newNoteCategory, setNewNoteCategory] = useState<
    "general" | "architecture" | "jvm" | "vscode" | "dependencies" | "build" | "cache"
  >("general");
  const [newNoteTags, setNewNoteTags] = useState("");
  const [noteSearch, setNoteSearch] = useState("");

  // Knowledge Form State
  const [newKnowTitle, setNewKnowTitle] = useState("");
  const [newKnowType, setNewKnowType] = useState<"learned" | "todo" | "not_to_do" | "best_practice">(
    "learned"
  );
  const [newKnowDesc, setNewKnowDesc] = useState("");
  const [newKnowPriority, setNewKnowPriority] = useState<"low" | "medium" | "high" | "critical">("medium");

  // VSCode & JVM Edit State
  const [jvmVersion, setJvmVersion] = useState(devConfig?.jvmVersion || "OpenJDK 21.0.5 LTS");
  const [gradleVersion, setGradleVersion] = useState(devConfig?.gradleVersion || "Gradle 8.7");
  const [extensionsInput, setExtensionsInput] = useState(
    devConfig?.vscodeExtensions?.join(", ") ||
      "vscjava.vscode-java-pack, fwcd.kotlin, Dart-Code.flutter, ms-vscode.cpptools"
  );
  const [cachePolicy, setCachePolicy] = useState(devConfig?.cachePolicy || "aggressive-gradle-daemon-cache-enabled");
  const [depNotes, setDepNotes] = useState(
    devConfig?.dependencyNotes || "AndroidX Core KTX 1.15, Jetpack Compose 1.7, Coroutines 1.9, NDK r27c 16KB"
  );
  const [isSavingEnv, setIsSavingEnv] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Sync devConfig when loaded
  React.useEffect(() => {
    if (devConfig) {
      setJvmVersion(devConfig.jvmVersion);
      setGradleVersion(devConfig.gradleVersion);
      setExtensionsInput(devConfig.vscodeExtensions?.join(", ") || "");
      setCachePolicy(devConfig.cachePolicy);
      setDepNotes(devConfig.dependencyNotes);
    }
  }, [devConfig]);

  // Handle Note Submission
  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const tags = newNoteTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    await addNote({
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      category: newNoteCategory,
      tags,
    });
    setNewNoteTitle("");
    setNewNoteContent("");
    setNewNoteTags("");
  };

  // Handle Knowledge Submission
  const handleCreateKnowledge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKnowTitle.trim() || !newKnowDesc.trim()) return;
    await addKnowledgeItem({
      title: newKnowTitle.trim(),
      type: newKnowType,
      description: newKnowDesc.trim(),
      priority: newKnowPriority,
      status: "active",
    });
    setNewKnowTitle("");
    setNewKnowDesc("");
  };

  // Save Dev Env Config
  const handleSaveDevConfig = async () => {
    setIsSavingEnv(true);
    setSaveSuccessMsg(null);
    try {
      const extList = extensionsInput
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);
      await saveDevConfig({
        jvmVersion,
        gradleVersion,
        vscodeExtensions: extList,
        cachePolicy,
        dependencyNotes: depNotes,
      });
      setSaveSuccessMsg("Geliştirme ortamı ve VSCode/JVM ayarları Firestore'a kaydedildi!");
      setTimeout(() => setSaveSuccessMsg(null), 3000);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsSavingEnv(false);
    }
  };

  // Filtered Notes
  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.tags?.some((t) => t.toLowerCase().includes(noteSearch.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-indigo-950/40 border border-amber-500/20 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
              Firebase Firestore & Cloud Sync
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-800/40">
                Enterprise DB Active
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
            Google Cloud Firebase Firestore üzerinde geliştirici notları, mobil projeler, JVM/VSCode eklentileri,
            öğrenilenler ve yapılmayacaklar listesini bulutta güvenle saklayın ve cihazlar arasında senkronize edin.
          </p>
        </div>

        {/* Auth Box */}
        <div className="flex items-center gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800">
          {authLoading ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 px-3 py-1.5">
              <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              <span>Oturum kontrol ediliyor...</span>
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full border border-amber-400/40" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center font-bold text-xs">
                    {user.email?.slice(0, 2).toUpperCase() || "US"}
                  </div>
                )}
                <div className="text-left">
                  <div className="text-xs font-bold text-white truncate max-w-[140px]">
                    {user.displayName || user.email?.split("@")[0]}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-mono">Google ile Bağlı</div>
                </div>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 border border-slate-700 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Google ile Giriş Yap</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        {[
          { id: "overview", label: "Genel Bakış & Durum", icon: Activity },
          { id: "notes", label: `Notlar (${notes.length})`, icon: FileText },
          { id: "projects", label: `Bulut Projeleri (${cloudProjects.length})`, icon: FolderGit2 },
          { id: "knowledge", label: `Bilgi Havuzu & Yapılacaklar (${knowledgeItems.length})`, icon: BookOpen },
          { id: "vscode_jvm", label: "VSCode & JVM Yapılandırması", icon: Code },
          { id: "cache", label: "Önbellek & Bağımlılıklar", icon: HardDrive },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-medium transition-all shrink-0 ${
                isActive
                  ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & STATUS */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Connection & Quota Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Firestore Bağlantısı</span>
                <span className="p-1 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                  <Activity className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Çevrimiçi (Aktif)</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Gecikme Süresi:</span>
                <span className="font-mono text-emerald-400">{connectionStatus?.latencyMs || 24} ms</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Firebase Proje ID</span>
                <span className="p-1 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/40">
                  <Cloud className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xs font-mono font-bold text-cyan-300 truncate">
                gen-lang-client-0751880780
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Bölge:</span>
                <span className="font-mono text-slate-300">europe-west3 (Frankfurt)</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Güvenlik Kuralları</span>
                <span className="p-1 rounded bg-amber-950/60 text-amber-400 border border-amber-800/40">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero-Trust ABAC Kuralları Devrede</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                <span>Durum:</span>
                <span className="font-mono text-emerald-400">DeployRules Verified</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics & Cloud Sync Action */}
          <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Aktif Projeyi Buluta Yedekle</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Mevcut çalışma alanındaki '{currentProject.name}' projesini tek tıkla Firestore veritabanına kaydedin.
                </p>
              </div>
              <button
                onClick={() => {
                  if (!user) {
                    signInWithGoogle();
                    return;
                  }
                  saveProjectToCloud({
                    name: currentProject.name,
                    packageName: currentProject.packageName,
                    versionName: currentProject.versionName,
                    targetSdk: currentProject.targetSdk,
                    language: currentProject.language,
                    activeModules: currentProject.activeModules,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-amber-500/10 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Cloud className="w-4 h-4" />
                <span>Projeyi Buluta Kaydet</span>
              </button>
            </div>

            {/* Collections Summary Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Kayıtlı Notlar</div>
                <div className="text-xl font-mono font-bold text-amber-400">{notes.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Bulut Projeleri</div>
                <div className="text-xl font-mono font-bold text-indigo-400">{cloudProjects.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">Öğrenilen / Yapılacak</div>
                <div className="text-xl font-mono font-bold text-emerald-400">{knowledgeItems.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <div className="text-[11px] text-slate-400">VSCode Eklentileri</div>
                <div className="text-xl font-mono font-bold text-cyan-400">
                  {devConfig?.vscodeExtensions?.length || 6}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NOTES (NOTLAR) */}
      {activeSubTab === "notes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (4 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Yeni Geliştirici Notu Ekle</span>
            </h3>

            <form onSubmit={handleCreateNote} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Başlık</label>
                <input
                  type="text"
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="Örn: Android 15 16KB Sayfa Hizalama Notu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Kategori</label>
                  <select
                    value={newNoteCategory}
                    onChange={(e: any) => setNewNoteCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="general">Genel</option>
                    <option value="architecture">Mimari / Düzen</option>
                    <option value="jvm">JVM & Java</option>
                    <option value="vscode">VSCode / IDE</option>
                    <option value="dependencies">Bağımlılıklar</option>
                    <option value="build">Derleme</option>
                    <option value="cache">Önbellek</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 font-semibold block mb-1">Etiketler (Virgülle)</label>
                  <input
                    type="text"
                    value={newNoteTags}
                    onChange={(e) => setNewNoteTags(e.target.value)}
                    placeholder="ndk, compose, gradle"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Not İçeriği</label>
                <textarea
                  rows={6}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Mimari kararlar, komutlar, dikkat edilecek hususlar veya kod blokları..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!user}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  user
                    ? "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20 active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{user ? "Notu Firestore'a Kaydet" : "Kayıt İçin Giriş Yapın"}</span>
              </button>
            </form>
          </div>

          {/* Right List (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                <input
                  type="text"
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  placeholder="Notlarda veya etiketlerde ara..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>
              <span className="text-xs text-slate-400 font-mono">{filteredNotes.length} Not</span>
            </div>

            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                {user ? "Henüz kayıtlı not yok. Sol taraftan ilk notunuzu ekleyin." : "Notları görüntülemek için lütfen Google ile giriş yapın."}
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {filteredNotes.map((note) => (
                  <div
                    key={note.id}
                    className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/40 text-[10px] font-mono">
                            {note.category.toUpperCase()}
                          </span>
                          <h4 className="text-xs font-bold text-white">{note.title}</h4>
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(note.createdAt).toLocaleString("tr-TR")}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Notu Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
                      {note.content}
                    </p>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {note.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] flex items-center gap-1"
                          >
                            <Tag className="w-2.5 h-2.5" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CLOUD PROJECTS (PROJELER) */}
      {activeSubTab === "projects" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-400" />
              <span>Bulut Mobil Projeleri (Firestore Synced)</span>
            </h3>
            <button
              onClick={() => {
                if (!user) return signInWithGoogle();
                saveProjectToCloud({
                  name: currentProject.name,
                  packageName: currentProject.packageName,
                  versionName: currentProject.versionName,
                  targetSdk: currentProject.targetSdk,
                  language: currentProject.language,
                  activeModules: currentProject.activeModules,
                });
              }}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aktif Projeyi ({currentProject.name}) Buluta Ekle</span>
            </button>
          </div>

          {cloudProjects.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
              {user
                ? "Henüz bulutta kayıtlı mobil projeniz bulunmuyor. 'Aktif Projeyi Buluta Ekle' butonuna basarak mevcut yapılandırmayı kaydedin."
                : "Bulut projelerini görmek için lütfen Google ile oturum açın."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cloudProjects.map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">{p.name}</h4>
                      <div className="text-[10px] text-slate-400 font-mono">{p.packageName}</div>
                    </div>
                    <button
                      onClick={() => deleteCloudProject(p.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-300 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Dil:</span>
                      <span className="text-cyan-400">{p.language}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Target SDK:</span>
                      <span className="text-emerald-400">API {p.targetSdk} (Android 15)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Sürüm:</span>
                      <span>v{p.versionName}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {p.activeModules?.length || 0} Modül
                    </span>
                    <button
                      onClick={() =>
                        onLoadProject({
                          name: p.name,
                          packageName: p.packageName,
                          versionName: p.versionName,
                          targetSdk: p.targetSdk,
                          language: p.language as any,
                          activeModules: p.activeModules,
                        })
                      }
                      className="px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-700/50 text-[11px] font-bold"
                    >
                      Çalışma Alanına Yükle
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: KNOWLEDGE & TODO (ÖĞRENİLENLER, YAPILACAKLAR, YAPILMAYACAKLAR) */}
      {activeSubTab === "knowledge" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 cols) */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>Bilgi & Görev Kaydı Ekle</span>
            </h3>

            <form onSubmit={handleCreateKnowledge} className="space-y-3">
              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Tür</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "learned", label: "💡 Öğrenilen Bilgi", color: "text-amber-400" },
                    { id: "todo", label: "✅ Yapılacak (TODO)", color: "text-cyan-400" },
                    { id: "not_to_do", label: "🚫 Yapılmayacaklar", color: "text-rose-400" },
                    { id: "best_practice", label: "⭐ En İyi Pratik", color: "text-emerald-400" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setNewKnowType(t.id as any)}
                      className={`p-2 rounded-xl border text-left font-bold text-xs transition-all ${
                        newKnowType === t.id
                          ? "bg-slate-800 border-amber-500/60 shadow-sm"
                          : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <span className={t.color}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Başlık</label>
                <input
                  type="text"
                  value={newKnowTitle}
                  onChange={(e) => setNewKnowTitle(e.target.value)}
                  placeholder="Örn: NDK C++ derlemesinde 16KB max-page-size zorunluluğu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Öncelik Derecesi</label>
                <select
                  value={newKnowPriority}
                  onChange={(e: any) => setNewKnowPriority(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="low">Düşük</option>
                  <option value="medium">Orta</option>
                  <option value="high">Yüksek</option>
                  <option value="critical">Kritik (Bloklayıcı)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Açıklama & Detaylar</label>
                <textarea
                  rows={5}
                  value={newKnowDesc}
                  onChange={(e) => setNewKnowDesc(e.target.value)}
                  placeholder="Neden bu şekilde yapılmalı/yapılmamalı, olası hatalar, çözüm adımları..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!user}
                className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  user
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95"
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>{user ? "Kayıt Ekle" : "Giriş Yapın"}</span>
              </button>
            </form>
          </div>

          {/* Right List (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold text-slate-400">Kayıtlı Bilgi ve Kurallar ({knowledgeItems.length})</h4>

            {knowledgeItems.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-slate-500 text-xs">
                Kayıtlı bilgi maddesi bulunmuyor. Sol taraftan ekleyin.
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                {knowledgeItems.map((item) => {
                  const typeBadge =
                    item.type === "not_to_do"
                      ? { bg: "bg-rose-950/60 border-rose-800/40 text-rose-300", label: "🚫 YAPILMAYACAK" }
                      : item.type === "todo"
                      ? { bg: "bg-cyan-950/60 border-cyan-800/40 text-cyan-300", label: "✅ YAPILACAK" }
                      : item.type === "learned"
                      ? { bg: "bg-amber-950/60 border-amber-800/40 text-amber-300", label: "💡 ÖĞRENİLEN" }
                      : { bg: "bg-emerald-950/60 border-emerald-800/40 text-emerald-300", label: "⭐ EN İYİ PRATİK" };

                  return (
                    <div
                      key={item.id}
                      className={`p-4 rounded-xl bg-slate-900/80 border transition-all space-y-2 ${
                        item.status === "completed"
                          ? "border-emerald-800/50 opacity-75"
                          : "border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded border text-[10px] font-mono ${typeBadge.bg}`}>
                              {typeBadge.label}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase">
                              Öncelik: {item.priority}
                            </span>
                          </div>
                          <h4
                            className={`text-xs font-bold ${
                              item.status === "completed" ? "line-through text-slate-400" : "text-white"
                            }`}
                          >
                            {item.title}
                          </h4>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => toggleKnowledgeStatus(item.id, item.status)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-950/40"
                            title={item.status === "completed" ? "Aktife Al" : "Tamamlandı İşaretle"}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteKnowledgeItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/50">
                        {item.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: VSCODE & JVM YAPILANDIRMASI */}
      {activeSubTab === "vscode_jvm" && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" />
              <span>VSCode Uzantıları, JVM & IDE Yapılandırması</span>
            </h3>
            <p className="text-xs text-slate-400">
              Mobil geliştirme ortamı için önerilen VSCode eklentilerini, JVM Heap boyutlarını ve Gradle ayarlarını
              Firestore'da saklayın.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* JVM Settings */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-amber-400" />
                <span>JVM & Gradle Yapılandırması</span>
              </h4>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">JVM Sürümü</label>
                <input
                  type="text"
                  value={jvmVersion}
                  onChange={(e) => setJvmVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">Gradle Sürümü</label>
                <input
                  type="text"
                  value={gradleVersion}
                  onChange={(e) => setGradleVersion(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Önerilen gradle.properties Parametreleri
                </label>
                <pre className="p-2.5 rounded bg-slate-900 text-[10px] text-cyan-300 font-mono leading-relaxed">
                  org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m -Dfile.encoding=UTF-8{"\n"}
                  org.gradle.parallel=true{"\n"}
                  org.gradle.caching=true{"\n"}
                  android.useAndroidX=true
                </pre>
              </div>
            </div>

            {/* VSCode Extensions */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-cyan-400" />
                <span>VSCode Uzantıları & Eklentileri (Extensions)</span>
              </h4>

              <div>
                <label className="text-[11px] text-slate-400 font-semibold block mb-1">
                  Yüklü Eklenti Kimlikleri (Virgülle Ayrılmış)
                </label>
                <textarea
                  rows={4}
                  value={extensionsInput}
                  onChange={(e) => setExtensionsInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
                />
              </div>

              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] text-slate-400 font-semibold">Tavsiye Edilen Mobil Eklentiler:</span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    "vscjava.vscode-java-pack",
                    "fwcd.kotlin",
                    "mathiasfrohlich.Kotlin",
                    "Dart-Code.flutter",
                    "ms-vscode.cpptools",
                    "rust-lang.rust-analyzer",
                  ].map((ext) => (
                    <button
                      key={ext}
                      type="button"
                      onClick={() => {
                        if (!extensionsInput.includes(ext)) {
                          setExtensionsInput((prev) => (prev ? `${prev}, ${ext}` : ext));
                        }
                      }}
                      className="px-2 py-0.5 rounded bg-slate-900 hover:bg-cyan-950/60 hover:text-cyan-300 text-slate-400 border border-slate-800 text-[10px] font-mono"
                    >
                      + {ext}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            {saveSuccessMsg && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-4 h-4" /> {saveSuccessMsg}
              </span>
            )}
            <div className="ml-auto">
              <button
                onClick={handleSaveDevConfig}
                disabled={!user || isSavingEnv}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
              >
                {isSavingEnv ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>Yapılandırmayı Firestore'a Kaydet</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CACHE & DEPENDENCIES (ÖNBELLEK VE BAĞIMLILIKLAR) */}
      {activeSubTab === "cache" && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span>Önbellek (Cache) Politikası & Bağımlılık Yönetimi</span>
            </h3>
            <p className="text-xs text-slate-400">
              Gradle build cache, dependency lock ve AAPT2 derleme önbellek politikalarını düzenleyin.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Önbellek Politikası Seçimi</span>
              </h4>

              <div className="space-y-2">
                {[
                  {
                    id: "aggressive-gradle-daemon-cache-enabled",
                    title: "Agresif Gradle Build Cache (Tavsiye Edilen)",
                    desc: "Artımlı derleme sürelerini %70 kısaltır; DEX ve merge aşamalarını önbelleğe alır.",
                  },
                  {
                    id: "clean-build-every-time",
                    title: "Her Derlemede Temizle (Strict No-Cache)",
                    desc: "Sıfır kalıntı garantisi verir; CI/CD ve final release APK üretiminde tercih edilir.",
                  },
                  {
                    id: "distributed-cloud-cache",
                    title: "Dağıtık Bulut Önbelleği (Distributed Cloud)",
                    desc: "Ekip üyeleri ve worker node'lar arasında derleme çıktılarını senkronize eder.",
                  },
                ].map((pol) => (
                  <button
                    key={pol.id}
                    type="button"
                    onClick={() => setCachePolicy(pol.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all space-y-0.5 ${
                      cachePolicy === pol.id
                        ? "bg-emerald-950/40 border-emerald-500/60 text-white"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-300">{pol.title}</div>
                    <div className="text-[11px] text-slate-400">{pol.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                <Package className="w-3.5 h-3.5 text-indigo-400" />
                <span>Bağımlılıklar & Sürüm Notları</span>
              </h4>

              <textarea
                rows={7}
                value={depNotes}
                onChange={(e) => setDepNotes(e.target.value)}
                placeholder="Bağımlılıklar, kütüphane sürümleri ve conflict çözümleri..."
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono"
              />

              <button
                onClick={handleSaveDevConfig}
                disabled={!user || isSavingEnv}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Önbellek & Bağımlılık Ayarlarını Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
