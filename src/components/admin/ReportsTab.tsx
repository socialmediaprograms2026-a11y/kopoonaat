import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  BarChart3,
  DollarSign,
  MousePointerClick,
  Percent,
  RefreshCw,
  Calendar,
  Layers,
  Store,
  Package,
  Globe
} from "lucide-react";
import { adminFetch } from "../../utils/apiClient";

interface ReportItem {
  key: string;
  name: string;
  clicks: number;
  conversions: number;
  conversionRate: number;
  totalOrderValue: number;
  commissionAmount: number;
  pendingCommission: number;
  approvedCommission: number;
}

export const ReportsTab: React.FC = () => {
  const [groupBy, setGroupBy] = useState<"network" | "merchant" | "product">("network");
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch(`/api/admin/reports?groupBy=${groupBy}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (e) {
      console.error("Failed to load reports:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [groupBy]);

  const totalClicks = reports.reduce((acc, r) => acc + r.clicks, 0);
  const totalConversions = reports.reduce((acc, r) => acc + r.conversions, 0);
  const totalCommission = reports.reduce((acc, r) => acc + r.commissionAmount, 0);
  const overallRate = totalClicks > 0 ? ((totalConversions / totalClicks) * 100).toFixed(2) : "0.00";

  return (
    <div className="space-y-6">
      {/* Top Controls & Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
            تقارير الأداء المالي والتحويلات
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            تحليل دقيق لمعدل التحويل (CVR)، النقرات، العمولات المقبولة والمعلقة لكل مصدر.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              onClick={() => setGroupBy("network")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                groupBy === "network" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              حسب الشبكة
            </button>
            <button
              onClick={() => setGroupBy("merchant")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                groupBy === "merchant" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              حسب المتجر
            </button>
            <button
              onClick={() => setGroupBy("product")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                groupBy === "product" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              حسب المنتج
            </button>
          </div>

          <button
            onClick={fetchReports}
            disabled={isLoading}
            className="p-2 bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl transition-all"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">إجمالي النقرات</span>
            <MousePointerClick className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalClicks.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">تتبع دقيق عبر subId و UTM</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">التحويلات المؤكدة</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">{totalConversions.toLocaleString()}</div>
          <div className="text-xs text-slate-500 mt-1">من خلال الـ Webhooks والـ Postback</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">معدل التحويل (CVR)</span>
            <Percent className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{overallRate}%</div>
          <div className="text-xs text-slate-500 mt-1">نسبة التحويل من إجمالي النقرات</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">إجمالي العمولات</span>
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-700">{totalCommission.toLocaleString()} ريال</div>
          <div className="text-xs text-slate-500 mt-1">المعلقة والمقبولة للمدفوعات</div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">
            تفاصيل الأداء {groupBy === "network" ? "بشبكات الأفلييت" : groupBy === "merchant" ? "بالمتاجر الشريكة" : "بالمنتجات المعروضة"}
          </h3>
          <span className="text-xs text-slate-500 font-medium">{reports.length} عنصر</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/60">
              <tr>
                <th className="p-4">العنصر / المصدر</th>
                <th className="p-4 text-center">النقرات</th>
                <th className="p-4 text-center">التحويلات</th>
                <th className="p-4 text-center">معدل التحويل (CVR)</th>
                <th className="p-4 text-center">قيمة المبيعات</th>
                <th className="p-4 text-center">العمولة المقبولة</th>
                <th className="p-4 text-center">العمولة المعلقة</th>
                <th className="p-4 text-left">إجمالي العمولة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    جاري تحميل تقارير الأداء...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد بيانات حركة مرور مسجلة بعد في هذا التصنيف.
                  </td>
                </tr>
              ) : (
                reports.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900">{item.name}</td>
                    <td className="p-4 text-center font-medium text-slate-700">{item.clicks}</td>
                    <td className="p-4 text-center font-bold text-emerald-600">{item.conversions}</td>
                    <td className="p-4 text-center">
                      <span className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold">
                        {item.conversionRate}%
                      </span>
                    </td>
                    <td className="p-4 text-center text-slate-600">{item.totalOrderValue.toLocaleString()} ريال</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">{item.approvedCommission.toLocaleString()} ريال</td>
                    <td className="p-4 text-center text-amber-600 font-medium">{item.pendingCommission.toLocaleString()} ريال</td>
                    <td className="p-4 text-left font-black text-slate-900">{item.commissionAmount.toLocaleString()} ريال</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
