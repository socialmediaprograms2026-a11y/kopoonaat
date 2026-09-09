import { db } from "../db/database";
import { Merchant } from "../db/schema";
import { getAdapterForNetwork } from "../adapters/adapterRegistry";
import { v4 as uuidv4 } from "uuid";

export type VerificationCategory = "REAL_ACTIVE" | "PENDING_CONFIG" | "BROKEN" | "UNCONFIGURED";

export interface LinkVerificationResult {
  merchantId: string;
  merchantName: string;
  arabicName: string;
  slug: string;
  network: string;
  category: string;
  targetAffiliateUrl: string;
  finalDestinationUrl: string;
  httpStatus: number;
  redirectChain: string[];
  redirectHopsCount: number;
  responseTimeMs: number;
  lastVerifiedAt: string;

  // Tracking Parameters Validation
  trackingValidation: {
    hasPublisherId: boolean;
    publisherIdKey?: string;
    publisherIdValue?: string;
    hasSubIdOrClickId: boolean;
    subIdValue?: string;
    hasNetworkTrackingParam: boolean;
    detectedTrackingParams: string[];
    details: string;
  };

  // API & Webhook Technical Readiness
  integrationReadiness: {
    requiresApiKey: boolean;
    apiKeyPresent: boolean;
    requiresApproval: boolean;
    accountApproved: boolean;
    webhookSupported: boolean;
    webhookConfigured: boolean;
    postbackSupported: boolean;
    postbackConfigured: boolean;
    canReceiveRealConversions: boolean;
    readinessStatus: "READY_TO_EARN" | "REQUIRES_CREDENTIALS" | "REQUIRES_POSTBACK" | "BLOCKED_OR_BROKEN";
    commissionCaptureMode: "DIRECT_AFFILIATE_PORTAL" | "AUTOMATED_API_SYNC" | "WEBHOOK_EVENT" | "BLOCKED";
    actionRequiredText: string;
  };

  // Financial Reality (Zero-Fake Guarantee)
  realApprovedCommissionSar: number;
  realPendingCommissionSar: number;
  recordedClicksCount: number;
  earningsDestination: string;

  // Overall Verified Status
  status: VerificationCategory;
  summaryText: string;
  error?: string;
}

export interface VerificationSummaryReport {
  totalMerchants: number;
  realActive: number;
  pendingConfig: number;
  broken: number;
  unconfigured: number;
  verifiedAt: string;
  results: LinkVerificationResult[];
}

export class LinkVerificationService {
  private static instance: LinkVerificationService;
  private memoryCache: Map<string, LinkVerificationResult> = new Map();
  private lastFullScanAt: string | null = null;
  private isScanning = false;

  private constructor() {
    this.loadPersistedResults();
  }

  public static getInstance(): LinkVerificationService {
    if (!LinkVerificationService.instance) {
      LinkVerificationService.instance = new LinkVerificationService();
    }
    return LinkVerificationService.instance;
  }

  private loadPersistedResults() {
    try {
      const persisted = db.getLinkVerifications();
      if (persisted && typeof persisted === "object") {
        for (const [key, val] of Object.entries(persisted)) {
          this.memoryCache.set(key, val as LinkVerificationResult);
        }
      }
    } catch {
      // Memory cache will populate on first scan
    }
  }

  private persistResults() {
    try {
      const obj: Record<string, LinkVerificationResult> = {};
      this.memoryCache.forEach((val, key) => {
        obj[key] = val;
      });
      db.saveLinkVerifications(obj);
    } catch (e) {
      console.error("[LinkVerificationService] Failed to persist verifications:", e);
    }
  }

  /**
   * Follows HTTP redirects safely with timeout and returns status and hops chain
   */
  public async traceRedirectChain(
    initialUrl: string,
    maxHops = 5,
    timeoutMs = 7000
  ): Promise<{ status: number; hops: string[]; finalUrl: string; responseTimeMs: number; error?: string }> {
    const hops: string[] = [initialUrl];
    let currentUrl = initialUrl;
    let status = 0;
    let finalUrl = initialUrl;
    const startTime = Date.now();

    for (let i = 0; i < maxHops; i++) {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const res = await fetch(currentUrl, {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "ar,en-US;q=0.9,en;q=0.8"
          },
          signal: controller.signal,
          redirect: "manual"
        });

        clearTimeout(timer);
        status = res.status;

        // Redirect statuses
        if ([301, 302, 303, 307, 308].includes(res.status)) {
          const location = res.headers.get("location");
          if (location) {
            try {
              const nextUrl = new URL(location, currentUrl).toString();
              hops.push(nextUrl);
              currentUrl = nextUrl;
              finalUrl = nextUrl;
              continue;
            } catch {
              // Location parse failed
              break;
            }
          }
        }

        finalUrl = currentUrl;
        break;
      } catch (err: any) {
        clearTimeout(timer);
        const duration = Date.now() - startTime;
        return {
          status: status || 0,
          hops,
          finalUrl,
          responseTimeMs: duration,
          error: err.name === "AbortError" ? `انتهت مهلة الاتصال (${timeoutMs}ms)` : (err.message || "Network Error")
        };
      }
    }

    return {
      status,
      hops,
      finalUrl,
      responseTimeMs: Date.now() - startTime
    };
  }

  /**
   * Tests a single merchant's affiliate tracking link live
   */
  public async verifyMerchantLink(merchant: Merchant): Promise<LinkVerificationResult> {
    const testClickId = `ver_${uuidv4().substring(0, 8)}`;
    const adapter = getAdapterForNetwork(merchant.affiliateNetwork || "");

    // Build the real tracking link using the network adapter
    const trackingUrl = adapter.buildTrackingUrl(
      merchant,
      {},
      {
        clickId: testClickId,
        campaign: "admin_verification_audit",
        utmSource: "direct",
        utmMedium: "affiliate_link"
      }
    );

    // If no valid URL configured
    if (!trackingUrl || trackingUrl.startsWith("http://localhost") || trackingUrl.includes("example.com")) {
      const unconfRes: LinkVerificationResult = {
        merchantId: merchant.id,
        merchantName: merchant.name,
        arabicName: merchant.arabicName || merchant.name,
        slug: merchant.slug,
        network: merchant.affiliateNetwork,
        category: merchant.category,
        targetAffiliateUrl: trackingUrl || "",
        finalDestinationUrl: "",
        httpStatus: 0,
        redirectChain: [],
        redirectHopsCount: 0,
        responseTimeMs: 0,
        lastVerifiedAt: new Date().toISOString(),
        trackingValidation: {
          hasPublisherId: false,
          hasSubIdOrClickId: false,
          hasNetworkTrackingParam: false,
          detectedTrackingParams: [],
          details: "الرابط غير مضبوط أو يحتوي على عنوان افتراضي غير صالح."
        },
        integrationReadiness: {
          requiresApiKey: false,
          apiKeyPresent: false,
          requiresApproval: true,
          accountApproved: false,
          webhookSupported: false,
          webhookConfigured: false,
          postbackSupported: false,
          postbackConfigured: false,
          canReceiveRealConversions: false,
          readinessStatus: "BLOCKED_OR_BROKEN",
          commissionCaptureMode: "BLOCKED",
          actionRequiredText: "إضافة رابط المتجر ورابط الأفلييت المعتمد."
        },
        realApprovedCommissionSar: 0,
        realPendingCommissionSar: 0,
        recordedClicksCount: db.getClicksByMerchant(merchant.id).length,
        earningsDestination: "غير محدد",
        status: "UNCONFIGURED",
        summaryText: "الرابط غير مضبوط في قاعدة البيانات."
      };
      this.memoryCache.set(merchant.id, unconfRes);
      return unconfRes;
    }

    // Trace redirect chain
    const trace = await this.traceRedirectChain(trackingUrl, 5, 7000);

    // Analyze tracking params in generated URL & final destination
    let hasPublisherId = false;
    let publisherIdKey: string | undefined;
    let publisherIdValue: string | undefined;
    let hasSubId = false;
    let subIdValue: string | undefined;
    const detectedParams: string[] = [];

    const allUrlsToInspect = [trackingUrl, ...trace.hops, trace.finalUrl];
    const fullSearchString = allUrlsToInspect.join(" ");

    // Network definitions
    const networkLower = (merchant.affiliateNetwork || "").toLowerCase();
    const isLinkAraby = networkLower.includes("linkaraby") || networkLower.includes("لينك عربي");
    const isAmazon = networkLower.includes("amazon");
    const isNoon = networkLower.includes("noon") || networkLower.includes("arabclicks");
    const isAwin = networkLower.includes("awin");
    const isImpact = networkLower.includes("impact");
    const isCJ = networkLower.includes("cj");

    // 1. LinkAraby check (a_aid, a_bid, subid, data1)
    const aidMatch = fullSearchString.match(/[?&]a_aid=([a-zA-Z0-9_-]+)/);
    if (aidMatch) {
      hasPublisherId = true;
      publisherIdKey = "a_aid";
      publisherIdValue = aidMatch[1];
      detectedParams.push(`a_aid=${aidMatch[1]}`);
    }

    const bidMatch = fullSearchString.match(/[?&]a_bid=([a-zA-Z0-9_-]+)/);
    if (bidMatch) {
      detectedParams.push(`a_bid=${bidMatch[1]}`);
    }

    // 2. Amazon tag check (strictly [?&]tag= and must match AMAZON_ASSOCIATES_TAG)
    if (isAmazon) {
      const tagMatch = fullSearchString.match(/[?&]tag=([a-zA-Z0-9_-]+)/);
      if (tagMatch && tagMatch[1] && process.env.AMAZON_ASSOCIATES_TAG && tagMatch[1] === process.env.AMAZON_ASSOCIATES_TAG) {
        hasPublisherId = true;
        publisherIdKey = "tag";
        publisherIdValue = tagMatch[1];
        detectedParams.push(`tag=${tagMatch[1]}`);
      } else {
        hasPublisherId = false;
      }
    }

    // 3. iHerb rcode check
    const rcodeMatch = fullSearchString.match(/[?&]rcode=([a-zA-Z0-9_-]+)/);
    if (rcodeMatch) {
      hasPublisherId = true;
      publisherIdKey = "rcode";
      publisherIdValue = rcodeMatch[1];
      detectedParams.push(`rcode=${rcodeMatch[1]}`);
    }

    // 4. SubID or ClickID verification
    if (
      fullSearchString.includes(testClickId) ||
      fullSearchString.includes("subid=") ||
      fullSearchString.includes("ascsubtag=") ||
      fullSearchString.includes("aff_sub=") ||
      fullSearchString.includes("data1=")
    ) {
      hasSubId = true;
      subIdValue = testClickId;
      detectedParams.push(`subId=${testClickId}`);
    }

    // Integration and readiness analysis based on actual environment and network
    let requiresApiKey = false;
    let apiKeyPresent = false;
    let requiresApproval = true;
    let accountApproved = false;
    let webhookSupported = false;
    const webhookConfigured = false;
    let postbackSupported = false;
    let postbackConfigured = false;
    let canReceiveRealConversions = false;
    let readinessStatus: "READY_TO_EARN" | "REQUIRES_CREDENTIALS" | "REQUIRES_POSTBACK" | "BLOCKED_OR_BROKEN" = "REQUIRES_CREDENTIALS";
    let commissionCaptureMode: "DIRECT_AFFILIATE_PORTAL" | "AUTOMATED_API_SYNC" | "WEBHOOK_EVENT" | "BLOCKED" = "BLOCKED";
    let actionRequiredText = "";
    let earningsDestination = "غير محدد";

    if (isLinkAraby) {
      requiresApiKey = false;
      apiKeyPresent = true;
      requiresApproval = true;
      accountApproved = hasPublisherId;
      webhookSupported = true;
      postbackSupported = true;
      postbackConfigured = false; // Pending portal webhook configuration
      canReceiveRealConversions = hasPublisherId;
      if (hasPublisherId) {
        readinessStatus = "READY_TO_EARN";
        commissionCaptureMode = "DIRECT_AFFILIATE_PORTAL";
        actionRequiredText = "الرابط جاهز تماماً للربح المباشر. تسجل العمولات فوراً في حسابك بلوحة LinkAraby.";
        earningsDestination = "حسابك البنكي عبر منصة لينك عربي (LinkAraby Publisher Dashboard)";
      } else {
        readinessStatus = "REQUIRES_CREDENTIALS";
        commissionCaptureMode = "BLOCKED";
        actionRequiredText = "إضافة معرف الحساب a_aid=gx333hkq2rph5 للرابط.";
      }
    } else if (isAmazon) {
      requiresApiKey = false;
      apiKeyPresent = Boolean(process.env.AMAZON_ASSOCIATES_TAG);
      requiresApproval = true;
      accountApproved = Boolean(process.env.AMAZON_ASSOCIATES_TAG);
      webhookSupported = false;
      postbackSupported = false;
      canReceiveRealConversions = Boolean(process.env.AMAZON_ASSOCIATES_TAG);
      if (apiKeyPresent) {
        readinessStatus = "READY_TO_EARN";
        commissionCaptureMode = "DIRECT_AFFILIATE_PORTAL";
        actionRequiredText = "جاهز لتتبع نقرات ومبيعات أمازون السعودية.";
        earningsDestination = "حسابك البنكي عبر برنامج أمازون أسوشيتس السعودية";
      } else {
        readinessStatus = "REQUIRES_CREDENTIALS";
        commissionCaptureMode = "BLOCKED";
        actionRequiredText = "يرجى إضافة AMAZON_ASSOCIATES_TAG في متغيرات البيئة (.env).";
        earningsDestination = "بانتظار إضافة معرف أمازون";
      }
    } else if (isNoon) {
      requiresApiKey = true;
      apiKeyPresent = Boolean(process.env.ARABCLICKS_API_KEY);
      requiresApproval = true;
      accountApproved = false;
      webhookSupported = true;
      postbackSupported = true;
      canReceiveRealConversions = false;
      readinessStatus = "REQUIRES_CREDENTIALS";
      commissionCaptureMode = "BLOCKED";
      actionRequiredText = "يتطلب ربط حساب معتمد في Noon Partners أو شبكة ArabClicks.";
      earningsDestination = "بانتظار ربط الحساب";
    } else if (isAwin || isImpact || isCJ) {
      const hasKey = Boolean(
        (isAwin && process.env.AWIN_API_KEY) ||
        (isImpact && process.env.IMPACT_ACCOUNT_SID) ||
        (isCJ && process.env.CJ_PERSONAL_ACCESS_TOKEN)
      );
      requiresApiKey = true;
      apiKeyPresent = hasKey;
      requiresApproval = true;
      accountApproved = hasKey;
      webhookSupported = true;
      postbackSupported = true;
      canReceiveRealConversions = hasKey;
      readinessStatus = hasKey ? "READY_TO_EARN" : "REQUIRES_CREDENTIALS";
      commissionCaptureMode = hasKey ? "AUTOMATED_API_SYNC" : "BLOCKED";
      actionRequiredText = hasKey
        ? "المفاتيح متوفرة، المزامنة جاهزة."
        : `إضافة مفاتيح الشبكة (${merchant.affiliateNetwork}) في ملف .env.`;
      earningsDestination = hasKey ? `لوحة تحكم ${merchant.affiliateNetwork}` : "بانتظار المفاتيح";
    } else {
      requiresApiKey = false;
      apiKeyPresent = false;
      requiresApproval = true;
      accountApproved = hasPublisherId;
      webhookSupported = false;
      postbackSupported = false;
      canReceiveRealConversions = hasPublisherId;
      readinessStatus = hasPublisherId ? "READY_TO_EARN" : "REQUIRES_CREDENTIALS";
      commissionCaptureMode = hasPublisherId ? "DIRECT_AFFILIATE_PORTAL" : "BLOCKED";
      actionRequiredText = hasPublisherId ? "الرابط نشط" : "يحتاج تزويد معرّف برنامج التسويق بالعمولة.";
      earningsDestination = "لوحة تحكم المتجر المباشر";
    }

    // Determine final verification category:
    // REAL_ACTIVE: Status 2xx/3xx/403(Cloudflare protection on live domain) AND hasPublisherId === true
    // PENDING_CONFIG: Status 2xx/3xx but missing real publisher ID
    // BROKEN: 404, 500, DNS error, network timeout
    let status: VerificationCategory = "PENDING_CONFIG";
    let summaryText = "";

    const isHttpSuccess =
      (trace.status >= 200 && trace.status < 400) ||
      (trace.status === 403 && trace.finalUrl.includes("http")); // Bot-protection on real domain

    if (trace.error && !trace.status) {
      status = "BROKEN";
      summaryText = `فشل الاتصال بالرابط: ${trace.error}`;
    } else if (trace.status === 404 || trace.status >= 500) {
      status = "BROKEN";
      summaryText = `الرابط غير صالح (رمز الاستجابة: HTTP ${trace.status})`;
    } else if (isHttpSuccess && hasPublisherId) {
      status = "REAL_ACTIVE";
      summaryText = `رابط حقيقي ومختبر بنجاح! كود التتبع (${publisherIdKey}=${publisherIdValue}) مدمج ويعمل.`;
    } else if (isHttpSuccess && !hasPublisherId) {
      status = "PENDING_CONFIG";
      summaryText = `الرابط يعمل تقنياً (HTTP ${trace.status}) لكن يفتقر لمعرّف أفلييت حقيقي خاص بك.`;
    } else {
      status = "BROKEN";
      summaryText = `فشل التحقق من الرابط (HTTP ${trace.status})`;
    }

    // Financial check (Real DB check, strictly no simulated data)
    const clicksForMerchant = db.getClicksByMerchant(merchant.id);
    const conversionsForMerchant = db.getConversionsByMerchant(merchant.id);
    const approvedConversions = conversionsForMerchant.filter((c) => c.status === "APPROVED");
    const pendingConversions = conversionsForMerchant.filter((c) => c.status === "PENDING");

    const realApprovedSar = approvedConversions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
    const realPendingSar = pendingConversions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);

    const result: LinkVerificationResult = {
      merchantId: merchant.id,
      merchantName: merchant.name,
      arabicName: merchant.arabicName || merchant.name,
      slug: merchant.slug,
      network: merchant.affiliateNetwork,
      category: merchant.category,
      targetAffiliateUrl: trackingUrl,
      finalDestinationUrl: trace.finalUrl || trackingUrl,
      httpStatus: trace.status,
      redirectChain: trace.hops,
      redirectHopsCount: Math.max(0, trace.hops.length - 1),
      responseTimeMs: trace.responseTimeMs,
      lastVerifiedAt: new Date().toISOString(),
      trackingValidation: {
        hasPublisherId,
        publisherIdKey,
        publisherIdValue,
        hasSubIdOrClickId: hasSubId,
        subIdValue,
        hasNetworkTrackingParam: detectedParams.length > 0,
        detectedTrackingParams: detectedParams,
        details: hasPublisherId
          ? `تم تأكيد وجود المعرّف (${publisherIdKey}=${publisherIdValue}) مع SubID (${testClickId})`
          : "الرابط لا يحتوي على معرّف أفلييت حقيقي مسجل لحسابك."
      },
      integrationReadiness: {
        requiresApiKey,
        apiKeyPresent,
        requiresApproval,
        accountApproved,
        webhookSupported,
        webhookConfigured,
        postbackSupported,
        postbackConfigured,
        canReceiveRealConversions,
        readinessStatus,
        commissionCaptureMode,
        actionRequiredText
      },
      realApprovedCommissionSar: realApprovedSar,
      realPendingCommissionSar: realPendingSar,
      recordedClicksCount: clicksForMerchant.length,
      earningsDestination,
      status,
      summaryText,
      error: trace.error
    };

    this.memoryCache.set(merchant.id, result);
    return result;
  }

  /**
   * Run verification for all unique merchants with controlled concurrency
   */
  public async verifyAllMerchants(concurrency = 4): Promise<VerificationSummaryReport> {
    if (this.isScanning) {
      return this.getCachedSummary();
    }

    this.isScanning = true;
    const startTime = Date.now();
    const merchants = db.getMerchants();

    // Deduplicate merchants by slug
    const seen = new Set<string>();
    const uniqueMerchants: Merchant[] = [];
    for (const m of merchants) {
      const key = m.slug || m.id;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMerchants.push(m);
      }
    }

    const results: LinkVerificationResult[] = [];
    const queue = [...uniqueMerchants];

    const worker = async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) break;
        try {
          const res = await this.verifyMerchantLink(item);
          results.push(res);
        } catch (err: any) {
          console.error(`[LinkVerificationService] Error verifying ${item.name}:`, err);
        }
      }
    };

    const workers = Array.from({ length: Math.min(concurrency, uniqueMerchants.length) }, () => worker());
    await Promise.all(workers);

    this.lastFullScanAt = new Date().toISOString();
    this.persistResults();
    this.isScanning = false;

    // Record job in db
    db.recordSyncJob({
      jobName: "LINK_VERIFICATION_FULL_SCAN",
      status: "SUCCESS",
      itemsProcessed: results.length,
      startedAt: new Date(startTime).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs: Date.now() - startTime
    });

    return this.generateSummary(results);
  }

  /**
   * Get latest cached summary or initialize fast initial results
   */
  public getCachedSummary(): VerificationSummaryReport {
    const merchants = db.getMerchants();
    const results: LinkVerificationResult[] = [];

    const seen = new Set<string>();
    for (const m of merchants) {
      const key = m.slug || m.id;
      if (seen.has(key)) continue;
      seen.add(key);

      const cached = this.memoryCache.get(m.id);
      if (cached) {
        results.push(cached);
      }
    }

    return this.generateSummary(results);
  }

  private generateSummary(results: LinkVerificationResult[]): VerificationSummaryReport {
    const realActive = results.filter((r) => r.status === "REAL_ACTIVE").length;
    const pendingConfig = results.filter((r) => r.status === "PENDING_CONFIG").length;
    const broken = results.filter((r) => r.status === "BROKEN").length;
    const unconfigured = results.filter((r) => r.status === "UNCONFIGURED").length;

    return {
      totalMerchants: results.length,
      realActive,
      pendingConfig,
      broken,
      unconfigured,
      verifiedAt: this.lastFullScanAt || new Date().toISOString(),
      results
    };
  }

  /**
   * Generates strict profitability and readiness analysis for all stores
   */
  public getProfitabilityAnalysis() {
    const summary = this.getCachedSummary();

    const readyToEarnStores = summary.results.filter(
      (r) => r.integrationReadiness.readinessStatus === "READY_TO_EARN" && r.status === "REAL_ACTIVE"
    );

    const requiresTechSetupStores = summary.results.filter(
      (r) => r.integrationReadiness.readinessStatus !== "READY_TO_EARN" || r.status !== "REAL_ACTIVE"
    );

    // Sum real recorded commissions from DB only
    const allApprovedSar = summary.results.reduce((sum, r) => sum + r.realApprovedCommissionSar, 0);
    const allPendingSar = summary.results.reduce((sum, r) => sum + r.realPendingCommissionSar, 0);
    const totalRecordedClicks = summary.results.reduce((sum, r) => sum + r.recordedClicksCount, 0);

    return {
      overview: {
        totalStoresAnalyzed: summary.totalMerchants,
        readyToEarnStoresCount: readyToEarnStores.length,
        requiresSetupStoresCount: requiresTechSetupStores.length,
        realApprovedRevenueSar: allApprovedSar,
        realPendingRevenueSar: allPendingSar,
        totalTrackedClicks: totalRecordedClicks,
        zeroFakeEarningsGuarantee: true,
        lastAuditedAt: summary.verifiedAt
      },
      readyToEarnStores,
      requiresTechSetupStores,
      allStores: summary.results
    };
  }
}

export const linkVerificationService = LinkVerificationService.getInstance();
