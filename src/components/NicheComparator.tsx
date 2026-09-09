import React, { useState } from "react";
import { AffiliateNiche } from "../types";
import { AFFILIATE_NICHES } from "../data/nichesData";
import {
  ArrowLeftRight,
  TrendingUp,
  Flame,
  ShieldCheck,
  DollarSign,
  Search,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  Tag,
  Cpu,
  Server,
  CreditCard,
  HeartPulse,
  Laptop,
  Plane,
  GraduationCap,
  Award,
  Clock,
  Compass,
  Repeat,
  Layers,
  ArrowRight
} from "lucide-react";

interface NicheComparatorProps {
  initialNicheAId?: string;
  initialNicheBId?: string;
  onNavigateTab?: (tab: string) => void;
  onOpenAiWithPrompt?: (promptText: string) => void;
}

export const NicheComparator: React.FC<NicheComparatorProps> = ({
  initialNicheAId = AFFILIATE_NICHES[0].id,
  initialNicheBId = AFFILIATE_NICHES[1].id,
  onNavigateTab,
  onOpenAiWithPrompt
}) => {
  const [nicheAId, setNicheAId] = useState<string>(initialNicheAId);
  const [nicheBId, setNicheBId] = useState<string>(initialNicheBId);
  const [marketView, setMarketView] = useState<"mena" | "global">("mena");

  const iconMap: Record<string, any> = {
    Tag,
    Cpu,
    Server,
    CreditCard,
    HeartPulse,
    Laptop,
    Plane,
    GraduationCap
  };

  const nicheA = AFFILIATE_NICHES.find((n) => n.id === nicheAId) || AFFILIATE_NICHES[0];
  const nicheB = AFFILIATE_NICHES.find((n) => n.id === nicheBId) || AFFILIATE_NICHES[1];

  const IconA = iconMap[nicheA.icon] || Tag;
  const IconB = iconMap[nicheB.icon] || Tag;

  // Helper to parse volume
  const parseSearchVolume = (valStr: string): number => {
    if (!valStr) return 0;
    const cleaned = valStr.replace(/[^0-9]/g, "");
    return parseInt(cleaned, 10) || 0;
  };

  const volA = parseSearchVolume(
    marketView === "mena" ? nicheA.totalMonthlySearchMena : nicheA.totalMonthlySearchGlobal
  );
  const volB = parseSearchVolume(
    marketView === "mena" ? nicheB.totalMonthlySearchMena : nicheB.totalMonthlySearchGlobal
  );
  const maxVol = Math.max(volA, volB, 1);
  const pctA = Math.round((volA / maxVol) * 100);
  const pctB = Math.round((volB / maxVol) * 100);

  // Difficulty numeric score
  const getDifficultyScore = (level: AffiliateNiche["seoCompetitionLevel"]): number => {
    switch (level) {
      case "منخفض":
        return 25;
      case "منخفض إلى متوسط":
        return 40;
      case "متوسط":
        return 55;
      case "مرتفع":
        return 75;
      case "شرس":
      default:
        return 92;
    }
  };

  const diffA = getDifficultyScore(nicheA.seoCompetitionLevel);
  const diffB = getDifficultyScore(nicheB.seoCompetitionLevel);

  const getDifficultyColor = (level: AffiliateNiche["seoCompetitionLevel"]) => {
    switch (level) {
      case "منخفض":
        return { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", bar: "bg-emerald-500" };
      case "منخفض إلى متوسط":
        return { text: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/30", bar: "bg-teal-500" };
      case "متوسط":
        return { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", bar: "bg-cyan-500" };
      case "مرتفع":
        return { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", bar: "bg-amber-500" };
      case "شرس":
      default:
        return { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/30", bar: "bg-rose-500" };
    }
  };

  const diffThemeA = getDifficultyColor(nicheA.seoCompetitionLevel);
  const diffThemeB = getDifficultyColor(nicheB.seoCompetitionLevel);

  // Time to rank estimate
  const getTimeToRank = (level: AffiliateNiche["seoCompetitionLevel"]): string => {
    switch (level) {
      case "منخفض":
        return "1 - 3 أشهر (نتائج سريعة)";
      case "منخفض إلى متوسط":
        return "2 - 4 أشهر (تنافس معتدل)";
      case "متوسط":
        return "4 - 7 أشهر (يتطلب محتوى معمق)";
      case "مرتفع":
        return "7 - 12 شهر (يتطلب روابط قوية)";
      case "شرس":
      default:
        return "10 - 18 شهر (منافسة ضارية)";
    }
  };

  // Earning potential RPM estimate
  const getEarningEstimate = (niche: AffiliateNiche): { rpm: string; typeDesc: string; ltvScore: string } => {
    if (niche.commissionType === "Recurring") {
      return {
        rpm: "$120 - $280 لكل 1,000 زيارة",
        typeDesc: "دخل تراكمي سلبي شهري مستمر",
        ltvScore: "مرتفع جداً (LTV استثنائي)"
      };
    }
    if (niche.id === "niche-finance-crypto-cards") {
      return {
        rpm: "$180 - $450 لكل 1,000 زيارة",
        typeDesc: "عمولات CPA ضخمة لكل حساب مفعل",
        ltvScore: "مرتفع لكل تحويلة"
      };
    }
    if (niche.id === "niche-web-hosting-domains") {
      return {
        rpm: "$140 - $320 لكل 1,000 زيارة",
        typeDesc: "عمولات مرتفعة ($65 - $150 للمبيعة)",
        ltvScore: "مرتفع وفوري"
      };
    }
    if (niche.id === "niche-coupons-ecommerce") {
      return {
        rpm: "$40 - $95 لكل 1,000 زيارة",
        typeDesc: "حجم مبيعات هائل مع عمولات سريعة",
        ltvScore: "معدل تحويل لحظي فائق (12-20%)"
      };
    }
    return {
      rpm: "$50 - $130 لكل 1,000 زيارة",
      typeDesc: "عمولة مبيعات مباشرة (CPA/CPS)",
      ltvScore: "متوسط إلى مرتفع"
    };
  };

  const earningA = getEarningEstimate(nicheA);
  const earningB = getEarningEstimate(nicheB);

  // Swap niches
  const handleSwap = () => {
    const temp = nicheAId;
    setNicheAId(nicheBId);
    setNicheBId(temp);
  };

  // Presets
  const presets = [
    {
      label: "الكوبونات ضد برمجيات SaaS",
      idA: "niche-coupons-ecommerce",
      idB: "niche-saas-ai-tools"
    },
    {
      label: "استضافة السيرفرات ضد الخدمات المالية",
      idA: "niche-web-hosting-domains",
      idB: "niche-finance-crypto-cards"
    },
    {
      label: "المكملات الصحية ضد إلكترونيات وأجهزة",
      idA: "niche-health-wellness-supplements",
      idB: "niche-electronics-tech-gadgets"
    },
    {
      label: "حجوزات السفر ضد الكورسات أونلاين",
      idA: "niche-travel-flights-hotels",
      idB: "niche-online-courses-education"
    }
  ];

  // Determine comparison highlights
  const isVolumeWinnerA = volA > volB;
  const isDiffWinnerA = diffA < diffB; // lower difficulty is easier/better for beginner
  const isRecurringA = nicheA.commissionType === "Recurring";
  const isRecurringB = nicheB.commissionType === "Recurring";

  return (
    <div id="niche-comparator-tool" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl mb-10 text-right">
      
      {/* Tool Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1.5">
            <ArrowLeftRight className="w-4 h-4" />
            <span>أداة المقارنة التفاعلية بين نيشات الأفلييت</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">
            مقارنة ثنائية مباشرة: نيش (أ) ضد نيش (ب)
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            قارن صعوبة منافسة السيو، حجم البحث في قوقل، ونموذج العائد المتوقع جنباً إلى جنب لتحديد النيش الأنسب لميزانيتك وهدفك.
          </p>
        </div>

        {/* Market Selector */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-2xl border border-slate-800 self-start lg:self-auto shrink-0">
          <button
            onClick={() => setMarketView("mena")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              marketView === "mena"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            العالم العربي (MENA)
          </button>
          <button
            onClick={() => setMarketView("global")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              marketView === "global"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            السوق العالمي (Global)
          </button>
        </div>
      </div>

      {/* Quick Pair Presets */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          مقارنات نموذجية سريعة:
        </span>
        {presets.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => {
              setNicheAId(preset.idA);
              setNicheBId(preset.idB);
            }}
            className={`text-xs px-3 py-1 rounded-xl border transition-all cursor-pointer ${
              nicheAId === preset.idA && nicheBId === preset.idB
                ? "bg-slate-800 text-emerald-400 border-emerald-500/40 font-bold"
                : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700 hover:text-white"
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center mb-7 bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
        
        {/* Niche A Selector */}
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-400 mb-1.5">
            اختر النيش الأول (الطرف أ):
          </label>
          <div className="relative">
            <select
              value={nicheAId}
              onChange={(e) => setNicheAId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 appearance-none font-medium cursor-pointer"
            >
              {AFFILIATE_NICHES.map((n) => (
                <option key={n.id} value={n.id} disabled={n.id === nicheBId}>
                  {n.name} ({n.commissionType})
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <IconA className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Swap Button */}
        <div className="md:col-span-1 flex justify-center py-1 md:py-0">
          <button
            onClick={handleSwap}
            title="تبديل موقع النيشين"
            className="w-10 h-10 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-emerald-400 hover:text-emerald-300 transition-transform active:scale-90 shadow-md cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
          </button>
        </div>

        {/* Niche B Selector */}
        <div className="md:col-span-5">
          <label className="block text-xs font-bold text-slate-400 mb-1.5">
            اختر النيش الثاني (الطرف ب):
          </label>
          <div className="relative">
            <select
              value={nicheBId}
              onChange={(e) => setNicheBId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 appearance-none font-medium cursor-pointer"
            >
              {AFFILIATE_NICHES.map((n) => (
                <option key={n.id} value={n.id} disabled={n.id === nicheAId}>
                  {n.name} ({n.commissionType})
                </option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <IconB className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
        </div>

      </div>

      {/* Side-by-Side Comparison Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* ================= COLUMN A ================= */}
        <div className="bg-slate-950/90 rounded-2xl p-5 sm:p-6 border-2 border-emerald-500/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            الطرف (أ)
          </div>

          <div>
            {/* Header Niche A */}
            <div className="flex items-start gap-3.5 mb-5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                <IconA className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white leading-snug">
                  {nicheA.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{nicheA.englishName}</span>
                  <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    {nicheA.commissionType}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 1: SEO Competition Level */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  صعوبة المنافسة في قوقل (SEO Difficulty)
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${diffThemeA.bg} ${diffThemeA.text} ${diffThemeA.border}`}>
                  {nicheA.seoCompetitionLevel} ({diffA}/100)
                </span>
              </div>
              {/* Visual gauge */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${diffThemeA.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${diffA}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  وقت التصدر المتوقع:
                </span>
                <strong className="text-slate-200">{getTimeToRank(nicheA.seoCompetitionLevel)}</strong>
              </div>
            </div>

            {/* Metric 2: Monthly Search Volume */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-emerald-400" />
                  حجم البحث الشهري ({marketView === "mena" ? "العالم العربي" : "العالمي"})
                </span>
                <span className="text-xs font-mono font-black text-emerald-400">
                  {marketView === "mena" ? nicheA.totalMonthlySearchMena : nicheA.totalMonthlySearchGlobal}
                </span>
              </div>
              {/* Relative comparison bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-l from-emerald-400 to-teal-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctA}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>الحجم بالسوق الآخر:</span>
                <strong className="text-slate-300 font-mono">
                  {marketView === "mena" ? nicheA.totalMonthlySearchGlobal : nicheA.totalMonthlySearchMena}
                </strong>
              </div>
            </div>

            {/* Metric 3: Average Commission & Expected Returns */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  متوسط العائد المالي ونموذج الربح
                </span>
                <span className="text-[10px] font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded">
                  {earningA.typeDesc}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 mb-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                {nicheA.averageCommission}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">العائد التقديري (RPM / 1K زائر):</span>
                  <strong className="text-emerald-400 font-mono text-xs">{earningA.rpm}</strong>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">القيمة الدائمة للمستهلك:</span>
                  <strong className="text-slate-200 text-xs">{earningA.ltvScore}</strong>
                </div>
              </div>
            </div>

            {/* Metric 4: Top Partners & Multi-Brand */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">أبرز البراندات والشراكات المتاحة:</span>
                <span className="text-[10px] text-emerald-400">تعدد المتاجر: {nicheA.suitabilityForMultiBrand}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {nicheA.prominentBrandsAndPrograms.slice(0, 5).map((brand, i) => (
                  <span key={i} className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Metric 5: Golden Keyword Sample */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <span className="text-xs font-bold text-slate-300 block mb-2">أقوى كلمة تجارية بقوقل:</span>
              {nicheA.topKeywords[0] && (
                <div className="flex items-center justify-between text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="truncate max-w-[200px]">
                    <span className="font-semibold text-white truncate">{nicheA.topKeywords[0].keyword}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">نية: {nicheA.topKeywords[0].intent}</span>
                  </div>
                  <div className="text-left font-mono shrink-0">
                    <span className="text-emerald-400 font-bold block">{nicheA.topKeywords[0].monthlySearchVolumeMena}</span>
                    <span className="text-[10px] text-slate-400">CPC: {nicheA.topKeywords[0].cpcValue}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Metric 6: Google 2026 Algorithm Accuracy Progress Bar */}
            {nicheA.google2026Audit && (
              <div className="bg-slate-900/90 rounded-xl p-4 border border-emerald-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    دقة وتحديث خوارزميات قوقل 2026
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    {nicheA.google2026Audit.accuracyScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700"
                    style={{ width: `${nicheA.google2026Audit.accuracyScore}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">المعايير: </strong>
                  {nicheA.google2026Audit.algorithmFocus}
                </div>
              </div>
            )}

          </div>

          {/* Quick Action Footer for A */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab && onNavigateTab("calculator")}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
            >
              <span>محاكاة أرباح {nicheA.name.split(" ")[0]} في الحاسبة</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            {onOpenAiWithPrompt && (
              <button
                onClick={() => onOpenAiWithPrompt(`تحليل شامل لنيش ${nicheA.name} واستراتيجية السيو المناسبة`)}
                title="فحص النيش بالذكاء الاصطناعي"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </button>
            )}
          </div>
        </div>

        {/* ================= COLUMN B ================= */}
        <div className="bg-slate-950/90 rounded-2xl p-5 sm:p-6 border-2 border-cyan-500/40 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 font-black text-[10px] px-3 py-1 rounded-bl-xl uppercase tracking-wider">
            الطرف (ب)
          </div>

          <div>
            {/* Header Niche B */}
            <div className="flex items-start gap-3.5 mb-5 pt-2">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
                <IconB className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-black text-white leading-snug">
                  {nicheB.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-400">{nicheB.englishName}</span>
                  <span className="text-[10px] font-bold bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full border border-cyan-500/20">
                    {nicheB.commissionType}
                  </span>
                </div>
              </div>
            </div>

            {/* Metric 1: SEO Competition Level */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  صعوبة المنافسة في قوقل (SEO Difficulty)
                </span>
                <span className={`text-xs font-black px-2.5 py-0.5 rounded-lg border ${diffThemeB.bg} ${diffThemeB.text} ${diffThemeB.border}`}>
                  {nicheB.seoCompetitionLevel} ({diffB}/100)
                </span>
              </div>
              {/* Visual gauge */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div 
                  className={`h-full ${diffThemeB.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${diffB}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  وقت التصدر المتوقع:
                </span>
                <strong className="text-slate-200">{getTimeToRank(nicheB.seoCompetitionLevel)}</strong>
              </div>
            </div>

            {/* Metric 2: Monthly Search Volume */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Search className="w-4 h-4 text-cyan-400" />
                  حجم البحث الشهري ({marketView === "mena" ? "العالم العربي" : "العالمي"})
                </span>
                <span className="text-xs font-mono font-black text-cyan-400">
                  {marketView === "mena" ? nicheB.totalMonthlySearchMena : nicheB.totalMonthlySearchGlobal}
                </span>
              </div>
              {/* Relative comparison bar */}
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-l from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${pctB}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>الحجم بالسوق الآخر:</span>
                <strong className="text-slate-300 font-mono">
                  {marketView === "mena" ? nicheB.totalMonthlySearchGlobal : nicheB.totalMonthlySearchMena}
                </strong>
              </div>
            </div>

            {/* Metric 3: Average Commission & Expected Returns */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-cyan-400" />
                  متوسط العائد المالي ونموذج الربح
                </span>
                <span className="text-[10px] font-bold bg-slate-800 text-cyan-400 px-2 py-0.5 rounded">
                  {earningB.typeDesc}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-200 mb-2 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
                {nicheB.averageCommission}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">العائد التقديري (RPM / 1K زائر):</span>
                  <strong className="text-cyan-400 font-mono text-xs">{earningB.rpm}</strong>
                </div>
                <div className="bg-slate-800/60 p-2 rounded-lg">
                  <span className="text-slate-400 block text-[10px]">القيمة الدائمة للمستهلك:</span>
                  <strong className="text-slate-200 text-xs">{earningB.ltvScore}</strong>
                </div>
              </div>
            </div>

            {/* Metric 4: Top Partners & Multi-Brand */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300">أبرز البراندات والشراكات المتاحة:</span>
                <span className="text-[10px] text-cyan-400">تعدد المتاجر: {nicheB.suitabilityForMultiBrand}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {nicheB.prominentBrandsAndPrograms.slice(0, 5).map((brand, i) => (
                  <span key={i} className="text-[11px] bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded">
                    {brand}
                  </span>
                ))}
              </div>
            </div>

            {/* Metric 5: Golden Keyword Sample */}
            <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 mb-3.5">
              <span className="text-xs font-bold text-slate-300 block mb-2">أقوى كلمة تجارية بقوقل:</span>
              {nicheB.topKeywords[0] && (
                <div className="flex items-center justify-between text-xs bg-slate-950/80 p-2.5 rounded-lg border border-slate-800">
                  <div className="truncate max-w-[200px]">
                    <span className="font-semibold text-white truncate">{nicheB.topKeywords[0].keyword}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">نية: {nicheB.topKeywords[0].intent}</span>
                  </div>
                  <div className="text-left font-mono shrink-0">
                    <span className="text-cyan-400 font-bold block">{nicheB.topKeywords[0].monthlySearchVolumeMena}</span>
                    <span className="text-[10px] text-slate-400">CPC: {nicheB.topKeywords[0].cpcValue}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Metric 6: Google 2026 Algorithm Accuracy Progress Bar */}
            {nicheB.google2026Audit && (
              <div className="bg-slate-900/90 rounded-xl p-4 border border-cyan-500/30">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    دقة وتحديث خوارزميات قوقل 2026
                  </span>
                  <span className="text-xs font-mono font-black text-cyan-400">
                    {nicheB.google2026Audit.accuracyScore}%
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800 mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full transition-all duration-700"
                    style={{ width: `${nicheB.google2026Audit.accuracyScore}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 leading-relaxed">
                  <strong className="text-slate-300">المعايير: </strong>
                  {nicheB.google2026Audit.algorithmFocus}
                </div>
              </div>
            )}

          </div>

          {/* Quick Action Footer for B */}
          <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => onNavigateTab && onNavigateTab("calculator")}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
            >
              <span>محاكاة أرباح {nicheB.name.split(" ")[0]} في الحاسبة</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            {onOpenAiWithPrompt && (
              <button
                onClick={() => onOpenAiWithPrompt(`تحليل شامل لنيش ${nicheB.name} واستراتيجية السيو المناسبة`)}
                title="فحص النيش بالذكاء الاصطناعي"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ================= COMPREHENSIVE VERDICT & RECOMMENDATIONS ================= */}
      <div className="mt-7 bg-slate-950/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-amber-400" />
          <h4 className="text-base sm:text-lg font-black text-white">
            الخلاصة التحليلية والحكم المقارن بين النيشين
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Winner in Ease of Entry */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-1">الأسهل في الدخول والتصدر (أقل منافسة):</div>
            <div className="text-sm font-black text-emerald-400">
              {diffA < diffB ? nicheA.name : diffB < diffA ? nicheB.name : "منافسة متقاربة"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              {diffA < diffB 
                ? `نيش (${nicheA.name.split(" ")[0]}) يتميز بمنافسة ${nicheA.seoCompetitionLevel}، مما يتيح لك حصد زيارات بدون ميزانية روابط ضخمة.` 
                : diffB < diffA 
                ? `نيش (${nicheB.name.split(" ")[0]}) يتميز بمنافسة ${nicheB.seoCompetitionLevel}، وهو خيار أسرع لبدء رؤية نقرات قوقل الأولى.` 
                : "النيشان يتطلبان استراتيجية سيو وبناء روابط خلفية بمستوى متقارب."}
            </p>
          </div>

          {/* Winner in Search Volume */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-1">الأعلى في حجم الترافيك والبحث الشهري:</div>
            <div className="text-sm font-black text-cyan-400">
              {volA > volB ? nicheA.name : volB > volA ? nicheB.name : "أحجام متطابقة"}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              {volA > volB
                ? `يتفوق نيش (${nicheA.name.split(" ")[0]}) بـ ${(volA / (volB || 1)).toFixed(1)} أضعاف حجم البحث، ما يوفر مساحة ضخمة للتوسع بالزيارات.`
                : volB > volA
                ? `يتفوق نيش (${nicheB.name.split(" ")[0]}) بـ ${(volB / (volA || 1)).toFixed(1)} أضعاف حجم البحث، مما يضمن تدفقاً جماهيرياً متواصلاً.`
                : "حجم البحث متقارب جداً بين النيشين في هذا السوق."}
            </p>
          </div>

          {/* Winner in Earning Sustainability */}
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
            <div className="text-xs font-bold text-slate-400 mb-1">الأفضل في الاستدامة والدخل التراكمي:</div>
            <div className="text-sm font-black text-teal-300">
              {isRecurringA && !isRecurringB ? nicheA.name : isRecurringB && !isRecurringA ? nicheB.name : "كلاهما يعتمد على نموذج " + nicheA.commissionType}
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
              {isRecurringA && !isRecurringB
                ? `نيش (${nicheA.name.split(" ")[0]}) يعتمد على عمولات متكررة شهرياً مدى الحياة، ما يبني دخلاً مستمراً دون الحاجة لمبيعات جديدة يومياً.`
                : isRecurringB && !isRecurringA
                ? `نيش (${nicheB.name.split(" ")[0]}) يعتمد على عمولات متكررة شهرياً مدى الحياة، مما يجعله مثالياً لبناء أصل تجاري ينمو مع الوقت.`
                : "النيشان يقدمان نموذج عمولات متقارب يركز على التدفق النقدي المباشر السريع لكل تحويل ناجح."}
            </p>
          </div>
        </div>

        {/* Practical Recommendation text */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-emerald-400 block mb-1">التوصية الاستراتيجية المباشرة:</strong>
            <span>
              إذا كنت تبدأ موقعاً جديداً بدون سلطة نطاق قوية (Domain Authority)، فإن البدء بنيش{" "}
              <strong className="text-white">
                {diffA < diffB ? nicheA.name : nicheB.name}
              </strong>{" "}
              سيمكنك من اقتناص المراكز الأولى في قوقل أسرع بفضل انخفاض صعوبة السيو. أما إذا كنت تبحث عن أقصى تدفق للأرباح المستمرة ولديك القدرة على إنتاج محتوى مراجعات متخصص، فإن نيش{" "}
              <strong className="text-white">
                {isRecurringA ? nicheA.name : isRecurringB ? nicheB.name : volA > volB ? nicheA.name : nicheB.name}
              </strong>{" "}
              يمثل الاستثمار الأكثر ربحية على المدى الطويل.
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
