import React, { useState } from "react";
import {
  Sparkles,
  Download,
  Image as ImageIcon,
  Check,
  Smartphone,
  Layers,
  Wand2,
  RefreshCw,
  ExternalLink,
  Sliders,
  ZoomIn,
} from "lucide-react";
import { ProjectConfig } from "../types";

interface AiAssetStudioProps {
  project: ProjectConfig;
  setProject: React.Dispatch<React.SetStateAction<ProjectConfig>>;
}

interface GeneratedAsset {
  id: string;
  url: string;
  prompt: string;
  size: "1K" | "2K" | "4K";
  aspectRatio: string;
  category: string;
  createdAt: string;
}

export const AiAssetStudio: React.FC<AiAssetStudioProps> = ({
  project,
  setProject,
}) => {
  const [prompt, setPrompt] = useState<string>(
    "Modern cyberpunk cyber-droid logo icon for an Android mobile studio app, 3D glossy neon cyan and indigo, dark background"
  );
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [aspectRatio, setAspectRatio] = useState<string>("1:1");
  const [category, setCategory] = useState<string>("app_icon");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedAssets, setGeneratedAssets] = useState<GeneratedAsset[]>([
    {
      id: "asset-demo-1",
      url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
      prompt: "DroidCraft Cyberpunk Android App Icon 3D neon hexagon",
      size: "2K",
      aspectRatio: "1:1",
      category: "app_icon",
      createdAt: "10:30",
    },
    {
      id: "asset-demo-2",
      url: "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=800&auto=format&fit=crop&q=80",
      prompt: "Futuristic mobile cloud compiler splash screen illustration",
      size: "1K",
      aspectRatio: "9:16",
      category: "splash_screen",
      createdAt: "09:45",
    },
  ]);
  const [currentAsset, setCurrentAsset] = useState<GeneratedAsset | null>(
    generatedAssets[0]
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const presets = [
    {
      id: "app_icon",
      label: "Uygulama İkonu (App Icon)",
      aspect: "1:1",
      desc: "Google Play Store 512x512 ve Adaptive Icon foreground",
      examplePrompt: "Minimalist futuristic Android robot icon, 3D glassmorphism, neon cyan accents, vector style",
    },
    {
      id: "splash_screen",
      label: "Açılış Ekranı (Splash Screen)",
      aspect: "9:16",
      desc: "Android 12+ SplashScreen API için dikey arka plan",
      examplePrompt: "High-tech mobile app launch screen background, deep dark indigo space, glowing circuits, sleek geometry",
    },
    {
      id: "feature_graphic",
      label: "Play Store Tanıtım Görseli",
      aspect: "16:9",
      desc: "1024x500 banner için yatay vitrin görseli",
      examplePrompt: "Google Play Store promo feature graphic for cloud compiler, futuristic mobile studio banner, vivid colors",
    },
    {
      id: "ui_mockup",
      label: "Mobil UI İllüstrasyonu",
      aspect: "1:1",
      desc: "Uygulama içi boş durum (Empty State) ve onboarding çizimleri",
      examplePrompt: "Friendly 3D mobile developer character coding on laptop, clean tech aesthetic, soft studio lighting",
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    setCategory(p.id);
    setAspectRatio(p.aspect);
    setPrompt(p.examplePrompt);
  };

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setErrorMsg(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageSize, // Affordance for 1K, 2K, 4K
          aspectRatio,
          category,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Görsel üretilemedi.");
      }

      if (data.imageUrl) {
        const newAsset: GeneratedAsset = {
          id: "asset-" + Date.now(),
          url: data.imageUrl,
          prompt,
          size: data.imageSize || imageSize,
          aspectRatio: data.aspectRatio || aspectRatio,
          category,
          createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setGeneratedAssets((prev) => [newAsset, ...prev]);
        setCurrentAsset(newAsset);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.message ||
          "Görsel üretimi başarısız oldu. Lütfen geçerli bir API anahtarı sağlandığından emin olun."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const applyAsAppIcon = (url: string) => {
    setProject((prev) => ({
      ...prev,
      appIconUrl: url,
    }));
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" /> Model: gemini-3-pro-image-preview
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
              Mobil Uygulama AI Görsel & Asset Fabrikası
            </h1>
            <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-2xl">
              1K, 2K ve 4K ultra yüksek çözünürlük desteği ile Android uygulama ikonları, açılış ekranları (Splash Screen) ve Play Store vitrin grafikleri üretin.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2 rounded-xl text-xs text-slate-300">
            <span className="font-semibold text-cyan-400">Çözünürlük Desteği:</span>
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-white">1K (1024px)</span>
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-white">2K (2048px)</span>
            <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-cyan-300 font-bold">4K (4096px)</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols), Right Showcase Canvas (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 font-bold text-slate-100 text-sm">
              <Wand2 className="w-4 h-4 text-cyan-400" />
              <span>Görsel Üretim Parametreleri</span>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
              gemini-3-pro-image-preview
            </span>
          </div>

          {/* Category Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Mobil Asset Kategorisi:
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {presets.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    category === p.id
                      ? "border-cyan-500 bg-cyan-950/30 text-white shadow-sm"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-200">{p.label}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Image Size Affordance (1K, 2K, 4K) - STRICT REQUIREMENT */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Görsel Boyutu (Image Size Affordance):</span>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">{imageSize}</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["1K", "2K", "4K"] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => setImageSize(size)}
                  className={`py-2 px-3 rounded-xl border text-xs font-mono font-bold transition-all text-center ${
                    imageSize === size
                      ? "border-cyan-400 bg-cyan-950/50 text-cyan-300 shadow-md shadow-cyan-500/10"
                      : "border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700 hover:text-white"
                  }`}
                >
                  <span>{size}</span>
                  <div className="text-[10px] text-slate-500 font-normal">
                    {size === "1K" ? "1024px" : size === "2K" ? "2048px" : "4096px"}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              En-Boy Oranı (Aspect Ratio):
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: "1:1", label: "1:1 (Kare / İkon)" },
                { id: "9:16", label: "9:16 (Dikey / Splash)" },
                { id: "16:9", label: "16:9 (Yatay / Tanıtım)" },
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setAspectRatio(r.id)}
                  className={`py-1.5 px-2 rounded-xl border text-center transition-all ${
                    aspectRatio === r.id
                      ? "border-indigo-500 bg-indigo-950/40 text-indigo-300 font-semibold"
                      : "border-slate-800 bg-slate-950/50 text-slate-400 hover:text-white"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Görsel İstemi (Prompt):
            </label>
            <textarea
              rows={3}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Görseli tarif edin..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none"
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all ${
              isGenerating
                ? "bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-cyan-500/25 active:scale-98"
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>gemini-3-pro-image-preview ile {imageSize} Üretiliyor...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{imageSize} Çözünürlükte Görsel Üret</span>
              </>
            )}
          </button>
        </div>

        {/* Right Canvas / Preview (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="font-semibold text-slate-100 text-sm">
                Asset Önizleme & Android Projeye Entegrasyon
              </h3>
            </div>
            {currentAsset && (
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/40">
                {currentAsset.size} • {currentAsset.aspectRatio}
              </span>
            )}
          </div>

          {/* Active Asset Visual */}
          <div className="flex-1 min-h-[380px] bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-center p-4 relative overflow-hidden group">
            {currentAsset ? (
              <div className="relative max-h-[360px] flex items-center justify-center">
                <img
                  src={currentAsset.url}
                  alt={currentAsset.prompt}
                  className="max-h-[340px] max-w-full rounded-xl object-contain shadow-2xl border border-slate-800"
                />
              </div>
            ) : (
              <div className="text-center text-slate-500 space-y-2">
                <ImageIcon className="w-10 h-10 mx-auto opacity-30 text-slate-400" />
                <p className="text-xs">Henüz görsel üretilmedi.</p>
              </div>
            )}
          </div>

          {/* Asset Export Actions */}
          {currentAsset && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
              <div className="text-slate-400 text-[11px] max-w-xs truncate">
                İstem: {currentAsset.prompt}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => applyAsAppIcon(currentAsset.url)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-950 hover:bg-indigo-900 text-indigo-300 border border-indigo-800/60 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Uygulama İkonu Olarak Seç</span>
                </button>

                <a
                  href={currentAsset.url}
                  download={`droidcraft-${currentAsset.category}-${currentAsset.size}.png`}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir (res/drawable)</span>
                </a>
              </div>
            </div>
          )}

          {/* Generated Assets History Strip */}
          <div className="pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">
              Üretilen Asset Geçmişi ({generatedAssets.length}):
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {generatedAssets.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setCurrentAsset(asset)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                    currentAsset?.id === asset.id
                      ? "border-cyan-400 scale-105 shadow-md shadow-cyan-500/30"
                      : "border-slate-800 opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={asset.url}
                    alt={asset.prompt}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
