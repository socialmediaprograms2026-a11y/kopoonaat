import React, { useState } from "react";
import { Bell, Mail, CheckCircle2, ShieldCheck, Send, X, AlertCircle } from "lucide-react";
import { StoreBrand } from "../types";

interface BrandAlertSubscriptionProps {
  brand: StoreBrand;
}

export const BrandAlertSubscription: React.FC<BrandAlertSubscriptionProps> = ({ brand }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [serverMessage, setServerMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setServerMessage("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setErrorMessage("يرجى إدخال بريد إلكتروني صحيح لتفعيل التنبيهات");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/alerts/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          merchantId: brand.id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل تسجيل التنبيه");
      }

      setIsSubscribed(true);
      setSubscribedEmail(email.trim());
      setServerMessage(data.message || "تم حفظ التنبيه في قاعدة البيانات بنجاح.");
      setEmail("");
    } catch (err: any) {
      setErrorMessage(err.message || "تعذر الاتصال بالخادم، يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSubscribed(false);
    setSubscribedEmail("");
  };

  return (
    <div 
      id={`brand-alert-section-${brand.id}`}
      className="bg-white border border-emerald-300 rounded-3xl p-6 sm:p-8 mb-10 shadow-sm relative overflow-hidden"
    >
      <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

      {isSubscribed ? (
        <div className="relative z-10 text-right">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <span>تم تفعيل تنبيهات {brand.arabicName} بنجاح!</span>
                  <span className="text-xs font-normal text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300">
                    نشط في قاعدة البيانات
                  </span>
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  سنرسل إشعاراً فورياً إلى <strong className="text-emerald-800 font-mono">{subscribedEmail}</strong> فور التحقق من أي كود جديد أو تجديد عروض {brand.arabicName}.
                </p>
                {serverMessage && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1">
                    {serverMessage}
                  </p>
                )}
              </div>
            </div>

            <button
              id={`btn-unsubscribe-${brand.id}`}
              onClick={handleReset}
              className="text-xs text-slate-500 hover:text-rose-600 transition-colors underline flex items-center gap-1 shrink-0 self-end sm:self-center cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>تسجيل بريد آخر</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            {/* Header / Benefits */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold mb-3">
                <Bell className="w-3.5 h-3.5 animate-bounce" />
                <span>تنبيهات فورية للمتسوقين الأذكياء</span>
              </div>

              <h3 className="text-lg sm:text-2xl font-black text-slate-900 mb-2">
                كن أول من يعلم عند صدور كود خصم جديد لـ {brand.arabicName}!
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed mb-3">
                تنتهي صلاحية بعض أكواد الخصم الحصرية بسرعة بسبب نفاذ الكميات. سجل بريدك الإلكتروني ليتم إشعارك فور اعتماد أي كود حقيقي لـ {brand.arabicName} لعام 2026.
              </p>
            </div>

            {/* Form */}
            <div className="w-full lg:w-96 shrink-0">
              <form onSubmit={handleSubmit} className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      id={`input-alert-email-${brand.id}`}
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage("");
                      }}
                      placeholder="أدخل بريدك الإلكتروني..."
                      className="w-full pr-10 pl-3 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 transition-all text-right"
                    />
                  </div>

                  <button
                    id={`btn-subscribe-alert-${brand.id}`}
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 rotate-180" />
                        <span>تفعيل التنبيه</span>
                      </>
                    )}
                  </button>
                </div>

                {errorMessage && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>خصوصيتك محمية، بدون رسائل عشوائية.</span>
                  </span>
                  <span className="text-slate-500">حفظ مباشر في قاعدة البيانات</span>
                </div>
              </form>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
