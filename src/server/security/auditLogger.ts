import { Request } from "express";
import { db } from "../db/database";
import { AdminAuditLog } from "../db/schema";

export interface LogAdminActionOptions {
  req: Request;
  action: string;
  entityType: string;
  entityId?: string;
  status?: "SUCCESS" | "FAILED";
  details?: Record<string, any>;
  adminUser?: {
    uid: string;
    email: string;
  };
}

/**
 * Sanitizes details to ensure no private keys or secrets are logged into audit records
 */
function sanitizeAuditDetails(details?: Record<string, any>): Record<string, any> {
  if (!details) return {};
  const sanitized: Record<string, any> = {};
  const sensitiveKeys = [
    "password", "secret", "token", "apiKey", "auth_token", "private_key",
    "access_token", "webhook_secret", "credit_card", "cvv"
  ];

  for (const [key, value] of Object.entries(details)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveKeys.some(s => lowerKey.includes(s))) {
      sanitized[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeAuditDetails(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export function logAdminAction(options: LogAdminActionOptions): AdminAuditLog {
  const { req, action, entityType, entityId, status = "SUCCESS", details, adminUser } = options;
  
  const user = adminUser || (req as any).adminUser || {
    uid: "system_admin",
    email: "alhatfhsab283@gmail.com"
  };

  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "127.0.0.1";
  const userAgent = req.get("user-agent") || "unknown";

  const sanitizedDetails = sanitizeAuditDetails(details);

  const record = db.recordAdminAuditLog({
    adminId: user.uid,
    adminEmail: user.email,
    ip,
    userAgent,
    action,
    entityType,
    entityId,
    status,
    details: sanitizedDetails
  });

  return record;
}
