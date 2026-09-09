import { db } from "../db/database";
import { emailService } from "./emailService";
import { getAllAdapters } from "../adapters/adapterRegistry";
import { affiliateRevenueSyncService } from "./AffiliateRevenueSyncService";
import { aiNicheBackgroundService } from "./aiNicheBackgroundService";

export class SyncService {
  private static instance: SyncService;
  private intervalTimer: NodeJS.Timeout | null = null;
  private nicheTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;

  private constructor() {}

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  public startCronJobs() {
    if (this.intervalTimer) return;

    // Start dedicated affiliate revenue schedulers (Transactions: 10m, Commissions: 30m, Reconciliation: 24h)
    affiliateRevenueSyncService.startScheduledEngine();

    // Run initial general sync check on server boot
    setTimeout(() => {
      this.runAllSyncTasks().catch((err) => console.error("Initial sync error:", err));
    }, 5000);

    // Run initial trending niches AI background job on server boot
    setTimeout(() => {
      aiNicheBackgroundService
        .runTrendingNichesJob("INITIAL_BOOT")
        .catch((err) => console.error("Initial niche sync error:", err));
    }, 6000);

    // Schedule periodic coupon & price alerts check every 30 minutes
    this.intervalTimer = setInterval(() => {
      this.runCouponExpiryCheck().catch((err) => console.error("Coupon expiry sync error:", err));
      this.runPriceAlertsCheck().catch((err) => console.error("Price alerts sync error:", err));
    }, 30 * 60 * 1000);

    // Schedule periodic AI Trending Niches background job every 45 minutes
    this.nicheTimer = setInterval(() => {
      aiNicheBackgroundService
        .runTrendingNichesJob("CRON_SCHEDULE")
        .catch((err) => console.error("Scheduled niche sync error:", err));
    }, 45 * 60 * 1000);

    console.log("[SyncService] Background Cron engine initialized with AI Niche Analyzer schedulers.");
  }

  public async runAllSyncTasks(): Promise<{ 
    couponCheck: any; 
    priceAlertsCheck: any; 
    affiliateRevenueSync: any;
    trendingNichesSync: any;
  }> {
    if (this.isSyncing) {
      return {
        couponCheck: { message: "Sync already in progress" },
        priceAlertsCheck: { message: "Sync already in progress" },
        affiliateRevenueSync: { message: "Sync already in progress" },
        trendingNichesSync: { message: "Sync already in progress" }
      };
    }

    this.isSyncing = true;
    try {
      const couponCheck = await this.runCouponExpiryCheck();
      const priceAlertsCheck = await this.runPriceAlertsCheck();
      const affiliateRevenueSync = await this.runAffiliateRevenueSync();
      const trendingNichesSync = await aiNicheBackgroundService.runTrendingNichesJob("MANUAL_ADMIN");
      return { couponCheck, priceAlertsCheck, affiliateRevenueSync, trendingNichesSync };
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Automatic background fetch of official transactions & commissions reports from all configured affiliate networks
   */
  public async runAffiliateRevenueSync(): Promise<{
    networksChecked: number;
    totalConversionsSynced: number;
    totalCommissionAmount: number;
    results: Record<string, any>;
    durationMs: number;
  }> {
    const start = Date.now();
    const syncRes = await affiliateRevenueSyncService.syncAllProviders("INCREMENTAL");
    const durationMs = Date.now() - start;

    const results: Record<string, any> = {};
    for (const log of syncRes.logs) {
      results[log.provider] = {
        success: log.status !== "FAILED",
        recordsFetched: log.recordsFetched,
        recordsCreated: log.recordsCreated,
        recordsUpdated: log.recordsUpdated,
        recordsSkipped: log.recordsSkipped,
        totalSalesValue: log.totalSalesValue,
        totalCommissionAmount: log.totalCommissionAmount,
        errors: log.errors
      };
    }

    return {
      networksChecked: syncRes.logs.length,
      totalConversionsSynced: syncRes.summary.totalCreated + syncRes.summary.totalUpdated,
      totalCommissionAmount: syncRes.summary.totalCommissionAmount,
      results,
      durationMs
    };
  }

  public async runCouponExpiryCheck(): Promise<{ processed: number; expiredCount: number; durationMs: number }> {
    const start = Date.now();
    const coupons = db.getCoupons();
    const today = new Date().toISOString().split("T")[0];
    let expiredCount = 0;

    for (const coupon of coupons) {
      if (coupon.status === "ACTIVE" && coupon.expiryDate && coupon.expiryDate < today) {
        coupon.status = "EXPIRED";
        coupon.verificationStatus = "EXPIRED";
        db.upsertCoupon(coupon);
        expiredCount++;
      }
    }

    const durationMs = Date.now() - start;
    db.recordSyncJob({
      jobName: "COUPON_EXPIRY_CHECK",
      status: "SUCCESS",
      itemsProcessed: coupons.length,
      startedAt: new Date(start).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs
    });

    return { processed: coupons.length, expiredCount, durationMs };
  }

  public async runPriceAlertsCheck(): Promise<{ activeAlerts: number; triggeredCount: number }> {
    const start = Date.now();
    const alerts = db.getActivePriceAlerts();
    let triggeredCount = 0;

    for (const alert of alerts) {
      const product = db.getProductById(alert.productId);
      if (product && product.price <= alert.targetPrice) {
        db.markPriceAlertTriggered(alert.id);
        triggeredCount++;

        // Send alert email
        const merchant = db.getMerchantById(product.merchantId);
        const html = `
          <div dir="rtl" style="font-family: 'Cairo', Tahoma, sans-serif; padding: 20px;">
            <h3 style="color: #059669;">تنبيه هبوط السعر!</h3>
            <p>المنتج <strong>${product.arabicName || product.name}</strong> في متجر <strong>${merchant?.arabicName || "المتجر"}</strong> وصل إلى السعر المستهدف: <strong>${product.price} ${product.currency}</strong>.</p>
            <p><a href="${product.affiliateUrl || product.productUrl}" style="display: inline-block; padding: 10px 20px; background-color: #059669; color: white; border-radius: 8px; text-decoration: none;">انتقل للمتجر والشراء الآن</a></p>
          </div>
        `;

        await emailService.sendEmail({
          to: alert.email,
          subject: `تنبيه انخفاض سعر: ${product.arabicName || product.name}`,
          html
        });
      }
    }

    const durationMs = Date.now() - start;
    db.recordSyncJob({
      jobName: "PRICE_ALERTS_CHECK",
      status: "SUCCESS",
      itemsProcessed: alerts.length,
      startedAt: new Date(start).toISOString(),
      finishedAt: new Date().toISOString(),
      durationMs
    });

    return { activeAlerts: alerts.length, triggeredCount };
  }
}

export const syncService = SyncService.getInstance();
