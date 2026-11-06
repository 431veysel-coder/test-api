import { MobileModule } from "../types";

export const AVAILABLE_MODULES: MobileModule[] = [
  {
    id: "camerax_pro",
    name: "CameraX & AI Vision",
    category: "hardware",
    description: "Android 15 uyumlu 4K/60fps video yakalama, ultra geniş açı, barkod ve yüz algılama.",
    icon: "Camera",
    version: "1.4.0",
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
    ],
    gradleDependencies: [
      "androidx.camera:camera-core:1.4.0",
      "androidx.camera:camera-camera2:1.4.0",
      "androidx.camera:camera-lifecycle:1.4.0",
      "androidx.camera:camera-view:1.4.0",
    ],
    sizeImpactKb: 680,
    uiComponent: "CameraPreviewView",
    codeSnippets: {
      kotlin: `val cameraProviderFuture = ProcessCameraProvider.getInstance(context)
cameraProviderFuture.addListener({
    val cameraProvider = cameraProviderFuture.get()
    val preview = Preview.Builder().build().also {
        it.setSurfaceProvider(previewView.surfaceProvider)
    }
    val cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA
    cameraProvider.bindToLifecycle(lifecycleOwner, cameraSelector, preview)
}, ContextCompat.getMainExecutor(context))`,
      java: `ListenableFuture<ProcessCameraProvider> cameraProviderFuture = ProcessCameraProvider.getInstance(this);
cameraProviderFuture.addListener(() -> {
    try {
        ProcessCameraProvider cameraProvider = cameraProviderFuture.get();
        Preview preview = new Preview.Builder().build();
        preview.setSurfaceProvider(previewView.getSurfaceProvider());
        cameraProvider.bindToLifecycle(this, CameraSelector.DEFAULT_BACK_CAMERA, preview);
    } catch (Exception e) { Log.e("Camera", "Init failed", e); }
}, ContextCompat.getMainExecutor(this));`,
      flutter: `final cameras = await availableCameras();
final controller = CameraController(cameras[0], ResolutionPreset.max);
await controller.initialize();
CameraPreview(controller);`,
      react_native: `import { Camera, useCameraDevice } from 'react-native-vision-camera';
const device = useCameraDevice('back');
return <Camera style={StyleSheet.absoluteFill} device={device} isActive={true} />;`,
      cpp_ndk: `#include <camera/NdkCameraManager.h>
ACameraManager* cameraManager = ACameraManager_create();
ACameraIdList* cameraIds = nullptr;
ACameraManager_getCameraIdList(cameraManager, &cameraIds);`,
      python_kivy: `from kivy.uix.camera import Camera
cam = Camera(play=True, resolution=(1280, 720))`,
    },
  },
  {
    id: "biometric_auth",
    name: "Biyometrik Kimlik Doğrulama",
    category: "auth_security",
    description: "Parmak izi, yüz tanıma ve CryptoObject şifreleme ile donanım düzeyinde güvenli giriş.",
    icon: "Fingerprint",
    version: "1.2.0-alpha05",
    permissions: [
      "android.permission.USE_BIOMETRIC",
    ],
    gradleDependencies: [
      "androidx.biometric:biometric:1.2.0-alpha05",
      "androidx.security:security-crypto:1.1.0-alpha06",
    ],
    sizeImpactKb: 320,
    uiComponent: "BiometricPromptWidget",
    codeSnippets: {
      kotlin: `val executor = ContextCompat.getMainExecutor(this)
val promptInfo = BiometricPrompt.PromptInfo.Builder()
    .setTitle("Güvenli Biyometrik Giriş")
    .setSubtitle("Lütfen parmak izinizi okutun")
    .setNegativeButtonText("İptal")
    .build()
val biometricPrompt = BiometricPrompt(this, executor, object : BiometricPrompt.AuthenticationCallback() {
    override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
        // Oturum açma başarılı
    }
})
biometricPrompt.authenticate(promptInfo)`,
      java: `BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
    .setTitle("Biyometrik Giriş")
    .setNegativeButtonText("İptal")
    .build();
new BiometricPrompt(this, executor, callback).authenticate(promptInfo);`,
      flutter: `final LocalAuthentication auth = LocalAuthentication();
final bool didAuthenticate = await auth.authenticate(
    localizedReason: 'Lütfen parmak izinizi okutun',
    options: const AuthenticationOptions(biometricOnly: true));`,
      react_native: `import ReactNativeBiometrics from 'react-native-biometrics';
const rnBiometrics = new ReactNativeBiometrics();
const { success } = await rnBiometrics.simplePrompt({ promptMessage: 'Biyometrik Giriş' });`,
      cpp_ndk: `// JNI call to androidx.biometric.BiometricPrompt`,
      python_kivy: `# Kivy pyjnius wrapper for BiometricPrompt`,
    },
  },
  {
    id: "bluetooth_ble",
    name: "Bluetooth Low Energy (BLE 5.4)",
    category: "hardware",
    description: "Giyilebilir cihazlar, IoT sensörler ve beacon taraması için ultra düşük güç tüketimli haberleşme.",
    icon: "Bluetooth",
    version: "2.1.0",
    permissions: [
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.BLUETOOTH_CONNECT",
      "android.permission.ACCESS_FINE_LOCATION",
    ],
    gradleDependencies: [
      "com.polidea.rxandroidble3:rxandroidble:3.0.0",
    ],
    sizeImpactKb: 540,
    uiComponent: "BleRadarWidget",
    codeSnippets: {
      kotlin: `val bluetoothAdapter = (getSystemService(Context.BLUETOOTH_SERVICE) as BluetoothManager).adapter
val scanner = bluetoothAdapter.bluetoothLeScanner
val scanCallback = object : ScanCallback() {
    override fun onScanResult(callbackType: Int, result: ScanResult) {
        println("Bulunan Cihaz: \${result.device.name} RSSI: \${result.rssi}")
    }
}
scanner.startScan(scanCallback)`,
      java: `BluetoothLeScanner scanner = bluetoothAdapter.getBluetoothLeScanner();
scanner.startScan(scanCallback);`,
      flutter: `FlutterBluePlus.scanResults.listen((results) {
    for (ScanResult r in results) {
        print('\${r.device.platformName} found! rssi: \${r.rssi}');
    }
});
FlutterBluePlus.startScan(timeout: Duration(seconds: 10));`,
      react_native: `import { BleManager } from 'react-native-ble-plx';
const manager = new BleManager();
manager.startDeviceScan(null, null, (error, device) => {
    if (device) console.log(device.name);
});`,
      cpp_ndk: `// NDK Bluetooth GATT JNI bridge`,
      python_kivy: `from plyer import spatialorientation, bluetooth`,
    },
  },
  {
    id: "room_sqlite",
    name: "Room DB & SQLite ORM",
    category: "storage",
    description: "Çevrimdışı veri senkronizasyonu, şifreli SQLCipher ve reaktif Flow/LiveData desteği.",
    icon: "Database",
    version: "2.6.1",
    permissions: [],
    gradleDependencies: [
      "androidx.room:room-runtime:2.6.1",
      "androidx.room:room-ktx:2.6.1",
      "net.zetetic:android-database-sqlcipher:4.5.4",
    ],
    sizeImpactKb: 720,
    uiComponent: "DatabaseTableView",
    codeSnippets: {
      kotlin: `@Entity(tableName = "app_cache")
data class CacheRecord(@PrimaryKey val key: String, val payload: String, val timestamp: Long)

@Dao
interface CacheDao {
    @Query("SELECT * FROM app_cache")
    fun getAll(): Flow<List<CacheRecord>>
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(record: CacheRecord)
}`,
      java: `@Entity(tableName = "app_cache")
public class CacheRecord { @PrimaryKey public String key; public String payload; }`,
      flutter: `final database = await openDatabase('droid_cache.db', version: 1,
    onCreate: (db, version) => db.execute('CREATE TABLE cache (key TEXT PRIMARY KEY, value TEXT)'));`,
      react_native: `import SQLite from 'react-native-sqlite-storage';
const db = SQLite.openDatabase({ name: 'droid_cache.db' });`,
      cpp_ndk: `#include <sqlite3.h>
sqlite3 *db;
sqlite3_open("cache.db", &db);`,
      python_kivy: `import sqlite3
conn = sqlite3.connect('local.db')`,
    },
  },
  {
    id: "fcm_push",
    name: "Firebase Cloud Messaging (FCM)",
    category: "networking",
    description: "Anlık bildirimler, veri mesajları, zengin bildirim şablonları ve arka plan tetikleyicileri.",
    icon: "BellRing",
    version: "24.0.0",
    permissions: [
      "android.permission.POST_NOTIFICATIONS",
      "android.permission.INTERNET",
      "android.permission.WAKE_LOCK",
    ],
    gradleDependencies: [
      "com.google.firebase:firebase-messaging:24.0.0",
    ],
    sizeImpactKb: 480,
    uiComponent: "NotificationSimulator",
    codeSnippets: {
      kotlin: `class MyFirebaseService : FirebaseMessagingService() {
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        val title = remoteMessage.notification?.title ?: "Yeni Bildirim"
        val body = remoteMessage.notification?.body ?: ""
        showNotification(title, body)
    }
    override fun onNewToken(token: String) {
        Log.d("FCM", "Yenilenen Token: $token")
    }
}`,
      java: `public class MyFirebaseService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        // Notification handler
    }
}`,
      flutter: `FirebaseMessaging.onMessage.listen((RemoteMessage message) {
    print('FCM Message: \${message.notification?.title}');
});`,
      react_native: `import messaging from '@react-native-firebase/messaging';
messaging().onMessage(async remoteMessage => {
    Alert.alert('FCM', remoteMessage.notification?.body);
});`,
      cpp_ndk: `// Firebase C++ SDK Cloud Messaging module`,
      python_kivy: `# PyJNIus FCM receiver service`,
    },
  },
  {
    id: "play_billing",
    name: "Google Play In-App Billing 7.0",
    category: "monetization",
    description: "Uygulama içi satın alımlar, süreli abonelikler, promosyon kodları ve dijital faturalandırma.",
    icon: "CreditCard",
    version: "7.0.0",
    permissions: [
      "com.android.vending.BILLING",
      "android.permission.INTERNET",
    ],
    gradleDependencies: [
      "com.android.billingclient:billing-ktx:7.0.0",
    ],
    sizeImpactKb: 390,
    uiComponent: "PricingTierWidget",
    codeSnippets: {
      kotlin: `val billingClient = BillingClient.newBuilder(context)
    .setListener { billingResult, purchases ->
        if (billingResult.responseCode == BillingClient.BillingResponseCode.OK && purchases != null) {
            handlePurchases(purchases)
        }
    }
    .enablePendingPurchases()
    .build()
billingClient.startConnection(object : BillingClientStateListener {
    override fun onBillingSetupFinished(billingResult: BillingResult) {
        // Query product details
    }
    override fun onBillingServiceDisconnected() {}
})`,
      java: `BillingClient billingClient = BillingClient.newBuilder(context).build();`,
      flutter: `final InAppPurchase _iap = InAppPurchase.instance;
final ProductDetailsResponse response = await _iap.queryProductDetails({'premium_sub'});`,
      react_native: `import * as RNIap from 'react-native-iap';
await RNIap.initConnection();
const products = await RNIap.getProducts({ skus: ['premium_sub'] });`,
      cpp_ndk: `// JNI Play Billing Bridge`,
      python_kivy: `# Kivy InAppPurchase wrapper`,
    },
  },
  {
    id: "google_maps_gps",
    name: "Google Maps SDK & Hassas GPS",
    category: "hardware",
    description: "Canlı harita, rota çizimi, geofencing ve yüksek hassasiyetli GPS konum takibi.",
    icon: "MapPin",
    version: "19.0.0",
    permissions: [
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.ACCESS_BACKGROUND_LOCATION",
    ],
    gradleDependencies: [
      "com.google.android.gms:play-services-maps:19.0.0",
      "com.google.android.gms:play-services-location:21.3.0",
    ],
    sizeImpactKb: 890,
    uiComponent: "LiveMapPreview",
    codeSnippets: {
      kotlin: `val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
fusedLocationClient.lastLocation.addOnSuccessListener { location ->
    if (location != null) {
        val userLatLng = LatLng(location.latitude, location.longitude)
        googleMap.addMarker(MarkerOptions().position(userLatLng).title("Mevcut Konum"))
        googleMap.animateCamera(CameraUpdateFactory.newLatLngZoom(userLatLng, 15f))
    }
}`,
      java: `FusedLocationProviderClient client = LocationServices.getFusedLocationProviderClient(this);`,
      flutter: `GoogleMap(
    initialCameraPosition: CameraPosition(target: LatLng(41.0082, 28.9784), zoom: 14),
    markers: { Marker(markerId: MarkerId('m1'), position: LatLng(41.0082, 28.9784)) },
);`,
      react_native: `import MapView, { Marker } from 'react-native-maps';
<MapView style={styles.map} initialRegion={{ latitude: 41.0082, longitude: 28.9784, latitudeDelta: 0.05, longitudeDelta: 0.05 }} />`,
      cpp_ndk: `// Native GPS NDK Location Manager`,
      python_kivy: `from plyer import gps; gps.start(1000, 0)`,
    },
  },
  {
    id: "r8_proguard_security",
    name: "R8 & ProGuard Kod Karartma (Obfuscation)",
    category: "auth_security",
    description: "Tersine mühendisliği önleyen gelişmiş bytecode karartma, sınıf isimlerini maskeleme ve dead-code temizliği.",
    icon: "ShieldAlert",
    version: "8.4.1",
    permissions: [],
    gradleDependencies: [],
    sizeImpactKb: -1200, // Negative impact: reduces size!
    uiComponent: "ProguardRulesEditor",
    codeSnippets: {
      kotlin: `// proguard-rules.pro
-keepattributes *Annotation*,Signature,InnerClasses
-dontwarn okhttp3.**
-keep class com.droidcraft.model.** { *; }
-repackageclasses 'com.droidcraft.hidden'
-optimizations !code/simplification/arithmetic,!code/allocation/variable`,
      java: `-keep class com.droidcraft.api.** { *; }`,
      flutter: `// android/app/proguard-rules.pro
-keep class io.flutter.app.** { *; }`,
      react_native: `// android/app/proguard-rules.pro
-keep class com.facebook.react.** { *; }`,
      cpp_ndk: `// Strip native debug symbols in CMakeLists.txt`,
      python_kivy: `// Python bytecode compilation (.pyo)`,
    },
  },
  {
    id: "jetpack_compose_ui",
    name: "Jetpack Compose Modern UI Engine",
    category: "ui_media",
    description: "Bildirimsel (declarative) modern Android UI, 120Hz animasyonlar, Material You dinamik temalandırma.",
    icon: "Layers",
    version: "1.7.0",
    permissions: [],
    gradleDependencies: [
      "androidx.compose.ui:ui:1.7.0",
      "androidx.compose.material3:material3:1.3.0",
      "androidx.compose.animation:animation:1.7.0",
    ],
    sizeImpactKb: 950,
    uiComponent: "ComposeCanvasPreview",
    codeSnippets: {
      kotlin: `@Composable
fun ModernAppScreen() {
    MaterialTheme {
        Scaffold(
            topBar = { TopAppBar(title = { Text("DroidCraft Mobile OS") }) }
        ) { padding ->
            LazyColumn(modifier = Modifier.padding(padding)) {
                items(10) { index ->
                    Card(modifier = Modifier.fillMaxWidth().padding(8.dp)) {
                        Text("Aktif Modül #$index", modifier = Modifier.padding(16.dp))
                    }
                }
            }
        }
    }
}`,
      java: `// XML View Binding alternative`,
      flutter: `Scaffold(appBar: AppBar(title: Text("DroidCraft")), body: ListView.builder(...));`,
      react_native: `<SafeAreaView><FlatList data={items} renderItem={renderCard} /></SafeAreaView>`,
      cpp_ndk: `// OpenGL ES / Vulkan Direct Render Surface`,
      python_kivy: `from kivy.uix.boxlayout import BoxLayout`,
    },
  },
  {
    id: "workmanager_background",
    name: "WorkManager & Arka Plan Senkronizasyonu",
    category: "networking",
    description: "Pil tasarrufu (Doze mode) uyumlu, cihaz şarja takıldığında veya Wi-Fi'a bağlandığında çalışan periyodik görevler.",
    icon: "Cpu",
    version: "2.9.1",
    permissions: [
      "android.permission.RECEIVE_BOOT_COMPLETED",
    ],
    gradleDependencies: [
      "androidx.work:work-runtime-ktx:2.9.1",
    ],
    sizeImpactKb: 340,
    uiComponent: "WorkerStatusView",
    codeSnippets: {
      kotlin: `val constraints = Constraints.Builder()
    .setRequiredNetworkType(NetworkType.UNMETERED)
    .setRequiresCharging(true)
    .build()

val syncWorkRequest = PeriodicWorkRequestBuilder<SyncWorker>(12, TimeUnit.HOURS)
    .setConstraints(constraints)
    .build()

WorkManager.getInstance(context).enqueueUniquePeriodicWork(
    "CloudSyncJob",
    ExistingPeriodicWorkPolicy.KEEP,
    syncWorkRequest
)`,
      java: `WorkManager.getInstance(context).enqueue(workRequest);`,
      flutter: `Workmanager().initialize(callbackDispatcher);
Workmanager().registerPeriodicTask("syncTask", "simplePeriodicSync");`,
      react_native: `import BackgroundFetch from 'react-native-background-fetch';
BackgroundFetch.configure({ minimumFetchInterval: 15 }, async taskId => { ... });`,
      cpp_ndk: `// NDK POSIX timer / alarm manager`,
      python_kivy: `# Android service helper in buildozer.spec`,
    },
  },
  {
    id: "webrtc_voice_video",
    name: "WebRTC Canlı Ses & Görüntülü İletişim",
    category: "networking",
    description: "P2P düşük gecikmeli canlı sesli ve görüntülü arama, ekran paylaşımı ve veri kanalları.",
    icon: "Video",
    version: "1.0.32006",
    permissions: [
      "android.permission.CAMERA",
      "android.permission.RECORD_AUDIO",
      "android.permission.MODIFY_AUDIO_SETTINGS",
    ],
    gradleDependencies: [
      "io.getstream:stream-webrtc-android:1.1.2",
    ],
    sizeImpactKb: 1400,
    uiComponent: "VideoCallSimulator",
    codeSnippets: {
      kotlin: `val peerConnectionFactory = PeerConnectionFactory.builder()
    .setVideoDecoderFactory(DefaultVideoDecoderFactory(rootEglBase.eglBaseContext))
    .setVideoEncoderFactory(DefaultVideoEncoderFactory(rootEglBase.eglBaseContext, true, true))
    .createPeerConnectionFactory()`,
      java: `PeerConnectionFactory factory = PeerConnectionFactory.builder().create();`,
      flutter: `RTCVideoRenderer _localRenderer = RTCVideoRenderer();
await _localRenderer.initialize();`,
      react_native: `import { RTCPeerConnection, RTCView } from 'react-native-webrtc';`,
      cpp_ndk: `#include <api/peer_connection_interface.h>`,
      python_kivy: `# GStreamer / WebRTC binding`,
    },
  },
  {
    id: "mlkit_ai_vision",
    name: "Google ML Kit (Cihaz İçi Yapay Zeka)",
    category: "ai_sensors",
    description: "İnternet bağlantısı gerektirmeyen cihaz içi optik metin tanıma (OCR), nesne algılama ve barkod tarama.",
    icon: "ScanFace",
    version: "17.0.3",
    permissions: [
      "android.permission.CAMERA",
    ],
    gradleDependencies: [
      "com.google.mlkit:text-recognition:16.0.1",
      "com.google.mlkit:face-detection:16.1.7",
    ],
    sizeImpactKb: 1100,
    uiComponent: "MlKitScannerWidget",
    codeSnippets: {
      kotlin: `val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
val image = InputImage.fromMediaImage(mediaImage, rotationDegrees)
recognizer.process(image)
    .addOnSuccessListener { visionText ->
        val recognizedText = visionText.text
        println("Algılanan Metin: $recognizedText")
    }`,
      java: `TextRecognizer recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS);`,
      flutter: `final textRecognizer = TextRecognizer();
final RecognizedText recognizedText = await textRecognizer.processImage(inputImage);`,
      react_native: `import TextRecognition from '@react-native-ml-kit/text-recognition';
const result = await TextRecognition.recognize(imageUri);`,
      cpp_ndk: `// TensorFlow Lite C++ API for Android`,
      python_kivy: `# OpenCV / TFLite python wrapper`,
    },
  },
];
