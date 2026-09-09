import React, { useState, useEffect, useRef } from "react";
import {
  DollarSign,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpRight,
  Shield,
  Layers,
  Database,
  BarChart3,
  Calendar,
  Filter,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  HelpCircle,
  Sliders,
  Play,
  Coins,
  Wallet,
  Copy,
  ExternalLink
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from "recharts";
import { AffiliateLinksRevenueChart, AffiliateLinkMetric } from "./AffiliateLinksRevenueChart";
import { MostProfitableStoresCard } from "./MostProfitableStoresCard";
import { adminFetch } from "../../utils/apiClient";

interface RevenueSummary {
  totalTrackedSales: number;
  pendingCommission: number;
  approvedCommission: number;
  rejectedCommission: number;
  paidCommission: number;
  estimatedCommission: number;
  totalRevenue: number;
  baseCurrency: string;
  totalConversions: number;
  totalClicks: number;
  conversionRate: string;
  byCurrency: Record<string, { sales: number; pending: number; approved: number; rejected: number; paid: number }>;
  exchangeRates: Record<string, number>;
}

interface NetworkBreakdown {
  networkKey: string;
  name: string;
  clicks: number;
  conversionsCount: number;
  sales: number;
  pendingCommission: number;
  approvedCommission: number;
  rejectedCommission: number;
  estimatedCommission: number;
  connectionStatus: "CONNECTED" | "NOT_CONFIGURED" | "INVALID_CREDENTIALS" | "PENDING_APPROVAL";
  lastTestedAt?: string;
}

interface ProviderHealth {
  networkKey: string;
  name: string;
  status: "CONNECTED" | "DELAYED" | "AUTH_ERROR" | "NOT_CONFIGURED" | "LIMITED";
  message: string;
  lastSuccessAt?: string;
  lastErrorAt?: string;
  lastErrorMessage?: string;
  rateLimitRemaining?: number;
  apiReportingSupported: boolean;
  webhookSupported: boolean;
}

interface SyncLogItem {
  id: string;
  provider: string;
  jobType: "TRANSACTIONS_SYNC" | "COMMISSIONS_SYNC" | "HISTORICAL_RECONCILIATION" | "FULL_PIPELINE";
  startedAt: string;
  finishedAt: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED" | "IN_PROGRESS";
  recordsFetched: number;
  recordsCreated: number;
  recordsUpdated: number;
  recordsSkipped: number;
  totalSalesValue?: number;
  totalCommissionAmount?: number;
  currency?: string;
  errors: string[];
  durationMs: number;
}

interface SyncStatusData {
  lastSyncAt: string | null;
  nextSyncAt: string | null;
  isRunning: boolean;
  currentJob: string | null;
  isDelayed: boolean;
  delayReason?: string;
  statusLabel: string;
  isLive: boolean;
}

export const AffiliateRevenueTab: React.FC = () => {
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [networkBreakdown, setNetworkBreakdown] = useState<NetworkBreakdown[]>([]);
  const [linksMetrics, setLinksMetrics] = useState<AffiliateLinkMetric[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatusData | null>(null);
  const [providers, setProviders] = useState<ProviderHealth[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLogItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);
  const [selectedCurrencyView, setSelectedCurrencyView] = useState<"SAR_NORMALIZED" | "NATIVE">("SAR_NORMALIZED");
  const [activeSubTab, setActiveSubTab] = useState<"overview" | "networks" | "health" | "logs" | "payout">("overview");

  // Payout management state
  const [payoutConfig, setPayoutConfig] = useState<any>(null);
  const [payoutTransactions, setPayoutTransactions] = useState<any[]>([]);
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [copiedWalletAdmin, setCopiedWalletAdmin] = useState(false);
  const [testPayoutSuccessMsg, setTestPayoutSuccessMsg] = useState<string | null>(null);
  const [isTriggeringPayout, setIsTriggeringPayout] = useState(false);
  const [editWalletAddress, setEditWalletAddress] = useState("");
  const [editWalletNetwork, setEditWalletNetwork] = useState("");
  const [isUpdatingWallet, setIsUpdatingWallet] = useState(false);
  const [walletUpdateFeedback, setWalletUpdateFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Sync execution state
  const [isSyncingNow, setIsSyncingNow] = useState(false);
  const [syncProgressStep, setSyncProgressStep] = useState<string>("");
  const [syncProgressPercent, setSyncProgressPercent] = useState<number>(0);
  const [syncFeedback, setSyncFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Reconciliation modal state
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [reconcileDays, setReconcileDays] = useState(30);
  const [isReconciling, setIsReconciling] = useState(false);

  // Filter provider for logs
  const [logFilterProvider, setLogFilterProvider] = useState<string>("ALL");

  const sseRef = useRef<EventSource | null>(null);

  const fetchRevenueData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const res = await adminFetch(`/api/admin/affiliate/revenue?days=${timeRangeDays}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data.summary);
        setNetworkBreakdown(data.networkBreakdown || []);
        setLinksMetrics(data.linksMetrics || []);
        setHistory(data.history || []);
        setSyncStatus(data.syncStatus);
        setProviders(data.providers || []);
        setSyncLogs(data.recentLogs || []);
      }
    } catch (err) {
      console.error("Failed to fetch affiliate revenue data:", err);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  const fetchPayoutData = async () => {
    setPayoutLoading(true);
    try {
      const res = await adminFetch("/api/admin/payout/config");
      if (res.ok) {
        const data = await res.json();
        setPayoutConfig(data.destination);
        setPayoutTransactions(data.transactions || []);
        if (data.destination) {
          setEditWalletAddress(data.destination.walletAddress || data.destination.accountIdentifier || "");
          setEditWalletNetwork(data.destination.walletNetwork || "BEP20 (BNB Smart Chain) / ERC20");
        }
      }
    } catch (err) {
      console.error("Failed to fetch payout destination:", err);
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingWallet(true);
    setWalletUpdateFeedback(null);
    try {
      const res = await adminFetch("/api/admin/payout/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletAddress: editWalletAddress.trim(),
          walletNetwork: editWalletNetwork,
          walletExchange: "Binance"
        })
      });
      const data = await res.json();
      if (res.ok) {
        setPayoutConfig(data.destination);
        setWalletUpdateFeedback({ success: true, message: "تم تحديث وتفعيل عنوان محفظة بينانس بنجاح!" });
        setTimeout(() => setWalletUpdateFeedback(null), 4000);
      } else {
        setWalletUpdateFeedback({ success: false, message: data.error || "فشل تحديث عنوان المحفظة" });
      }
    } catch (err: any) {
      setWalletUpdateFeedback({ success: false, message: err?.message || "خطأ أثناء الاتصال بالخادم" });
    } finally {
      setIsUpdatingWallet(false);
    }
  };

  const handleTriggerTestPayout = async () => {
    setIsTriggeringPayout(true);
    setTestPayoutSuccessMsg(null);
    try {
      const res = await adminFetch("/api/admin/payout/test-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountSar: 100 })
      });
      const data = await res.json();
      if (res.ok) {
        setTestPayoutSuccessMsg(data.message || "تم تسجيل عملية إيداع أرباح تجريبية بقيمة 100 ر.س (26.67 USDT) إلى محفظتك بنجاح!");
        await fetchPayoutData();
        setTimeout(() => setTestPayoutSuccessMsg(null), 6000);
      }
    } catch (err: any) {
      console.error("Failed to trigger test payout:", err);
    } finally {
      setIsTriggeringPayout(false);
    }
  };

  useEffect(() => {
    fetchRevenueData();
    fetchPayoutData();

    // 1. Smart polling every 30 seconds (no manual refresh needed)
    const pollInterval = setInterval(() => {
      fetchRevenueData(true);
    }, 30000);

    // 2. Real-time Server-Sent Events stream for instantaneous sync progress updates
    try {
      const eventSource = new EventSource("/api/admin/affiliate/revenue/stream");
      sseRef.current = eventSource;

      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "PROGRESS" && parsed.event) {
            setSyncProgressStep(parsed.event.message);
            setSyncProgressPercent(parsed.event.progressPercent || 50);
            if (parsed.event.step === "COMPLETED") {
              fetchRevenueData(true);
            }
          }
        } catch {
          // ignore parse errors
        }
      };

      eventSource.onerror = () => {
        // SSE disconnected, fallback to smart polling is active
        eventSource.close();
      };
    } catch (e) {
      console.warn("SSE init notice:", e);
    }

    return () => {
      clearInterval(pollInterval);
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [timeRangeDays]);

  const handleManualSync = async (provider?: string) => {
    setIsSyncingNow(true);
    setSyncFeedback(null);
    setSyncProgressPercent(10);
    setSyncProgressStep("جاري إرسال طلب المزامنة للشبكات...");

    try {
      const res = await adminFetch("/api/admin/affiliate/revenue/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: provider || "ALL", mode: "INCREMENTAL" })
      });

      const data = await res.json();
      if (res.ok) {
        setSyncFeedback({
          success: true,
          message: `اكتملت المزامنة بنجاح! تم جلب ${data.summary?.totalFetched || 0} معاملة، إضافة ${data.summary?.totalCreated || 0} جديد، وتحديث ${data.summary?.totalUpdated || 0}.`
        });
        await fetchRevenueData(true);
      } else {
        setSyncFeedback({
          success: false,
          message: data.error || "فشل الاتصال ببعض الشبكات"
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        success: false,
        message: `خطأ أثناء تنفيذ المزامنة: ${err.message}`
      });
    } finally {
      setIsSyncingNow(false);
      setSyncProgressPercent(0);
      setSyncProgressStep("");
    }
  };

  const handleHistoricalReconciliation = async () => {
    setIsReconciling(true);
    setSyncFeedback(null);
    try {
      const res = await adminFetch("/api/admin/affiliate/revenue/reconcile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days: reconcileDays })
      });
      const data = await res.json();
      if (res.ok) {
        setSyncFeedback({
          success: true,
          message: `اكتملت المصالحة التاريخية لآخر ${reconcileDays} يوم بنجاح. تم فحص ومطابقة جميع المعاملات.`
        });
        setShowReconcileModal(false);
        await fetchRevenueData(true);
      } else {
        setSyncFeedback({
          success: false,
          message: data.error || "فشلت المصالحة التاريخية"
        });
      }
    } catch (err: any) {
      setSyncFeedback({
        success: false,
        message: `خطأ في المصالحة: ${err.message}`
      });
    } finally {
      setIsReconciling(false);
    }
  };

  // Helper to format ISO date to Arabic friendly time
  const formatTimeAgo = (iso?: string | null) => {
    if (!iso) return "لم تتم بعد";
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / (60 * 1000));
    if (mins < 1) return "منذ لحظات";
    if (mins < 60) return `منذ ${mins} دقيقة`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    return new Date(iso).toLocaleDateString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const formatFutureTime = (iso?: string | null) => {
    if (!iso) return "غير مجدول";
    const diff = new Date(iso).getTime() - Date.now();
    const mins = Math.ceil(diff / (60 * 1000));
    if (mins <= 0) return "الآن";
    return `خلال ${mins} دقيقة`;
  };

  return (
    <div className="space-y-6 text-slate-100" dir="rtl">
      {/* 1. Header & Live Sync Status Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  مزامنة الأرباح والإيرادات التلقائية
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Source of Truth: Affiliate Network
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  النظام يقوم بجلب وتحديث العمولات والمعاملات الحقيقية آلياً عبر APIs و Webhooks الرسمية بدون أي أرقام افتراضية
                </p>
              </div>
            </div>

            {/* Sync Frequency Info */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-slate-400">آخر مزامنة:</span>
                <span className="font-semibold text-white">{formatTimeAgo(syncStatus?.lastSyncAt)}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-slate-400">المزامنة القادمة:</span>
                <span className="font-semibold text-white">{formatFutureTime(syncStatus?.nextSyncAt)}</span>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950/60 px-3 py-1.5 rounded-lg border border-slate-800/80">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-slate-400">طبيعة العرض:</span>
                <span className="font-semibold text-emerald-400">
                  {syncStatus?.statusLabel || "أرباح متزامنة رسمياً"}
                </span>
              </div>

              {syncStatus?.isDelayed && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>{syncStatus.delayReason || "يوجد تأخر طفيف في استجابة بعض الشبكات"}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sync Trigger Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => handleManualSync()}
              disabled={isSyncingNow || syncStatus?.isRunning}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingNow ? "animate-spin" : ""}`} />
              {isSyncingNow ? "جارٍ المزامنة..." : "مزامنة الآن"}
            </button>

            <button
              onClick={() => setShowReconcileModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Database className="w-4 h-4 text-teal-400" />
              المصالحة التاريخية
            </button>

            <button
              onClick={() => fetchRevenueData()}
              disabled={isLoading}
              className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 transition-all cursor-pointer"
              title="تحديث الأرقام"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* Live sync progress step feedback */}
        {isSyncingNow && (
          <div className="mt-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                {syncProgressStep || "جاري فحص وتحديث المعاملات..."}
              </span>
              <span className="font-mono text-emerald-400">{syncProgressPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 to-emerald-400 transition-all duration-300"
                style={{ width: `${syncProgressPercent}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Feedback Alert */}
        {syncFeedback && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-center justify-between border ${
              syncFeedback.success
                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                : "bg-red-500/10 text-red-300 border-red-500/20"
            }`}
          >
            <div className="flex items-center gap-2">
              {syncFeedback.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400" />
              )}
              <span>{syncFeedback.message}</span>
            </div>
            <button onClick={() => setSyncFeedback(null)} className="text-slate-400 hover:text-white">
              <XCircle className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 2. Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Tracked Gross Sales */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span>إجمالي المبيعات المحققة</span>
            <Layers className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-white tracking-tight">
            {summary?.totalTrackedSales ? summary.totalTrackedSales.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
            <span className="text-xs font-normal text-emerald-400 mr-1.5">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>الطلبات: {summary?.totalConversions || 0}</span>
            <span className="text-teal-400">معدل التحويل: {summary?.conversionRate || "0%"}</span>
          </div>
        </div>

        {/* Approved Commission */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-4 relative overflow-hidden shadow-md shadow-emerald-500/5">
          <div className="flex items-center justify-between text-emerald-400 text-xs mb-2">
            <span className="font-semibold">العمولة المعتمدة (Approved)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 tracking-tight">
            {summary?.approvedCommission ? summary.approvedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
            <span className="text-xs font-normal text-emerald-400 mr-1.5">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            أرباح مؤكدة ومطابقة مع تقارير الشبكات
          </div>
        </div>

        {/* Pending Commission */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-amber-400 text-xs mb-2">
            <span className="font-semibold">العمولة المعلقة (Pending)</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            {summary?.pendingCommission ? summary.pendingCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
            <span className="text-xs font-normal text-amber-400 mr-1.5">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            بانتظار انقضاء فترة الإرجاع للمتجر
          </div>
        </div>

        {/* Estimated Commission */}
        <div className="bg-slate-900/90 border border-sky-500/30 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-sky-400 text-xs mb-2">
            <span className="font-semibold">العمولة المقدرة (Estimated)</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400 tracking-tight">
            {summary?.estimatedCommission ? summary.estimatedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
            <span className="text-xs font-normal text-sky-400 mr-1.5">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            تقدير الشبكة قبل الفوترة النهائية
          </div>
        </div>

        {/* Rejected Commission */}
        <div className="bg-slate-900/90 border border-red-500/30 rounded-2xl p-4 relative overflow-hidden shadow-md">
          <div className="flex items-center justify-between text-red-400 text-xs mb-2">
            <span className="font-semibold">الطلبات المرفوضة / الملغاة</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-2xl font-black text-red-400 tracking-tight">
            {summary?.rejectedCommission ? summary.rejectedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 }) : "0.00"}
            <span className="text-xs font-normal text-red-400 mr-1.5">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            طلبات تم إلغاؤها أو إرجاعها من العملاء
          </div>
        </div>
      </div>

      {/* 3. Currency Inspector & Multi-Currency Native Breakdown */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">العملات الأصلية الصادرة من الشبكات:</span>
            <span className="text-[11px] text-slate-400">
              (يتم الاحتفاظ بالعملة الأصلية لكل شبكة مع توفير تحويل لحظي شفاف بالريال السعودي)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedCurrencyView("SAR_NORMALIZED")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedCurrencyView === "SAR_NORMALIZED"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              عرض موحد (SAR)
            </button>
            <button
              onClick={() => setSelectedCurrencyView("NATIVE")}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                selectedCurrencyView === "NATIVE"
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              العملات الأصلية المنفصلة
            </button>
          </div>
        </div>

        {/* Currency Tags / Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {summary?.byCurrency && Object.keys(summary.byCurrency).length > 0 ? (
            Object.entries(summary.byCurrency).map(([curr, amounts]: [string, any]) => (
              <div
                key={curr}
                className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-xs flex items-center gap-3"
              >
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {curr}
                </span>
                <div className="flex items-center gap-3 text-slate-300">
                  <span>
                    المبيعات: <strong className="text-white">{(amounts?.sales || 0).toLocaleString()}</strong>
                  </span>
                  <span>
                    معتمد: <strong className="text-emerald-400">{(amounts?.approved || 0).toLocaleString()}</strong>
                  </span>
                  <span>
                    معلق: <strong className="text-amber-400">{(amounts?.pending || 0).toLocaleString()}</strong>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-slate-400 py-1">
              العملة الأساسية للشبكات النشطة: SAR (الريال السعودي)
            </div>
          )}
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs */}
      <div className="flex items-center space-x-2 space-x-reverse border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab("overview")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === "overview"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          الرسوم البيانية واتجاهات الإيرادات
        </button>

        <button
          onClick={() => setActiveSubTab("networks")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === "networks"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Layers className="w-4 h-4" />
          أداء الشبكات التابعة ({networkBreakdown.length})
        </button>

        <button
          onClick={() => setActiveSubTab("health")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === "health"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Shield className="w-4 h-4" />
          صحة الربط وحدود API ({providers.length})
        </button>

        <button
          onClick={() => setActiveSubTab("logs")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === "logs"
              ? "bg-slate-800 text-emerald-400 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
          }`}
        >
          <Database className="w-4 h-4" />
          سجل عمليات المزامنة والتسوية (Audit Logs)
        </button>

        <button
          onClick={() => setActiveSubTab("payout")}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2 ${
            activeSubTab === "payout"
              ? "bg-amber-500 text-slate-950 font-black shadow-md ring-2 ring-amber-400"
              : "text-amber-400 hover:text-amber-300 hover:bg-slate-900 bg-amber-500/10 border border-amber-500/20"
          }`}
        >
          <Coins className="w-4 h-4" />
          محفظة بينانس واستلام الأرباح (Binance Payouts)
        </button>
      </div>

      {/* 5. Sub-Tab Content */}
      {activeSubTab === "overview" && (
        <div className="space-y-6">
          {/* Centralized Click Analytics Tracker & Most Profitable Stores Card */}
          <MostProfitableStoresCard />

          {/* Interactive Recharts Added Links & Revenue Evolution Component */}
          <AffiliateLinksRevenueChart
            history={history}
            networkBreakdown={networkBreakdown}
            linksMetrics={linksMetrics}
            timeRangeDays={timeRangeDays}
            onTimeRangeChange={(days) => setTimeRangeDays(days)}
          />
        </div>
      )}

      {/* Network Breakdown Tab */}
      {activeSubTab === "networks" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white">تفصيل الأرباح حسب شبكات الأفلييت</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                مقارنة حقيقية مبنية على البيانات المسجلة من كل شبكة تابعة
              </p>
            </div>
            <button
              onClick={() => handleManualSync()}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              مزامنة الكل
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">الشبكة التابعة</th>
                  <th className="px-4 py-3.5">حالة الاتصال</th>
                  <th className="px-4 py-3.5">النقرات</th>
                  <th className="px-4 py-3.5">الطلبات</th>
                  <th className="px-4 py-3.5">المبيعات (SAR)</th>
                  <th className="px-4 py-3.5">العمولة المعلقة</th>
                  <th className="px-4 py-3.5">العمولة المعتمدة</th>
                  <th className="px-4 py-3.5">العمولة المقدرة</th>
                  <th className="px-5 py-3.5 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {networkBreakdown.length > 0 ? (
                  networkBreakdown.map((net) => (
                    <tr key={net.networkKey} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-4 font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                        {net.name}
                      </td>
                      <td className="px-4 py-4">
                        {net.connectionStatus === "CONNECTED" ? (
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                            متصل ومزامن
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-400 font-medium">
                            {net.connectionStatus === "NOT_CONFIGURED" ? "غير مهيأ" : "محدود"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 font-mono">{net.clicks.toLocaleString()}</td>
                      <td className="px-4 py-4 font-mono font-bold text-white">{net.conversionsCount}</td>
                      <td className="px-4 py-4 font-mono text-teal-400 font-bold">
                        {net.sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 font-mono text-amber-400 font-semibold">
                        {net.pendingCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 font-mono text-emerald-400 font-bold">
                        {net.approvedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-4 py-4 font-mono text-sky-400">
                        {net.estimatedCommission.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleManualSync(net.networkKey)}
                          disabled={isSyncingNow}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                        >
                          مزامنة الآن
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-slate-500">
                      لا تتوفر شبكات معتمدة
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Health Matrix Tab */}
      {activeSubTab === "health" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-white">مصفوفة صحة الربط التقني ومعدل الاستهلاك (API Health Matrix)</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              متابعة حالة التراخيص والمصادقة وحدود الطلبات Rate-limits لكل شبكة تابعة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((p) => (
              <div
                key={p.networkKey}
                className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === "CONNECTED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : p.status === "DELAYED"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : p.status === "LIMITED"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : "bg-slate-800 text-slate-400 border-slate-700"
                      }`}
                    >
                      {p.status === "CONNECTED"
                        ? "متصل ومفعل"
                        : p.status === "DELAYED"
                        ? "تأخر في الاستجابة"
                        : p.status === "LIMITED"
                        ? "محدود (تتبع بالوسم)"
                        : "غير مهيأ في .env"}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">{p.message}</p>
                </div>

                <div className="border-t border-slate-800/80 pt-2.5 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span>تقارير API: {p.apiReportingSupported ? "مدعومة ✅" : "غير مدعومة ❌"}</span>
                    <span>•</span>
                    <span>Webhooks: {p.webhookSupported ? "مدعومة ✅" : "غير مدعومة ❌"}</span>
                  </div>
                  {p.lastSuccessAt && (
                    <span className="text-emerald-400">نجاح: {formatTimeAgo(p.lastSuccessAt)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sync Logs Audit Tab */}
      {activeSubTab === "logs" && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white">سجل تدقيق عمليات المزامنة (Affiliate Sync Audit Logs)</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                سجل تاريخي إلزامي يوضح عدد السجلات المسترجعة، المضافة، والمحدثة مع تفاصيل الأخطاء
              </p>
            </div>

            {/* Provider Filter */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400">تصفية حسب المزود:</span>
              <select
                value={logFilterProvider}
                onChange={(e) => setLogFilterProvider(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs outline-none"
              >
                <option value="ALL">جميع المزودين</option>
                <option value="awin">Awin</option>
                <option value="impact">Impact</option>
                <option value="cj">CJ Affiliate</option>
                <option value="amazon">Amazon Associates</option>
                <option value="shareasale">ShareASale</option>
                <option value="admitad">Admitad</option>
                <option value="arabclicks">ArabClicks</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">الوقت</th>
                  <th className="px-4 py-3.5">المزود</th>
                  <th className="px-4 py-3.5">نوع العملية</th>
                  <th className="px-4 py-3.5">الحالة</th>
                  <th className="px-4 py-3.5">مسترجعة</th>
                  <th className="px-4 py-3.5">جديدة</th>
                  <th className="px-4 py-3.5">محدثة</th>
                  <th className="px-4 py-3.5">متطابقة (تخطي)</th>
                  <th className="px-4 py-3.5">المدة</th>
                  <th className="px-5 py-3.5">الملاحظات والأخطاء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {syncLogs
                  .filter((l) => logFilterProvider === "ALL" || l.provider.toLowerCase() === logFilterProvider.toLowerCase())
                  .map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-3.5 text-slate-400 whitespace-nowrap">
                        {new Date(log.startedAt).toLocaleTimeString("ar-SA", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-white uppercase">{log.provider}</td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-300">
                        {log.jobType === "TRANSACTIONS_SYNC"
                          ? "مزامنة المعاملات"
                          : log.jobType === "COMMISSIONS_SYNC"
                          ? "تحديث العمولات"
                          : "مصالحة تاريخية"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.status === "SUCCESS"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : log.status === "PARTIAL"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-red-500/10 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-white">{log.recordsFetched}</td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 font-bold">+{log.recordsCreated}</td>
                      <td className="px-4 py-3.5 font-mono text-teal-400 font-semibold">{log.recordsUpdated}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-500">{log.recordsSkipped}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-400">{log.durationMs}ms</td>
                      <td className="px-5 py-3.5 text-slate-400 max-w-xs truncate">
                        {log.errors && log.errors.length > 0 ? (
                          <span className="text-red-400">{log.errors.join(", ")}</span>
                        ) : (
                          <span className="text-emerald-500/80">اكتملت المعالجة بنجاح</span>
                        )}
                      </td>
                    </tr>
                  ))}
                {syncLogs.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center py-8 text-slate-500">
                      لم يتم تسجيل أي عمليات مزامنة بعد
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payout Management Sub-Tab */}
      {activeSubTab === "payout" && (
        <div className="space-y-6">
          {/* Main Binance Wallet Card */}
          <div className="bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 mb-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-amber-500/30">
                  <Coins className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-base sm:text-lg font-black text-white">
                      محفظة بينانس المربوطة (Binance Payout Wallet)
                    </h3>
                    <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      نشطة وجاهزة للاستقبال
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                    يتم تحويل عوائد وعمولات التسويق بالعمولة المعتمدة تلقائياً إلى عنوان محفظتك في بينانس بالدولار الرقمي المستقر (USDT) أو بالريال السعودي.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-amber-500/30 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-bold">المنصة المعتمدة</span>
                  <span className="text-xs font-black text-amber-400">Binance • Smart Chain / ERC20</span>
                </div>
              </div>
            </div>

            {/* Wallet Address Display Box */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 relative z-10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  عنوان الإيداع في بينانس (Binance Deposit Address):
                </span>
                <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
                  Verified EVM Compatible
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-mono text-amber-300 select-all overflow-x-auto tracking-wide text-left">
                  {payoutConfig?.walletAddress || "0xddeae422ae06b08122d4f44510a7b99410ac3d19"}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const addr = payoutConfig?.walletAddress || "0xddeae422ae06b08122d4f44510a7b99410ac3d19";
                    navigator.clipboard.writeText(addr);
                    setCopiedWalletAdmin(true);
                    setTimeout(() => setCopiedWalletAdmin(false), 2500);
                  }}
                  className="px-4 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
                >
                  {copiedWalletAdmin ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ العنوان</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span>الشبكة الافتراضية: <strong>{payoutConfig?.walletNetwork || "BEP20 (BNB Smart Chain)"}</strong></span>
                <a
                  href={`https://bscscan.com/address/${payoutConfig?.walletAddress || "0xddeae422ae06b08122d4f44510a7b99410ac3d19"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-bold underline"
                >
                  <span>عرض حركة المعاملات على مستكشف البلوكشين (BscScan)</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Edit / Update Wallet Form */}
            <form onSubmit={handleUpdateWallet} className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  تعديل عنوان المحفظة:
                </label>
                <input
                  type="text"
                  value={editWalletAddress}
                  onChange={(e) => setEditWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:border-amber-400 focus:outline-none text-left"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  الشبكة:
                </label>
                <div className="flex gap-2">
                  <select
                    value={editWalletNetwork}
                    onChange={(e) => setEditWalletNetwork(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                  >
                    <option value="BEP20 (BNB Smart Chain) / ERC20">BEP20 (BNB Smart Chain)</option>
                    <option value="ERC20 (Ethereum Network)">ERC20 (Ethereum)</option>
                    <option value="Polygon / Arbitrum (L2)">Polygon / Arbitrum</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isUpdatingWallet || !editWalletAddress.trim()}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 font-bold text-xs shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingWallet ? "جاري الحفظ..." : "حفظ"}
                  </button>
                </div>
              </div>
            </form>

            {walletUpdateFeedback && (
              <div className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 font-bold ${walletUpdateFeedback.success ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                <CheckCircle2 className="w-4 h-4" />
                <span>{walletUpdateFeedback.message}</span>
              </div>
            )}

            {/* Test Simulation Payout Action */}
            <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 relative z-10">
              <div className="text-xs text-slate-400">
                <span className="font-bold text-slate-200 block mb-0.5">محاكاة عملية تحويل أرباح تجريبية:</span>
                <span>توليد معاملة أرباح فورية بقيمة 100 ر.س (26.67 USDT) وإضافتها إلى سجل التحويلات</span>
              </div>

              <button
                type="button"
                onClick={handleTriggerTestPayout}
                disabled={isTriggeringPayout}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md disabled:opacity-50"
              >
                <Zap className="w-4 h-4" />
                {isTriggeringPayout ? "جاري التنفيذ..." : "إجراء تحويل أرباح تجريبي لمحفظتي"}
              </button>
            </div>

            {testPayoutSuccessMsg && (
              <div className="mt-3 p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{testPayoutSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Payout History Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  سجل تحويلات الأرباح إلى المحفظة (Payout Transactions History)
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  جميع عمليات التحويل المسجلة بالريال السعودي ومكافئتها بالـ USDT مع كود المعاملة (TxHash)
                </p>
              </div>
              <button
                onClick={fetchPayoutData}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                title="تحديث السجل"
              >
                <RefreshCw className={`w-4 h-4 ${payoutLoading ? "animate-spin text-amber-400" : ""}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">تاريخ التحويل</th>
                    <th className="px-4 py-3">المبلغ (SAR)</th>
                    <th className="px-4 py-3">المكافئ الرقمي (USDT)</th>
                    <th className="px-4 py-3">الوجهة والمنصة</th>
                    <th className="px-4 py-3">الشبكة</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">رمز المعاملة (TxHash)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  {payoutTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 text-slate-400">
                        {new Date(tx.initiatedAt).toLocaleDateString("ar-SA", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-emerald-400 font-mono">
                        {tx.amountSar.toFixed(2)} ر.س
                      </td>
                      <td className="px-4 py-3.5 font-bold text-amber-400 font-mono">
                        {tx.amountCryptoUsdt ? `${tx.amountCryptoUsdt.toFixed(2)} USDT` : "—"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] font-bold">
                          {tx.exchange || "Binance"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-400 text-[11px]">
                        {tx.destinationNetwork || "BEP20"}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {tx.status === "CONFIRMED_ON_CHAIN" ? "مؤكد على البلوكشين" : tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                        {tx.txHash ? (
                          <span className="text-amber-400/80 select-all" title={tx.txHash}>
                            {tx.txHash.substring(0, 16)}...
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                  {payoutTransactions.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-slate-500">
                        لا توجد تحويلات سابقة مسجلة بعد. اضغط زر "إجراء تحويل أرباح تجريبي" لتجربة أول معاملة!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. Historical Reconciliation Modal */}
      {showReconcileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-right">
            <button
              onClick={() => setShowReconcileModal(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">إجراء المصالحة التاريخية (Reconciliation)</h3>
                <p className="text-xs text-slate-400">تدقيق ومقارنة قاعدة البيانات المحلية مع تقارير الشبكات</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              ستقوم هذه العملية بفحص جميع المعاملات في الفترة المختارة، واسترجاع أي عمليات شراء مفقودة، وتحديث حالات العمولات التي تحولت من <strong>معلقة (Pending)</strong> إلى <strong>معتمدة (Approved)</strong> أو <strong>مرفوضة (Rejected)</strong>.
            </p>

            <div className="mb-5">
              <label className="block text-xs font-semibold text-slate-300 mb-2">النطاق الزمني للمصالحة:</label>
              <div className="grid grid-cols-3 gap-2">
                {[14, 30, 90].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setReconcileDays(d)}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                      reconcileDays === d
                        ? "bg-emerald-500 text-slate-950 border-emerald-400"
                        : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    آخر {d} يوم
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowReconcileModal(false)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleHistoricalReconciliation}
                disabled={isReconciling}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {isReconciling ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جارٍ المصالحة...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    بدء فحص ومطابقة البيانات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
