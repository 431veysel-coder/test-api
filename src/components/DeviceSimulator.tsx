import React, { useState } from "react";
import {
  Smartphone,
  Apple,
  RotateCw,
  Camera,
  Fingerprint,
  Bluetooth,
  Bell,
  Database,
  CreditCard,
  MapPin,
  ShieldCheck,
  Check,
  Wifi,
  Battery,
  Volume2,
  Sparkles,
} from "lucide-react";
import { MobileModule, ProjectConfig } from "../types";
import { AVAILABLE_MODULES } from "../data/modulesData";

interface DeviceSimulatorProps {
  project: ProjectConfig;
}

export const DeviceSimulator: React.FC<DeviceSimulatorProps> = ({ project }) => {
  const [deviceType, setDeviceType] = useState<"android" | "ios">("android");
  const [isLandscape, setIsLandscape] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("home");
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [biometricAuthenticated, setBiometricAuthenticated] = useState<boolean>(false);
  const [showNotificationBanner, setShowNotificationBanner] = useState<boolean>(false);
  const [dbItems, setDbItems] = useState<string[]>([
    "Kullanıcı Oturum Tokeni (AES-256)",
    "Son Konum Koordinatları [41.0082, 28.9784]",
    "Çevrimdışı Taslak Paketleri #104",
  ]);

  const activeModules = project.activeModules
    .map((id) => AVAILABLE_MODULES.find((m) => m.id === id))
    .filter((m): m is MobileModule => Boolean(m));

  const triggerTestNotification = () => {
    setShowNotificationBanner(true);
    setTimeout(() => setShowNotificationBanner(false), 4000);
  };

  const triggerBiometric = () => {
    setBiometricAuthenticated(true);
    setTimeout(() => setBiometricAuthenticated(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Simulator Control Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm md:text-base">
              Çapraz Platform Canlı Mobil Simülatör (Android 15 & iOS 18)
            </h2>
            <p className="text-slate-400 text-xs">
              Uygulamanızın aktif modüllerini fiziksel bir telefon üzerinde gibi dokunarak test edin.
            </p>
          </div>
        </div>

        {/* Device Switcher & Controls */}
        <div className="flex items-center gap-2">
          {/* Device Type */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setDeviceType("android")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceType === "android"
                  ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pixel 9 Pro (Android 15)</span>
            </button>

            <button
              onClick={() => setDeviceType("ios")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                deviceType === "ios"
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Apple className="w-3.5 h-3.5" />
              <span>iPhone 16 Pro (iOS 18)</span>
            </button>
          </div>

          {/* Orientation Toggle */}
          <button
            onClick={() => setIsLandscape(!isLandscape)}
            className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-cyan-400 transition-colors"
            title="Ekranı Döndür"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulator Presentation Workspace */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-6">
        {/* Device Frame */}
        <div
          className={`relative border-[10px] ${
            deviceType === "android"
              ? "border-slate-800 rounded-[48px]"
              : "border-slate-800 rounded-[54px]"
          } bg-black shadow-2xl shadow-cyan-500/10 transition-all duration-300 overflow-hidden flex flex-col ${
            isLandscape
              ? "w-[680px] h-[360px]"
              : "w-[340px] sm:w-[380px] h-[680px]"
          }`}
        >
          {/* Hardware Camera Notch / Dynamic Island */}
          {deviceType === "android" ? (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-slate-950 border border-slate-800 z-30 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-900/60" />
            </div>
          ) : (
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 rounded-full bg-black border border-slate-900 z-30 flex items-center justify-between px-3">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-950 border border-indigo-800/40" />
            </div>
          )}

          {/* Phone Status Bar */}
          <div className="pt-2 px-6 pb-2 text-[11px] text-slate-300 flex items-center justify-between font-mono z-20 bg-slate-950/60 backdrop-blur-sm">
            <span>09:41</span>
            <div className="flex items-center gap-2">
              <Wifi className="w-3.5 h-3.5" />
              <Battery className="w-4 h-4" />
            </div>
          </div>

          {/* In-app Push Notification Banner Simulation */}
          {showNotificationBanner && (
            <div className="mx-3 mt-1 p-3 rounded-2xl bg-slate-900/95 border border-cyan-500/50 shadow-xl text-xs z-40 animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center gap-2 font-semibold text-cyan-400">
                <Bell className="w-3.5 h-3.5" />
                <span>DroidCraft Cloud Messaging</span>
              </div>
              <p className="text-slate-300 text-[11px] mt-1">
                FCM Bildirimi: v{project.versionName} derlemesi başarıyla cihazınıza iletildi.
              </p>
            </div>
          )}

          {/* In-app Screen Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[#0b0f19] to-[#070a12] text-slate-100 text-xs">
            {/* App Topbar */}
            <div className="flex items-center justify-between pt-1">
              <div>
                <h3 className="font-bold text-sm text-cyan-400 tracking-tight">
                  {project.name}
                </h3>
                <span className="text-[10px] text-slate-500 font-mono">
                  {project.packageName}
                </span>
              </div>
              <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-300 font-bold text-xs">
                DC
              </div>
            </div>

            {/* Active Modules Widget Cards */}
            <div className="space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Entegre Edilen Modüller ({activeModules.length})</span>
                <span className="text-emerald-400 text-[10px]">Canlı Test</span>
              </div>

              {/* Camera Module interactive widget */}
              {project.activeModules.includes("camerax_pro") && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-slate-200">
                      <Camera className="w-4 h-4 text-cyan-400" />
                      <span>CameraX 1.4 API</span>
                    </div>
                    <button
                      onClick={() => setCameraActive(!cameraActive)}
                      className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold"
                    >
                      {cameraActive ? "Kapat" : "Kamerayı Aç"}
                    </button>
                  </div>
                  {cameraActive ? (
                    <div className="h-28 rounded-lg bg-slate-950 border border-cyan-500/40 relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-900/30 to-indigo-900/30 animate-pulse" />
                      <div className="z-10 text-center">
                        <div className="w-6 h-6 border-2 border-dashed border-cyan-400 rounded-full mx-auto mb-1 animate-spin" />
                        <span className="text-[10px] text-cyan-300 font-mono">4K 60FPS Canlı Vizör</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-400">Vizörü başlatmak için butona basın.</p>
                  )}
                </div>
              )}

              {/* Biometrics Module interactive widget */}
              {project.activeModules.includes("biometric_auth") && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="font-semibold text-slate-200">Biyometri / Touch ID</div>
                      <span className="text-[10px] text-slate-400">
                        {biometricAuthenticated ? "Kimlik Doğrulandı!" : "Beklemede"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={triggerBiometric}
                    className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold"
                  >
                    {biometricAuthenticated ? <Check className="w-3.5 h-3.5" /> : "Parmak İzi Test"}
                  </button>
                </div>
              )}

              {/* FCM Push Notification test widget */}
              {project.activeModules.includes("fcm_push") && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-amber-400" />
                    <div>
                      <div className="font-semibold text-slate-200">FCM Bildirim Motoru</div>
                      <span className="text-[10px] text-slate-400">Anlık bildirim simülatörü</span>
                    </div>
                  </div>
                  <button
                    onClick={triggerTestNotification}
                    className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 text-[10px] font-semibold"
                  >
                    Bildirim Gönder
                  </button>
                </div>
              )}

              {/* Room DB widget */}
              {project.activeModules.includes("room_sqlite") && (
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-slate-200 font-semibold">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-indigo-400" />
                      <span>Room SQLite DB</span>
                    </div>
                    <span className="text-[10px] font-mono text-indigo-300">{dbItems.length} Kayıt</span>
                  </div>
                  <div className="space-y-1 text-[10px] font-mono text-slate-400">
                    {dbItems.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 px-2 py-1 rounded truncate">
                        • {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Generic fallback if no specific modules added */}
              {activeModules.length === 0 && (
                <div className="p-4 rounded-xl border border-slate-800 text-center text-slate-400">
                  <p>Henüz aktif modül seçilmedi.</p>
                  <p className="text-[10px] text-slate-500 mt-1">
                    Modül Mimarı sekmesinden Kamera, Biyometri veya Bildirim modüllerini ekleyin.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Phone Bottom Home Indicator */}
          <div className="py-2 flex items-center justify-center bg-slate-950">
            <div className="w-32 h-1 bg-slate-700 rounded-full" />
          </div>
        </div>

        {/* Feature Inspection Cards (Right side) */}
        <div className="space-y-4 max-w-sm w-full">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Çapraz Platform Donanım Desteği
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              DroidCraft modül mimarisi, Android 15 NDK ve iOS Swift bridge katmanlarını paralel olarak yönetir.
              Tek bir kod tabanından hem APK/AAB hem de iOS IPA formatı için derleme hazırlar.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h3 className="font-semibold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              120Hz Akıcı Performans
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Jetpack Compose ve Flutter derleme pipeline'ında GPU shader ön-önbellekleme (Skia / Impeller) aktif edilmiştir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
