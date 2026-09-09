import React, { useState } from "react";
import { 
  Search, 
  Target, 
  ShieldAlert, 
  Zap, 
  ArrowUpRight, 
  TrendingUp, 
  CheckCircle2, 
  XCircle, 
  Globe, 
  Link2, 
  Copy, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Layers, 
  Crosshair,
  FileText,
  DollarSign,
  BarChart3
} from "lucide-react";
import { CompetitorAnalysisResult } from "../types";

const PRESET_COMPETITORS = [
  {
    name: "الموفر (Almowafir)",
    url: "https://almowafir.com",
    niche: "كوبونات وعروض المتاجر العامة (السعودية والخليج)",
    description: "المنصة الأكبر لكوبونات نون وأمازون ونمشي مع توجيهات روابط متعددة الشبكات"
  },
  {
    name: "كوبون خصم (CouponKhasm)",
    url: "https://couponkhasm.com",
    niche: "أكواد خصم المتاجر ومراجعات التسوق",
    description: "موقع متخصص في استهداف كلمات Long-tail لكوبونات الأزياء والتوصيل"
  },
  {
    name: "وفرها (Waffarha)",
    url: "https://waffarha.com",
    niche: "عروض وصفقات المطاعم والخدمات الترفيهية",
    description: "نموذج صفقات فورية وعمولات حصرية على مستوى المدن"
  },
  {
    name: "رادار العطور ومقارنات الجمال",
    url: "https://perfumereviews-sa.com",
    niche: "مراجعات العطور والتجميل (نايس ون، سيفورا، وجوه)",
    description: "نموذج مراجعات وجداول مقارنة بدائل العطور بأسعار مخفضة"
  }
];

export const CompetitorMonitor: React.FC = () => {
  const [competitorUrl, setCompetitorUrl] = useState<string>("https://almowafir.com");
  const [targetNiche, setTargetNiche] = useState<string>("كوبونات وعروض المتاجر العامة");
  const [affiliateLinkSample, setAffiliateLinkSample] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<CompetitorAnalysisResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleAnalyze = async (urlToUse?: string, nicheToUse?: string) => {
    const activeUrl = urlToUse || competitorUrl;
    const activeNiche = nicheToUse || targetNiche;

    if (!activeUrl.trim()) {
      setErrorMsg("يرجى إدخال رابط أو اسم نطاق المنافس");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/competitors/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          competitorUrl: activeUrl.trim(),
          targetNiche: activeNiche,
          affiliateLinkSample: affiliateLinkSample.trim()
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data: CompetitorAnalysisResult = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error("Analysis failed:", err);
      setErrorMsg("حدث خطأ أثناء فحص المنافس، يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPreset = (preset: typeof PRESET_COMPETITORS[0]) => {
    setCompetitorUrl(preset.url);
    setTargetNiche(preset.niche);
    handleAnalyze(preset.url, preset.niche);
  };

  const handleCopyReport = () => {
    if (!analysisResult) return;
    const text = `
تقرير استخبارات المنافس: ${analysisResult.competitorName}
الرابط المحلل: ${analysisResult.analyzedUrl}
النيش: ${analysisResult.targetNiche}
درجة التهديد التنافسي: ${analysisResult.overallThreatScore}/100

أبرز شبكات الأفلييت المستخدمة:
${analysisResult.detectedAffiliateFootprint.primaryNetworks.map(n => `- ${n}`).join("\n")}

نقاط القوة:
${analysisResult.strengths.map(s => `+ ${s}`).join("\n")}

نقاط الضعف والفجوات:
${analysisResult.weaknesses.map(w => `- ${w}`).join("\n")}

خطة الهجوم والتفوق في سيو قوقل:
${analysisResult.counterStrategyActionPlan.map((c, i) => `${i + 1}. ${c}`).join("\n")}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 p-6 sm:p-10 shadow-2xl text-white">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>مدعوم بالذكاء الاصطناعي ومهندس سيو الأفلييت 2026</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
            رادار استخبارات ومراقبة المنافسين <span className="text-emerald-400">في نفس النيش</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            قم بإدخال رابط أو موقع المنافس ليقوم الذكاء الاصطناعي بتفكيك بصمة روابطه التابعة، وشبكات الأفلييت التي يتعاقد معها، واستخراج تقرير مقارن يوضح نقاط قوته وضعفه وخطة عملية للتفوق عليه في محرك بحث Google.
          </p>
        </div>
      </div>

      {/* Preset Quick Select */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Crosshair className="w-4 h-4 text-emerald-600" />
          <span>منافسون رئيسيون جاهزون للتحليل الفوري بنقرة واحدة:</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_COMPETITORS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              disabled={isLoading}
              className="text-right p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all group cursor-pointer disabled:opacity-60"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {preset.name}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>رابط أو نطاق موقع المنافس:</span>
            </label>
            <input
              type="text"
              value={competitorUrl}
              onChange={(e) => setCompetitorUrl(e.target.value)}
              placeholder="مثال: https://almowafir.com أو saudicoupons.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>النيش أو التصنيف المستهدف:</span>
            </label>
            <input
              type="text"
              value={targetNiche}
              onChange={(e) => setTargetNiche(e.target.value)}
              placeholder="مثال: كوبونات المتاجر، عطور، أجهزة إلكترونية"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-amber-600" />
              <span>رابط تتبع أو إحالة اختياري للمنافس:</span>
            </label>
            <input
              type="text"
              value={affiliateLinkSample}
              onChange={(e) => setAffiliateLinkSample(e.target.value)}
              placeholder="مثال: /out/store?subid=xyz أو track.admitad..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all font-mono"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            يقوم الذكاء الاصطناعي بربط مسارات التحويل وتصنيف الشبكات وكشف فجوات الكلمات المفتاحية في SERP 2026.
          </p>

          <button
            onClick={() => handleAnalyze()}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>جاري استنطاق بصمة المنافس بالذكاء الاصطناعي...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>بدء الفحص والاستخبارات التنافسية</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results View */}
      {analysisResult && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Top Metric Strip */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    تم التحليل بنجاح
                  </span>
                  <span className="text-xs text-slate-400">النيش: {analysisResult.targetNiche}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  تقرير استخبارات: {analysisResult.competitorName}
                </h2>
                <span className="text-xs text-slate-500 font-mono">{analysisResult.analyzedUrl}</span>
              </div>

              <button
                onClick={handleCopyReport}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-2 transition-colors border border-slate-200 cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "تم نسخ التقرير" : "نسخ التقرير كاملاً"}</span>
              </button>
            </div>

            {/* Scores Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-right">
                <span className="text-xs font-bold text-amber-800">مؤشر التهديد التنافسي (Threat Score)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-amber-900">{analysisResult.overallThreatScore}</span>
                  <span className="text-xs font-bold text-amber-700">/ 100</span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-amber-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${analysisResult.overallThreatScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-right">
                <span className="text-xs font-bold text-emerald-800">مؤشر نقاط القوة لديه</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-emerald-900">{analysisResult.strengthsScore}</span>
                  <span className="text-xs font-bold text-emerald-700">/ 100</span>
                </div>
                <div className="w-full bg-emerald-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${analysisResult.strengthsScore}%` }}
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-right">
                <span className="text-xs font-bold text-rose-800">مؤشر الثغرات والفجوات (ضعفه)</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-rose-900">{analysisResult.weaknessesScore}</span>
                  <span className="text-xs font-bold text-rose-700">/ 100 ثغرة</span>
                </div>
                <div className="w-full bg-rose-200 h-2 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-rose-600 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${analysisResult.weaknessesScore}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Detected Affiliate Footprint */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-indigo-600" />
              <span>بصمة الروابط التابعة وشبكات الأفلييت المكتشفة:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500">الشبكات والشراكات التابعة المتوقعة:</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.detectedAffiliateFootprint.primaryNetworks.map((net, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold">
                      {net}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500">نمط التوجيه ومسار الروابط (Redirect Pattern):</span>
                <p className="text-xs text-slate-800 font-mono leading-relaxed bg-white p-2.5 rounded-xl border border-slate-200">
                  {analysisResult.detectedAffiliateFootprint.redirectPattern}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500">بارامترات التتبع (Tracking Parameters):</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {analysisResult.detectedAffiliateFootprint.trackingParameters.map((param, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 text-[11px] font-mono">
                      {param}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-500">الامتثال للإفصاح ووسوم rel='sponsored':</span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {analysisResult.detectedAffiliateFootprint.disclosureCompliance}
                </p>
              </div>
            </div>
          </div>

          {/* Head to Head: Strengths vs Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-white rounded-3xl border border-emerald-500/30 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-base font-black">نقاط القوة في استراتيجية المنافس</h3>
                  <p className="text-xs text-emerald-600">ما الذي يجعله يجلب زيارات ومبيعات حالياً؟</p>
                </div>
              </div>

              <ul className="space-y-3 pt-2">
                {analysisResult.strengths.map((str, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-3xl border border-rose-500/30 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-rose-800">
                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                  <XCircle className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="text-base font-black">نقاط الضعف والفجوات التكتيكية</h3>
                  <p className="text-xs text-rose-600">ثغرات يمكنك استغلالها فوراً لسحب الزوار منه</p>
                </div>
              </div>

              <ul className="space-y-3 pt-2">
                {analysisResult.weaknesses.map((weak, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed bg-rose-50/50 p-3 rounded-xl border border-rose-100">
                    <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{weak}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Counter Strategy Plan */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">خطة الهجوم والتفوق في سيو قوقل (Winning Counter-Strategy)</h3>
                <p className="text-xs text-slate-400">خطوات عملية مباشرة لتجاوز المنافس في المقتطفات المميزة والزيارات الشرائية</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {analysisResult.counterStrategyActionPlan.map((action, i) => (
                <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/40 transition-colors space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-xs font-bold text-emerald-300">تكتيك تفوق استراتيجي</span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {action}
                  </p>
                </div>
              ))}
            </div>

            {/* Estimates Strip */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                <span>تقدير الزيارات الشهرية للمنافس: <strong className="text-white">{analysisResult.trafficAndMonetizationEstimate.estimatedTraffic}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>تقدير دخل العمولات الشهري: <strong className="text-white">{analysisResult.trafficAndMonetizationEstimate.estimatedRevenue}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>صعوبة المنافسة: <strong className="text-white">{analysisResult.trafficAndMonetizationEstimate.competitiveDifficulty}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
