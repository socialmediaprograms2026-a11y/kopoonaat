import React from "react";
import { TOP_AFFILIATE_NETWORKS } from "../data/nichesData";
import { Cpu, ExternalLink, ShieldCheck, CreditCard, Clock, Globe } from "lucide-react";

export const AffiliateNetworksGuide: React.FC = () => {
  return (
    <section id="networks-section" className="py-12 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Cpu className="w-4 h-4" />
            مصادر توريد العروض والمتاجر (Affiliate Networks)
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            أفضل شبكات الأفلييت للربط مع مئات المتاجر والبراندات
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            بدلاً من الاتفاق مع كل متجر بشكل منفصل، تمنحك هذه الشبكات لوحة تحكم واحدة تضم آلاف المتاجر والبراندات مع روابط تتبع موحدة وتحديثات آلية للكوبونات والعمولات.
          </p>
        </div>

        {/* Networks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {TOP_AFFILIATE_NETWORKS.map((network, index) => (
            <div
              key={index}
              className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 text-right flex flex-col justify-between hover:border-slate-600 transition-colors"
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-700">
                    {network.region}
                  </span>
                  <span className="text-[11px] text-slate-400 font-medium">
                    {network.type}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {network.name}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {network.description}
                </p>

                {/* Brands Included */}
                <div className="mb-4">
                  <div className="text-[11px] font-bold text-slate-400 mb-1.5">أشهر المتاجر المتاحة على الشبكة:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {network.famousBrands.map((b, i) => (
                      <span key={i} className="text-xs bg-slate-900/80 text-slate-200 border border-slate-700/60 px-2.5 py-0.5 rounded-lg">
                        {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Meta */}
              <div className="pt-4 border-t border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-slate-200 font-medium">{network.cookieDuration}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>مدة الكوكيز:</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-emerald-400 font-bold font-mono">{network.minimumPayout}</span>
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    <span>الحد الأدنى للسحب:</span>
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-400 pt-1">
                  <span className="text-slate-300">{network.payoutMethods.join("، ")}</span>
                  <span>طرق الدفع:</span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Integration Advice */}
        <div className="mt-10 bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 text-right flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-base">هل تريد الربط البرمجي التلقائي للكوبونات والأسعار؟</h4>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              توفر شبكات مثل Admitad و Impact و CJ واجهات برمجة تطبيقات (APIs) و Data Feeds تسمح لموقعك بجلب أكواد الخصم والمنتجات وأسعارها بصورة آلية يومياً دون الحاجة لإدخالها يدوياً.
            </p>
          </div>
          <div className="shrink-0">
            <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>تحديث آلي 100% عبر الـ API</span>
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
