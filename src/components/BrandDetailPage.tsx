import React, { useState } from "react";
import { StoreBrand, CouponItem } from "../types";
import { SAUDI_PRODUCTS } from "../data/productsData";
import { ProductsShowcaseSection } from "./ProductsShowcaseSection";
import { BrandAlertSubscription } from "./BrandAlertSubscription";
import { LazyBrandLogo } from "./common/LazyBrandLogo";
import { trackAffiliateClick, trackCouponCopy } from "../utils/analytics";
import { copyToClipboardSafe } from "../utils/clipboard";
import { 
  AffiliateSettings, 
  getBrandAffiliateStatus,
  BrandAffiliateStatus
} from "../utils/affiliateStorage";
import { 
  ArrowRight, 
  Copy, 
  Check, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Clock, 
  HelpCircle, 
  Tag, 
  ShoppingBag,
  ChevronDown,
  Share2,
  ThumbsUp,
  Award,
  Zap,
  Info,
  Bell,
  CheckCircle2,
  DollarSign,
  Settings2,
  Link2
} from "lucide-react";

interface BrandDetailPageProps {
  brand: StoreBrand;
  onBack: () => void;
  onSelectCouponForModal: (coupon: CouponItem, brand: StoreBrand) => void;
  affiliateSettings?: AffiliateSettings;
  onOpenAffiliateModal?: () => void;
  onSelectBrand?: (brand: StoreBrand) => void;
  allBrands?: StoreBrand[];
}

export const BrandDetailPage: React.FC<BrandDetailPageProps> = ({
  brand,
  onBack,
  onSelectCouponForModal,
  affiliateSettings,
  onOpenAffiliateModal,
  onSelectBrand,
  allBrands = [],
}) => {
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [likedCoupons, setLikedCoupons] = useState<Record<string, boolean>>({});

  // Compute affiliate routing & customization status
  const affiliateStatus: BrandAffiliateStatus = affiliateSettings
    ? getBrandAffiliateStatus(brand.id, affiliateSettings)
    : {
        isCustomized: false,
        isCustomUrl: false,
        isCustomCode: false,
        isAmazonTag: false,
        isGlobalParam: false,
        sourceLabel: "original",
        badgeText: "الرابط الأصلي للمتجر",
        badgeDetail: "الرابط الافتراضي المباشر",
      };

  const handleCopyCode = async (coupon: CouponItem) => {
    await copyToClipboardSafe(coupon.code, {
      brandName: brand.name,
      merchantId: brand.id,
      couponId: coupon.id
    });
    setCopiedCodeId(coupon.id);
    onSelectCouponForModal(coupon, brand);
    setTimeout(() => {
      setCopiedCodeId(null);
    }, 3000);
  };

  const handleDirectBuy = (url?: string) => {
    // Route through the real /go/:slug affiliate tracking engine
    const trackingUrl = `/go/${brand.id}`;
    trackAffiliateClick(brand.name, "DIRECT_BUY", trackingUrl, brand.id, "store_page");
    window.open(trackingUrl, "_blank", "noopener,noreferrer");
  };

  const toggleLike = (id: string) => {
    setLikedCoupons(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const scrollToAlertSection = () => {
    const el = document.getElementById(`brand-alert-section-${brand.id}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      const input = document.getElementById(`input-alert-email-${brand.id}`);
      if (input) {
        setTimeout(() => input.focus(), 400);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-right font-['Cairo',sans-serif]">
      {/* SEO Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 mb-6 flex-wrap">
        <button 
          onClick={onBack}
          className="hover:text-emerald-700 transition-colors flex items-center gap-1 font-medium cursor-pointer"
        >
          <span>الرئيسية</span>
        </button>
        <span>/</span>
        <button 
          onClick={onBack}
          className="hover:text-emerald-700 transition-colors font-medium cursor-pointer"
        >
          <span>كوبونات المتاجر السعودية</span>
        </button>
        <span>/</span>
        <span className="text-emerald-800 font-bold">{brand.arabicName}</span>
      </nav>

      {/* Back to All Stores Button */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 text-xs sm:text-sm font-bold border border-slate-200 transition-all hover:pr-5 shadow-xs cursor-pointer"
        >
          <ArrowRight className="w-4 h-4 text-emerald-600" />
          <span>العودة لجميع المتاجر والكوبونات</span>
        </button>

        {/* Affiliate Quick Toggle Button */}
        {onOpenAffiliateModal && (
          <button
            onClick={onOpenAffiliateModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition-colors cursor-pointer"
            title="تعديل أكواد وروابط التتبع الخاصة بك"
          >
            <Settings2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>إعدادات أرباحي للأفلييت</span>
            {affiliateStatus.isCustomized ? (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px]">
                مخصص ✓
              </span>
            ) : (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
                افتراضي
              </span>
            )}
          </button>
        )}
      </div>

      {/* Brand Profile Hero Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Brand Logo Box with Lazy Loading & CLS Protection */}
            <LazyBrandLogo
              logoUrl={brand.logoUrl}
              logoText={brand.logoText}
              logoBg={brand.logoBg}
              brandName={brand.arabicName}
              size="xl"
              priority={true}
              className="shadow-md"
            />

            {/* Brand Titles */}
            <div>
              <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  كود خصم {brand.arabicName}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full border border-emerald-300 font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  شغال ومجرب 2026
                </span>
                <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-full border border-slate-200 font-medium">
                  {brand.country}
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3 max-w-xl">
                {brand.tagline}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{brand.rating}</span>
                  <span className="text-slate-500 font-normal">({brand.totalReviews.toLocaleString()} تقييم متسوق)</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>تحديث دوري كل 24 ساعة</span>
                </div>
              </div>
            </div>
          </div>

          {/* Direct Store CTA with Routing Badge */}
          <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            {/* Visual Indicator of the Link Source with Tooltip */}
            <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-1.5 relative group cursor-help">
                {affiliateStatus.isCustomUrl ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>رابط أرباحك المخصص (مفعّل)</span>
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-64 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>رابط تتبع أرباح نشط</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        هذا الرابط يمر عبر شبكة الأفلييت الخاصة بك لضمان تسجيل واحتساب العمولة لحسابك تلقائياً عند إتمام أي عملية شراء.
                      </p>
                      {affiliateStatus.badgeDetail && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800 text-[10px] font-mono text-emerald-300 truncate">
                          {affiliateStatus.badgeDetail}
                        </div>
                      )}
                      <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md border border-slate-300">
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                      <span>الرابط الأصلي للمتجر</span>
                    </span>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-60 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1">
                        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span>الرابط الافتراضي</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        الرابط الافتراضي المباشر للمتجر. يمكنك إضافة رابط الأفلييت الخاص بك عبر زر "تخصيص" لجني العمولات.
                      </p>
                      <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </>
                )}
              </div>
              {onOpenAffiliateModal && (
                <button
                  onClick={onOpenAffiliateModal}
                  className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 hover:underline transition-colors cursor-pointer"
                  title="تغيير كود أو رابط الأفلييت لهذا المتجر"
                >
                  {affiliateStatus.isCustomized ? "تعديل" : "تخصيص"}
                </button>
              )}
            </div>

            <button
              onClick={() => handleDirectBuy(brand.affiliateUrl)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all group cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>زيارة متجر {brand.arabicName} الرسمي</span>
              <ExternalLink className="w-4 h-4 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>

            <button
              id={`btn-hero-scroll-alert-${brand.id}`}
              onClick={scrollToAlertSection}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>تنبيهي بكوبونات وعروض {brand.arabicName}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Affiliate Routing Transparency Box */}
      <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              affiliateStatus.isCustomUrl ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}>
              {affiliateStatus.isCustomUrl ? (
                <DollarSign className="w-5 h-5" />
              ) : (
                <Link2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h4 className="text-sm font-bold text-slate-900">
                  حالة توجيه الروابط والأرباح لمتجر {brand.arabicName}:
                </h4>
                {affiliateStatus.isCustomUrl ? (
                  <div className="relative group cursor-help inline-flex">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      رابط مخصص مُسجّل لك (تُحسب العمولات لحسابك)
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-72 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                        <span>نظام احتساب العمولات نشط</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        هذا الرابط يمر عبر شبكة الأفلييت الخاصة بك لضمان تسجيل واحتساب العمولة لحسابك تلقائياً عند إتمام أي عملية شراء.
                      </p>
                      <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                ) : (
                  <div className="relative group cursor-help inline-flex">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
                      <Info className="w-3.5 h-3.5 text-slate-500" />
                      الرابط الافتراضي للمتجر (بدون كود تتبع خاص)
                    </span>
                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-64 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700">
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        يتم التوجيه للرابط الافتراضي المباشر للمتجر. أضف معرف التتبع الخاص بك لتفعيل الأرباح.
                      </p>
                      <div className="absolute top-full right-6 -mt-1 border-4 border-transparent border-t-slate-900" />
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {affiliateStatus.isCustomUrl
                  ? `تفاصيل التتبع: ${affiliateStatus.badgeDetail}`
                  : "جميع الروابط الحالية توجه مباشرة للمتجر الرسمي. يمكنك وضع رابط التتبع الخاص بك لجني أرباح الإحالة."}
              </p>
            </div>
          </div>

          {onOpenAffiliateModal && (
            <button
              onClick={onOpenAffiliateModal}
              className="px-4 py-2 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shrink-0 cursor-pointer"
            >
              {affiliateStatus.isCustomized ? "تعديل رابط التتبع والكود" : "إضافة كود ورابط أرباحي"}
            </button>
          )}
        </div>
      </div>

      {/* SEO Notice / Google 2026 Guarantee */}
      <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs text-slate-700 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Award className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>
            <strong>ضمان الفعالية:</strong> جميع أكواد وعروض <strong>{brand.arabicName}</strong> المنشورة هنا تم فحصها وتجربتها داخل المملكة العربية السعودية، وهي صالحة ومطابقة لسياسات الشراء.
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 shrink-0 hidden sm:inline font-bold">
          مُحدث اليوم
        </span>
      </div>

      {/* Section Title */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900">
            جميع كوبونات وعروض {brand.arabicName} المتاحة ({brand.coupons.length})
          </h2>
        </div>
        <span className="text-xs text-slate-500">
          انقر لنسخ الكود أو الشراء المباشر
        </span>
      </div>

      {/* Coupons List */}
      <div className="space-y-4 mb-10">
        {brand.coupons.map((coupon, idx) => {
          const isThisCodeCustomized = idx === 0 && affiliateStatus.isCustomCode;
          const isThisLinkCustomized = Boolean(coupon.affiliateUrl && affiliateStatus.isCustomUrl);

          return (
            <div
              key={coupon.id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all relative ${
                idx === 0
                  ? "bg-white border-2 border-emerald-500 shadow-md shadow-emerald-500/5"
                  : "bg-white border border-slate-200 hover:border-slate-300 shadow-xs"
              }`}
            >
              {/* Top Badges */}
              <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {coupon.badge && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      {coupon.badge}
                    </span>
                  )}
                  {/* Link Routing Type Badge with Tooltip */}
                  {isThisLinkCustomized ? (
                    <div className="relative group cursor-help inline-flex">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        رابط أرباح مخصص
                      </span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-64 p-2 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700">
                        <p className="text-slate-200 leading-relaxed">
                          هذا الرابط يمر عبر شبكة الأفلييت الخاصة بك لضمان تسجيل العمولة لحسابك.
                        </p>
                        <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative group cursor-help inline-flex">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                        رابط أصلي
                      </span>
                      {/* Tooltip */}
                      <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex flex-col w-56 p-2 bg-slate-900 text-white text-[11px] rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700">
                        <p className="text-slate-300 leading-relaxed">
                          رابط المتجر الرسمي المباشر.
                        </p>
                        <div className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-slate-900" />
                      </div>
                    </div>
                  )}
                </div>

                <span className="text-xs text-slate-500 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-slate-400" />
                  ينتهي: {coupon.expiryDate}
                </span>
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                
                {/* Left/Middle: Coupon Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-lg sm:text-xl font-black text-emerald-800 font-mono bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                      {coupon.discount}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {coupon.title}
                    </h3>
                    {isThisCodeCustomized && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-teal-100 text-teal-800 border border-teal-300">
                        <Check className="w-3 h-3" />
                        كودك المخصص
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-3">
                    {coupon.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{coupon.successRate}</span>
                    </span>
                    {coupon.timesUsedToday && (
                      <span className="text-slate-500">
                        استخدمه اليوم: <strong className="text-slate-800">{coupon.timesUsedToday}</strong> متسوق
                      </span>
                    )}
                    {coupon.minSpend && (
                      <span className="text-slate-500">
                        الحد الأدنى: <strong className="text-slate-800">{coupon.minSpend}</strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: Actions (Copy / Buy Directly) */}
                <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0 lg:w-64">
                  {coupon.type === "coupon" ? (
                    <>
                      {/* Copy Code Button */}
                      <button
                        onClick={() => handleCopyCode(coupon)}
                        className={`w-full py-3 px-4 rounded-xl font-black text-sm flex items-center justify-between border-2 border-dashed transition-all cursor-pointer ${
                          copiedCodeId === coupon.id
                            ? "bg-emerald-600 border-emerald-600 text-white"
                            : "bg-emerald-50/70 border-emerald-400 text-emerald-800 hover:bg-emerald-100"
                        }`}
                      >
                        <span className="font-mono text-base tracking-wider">{coupon.code}</span>
                        <span className="flex items-center gap-1 text-xs">
                          {copiedCodeId === coupon.id ? (
                            <>
                              <Check className="w-4 h-4" />
                              <span>تم النسخ!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>انسخ الكود</span>
                            </>
                          )}
                        </span>
                      </button>

                      {/* Direct Buy Link with source badge */}
                      <button
                        onClick={() => handleDirectBuy(coupon.affiliateUrl || brand.affiliateUrl)}
                        className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-between gap-1.5 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <span>شراء من الرابط مباشرة</span>
                          <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                        </span>
                        {isThisLinkCustomized ? (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                            رابط مخصص ✓
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                            رابط أصلي
                          </span>
                        )}
                      </button>
                    </>
                  ) : (
                    /* Deal without code */
                    <button
                      onClick={() => handleDirectBuy(coupon.affiliateUrl || brand.affiliateUrl)}
                      className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm flex items-center justify-between px-4 transition-all shadow-md cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <span>تفعيل العرض والتسوق فوراً</span>
                        <ExternalLink className="w-4 h-4" />
                      </span>
                      {isThisLinkCustomized ? (
                        <span className="text-[10px] font-bold bg-emerald-900/40 text-emerald-100 px-2 py-0.5 rounded-full">
                          مخصص ✓
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-black/20 text-white px-2 py-0.5 rounded-full">
                          أصلي
                        </span>
                      )}
                    </button>
                  )}

                  {/* Helpful Feedback Toggle */}
                  <button
                    onClick={() => toggleLike(coupon.id)}
                    className={`text-[11px] flex items-center justify-center gap-1 py-1 transition-colors cursor-pointer ${
                      likedCoupons[coupon.id] ? "text-emerald-700 font-bold" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{likedCoupons[coupon.id] ? "شكراً لمشاركتك الفعالية" : "هل اشتغل الكود معك؟"}</span>
                  </button>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Store Featured Products (Product Schema Table Integration) */}
      {(() => {
        const storeProducts = SAUDI_PRODUCTS.filter(
          (p) => p.merchantId === brand.id || p.merchantId === brand.slug || p.merchantId.includes(brand.slug)
        );
        if (storeProducts.length === 0) return null;
        return (
          <div className="mb-10">
            <ProductsShowcaseSection
              products={storeProducts}
              brands={[brand]}
              title={`أقوى عروض ومنتجات متجر ${brand.arabicName} المخفضة اليوم 🛒`}
              subtitle={`منتجات أصلية متوفرة في ${brand.arabicName} مع خصومات فورية وروابط تفعيل مباشرة`}
            />
          </div>
        );
      })()}

      {/* Brand Coupon Alerts & Updates Subscription Form */}
      <BrandAlertSubscription brand={brand} />

      {/* 3 Simple Steps to Use the Code */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-600" />
          <span>كيف تستخدم كود خصم {brand.arabicName} وتحصل على التخفيض؟</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm mb-3">
              1
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">انسخ رمز الكود</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              اضغط على زر "انسخ الكود" لأقوى كود بالأعلى ليتم حفظ الرمز في جهازك وفتح نافذة المتجر.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm mb-3">
              2
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">أضف المنتجات لسلتك</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              تسوق من متجر {brand.arabicName} وضع المنتجات التي ترغب في شرائها داخل سلة المشتريات.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-sm mb-3">
              3
            </span>
            <h4 className="text-sm font-bold text-slate-900 mb-1.5">الصق الكود ومبروك التوفير</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              في خانة "كود الخصم / الرمز الترويجي" الصق الكود واضغط تطبيق، وستلاحظ انخفاض الفاتورة فوراً.
            </p>
          </div>
        </div>
      </div>

      {/* Saving Tips Section */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>أهم نصائح التوفير ومضاعفة الخصم في {brand.arabicName}</span>
        </h3>
        <div className="space-y-3">
          {brand.savingTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* SEO FAQs (Schema FAQ Ready) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs">
        <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-cyan-600" />
          <span>الأسئلة الشائعة حول كوبونات {brand.arabicName} بالسعودية</span>
        </h3>

        <div className="space-y-3">
          {brand.faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="border border-slate-200 rounded-2xl bg-slate-50 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full p-4 text-right flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 hover:text-slate-950 transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown className={`w-4 h-4 text-emerald-600 transition-transform ${openFaqIndex === idx ? "rotate-180" : ""}`} />
              </button>

              {openFaqIndex === idx && (
                <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-200 bg-white">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* About the Store / SEO Overview */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 text-xs text-slate-600 leading-relaxed shadow-xs mb-8">
        <h4 className="font-bold text-slate-900 text-sm mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          <span>نبذة عن متجر {brand.arabicName} وعروضه في السعودية:</span>
        </h4>
        <p>{brand.aboutStore}</p>
      </div>

      {/* SEO Internal Linking: Related Stores & Similar Coupons in Same Niche */}
      {allBrands && allBrands.length > 1 && (
        <section className="bg-slate-50/80 border border-slate-200 rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>متاجر وكوبونات شبيهة بـ {brand.arabicName} ({brand.category})</span>
              </h3>
              <p className="text-xs text-slate-500">
                استكشف أقوى أكواد الخصم الحصرية لمتاجر أخرى في نفس تصنيف {brand.category}
              </p>
            </div>
            <button
              onClick={onBack}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors cursor-pointer"
            >
              عرض كافة المتاجر ←
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {allBrands
              .filter((b) => b.id !== brand.id)
              .slice(0, 4)
              .map((relatedBrand) => (
                <div
                  key={relatedBrand.id}
                  onClick={() => onSelectBrand && onSelectBrand(relatedBrand)}
                  className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <LazyBrandLogo
                      logoUrl={relatedBrand.logoUrl}
                      logoText={relatedBrand.logoText}
                      logoBg={relatedBrand.logoBg}
                      brandName={relatedBrand.arabicName}
                      size="sm"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        كود خصم {relatedBrand.arabicName}
                      </h4>
                      <span className="text-[10px] text-slate-500">{relatedBrand.country}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                      {relatedBrand.coupons[0]?.discount || "تخفيض فوري"}
                    </span>
                    <span className="text-slate-500 group-hover:text-slate-800 transition-colors flex items-center gap-0.5">
                      <span>عرض الكوبونات</span>
                      <ArrowRight className="w-3 h-3 text-emerald-600 rotate-180" />
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

    </div>
  );
};
