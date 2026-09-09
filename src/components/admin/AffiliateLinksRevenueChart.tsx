import React, { useState, useMemo } from "react";
import {
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Clock,
  DollarSign,
  MousePointerClick,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Link2
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

export interface AffiliateLinkMetric {
  merchantId: string;
  merchantName: string;
  network: string;
  affiliateUrl: string;
  clicks: number;
  conversions: number;
  conversionRate: string;
  salesSar: number;
  approvedCommissionSar: number;
  pendingCommissionSar: number;
  totalCommissionSar: number;
  color: string;
}

export interface RevenueDailyHistoryItem {
  date: string;
  sales: number;
  approvedCommission: number;
  pendingCommission: number;
  totalRevenue?: number;
  conversions: number;
  clicks: number;
  [key: string]: any; // dynamic merchant keys
}

interface AffiliateLinksRevenueChartProps {
  history?: RevenueDailyHistoryItem[];
  networkBreakdown?: any[];
  linksMetrics?: AffiliateLinkMetric[];
  timeRangeDays?: number;
  onTimeRangeChange?: (days: number) => void;
}

const MERCHANT_COLOR_PALETTE: Record<string, string> = {
  m_linkaraby_main: "#10b981", // Emerald
  m_bshti: "#8b5cf6",          // Purple
  m_maysan_it: "#06b6d4",      // Cyan
  m_the_right_way: "#f59e0b",  // Amber
  m_kagad441: "#ec4899",       // Pink
  m_rahma_store: "#3b82f6",    // Blue
  m_amazon_sa: "#f97316",      // Orange
  m_noon: "#eab308",           // Yellow
  m_aliexpress: "#ef4444"      // Red
};

export const AffiliateLinksRevenueChart: React.FC<AffiliateLinksRevenueChartProps> = ({
  history = [],
  networkBreakdown = [],
  linksMetrics = [],
  timeRangeDays = 30,
  onTimeRangeChange
}) => {
  const [timeframeMode, setTimeframeMode] = useState<"daily" | "weekly">("daily");
  const [chartVisualType, setChartVisualType] = useState<"area" | "bar" | "line">("area");
  const [metricMetricView, setMetricMetricView] = useState<"commission" | "sales" | "clicks">("commission");
  const [selectedMerchantFilter, setSelectedMerchantFilter] = useState<string>("ALL");

  // Format and group data by Daily or Weekly
  const formattedChartData = useMemo(() => {
    if (!history || history.length === 0) return [];

    if (timeframeMode === "daily") {
      return history.map((item) => {
        const totalComm = (item.approvedCommission || 0) + (item.pendingCommission || 0);
        return {
          ...item,
          totalRevenue: item.totalRevenue ?? (item.approvedCommission || 0),
          totalCommission: totalComm,
          displayDate: item.date?.substring(5) || item.date // MM-DD
        };
      });
    }

    // Weekly Grouping
    const weeks: Record<string, any> = {};
    history.forEach((item, index) => {
      const weekIndex = Math.floor(index / 7);
      const weekKey = `الأسبوع ${weekIndex + 1}`;
      if (!weeks[weekKey]) {
        weeks[weekKey] = {
          date: weekKey,
          displayDate: weekKey,
          sales: 0,
          approvedCommission: 0,
          pendingCommission: 0,
          totalRevenue: 0,
          totalCommission: 0,
          conversions: 0,
          clicks: 0
        };
      }
      weeks[weekKey].sales += item.sales || 0;
      weeks[weekKey].approvedCommission += item.approvedCommission || 0;
      weeks[weekKey].pendingCommission += item.pendingCommission || 0;
      weeks[weekKey].totalRevenue += item.approvedCommission || 0;
      weeks[weekKey].totalCommission += (item.approvedCommission || 0) + (item.pendingCommission || 0);
      weeks[weekKey].conversions += item.conversions || 0;
      weeks[weekKey].clicks += item.clicks || 0;
    });

    return Object.values(weeks).map((w: any) => ({
      ...w,
      sales: Math.round(w.sales * 100) / 100,
      approvedCommission: Math.round(w.approvedCommission * 100) / 100,
      pendingCommission: Math.round(w.pendingCommission * 100) / 100,
      totalCommission: Math.round(w.totalCommission * 100) / 100,
      totalRevenue: Math.round(w.totalRevenue * 100) / 100
    }));
  }, [history, timeframeMode]);

  // Aggregate Totals for active view
  const totals = useMemo(() => {
    return formattedChartData.reduce(
      (acc, curr) => {
        acc.sales += curr.sales || 0;
        acc.approved += curr.approvedCommission || 0;
        acc.pending += curr.pendingCommission || 0;
        acc.clicks += curr.clicks || 0;
        acc.conversions += curr.conversions || 0;
        return acc;
      },
      { sales: 0, approved: 0, pending: 0, clicks: 0, conversions: 0 }
    );
  }, [formattedChartData]);

  const totalCommissions = totals.approved + totals.pending;

  return (
    <div id="affiliate-links-revenue-chart-card" className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                تطور أرباح وعمولات الروابط المضافة
                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                  تفاعلي Recharts
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                مراقبة نمو العمولات المعتمدة والمعلقة وتطور المبيعات اليومية والأسبوعية لروابط التتبع
              </p>
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Daily vs Weekly Toggle */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              id="timeframe-daily-btn"
              onClick={() => setTimeframeMode("daily")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                timeframeMode === "daily"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              يومي (Daily)
            </button>
            <button
              id="timeframe-weekly-btn"
              onClick={() => setTimeframeMode("weekly")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                timeframeMode === "weekly"
                  ? "bg-emerald-500 text-slate-950 font-black shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              أسبوعي (Weekly)
            </button>
          </div>

          {/* Chart Type (Area, Bar, Line) */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              id="chart-type-area-btn"
              onClick={() => setChartVisualType("area")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                chartVisualType === "area"
                  ? "bg-slate-800 text-emerald-400 font-bold border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
              title="مساحي"
            >
              مساحي
            </button>
            <button
              id="chart-type-bar-btn"
              onClick={() => setChartVisualType("bar")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                chartVisualType === "bar"
                  ? "bg-slate-800 text-emerald-400 font-bold border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
              title="أعمدة"
            >
              أعمدة
            </button>
            <button
              id="chart-type-line-btn"
              onClick={() => setChartVisualType("line")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                chartVisualType === "line"
                  ? "bg-slate-800 text-emerald-400 font-bold border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
              title="خطي"
            >
              خطي
            </button>
          </div>

          {/* Metric Selector (Commissions vs Sales vs Clicks) */}
          <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setMetricMetricView("commission")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                metricMetricView === "commission"
                  ? "bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              العمولات
            </button>
            <button
              onClick={() => setMetricMetricView("sales")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                metricMetricView === "sales"
                  ? "bg-teal-500/20 text-teal-300 font-bold border border-teal-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              المبيعات
            </button>
            <button
              onClick={() => setMetricMetricView("clicks")}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                metricMetricView === "clicks"
                  ? "bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              النقرات
            </button>
          </div>

          {/* Time Range Filter (7d, 30d, 90d) */}
          {onTimeRangeChange && (
            <div className="inline-flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
              {[
                { label: "7 أيام", days: 7 },
                { label: "30 يوم", days: 30 },
                { label: "90 يوم", days: 90 }
              ].map((t) => (
                <button
                  key={t.days}
                  onClick={() => onTimeRangeChange(t.days)}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all ${
                    timeRangeDays === t.days
                      ? "bg-emerald-500 text-slate-950"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. Mini KPI Highlights Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>العمولات المعتمدة</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-lg font-black text-emerald-400">
            {totals.approved.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            <span className="text-[10px] text-slate-400 mr-1">ر.س</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">جاهزة للتحويل الفوري</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>العمولات المعلقة</span>
            <Clock className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-lg font-black text-amber-400">
            {totals.pending.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            <span className="text-[10px] text-slate-400 mr-1">ر.س</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">بانتظار تأكيد الشبكة</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>إجمالي المبيعات</span>
            <DollarSign className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-lg font-black text-teal-300">
            {totals.sales.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            <span className="text-[10px] text-slate-400 mr-1">ر.س</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">قيمة سلات الشراء</div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>النقرات / التحويلات</span>
            <MousePointerClick className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-lg font-black text-white flex items-center gap-1.5">
            <span>{totals.clicks.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-bold">({totals.conversions} طلب)</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            معدل التحويل: {totals.clicks > 0 ? ((totals.conversions / totals.clicks) * 100).toFixed(2) : "0.00"}%
          </div>
        </div>
      </div>

      {/* 3. The Interactive Recharts Canvas */}
      <div className="h-80 w-full pt-2">
        {formattedChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            {chartVisualType === "area" ? (
              <AreaChart data={formattedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="commApprovedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="commPendingGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  unit={metricMetricView === "clicks" ? " نقرة" : " ر.س"}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "14px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    direction: "rtl",
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
                  }}
                  formatter={(value: any, name: any) => [
                    metricMetricView === "clicks"
                      ? `${value} نقرة`
                      : `${Number(value || 0).toFixed(2)} ر.س`,
                    name === "approvedCommission"
                      ? "عمولة معتمدة (Approved)"
                      : name === "pendingCommission"
                      ? "عمولة معلقة (Pending)"
                      : name === "totalCommission"
                      ? "إجمالي العمولات"
                      : name === "sales"
                      ? "إجمالي المبيعات"
                      : name === "clicks"
                      ? "النقرات"
                      : name
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  formatter={(value) =>
                    value === "approvedCommission"
                      ? "العمولة المعتمدة (Approved SAR)"
                      : value === "pendingCommission"
                      ? "العمولة المعلقة (Pending SAR)"
                      : value === "totalCommission"
                      ? "مجموع العمولات المتولدة (SAR)"
                      : value === "sales"
                      ? "إجمالي المبيعات (Sales SAR)"
                      : value === "clicks"
                      ? "النقرات المسجلة"
                      : value
                  }
                />

                {metricMetricView === "commission" && (
                  <>
                    <Area
                      type="monotone"
                      dataKey="approvedCommission"
                      name="approvedCommission"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#commApprovedGrad)"
                    />
                    <Area
                      type="monotone"
                      dataKey="pendingCommission"
                      name="pendingCommission"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#commPendingGrad)"
                    />
                  </>
                )}

                {metricMetricView === "sales" && (
                  <Area
                    type="monotone"
                    dataKey="sales"
                    name="sales"
                    stroke="#06b6d4"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                )}

                {metricMetricView === "clicks" && (
                  <Area
                    type="monotone"
                    dataKey="clicks"
                    name="clicks"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#salesGrad)"
                  />
                )}
              </AreaChart>
            ) : chartVisualType === "bar" ? (
              <BarChart data={formattedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  unit={metricMetricView === "clicks" ? " نقرة" : " ر.س"}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "14px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    direction: "rtl"
                  }}
                  formatter={(value: any, name: any) => [
                    metricMetricView === "clicks"
                      ? `${value} نقرة`
                      : `${Number(value || 0).toFixed(2)} ر.س`,
                    name === "approvedCommission"
                      ? "عمولة معتمدة"
                      : name === "pendingCommission"
                      ? "عمولة معلقة"
                      : name === "sales"
                      ? "مبيعات"
                      : name
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  formatter={(value) =>
                    value === "approvedCommission"
                      ? "العمولة المعتمدة (Approved)"
                      : value === "pendingCommission"
                      ? "العمولة المعلقة (Pending)"
                      : value === "sales"
                      ? "المبيعات"
                      : value
                  }
                />
                {metricMetricView === "commission" ? (
                  <>
                    <Bar dataKey="approvedCommission" name="approvedCommission" fill="#10b981" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="pendingCommission" name="pendingCommission" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                  </>
                ) : metricMetricView === "sales" ? (
                  <Bar dataKey="sales" name="sales" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                ) : (
                  <Bar dataKey="clicks" name="clicks" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                )}
              </BarChart>
            ) : (
              <LineChart data={formattedChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  unit={metricMetricView === "clicks" ? " نقرة" : " ر.س"}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#020617",
                    borderColor: "#334155",
                    borderRadius: "14px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    direction: "rtl"
                  }}
                  formatter={(value: any, name: any) => [
                    metricMetricView === "clicks"
                      ? `${value} نقرة`
                      : `${Number(value || 0).toFixed(2)} ر.س`,
                    name === "approvedCommission"
                      ? "عمولة معتمدة"
                      : name === "pendingCommission"
                      ? "عمولة معلقة"
                      : name === "sales"
                      ? "مبيعات"
                      : name
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
                  formatter={(value) =>
                    value === "approvedCommission"
                      ? "العمولة المعتمدة"
                      : value === "pendingCommission"
                      ? "العمولة المعلقة"
                      : value === "sales"
                      ? "المبيعات"
                      : value
                  }
                />
                {metricMetricView === "commission" ? (
                  <>
                    <Line
                      type="monotone"
                      dataKey="approvedCommission"
                      name="approvedCommission"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10b981" }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="pendingCommission"
                      name="pendingCommission"
                      stroke="#f59e0b"
                      strokeWidth={2.5}
                      strokeDasharray="4 4"
                      dot={{ r: 3, fill: "#f59e0b" }}
                    />
                  </>
                ) : metricMetricView === "sales" ? (
                  <Line
                    type="monotone"
                    dataKey="sales"
                    name="sales"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#06b6d4" }}
                  />
                ) : (
                  <Line
                    type="monotone"
                    dataKey="clicks"
                    name="clicks"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                  />
                )}
              </LineChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-xs">
            لا توجد بيانات تتبع مسجلة في هذا النطاق الزمني
          </div>
        )}
      </div>

      {/* 4. Added Affiliate Links Performance Table */}
      {linksMetrics && linksMetrics.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <Link2 className="w-4 h-4 text-emerald-400" />
              تفصيل أداء الروابط المضافة حسب المتجر والشبكة
            </h4>
            <span className="text-[11px] text-slate-400">
              {linksMetrics.length} رابط تتبع نشط
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
            <table className="w-full text-right text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">المتجر والرابط</th>
                  <th className="px-3 py-3">الشبكة</th>
                  <th className="px-3 py-3 text-center">النقرات</th>
                  <th className="px-3 py-3 text-center">الطلبات</th>
                  <th className="px-3 py-3 text-center">معدل التحويل</th>
                  <th className="px-3 py-3 text-center">المبيعات (SAR)</th>
                  <th className="px-3 py-3 text-center">عمولة معلقة</th>
                  <th className="px-3 py-3 text-center">عمولة معتمدة</th>
                  <th className="px-4 py-3 text-left">إجمالي العمولة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 bg-slate-900/40">
                {linksMetrics.map((lm, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: lm.color || "#10b981" }}
                        />
                        <div>
                          <div className="font-bold text-white text-xs">{lm.merchantName}</div>
                          <div className="text-[10px] text-slate-400 max-w-xs truncate font-mono" dir="ltr">
                            {lm.affiliateUrl}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-semibold border border-slate-700">
                        {lm.network}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-200">
                      {lm.clicks.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-emerald-400">
                      {lm.conversions.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span className="px-1.5 py-0.5 bg-emerald-500/10 text-emerald-300 rounded text-[10px] font-bold">
                        {lm.conversionRate}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-teal-300">
                      {lm.salesSar.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3 text-center font-semibold text-amber-400">
                      {lm.pendingCommissionSar.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-emerald-400">
                      {lm.approvedCommissionSar.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-left font-black text-white">
                      {lm.totalCommissionSar.toLocaleString("en-US", { minimumFractionDigits: 2 })} ر.س
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
