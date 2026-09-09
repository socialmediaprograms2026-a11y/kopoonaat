import React, { useState } from "react";
import { AFFILIATE_MODELS } from "../data/affiliateModels";
import { AffiliateModel } from "../types";
import { 
  Building2, 
  ExternalLink, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Layers, 
  DollarSign, 
  Code, 
  ShieldCheck,
  Zap,
  ArrowLeft
} from "lucide-react";

export const ModelsDirectory: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedModel, setSelectedModel] = useState<AffiliateModel | null>(AFFILIATE_MODELS[0]);

  const categories = [
    { id: "all", label: "جميع النماذج (6)" },
    { id: "coupons", label: "بوابات الكوبونات" },
    { id: "reviews", label: "مراجعات المنتجات" },
    { id: "saas", label: "مقارنات برمجيات الـ SaaS" },
    { id: "finance", label: "التمويل والبطاقات" },
    { id: "affiliate-directory", label: "دليل برامج الأفلييت" },
    { id: "travel", label: "حجوزات السفر والفنادق" }
  ];

  const filteredModels = selectedCategory === "all"
    ? AFFILIATE_MODELS
    : AFFILIATE_MODELS.filter(m => m.category === selectedCategory);

  return (
    <section id="models-section" className="py-12 bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-4 h-4" />
              نماذج العمل المعيارية (Architectural Benchmarks)
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              أفضل 6 نماذج لمواقع الأفلييت متعددة المتاجر
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              كيف تقوم هذه المواقع بعرض مئات الشركات في منصة واحدة وتحصد ملايين الزيارات العضوية المستمرة من محرك بحث Google.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 bg-slate-800/80 p-1.5 rounded-2xl border border-slate-700/80">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === cat.id
                    ? "bg-emerald-500 text-slate-950 shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-slate-700/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
          {filteredModels.map((model) => {
            const isSelected = selectedModel?.id === model.id;
            return (
              <div
                key={model.id}
                onClick={() => setSelectedModel(model)}
                className={`cursor-pointer rounded-2xl p-6 transition-all duration-200 border text-right flex flex-col justify-between ${
                  isSelected
                    ? "bg-slate-800/90 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500"
                    : "bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70 hover:border-slate-600"
                }`}
              >
                <div>
                  {/* Header info */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-700/60 text-emerald-400 border border-slate-600/60">
                      {model.englishTitle}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md ${
                      model.financialMetrics.difficulty === "سهل" ? "bg-emerald-500/15 text-emerald-300" :
                      model.financialMetrics.difficulty === "متوسط" ? "bg-cyan-500/15 text-cyan-300" :
                      model.financialMetrics.difficulty === "تنافسي" ? "bg-amber-500/15 text-amber-300" :
                      "bg-rose-500/15 text-rose-300"
                    }`}>
                      سيو: {model.financialMetrics.difficulty}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                    {model.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed mb-4">
                    {model.shortDescription}
                  </p>

                  {/* Benchmark badges */}
                  <div className="mb-4">
                    <div className="text-[11px] font-semibold text-slate-400 mb-1.5">أبرز المواقع العالمية المتصدرة:</div>
                    <div className="flex flex-wrap gap-1.5">
                      {model.benchmarks.map((b, idx) => (
                        <span key={idx} className="text-xs font-semibold bg-slate-900/80 text-slate-200 border border-slate-700/80 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-emerald-400" />
                          {b.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px]">متوسط العائد: </span>
                    <span className="text-emerald-400 font-bold">{model.financialMetrics.avgCommissionRange}</span>
                  </div>
                  <button className="text-xs font-bold text-slate-300 flex items-center gap-1 hover:text-emerald-400 transition-colors">
                    <span>تفاصيل النموذج</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

        {/* Deep Dive Panel on Selected Model */}
        {selectedModel && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6 border-b border-slate-700/80 pb-6">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1 rounded-full border border-emerald-500/20 mb-3">
                  <Zap className="w-3.5 h-3.5" />
                  تشريح استراتيجية النموذج المختار
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {selectedModel.title}
                </h3>
                <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
                  {selectedModel.fullDescription}
                </p>
              </div>

              {/* Quick Metrics Badge */}
              <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 min-w-[260px] text-right">
                <div className="text-xs text-slate-400 mb-1">طبيعة العمولات</div>
                <div className="text-sm font-bold text-white mb-3">{selectedModel.financialMetrics.commissionModel}</div>
                
                <div className="text-xs text-slate-400 mb-1">معدل التحويل المتوقع (CR)</div>
                <div className="text-sm font-bold text-emerald-400 mb-3">{selectedModel.financialMetrics.conversionRate}</div>

                <div className="text-xs text-slate-400 mb-1">عدد المتاجر المعروضة عادةً</div>
                <div className="text-sm font-bold text-cyan-300">{selectedModel.brandIntegration.numberOfBrands}</div>
              </div>
            </div>

            {/* Deep dive 3-Column details */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Column 1: SEO Strategy */}
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5 text-right">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-3">
                  <Search className="w-4 h-4" />
                  <span>استراتيجية تصدر قوقل (Google SEO)</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">نمط الكلمات المفتاحية الأساسية:</span>
                    <ul className="space-y-1 text-slate-200 font-medium">
                      {selectedModel.googleSeoStrategy.primaryKeywordsPattern.map((kw, i) => (
                        <li key={i} className="bg-slate-800/80 px-2.5 py-1 rounded border border-slate-700/50">
                          {kw}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">تنسيق المحتوى (Content Format):</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-2 rounded">
                      {selectedModel.googleSeoStrategy.contentFormat}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">ترميز البيانات المهيكلة (Schema):</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedModel.googleSeoStrategy.schemaTypes.map((schema, i) => (
                        <span key={i} className="bg-emerald-500/10 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/20">
                          {schema}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: How brands are linked & displayed */}
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5 text-right">
                <div className="flex items-center gap-2 text-teal-400 font-bold text-sm mb-3">
                  <Code className="w-4 h-4" />
                  <span>طريقة ربط وعرض البراندات والمتاجر</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">آلية الربط التقني:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-2 rounded">
                      {selectedModel.brandIntegration.method}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">شكل العرض البصري (Display Style):</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-2 rounded">
                      {selectedModel.brandIntegration.displayType}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">معايير وسم الروابط في قوقل:</span>
                    <p className="text-slate-300 leading-relaxed bg-slate-800/40 p-2 rounded font-mono text-[11px] text-amber-300">
                      {selectedModel.brandIntegration.typicalLinksStyle}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3: Real Benchmarks & Revenue Proof */}
              <div className="bg-slate-900/60 border border-slate-700/60 rounded-2xl p-5 text-right">
                <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm mb-3">
                  <DollarSign className="w-4 h-4" />
                  <span>دراسات حالة بالأرقام الواقعية</span>
                </div>

                <div className="space-y-3 text-xs">
                  {selectedModel.benchmarks.map((bm, i) => (
                    <div key={i} className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white text-sm">{bm.name}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                          {bm.monthlyVisits} زيارة
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                        <span>نسبة الزيارات من قوقل: <strong className="text-white">{bm.organicTrafficShare}</strong></span>
                        <span>الإيرادات التقديرية: <strong className="text-emerald-300">{bm.estimatedAnnualRevenue}</strong></span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                        {bm.keyStrength}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Why Google Ranks it vs Warnings */}
            <div className="mt-6 pt-6 border-t border-slate-700/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 text-right">
                <div className="flex items-center gap-2 text-emerald-400 font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>أسباب تصدر هذا النموذج وتفضيل قوقل له:</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {selectedModel.whyGoogleRanksIt.map((reason, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 text-right">
                <div className="flex items-center gap-2 text-amber-400 font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>تحذيرات تجنب عقوبة Google HCU (Helpful Content):</span>
                </div>
                <ul className="space-y-1.5 text-slate-300">
                  {selectedModel.keyRisksAndHcuWarnings.map((warn, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

          </div>
        )}

      </div>
    </section>
  );
};
