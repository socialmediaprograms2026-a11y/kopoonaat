import { Router, Request, Response } from "express";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { db } from "../db/database";
import { getAdapterForNetwork, getAllAdapters } from "../adapters/adapterRegistry";
import { emailService } from "../services/emailService";
import { syncService } from "../services/syncService";
import { affiliateRevenueSyncService, SyncProgressEvent } from "../services/AffiliateRevenueSyncService";
import { integrationService } from "../services/integrationService";
import { AffiliateTestRunner } from "../services/affiliateTestRunner";
import { aiNicheBackgroundService } from "../services/aiNicheBackgroundService";
import { linkVerificationService } from "../services/linkVerificationService";
import { Merchant, Product, Coupon, EntityStatus } from "../db/schema";
import { 
  isSafeRedirectUrl, 
  timingSafeCompare, 
  subscriberLimiter, 
  alertsLimiter, 
  trackLimiter 
} from "../security/securityMiddleware";
import { logAdminAction } from "../security/auditLogger";

export const apiRouter = Router();

// Helper to detect device type from user-agent
function detectDeviceType(ua?: string): "mobile" | "desktop" | "tablet" | "bot" | "unknown" {
  if (!ua) return "unknown";
  const lower = ua.toLowerCase();
  if (lower.includes("bot") || lower.includes("crawler") || lower.includes("spider")) return "bot";
  if (lower.includes("ipad") || lower.includes("tablet")) return "tablet";
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) return "mobile";
  return "desktop";
}

/**
 * Public Sanitizer to prevent leaking internal affiliate IDs and adapter secrets
 */
function sanitizePublicMerchant(m: Merchant) {
  const { affiliateProgramId, affiliateTrackingId, ...safe } = m;
  return safe;
}

function sanitizePublicProduct(p: Product) {
  const { externalProductId, ...safe } = p;
  return safe;
}

// -------------------------------------------------------------
// 1. Click & Redirect Engine (/go/:slug or /go/m/:id or /go/c/:id or /go/p/:id)
// -------------------------------------------------------------
export const redirectRouter = Router();

redirectRouter.use((req, res, next) => {
  // Strict SEO & Caching headers for all affiliate redirect paths
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Specific sub-routes for products / coupons / merchants MUST be declared BEFORE /:slug
redirectRouter.get("/p/:productId", (req: Request, res: Response): void => {
  const { productId } = req.params;
  const product = db.getProductById(productId) || db.getProductBySlug(productId);
  if (product) {
    const merchant = db.getMerchantById(product.merchantId) || db.getMerchantBySlug(product.merchantId);
    if (merchant) {
      const clickId = uuidv4();
      const adapter = getAdapterForNetwork(merchant.affiliateNetwork);
      const destinationUrl = adapter.buildTrackingUrl(merchant, { product }, { clickId, utmCampaign: "product_direct" });

      if (!isSafeRedirectUrl(destinationUrl)) {
        res.status(400).send("رابط التوجيه غير آمن أو غير صالح.");
        return;
      }

      db.recordClick({
        clickId,
        merchantId: merchant.id,
        productId: product.id,
        subId: clickId,
        destinationUrl,
        referer: req.get("referer"),
        userAgent: req.get("user-agent"),
        deviceType: detectDeviceType(req.get("user-agent")),
        timestamp: new Date().toISOString()
      });

      db.addIntegrationLog({
        provider: merchant.affiliateNetwork,
        action: "REDIRECT_PRODUCT_CLICK",
        status: "SUCCESS",
        metadata: { clickId, merchantId: merchant.id, productId: product.id, destinationUrl }
      });

      res.redirect(302, destinationUrl);
      return;
    }
  }
  res.status(404).send("المنتج أو رابط الشراء غير موجود.");
});

redirectRouter.get("/c/:couponId", (req: Request, res: Response): void => {
  const { couponId } = req.params;
  const coupon = db.getCouponById(couponId);
  if (coupon) {
    const merchant = db.getMerchantById(coupon.merchantId) || db.getMerchantBySlug(coupon.merchantId);
    if (merchant) {
      const clickId = uuidv4();
      const adapter = getAdapterForNetwork(merchant.affiliateNetwork);
      const destinationUrl = adapter.buildTrackingUrl(merchant, { coupon }, { clickId, utmCampaign: "coupon_direct" });

      if (!isSafeRedirectUrl(destinationUrl)) {
        res.status(400).send("رابط التوجيه غير آمن أو غير صالح.");
        return;
      }

      db.recordClick({
        clickId,
        merchantId: merchant.id,
        couponId: coupon.id,
        subId: clickId,
        destinationUrl,
        referer: req.get("referer"),
        userAgent: req.get("user-agent"),
        deviceType: detectDeviceType(req.get("user-agent")),
        timestamp: new Date().toISOString()
      });

      db.addIntegrationLog({
        provider: merchant.affiliateNetwork,
        action: "REDIRECT_COUPON_CLICK",
        status: "SUCCESS",
        metadata: { clickId, merchantId: merchant.id, couponId: coupon.id, destinationUrl }
      });

      res.redirect(302, destinationUrl);
      return;
    }
  }
  res.status(404).send("الكوبون أو المتجر غير موجود.");
});

redirectRouter.get("/m/:merchantId", (req: Request, res: Response): void => {
  const { merchantId } = req.params;
  const merchant = db.getMerchantById(merchantId) || db.getMerchantBySlug(merchantId);
  if (merchant) {
    const clickId = uuidv4();
    const adapter = getAdapterForNetwork(merchant.affiliateNetwork);
    const destinationUrl = adapter.buildTrackingUrl(merchant, {}, { clickId, utmCampaign: "merchant_direct" });

    if (!isSafeRedirectUrl(destinationUrl)) {
      res.status(400).send("رابط التوجيه غير آمن أو غير صالح.");
      return;
    }

    db.recordClick({
      clickId,
      merchantId: merchant.id,
      subId: clickId,
      destinationUrl,
      referer: req.get("referer"),
      userAgent: req.get("user-agent"),
      deviceType: detectDeviceType(req.get("user-agent")),
      timestamp: new Date().toISOString()
    });

    db.addIntegrationLog({
      provider: merchant.affiliateNetwork,
      action: "REDIRECT_MERCHANT_CLICK",
      status: "SUCCESS",
      metadata: { clickId, merchantId: merchant.id, destinationUrl }
    });

    res.redirect(302, destinationUrl);
    return;
  }
  res.status(404).send("المتجر غير موجود.");
});

redirectRouter.get("/:slug", (req: Request, res: Response): void => {
  const { slug } = req.params;
  const utmSource = (req.query.utm_source as string) || "direct";
  const utmMedium = (req.query.utm_medium as string) || "affiliate_link";
  const utmCampaign = (req.query.utm_campaign as string) || (req.query.campaign as string);
  const utmContent = req.query.utm_content as string;
  const utmTerm = req.query.utm_term as string;
  const sessionId = req.query.session_id as string;
  const visitorId = req.query.visitor_id as string;

  const referer = req.get("referer") || req.get("referrer");
  const userAgent = req.get("user-agent");
  const ip = req.ip || req.socket.remoteAddress;

  // Try finding merchant by slug or id
  let merchant: Merchant | undefined = db.getMerchantBySlug(slug) || db.getMerchantById(slug);
  let product: Product | undefined;
  let coupon: Coupon | undefined;

  // Check if slug matches a product
  if (!merchant) {
    product = db.getProductBySlug(slug) || db.getProductById(slug);
    if (product) {
      merchant = db.getMerchantById(product.merchantId) || db.getMerchantBySlug(product.merchantId);
    }
  }

  // Check if slug matches a coupon
  if (!merchant) {
    coupon = db.getCouponById(slug);
    if (coupon) {
      merchant = db.getMerchantById(coupon.merchantId) || db.getMerchantBySlug(coupon.merchantId);
    }
  }

  if (!merchant) {
    res.status(404).send("المتجر أو الرابط المطلوب غير موجود.");
    return;
  }

  const clickId = uuidv4();
  const adapter = getAdapterForNetwork(merchant.affiliateNetwork);

  // Generate destination tracking URL with subId / clickId
  const destinationUrl = adapter.buildTrackingUrl(
    merchant,
    { product, coupon },
    {
      clickId,
      campaign: utmCampaign,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm
    }
  );

  if (!isSafeRedirectUrl(destinationUrl)) {
    res.status(400).send("رابط التوجيه غير آمن أو غير صالح.");
    return;
  }

  // Record real click into database
  db.recordClick({
    clickId,
    merchantId: merchant.id,
    productId: product?.id,
    couponId: coupon?.id,
    campaign: utmCampaign,
    subId: clickId,
    destinationUrl,
    referer,
    userAgent,
    deviceType: detectDeviceType(userAgent),
    ipAddress: ip,
    country: "SA",
    sessionId,
    visitorId,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    timestamp: new Date().toISOString()
  });

  db.addIntegrationLog({
    provider: merchant.affiliateNetwork,
    action: "REDIRECT_CLICK",
    status: "SUCCESS",
    metadata: {
      clickId,
      merchantId: merchant.id,
      productId: product?.id,
      couponId: coupon?.id,
      destinationUrl
    }
  });

  res.redirect(302, destinationUrl);
});

// -------------------------------------------------------------
// 2. Webhooks & Postbacks (/api/affiliate/webhook/:provider)
// -------------------------------------------------------------
function handleIncomingWebhook(rawProvider: string, req: Request, res: Response) {
  // Normalize provider string (handling potential literal "[provider]" or parameterized route)
  let provider = (rawProvider || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
  if (!provider || provider === "provider") {
    provider = (
      (req.query.provider as string) ||
      (req.body?.provider as string) ||
      (req.headers["x-affiliate-provider"] as string) ||
      "generic"
    ).toLowerCase();
  }

  // 1. Webhook Handshake / Challenge Verification
  // Many networks (e.g. Impact, CJ, Facebook, Meta) send a verification GET challenge
  const challenge = req.query.challenge || req.query["hub.challenge"] || req.headers["webhook-verification-token"];
  if (challenge && (req.method === "GET" || req.query.challenge)) {
    return res.status(200).send(typeof challenge === "string" ? challenge : JSON.stringify(challenge));
  }

  const adapter = getAdapterForNetwork(provider);

  // 2. Verify Webhook Signatures
  // Resolve secret for provider (specific network env var or global fallback)
  const configuredSecret =
    process.env[`${provider.toUpperCase()}_WEBHOOK_SECRET`] ||
    (provider === "awin" ? process.env.AWIN_WEBHOOK_SECRET : undefined) ||
    (provider === "impact" ? process.env.IMPACT_WEBHOOK_SECRET : undefined) ||
    (provider === "cj" ? process.env.CJ_WEBHOOK_SECRET : undefined) ||
    process.env.AFFILIATE_WEBHOOK_SECRET;

  // Pass headers, payload, and configured secret to adapter
  const validation = adapter.validateWebhook(req.headers as any, req.body, configuredSecret);
  let isSignatureValid = validation.isValid;
  let signatureError = validation.error;

  // Verify signature headers (X-Affiliate-Signature, X-Webhook-Secret, etc.) if provided
  const signatureHeader = (
    req.headers["x-affiliate-signature"] ||
    req.headers["x-webhook-secret"] ||
    req.headers["x-signature"] ||
    req.query.webhook_secret
  ) as string;

  if (isSignatureValid && (configuredSecret || signatureHeader)) {
    const effectiveSecret = configuredSecret || "";
    if (effectiveSecret && signatureHeader) {
      if (signatureHeader.startsWith("sha256=")) {
        const payloadStr = typeof req.body === "string" ? req.body : JSON.stringify(req.body || {});
        const expected = "sha256=" + crypto.createHmac("sha256", effectiveSecret).update(payloadStr).digest("hex");
        if (!timingSafeCompare(signatureHeader, expected)) {
          isSignatureValid = false;
          signatureError = "Invalid HMAC SHA256 signature in X-Affiliate-Signature header";
        }
      } else if (!timingSafeCompare(signatureHeader, effectiveSecret)) {
        isSignatureValid = false;
        signatureError = "Invalid shared webhook secret";
      }
    }
  }

  if (!isSignatureValid) {
    const errorMsg = signatureError || "Unauthorized: Invalid webhook signature or secret";
    db.recordWebhookEvent({
      network: provider,
      eventId: `sig_fail_${Date.now()}`,
      payload: req.body || req.query,
      signatureValid: false,
      processed: false,
      errorMessage: errorMsg,
      receivedAt: new Date().toISOString()
    });

    db.addIntegrationLog({
      provider,
      action: "WEBHOOK_RECEIVE",
      status: "ERROR",
      httpStatus: 401,
      error: errorMsg
    });

    res.status(401).json({
      error: "Unauthorized",
      message: errorMsg,
      provider
    });
    return;
  }

  // 3. Validate Transaction Events & Parse Payload
  const rawPayload = (req.body && Object.keys(req.body).length > 0) ? req.body : req.query;
  const parsed = adapter.parseWebhookPayload(req.body, req.query);

  const validationErrors: string[] = [];
  if (!parsed) {
    validationErrors.push("Could not extract conversion transaction details from payload");
  } else {
    if (!parsed.conversionId && !parsed.orderReference) {
      validationErrors.push("Missing conversionId or orderReference in transaction event");
    }
    if (isNaN(parsed.orderValue) || parsed.orderValue < 0) {
      validationErrors.push("Invalid orderValue: must be a valid non-negative number");
    }
    if (isNaN(parsed.commissionAmount) || parsed.commissionAmount < 0) {
      validationErrors.push("Invalid commissionAmount: must be a valid non-negative number");
    }
    const validStatuses = ["PENDING", "APPROVED", "REJECTED", "CANCELLED", "PAID"];
    if (parsed.status && !validStatuses.includes(parsed.status.toUpperCase())) {
      validationErrors.push(`Invalid conversion status: ${parsed.status}. Must be one of: ${validStatuses.join(", ")}`);
    }
  }

  if (validationErrors.length > 0 || !parsed) {
    const errorDetail = validationErrors.join("; ");
    db.recordWebhookEvent({
      network: provider,
      eventId: `unvalidated_${Date.now()}`,
      payload: rawPayload,
      signatureValid: true,
      processed: false,
      errorMessage: errorDetail,
      receivedAt: new Date().toISOString()
    });

    db.addIntegrationLog({
      provider,
      action: "WEBHOOK_EVENT_VALIDATION",
      status: "WARNING",
      httpStatus: 400,
      error: errorDetail
    });

    res.status(400).json({
      error: "Bad Request",
      message: "Transaction event validation failed",
      details: validationErrors,
      provider
    });
    return;
  }

  // 4. Resolve Click & Merchant Metadata
  let matchedMerchantId = parsed.merchantId || "m_unknown";
  let matchedProductId: string | undefined = parsed.productId;

  if (parsed.clickId) {
    const matchingClick = db.getClickByClickId(parsed.clickId);
    if (matchingClick) {
      matchedMerchantId = matchingClick.merchantId;
      matchedProductId = matchingClick.productId;
    }
  }

  // Normalize status, currency, and external transaction ID
  const normalizedStatus = (parsed.status || "PENDING").toUpperCase() as "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "PAID";
  const normalizedCurrency = (parsed.currency || "SAR").toUpperCase().trim();
  const externalConversionId = String(parsed.externalConversionId || parsed.conversionId || parsed.orderReference);

  // 5. Idempotently Save or Update Conversion into Database
  const upsertResult = db.upsertConversion({
    conversionId: parsed.conversionId || `c_${externalConversionId}`,
    externalConversionId,
    clickId: parsed.clickId || undefined,
    merchantId: matchedMerchantId,
    productId: matchedProductId,
    network: provider,
    orderReference: parsed.orderReference || externalConversionId,
    orderValue: parsed.orderValue || 0,
    commissionAmount: parsed.commissionAmount || 0,
    estimatedCommissionAmount: parsed.estimatedCommissionAmount,
    currency: normalizedCurrency,
    status: normalizedStatus,
    rawPayload: parsed.rawPayload || rawPayload,
    createdAt: parsed.timestamp || new Date().toISOString()
  });

  const actionType = upsertResult.created
    ? "CREATED"
    : upsertResult.statusChanged
    ? "STATUS_UPDATED"
    : upsertResult.updated
    ? "UPDATED"
    : "IDEMPOTENT_NOOP";

  // Record audit log and webhook event
  db.recordWebhookEvent({
    network: provider,
    eventId: externalConversionId,
    payload: rawPayload,
    signatureValid: true,
    processed: true,
    receivedAt: new Date().toISOString()
  });

  db.addIntegrationLog({
    provider,
    action: `WEBHOOK_CONVERSION_${actionType}`,
    status: "SUCCESS",
    httpStatus: 200,
    metadata: {
      conversionId: upsertResult.conversion.id,
      externalConversionId,
      action: actionType,
      status: upsertResult.conversion.status,
      statusChanged: upsertResult.statusChanged,
      commission: upsertResult.conversion.commissionAmount,
      currency: upsertResult.conversion.currency
    }
  });

  res.status(200).json({
    success: true,
    action: actionType,
    provider,
    conversionId: upsertResult.conversion.id,
    externalConversionId,
    status: upsertResult.conversion.status,
    statusChanged: upsertResult.statusChanged,
    orderValue: upsertResult.conversion.orderValue,
    commissionAmount: upsertResult.conversion.commissionAmount,
    currency: upsertResult.conversion.currency,
    message: upsertResult.created
      ? "Conversion created successfully"
      : upsertResult.statusChanged
      ? `Conversion updated to ${upsertResult.conversion.status}`
      : "Conversion idempotently processed"
  });
}

// Support both parameterized route and literal [provider] pattern
apiRouter.all("/affiliate/webhook/:provider", (req: Request, res: Response): void => {
  handleIncomingWebhook(req.params.provider, req, res);
});

apiRouter.all("/affiliate/webhook/\\[provider\\]", (req: Request, res: Response): void => {
  const provider = (req.query.provider as string) || (req.body?.provider as string) || (req.headers["x-affiliate-provider"] as string) || "generic";
  handleIncomingWebhook(provider, req, res);
});

apiRouter.all("/webhooks/:network", (req: Request, res: Response): void => {
  handleIncomingWebhook(req.params.network, req, res);
});

apiRouter.all("/postback/:network", (req: Request, res: Response): void => {
  handleIncomingWebhook(req.params.network, req, res);
});

apiRouter.all("/affiliate/postback/:provider", (req: Request, res: Response): void => {
  handleIncomingWebhook(req.params.provider, req, res);
});

// -------------------------------------------------------------
// 3. Public Data APIs
// -------------------------------------------------------------
apiRouter.get("/merchants", (req: Request, res: Response): void => {
  const merchants = db.getMerchants();
  const coupons = db.getCoupons();

  const enriched = merchants.map((m) => {
    const merchantCoupons = coupons.filter((c) => c.merchantId === m.id);
    return {
      ...sanitizePublicMerchant(m),
      coupons: merchantCoupons
    };
  });

  res.json({ merchants: enriched });
});

apiRouter.get("/merchants/:slug", (req: Request, res: Response): void => {
  const { slug } = req.params;
  const merchant = db.getMerchantBySlug(slug) || db.getMerchantById(slug);
  if (!merchant) {
    res.status(404).json({ error: "Merchant not found" });
    return;
  }

  const coupons = db.getCouponsByMerchant(merchant.id);
  const products = db.getProductsByMerchant(merchant.id).map(sanitizePublicProduct);

  res.json({ merchant: { ...sanitizePublicMerchant(merchant), coupons, products } });
});

apiRouter.get("/products", (req: Request, res: Response): void => {
  const products = db.getProducts().map(sanitizePublicProduct);
  res.json({ products });
});

apiRouter.get("/products/:slug", (req: Request, res: Response): void => {
  const { slug } = req.params;
  const product = db.getProductBySlug(slug) || db.getProductById(slug);
  if (!product) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const merchant = db.getMerchantById(product.merchantId);
  res.json({ 
    product: { 
      ...sanitizePublicProduct(product), 
      merchant: merchant ? sanitizePublicMerchant(merchant) : undefined 
    } 
  });
});

apiRouter.get("/coupons", (req: Request, res: Response): void => {
  let coupons = db.getCoupons();
  const { merchantId, status, discountType } = req.query;

  if (merchantId && typeof merchantId === "string") {
    coupons = coupons.filter((c) => c.merchantId.toLowerCase() === merchantId.toLowerCase());
  }
  if (status && typeof status === "string") {
    coupons = coupons.filter((c) => c.status.toLowerCase() === status.toLowerCase());
  }
  if (discountType && typeof discountType === "string") {
    coupons = coupons.filter((c) => c.discountType.toLowerCase() === discountType.toLowerCase());
  }

  res.json({ coupons });
});

apiRouter.post("/coupons/:id/vote", (req: Request, res: Response): void => {
  const { id } = req.params;
  const { isUpvote } = req.body;
  const updated = db.recordCouponVote(id, Boolean(isUpvote));
  if (!updated) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }
  res.json({ success: true, coupon: updated });
});

// Centralized Coupon Copy Tracking Endpoint
apiRouter.post("/analytics/track-copy", trackLimiter, (req: Request, res: Response): void => {
  try {
    const { couponCode, merchantName, merchantId } = req.body;
    if (!couponCode) {
      res.status(400).json({ error: "couponCode is required" });
      return;
    }

    // 1. Record dedicated CopyEvent
    const copyEvent = db.recordCopyEvent({
      couponId: couponCode,
      merchantId: merchantId || "unknown",
      storeId: merchantId || "unknown",
      couponCode: String(couponCode),
      referer: req.get("referer") || req.get("referrer") || "",
      userAgent: req.get("user-agent") || "",
      ipAddress: req.ip || req.socket.remoteAddress || "",
      country: "SA"
    });

    // 2. Also register in click logs for affiliate attribution
    const clickToken = copyEvent.id;
    db.recordClick({
      clickId: clickToken,
      subId: clickToken,
      merchantId: merchantId || "unknown",
      couponId: couponCode,
      destinationUrl: req.get("referer") || "",
      campaign: "coupon_copy_event",
      referer: req.get("referer") || req.get("referrer") || "",
      userAgent: req.get("user-agent") || "",
      deviceType: detectDeviceType(req.get("user-agent")),
      ipAddress: req.ip || req.socket.remoteAddress || "",
      country: "Saudi Arabia",
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, eventId: copyEvent.id, message: "Copy event recorded" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to log copy event" });
  }
});

// Deals API
apiRouter.get("/deals", (req: Request, res: Response): void => {
  const deals = db.getDeals();
  const { merchantId, category } = req.query;
  let filtered = deals;
  if (merchantId && typeof merchantId === "string") {
    filtered = filtered.filter(d => d.merchantId.toLowerCase() === merchantId.toLowerCase() || d.storeId?.toLowerCase() === merchantId.toLowerCase());
  }
  if (category && typeof category === "string") {
    filtered = filtered.filter(d => d.category.toLowerCase() === category.toLowerCase());
  }
  res.json({ deals: filtered });
});

// Categories API
apiRouter.get("/categories", (req: Request, res: Response): void => {
  const categories = db.getCategories();
  res.json({ categories });
});

// Countries API
apiRouter.get("/countries", (req: Request, res: Response): void => {
  const countries = db.getCountries();
  res.json({ countries });
});

// Subscribers API
apiRouter.post("/subscribers", subscriberLimiter, async (req: Request, res: Response): Promise<void> => {
  const { email, source, preferences } = req.body;
  const ip = req.ip || req.socket.remoteAddress || "unknown";

  const validation = emailService.isValidEmail(email);
  if (!validation.valid) {
    res.status(400).json({ error: validation.reason });
    return;
  }

  if (!emailService.checkRateLimit(ip)) {
    res.status(429).json({ error: "تم تجاوز عدد المحاولات المسموح بها. يرجى الانتظار قليلاً." });
    return;
  }

  try {
    const result = await emailService.subscribeUser(email, source, preferences);
    res.json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ error: "فشل حفظ الاشتراك في قاعدة البيانات" });
  }
});

apiRouter.get("/subscribers/verify", (req: Request, res: Response): void => {
  const token = req.query.token as string;
  if (!token || !db.verifySubscriber(token)) {
    res.status(400).send("رمز التفعيل غير صالح أو منتهي الصلاحية.");
    return;
  }
  res.send("تم تأكيد بريدك الإلكتروني بنجاح! شكراً لاشتراكك.");
});

apiRouter.get("/subscribers/unsubscribe", (req: Request, res: Response): void => {
  const token = req.query.token as string;
  if (!token || !db.unsubscribe(token)) {
    res.status(400).send("الرابط غير صالح.");
    return;
  }
  res.send("تم إلغاء اشتراكك بنجاح من قائمة التنبيهات.");
});

// Price Alerts
apiRouter.post("/alerts/price", alertsLimiter, (req: Request, res: Response): void => {
  const { email, productId, targetPrice } = req.body;
  const validation = emailService.isValidEmail(email);
  if (!validation.valid) {
    res.status(400).json({ error: validation.reason });
    return;
  }

  const product = db.getProductById(productId);
  if (!product) {
    res.status(404).json({ error: "المنتج غير موجود." });
    return;
  }

  const alert = db.addPriceAlert({
    email,
    productId,
    merchantId: product.merchantId,
    targetPrice: parseFloat(targetPrice),
    currentPriceAtCreation: product.price
  });

  res.json({ success: true, alert, message: "تم تسجيل تنبيه هبوط السعر بنجاح." });
});

// Coupon Alerts
apiRouter.post("/alerts/coupon", alertsLimiter, (req: Request, res: Response): void => {
  const { email, merchantId } = req.body;
  const validation = emailService.isValidEmail(email);
  if (!validation.valid) {
    res.status(400).json({ error: validation.reason });
    return;
  }

  const merchant = db.getMerchantById(merchantId);
  if (!merchant) {
    res.status(404).json({ error: "المتجر غير موجود." });
    return;
  }

  const alert = db.addCouponAlert({
    email,
    merchantId
  });

  res.json({ success: true, alert, message: `تم تفعيل التنبيه لكوبونات ${merchant.arabicName} بنجاح.` });
});

// Centralized Click Tracking Endpoint (Server-Side Persistence)
apiRouter.post("/analytics/track-click", trackLimiter, (req: Request, res: Response): void => {
  try {
    const { merchantId, merchantName, couponCode, targetUrl, source } = req.body;
    if (!merchantId) {
      res.status(400).json({ error: "merchantId is required" });
      return;
    }

    const clickToken = `clk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const clickRecord = db.recordClick({
      clickId: clickToken,
      subId: clickToken,
      merchantId,
      couponId: couponCode || undefined,
      destinationUrl: targetUrl || "",
      campaign: source || "affiliate_client_tracker",
      referer: req.get("referer") || req.get("referrer") || "",
      userAgent: req.get("user-agent") || "",
      deviceType: detectDeviceType(req.get("user-agent")),
      ipAddress: req.ip || req.socket.remoteAddress || "",
      country: "Saudi Arabia",
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, clickId: clickRecord.clickId });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to log click" });
  }
});

// Public-safe Aggregated Platform Metrics (No private revenue or commission balances leaked)
apiRouter.get("/analytics/summary", (req: Request, res: Response): void => {
  const merchants = db.getMerchants();
  const coupons = db.getCoupons();
  const products = db.getProducts();
  const deals = db.getDeals();
  const subscribersCount = db.getSubscribers().filter((s) => s.status === "ACTIVE").length;

  res.json({
    totalStores: merchants.length,
    totalVerifiedCoupons: coupons.filter(c => c.verificationStatus === "VERIFIED" || c.status === "ACTIVE").length,
    totalProducts: products.length,
    totalDeals: deals.length,
    activeSubscribers: subscribersCount,
    currency: "SAR",
    hasRealData: true
  });
});

// Trending Niches & Background Job status API for client
apiRouter.get("/trending-niches", (req: Request, res: Response): void => {
  const niches = db.getTrendingNiches();
  const latestJob = db.getLatestNicheSyncJob();
  res.json({
    niches,
    lastUpdated: latestJob ? latestJob.finishedAt : new Date().toISOString(),
    latestJob
  });
});

// -------------------------------------------------------------
// 4. Admin Portal Management APIs (/api/admin/*)
// -------------------------------------------------------------
export const adminRouter = Router();

adminRouter.get("/overview", (req: Request, res: Response): void => {
  const merchants = db.getMerchants();
  const coupons = db.getCoupons();
  const products = db.getProducts();
  const clicks = db.getClicks(10);
  const conversions = db.getConversions(10);
  const syncJobs = db.getSyncJobs(5);
  const networks = db.getNetworks();
  const summary = db.getCommissionsSummary();
  const integrations = db.getIntegrations();

  res.json({
    counts: {
      merchants: merchants.length,
      coupons: coupons.length,
      products: products.length,
      clicks: db.getTotalClicksCount(),
      conversions: summary.totalConversions,
      subscribers: db.getSubscribers().length,
      integrations: integrations.length
    },
    commissions: summary,
    recentClicks: clicks,
    recentConversions: conversions,
    recentSyncJobs: syncJobs,
    networks,
    integrations
  });
});

// Comprehensive Reports by Network / Merchant / Product / Time
adminRouter.get("/reports", (req: Request, res: Response): void => {
  const groupBy = (req.query.groupBy as string) || "network";
  const clicks = db.getClicks(500);
  const conversions = db.getConversions(500);
  const merchants = db.getMerchants();
  const products = db.getProducts();

  const reportMap: Record<string, {
    key: string;
    name: string;
    clicks: number;
    conversions: number;
    conversionRate: number;
    totalOrderValue: number;
    commissionAmount: number;
    pendingCommission: number;
    approvedCommission: number;
  }> = {};

  if (groupBy === "merchant") {
    for (const m of merchants) {
      reportMap[m.id] = {
        key: m.id,
        name: m.arabicName || m.name,
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        totalOrderValue: 0,
        commissionAmount: 0,
        pendingCommission: 0,
        approvedCommission: 0
      };
    }
  } else if (groupBy === "product") {
    for (const p of products) {
      reportMap[p.id] = {
        key: p.id,
        name: p.arabicName || p.name,
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        totalOrderValue: 0,
        commissionAmount: 0,
        pendingCommission: 0,
        approvedCommission: 0
      };
    }
  }

  // Aggregate clicks
  for (const c of clicks) {
    const k = groupBy === "merchant" ? c.merchantId : (groupBy === "product" ? (c.productId || "unknown") : (c.campaign || "Direct / Default"));
    if (!reportMap[k]) {
      reportMap[k] = {
        key: k,
        name: k,
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        totalOrderValue: 0,
        commissionAmount: 0,
        pendingCommission: 0,
        approvedCommission: 0
      };
    }
    reportMap[k].clicks++;
  }

  // Aggregate conversions
  for (const conv of conversions) {
    const k = groupBy === "merchant" ? conv.merchantId : (groupBy === "product" ? (conv.productId || "unknown") : conv.network);
    if (!reportMap[k]) {
      reportMap[k] = {
        key: k,
        name: k,
        clicks: 0,
        conversions: 0,
        conversionRate: 0,
        totalOrderValue: 0,
        commissionAmount: 0,
        pendingCommission: 0,
        approvedCommission: 0
      };
    }
    reportMap[k].conversions++;
    reportMap[k].totalOrderValue += conv.orderValue || 0;
    reportMap[k].commissionAmount += conv.commissionAmount || 0;
    if (conv.status === "PENDING") reportMap[k].pendingCommission += conv.commissionAmount || 0;
    if (conv.status === "APPROVED" || conv.status === "PAID") reportMap[k].approvedCommission += conv.commissionAmount || 0;
  }

  const reports = Object.values(reportMap).map(r => ({
    ...r,
    conversionRate: r.clicks > 0 ? parseFloat(((r.conversions / r.clicks) * 100).toFixed(2)) : 0
  }));

  res.json({ groupBy, reports });
});

// Merchants Admin
adminRouter.get("/merchants", (req: Request, res: Response): void => {
  const merchants = db.getMerchants();
  const summary = linkVerificationService.getCachedSummary();
  const resultMap = new Map(summary.results.map((r) => [r.merchantId, r]));

  const enhanced = merchants.map((m) => {
    const ver = resultMap.get(m.id) || summary.results.find((r) => r.slug === m.slug);
    return {
      ...m,
      linkVerification: ver || {
        status: "PENDING_CONFIG",
        httpStatus: 0,
        summaryText: "لم يتم فحص الرابط بعد",
        trackingValidation: { hasPublisherId: false }
      }
    };
  });

  res.json({ merchants: enhanced });
});

// Link Verification Utility Endpoints
adminRouter.get("/merchants/link-verifications", (req: Request, res: Response): void => {
  const summary = linkVerificationService.getCachedSummary();
  res.json(summary);
});

adminRouter.post("/merchants/verify-links", async (req: Request, res: Response): Promise<void> => {
  try {
    const summary = await linkVerificationService.verifyAllMerchants(4);
    res.json(summary);
  } catch (err: any) {
    res.status(500).json({ error: "Failed to verify links", message: err.message });
  }
});

adminRouter.post("/merchants/:id/verify-link", async (req: Request, res: Response): Promise<void> => {
  try {
    const merchant = db.getMerchantById(req.params.id);
    if (!merchant) {
      res.status(404).json({ error: "Merchant not found" });
      return;
    }
    const result = await linkVerificationService.verifyMerchantLink(merchant);
    res.json({ result });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to verify merchant link", message: err.message });
  }
});

// Real Merchant Profitability & Commission Readiness Analysis
adminRouter.get("/profitability-analysis", (req: Request, res: Response): void => {
  const analysis = linkVerificationService.getProfitabilityAnalysis();
  res.json(analysis);
});

adminRouter.post("/merchants", (req: Request, res: Response): void => {
  const body = req.body;
  if (!body.name) {
    res.status(400).json({ error: "اسم المتجر مطلوب (name is required)" });
    return;
  }
  const newMerchant: Merchant = {
    id: `m_${uuidv4().substring(0, 8)}`,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
    name: body.name,
    arabicName: body.arabicName || body.name,
    tagline: body.tagline || "",
    logoText: body.logoText || body.name,
    logoBg: body.logoBg || "bg-emerald-600",
    primaryColor: body.primaryColor || "#059669",
    category: body.category || "عام",
    featured: Boolean(body.featured),
    country: body.country || "السعودية",
    websiteUrl: body.websiteUrl,
    affiliateUrl: body.affiliateUrl || body.websiteUrl,
    affiliateNetwork: body.affiliateNetwork || "Generic",
    affiliateProgramId: body.affiliateProgramId,
    affiliateTrackingId: body.affiliateTrackingId,
    commissionRate: body.commissionRate || "5%",
    cookieDuration: body.cookieDuration || "30 يوم",
    programStatus: body.programStatus || "ACTIVE",
    approvalStatus: body.approvalStatus || "APPROVED",
    seoTitle: body.seoTitle || `كوبونات وعروض ${body.arabicName || body.name}`,
    seoDescription: body.seoDescription || `أحدث كوبونات وتخفيضات ${body.arabicName || body.name}`,
    aboutStore: body.aboutStore || "",
    savingTips: Array.isArray(body.savingTips) ? body.savingTips : [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const saved = db.upsertMerchant(newMerchant);
  logAdminAction({
    req,
    action: "CREATE_MERCHANT",
    entityType: "MERCHANT",
    entityId: saved.id,
    details: { name: saved.name, network: saved.affiliateNetwork }
  });
  res.status(201).json({ merchant: saved });
});

adminRouter.put("/merchants/:id", (req: Request, res: Response): void => {
  const existing = db.getMerchantById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Merchant not found" });
    return;
  }
  const updated = db.upsertMerchant({ ...existing, ...req.body, id: existing.id });
  logAdminAction({
    req,
    action: "UPDATE_MERCHANT",
    entityType: "MERCHANT",
    entityId: updated.id,
    details: { name: updated.name }
  });
  res.json({ merchant: updated });
});

adminRouter.delete("/merchants/:id", (req: Request, res: Response): void => {
  const merchantId = req.params.id;
  const existing = db.getMerchantById(merchantId);
  const deleted = db.deleteMerchant(merchantId);
  if (deleted) {
    logAdminAction({
      req,
      action: "DELETE_MERCHANT",
      entityType: "MERCHANT",
      entityId: merchantId,
      details: { name: existing?.name }
    });
  }
  res.json({ success: deleted });
});

// Coupons Admin
adminRouter.get("/coupons", (req: Request, res: Response): void => {
  res.json({ coupons: db.getCoupons() });
});

adminRouter.post("/coupons", (req: Request, res: Response): void => {
  const body = req.body;
  if (!body.merchantId || !body.code || !body.title) {
    res.status(400).json({ error: "merchantId, code, and title are required" });
    return;
  }
  const newCoupon: Coupon = {
    id: `c_${uuidv4().substring(0, 8)}`,
    merchantId: body.merchantId,
    code: body.code,
    title: body.title,
    description: body.description || "",
    discountType: body.discountType || "PERCENTAGE",
    discountValue: body.discountValue,
    minimumOrder: body.minimumOrder,
    expiryDate: body.expiryDate || "2026-12-31",
    affiliateUrl: body.affiliateUrl,
    type: body.type || "coupon",
    status: body.status || "ACTIVE",
    isExclusive: Boolean(body.isExclusive),
    badge: body.badge,
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 0,
    downvotes: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const saved = db.upsertCoupon(newCoupon);
  logAdminAction({
    req,
    action: "CREATE_COUPON",
    entityType: "COUPON",
    entityId: saved.id,
    details: { code: saved.code, merchantId: saved.merchantId }
  });
  res.status(201).json({ coupon: saved });
});

adminRouter.put("/coupons/:id", (req: Request, res: Response): void => {
  const existing = db.getCouponById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }
  const updated = db.upsertCoupon({ ...existing, ...req.body, id: existing.id });
  logAdminAction({
    req,
    action: "UPDATE_COUPON",
    entityType: "COUPON",
    entityId: updated.id,
    details: { code: updated.code }
  });
  res.json({ coupon: updated });
});

adminRouter.post("/coupons/:id/verify", (req: Request, res: Response): void => {
  const coupon = db.getCouponById(req.params.id);
  if (!coupon) {
    res.status(404).json({ error: "Coupon not found" });
    return;
  }
  coupon.verificationStatus = "VERIFIED";
  coupon.verificationSource = "ADMIN_MANUAL";
  coupon.lastVerifiedAt = new Date().toISOString().split("T")[0];
  db.upsertCoupon(coupon);
  logAdminAction({
    req,
    action: "VERIFY_COUPON",
    entityType: "COUPON",
    entityId: coupon.id,
    details: { code: coupon.code }
  });
  res.json({ success: true, coupon });
});

adminRouter.delete("/coupons/:id", (req: Request, res: Response): void => {
  const couponId = req.params.id;
  const existing = db.getCouponById(couponId);
  const deleted = db.deleteCoupon(couponId);
  if (deleted) {
    logAdminAction({
      req,
      action: "DELETE_COUPON",
      entityType: "COUPON",
      entityId: couponId,
      details: { code: existing?.code }
    });
  }
  res.json({ success: deleted });
});

// Products Admin
adminRouter.get("/products", (req: Request, res: Response): void => {
  res.json({ products: db.getProducts() });
});

adminRouter.post("/products", (req: Request, res: Response): void => {
  const body = req.body;
  const newProduct: Product = {
    id: `p_${uuidv4().substring(0, 8)}`,
    slug: body.slug || body.name.toLowerCase().replace(/\s+/g, "-"),
    merchantId: body.merchantId,
    name: body.name,
    arabicName: body.arabicName || body.name,
    description: body.description || "",
    image: body.image || "",
    productUrl: body.productUrl,
    affiliateUrl: body.affiliateUrl || body.productUrl,
    price: parseFloat(body.price),
    oldPrice: body.oldPrice ? parseFloat(body.oldPrice) : undefined,
    currency: body.currency || "SAR",
    discountPercentage: body.discountPercentage ? parseFloat(body.discountPercentage) : undefined,
    availability: body.availability || "IN_STOCK",
    sku: body.sku,
    brand: body.brand,
    rating: body.rating ? parseFloat(body.rating) : 4.8,
    category: body.category || "عام",
    source: "MANUAL",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const saved = db.upsertProduct(newProduct);
  logAdminAction({
    req,
    action: "CREATE_PRODUCT",
    entityType: "PRODUCT",
    entityId: saved.id,
    details: { name: saved.name }
  });
  res.status(201).json({ product: saved });
});

adminRouter.put("/products/:id", (req: Request, res: Response): void => {
  const existing = db.getProductById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Product not found" });
    return;
  }
  const updated = db.upsertProduct({ ...existing, ...req.body, id: existing.id });
  logAdminAction({
    req,
    action: "UPDATE_PRODUCT",
    entityType: "PRODUCT",
    entityId: updated.id,
    details: { name: updated.name }
  });
  res.json({ product: updated });
});

adminRouter.delete("/products/:id", (req: Request, res: Response): void => {
  const productId = req.params.id;
  const existing = db.getProductById(productId);
  const deleted = db.deleteProduct(productId);
  if (deleted) {
    logAdminAction({
      req,
      action: "DELETE_PRODUCT",
      entityType: "PRODUCT",
      entityId: productId,
      details: { name: existing?.name }
    });
  }
  res.json({ success: deleted });
});

// Deals Admin
adminRouter.get("/deals", (req: Request, res: Response): void => {
  res.json({ deals: db.getDeals() });
});

adminRouter.post("/deals", (req: Request, res: Response): void => {
  const body = req.body;
  if (!body.title || !body.merchantId) {
    res.status(400).json({ error: "title and merchantId are required" });
    return;
  }
  const newDeal = db.upsertDeal({
    id: `deal_${uuidv4().substring(0, 8)}`,
    slug: body.slug || body.title.toLowerCase().replace(/\s+/g, "-"),
    merchantId: body.merchantId,
    storeId: body.merchantId,
    title: body.title,
    arabicTitle: body.arabicTitle || body.title,
    description: body.description || "",
    dealType: body.dealType || "DIRECT_DISCOUNT",
    originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : undefined,
    discountedPrice: body.discountedPrice ? parseFloat(body.discountedPrice) : undefined,
    calculatedDiscountPercentage: body.calculatedDiscountPercentage ? parseFloat(body.calculatedDiscountPercentage) : undefined,
    currency: body.currency || "SAR",
    affiliateUrl: body.affiliateUrl || "",
    startDate: body.startDate,
    expiryDate: body.expiryDate || "2026-12-31",
    status: body.status || "ACTIVE",
    verified: Boolean(body.verified ?? true),
    lastVerifiedAt: new Date().toISOString(),
    verificationSource: body.verificationSource || "ADMIN_MANUAL",
    image: body.image,
    category: body.category || "عام",
    isFeatured: Boolean(body.isFeatured),
    clickCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  res.status(201).json({ deal: newDeal });
});

adminRouter.put("/deals/:id", (req: Request, res: Response): void => {
  const existing = db.getDealById(req.params.id);
  if (!existing) {
    res.status(404).json({ error: "Deal not found" });
    return;
  }
  const updated = db.upsertDeal({ ...existing, ...req.body, id: existing.id });
  res.json({ deal: updated });
});

adminRouter.delete("/deals/:id", (req: Request, res: Response): void => {
  const deleted = db.deleteDeal(req.params.id);
  res.json({ success: deleted });
});

// Categories Admin
adminRouter.get("/categories", (req: Request, res: Response): void => {
  res.json({ categories: db.getCategories() });
});

adminRouter.post("/categories", (req: Request, res: Response): void => {
  const body = req.body;
  if (!body.name && !body.arabicName) {
    res.status(400).json({ error: "name or arabicName is required" });
    return;
  }
  const slug = body.slug || (body.name || body.arabicName).toLowerCase().replace(/\s+/g, "-");
  const cat = db.upsertCategory({
    id: body.id || `cat_${uuidv4().substring(0, 6)}`,
    slug,
    name: body.name || body.arabicName,
    arabicName: body.arabicName || body.name,
    icon: body.icon || "Tag",
    description: body.description || "",
    featured: Boolean(body.featured),
    sortOrder: body.sortOrder ? parseInt(body.sortOrder) : 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  res.status(201).json({ category: cat });
});

// Countries Admin
adminRouter.get("/countries", (req: Request, res: Response): void => {
  res.json({ countries: db.getCountries() });
});

adminRouter.put("/countries/:code", (req: Request, res: Response): void => {
  const updated = db.updateCountry(req.params.code.toUpperCase(), req.body);
  if (!updated) {
    res.status(404).json({ error: "Country not found" });
    return;
  }
  res.json({ country: updated });
});

// Bulk Import for Coupons / Offers
adminRouter.post("/coupons/bulk-import", (req: Request, res: Response): void => {
  const { coupons: rawCoupons } = req.body;
  if (!Array.isArray(rawCoupons)) {
    res.status(400).json({ error: "coupons array is required" });
    return;
  }

  const imported: Coupon[] = [];
  let skipped = 0;

  for (const item of rawCoupons) {
    if (!item.code || !item.merchantId) {
      skipped++;
      continue;
    }
    const cleanCode = item.code.trim().toUpperCase();
    const newCoupon: Coupon = {
      id: `c_${uuidv4().substring(0, 8)}`,
      merchantId: item.merchantId,
      storeId: item.merchantId,
      code: cleanCode,
      title: item.title || `كود خصم ${cleanCode}`,
      description: item.description || "",
      discountType: item.discountType || "PERCENTAGE",
      discountValue: item.discountValue || "10%",
      minimumOrder: item.minimumOrder,
      expiryDate: item.expiryDate || "2026-12-31",
      affiliateUrl: item.affiliateUrl,
      type: item.type || "coupon",
      status: item.status || "ACTIVE",
      isExclusive: Boolean(item.isExclusive),
      badge: item.badge,
      verificationStatus: "VERIFIED",
      verificationSource: "ADMIN_MANUAL",
      lastVerifiedAt: new Date().toISOString().split("T")[0],
      upvotes: 0,
      downvotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.upsertCoupon(newCoupon);
    imported.push(newCoupon);
  }

  res.status(201).json({
    success: true,
    importedCount: imported.length,
    skippedCount: skipped,
    imported
  });
});

// Integrations Admin & Connectivity
adminRouter.get("/integrations", async (req: Request, res: Response): Promise<void> => {
  const catalog = await integrationService.getIntegrationCatalog();
  res.json({ integrations: catalog });
});

adminRouter.post("/integrations/test", async (req: Request, res: Response): Promise<void> => {
  const { serviceId } = req.body;
  if (!serviceId) {
    res.status(400).json({ error: "serviceId is required" });
    return;
  }
  const result = await integrationService.testSingleService(serviceId);
  res.json(result);
});

adminRouter.post("/integrations/toggle", (req: Request, res: Response): void => {
  const { serviceId, isEnabled } = req.body;
  if (!serviceId || typeof isEnabled !== "boolean") {
    res.status(400).json({ error: "serviceId and isEnabled are required" });
    return;
  }
  const status = integrationService.toggleService(serviceId, isEnabled);
  res.json({ success: true, serviceId, isEnabled: status });
});

adminRouter.get("/integrations/logs", (req: Request, res: Response): void => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json({ logs: db.getIntegrationLogs(limit) });
});

adminRouter.get("/networks", (req: Request, res: Response): void => {
  res.json({ networks: db.getNetworks() });
});

adminRouter.post("/networks/test-connection", async (req: Request, res: Response): Promise<void> => {
  const { networkKey } = req.body;
  const adapter = getAdapterForNetwork(networkKey);
  const result = await adapter.testConnection();

  db.updateNetworkConfig(networkKey, {
    connectionStatus: result.connected ? "CONNECTED" : "NOT_CONFIGURED",
    lastTestedAt: new Date().toISOString()
  });

  res.json(result);
});

// Live Clicks, Conversions & Commissions Ledger
adminRouter.get("/clicks", (req: Request, res: Response): void => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json({ clicks: db.getClicks(limit) });
});

adminRouter.get("/conversions", (req: Request, res: Response): void => {
  const limit = parseInt(req.query.limit as string) || 100;
  res.json({ conversions: db.getConversions(limit) });
});

adminRouter.post("/conversions/:id/status", (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;
  if (!status || !["PENDING", "APPROVED", "REJECTED", "CANCELLED", "PAID"].includes(status)) {
    res.status(400).json({ error: "Invalid conversion status" });
    return;
  }

  const updated = db.updateConversionStatus(id, status);
  if (!updated) {
    res.status(404).json({ error: "Conversion not found" });
    return;
  }

  res.json({ success: true, conversion: updated });
});

adminRouter.get("/commissions", (req: Request, res: Response): void => {
  res.json({ commissions: db.getCommissions(), summary: db.getCommissionsSummary() });
});

adminRouter.get("/subscribers", (req: Request, res: Response): void => {
  res.json({ subscribers: db.getSubscribers() });
});

// Sync Jobs Admin Trigger
adminRouter.post("/sync/run", async (req: Request, res: Response): Promise<void> => {
  const results = await syncService.runAllSyncTasks();
  res.json({ success: true, results });
});

adminRouter.get("/sync/logs", (req: Request, res: Response): void => {
  res.json({ logs: db.getSyncJobs() });
});

// Automated Verification & System Test Suite
adminRouter.all("/test-suite/run", async (req: Request, res: Response): Promise<void> => {
  const testReport = await AffiliateTestRunner.runAllTests();
  res.json(testReport);
});

// -------------------------------------------------------------
// 5. Affiliate Revenue & Automated Synchronization Engine APIs
// -------------------------------------------------------------
adminRouter.get("/affiliate/revenue", async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const analytics = db.getRevenueAnalytics(days);
    const healthMatrix = await affiliateRevenueSyncService.getHealthMatrix();
    const recentLogs = db.getAffiliateSyncLogs(10);

    res.json({
      summary: analytics.summary,
      networkBreakdown: analytics.networkBreakdown,
      history: analytics.history,
      syncStatus: {
        lastSyncAt: healthMatrix.lastSyncAt,
        nextSyncAt: healthMatrix.nextSyncAt,
        isRunning: healthMatrix.isRunning,
        currentJob: healthMatrix.currentJob,
        isDelayed: healthMatrix.isDelayed,
        delayReason: healthMatrix.delayReason,
        statusLabel: healthMatrix.lastSyncAt ? "آخر أرباح متزامنة" : "في انتظار المزامنة الأولى",
        isLive: !healthMatrix.isDelayed && !!healthMatrix.lastSyncAt
      },
      providers: healthMatrix.providers,
      recentLogs
    });
  } catch (err: any) {
    res.status(500).json({ error: `فشل جلب بيانات الإيرادات: ${err.message}` });
  }
});

adminRouter.post("/affiliate/revenue/sync", async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, mode = "INCREMENTAL", startDate, endDate } = req.body;
    let result;

    if (provider && provider !== "ALL") {
      const adapter = getAdapterForNetwork(provider);
      const log = await affiliateRevenueSyncService.syncSingleProvider(adapter, mode, startDate, endDate);
      result = {
        success: log.status !== "FAILED",
        logs: [log],
        summary: {
          totalFetched: log.recordsFetched,
          totalCreated: log.recordsCreated,
          totalUpdated: log.recordsUpdated,
          totalSkipped: log.recordsSkipped,
          totalSalesValue: log.totalSalesValue || 0,
          totalCommissionAmount: log.totalCommissionAmount || 0
        }
      };
    } else {
      result = await affiliateRevenueSyncService.syncAllProviders(mode, startDate, endDate);
    }

    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "حدث خطأ أثناء تنفيذ المزامنة" });
  }
});

adminRouter.post("/affiliate/revenue/reconcile", async (req: Request, res: Response): Promise<void> => {
  try {
    const { days = 30, provider } = req.body;
    const result = await affiliateRevenueSyncService.runHistoricalReconciliation(days, provider);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "حدث خطأ أثناء تنفيذ المصالحة التاريخية" });
  }
});

adminRouter.get("/affiliate/revenue/sync-logs", (req: Request, res: Response): void => {
  const limit = parseInt(req.query.limit as string) || 50;
  const provider = req.query.provider as string;
  const logs = db.getAffiliateSyncLogs(limit, provider);
  res.json({ logs });
});

// Real-time Server-Sent Events stream for sync progress updates
adminRouter.get("/affiliate/revenue/stream", (req: Request, res: Response): void => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  // Send initial ping
  res.write(`data: ${JSON.stringify({ type: "INIT", message: "Connected to Affiliate Revenue Realtime Stream" })}\n\n`);

  const onProgress = (event: SyncProgressEvent) => {
    res.write(`data: ${JSON.stringify({ type: "PROGRESS", event })}\n\n`);
  };

  affiliateRevenueSyncService.on("progress", onProgress);

  req.on("close", () => {
    affiliateRevenueSyncService.off("progress", onProgress);
    res.end();
  });
});

// Admin Trending Niches Background Job Management
adminRouter.get("/trending-niches", (req: Request, res: Response): void => {
  const niches = db.getTrendingNiches();
  const latestJob = db.getLatestNicheSyncJob();
  const history = db.getAllNicheSyncJobs(20);
  res.json({
    niches,
    latestJob,
    history
  });
});

adminRouter.post("/trending-niches/sync", async (req: Request, res: Response): Promise<void> => {
  try {
    const report = await aiNicheBackgroundService.runTrendingNichesJob("MANUAL_ADMIN");
    res.json({
      success: report.status === "SUCCESS",
      report,
      niches: db.getTrendingNiches()
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      error: err?.message || "حدث خطأ أثناء تشغيل وظيفة تحديث النيشات"
    });
  }
});

// -------------------------------------------------------------
// 6. Binance Wallet & Payout Management APIs
// -------------------------------------------------------------
adminRouter.get("/payout/config", (req: Request, res: Response): void => {
  const destination = db.getPayoutDestination();
  const transactions = db.getPayoutTransactions(20);
  const commissionsSummary = db.getCommissionsSummary();

  res.json({
    destination,
    transactions,
    commissionsSummary,
    cryptoDetails: {
      network: destination.walletNetwork || "BEP20 (BNB Smart Chain) / ERC20",
      exchange: destination.walletExchange || "Binance (بينانس)",
      address: destination.walletAddress,
      isAddressValid: destination.walletAddress ? /^0x[a-fA-F0-9]{40}$/.test(destination.walletAddress) : false,
      explorerUrl: destination.walletAddress ? `https://bscscan.com/address/${destination.walletAddress}` : null,
      ethExplorerUrl: destination.walletAddress ? `https://etherscan.io/address/${destination.walletAddress}` : null
    }
  });
});

adminRouter.post("/payout/config", (req: Request, res: Response): void => {
  try {
    const { walletAddress, walletNetwork, walletExchange, autoPayoutThresholdSar, accountHolderName, notes } = req.body;
    
    // Validate EVM / Binance wallet format if method is crypto
    if (walletAddress && !/^0x[a-fA-F0-9]{40}$/.test(walletAddress.trim())) {
      res.status(400).json({ error: "عنوان محفظة بينانس غير صالح. يجب أن يبدأ بـ 0x ويحتوي على 40 حرفاً ست عشرياً." });
      return;
    }

    const updated = db.updatePayoutDestination({
      ...(walletAddress ? { walletAddress: walletAddress.trim(), accountIdentifier: walletAddress.trim() } : {}),
      ...(walletNetwork ? { walletNetwork } : {}),
      ...(walletExchange ? { walletExchange } : {}),
      ...(autoPayoutThresholdSar !== undefined ? { autoPayoutThresholdSar: Number(autoPayoutThresholdSar) } : {}),
      ...(accountHolderName ? { accountHolderName } : {}),
      ...(notes !== undefined ? { notes } : {}),
      status: "ACTIVE"
    });

    logAdminAction({
      req,
      action: "UPDATE_PAYOUT_DESTINATION",
      entityType: "PAYOUT_CONFIG",
      details: { walletExchange, walletNetwork, threshold: autoPayoutThresholdSar }
    });

    res.json({
      success: true,
      message: "تم حفظ وتفعيل إعدادات محفظة بينانس بنجاح لاستقبال الأرباح.",
      destination: updated
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "حدث خطأ أثناء تحديث إعدادات المحفظة" });
  }
});

adminRouter.post("/payout/test-payout", (req: Request, res: Response): void => {
  try {
    const destination = db.getPayoutDestination();
    const { amountSar = 50 } = req.body;
    const usdtAmount = Math.round((amountSar / 3.75) * 100) / 100;

    const tx = db.createPayoutTransaction({
      amountSar: Number(amountSar),
      amountCryptoUsdt: usdtAmount,
      method: destination.method,
      destinationAddress: destination.walletAddress || destination.accountIdentifier,
      destinationNetwork: destination.walletNetwork || "BEP20 (BNB Smart Chain)",
      exchange: destination.walletExchange || "Binance",
      status: "CONFIRMED_ON_CHAIN",
      txHash: `0x${crypto.randomBytes(32).toString("hex")}`,
      notes: `تحويل تجريبي مؤكد للأرباح إلى محفظة بينانس: ${destination.walletAddress} (${usdtAmount} USDT)`
    });

    logAdminAction({
      req,
      action: "EXECUTE_TEST_PAYOUT",
      entityType: "PAYOUT_TRANSACTION",
      entityId: tx.id,
      details: { amountSar, usdtAmount }
    });

    res.json({
      success: true,
      message: `تم إنشاء وتسجيل معاملة تحويل أرباح تجريبية بقيمة ${amountSar} ر.س (${usdtAmount} USDT) إلى محفظتك بنجاح.`,
      transaction: tx
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || "حدث خطأ أثناء إنشاء معاملة الأرباح التجريبية" });
  }
});

// -------------------------------------------------------------
// 7. Admin Security Audit Logs API
// -------------------------------------------------------------
adminRouter.get("/audit-logs", (req: Request, res: Response): void => {
  const limit = parseInt(req.query.limit as string) || 100;
  const logs = db.getAdminAuditLogs(limit);
  res.json({ logs });
});

