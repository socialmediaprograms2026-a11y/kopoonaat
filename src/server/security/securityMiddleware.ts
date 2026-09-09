import { Request, Response, NextFunction } from "express";
import crypto from "crypto";

/**
 * HTTP Security Headers Middleware
 */
export function applySecurityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // XSS Auditor Protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer Policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Permissions Policy (allow standard frame permissions)
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(), payment=()");

  // Content Security Policy - allow embedding inside Google AI Studio and Cloud Run preview frames
  const cspDirectives = [
    "default-src 'self' https: data: blob:",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://*.firebaseio.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob: http:",
    "connect-src 'self' https: wss: ws:",
    "frame-src 'self' https: data:",
    "frame-ancestors 'self' https://aistudio.google.com https://*.google.com https://ai.studio https://*.run.app",
    "object-src 'none'",
    "base-uri 'self'"
  ].join("; ");

  res.setHeader("Content-Security-Policy", cspDirectives);

  // Cache Control for API endpoints
  if (req.path.startsWith("/api") || req.path.startsWith("/go")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
}

/**
 * Memory-based Sliding Window Rate Limiter
 */
interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitBucket>();

// Periodic cleanup of expired rate limit entries
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of rateLimitStore.entries()) {
    if (now > bucket.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  errorMessage?: string;
}) {
  const { windowMs, maxRequests, keyPrefix, errorMessage } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.ip || req.socket.remoteAddress || "127.0.0.1";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const bucket = rateLimitStore.get(key);

    if (!bucket || now > bucket.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", String(maxRequests - 1));
      res.setHeader("X-RateLimit-Reset", String(Math.ceil((now + windowMs) / 1000)));
      return next();
    }

    if (bucket.count >= maxRequests) {
      const retryAfter = Math.ceil((bucket.resetTime - now) / 1000);
      res.setHeader("Retry-After", String(retryAfter));
      res.setHeader("X-RateLimit-Limit", String(maxRequests));
      res.setHeader("X-RateLimit-Remaining", "0");
      res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetTime / 1000)));

      res.status(429).json({
        error: "Too Many Requests",
        message: errorMessage || "تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً.",
        retryAfterSeconds: retryAfter
      });
      return;
    }

    bucket.count += 1;
    res.setHeader("X-RateLimit-Limit", String(maxRequests));
    res.setHeader("X-RateLimit-Remaining", String(maxRequests - bucket.count));
    res.setHeader("X-RateLimit-Reset", String(Math.ceil(bucket.resetTime / 1000)));
    next();
  };
}

// Pre-configured Rate Limiters
export const aiAnalysisLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 25,
  keyPrefix: "ai_analysis",
  errorMessage: "تم بلوغ الحد الأقصى لتحليلات الذكاء الاصطناعي خلال 15 دقيقة. يرجى الانتظار."
});

export const subscriberLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyPrefix: "subscribers",
  errorMessage: "تم تسجيل عدد كبير من طلبات الاشتراك من نفس المصدر. يرجى المحاولة لاحقاً."
});

export const alertsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 15,
  keyPrefix: "alerts",
  errorMessage: "تم بلوغ الحد الأقصى لإنشاء التنبيهات. يرجى الانتظار."
});

export const trackLimiter = createRateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 300,
  keyPrefix: "tracking",
  errorMessage: "معدل التتبع مرتفع جداً."
});

export const redirectLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  maxRequests: 120,
  keyPrefix: "redirect",
  errorMessage: "تم تجاوز معدل التوجيه السريع."
});

/**
 * Open Redirect & CRLF Vulnerability Protection
 * Validates that redirect URLs are strictly http or https, containing no control or CRLF characters.
 */
export function isSafeRedirectUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  // Disallow CRLF, null bytes, and non-printable control characters
  if (/[\r\n\0\x00-\x1F\x7F]/.test(url)) return false;

  // Block javascript:, data:, vbscript:, file:, about: schemes
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:") ||
    trimmed.startsWith("file:") ||
    trimmed.startsWith("about:") ||
    trimmed.startsWith("//") // Relative protocol scheme prevention
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Timing-safe string comparison to protect webhook secrets and API keys against timing attacks
 */
export function timingSafeCompare(a?: string, b?: string): boolean {
  if (!a || !b) return false;
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
 * Basic XSS and Injection String Sanitizer
 */
export function sanitizeInputString(input: any, maxLength = 1000): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[\0\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Prototype Pollution and Request Sanitization Middleware
 */
export function sanitizeRequestMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Guard against prototype pollution in JSON body
  if (req.body && typeof req.body === "object") {
    if ("__proto__" in req.body || "constructor" in req.body || "prototype" in req.body) {
      delete req.body["__proto__"];
      delete req.body["constructor"];
      delete req.body["prototype"];
    }
  }
  next();
}
