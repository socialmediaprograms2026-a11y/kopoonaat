import React from "react";
import { ProductItem, StoreBrand } from "../types";
import { 
  ShoppingBag, 
  ExternalLink, 
  Tag, 
  Star, 
  Percent, 
  Flame, 
  TrendingUp,
  ArrowUpRight
} from "lucide-react";
import { trackAffiliateClick } from "../utils/analytics";

interface ProductsShowcaseSectionProps {
  products: ProductItem[];
  brands?: StoreBrand[];
  title?: string;
  subtitle?: string;
  onSelectBrand?: (brand: StoreBrand) => void;
  onNavigateToProducts?: () => void;
  maxDisplay?: number;
}

export const ProductsShowcaseSection: React.FC<ProductsShowcaseSectionProps> = ({
  products,
  brands = [],
  title = "أقوى المنتجات المخفضة وصفقات اليوم الحصرية 🔥",
  subtitle = "منتجات أصلية مخفضة تم التحقق من أسعارها مع توفير إضافي وروابط شراء مباشرة",
  onSelectBrand,
  onNavigateToProducts,
  maxDisplay = 8
}) => {
  const [showAll, setShowAll] = React.useState(false);
  if (!products || products.length === 0) return null;

  const displayedProducts = showAll ? products : products.slice(0, maxDisplay);

  const handleProductClick = (product: ProductItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const brand = brands.find((b) => b.id === product.merchantId);
    const trackingUrl = `/go/p/${product.id}`;
    trackAffiliateClick(
      brand ? brand.name : product.name,
      `PRODUCT_${product.discountPercentage || 0}%`,
      trackingUrl,
      product.merchantId,
      "product_card"
    );
    window.open(product.affiliateUrl || trackingUrl, "_blank", "noopener,noreferrer");
  };

  const getBrandForProduct = (merchantId: string) => {
    return brands.find((b) => b.id === merchantId);
  };

  return (
    <section className="mb-12 font-['Cairo',sans-serif]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="p-1.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Flame className="w-4 h-4 fill-amber-500" />
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            <span className="text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
              صفقات مباشرة (CPS)
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            {subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
            {products.length} منتج مخفض متوفر
          </span>
          {onNavigateToProducts && (
            <button
              onClick={onNavigateToProducts}
              className="text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>جميع العروض</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {displayedProducts.map((product) => {
          const brand = getBrandForProduct(product.merchantId);
          const hasDiscount = product.oldPrice && product.oldPrice > product.price;
          const discountVal = product.discountPercentage || (
            hasDiscount ? Math.round(((product.oldPrice! - product.price) / product.oldPrice!) * 100) : 0
          );

          return (
            <div
              key={product.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:border-emerald-400 group flex flex-col justify-between relative overflow-hidden"
            >
              {/* Badge for discount */}
              {discountVal > 0 && (
                <div className="absolute top-3 left-3 z-10 bg-rose-600 text-white text-[11px] font-black px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
                  <span>خصم {discountVal}%</span>
                </div>
              )}

              {/* Product Image */}
              <div className="w-full aspect-4/3 rounded-xl overflow-hidden bg-white mb-3 relative flex items-center justify-center border border-slate-100 p-2">
                <img
                  src={product.image}
                  alt={product.arabicName || product.name}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    // Fallback placeholder image
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80";
                  }}
                />

                {/* Store mini tag overlay */}
                {brand && (
                  <div 
                    onClick={(e) => {
                      if (onSelectBrand) {
                        e.stopPropagation();
                        onSelectBrand(brand);
                      }
                    }}
                    className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1.5 shadow-sm hover:bg-emerald-700 transition-colors cursor-pointer"
                  >
                    <span>{brand.arabicName}</span>
                  </div>
                )}
              </div>

              {/* Info Details */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span className="font-medium">{product.brand || brand?.arabicName || "ماركة أصلية"}</span>
                    {product.rating && (
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{product.rating}</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-relaxed mb-2 group-hover:text-emerald-700 transition-colors">
                    {product.arabicName || product.name}
                  </h4>
                </div>

                {/* Price block */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-baseline justify-between gap-2 mb-3">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-black text-emerald-700 font-mono">
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

                  {/* Buy Button with Affiliate Tracking */}
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
    </section>
  );
};
