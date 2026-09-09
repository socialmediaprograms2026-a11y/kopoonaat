import React, { useState } from "react";
import { AFFILIATE_NICHES } from "../data/nichesData";
import { AffiliateNiche } from "../types";
import { NicheComparator } from "./NicheComparator";
import { 
  TrendingUp, 
  Search, 
  DollarSign, 
  Flame, 
  Globe2, 
  MapPin, 
  Tag, 
  Cpu, 
  Server, 
  CreditCard, 
  HeartPulse, 
  Laptop, 
  Plane, 
  GraduationCap,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ExternalLink,
  ArrowLeftRight,
  LayoutGrid,
  Sparkles,
  Zap,
  ShieldCheck,
  Calendar,
  Info,
  CheckCircle2
} from "lucide-react";

interface NichesRankingsProps {
  onNavigateTab?: (tab: string) => void;
  onOpenAiWithPrompt?: (promptText: string) => void;
}

export const NichesRankings: React.FC<NichesRankingsProps> = ({
  onNavigateTab,
  onOpenAiWithPrompt
}) => {
  const [viewMode, setViewMode] = useState<"catalog" | "comparator">("catalog");
  const [comparatorNicheAId, setComparatorNicheAId] = useState<string>(AFFILIATE_NICHES[0].id);
  const [comparatorNicheBId, setComparatorNicheBId] = useState<string>(AFFILIATE_NICHES[1].id);
  const [selectedMarket, setSelectedMarket] = useState<"mena" | "global">("mena");
  const [activeNicheId, setActiveNicheId] = useState<string>(AFFILIATE_NICHES[0].id);
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");

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

  const filteredNiches = AFFILIATE_NICHES.filter((niche) => {
    const matchesSearch = 
      niche.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      niche.englishName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      niche.prominentBrandsAndPrograms.some(b => b.toLowerCase().includes(searchFilter.toLowerCase()));
    
    if (filterType === "all") return matchesSearch;
    if (filterType === "recurring") return matchesSearch && niche.commissionType === "Recurring";
    if (filterType === "cpa") return matchesSearch && niche.commissionType === "CPA";
    return matchesSearch;
  });

  const activeNiche = AFFILIATE_NICHES.find(n => n.id === activeNicheId) || AFFILIATE_NICHES[0];
  const IconComponent = iconMap[activeNiche.icon] || Tag;

  return (
    <section id="niches-section" className="py-12 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <TrendingUp className="w-4 h-4" />
              النيشات الأكثر طلباً وإحصائيات قوقل
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ترتيب النيشات الأعلى بحثاً وربحية في سيو الأفلييت
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              حجم البحث الشهري الفعلي ونية الشراء (Intent) والكلمات المفتاحية الذهبية في محرك بحث قوقل مع متوسط العمولات وأداة مقارنة تفاعلية.
            </p>
          </div>

          {/* Region Switcher: MENA vs Global */}
          <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setSelectedMarket("mena")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedMarket === "mena"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>الشرق الأوسط والعالم العربي (MENA)</span>
            </button>

            <button
              onClick={() => setSelectedMarket("global")}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                selectedMarket === "global"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Globe2 className="w-3.5 h-3.5" />
              <span>السوق العالمي (Global)</span>
            </button>
          </div>
        </div>

        {/* View Mode Switcher (Catalog vs Comparator) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-8 bg-slate-900/90 p-2 rounded-2xl border border-slate-800 shadow-lg">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode("catalog")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === "catalog"
                  ? "bg-slate-800 text-white shadow-md border border-slate-700"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>دليل النيشات والكلمات المفتاحية</span>
            </button>

            <button
              onClick={() => setViewMode("comparator")}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === "comparator"
                  ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 font-black"
                  : "text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>أداة المقارنة التفاعلية (نيش ضد نيش) ⚡</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 hidden sm:flex items-center gap-1.5 px-3">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>مقارنة فورية جنباً إلى جنب: صعوبة السيو، البحث الشهري، ونموذج العائد</span>
          </div>
        </div>

        {/* ================= VIEW: INTERACTIVE COMPARATOR ================= */}
        {viewMode === "comparator" && (
          <NicheComparator
            initialNicheAId={comparatorNicheAId}
            initialNicheBId={comparatorNicheBId}
            onNavigateTab={onNavigateTab}
            onOpenAiWithPrompt={onOpenAiWithPrompt}
          />
        )}

        {/* ================= VIEW: CATALOG & KEYWORDS ================= */}
        {viewMode === "catalog" && (
          <>
            {/* Quick Invitation Banner to Comparator */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white">
                    محتار بين نيشين لموقعك القادم؟
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    قارن صعوبة المنافسة، أحجام البحث، ونماذج العمولات التراكمية جنباً إلى جنب.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewMode("comparator")}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
              >
                <span>فتح أداة المقارنة المباشرة</span>
                <ArrowLeftRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="ابحث بالنيش، الكلمة، أو المتجر (مثلاً: نون، استضافة، ذكاء اصطناعي، طيران)..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-right"
                />
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => setFilterType("all")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    filterType === "all"
                      ? "bg-slate-800 text-white border-slate-600"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  جميع العمولات
                </button>
                <button
                  onClick={() => setFilterType("recurring")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    filterType === "recurring"
                      ? "bg-slate-800 text-emerald-400 border-emerald-500/50"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  عمولات متكررة شهرياً (Recurring)
                </button>
                <button
                  onClick={() => setFilterType("cpa")}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                    filterType === "cpa"
                      ? "bg-slate-800 text-teal-400 border-teal-500/50"
                      : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                  }`}
                >
                  عمولات ثابتة لكل عملية (CPA)
                </button>
              </div>
            </div>

            {/* Google 2026 Algorithm Accuracy Global Banner */}
            <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 text-right">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        مؤشر تدقيق دقة وتحديث البيانات بخوارزميات Google لعام 2026
                      </h4>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-black px-2 py-0.5 rounded-full border border-emerald-500/30 font-mono">
                        96.1% دقة معتمدة
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      تمت مراجعة أحجام البحث، نسب العمولات، ومعايير E-E-A-T الصارمة لمكافحة المحتوى المولد عشوائياً.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 self-end sm:self-auto shrink-0 font-mono">
                  <span className="inline-flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/80">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>تحديث الربع الثالث 2026</span>
                  </span>
                </div>
              </div>

              {/* Master Global Progress Bar */}
              <div className="mt-3 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-slate-400">
                    نسبة التوافق مع خوارزميات جوجل الحالية (Helpful Content & Reviews Systems):
                  </span>
                  <span className="font-mono font-bold text-emerald-400">
                    96.1% جاهزية تصدّر
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800/80">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full"
                    style={{ width: "96.1%" }}
                  />
                </div>
              </div>
            </div>

        {/* Layout: Left Detail & Right List */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* List of Niches (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {filteredNiches.map((niche, index) => {
              const Icon = iconMap[niche.icon] || Tag;
              const isSelected = activeNicheId === niche.id;
              const searchVolume = selectedMarket === "mena" 
                ? niche.totalMonthlySearchMena 
                : niche.totalMonthlySearchGlobal;

              return (
                <div
                  key={niche.id}
                  onClick={() => setActiveNicheId(niche.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-right ${
                    isSelected
                      ? "bg-slate-800 border-emerald-500 shadow-lg shadow-emerald-500/10"
                      : "bg-slate-900/60 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? "bg-emerald-500 text-slate-950 font-bold" 
                          : "bg-slate-800 text-slate-300"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                          <h4 className="font-bold text-white text-sm leading-snug">{niche.name}</h4>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">{niche.englishName}</span>
                      </div>
                    </div>

                    <div className="text-left shrink-0">
                      <div className="text-xs font-extrabold text-emerald-400">
                        {searchVolume.split(" ")[0]}
                      </div>
                      <span className="text-[10px] text-slate-500 block">بحث / شهرياً</span>
                    </div>
                  </div>

                  {/* Google 2026 Accuracy Progress Bar */}
                  {niche.google2026Audit && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800/60">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="text-slate-400 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          <span>دقة خوارزميات 2026:</span>
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {niche.google2026Audit.accuracyScore}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                        <div 
                          className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-500"
                          style={{ width: `${niche.google2026Audit.accuracyScore}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Badges line */}
                  <div className="mt-2.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      متوسط العائد: <strong className="text-slate-200">{niche.averageCommission.split(" ")[0]}</strong>
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        niche.seoCompetitionLevel === "منخفض" ? "bg-emerald-500/10 text-emerald-400" :
                        niche.seoCompetitionLevel === "متوسط" ? "bg-teal-500/10 text-teal-400" :
                        niche.seoCompetitionLevel === "مرتفع" ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        المنافسة: {niche.seoCompetitionLevel}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setComparatorNicheAId(niche.id);
                          const other = AFFILIATE_NICHES.find(n => n.id !== niche.id) || AFFILIATE_NICHES[1];
                          setComparatorNicheBId(other.id);
                          setViewMode("comparator");
                        }}
                        title="مقارنة هذا النيش جنباً إلى جنب"
                        className="p-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 border border-slate-700 transition-colors"
                      >
                        <ArrowLeftRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Niche View (7 cols) */}
          <div className="lg:col-span-7">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 sticky top-24">
              
              {/* Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">{activeNiche.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-400">{activeNiche.englishName}</span>
                      <span className="text-[11px] bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/20">
                        تعدد المتاجر: {activeNiche.suitabilityForMultiBrand}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setComparatorNicheAId(activeNiche.id);
                      const other = AFFILIATE_NICHES.find(n => n.id !== activeNiche.id) || AFFILIATE_NICHES[1];
                      setComparatorNicheBId(other.id);
                      setViewMode("comparator");
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm"
                    title="مقارنة هذا النيش في الأداة التفاعلية"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">قارن النيش</span>
                  </button>

                  <div className="text-left bg-slate-800/80 px-3.5 py-2 rounded-2xl border border-slate-700/80">
                    <div className="text-xs text-slate-400">حجم البحث الشهري:</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      {selectedMarket === "mena" ? activeNiche.totalMonthlySearchMena : activeNiche.totalMonthlySearchGlobal}
                    </div>
                  </div>
                </div>
              </div>

              {/* Overview & Why in Demand */}
              <div className="my-5 text-right">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                  {activeNiche.overview}
                </p>
                <div className="mt-3 flex items-start gap-2 text-xs text-slate-400">
                  <Flame className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span><strong>سر الطلب العالي:</strong> {activeNiche.whyHighDemand}</span>
                </div>
              </div>

              {/* Prominent Brands & Programs */}
              <div className="mb-5 text-right">
                <div className="text-xs font-bold text-slate-300 mb-2">أبرز المتاجر والبراندات المتاحة للشراكة:</div>
                <div className="flex flex-wrap gap-2">
                  {activeNiche.prominentBrandsAndPrograms.map((brand, i) => (
                    <span key={i} className="text-xs bg-slate-800 text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg font-medium">
                      {brand}
                    </span>
                  ))}
                </div>
              </div>

              {/* Google 2026 Algorithm Accuracy & Compliance Progress Card */}
              {activeNiche.google2026Audit && (
                <div className="my-5 p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 shadow-lg text-right">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="text-sm font-black text-white">
                            مؤشر دقة وتحديث البيانات بخوارزميات Google لعام 2026
                          </h4>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                            {activeNiche.google2026Audit.complianceLevel}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          تركيز الخوارزمية: {activeNiche.google2026Audit.algorithmFocus}
                        </span>
                      </div>
                    </div>
                    <div className="text-left text-[11px] text-slate-400 shrink-0 font-mono">
                      <span className="inline-flex items-center gap-1 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/80">
                        <Calendar className="w-3 h-3 text-emerald-400" />
                        {activeNiche.google2026Audit.lastVerifiedDate}
                      </span>
                    </div>
                  </div>

                  {/* Master Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-300 font-bold">
                        معدل التوافق والمطابقة الكلي لمعايير تصدّر قوقل:
                      </span>
                      <span className="text-emerald-400 font-black font-mono text-sm">
                        {activeNiche.google2026Audit.accuracyScore}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-1000 shadow-sm"
                        style={{ width: `${activeNiche.google2026Audit.accuracyScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Criteria 4-Pillars Sub Progress Bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                    {/* EEAT */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-300 font-medium">إثبات التجربة والمصداقية (E-E-A-T):</span>
                        <span className="font-mono font-bold text-emerald-400">{activeNiche.google2026Audit.criteriaBreakdown.eeatScore}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${activeNiche.google2026Audit.criteriaBreakdown.eeatScore}%` }} />
                      </div>
                    </div>

                    {/* Intent */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-300 font-medium">دقة نية البحث الشرائية (Intent):</span>
                        <span className="font-mono font-bold text-teal-400">{activeNiche.google2026Audit.criteriaBreakdown.intentAccuracy}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-400 rounded-full" style={{ width: `${activeNiche.google2026Audit.criteriaBreakdown.intentAccuracy}%` }} />
                      </div>
                    </div>

                    {/* Sponsored */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-300 font-medium">وسوم الروابط والشفافية (Sponsored):</span>
                        <span className="font-mono font-bold text-cyan-400">{activeNiche.google2026Audit.criteriaBreakdown.sponsoredCompliance}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${activeNiche.google2026Audit.criteriaBreakdown.sponsoredCompliance}%` }} />
                      </div>
                    </div>

                    {/* Anti AI Spam */}
                    <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-slate-300 font-medium">القيمة المضافة ومكافحة السبام:</span>
                        <span className="font-mono font-bold text-emerald-400">{activeNiche.google2026Audit.criteriaBreakdown.antiAiSpamScore}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${activeNiche.google2026Audit.criteriaBreakdown.antiAiSpamScore}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Algorithm 2026 Advice */}
                  <div className="mt-3.5 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-slate-300 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-emerald-300 block mb-0.5">توجيه خوارزميات 2026 لهذا النيش:</strong>
                      <span className="text-slate-300 leading-relaxed">{activeNiche.google2026Audit.keyAdvice2026}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Golden Keywords Table in Google */}
              <div className="text-right">
                <div className="flex items-center justify-between mb-2.5">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الكلمات المفتاحية الذهبية وحجم بحثها الشهري في Google</span>
                  </div>
                  <span className="text-[11px] text-slate-400">نية البحث وقيمة النقرة (CPC)</span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-right text-xs">
                    <thead className="bg-slate-800/80 text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3">الكلمة المفتاحية في قوقل</th>
                        <th className="p-3">البحث الشهري ({selectedMarket === "mena" ? "عربي" : "عالمي"})</th>
                        <th className="p-3">نية الباحث</th>
                        <th className="p-3">قيمة النقرة (CPC)</th>
                        <th className="p-3">صعوبة السيو</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-medium">
                      {activeNiche.topKeywords.map((kw, i) => {
                        const volume = selectedMarket === "mena" 
                          ? kw.monthlySearchVolumeMena 
                          : kw.monthlySearchVolumeGlobal;

                        return (
                          <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                            <td className="p-3 font-semibold text-white">
                              {kw.keyword}
                            </td>
                            <td className="p-3 text-emerald-400 font-bold font-mono">
                              {volume}
                            </td>
                            <td className="p-3">
                              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px]">
                                {kw.intent}
                              </span>
                            </td>
                            <td className="p-3 font-mono text-cyan-300">
                              {kw.cpcValue}
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                kw.difficulty === "منخفض" ? "bg-emerald-500/10 text-emerald-300" :
                                kw.difficulty === "متوسط" ? "bg-teal-500/10 text-teal-300" :
                                kw.difficulty === "مرتفع" ? "bg-amber-500/10 text-amber-300" :
                                "bg-rose-500/10 text-rose-300"
                              }`}>
                                {kw.difficulty}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Winning SEO Tactics for this Niche */}
              <div className="mt-5 pt-4 border-t border-slate-800 text-right">
                <div className="text-xs font-bold text-emerald-400 mb-2">تكتيكات قوقل الذهبية للتصدر في هذا النيش:</div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {activeNiche.winningSeoTactics.map((tactic, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{tactic}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>

        </div>
        </>
        )}

      </div>
    </section>
  );
};
