import React from "react";
import { SEO_PLAYBOOK_STEPS } from "../data/nichesData";
import { ShieldCheck, CheckCircle2, Sparkles, AlertOctagon, HelpCircle, ArrowDown } from "lucide-react";

export const SeoPlaybook: React.FC = () => {
  return (
    <section id="seo-playbook-section" className="py-12 bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            دليل خوارزميات جوجل وتحديثات 2026
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
            خارطة طريق بناء موقع أفلييت يتصدر قوقل ولا يتأثر بالتحديثات
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed">
            كيف تبني موقعاً يقدم عروضاً لمتاجر وبراندات متعددة، ويحافظ على ثقة عناكب جوجل (Googlebot) وخوارزمية المحتوى المفيد (Helpful Content System).
          </p>
        </div>

        {/* Funnel Diagram: From Google Query to Commission */}
        <div className="mb-12 bg-slate-800/40 border border-slate-700/60 rounded-3xl p-6 sm:p-8">
          <h3 className="text-center text-base font-bold text-white mb-6">
            دورة تحويل زيارة قوقل إلى عمولة مالية في المواقع متعددة المتاجر
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            
            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs mb-2">1</div>
              <h4 className="font-bold text-white text-sm">بحث في قوقل بنية شراء</h4>
              <p className="text-xs text-slate-400 mt-1">
                يبحث المستهلك عن "كود خصم نون" أو "أفضل لابتوب للبرمجة 2026".
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-xs mb-2">2</div>
              <h4 className="font-bold text-white text-sm">صفحة المقارنة أو الكوبون</h4>
              <p className="text-xs text-slate-400 mt-1">
                يدخل موقعك ويجد جدولاً يقارن 4 متاجر أو كود خصم فعال بنقرة زر.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 font-bold flex items-center justify-center text-xs mb-2">3</div>
              <h4 className="font-bold text-white text-sm">تفعيل الكوكيز والإحالة</h4>
              <p className="text-xs text-slate-400 mt-1">
                يضغط على "انسخ الكود وتوجه للمتجر" فيفتح المتجر بتبويب جديد برابط التتبع.
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-4 flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs mb-2">4</div>
              <h4 className="font-bold text-white text-sm">احتساب العمولة التلقائي</h4>
              <p className="text-xs text-slate-400 mt-1">
                عند إتمام الطلب، تسجل الشبكة الإحالة ويتم إيداع العمولة في حسابك البنكي.
              </p>
            </div>

          </div>
        </div>

        {/* 4 Steps Playbook */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SEO_PLAYBOOK_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-slate-800/60 border border-slate-700/80 rounded-3xl p-6 sm:p-7 text-right hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  الخطوة الرابعة #{step.stepNumber}
                </span>
                <span className="text-2xl font-black text-slate-600">0{step.stepNumber}</span>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
                {step.title}
              </h3>
              <p className="text-xs text-slate-400 mb-4 font-medium">
                {step.subtitle}
              </p>

              <div className="space-y-2 mb-5">
                {step.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-700/60 space-y-2 text-xs">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60">
                  <span className="text-slate-400 block font-semibold mb-0.5">معيار جوجل الرسمي:</span>
                  <span className="text-slate-300">{step.googleGuideline}</span>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl text-emerald-300 font-medium">
                  <strong>نصيحة الخبراء:</strong> {step.proTip}
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Major Mistakes to Avoid */}
        <div className="mt-10 bg-rose-950/20 border border-rose-500/30 rounded-3xl p-6 sm:p-8 text-right">
          <div className="flex items-center gap-3 text-rose-400 font-bold text-base mb-4">
            <AlertOctagon className="w-5 h-5" />
            <span>أخطر 4 أخطاء تدمر مواقع الأفلييت في قوقل (تجنبها فوراً):</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-500/20">
              <strong className="text-white block mb-1">1. المحتوى الرقيق (Thin Content)</strong>
              <p className="text-slate-300 leading-relaxed">
                إنشاء صفحات تحتوي فقط على روابط الإحالة بدون أي شرح أو إرشادات للمستخدم.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-500/20">
              <strong className="text-white block mb-1">2. نسيان وسم rel="sponsored"</strong>
              <p className="text-slate-300 leading-relaxed">
                تعتبر خوارزميات جوجل روابط الأفلييت غير الموسومة محاولة لشراء الروابط وتفرض عقوبات يدوية.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-500/20">
              <strong className="text-white block mb-1">3. إخفاء العيوب والمدح الأعمى</strong>
              <p className="text-slate-300 leading-relaxed">
                تحديثات Google Product Review تحلل التوازن بين الإيجابيات والسلبيات، والموقع غير الموضوعي يفقد ترتيبه.
              </p>
            </div>

            <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-rose-500/20">
              <strong className="text-white block mb-1">4. إهمال التحديث الزمني للعنوان</strong>
              <p className="text-slate-300 leading-relaxed">
                الباحث لن يضغط على نتيجة مكتوب فيها "أفضل عروض 2023" ونحن في 2026. التحديث الدوري يضمن نقرات مستمرة.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
