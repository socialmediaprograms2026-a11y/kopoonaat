import React, { useState, useMemo } from "react";
import { SAUDI_PRODUCTS } from "../data/productsData";
import { SAUDI_STORE_BRANDS } from "../data/couponsData";
import { ProductItem, StoreBrand } from "../types";
import { 
  ShoppingBag, 
  Search, 
  Tag, 
  Star, 
  Flame, 
  Filter, 
  ArrowUpRight, 
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Percent
} from "lucide-react";
import { trackAffiliateClick } from "../utils/analytics";

interface AllProductsPageProps {
  onSelectBrand: (brand: StoreBrand) => void;
  brands?: StoreBrand[];
}

export const AllProductsPage: React.FC<AllProductsPageProps> = ({
  onSelectBrand,
  brands = SAUDI_STORE_BRANDS
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"discount" | "price_asc" | "price_desc" | "rating">("discount");

  const categories = useMemo(() => {
    const cats = new Set<string>();
    SAUDI_PRODUCTS.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats);
  }, []);

  const filteredProducts = useMemo(() => {
    return SAUDI_PRODUCTS.filter((product) => {
      const matchesSearch =
        !searchTerm.trim() ||
        product.arabicName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brand && product.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === "all" || product.category === selectedCategory;

      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      if (sortBy === "discount") {
        return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      }
      if (sortBy === "price_asc") {
        return a.price - b.price;
      }
      if (sortBy === "price_desc") {
        return b.price - a.price;
      }
      if (sortBy === "rating") {
        return (b.rating || 0) - (a.rating || 0);
      }
      return 0;
    });
  }, [searchTerm, selectedCategory, sortBy]);

  const handleProductClick = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const brand = brands.find((b) => b.id === product.merchantId);
    const trackingUrl = `/go/p/${product.id}`;
    trackAffiliateClick(
      brand ? brand.name : product.name,
      `PRODUCT_${product.discountPercentage || 0}%`,
      trackingUrl,
      product.merchantId,
      "all_products_page"
    );
    window.open(trackingUrl, "_blank", "noopener,noreferrer");
  };

  const getBrandForProduct = (merchantId: string) => {
    return brands.find((b) => b.id === merchantId);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 font-['Cairo',sans-serif]">
      {/* Hero Header */}
      <section className="bg-white border-b border-slate-200/80 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black mb-3">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>عروض الصفقات المباشرة (CPS Product Catalog)</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
                دليل المنتجات والعروض المخفضة في المتاجر السعودية
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                تصفح أفضل الصفقات المختارة بعناية من أمازون السعودية، نون، نايس ون، ومكتبة جرير مع التحقق اليومي من أفضل الأسعار والروابط المباشرة.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 shrink-0">
              <div className="text-center px-4 border-l border-slate-200">
                <div className="text-2xl font-black text-emerald-700 font-mono">{SAUDI_PRODUCTS.length}</div>
                <div className="text-xs text-slate-500 font-bold">منتج مخفض</div>
              </div>
              <div className="text-center px-4">
                <div className="text-2xl font-black text-amber-600 font-mono">حتى 35%</div>
                <div className="text-xs text-slate-500 font-bold">خصم حقيقي</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Filters */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 mb-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث باسم المنتج، الماركة (آبل، دايسون، ديور...) أو الفئة..."
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900 placeholder:text-slate-400"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  مسح
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <SlidersHorizontal className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              >
                <option value="discount">الأعلى خصماً أولاً (%)</option>
                <option value="rating">الأعلى تقييماً (⭐)</option>
                <option value="price_asc">الأقل سعراً (ر.س)</option>
                <option value="price_desc">الأعلى سعراً (ر.س)</option>
              </select>
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-2 border-t border-slate-100">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              جميع الفئات ({SAUDI_PRODUCTS.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-emerald-600" />
            <span>المنتجات المعروضة ({filteredProducts.length})</span>
          </h2>
          {(searchTerm || selectedCategory !== "all") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إلغاء التصفية</span>
            </button>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800 mb-1">لم نجد منتجات مطابقة لبحثك</h3>
            <p className="text-xs text-slate-500 mb-4">جرب البحث بكلمات أخرى أو اختر فئة مختلفة</p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
              className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800"
            >
              إعادة ضبط البحث
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => {
              const brand = getBrandForProduct(product.merchantId);
              const hasDiscount = product.oldPrice && product.oldPrice > product.price;
              const discountVal = product.discountPercentage || (
                hasDiscount ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100) : 0
              );

              return (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:border-emerald-400 group flex flex-col justify-between relative overflow-hidden"
                >
                  {/* Discount Badge */}
                  {discountVal > 0 && (
                    <div className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                      <span>خصم {discountVal}%</span>
                    </div>
                  )}

                  {/* Image */}
                  <div className="w-full aspect-4/3 rounded-xl overflow-hidden bg-white mb-3 relative flex items-center justify-center border border-slate-100 p-2">
                    <img
                      src={product.image}
                      alt={product.arabicName || product.name}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
                      }}
                    />

                    {brand && (
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectBrand(brand);
                        }}
                        className="absolute bottom-2 right-2 bg-slate-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                      >
                        <span>{brand.arabicName}</span>
                      </div>
                    )}
                  </div>

                  {/* Body Info */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-semibold text-slate-700">{product.brand || brand?.arabicName || "أصلي 100%"}</span>
                        {product.rating && (
                          <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{product.rating}</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-relaxed mb-2 group-hover:text-emerald-700 transition-colors">
                        {product.arabicName || product.name}
                      </h3>

                      {product.description && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Price and CTA */}
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex items-baseline justify-between gap-2 mb-3">
                        <div className="flex items-baseline gap-1">
                          <span className="text-lg font-black text-emerald-700 font-mono">
                            {product.price.toLocaleString()}
                          </span>
                          <span className="text-xs font-bold text-emerald-800">{product.currency || "ر.س"}</span>
                        </div>

                        {product.oldPrice && (
                          <span className="text-xs text-slate-400 line-through font-mono">
                            {product.oldPrice.toLocaleString()} {product.currency || "ر.س"}
                          </span>
                        )}
                      </div>

                      <button
                        onClick={(e) => handleProductClick(product, e)}
                        className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>شراء العرض مباشرة</span>
                        <ArrowUpRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
