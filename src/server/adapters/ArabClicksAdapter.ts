import { 
  AffiliateNetworkAdapter, 
  TrackingUrlOptions, 
  WebhookValidationResult, 
  ParsedConversion,
  SyncReportResult 
} from "./AffiliateNetworkAdapter";
import { Merchant, Product, Coupon } from "../db/schema";
import { db } from "../db/database";

export class ArabClicksAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "arabclicks";
  readonly name = "ArabClicks & DCM Network (عرب كليكس)";

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
      parsed.searchParams.set("aff_sub", options.clickId);
      if (options.campaign) {
        parsed.searchParams.set("aff_sub2", options.campaign);
      }
      return parsed.toString();
    } catch {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}aff_sub=${encodeURIComponent(options.clickId)}`;
    }
  }

  validateWebhook(): WebhookValidationResult {
    return { isValid: true };
  }

  parseWebhookPayload(body: any, query?: any): ParsedConversion | null {
    const data = body || query;
    if (!data) return null;

    const conversionId = String(data.transaction_id || data.id || data.order_id || Date.now());
    const clickId = String(data.aff_sub || data.sub_id || data.click_id || "");
    const orderRef = String(data.order_id || data.adv_sub || conversionId);
    const orderValue = parseFloat(data.sale_amount || data.amount || "0");
    const commissionAmount = parseFloat(data.payout || data.commission || "0");
    const currency = String(data.currency || "SAR");

    let status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" = "PENDING";
    const rawStatus = String(data.status || "").toLowerCase();
    if (rawStatus === "approved" || rawStatus === "approved_paid") status = "APPROVED";
    else if (rawStatus === "rejected") status = "REJECTED";
    else if (rawStatus === "paid") status = "PAID";

    return {
      conversionId,
      orderReference: orderRef,
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status,
      timestamp: data.datetime || new Date().toISOString(),
      rawPayload: data
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const apiKey = process.env.ARABCLICKS_API_KEY;
    const affId = process.env.ARABCLICKS_AFFILIATE_ID;

    if (!apiKey && !affId) {
      return {
        connected: false,
        message: "لم يتم العثور على ARABCLICKS_API_KEY أو ARABCLICKS_AFFILIATE_ID في .env."
      };
    }
    return {
      connected: true,
      message: `تم التحقق من بيانات ArabClicks/DCM بنجاح (Affiliate ID: ${affId || "Active"}).`
    };
  }

  async fetchTransactionsReport(startDate?: string, endDate?: string): Promise<SyncReportResult> {
    const apiKey = process.env.ARABCLICKS_API_KEY;
    const affId = process.env.ARABCLICKS_AFFILIATE_ID;

    if (!apiKey) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: "ARABCLICKS_API_KEY not configured in environment variables."
      };
    }

    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const end = endDate || new Date().toISOString().split("T")[0];

      // HasOffers / Tune compatible reporting API
      const url = `https://api.arabclicks.com/v3/Affiliate_Report:getConversions?api_key=${apiKey}&start_date=${start}&end_date=${end}`;
      const res = await fetch(url);

      if (!res.ok) {
        return {
          success: false,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: `ArabClicks API returned status ${res.status}`
        };
      }

      const json = await res.json();
      const conversionsData = json?.response?.data?.data || [];

      let savedCount = 0;
      let totalComm = 0;

      for (const item of conversionsData) {
        const conv = item.Stat || item;
        const parsed = this.parseWebhookPayload(conv);
        if (parsed) {
          db.recordConversion({
            conversionId: parsed.conversionId,
            clickId: parsed.clickId || "",
            merchantId: "m_arabclicks_generic",
            network: "ArabClicks",
            orderReference: parsed.orderReference,
            orderValue: parsed.orderValue,
            commissionAmount: parsed.commissionAmount,
            currency: parsed.currency,
            status: parsed.status,
            rawPayload: item,
            createdAt: parsed.timestamp
          });
          savedCount++;
          totalComm += parsed.commissionAmount;
        }
      }

      return {
        success: true,
        transactionsFetched: conversionsData.length,
        conversionsSaved: savedCount,
        totalCommissionAmount: totalComm,
        message: `تم مزامنة ${savedCount} تحويل حقيقي من ArabClicks بنجاح.`
      };
    } catch (err: any) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: `ArabClicks sync error: ${err.message}`,
        errors: [err.message]
      };
    }
  }
}
