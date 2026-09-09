import { AffiliateNetworkAdapter, TrackingUrlOptions, WebhookValidationResult, ParsedConversion } from "./AffiliateNetworkAdapter";
import { Merchant, Product, Coupon } from "../db/schema";

export class GenericNetworkAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "generic";
  readonly name = "Direct / Custom Affiliate Program";

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
      parsed.searchParams.set("subid", options.clickId);
      if (options.campaign) {
        parsed.searchParams.set("campaign", options.campaign);
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

    const conversionId = String(data.conversion_id || data.order_id || data.id || Date.now());
    const clickId = String(data.click_id || data.subid || data.sub_id || "");
    const orderRef = String(data.order_id || data.reference || conversionId);
    const orderValue = parseFloat(data.order_value || data.amount || "0");
    const commissionAmount = parseFloat(data.commission || data.payout || "0");
    const currency = String(data.currency || "SAR");

    return {
      conversionId,
      orderReference: orderRef,
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status: "PENDING",
      timestamp: new Date().toISOString(),
      rawPayload: data
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    return {
      connected: true,
      message: "برنامج مباشر جاهز للتوجيه واستقبال المعاملات."
    };
  }
}
