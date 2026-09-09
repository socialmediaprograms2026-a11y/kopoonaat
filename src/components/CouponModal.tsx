import React, { useState, useEffect } from "react";
import { CouponItem, StoreBrand } from "../types";
import { AffiliateSettings, getBrandAffiliateStatus } from "../utils/affiliateStorage";
import { trackAffiliateClick, trackCouponCopy } from "../utils/analytics";
import { copyToClipboardSafe } from "../utils/clipboard";
import { LazyBrandLogo } from "./common/LazyBrandLogo";
import { 
  Check, 
  Copy, 
  ExternalLink, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Info,
  Bell,
  Mail,
  Send,
  AlertCircle
} from "lucide-react";

interface CouponModalProps {
  isOpen: boolean;
  coupon: CouponItem | null;
  brand: StoreBrand | null;
  onClose: () => void;
  affiliateSettings?: AffiliateSettings;
}

export const CouponModal: React.FC<CouponModalProps> = ({
  isOpen,
  coupon,
  brand,
  onClose,
  affiliateSettings,
}) => {
  const [copied, setCopied] = useState<boolean>(true);
  const [alertEmail, setAlertEmail] = useState("");
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertError, setAlertError] = useState("");
  const [showAlertForm, setShowAlertForm] = useState(false);

  useEffect(() => {
    if (isOpen && coupon && brand) {
      trackCouponCopy(coupon.code, brand.name, brand.id);
      // Reset alert state on modal open
      setAlertEmail("");
      setAlertSubscribed(false);
      setAlertMessage("");
      setAlertError("");
      setShowAlertForm(false);
    }
  }, [isOpen, coupon?.id]);

  if (!isOpen || !coupon || !brand) return null;

  const affiliateStatus = affiliateSettings
    ? getBrandAffiliateStatus(brand.id, affiliateSettings)
    : null;

  const isCustomUrl = affiliateStatus?.isCustomUrl || false;

  const handleCopyAgain = async () => {
    await copyToClipboardSafe(coupon.code, {
      brandName: brand.name,
      merchantId: brand.id,
      couponId: coupon.id
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleGoToStore = () => {
    // Route through the real redirect engine
    const targetUrl = coupon.id ? `/go/c/${coupon.id}` : `/go/${brand.id}`;
    trackAffiliateClick(brand.name, coupon.code, targetUrl, brand.id, "coupon_modal");
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertError("");
    setAlertMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!alertEmail.trim() || !emailRegex.test(alertEmail.trim())) {
      setAlertError("يرجى إدخال بريد إلكتروني صحيح لتفعيل التنبيه");
      return;
    }

    setIsSubmittingAlert(true);
    try {
      const response = await fetch("/api/alerts/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: alertEmail.trim(),
          merchantId: brand.id
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "فشل تسجيل التنبيه");
      }

      setAlertSubscribed(true);
      setAlertMessage(data.message || `تم تفعيل تنبيهات ${brand.arabicName} بنجاح!`);
      setAlertEmail("");
    } catch (err: any) {
      setAlertError(err.message || "تعذر تفعيل التنبيه، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200 font-['Cairo',sans-serif]">
      <div 
        className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-700 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          title="إغلاق النافذة"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Success Icon & Brand Logo Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <LazyBrandLogo
            logoUrl={brand.logoUrl}
            logoText={brand.logoText}
            logoBg={brand.logoBg}
            brandName={brand.arabicName}
            size="lg"
            priority={true}
            className="shadow-sm"
          />
        </div>

        {/* Success Header */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          تم التحقق وتجربة الكود اليوم
        </span>
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1">
          تم نسخ الكود بنجاح!
        </h3>
        <p className="text-sm text-slate-600 mb-6">
          توجه الآن إلى متجر <strong className="text-emerald-800">{brand.arabicName}</strong> والصق الكود عند إتمام الدفع.
        </p>

        {/* Code Box */}
        <div className="bg-slate-50 border-2 border-dashed border-emerald-400 rounded-2xl p-4 mb-5 flex items-center justify-between gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">كود خصم {brand.arabicName}:</span>
            <span className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono tracking-wider select-all">
              {coupon.code}
            </span>
          </div>

          <button
            onClick={handleCopyAgain}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
              copied
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 shadow-xs"
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span>تم النسخ</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>إعادة النسخ</span>
              </>
            )}
          </button>
        </div>

        {/* Coupon Discount Details */}
        <div className="bg-slate-50 rounded-xl p-3.5 text-right text-xs text-slate-600 mb-4 border border-slate-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-slate-500">قيمة التوفير:</span>
            <span className="font-bold text-emerald-800">{coupon.discount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">نسبة النجاح:</span>
            <span className="font-bold text-slate-800">{coupon.successRate}</span>
          </div>
        </div>

        {/* Link Routing Indicator Badge with Tooltip */}
        <div className="mb-5 flex items-center justify-center">
          {isCustomUrl ? (
            <div className="relative group cursor-help inline-flex">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>التوجيه عبر رابطك التسويقي المخصص (الأرباح لحسابك)</span>
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-72 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700 text-right">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>تتبع العمولة مفعّل</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  هذا الرابط يمر عبر شبكة الأفلييت الخاصة بك لضمان تسجيل واحتساب العمولة لحسابك تلقائياً عند إتمام أي عملية شراء.
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          ) : (
            <div className="relative group cursor-help inline-flex">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <span>التوجيه عبر الرابط المباشر للمتجر</span>
              </span>

              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col w-64 p-2.5 bg-slate-900 text-white text-xs rounded-xl shadow-xl z-50 pointer-events-none transition-all duration-200 border border-slate-700 text-right">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  يتم التوجيه للرابط الافتراضي للمتجر. يمكنك تخصيص الرابط لجني العمولات من لوحة إعدادات الأرباح.
                </p>
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            onClick={handleGoToStore}
            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-5 rounded-2xl flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all text-sm group cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>الذهاب للمتجر واستخدام الخصم</span>
            <ExternalLink className="w-4 h-4 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>

          <button
            onClick={onClose}
            className="sm:w-28 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 px-4 rounded-2xl text-xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

        {/* Price Alerts & Coupon Updates Subscription Feature */}
        <div className="border-t border-slate-200/80 pt-3.5 text-right">
          {!showAlertForm && !alertSubscribed ? (
            <button
              type="button"
              onClick={() => setShowAlertForm(true)}
              className="w-full py-2.5 px-3.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/70 text-amber-900 text-xs font-bold flex items-center justify-between transition-all cursor-pointer group"
            >
              <span className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-200/80 text-amber-800">
                  <Bell className="w-3.5 h-3.5" />
                </span>
                <span>تنبيهات الأسعار وكوبونات {brand.arabicName} الجديدة</span>
              </span>
              <span className="text-[11px] text-amber-700 underline group-hover:text-amber-800">
                أرسل لي بريداً عند التحديث ←
              </span>
            </button>
          ) : (
            <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-3.5 transition-all">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-900">
                  <Bell className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>تنبيهات أسعار وعروض {brand.arabicName}</span>
                </div>
                {!alertSubscribed && (
                  <button
                    type="button"
                    onClick={() => setShowAlertForm(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600"
                  >
                    إلغاء
                  </button>
                )}
              </div>

              {alertSubscribed ? (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl p-2.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{alertMessage || "تم تفعيل التنبيه! سنخطرك فور توفر كود أو تخفيض أعلى."}</span>
                </div>
              ) : (
                <form onSubmit={handleAlertSubmit} className="space-y-2">
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    أدخل بريدك الإلكتروني لنرسل لك إشعاراً فورياً عند نزول كود جديد أو انخفاض أسعار متجر {brand.arabicName}.
                  </p>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={alertEmail}
                        onChange={(e) => setAlertEmail(e.target.value)}
                        placeholder="بريدك الإلكتروني (مثال: name@example.com)"
                        required
                        disabled={isSubmittingAlert}
                        className="w-full text-xs pr-8 pl-3 py-2 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none bg-white text-slate-800"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingAlert}
                      className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingAlert ? (
                        <span>جاري التفعيل...</span>
                      ) : (
                        <>
                          <Send className="w-3 h-3" />
                          <span>تفعيل التنبيه</span>
                        </>
                      )}
                    </button>
                  </div>
                  {alertError && (
                    <div className="flex items-center gap-1 text-[11px] text-rose-600 font-medium mt-1">
                      <AlertCircle className="w-3 h-3" />
                      <span>{alertError}</span>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-500 mt-3">
          نصيحة: الصق الكود في خانة "رمز الخصم" أو "Promo Code" في صفحة السلة للحصول على التخفيض فوراً.
        </p>
      </div>
    </div>
  );
};

