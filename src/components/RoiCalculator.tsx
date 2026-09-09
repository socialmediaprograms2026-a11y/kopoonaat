import React, { useState } from "react";
import { Calculator, DollarSign, Sparkles, TrendingUp, Info } from "lucide-react";

export const RoiCalculator: React.FC = () => {
  // Calculator inputs
  const [monthlySearchVolume, setMonthlySearchVolume] = useState<number>(150000);
  const [serpRankingTier, setSerpRankingTier] = useState<number>(20); // 20% CTR average for top 1-3
  const [affiliateClickRate, setAffiliateClickRate] = useState<number>(30); // 30% click outbound affiliate link / copy code
  const [merchantConversionRate, setMerchantConversionRate] = useState<number>(8); // 8% of outbound clicks convert
  const [commissionType, setCommissionType] = useState<"percent" | "fixed">("percent");
  const [avgOrderValue, setAvgOrderValue] = useState<number>(75); // $75 basket
  const [commissionPercent, setCommissionPercent] = useState<number>(8); // 8%
  const [fixedCommission, setFixedCommission] = useState<number>(65); // $65 CPA

  // Presets
  const applyPreset = (preset: "coupons" | "saas" | "tech" | "hosting" | "finance") => {
    if (preset === "coupons") {
      setMonthlySearchVolume(350000);
      setSerpRankingTier(22);
      setAffiliateClickRate(45);
      setMerchantConversionRate(14);
      setCommissionType("percent");
      setAvgOrderValue(60);
      setCommissionPercent(7);
    } else if (preset === "saas") {
      setMonthlySearchVolume(45000);
      setSerpRankingTier(18);
      setAffiliateClickRate(25);
      setMerchantConversionRate(5);
      setCommissionType("fixed");
      setFixedCommission(120);
    } else if (preset === "tech") {
      setMonthlySearchVolume(90000);
      setSerpRankingTier(15);
      setAffiliateClickRate(35);
      setMerchantConversionRate(6);
      setCommissionType("percent");
      setAvgOrderValue(180);
      setCommissionPercent(5);
    } else if (preset === "hosting") {
      setMonthlySearchVolume(60000);
      setSerpRankingTier(18);
      setAffiliateClickRate(28);
      setMerchantConversionRate(4.5);
      setCommissionType("fixed");
      setFixedCommission(85);
    } else if (preset === "finance") {
      setMonthlySearchVolume(50000);
      setSerpRankingTier(16);
      setAffiliateClickRate(20);
      setMerchantConversionRate(3.5);
      setCommissionType("fixed");
      setFixedCommission(180);
    }
  };

  // Calculations
  const estimatedMonthlyVisits = Math.round((monthlySearchVolume * serpRankingTier) / 100);
  const estimatedOutboundClicks = Math.round((estimatedMonthlyVisits * affiliateClickRate) / 100);
  const estimatedConversions = Math.round((estimatedOutboundClicks * merchantConversionRate) / 100);

  const earningsPerConversion = commissionType === "percent"
    ? (avgOrderValue * commissionPercent) / 100
    : fixedCommission;

  const estimatedMonthlyEarningsUSD = Math.round(estimatedConversions * earningsPerConversion);
  const estimatedMonthlyEarningsSAR = Math.round(estimatedMonthlyEarningsUSD * 3.75);
  const estimatedAnnualEarningsUSD = estimatedMonthlyEarningsUSD * 12;
  const rpm = estimatedMonthlyVisits > 0 
    ? ((estimatedMonthlyEarningsUSD / estimatedMonthlyVisits) * 1000).toFixed(1)
    : "0";

  return (
    <section id="calculator-section" className="py-12 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-4 h-4" />
              أداة التقدير المالي التفاعلية
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              حاسبة أرباح وزيارات محرك بحث قوقل (SEO ROI Simulator)
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              احسب حجم الزيارات المتوقعة من جوجل ومعدل النقر على روابط المتاجر والأرباح الشهرية التقديرية بالدولار والريال السعودي.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 text-xs font-bold">
            <span className="text-slate-500 self-center px-2 text-[11px]">نماذج جاهزة:</span>
            <button
              onClick={() => applyPreset("coupons")}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
            >
              موقع كوبونات
            </button>
            <button
              onClick={() => applyPreset("saas")}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-400 transition-colors"
            >
              مقارنة SaaS
            </button>
            <button
              onClick={() => applyPreset("tech")}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-400 transition-colors"
            >
              مراجعات تقنية
            </button>
            <button
              onClick={() => applyPreset("hosting")}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-400 transition-colors"
            >
              استضافة مواقع
            </button>
            <button
              onClick={() => applyPreset("finance")}
              className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
            >
              بطاقات وتمويل
            </button>
          </div>
        </div>

        {/* 2 Column Calculator Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Controls (7 Cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 text-right space-y-6">
            
            {/* Input 1: Monthly Search Volume */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-emerald-400 font-mono text-sm">{monthlySearchVolume.toLocaleString()} بحث / شهر</span>
                <span className="text-slate-200">1. حجم البحث الشهري التراكمي لكلماتك في قوقل:</span>
              </div>
              <input
                type="range"
                min="10000"
                max="1000000"
                step="10000"
                value={monthlySearchVolume}
                onChange={(e) => setMonthlySearchVolume(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1 font-mono">
                <span>1,000,000</span>
                <span>500,000</span>
                <span>10,000</span>
              </div>
            </div>

            {/* Input 2: Google CTR */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-teal-400 font-mono text-sm">{serpRankingTier}% نسبة النقر (CTR)</span>
                <span className="text-slate-200">2. معدل النقر من صفحة نتائج البحث (SERP CTR):</span>
              </div>
              <input
                type="range"
                min="5"
                max="40"
                step="1"
                value={serpRankingTier}
                onChange={(e) => setSerpRankingTier(Number(e.target.value))}
                className="w-full accent-teal-500 cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-500 mt-1">
                <span>المراكز الأولى (30-40%)</span>
                <span>المراكز 2-3 (~20%)</span>
                <span>المراكز 4-8 (5-10%)</span>
              </div>
            </div>

            {/* Input 3: Website Outbound Click Rate */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-cyan-400 font-mono text-sm">{affiliateClickRate}%</span>
                <span className="text-slate-200">3. نسبة زوار موقعك الذين يضغطون على رابط المتجر / ينسخون الكوبون:</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="2"
                value={affiliateClickRate}
                onChange={(e) => setAffiliateClickRate(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="text-[11px] text-slate-500 mt-1">
                في مواقع الكوبونات تصل إلى 40-50%، وفي المقالات والمراجعات تتراوح بين 20-30%.
              </div>
            </div>

            {/* Input 4: Merchant Conversion Rate */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-indigo-400 font-mono text-sm">{merchantConversionRate}%</span>
                <span className="text-slate-200">4. معدل تحويل المتجر من الزوار المحالين (Conversion Rate):</span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                step="0.5"
                value={merchantConversionRate}
                onChange={(e) => setMerchantConversionRate(Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            {/* Input 5: Commission Type Toggle */}
            <div className="pt-4 border-t border-slate-800">
              <span className="text-xs font-bold text-slate-300 block mb-2">5. هيكل ونوع العمولة المتفق عليها:</span>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  onClick={() => setCommissionType("percent")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    commissionType === "percent"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400"
                  }`}
                >
                  نسبة مئوية من سلة الشراء (CPS %)
                </button>
                <button
                  onClick={() => setCommissionType("fixed")}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                    commissionType === "fixed"
                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-300"
                      : "bg-slate-800/60 border-slate-700 text-slate-400"
                  }`}
                >
                  مبلغ ثابت لكل طلب / تسجيل (CPA $)
                </button>
              </div>

              {commissionType === "percent" ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">متوسط سلة المشتريات ($):</label>
                    <input
                      type="number"
                      value={avgOrderValue}
                      onChange={(e) => setAvgOrderValue(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">نسبة عمولتك (%):</label>
                    <input
                      type="number"
                      value={commissionPercent}
                      onChange={(e) => setCommissionPercent(Math.max(0.5, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs text-slate-400 block mb-1">مبلغ العمولة الثابتة لكل عميل ($ CPA):</label>
                  <input
                    type="number"
                    value={fixedCommission}
                    onChange={(e) => setFixedCommission(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              )}
            </div>

          </div>

          {/* Results Display (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div className="bg-gradient-to-br from-slate-900 to-slate-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-right shadow-2xl relative overflow-hidden">
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <span className="text-xs font-bold bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
                  العائد التقديري من قوقل
                </span>
                <span className="text-xs text-slate-400">بدون ميزانية إعلانات ممولة</span>
              </div>

              {/* Big Earnings Numbers */}
              <div className="mb-6">
                <div className="text-xs text-slate-400 mb-1">صافي الأرباح الشهرية المتوقعة:</div>
                <div className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight flex items-baseline gap-2">
                  <span>${estimatedMonthlyEarningsUSD.toLocaleString()}</span>
                  <span className="text-sm font-bold text-slate-400 font-sans">شهرياً</span>
                </div>
                <div className="text-lg font-black text-emerald-400 font-mono mt-1">
                  ≈ {estimatedMonthlyEarningsSAR.toLocaleString()} ريال سعودي / شهرياً
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  (بمعدل سنوي يقارب <strong className="text-slate-300 font-mono">${estimatedAnnualEarningsUSD.toLocaleString()}</strong> سنوياً)
                </div>
              </div>

              {/* Step-by-Step Breakdown */}
              <div className="space-y-3 pt-5 border-t border-slate-800 text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-emerald-400 font-bold font-mono">{estimatedMonthlyVisits.toLocaleString()}</span>
                  <span className="text-slate-300">الزيارات الشهرية لموقعك من قوقل:</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-teal-400 font-bold font-mono">{estimatedOutboundClicks.toLocaleString()}</span>
                  <span className="text-slate-300">النقرات المحالة للمتاجر والبراندات:</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-cyan-400 font-bold font-mono">{estimatedConversions.toLocaleString()}</span>
                  <span className="text-slate-300">عدد الطلبات والمبيعات المكتملة:</span>
                </div>

                <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                  <span className="text-amber-400 font-bold font-mono">${earningsPerConversion.toFixed(2)}</span>
                  <span className="text-slate-300">متوسط عمولتك من كل عملية بيع:</span>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <span className="text-indigo-400 font-bold font-mono">${rpm}</span>
                  <span className="text-slate-400">عائد كل 1,000 زائر لموقعك (RPM):</span>
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-6 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 text-[11px] text-slate-300 flex items-start gap-2">
                <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  هذه الأرقام مبنية على إحصائيات تحويل واقعية لشبكات Admitad و Impact في السوق العربي والعالمي. كلما تقدم ترتيب صفحاتك في الكلمات ذات النية الشرائية (High Commercial Intent)، تضاعفت الأرباح تلقائياً.
                </span>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
