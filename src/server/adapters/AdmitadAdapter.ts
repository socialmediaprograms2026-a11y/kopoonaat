import { 
  AffiliateNetworkAdapter, 
  TrackingUrlOptions, 
  WebhookValidationResult, 
  ParsedConversion,
  SyncReportResult 
} from "./AffiliateNetworkAdapter";
import { Merchant, Product, Coupon } from "../db/schema";
import { db } from "../db/database";

export class AdmitadAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "admitad";
  readonly name = "Admitad (أدميتاد)";

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
        parsed.searchParams.set("subid1", options.campaign);
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

    const conversionId = String(data.id || data.order_id || Date.now());
    const clickId = String(data.subid || data.sub_id || data.subId || "");
    const orderRef = String(data.order_id || data.order_code || conversionId);
    const orderValue = parseFloat(data.payment || data.cart || "0");
    const commissionAmount = parseFloat(data.commission || data.payout || "0");
    const currency = String(data.currency || "SAR");

    let status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" = "PENDING";
    const rawStatus = String(data.status || data.action_status || "").toLowerCase();
    if (rawStatus === "approved" || rawStatus === "confirmed") status = "APPROVED";
    else if (rawStatus === "declined" || rawStatus === "rejected") status = "REJECTED";
    else if (rawStatus === "paid") status = "PAID";

    return {
      conversionId,
      orderReference: orderRef,
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status,
      timestamp: data.action_date || new Date().toISOString(),
      rawPayload: data
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const clientId = process.env.ADMITAD_CLIENT_ID;
    const clientSecret = process.env.ADMITAD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return {
        connected: false,
        message: "لم يتم العثور على ADMITAD_CLIENT_ID أو ADMITAD_CLIENT_SECRET في ملف .env."
      };
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const res = await fetch("https://api.admitad.com/token/", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials&client_id=" + encodeURIComponent(clientId) + "&scope=statistics"
      });

      if (res.ok) {
        return {
          connected: true,
          message: `تم التحقق من حساب Admitad OAuth بنجاح.`
        };
      } else {
        return {
          connected: false,
          message: `Admitad authentication error: ${res.status}`
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        message: `Admitad test error: ${err.message}`
      };
    }
  }

  async fetchTransactionsReport(startDate?: string, endDate?: string): Promise<SyncReportResult> {
    const clientId = process.env.ADMITAD_CLIENT_ID;
    const clientSecret = process.env.ADMITAD_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: "Admitad credentials not found in env."
      };
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const tokenRes = await fetch("https://api.admitad.com/token/", {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: "grant_type=client_credentials&client_id=" + encodeURIComponent(clientId) + "&scope=statistics"
      });

      if (!tokenRes.ok) {
        return {
          success: false,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: "Failed to obtain Admitad bearer token."
        };
      }

      const tokenJson = await tokenRes.json();
      const accessToken = tokenJson.access_token;

      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const end = endDate || new Date().toISOString().split("T")[0];

      const statsRes = await fetch(`https://api.admitad.com/statistics/actions/?date_start=${start}&date_end=${end}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      if (!statsRes.ok) {
        return {
          success: false,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: `Admitad stats API returned ${statsRes.status}`
        };
      }

      const statsJson = await statsRes.json();
      const results = statsJson.results || [];

      let savedCount = 0;
      let totalComm = 0;

      for (const r of results) {
        const parsed = this.parseWebhookPayload(r);
        if (parsed) {
          db.recordConversion({
            conversionId: parsed.conversionId,
            clickId: parsed.clickId || "",
            merchantId: "m_admitad_generic",
            network: "Admitad",
            orderReference: parsed.orderReference,
            orderValue: parsed.orderValue,
            commissionAmount: parsed.commissionAmount,
            currency: parsed.currency,
            status: parsed.status,
            rawPayload: r,
            createdAt: parsed.timestamp
          });
          savedCount++;
          totalComm += parsed.commissionAmount;
        }
      }

      return {
        success: true,
        transactionsFetched: results.length,
        conversionsSaved: savedCount,
        totalCommissionAmount: totalComm,
        message: `تم مزامنة ${savedCount} تحويل حقيقي من Admitad بنجاح.`
      };
    } catch (err: any) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: `Admitad sync error: ${err.message}`,
        errors: [err.message]
      };
    }
  }
}
