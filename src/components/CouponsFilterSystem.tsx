import React, { useState } from "react";
import { 
  Filter, 
  Percent, 
  ArrowUpDown, 
  SlidersHorizontal, 
  Flame, 
  Star, 
  Tag, 
  Check, 
  X, 
  RotateCcw,
  Sparkles,
  Shirt,
  Smartphone,
  Utensils,
  ShoppingBag,
  HeartPulse,
  LayoutGrid
} from "lucide-react";
import { POPULAR_CATEGORIES } from "../data/couponsData";

export type SortOption = "highest-discount" | "popular" | "rating" | "alphabetical";
export type DiscountRange = "all" | "50plus" | "20to50" | "under20";

interface CouponsFilterSystemProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  discountRange: DiscountRange;
  onDiscountRangeChange: (range: DiscountRange) => void;
  onlyExclusive: boolean;
  onToggleExclusive: () => void;
  minRating48: boolean;
  onToggleMinRating48: () => void;
  categoryCounts: Record<string, number>;
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

export const CouponsFilterSystem: React.FC<CouponsFilterSystemProps> = ({
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  discountRange,
  onDiscountRangeChange,
  onlyExclusive,
  onToggleExclusive,
  minRating48,
  onToggleMinRating48,
  categoryCounts,
  totalCount,
  filteredCount,
  onResetFilters,
}) => {
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false);

  // Category Icon Resolver
  const getCategoryIcon = (id: string) => {
    switch (id) {
      case "أزياء وموضة":
        return <Shirt className="w-4 h-4" />;
      case "إلكترونيات وجوالات":
        return <Smartphone className="w-4 h-4" />;
      case "عطور وتجميل":
        return <Sparkles className="w-4 h-4" />;
      case "توصيل ومطاعم":
        return <Utensils className="w-4 h-4" />;
      case "سوبرماركت ومستلزمات":
        return <ShoppingBag className="w-4 h-4" />;
      case "صحة ومكملات":
        return <HeartPulse className="w-4 h-4" />;
      default:
        return <LayoutGrid className="w-4 h-4" />;
    }
  };

  const hasActiveFilters = 
    selectedCategory !== "all" || 
    sortBy !== "popular" || 
    discountRange !== "all" || 
    onlyExclusive || 
    minRating48;

  const activeFiltersCount = 
    (selectedCategory !== "all" ? 1 : 0) + 
    (sortBy !== "popular" ? 1 : 0) + 
    (discountRange !== "all" ? 1 : 0) + 
    (onlyExclusive ? 1 : 0) + 
    (minRating48 ? 1 : 0);

  return (
    <div id="coupons-advanced-filter-system" className="mb-8 space-y-4 font-['Cairo',sans-serif]">
      {/* Top Filter Bar: Categories + Sort Control */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl backdrop-blur-md">
        
        {/* Row 1: Header with Counts & Advanced Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
              <Filter className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <span>تصفية وتصنيف المتاجر</span>
                {activeFiltersCount > 0 && (
                  <span className="text-[11px] bg-emerald-500 text-slate-950 font-bold px-2 py-0.5 rounded-full">
                    {activeFiltersCount} فلتر مفعّل
                  </span>
                )}
              </h3>
              <p className="text-[11px] text-slate-400">
                صنّف حسب الأقسام (أزياء، إلكترونيات، تجميل) أو رتّب حسب أعلى نسبة توفير
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center w-full sm:w-auto justify-between sm:justify-end">
            {/* Toggle Advanced Filters Button */}
            <button
              id="btn-toggle-advanced-filters"
              onClick={() => setShowAdvancedDrawer(!showAdvancedDrawer)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all ${
                showAdvancedDrawer || discountRange !== "all" || onlyExclusive || minRating48
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>فلاتر الخصم المتقدمة</span>
              {(discountRange !== "all" || onlyExclusive || minRating48) && (
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                id="btn-reset-all-filters"
                onClick={onResetFilters}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800/60 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/60 text-xs font-bold flex items-center gap-1 transition-all"
                title="إعادة ضبط الفلاتر"
              >
                <RotateCcw className="w-3 h-3" />
                <span>إعادة تعيين</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Sort By Tabs + Quick Category Carousel */}
        <div className="space-y-3.5">
          
          {/* Sorting Selector Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="font-bold text-slate-200">الترتيب حسب:</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-950/90 rounded-2xl border border-slate-800 text-xs font-bold">
              
              {/* Highest Discount First Option */}
              <button
                id="sort-highest-discount"
                onClick={() => onSortChange("highest-discount")}
                className={`px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  sortBy === "highest-discount"
                    ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20 font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Percent className="w-3.5 h-3.5" />
                <span>أعلى نسبة خصم</span>
                <Flame className={`w-3 h-3 ${sortBy === "highest-discount" ? "text-slate-950 fill-slate-950" : "text-amber-400"}`} />
              </button>

              {/* Most Popular */}
              <button
                id="sort-popular"
                onClick={() => onSortChange("popular")}
                className={`px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  sortBy === "popular"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>الأكثر طلباً وشعبية</span>
              </button>

              {/* Highest Rating */}
              <button
                id="sort-rating"
                onClick={() => onSortChange("rating")}
                className={`px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  sortBy === "rating"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>الأعلى تقييماً</span>
              </button>

              {/* Alphabetical */}
              <button
                id="sort-alphabetical"
                onClick={() => onSortChange("alphabetical")}
                className={`px-3 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                  sortBy === "alphabetical"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                    : "text-slate-300 hover:text-white hover:bg-slate-900"
                }`}
              >
                <span>أبجدياً (أ - ي)</span>
              </button>

            </div>
          </div>

          {/* Categories Horizontal Tabs with Counters */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>تصنيف المتاجر حسب الفئة:</span>
              </span>
              <span className="text-[11px] text-slate-400">
                متاح {totalCount} متجر موثق
              </span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
              {POPULAR_CATEGORIES.map((cat) => {
                const count = categoryCounts[cat.id] ?? 0;
                const isSelected = selectedCategory === cat.id;

                return (
                  <button
                    key={cat.id}
                    id={`filter-category-${cat.id}`}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 shrink-0 border ${
                      isSelected
                        ? "bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20"
                        : "bg-slate-950/80 hover:bg-slate-800/90 text-slate-300 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className={isSelected ? "text-slate-950" : "text-emerald-400"}>
                      {getCategoryIcon(cat.id)}
                    </span>
                    <span>{cat.name}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      isSelected ? "bg-slate-950/30 text-slate-950" : "bg-slate-800 text-slate-400"
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Collapsible Advanced Filters Drawer: Discount Ranges & Exclusive Toggles */}
        {showAdvancedDrawer && (
          <div className="mt-4 pt-4 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-200">
            
            {/* Filter by Discount Bracket / Percentage */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2.5">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>تصفية حسب نسبة التخفيض:</span>
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  id="range-all"
                  onClick={() => onDiscountRangeChange("all")}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center justify-between ${
                    discountRange === "all"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>جميع نسب الخصم</span>
                  {discountRange === "all" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  id="range-50plus"
                  onClick={() => onDiscountRangeChange("50plus")}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center justify-between ${
                    discountRange === "50plus"
                      ? "bg-amber-500/20 border-amber-500 text-amber-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <span>خصم 50% فأكثر</span>
                    <Flame className="w-3 h-3 text-amber-400" />
                  </span>
                  {discountRange === "50plus" && <Check className="w-3.5 h-3.5 text-amber-400" />}
                </button>

                <button
                  id="range-20to50"
                  onClick={() => onDiscountRangeChange("20to50")}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center justify-between ${
                    discountRange === "20to50"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>خصم 20% - 49%</span>
                  {discountRange === "20to50" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>

                <button
                  id="range-under20"
                  onClick={() => onDiscountRangeChange("under20")}
                  className={`p-2 rounded-xl border text-right transition-all flex items-center justify-between ${
                    discountRange === "under20"
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                      : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                  }`}
                >
                  <span>خصومات حتى 20%</span>
                  {discountRange === "under20" && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </button>
              </div>
            </div>

            {/* Quality & Exclusivity Toggles */}
            <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-2.5">
                <Star className="w-3.5 h-3.5 text-emerald-400" />
                <span>خيارات إضافية:</span>
              </span>

              <div className="space-y-2 text-xs">
                <label 
                  id="toggle-exclusive-codes"
                  onClick={onToggleExclusive}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <span className="text-slate-300">أكواد وكوبونات حصرية فقط</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    onlyExclusive ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 bg-slate-950"
                  }`}>
                    {onlyExclusive && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </label>

                <label 
                  id="toggle-rating-48"
                  onClick={onToggleMinRating48}
                  className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <span className="text-slate-300">متاجر بتقييم عالي (4.8 ★ فأكثر)</span>
                  <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                    minRating48 ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700 bg-slate-950"
                  }`}>
                    {minRating48 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </label>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Active Filter Chips Pill Row (if any filter active) */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-900/50 p-2.5 rounded-2xl border border-slate-800/80">
          <span className="text-slate-400 font-bold flex items-center gap-1 text-[11px]">
            <span>الفلاتر النشطة:</span>
          </span>

          {selectedCategory !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span>قسم: {selectedCategory}</span>
              <button onClick={() => onSelectCategory("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {sortBy !== "popular" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <span>
                {sortBy === "highest-discount" && "أعلى نسبة خصم أولاً"}
                {sortBy === "rating" && "الأعلى تقييماً"}
                {sortBy === "alphabetical" && "أبجدياً"}
              </span>
              <button onClick={() => onSortChange("popular")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {discountRange !== "all" && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span>
                {discountRange === "50plus" && "خصم 50% فأكثر"}
                {discountRange === "20to50" && "خصم 20% - 49%"}
                {discountRange === "under20" && "خصومات حتى 20%"}
              </span>
              <button onClick={() => onDiscountRangeChange("all")} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {onlyExclusive && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span>كوبونات حصرية</span>
              <button onClick={onToggleExclusive} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {minRating48 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              <span>تقييم 4.8+</span>
              <button onClick={onToggleMinRating48} className="hover:text-white">
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          <span className="mr-auto text-[11px] text-slate-400">
            عرض <strong className="text-white font-bold">{filteredCount}</strong> من أصل {totalCount} متجر
          </span>
        </div>
      )}
    </div>
  );
};
