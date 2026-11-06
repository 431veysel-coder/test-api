export type SupportedLanguage =
  | "kotlin"
  | "java"
  | "flutter"
  | "react_native"
  | "cpp_ndk"
  | "rust_mobile"
  | "python_kivy"
  | "swift_bridge"
  | "go_mobile"
  | "lua_solar";

export type BuildType = "debug_apk" | "release_apk" | "aab_bundle" | "universal_apk";

export interface MobileModule {
  id: string;
  name: string;
  category: "hardware" | "auth_security" | "storage" | "networking" | "ui_media" | "monetization" | "ai_sensors";
  description: string;
  icon: string;
  version: string;
  permissions: string[];
  gradleDependencies: string[];
  codeSnippets: Record<string, string>;
  uiComponent: string;
  sizeImpactKb: number;
}

export interface ProjectConfig {
  id: string;
  name: string;
  packageName: string;
  versionName: string;
  versionCode: number;
  minSdk: number;
  targetSdk: number;
  language: SupportedLanguage;
  languageVersion?: string;
  activeModules: string[];
  minifyEnabled: boolean;
  shrinkResources: boolean;
  signingScheme: "v1" | "v2_v3_v4";
  appIconUrl?: string;
  themeColor: string;
}

export interface BuildLogRecord {
  id: string;
  projectName: string;
  packageName: string;
  version: string;
  versionCode: number;
  buildType: BuildType;
  language: string;
  status: "success" | "building" | "failed";
  durationSeconds: number;
  fileSizeMb: number;
  sha256: string;
  downloadUrl: string;
  modulesCount: number;
  createdAt: string;
  logs: string[];
}

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  status: "backlog" | "in_progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "critical";
  assignee: { name: string; avatar: string; role: string };
  timeSpentMinutes: number;
  tags: string[];
  dueDate: string;
}

export interface TeamMessage {
  id: string;
  sender: { name: string; avatar: string; role: string; isBot?: boolean };
  content: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    size: string;
    type: string;
    url?: string;
  };
}

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
}
