import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import { agentTokenRepo, auditRepo } from "../db/repositories";
import { hashPayload } from "../utils/crypto";

export const agentPluginRateLimiter = rateLimit({
  windowMs: 60_000,
  max: (req: Request) => {
    const token = req.headers.authorization?.replace("Bearer ", "") || req.body?.token;
    if (token === "dc_agent_master_token_2026") return 120;
    return 30;
  },
  keyGenerator: (req: Request) => {
    return req.headers.authorization?.replace("Bearer ", "") || req.ip || "anonymous";
  },
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Rate limit exceeded",
      message: "Maksimum 30 istek/dakika (Master token: 120/dk). Lütfen bekleyin.",
      retryAfter: 60,
    });
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export async function agentPluginAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace("Bearer ", "") || req.body?.token;

  if (!token) {
    return res.status(401).json({ error: "Agent Plugin Token gereklidir (Authorization: Bearer <token>)" });
  }

  const validation = await agentTokenRepo.validate(token);
  if (!validation.valid) {
    return res.status(401).json({ error: "Geçersiz, süresi dolmuş veya devre dışı Agent Plugin Token" });
  }

  (req as any).agentToken = token;
  (req as any).agentPermissions = validation.permissions;
  (req as any).agentRateLimit = validation.rateLimit;

  next();
}

export async function agentAuditMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const token = (req as any).agentToken || req.headers.authorization?.replace("Bearer ", "") || "unknown";

  res.on("finish", async () => {
    const latencyMs = Date.now() - start;
    try {
      await auditRepo.log({
        token,
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        latencyMs,
        ip: req.ip,
        payload: req.body,
      });
    } catch (e) {
      console.error("[Audit] Failed to log:", e);
    }
  });

  next();
}

export function requirePermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const permissions = (req as any).agentPermissions || [];
    if (!permissions.includes(permission)) {
      return res.status(403).json({ error: `Bu işlem için '${permission}' izni gereklidir` });
    }
    next();
  };
}

export const generalRateLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  keyGenerator: (req) => req.ip || "anonymous",
  handler: (req, res) => {
    res.status(429).json({ error: "Too many requests", retryAfter: 60 });
  },
});