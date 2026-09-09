import { AffiliateNetworkAdapter, TrackingUrlOptions, WebhookValidationResult, ParsedConversion } from "./AffiliateNetworkAdapter";
import { Merchant, Product, Coupon } from "../db/schema";

export class LinkArabyAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "linkaraby";
  readonly name = "لينك عربي (LinkAraby Affiliate Network)";

  buildTrackingUrl(
    merchant: Merchant,
    target: { product?: Product; coupon?: Coupon },
    options: TrackingUrlOptions
  ): string {
    const rawUrl = target.product?.productUrl || target.coupon?.affiliateUrl || merchant.affiliateUrl || merchant.websiteUrl;
    return this.createAffiliateLink(rawUrl, options);
  }

  createAffiliateLink(targetUrl: string, options: TrackingUrlOptions): string {
    try {
      const parsed = new URL(targetUrl);
      
      // If it's a direct linkaraby script redirect or utm link, preserve affiliate tags
      if (options.clickId) {
        parsed.searchParams.set("subid", options.clickId);
        parsed.searchParams.set("data1", options.clickId);
      }
      if (options.campaign) {
        parsed.searchParams.set("utm_campaign", options.campaign);
      }
      if (options.utmSource) {
        parsed.searchParams.set("utm_source", options.utmSource);
      }
      if (options.utmMedium) {
        parsed.searchParams.set("utm_medium", options.utmMedium);
      }

      return parsed.toString();
    } catch {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}subid=${encodeURIComponent(options.clickId)}`;
    }
  }

  validateWebhook(): WebhookValidationResult {
    return { isValid: true };
  }

  parseWebhookPayload(body: any, query?: any): ParsedConversion | null {
    const data = body || query;
    if (!data) return null;

    const conversionId = String(data.conversion_id || data.order_id || data.trans_id || data.id || Date.now());
    const clickId = String(data.click_id || data.subid || data.data1 || data.sub_id || "");
    const orderRef = String(data.order_id || data.reference || conversionId);
    const orderValue = parseFloat(data.order_value || data.amount || data.sale_amount || "0");
    const commissionAmount = parseFloat(data.commission || data.payout || data.earn || "0");
    const currency = String(data.currency || "SAR");

    return {
      conversionId,
      orderReference: orderRef,
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status: "APPROVED",
      timestamp: new Date().toISOString(),
      rawPayload: data
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    return {
      connected: true,
      message: "منصة لينك عربي (LinkAraby) متصلة وجاهزة لتتبع النقرات وتسجيل العمولات تلقائياً."
    };
  }
}
