import React, { useState, useEffect, useRef } from "react";
import { 
  Search, 
  X, 
  Tag, 
  Store, 
  Copy, 
  Check, 
  ExternalLink, 
  Mic, 
  MicOff, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Trash2, 
  ArrowRight,
  Flame,
  Layers,
  ChevronLeft
} from "lucide-react";
import { StoreBrand, CouponItem } from "../types";
import { executeSmartSearch, SearchResultItem } from "../utils/arabicSearchEngine";
import { POPULAR_CATEGORIES } from "../data/couponsData";
import { LazyBrandLogo } from "./common/LazyBrandLogo";

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: StoreBrand[];
  onSelectBrand: (brand: StoreBrand) => void;
  onOpenCouponModal: (coupon: CouponItem, brand: StoreBrand) => void;
  initialQuery?: string;
}

const TRENDING_KEYWORDS = [
  "كود خصم نون KSA10",
  "عروض أمازون برايم",
  "كوبون شي إن",
  "نايس ون عطور ومكياج",
  "نمشي أزياء",
  "آي هيرب مكملات",
  "هنقرستيشن توصيل مجاني",
  "جرير جوالات ولابتوب"
];

const STORAGE_KEY_RECENT = "affiliate_radar_recent_searches";

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({
  isOpen,
  onClose,
  brands,
  onSelectBrand,
  onOpenCouponModal,
  initialQuery = ""
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeFilter, setActiveFilter] = useState<"all" | "stores" | "coupons" | "categories">("all");
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_RECENT);
      if (stored) {
        setRecentSearches(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen]);

  // Execute smart search
  const searchResult = executeSmartSearch(query, brands, POPULAR_CATEGORIES);

  const saveRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    try {
      const updated = [clean, ...recentSearches.filter((s) => s !== clean)].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY_RECENT);
    } catch {
      // ignore
    }
  };

  // Voice Search Web Speech API
  const toggleVoiceSearch = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError("البحث الصوتي غير مدعوم في هذا المتصفح. يرجى تجربة متصفح كروم أو إيدج.");
      setTimeout(() => setSpeechError(null), 4000);
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
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setQuery(transcript);
          saveRecentSearch(transcript);
        }
        setIsListening(false);
      };

      recognition.onerror = (err: any) => {
        console.warn("Speech error:", err);
        setIsListening(false);
        setSpeechError("تعذر التقاط الصوت، يرجى المحاولة مجدداً أو الكتابة يدوياً.");
        setTimeout(() => setSpeechError(null), 4000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e: any) {
      setIsListening(false);
      setSpeechError("حدث خطأ أثناء تشغيل الميكروفون.");
      setTimeout(() => setSpeechError(null), 4000);
    }
  };

  const handleCopyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleSelectStore = (brand: StoreBrand) => {
    saveRecentSearch(brand.arabicName);
    onSelectBrand(brand);
    onClose();
  };

  const handleSelectCoupon = (coupon: CouponItem, brand: StoreBrand) => {
    saveRecentSearch(`${brand.arabicName} ${coupon.code}`);
    onOpenCouponModal(coupon, brand);
    onClose();
  };

  if (!isOpen) return null;

  // Filtered lists
  const displayStores = searchResult.groupedResults.stores;
  const displayCoupons = searchResult.groupedResults.coupons;
  const displayCategories = searchResult.groupedResults.categories;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 transition-all">
      
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Search Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/70">
          <div className="relative flex items-center">
            
            {/* Search Icon */}
            <Search className="absolute right-4 w-6 h-6 text-emerald-600 pointer-events-none" />

            {/* Main Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim()) {
                  saveRecentSearch(query);
                }
              }}
              placeholder="ابحث عن متجر، كود خصم، تصنيف، أو منتج (مثال: نون، أمازون، عطور، KSA10)..."
              className="w-full pr-13 pl-24 py-3.5 text-base sm:text-lg bg-white border border-slate-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 placeholder:text-slate-400 font-medium shadow-xs"
            />

            {/* Voice and Clear Action Icons */}
            <div className="absolute left-3 flex items-center gap-1.5">
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                  title="مسح البحث"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Voice Button */}
              <button
                onClick={toggleVoiceSearch}
                className={`p-2 rounded-xl transition-all ${
                  isListening
                    ? "bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30"
                    : "bg-slate-100 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                }`}
                title={isListening ? "جاري الاستماع... تحدث الآن" : "بحث صوتي باللغة العربية"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                title="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Voice status or error */}
          {isListening && (
            <div className="mt-2.5 flex items-center gap-2 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-xl">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span>الميكروفون نشط.. تحدث الآن باسم المتجر أو الكود المطلوب...</span>
            </div>
          )}
          {speechError && (
            <div className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
              {speechError}
            </div>
          )}

          {/* Did you mean / Auto-correct suggestion */}
          {searchResult.correctedQuery && searchResult.correctedQuery !== query && (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-600 bg-emerald-50/80 border border-emerald-200 px-3.5 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>هل تقصد:</span>
              <button
                onClick={() => {
                  if (searchResult.correctedQuery) {
                    setQuery(searchResult.correctedQuery);
                    saveRecentSearch(searchResult.correctedQuery);
                  }
                }}
                className="font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                {searchResult.correctedQuery}
              </button>
            </div>
          )}

          {/* Result Filter Tabs */}
          {query.trim().length > 0 && (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                الكل ({searchResult.totalCount})
              </button>
              <button
                onClick={() => setActiveFilter("stores")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                  activeFilter === "stores"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                المتاجر ({displayStores.length})
              </button>
              <button
                onClick={() => setActiveFilter("coupons")}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors whitespace-nowrap ${
                  activeFilter === "coupons"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                الكوبونات ({displayCoupons.length})
              </button>
            </div>
          )}
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Empty State / Search Suggestions & Recent Searches */}
          {!query.trim() && (
            <div className="space-y-6">
              
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>عمليات البحث الأخيرة</span>
                    </div>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>مسح السجل</span>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
                      >
                        <span>{term}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>الأكثر بحثاً في السعودية اليوم</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TRENDING_KEYWORDS.map((kw, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setQuery(kw);
                        saveRecentSearch(kw);
                      }}
                      className="text-right p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-xs text-slate-700 hover:text-emerald-800 transition-all font-medium flex items-center justify-between group"
                    >
                      <span className="truncate">{kw}</span>
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories Grid */}
              <div>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <span>تصفح حسب التصنيف</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {POPULAR_CATEGORIES.filter((c) => c.id !== "all").map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setQuery(cat.name);
                        saveRecentSearch(cat.name);
                      }}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-right text-xs font-bold text-slate-800 flex items-center justify-between transition-colors"
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">عرض الكوبونات</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Active Search Results */}
          {query.trim().length > 0 && searchResult.totalCount === 0 && (
            <div className="text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">لم يتم العثور على نتائج مطابقة لـ "{query}"</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                جرب البحث باسم المتجر مثل (نون، أمازون، نمشي) أو نوع المنتجات مثل (عطور، ملابس، إلكترونيات).
              </p>
            </div>
          )}

          {/* 1. Stores Results */}
          {query.trim().length > 0 && (activeFilter === "all" || activeFilter === "stores") && displayStores.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Store className="w-4 h-4 text-emerald-600" />
                  <span>المتاجر والبراندات المطابقة ({displayStores.length})</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {displayStores.map((item) => {
                  const brand = item.rawBrand!;
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectStore(brand)}
                      className="p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <LazyBrandLogo
                          logoUrl={brand.logoUrl}
                          logoText={brand.logoText || brand.name.slice(0, 3)}
                          logoBg={brand.logoBg || "from-slate-700 to-slate-900 text-white"}
                          brandName={brand.arabicName}
                          size="sm"
                          className="shadow-xs"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 group-hover:text-emerald-800">{brand.arabicName}</span>
                            <span className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-600">{brand.category}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{brand.tagline}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg">
                          {brand.coupons.length} كوبونات
                        </span>
                        <ChevronLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:-translate-x-0.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Coupons Results */}
          {query.trim().length > 0 && (activeFilter === "all" || activeFilter === "coupons") && displayCoupons.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>أكواد الخصم والعروض المتاحة ({displayCoupons.length})</span>
                </div>
              </div>

              <div className="space-y-2.5">
                {displayCoupons.map((item) => {
                  const coupon = item.rawCoupon!;
                  const brand = item.rawBrand!;
                  const isCopied = copiedCodeId === coupon.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectCoupon(coupon, brand)}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 flex-shrink-0 mt-0.5">
                          <Tag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-500">{brand.arabicName}</span>
                            {coupon.badge && (
                              <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full">
                                {coupon.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{coupon.title}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{coupon.description}</p>
                        </div>
                      </div>

                      {/* Code & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          onClick={(e) => handleCopyCode(coupon.code, coupon.id, e)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                            isCopied
                              ? "bg-emerald-600 text-white border-emerald-600"
                              : "bg-slate-50 text-slate-800 border-dashed border-slate-300 hover:border-emerald-500 hover:bg-emerald-50"
                          }`}
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="font-mono tracking-wider">{coupon.code}</span>
                        </button>

                        <a
                          href={coupon.affiliateUrl || brand.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center"
                          title="فتح المتجر"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Category Match Results */}
          {query.trim().length > 0 && displayCategories.length > 0 && activeFilter === "all" && (
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>أقسام وتصنيفات مطابقة</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {displayCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setQuery(cat.title);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold hover:bg-indigo-100 transition-colors"
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Search Modal Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">ESC</kbd>
              <span>للإغلاق</span>
            </span>
            <span className="hidden sm:inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">↵ Enter</kbd>
              <span>للحفظ</span>
            </span>
          </div>
          <span className="font-medium text-emerald-700">
            محرك بحث ذكي مجهز بمعالجة اللغة العربية والمرادفات
          </span>
        </div>

      </div>
    </div>
  );
};
