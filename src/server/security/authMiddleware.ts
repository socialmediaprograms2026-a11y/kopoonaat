import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import firebaseConfig from "../../../firebase-applet-config.json";
import { logAdminAction } from "./auditLogger";

export const SUPER_ADMIN_EMAIL = "alhatfhsab283@gmail.com";
const PROJECT_ID = firebaseConfig.projectId || "mega-sector-dthv3";

export type AdminRole = "super_admin" | "admin" | "editor";

export interface AuthenticatedAdminUser {
  uid: string;
  email: string;
  name?: string;
  role: AdminRole;
  permissions: string[];
  authTime: number;
}

declare global {
  namespace Express {
    interface Request {
      adminUser?: AuthenticatedAdminUser;
    }
  }
}

// Memory store for brute force login / auth attempt rate limiting
interface FailedAuthRecord {
  count: number;
  firstAttempt: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const failedAuthAttempts = new Map<string, FailedAuthRecord>();

function cleanOldFailedAttempts() {
  const now = Date.now();
  for (const [ip, record] of failedAuthAttempts.entries()) {
    if (now - record.lastAttempt > 30 * 60 * 1000 && (!record.blockedUntil || now > record.blockedUntil)) {
      failedAuthAttempts.delete(ip);
    }
  }
}

setInterval(cleanOldFailedAttempts, 10 * 60 * 1000);

function checkFailedAuthRateLimit(ip: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const record = failedAuthAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.blockedUntil && now < record.blockedUntil) {
    return { allowed: false, retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000) };
  }

  // 10 failed attempts within 15 minutes triggers a 15-minute lock
  if (record.count >= 10 && now - record.firstAttempt < 15 * 60 * 1000) {
    record.blockedUntil = now + 15 * 60 * 1000;
    return { allowed: false, retryAfterSeconds: 900 };
  }

  return { allowed: true };
}

function recordFailedAuth(ip: string) {
  const now = Date.now();
  const existing = failedAuthAttempts.get(ip);
  if (!existing || now - existing.lastAttempt > 15 * 60 * 1000) {
    failedAuthAttempts.set(ip, { count: 1, firstAttempt: now, lastAttempt: now });
  } else {
    existing.count += 1;
    existing.lastAttempt = now;
  }
}

function recordSuccessfulAuth(ip: string) {
  failedAuthAttempts.delete(ip);
}

/**
 * Decodes and verifies a Firebase Auth ID token payload
 */
function verifyFirebaseTokenPayload(token: string): { valid: boolean; payload?: any; error?: string } {
  if (!token || typeof token !== "string") {
    return { valid: false, error: "Empty or invalid token string" };
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Malformed JWT structure" };
  }

  try {
    const payloadJson = Buffer.from(parts[1], "base64url").toString("utf-8");
    const payload = JSON.parse(payloadJson);

    const nowSeconds = Math.floor(Date.now() / 1000);

    // 1. Validate Expiration
    if (typeof payload.exp !== "number" || payload.exp < nowSeconds) {
      return { valid: false, error: "Token has expired" };
    }

    // 2. Validate Issued-At
    if (typeof payload.iat !== "number" || payload.iat > nowSeconds + 300) {
      return { valid: false, error: "Token issued in the future" };
    }

    // 3. Validate Audience
    const validAudiences = [PROJECT_ID, firebaseConfig.projectId, process.env.FIREBASE_PROJECT_ID, "mega-sector-dthv3"].filter(Boolean);
    if (!validAudiences.includes(payload.aud)) {
      return { valid: false, error: `Invalid token audience (${payload.aud})` };
    }

    // 4. Validate Issuer
    const expectedIssuers = validAudiences.map(id => `https://securetoken.google.com/${id}`);
    if (!payload.iss || (!expectedIssuers.includes(payload.iss) && !payload.iss.startsWith("https://securetoken.google.com/"))) {
      return { valid: false, error: "Invalid token issuer" };
    }

    // 5. Validate Subject (UID)
    if (!payload.sub || typeof payload.sub !== "string" || payload.sub.length > 128) {
      return { valid: false, error: "Invalid token subject" };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return { valid: false, error: `Failed to parse token payload: ${err.message}` };
  }
}

/**
 * Timing-safe string comparison
 */
function timingSafeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Express Middleware: Requires Authenticated Admin
 * Enforces server-side authentication & authorization on all admin routes.
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "127.0.0.1";

  // 1. Check rate limit
  const rateLimitCheck = checkFailedAuthRateLimit(ip);
  if (!rateLimitCheck.allowed) {
    res.setHeader("Retry-After", String(rateLimitCheck.retryAfterSeconds || 60));
    res.status(429).json({
      error: "Too Many Requests",
      message: "تم حظر المحاولات مؤقتاً بسبب تكرار الفشل. يرجى المحاولة لاحقاً.",
      retryAfterSeconds: rateLimitCheck.retryAfterSeconds
    });
    return;
  }

  // 2. Extract authorization credentials
  const authHeader = req.headers.authorization;
  const adminKeyHeader = (req.headers["x-admin-key"] || req.headers["x-admin-token"]) as string;
  const envAdminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET;

  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (adminKeyHeader) {
    token = adminKeyHeader.trim();
  }

  if (!token) {
    recordFailedAuth(ip);
    res.status(401).json({
      error: "Unauthorized",
      message: "مطلوب تسجيل دخول مسؤول معتمد للوصول إلى لوحة التحكم (Authentication required)."
    });
    return;
  }

  // 3. Option A: Direct Admin API Key verification (for backend/CLI/automated tasks)
  if (envAdminKey && timingSafeCompare(token, envAdminKey)) {
    recordSuccessfulAuth(ip);
    req.adminUser = {
      uid: "service_admin",
      email: SUPER_ADMIN_EMAIL,
      name: "API Administrator",
      role: "super_admin",
      permissions: ["*"],
      authTime: Date.now()
    };
    return next();
  }

  // 4. Option B: Firebase ID Token verification
  const tokenVerification = verifyFirebaseTokenPayload(token);
  if (!tokenVerification.valid || !tokenVerification.payload) {
    recordFailedAuth(ip);
    res.status(401).json({
      error: "Unauthorized",
      message: `رمز الدخول غير صالح أو منتهي الصلاحية: ${tokenVerification.error || "Invalid token"}`
    });
    return;
  }

  const payload = tokenVerification.payload;
  const userEmail = (payload.email || "").toLowerCase().trim();
  const userId = payload.sub;

  // 5. Authorize Admin Role (Super admin email or verified admin claims)
  const isSuperAdmin = userEmail === SUPER_ADMIN_EMAIL.toLowerCase();
  const hasAdminClaim = payload.admin === true || payload.role === "admin" || payload.role === "super_admin" || payload.role === "editor";

  if (!isSuperAdmin && !hasAdminClaim) {
    recordFailedAuth(ip);
    logAdminAction({
      req,
      action: "UNAUTHORIZED_ADMIN_ACCESS_ATTEMPT",
      entityType: "ADMIN_PORTAL",
      status: "FAILED",
      details: { email: userEmail, uid: userId, reason: "Non-admin user tried to access admin route" },
      adminUser: { uid: userId, email: userEmail }
    });

    res.status(403).json({
      error: "Forbidden",
      message: "حسابك لا يمتلك صلاحيات إدارة النظام. يُسمح فقط للمسؤولين المعتمدين."
    });
    return;
  }

  // 6. Successfully authenticated & authorized with granular RBAC
  recordSuccessfulAuth(ip);
  const assignedRole: AdminRole = isSuperAdmin 
    ? "super_admin" 
    : (payload.role === "editor" ? "editor" : "admin");

  const permissions = isSuperAdmin 
    ? ["*"] 
    : assignedRole === "editor"
    ? ["manage_coupons", "manage_products", "view_reports"]
    : ["view_reports", "manage_merchants", "manage_coupons", "manage_products", "sync_niches", "verify_links", "view_wallet", "manage_integrations"];

  req.adminUser = {
    uid: userId,
    email: userEmail,
    name: payload.name || payload.display_name || "Admin",
    role: assignedRole,
    permissions,
    authTime: payload.auth_time || Math.floor(Date.now() / 1000)
  };

  next();
}

/**
 * Express Middleware: Enforces specific RBAC roles
 */
export function requireRole(allowedRoles: AdminRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.adminUser) {
      res.status(401).json({ 
        error: "Unauthorized", 
        message: "يتطلب الوصول تسجيل دخول مسؤول معتمد." 
      });
      return;
    }
    if (req.adminUser.role === "super_admin" || allowedRoles.includes(req.adminUser.role)) {
      return next();
    }
    res.status(403).json({
      error: "Forbidden",
      message: `الصلاحية المطلوبة غير متوفرة لهذا الحساب. الرتب المسموح بها: (${allowedRoles.join(", ")})`
    });
  };
}

/**
 * Optional Admin Auth Middleware (for endpoints that have public view + extra admin data)
 */
export function optionalAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const adminKeyHeader = (req.headers["x-admin-key"] || req.headers["x-admin-token"]) as string;
  let token = "";
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7).trim();
  } else if (adminKeyHeader) {
    token = adminKeyHeader.trim();
  }

  if (!token) {
    return next();
  }

  const envAdminKey = process.env.ADMIN_API_KEY || process.env.ADMIN_SECRET;
  if (envAdminKey && timingSafeCompare(token, envAdminKey)) {
    req.adminUser = {
      uid: "service_admin",
      email: SUPER_ADMIN_EMAIL,
      name: "API Administrator",
      role: "super_admin",
      permissions: ["*"],
      authTime: Date.now()
    };
    return next();
  }

  const tokenVerification = verifyFirebaseTokenPayload(token);
  if (tokenVerification.valid && tokenVerification.payload) {
    const payload = tokenVerification.payload;
    const userEmail = (payload.email || "").toLowerCase().trim();
    if (userEmail === SUPER_ADMIN_EMAIL.toLowerCase() || payload.admin === true || payload.role === "admin" || payload.role === "editor") {
      const assignedRole: AdminRole = userEmail === SUPER_ADMIN_EMAIL.toLowerCase() ? "super_admin" : (payload.role === "editor" ? "editor" : "admin");
      req.adminUser = {
        uid: payload.sub,
        email: userEmail,
        name: payload.name || "Admin",
        role: assignedRole,
        permissions: assignedRole === "super_admin" ? ["*"] : ["view_reports", "manage_merchants", "manage_coupons", "manage_products"],
        authTime: payload.auth_time || Math.floor(Date.now() / 1000)
      };
    }
  }
  next();
}
