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

export class ImpactAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "impact";
  readonly name = "Impact Radius (إمباكت)";

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
      parsed.searchParams.set("subId1", options.clickId);
      if (options.campaign) {
        parsed.searchParams.set("subId2", options.campaign);
      }
      if (options.utmSource) parsed.searchParams.set("utm_source", options.utmSource);
      if (options.utmMedium) parsed.searchParams.set("utm_medium", options.utmMedium);
      return parsed.toString();
    } catch {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}subId1=${encodeURIComponent(options.clickId)}`;
    }
  }

  validateWebhook(
    headers: Record<string, string | string[] | undefined>,
    rawBody: any,
    secret?: string
  ): WebhookValidationResult {
    const webhookSecret = secret || process.env.IMPACT_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return { isValid: true };
    }

    const signature = headers["impact-signature"] || headers["x-impact-signature"];
    if (!signature || typeof signature !== "string") {
      return { isValid: false, error: "Missing Impact-Signature header" };
    }

    const payload = typeof rawBody === "string" ? rawBody : JSON.stringify(rawBody);
    const expected = crypto.createHmac("sha256", webhookSecret).update(payload).digest("hex");

    if (signature !== expected) {
      return { isValid: false, error: "Invalid Impact webhook signature" };
    }

    return { isValid: true };
  }

  parseWebhookPayload(body: any, query?: any): ParsedConversion | null {
    const data = body?.Action || body?.conversion || body || query;
    if (!data) return null;

    const conversionId = String(data.Id || data.ActionId || data.id || Date.now());
    const clickId = String(data.SubId1 || data.subId1 || data.subid1 || data.ClickId || "");
    const orderRef = String(data.Oid || data.OrderId || data.OrderRef || conversionId);
    const orderValue = parseFloat(data.Amount || data.OrderAmount || "0");
    const commissionAmount = parseFloat(data.Payout || data.Commission || "0");
    const currency = String(data.Currency || "SAR");

    let status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" = "PENDING";
    const rawState = String(data.State || data.Status || "").toUpperCase();
    if (rawState === "APPROVED") status = "APPROVED";
    else if (rawState === "REJECTED" || rawState === "CANCELLED") status = "REJECTED";
    else if (rawState === "PAID") status = "PAID";

    return {
      conversionId,
      orderReference: orderRef,
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status,
      timestamp: data.CreationDate || new Date().toISOString(),
      rawPayload: body
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const sid = process.env.IMPACT_ACCOUNT_SID;
    const token = process.env.IMPACT_AUTH_TOKEN;

    if (!sid || !token) {
      return {
        connected: false,
        message: "لم يتم ضبط IMPACT_ACCOUNT_SID أو IMPACT_AUTH_TOKEN في متغيرات البيئة."
      };
    }

    try {
      const authHeader = `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;
      const res = await fetch(`https://api.impact.com/Mediapartners/${sid}/Campaigns`, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json"
        }
      });

      if (res.ok) {
        return {
          connected: true,
          message: `تم التحقق من حساب Impact بنجاح (Account SID: ${sid}).`
        };
      } else {
        return {
          connected: false,
          message: `Impact API error (${res.status}): ${res.statusText}`
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        message: `Impact connection failed: ${err.message}`
      };
    }
  }

  async fetchTransactionsReport(startDate?: string, endDate?: string): Promise<SyncReportResult> {
    const sid = process.env.IMPACT_ACCOUNT_SID;
    const token = process.env.IMPACT_AUTH_TOKEN;

    if (!sid || !token) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: "Impact credentials not configured in environment variables."
      };
    }

    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const end = endDate || new Date().toISOString().split("T")[0];
      const authHeader = `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`;

      const url = `https://api.impact.com/Mediapartners/${sid}/Actions?StartDate=${start}&EndDate=${end}`;
      const res = await fetch(url, {
        headers: {
          Authorization: authHeader,
          Accept: "application/json"
        }
      });

      if (!res.ok) {
        return {
          success: false,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: `Impact API error: ${res.status} ${res.statusText}`
        };
      }

      const json = await res.json();
      const actions = json?.Actions || json?.actions || [];

      if (!Array.isArray(actions) || actions.length === 0) {
        return {
          success: true,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: "No conversion actions found for the period."
        };
      }

      let savedCount = 0;
      let totalComm = 0;

      for (const a of actions) {
        const parsed = this.parseWebhookPayload(a);
        if (parsed) {
          db.recordConversion({
            conversionId: parsed.conversionId,
            clickId: parsed.clickId || "",
            merchantId: parsed.merchantId || "m_impact_generic",
            network: "Impact",
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
        transactionsFetched: actions.length,
        conversionsSaved: savedCount,
        totalCommissionAmount: totalComm,
        message: `تم مزامنة ${savedCount} تحويل حقيقي من Impact بنجاح.`
      };
    } catch (err: any) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: `Impact Sync Error: ${err.message}`,
        errors: [err.message]
      };
    }
  }
}
