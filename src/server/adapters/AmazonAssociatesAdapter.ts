import { 
  AffiliateNetworkAdapter, 
  TrackingUrlOptions, 
  WebhookValidationResult, 
  ParsedConversion,
  SyncReportResult 
} from "./AffiliateNetworkAdapter";
import { Merchant, Product, Coupon } from "../db/schema";
import { db } from "../db/database";

export class AmazonAssociatesAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "amazon";
  readonly name = "Amazon Associates (أمازون أسوشيتس)";

  buildTrackingUrl(
    merchant: Merchant,
    target: { product?: Product; coupon?: Coupon },
    options: TrackingUrlOptions
  ): string {
    const rawUrl = target.product?.productUrl || target.coupon?.affiliateUrl || merchant.affiliateUrl || merchant.websiteUrl;
    return this.createAffiliateLink(rawUrl, options);
  }

  createAffiliateLink(targetUrl: string, options: TrackingUrlOptions): string {
    const tag = process.env.AMAZON_ASSOCIATES_TAG;
    try {
      const parsed = new URL(targetUrl);
      if (tag) {
        parsed.searchParams.set("tag", tag);
      }
      parsed.searchParams.set("ascsubtag", options.clickId);
      if (options.campaign) {
        parsed.searchParams.set("camp", options.campaign);
      }
      if (options.utmSource) parsed.searchParams.set("utm_source", options.utmSource);
      if (options.utmMedium) parsed.searchParams.set("utm_medium", options.utmMedium);
      return parsed.toString();
    } catch {
      const connector = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${connector}ascsubtag=${encodeURIComponent(options.clickId)}${tag ? `&tag=${encodeURIComponent(tag)}` : ""}`;
    }
  }

  validateWebhook(): WebhookValidationResult {
    return {
      isValid: false,
      error: "Amazon Associates does not deliver push webhooks. Reports are imported via Amazon Associates Portal or PA-API."
    };
  }

  parseWebhookPayload(): ParsedConversion | null {
    return null;
  }

  async testConnection(): Promise<{ connected: boolean; message: string; details?: any }> {
    const tag = process.env.AMAZON_ASSOCIATES_TAG;
    if (!tag) {
      return {
        connected: false,
        message: "لم يتم ضبط AMAZON_ASSOCIATES_TAG في متغيرات البيئة (.env). يرجى إدخال Tracking Tag الخاص بحسابك في Amazon.sa."
      };
    }
    return {
      connected: true,
      message: `تم ربط معرّف التتبع بنجاح: ${tag} (جاهز لتوجيه الزيارات واحتساب العمولات)`,
      details: { tag, country: "SA" }
    };
  }

  async searchProducts(query: string): Promise<Product[]> {
    return db.getProducts().filter(p => 
      p.merchantId.includes("amazon") && 
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.arabicName.includes(query))
    );
  }

  async getProduct(externalId: string): Promise<Product | null> {
    return db.getProducts().find(p => p.externalProductId === externalId || p.id === externalId) || null;
  }

  async getProducts(): Promise<Product[]> {
    return db.getProducts().filter(p => p.merchantId.includes("amazon"));
  }

  async getConversions(): Promise<ParsedConversion[]> {
    return [];
  }

  async getCommissions(): Promise<any[]> {
    return [];
  }

  async syncProducts(): Promise<{ synced: number; errors?: string[] }> {
    const tag = process.env.AMAZON_ASSOCIATES_TAG;
    if (!tag) {
      return { synced: 0, errors: ["Amazon credentials not configured"] };
    }
    return { synced: 0 };
  }
}
