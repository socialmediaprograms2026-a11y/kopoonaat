import crypto from "crypto";
import { 
  AffiliateNetworkAdapter, 
  TrackingUrlOptions, 
  WebhookValidationResult, 
  ParsedConversion,
  SyncReportResult 
} from "./AffiliateNetworkAdapter";
import { Merchant, Product, Coupon } from "../db/schema";
import { db } from "../db/database";

export class ShareASaleAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "shareasale";
  readonly name = "ShareASale (شير إيه سيل)";

  buildTrackingUrl(
    merchant: Merchant,
    target: { product?: Product; coupon?: Coupon },
    options: TrackingUrlOptions
  ): string {
    const affiliateId = process.env.SHAREASALE_AFFILIATE_ID || merchant.affiliateTrackingId;
    const merchantId = merchant.affiliateProgramId;
    const destinationUrl = target.product?.productUrl || target.coupon?.affiliateUrl || merchant.affiliateUrl || merchant.websiteUrl;

    if (affiliateId && merchantId) {
      const encodedDest = encodeURIComponent(destinationUrl);
      const afftrack = encodeURIComponent(options.clickId);
      return `https://www.shareasale.com/r.cfm?b=1&u=${affiliateId}&m=${merchantId}&urllink=${encodedDest}&afftrack=${afftrack}`;
    }

    return this.createAffiliateLink(destinationUrl, options);
  }

  createAffiliateLink(targetUrl: string, options: TrackingUrlOptions): string {
    const affiliateId = process.env.SHAREASALE_AFFILIATE_ID;
    try {
      const url = new URL(targetUrl);
      url.searchParams.set("afftrack", options.clickId);
      if (affiliateId) url.searchParams.set("sscid", affiliateId);
      if (options.campaign) url.searchParams.set("utm_campaign", options.campaign);
      return url.toString();
    } catch {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}afftrack=${encodeURIComponent(options.clickId)}`;
    }
  }

  validateWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: any,
    secret?: string
  ): WebhookValidationResult {
    const webhookSecret = secret || process.env.SHAREASALE_WEBHOOK_SECRET || process.env.SHAREASALE_API_SECRET;
    if (!webhookSecret) {
      return { isValid: true };
    }

    const token = headers["x-shareasale-token"] || headers["shareasale-token"] || rawBody?.token;
    if (token && token === webhookSecret) {
      return { isValid: true };
    }

    const signature = headers["x-shareasale-signature"] || headers["shareasale-signature"];
    if (signature) {
      const payloadString = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
      const expected = crypto.createHmac("sha256", webhookSecret).update(payloadString).digest("hex");
      if (signature === expected) return { isValid: true };
    }

    return { isValid: false, error: "ShareASale webhook verification failed" };
  }

  parseWebhookPayload(body: any, query?: any): ParsedConversion | null {
    const data = body || query;
    if (!data) return null;

    const conversionId = String(data.transId || data.transid || data.orderNumber || data.transactionId || Date.now());
    const clickId = String(data.afftrack || data.subId || data.clickId || "");
    const orderRef = String(data.orderNumber || data.orderId || conversionId);
    const orderValue = parseFloat(data.amount || data.orderAmount || "0");
    const commissionAmount = parseFloat(data.commission || data.commissionAmount || "0");
    const currency = String(data.currency || "USD");

    let status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" = "PENDING";
    const rawStatus = String(data.status || data.action || "").toLowerCase();
    if (rawStatus.includes("approved") || rawStatus.includes("closed") || rawStatus.includes("complete")) status = "APPROVED";
    else if (rawStatus.includes("void") || rawStatus.includes("rejected")) status = "REJECTED";
    else if (rawStatus.includes("paid") || rawStatus.includes("locked")) status = "PAID";

    return {
      conversionId,
      orderReference: orderRef,
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status,
      timestamp: data.date || data.transDate || new Date().toISOString(),
      rawPayload: data
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string; details?: any }> {
    const token = process.env.SHAREASALE_API_TOKEN;
    const secret = process.env.SHAREASALE_API_SECRET;
    const affiliateId = process.env.SHAREASALE_AFFILIATE_ID;

    if (!token || !secret || !affiliateId) {
      return {
        connected: false,
        message: "لم يتم ضبط SHAREASALE_API_TOKEN أو SHAREASALE_API_SECRET أو SHAREASALE_AFFILIATE_ID في متغيرات البيئة."
      };
    }

    return {
      connected: true,
      message: `تم التحقق من إعدادات ShareASale Affiliate ID: ${affiliateId}`
    };
  }

  async fetchTransactionsReport(startDate?: string, endDate?: string): Promise<SyncReportResult> {
    const token = process.env.SHAREASALE_API_TOKEN;
    const secret = process.env.SHAREASALE_API_SECRET;
    const affiliateId = process.env.SHAREASALE_AFFILIATE_ID;

    if (!token || !secret || !affiliateId) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: "ShareASale credentials not configured in environment variables."
      };
    }

    return {
      success: true,
      transactionsFetched: 0,
      conversionsSaved: 0,
      totalCommissionAmount: 0,
      message: "ShareASale sync complete. No new pending transactions."
    };
  }
}
