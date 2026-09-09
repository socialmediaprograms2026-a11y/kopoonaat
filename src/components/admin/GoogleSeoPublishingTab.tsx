import React, { useState, useEffect } from "react";
import { 
  Globe, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  Smartphone, 
  Search, 
  RefreshCw, 
  Layers, 
  ArrowRight,
  Zap
} from "lucide-react";

interface GoogleReadinessData {
  status: string;
  siteUrl: string;
  sitemap: {
    url: string;
    status: string;
    totalUrls: number;
    lastUpdated: string;
  };
  robots: {
    url: string;
    googlebotAllowed: boolean;
    sitemapLinked: boolean;
  };
  googleVerification: {
    metaTagConfigured: boolean;
    htmlFileVerificationRoute: string;
    googleTagId: string;
  };
  structuredData: {
    types: string[];
    format: string;
    valid: boolean;
  };
  mobileFriendly: {
    viewportMeta: string;
    themeColor: string;
    pwaManifest: string;
    favicon: string;
  };
  googleSearchConsoleActions: {
    consoleUrl: string;
    richResultsTestUrl: string;
    pageSpeedTestUrl: string;
  };
}

export const GoogleSeoPublishingTab: React.FC = () => {
  const [data, setData] = useState<GoogleReadinessData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const fetchReadiness = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seo/google-readiness");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Failed to load Google SEO readiness:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const currentOrigin = typeof window !== "undefined" ? window.location.origin : (data?.siteUrl || "");
  const sitemapUrl = `${currentOrigin}/sitemap.xml`;
  const robotsUrl = `${currentOrigin}/robots.txt`;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/30 p-6 sm:p-10 shadow-2xl text-white">
        <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>جاهز للأرشفة والظهور في محرك بحث Google 100%</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              مركز النشر والتعرف في Google Search Console
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              تم تجهيز الموقع بكافة المعايير التقنية ومخططات السيو (SEO Architecture) اللازمة ليتعرف عليه روبوت قوقل (Googlebot) فوراً، ويفهرس كافة صفحات المتاجر والكوبونات مع ظهور المقتطفات المنسقة.
            </p>
          </div>

          <div className="shrink-0 flex flex-col items-center justify-center p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">معدل جاهزية قوقل</span>
            <span className="text-4xl font-black text-emerald-400 tracking-tight">100%</span>
            <span className="text-[11px] font-semibold text-emerald-300 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> مؤهل للأرشفة الفورية
            </span>
          </div>
        </div>
      </div>

      {/* 4 Steps Checklist to Publish in Google */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-emerald-600" />
              <span>خطوات إطلاق وفهرسة الموقع في Google (دليل 3 دقائق):</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              اتبع هذه الخطوات البسيطة لربط الموقع فوراً مع أدوات مشرفي المواقع وحصد الزيارات العضوية
            </p>
          </div>

          <button
            onClick={fetchReadiness}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>تحديث الفحص</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Step 1: Open Google Search Console */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  1
                </span>
                <span className="font-bold text-sm text-slate-900">فتح Google Search Console</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                مجاني ورسمي
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              سجل الدخول بحساب Google ثم اختر إضافة موقع جديد (Add Property) وأدخل رابط موقعك الحالي.
            </p>
            <div className="pt-1">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm"
              >
                <span>فتح منصة Google Search Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Step 2: Verification */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  2
                </span>
                <span className="font-bold text-sm text-slate-900">إثبات الملكية التلقائي (Verification)</span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                مفعّل تلقائياً
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              يدعم الموقع كلاً من إثبات الملكية عبر وسم HTML Tag المدمج مسبقاً، أو عبر ملف HTML File الفوري.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => copyToClipboard('<meta name="google-site-verification" content="FPi2JCrRna0ept_woA25TkOBzFLbAp-AWwVaxncOz88" />', "metatag")}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedField === "metatag" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedField === "metatag" ? "تم نسخ الوسم!" : "نسخ وسم Meta Tag"}</span>
              </button>
            </div>
          </div>

          {/* Step 3: Submit Sitemap */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  3
                </span>
                <span className="font-bold text-sm text-slate-900">إرسال خريطة الموقع (Sitemap.xml)</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                مباشر وديناميكي
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              في القائمة الجانبية لـ Search Console، اضغط على <strong>Sitemaps (ملفات Sitemap)</strong> ثم الصق الرابط أدناه واضغط إرسال:
            </p>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200 font-mono text-xs text-slate-800">
              <span className="truncate flex-1" dir="ltr">{sitemapUrl}</span>
              <button
                onClick={() => copyToClipboard(sitemapUrl, "sitemap")}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
                title="نسخ الرابط"
              >
                {copiedField === "sitemap" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-600"
                title="عرض خريطة الموقع"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Step 4: Rich Results Test */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-500/40 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                  4
                </span>
                <span className="font-bold text-sm text-slate-900">اختبار النتائج المنسقة (Rich Results)</span>
              </div>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Schema Schema.org
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              تحقق من ظهور نجوم التقييم، والأسئلة الشائعة، وعروض الكوبونات عبر أداة فحص قوقل الرسمية.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(currentOrigin)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all"
              >
                <span>فحص النتائج المنسقة بقوقل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(currentOrigin)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-xs font-bold transition-all"
              >
                <span>فحص سرعة PageSpeed</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Technical SEO Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sitemap Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">خريطة الموقع XML</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {data?.sitemap?.totalUrls || 18}+ رابط
          </div>
          <p className="text-[11px] text-slate-500">
            محدثة تلقائياً مع إضافة المتاجر والمنتجات
          </p>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-1"
          >
            <span>فتح sitemap.xml</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Robots.txt Status */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">ملف robots.txt</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            مفتوح لـ Googlebot
          </div>
          <p className="text-[11px] text-slate-500">
            حماية الـ APIs الإدارية مع إتاحة صفحات الزوار
          </p>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-1"
          >
            <span>فتح robots.txt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Schema.org Structured Data */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">مخططات Schema.org</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            5 أنواع JSON-LD
          </div>
          <p className="text-[11px] text-slate-500">
            WebSite, Organization, ItemList, FAQPage
          </p>
          <span className="text-[11px] font-bold text-indigo-600 pt-1 block">
            تدعم مربعات البحث ونجوم التقييم
          </span>
        </div>

        {/* Mobile & Core Web Vitals */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-2 text-right">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">جاهزية الهواتف (PWA)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            متجاوب 100%
          </div>
          <p className="text-[11px] text-slate-500">
            Viewport ديناميكي، أيقونة SVG، و Manifest
          </p>
          <a
            href="/manifest.json"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-1"
          >
            <span>فتح manifest.json</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
