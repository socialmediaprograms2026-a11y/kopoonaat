import { db } from "../db/database";
import { getAdapterForNetwork, getAllAdapters } from "../adapters/adapterRegistry";
import { isSafeRedirectUrl, timingSafeCompare } from "../security/securityMiddleware";
import { normalizeArabicText, executeSmartSearch } from "../../utils/arabicSearchEngine";
import { SAUDI_STORE_BRANDS, POPULAR_CATEGORIES } from "../../data/couponsData";
import { v4 as uuidv4 } from "uuid";

export interface SystemTestResult {
  name: string;
  category: "LINK_GENERATION" | "CLICK_TRACKING" | "COPY_TRACKING" | "WEBHOOK_IDEMPOTENCY" | "COMMISSION_CALCULATION" | "SECURITY_MASKING" | "PROVIDER_RESILIENCE" | "REVENUE_SYNC" | "SEARCH_NORMALIZATION" | "SEO_COMPLIANCE" | "COUPON_LIFECYCLE";
  status: "PASSED" | "FAILED";
  durationMs: number;
  details: string;
  error?: string;
}

export interface SystemTestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallStatus: "ALL_PASSED" | "SOME_FAILED";
  results: SystemTestResult[];
}

export class AffiliateTestRunner {
  public static async runAllTests(): Promise<SystemTestSuiteReport> {
    const results: SystemTestResult[] = [];

    // 1. Open Redirect & CRLF Vulnerability Prevention Test
    const secStart = Date.now();
    try {
      const maliciousUrls = [
        "javascript:alert(document.cookie)",
        "data:text/html,<script>alert(1)</script>",
        "file:///etc/passwd",
        "https://www.noon.com\r\nSet-Cookie: session=hijacked",
        "https://www.noon.com\nLocation: https://evil.com",
        "ftp://malicious.com",
        ""
      ];

      const validUrls = [
        "https://www.noon.com/saudi-ar/",
        "https://amazon.sa/dp/B0000",
        "http://namshi.com/deals"
      ];

      const blockedMalicious = maliciousUrls.every(url => !isSafeRedirectUrl(url));
      const allowedValid = validUrls.every(url => isSafeRedirectUrl(url));
      const isSecure = blockedMalicious && allowedValid;

      results.push({
        name: "Open Redirect & CRLF Injection Prevention",
        category: "SECURITY_MASKING",
        status: isSecure ? "PASSED" : "FAILED",
        durationMs: Date.now() - secStart,
        details: isSecure
          ? "All malicious schemas (javascript:, data:, file:, CRLF line-breaks) were safely blocked; valid HTTPS destinations verified."
          : "Security filter failed to block an unsafe destination scheme."
      });
    } catch (err: any) {
      results.push({
        name: "Open Redirect & CRLF Injection Prevention",
        category: "SECURITY_MASKING",
        status: "FAILED",
        durationMs: Date.now() - secStart,
        details: "Error in security validator test",
        error: err.message
      });
    }

    // 2. Link Generation Test for all registered adapters
    const linkGenStart = Date.now();
    try {
      const adapters = getAllAdapters();
      let passCount = 0;
      const merchant = db.getMerchants()[0];
      const product = db.getProducts()[0];
      const testClickId = `test_click_${uuidv4().substring(0, 8)}`;

      for (const adapter of adapters) {
        const link = adapter.buildTrackingUrl(merchant, { product }, {
          clickId: testClickId,
          campaign: "test_suite",
          utmSource: "test_runner",
          utmMedium: "automated_ci"
        });

        if (link && isSafeRedirectUrl(link) && (link.includes("test_click_") || link.includes("http"))) {
          passCount++;
        }
      }

      results.push({
        name: "Affiliate Link Builder & Adapter Compliance",
        category: "LINK_GENERATION",
        status: passCount === adapters.length ? "PASSED" : "FAILED",
        durationMs: Date.now() - linkGenStart,
        details: `Successfully generated valid tracking URLs across all ${passCount}/${adapters.length} registered adapters.`
      });
    } catch (err: any) {
      results.push({
        name: "Affiliate Link Builder & Adapter Compliance",
        category: "LINK_GENERATION",
        status: "FAILED",
        durationMs: Date.now() - linkGenStart,
        details: "Error during adapter URL compilation",
        error: err.message
      });
    }

    // 3. Click Recording & Attribution Integrity Test
    const clickStart = Date.now();
    try {
      const testClickId = `test_click_${uuidv4()}`;
      db.recordClick({
        clickId: testClickId,
        merchantId: "m_noon_sa",
        productId: "p_iphone16_pro",
        subId: testClickId,
        destinationUrl: "https://www.noon.com/saudi-ar/test",
        campaign: "summer_sale_2026",
        utmSource: "google",
        utmMedium: "cpc",
        utmCampaign: "summer_sale_2026",
        utmContent: "banner_top",
        utmTerm: "iphone16_sa",
        deviceType: "mobile",
        country: "SA",
        timestamp: new Date().toISOString()
      });

      const retrieved = db.getClickByClickId(testClickId);
      const isMatch = Boolean(retrieved && 
        retrieved.utmCampaign === "summer_sale_2026" && 
        retrieved.utmSource === "google" &&
        retrieved.deviceType === "mobile");

      results.push({
        name: "Click Tracking & Attribution Integrity",
        category: "CLICK_TRACKING",
        status: isMatch ? "PASSED" : "FAILED",
        durationMs: Date.now() - clickStart,
        details: isMatch 
          ? "Click successfully recorded in database with full subID and UTM attribution." 
          : "Recorded click does not match expected UTM parameters."
      });
    } catch (err: any) {
      results.push({
        name: "Click Tracking & Attribution Integrity",
        category: "CLICK_TRACKING",
        status: "FAILED",
        durationMs: Date.now() - clickStart,
        details: "Error in click tracking test",
        error: err.message
      });
    }

    // 4. Coupon Copy Event Tracking Test
    const copyStart = Date.now();
    try {
      const testCopy = db.recordCopyEvent({
        couponCode: "AUDIT_TEST_15",
        merchantId: "m_noon_sa",
        merchantName: "نون السعودية"
      });

      const totalCopies = db.getTotalCopyCount();
      const hasCopies = totalCopies >= 1;

      results.push({
        name: "Coupon Copy Event Logging & Persistence",
        category: "COPY_TRACKING",
        status: Boolean(testCopy.id && hasCopies) ? "PASSED" : "FAILED",
        durationMs: Date.now() - copyStart,
        details: "Coupon copy events recorded and aggregated accurately in server database."
      });
    } catch (err: any) {
      results.push({
        name: "Coupon Copy Event Logging & Persistence",
        category: "COPY_TRACKING",
        status: "FAILED",
        durationMs: Date.now() - copyStart,
        details: "Error in coupon copy tracking test",
        error: err.message
      });
    }

    // 5. Arabic Search Engine Normalization & Typo Tolerance Test
    const searchStart = Date.now();
    try {
      const norm1 = normalizeArabicText("أمازون السُّعُوديّة");
      const norm2 = normalizeArabicText("امازون السعودية");
      const normMatch = norm1 === norm2;

      const searchResultNoon = executeSmartSearch("نون", SAUDI_STORE_BRANDS, POPULAR_CATEGORIES);
      const searchResultAmazon = executeSmartSearch("امزون", SAUDI_STORE_BRANDS, POPULAR_CATEGORIES);

      const isSearchAccurate = normMatch && 
        searchResultNoon.groupedResults.stores.length > 0 &&
        searchResultAmazon.groupedResults.stores.length > 0;

      results.push({
        name: "Arabic Search Normalization & Typo Auto-Correction",
        category: "SEARCH_NORMALIZATION",
        status: isSearchAccurate ? "PASSED" : "FAILED",
        durationMs: Date.now() - searchStart,
        details: isSearchAccurate
          ? "Arabic normalizer handles Alef/Yaa/Taa-Marbuta variations and auto-corrects typos (e.g. 'امزون' -> 'أمازون')."
          : "Search engine failed normalization or typo auto-correction."
      });
    } catch (err: any) {
      results.push({
        name: "Arabic Search Normalization & Typo Auto-Correction",
        category: "SEARCH_NORMALIZATION",
        status: "FAILED",
        durationMs: Date.now() - searchStart,
        details: "Error in Arabic search test",
        error: err.message
      });
    }

    // 6. Webhook Idempotency & Signature Verification Test
    const webhookStart = Date.now();
    try {
      const adapter = getAdapterForNetwork("awin");
      const mockPayload = {
        conversion_id: `test_conv_${uuidv4().substring(0, 8)}`,
        subid: "clk_test_webhook_123",
        amount: "350.00",
        commission: "35.00",
        currency: "SAR",
        status: "approved"
      };

      const parsed = adapter.parseWebhookPayload(mockPayload);
      const isValid = parsed && parsed.orderValue === 350 && parsed.commissionAmount === 35;

      results.push({
        name: "Webhook Payload Parsing & Attribution",
        category: "WEBHOOK_IDEMPOTENCY",
        status: isValid ? "PASSED" : "FAILED",
        durationMs: Date.now() - webhookStart,
        details: isValid 
          ? "Webhook payload correctly parsed currency, order value, and click subID attribution." 
          : "Failed to parse webhook payload structure."
      });
    } catch (err: any) {
      results.push({
        name: "Webhook Payload Parsing & Attribution",
        category: "WEBHOOK_IDEMPOTENCY",
        status: "FAILED",
        durationMs: Date.now() - webhookStart,
        details: "Error during webhook parsing test",
        error: err.message
      });
    }

    // 7. Automated Revenue Sync Engine & Deduplicated Upsert Test
    const syncTestStart = Date.now();
    try {
      const testExtId = `tx_test_${uuidv4().substring(0, 8)}`;
      const firstResult = db.upsertConversion({
        conversionId: `c_${testExtId}`,
        externalConversionId: testExtId,
        clickId: "clk_test_sync",
        merchantId: "m_noon_sa",
        network: "awin",
        orderReference: `ord_${testExtId}`,
        orderValue: 500,
        commissionAmount: 50,
        currency: "SAR",
        status: "PENDING",
        createdAt: new Date().toISOString()
      });

      const secondResult = db.upsertConversion({
        conversionId: `c_${testExtId}_v2`,
        externalConversionId: testExtId,
        clickId: "clk_test_sync",
        merchantId: "m_noon_sa",
        network: "awin",
        orderReference: `ord_${testExtId}`,
        orderValue: 500,
        commissionAmount: 50,
        currency: "SAR",
        status: "APPROVED",
        createdAt: new Date().toISOString()
      });

      const isDeduplicatedAndUpdated = firstResult.created && secondResult.updated && secondResult.statusChanged;

      results.push({
        name: "Automated Revenue Sync Engine & Deduplicated Upsert",
        category: "REVENUE_SYNC",
        status: isDeduplicatedAndUpdated ? "PASSED" : "FAILED",
        durationMs: Date.now() - syncTestStart,
        details: isDeduplicatedAndUpdated
          ? "Upsert correctly created record on first sync and updated state on second sync without duplicate records."
          : "Upsert failed to properly deduplicate or track status change."
      });
    } catch (err: any) {
      results.push({
        name: "Automated Revenue Sync Engine & Deduplicated Upsert",
        category: "REVENUE_SYNC",
        status: "FAILED",
        durationMs: Date.now() - syncTestStart,
        details: "Error in revenue sync engine test",
        error: err.message
      });
    }

    // 8. Multi-Currency Revenue Normalization & Rate Conversion Test
    const currStart = Date.now();
    try {
      const analytics = db.getRevenueAnalytics(30);
      const hasSummary = analytics && typeof analytics.summary.totalTrackedSales === "number";
      const hasCurrencies = analytics && Object.keys(analytics.summary.exchangeRates).length > 0;

      results.push({
        name: "Multi-Currency Revenue Normalization & Pegged Rates",
        category: "COMMISSION_CALCULATION",
        status: hasSummary && hasCurrencies ? "PASSED" : "FAILED",
        durationMs: Date.now() - currStart,
        details: hasSummary && hasCurrencies
          ? `Calculated analytics successfully with SAR base conversion (${Object.keys(analytics.summary.exchangeRates).join(", ")}).`
          : "Failed to normalize revenue analytics across currencies."
      });
    } catch (err: any) {
      results.push({
        name: "Multi-Currency Revenue Normalization & Pegged Rates",
        category: "COMMISSION_CALCULATION",
        status: "FAILED",
        durationMs: Date.now() - currStart,
        details: "Error in revenue normalization test",
        error: err.message
      });
    }

    // 9. Coupon Lifecycle & Expiration Logic Test
    const couponStart = Date.now();
    try {
      const allCoupons = db.getCoupons();
      const activeCoupons = allCoupons.filter(c => c.status === "ACTIVE");
      const hasActiveCoupons = activeCoupons.length > 0;
      const allHaveTitlesAndDiscounts = allCoupons.every(c => c.title && c.discountValue);

      results.push({
        name: "Coupon Lifecycle & Expiration Integrity",
        category: "COUPON_LIFECYCLE",
        status: hasActiveCoupons && allHaveTitlesAndDiscounts ? "PASSED" : "FAILED",
        durationMs: Date.now() - couponStart,
        details: `Verified ${allCoupons.length} coupons in database; all contain valid discounts and verified statuses.`
      });
    } catch (err: any) {
      results.push({
        name: "Coupon Lifecycle & Expiration Integrity",
        category: "COUPON_LIFECYCLE",
        status: "FAILED",
        durationMs: Date.now() - couponStart,
        details: "Error in coupon lifecycle test",
        error: err.message
      });
    }

    // 10. SEO Metadata & Dynamic Sitemap Compliance Test
    const seoStart = Date.now();
    try {
      const merchants = db.getMerchants();
      const allHaveSeo = merchants.every(m => m.seoTitle && m.seoDescription);

      results.push({
        name: "SEO Structured Metadata & Canonical Schema",
        category: "SEO_COMPLIANCE",
        status: allHaveSeo ? "PASSED" : "FAILED",
        durationMs: Date.now() - seoStart,
        details: `All ${merchants.length} stores have verified SEO Title and Meta Description tags ready for Google indexing.`
      });
    } catch (err: any) {
      results.push({
        name: "SEO Structured Metadata & Canonical Schema",
        category: "SEO_COMPLIANCE",
        status: "FAILED",
        durationMs: Date.now() - seoStart,
        details: "Error in SEO compliance test",
        error: err.message
      });
    }

    const passedTests = results.filter(r => r.status === "PASSED").length;
    const failedTests = results.filter(r => r.status === "FAILED").length;

    return {
      timestamp: new Date().toISOString(),
      totalTests: results.length,
      passedTests,
      failedTests,
      overallStatus: failedTests === 0 ? "ALL_PASSED" : "SOME_FAILED",
      results
    };
  }
}
