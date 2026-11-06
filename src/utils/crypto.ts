import { createHash } from "crypto";

export function hashPayload(payload: unknown): string {
  const str = typeof payload === "string" ? payload : JSON.stringify(payload);
  return createHash("sha256").update(str).digest("hex").slice(0, 16);
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function verifyTokenFormat(token: string): boolean {
  return /^[a-zA-Z0-9_-]{16,}$/.test(token);
}

export function sanitizeInput(input: string): string {
  return input.replace(/[<>\"'&]/g, "");
}