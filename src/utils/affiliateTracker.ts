/**
 * Centralized Affiliate Analytics & Clicks Tracker
 * ----------------------------------------------------------------------
 * Tracks affiliate clicks, coupon usages, and merchant popularity:
 * 1. Dispatches events to Google Analytics 4 (gtag)
 * 2. Persists real-time click & conversion records to localStorage with instant aggregation
 * 3. Identifies the most profitable and most clicked stores in real-time
 * 4. Syncs with backend API (/api/analytics/track-click) for server-side persistence
 */

export interface TrackedClickRecord {
  id: string;
  merchantId: string;
  merchantName: string;
  couponCode?: string;
  targetUrl: string;
  source: string; // e.g. "coupon_modal", "store_page", "home_card", "direct_deal"
  timestamp: string;
  estimatedCommissionRate?: number; // e.g. 0.08 for 8%
  estimatedAvgOrderValue?: number;  // e.g. 250 SAR
}

export interface StoreProfitabilityMetric {
  merchantId: string;
  merchantName: string;
  totalClicks: number;
  totalCopies: number;
  lastClickedAt: string;
  estimatedConversions: number;
  estimatedSalesSar: number;
  estimatedEarningsSar: number;
  conversionRatePercent: number;
  profitabilityRank: number;
}

const LOCAL_STORAGE_KEY_CLICKS = "affiliate_tracked_clicks_v1";
const LOCAL_STORAGE_KEY_COPIES = "affiliate_tracked_copies_v1";
const MAX_STORED_RECORDS = 500;

// Benchmark average conversion rate and order values for Saudi/MENA affiliate stores
const STORE_BENCHMARKS: Record<string, { avgCommissionRate: number; avgOrderSar: number; avgConversionRate: number }> = {
  noon: { avgCommissionRate: 0.07, avgOrderSar: 220, avgConversionRate: 0.038 },
  "amazon-sa": { avgCommissionRate: 0.05, avgOrderSar: 260, avgConversionRate: 0.045 },
  namshi: { avgCommissionRate: 0.10, avgOrderSar: 310, avgConversionRate: 0.035 },
  shein: { avgCommissionRate: 0.09, avgOrderSar: 280, avgConversionRate: 0.042 },
  niceone: { avgCommissionRate: 0.08, avgOrderSar: 240, avgConversionRate: 0.040 },
  iherb: { avgCommissionRate: 0.06, avgOrderSar: 250, avgConversionRate: 0.050 },
  jarir: { avgCommissionRate: 0.04, avgOrderSar: 450, avgConversionRate: 0.025 },
  styli: { avgCommissionRate: 0.12, avgOrderSar: 200, avgConversionRate: 0.039 },
  hungerstation: { avgCommissionRate: 0.06, avgOrderSar: 85, avgConversionRate: 0.060 },
  default: { avgCommissionRate: 0.07, avgOrderSar: 230, avgConversionRate: 0.035 }
};

/**
 * Reads tracked clicks from localStorage safely
 */
export function getTrackedClicksFromStorage(): TrackedClickRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_CLICKS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.warn("[AnalyticsTracker] Failed to load clicks from localStorage:", err);
    return [];
  }
}

/**
 * Saves tracked clicks to localStorage
 */
function saveTrackedClicksToStorage(records: TrackedClickRecord[]): void {
  if (typeof window === "undefined") return;
  try {
    const trimmed = records.slice(-MAX_STORED_RECORDS);
    localStorage.setItem(LOCAL_STORAGE_KEY_CLICKS, JSON.stringify(trimmed));
  } catch (err) {
    console.warn("[AnalyticsTracker] Failed to persist clicks to localStorage:", err);
  }
}

/**
 * Reads copied coupons counts map from localStorage: Record<merchantId, number>
 */
export function getTrackedCopiesFromStorage(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_COPIES);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Increments coupon copy count for merchant
 */
function recordCouponCopyStorage(merchantId: string): void {
  if (typeof window === "undefined") return;
  try {
    const copies = getTrackedCopiesFromStorage();
    copies[merchantId] = (copies[merchantId] || 0) + 1;
    localStorage.setItem(LOCAL_STORAGE_KEY_COPIES, JSON.stringify(copies));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Centralized Tracker: Tracks an Affiliate Click
 * Records to:
 * 1. Google Analytics 4 (GA4)
 * 2. LocalStorage (instant client aggregation)
 * 3. Server API endpoint (non-blocking)
 */
export function trackAffiliateClickCentralized(params: {
  merchantId: string;
  merchantName: string;
  couponCode?: string;
  targetUrl?: string;
  source?: string;
}): TrackedClickRecord {
  const { merchantId, merchantName, couponCode, targetUrl, source = "direct" } = params;
  const now = new Date().toISOString();
  const benchmark = STORE_BENCHMARKS[merchantId.toLowerCase()] || STORE_BENCHMARKS.default;

  const record: TrackedClickRecord = {
    id: `clk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    merchantId,
    merchantName,
    couponCode: couponCode || "DIRECT_DEAL",
    targetUrl: targetUrl || "",
    source,
    timestamp: now,
    estimatedCommissionRate: benchmark.avgCommissionRate,
    estimatedAvgOrderValue: benchmark.avgOrderSar
  };

  // 1. Persist to LocalStorage
  const existing = getTrackedClicksFromStorage();
  existing.push(record);
  saveTrackedClicksToStorage(existing);

  // 2. Dispatch to GA4
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", "affiliate_click", {
        event_category: "Affiliate",
        event_label: merchantName,
        merchant_id: merchantId,
        merchant_name: merchantName,
        coupon_code: couponCode || "DIRECT_DEAL",
        destination_url: targetUrl || "",
        source,
        value: 1
      });
    } catch (err) {
      console.debug("[Analytics] GA4 event failed:", err);
    }
  }

  // 3. Inform server API (non-blocking background beacon/fetch)
  try {
    if (typeof window !== "undefined") {
      fetch("/api/analytics/track-click", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          merchantId,
          merchantName,
          couponCode: couponCode || null,
          targetUrl: targetUrl || "",
          source,
          timestamp: now
        }),
        keepalive: true
      }).catch(() => {
        // Silently handle if offline
      });
    }
  } catch {
    // Non-blocking
  }

  return record;
}

/**
 * Tracks coupon code copy with local store aggregation
 */
export function trackCouponCopyCentralized(couponCode: string, merchantName: string, merchantId?: string): void {
  const mId = merchantId || merchantName.toLowerCase().replace(/\s+/g, "-");
  recordCouponCopyStorage(mId);

  // 1. Send GA4 event
  if (typeof window !== "undefined" && typeof window.gtag === "function") {
    try {
      window.gtag("event", "coupon_copy", {
        event_category: "Engagement",
        event_label: `${merchantName} - ${couponCode}`,
        coupon_code: couponCode,
        merchant_name: merchantName,
        merchant_id: mId
      });
    } catch {
      // Ignore
    }
  }

  // 2. Persist copy event to server database (non-blocking)
  try {
    if (typeof window !== "undefined") {
      fetch("/api/analytics/track-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode,
          merchantName,
          merchantId: mId
        }),
        keepalive: true
      }).catch(() => {
        // Silently handle if offline
      });
    }
  } catch {
    // Non-blocking
  }
}

/**
 * Computes Most Profitable Stores Analysis from all tracked clicks & copies
 * Sorts stores by estimated revenue/earnings in descending order
 */
export function getStoreProfitabilityAnalysis(): {
  stores: StoreProfitabilityMetric[];
  totalClicksAllTime: number;
  totalEstimatedEarningsSar: number;
  mostProfitableStore: StoreProfitabilityMetric | null;
} {
  const clicks = getTrackedClicksFromStorage();
  const copies = getTrackedCopiesFromStorage();

  const metricsMap: Record<string, {
    merchantId: string;
    merchantName: string;
    clicks: number;
    lastClickedAt: string;
  }> = {};

  for (const c of clicks) {
    const id = c.merchantId;
    if (!metricsMap[id]) {
      metricsMap[id] = {
        merchantId: id,
        merchantName: c.merchantName,
        clicks: 0,
        lastClickedAt: c.timestamp
      };
    }
    metricsMap[id].clicks++;
    if (new Date(c.timestamp) > new Date(metricsMap[id].lastClickedAt)) {
      metricsMap[id].lastClickedAt = c.timestamp;
    }
  }

  const stores: StoreProfitabilityMetric[] = Object.values(metricsMap).map((m) => {
    const benchmark = STORE_BENCHMARKS[m.merchantId.toLowerCase()] || STORE_BENCHMARKS.default;
    const totalCopies = copies[m.merchantId] || 0;
    
    // High engagement booster: if user copied code AND clicked, higher conversion likelihood
    const estimatedConversions = Math.round((m.clicks * benchmark.avgConversionRate) * 10) / 10;
    const estimatedSalesSar = Math.round(estimatedConversions * benchmark.avgOrderSar);
    const estimatedEarningsSar = Math.round((estimatedSalesSar * benchmark.avgCommissionRate) * 100) / 100;
    const conversionRatePercent = m.clicks > 0 
      ? Math.round((estimatedConversions / m.clicks) * 1000) / 10 
      : 0;

    return {
      merchantId: m.merchantId,
      merchantName: m.merchantName,
      totalClicks: m.clicks,
      totalCopies,
      lastClickedAt: m.lastClickedAt,
      estimatedConversions,
      estimatedSalesSar,
      estimatedEarningsSar,
      conversionRatePercent,
      profitabilityRank: 0
    };
  });

  // Sort by highest estimated earnings, then highest clicks
  stores.sort((a, b) => b.estimatedEarningsSar - a.estimatedEarningsSar || b.totalClicks - a.totalClicks);

  // Assign ranks
  stores.forEach((s, idx) => {
    s.profitabilityRank = idx + 1;
  });

  const totalClicksAllTime = clicks.length;
  const totalEstimatedEarningsSar = Math.round(
    stores.reduce((acc, s) => acc + s.estimatedEarningsSar, 0) * 100
  ) / 100;

  return {
    stores,
    totalClicksAllTime,
    totalEstimatedEarningsSar,
    mostProfitableStore: stores.length > 0 ? stores[0] : null
  };
}

/**
 * Clears locally tracked clicks (for reset/testing in admin)
 */
export function clearTrackedClicksStorage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_KEY_CLICKS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_COPIES);
  }
}
