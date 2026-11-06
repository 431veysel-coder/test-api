import React, { useState } from "react";
import {
  Boxes,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Shield,
  Layers,
  ArrowRight,
  Sparkles,
  Info,
  Maximize2,
  FileCode,
  Zap,
} from "lucide-react";
import { MobileModule, ProjectConfig, SupportedLanguage } from "../types";
import { AVAILABLE_MODULES } from "../data/modulesData";

interface ModuleCanvasProps {
  project: ProjectConfig;
  setProject: React.Dispatch<React.SetStateAction<ProjectConfig>>;
  onGoToCode: () => void;
  onGoToBuild: () => void;
}

export const ModuleCanvas: React.FC<ModuleCanvasProps> = ({
  project,
  setProject,
  onGoToCode,
  onGoToBuild,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [inspectingModule, setInspectingModule] = useState<MobileModule | null>(
    AVAILABLE_MODULES[0]
  );
  const [draggingModuleId, setDraggingModuleId] = useState<string | null>(null);

  const categories = [
    { id: "all", label: "Tüm Modüller" },
    { id: "hardware", label: "Donanım (Kamera/BLE/GPS)" },
    { id: "auth_security", label: "Güvenlik & Biyometri" },
    { id: "storage", label: "Veritabanı (Room/SQLite)" },
    { id: "networking", label: "Ağ & Bildirim (FCM)" },
    { id: "ui_media", label: "UI & Medya (Compose)" },
    { id: "monetization", label: "Ödeme & Gelir (Play)" },
    { id: "ai_sensors", label: "Cihaz İçi AI (ML Kit)" },
  ];

  const filteredModules = AVAILABLE_MODULES.filter((mod) => {
    const matchesCat =
      selectedCategory === "all" || mod.category === selectedCategory;
    const matchesQuery =
      mod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mod.permissions.some((p) =>
        p.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return matchesCat && matchesQuery;
  });

  const activeModuleObjects = project.activeModules
    .map((id) => AVAILABLE_MODULES.find((m) => m.id === id))
    .filter(Boolean) as MobileModule[];

  // Calculate size impact
  const totalModuleSizeKb = activeModuleObjects.reduce(
    (acc, m) => acc + m.sizeImpactKb,
    0
  );
  const estimatedApkSizeMb = (7.8 + totalModuleSizeKb / 1024).toFixed(1);

  // All active permissions combined
  const combinedPermissions = Array.from(
    new Set(activeModuleObjects.flatMap((m) => m.permissions))
  );

  const toggleModule = (id: string) => {
    setProject((prev) => {
      const exists = prev.activeModules.includes(id);
      return {
        ...prev,
        activeModules: exists
          ? prev.activeModules.filter((m) => m !== id)
          : [...prev.activeModules, id],
      };
    });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id);
    setDraggingModuleId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain") || draggingModuleId;
    if (id && !project.activeModules.includes(id)) {
      toggleModule(id);
    }
    setDraggingModuleId(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Pipeline Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Sürükle-Bırak Mobil Modül Fabrikası
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Android & Çapraz Platform Uygulama Hattı
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              Modülleri sol panelden mimari hatta sürükleyin veya tıklayarak ekleyin.
              Sistem otomatik olarak Gradle bağımlılıklarını, AndroidManifest izinlerini ve kod şablonlarını sentezler.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
              <div className="text-slate-400 text-[11px]">Aktif Modüller</div>
              <div className="text-lg font-bold text-cyan-400 font-mono">
                {project.activeModules.length} <span className="text-xs text-slate-500 font-normal">/ {AVAILABLE_MODULES.length}</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
              <div className="text-slate-400 text-[11px]">Tahmini APK Boyutu</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">
                ~{estimatedApkSizeMb} <span className="text-xs text-slate-500 font-normal">MB</span>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5">
              <div className="text-slate-400 text-[11px]">Manifest İzinleri</div>
              <div className="text-lg font-bold text-indigo-400 font-mono">
                {combinedPermissions.length} <span className="text-xs text-slate-500 font-normal">izin</span>
              </div>
            </div>

            <button
              onClick={onGoToBuild}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Derleme Motoru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main 2-Column Studio: Left Modules Library, Right Active Pipeline Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Available Modules Palette (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 flex flex-col h-[750px] shadow-lg">
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
              <Boxes className="w-4 h-4 text-cyan-400" />
              <span>Modül Kataloğu ({filteredModules.length})</span>
            </div>
            <span className="text-[11px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
              Sürükle veya Ekle (+)
            </span>
          </div>

          {/* Search bar & Category filter */}
          <div className="space-y-2.5 py-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Modül ara (kamera, ble, room, fcm, billing...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Category tabs scroll */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat.id
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-medium"
                      : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modules List Scrollable */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredModules.map((mod) => {
              const isAdded = project.activeModules.includes(mod.id);
              const isInspecting = inspectingModule?.id === mod.id;

              return (
                <div
                  key={mod.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, mod.id)}
                  onClick={() => setInspectingModule(mod)}
                  className={`p-3 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none relative group ${
                    isInspecting
                      ? "border-cyan-500/60 bg-slate-800/90 shadow-md"
                      : "border-slate-800/80 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isAdded
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                            : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                        }`}
                      >
                        {isAdded ? <CheckCircle2 className="w-4 h-4" /> : <Boxes className="w-4 h-4" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-slate-100 text-xs group-hover:text-cyan-300 transition-colors">
                            {mod.name}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-500">v{mod.version}</span>
                        </div>
                        <p className="text-slate-400 text-[11px] line-clamp-1 mt-0.5">
                          {mod.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleModule(mod.id);
                        }}
                        className={`p-1.5 rounded-lg text-xs font-semibold transition-all ${
                          isAdded
                            ? "bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                            : "bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40"
                        }`}
                        title={isAdded ? "Hattan Çıkar" : "Hatta Ekle"}
                      >
                        {isAdded ? <Trash2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Foot badges */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-800/50 text-[10px] text-slate-400">
                    <span className="font-mono text-slate-500">
                      {mod.sizeImpactKb > 0 ? `+${mod.sizeImpactKb} KB` : `${mod.sizeImpactKb} KB (Opt)`}
                    </span>
                    <span>•</span>
                    <span>{mod.permissions.length} İzin</span>
                    <span>•</span>
                    <span>{mod.gradleDependencies.length} Gradle Lib</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Project Pipeline Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dropzone & Active Pipeline */}
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-5 min-h-[360px] transition-all relative ${
              draggingModuleId
                ? "border-cyan-400 bg-cyan-950/20 shadow-xl shadow-cyan-500/10"
                : "border-slate-800 bg-slate-900/60"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <h2 className="font-semibold text-slate-100 text-sm">
                  Aktif Uygulama Mimarisi & Pipeline
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950/60 border border-indigo-800/50 text-indigo-300 text-[11px] font-mono">
                  {project.activeModules.length} bileşen
                </span>
              </div>
              <button
                onClick={onGoToCode}
                className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <span>Koda Git</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {project.activeModules.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-6 border border-slate-800/60 rounded-xl bg-slate-950/40">
                <div className="w-12 h-12 rounded-xl bg-slate-800/60 flex items-center justify-center text-slate-400 mb-3">
                  <Boxes className="w-6 h-6 text-slate-400 animate-bounce" />
                </div>
                <h3 className="text-slate-200 font-semibold text-sm">Pipeline Boş</h3>
                <p className="text-slate-400 text-xs max-w-sm mt-1">
                  Sol taraftaki modüllerden istediklerinizi bu alana sürükleyip bırakın veya listedeki (+) butonuna tıklayın.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeModuleObjects.map((mod, index) => (
                  <div
                    key={mod.id}
                    onClick={() => setInspectingModule(mod)}
                    className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-cyan-500/50 transition-all flex items-start justify-between gap-2 shadow-sm"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-400 font-mono text-[10px] flex items-center justify-center font-bold shrink-0 mt-0.5">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-slate-100">{mod.name}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>v{mod.version}</span>
                          <span>•</span>
                          <span>{mod.permissions.length} İzin</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleModule(mod.id);
                      }}
                      className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                      title="Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Add Recommendations */}
            <div className="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-[11px]">
                <Info className="w-3.5 h-3.5 text-cyan-400" />
                Önerilen Entegrasyonlar:
              </span>
              <div className="flex items-center gap-1.5">
                {["camerax_pro", "biometric_auth", "room_sqlite"].map((recId) => {
                  const m = AVAILABLE_MODULES.find((mod) => mod.id === recId);
                  if (!m || project.activeModules.includes(recId)) return null;
                  return (
                    <button
                      key={recId}
                      onClick={() => toggleModule(recId)}
                      className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3 text-cyan-400" />
                      <span>{m.name.split(" ")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Module Inspector & Code Preview Pane */}
          {inspectingModule && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold text-slate-200 text-xs">
                    Modül İnceleyici: <span className="text-cyan-300">{inspectingModule.name}</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    UI: {inspectingModule.uiComponent}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* Gradle Deps */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-slate-400 text-[11px] font-semibold mb-1.5 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>build.gradle.kts Bağımlılıkları</span>
                  </div>
                  {inspectingModule.gradleDependencies.length > 0 ? (
                    <div className="space-y-1 font-mono text-[11px] text-indigo-300">
                      {inspectingModule.gradleDependencies.map((dep, idx) => (
                        <div key={idx} className="bg-slate-900 px-2 py-1 rounded truncate">
                          implementation("{dep}")
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">Ek harici kütüphane gerektirmez (Built-in)</p>
                  )}
                </div>

                {/* Manifest Permissions */}
                <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3">
                  <div className="text-slate-400 text-[11px] font-semibold mb-1.5 flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AndroidManifest.xml İzinleri</span>
                  </div>
                  {inspectingModule.permissions.length > 0 ? (
                    <div className="space-y-1 font-mono text-[11px] text-emerald-300">
                      {inspectingModule.permissions.map((perm, idx) => (
                        <div key={idx} className="bg-slate-900 px-2 py-1 rounded truncate">
                          &lt;uses-permission android:name="{perm}" /&gt;
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 italic text-[11px]">Özel kullanıcı izni gerektirmez.</p>
                  )}
                </div>
              </div>

              {/* Sample Code for selected language */}
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Örnek Başlatma Kodu ({project.language.toUpperCase()}):</span>
                  <span className="font-mono text-cyan-400 text-[10px]">Otomatik Entegre Edilir</span>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto p-2 bg-slate-900/90 rounded-lg max-h-36">
                  {inspectingModule.codeSnippets[project.language] ||
                    inspectingModule.codeSnippets.kotlin}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
