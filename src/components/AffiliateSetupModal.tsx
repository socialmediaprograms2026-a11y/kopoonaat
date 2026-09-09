import React, { useState, useEffect } from "react";
import { 
  X, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Save, 
  Sparkles, 
  RotateCcw, 
  DollarSign, 
  Cpu, 
  Link2, 
  Key, 
  BookOpen, 
  HelpCircle,
  Copy,
  Check,
  AlertTriangle,
  Award,
  Wallet,
  Building2,
  FileCheck,
  Shield,
  Lightbulb,
  Download,
  FileSpreadsheet,
  FileDown,
  Loader2,
  Zap,
  CreditCard,
  Coins,
  Smartphone,
  ArrowUpRight,
  QrCode
} from "lucide-react";
import { StoreBrand } from "../types";
import { LazyBrandLogo } from "./common/LazyBrandLogo";
import { 
  AffiliateSettings, 
  saveAffiliateSettings, 
  countConfiguredOverrides,
  DEFAULT_AFFILIATE_SETTINGS,
  autoApplyMasterCodeToAllStores
} from "../utils/affiliateStorage";

interface AffiliateSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: StoreBrand[];
  currentSettings: AffiliateSettings;
  onSaveSettings: (newSettings: AffiliateSettings) => void;
}

export const AffiliateSetupModal: React.FC<AffiliateSetupModalProps> = ({
  isOpen,
  onClose,
  brands,
  currentSettings,
  onSaveSettings
}) => {
  const [activeTab, setActiveTab] = useState<"crypto_wallet" | "how_to_register" | "acceptance_guide" | "no_bank_solutions" | "enter_codes" | "preview">("crypto_wallet");
  const [settings, setSettings] = useState<AffiliateSettings>(currentSettings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedTs, setCopiedTs] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedWallet, setCopiedWallet] = useState(false);
  const [testPayoutSuccess, setTestPayoutSuccess] = useState<string | null>(null);
  const [isSendingTestPayout, setIsSendingTestPayout] = useState(false);
  const [universalCodeInput, setUniversalCodeInput] = useState(currentSettings.universalMasterCode || "");
  const [masterAppliedSuccess, setMasterAppliedSuccess] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [csvSuccess, setCsvSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(currentSettings);
      setUniversalCodeInput(currentSettings.universalMasterCode || "");
    }
  }, [isOpen, currentSettings]);

  if (!isOpen) return null;

  const handleApplyUniversalMasterCode = () => {
    if (!universalCodeInput.trim()) return;
    const newSettings = autoApplyMasterCodeToAllStores(settings, brands, universalCodeInput);
    setSettings(newSettings);
    saveAffiliateSettings(newSettings);
    onSaveSettings(newSettings);
    setMasterAppliedSuccess(true);
    setTimeout(() => setMasterAppliedSuccess(false), 3000);
  };

  const handleOverrideChange = (storeId: string, field: "affiliateUrl" | "primaryCode", value: string) => {
    setSettings(prev => ({
      ...prev,
      storeOverrides: {
        ...prev.storeOverrides,
        [storeId]: {
          ...prev.storeOverrides[storeId],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    saveAffiliateSettings(settings);
    onSaveSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleReset = () => {
    if (window.confirm("هل أنت متأكد من رغبتك في استعادة الأكواد الافتراضية التجريبية؟")) {
      setSettings(DEFAULT_AFFILIATE_SETTINGS);
      saveAffiliateSettings(DEFAULT_AFFILIATE_SETTINGS);
      onSaveSettings(DEFAULT_AFFILIATE_SETTINGS);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const configuredCount = countConfiguredOverrides(settings);

  const handleDownloadCsv = async () => {
    try {
      setIsExportingCsv(true);

      // Fetch latest reports if available to enrich the monthly performance summary
      let reportsMap: Record<string, any> = {};
      try {
        const res = await fetch("/api/admin/reports?groupBy=merchant");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.reports)) {
            data.reports.forEach((r: any) => {
              reportsMap[r.key] = r;
              reportsMap[r.name] = r;
            });
          }
        }
      } catch (e) {
        console.debug("Could not fetch reports for CSV, proceeding with local calculation", e);
      }

      const currentDate = new Date().toISOString().split("T")[0];
      const currentMonthIso = new Date().toISOString().slice(0, 7); // e.g. 2026-09
      const currentMonthLabel = new Intl.DateTimeFormat("ar-SA", { month: "long", year: "numeric" }).format(new Date());

      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const csvLines: string[] = [];
      
      // Header Metadata
      csvLines.push(escapeCsv("منصة استخبارات مواقع التسويق بالعمولة وسيو قوقل - تقرير إعدادات التتبع والأداء الشهري الشامل"));
      csvLines.push(`${escapeCsv("تاريخ استخراج التقرير")},${escapeCsv(currentDate)},${escapeCsv("الشهر المعني")},${escapeCsv(`${currentMonthLabel} (${currentMonthIso})`)}`);
      csvLines.push(`${escapeCsv("إجمالي المتاجر")},${escapeCsv(brands.length)},${escapeCsv("المتاجر المخصصة بحسابك")},${escapeCsv(configuredCount)},${escapeCsv("معرف أمازون النشط")},${escapeCsv(settings.amazonTag || "غير محدد")}`);
      csvLines.push(""); // empty row

      // SECTION 1: Configured Affiliate Tracking Data
      csvLines.push(escapeCsv("=== القسم الأول: بيانات روابط وأكواد التتبع المخصصة للمتاجر (CONFIGURED AFFILIATE TRACKING DATA) ==="));
      csvLines.push([
        escapeCsv("معرف المتجر (Store ID)"),
        escapeCsv("اسم المتجر بالعربية (Store Name AR)"),
        escapeCsv("اسم المتجر بالإنجليزية (Store Name EN)"),
        escapeCsv("التصنيف (Category)"),
        escapeCsv("حالة التتبع (Tracking Status)"),
        escapeCsv("كود الخصم المعتمد (Active Coupon Code)"),
        escapeCsv("رابط التتبع المخصص (Configured Tracking URL)"),
        escapeCsv("رابط المتجر الافتراضي (Default Destination URL)"),
        escapeCsv("برنامج / شبكة الأفلييت المقترنة (Partner Network)"),
        escapeCsv("العمولة أو الخصم المقدر (Commission / Discount Rate)"),
        escapeCsv("تاريخ الإعداد والتوثيق (Configuration Date)")
      ].join(","));

      brands.forEach((brand) => {
        const override = settings.storeOverrides[brand.id] || {};
        const isCustom = Boolean(
          (override.primaryCode && override.primaryCode.trim()) ||
          (override.affiliateUrl && override.affiliateUrl.trim()) ||
          (brand.id === "amazon-sa" && settings.amazonTag.trim())
        );

        const activeCode = override.primaryCode?.trim() || brand.defaultCode || "لا يوجد كود مباشر";
        let activeUrl = override.affiliateUrl?.trim();
        if (!activeUrl && brand.id === "amazon-sa" && settings.amazonTag.trim()) {
          activeUrl = `https://www.amazon.sa/?tag=${encodeURIComponent(settings.amazonTag.trim())}`;
        }
        if (!activeUrl) {
          activeUrl = brand.affiliateUrl;
        }

        const networkName = brand.id === "amazon-sa" 
          ? "Amazon Associates KSA"
          : (brand.id === "noon-sa" ? "Noon Partners" : (brand.id === "iherb" ? "iHerb Rewards" : "ArabClicks / Awin / Admitad"));

        csvLines.push([
          escapeCsv(brand.id),
          escapeCsv(brand.arabicName),
          escapeCsv(brand.name),
          escapeCsv(brand.category),
          escapeCsv(isCustom ? "مخصص بحسابك (CUSTOM_ACCOUNT)" : "يعمل بالرابط الافتراضي (DEFAULT)"),
          escapeCsv(activeCode),
          escapeCsv(activeUrl),
          escapeCsv(brand.affiliateUrl),
          escapeCsv(networkName),
          escapeCsv(brand.reward || brand.discountRate || "عمولة تسويقية"),
          escapeCsv(currentDate)
        ].join(","));
      });

      csvLines.push(""); // empty row

      // SECTION 2: Monthly Performance Summary
      csvLines.push(escapeCsv("=== القسم الثاني: ملخص الأداء الشهري للعمولات والتحويلات (MONTHLY PERFORMANCE SUMMARY) ==="));
      csvLines.push([
        escapeCsv("الشهر (Month)"),
        escapeCsv("معرف المتجر (Store ID)"),
        escapeCsv("اسم المتجر (Store Name)"),
        escapeCsv("حالة الإعداد (Configuration Status)"),
        escapeCsv("عدد النقرات المسجلة (Recorded Clicks)"),
        escapeCsv("عدد المبيعات / التحويلات (Conversions)"),
        escapeCsv("معدل التحويل (Conversion Rate %)"),
        escapeCsv("إجمالي قيمة الطلبات بالريال (Total Order Value SAR)"),
        escapeCsv("العمولة المكتسبة بالريال (Earned Commission SAR)"),
        escapeCsv("العمولة المعتمدة (Approved Commission SAR)"),
        escapeCsv("العمولة قيد المعالجة (Pending Commission SAR)"),
        escapeCsv("العملة الأساسية (Currency)"),
        escapeCsv("حالة التسوية والتدقيق (Reconciliation Status)")
      ].join(","));

      let totalClicksSum = 0;
      let totalConversionsSum = 0;
      let totalOrderValueSum = 0;
      let totalCommissionSum = 0;
      let totalApprovedSum = 0;
      let totalPendingSum = 0;

      brands.forEach((brand) => {
        const override = settings.storeOverrides[brand.id] || {};
        const isCustom = Boolean(
          (override.primaryCode && override.primaryCode.trim()) ||
          (override.affiliateUrl && override.affiliateUrl.trim()) ||
          (brand.id === "amazon-sa" && settings.amazonTag.trim())
        );

        const report = reportsMap[brand.id] || reportsMap[brand.arabicName] || reportsMap[brand.name] || {
          clicks: 0,
          conversions: 0,
          conversionRate: 0,
          totalOrderValue: 0,
          commissionAmount: 0,
          approvedCommission: 0,
          pendingCommission: 0
        };

        const clicks = report.clicks || 0;
        const conversions = report.conversions || 0;
        const convRate = report.conversionRate || (clicks > 0 ? parseFloat(((conversions / clicks) * 100).toFixed(2)) : 0);
        const orderValue = report.totalOrderValue || 0;
        const commission = report.commissionAmount || 0;
        const approved = report.approvedCommission || 0;
        const pending = report.pendingCommission || 0;

        totalClicksSum += clicks;
        totalConversionsSum += conversions;
        totalOrderValueSum += orderValue;
        totalCommissionSum += commission;
        totalApprovedSum += approved;
        totalPendingSum += pending;

        csvLines.push([
          escapeCsv(currentMonthIso),
          escapeCsv(brand.id),
          escapeCsv(`${brand.arabicName} (${brand.name})`),
          escapeCsv(isCustom ? "حساب مخصص نشط" : "افتراضي"),
          escapeCsv(clicks),
          escapeCsv(conversions),
          escapeCsv(`${convRate}%`),
          escapeCsv(orderValue.toFixed(2)),
          escapeCsv(commission.toFixed(2)),
          escapeCsv(approved.toFixed(2)),
          escapeCsv(pending.toFixed(2)),
          escapeCsv("SAR"),
          escapeCsv(conversions > 0 ? "تم التدقيق والمطابقة (RECONCILED)" : "نشط وبانتظار التحويلات (ACTIVE_WAITING)")
        ].join(","));
      });

      // Total Aggregate Row
      const overallConvRate = totalClicksSum > 0 ? ((totalConversionsSum / totalClicksSum) * 100).toFixed(2) : "0.00";
      csvLines.push([
        escapeCsv("الإجمالي العام (TOTAL AGGREGATE)"),
        escapeCsv("ALL"),
        escapeCsv("جميع المتاجر المشمولة"),
        escapeCsv(`${configuredCount} مخصص من أصل ${brands.length}`),
        escapeCsv(totalClicksSum),
        escapeCsv(totalConversionsSum),
        escapeCsv(`${overallConvRate}%`),
        escapeCsv(totalOrderValueSum.toFixed(2)),
        escapeCsv(totalCommissionSum.toFixed(2)),
        escapeCsv(totalApprovedSum.toFixed(2)),
        escapeCsv(totalPendingSum.toFixed(2)),
        escapeCsv("SAR"),
        escapeCsv("مطابق لمعايير السيو وشبكات الأفلييت")
      ].join(","));

      // Trigger Browser Download with UTF-8 BOM
      const csvContent = "\uFEFF" + csvLines.join("\r\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `affiliate-tracking-performance-${currentMonthIso}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setCsvSuccess(true);
      setTimeout(() => setCsvSuccess(false), 3500);
    } catch (err) {
      console.error("Failed to generate and download CSV:", err);
    } finally {
      setIsExportingCsv(false);
    }
  };

  // Official verified registration links for Arab & Global networks
  const officialNetworks = [
    {
      id: "amazon-sa",
      name: "أمازون أسوشيتس السعودية (Amazon Associates KSA)",
      directSignupUrl: "https://affiliate-program.amazon.sa/",
      reward: "عمولة تصل إلى 9% - 14% على كل عملية شراء",
      payoutMethods: "حوالة بنكية محلية في السعودية (IBAN) أو بطاقات هدايا أمازون (Gift Cards)",
      approvalSpeed: "فوري وتلقائي (يتطلب 3 مبيعات خلال 180 يوم لتثبيت الحساب نهائياً)",
      description: "برنامج التسويق بالعمولة الرسمي لأمازون السعودية. يتيح لك تحويل أي رابط منتج أو عروض يومية إلى رابط عمولة خاص بك.",
      steps: [
        "ادخل على الرابط الرسمي وسجل دخولك بحساب أمازون العادي.",
        "ضع رابط هذا الموقع في خانة (Website / App List).",
        "احصل فوراً على معرف المتجر الخاص بك (Store ID / Tracking Tag) مثل: yourname-21.",
        "الصق المعرف في خانة (معرف أمازون) في تبويب إدخال الأكواد ليتفعل الموقع بأكمله!"
      ],
      badge: "الأسهل والأسرع للبدء"
    },
    {
      id: "noon-partners",
      name: "برنامج نون بارتنرز (Noon Affiliates & Influencers)",
      directSignupUrl: "https://affiliates.noon.com/",
      reward: "عمولة كاش باك 10% لكل عميل يستخدم كودك الحصري",
      payoutMethods: "تحويل بنكي شهري مباشر بالريال السعودي (IBAN)",
      approvalSpeed: "من 24 إلى 48 ساعة",
      description: "يمنحك كود خصم حصري خاص بك (مثل NOON10 أو ALHAT10)، وعند استخدام الزائر للكود يحصل على خصم 10% وتكسب أنت العمولة النقدية.",
      steps: [
        "سجل كصانع محتوى أو مسوق إلكتروني عبر صفحة نون الرسمية.",
        "أرفق رابط هذا الموقع كقناة تسويق رسمية لجلب زوار سعوديين ذوي نية شراء.",
        "اطلب كود الخصم المخصص للسعودية (KSA Coupon Code).",
        "الصق الكود في خانة متجر نون في هذا الموقع لتبدأ أرباحك فوراً."
      ],
      badge: "أعلى معدل تحويل في الخليج"
    },
    {
      id: "arabclicks",
      name: "شبكة عرب كليكس (ArabClicks Network)",
      directSignupUrl: "https://www.arabclicks.com/",
      reward: "تجمع (نمشي، نايس ون، ستايلي، شي إن، صيدلية الدواء، هوم بوكس...)",
      payoutMethods: "حوالة بنكية أو PayPal",
      approvalSpeed: "خلال 24 ساعة بموافقة مدير الحساب",
      description: "الشبكة الأولى في الشرق الأوسط لعروض المتاجر وتوفر لك روابط تتبع وأكواد خصم لأكثر من 200 متجر سعودي وخليجي في لوحة واحدة.",
      steps: [
        "سجل حساب Publisher جديد وضع رابط موقعك هذا كقناة تسويق.",
        "اختر متجر (نمشي، نايس ون، إلخ) واطلب الحصول على رابط التتبع أو الكود.",
        "انسخ الرابط أو الكود والصقه في المتجر المقابل له في هذا الموقع."
      ],
      badge: "شبكة شاملة لمئات المتاجر"
    },
    {
      id: "iherb-rewards",
      name: "برنامج مكافآت آي هيرب (iHerb Rewards & Affiliates)",
      directSignupUrl: "https://www.iherb.com/rewards",
      reward: "خصم 5% إلى 10% لعملائك + عمولة 5% كاش لك على كل طلب",
      payoutMethods: "سحب بنكي مباشر بالريال السعودي عبر Hyperwallet",
      approvalSpeed: "فوري 100% بدون شروط",
      description: "أسهل نظام مكافآت: أي حساب شخصي عادي في آي هيرب يمتلك تلقائياً كود مكافآت (مثل ABC1234) يمنحك عمولات كاش عند استخدامه.",
      steps: [
        "افتح حسابك العادي في تطبيق أو موقع آي هيرب.",
        "توجه إلى قسم (المكافآت - Rewards) وانسخ الكود المكون من 6-7 أحرف وأرقام.",
        "الصق الكود في خانة آي هيرب في هذا الموقع."
      ],
      badge: "تفعيل فوري خلال دقيقة واحدة"
    },
    {
      id: "dcm-network",
      name: "شبكة دي سي إم نتورك (DCM Network)",
      directSignupUrl: "https://www.dcmnetwork.com/",
      reward: "عمولات حصرية على متاجر الأزياء والإلكترونيات في السعودية والإمارات",
      payoutMethods: "حوالة بنكية مباشرة للبنك المحلي",
      approvalSpeed: "خلال 48 ساعة",
      description: "شبكة تسويق رائدة في الشرق الأوسط توفر أكواد كوبونات حصرية (Exclusive Promo Codes) معتمدة لدى المتاجر الكبرى.",
      steps: [
        "سجل كناشر وضع بيانات موقعك وتخصصه في العروض والتخفيضات.",
        "اطلب تفعيل حملات المتاجر التي تريدها والصق الأكواد في موقعك."
      ],
      badge: "أكواد حصرية وعمولات مرتفعة"
    },
    {
      id: "admitad",
      name: "أدميتاد الشرق الأوسط (Admitad Partner Network)",
      directSignupUrl: "https://www.admitad.com/publishers/",
      reward: "مئات البرامج العالمية والمحلية في قطاع التجارة والسياحة",
      payoutMethods: "تحويل بنكي / Payoneer / WebMoney",
      approvalSpeed: "فوري لمعظم البرامج",
      description: "شبكة عالمية تدعم برامج مثل علي إكسبرس، طيران، ومتاجر تجزئة متعددة مع تتبع لحظي للنقرات والتحويلات.",
      steps: [
        "أنشئ حساب ناشر واختر المنطقة (المملكة العربية السعودية).",
        "انضم لحملات المتاجر بضغطة زر واحصل على رابط الأفلييت المباشر."
      ],
      badge: "دعم دولي وخليجي واسع"
    }
  ];

  // Best practice tips for 100% guaranteed approval
  const acceptanceTips = [
    {
      icon: Building2,
      title: "1. إبراز هوية وتخصص الموقع في السوق السعودي",
      desc: "عند التسجيل، اذكر دائماً أن موقعك متخصص في (كوبونات وتخفيضات المتاجر في السعودية والخليج) ولديه جمهور مستهدف جاهز للشراء الفوري."
    },
    {
      icon: Link2,
      title: "2. تقديم رابط موقعك المباشر كقناة تسويق (Traffic Source)",
      desc: "انسخ رابط هذا الموقع وضعه في خانة Website URL. هذا الموقع مصمم باحترافية كاملة ومتجاوب وسريع مما يعطي انطباعاً رسمياً وموثوقاً لمدراء البرامج."
    },
    {
      icon: FileCheck,
      title: "3. استخدام الصيغة المهنية في وصف طريقة جلب الزوار",
      desc: "اختر خيارات التسويق: (SEO - Content/Coupon Site - Organic Search - Social Media). واذكر أنك لا تستخدم الإعلانات المضللة أو الرسائل المزعجة."
    },
    {
      icon: Wallet,
      title: "4. حل الحساب البنكي بدون تعقيد",
      desc: "إذا لم يكن لديك حساب بنكي تقليدي، يمكنك فتح حساب في ثوانٍ عبر تطبيقات البنوك الرقمية السعودية (STC Pay أو Urpay أو D360) لاستخراج رقم آيبان (IBAN) فوري، أو اختيار بطاقات هدايا أمازون في برنامج أمازون."
    }
  ];

  const standardPitchTemplate = `أمتلك منصة ويب احترافية متخصصة في جمع وتحديث عروض وكوبونات المتاجر الإلكترونية في المملكة العربية السعودية والخليج (SEO & Coupon Platform). الموقع مهيأ بمحركات البحث لجلب زوار عضويين يبحثون عن إتمام عمليات الشراء (High Purchase Intent Traffic). نسعى لعرض منتجاتكم وكوبوناتكم الرسمية للمتسوقين وزيادة حجم مبيعاتكم عبر توجيه حركة مستهدفة وموثوقة.`;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white border border-slate-200 rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden text-right font-['Cairo',sans-serif]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900">
                  مركز تفعيل الأرباح والتسجيل في برامج الأفلييت الرسمية
                </h3>
                <span className="text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  {configuredCount} متاجر مفعلة
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                روابط التسجيل الرسمية، نصائح القبول الفوري، وتفعيل أكوادك لضمان تحقيق الأرباح
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              disabled={isExportingCsv}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="تحميل ملف CSV لتتبع الروابط وملخص الأداء الشهري"
            >
              {isExportingCsv ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : csvSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span className="hidden sm:inline">{csvSuccess ? "تم تنزيل CSV" : "تصدير تقرير CSV"}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-full bg-white border border-slate-200 hover:bg-slate-100 transition-colors cursor-pointer"
              title="إغلاق"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 p-3 px-6 border-b border-slate-100 bg-white overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab("crypto_wallet")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "crypto_wallet"
                ? "bg-amber-500 text-slate-950 shadow-xs font-black ring-2 ring-amber-400"
                : "text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Coins className="w-4 h-4 text-amber-700" />
            <span className="flex items-center gap-1.5">
              <span>محفظة بينانس واستلام الأرباح</span>
              <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">نشطة ومربوطة</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("no_bank_solutions")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "no_bank_solutions"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span className="flex items-center gap-1.5">
              <span>بدائل استلام الأرباح بدون حساب بنكي</span>
              <span className="bg-amber-100 text-amber-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">5 حلول فورية</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("how_to_register")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "how_to_register"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>روابط التسجيل الرسمية المباشرة (6 برامج)</span>
          </button>

          <button
            onClick={() => setActiveTab("acceptance_guide")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "acceptance_guide"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>نصائح ضمان القبول 100% ونموذج الإجابة</span>
          </button>

          <button
            onClick={() => setActiveTab("enter_codes")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "enter_codes"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Key className="w-4 h-4" />
            <span className="flex items-center gap-1.5">
              <span>إدخال الأكواد والطيار الآلي الموحد</span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded-full font-black">{configuredCount} متجر</span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === "preview"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>المعاينة والتطبيق الفوري</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">

          {/* TAB: Binance Wallet & Crypto Payout Destination */}
          {activeTab === "crypto_wallet" && (
            <div className="space-y-6">
              
              {/* Binance Wallet Hero Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-amber-950/40 to-slate-950 border-2 border-amber-500/40 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
                
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-black text-xl shadow-lg shadow-amber-500/30">
                      <Coins className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-black text-white">
                          محفظة بينانس المعتمدة لاستقبال الأرباح
                        </h3>
                        <span className="text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          نشطة وجاهزة للاستقبال
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                        تم ربط وتثبيت عنوان محفظتك في منصة بينانس (Binance) بنجاح كوجهة رئيسية لاستلام عوائد وعمولات التسويق بالعمولة بالريال السعودي أو ما يعادلها بالدولار الرقمي (USDT).
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 p-3 rounded-2xl border border-amber-500/30 flex items-center gap-3 shrink-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-bold">المنصة والشبكة</span>
                      <span className="text-xs font-black text-amber-400">Binance • BEP20 / ERC20</span>
                    </div>
                  </div>
                </div>

                {/* Wallet Address Box */}
                <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-bold flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" />
                      عنوان المحفظة الخاص بك (Binance Deposit Address):
                    </span>
                    <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60">
                      Verified EVM Address
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm font-mono text-amber-300 select-all overflow-x-auto tracking-wide text-left">
                      {settings.payoutAccountIdentifier || "0xddeae422ae06b08122d4f44510a7b99410ac3d19"}
                    </div>
                    <button
                      onClick={() => {
                        const addr = settings.payoutAccountIdentifier || "0xddeae422ae06b08122d4f44510a7b99410ac3d19";
                        navigator.clipboard.writeText(addr);
                        setCopiedWallet(true);
                        setTimeout(() => setCopiedWallet(false), 2500);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shrink-0"
                    >
                      {copiedWallet ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>نسخ العنوان</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>ملاحظة: يمكنك إيداع واستلام عملات USDT و BNB و ETH وغيرها عبر هذا العنوان الموحد.</span>
                    <a
                      href={`https://bscscan.com/address/${settings.payoutAccountIdentifier || "0xddeae422ae06b08122d4f44510a7b99410ac3d19"}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 font-bold underline"
                    >
                      <span>فحص العنوان على مستكشف البلوكشين (BscScan)</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Edit & Customize Wallet Form */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      تحديث عنوان المحفظة إن رغبت:
                    </label>
                    <input
                      type="text"
                      value={settings.payoutAccountIdentifier || ""}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        payoutMethod: "crypto",
                        payoutAccountIdentifier: e.target.value.trim()
                      }))}
                      placeholder="0x..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white focus:border-amber-400 focus:outline-none text-left"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      الشبكة المفضلة (Network):
                    </label>
                    <select
                      value={settings.payoutWalletNetwork || "BEP20 (BNB Smart Chain) / ERC20"}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        payoutWalletNetwork: e.target.value
                      }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-amber-400 focus:outline-none"
                    >
                      <option value="BEP20 (BNB Smart Chain) / ERC20">BEP20 (BNB Smart Chain - الرسوم الأقل والأسرع)</option>
                      <option value="ERC20 (Ethereum Network)">ERC20 (Ethereum Network)</option>
                      <option value="Polygon / Arbitrum (L2)">Polygon / Arbitrum</option>
                    </select>
                  </div>
                </div>

                {/* Test Simulation Payout Button */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    <span className="font-bold text-slate-200 block mb-0.5">تجربة استقبال أرباح تجريبية:</span>
                    <span>اضغط الزر لتسجيل معاملة إيداع تجريبية على محفظتك في سجل الأرباح بالموقع</span>
                  </div>

                  <button
                    onClick={async () => {
                      setIsSendingTestPayout(true);
                      setTestPayoutSuccess(null);
                      try {
                        const res = await fetch("/api/admin/payout/test-payout", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ amountSar: 100 })
                        });
                        const data = await res.json();
                        if (res.ok) {
                          setTestPayoutSuccess("تم تسجيل عملية إيداع أرباح تجريبية بقيمة 100 ر.س (26.67 USDT) إلى محفظتك بنجاح!");
                          setTimeout(() => setTestPayoutSuccess(null), 5000);
                        }
                      } catch (err: any) {
                        console.error(err);
                      } finally {
                        setIsSendingTestPayout(false);
                      }
                    }}
                    disabled={isSendingTestPayout}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    {isSendingTestPayout ? "جاري المعالجة..." : "إجراء تحويل أرباح تجريبي لمحفظتي"}
                  </button>
                </div>

                {testPayoutSuccess && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-bold animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{testPayoutSuccess}</span>
                  </div>
                )}
              </div>

              {/* 3 Steps to Cash Out from Binance to Bank / Cash */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-amber-600" />
                  <span>كيف تستلم أرباحك كاش أو في حسابك في السعودية من بينانس (Binance)؟</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">1</span>
                    <h5 className="font-bold text-slate-900">استقبال العمولات (USDT)</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      تصلك الأرباح والعمولات مباشرة بالدولار الرقمي (USDT) إلى عنوان محفظتك في حسابك ببينانس بدون وساطة بنكية.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">2</span>
                    <h5 className="font-bold text-slate-900">البيع عبر Binance P2P</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      افتح تطبيق بينانس واختر (P2P Trading). اختر بيع USDT بالريال السعودي (SAR) وستجد مئات المشترين المعتمدين.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1.5">
                    <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-900 font-black text-xs flex items-center justify-center">3</span>
                    <h5 className="font-bold text-slate-900">استلام الكاش أو STC Pay</h5>
                    <p className="text-slate-600 text-[11px] leading-relaxed">
                      يحول لك المشتري المبلغ فوراً بالريال إلى STC Pay أو Urpay أو أي بنك محلي برقم جوالك، ثم تؤكد له الاستلام.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 0: Solutions for users without a bank account */}
          {activeTab === "no_bank_solutions" && (
            <div className="space-y-6">
              
              {/* Header Direct Answer Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 text-emerald-400">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white">
                        ليس لديك حساب بنكي وتجد التسجيل في 15 متجراً أمراً متعباً؟
                      </h3>
                      <span className="text-[11px] font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
                        حلول بديلة 100% بدون أي بنك
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                      لا تقلق نهائياً! لست بحاجة إلى حساب بنكي تجاري تقليدي، ولست مضطراً للتسجيل في 15 شركة منفصلة. وفرت الأنظمة العالمية <strong>5 بدائل قانونية ورسمية معتمدة</strong> لاستلام أرباحك كاش باليد أو على جوالك، مع ميزة <strong>الطيار الآلي الموحد</strong> التي برمجناها لك لربط كل المتاجر بكود واحد فقط!
                    </p>
                  </div>
                </div>
              </div>

              {/* 5 Concrete Solutions Cards */}
              <div className="space-y-4">
                <h4 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-emerald-600" />
                  <span>أفضل 5 طرق لاستلام الأرباح بدون زيارة أي بنك:</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Solution 1: Amazon Gift Cards */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50/70 to-orange-50/40 border-2 border-amber-300/80 hover:border-amber-400 transition-all space-y-3 relative overflow-hidden shadow-xs">
                    <div className="absolute -top-3 -left-3 bg-amber-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xs">
                      الخيار الأسهل عالمياً (0% متطلبات)
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-900">1. بطاقات هدايا أمازون الرقمية (Amazon eGift Cards)</h5>
                        <span className="text-[11px] text-amber-800 font-bold">لا تتطلب أي حساب بنكي أو أوراق نهائياً</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      عند التسجيل في برنامج أمازون أسوشيتس السعودية، تختار طريقة استلام الأرباح: <strong>"Amazon Gift Certificate"</strong>. تُرسل لك أمازون رصيد أرباحك في نهاية كل شهر مباشرة إلى بريدك الإلكتروني.
                    </p>
                    <div className="bg-white/90 p-3 rounded-xl border border-amber-200 text-xs text-slate-800 space-y-1">
                      <strong className="block text-amber-900 font-bold">كيف تستفيد من الرصيد؟</strong>
                      <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-600">
                        <li>شراء أي منتجات من أمازون (جوالات، عطور، ملابس) لك أو لعائلتك مجاناً.</li>
                        <li>بيع رصيد البطاقات لأصدقائك أو عبر الإنترنت واستلام مقابله ريالات كاش باليد!</li>
                      </ul>
                    </div>
                  </div>

                  {/* Solution 2: STC Pay & Urpay */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-50/70 to-indigo-50/40 border-2 border-purple-300/80 hover:border-purple-400 transition-all space-y-3 relative overflow-hidden shadow-xs">
                    <div className="absolute -top-3 -left-3 bg-purple-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full shadow-xs">
                      رقم آيبان رسمي في 3 دقائق
                    </div>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-900">2. المحافظ الرقمية السعودية (STC Pay أو Urpay)</h5>
                        <span className="text-[11px] text-purple-800 font-bold">تفتحها بجوالك وأنت في بيتك عبر نفاذ</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      بدلاً من الذهاب للبنوك، حمّل تطبيق <strong>STC Pay</strong> أو <strong>Urpay</strong> على جوالك. سجل بهويتك الوطنية أو الإقامة، وسيمنحك التطبيق فوراً <strong>رقم آيبان سعودي (IBAN) معتمد من البنك المركزي</strong>.
                    </p>
                    <div className="bg-white/90 p-3 rounded-xl border border-purple-200 text-xs text-slate-800 space-y-1">
                      <strong className="block text-purple-900 font-bold">الميزة السحرية:</strong>
                      <p className="text-[11px] text-slate-600 leading-relaxed">
                        تضع هذا الآيبان في شبكة نون بارتنرز أو عرب كليكس، وتصلك الحوالات على جوالك مباشرة، ثم تسحب الكاش من أي صراف آلي عبر بطاقة مدى الرقمية المجانية.
                      </p>
                    </div>
                  </div>

                  {/* Solution 3: PayPal & Payoneer */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-900">3. بايونير وباي بال (PayPal & Payoneer)</h5>
                        <span className="text-[11px] text-slate-500 font-bold">لجميع الدول العربية وحول العالم</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      التسجيل مجاني بريدك الإلكتروني ورقم جوالك دون الحاجة لأي كشف حساب بنكي. منصة <strong>Payoneer</strong> تمنحك بطاقة ماستركارد بلاستيكية تصلك لعنوانك، تسحب بها أرباحك كاش من أي صراف آلي في العالم.
                    </p>
                    <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                      معظم شبكات الأفلييت العالمية والوسيطة تدعم بايونير وباي بال كخيار دفع رئيسي وتلقائي.
                    </div>
                  </div>

                  {/* Solution 4: USDT Crypto */}
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all space-y-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                        <Coins className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-black text-slate-900">4. العملات الرقمية المشفرة (USDT - TRC20)</h5>
                        <span className="text-[11px] text-slate-500 font-bold">دفعات رقمية فورية بدون حدود جغرافية</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      العديد من شبكات التسويق والإعلانات الدولية توفر الدفع عبر عملة <strong>USDT</strong> المشفرة مباشرة إلى محفظتك في Binance أو Trust Wallet، ويمكنك بيعها واستلام الكاش محلياً في دقائق عبر خدمة P2P.
                    </p>
                    <div className="text-[11px] text-slate-500 bg-white p-2.5 rounded-xl border border-slate-200">
                      لا تطلب أي حساب بنكي أو معاملات بنكية، فقط عنوان محفظتك الرقمية.
                    </div>
                  </div>

                </div>
              </div>

              {/* Clarification about AI Auto-Registration and the 1-Click Solution */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950 text-white space-y-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h4 className="text-sm sm:text-base font-black text-white">
                      هل يمكن للذكاء الاصطناعي أن يسجل في المتاجر بدلاً منك تلقائياً؟
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      بكل أمانة ومصداقية تقنية: <strong>لا يوجد نظام أو ذكاء اصطناعي في العالم يستطيع إنشاء حسابات مالية قانونية بدلاً عنك</strong>، لأن المتاجر والشركات (مثل أمازون ونون) تشترط قانونياً التحقق من هويتك البشرية (KYC) وتحديد وجهة إرسال الأرباح لك لضمان عدم سرقة أموالك من قبل أطراف مجهولة.
                    </p>
                  </div>
                </div>

                {/* The 1-Click Auto-Pilot Feature in the website */}
                <div className="p-4 rounded-xl bg-white/10 border border-white/15 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-emerald-300 font-black">
                    <Zap className="w-4 h-4 text-emerald-400" />
                    <span>الحل الذي برمجناه لك: الطيار الآلي الموحد بضغطة زر واحدة (1-Click Auto-Pilot)</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">
                    لكي نوفر عليك تعب التسجيل في 15 متجراً، صممنا لك نظاماً ذكياً:
                    <br />
                    1. تسجل فقط في <strong>برنامج واحد فقط</strong> (مثلاً أمازون ببطاقات الهدايا، أو نون بكود خصم واحد).
                    <br />
                    2. تأخذ كودك أو معرفك الواحد، وتفتحه في تبويب <strong>"إدخال الأكواد والطيار الآلي"</strong>.
                    <br />
                    3. تضغط على زر <strong>"تطبيق تلقائي على جميع المتاجر الـ 15"</strong>، وسيقوم الموقع خلال ثانية واحدة ببرمجة ونشر كودك على كامل الموقع تلقائياً دون أي جهد منك!
                  </p>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => setActiveTab("enter_codes")}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all cursor-pointer shadow-md"
                  >
                    <span>تجربة الطيار الآلي الموحد الآن</span>
                    <Zap className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 1: Official Registration Links */}
          {activeTab === "how_to_register" && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-slate-700 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold text-slate-900 mb-1">
                    لماذا نستخدم الروابط الرسمية المباشرة؟
                  </strong>
                  التسجيل في هذه الروابط الرسمية مجاني 100% ويستغرق دقائق معدودة. يمنحك البرنامج معرفاً أو كوداً خاصاً بك مربوطاً مباشرة ببياناتك لاستلام عمولات المبيعات في حسابك بدون وسطاء أو اقتطاعات.
                </div>
              </div>

              <div className="space-y-4">
                {officialNetworks.map((net) => (
                  <div key={net.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm sm:text-base font-black text-slate-900">
                            {net.name}
                          </h4>
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                            {net.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {net.description}
                        </p>
                      </div>

                      <a
                        href={net.directSignupUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer"
                      >
                        <span>فتح صفحة التسجيل الرسمية</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] mb-3">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block mb-0.5 font-bold">نسبة العمولة:</span>
                        <span className="text-emerald-700 font-bold">{net.reward}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block mb-0.5 font-bold">طرق استلام الأرباح:</span>
                        <span className="text-slate-800 font-medium">{net.payoutMethods}</span>
                      </div>
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block mb-0.5 font-bold">سرعة الموافقة:</span>
                        <span className="text-slate-800 font-medium">{net.approvalSpeed}</span>
                      </div>
                    </div>

                    {/* Step by step guide */}
                    <div className="p-3 rounded-xl bg-white border border-slate-200 text-xs">
                      <div className="font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>خطوات التفعيل والربط السريع بالموقع:</span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                        {net.steps.map((st, i) => (
                          <li key={i}>{st}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* TAB 2: Acceptance Guide & Pitch */}
          {activeTab === "acceptance_guide" && (
            <div className="space-y-6">
              
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 leading-relaxed">
                  <strong className="block font-bold text-amber-950 mb-1">
                    دليل اجتياز مراجعة الحسابات وقبول موقعك في أي شبكة تسويق بالعمولة:
                  </strong>
                  تركز شبكات الأفلييت على نقطتين رئيسيتين: (1) أن يكون لديك موقع ذو مظهر لائق وجاهز، و(2) أن تكون طريقة جلب الزوار شرعية ونظامية وتزيد مبيعات المتاجر. موقعك الحالي يحقق المعيار الأول بالكامل، واتباع هذه النصائح يضمن قبولك 100%.
                </div>
              </div>

              {/* 4 Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {acceptanceTips.map((tip, idx) => {
                  const Icon = tip.icon;
                  return (
                    <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                          <Icon className="w-4 h-4" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-900">{tip.title}</h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Copyable Pitch Template */}
              <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">
                      نموذج الإجابة الجاهز لخانة (وصف قناة التسويق ومصدر الزوار):
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(standardPitchTemplate);
                      setCopiedPitch(true);
                      setTimeout(() => setCopiedPitch(false), 2000);
                    }}
                    className="flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl transition-all cursor-pointer font-bold shadow-xs"
                  >
                    {copiedPitch ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPitch ? "تم نسخ النص!" : "نسخ النص لطلب التسجيل"}</span>
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed text-right">
                  "{standardPitchTemplate}"
                </div>
                <p className="text-[11px] text-slate-400">
                  انسخ هذا النص وضعه في خانة (Description / How will you promote us) في استمارة التسجيل بأي شبكة لضمان القبول المباشر.
                </p>
              </div>

            </div>
          )}

          {/* TAB 3: Enter Codes & Links */}
          {activeTab === "enter_codes" && (
            <div className="space-y-6">
              
              {/* 1-Click Universal Auto-Pilot Hero Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 text-white shadow-md relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shrink-0 text-white shadow-xs">
                      <Zap className="w-6 h-6 text-amber-300" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          الطيار الآلي الموحد بضغطة زر واحدة (1-Click Universal Auto-Pilot)
                        </h4>
                        <span className="text-[10px] font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                          يوفر عليك 100% من التعب
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
                        بدلاً من إدخال 15 متجراً واحداً تلو الآخر: اكتب كودك الترويجي الموحد (مثل كودك من نون أو شبكة وسيطة)، واضغط <strong>"تطبيق فوري على كل المتاجر"</strong>، وسيقوم النظام بتحديث وبرمجة جميع المتاجر في ثانية واحدة!
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                    <input
                      type="text"
                      value={universalCodeInput}
                      onChange={(e) => setUniversalCodeInput(e.target.value)}
                      placeholder="اكتب كودك هنا (مثلاً: ALHAT10)"
                      className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-mono font-bold text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 uppercase placeholder:text-slate-400 text-center"
                    />
                    <button
                      onClick={handleApplyUniversalMasterCode}
                      disabled={!universalCodeInput.trim()}
                      className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                    >
                      {masterAppliedSuccess ? (
                        <>
                          <Check className="w-4 h-4 text-slate-950" />
                          <span>تم التطبيق على 15 متجراً!</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-slate-950" />
                          <span>تطبيق فوري على كل المتاجر</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {masterAppliedSuccess && (
                  <div className="mt-3 pt-3 border-t border-white/20 text-xs text-amber-200 font-bold flex items-center gap-2 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4 text-amber-300" />
                    <span>رائع! تم نشر الكود الموحد ({universalCodeInput.toUpperCase()}) وتفعيله فوراً على جميع متاجر الموقع الـ 15. اضغط زر "حفظ وتطبيق فوراً" بالأسفل لاعتماده نهائياً.</span>
                  </div>
                )}
              </div>

              {/* Informative Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900 block font-bold mb-1">
                    كيف تحول هذا الموقع إلى مصدر أرباح حقيقي بنسبة 100%؟
                  </strong>
                  كل ما عليك هو ملء خانة <strong>كود الخصم الخاص بك</strong> أو <strong>رابط التتبع</strong> للمتاجر التي اشتركت بها أدناه. وبمجرد الضغط على زر <strong>"حفظ وتطبيق فوراً"</strong>، ستتحول جميع الكوبونات وروابط الشراء في الموقع تلقائياً لتحمل هويتك التتبعية!
                </div>
              </div>

              {/* Global Tracking Parameters */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                  <Link2 className="w-4 h-4 text-emerald-600" />
                  <span>معرف أمازون وبارامتر التتبع العام:</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      معرف أمازون أسوشيتس (Amazon Associate Tag):
                    </label>
                    <input
                      type="text"
                      value={settings.amazonTag}
                      onChange={(e) => setSettings(prev => ({ ...prev, amazonTag: e.target.value }))}
                      placeholder="مثال: yourid-21"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none text-left font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      سيتم تطبيقه على جميع روابط أمازون السعودية في الموقع تلقائياً.
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      بارامتر التتبع العام (Global SubID):
                    </label>
                    <input
                      type="text"
                      value={settings.globalTrackingParam}
                      onChange={(e) => setSettings(prev => ({ ...prev, globalTrackingParam: e.target.value }))}
                      placeholder="مثال: subid=mydeals2026"
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none text-left font-mono"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      سيتم إلحاقه بنهاية أي رابط متجر لم تحدد له رابطاً مخصصاً.
                    </span>
                  </div>
                </div>
              </div>

              {/* Brand by Brand Configuration List */}
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-emerald-600" />
                  <span>تخصيص المتاجر الرئيسية (أدخل كودك أو رابطك الخاص):</span>
                </h4>

                <div className="space-y-3">
                  {brands.map((brand) => {
                    const override = settings.storeOverrides[brand.id] || {};
                    const isConfigured = Boolean(
                      (override.primaryCode && override.primaryCode.trim()) ||
                      (override.affiliateUrl && override.affiliateUrl.trim()) ||
                      (brand.id === "amazon-sa" && settings.amazonTag.trim())
                    );

                    return (
                      <div 
                        key={brand.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          isConfigured
                            ? "bg-emerald-50/40 border-emerald-300"
                            : "bg-white border-slate-200"
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <LazyBrandLogo
                              logoUrl={brand.logoUrl}
                              logoText={brand.logoText}
                              logoBg={brand.logoBg}
                              brandName={brand.arabicName}
                              size="xs"
                              className="shadow-xs"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="text-xs sm:text-sm font-bold text-slate-900">
                                  {brand.arabicName} ({brand.name})
                                </h5>
                                {isConfigured ? (
                                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    مفعل بحسابك
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                    يعمل بالرابط الافتراضي
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500">{brand.category}</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-slate-500">
                            الرابط الحالي: <a href={brand.affiliateUrl} target="_blank" rel="noreferrer" className="text-emerald-700 underline font-mono text-[10px]">زيارة المتجر</a>
                          </div>
                        </div>

                        {/* Input Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              كود الخصم الحصري الخاص بك (Coupon Code):
                            </label>
                            <input
                              type="text"
                              value={override.primaryCode || ""}
                              onChange={(e) => handleOverrideChange(brand.id, "primaryCode", e.target.value)}
                              placeholder={`مثال: كودك لـ ${brand.arabicName}`}
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none text-left font-mono font-bold uppercase"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              سيحل هذا الكود محل الكود التجريبي الحالي ويعرض ككودك الرسمي.
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                              رابط التتبع والأفلييت الخاص بك (Affiliate Tracking URL):
                            </label>
                            <input
                              type="url"
                              value={override.affiliateUrl || ""}
                              onChange={(e) => handleOverrideChange(brand.id, "affiliateUrl", e.target.value)}
                              placeholder="https://..."
                              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none text-left font-mono"
                            />
                            <span className="text-[10px] text-slate-500 mt-1 block">
                              رابط التتبع الذي حصلت عليه من شبكة الأفلييت لتحويل الزوار من خلاله.
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: Preview & Live Export */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <h4 className="text-xs font-bold text-emerald-900 mb-1">
                  ملخص الروابط والأكواد المخصصة:
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  لديك الآن <strong>{configuredCount}</strong> متجراً تم تفعيلها بروابط أو أكواد خاصة بك. أي زائر يدخل الموقع الآن وينقر على كود أو رابط هذه المتاجر، سيتم توجيهه برابط التتبع الخاص بك واحتساب الأرباح في رصيدك البنكي.
                </p>
              </div>

              {/* CSV Performance & Tracking Data Download Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-teal-50/40 to-slate-50 border border-emerald-300 text-slate-800 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FileSpreadsheet className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm sm:text-base font-black text-slate-900">
                          تصدير تقرير بيانات التتبع والأداء الشهري (CSV)
                        </h4>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300">
                          متوافق مع Excel و Google Sheets
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        قم بتنزيل ملف CSV شامل يحتوي على جدولين: 
                        (1) تفاصيل جميع المتاجر والروابط والأكواد المخصصة بحسابك، 
                        (2) ملخص الأداء الشهري للنقرات والتحويلات ومعدلات التحويل وقيم العمولات بالريال السعودي.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadCsv}
                    disabled={isExportingCsv}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {isExportingCsv ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>جاري إعداد التقرير...</span>
                      </>
                    ) : csvSuccess ? (
                      <>
                        <Check className="w-4 h-4 text-white" />
                        <span>تم تنزيل ملف CSV بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4" />
                        <span>تحميل التقرير الكامل (CSV)</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Report Highlights Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-emerald-200/80 text-xs">
                  <div className="bg-white/90 p-3 rounded-xl border border-emerald-200/70">
                    <span className="text-slate-500 block text-[11px] mb-0.5 font-bold">القسم الأول: روابط التتبع</span>
                    <span className="font-bold text-slate-900">{brands.length} متجراً ({configuredCount} مخصص بحسابك)</span>
                  </div>
                  <div className="bg-white/90 p-3 rounded-xl border border-emerald-200/70">
                    <span className="text-slate-500 block text-[11px] mb-0.5 font-bold">القسم الثاني: ملخص الأداء</span>
                    <span className="font-bold text-slate-900">النقرات، التحويلات، العمولات (SAR)</span>
                  </div>
                  <div className="bg-white/90 p-3 rounded-xl border border-emerald-200/70">
                    <span className="text-slate-500 block text-[11px] mb-0.5 font-bold">ترميز الملف</span>
                    <span className="font-bold text-emerald-700">UTF-8 BOM (أحرف عربية واضحة 100%)</span>
                  </div>
                </div>
              </div>

              {/* Code Export Box */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-emerald-400">
                    // إعداداتك المحفوظة بتنسيق JSON
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
                      setCopiedTs(true);
                      setTimeout(() => setCopiedTs(false), 2000);
                    }}
                    className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                  >
                    {copiedTs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedTs ? "تم النسخ" : "نسخ الإعدادات"}</span>
                  </button>
                </div>
                <pre className="text-xs text-slate-300 font-mono overflow-x-auto max-h-56 p-2 bg-slate-950 rounded-xl">
                  {JSON.stringify(settings, null, 2)}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Sticky Controls */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {saveSuccess && (
              <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                تم حفظ وتطبيق التعديلات على كامل الموقع بنجاح!
              </span>
            )}
            {csvSuccess && !saveSuccess && (
              <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                تم تنزيل ملف CSV بنجاح!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleDownloadCsv}
              disabled={isExportingCsv}
              className="px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="تحميل تقرير التتبع والأداء الشهري بصيغة CSV"
            >
              {isExportingCsv ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              ) : csvSuccess ? (
                <Check className="w-3.5 h-3.5 text-emerald-700" />
              ) : (
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              )}
              <span>{csvSuccess ? "تم تنزيل CSV" : "تحميل تقرير CSV"}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 border border-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="استعادة الأكواد الافتراضية"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>استعادة الافتراضي</span>
            </button>

            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>حفظ وتطبيق فوراً على الموقع</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
