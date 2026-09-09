import { 
  trackAffiliateClickCentralized, 
  trackCouponCopyCentralized,
  getStoreProfitabilityAnalysis,
  getTrackedClicksFromStorage
} from "./affiliateTracker";

/**
 * Google Analytics 4 (GA4) Client-side Tracking Utility
 * Measurement ID: G-SGBFX8RJ34
 */

export const GA_MEASUREMENT_ID = "G-SGBFX8RJ34";

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Dispatches custom analytics event to Google Analytics 4
 */
export function trackEvent(action: string, params?: Record<string, any>): void {
  try {
    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      window.gtag("event", action, params);
    }
  } catch (err) {
    console.debug("[Analytics] Event failed silently:", err);
  }
}

/**
 * Centralized Tracker: Tracks when a user clicks to visit an affiliate merchant or coupon deal
 * Records to GA4 + localStorage + Server Analytics simultaneously
 */
export function trackAffiliateClick(
  merchantName: string, 
  couponCode?: string, 
  targetUrl?: string, 
  merchantId?: string,
  source?: string
): void {
  const mId = merchantId || merchantName.toLowerCase().replace(/\s+/g, "-");
  trackAffiliateClickCentralized({
    merchantId: mId,
    merchantName,
    couponCode,
    targetUrl,
    source: source || "affiliate_link"
  });
}

/**
 * Centralized Tracker: Tracks when a user copies a discount/promo code
 * Records to GA4 + localStorage counters
 */
export function trackCouponCopy(couponCode: string, merchantName: string, merchantId?: string): void {
  trackCouponCopyCentralized(couponCode, merchantName, merchantId);
}

// Export profitability helper functions directly from analytics
export { getStoreProfitabilityAnalysis, getTrackedClicksFromStorage };

/**
 * Tracks user search queries
 */
export function trackSearchQuery(searchTerm: string, resultsCount: number): void {
  if (!searchTerm.trim()) return;
  trackEvent("search", {
    search_term: searchTerm.trim(),
    results_count: resultsCount
  });
}

/**
 * Tracks page view transitions
 */
export function trackPageView(pagePath: string, pageTitle?: string): void {
  trackEvent("page_view", {
    page_path: pagePath,
    page_title: pageTitle || document.title
  });
}
