import { EventEmitter } from "events";
import { db } from "../db/database";
import { getAllAdapters, getAdapterForNetwork } from "../adapters/adapterRegistry";
import { 
  AffiliateNetworkAdapter, 
  ParsedConversion, 
  SyncReportResult 
} from "../adapters/AffiliateNetworkAdapter";
import { 
  AffiliateSyncLog, 
  ProviderHealthStatus, 
  CommissionStatus 
} from "../db/schema";

export interface SyncProgressEvent {
  step: "START" | "PROVIDER_CHECK" | "FETCHING_DATA" | "PERSISTING" | "RECONCILING" | "COMPLETED" | "ERROR";
  provider?: string;
  message: string;
  timestamp: string;
  progressPercent: number;
  stats?: {
    fetched: number;
    created: number;
    updated: number;
    skipped: number;
  };
}

export class AffiliateRevenueSyncService extends EventEmitter {
  private static instance: AffiliateRevenueSyncService;
  private transactionTimer: NodeJS.Timeout | null = null;
  private commissionTimer: NodeJS.Timeout | null = null;
  private reconciliationTimer: NodeJS.Timeout | null = null;

  private isRunningSync = false;
  private currentJobName: string | null = null;
  private lastSyncAt: string | null = null;
  private nextSyncAt: string | null = null;

  // Rate-limiting backoff tracker per provider
  private rateLimitCooldowns: Map<string, number> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): AffiliateRevenueSyncService {
    if (!AffiliateRevenueSyncService.instance) {
      AffiliateRevenueSyncService.instance = new AffiliateRevenueSyncService();
    }
    return AffiliateRevenueSyncService.instance;
  }

  /**
   * Initializes background sync engines
   */
  public startScheduledEngine() {
    if (this.transactionTimer) return;

    console.log("[AffiliateRevenueSyncService] Initializing automated sync schedulers...");

    // 1. Initial sync after boot (10 seconds)
    setTimeout(() => {
      this.syncAllProviders("INCREMENTAL").catch((err) => {
        console.warn("[AffiliateRevenueSyncService] Boot sync warning:", err.message);
      });
    }, 10000);

    // 2. Transactions Sync: Every 10 minutes (between 5 and 15 mins)
    const TX_INTERVAL_MS = 10 * 60 * 1000;
    this.transactionTimer = setInterval(() => {
      this.syncAllProviders("INCREMENTAL").catch((err) => {
        console.error("[AffiliateRevenueSyncService] Scheduled transactions sync error:", err);
      });
    }, TX_INTERVAL_MS);

    // 3. Commissions Status Sync: Every 30 minutes (between 15 and 60 mins)
    const COMM_INTERVAL_MS = 30 * 60 * 1000;
    this.commissionTimer = setInterval(() => {
      this.syncCommissions().catch((err) => {
        console.error("[AffiliateRevenueSyncService] Scheduled commissions sync error:", err);
      });
    }, COMM_INTERVAL_MS);

    // 4. Daily Historical Reconciliation: Every 24 hours
    const DAILY_RECONCILIATION_MS = 24 * 60 * 60 * 1000;
    this.reconciliationTimer = setInterval(() => {
      this.runHistoricalReconciliation(30).catch((err) => {
        console.error("[AffiliateRevenueSyncService] Daily reconciliation error:", err);
      });
    }, DAILY_RECONCILIATION_MS);

    this.nextSyncAt = new Date(Date.now() + TX_INTERVAL_MS).toISOString();
    console.log(`[AffiliateRevenueSyncService] Active: Transactions (every 10m), Commissions (every 30m), Reconciliation (daily).`);
  }

  /**
   * Syncs revenue and conversions across all configured affiliate networks
   */
  public async syncAllProviders(
    mode: "INCREMENTAL" | "RECONCILIATION" = "INCREMENTAL",
    startDate?: string,
    endDate?: string
  ): Promise<{
    success: boolean;
    logs: AffiliateSyncLog[];
    summary: {
      totalFetched: number;
      totalCreated: number;
      totalUpdated: number;
      totalSkipped: number;
      totalSalesValue: number;
      totalCommissionAmount: number;
    };
  }> {
    if (this.isRunningSync) {
      throw new Error("عملية المزامنة قيد التشغيل بالفعل، يرجى الانتظار حتى تكتمل.");
    }

    this.isRunningSync = true;
    this.currentJobName = mode === "RECONCILIATION" ? "HISTORICAL_RECONCILIATION" : "TRANSACTIONS_SYNC";
    const overallStart = Date.now();
    const adapters = getAllAdapters();
    const logs: AffiliateSyncLog[] = [];

    let totalFetched = 0;
    let totalCreated = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalSalesValue = 0;
    let totalCommissionAmount = 0;

    this.emitProgress({
      step: "START",
      message: `بدء مزامنة الأرباح والمعاملات مع جميع الشبكات (${adapters.length} شبكة)...`,
      timestamp: new Date().toISOString(),
      progressPercent: 5
    });

    try {
      let adapterIndex = 0;
      for (const adapter of adapters) {
        adapterIndex++;
        const pct = Math.round(10 + (adapterIndex / adapters.length) * 80);

        this.emitProgress({
          step: "PROVIDER_CHECK",
          provider: adapter.networkKey,
          message: `فحص الاتصال وجلب معاملات ${adapter.name}...`,
          timestamp: new Date().toISOString(),
          progressPercent: pct
        });

        // Sync single adapter
        const log = await this.syncSingleProvider(adapter, mode, startDate, endDate);
        logs.push(log);

        totalFetched += log.recordsFetched;
        totalCreated += log.recordsCreated;
        totalUpdated += log.recordsUpdated;
        totalSkipped += log.recordsSkipped;
        totalSalesValue += log.totalSalesValue || 0;
        totalCommissionAmount += log.totalCommissionAmount || 0;
      }

      this.lastSyncAt = new Date().toISOString();
      this.nextSyncAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      this.emitProgress({
        step: "COMPLETED",
        message: `اكتملت المزامنة بنجاح: تم جلب ${totalFetched} سجل، إضافة ${totalCreated} جديد، تحديث ${totalUpdated}، وتخطي ${totalSkipped} مطابق.`,
        timestamp: new Date().toISOString(),
        progressPercent: 100,
        stats: {
          fetched: totalFetched,
          created: totalCreated,
          updated: totalUpdated,
          skipped: totalSkipped
        }
      });

      // Also record aggregate sync job
      db.recordSyncJob({
        jobName: mode === "RECONCILIATION" ? "HISTORICAL_RECONCILIATION" : "AFFILIATE_REVENUE_SYNC",
        status: logs.some((l) => l.status === "FAILED") ? "FAILED" : "SUCCESS",
        itemsProcessed: totalFetched,
        startedAt: new Date(overallStart).toISOString(),
        finishedAt: new Date().toISOString(),
        durationMs: Date.now() - overallStart
      });

      return {
        success: true,
        logs,
        summary: {
          totalFetched,
          totalCreated,
          totalUpdated,
          totalSkipped,
          totalSalesValue,
          totalCommissionAmount
        }
      };
    } finally {
      this.isRunningSync = false;
      this.currentJobName = null;
    }
  }

  /**
   * Synchronizes a single provider
   */
  public async syncSingleProvider(
    adapter: AffiliateNetworkAdapter,
    mode: "INCREMENTAL" | "RECONCILIATION" = "INCREMENTAL",
    startDate?: string,
    endDate?: string
  ): Promise<AffiliateSyncLog> {
    const startedAt = new Date().toISOString();
    const startTime = Date.now();
    const errors: string[] = [];

    let recordsFetched = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsSkipped = 0;
    let totalSalesValue = 0;
    let totalCommissionAmount = 0;

    // Check rate limit backoff
    const cooldownUntil = this.rateLimitCooldowns.get(adapter.networkKey) || 0;
    if (Date.now() < cooldownUntil) {
      const waitSec = Math.ceil((cooldownUntil - Date.now()) / 1000);
      const msg = `تم تخطي ${adapter.name} مؤقتًا لاحترام حدود استهلاك API (انتظار ${waitSec} ثانية)`;
      const skippedLog = db.recordAffiliateSyncLog({
        provider: adapter.networkKey,
        jobType: mode === "RECONCILIATION" ? "HISTORICAL_RECONCILIATION" : "TRANSACTIONS_SYNC",
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "SUCCESS",
        recordsFetched: 0,
        recordsCreated: 0,
        recordsUpdated: 0,
        recordsSkipped: 0,
        errors: [msg],
        durationMs: Date.now() - startTime
      });
      return skippedLog;
    }

    try {
      // Determine date range:
      // Incremental: last 2 days (to catch immediate pending changes)
      // Reconciliation: specified or last 30 days
      const defaultStart = mode === "RECONCILIATION"
        ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        : new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const defaultEnd = new Date().toISOString().split("T")[0];

      const start = startDate || defaultStart;
      const end = endDate || defaultEnd;

      let transactions: ParsedConversion[] = [];

      // If adapter provides custom getTransactions
      if (typeof adapter.getTransactions === "function") {
        transactions = await adapter.getTransactions(start, end);
      } else if (typeof adapter.fetchTransactionsReport === "function") {
        const reportResult: SyncReportResult = await adapter.fetchTransactionsReport(start, end);
        if (!reportResult.success) {
          if (reportResult.errors && reportResult.errors.length > 0) {
            errors.push(...reportResult.errors);
          } else if (reportResult.message) {
            errors.push(reportResult.message);
          }
        }
        // In fetchTransactionsReport, the adapter might have already saved them or returned counts.
        // We ensure idempotency and upsert through our unified engine.
      } else {
        // Limited or Webhook-only provider
        const note = `${adapter.name} يعمل بنظام Webhooks المباشر أو الروابط المرجعية، لا يوجد واجهة API لجلب الأرباح بأثر رجعي.`;
        const log = db.recordAffiliateSyncLog({
          provider: adapter.networkKey,
          jobType: mode === "RECONCILIATION" ? "HISTORICAL_RECONCILIATION" : "TRANSACTIONS_SYNC",
          startedAt,
          finishedAt: new Date().toISOString(),
          status: "SUCCESS",
          recordsFetched: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          totalSalesValue: 0,
          totalCommissionAmount: 0,
          currency: "SAR",
          errors: [],
          durationMs: Date.now() - startTime
        });
        return log;
      }

      recordsFetched = transactions.length;

      // Process each transaction using our deduplication engine
      for (const t of transactions) {
        // Link clickId with click record if available
        let merchantId = t.merchantId;
        let productId = t.productId;

        if (t.clickId) {
          const matchingClick = db.getClickByClickId(t.clickId);
          if (matchingClick) {
            merchantId = matchingClick.merchantId;
            productId = matchingClick.productId;
          }
        }

        if (!merchantId) {
          merchantId = `m_${adapter.networkKey}_generic`;
        }

        const upsertResult = db.upsertConversion({
          conversionId: t.conversionId,
          externalConversionId: t.externalConversionId || t.conversionId,
          clickId: t.clickId || "",
          merchantId,
          productId,
          network: adapter.networkKey,
          orderReference: t.orderReference || t.conversionId,
          orderValue: t.orderValue || 0,
          commissionAmount: t.commissionAmount || 0,
          estimatedCommissionAmount: t.estimatedCommissionAmount,
          currency: t.currency || "SAR",
          status: t.status || "PENDING",
          rawPayload: t.rawPayload || {},
          createdAt: t.timestamp || new Date().toISOString()
        });

        if (upsertResult.created) {
          recordsCreated++;
        } else if (upsertResult.updated) {
          recordsUpdated++;
        } else {
          recordsSkipped++;
        }

        totalSalesValue += t.orderValue || 0;
        totalCommissionAmount += t.commissionAmount || 0;
      }

      const durationMs = Date.now() - startTime;
      const status: "SUCCESS" | "PARTIAL" | "FAILED" = errors.length > 0 
        ? (recordsCreated + recordsUpdated > 0 ? "PARTIAL" : "FAILED")
        : "SUCCESS";

      const syncLog = db.recordAffiliateSyncLog({
        provider: adapter.networkKey,
        jobType: mode === "RECONCILIATION" ? "HISTORICAL_RECONCILIATION" : "TRANSACTIONS_SYNC",
        startedAt,
        finishedAt: new Date().toISOString(),
        status,
        recordsFetched,
        recordsCreated,
        recordsUpdated,
        recordsSkipped,
        totalSalesValue: Math.round(totalSalesValue * 100) / 100,
        totalCommissionAmount: Math.round(totalCommissionAmount * 100) / 100,
        currency: "SAR",
        errors,
        durationMs
      });

      return syncLog;
    } catch (err: any) {
      errors.push(err.message || String(err));
      // Set cooldown backoff on error
      this.rateLimitCooldowns.set(adapter.networkKey, Date.now() + 60 * 1000);

      const failedLog = db.recordAffiliateSyncLog({
        provider: adapter.networkKey,
        jobType: mode === "RECONCILIATION" ? "HISTORICAL_RECONCILIATION" : "TRANSACTIONS_SYNC",
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "FAILED",
        recordsFetched,
        recordsCreated,
        recordsUpdated,
        recordsSkipped,
        totalSalesValue: 0,
        totalCommissionAmount: 0,
        currency: "SAR",
        errors,
        durationMs: Date.now() - startTime
      });
      return failedLog;
    }
  }

  /**
   * Commissions lifecycle verification
   */
  public async syncCommissions(provider?: string): Promise<AffiliateSyncLog[]> {
    const startedAt = new Date().toISOString();
    const adapters = provider ? [getAdapterForNetwork(provider)] : getAllAdapters();
    const logs: AffiliateSyncLog[] = [];

    for (const adapter of adapters) {
      const startTime = Date.now();
      const errors: string[] = [];
      let recordsFetched = 0;
      let recordsUpdated = 0;

      try {
        if (typeof adapter.getCommissions === "function") {
          const comms = await adapter.getCommissions();
          recordsFetched = comms.length;

          for (const c of comms) {
            if (c.conversionId && c.status) {
              const updated = db.updateConversionStatus(c.conversionId, c.status as CommissionStatus);
              if (updated) recordsUpdated++;
            }
          }
        }

        const log = db.recordAffiliateSyncLog({
          provider: adapter.networkKey,
          jobType: "COMMISSIONS_SYNC",
          startedAt,
          finishedAt: new Date().toISOString(),
          status: errors.length === 0 ? "SUCCESS" : "FAILED",
          recordsFetched,
          recordsCreated: 0,
          recordsUpdated,
          recordsSkipped: recordsFetched - recordsUpdated,
          errors,
          durationMs: Date.now() - startTime
        });
        logs.push(log);
      } catch (err: any) {
        const failedLog = db.recordAffiliateSyncLog({
          provider: adapter.networkKey,
          jobType: "COMMISSIONS_SYNC",
          startedAt,
          finishedAt: new Date().toISOString(),
          status: "FAILED",
          recordsFetched: 0,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsSkipped: 0,
          errors: [err.message],
          durationMs: Date.now() - startTime
        });
        logs.push(failedLog);
      }
    }

    return logs;
  }

  /**
   * Historical Reconciliation Engine:
   * Compares local DB vs Affiliate Network reports for the last N days.
   * Detects:
   * 1. Missing conversions
   * 2. Changed commissions
   * 3. Approved / Rejected / Cancelled transitions
   */
  public async runHistoricalReconciliation(days = 30, provider?: string): Promise<{
    reconciliationCompletedAt: string;
    daysChecked: number;
    logs: AffiliateSyncLog[];
  }> {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const endDate = new Date().toISOString().split("T")[0];

    this.emitProgress({
      step: "RECONCILING",
      message: `بدء المصالحة التاريخية لمعاملات آخر ${days} يوم ومقارنتها مع سجلات الشبكات...`,
      timestamp: new Date().toISOString(),
      progressPercent: 15
    });

    let resultLogs: AffiliateSyncLog[] = [];
    if (provider) {
      const adapter = getAdapterForNetwork(provider);
      const log = await this.syncSingleProvider(adapter, "RECONCILIATION", startDate, endDate);
      resultLogs.push(log);
    } else {
      const result = await this.syncAllProviders("RECONCILIATION", startDate, endDate);
      resultLogs = result.logs;
    }

    return {
      reconciliationCompletedAt: new Date().toISOString(),
      daysChecked: days,
      logs: resultLogs
    };
  }

  /**
   * Returns live sync status and provider connectivity health matrix
   */
  public async getHealthMatrix(): Promise<{
    lastSyncAt: string | null;
    nextSyncAt: string | null;
    isRunning: boolean;
    currentJob: string | null;
    isDelayed: boolean;
    delayReason?: string;
    providers: ProviderHealthStatus[];
  }> {
    const adapters = getAllAdapters();
    const providers: ProviderHealthStatus[] = [];

    // Check delay threshold: if last sync > 30 minutes ago, mark delayed
    const isDelayed = this.lastSyncAt 
      ? (Date.now() - new Date(this.lastSyncAt).getTime()) > 30 * 60 * 1000
      : false;
    const delayReason = isDelayed ? "تأخرت المزامنة الآلية لأكثر من 30 دقيقة" : undefined;

    for (const adapter of adapters) {
      let status: "CONNECTED" | "DELAYED" | "AUTH_ERROR" | "NOT_CONFIGURED" | "LIMITED" = "NOT_CONFIGURED";
      let message = "";
      let lastSuccessAt: string | undefined;
      let lastErrorAt: string | undefined;
      let lastErrorMessage: string | undefined;

      // Find recent sync logs for this provider
      const recentLogs = db.getAffiliateSyncLogs(5, adapter.networkKey);
      const lastSuccessLog = recentLogs.find((l) => l.status === "SUCCESS");
      const lastFailedLog = recentLogs.find((l) => l.status === "FAILED");

      if (lastSuccessLog) lastSuccessAt = lastSuccessLog.finishedAt;
      if (lastFailedLog) {
        lastErrorAt = lastFailedLog.finishedAt;
        lastErrorMessage = lastFailedLog.errors.join(", ");
      }

      // Check adapter custom status or testConnection
      if (typeof adapter.getStatus === "function") {
        const customStatus = await adapter.getStatus();
        providers.push(customStatus);
        continue;
      }

      try {
        const testRes = await adapter.testConnection();
        if (testRes.connected) {
          status = isDelayed ? "DELAYED" : "CONNECTED";
          message = testRes.message;
        } else {
          if (testRes.message.includes("لم يتم ضبط") || testRes.message.includes("not configured")) {
            status = "NOT_CONFIGURED";
            message = testRes.message;
          } else {
            status = "AUTH_ERROR";
            message = testRes.message;
          }
        }
      } catch (err: any) {
        status = "AUTH_ERROR";
        message = err.message;
      }

      // If adapter does not support API reporting (e.g. Amazon Tag only or Webhook only)
      if (adapter.networkKey === "amazon" && status === "CONNECTED") {
        // Amazon PA-API without Reporting API access is limited
        status = "LIMITED";
        message = "التتبع نشط عبر الوسم (Tracking Tag). جلب الأرباح يتم عبر التقارير الرسمية لأمازون أسوشيتس.";
      }

      providers.push({
        networkKey: adapter.networkKey,
        name: adapter.name,
        status,
        message,
        lastSuccessAt,
        lastErrorAt,
        lastErrorMessage,
        apiReportingSupported: typeof adapter.fetchTransactionsReport === "function" || typeof adapter.getTransactions === "function",
        webhookSupported: typeof adapter.validateWebhook === "function"
      });
    }

    return {
      lastSyncAt: this.lastSyncAt,
      nextSyncAt: this.nextSyncAt,
      isRunning: this.isRunningSync,
      currentJob: this.currentJobName,
      isDelayed,
      delayReason,
      providers
    };
  }

  private emitProgress(event: SyncProgressEvent) {
    this.emit("progress", event);
  }
}

export const affiliateRevenueSyncService = AffiliateRevenueSyncService.getInstance();
