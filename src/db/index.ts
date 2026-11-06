import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const dbUrl = process.env.DATABASE_URL || "file:local.db";
const authToken = process.env.DATABASE_AUTH_TOKEN;

export const client = createClient({
  url: dbUrl,
  authToken,
});

export const db = drizzle(client, { schema });

export type Database = typeof db;

export async function initializeDatabase() {
  console.log("[DB] Initializing database...");

  const statements = [
    // Projects
    `CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      package_name TEXT NOT NULL,
      version_name TEXT NOT NULL,
      version_code INTEGER NOT NULL,
      min_sdk INTEGER NOT NULL,
      target_sdk INTEGER NOT NULL,
      language TEXT NOT NULL,
      active_modules TEXT DEFAULT '[]',
      minify_enabled INTEGER DEFAULT 1,
      shrink_resources INTEGER DEFAULT 1,
      signing_scheme TEXT DEFAULT 'v2_v3_v4',
      theme_color TEXT DEFAULT '#06b6d4',
      app_icon_url TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`,

    // Builds
    `CREATE TABLE IF NOT EXISTS builds (
      id TEXT PRIMARY KEY,
      project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
      project_name TEXT NOT NULL,
      package_name TEXT NOT NULL,
      version TEXT NOT NULL,
      version_code INTEGER NOT NULL,
      build_type TEXT NOT NULL,
      language TEXT NOT NULL,
      status TEXT NOT NULL,
      duration_seconds INTEGER NOT NULL,
      file_size_mb REAL NOT NULL,
      sha256 TEXT NOT NULL,
      download_url TEXT,
      modules_count INTEGER NOT NULL,
      logs TEXT DEFAULT '[]',
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    `CREATE INDEX IF NOT EXISTS builds_project_idx ON builds(project_id)`,
    `CREATE INDEX IF NOT EXISTS builds_created_idx ON builds(created_at)`,

    // Agent Plugin Tokens
    `CREATE TABLE IF NOT EXISTS agent_plugin_tokens (
      token TEXT PRIMARY KEY,
      agent_name TEXT NOT NULL,
      permissions TEXT DEFAULT '["terminal","browser","build","database"]',
      rate_limit_per_min INTEGER DEFAULT 30,
      is_active INTEGER DEFAULT 1,
      created_at INTEGER DEFAULT (unixepoch()),
      last_used_at INTEGER,
      expires_at INTEGER
    )`,

    // Agent Audit Log
    `CREATE TABLE IF NOT EXISTS agent_audit_log (
      id TEXT PRIMARY KEY,
      token TEXT REFERENCES agent_plugin_tokens(token),
      endpoint TEXT NOT NULL,
      method TEXT NOT NULL,
      status_code INTEGER NOT NULL,
      latency_ms INTEGER NOT NULL,
      ip TEXT,
      payload_hash TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    `CREATE INDEX IF NOT EXISTS audit_token_idx ON agent_audit_log(token)`,
    `CREATE INDEX IF NOT EXISTS audit_created_idx ON agent_audit_log(created_at)`,

    // Vault Items
    `CREATE TABLE IF NOT EXISTS vault_items (
      id TEXT PRIMARY KEY,
      url TEXT NOT NULL,
      title TEXT NOT NULL,
      snippet TEXT,
      selector TEXT,
      tag TEXT,
      agent_mission TEXT,
      extracted_data TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    `CREATE INDEX IF NOT EXISTS vault_url_idx ON vault_items(url)`,
    `CREATE INDEX IF NOT EXISTS vault_tag_idx ON vault_items(tag)`,

    // Tasks
    `CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL,
      priority TEXT NOT NULL,
      assignee_name TEXT,
      assignee_avatar TEXT,
      assignee_role TEXT,
      time_spent_minutes INTEGER DEFAULT 0,
      tags TEXT DEFAULT '[]',
      due_date TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      updated_at INTEGER DEFAULT (unixepoch())
    )`,

    // Chat Messages
    `CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      sender_name TEXT NOT NULL,
      sender_avatar TEXT,
      sender_role TEXT,
      is_bot INTEGER DEFAULT 0,
      content TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      file_attachment TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    // Device Telemetry
    `CREATE TABLE IF NOT EXISTS device_telemetry (
      device_id TEXT PRIMARY KEY,
      model TEXT NOT NULL,
      os_version TEXT NOT NULL,
      cpu_arch TEXT NOT NULL,
      battery_level INTEGER NOT NULL,
      last_ping INTEGER NOT NULL,
      updated_at INTEGER DEFAULT (unixepoch())
    )`,

    // Services
    `CREATE TABLE IF NOT EXISTS services (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      cpu_usage TEXT,
      memory_mb INTEGER,
      uptime TEXT,
      description TEXT,
      config TEXT,
      updated_at INTEGER DEFAULT (unixepoch())
    )`,

    // Web Extractions
    `CREATE TABLE IF NOT EXISTS web_extractions (
      id TEXT PRIMARY KEY,
      source_url TEXT NOT NULL,
      title TEXT NOT NULL,
      extracted_field TEXT,
      content_snippet TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    // Organizations
    `CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      plan TEXT DEFAULT 'free',
      limits TEXT DEFAULT '{"buildsPerMonth":100,"storageGb":1,"agentTokens":5}',
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    // Users
    `CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      org_id TEXT REFERENCES organizations(id),
      role TEXT DEFAULT 'developer',
      display_name TEXT,
      avatar_url TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    `CREATE INDEX IF NOT EXISTS users_org_idx ON users(org_id)`,

    // Sessions
    `CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL,
      created_at INTEGER DEFAULT (unixepoch())
    )`,

    `CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id)`,
  ];

  for (const stmt of statements) {
    try {
      await client.execute(stmt);
    } catch (e) {
      console.error("[DB] Statement failed:", stmt.substring(0, 80), e);
    }
  }

  console.log("[DB] Database initialized successfully");
  return db;
}

export { schema };