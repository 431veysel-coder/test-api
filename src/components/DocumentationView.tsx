import React, { useState } from "react";
import {
  BookOpen,
  Search,
  CheckCircle,
  Code,
  Shield,
  Smartphone,
  Layers,
  Terminal,
  ExternalLink,
  ChevronRight,
  HelpCircle,
} from "lucide-react";

export const DocumentationView: React.FC = () => {
  const [activeGuideId, setActiveGuideId] = useState<string>("guide-1");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const guides = [
    {
      id: "guide-1",
      title: "1. Sıfırdan APK Derleme & Paketleme Rehberi",
      category: "Başlangıç",
      readTime: "5 dk",
      content: `### Sıfırdan APK Üretimi Nasıl Çalışır?

DroidCraft Cloud OS, Android 15 (API 35) ve modern mobil standartlara tam uyumlu bir bulut derleme motoru sunar.

#### Adım 1: Dil ve Mimari Seçimi
1. Üst panelden projenizin adını, paket ismini (ör. \`com.sirketiniz.uygulama\`) ve hedef programlama dilini seçin:
   - **Kotlin 2.0 (Jetpack Compose)**: Önerilen modern Android mimarisi.
   - **Java 21 (Android SDK)**: Klasik kurumsal Android projeleri.
   - **Flutter 3.24 (Dart)**: Hem Android hem iOS için tek kod tabanı.
   - **React Native 0.75**: TypeScript & React geliştiricileri için.
   - **C++ 20 / NDK**: Yüksek performanslı oyun ve ses/görüntü işleme.

#### Adım 2: Modül Ekleyin
Modül Mimarı sekmesine giderek uygulamanızın ihtiyaç duyduğu donanım ve yazılım bileşenlerini (Kamera, Biyometri, SQLite, FCM Bildirim vb.) sürükleyip mimari hatta bırakın.

#### Adım 3: Derleme & Paketleme
**Bulut Derleme & APK** sekmesine geçin:
- **Release APK**: Cihazlara doğrudan sideload / test amaçlı kurulabilen imzalı paket.
- **AAB Bundle**: Google Play Store konsoluna yükleme için gereken optimize paket.
- **Hemen Derle** butonuna basın. Gerçek zamanlı Gradle loglarını terminal penceresinden takip edin.
- Derleme bittiğinde ekranda beliren **QR Kodu** telefonunuzun kamerasıyla okutarak APK'yı telefonunuza doğrudan indirin!`,
    },
    {
      id: "guide-2",
      title: "2. Sürükle-Bırak Modül Mimarisi & İzinler",
      category: "Modüller",
      readTime: "4 dk",
      content: `### Sürükle-Bırak Modül Sistemi Nasıl İşler?

DroidCraft, manuel XML ve Gradle yapılandırması zahmetini ortadan kaldırır.

#### Otomatik İzin Birleştirme (Manifest Merge)
Bir modülü (örneğin CameraX) hatta eklediğinizde:
1. \`AndroidManifest.xml\` dosyasına otomatik olarak \`<uses-permission android:name="android.permission.CAMERA" />\` eklenir.
2. \`build.gradle.kts\` kütüğüne ilgili Maven kütüphane bağımlılıkları (\`androidx.camera:camera-core:1.4.0\`) otomatik olarak enjekte edilir.
3. Aktivite kodunda hazır başlatıcı (boilerplate) kod blokları sentezlenir.

#### Modül Çıkarma
İstemediğiniz modülü mimari hattan çöpe attığınızda, kullanılmayan tüm izinler ve Gradle kütüphaneleri projeden anında temizlenir. Böylece gereksiz izin taleplerinden dolayı Play Store reddi yaşamazsınız.`,
    },
    {
      id: "guide-3",
      title: "3. ProGuard / R8 Bytecode Karartması & Optimizasyon",
      category: "Güvenlik & Optimizasyon",
      readTime: "6 dk",
      content: `### ProGuard / R8 ile APK Boyutunu Küçültme ve Güvenlik

Tersine mühendislik araçları (JADX, APKTool), şifrelenmemiş Android kodlarını dakikalar içinde orijinal haline döndürebilir.

#### R8'in 3 Temel Gücü:
1. **Shrinking (Budama)**: Kodunuzda ve kütüphanelerde hiç çağrılmayan ölü sınıfları ve metodları ayıklar. APK boyutunu ortalama %35-%50 küçültür.
2. **Obfuscation (Karartma)**: Paket, sınıf, fonksiyon ve değişken isimlerini \`a\`, \`b\`, \`c\` gibi anlamsız kısa karakterlere dönüştürür.
3. **Optimization**: Metodları inline eder ve gereksiz bellek tahsislerini temizler.

#### Özel ProGuard Kuralları (\`proguard-rules.pro\`):
Veri modellerinizi (JSON serialization / Retrofit / Gson) karartmadan hariç tutmak için:
\`\`\`proguard
-keepattributes *Annotation*,Signature
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}
\`\`\``,
    },
    {
      id: "guide-4",
      title: "4. V2, V3 ve V4 Keystore İmzalama Standartları",
      category: "Yayınlama & Güvenlik",
      readTime: "4 dk",
      content: `### Android APK İmza Şemaları

Google Play ve Android işletim sistemi, kurulan her paketin değiştirilmediğini doğrulamak için kriptografik imza talep eder.

- **V1 (JAR İmzalama)**: ZIP merkez dizinini imzalar. Güvenlik açığına açıktır.
- **V2 (Android 7.0+)**: Tüm APK dosyasını kriptografik özet bloklarıyla mühürler. Çok daha hızlı doğrulama sağlar.
- **V3 (Android 9.0+)**: Anahtar rotasyonunu (Key Rotation) destekler.
- **V4 (Android 11+)**: Streaming kurulum (ADB incremental install) desteği ekler.

DroidCraft Cloud OS, tüm Release derlemelerinde varsayılan olarak **V2+V3+V4** şemalarını otomatik olarak entegre eder ve SHA-256 doğrulama parmak izini raporlar.`,
    },
    {
      id: "guide-5",
      title: "5. Uzaktan REST API & Webhook Entegrasyon Kılavuzu",
      category: "Entegrasyon",
      readTime: "5 dk",
      content: `### DroidCraft Derleme Motorunu Uzaktan Çağırma

Başka bir sunucudan veya GitHub Actions / GitLab CI üzerinden derleme tetiklemek için:

#### 1. API Token Alın
**Uzaktan API & Webhook** sekmesinden Bearer tokeninizi kopyalayın.

#### 2. cURL İle Derleme Başlatın
\`\`\`bash
curl -X POST "https://your-domain.com/api/build/trigger" \\
  -H "Authorization: Bearer dc_live_sec_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "projectName": "MyApp",
    "packageName": "com.mycompany.app",
    "versionName": "1.0.0",
    "language": "kotlin",
    "buildType": "release_apk",
    "modules": ["camerax_pro", "room_sqlite"]
  }'
\`\`\`

#### 3. Çıktı & Doğrulama
API yanıt olarak derleme durumunu, indirme bağlantısını (\`downloadUrl\`) ve paketin SHA-256 hash özetini döner.`,
    },
  ];

  const activeGuide = guides.find((g) => g.id === activeGuideId) || guides[0];

  const filteredGuides = guides.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100 text-sm md:text-base">
              Kapsamlı Mobil Geliştirici Eğitim & Destek Dokümantasyonu
            </h2>
            <p className="text-slate-400 text-xs">
              Sıfırdan Android APK üretimi, ProGuard kuralları, modül izinleri ve Play Store yayınlama rehberi.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Rehber veya konu ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Main 2-Column Documentation Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Guides Index (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-2 shadow-lg">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Rehberler & Kılavuzlar ({filteredGuides.length})
          </span>

          <div className="space-y-1.5">
            {filteredGuides.map((g) => (
              <button
                key={g.id}
                onClick={() => setActiveGuideId(g.id)}
                className={`w-full p-3 rounded-xl border text-left transition-all ${
                  activeGuideId === g.id
                    ? "border-cyan-500 bg-cyan-950/40 text-white shadow-md shadow-cyan-500/10"
                    : "border-slate-800 bg-slate-950/50 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <span className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">
                    {g.category}
                  </span>
                  <span>{g.readTime} okuma</span>
                </div>
                <div className="text-xs font-semibold text-slate-200 mt-1 line-clamp-1">
                  {g.title}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-400 space-y-1.5">
            <span className="font-semibold text-slate-300 text-[11px] flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
              Doğrudan Destek:
            </span>
            <p className="text-[11px] text-slate-500">
              Sorularınız için 'Gemini AI Asistan' sekmesinden 4 farklı uzman rolüne danışabilirsiniz.
            </p>
          </div>
        </div>

        {/* Right: Markdown Guide Reader (8 cols) */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[700px] text-slate-300 space-y-4 text-xs leading-relaxed">
          <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/50">
                {activeGuide.category}
              </span>
              <h2 className="text-lg md:text-xl font-bold text-white mt-1">
                {activeGuide.title}
              </h2>
            </div>
            <span className="text-xs text-slate-500">{activeGuide.readTime} okuma süresi</span>
          </div>

          <div className="prose prose-invert prose-xs max-w-none space-y-3 whitespace-pre-line text-slate-300 font-sans">
            {activeGuide.content}
          </div>
        </div>
      </div>
    </div>
  );
};
