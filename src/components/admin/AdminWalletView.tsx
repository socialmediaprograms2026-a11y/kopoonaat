import React, { useState, useEffect } from "react";
import {
  Wallet,
  Coins,
  Copy,
  Check,
  ExternalLink,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  Clock,
  RefreshCw,
  Zap,
  DollarSign,
  Activity,
  Layers,
  ArrowDownLeft,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area
} from "recharts";
import { adminFetch } from "../../utils/apiClient";

interface PayoutConfig {
  method: string;
  walletAddress?: string;
  walletNetwork?: string;
  walletExchange?: string;
  accountIdentifier: string;
  status: string;
}

interface RevenueHistoryPoint {
  date: string;
  sales: number;
  approvedCommission: number;
  pendingCommission: number;
  totalRevenue?: number;
}

export const AdminWalletView: React.FC = () => {
  const [payoutConfig, setPayoutConfig] = useState<PayoutConfig | null>(null);
  const [payoutTransactions, setPayoutTransactions] = useState<any[]>([]);
  const [revenueHistory, setRevenueHistory] = useState<RevenueHistoryPoint[]>([]);
  const [revenueSummary, setRevenueSummary] = useState<any>(null);
  const [networkBreakdown, setNetworkBreakdown] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [timeRangeDays, setTimeRangeDays] = useState<number>(30);
  const [chartType, setChartType] = useState<"line" | "area">("line");
  const [isSimulatingPayout, setIsSimulatingPayout] = useState(false);
  const [simulationSuccess, setSimulationSuccess] = useState<string | null>(null);

  const fetchWalletData = async () => {
    setIsLoading(true);
    try {
      const [payoutRes, revRes] = await Promise.all([
        adminFetch("/api/admin/payout/config").then((r) => r.json()),
        adminFetch(`/api/admin/affiliate/revenue?days=${timeRangeDays}`).then((r) => r.json())
      ]);

      if (payoutRes) {
        setPayoutConfig(payoutRes.destination || null);
        setPayoutTransactions(payoutRes.transactions || []);
      }

      if (revRes) {
        setRevenueHistory(revRes.history || []);
        setRevenueSummary(revRes.summary || null);
        setNetworkBreakdown(revRes.networkBreakdown || []);
      }
    } catch (err) {
      console.error("Failed to load admin wallet data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [timeRangeDays]);

  const activeAddress = payoutConfig?.walletAddress || "0xddeae422ae06b08122d4f44510a7b99410ac3d19";
  const activeNetwork = payoutConfig?.walletNetwork || "BEP20 (BNB Smart Chain)";
  const activeExchange = payoutConfig?.walletExchange || "Binance (بينانس)";

  const handleCopy = () => {
    navigator.clipboard.writeText(activeAddress);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSimulatePayout = async () => {
    setIsSimulatingPayout(true);
    setSimulationSuccess(null);
    try {
      const res = await adminFetch("/api/admin/payout/test-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountSar: 150 })
      });
      const data = await res.json();
      if (res.ok) {
        setSimulationSuccess(data.message || "تم تسجيل عملية إيداع أرباح تجريبية بقيمة 150 ر.س (40.00 USDT) بنجاح!");
        await fetchWalletData();
        setTimeout(() => setSimulationSuccess(null), 6000);
      }
    } catch (e: any) {
      console.error("Simulation failed:", e);
    } finally {
      setIsSimulatingPayout(false);
    }
  };

  // Compute total approved & estimated revenue in SAR & USDT (clean real-time starting from zero)
  const totalApprovedSar = revenueSummary?.approvedCommission || 0;
  const totalPendingSar = revenueSummary?.pendingCommission || 0;
  const totalSalesSar = revenueSummary?.totalTrackedSales || 0;
  const totalUsdtEquivalent = (totalApprovedSar / 3.75).toFixed(2);

  // Format line chart data with revenue labels (strictly reflect actual history)
  const formattedChartData = revenueHistory.map((item) => ({
    ...item,
    totalRevenue: item.approvedCommission + (item.pendingCommission || 0)
  }));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">
                محفظة الإيرادات وعوائد التسويق (Admin Revenue Wallet)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                Live Status
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              مراقبة السيولة المتجمعة من جميع شبكات الأفلييت وعنوان استقبال الأرباح في بينانس
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchWalletData}
            disabled={isLoading}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-amber-400" : ""}`} />
            تحديث البيانات
          </button>
          <button
            onClick={handleSimulatePayout}
            disabled={isSimulatingPayout}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            title="فحص قناة التحويل وتسجيل اختبار سلامة الاتصال مع محفظة بينانس"
          >
            <Zap className="w-3.5 h-3.5" />
            {isSimulatingPayout ? "جاري الفحص..." : "اختبار قناة التحويل لمحفظة بينانس"}
          </button>
        </div>
      </div>

      {simulationSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{simulationSuccess}</span>
        </div>
      )}

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Approved Revenue in SAR */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">إجمالي العمولات المعتمدة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {totalApprovedSar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-emerald-400 font-sans font-bold">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            جاهزة للتسوية والتحويل
          </div>
        </div>

        {/* Crypto Equivalent in USDT */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 rounded-2xl p-5 relative overflow-hidden shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">المكافئ الرقمي (USDT)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
            ${totalUsdtEquivalent} <span className="text-xs text-amber-400 font-sans font-bold">USDT</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>سعر الصرف: <strong>1 USD = 3.75 SAR</strong></span>
          </div>
        </div>

        {/* Pending Commissions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">عمولات قيد التأكيد (Pending)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-200 font-mono tracking-tight">
            {totalPendingSar.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-slate-400 font-sans font-bold">ر.س</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
            <span>فترة الاعتماد: <strong>14 - 30 يوم</strong></span>
          </div>
        </div>

        {/* Connected Networks Count */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">الشبكات التابعة النشطة</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono tracking-tight">
            {networkBreakdown.length > 0 ? networkBreakdown.length : "1"} <span className="text-xs text-teal-400 font-sans font-bold">شبكة</span>
          </div>
          <div className="mt-2 text-[11px] text-teal-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            {networkBreakdown.length > 0 ? "شبكات مزامنة نشطة" : "LinkAraby (شبكة الشريك النشطة)"}
          </div>
        </div>
      </div>

      {/* 3. Binance Wallet Status & Details Panel */}
      <div className="bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                حالة محفظة بينانس (Binance Wallet Status)
              </h3>
              <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                نشطة ومتصلة لاستقبال الأرباح
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
              تم تكوين وتثبيت عنوان محفظتك الرسمي على منصة بينانس لاستقبال التحويلات التلقائية المعتمدة بالدولار الرقمي المستقر (USDT) عبر شبكة BNB Smart Chain (BEP20).
            </p>

            {/* Address Box */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 shrink-0 font-bold">
                <Coins className="w-4 h-4 text-amber-400" />
                <span>العنوان:</span>
              </div>
              <div className="flex-1 font-mono text-xs sm:text-sm text-amber-300 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-700/60 overflow-x-auto text-left select-all tracking-wider">
                {activeAddress}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://bscscan.com/address/${activeAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="عرض على BscScan Explorer"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 lg:w-72 shrink-0">
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block font-bold">المنصة المعتمدة</span>
              <span className="text-xs font-black text-white">{activeExchange}</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block font-bold">شبكة التحويل</span>
              <span className="text-xs font-black text-amber-400">BEP20 / ERC20</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block font-bold">العملة المستلمة</span>
              <span className="text-xs font-black text-emerald-400">USDT / SAR</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl text-right">
              <span className="text-[10px] text-slate-400 block font-bold">الحد الأدنى للسحب</span>
              <span className="text-xs font-black text-teal-400">100 ر.س</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Total Revenue Line Chart Across All Networks */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              الرسم البياني التراكمي لإيرادات الشبكات التابعة (Total Revenue Trend)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              مخطط بياني خطي يوضح نمو العمولات المعتمدة والمعلقة عبر جميع الشبكات المتصلة (SAR)
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setChartType("line")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  chartType === "line"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                خطي (Line)
              </button>
              <button
                onClick={() => setChartType("area")}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  chartType === "area"
                    ? "bg-emerald-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                مساحي (Area)
              </button>
            </div>

            {/* Time Range Filter */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              {[
                { label: "7 أيام", days: 7 },
                { label: "30 يوم", days: 30 },
                { label: "90 يوم", days: 90 }
              ].map((t) => (
                <button
                  key={t.days}
                  onClick={() => setTimeRangeDays(t.days)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                    timeRangeDays === t.days
                      ? "bg-amber-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recharts Line/Area Container */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "line" ? (
              <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" ر.س" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    direction: "rtl"
                  }}
                  formatter={(value: any, name: any) => [
                    `${Number(value).toFixed(2)} ر.س`,
                    name === "approvedCommission"
                      ? "عمولة معتمدة"
                      : name === "pendingCommission"
                      ? "عمولة معلقة"
                      : name === "totalRevenue"
                      ? "إجمالي الإيرادات"
                      : "المبيعات"
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
                  formatter={(value) =>
                    value === "approvedCommission"
                      ? "العمولات المعتمدة (SAR)"
                      : value === "pendingCommission"
                      ? "العمولات المعلقة (SAR)"
                      : value === "totalRevenue"
                      ? "إجمالي الإيرادات المحصلة (SAR)"
                      : value
                  }
                />
                <Line
                  type="monotone"
                  dataKey="totalRevenue"
                  name="totalRevenue"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#f59e0b" }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="approvedCommission"
                  name="approvedCommission"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 3, fill: "#10b981" }}
                />
                <Line
                  type="monotone"
                  dataKey="pendingCommission"
                  name="pendingCommission"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            ) : (
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="approvedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="totalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.4} />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit=" ر.س" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    direction: "rtl"
                  }}
                  formatter={(value: any, name: any) => [
                    `${Number(value).toFixed(2)} ر.س`,
                    name === "totalRevenue"
                      ? "إجمالي الإيرادات"
                      : name === "approvedCommission"
                      ? "عمولة معتمدة"
                      : "عمولة معلقة"
                  ]}
                />
                <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }} />
                <Area
                  type="monotone"
                  dataKey="totalRevenue"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#totalGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="approvedCommission"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#approvedGrad)"
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 5. Connected Networks Breakdown Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-400" />
          توزيع الإيرادات حسب الشبكات المتصلة (Connected Networks Breakdown)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {networkBreakdown.length > 0 ? (
            networkBreakdown.map((net: any, idx: number) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4.5 hover:border-amber-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-white">{net.network}</span>
                    <span className="text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      {net.conversionsCount || 0} تحويل
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">إجمالي المبيعات:</span>
                      <span className="font-mono font-bold text-white">{(net.sales || 0).toLocaleString()} ر.س</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">العمولة المعتمدة:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {(net.approvedCommission || 0).toLocaleString()} ر.س
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">العمولة المعلقة:</span>
                      <span className="font-mono text-amber-400">{(net.pendingCommission || 0).toLocaleString()} ر.س</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>المكافئ الرقمي:</span>
                  <span className="font-mono font-bold text-amber-300">
                    ${((net.approvedCommission || 0) / 3.75).toFixed(2)} USDT
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-8 text-center text-slate-500 text-xs bg-slate-950/60 rounded-2xl border border-slate-800/80">
              لا توجد مبيعات متزامنة بعد. تظهر الشبكات تلقائياً فور تسجيل أول طلب شراء عبر روابطك.
            </div>
          )}
        </div>
      </div>

      {/* 6. Recent Payout Activity Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              سجل التحويلات الأخيرة إلى محفظة بينانس
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              توثيق عمليات تحويل الأرباح بالريال السعودي والدولار الرقمي مع التجزئة الرقمية (TxHash)
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">تاريخ التحويل</th>
                <th className="px-4 py-3">المبلغ (SAR)</th>
                <th className="px-4 py-3">المكافئ (USDT)</th>
                <th className="px-4 py-3">الوجهة والشبكة</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">كود البلوكشين (TxHash)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {payoutTransactions.length > 0 ? (
                payoutTransactions.map((tx: any) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400">
                      {new Date(tx.initiatedAt).toLocaleDateString("ar-SA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3 font-bold text-emerald-400 font-mono">
                      {Number(tx.amountSar).toFixed(2)} ر.س
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-400 font-mono">
                      {tx.amountCryptoUsdt ? `${Number(tx.amountCryptoUsdt).toFixed(2)} USDT` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px] font-bold">
                        {tx.exchange || "Binance"} • {tx.destinationNetwork || "BEP20"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full text-[10px] font-bold">
                        {tx.status === "CONFIRMED_ON_CHAIN" ? "مؤكد على البلوكشين" : tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11px] text-amber-400/80 max-w-xs truncate">
                      {tx.txHash ? `${tx.txHash.substring(0, 18)}...` : "—"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    لا توجد تحويلات مالية سابقة حتى الآن. يتم التحويل التلقائي لمحفظة بينانس المعتمدة وتوثيق العملية هنا مع كود البلوكشين (TxHash) فور اعتماد أرباحك وبلوغ الحد الأدنى 100 ر.س.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
