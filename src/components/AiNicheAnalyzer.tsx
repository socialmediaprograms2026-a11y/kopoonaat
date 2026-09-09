import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Compass,
  ArrowRight,
  X,
  Clock,
  Zap,
  Globe2,
  Flame,
  Check,
  RefreshCw
} from "lucide-react";

interface AiNicheAnalyzerProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

interface TrendingNiche {
  id: string;
  name: string;
  englishName: string;
  category: string;
  monthlySearchVolume: string;
  opportunityScore: number;
  competitionLevel: "سهل" | "متوسط" | "مرتفع" | "شرس";
  growthTrend: string;
  topKeywords: string[];
  recommendedNetworks: string[];
  averageCommission: string;
  market: "mena" | "global" | "all";
  reasonForTrend: string;
  lastAnalyzedAt: string;
}

export const AiNicheAnalyzer: React.FC<AiNicheAnalyzerProps> = ({ isOpen, onClose, initialQuery }) => {
  const [activeSubTab, setActiveSubTab] = useState<"trending" | "custom">("trending");
  const [query, setQuery] = useState(initialQuery || "");
  const [market, setMarket] = useState<"all" | "mena" | "global">("all");
  const [trendingNiches, setTrendingNiches] = useState<TrendingNiche[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [latestReport, setLatestReport] = useState<any>(null);
  const [loadingTrending, setLoadingTrending] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  // Fetch background job synced trending niches on mount
  const fetchTrendingData = async () => {
    try {
      setLoadingTrending(true);
      const res = await fetch("/api/trending-niches");
      if (res.ok) {
        const data = await res.json();
        setTrendingNiches(data.niches || []);
        setLastUpdated(data.lastUpdated || null);
        setLatestReport(data.latestJob || null);
      }
    } catch (e) {
      console.error("Failed to load background trending niches:", e);
    } finally {
      setLoadingTrending(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTrendingData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setActiveSubTab("custom");
    }
  }, [initialQuery]);

  if (!isOpen) return null;

  const triggerAnalyzeNiche = async (targetQuery: string, targetMarket: "all" | "mena" | "global" = market) => {
    if (!targetQuery.trim()) return;
    setQuery(targetQuery);
    setMarket(targetMarket);
    setActiveSubTab("custom");

    setLoading(true);
    setError(null);
    setAnalysisResult(null);

    try {
      const res = await fetch("/api/analyze-niche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: targetQuery.trim(), market: targetMarket })
      });

      if (!res.ok) {
        throw new Error("حدث خطأ أثناء الاتصال بالخادم، يرجى المحاولة لاحقاً.");
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      setError(err?.message || "تعذر إكمال التحليل");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    await triggerAnalyzeNiche(query, market);
  };

  const sampleNiches = [
    "مستلزمات وتربية القطط والحيوانات الأليفة",
    "كاميرات المراقبة والمنزل الذكي",
    "تطبيقات الذكاء الاصطناعي لتعديل الفيديو",
    "العطور والبخور والعود الفاخر في الخليج",
    "كراسي ومكاتب العمل المريحة (Ergonomic Chairs)",
    "أدوات بناء المتاجر الإلكترونية للدروب شيبينغ"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-right max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute left-6 top-6 w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            منظومة أبحاث السوق المؤتمتة (AI Background Job)
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            محلل ورادارات النيشات الأكثر رواجاً ومربحية
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            رصد تلقائي للنيشات الرائجة في قوقل وسوق الخليج عبر وظيفة خلفية دورية، مع إمكانية التحليل المعمق للكلمات المفتاحية وسيو المنافسة بنقرة واحدة.
          </p>
        </div>

        {/* Sub Navigation: Background Trends vs Custom Search */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
          <button
            onClick={() => setActiveSubTab("trending")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "trending"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4 text-amber-300" />
            النيشات الرائجة المحدثة تلقائياً ({trendingNiches.length})
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          </button>

          <button
            onClick={() => setActiveSubTab("custom")}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              activeSubTab === "custom"
                ? "bg-emerald-500 text-slate-950 shadow-md font-black"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Search className="w-4 h-4" />
            فحص وبحث مخصص في قوقل
          </button>
        </div>

        {/* VIEW 1: Background Synced Trending Niches */}
        {activeSubTab === "trending" && (
          <div className="space-y-4">
            {/* Sync Engine Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-slate-200">
                  <strong className="text-emerald-400">الوظيفة الخلفية (Background Job):</strong> تعمل دورياً كل 45 دقيقة لتحديث قاعدة البيانات بأحدث النيشات ومؤشرات العمولات.
                </span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-400 shrink-0">
                {lastUpdated && (
                  <span className="flex items-center gap-1 font-mono text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    آخر تحديث: {new Date(lastUpdated).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                )}
                <button
                  onClick={fetchTrendingData}
                  disabled={loadingTrending}
                  className="hover:text-emerald-400 p-1 text-slate-300 transition-colors cursor-pointer"
                  title="تحديث القائمة"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingTrending ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>

            {/* Trending Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {trendingNiches.map((niche, idx) => (
                <div
                  key={niche.id || idx}
                  className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/70 hover:border-emerald-500/60 transition-all space-y-2.5 group relative flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-700/80 text-slate-300">
                        {niche.category}
                      </span>
                      <span className="text-[11px] font-black text-emerald-400 font-mono">
                        فرصة {niche.opportunityScore}%
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                      {niche.name}
                    </h4>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                      {niche.reasonForTrend}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">حجم البحث:</span>
                        <span className="text-white font-bold font-mono">{niche.monthlySearchVolume}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">معدل النمو:</span>
                        <span className="text-teal-300 font-bold">{niche.growthTrend}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => triggerAnalyzeNiche(niche.name, niche.market)}
                    className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700 hover:border-emerald-500 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400 group-hover:text-slate-950" />
                    تحليل معمق فوراً (1-Click Deep Analysis)
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: Custom Search Input Form */}
        {activeSubTab === "custom" && (
          <div>
            <form onSubmit={handleAnalyze} className="space-y-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="اكتب نيشك هنا (مثلاً: أجهزة تحضير القهوة، السفر العائلي لليابان، برامج محاسبة...)"
                    className="w-full bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 text-right font-medium"
                  />
                </div>

                {/* Market Selection */}
                <select
                  value={market}
                  onChange={(e) => setMarket(e.target.value as any)}
                  className="bg-slate-800/90 border border-slate-700 rounded-2xl px-4 py-3 text-xs font-bold text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="all">كلا السوقين (عربي وعالمي)</option>
                  <option value="mena">الشرق الأوسط والعالم العربي فقط</option>
                  <option value="global">السوق العالمي (إنجليزي)</option>
                </select>

                <button
                  type="submit"
                  disabled={loading || !query.trim()}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg shadow-emerald-500/20"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جارٍ الفحص...</span>
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      <span>فحص النيش في قوقل</span>
                    </>
                  )}
                </button>
              </div>

              {/* Quick Ideas Chips */}
              <div className="flex items-center flex-wrap gap-2 text-xs">
                <span className="text-slate-500 text-[11px]">أمثلة سريعة:</span>
                {sampleNiches.map((n, i) => (
                  <button
                    type="button"
                    key={i}
                    onClick={() => {
                      setQuery(n);
                      triggerAnalyzeNiche(n);
                    }}
                    className="bg-slate-800/50 hover:bg-slate-800 text-slate-300 border border-slate-700/60 px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                  >
                    {n}
                  </button>
                ))}
              </div>
            </form>

            {/* Error Alert */}
            {error && (
              <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Loading State Skeleton */}
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-3" />
                <div className="text-sm font-bold text-white">جاري تحليل بيانات بحث جوجل وتقدير حجم الكلمات...</div>
                <p className="text-xs text-slate-400 mt-1">يتم الآن فحص نية الباحثين ونسب العمولات ونموذج الموقع الأنسب.</p>
              </div>
            )}

            {/* Result Render */}
            {analysisResult && !loading && (
              <div className="space-y-6 pt-4 border-t border-slate-800 animate-in fade-in duration-300">
                
                {/* Top Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
                    <div className="text-xs text-slate-400">حجم البحث الشهري التقديري</div>
                    <div className="text-sm sm:text-base font-black text-emerald-400 mt-1 font-mono">
                      {analysisResult.estimatedMonthlySearch || "50K - 150K"}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
                    <div className="text-xs text-slate-400">معدل العمولات المتوقع</div>
                    <div className="text-sm sm:text-base font-black text-teal-300 mt-1">
                      {analysisResult.averageCommission || "8% - 20%"}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
                    <div className="text-xs text-slate-400">مستوى المنافسة في قوقل</div>
                    <div className="text-sm sm:text-base font-black text-amber-400 mt-1">
                      {analysisResult.competitionLevel || "متوسط"}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 border border-slate-700/80 p-3.5 rounded-2xl">
                    <div className="text-xs text-slate-400">درجة ملائمة النيش لسيو الأفلييت</div>
                    <div className="text-sm sm:text-base font-black text-cyan-300 mt-1 font-mono">
                      {analysisResult.suitabilityScore ? `${analysisResult.suitabilityScore} / 100` : "88 / 100"}
                    </div>
                  </div>
                </div>

                {/* Why it works & Recommended Model */}
                <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 text-xs space-y-2">
                  <div>
                    <strong className="text-emerald-400 block mb-0.5">نموذج الموقع الموصى به:</strong>
                    <span className="text-white font-bold text-sm">{analysisResult.recommendedModel || "مراجعات ومقارنات تقنية تفصيلية مع أكواد خصم"}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {analysisResult.whyItWorksOnGoogle || analysisResult.summary}
                  </p>
                </div>

                {/* Golden Keywords Table */}
                {analysisResult.goldenKeywords && analysisResult.goldenKeywords.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>الكلمات المفتاحية المقترحة للاستهداف في جوجل:</span>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-800 text-slate-400">
                          <tr>
                            <th className="p-2.5">الكلمة المفتاحية</th>
                            <th className="p-2.5">البحث الشهري</th>
                            <th className="p-2.5">النية</th>
                            <th className="p-2.5">الصعوبة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-200">
                          {analysisResult.goldenKeywords.map((kw: any, idx: number) => (
                            <tr key={idx} className="hover:bg-slate-800/40">
                              <td className="p-2.5 font-semibold text-white">{kw.keyword}</td>
                              <td className="p-2.5 text-emerald-400 font-mono">{kw.searchVolume || kw.volume}</td>
                              <td className="p-2.5">{kw.intent}</td>
                              <td className="p-2.5">{kw.difficulty}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action Plan */}
                {analysisResult.seoStrategyActionPlan && (
                  <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 text-xs">
                    <div className="font-bold text-emerald-400 mb-2">خطة العمل لتصدر هذا النيش في قوقل:</div>
                    <ul className="space-y-1.5 text-slate-300">
                      {analysisResult.seoStrategyActionPlan.map((step: string, i: number) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
