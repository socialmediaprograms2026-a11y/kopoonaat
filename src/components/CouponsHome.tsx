import React, { useState, useMemo } from "react";
import { SAUDI_STORE_BRANDS, POPULAR_CATEGORIES } from "../data/couponsData";
import { SAUDI_PRODUCTS } from "../data/productsData";
import { StoreBrand, CouponItem } from "../types";
import { CouponsFilterSystem, SortOption, DiscountRange } from "./CouponsFilterSystem";
import { executeSmartSearch } from "../utils/arabicSearchEngine";
import { LazyBrandLogo } from "./common/LazyBrandLogo";
import { trackAffiliateClick, trackCouponCopy } from "../utils/analytics";
import { copyToClipboardSafe } from "../utils/clipboard";
import { ProductsShowcaseSection } from "./ProductsShowcaseSection";
import { 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  ShoppingBag, 
  Tag, 
  Zap, 
  Store,
  ChevronLeft,
  Flame,
  Percent,
  RotateCcw,
  DollarSign,
  Key,
  Mic,
  MicOff,
  Command
} from "lucide-react";

interface CouponsHomeProps {
  onSelectBrand: (brand: StoreBrand) => void;
  onOpenCouponModal: (coupon: CouponItem, brand: StoreBrand) => void;
  brands?: StoreBrand[];
  onOpenAffiliateModal?: () => void;
  configuredAffiliateCount?: number;
  onNavigateToProducts?: () => void;
}

export function getStoreMaxDiscount(brand: StoreBrand): number {
  let max = 0;
  brand.coupons.forEach((c) => {
    const matches = c.discount.match(/\d+/g);
    if (matches) {
      matches.forEach((numStr) => {
        const val = parseInt(numStr, 10);
        if (val > max && val <= 100) {
          max = val;
        }
      });
    }
  });
  return max > 0 ? max : 10;
}

export const CouponsHome: React.FC<CouponsHomeProps> = ({
  onSelectBrand,
  onOpenCouponModal,
  brands = SAUDI_STORE_BRANDS,
  onOpenAffiliateModal,
  configuredAffiliateCount = 0,
  onNavigateToProducts
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("popular");
  const [discountRange, setDiscountRange] = useState<DiscountRange>("all");
  const [onlyExclusive, setOnlyExclusive] = useState<boolean>(false);
  const [minRating48, setMinRating48] = useState<boolean>(false);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Compute smart search results
  const searchResults = useMemo(() => {
    return executeSmartSearch(searchQuery, brands, POPULAR_CATEGORIES);
  }, [searchQuery, brands]);

  // Compute store counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: brands.length };
    POPULAR_CATEGORIES.forEach((cat) => {
      if (cat.id !== "all") {
        counts[cat.id] = brands.filter((b) => b.category === cat.id).length;
      }
    });
    return counts;
  }, [brands]);

  // Voice search toggle
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "ar-SA";
      recognition.continuous = false;
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setSearchQuery(transcript);
        }
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Filter and sort brands
  const filteredBrands = useMemo(() => {
    const matchedBrandIds = searchQuery.trim() 
      ? new Set(searchResults.groupedResults.stores.map((s) => s.rawBrand?.id).filter(Boolean))
      : null;

    let list = brands.filter((brand) => {
      // 1. Search Query (via Smart Engine with Synonyms, Typos & Arabic Normalization)
      if (matchedBrandIds && !matchedBrandIds.has(brand.id)) {
        return false;
      }

      // 2. Category Filter
      const matchesCategory = 
        selectedCategory === "all" || brand.category === selectedCategory;

      // 3. Discount Range Filter
      const maxDiscount = getStoreMaxDiscount(brand);
      let matchesDiscountRange = true;
      if (discountRange === "50plus") {
        matchesDiscountRange = maxDiscount >= 50;
      } else if (discountRange === "20to50") {
        matchesDiscountRange = maxDiscount >= 20 && maxDiscount < 50;
      } else if (discountRange === "under20") {
        matchesDiscountRange = maxDiscount < 20;
      }

      // 4. Exclusive Filter
      let matchesExclusive = true;
      if (onlyExclusive) {
        matchesExclusive = brand.coupons.some(c => c.isExclusive);
      }

      // 5. High Rating Filter
      let matchesRating = true;
      if (minRating48) {
        matchesRating = brand.rating >= 4.8;
      }

      return matchesCategory && matchesDiscountRange && matchesExclusive && matchesRating;
    });

    // Sort order
    list = [...list].sort((a, b) => {
      if (sortBy === "highest-discount") {
        const discA = getStoreMaxDiscount(a);
        const discB = getStoreMaxDiscount(b);
        if (discB !== discA) return discB - discA;
        return b.rating - a.rating;
      }
      if (sortBy === "rating") {
        return b.rating - a.rating;
      }
      if (sortBy === "alphabetical") {
        return a.arabicName.localeCompare(b.arabicName, "ar");
      }
      // "popular"
      const usedA = a.coupons.reduce((sum, c) => sum + (c.timesUsedToday || 0), 0);
      const usedB = b.coupons.reduce((sum, c) => sum + (c.timesUsedToday || 0), 0);
      if (usedB !== usedA) return usedB - usedA;
      return b.rating - a.rating;
    });

    return list;
  }, [searchQuery, searchResults, selectedCategory, discountRange, onlyExclusive, minRating48, sortBy, brands]);

  const handleResetFilters = () => {
    setSelectedCategory("all");
    setSortBy("popular");
    setDiscountRange("all");
    setOnlyExclusive(false);
    setMinRating48(false);
    setSearchQuery("");
  };

  // Featured top active codes across all stores for fast 1-click access
  const topFeaturedCoupons = useMemo(() => {
    const list: { brand: StoreBrand; coupon: CouponItem }[] = [];
    brands.forEach((brand) => {
      if (brand.coupons.length > 0 && brand.featured) {
        list.push({ brand, coupon: brand.coupons[0] });
      }
    });
    return list.slice(0, 6);
  }, [brands]);

  const handleCopyCode = async (coupon: CouponItem, brand: StoreBrand, e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboardSafe(coupon.code, {
      brandName: brand.name,
      merchantId: brand.id,
      couponId: coupon.id
    });
    setCopiedCodeId(coupon.id);
    onOpenCouponModal(coupon, brand);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 3000);
  };

  const handleDirectLink = (target: string, e: React.MouseEvent, brandName?: string, merchantId?: string) => {
    e.stopPropagation();
    // If target is already a /go/ path, use it directly, otherwise route
    const trackingUrl = target.startsWith("/go/") ? target : target.startsWith("http") ? target : `/go/${target}`;
    if (brandName) {
      trackAffiliateClick(brandName, "HOME_DEAL", trackingUrl, merchantId, "home_card");
    }
    window.open(trackingUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="w-full text-right font-['Cairo',sans-serif]">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-50/70 via-slate-50 to-white pt-10 pb-12 px-4 border-b border-slate-200">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-300 text-xs font-bold mb-4">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>كوبونات السعودية والخليج 2026 | فحص وتحديث فوري اليوم</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
            أقوى <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600">كوبونات وخصومات</span> المتاجر الإلكترونية
          </h1>
          
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            وفّر أموالك مع أكواد خصم حصرية مجربة 100% لأكبر المتاجر في المملكة العربية السعودية والعالم العربي. انسخ الكود بضغطة واحدة وتوجه للشراء مباشرة.
          </p>

          {/* Instant Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <div className="relative flex items-center">
              <input
                id="coupons-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن متجرك المفضل: نون، نمشي، أمازون، نايس ون، ستايلي..."
                className="w-full py-4 pr-12 pl-24 bg-white border-2 border-slate-300 focus:border-emerald-600 rounded-2xl text-slate-900 placeholder-slate-400 text-sm sm:text-base outline-none shadow-xl transition-all text-right"
              />
              <Search className="w-5 h-5 text-slate-400 absolute right-4 pointer-events-none" />
              
              {/* Right side controls: Clear & Voice */}
              <div className="absolute left-3 flex items-center gap-1.5">
                {searchQuery && (
                  <button
                    id="btn-clear-search"
                    onClick={() => setSearchQuery("")}
                    className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-xl transition-colors"
                  >
                    مسح
                  </button>
                )}

                {/* Voice Search Button */}
                <button
                  type="button"
                  onClick={toggleVoiceSearch}
                  className={`p-2 rounded-xl transition-all ${
                    isListening
                      ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/20"
                      : "bg-slate-100 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                  }`}
                  title={isListening ? "جاري الاستماع... تحدث الآن" : "بحث صوتي عربي"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Voice listening indicator */}
            {isListening && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 py-1.5 px-3 rounded-xl animate-fade-in">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                <span>الميكروفون نشط.. تحدث باسم المتجر أو الكوبون الآن...</span>
              </div>
            )}

            {/* Autocorrect suggestion if available */}
            {searchResults.correctedQuery && searchResults.correctedQuery !== searchQuery && (
              <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-slate-600 bg-emerald-50 border border-emerald-200 py-1.5 px-3 rounded-xl">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>هل تقصد:</span>
                <button
                  onClick={() => setSearchQuery(searchResults.correctedQuery!)}
                  className="font-bold text-emerald-700 underline cursor-pointer"
                >
                  {searchResults.correctedQuery}
                </button>
              </div>
            )}

            {/* Quick Hero Category & Discount Tag Shortcuts */}
            <div className="flex items-center justify-center gap-1.5 flex-wrap text-xs mt-3 text-slate-500">
              <span className="text-[11px] font-bold text-slate-600">وصول سريع:</span>
              <button
                onClick={() => { setSelectedCategory("أزياء وموضة"); setSearchQuery(""); }}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  selectedCategory === "أزياء وموضة" 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                أزياء وموضة
              </button>
              <button
                onClick={() => { setSelectedCategory("إلكترونيات وجوالات"); setSearchQuery(""); }}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  selectedCategory === "إلكترونيات وجوالات" 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                إلكترونيات
              </button>
              <button
                onClick={() => { setSelectedCategory("عطور وتجميل"); setSearchQuery(""); }}
                className={`px-2.5 py-1 rounded-lg border text-xs transition-colors ${
                  selectedCategory === "عطور وتجميل" 
                    ? "bg-emerald-100 text-emerald-800 border-emerald-400 font-bold" 
                    : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                عطور وتجميل
              </button>
              <button
                onClick={() => { setSortBy("highest-discount"); setSearchQuery(""); }}
                className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors flex items-center gap-1 ${
                  sortBy === "highest-discount" 
                    ? "bg-amber-100 text-amber-900 border-amber-400 font-black" 
                    : "bg-amber-50 border-amber-200 text-amber-800 hover:bg-amber-100"
                }`}
              >
                <Percent className="w-3 h-3" />
                <span>أعلى نسبة خصم 🔥</span>
              </button>
            </div>

            {/* Monetization Action Banner */}
            {onOpenAffiliateModal && (
              <div className="mt-5 p-3.5 rounded-2xl bg-white border border-emerald-300/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-right">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      هل تريد أن تدر هذه الأكواد والروابط أرباحاً في حسابك البنكي؟
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {configuredAffiliateCount > 0 
                        ? `لديك الآن ${configuredAffiliateCount} متجراً مفعلاً بأكوادك وروابطك الخاصة التي تحتسب الأرباح لك.`
                        : "اربط حساباتك في نون، أمازون، عرب كليكس، وآي هيرب لتحصل على عمولة نقدية عند كل شراء."}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenAffiliateModal}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 w-full sm:w-auto justify-center"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{configuredAffiliateCount > 0 ? "إدارة أكوادي وروابطي" : "تفعيل أرباحي الحقيقية"}</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Advanced Filters System */}
        <CouponsFilterSystem
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          sortBy={sortBy}
          onSortChange={(sort) => setSortBy(sort)}
          discountRange={discountRange}
          onDiscountRangeChange={(range) => setDiscountRange(range)}
          onlyExclusive={onlyExclusive}
          onToggleExclusive={() => setOnlyExclusive(!onlyExclusive)}
          minRating48={minRating48}
          onToggleMinRating48={() => setMinRating48(!minRating48)}
          categoryCounts={categoryCounts}
          totalCount={brands.length}
          filteredCount={filteredBrands.length}
          onResetFilters={handleResetFilters}
        />

        {/* Top Fast-Access Codes Strip (Daily Highlights) - Shown when viewing all */}
        {!searchQuery && selectedCategory === "all" && sortBy === "popular" && discountRange === "all" && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  أقوى الأكواد الأكثر طلباً في السعودية اليوم
                </h2>
              </div>
              <span className="text-xs text-emerald-700 font-bold hidden sm:inline">
                انسخ فوراً بدون انتظار
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {topFeaturedCoupons.map(({ brand, coupon }) => (
                <div
                  key={coupon.id}
                  className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-300 rounded-2xl p-4 transition-all shadow-sm hover:shadow-md group relative"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <LazyBrandLogo
                        logoUrl={brand.logoUrl}
                        logoText={brand.logoText}
                        logoBg={brand.logoBg}
                        brandName={brand.arabicName}
                        size="sm"
                        className="shadow"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {brand.arabicName}
                        </h4>
                        <span className="text-[11px] text-emerald-700 font-bold">
                          {coupon.discount}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-mono border border-slate-200">
                      {coupon.successRate}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 mb-3">
                    {coupon.title}
                  </p>

                  {/* Code Box with 1-click copy */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleCopyCode(coupon, brand, e)}
                      className={`flex-1 py-2 px-3 rounded-xl border-2 border-dashed font-mono text-xs font-black flex items-center justify-between transition-all ${
                        copiedCodeId === coupon.id
                          ? "bg-emerald-600 border-emerald-600 text-white"
                          : "bg-emerald-50/60 border-emerald-400 text-emerald-800 hover:bg-emerald-100"
                      }`}
                      title="انقر لنسخ الكود"
                    >
                      <span className="tracking-wider">{coupon.code}</span>
                      <span className="text-[10px] flex items-center gap-1 font-sans">
                        {copiedCodeId === coupon.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copiedCodeId === coupon.id ? "تم" : "نسخ"}
                      </span>
                    </button>

                    <button
                      onClick={(e) => handleDirectLink(coupon.affiliateUrl || brand.affiliateUrl, e)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors shrink-0"
                      title="الشراء من الرابط مباشرة"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Featured Products Section (Products Table with Direct Affiliate Purchase) */}
        {!searchQuery && selectedCategory === "all" && sortBy === "popular" && discountRange === "all" && (
          <ProductsShowcaseSection
            products={SAUDI_PRODUCTS}
            brands={brands}
            onSelectBrand={onSelectBrand}
            onNavigateToProducts={onNavigateToProducts}
            maxDisplay={8}
          />
        )}

        {/* All Brands Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <Store className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {searchQuery 
                ? `نتائج البحث عن "${searchQuery}"`
                : selectedCategory !== "all"
                ? `متاجر وقسائم: ${selectedCategory}`
                : sortBy === "highest-discount"
                ? "أعلى المتاجر نسبة خصم في السعودية"
                : "دليل المتاجر السعودية وصفحات البراندات"}
            </h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full font-mono border border-slate-200">
              {filteredBrands.length} متجر
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            {sortBy === "highest-discount" && (
              <span className="text-amber-800 font-bold flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-300">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>مرتبة من أعلى نسبة توفير</span>
              </span>
            )}
            <span className="hidden sm:inline">
              اضغط على أي متجر لفتح صفحته المخصصة وكافة عروضه
            </span>
          </div>
        </div>

        {/* Empty State */}
        {filteredBrands.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <ShoppingBag className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">لم نعثر على متجر يطابق فلاتر البحث الحالية</h3>
            <p className="text-sm text-slate-500 mb-5">
              قد لا توجد نتائج مطابقة لمزيج التصنيف ونسبة الخصم المحددة. جرب إعادة ضبط الفلاتر للاطلاع على جميع المتاجر.
            </p>
            <button
              id="btn-empty-reset-filters"
              onClick={handleResetFilters}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-lg shadow-emerald-600/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة تعيين جميع الفلاتر</span>
            </button>
          </div>
        )}

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredBrands.map((brand) => {
            const topCoupon = brand.coupons[0];
            const maxDiscount = getStoreMaxDiscount(brand);

            return (
              <div
                key={brand.id}
                id={`store-card-${brand.id}`}
                onClick={() => onSelectBrand(brand)}
                className="bg-white hover:bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-3xl p-5 sm:p-6 transition-all shadow-sm hover:shadow-md flex flex-col justify-between cursor-pointer group hover:-translate-y-0.5"
              >
                <div>
                  {/* Top Store Header */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <LazyBrandLogo
                        logoUrl={brand.logoUrl}
                        logoText={brand.logoText}
                        logoBg={brand.logoBg}
                        brandName={brand.arabicName}
                        size="lg"
                        className="shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-base font-black text-slate-900 group-hover:text-emerald-700 transition-colors">
                            {brand.arabicName}
                          </h3>
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="كود فعال اليوم" />
                        </div>
                        <span className="text-xs text-slate-500 block mt-0.5">
                          {brand.category}
                        </span>
                      </div>
                    </div>

                    <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 shrink-0 font-medium">
                      {brand.country.split(" ")[0]} 🇸🇦
                    </span>
                  </div>

                  {/* Maximum Discount Highlight Badge */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black border transition-all ${
                      maxDiscount >= 50
                        ? "bg-amber-100/80 text-amber-900 border-amber-300"
                        : maxDiscount >= 20
                        ? "bg-emerald-100/80 text-emerald-900 border-emerald-300"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>
                      <Flame className={`w-3.5 h-3.5 ${maxDiscount >= 50 ? "text-amber-600 fill-amber-500" : "text-emerald-600"}`} />
                      <span>خصم يصل إلى {maxDiscount}%</span>
                    </div>

                    {topCoupon?.isExclusive && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                        كود حصري
                      </span>
                    )}
                  </div>

                  {/* Store Tagline */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-2">
                    {brand.tagline}
                  </p>

                  {/* Top Active Code Box */}
                  {topCoupon && (
                    <div className="bg-slate-50 border border-slate-200 group-hover:border-emerald-300 rounded-2xl p-3 mb-4 transition-colors">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-500">أقوى كود حالياً:</span>
                        <span className="text-emerald-700 font-bold">{topCoupon.discount}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {topCoupon.type === "coupon" ? (
                          <button
                            id={`btn-copy-code-${brand.id}-${topCoupon.id}`}
                            onClick={(e) => handleCopyCode(topCoupon, brand, e)}
                            className={`flex-1 py-2 px-3 rounded-xl border-2 border-dashed font-mono text-xs font-black flex items-center justify-between transition-all ${
                              copiedCodeId === topCoupon.id
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "bg-white border-emerald-400 text-emerald-800 hover:bg-emerald-50"
                            }`}
                          >
                            <span className="tracking-wider">{topCoupon.code}</span>
                            <span className="text-[10px] flex items-center gap-1 font-sans">
                              {copiedCodeId === topCoupon.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              {copiedCodeId === topCoupon.id ? "تم النسخ" : "نسخ الكود"}
                            </span>
                          </button>
                        ) : (
                          <button
                            id={`btn-activate-deal-${brand.id}`}
                            onClick={(e) => handleDirectLink(topCoupon.affiliateUrl || brand.affiliateUrl, e, brand.name, brand.id)}
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <span>تفعيل العرض المباشر</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        )}

                        <button
                          id={`btn-shop-direct-${brand.id}`}
                          onClick={(e) => handleDirectLink(topCoupon.affiliateUrl || brand.affiliateUrl, e, brand.name, brand.id)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                          title="الشراء من الرابط مباشرة"
                        >
                          <ShoppingBag className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{brand.rating}</span>
                    <span className="text-slate-400 font-normal">({brand.coupons.length} عروض)</span>
                  </div>

                  <span className="text-emerald-700 font-bold flex items-center gap-1 group-hover:gap-1.5 transition-all text-xs">
                    <span>صفحة المتجر</span>
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Why Our Site is Simple & Fast Section */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-center mb-8 shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-2">
            موقع كوبونات صُمم ليختصر عليك الوقت والمال
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto mb-6">
            بدون إعلانات مزعجة وبدون روابط مضللة؛ نسخ مباشر وشراء فوري بأعلى نسب خصم حقيقية للمستهلك السعودي.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-right text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5">
                <Copy className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">نسخ فوري بنقرة واحدة</h4>
              <p className="text-slate-600 leading-relaxed">
                اضغط على الكود ليتم نسخه فوراً لجهازك ونقلك إلى صفحة المتجر مباشرة لتفعيل الخصم.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">فحص يومي مستمر</h4>
              <p className="text-slate-600 leading-relaxed">
                نستبعد الأكواد المنتهية تلقائياً ونحدث نسب الخصم والشروط بصفة دورية لضمان عملها 100%.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div className="w-8 h-8 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2.5">
                <Zap className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 mb-1">مهيأ لمحركات البحث (سيو)</h4>
              <p className="text-slate-600 leading-relaxed">
                صفحات خفيفة وسريعة التحميل مع بيانات منظمة (Schema) لتظهر في قوقل متصدرة من أول يوم.
              </p>
            </div>
          </div>
        </div>

        {/* SEO Knowledge Hub & Comparison Table */}
        <section className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs text-right">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-4 flex items-center gap-2">
              <Percent className="w-6 h-6 text-emerald-600" />
              <span>جدول مقارنة أقوى كوبونات وأكواد الخصم في السعودية 2026</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
              نلخص لك في هذا الجدول المعتمد أحدث أكواد الخصم المفعلة والمجربة لأشهر المتاجر في السعودية ودول الخليج، مع توضيح نسبة الخصم وحالة الفحص لضمان أقصى توفير عند كل عملية شراء.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-slate-200 mb-8">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-black">
                  <tr>
                    <th className="p-3.5">المتجر</th>
                    <th className="p-3.5">أقوى كود خصم</th>
                    <th className="p-3.5">نسبة الخصم</th>
                    <th className="p-3.5">حالة الكود</th>
                    <th className="p-3.5 text-center">التفعيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {brands.slice(0, 8).map((b) => {
                    const topC = b.coupons[0];
                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <button
                            onClick={() => onSelectBrand(b)}
                            className="text-emerald-700 hover:text-emerald-900 font-bold hover:underline cursor-pointer"
                          >
                            كود خصم {b.arabicName}
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono font-bold bg-slate-100 text-slate-800 px-2 py-1 rounded-md border border-slate-200">
                            {topC?.code || "PROMO"}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-emerald-700">
                          {topC?.discount || "خصم فوري"}
                        </td>
                        <td className="p-3.5">
                          <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium text-[11px]">
                            <ShieldCheck className="w-3 h-3" />
                            مفعل ومجرب
                          </span>
                        </td>
                        <td className="p-3.5 text-center">
                          <button
                            onClick={() => onSelectBrand(b)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                          >
                            نسخ الكود
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Shopping & Saving Guide */}
            <div className="border-t border-slate-200 pt-6">
              <h3 className="text-lg font-black text-slate-900 mb-3">
                دليل المتسوق الذكي: كيف تضمن أعلى نسبة خصم من المتاجر السعودية؟
              </h3>
              <div className="space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                <p>
                  1. <strong>المزج بين العروض الموسمية وأكواد الخصم:</strong> تقدم المتاجر الكبرى مثل نون وأمازون ونمشي تخفيضات دورية في مواسم معينة مثل عروض الجمعة البيضاء، يوم التأسيس، واليوم الوطني. عند تطبيق كود خصم إضافي من موقعنا على المنتجات المخفضة أصلاً، فإن نسبة التوفير الإجمالية قد تصل إلى أكثر من 60% من السعر الأصلي.
                </p>
                <p>
                  2. <strong>الشحن المجاني:</strong> احرص دائماً على مراجعة حد الشحن المجاني لكل متجر لتفادي دفع رسوم التوصيل، أو استخدام أكواد الشحن المجاني المتاحة في صفحة كل متجر.
                </p>
                <p>
                  3. <strong>بطاقات البنوك والمحافظ الرقمية:</strong> غالباً ما توفر بنوك مثل الراجحي، الرياض، والأهلي خصومات بنسبة 10-20% إضافية عند الدفع ببطاقاتهم الائتمانية بالتزامن مع كود الخصم.
                </p>
              </div>
            </div>

            {/* Quick Internal Directory for SEO Crawlers */}
            <div className="border-t border-slate-200 pt-6 mt-6">
              <h4 className="text-sm font-black text-slate-900 mb-3">
                تصفح سريع لكافة كوبونات المتاجر:
              </h4>
              <div className="flex flex-wrap gap-2">
                {brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => onSelectBrand(b)}
                    className="text-xs bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors font-medium cursor-pointer"
                  >
                    كود خصم {b.arabicName} ({b.coupons.length} عروض)
                  </button>
                ))}
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
};

