import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Zap,
  Globe,
  Clock,
  DollarSign,
  Search,
  Filter,
  Check,
  Copy,
  Info,
  Server,
  Activity,
  Layers,
  ArrowUpRight
} from "lucide-react";
import { LazyBrandLogo } from "../common/LazyBrandLogo";
import { adminFetch } from "../../utils/apiClient";

export interface LinkVerificationResult {
  merchantId: string;
  merchantName: string;
  arabicName: string;
  slug: string;
  network: string;
  category: string;
  targetAffiliateUrl: string;
  finalDestinationUrl: string;
  httpStatus: number;
  redirectChain: string[];
  redirectHopsCount: number;
  responseTimeMs: number;
  lastVerifiedAt: string;
  trackingValidation: {
    hasPublisherId: boolean;
    publisherIdKey?: string;
    publisherIdValue?: string;
    hasSubIdOrClickId: boolean;
    subIdValue?: string;
    hasNetworkTrackingParam: boolean;
    detectedTrackingParams: string[];
    details: string;
  };
  integrationReadiness: {
    requiresApiKey: boolean;
    apiKeyPresent: boolean;
    requiresApproval: boolean;
    accountApproved: boolean;
    webhookSupported: boolean;
    webhookConfigured: boolean;
    postbackSupported: boolean;
    postbackConfigured: boolean;
    canReceiveRealConversions: boolean;
    readinessStatus: "READY_TO_EARN" | "REQUIRES_CREDENTIALS" | "REQUIRES_POSTBACK" | "BLOCKED_OR_BROKEN";
    commissionCaptureMode: "DIRECT_AFFILIATE_PORTAL" | "AUTOMATED_API_SYNC" | "WEBHOOK_EVENT" | "BLOCKED";
    actionRequiredText: string;
  };
  realApprovedCommissionSar: number;
  realPendingCommissionSar: number;
  recordedClicksCount: number;
  earningsDestination: string;
  status: "REAL_ACTIVE" | "PENDING_CONFIG" | "BROKEN" | "UNCONFIGURED";
  summaryText: string;
  error?: string;
}

export interface ProfitabilityReport {
  overview: {
    totalStoresAnalyzed: number;
    readyToEarnStoresCount: number;
    requiresSetupStoresCount: number;
    realApprovedRevenueSar: number;
    realPendingRevenueSar: number;
    totalTrackedClicks: number;
    zeroFakeEarningsGuarantee: boolean;
    lastAuditedAt: string;
  };
  readyToEarnStores: LinkVerificationResult[];
  requiresTechSetupStores: LinkVerificationResult[];
  allStores: LinkVerificationResult[];
}

export const ProfitabilityAndLinkVerificationTab: React.FC = () => {
  const [data, setData] = useState<ProfitabilityReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [isScanningAll, setIsScanningAll] = useState(false);
  const [singleTestingId, setSingleTestingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreDetail, setSelectedStoreDetail] = useState<LinkVerificationResult | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/profitability-analysis");
      if (!res.ok) throw new Error("HTTP error " + res.status);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      console.error("Failed to load profitability analysis:", err);
      setFeedbackMsg({
        text: "تعذر جلب تقرير التحقق المباشر: " + (err.message || "خطأ غير معروف"),
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, []);

  const handleRunFullScan = async () => {
    if (isScanningAll) return;
    setIsScanningAll(true);
    setFeedbackMsg({
      text: "جاري فحص جميع الروابط وتتبع سلاسل التوجيه (Redirect Chains) حياً الآن...",
      type: "info"
    });

    try {
      const res = await adminFetch("/api/admin/merchants/verify-links", {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to scan links");
      await fetchAnalysis();
      setFeedbackMsg({
        text: "تم إكمال الفحص الحي لكافة الروابط وتحديث تقرير الربحية بنجاح!",
        type: "success"
      });
    } catch (err: any) {
      setFeedbackMsg({
        text: "فشل الفحص الشامل: " + err.message,
        type: "error"
      });
    } finally {
      setIsScanningAll(false);
    }
  };

  const handleTestSingleMerchant = async (merchantId: string) => {
    setSingleTestingId(merchantId);
    try {
      const res = await adminFetch(`/api/admin/merchants/${merchantId}/verify-link`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to test merchant");
      const json = await res.json();
      const updatedItem: LinkVerificationResult = json.result;

      // Update in state
      if (data) {
        const updatedAll = data.allStores.map((s) => (s.merchantId === merchantId ? updatedItem : s));
        const readyCount = updatedAll.filter(
          (s) => s.status === "REAL_ACTIVE" && s.integrationReadiness.readinessStatus === "READY_TO_EARN"
        ).length;
        const requiresCount = updatedAll.length - readyCount;

        setData({
          ...data,
          overview: {
            ...data.overview,
            readyToEarnStoresCount: readyCount,
            requiresSetupStoresCount: requiresCount,
            lastAuditedAt: new Date().toISOString()
          },
          allStores: updatedAll,
          readyToEarnStores: updatedAll.filter(
            (s) => s.status === "REAL_ACTIVE" && s.integrationReadiness.readinessStatus === "READY_TO_EARN"
          ),
          requiresTechSetupStores: updatedAll.filter(
            (s) => s.status !== "REAL_ACTIVE" || s.integrationReadiness.readinessStatus !== "READY_TO_EARN"
          )
        });
      }

      if (selectedStoreDetail && selectedStoreDetail.merchantId === merchantId) {
        setSelectedStoreDetail(updatedItem);
      }

      setFeedbackMsg({
        text: `تم فحص متجر ${updatedItem.arabicName || updatedItem.merchantName}: رمز HTTP ${updatedItem.httpStatus} (${updatedItem.status})`,
        type: updatedItem.status === "REAL_ACTIVE" ? "success" : "info"
      });
    } catch (err: any) {
      setFeedbackMsg({
        text: "فشل فحص المتجر: " + err.message,
        type: "error"
      });
    } finally {
      setSingleTestingId(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const stores = data?.allStores || [];

  const filteredStores = stores.filter((s) => {
    const matchesSearch =
      s.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.arabicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.network.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.slug.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "ALL") return true;
    if (filterStatus === "REAL_ACTIVE") return s.status === "REAL_ACTIVE";
    if (filterStatus === "PENDING_CONFIG") return s.status === "PENDING_CONFIG";
    if (filterStatus === "BROKEN") return s.status === "BROKEN";
    if (filterStatus === "READY_TO_EARN") return s.integrationReadiness.readinessStatus === "READY_TO_EARN";
    return true;
  });

  const realActiveCount = stores.filter((s) => s.status === "REAL_ACTIVE").length;
  const pendingCount = stores.filter((s) => s.status === "PENDING_CONFIG").length;
  const brokenCount = stores.filter((s) => s.status === "BROKEN").length;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header & Main Actions */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white">
              أداة التحقق الصارم من روابط الأفلييت وجدول تحليل الربحية الحقيقي
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
              فحص حي (Live HTTP Trace)
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-3xl">
            تقوم هذه الأداة باختبار الروابط فعلياً ومتابعة سلسلة التوجيه (Redirect Chain)، وتتأكد من وجود المعرّفات الحقيقية
            المعتمدة (مثل معرّف الحساب <span className="text-emerald-400 font-mono font-bold">a_aid=gx333hkq2rph5</span> الخاص بك)،
            مع فحص حالة الـ API والـ Webhook لكل متجر لبيان أي المتاجر جاهزة لتحويل العمولة فعلياً مع التزام صارم بـ{" "}
            <span className="text-emerald-300 font-bold">صفر بيانات أو أرباح وهمية</span>.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={fetchAnalysis}
            disabled={loading || isScanningAll}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
            title="تحديث البيانات المحفوظة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </button>

          <button
            onClick={handleRunFullScan}
            disabled={isScanningAll}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-60"
          >
            <Zap className={`w-4 h-4 fill-current ${isScanningAll ? "animate-spin" : ""}`} />
            {isScanningAll ? "جاري الفحص المباشر لكافة المتاجر..." : "إعادة الفحص الحي لجميع المتاجر"}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-all ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
              : feedbackMsg.type === "error"
              ? "bg-red-950/40 border-red-500/30 text-red-300"
              : "bg-blue-950/40 border-blue-500/30 text-blue-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMsg.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
            {feedbackMsg.type === "error" && <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />}
            {feedbackMsg.type === "info" && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Executive Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Real Active */}
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              متاجر نشطة ومفحوصة حقيقياً
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              REAL ACTIVE
            </span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {realActiveCount} <span className="text-xs text-slate-400 font-normal">متجراً</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            تم اختبار روابطها بـ HTTP 200/302 وتأكيد وجود معرّف الناشر المعتمد الخاص بك (a_aid=gx333hkq2rph5).
          </p>
        </div>

        {/* Card 2: Pending Config */}
        <div className="bg-slate-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-400"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              بانتظار إعداد المفاتيح
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              PENDING CONFIG
            </span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {pendingCount} <span className="text-xs text-slate-400 font-normal">متاجر</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            الروابط تعمل تقنياً لكنها تحتاج لإضافة معرّف الحساب أو الـ API Key في ملف البيئة (.env).
          </p>
        </div>

        {/* Card 3: Broken */}
        <div className="bg-slate-900/90 border border-red-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-red-500 to-rose-400"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-bold text-red-400 flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-red-400" />
              روابط غير صالحة أو معطلة
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
              BROKEN
            </span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {brokenCount} <span className="text-xs text-slate-400 font-normal">متاجر</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-tight">
            أرجعت خطأ HTTP (404/500) أو انتهت مهلة الاتصال بالخادم، وتحتاج تصحيح العنوان.
          </p>
        </div>

        {/* Card 4: Real Financial Integrity */}
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-3xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400"></div>
          <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
            <span className="font-bold text-blue-400 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-blue-400" />
              العمولات المعتمدة الحقيقية
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              REAL REVENUE
            </span>
          </div>
          <div className="text-3xl font-black text-white mb-1">
            {(data?.overview?.realApprovedRevenueSar || 0).toFixed(2)}{" "}
            <span className="text-xs text-slate-400 font-normal">ر.س</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold leading-tight flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            ضمان مالي صارم: صفر بيانات أو مبيعات وهمية.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              placeholder="ابحث باسم المتجر، أو الشبكة..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5" />
            <span>الحالة:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="ALL">جميع المتاجر ({stores.length})</option>
            <option value="REAL_ACTIVE">نشط ومفحوص (REAL ACTIVE) ({realActiveCount})</option>
            <option value="READY_TO_EARN">جاهز للربح الفوري</option>
            <option value="PENDING_CONFIG">بانتظار الإعداد (PENDING)</option>
            <option value="BROKEN">معطل (BROKEN)</option>
          </select>
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-3">
          <span>
            آخر تدقيق شامل:{" "}
            <span className="text-slate-300 font-mono">
              {data?.overview?.lastAuditedAt ? new Date(data.overview.lastAuditedAt).toLocaleTimeString("ar-SA") : "الآن"}
            </span>
          </span>
          <span className="text-slate-600">•</span>
          <span>
            المعروض: <span className="text-emerald-400 font-bold">{filteredStores.length}</span> من {stores.length}
          </span>
        </div>
      </div>

      {/* The Profitability & Readiness Analysis Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">
              جدول جاهزية المتاجر وتحليل استلام العمولات (Merchant Profitability & Readiness)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">
            اضغط على زر <span className="text-emerald-400 font-bold">فحص الآن</span> لأي متجر لاختبار الرابط لحظياً وتحديث نتائجه
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800 select-none">
              <tr>
                <th className="py-3.5 px-4">المتجر والفئة</th>
                <th className="py-3.5 px-3">شبكة الأفلييت</th>
                <th className="py-3.5 px-3">حالة الرابط الحقيقية</th>
                <th className="py-3.5 px-3">معرّف التتبع المعتمد</th>
                <th className="py-3.5 px-3">حالة الـ API والـ Webhook</th>
                <th className="py-3.5 px-3">جاهزية تحويل العمولة</th>
                <th className="py-3.5 px-3">أين تُصرف الأرباح؟</th>
                <th className="py-3.5 px-4 text-center">إجراءات الفحص والتتبع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    لا توجد متاجر مطابقة لمعايير البحث المحددة.
                  </td>
                </tr>
              ) : (
                filteredStores.map((store) => {
                  const isReal = store.status === "REAL_ACTIVE";
                  const isPending = store.status === "PENDING_CONFIG";
                  const isBroken = store.status === "BROKEN";
                  const isTesting = singleTestingId === store.merchantId;

                  return (
                    <tr
                      key={store.merchantId}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* Store & Category */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <LazyBrandLogo
                            logoText={store.merchantName.substring(0, 3)}
                            brandName={store.arabicName || store.merchantName}
                            size="sm"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{store.arabicName || store.merchantName}</span>
                              <span className="text-[10px] text-slate-500 font-mono">({store.slug})</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{store.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* Network */}
                      <td className="py-3.5 px-3">
                        <span className="font-semibold text-slate-200">{store.network}</span>
                      </td>

                      {/* Real Link Status */}
                      <td className="py-3.5 px-3">
                        {isReal ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              نشط (HTTP {store.httpStatus || 200})
                            </span>
                            {store.responseTimeMs > 0 && (
                              <span className="text-[10px] text-slate-500 font-mono">{store.responseTimeMs}ms</span>
                            )}
                          </div>
                        ) : isPending ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              بانتظار المعرف
                            </span>
                            {store.httpStatus > 0 && (
                              <span className="text-[10px] text-slate-500 font-mono">HTTP {store.httpStatus}</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                              <XCircle className="w-3 h-3 text-red-400" />
                              معطل (HTTP {store.httpStatus || "ERR"})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Tracking Param */}
                      <td className="py-3.5 px-3">
                        {store.trackingValidation.hasPublisherId ? (
                          <div className="space-y-0.5">
                            <span className="inline-block px-2 py-0.5 rounded bg-slate-950 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                              {store.trackingValidation.publisherIdKey}={store.trackingValidation.publisherIdValue}
                            </span>
                            {store.redirectHopsCount > 0 && (
                              <div className="text-[9px] text-slate-500">
                                سلسلة التحويل: {store.redirectHopsCount} قفزات (Hops)
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] text-amber-400/80 italic">
                            غير مدمج بحسابك
                          </span>
                        )}
                      </td>

                      {/* API & Webhook Technical Readiness */}
                      <td className="py-3.5 px-3">
                        <div className="space-y-1">
                          {store.network.toLowerCase().includes("linkaraby") ? (
                            <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                              <Server className="w-3 h-3 text-emerald-400" />
                              <span>Webhook معتمد + بوابة الناشر</span>
                            </div>
                          ) : store.network.toLowerCase().includes("amazon") ? (
                            <div className="flex items-center gap-1 text-[10px] text-amber-300">
                              <Server className="w-3 h-3 text-amber-400" />
                              <span>PA-API وتقارير بوابة أمازون</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-slate-400">
                              <Server className="w-3 h-3 text-slate-500" />
                              <span>تكامل API شبكة الشركاء</span>
                            </div>
                          )}
                          <div className="text-[9px] text-slate-500">
                            {store.integrationReadiness.actionRequiredText}
                          </div>
                        </div>
                      </td>

                      {/* Conversion Readiness Verdict */}
                      <td className="py-3.5 px-3">
                        {store.integrationReadiness.readinessStatus === "READY_TO_EARN" && isReal ? (
                          <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 inline-flex items-center gap-1">
                            <Zap className="w-3 h-3 fill-current" />
                            جاهز للربح الفوري
                          </span>
                        ) : store.integrationReadiness.readinessStatus === "REQUIRES_CREDENTIALS" ? (
                          <span className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-[10px] font-bold border border-amber-500/20 inline-flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            يتطلب إدخال مفتاح API
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            غير جاهز تقنياً
                          </span>
                        )}
                      </td>

                      {/* Earnings Destination */}
                      <td className="py-3.5 px-3">
                        <span className="text-[11px] text-slate-300 font-medium">
                          {store.earningsDestination}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleTestSingleMerchant(store.merchantId)}
                            disabled={isTesting}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold transition-all border border-slate-700 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="اختبار الرابط وسلسلة التحويل الآن"
                          >
                            <RefreshCw className={`w-3 h-3 ${isTesting ? "animate-spin text-emerald-400" : ""}`} />
                            {isTesting ? "جاري الفحص..." : "فحص الآن"}
                          </button>

                          <button
                            onClick={() => setSelectedStoreDetail(store)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 text-emerald-300 text-[10px] font-bold transition-all border border-emerald-800/50 flex items-center gap-1 cursor-pointer"
                            title="عرض سلسلة التحويل والمعلومات التقنية"
                          >
                            <Info className="w-3 h-3" />
                            تفاصيل التتبع
                          </button>

                          <a
                            href={`/go/${store.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="تجربة رابط التحويل /go/{slug}"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer / Modal for Technical Tracking Audit */}
      {selectedStoreDetail && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <LazyBrandLogo
                  logoText={selectedStoreDetail.merchantName.substring(0, 3)}
                  brandName={selectedStoreDetail.arabicName || selectedStoreDetail.merchantName}
                  size="md"
                />
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>{selectedStoreDetail.arabicName || selectedStoreDetail.merchantName}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedStoreDetail.status === "REAL_ACTIVE"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : selectedStoreDetail.status === "PENDING_CONFIG"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : "bg-red-500/20 text-red-300 border border-red-500/30"
                      }`}
                    >
                      {selectedStoreDetail.status}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    شبكة الأفلييت: <span className="text-emerald-400 font-bold">{selectedStoreDetail.network}</span> • الفئة: {selectedStoreDetail.category}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStoreDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">رمز استجابة HTTP</span>
                <span className="text-base font-black text-white">
                  {selectedStoreDetail.httpStatus || "N/A"}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">زمن الاستجابة</span>
                <span className="text-base font-black text-emerald-400">
                  {selectedStoreDetail.responseTimeMs} ms
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">قفزات التوجيه (Hops)</span>
                <span className="text-base font-black text-blue-400">
                  {selectedStoreDetail.redirectHopsCount}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-1">النقرات المسجلة</span>
                <span className="text-base font-black text-white">
                  {selectedStoreDetail.recordedClicksCount}
                </span>
              </div>
            </div>

            {/* Redirect Chain Inspection */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                سلسلة التوجيه الكاملة (Redirect Chain):
              </h4>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 font-mono text-[11px] text-slate-300 break-all">
                {selectedStoreDetail.redirectChain && selectedStoreDetail.redirectChain.length > 0 ? (
                  selectedStoreDetail.redirectChain.map((hop, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px] shrink-0 font-sans">
                        قفزة {idx}
                      </span>
                      <span className={idx === selectedStoreDetail.redirectChain.length - 1 ? "text-emerald-400 font-bold" : "text-slate-400"}>
                        {hop}
                      </span>
                    </div>
                  ))
                ) : (
                  <div>{selectedStoreDetail.targetAffiliateUrl}</div>
                )}
              </div>
            </div>

            {/* Tracking Parameters Verification */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                المعاملات المكتشفة وتأكيد معرّف الحساب:
              </h4>
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">معرّف الناشر/الحساب المعتمد:</span>
                  {selectedStoreDetail.trackingValidation.hasPublisherId ? (
                    <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedStoreDetail.trackingValidation.publisherIdKey} = {selectedStoreDetail.trackingValidation.publisherIdValue}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-bold">غير متوفر (يحتاج ربط)</span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400">تتبع النقرة الفريدة (SubID / ClickID):</span>
                  {selectedStoreDetail.trackingValidation.hasSubIdOrClickId ? (
                    <span className="text-blue-400 font-mono font-bold">مفعل ويُحقن ديناميكياً</span>
                  ) : (
                    <span className="text-slate-500">غير مفعل</span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  {selectedStoreDetail.trackingValidation.details}
                </div>
              </div>
            </div>

            {/* Financial Destination & Actions */}
            <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-4 text-xs space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">الجهة المستقبلة للعمولة:</span>
                <span className="text-emerald-300 font-bold">
                  {selectedStoreDetail.earningsDestination}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">الإجراء المطلوب لتفعيل الأرباح:</span>
                <span className="text-slate-200">
                  {selectedStoreDetail.integrationReadiness.actionRequiredText}
                </span>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() =>
                  copyToClipboard(
                    `${window.location.origin}/go/${selectedStoreDetail.slug}`,
                    selectedStoreDetail.merchantId
                  )
                }
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedUrl === selectedStoreDetail.merchantId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    تم نسخ الرابط
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    نسخ رابط التحويل المباشر
                  </>
                )}
              </button>

              <button
                onClick={() => handleTestSingleMerchant(selectedStoreDetail.merchantId)}
                disabled={singleTestingId === selectedStoreDetail.merchantId}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    singleTestingId === selectedStoreDetail.merchantId ? "animate-spin" : ""
                  }`}
                />
                إعادة اختبار الرابط الآن
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
