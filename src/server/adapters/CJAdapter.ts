import { 
  AffiliateNetworkAdapter, 
  TrackingUrlOptions, 
  WebhookValidationResult, 
  ParsedConversion,
  SyncReportResult 
} from "./AffiliateNetworkAdapter";
import { Merchant, Product, Coupon } from "../db/schema";
import { db } from "../db/database";

export class CJAdapter implements AffiliateNetworkAdapter {
  readonly networkKey = "cj";
  readonly name = "CJ Affiliate (Commission Junction)";

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
      parsed.searchParams.set("sid", options.clickId);
      if (options.campaign) parsed.searchParams.set("utm_campaign", options.campaign);
      return parsed.toString();
    } catch {
      const sep = targetUrl.includes("?") ? "&" : "?";
      return `${targetUrl}${sep}sid=${encodeURIComponent(options.clickId)}`;
    }
  }

  validateWebhook(): WebhookValidationResult {
    return { isValid: true };
  }

  parseWebhookPayload(body: any, query?: any): ParsedConversion | null {
    const data = body || query;
    if (!data) return null;

    const conversionId = String(data.commissionId || data.orderId || data.actionId || Date.now());
    const clickId = String(data.sid || data.subId || "");
    const orderRef = String(data.orderId || conversionId);
    const orderValue = parseFloat(data.amount || data.saleAmount || data.orderAmount || "0");
    const commissionAmount = parseFloat(data.commissionAmount || data.pubCommissionAmountUsd || data.commission || "0");
    const currency = String(data.currency || "USD");

    let status: "PENDING" | "APPROVED" | "REJECTED" | "PAID" = "PENDING";
    const rawStatus = String(data.actionStatus || data.status || "").toLowerCase();
    if (rawStatus.includes("closed") || rawStatus.includes("approved") || rawStatus.includes("posted")) status = "APPROVED";
    else if (rawStatus.includes("locked")) status = "PAID";
    else if (rawStatus.includes("void") || rawStatus.includes("rejected")) status = "REJECTED";

    return {
      conversionId,
      orderReference: orderRef,
      clickId,
      orderValue,
      commissionAmount,
      currency,
      status,
      timestamp: data.eventDate || data.postingDate || new Date().toISOString(),
      rawPayload: data
    };
  }

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    const pat = process.env.CJ_PERSONAL_ACCESS_TOKEN;
    const cid = process.env.CJ_PUBLISHER_CID;

    if (!pat) {
      return {
        connected: false,
        message: "لم يتم ضبط CJ_PERSONAL_ACCESS_TOKEN في متغيرات البيئة."
      };
    }

    try {
      const query = `{ publisher(companyId: "${cid || "self"}") { id name } }`;
      const res = await fetch("https://commissions.api.cj.com/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query })
      });

      if (res.ok) {
        return {
          connected: true,
          message: "تم التحقق من اتصال CJ GraphQL Commissions API بنجاح."
        };
      } else {
        return {
          connected: false,
          message: `CJ API response status: ${res.status}`
        };
      }
    } catch (err: any) {
      return {
        connected: false,
        message: `CJ connection test failed: ${err.message}`
      };
    }
  }

  async fetchTransactionsReport(startDate?: string, endDate?: string): Promise<SyncReportResult> {
    const pat = process.env.CJ_PERSONAL_ACCESS_TOKEN;

    if (!pat) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: "CJ_PERSONAL_ACCESS_TOKEN is not set in environment."
      };
    }

    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const end = endDate || new Date().toISOString().split("T")[0];

      const graphqlQuery = `
        {
          publisherCommissions(forPublishers: [], sincePostingDate: "${start}T00:00:00Z", beforePostingDate: "${end}T23:59:59Z") {
            count
            records {
              commissionId
              orderId
              postingDate
              actionStatus
              pubCommissionAmountUsd
              saleAmountUsd
              sid
              advertiserName
            }
          }
        }
      `;

      const res = await fetch("https://commissions.api.cj.com/query", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${pat}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: graphqlQuery })
      });

      if (!res.ok) {
        return {
          success: false,
          transactionsFetched: 0,
          conversionsSaved: 0,
          totalCommissionAmount: 0,
          message: `CJ GraphQL error: ${res.status} ${res.statusText}`
        };
      }

      const json = await res.json();
      const records = json?.data?.publisherCommissions?.records || [];

      let savedCount = 0;
      let totalComm = 0;

      for (const rec of records) {
        const parsed = this.parseWebhookPayload({
          commissionId: rec.commissionId,
          orderId: rec.orderId,
          eventDate: rec.postingDate,
          actionStatus: rec.actionStatus,
          commissionAmount: rec.pubCommissionAmountUsd,
          saleAmount: rec.saleAmountUsd,
          sid: rec.sid,
          currency: "USD"
        });

        if (parsed) {
          db.recordConversion({
            conversionId: parsed.conversionId,
            clickId: parsed.clickId || "",
            merchantId: "m_cj_generic",
            network: "CJ",
            orderReference: parsed.orderReference,
            orderValue: parsed.orderValue,
            commissionAmount: parsed.commissionAmount,
            currency: parsed.currency,
            status: parsed.status,
            rawPayload: rec,
            createdAt: parsed.timestamp
          });
          savedCount++;
          totalComm += parsed.commissionAmount;
        }
      }

      return {
        success: true,
        transactionsFetched: records.length,
        conversionsSaved: savedCount,
        totalCommissionAmount: totalComm,
        message: `تم مزامنة ${savedCount} تحويل حقيقي من CJ بنجاح.`
      };
    } catch (err: any) {
      return {
        success: false,
        transactionsFetched: 0,
        conversionsSaved: 0,
        totalCommissionAmount: 0,
        message: `CJ Sync error: ${err.message}`,
        errors: [err.message]
      };
    }
  }
}
