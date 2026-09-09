import React, { useState, useEffect } from "react";
import { 
  getStoreProfitabilityAnalysis, 
  StoreProfitabilityMetric,
  clearTrackedClicksStorage
} from "../../utils/affiliateTracker";
import { 
  TrendingUp, 
  MousePointerClick, 
  Copy, 
  DollarSign, 
  Sparkles, 
  RotateCcw, 
  ExternalLink,
  Award,
  CheckCircle2,
  BarChart2
} from "lucide-react";

export const MostProfitableStoresCard: React.FC = () => {
  const [analysis, setAnalysis] = useState<{
    stores: StoreProfitabilityMetric[];
    totalClicksAllTime: number;
    totalEstimatedEarningsSar: number;
    mostProfitableStore: StoreProfitabilityMetric | null;
  }>({
    stores: [],
    totalClicksAllTime: 0,
    totalEstimatedEarningsSar: 0,
    mostProfitableStore: null
  });

  const loadData = () => {
    const res = getStoreProfitabilityAnalysis();
    setAnalysis(res);
  };

  useEffect(() => {
    loadData();
    // Refresh periodically or on focus
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في إعادة ضبط إحصائيات النقرات المحلية؟")) {
      clearTrackedClicksStorage();
      loadData();
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl text-right">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingUp className="w-4 h-4" />
            </span>
            <h3 className="text-base font-black text-white">
              المتاجر الأكثر ربحية ونقراً (Analytics Tracker)
            </h3>
            <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
              تتبع مركزي مباشر
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            محسوب بناءً على تسجيل كل نقرة على روابط الأفلييت وعمليات نسخ الكوبونات في localStorage و Firebase/API لتحديد المتاجر الأعلى عائداً لك.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={loadData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="تحديث البيانات"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>تحديث</span>
          </button>
          {analysis.totalClicksAllTime > 0 && (
            <button
              onClick={handleReset}
              className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title="إعادة ضبط السجل المحلي"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>
      </div>

      {/* Top Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>إجمالي النقرات المسجلة</span>
            <MousePointerClick className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">
            {analysis.totalClicksAllTime.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">على جميع روابط الأفلييت بالموقع</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>الأرباح التقديرية المتولدة</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400 font-mono">
            {analysis.totalEstimatedEarningsSar.toFixed(2)} <span className="text-xs font-normal">ر.س</span>
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">محسوبة بنسب عمولات المتاجر السعودية</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>المتجر رقم 1 في الأرباح</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-black text-emerald-400 truncate">
            {analysis.mostProfitableStore ? analysis.mostProfitableStore.merchantName : "—"}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {analysis.mostProfitableStore 
              ? `${analysis.mostProfitableStore.totalClicks} نقرة • ${analysis.mostProfitableStore.estimatedEarningsSar.toFixed(2)} ر.س عائد` 
              : "ابدأ بتجربة النقرات لتوليد التقرير"}
          </span>
        </div>
      </div>

      {/* Stores Breakdown Table */}
      {analysis.stores.length === 0 ? (
        <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-2xl p-8 text-center text-slate-400">
          <MousePointerClick className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-bold text-slate-300">لم يتم تسجيل نقرات أفلييت بعد</p>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            بمجرد أن ينقر أي زائر على "شراء من الرابط" أو "الذهاب للمتجر" في صفحة الكوبون، ستظهر المتاجر هنا مرتبة بحسب الأكثر تحقيقاً للربح لك.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[11px] font-bold border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">الترتيب</th>
                <th className="px-4 py-3">المتجر</th>
                <th className="px-4 py-3">النقرات</th>
                <th className="px-4 py-3">نسخ الكود</th>
                <th className="px-4 py-3">التحويل المتوقع</th>
                <th className="px-4 py-3">المبيعات المقدرة</th>
                <th className="px-4 py-3">الأرباح المتوقعة لك</th>
                <th className="px-4 py-3">آخر نشاط</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {analysis.stores.map((store) => (
                <tr key={store.merchantId} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black ${
                      store.profitabilityRank === 1
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        : store.profitabilityRank === 2
                        ? "bg-slate-300/20 text-slate-200 border border-slate-300/30"
                        : store.profitabilityRank === 3
                        ? "bg-amber-700/20 text-amber-500 border border-amber-700/30"
                        : "bg-slate-800 text-slate-400"
                    }`}>
                      {store.profitabilityRank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-white flex items-center gap-1.5">
                    <span>{store.merchantName}</span>
                    {store.profitabilityRank === 1 && (
                      <span className="text-[10px] bg-amber-400/10 text-amber-400 border border-amber-400/20 px-1.5 py-0.2 rounded">
                        الأعلى ربحاً ★
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                    {store.totalClicks}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {store.totalCopies}
                  </td>
                  <td className="px-4 py-3 font-mono text-sky-400">
                    {store.conversionRatePercent}% ({store.estimatedConversions})
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-300">
                    {store.estimatedSalesSar.toLocaleString()} ر.س
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-amber-400">
                    {store.estimatedEarningsSar.toFixed(2)} ر.س
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-[11px]">
                    {new Date(store.lastClickedAt).toLocaleTimeString("ar-SA", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
