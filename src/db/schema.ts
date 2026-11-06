import { sqliteTable, text, integer, real, index, uniqueIndex } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const projects = sqliteTable("projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  packageName: text("package_name").notNull(),
  versionName: text("version_name").notNull(),
  versionCode: integer("version_code").notNull(),
  minSdk: integer("min_sdk").notNull(),
  targetSdk: integer("target_sdk").notNull(),
  language: text("language").notNull(),
  activeModules: text("active_modules", { mode: "json" }).$type<string[]>().default([]),
  minifyEnabled: integer("minify_enabled", { mode: "boolean" }).default(true),
  shrinkResources: integer("shrink_resources", { mode: "boolean" }).default(true),
  signingScheme: text("signing_scheme").default("v2_v3_v4"),
  themeColor: text("theme_color").default("#06b6d4"),
  appIconUrl: text("app_icon_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const builds = sqliteTable("builds", {
  id: text("id").primaryKey(),
  projectId: text("project_id").references(() => projects.id, { onDelete: "cascade" }),
  projectName: text("project_name").notNull(),
  packageName: text("package_name").notNull(),
  version: text("version").notNull(),
  versionCode: integer("version_code").notNull(),
  buildType: text("build_type").notNull(),
  language: text("language").notNull(),
  status: text("status").notNull(),
  durationSeconds: integer("duration_seconds").notNull(),
  fileSizeMb: real("file_size_mb").notNull(),
  sha256: text("sha256").notNull(),
  downloadUrl: text("download_url"),
  modulesCount: integer("modules_count").notNull(),
  logs: text("logs", { mode: "json" }).$type<string[]>().default([]),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  projectIdx: index("builds_project_idx").on(table.projectId),
  createdIdx: index("builds_created_idx").on(table.createdAt),
}));

export const agentPluginTokens = sqliteTable("agent_plugin_tokens", {
  token: text("token").primaryKey(),
  agentName: text("agent_name").notNull(),
  permissions: text("permissions", { mode: "json" }).$type<string[]>().default(["terminal", "browser", "build", "database"]),
  rateLimitPerMin: integer("rate_limit_per_min").default(30),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  lastUsedAt: integer("last_used_at", { mode: "timestamp" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

export const agentAuditLog = sqliteTable("agent_audit_log", {
  id: text("id").primaryKey(),
  token: text("token").references(() => agentPluginTokens.token),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code").notNull(),
  latencyMs: integer("latency_ms").notNull(),
  ip: text("ip"),
  payloadHash: text("payload_hash"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  tokenIdx: index("audit_token_idx").on(table.token),
  createdIdx: index("audit_created_idx").on(table.createdAt),
}));

export const vaultItems = sqliteTable("vault_items", {
  id: text("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  snippet: text("snippet"),
  selector: text("selector"),
  tag: text("tag"),
  agentMission: text("agent_mission"),
  extractedData: text("extracted_data", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  urlIdx: index("vault_url_idx").on(table.url),
  tagIdx: index("vault_tag_idx").on(table.tag),
}));

export const tasks = sqliteTable("tasks", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull(),
  priority: text("priority").notNull(),
  assigneeName: text("assignee_name"),
  assigneeAvatar: text("assignee_avatar"),
  assigneeRole: text("assignee_role"),
  timeSpentMinutes: integer("time_spent_minutes").default(0),
  tags: text("tags", { mode: "json" }).$type<string[]>().default([]),
  dueDate: text("due_date"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  senderName: text("sender_name").notNull(),
  senderAvatar: text("sender_avatar"),
  senderRole: text("sender_role"),
  isBot: integer("is_bot", { mode: "boolean" }).default(false),
  content: text("content").notNull(),
  timestamp: text("timestamp").notNull(),
  fileAttachment: text("file_attachment", { mode: "json" }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const deviceTelemetry = sqliteTable("device_telemetry", {
  deviceId: text("device_id").primaryKey(),
  model: text("model").notNull(),
  osVersion: text("os_version").notNull(),
  cpuArch: text("cpu_arch").notNull(),
  batteryLevel: integer("battery_level").notNull(),
  lastPing: integer("last_ping", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const services = sqliteTable("services", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  status: text("status").notNull(),
  cpuUsage: text("cpu_usage"),
  memoryMb: integer("memory_mb"),
  uptime: text("uptime"),
  description: text("description"),
  config: text("config", { mode: "json" }),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const webExtractions = sqliteTable("web_extractions", {
  id: text("id").primaryKey(),
  sourceUrl: text("source_url").notNull(),
  title: text("title").notNull(),
  extractedField: text("extracted_field"),
  contentSnippet: text("content_snippet"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: text("owner_id").notNull(),
  plan: text("plan").default("free"),
  limits: text("limits", { mode: "json" }).$type<{ buildsPerMonth: number; storageGb: number; agentTokens: number }>().default({ buildsPerMonth: 100, storageGb: 1, agentTokens: 5 }),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  orgId: text("org_id").references(() => organizations.id),
  role: text("role").default("developer"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  emailIdx: uniqueIndex("users_email_idx").on(table.email),
  orgIdx: index("users_org_idx").on(table.orgId),
}));

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`(unixepoch())`),
}, (table) => ({
  userIdx: index("sessions_user_idx").on(table.userId),
}));