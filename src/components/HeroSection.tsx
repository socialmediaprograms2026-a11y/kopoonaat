import React from "react";
import { Search, ArrowUpRight, BarChart3, Layers, Shield, Sparkles } from "lucide-react";

interface HeroSectionProps {
  onExploreModels: () => void;
  onExploreNiches: () => void;
  onOpenAiModal: () => void;
  onOpenSearchModal?: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreModels,
  onExploreNiches,
  onOpenAiModal,
  onOpenSearchModal
}) => {
  return (
    <div className="relative overflow-hidden bg-white border-b border-slate-200 py-12 md:py-16">
      {/* Background subtle glow effect */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top badge */}
        <div className="flex items-center justify-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full text-xs font-medium text-emerald-800 mb-6 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            دليل استراتيجي للمواقع متعددة المتاجر والبراندات (Multi-Store Affiliate Architecture)
          </div>
        </div>

        {/* Main Heading */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-snug sm:leading-tight">
            نماذج مواقع التسويق بالعمولة الناجحة{" "}
            <span className="text-emerald-700">
              المتصدرة لمحرك بحث جوجل
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            تحليل شامل للنماذج العالمية والعربية التي تجمع عروض ومقارنات وكوبونات عدة براندات وشركات في موقع واحد، وتعتمد كلياً على زوار جوجل المجانيين لتحقيق إحالات ومبيعات مستمرة دون الحاجة لإعلانات ممولة.
          </p>
        </div>

        {/* 4 Core Pillars of Multi-Store SEO Affiliate Websites */}
        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-5xl mx-auto">
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">85M+</div>
            <div className="text-xs font-bold text-slate-800 mt-1">حجم بحث شهري مستهدف</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              كلمات بحث ذات نية شرائية عالية (Best X, Review, كود خصم).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-3">
              <Layers className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">6 نماذج</div>
            <div className="text-xs font-bold text-slate-800 mt-1">هياكل مواقع مثبتة النجاح</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              من بوابات الكوبونات وأدلة المراجعات إلى محركات مقارنة البرمجيات.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">3% - 40%</div>
            <div className="text-xs font-bold text-slate-800 mt-1">معدل العمولات الموزعة</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              تتراوح بين عمولات سلة الشراء والدفعات المتكررة شهرياً (Recurring).
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right hover:border-slate-300 transition-colors shadow-xs">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-3">
              <Shield className="w-5 h-5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900">معايير EEAT</div>
            <div className="text-xs font-bold text-slate-800 mt-1">حماية من تحديثات قوقل</div>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              بنية سايلو واختبارات واقعية لتفادي عقوبات Helpful Content.
            </p>
          </div>

        </div>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {onOpenSearchModal && (
            <button
              onClick={onOpenSearchModal}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <Search className="w-4 h-4 text-emerald-400" />
              <span>البحث الذكي في المتاجر والكوبونات (Ctrl+K)</span>
            </button>
          )}

          <button
            onClick={onExploreModels}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <span>استعراض النماذج الـ 6 وأمثلتها الواقعية</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>

          <button
            onClick={onExploreNiches}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-200 transition-all cursor-pointer shadow-xs"
          >
            <span>جدول النيشات وأحجام البحث الشهرية</span>
          </button>

          <button
            onClick={onOpenAiModal}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-sm border border-emerald-300 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>فحص نيش خاص بك (AI Keyword Scanner)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
