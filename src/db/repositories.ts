import { db, client } from "./index";
import { schema } from "./schema";
import { eq, desc, and, gte, lte, sql, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { hashPayload } from "../utils/crypto";

export const projectRepo = {
  async getAll() {
    return db.select().from(schema.projects).orderBy(desc(schema.projects.updatedAt));
  },

  async getById(id: string) {
    const result = await db.select().from(schema.projects).where(eq(schema.projects.id, id)).limit(1);
    return result[0] || null;
  },

  async create(data: typeof schema.projects.$inferInsert) {
    const id = data.id || `proj-${uuidv4().slice(0, 8)}`;
    await db.insert(schema.projects).values({ ...data, id });
    return this.getById(id);
  },

  async update(id: string, data: Partial<typeof schema.projects.$inferInsert>) {
    await db.update(schema.projects).set({ ...data, updatedAt: Date.now() }).where(eq(schema.projects.id, id));
    return this.getById(id);
  },

  async delete(id: string) {
    await db.delete(schema.projects).where(eq(schema.projects.id, id));
  },
};

export const buildRepo = {
  async getAll(limit = 50, offset = 0) {
    return db.select().from(schema.builds).orderBy(desc(schema.builds.createdAt)).limit(limit).offset(offset);
  },

  async getByProject(projectId: string) {
    return db.select().from(schema.builds).where(eq(schema.builds.projectId, projectId)).orderBy(desc(schema.builds.createdAt));
  },

  async create(data: typeof schema.builds.$inferInsert) {
    const id = data.id || `build-${uuidv4().slice(0, 8)}`;
    await db.insert(schema.builds).values({ ...data, id });
    return this.getById(id);
  },

  async getById(id: string) {
    const result = await db.select().from(schema.builds).where(eq(schema.builds.id, id)).limit(1);
    return result[0] || null;
  },

  async updateStatus(id: string, status: string, extra?: Partial<typeof schema.builds.$inferInsert>) {
    await db.update(schema.builds).set({ status, ...extra }).where(eq(schema.builds.id, id));
  },
};

export const agentTokenRepo = {
  async getAll() {
    return db.select().from(schema.agentPluginTokens).orderBy(desc(schema.agentPluginTokens.createdAt));
  },

  async getByToken(token: string) {
    const result = await db.select().from(schema.agentPluginTokens).where(eq(schema.agentPluginTokens.token, token)).limit(1);
    return result[0] || null;
  },

  async create(token: string, agentName: string, permissions: string[] = ["terminal", "browser", "build", "database"]) {
    await db.insert(schema.agentPluginTokens).values({ token, agentName, permissions });
    return this.getByToken(token);
  },

  async validate(token: string): Promise<{ valid: boolean; permissions?: string[]; rateLimit?: number }> {
    const record = await this.getByToken(token);
    if (!record || !record.isActive) return { valid: false };
    if (record.expiresAt && record.expiresAt < Date.now()) return { valid: false };
    await db.update(schema.agentPluginTokens).set({ lastUsedAt: Date.now() }).where(eq(schema.agentPluginTokens.token, token));
    return { valid: true, permissions: record.permissions, rateLimit: record.rateLimitPerMin };
  },

  async updateLastUsed(token: string) {
    await db.update(schema.agentPluginTokens).set({ lastUsedAt: Date.now() }).where(eq(schema.agentPluginTokens.token, token));
  },
};

export const auditRepo = {
  async log(entry: {
    token: string;
    endpoint: string;
    method: string;
    statusCode: number;
    latencyMs: number;
    ip?: string;
    payload?: unknown;
  }) {
    const id = `audit-${uuidv4().slice(0, 12)}`;
    const payloadHash = entry.payload ? hashPayload(entry.payload) : null;
    await db.insert(schema.agentAuditLog).values({
      id,
      token: entry.token,
      endpoint: entry.endpoint,
      method: entry.method,
      statusCode: entry.statusCode,
      latencyMs: entry.latencyMs,
      ip: entry.ip,
      payloadHash,
    });
  },

  async getByToken(token: string, limit = 100) {
    return db.select().from(schema.agentAuditLog).where(eq(schema.agentAuditLog.token, token)).orderBy(desc(schema.agentAuditLog.createdAt)).limit(limit);
  },

  async getStats(token?: string) {
    const where = token ? eq(schema.agentAuditLog.token, token) : undefined;
    const total = await db.select({ count: count() }).from(schema.agentAuditLog).where(where);
    const errors = await db.select({ count: count() }).from(schema.agentAuditLog).where(and(where, gte(schema.agentAuditLog.statusCode, 400)));
    const avgLatency = await db.select({ avg: sql`AVG(${schema.agentAuditLog.latencyMs})` }).from(schema.agentAuditLog).where(where);
    return {
      total: total[0]?.count || 0,
      errors: errors[0]?.count || 0,
      avgLatencyMs: Math.round(Number(avgLatency[0]?.avg || 0)),
    };
  },
};

export const vaultRepo = {
  async getAll(search?: string, tag?: string, limit = 50) {
    let query = db.select().from(schema.vaultItems).orderBy(desc(schema.vaultItems.createdAt)).limit(limit);
    // Note: Drizzle doesn't easily support dynamic where, so we filter in memory for search
    const all = await query;
    if (search) {
      return all.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || v.url.toLowerCase().includes(search.toLowerCase()));
    }
    if (tag) {
      return all.filter(v => v.tag === tag);
    }
    return all;
  },

  async create(data: typeof schema.vaultItems.$inferInsert) {
    const id = data.id || `vault-${uuidv4().slice(0, 8)}`;
    await db.insert(schema.vaultItems).values({ ...data, id });
    return this.getById(id);
  },

  async getById(id: string) {
    const result = await db.select().from(schema.vaultItems).where(eq(schema.vaultItems.id, id)).limit(1);
    return result[0] || null;
  },

  async delete(id: string) {
    await db.delete(schema.vaultItems).where(eq(schema.vaultItems.id, id));
  },
};

export const taskRepo = {
  async getAll() {
    return db.select().from(schema.tasks).orderBy(desc(schema.tasks.createdAt));
  },

  async create(data: typeof schema.tasks.$inferInsert) {
    const id = data.id || `task-${uuidv4().slice(0, 8)}`;
    await db.insert(schema.tasks).values({ ...data, id });
    return this.getById(id);
  },

  async getById(id: string) {
    const result = await db.select().from(schema.tasks).where(eq(schema.tasks.id, id)).limit(1);
    return result[0] || null;
  },

  async update(id: string, data: Partial<typeof schema.tasks.$inferInsert>) {
    await db.update(schema.tasks).set({ ...data, updatedAt: Date.now() }).where(eq(schema.tasks.id, id));
    return this.getById(id);
  },

  async delete(id: string) {
    await db.delete(schema.tasks).where(eq(schema.tasks.id, id));
  },
};

export const chatRepo = {
  async getAll(limit = 100) {
    return db.select().from(schema.chatMessages).orderBy(desc(schema.chatMessages.createdAt)).limit(limit);
  },

  async create(data: typeof schema.chatMessages.$inferInsert) {
    const id = data.id || `msg-${uuidv4().slice(0, 8)}`;
    await db.insert(schema.chatMessages).values({ ...data, id });
    return this.getById(id);
  },

  async getById(id: string) {
    const result = await db.select().from(schema.chatMessages).where(eq(schema.chatMessages.id, id)).limit(1);
    return result[0] || null;
  },
};

export const deviceRepo = {
  async getAll() {
    return db.select().from(schema.deviceTelemetry).orderBy(desc(schema.deviceTelemetry.lastPing));
  },

  async upsert(data: typeof schema.deviceTelemetry.$inferInsert) {
    await db.insert(schema.deviceTelemetry).values(data).onConflictDoUpdate({
      target: schema.deviceTelemetry.deviceId,
      set: { ...data, updatedAt: Date.now() },
    });
  },
};

export const serviceRepo = {
  async getAll() {
    return db.select().from(schema.services).orderBy(schema.services.id);
  },

  async upsert(data: typeof schema.services.$inferInsert) {
    await db.insert(schema.services).values(data).onConflictDoUpdate({
      target: schema.services.id,
      set: { ...data, updatedAt: Date.now() },
    });
  },

  async updateStatus(id: string, status: string, extra?: Partial<typeof schema.services.$inferInsert>) {
    await db.update(schema.services).set({ status, ...extra, updatedAt: Date.now() }).where(eq(schema.services.id, id));
  },
};

export const webExtractionRepo = {
  async getAll(limit = 50) {
    return db.select().from(schema.webExtractions).orderBy(desc(schema.webExtractions.createdAt)).limit(limit);
  },

  async create(data: typeof schema.webExtractions.$inferInsert) {
    const id = data.id || `ext-${uuidv4().slice(0, 8)}`;
    await db.insert(schema.webExtractions).values({ ...data, id });
  },
};