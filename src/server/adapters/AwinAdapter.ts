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

export class AwinAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "awin";
  readonly name = "Awin Affiliate Network";

  buildTrackingUrl(
    merchant: Merchant,
    target: { product?: Product; coupon?: Coupon },
    options: TrackingUrlOptions
  ): string {
    const publisherId = process.env.AWIN_PUBLISHER_ID || merchant.affiliateTrackingId;
    const merchantId = merchant.affiliateProgramId;
    const destinationUrl = target.product?.productUrl || merchant.websiteUrl;

    if (publisherId && merchantId) {
      const clickRef = encodeURIComponent(options.clickId);
      const encodedDest = encodeURIComponent(destinationUrl);
      return `https://www.awin1.com/cread.php?awinmid=${merchantId}&awinaffid=${publisherId}&clickref=${clickRef}&ued=${encodedDest}`;
    }

    return this.createAffiliateLink(destinationUrl, options);
  }

  createAffiliateLink(targetUrl: string, options: TrackingUrlOptions): string {
    const publisherId = process.env.AWIN_PUBLISHER_ID;
    try {
      const url = new URL(targetUrl);
      url.searchParams.set("clickref", options.clickId);
      if (publisherId) url.searchParams.set("awinaffid", publisherId);
      if (options.campaign) url.searchParams.set("utm_campaign", options.campaign);
      return url.toString();
    } catch {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}clickref=${encodeURIComponent(options.clickId)}`;
    }
  }

  validateWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: any,
    secret?: string
  ): WebhookValidationResult {
    const configuredSecret = secret || process.env.AWIN_WEBHOOK_SECRET;
    if (!configuredSecret) {
      return { isValid: true };
    }

    const signature = headers["x-awin-signature"] || headers["awin-signature"];
    if (!signature || typeof signature !== "string") {
      return { isValid: false, error: "Missing x-awin-signature header" };
    }

    const payloadString = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
    const expected = crypto.createHmac("sha256", configuredSecret).update(payloadString).digest("hex");

    if (signature !== expected) {
      return { isValid: false, error: "Invalid HMAC signature for Awin webhook" };
    }

    return { isValid: true };
  }

  parseWebhookPayload(body: any): ParsedConversion | null {
    if (!body) return null;
    const trans = body.transaction || body;
    const conversionId = String(trans.id || trans.transactionId || trans.orderRef || Date.now());
    const clickId = String(trans.clickRef || trans.clickref || trans.subId || "");
    const commissionAmount = parseFloat(trans.commissionAmount || trans.commission || trans.payout || "0");
    const orderValue = parseFloat(trans.saleAmount || trans.amount || "0");
    const currency = String(trans.currency || "SAR");

    let status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" = "PENDING";
    const rawStatus = String(trans.status || trans.transactionStatus || "").toLowerCase();
    if (rawStatus.includes("approved") || rawStatus.includes("confirmed")) status = "APPROVED";
    else if (rawStatus.includes("rejected") || rawStatus.includes("declined")) status = "REJECTED";
    else if (rawStatus.includes("paid")) status = "PAID";

    return {
      conversionId,
      orderReference: String(trans.orderRef || trans.id || conversionId),
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status,
      timestamp: trans.transactionDate || new Date().toISOString(),
      rawPayload: body
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const apiKey = process.env.AWIN_API_KEY;
    const pubId = process.env.AWIN_PUBLISHER_ID;

    if (!apiKey || !pubId) {
      return {
        connected: false,
        message: "لم يتم ضبط AWIN_API_KEY أو AWIN_PUBLISHER_ID في متغيرات البيئة."
      };
    }

    try {
      const res = await fetch(`https://api.awin.com/publishers/${pubId}/programmes?relationship=joined`, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      if (res.ok) {
        return {
          connected: true,
          message: `تم التحقق من حساب Awin (Publisher ID: ${pubId}) بنجاح.`
        };
      } else {
        return {
          connected: false,
          message: `Awin API responded with status ${res.status}: ${res.statusText}`
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        message: `خطأ في الاتصال بواجهة Awin: ${err.message}`
      };
    }
  }

  async fetchTransactionsReport(startDate?: string, endDate?: string): Promise<SyncReportResult> {
    const apiKey = process.env.AWIN_API_KEY;
    const pubId = process.env.AWIN_PUBLISHER_ID;

    if (!apiKey || !pubId) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: "Awin credentials not configured in environment variables."
      };
    }

    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const end = endDate || new Date().toISOString().split("T")[0];

      const url = `https://api.awin.com/publishers/${pubId}/transactions/?startDate=${start}T00:00:00&endDate=${end}T23:59:59&timezone=UTC`;
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`
        }
      });

      if (!res.ok) {
        return {
          success: false,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: `Awin API error: ${res.status} ${res.statusText}`
        };
      }

      const transactions = await res.json();
      if (!Array.isArray(transactions)) {
        return {
          success: true,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: "No transactions returned from Awin API."
        };
      }

      let savedCount = 0;
      let totalComm = 0;

      for (const t of transactions) {
        const parsed = this.parseWebhookPayload(t);
        if (parsed) {
          db.recordConversion({
            conversionId: parsed.conversionId,
            clickId: parsed.clickId || "",
            merchantId: parsed.merchantId || "m_awin_generic",
            network: "Awin",
            orderReference: parsed.orderReference,
            orderValue: parsed.orderValue,
            commissionAmount: parsed.commissionAmount,
            currency: parsed.currency,
            status: parsed.status,
            rawPayload: parsed.rawPayload,
            createdAt: parsed.timestamp
          });
          savedCount++;
          totalComm += parsed.commissionAmount;
        }
      }

      return {
        success: true,
        transactionsFetched: transactions.length,
        conversionsSaved: savedCount,
        totalCommissionAmount: totalComm,
        message: `تم مزامنة ${savedCount} تحويل حقيقي من Awin بنجاح.`
      };
    } catch (err: any) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: `Awin Sync Exception: ${err.message}`,
        errors: [err.message]
      };
    }
  }
}
