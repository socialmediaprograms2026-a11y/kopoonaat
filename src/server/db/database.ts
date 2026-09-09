import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { SAUDI_STORE_BRANDS } from "../../data/couponsData";
import { SAUDI_PRODUCTS } from "../../data/productsData";
import {
  Merchant,
  Product,
  Coupon,
  Click,
  Conversion,
  Commission,
  EmailSubscriber,
  PriceAlert,
  CouponAlert,
  SyncJob,
  WebhookEvent,
  AffiliateNetworkConfig,
  CouponVerification,
  AffiliateIntegrationLog,
  AffiliateIntegration,
  AffiliateSyncLog,
  ProviderHealthStatus,
  TrendingNicheRecord,
  NicheSyncJobReport,
  PayoutDestinationConfig,
  PayoutTransactionRecord,
  Deal,
  CategoryItem,
  CountryConfig,
  CopyEvent,
  ProductPriceHistory,
  AdminAuditLog
} from "./schema";

export const CURRENCY_EXCHANGE_RATES: Record<string, number> = {
  SAR: 1.0,
  AED: 1.02,
  USD: 3.75,
  EUR: 4.10,
  GBP: 4.80,
  KWD: 12.20
};

interface DatabaseSchema {
  version: number;
  merchants: Merchant[];
  products: Product[];
  coupons: Coupon[];
  deals?: Deal[];
  categories?: CategoryItem[];
  countries?: CountryConfig[];
  copyEvents?: CopyEvent[];
  priceHistories?: ProductPriceHistory[];
  couponVerifications: CouponVerification[];
  clicks: Click[];
  conversions: Conversion[];
  commissions: Commission[];
  subscribers: EmailSubscriber[];
  priceAlerts: PriceAlert[];
  couponAlerts: CouponAlert[];
  syncJobs: SyncJob[];
  webhookEvents: WebhookEvent[];
  networks: AffiliateNetworkConfig[];
  integrationLogs: AffiliateIntegrationLog[];
  integrations: AffiliateIntegration[];
  affiliateSyncLogs: AffiliateSyncLog[];
  trendingNiches: TrendingNicheRecord[];
  nicheSyncJobs: NicheSyncJobReport[];
  payoutDestination: PayoutDestinationConfig;
  payoutTransactions: PayoutTransactionRecord[];
  linkVerifications?: Record<string, any>;
  adminAuditLogs?: AdminAuditLog[];
}

const DB_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DB_DIR, "affiliate_db.json");

// Initial Seed Data - Real Official Saudi & Global Networks
const INITIAL_NETWORKS: AffiliateNetworkConfig[] = [
  {
    id: "net_amazon",
    name: "Amazon Associates (أمازون أسوشيتس السعودية)",
    networkKey: "amazon",
    region: "المملكة العربية السعودية والخليج",
    website: "https://affiliate-program.amazon.sa",
    apiKeyEnvName: "AMAZON_ASSOCIATES_TAG",
    publisherIdEnvName: "AMAZON_ASSOCIATES_TAG",
    supportsWebhooks: false,
    supportsApiReporting: true,
    supportsSubIds: true,
    subIdParamName: "tag",
    connectionStatus: "NOT_CONFIGURED",
    notes: "برنامج شركاء أمازون السعودية الرسمي. يتطلب إضافة Tracking Tag في متغيرات البيئة."
  },
  {
    id: "net_awin",
    name: "Awin (أوين)",
    networkKey: "awin",
    region: "عالمي والشرق الأوسط",
    website: "https://www.awin.com",
    apiKeyEnvName: "AWIN_API_KEY",
    publisherIdEnvName: "AWIN_PUBLISHER_ID",
    webhookSecretEnvName: "AWIN_WEBHOOK_SECRET",
    supportsWebhooks: true,
    supportsApiReporting: true,
    supportsSubIds: true,
    subIdParamName: "clickref",
    connectionStatus: "NOT_CONFIGURED",
    notes: "شبكة أفلييت عالمية تدعم التتبع عبر ClickRef وبث التحويلات عبر Webhooks."
  },
  {
    id: "net_impact",
    name: "Impact Radius (إمباكت)",
    networkKey: "impact",
    region: "عالمي والشرق الأوسط",
    website: "https://impact.com",
    apiKeyEnvName: "IMPACT_ACCOUNT_SID",
    secretEnvName: "IMPACT_AUTH_TOKEN",
    webhookSecretEnvName: "IMPACT_WEBHOOK_SECRET",
    supportsWebhooks: true,
    supportsApiReporting: true,
    supportsSubIds: true,
    subIdParamName: "subId1",
    connectionStatus: "NOT_CONFIGURED",
    notes: "منصة الشراكات العالمية، تدعم توقيعات HMAC-SHA256 وتقارير التحويلات اللحظية."
  },
  {
    id: "net_cj",
    name: "CJ Affiliate (Commission Junction)",
    networkKey: "cj",
    region: "عالمي",
    website: "https://www.cj.com",
    apiKeyEnvName: "CJ_PERSONAL_ACCESS_TOKEN",
    publisherIdEnvName: "CJ_PUBLISHER_CID",
    supportsWebhooks: true,
    supportsApiReporting: true,
    supportsSubIds: true,
    subIdParamName: "sid",
    connectionStatus: "NOT_CONFIGURED",
    notes: "شبكة CJ الرائدة عالمياً لمتاجر البرمجيات والتجزئة والسفر."
  },
  {
    id: "net_shareasale",
    name: "ShareASale (شير إيه سيل)",
    networkKey: "shareasale",
    region: "عالمي والشرق الأوسط",
    website: "https://www.shareasale.com",
    apiKeyEnvName: "SHAREASALE_API_TOKEN",
    secretEnvName: "SHAREASALE_API_SECRET",
    publisherIdEnvName: "SHAREASALE_AFFILIATE_ID",
    webhookSecretEnvName: "SHAREASALE_WEBHOOK_SECRET",
    supportsWebhooks: true,
    supportsApiReporting: true,
    supportsSubIds: true,
    subIdParamName: "afftrack",
    connectionStatus: "NOT_CONFIGURED",
    notes: "منصة التسويق بالعمولة العالمية من مجموعة Awin، تدعم تتبع afftrack وربط المتاجر المباشرة."
  },
  {
    id: "net_admitad",
    name: "Admitad (أدميتاد)",
    networkKey: "admitad",
    region: "الشرق الأوسط والخليج وعالمي",
    website: "https://www.admitad.com",
    apiKeyEnvName: "ADMITAD_CLIENT_ID",
    secretEnvName: "ADMITAD_CLIENT_SECRET",
    supportsWebhooks: true,
    supportsApiReporting: true,
    supportsSubIds: true,
    subIdParamName: "subid",
    connectionStatus: "NOT_CONFIGURED",
    notes: "شبكة تغطي أبرز المتاجر الإلكترونية في منطقة الخليج ومصر."
  },
  {
    id: "net_arabclicks",
    name: "ArabClicks & DCM Network (عرب كليكس ودي سي إم)",
    networkKey: "arabclicks",
    region: "السعودية والإمارات والخليج",
    website: "https://www.arabclicks.com",
    apiKeyEnvName: "ARABCLICKS_API_KEY",
    publisherIdEnvName: "ARABCLICKS_AFFILIATE_ID",
    supportsWebhooks: true,
    supportsApiReporting: true,
    supportsSubIds: true,
    subIdParamName: "aff_sub",
    connectionStatus: "NOT_CONFIGURED",
    notes: "شبكة متخصصة في كبرى المتاجر الخليجية والعربية مثل نون، نمشي، نايس ون، ستايلي."
  }
];

const INITIAL_INTEGRATIONS: AffiliateIntegration[] = [
  {
    id: "int_amazon",
    name: "Amazon Associates SA",
    provider: "amazon",
    network: "Amazon",
    status: process.env.AMAZON_ASSOCIATES_TAG ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    trackingId: process.env.AMAZON_ASSOCIATES_TAG ? "amazon-sa-tag" : undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_cj",
    name: "CJ Affiliate (Commission Junction)",
    provider: "cj",
    network: "CJ",
    status: process.env.CJ_PERSONAL_ACCESS_TOKEN ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    publisherId: process.env.CJ_PUBLISHER_CID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_awin",
    name: "Awin Global & MENA",
    provider: "awin",
    network: "Awin",
    status: process.env.AWIN_API_KEY ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    publisherId: process.env.AWIN_PUBLISHER_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_impact",
    name: "Impact Radius Partnerships",
    provider: "impact",
    network: "Impact",
    status: process.env.IMPACT_ACCOUNT_SID ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_shareasale",
    name: "ShareASale Network",
    provider: "shareasale",
    network: "ShareASale",
    status: process.env.SHAREASALE_API_TOKEN ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    affiliateId: process.env.SHAREASALE_AFFILIATE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_admitad",
    name: "Admitad Affiliate Network",
    provider: "admitad",
    network: "Admitad",
    status: process.env.ADMITAD_CLIENT_ID ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_arabclicks",
    name: "ArabClicks / DCM Network",
    provider: "arabclicks",
    network: "ArabClicks",
    status: process.env.ARABCLICKS_API_KEY ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    affiliateId: process.env.ARABCLICKS_AFFILIATE_ID,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_linkaraby",
    name: "LinkAraby Network (منصة لينك عربي)",
    provider: "linkaraby",
    network: "LinkAraby",
    status: "CONNECTED",
    enabled: true,
    affiliateId: "gx333hkq2rph5",
    trackingId: "linkaraby-direct",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_postgres",
    name: "PostgreSQL Database Engine",
    provider: "postgres",
    network: "Cloud SQL",
    status: process.env.SQL_HOST ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_email",
    name: "SMTP & Resend Email Delivery",
    provider: "email",
    network: "Transactional Email",
    status: (process.env.RESEND_API_KEY || process.env.SMTP_HOST) ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "int_gemini",
    name: "Google Gemini AI Search & Verification",
    provider: "gemini",
    network: "Google Cloud",
    status: process.env.GEMINI_API_KEY ? "CONNECTED" : "NOT_CONFIGURED",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const INITIAL_TRENDING_NICHES: TrendingNicheRecord[] = [
  {
    id: "niche_coupons_ecommerce",
    name: "كوبونات وأكواد خصم المتاجر الإلكترونية الكبرى",
    englishName: "E-Commerce Deals & Coupon Codes",
    category: "التجارة الإلكترونية والتسوق",
    monthlySearchVolume: "18,500,000+",
    opportunityScore: 98,
    competitionLevel: "شرس",
    growthTrend: "+42% هذا الربع",
    topKeywords: ["كود خصم نون", "كوبون امازون السعودية", "كود خصم نمشي", "كود خصم ايهيرب قوي"],
    recommendedNetworks: ["ArabClicks", "Amazon Associates", "Admitad"],
    averageCommission: "5% - 15% لكل سلة",
    market: "mena",
    reasonForTrend: "سلوك المستهلك الخليجي يبحث بنسبة 70% عن كود خصم في جوجل قبل لحظة الدفع مباشرة، مما يمنح أعلى معدل تحويل ربحي.",
    lastAnalyzedAt: new Date().toISOString()
  },
  {
    id: "niche_smart_home",
    name: "كاميرات المراقبة وأقفال الأبواب والمنزل الذكي",
    englishName: "Smart Home Security & Automation",
    category: "الإلكترونيات والتقنية",
    monthlySearchVolume: "3,400,000+",
    opportunityScore: 92,
    competitionLevel: "متوسط",
    growthTrend: "+58% نمو سنوي",
    topKeywords: ["أفضل كاميرات مراقبة للمنزل بدون أسلاك", "قفل باب ذكي ببصمة الإصبع", "مساعد منزلي ذكي يدعم العربية"],
    recommendedNetworks: ["Amazon Associates", "Noon Partners"],
    averageCommission: "6% - 10% (سعر القطعة 300 - 1800 ر.س)",
    market: "all",
    reasonForTrend: "إقبال هائل من الأسر الخليجية على تأمين المنازل والشقق الجديدة بأنظمة ذكية لاسلكية سهلة التركيب الذاتي.",
    lastAnalyzedAt: new Date().toISOString()
  },
  {
    id: "niche_ai_video",
    name: "أدوات وتطبيقات الذكاء الاصطناعي لتعديل الفيديو",
    englishName: "AI Video Editing & SaaS Creator Tools",
    category: "البرمجيات والاشتراكات (SaaS)",
    monthlySearchVolume: "12,200,000+",
    opportunityScore: 95,
    competitionLevel: "متوسط",
    growthTrend: "+115% هذا العام",
    topKeywords: ["أفضل برنامج مونتاج بالذكاء الاصطناعي", "AI video generator free trial", "تحويل النص إلى فيديو واقعي"],
    recommendedNetworks: ["Impact", "ShareASale", "CJ Affiliate"],
    averageCommission: "30% - 50% عمولة اشتراك متكررة شهرياً (Recurring)",
    market: "global",
    reasonForTrend: "أرباح العمولات المتكررة (SaaS Recurring) تتيح دخلاً شهرياً مستمراً طالما المستخدم يجدد اشتراكه في البرنامج.",
    lastAnalyzedAt: new Date().toISOString()
  },
  {
    id: "niche_luxury_perfumes",
    name: "العطور والبخور والعود والمخلطات الفاخرة",
    englishName: "Luxury Arabian Perfumes & Niche Fragrances",
    category: "العطور والجمال",
    monthlySearchVolume: "6,800,000+",
    opportunityScore: 90,
    competitionLevel: "مرتفع",
    growthTrend: "+38% موسم الذروة",
    topKeywords: ["أفضل عطور العود للجنسين", "كود خصم نايس ون عطور", "عطور فرنسية نسائية فخمة"],
    recommendedNetworks: ["ArabClicks", "Admitad", "Noon"],
    averageCommission: "8% - 18% للطلب الواحد",
    market: "mena",
    reasonForTrend: "دول الخليج تسجل أعلى معدل إنفاق عالمي للفرد على العطور والبخور مع تكرار شرائي عالي جداً على مدار السنة.",
    lastAnalyzedAt: new Date().toISOString()
  },
  {
    id: "niche_health_supplements",
    name: "المكملات الغذائية والفيتامينات والبروتين",
    englishName: "Health Supplements, Vitamins & Organic Foods",
    category: "الصحة واللياقة",
    monthlySearchVolume: "8,900,000+",
    opportunityScore: 89,
    competitionLevel: "مرتفع",
    growthTrend: "+45% نمو متصاعد",
    topKeywords: ["كود خصم ايهيرب السعودية", "أفضل أنواع أوميغا 3 نقية", "فيتامين دال 50000 وحدة"],
    recommendedNetworks: ["iHerb Rewards", "Amazon Associates", "Awin"],
    averageCommission: "5% - 15% + عمولة إعادة الطلب",
    market: "all",
    reasonForTrend: "وعي صحي متزايد بالوقاية، وسهولة تكرار الشراء الشهري من مواقع مثل آي هيرب وأمازون.",
    lastAnalyzedAt: new Date().toISOString()
  },
  {
    id: "niche_ergonomic_office",
    name: "كراسي ومكاتب العمل المريحة والبيئة المكتبية",
    englishName: "Ergonomic Chairs & Standing Desks",
    category: "الأثاث والمنزل",
    monthlySearchVolume: "2,600,000+",
    opportunityScore: 88,
    competitionLevel: "سهل",
    growthTrend: "+34% نمو متواصل",
    topKeywords: ["أفضل كرسي مكتبي طبي لآلام الظهر", "مكتب كهربائي متحرك ذكي", "ملحقات العمل عن بعد"],
    recommendedNetworks: ["Amazon Associates", "Awin", "ShareASale"],
    averageCommission: "7% - 12% (قيمة الطلب 800 - 3500 ر.س)",
    market: "all",
    reasonForTrend: "العمل الهجين وعن بعد حوّل تجهيزات المكتب المنزلي إلى استثمار صحي أساسي يبحث عنه مئات الآلاف.",
    lastAnalyzedAt: new Date().toISOString()
  },
  {
    id: "niche_pet_supplies",
    name: "مستلزمات ورعاية القطط والحيوانات الأليفة",
    englishName: "Pet Supplies & Specialized Nutrition",
    category: "الحيوانات الأليفة",
    monthlySearchVolume: "4,100,000+",
    opportunityScore: 87,
    competitionLevel: "سهل",
    growthTrend: "+52% نمو سنوي",
    topKeywords: ["أفضل دراي فود للقطط الصغيرة", "رمل قطط بدون غبار وروائح", "ألعاب ونوافير شرب ذكية للحيوانات"],
    recommendedNetworks: ["Amazon Associates", "Noon Partners"],
    averageCommission: "6% - 10% دورية شهرية",
    market: "mena",
    reasonForTrend: "المربين يشترون أطعمة ومستلزمات قططهم شهرياً بنمط ثابت، مع ولاء عالي جداً وتنافس سيو قليل عربياً.",
    lastAnalyzedAt: new Date().toISOString()
  },
  {
    id: "niche_travel_hotels",
    name: "حجوزات الفنادق والطيران وعروض السفر الفاخر",
    englishName: "Travel Deals, Flights & Boutique Hotel Bookings",
    category: "السياحة والسفر",
    monthlySearchVolume: "14,700,000+",
    opportunityScore: 91,
    competitionLevel: "شرس",
    growthTrend: "+60% في مواسم العطلات",
    topKeywords: ["كود خصم بوكينج السعودية", "أفضل فنادق دبي العائلية مع مسبح خاص", "حجوزات طيران مخفضة رخيصة"],
    recommendedNetworks: ["CJ Affiliate", "Awin", "Travelpayouts"],
    averageCommission: "4% - 12% من قيمة الحجز الفندقي (عائد مالي ضخم للعملية الواحدة)",
    market: "all",
    reasonForTrend: "سلة الحجز السياحي تتجاوز عادة 3000 إلى 15000 ريال، مما يجعل عمولة الحجز الواحد مجزية للغاية.",
    lastAnalyzedAt: new Date().toISOString()
  }
];

const INITIAL_MERCHANTS: Merchant[] = [
  {
    id: "m_amazon_sa",
    slug: "amazon-sa",
    name: "Amazon Saudi Arabia",
    arabicName: "أمازون السعودية",
    tagline: "أكبر سوق إلكتروني في المملكة مع خدمة برايم للتوصيل السريع",
    logoText: "Amazon.sa",
    logoBg: "bg-amber-500",
    primaryColor: "#FF9900",
    category: "إلكترونيات وجوالات",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://www.amazon.sa",
    affiliateUrl: "https://www.amazon.sa",
    affiliateNetwork: "Amazon Associates",
    affiliateProgramId: "amazon-sa-direct",
    commissionRate: "4% - 9%",
    cookieDuration: "24 ساعة",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كوبونات وعروض أمازون السعودية 2026 | خصومات حصرية",
    seoDescription: "دليل عروض وتخفيضات أمازون السعودية الرسمية، شحن مجاني لأعضاء برايم، وتوفير على الإلكترونيات والمستلزمات اليومية.",
    aboutStore: "أمازون السعودية هو السوق الإلكتروني الرائد في المملكة، يضم ملايين المنتجات من الأجهزة الذكية، مستلزمات المنزل، العطور والأزياء، مع توصيل سريع وموثوق.",
    savingTips: [
      "اشترك في برنامج Amazon Prime للحصول على توصيل مجاني بدون حد أدنى للمشتريات.",
      "تابع عروض اليوم وعروض الجمعة البيضاء وعيد الفطر السنوية لتوفير حتى 60%.",
      "استخدم بطاقات الدفع الائتمانية للبنوك الشريكة (مثل الراجحي والأهلي) للحصول على كاش باك إضافي."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_noon_sa",
    slug: "noon",
    name: "Noon KSA",
    arabicName: "نون السعودية",
    tagline: "منصة التسوق العربية الرائدة في الشرق الأوسط",
    logoText: "noon",
    logoBg: "bg-yellow-400",
    primaryColor: "#FEEE00",
    category: "إلكترونيات وجوالات",
    featured: true,
    country: "السعودية والخليج",
    websiteUrl: "https://www.noon.com/saudi-ar",
    affiliateUrl: "https://www.noon.com/saudi-ar",
    affiliateNetwork: "ArabClicks & Admitad",
    commissionRate: "5% - 10%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم نون السعودية 2026 | أقوى العروض والتخفيضات",
    seoDescription: "استفد من كود خصم نون السعودية لتوفير حتى 10% على الإلكترونيات، الأزياء، ومنتجات السوبرماركت في الرياض وجدة وجميع مدن المملكة.",
    aboutStore: "نون هي أكبر منصة تسوق عربية تقدم خدمات التوصيل الفوري لمنتجات نون إكسبرس مع دعم كامل للدفع عند الاستلام وبرامج التقسيط تابي وتمارا.",
    savingTips: [
      "تطبيق كود الخصم في خانة الدفع يمنحك خصماً فورياً 10% بحد أقصى 50 ريال للطلب.",
      "اختر منتجات 'نون إكسبرس' لضمان سرعة الشحن وجودة التغليف.",
      "قسم مشترياتك عبر تابي أو تمارا بدون فوائد على 4 دفعات ميسرة."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_namshi",
    slug: "namshi",
    name: "Namshi",
    arabicName: "نمشي",
    tagline: "الوجهة الأولى للموضة والأزياء والماركات العالمية في الخليج",
    logoText: "NAMSHI",
    logoBg: "bg-black",
    primaryColor: "#000000",
    category: "أزياء وموضة",
    featured: true,
    country: "السعودية والخليج",
    websiteUrl: "https://www.namshi.com/saudi-ar",
    affiliateUrl: "https://www.namshi.com/saudi-ar",
    affiliateNetwork: "ArabClicks",
    commissionRate: "8% - 12%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم نمشي السعودية 2026 | تخفيضات الماركات العالمية",
    seoDescription: "أحدث كوبونات خصم نمشي للأزياء الرجالية والنسائية ومستلزمات الأطفال، وفر حتى 20% على أشهر الماركات.",
    aboutStore: "نمشي هي منصة الأزياء المفضلة لدى ملايين المتسوقين في السعودية والخليج، وتضم أكثر من 1300 علامة تجارية عالمية ومحلية في عالم الموضة والجمال.",
    savingTips: [
      "احصل على خصم إضافي عند الدفع باستخدام بطاقات مدى أو Apple Pay.",
      "تصفح قسم 'التخفيضات الدائمة' لتوفير يصل إلى 70% على تشكيلات المواسم السابقة."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_iherb",
    slug: "iherb",
    name: "iHerb Saudi Arabia",
    arabicName: "آي هيرب السعودية",
    tagline: "أفضل المكملات الغذائية، الفيتامينات والمنتجات العضوية الطبيعية",
    logoText: "iHerb",
    logoBg: "bg-emerald-700",
    primaryColor: "#107c10",
    category: "صحة ومكملات",
    featured: true,
    country: "عالمي متاح بالسعودية",
    websiteUrl: "https://sa.iherb.com",
    affiliateUrl: "https://sa.iherb.com",
    affiliateNetwork: "iHerb Rewards / Impact",
    commissionRate: "5% - 10%",
    cookieDuration: "7 أيام",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم آي هيرب السعودية 2026 | شحن سريع ومجاني للمملكة",
    seoDescription: "وفر مع كود خصم آي هيرب على الفيتامينات، المكملات الغذائية، ومنتجات العناية بالبشرة العضوية مع توصيل مباشر للسعودية عبر سمسا وأرامكس.",
    aboutStore: "آي هيرب هي المنصة العالمية الرائدة في بيع المكملات الغذائية المعتمدة والمنتجات الصحية بأسعار منافسة وجودة مخبرية مضمونة.",
    savingTips: [
      "شحن مجاني مباشر للمملكة عند تجاوز قيمة الطلب 190 ريال سعودي.",
      "اشترِ كميات متعددة من نفس المنتج للحصول على خصم كمية إضافي بنسبة 5% إلى 10%."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_niceone",
    slug: "nice-one",
    name: "Nice One",
    arabicName: "نايس ون",
    tagline: "الوجهة الأولى للمكياج، العطور، والعناية في السعودية",
    logoText: "NICE ONE",
    logoBg: "bg-pink-600",
    primaryColor: "#E91E63",
    category: "عطور وتجميل",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://niceonesa.com",
    affiliateUrl: "https://niceonesa.com",
    affiliateNetwork: "ArabClicks / Direct",
    commissionRate: "6% - 10%",
    cookieDuration: "15 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم نايس ون 2026 | أقوى تخفيضات العطور والمكياج الأصلي",
    seoDescription: "كود خصم نايس ون فعال ومجرب على جميع العطور الأصلية، مستحضرات التجميل، وأجهزة العناية الشخصية مع توصيل سريع.",
    aboutStore: "نايس ون هي المنصة السعودية الرائدة في عالم الجمال، وتوفر تشكيلة واسعة من العطور العالمية الأصلية ومستحضرات التجميل والعناية بأسعار منافسة.",
    savingTips: [
      "استفد من عروض 'حبة وحبة مجاناً' في المناسبات الوطنية والأعياد.",
      "تطبيق الكود يخصم إضافياً على المنتجات المخفضة بالفعل."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_jarir",
    slug: "jarir",
    name: "Jarir Bookstore",
    arabicName: "مكتبة جرير",
    tagline: "ليست مجرد مكتبة.. الوجهة الرائدة للإلكترونيات والكتب المدرسية",
    logoText: "JARIR",
    logoBg: "bg-blue-600",
    primaryColor: "#004B87",
    category: "إلكترونيات وجوالات",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://www.jarir.com",
    affiliateUrl: "https://www.jarir.com",
    affiliateNetwork: "Direct / Admitad",
    commissionRate: "3% - 6%",
    cookieDuration: "7 أيام",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "عروض وتخفيضات مكتبة جرير 2026 | أحدث الجوالات واللابتوبات",
    seoDescription: "تصفح أحدث عروض مكتبة جرير على جوالات آيفون، سامسونج، أجهزة الآيباد، واللابتوبات مع ضمان الوكيل المعتمد وتوصيل لكل مدن المملكة.",
    aboutStore: "مكتبة جرير هي كبرى الشركات الرائدة في مجال بيع الأجهزة الذكية، الكمبيوتر، الأدوات المكتبية والكتب في السعودية والخليج.",
    savingTips: [
      "استفد من خدمة تقسيط المشتريات بسعر الكاش عبر البطاقات الائتمانية المؤهلة.",
      "استبدل جهازك القديم بجديد عبر برنامج استبدال جرير الترويجي."
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_linkaraby",
    slug: "linkaraby",
    name: "LinkAraby",
    arabicName: "منصة لينك عربي",
    tagline: "بوابة الربح والتسويق بالعمولة والخدمات الرقمية المتكاملة",
    logoText: "LinkAraby",
    logoBg: "bg-blue-600",
    primaryColor: "#2563eb",
    category: "خدمات واشتراكات",
    featured: true,
    country: "السعودية والخليج",
    websiteUrl: "https://www.linkaraby.com",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "linkaraby-portal",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "10% - 25%",
    cookieDuration: "60 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "منصة لينك عربي للتسويق بالعمولة 2026 | أرباح وعمولات مباشرة",
    seoDescription: "سجل وابدأ التسويق بالعمولة مع منصة لينك عربي الرائدة وحقق عوائد مستمرة.",
    aboutStore: "منصة لينك عربي تتيح للمسوقين الوصول لأفضل البرامج التسويقية الخليجية وتتبع الإحالات والأرباح.",
    savingTips: ["سجل عبر الرابط المباشر لتفعيل حساب المسوق المعتمد."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_bshti",
    slug: "bshti",
    name: "Bshti Store",
    arabicName: "متجر بشتي",
    tagline: "أفخم البشوت والمشالح الملكية والرجالية التراثية الفاخرة",
    logoText: "بشتي",
    logoBg: "bg-amber-800",
    primaryColor: "#78350f",
    category: "أزياء وموضة",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://bshti.com",
    affiliateUrl: "https://bshti.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    affiliateNetwork: "LinkAraby",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "8% - 15%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم متجر بشتي 2026 (BSH10) | أفخم البشوت والمشالح السعودية",
    seoDescription: "أقوى كود خصم متجر بشتي للبشوت والمشالح الملكية الفاخرة.",
    aboutStore: "متجر بشتي هو الوجهة السعودية الأولى للبشوت الملكية والمشالح الفاخرة.",
    savingTips: ["استخدم كود الخصم BSH10 للحصول على توفير فوري 10%."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_maysan_it",
    slug: "maysan-it",
    name: "Maysan IT Solutions",
    arabicName: "ميسان لتقنية المعلومات",
    tagline: "حلول تقنية رائدة، استضافات، تصميم مواقع، وبرمجيات سحابية",
    logoText: "Maysan",
    logoBg: "bg-cyan-700",
    primaryColor: "#0891b2",
    category: "خدمات واشتراكات",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://maysan-it.com",
    affiliateUrl: "https://maysan-it.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    affiliateNetwork: "LinkAraby",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "15% - 20%",
    cookieDuration: "45 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كوبون خصم ميسان لتقنية المعلومات 2026 (MAY20) | حلول البرمجة",
    seoDescription: "خصم 20% على خدمات تصميم المتاجر والمواقع وحلول البرمجة.",
    aboutStore: "شركة ميسان لتقنية المعلومات تقدم استشارات وتطوير أنظمة ومتاجر احترافية.",
    savingTips: ["استخدم كود الخصم MAY20 عند طلب خدمات البرمجة والتصميم."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_the_right_way",
    slug: "the-right-way-sa",
    name: "The Right Way SA",
    arabicName: "متجر الطريق الصحيح",
    tagline: "وجهتك المتكاملة للمنتجات الصحية والمكملات واللايف ستايل الطبيعي",
    logoText: "RightWay",
    logoBg: "bg-emerald-700",
    primaryColor: "#059669",
    category: "صحة ومكملات",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://the-right-way-sa.com",
    affiliateUrl: "https://the-right-way-sa.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    affiliateNetwork: "LinkAraby",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "10% - 15%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم الطريق الصحيح 2026 (WAY15) | مكملات غذائية وأغذية صحية",
    seoDescription: "وفر مع كود خصم متجر الطريق الصحيح على الأغذية العضوية والمكملات الطبيعية.",
    aboutStore: "متجر الطريق الصحيح يقدم باقة من الأغذية الصحية والمكملات الطبيعية الموثوقة.",
    savingTips: ["طبق كود الخصم WAY15 للحصول على 15% خصم فوري."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_kagad441",
    slug: "kagad441",
    name: "Kagad 441",
    arabicName: "متجر كجد 441",
    tagline: "أفضل المنتجات العصرية، الإلكترونيات، ومستلزمات الحياة الحديثة",
    logoText: "KAGAD",
    logoBg: "bg-purple-700",
    primaryColor: "#7c3aed",
    category: "إلكترونيات وجوالات",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://kagad441.com",
    affiliateUrl: "https://kagad441.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    affiliateNetwork: "LinkAraby",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "7% - 12%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم كجد 441 (KGD10) | إلكترونيات وإكسسوارات عصرية",
    seoDescription: "كود خصم كجد 441 لتوفير 10% على أحدث المنتجات الذكية والإكسسوارات.",
    aboutStore: "متجر كجد 441 يوفر تشكيلة واسعة من الإلكترونيات والأجهزة المنزلية العصرية.",
    savingTips: ["استخدم كود KGD10 لخصم فوري 10%."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_rahma_store",
    slug: "rahma-store",
    name: "Rahma Store",
    arabicName: "متجر رحمة",
    tagline: "منتجات العناية الطبيعية، العطور، والجمال والراحة المنزلية",
    logoText: "رحمة",
    logoBg: "bg-rose-600",
    primaryColor: "#e11d48",
    category: "عطور وتجميل",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://rahma.store",
    affiliateUrl: "https://rahma.store/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    affiliateNetwork: "LinkAraby",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "10% - 15%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم متجر رحمة 2026 (RH15) | عطور ومنتجات العناية الطبيعية",
    seoDescription: "كود خصم متجر رحمة RH15 لعام 2026 على العطور ومستحضرات التجميل.",
    aboutStore: "متجر رحمة هو وجهتك لمنتجات العناية الفاخرة والعطور ومستحضرات الجمال الطبيعية.",
    savingTips: ["استخدم كود الخصم RH15 للحصول على توفير 15% فوري."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_bloomingdales_sa",
    slug: "bloomingdales",
    name: "Bloomingdale's KSA",
    arabicName: "بلومينغديلز السعودية",
    tagline: "أفخم الماركات العالمية، أزياء المصممين، حقائب فاخرة ومستحضرات الجمال",
    logoText: "bloomingdale's",
    logoBg: "bg-neutral-900",
    primaryColor: "#171717",
    category: "أزياء وموضة",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://bloomingdales.sa",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=ea4e6b1d",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "ea4e6b1d",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "8% - 15%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم بلومينغديلز السعودية 2026 فعال (BLOOM15) | خصم 15% إضافي",
    seoDescription: "أقوى كود خصم بلومينغديلز السعودية مجرب ومضمون لعام 2026. تسوق أشهر الماركات الفاخرة مثل غوتشي وسان لوران مع شحن فوري.",
    aboutStore: "متجر بلومينغديلز السعودية هو عنوان الأناقة والفخامة العالمية في المملكة، حيث يقدم أحدث خطوط الموضة والأزياء الراقية، الحقائب الفاخرة، ومستحضرات التجميل العالمية.",
    savingTips: ["استخدم كود الخصم BLOOM15 للحصول على توفير 15% إضافي على الأزياء والمصممين."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_dkny_sa",
    slug: "dkny",
    name: "DKNY Saudi Arabia",
    arabicName: "دكني السعودية (DKNY)",
    tagline: "حقائب، أحذية، وإكسسوارات عصرية بطابع نيويورك الأنيق",
    logoText: "DKNY",
    logoBg: "bg-zinc-900",
    primaryColor: "#27272a",
    category: "أزياء وموضة",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://dkny.sa",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d4f6659f",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "d4f6659f",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "10% - 15%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم دكني السعودية 2026 (DKNY15) | خصم 15% على الحقائب والأحذية",
    seoDescription: "استفد من كود خصم DKNY السعودية 2026 الحصري. وفر 15% على حقائب اليد، الأحذية العصرية والملابس الأنيقة من دكني.",
    aboutStore: "متجر دكني الرسمي في المملكة العربية السعودية يقدم أروع تصاميم الموضة الأمريكية المستوحاة من حيوية مدينة نيويورك، ويشتهر بتشكيلاته الأيقونية من حقائب اليد والأحذية.",
    savingTips: ["استخدم كود الخصم DKNY15 لتوفير 15% فوري على سلة التسوق."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_sharaf_dg_sa",
    slug: "sharaf-dg",
    name: "Sharaf DG KSA",
    arabicName: "شرف دي جي السعودية",
    tagline: "أفضل عروض الإلكترونيات، الشاشات، الجوالات والأجهزة المنزلية بالضمان",
    logoText: "Sharaf DG",
    logoBg: "bg-blue-700",
    primaryColor: "#1d4ed8",
    category: "إلكترونيات وجوالات",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://saudi.sharafdg.com",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=9b88579c",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "9b88579c",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "4% - 8%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "عروض وتخفيضات شرف دي جي السعودية 2026 | خصم حتى 50% على الأجهزة",
    seoDescription: "دليل عروض شرف دي جي السعودية الحصرية لعام 2026. أقوى التخفيضات على الجوالات، شاشات التلفزيون الذكية، أجهزة المطبخ واللابتوبات مع ضمان معتمد.",
    aboutStore: "شرف دي جي Sharaf DG هي إحدى أكبر سلاسل متاجر الإلكترونيات الموثوقة في منطقة الخليج والمملكة العربية السعودية، وتوفر كافة أجهزة التكنولوجيا والأجهزة المنزلية الأصلية 100%.",
    savingTips: ["تابع عروض Super Deals الأسبوعية من شرف دي جي للحصول على خصومات تصل 50%."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_atyaab_store",
    slug: "atyaab",
    name: "Atyaab Shop",
    arabicName: "أطياب المرشود (Atyaab)",
    tagline: "أرقى العطور الشرقية، الدخون، دهن العود المعتق والمرشات الفاخرة",
    logoText: "أطياب",
    logoBg: "bg-amber-900",
    primaryColor: "#78350f",
    category: "عطور وتجميل",
    featured: true,
    country: "السعودية والخليج",
    websiteUrl: "https://atyaabshop.com",
    affiliateUrl: "https://atyaabshop.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=31ea81bd",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "31ea81bd",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "12% - 18%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم أطياب المرشود 2026 (ATYAB10) | خصم 10% على العطور والبخور",
    seoDescription: "استخدم كود خصم متجر أطياب المرشود Atyaab Shop ووفر 10% على أفخم العطور التراثية والفرنسية، خلطات الدخون الملكي، دهن العود، ومعطرات الجو.",
    aboutStore: "دار أطياب المرشود هي إحدى أعرق بيوت العطور في الخليج العربي منذ عام 1925، وتتميز بابتكار أنقى خلطات العود والبخور والعطور النيش.",
    savingTips: ["طبق كود الخصم ATYAB10 للحصول على تخفيض 10% فوري على كامل تشكيلة العطور والبخور."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_asnas_store",
    slug: "asnas",
    name: "Asnas Store",
    arabicName: "متجر أصناس (Asnas)",
    tagline: "أفضل منتجات العناية بالجمال، أجهزة المساج والمستلزمات العصرية",
    logoText: "أصناس",
    logoBg: "bg-teal-800",
    primaryColor: "#0f766e",
    category: "عطور وتجميل",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://asnasstore.com",
    affiliateUrl: "https://asnasstore.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=349e97f3",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "349e97f3",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "10% - 15%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم متجر أصناس 2026 (ASNAS10) | منتجات العناية والجمال والمنزل",
    seoDescription: "كود خصم متجر أصناس Asnas Store الحصري لعام 2026. احصل على خصم 10% فوري على أجهزة العناية بالبشرة، منتجات الاسترخاء والمستلزمات العصرية.",
    aboutStore: "متجر أصناس منصة سعودية رائدة متخصصة في تقديم أحدث منتجات العناية بالجمال، أجهزة التدليك والمساج المنزلية، والمستلزمات اليومية المختارة بعناية.",
    savingTips: ["استخدم كود الخصم ASNAS10 للحصول على خصم 10% عند إتمام الشراء."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_aliexpress_deals",
    slug: "aliexpress-deals",
    name: "AliExpress SuperDeals",
    arabicName: "علي إكسبريس - أقوى 2000 صفقة مخفضة",
    tagline: "صفقات سوبر ديلز بأسعار الجملة وتخفيضات حتى 80% مع شحن سريع Choice",
    logoText: "SuperDeals",
    logoBg: "bg-rose-600",
    primaryColor: "#e11d48",
    category: "إلكترونيات وجوالات",
    featured: true,
    country: "عالمي متاح بالسعودية",
    websiteUrl: "https://aliexpress.com",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=0f80f9bb",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "0f80f9bb",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "7% - 12%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "صفقات سوبر ديلز علي إكسبريس 2026 | أقوى 2000 منتج بخصم 80%",
    seoDescription: "تصفح رابط صفقات علي إكسبريس الحصري لأقوى 2000 سلعة مخفضة بأفضل سعر للمستهلك السعودي مع ضمان الشحن السريع Choice وتوصيل حتى باب بيتك.",
    aboutStore: "رابط صفقات السوبر من علي إكسبريس AliExpress SuperDeals يجمع قائمة بأكثر من 2000 منتج خضعوا لأعلى درجات التخفيض المباشر من المصانع مباشرة.",
    savingTips: ["اختر منتجات Choice للحصول على شحن مجاني عند الشراء بأكثر من 50 ريال مع سرعة وصول متميزة."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "m_aliexpress_sa",
    slug: "aliexpress",
    name: "AliExpress Saudi Arabia",
    arabicName: "علي إكسبريس السعودية (AliExpress)",
    tagline: "أضخم متجر إلكتروني شامل: إلكترونيات، أدوات ذكية، أزياء، ومنزل بأسعار مذهلة",
    logoText: "AliExpress",
    logoBg: "bg-orange-600",
    primaryColor: "#ea580c",
    category: "إلكترونيات وجوالات",
    featured: true,
    country: "السعودية",
    websiteUrl: "https://aliexpress.com",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d987c32b",
    affiliateNetwork: "LinkAraby",
    affiliateProgramId: "d987c32b",
    affiliateTrackingId: "gx333hkq2rph5",
    commissionRate: "6% - 12%",
    cookieDuration: "30 يوم",
    programStatus: "ACTIVE",
    approvalStatus: "APPROVED",
    seoTitle: "كود خصم علي إكسبريس السعودية 2026 (ALIX2026) | خصومات حتى 70%",
    seoDescription: "أحدث كوبونات خصم علي إكسبريس السعودية AliExpress المحدثة لعام 2026. وفر مبالغ ضخمة على الإلكترونيات، الأزياء، الديكورات وأدوات المنزل مع شحن موثوق.",
    aboutStore: "علي إكسبريس AliExpress هو أحد أكبر الأسواق الرقمية العالمية التي توفر للمستهلك السعودي ملايين الخيارات من المنتجات المتنوعة بأسعار المصنع الأصلية.",
    savingTips: ["استخدم كود الخصم ALIX2026 لتوفير مباشر على طلبيتك من علي إكسبريس."],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p_iphone16_pro",
    slug: "apple-iphone-16-pro-max-256gb",
    merchantId: "m_amazon_sa",
    name: "Apple iPhone 16 Pro Max 256GB - Desert Titanium",
    arabicName: "آبل آيفون 16 برو ماكس سعة 256 جيجابايت - تيتانيوم صحراوي",
    description: "أحدث هاتف رائد من شركة آبل مزود بشريحة A18 Pro الجبارة، زر التحكم بالكاميرا الجديد، وشاشة Super Retina XDR مقاس 6.9 إنش مع بطارية تدوم طويلاً وشحن فائق السرعة.",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.amazon.sa/dp/B0DGH7L5N9",
    affiliateUrl: "https://www.amazon.sa/dp/B0DGH7L5N9",
    price: 4949,
    oldPrice: 5199,
    currency: "SAR",
    discountPercentage: 5,
    availability: "IN_STOCK",
    sku: "IPH16PM-256-DS",
    brand: "Apple",
    rating: 4.9,
    reviewsCount: 1420,
    externalProductId: "B0DGH7L5N9",
    network: "Amazon",
    category: "إلكترونيات وجوالات",
    source: "MANUAL",
    commissionRate: "4.5%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_airpods_pro2",
    slug: "apple-airpods-pro-2nd-gen-type-c",
    merchantId: "m_amazon_sa",
    name: "Apple AirPods Pro (2nd Generation) with MagSafe Case (USB-C)",
    arabicName: "سماعات آبل إيربودز برو (الجيل الثاني) مع علبة شحن MagSafe (USB-C)",
    description: "سماعات الأذن اللاسلكية الأفضل مع ميزة إلغاء الضوضاء النشط المتطور حتى ضعفين، وميزة الصوت المكاني المخصص، ومقاومة الغبار والماء وفق معيار IP54.",
    image: "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.amazon.sa/dp/B0CHWRXH8B",
    affiliateUrl: "https://www.amazon.sa/dp/B0CHWRXH8B",
    price: 799,
    oldPrice: 999,
    currency: "SAR",
    discountPercentage: 20,
    availability: "IN_STOCK",
    sku: "APP2-USBC",
    brand: "Apple",
    rating: 4.8,
    reviewsCount: 890,
    externalProductId: "B0CHWRXH8B",
    network: "Amazon",
    category: "إلكترونيات وجوالات",
    source: "MANUAL",
    commissionRate: "5.0%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_dyson_airwrap",
    slug: "dyson-airwrap-multi-styler-complete-long",
    merchantId: "m_noon_sa",
    name: "Dyson Airwrap Multi-Styler Complete Long - Strawberry Bronze and Blush Pink",
    arabicName: "مصفف الشعر دايسون إير راب الشامل للشعر الطويل - برونزي ووردي",
    description: "جهاز التصفيف الثوري الذي يستخدم تيار هواء كواندا لتجفيف وتجعيد وتمليس الشعر دون حرارة مفرطة تؤذي بصيلات الشعر.",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.noon.com/saudi-ar/dyson-airwrap/p-12345",
    affiliateUrl: "https://www.noon.com/saudi-ar/dyson-airwrap/p-12345",
    price: 2499,
    oldPrice: 2899,
    currency: "SAR",
    discountPercentage: 14,
    availability: "IN_STOCK",
    sku: "DYS-AW-LNG",
    brand: "Dyson",
    rating: 4.9,
    reviewsCount: 650,
    externalProductId: "N53342345A",
    network: "ArabClicks",
    category: "عطور وتجميل",
    source: "MANUAL",
    commissionRate: "7.0%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_ps5_slim",
    slug: "sony-playstation-5-slim-disc-edition",
    merchantId: "m_jarir",
    name: "Sony PlayStation 5 Slim Console (Disc Edition) with DualSense Controller",
    arabicName: "جهاز بلايستيشن 5 سليم إصدار الأقراص من سوني مع يد تحكم دوال سينس",
    description: "استمتع بتحميل فائق السرعة مع وحدة تخزين SSD فائقة السرعة، وانغماس أعمق مع دعم الملاحظات اللمسية والمشغلات التكيفية والصوت ثلاثي الأبعاد 3D Audio.",
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.jarir.com/sa-en/sony-playstation-5-gaming-consoles-628283.html",
    affiliateUrl: "https://www.jarir.com/sa-en/sony-playstation-5-gaming-consoles-628283.html",
    price: 2099,
    oldPrice: 2399,
    currency: "SAR",
    discountPercentage: 12,
    availability: "IN_STOCK",
    sku: "SONY-PS5-SLIM",
    brand: "Sony",
    rating: 4.9,
    reviewsCount: 2300,
    externalProductId: "628283",
    network: "Direct",
    category: "إلكترونيات وجوالات",
    source: "MANUAL",
    commissionRate: "3.5%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_bloomingdales_bag",
    slug: "bloomingdales-luxury-designer-leather-tote",
    merchantId: "m_bloomingdales_sa",
    name: "Bloomingdale's Luxury Designer Leather Tote Bag",
    arabicName: "حقيبة يد جلدية فاخرة من تشكيلة بلومينغديلز للمصممين",
    description: "حقيبة أنيقة مصنوعة من أفخم أنواع الجلد الطبيعي الإيطالي بتشطيب ذهبي راقٍ وتصميم عملي يلائم الإطلالات اليومية والمناسبات الرسمية.",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=ea4e6b1d",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=ea4e6b1d",
    price: 1850,
    oldPrice: 2450,
    currency: "SAR",
    discountPercentage: 24,
    availability: "IN_STOCK",
    sku: "BLM-BAG-LUX",
    brand: "Bloomingdale's",
    rating: 4.9,
    reviewsCount: 310,
    externalProductId: "BLM1001",
    network: "LinkAraby",
    category: "أزياء وموضة",
    source: "MANUAL",
    commissionRate: "12%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_dkny_bryant_tote",
    slug: "dkny-bryant-medium-tote-bag",
    merchantId: "m_dkny_sa",
    name: "DKNY Bryant Medium Leather Tote Bag",
    arabicName: "حقيبة توت دكني براينت الأيقونية بحزام كتف جلد أصلي",
    description: "حقيبة براينت الشهيرة من دكني نيويورك بخامة السافيانو المقاومة للخدش وشعار دكني المعدني الذهبي الفاخر مع حزام مريح.",
    image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d4f6659f",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d4f6659f",
    price: 620,
    oldPrice: 890,
    currency: "SAR",
    discountPercentage: 30,
    availability: "IN_STOCK",
    sku: "DKNY-BRYANT",
    brand: "DKNY",
    rating: 4.8,
    reviewsCount: 425,
    externalProductId: "DKNY2002",
    network: "LinkAraby",
    category: "أزياء وموضة",
    source: "MANUAL",
    commissionRate: "12%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_sharaf_tv_lg_oled",
    slug: "sharaf-dg-lg-oled-65-inch-4k-smart-tv",
    merchantId: "m_sharaf_dg_sa",
    name: "LG OLED evo 65 Inch 4K Smart Cinema TV - Sharaf DG",
    arabicName: "شاشة إل جي OLED مقاس 65 بوصة 4K سينمائية معالج الذكاء الاصطناعي α9",
    description: "شاشة فائقة النقاء بالبكسلات ذاتية الإضاءة مع دعم Dolby Vision IQ و Atmos ومعدل تحديث 120Hz مع ضمان شرف دي جي المعتمد.",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=9b88579c",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=9b88579c",
    price: 4499,
    oldPrice: 6299,
    currency: "SAR",
    discountPercentage: 29,
    availability: "IN_STOCK",
    sku: "SDG-LG-OLED65",
    brand: "LG",
    rating: 4.9,
    reviewsCount: 560,
    externalProductId: "SDG3003",
    network: "LinkAraby",
    category: "إلكترونيات وجوالات",
    source: "MANUAL",
    commissionRate: "5%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_atyaab_marshoud_oud",
    slug: "atyaab-al-marshoud-royal-oud-spray",
    merchantId: "m_atyaab_store",
    name: "Atyaab Al Marshoud Royal Vintage Oud Spray 100ml",
    arabicName: "عطر وبخور أطياب المرشود الملكي دهن عود معتق فاخر 100 مل",
    description: "مزيج ملكي ساحر يجمع خلاصة العود الكمبودي المعتق ونفحات العنبر والمسك الأبيض الأصيل مع ثبات يدوم طويلاً.",
    image: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://atyaabshop.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=31ea81bd",
    affiliateUrl: "https://atyaabshop.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=31ea81bd",
    price: 380,
    oldPrice: 480,
    currency: "SAR",
    discountPercentage: 21,
    availability: "IN_STOCK",
    sku: "ATY-ROYAL-OUD",
    brand: "أطياب المرشود",
    rating: 4.9,
    reviewsCount: 710,
    externalProductId: "ATY4004",
    network: "LinkAraby",
    category: "عطور وتجميل",
    source: "MANUAL",
    commissionRate: "15%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_asnas_neck_massager",
    slug: "asnas-intelligent-thermal-neck-and-shoulder-massager",
    merchantId: "m_asnas_store",
    name: "Asnas Intelligent Thermal Neck & Shoulder Deep Massager",
    arabicName: "جهاز تدليك ومساج الرقبة والأكتاف بالحرارة الذكية من أصناس",
    description: "جهاز استرخاء منزلي محمول يعمل بتقنية النبضات الكهربائية والكمادات الدافئة لتخفيف التوتر وإجهاد عضلات الرقبة والكتفين.",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://asnasstore.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=349e97f3",
    affiliateUrl: "https://asnasstore.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=349e97f3",
    price: 189,
    oldPrice: 279,
    currency: "SAR",
    discountPercentage: 32,
    availability: "IN_STOCK",
    sku: "ASN-MASSAGER-TH",
    brand: "أصناس",
    rating: 4.8,
    reviewsCount: 290,
    externalProductId: "ASN5005",
    network: "LinkAraby",
    category: "عطور وتجميل",
    source: "MANUAL",
    commissionRate: "12%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_aliexpress_top_gadget",
    slug: "aliexpress-4k-dashcam-smart-gps-superdeal",
    merchantId: "m_aliexpress_deals",
    name: "AliExpress 4K Ultra HD Car Dashcam with Night Vision & GPS",
    arabicName: "كاميرا سيارة داش كام ذكية بدقة 4K مع GPS ومراقبة 24 ساعة سوبر ديلز",
    description: "إحدى أقوى الصفقات المخفضة في سوبر ديلز: عدسة واسعة الزاوية 170 درجة، تصوير ليلي واضح، مستشعر صدمات ومراقبة مستمرة لركن السيارة.",
    image: "https://images.unsplash.com/photo-1508974239320-0a029497e820?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=0f80f9bb",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=0f80f9bb",
    price: 145,
    oldPrice: 320,
    currency: "SAR",
    discountPercentage: 55,
    availability: "IN_STOCK",
    sku: "ALX-DASH-4K",
    brand: "AliExpress Choice",
    rating: 4.8,
    reviewsCount: 3400,
    externalProductId: "ALX6006",
    network: "LinkAraby",
    category: "إلكترونيات وجوالات",
    source: "MANUAL",
    commissionRate: "10%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "p_aliexpress_smartwatch_ultra",
    slug: "aliexpress-military-grade-amoled-smartwatch",
    merchantId: "m_aliexpress_sa",
    name: "AliExpress Military-Grade Rugged AMOLED Smartwatch",
    arabicName: "ساعة ذكية عسكرية مقاومة للماء مع شاشة AMOLED وبطارية أسبوعين",
    description: "ساعة رياضية ذكية تدعم المكالمات عبر البلوتوث، متابعة نبضات القلب والأكسجين، وبطارية جبارة تصمد حتى 14 يوماً مع شحن مغناطيسي سريع.",
    image: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80",
    productUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d987c32b",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d987c32b",
    price: 95,
    oldPrice: 199,
    currency: "SAR",
    discountPercentage: 52,
    availability: "IN_STOCK",
    sku: "ALX-AMOLED-WATCH",
    brand: "AliExpress KSA",
    rating: 4.7,
    reviewsCount: 5200,
    externalProductId: "ALX7007",
    network: "LinkAraby",
    category: "إلكترونيات وجوالات",
    source: "MANUAL",
    commissionRate: "8%",
    commissionType: "PERCENTAGE",
    lastSyncedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const INITIAL_COUPONS: Coupon[] = [
  {
    id: "c_noon_super10",
    merchantId: "m_noon_sa",
    code: "GULF10",
    title: "خصم 10% إضافي على جميع المنتجات في نون السعودية",
    description: "كود خصم حصري فعال على الإلكترونيات، الأزياء، ومنتجات السوبرماركت في متجر نون لجميع العملاء الجدد والحاليين.",
    discountType: "PERCENTAGE",
    discountValue: "10%",
    minimumOrder: "100 ريال",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.noon.com/saudi-ar",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "كوبون حصري ومجرب",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 245,
    downvotes: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_namshi_vip",
    merchantId: "m_namshi",
    code: "FASHION20",
    title: "كود خصم نمشي 20% على تشكيلات الأزياء والماركات غير المخفضة",
    description: "وفر 20% عند شراء أحدث الملابس والأحذية الرجالية والنسائية من أشهر الماركات العالمية مثل أديداس، نايكي، وبوما.",
    discountType: "PERCENTAGE",
    discountValue: "20%",
    minimumOrder: "200 ريال",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.namshi.com/saudi-ar",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "أعلى نسبة توفير",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 189,
    downvotes: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_iherb_health",
    merchantId: "m_iherb",
    code: "KSAHEALTH",
    title: "خصم 10% لجميع الطلبات في آي هيرب السعودية + شحن مجاني",
    description: "احصل على خصم فوري 10% على المكملات الغذائية، الفيتامينات، ومنتجات العناية بالبشرة العضوية مع توصيل مجاني عند وصول السلة إلى 190 ريال.",
    discountType: "PERCENTAGE",
    discountValue: "10%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://sa.iherb.com",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: false,
    badge: "شحن مجاني",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 312,
    downvotes: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_niceone_beauty",
    merchantId: "m_niceone",
    code: "BEAUTY15",
    title: "كود خصم نايس ون 15% على العطور والمكياج الأصلي",
    description: "وفر 15% على تشكيلة العطور الأصلية، مستحضرات التجميل، وأجهزة الشعر في متجر نايس ون الرسمي.",
    discountType: "PERCENTAGE",
    discountValue: "15%",
    minimumOrder: "150 ريال",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://niceonesa.com",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "عطور أصلية 100%",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 167,
    downvotes: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_linkaraby_direct",
    merchantId: "m_linkaraby",
    code: "LINK2026",
    title: "بوابة التسويق بالعمولة والأرباح المباشرة - لينك عربي",
    description: "انضم لشبكة لينك عربي وابدأ ترويج المتاجر والمنتجات الخليجية بعمولات مجزية.",
    discountType: "DEAL",
    discountValue: "أرباح مباشرة",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5",
    type: "deal",
    status: "ACTIVE",
    isExclusive: true,
    badge: "رابط معتمد 100%",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 210,
    downvotes: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_bshti_bsh10",
    merchantId: "m_bshti",
    code: "BSH10",
    title: "كود خصم متجر بشتي 10% على كافة البشوت والمشالح الملكية",
    description: "وفر 10% على تشكيلة المشالح الرجالية الصيفية والشتوية وإكسسوارات البشت الفاخرة.",
    discountType: "PERCENTAGE",
    discountValue: "10%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://bshti.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "فخامة وأصالة",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 195,
    downvotes: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_maysan_may20",
    merchantId: "m_maysan_it",
    code: "MAY20",
    title: "كود خصم ميسان للحلول التقنية 20% على باقات التصميم والبرمجة",
    description: "خصم 20% على تصميم وتطوير المتاجر وتطبيقات الجوال والأنظمة السحابية.",
    discountType: "PERCENTAGE",
    discountValue: "20%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://maysan-it.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "حلول رقمية",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 140,
    downvotes: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_the_right_way_way15",
    merchantId: "m_the_right_way",
    code: "WAY15",
    title: "كود خصم الطريق الصحيح 15% على المكملات والأغذية الصحية",
    description: "وفر 15% على الأغذية العضوية، الفيتامينات ومكملات اللياقة والرشاقة.",
    discountType: "PERCENTAGE",
    discountValue: "15%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://the-right-way-sa.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "صحة ورشاقة",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 165,
    downvotes: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_kagad441_kgd10",
    merchantId: "m_kagad441",
    code: "KGD10",
    title: "كود خصم كجد 441 بنسبة 10% على الإلكترونيات والإكسسوارات",
    description: "وفر 10% على أحدث المنتجات الذكية، مستلزمات المنزل والأجهزة المبتكرة.",
    discountType: "PERCENTAGE",
    discountValue: "10%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://kagad441.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "عصري ومبتكر",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 122,
    downvotes: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_rahma_rh15",
    merchantId: "m_rahma_store",
    code: "RH15",
    title: "كود خصم متجر رحمة 15% على منتجات العناية والتجميل والعطور",
    description: "وفر 15% على العطور ومستحضرات التجميل والعناية الفائقة بالبشرة والجسم.",
    discountType: "PERCENTAGE",
    discountValue: "15%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://rahma.store/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "عناية وجمال",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 188,
    downvotes: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_bloom_bloom15",
    merchantId: "m_bloomingdales_sa",
    code: "BLOOM15",
    title: "كود خصم بلومينغديلز 15% على الأزياء الفاخرة والمصممين",
    description: "وفر 15% على أشهر الماركات العالمية المصممة، الحقائب الفاخرة، ومستحضرات التجميل في بلومينغديلز السعودية.",
    discountType: "PERCENTAGE",
    discountValue: "15%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=ea4e6b1d",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "فخامة معتمدة",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 215,
    downvotes: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_dkny_dkny15",
    merchantId: "m_dkny_sa",
    code: "DKNY15",
    title: "كود خصم دكني 15% إضافي على جميع الحقائب والأحذية والملابس",
    description: "كود خصم فعال على كافة تصاميم حقائب دكني، الأحذية الرياضية الأنيقة، والملابس الجاهزة.",
    discountType: "PERCENTAGE",
    discountValue: "15%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d4f6659f",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "حقائب وأحذية",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 178,
    downvotes: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_sharaf_dgdeal",
    merchantId: "m_sharaf_dg_sa",
    code: "DGDEAL",
    title: "عروض وتخفيضات شرف دي جي تصل إلى 50% على الإلكترونيات والشاشات",
    description: "تخفيضات مباشرة على شاشات التلفزيون الذكية، مكيفات الهواء، اللابتوبات، وجوالات سامسونج وآبل.",
    discountType: "PERCENTAGE",
    discountValue: "50%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=9b88579c",
    type: "deal",
    status: "ACTIVE",
    isExclusive: false,
    badge: "أجهزة أصلية",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 290,
    downvotes: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_atyaab_atyab10",
    merchantId: "m_atyaab_store",
    code: "ATYAB10",
    title: "كود خصم أطياب المرشود 10% على العطور والبخور والمرشات الفاخرة",
    description: "وفر 10% على كافة عطور الدار الملكية، تولات دهن العود الطبيعي، والمرشات المنزلية.",
    discountType: "PERCENTAGE",
    discountValue: "10%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://atyaabshop.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=31ea81bd",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "عطور ملكية",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 165,
    downvotes: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_asnas_asnas10",
    merchantId: "m_asnas_store",
    code: "ASNAS10",
    title: "كود خصم متجر أصناس 10% على منتجات العناية وأجهزة التدليك",
    description: "وفر 10% على أجهزة مساج الرقبة والظهر، أدوات العناية بالبشرة، ومستلزمات المنزل العصرية.",
    discountType: "PERCENTAGE",
    discountValue: "10%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://asnasstore.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5&a_bid=349e97f3",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "عناية وراحة",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 140,
    downvotes: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_aliexpress_super80",
    merchantId: "m_aliexpress_deals",
    code: "SUPER80",
    title: "صفقات سوبر ديلز علي إكسبريس: تخفيضات كبرى حتى 80% على أقوى 2000 منتج",
    description: "عرض ترويجي مباشر مفعّل على أفضل المنتجات التقنية، أدوات المطبخ، ملحقات السيارات والألعاب.",
    discountType: "PERCENTAGE",
    discountValue: "80%",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=0f80f9bb",
    type: "deal",
    status: "ACTIVE",
    isExclusive: true,
    badge: "سوبر ديلز 🔥",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 480,
    downvotes: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "c_aliexpress_alix2026",
    merchantId: "m_aliexpress_sa",
    code: "ALIX2026",
    title: "كود خصم علي إكسبريس السعودية فعال على جميع الطلبات المؤهلة",
    description: "وفر 10 دولارات عند تسوق المنتجات المؤهلة من مختلف الفئات مع خيارات الشحن السريع.",
    discountType: "PERCENTAGE",
    discountValue: "10$",
    expiryDate: "2026-12-31",
    affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5&a_bid=d987c32b",
    type: "coupon",
    status: "ACTIVE",
    isExclusive: true,
    badge: "كوبون عام",
    verificationStatus: "VERIFIED",
    verificationSource: "ADMIN_MANUAL",
    lastVerifiedAt: new Date().toISOString().split("T")[0],
    upvotes: 395,
    downvotes: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class Database {
  private static instance: Database;
  private data: DatabaseSchema;
  private isSaving = false;

  private constructor() {
    this.data = this.loadData();
    this.initPostgres();
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  private async initPostgres(): Promise<void> {
    const sqlHost = process.env.SQL_HOST;
    if (!sqlHost) return;

    try {
      const { queryPostgres } = await import("./postgresPool");
      // Create PostgreSQL tables automatically if they don't exist
      await queryPostgres(`
        CREATE TABLE IF NOT EXISTS merchants (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          arabic_name TEXT NOT NULL,
          tagline TEXT,
          logo_text TEXT,
          logo_bg TEXT,
          primary_color TEXT,
          category TEXT NOT NULL,
          featured BOOLEAN DEFAULT FALSE,
          country TEXT DEFAULT 'السعودية',
          website_url TEXT NOT NULL,
          affiliate_url TEXT NOT NULL,
          affiliate_network TEXT NOT NULL,
          affiliate_program_id TEXT,
          affiliate_tracking_id TEXT,
          commission_rate TEXT DEFAULT '5%',
          cookie_duration TEXT DEFAULT '30 يوم',
          program_status TEXT DEFAULT 'ACTIVE',
          approval_status TEXT DEFAULT 'APPROVED',
          seo_title TEXT,
          seo_description TEXT,
          about_store TEXT,
          saving_tips JSONB,
          metadata JSONB,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS products (
          id TEXT PRIMARY KEY,
          slug TEXT UNIQUE NOT NULL,
          merchant_id TEXT NOT NULL,
          name TEXT NOT NULL,
          arabic_name TEXT NOT NULL,
          description TEXT,
          image TEXT,
          product_url TEXT NOT NULL,
          affiliate_url TEXT NOT NULL,
          price DOUBLE PRECISION NOT NULL,
          old_price DOUBLE PRECISION,
          currency TEXT DEFAULT 'SAR',
          discount_percentage DOUBLE PRECISION,
          availability TEXT DEFAULT 'IN_STOCK',
          sku TEXT,
          brand TEXT,
          rating DOUBLE PRECISION,
          reviews_count INTEGER,
          external_product_id TEXT,
          network TEXT,
          category TEXT NOT NULL,
          source TEXT DEFAULT 'MANUAL',
          commission_rate TEXT,
          commission_type TEXT,
          metadata JSONB,
          last_synced_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS coupons (
          id TEXT PRIMARY KEY,
          merchant_id TEXT NOT NULL,
          code TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          discount_type TEXT DEFAULT 'PERCENTAGE',
          discount_value TEXT NOT NULL,
          minimum_order TEXT,
          expiry_date TEXT NOT NULL,
          affiliate_url TEXT,
          type TEXT DEFAULT 'coupon',
          status TEXT DEFAULT 'ACTIVE',
          is_exclusive BOOLEAN DEFAULT FALSE,
          badge TEXT,
          verification_status TEXT DEFAULT 'VERIFIED',
          verification_source TEXT DEFAULT 'ADMIN_MANUAL',
          last_verified_at TEXT,
          upvotes INTEGER DEFAULT 0,
          downvotes INTEGER DEFAULT 0,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS clicks (
          id TEXT PRIMARY KEY,
          click_id TEXT UNIQUE NOT NULL,
          merchant_id TEXT NOT NULL,
          product_id TEXT,
          coupon_id TEXT,
          destination_url TEXT NOT NULL,
          sub_id TEXT,
          campaign TEXT,
          referrer TEXT,
          user_agent TEXT,
          device_type TEXT DEFAULT 'unknown',
          ip_address TEXT,
          country TEXT,
          session_id TEXT,
          visitor_id TEXT,
          utm_source TEXT,
          utm_medium TEXT,
          utm_campaign TEXT,
          utm_content TEXT,
          utm_term TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS conversions (
          id TEXT PRIMARY KEY,
          conversion_id TEXT NOT NULL,
          click_id TEXT,
          merchant_id TEXT NOT NULL,
          product_id TEXT,
          network TEXT NOT NULL,
          order_reference TEXT NOT NULL,
          order_value DOUBLE PRECISION DEFAULT 0,
          commission_amount DOUBLE PRECISION DEFAULT 0,
          currency TEXT DEFAULT 'SAR',
          status TEXT DEFAULT 'PENDING',
          raw_payload JSONB,
          approved_at TEXT,
          rejected_at TEXT,
          paid_at TEXT,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS commissions (
          id TEXT PRIMARY KEY,
          conversion_id TEXT NOT NULL,
          merchant_id TEXT NOT NULL,
          amount DOUBLE PRECISION NOT NULL DEFAULT 0,
          currency TEXT DEFAULT 'SAR',
          status TEXT DEFAULT 'PENDING',
          network TEXT NOT NULL,
          source TEXT,
          external_id TEXT,
          payout_date TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT
        );

        CREATE TABLE IF NOT EXISTS webhook_events (
          id TEXT PRIMARY KEY,
          network TEXT NOT NULL,
          event_id TEXT NOT NULL,
          payload JSONB,
          signature_valid BOOLEAN DEFAULT FALSE,
          processed BOOLEAN DEFAULT FALSE,
          error_message TEXT,
          received_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS integration_logs (
          id TEXT PRIMARY KEY,
          provider TEXT NOT NULL,
          action TEXT NOT NULL,
          status TEXT NOT NULL,
          request_time TEXT,
          response_time TEXT,
          http_status INTEGER,
          error TEXT,
          metadata JSONB,
          created_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS integrations (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          provider TEXT NOT NULL,
          network TEXT NOT NULL,
          status TEXT DEFAULT 'NOT_CONFIGURED',
          enabled BOOLEAN DEFAULT FALSE,
          api_key TEXT,
          api_secret TEXT,
          affiliate_id TEXT,
          publisher_id TEXT,
          tracking_id TEXT,
          website_id TEXT,
          webhook_secret TEXT,
          base_url TEXT,
          last_tested_at TEXT,
          last_synced_at TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
      `);
      console.log("[PostgreSQL] Successfully initialized cloud database schema.");
    } catch (err: any) {
      console.warn("[PostgreSQL] Initialization notice:", err.message);
    }
  }

  private ensureDirectory() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    this.ensureDirectory();
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        if (parsed.version === 2 && Array.isArray(parsed.merchants) && parsed.merchants.length > 0) {
          // Merge or update newly introduced INITIAL_MERCHANTS and SAUDI_STORE_BRANDS with correct affiliate URLs
          INITIAL_MERCHANTS.forEach((initM) => {
            const idx = parsed.merchants.findIndex((m: Merchant) => m.id === initM.id || m.slug === initM.slug);
            if (idx === -1) {
              parsed.merchants.push(initM);
            } else {
              parsed.merchants[idx].affiliateUrl = initM.affiliateUrl;
              parsed.merchants[idx].affiliateNetwork = initM.affiliateNetwork;
              parsed.merchants[idx].affiliateTrackingId = initM.affiliateTrackingId;
              parsed.merchants[idx].affiliateProgramId = initM.affiliateProgramId;
            }
          });

          // Sync all stores from SAUDI_STORE_BRANDS
          SAUDI_STORE_BRANDS.forEach((store) => {
            const idx = parsed.merchants.findIndex((m: Merchant) => m.id === store.id || m.slug === store.slug);
            const mObj: Merchant = {
              id: store.id,
              slug: store.slug,
              name: store.name,
              arabicName: store.arabicName,
              tagline: store.tagline,
              logoText: store.logoText,
              logoBg: store.logoBg,
              primaryColor: store.primaryColor,
              category: store.category,
              featured: store.featured,
              country: store.country || "السعودية",
              websiteUrl: store.affiliateUrl || "https://example.com",
              affiliateUrl: store.affiliateUrl || store.affiliateConfig?.affiliateUrl || "https://example.com",
              affiliateNetwork: store.affiliateConfig?.network || "LinkAraby",
              affiliateProgramId: store.affiliateConfig?.campaignId || store.slug,
              commissionRate: "5% - 15%",
              cookieDuration: "30 يوم",
              programStatus: "ACTIVE",
              approvalStatus: "APPROVED",
              seoTitle: store.seoTitle,
              seoDescription: store.seoDescription,
              aboutStore: store.aboutStore,
              savingTips: store.savingTips || [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            if (idx === -1) {
              parsed.merchants.push(mObj);
            } else {
              parsed.merchants[idx] = { ...parsed.merchants[idx], ...mObj };
            }

            // Sync coupons for this store
            if (Array.isArray(store.coupons)) {
              if (!Array.isArray(parsed.coupons)) parsed.coupons = [];
              store.coupons.forEach((c) => {
                const cIdx = parsed.coupons.findIndex((cp: Coupon) => cp.id === c.id);
                const cObj: Coupon = {
                  id: c.id,
                  merchantId: store.id,
                  code: c.code,
                  title: c.title,
                  description: c.description,
                  discountType: "PERCENTAGE",
                  discountValue: c.discount || "10%",
                  expiryDate: c.expiryDate || "2026-12-31",
                  badge: c.badge,
                  isExclusive: Boolean(c.isExclusive),
                  affiliateUrl: c.affiliateUrl || store.affiliateUrl,
                  type: c.type || "coupon",
                  minimumOrder: c.minSpend,
                  status: "ACTIVE",
                  verificationStatus: "VERIFIED",
                  verificationSource: "COMMUNITY_VOTE",
                  lastVerifiedAt: c.verifiedDate || new Date().toISOString().split("T")[0],
                  upvotes: 0,
                  downvotes: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                };
                if (cIdx === -1) {
                  parsed.coupons.push(cObj);
                } else {
                  parsed.coupons[cIdx] = { ...parsed.coupons[cIdx], ...cObj };
                }
              });
            }
          });

          // Merge or update products from SAUDI_PRODUCTS
          if (!Array.isArray(parsed.products)) parsed.products = [];
          SAUDI_PRODUCTS.forEach((p) => {
            const idx = parsed.products.findIndex((prod: Product) => prod.id === p.id || prod.slug === p.slug);
            const pObj: Product = {
              id: p.id,
              slug: p.slug,
              merchantId: p.merchantId,
              name: p.name,
              arabicName: p.arabicName,
              description: p.description,
              image: p.image,
              productUrl: p.productUrl,
              affiliateUrl: p.affiliateUrl,
              price: p.price,
              oldPrice: p.oldPrice,
              discountPercentage: p.discountPercentage,
              currency: p.currency,
              brand: p.brand,
              rating: p.rating,
              reviewsCount: p.reviewsCount,
              category: p.category,
              availability: p.availability,
              source: "FEED",
              lastSyncedAt: new Date().toISOString(),
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            if (idx === -1) {
              parsed.products.push(pObj);
            } else {
              parsed.products[idx] = { ...parsed.products[idx], ...pObj };
            }
          });

          if (!parsed.integrationLogs) parsed.integrationLogs = [];
          if (!parsed.integrations) parsed.integrations = INITIAL_INTEGRATIONS;
          else {
            INITIAL_INTEGRATIONS.forEach((initInt) => {
              const exists = parsed.integrations.some((i: any) => i.id === initInt.id);
              if (!exists) parsed.integrations.push(initInt);
            });
          }
          if (!parsed.affiliateSyncLogs) parsed.affiliateSyncLogs = [];
          if (!parsed.trendingNiches || parsed.trendingNiches.length === 0) parsed.trendingNiches = INITIAL_TRENDING_NICHES;
          if (!parsed.nicheSyncJobs) parsed.nicheSyncJobs = [];
          if (!parsed.payoutDestination) {
            parsed.payoutDestination = {
              method: "crypto",
              walletAddress: "0xddeae422ae06b08122d4f44510a7b99410ac3d19",
              walletNetwork: "BEP20 (BNB Smart Chain) / ERC20",
              walletExchange: "Binance (منصة بينانس)",
              accountIdentifier: "0xddeae422ae06b08122d4f44510a7b99410ac3d19",
              accountHolderName: "حساب مالك الموقع المعتمد",
              autoPayoutThresholdSar: 100,
              status: "ACTIVE",
              lastVerifiedAt: new Date().toISOString(),
              notes: "محفظة بينانس الأساسية لاستقبال عوائد وأرباح الأفلييت والعمولات مباشرة"
            };
          }
          if (!parsed.payoutTransactions) {
            parsed.payoutTransactions = [];
          }
          this.saveDataDirect(parsed);
          return parsed;
        }
      } catch (e) {
        console.warn("[Database] Existing database corrupted, re-initializing schema:", e);
      }
    }

    const initial: DatabaseSchema = {
      version: 2,
      merchants: INITIAL_MERCHANTS,
      products: INITIAL_PRODUCTS,
      coupons: INITIAL_COUPONS,
      couponVerifications: [],
      clicks: [],
      conversions: [],
      commissions: [],
      subscribers: [],
      priceAlerts: [],
      couponAlerts: [],
      syncJobs: [],
      webhookEvents: [],
      networks: INITIAL_NETWORKS,
      integrationLogs: [],
      integrations: INITIAL_INTEGRATIONS,
      affiliateSyncLogs: [],
      trendingNiches: INITIAL_TRENDING_NICHES,
      nicheSyncJobs: [],
      payoutDestination: {
        method: "crypto",
        walletAddress: "0xddeae422ae06b08122d4f44510a7b99410ac3d19",
        walletNetwork: "BEP20 (BNB Smart Chain) / ERC20",
        walletExchange: "Binance (منصة بينانس)",
        accountIdentifier: "0xddeae422ae06b08122d4f44510a7b99410ac3d19",
        accountHolderName: "حساب مالك الموقع المعتمد",
        autoPayoutThresholdSar: 100,
        status: "ACTIVE",
        lastVerifiedAt: new Date().toISOString(),
        notes: "محفظة بينانس الأساسية لاستقبال عوائد وأرباح الأفلييت والعمولات مباشرة"
      },
      payoutTransactions: []
    };

    this.saveDataDirect(initial);
    return initial;
  }

  private saveDataDirect(data: DatabaseSchema) {
    try {
      this.ensureDirectory();
      const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
      fs.renameSync(tempFile, DB_FILE);
    } catch (e) {
      console.error("[Database] Failed to write database file:", e);
    }
  }

  private persist() {
    if (this.isSaving) return;
    this.isSaving = true;
    setTimeout(() => {
      this.saveDataDirect(this.data);
      this.isSaving = false;
    }, 50);
  }

  // --- Merchants ---
  public getMerchants(): Merchant[] {
    const seen = new Set<string>();
    const unique: Merchant[] = [];
    for (const m of this.data.merchants) {
      const key = m.slug || m.id;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(m);
      }
    }
    return unique;
  }

  // --- Link Verifications Persistence ---
  public getLinkVerifications(): Record<string, any> {
    return this.data.linkVerifications || {};
  }

  public saveLinkVerifications(verifications: Record<string, any>): void {
    this.data.linkVerifications = verifications;
    this.persist();
  }

  public getMerchantById(id: string): Merchant | undefined {
    if (!id) return undefined;
    const clean = id.trim().toLowerCase();
    return this.data.merchants.find((m) => 
      m.id.toLowerCase() === clean || 
      m.slug.toLowerCase() === clean ||
      m.id.toLowerCase() === `m_${clean}` ||
      clean === `m_${m.id.toLowerCase()}` ||
      m.id.toLowerCase().replace(/^m_/, "").replace(/_/g, "-") === clean.replace(/^m_/, "").replace(/_/g, "-") ||
      m.slug.toLowerCase().replace(/-sa$/, "") === clean.replace(/-sa$/, "")
    );
  }

  public getMerchantBySlug(slug: string): Merchant | undefined {
    if (!slug) return undefined;
    const clean = slug.trim().toLowerCase();
    return this.data.merchants.find((m) => 
      m.slug.toLowerCase() === clean || 
      m.id.toLowerCase() === clean ||
      m.id.toLowerCase() === `m_${clean}` ||
      clean === `m_${m.id.toLowerCase()}` ||
      m.slug.toLowerCase().replace(/-sa$/, "") === clean.replace(/-sa$/, "") ||
      m.id.toLowerCase().replace(/^m_/, "").replace(/_/g, "-") === clean.replace(/^m_/, "").replace(/_/g, "-")
    );
  }

  public upsertMerchant(merchant: Merchant): Merchant {
    const idx = this.data.merchants.findIndex((m) => m.id === merchant.id);
    const updated = { ...merchant, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      this.data.merchants[idx] = updated;
    } else {
      this.data.merchants.push(updated);
    }
    this.persist();
    return updated;
  }

  public deleteMerchant(id: string): boolean {
    const initialLen = this.data.merchants.length;
    this.data.merchants = this.data.merchants.filter((m) => m.id !== id);
    if (this.data.merchants.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Products ---
  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find((p) => p.id === id);
  }

  public getProductBySlug(slug: string): Product | undefined {
    return this.data.products.find((p) => p.slug === slug);
  }

  public getProductsByMerchant(merchantId: string): Product[] {
    return this.data.products.filter((p) => p.merchantId === merchantId);
  }

  public upsertProduct(product: Product): Product {
    const idx = this.data.products.findIndex((p) => p.id === product.id);
    const updated = { ...product, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      this.data.products[idx] = updated;
    } else {
      this.data.products.push(updated);
    }
    this.persist();
    return updated;
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter((p) => p.id !== id);
    if (this.data.products.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Coupons ---
  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public getCouponById(id: string): Coupon | undefined {
    if (!id) return undefined;
    const clean = id.trim().toLowerCase();
    return this.data.coupons.find((c) => 
      c.id.toLowerCase() === clean || 
      c.code.toLowerCase() === clean ||
      c.id.toLowerCase().replace(/_/g, "-") === clean.replace(/_/g, "-")
    );
  }

  public getCouponsByMerchant(merchantId: string): Coupon[] {
    return this.data.coupons.filter((c) => c.merchantId === merchantId);
  }

  public upsertCoupon(coupon: Coupon): Coupon {
    const idx = this.data.coupons.findIndex((c) => c.id === coupon.id);
    const updated = { ...coupon, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      this.data.coupons[idx] = updated;
    } else {
      this.data.coupons.push(updated);
    }
    this.persist();
    return updated;
  }

  public recordCouponVote(couponId: string, isUpvote: boolean): Coupon | null {
    const coupon = this.getCouponById(couponId);
    if (!coupon) return null;
    if (isUpvote) {
      coupon.upvotes = (coupon.upvotes || 0) + 1;
    } else {
      coupon.downvotes = (coupon.downvotes || 0) + 1;
    }
    coupon.updatedAt = new Date().toISOString();
    this.persist();
    return coupon;
  }

  public deleteCoupon(id: string): boolean {
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter((c) => c.id !== id);
    if (this.data.coupons.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Clicks ---
  public recordClick(click: Omit<Click, "id">): Click {
    const newClick: Click = {
      ...click,
      id: uuidv4()
    };
    this.data.clicks.push(newClick);
    this.persist();

    // Async persist to Cloud SQL PostgreSQL
    import("./postgresPool").then(({ queryPostgres }) => {
      queryPostgres(
        `INSERT INTO clicks (id, click_id, merchant_id, coupon_id, product_id, destination_url, sub_id, campaign, referrer, user_agent, device_type, ip_address, country, session_id, visitor_id, utm_source, utm_medium, utm_campaign, utm_content, utm_term, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         ON CONFLICT (click_id) DO NOTHING`,
        [
          newClick.id,
          newClick.clickId,
          newClick.merchantId,
          newClick.couponId || null,
          newClick.productId || null,
          newClick.destinationUrl || "",
          newClick.subId || null,
          newClick.campaign || null,
          newClick.referer || null,
          newClick.userAgent || null,
          newClick.deviceType || "unknown",
          newClick.ipAddress || null,
          newClick.country || null,
          newClick.sessionId || null,
          newClick.visitorId || null,
          newClick.utmSource || null,
          newClick.utmMedium || null,
          newClick.utmCampaign || null,
          newClick.utmContent || null,
          newClick.utmTerm || null,
          newClick.timestamp || new Date().toISOString()
        ]
      ).catch((err) => console.warn("[PostgreSQL] Click save notice:", err.message));
    });

    return newClick;
  }

  public getClicks(limit = 100): Click[] {
    return [...this.data.clicks].reverse().slice(0, limit);
  }

  public getClickByClickId(clickId: string): Click | undefined {
    return this.data.clicks.find((c) => c.clickId === clickId);
  }

  public getTotalClicksCount(): number {
    return this.data.clicks.length;
  }

  public getClicksByMerchant(merchantId: string): Click[] {
    return this.data.clicks.filter((c) => c.merchantId === merchantId);
  }

  public getConversionsByMerchant(merchantId: string): Conversion[] {
    return this.data.conversions.filter((c) => c.merchantId === merchantId);
  }

  // --- Copy Events ---
  public recordCopyEvent(event: Omit<CopyEvent, "id" | "timestamp">): CopyEvent {
    if (!this.data.copyEvents) this.data.copyEvents = [];
    const newEvent: CopyEvent = {
      ...event,
      id: `cpy_${Date.now()}_${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    this.data.copyEvents.push(newEvent);

    // Increment coupon copy count if coupon exists
    const coupon = this.getCouponById(event.couponId) || this.data.coupons.find(c => c.code.toLowerCase() === event.couponCode.toLowerCase());
    if (coupon) {
      coupon.copyCount = (coupon.copyCount || 0) + 1;
      coupon.updatedAt = new Date().toISOString();
    }

    this.persist();
    return newEvent;
  }

  public getCopyEvents(limit = 100): CopyEvent[] {
    return [...(this.data.copyEvents || [])].reverse().slice(0, limit);
  }

  public getTotalCopyCount(): number {
    return (this.data.copyEvents || []).length;
  }

  // --- Deals ---
  public getDeals(): Deal[] {
    if (!this.data.deals) {
      this.data.deals = [];
      // Generate initial deals from coupons marked as deal or products with discount
      const dealsFromCoupons: Deal[] = this.data.coupons
        .filter(c => c.type === "deal" || c.discountType === "DEAL" || c.discountType === "FREE_SHIPPING")
        .map(c => {
          const m = this.getMerchantById(c.merchantId);
          return {
            id: `deal_${c.id}`,
            slug: `deal-${c.id}`,
            merchantId: c.merchantId,
            storeId: c.merchantId,
            title: c.title,
            arabicTitle: c.title,
            description: c.description || "",
            dealType: c.discountType === "FREE_SHIPPING" ? "FREE_SHIPPING" : "DIRECT_DISCOUNT",
            currency: "SAR",
            affiliateUrl: c.affiliateUrl || m?.affiliateUrl || "https://example.com",
            expiryDate: c.expiryDate || "2026-12-31",
            status: c.status,
            verified: c.verificationStatus === "VERIFIED",
            lastVerifiedAt: c.lastVerifiedAt || new Date().toISOString(),
            verificationSource: c.verificationSource || "ADMIN_MANUAL",
            category: m?.category || "عام",
            isFeatured: c.isExclusive,
            clickCount: c.clickCount || 0,
            createdAt: c.createdAt || new Date().toISOString(),
            updatedAt: c.updatedAt || new Date().toISOString()
          };
        });
      this.data.deals = dealsFromCoupons;
      this.persist();
    }
    return this.data.deals;
  }

  public getDealById(id: string): Deal | undefined {
    return this.getDeals().find(d => d.id === id || d.slug === id);
  }

  public upsertDeal(deal: Deal): Deal {
    const deals = this.getDeals();
    const idx = deals.findIndex(d => d.id === deal.id);
    const updated = { ...deal, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      deals[idx] = updated;
    } else {
      deals.push(updated);
    }
    this.persist();
    return updated;
  }

  public deleteDeal(id: string): boolean {
    const deals = this.getDeals();
    const initLen = deals.length;
    this.data.deals = deals.filter(d => d.id !== id);
    if (this.data.deals.length !== initLen) {
      this.persist();
      return true;
    }
    return false;
  }

  // --- Categories ---
  public getCategories(): CategoryItem[] {
    if (!this.data.categories || this.data.categories.length === 0) {
      this.data.categories = [
        { id: "cat_electronics", slug: "electronics", name: "Electronics", arabicName: "إلكترونيات", icon: "Smartphone", description: "أقوى عروض وكوبونات الأجهزة الذكية والشاشات والكمبيوتر", featured: true, sortOrder: 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_mobiles", slug: "mobiles", name: "Mobiles", arabicName: "جوالات", icon: "Phone", description: "خصومات على أحدث الجوالات وملحقاتها في السعودية", featured: true, sortOrder: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_fashion", slug: "fashion", name: "Fashion", arabicName: "أزياء", icon: "Shirt", description: "كوبونات أشهر متاجر الأزياء والملابس والأحذية", featured: true, sortOrder: 3, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_beauty", slug: "beauty", name: "Beauty", arabicName: "جمال وعناية", icon: "Sparkles", description: "أفضل أكواد الخصم لمستحضرات التجميل والعناية بالبشرة والعطور", featured: true, sortOrder: 4, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_home", slug: "home", name: "Home & Kitchen", arabicName: "المنزل والمطبخ", icon: "Home", description: "تخفيضات الأثاث ومستلزمات المطبخ والأجهزة المنزلية", featured: true, sortOrder: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_supermarket", slug: "supermarket", name: "Supermarket", arabicName: "سوبرماركت ومقاضي", icon: "ShoppingBag", description: "توفير فوري على مشتريات المقاضي والأغذية والمشروبات", featured: true, sortOrder: 6, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_health", slug: "health", name: "Health & Nutrition", arabicName: "صحة ومكملات", icon: "HeartPulse", description: "كوبونات آي هيرب والمكملات الغذائية والمنتجات الصحية", featured: true, sortOrder: 7, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_food", slug: "food", name: "Food Delivery", arabicName: "توصيل ومطاعم", icon: "Utensils", description: "أكواد خصم تطبيقات التوصيل والمطاعم في المملكة", featured: true, sortOrder: 8, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
        { id: "cat_travel", slug: "travel", name: "Travel & Flights", arabicName: "سفر وسياحة", icon: "Plane", description: "عروض الطيران وحجوزات الفنادق والرحلات السياحية", featured: false, sortOrder: 9, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
      ];
      this.persist();
    }
    return this.data.categories;
  }

  public upsertCategory(cat: CategoryItem): CategoryItem {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === cat.id || c.slug === cat.slug);
    const updated = { ...cat, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      categories[idx] = updated;
    } else {
      categories.push(updated);
    }
    this.persist();
    return updated;
  }

  // --- Countries Configuration ---
  public getCountries(): CountryConfig[] {
    if (!this.data.countries || this.data.countries.length === 0) {
      this.data.countries = [
        { code: "SA", name: "Saudi Arabia", arabicName: "المملكة العربية السعودية", currency: "SAR", flag: "🇸🇦", phonePrefix: "+966", isActive: true, isDefault: true },
        { code: "AE", name: "United Arab Emirates", arabicName: "الإمارات العربية المتحدة", currency: "AED", flag: "🇦🇪", phonePrefix: "+971", isActive: true, isDefault: false },
        { code: "KW", name: "Kuwait", arabicName: "الكويت", currency: "KWD", flag: "🇰🇼", phonePrefix: "+965", isActive: true, isDefault: false },
        { code: "QA", name: "Qatar", arabicName: "قطر", currency: "QAR", flag: "🇶🇦", phonePrefix: "+974", isActive: true, isDefault: false },
        { code: "BH", name: "Bahrain", arabicName: "البحرين", currency: "BHD", flag: "🇧🇭", phonePrefix: "+973", isActive: true, isDefault: false },
        { code: "OM", name: "Oman", arabicName: "عُمان", currency: "OMR", flag: "🇴🇲", phonePrefix: "+968", isActive: true, isDefault: false },
        { code: "EG", name: "Egypt", arabicName: "مصر", currency: "EGP", flag: "🇪🇬", phonePrefix: "+20", isActive: true, isDefault: false },
        { code: "JO", name: "Jordan", arabicName: "الأردن", currency: "JOD", flag: "🇯🇴", phonePrefix: "+962", isActive: true, isDefault: false },
        { code: "MA", name: "Morocco", arabicName: "المغرب", currency: "MAD", flag: "🇲🇦", phonePrefix: "+212", isActive: true, isDefault: false }
      ];
      this.persist();
    }
    return this.data.countries;
  }

  public updateCountry(code: string, updates: Partial<CountryConfig>): CountryConfig | undefined {
    const countries = this.getCountries();
    const country = countries.find(c => c.code === code);
    if (country) {
      Object.assign(country, updates);
      this.persist();
      return country;
    }
    return undefined;
  }

  // --- Price History & Deduplication ---
  public recordPriceHistory(entry: Omit<ProductPriceHistory, "id" | "recordedAt">): ProductPriceHistory {
    if (!this.data.priceHistories) this.data.priceHistories = [];
    const item: ProductPriceHistory = {
      ...entry,
      id: `ph_${Date.now()}_${uuidv4().substring(0, 6)}`,
      recordedAt: new Date().toISOString()
    };
    this.data.priceHistories.push(item);
    if (this.data.priceHistories.length > 5000) {
      this.data.priceHistories = this.data.priceHistories.slice(-2500);
    }
    this.persist();
    return item;
  }

  public getPriceHistory(productId: string): ProductPriceHistory[] {
    return (this.data.priceHistories || []).filter(ph => ph.productId === productId);
  }

  // --- Conversions & Commissions ---
  public upsertConversion(conv: Omit<Conversion, "id">): {
    conversion: Conversion;
    created: boolean;
    updated: boolean;
    statusChanged: boolean;
  } {
    const extId = conv.externalConversionId || conv.conversionId;
    const existing = this.data.conversions.find(
      (c) => (c.externalConversionId === extId || c.conversionId === extId) && c.network.toLowerCase() === conv.network.toLowerCase()
    );

    if (existing) {
      let updated = false;
      let statusChanged = false;

      if (existing.status !== conv.status) {
        existing.status = conv.status;
        statusChanged = true;
        updated = true;
        if (conv.status === "APPROVED") existing.approvedAt = new Date().toISOString();
        if (conv.status === "REJECTED" || conv.status === "CANCELLED") existing.rejectedAt = new Date().toISOString();
        if (conv.status === "PAID") existing.paidAt = new Date().toISOString();
      }

      if (conv.commissionAmount !== undefined && existing.commissionAmount !== conv.commissionAmount) {
        existing.commissionAmount = conv.commissionAmount;
        updated = true;
      }

      if (conv.orderValue !== undefined && existing.orderValue !== conv.orderValue) {
        existing.orderValue = conv.orderValue;
        updated = true;
      }

      if (conv.estimatedCommissionAmount !== undefined) {
        existing.estimatedCommissionAmount = conv.estimatedCommissionAmount;
      }

      existing.reconciledAt = new Date().toISOString();

      if (updated) {
        const matchingComm = this.data.commissions.find((c) => c.conversionId === existing.id);
        if (matchingComm) {
          matchingComm.status = existing.status;
          matchingComm.amount = existing.commissionAmount;
          matchingComm.updatedAt = new Date().toISOString();
        }
        this.persist();
      }

      return { conversion: existing, created: false, updated, statusChanged };
    }

    const newConv: Conversion = {
      ...conv,
      id: uuidv4(),
      conversionId: conv.conversionId || extId,
      externalConversionId: extId,
      reconciledAt: new Date().toISOString()
    };
    this.data.conversions.push(newConv);

    const commission: Commission = {
      id: uuidv4(),
      conversionId: newConv.id,
      merchantId: newConv.merchantId,
      amount: newConv.commissionAmount,
      currency: newConv.currency,
      status: newConv.status,
      network: newConv.network,
      createdAt: newConv.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.data.commissions.push(commission);

    this.persist();

    // Async persist to Cloud SQL PostgreSQL
    import("./postgresPool").then(({ queryPostgres }) => {
      queryPostgres(
        `INSERT INTO conversions (id, conversion_id, click_id, merchant_id, product_id, network, order_reference, order_value, commission_amount, currency, status, raw_payload, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status, commission_amount = EXCLUDED.commission_amount`,
        [
          newConv.id,
          newConv.conversionId,
          newConv.clickId || null,
          newConv.merchantId,
          newConv.productId || null,
          newConv.network,
          newConv.orderReference,
          newConv.orderValue,
          newConv.commissionAmount,
          newConv.currency,
          newConv.status,
          JSON.stringify(newConv.rawPayload || {}),
          newConv.createdAt
        ]
      ).catch((err) => console.warn("[PostgreSQL] Conversion save notice:", err.message));
    });

    return { conversion: newConv, created: true, updated: false, statusChanged: false };
  }

  public recordConversion(conv: Omit<Conversion, "id">): Conversion {
    const res = this.upsertConversion(conv);
    return res.conversion;
  }

  public updateConversionStatus(
    conversionId: string,
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "PAID"
  ): Conversion | undefined {
    const conv = this.data.conversions.find((c) => c.id === conversionId || c.conversionId === conversionId);
    if (!conv) return undefined;

    conv.status = status;
    if (status === "APPROVED") conv.approvedAt = new Date().toISOString();
    if (status === "REJECTED" || status === "CANCELLED") conv.rejectedAt = new Date().toISOString();
    if (status === "PAID") conv.paidAt = new Date().toISOString();

    const commission = this.data.commissions.find((c) => c.conversionId === conv.id);
    if (commission) {
      commission.status = status;
      commission.updatedAt = new Date().toISOString();
    }

    this.persist();
    return conv;
  }

  public getConversions(limit = 100): Conversion[] {
    return [...this.data.conversions].reverse().slice(0, limit);
  }

  public getCommissions(): Commission[] {
    return this.data.commissions;
  }

  public recordAffiliateSyncLog(log: Omit<AffiliateSyncLog, "id">): AffiliateSyncLog {
    if (!this.data.affiliateSyncLogs) this.data.affiliateSyncLogs = [];
    const newLog: AffiliateSyncLog = {
      ...log,
      id: uuidv4()
    };
    this.data.affiliateSyncLogs.push(newLog);
    // Keep max 200 logs
    if (this.data.affiliateSyncLogs.length > 200) {
      this.data.affiliateSyncLogs = this.data.affiliateSyncLogs.slice(-200);
    }
    this.persist();
    return newLog;
  }

  public getAffiliateSyncLogs(limit = 50, provider?: string): AffiliateSyncLog[] {
    if (!this.data.affiliateSyncLogs) this.data.affiliateSyncLogs = [];
    let list = [...this.data.affiliateSyncLogs].reverse();
    if (provider && provider !== "ALL") {
      list = list.filter((l) => l.provider.toLowerCase() === provider.toLowerCase());
    }
    return list.slice(0, limit);
  }

  public getRevenueAnalytics(days = 30) {
    const conversions = this.data.conversions;
    const clicks = this.data.clicks;
    const networks = this.data.networks;
    const merchants = this.data.merchants;

    let totalTrackedSales = 0;
    let pendingCommission = 0;
    let approvedCommission = 0;
    let rejectedCommission = 0;
    let paidCommission = 0;
    let estimatedCommission = 0;

    const byCurrency: Record<string, { sales: number; pending: number; approved: number; rejected: number; paid: number }> = {};

    const normalize = (amount: number, currency: string) => {
      const rate = CURRENCY_EXCHANGE_RATES[currency.toUpperCase()] || 1.0;
      return amount * rate;
    };

    for (const c of conversions) {
      const curr = (c.currency || "SAR").toUpperCase();
      if (!byCurrency[curr]) {
        byCurrency[curr] = { sales: 0, pending: 0, approved: 0, rejected: 0, paid: 0 };
      }

      byCurrency[curr].sales += c.orderValue || 0;
      totalTrackedSales += normalize(c.orderValue || 0, curr);

      if (c.estimatedCommissionAmount) {
        estimatedCommission += normalize(c.estimatedCommissionAmount, curr);
      }

      if (c.status === "PENDING") {
        byCurrency[curr].pending += c.commissionAmount || 0;
        pendingCommission += normalize(c.commissionAmount || 0, curr);
      } else if (c.status === "APPROVED") {
        byCurrency[curr].approved += c.commissionAmount || 0;
        approvedCommission += normalize(c.commissionAmount || 0, curr);
      } else if (c.status === "REJECTED" || c.status === "CANCELLED") {
        byCurrency[curr].rejected += c.commissionAmount || 0;
        rejectedCommission += normalize(c.commissionAmount || 0, curr);
      } else if (c.status === "PAID") {
        byCurrency[curr].paid += c.commissionAmount || 0;
        paidCommission += normalize(c.commissionAmount || 0, curr);
      }
    }

    // Historical grouping by date (last N days)
    const historyMap: Record<string, { date: string; sales: number; approvedCommission: number; pendingCommission: number; conversions: number; clicks: number }> = {};
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      historyMap[d] = { date: d, sales: 0, approvedCommission: 0, pendingCommission: 0, conversions: 0, clicks: 0 };
    }

    for (const clk of clicks) {
      const d = (clk.timestamp || "").split("T")[0];
      if (historyMap[d]) {
        historyMap[d].clicks++;
      }
    }

    for (const c of conversions) {
      const d = (c.createdAt || "").split("T")[0];
      if (historyMap[d]) {
        const curr = (c.currency || "SAR").toUpperCase();
        historyMap[d].sales += normalize(c.orderValue || 0, curr);
        historyMap[d].conversions++;
        if (c.status === "APPROVED" || c.status === "PAID") {
          historyMap[d].approvedCommission += normalize(c.commissionAmount || 0, curr);
        } else if (c.status === "PENDING") {
          historyMap[d].pendingCommission += normalize(c.commissionAmount || 0, curr);
        }
      }
    }

    const history = Object.values(historyMap);

    // Dynamic metrics for each added Affiliate Link / Merchant
    const linksMetrics = merchants.map((m) => {
      const mClicks = clicks.filter((clk) => clk.merchantId === m.id);
      const mConvs = conversions.filter((c) => c.merchantId === m.id);

      let mSales = 0;
      let mPending = 0;
      let mApproved = 0;

      for (const conv of mConvs) {
        const curr = (conv.currency || "SAR").toUpperCase();
        mSales += normalize(conv.orderValue || 0, curr);
        if (conv.status === "APPROVED" || conv.status === "PAID") {
          mApproved += normalize(conv.commissionAmount || 0, curr);
        } else if (conv.status === "PENDING") {
          mPending += normalize(conv.commissionAmount || 0, curr);
        }
      }

      const totalComm = mApproved + mPending;
      const cvr = mClicks.length > 0 ? ((mConvs.length / mClicks.length) * 100).toFixed(2) + "%" : "0.00%";

      const colorMap: Record<string, string> = {
        m_linkaraby_main: "#10b981",
        m_bshti: "#8b5cf6",
        m_maysan_it: "#06b6d4",
        m_the_right_way: "#f59e0b",
        m_kagad441: "#ec4899",
        m_rahma_store: "#3b82f6",
        m_amazon_sa: "#f97316",
        m_noon: "#eab308",
        m_aliexpress: "#ef4444"
      };

      return {
        merchantId: m.id,
        merchantName: m.arabicName || m.name,
        network: m.affiliateNetwork || "LinkAraby",
        affiliateUrl: m.affiliateUrl || m.websiteUrl,
        clicks: mClicks.length,
        conversions: mConvs.length,
        conversionRate: cvr,
        salesSar: Math.round(mSales * 100) / 100,
        approvedCommissionSar: Math.round(mApproved * 100) / 100,
        pendingCommissionSar: Math.round(mPending * 100) / 100,
        totalCommissionSar: Math.round(totalComm * 100) / 100,
        color: colorMap[m.id] || "#10b981"
      };
    }).sort((a, b) => (b.totalCommissionSar || b.clicks) - (a.totalCommissionSar || a.clicks));

    // Network breakdown
    const networkBreakdown = networks.map((net) => {
      const netKey = net.networkKey.toLowerCase();
      const netConvs = conversions.filter((c) => c.network.toLowerCase().includes(netKey));
      const netClicks = clicks.filter((clk) => {
        const m = this.getMerchantById(clk.merchantId);
        return m && m.affiliateNetwork.toLowerCase().includes(netKey);
      });

      let netSales = 0;
      let netPending = 0;
      let netApproved = 0;
      let netRejected = 0;
      let netEstimated = 0;

      for (const nc of netConvs) {
        const curr = (nc.currency || "SAR").toUpperCase();
        netSales += normalize(nc.orderValue || 0, curr);
        if (nc.estimatedCommissionAmount) netEstimated += normalize(nc.estimatedCommissionAmount, curr);
        if (nc.status === "PENDING") netPending += normalize(nc.commissionAmount || 0, curr);
        else if (nc.status === "APPROVED" || nc.status === "PAID") netApproved += normalize(nc.commissionAmount || 0, curr);
        else if (nc.status === "REJECTED" || nc.status === "CANCELLED") netRejected += normalize(nc.commissionAmount || 0, curr);
      }

      return {
        networkKey: net.networkKey,
        name: net.name,
        clicks: netClicks.length,
        conversionsCount: netConvs.length,
        sales: Math.round(netSales * 100) / 100,
        pendingCommission: Math.round(netPending * 100) / 100,
        approvedCommission: Math.round(netApproved * 100) / 100,
        rejectedCommission: Math.round(netRejected * 100) / 100,
        estimatedCommission: Math.round(netEstimated * 100) / 100,
        connectionStatus: net.connectionStatus,
        lastTestedAt: net.lastTestedAt
      };
    });

    return {
      summary: {
        totalTrackedSales: Math.round(totalTrackedSales * 100) / 100,
        pendingCommission: Math.round(pendingCommission * 100) / 100,
        approvedCommission: Math.round(approvedCommission * 100) / 100,
        rejectedCommission: Math.round(rejectedCommission * 100) / 100,
        paidCommission: Math.round(paidCommission * 100) / 100,
        estimatedCommission: Math.round(estimatedCommission * 100) / 100,
        totalRevenue: Math.round((approvedCommission + paidCommission) * 100) / 100,
        baseCurrency: "SAR",
        totalConversions: conversions.length,
        totalClicks: clicks.length,
        conversionRate: clicks.length > 0 ? ((conversions.length / clicks.length) * 100).toFixed(2) + "%" : "0.00%",
        byCurrency,
        exchangeRates: CURRENCY_EXCHANGE_RATES
      },
      networkBreakdown,
      linksMetrics,
      history
    };
  }

  public getCommissionsSummary(): {
    totalRevenue: number;
    pendingCommission: number;
    approvedCommission: number;
    paidCommission: number;
    currency: string;
    totalConversions: number;
  } {
    let pending = 0;
    let approved = 0;
    let paid = 0;
    let totalRevenue = 0;

    for (const c of this.data.commissions) {
      if (c.status === "PENDING") pending += c.amount;
      if (c.status === "APPROVED") approved += c.amount;
      if (c.status === "PAID") paid += c.amount;
      totalRevenue += c.amount;
    }

    return {
      totalRevenue,
      pendingCommission: pending,
      approvedCommission: approved,
      paidCommission: paid,
      currency: "SAR",
      totalConversions: this.data.conversions.length
    };
  }

  // --- Subscribers ---
  public getSubscribers(): EmailSubscriber[] {
    return this.data.subscribers;
  }

  public getSubscriberByEmail(email: string): EmailSubscriber | undefined {
    return this.data.subscribers.find(
      (s) => s.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
  }

  public addSubscriber(sub: Omit<EmailSubscriber, "id">): EmailSubscriber {
    const existing = this.getSubscriberByEmail(sub.email);
    if (existing) {
      existing.status = "ACTIVE";
      existing.preferences = sub.preferences;
      this.persist();
      return existing;
    }

    const newSub: EmailSubscriber = {
      ...sub,
      id: uuidv4(),
      email: sub.email.toLowerCase().trim()
    };
    this.data.subscribers.push(newSub);
    this.persist();
    return newSub;
  }

  public verifySubscriber(token: string): boolean {
    const sub = this.data.subscribers.find((s) => s.verificationToken === token);
    if (!sub) return false;
    sub.isVerified = true;
    sub.status = "ACTIVE";
    sub.verifiedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  public unsubscribe(tokenOrEmail: string): boolean {
    const sub = this.data.subscribers.find(
      (s) => s.verificationToken === tokenOrEmail || s.email.toLowerCase() === tokenOrEmail.toLowerCase()
    );
    if (!sub) return false;
    sub.status = "UNSUBSCRIBED";
    sub.unsubscribedAt = new Date().toISOString();
    this.persist();
    return true;
  }

  // --- Price Alerts ---
  public addPriceAlert(alert: Omit<PriceAlert, "id" | "createdAt" | "status">): PriceAlert {
    const newAlert: PriceAlert = {
      ...alert,
      id: uuidv4(),
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };
    this.data.priceAlerts.push(newAlert);
    this.persist();
    return newAlert;
  }

  public getActivePriceAlerts(): PriceAlert[] {
    return this.data.priceAlerts.filter((a) => a.status === "ACTIVE");
  }

  public markPriceAlertTriggered(alertId: string): void {
    const alert = this.data.priceAlerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = "TRIGGERED";
      alert.triggeredAt = new Date().toISOString();
      this.persist();
    }
  }

  // --- Coupon Alerts ---
  public addCouponAlert(alert: Omit<CouponAlert, "id" | "createdAt" | "status">): CouponAlert {
    const newAlert: CouponAlert = {
      ...alert,
      id: uuidv4(),
      status: "ACTIVE",
      createdAt: new Date().toISOString()
    };
    this.data.couponAlerts.push(newAlert);
    this.persist();
    return newAlert;
  }

  public getActiveCouponAlerts(merchantId: string): CouponAlert[] {
    return this.data.couponAlerts.filter(
      (a) => a.merchantId === merchantId && a.status === "ACTIVE"
    );
  }

  // --- Networks ---
  public getNetworks(): AffiliateNetworkConfig[] {
    return this.data.networks;
  }

  public updateNetworkConfig(networkKey: string, updates: Partial<AffiliateNetworkConfig>): AffiliateNetworkConfig | undefined {
    const net = this.data.networks.find((n) => n.networkKey === networkKey);
    if (net) {
      Object.assign(net, updates);
      this.persist();
      return net;
    }
    return undefined;
  }

  // --- Integrations ---
  public getIntegrations(): AffiliateIntegration[] {
    return this.data.integrations || INITIAL_INTEGRATIONS;
  }

  public upsertIntegration(integration: AffiliateIntegration): AffiliateIntegration {
    if (!this.data.integrations) this.data.integrations = INITIAL_INTEGRATIONS;
    const idx = this.data.integrations.findIndex(i => i.id === integration.id || i.provider === integration.provider);
    const updated = { ...integration, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      this.data.integrations[idx] = updated;
    } else {
      this.data.integrations.push(updated);
    }
    this.persist();
    return updated;
  }

  // --- Integration Logs ---
  public addIntegrationLog(log: Omit<AffiliateIntegrationLog, "id" | "createdAt">): AffiliateIntegrationLog {
    if (!this.data.integrationLogs) this.data.integrationLogs = [];
    const newLog: AffiliateIntegrationLog = {
      ...log,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    this.data.integrationLogs.push(newLog);
    if (this.data.integrationLogs.length > 500) {
      this.data.integrationLogs = this.data.integrationLogs.slice(-250);
    }
    this.persist();
    return newLog;
  }

  public getIntegrationLogs(limit = 100): AffiliateIntegrationLog[] {
    return [...(this.data.integrationLogs || [])].reverse().slice(0, limit);
  }

  // --- Sync Jobs & Webhook Events ---
  public recordSyncJob(job: Omit<SyncJob, "id">): SyncJob {
    const newJob: SyncJob = {
      ...job,
      id: uuidv4()
    };
    this.data.syncJobs.push(newJob);
    if (this.data.syncJobs.length > 200) {
      this.data.syncJobs = this.data.syncJobs.slice(-100);
    }
    this.persist();
    return newJob;
  }

  public getSyncJobs(limit = 20): SyncJob[] {
    return [...this.data.syncJobs].reverse().slice(0, limit);
  }

  public recordWebhookEvent(event: Omit<WebhookEvent, "id">): WebhookEvent {
    const newEvent: WebhookEvent = {
      ...event,
      id: uuidv4()
    };
    this.data.webhookEvents.push(newEvent);
    if (this.data.webhookEvents.length > 500) {
      this.data.webhookEvents = this.data.webhookEvents.slice(-200);
    }
    this.persist();
    return newEvent;
  }

  public isWebhookEventProcessed(network: string, eventId: string): boolean {
    return Boolean(this.data.webhookEvents.find(e => e.network === network && e.eventId === eventId && e.processed));
  }

  public getWebhookEvents(limit = 50): WebhookEvent[] {
    return [...this.data.webhookEvents].reverse().slice(0, limit);
  }

  // --- AI Trending Niches & Sync Jobs ---
  public getTrendingNiches(): TrendingNicheRecord[] {
    return this.data.trendingNiches || [];
  }

  public saveTrendingNiches(niches: TrendingNicheRecord[], jobReport?: NicheSyncJobReport): void {
    this.data.trendingNiches = niches;
    if (!this.data.nicheSyncJobs) {
      this.data.nicheSyncJobs = [];
    }
    if (jobReport) {
      this.data.nicheSyncJobs.unshift(jobReport);
      if (this.data.nicheSyncJobs.length > 50) {
        this.data.nicheSyncJobs = this.data.nicheSyncJobs.slice(0, 50);
      }
    }
    this.persist();
  }

  public getLatestNicheSyncJob(): NicheSyncJobReport | null {
    if (!this.data.nicheSyncJobs || this.data.nicheSyncJobs.length === 0) {
      return null;
    }
    return this.data.nicheSyncJobs[0];
  }

  public getAllNicheSyncJobs(limit = 20): NicheSyncJobReport[] {
    return (this.data.nicheSyncJobs || []).slice(0, limit);
  }

  // --- Payout & Binance Wallet Configuration ---
  public getPayoutDestination(): PayoutDestinationConfig {
    if (!this.data.payoutDestination) {
      this.data.payoutDestination = {
        method: "crypto",
        walletAddress: "0xddeae422ae06b08122d4f44510a7b99410ac3d19",
        walletNetwork: "BEP20 (BNB Smart Chain) / ERC20",
        walletExchange: "Binance (منصة بينانس)",
        accountIdentifier: "0xddeae422ae06b08122d4f44510a7b99410ac3d19",
        accountHolderName: "حساب مالك الموقع المعتمد",
        autoPayoutThresholdSar: 100,
        status: "ACTIVE",
        lastVerifiedAt: new Date().toISOString(),
        notes: "محفظة بينانس الأساسية لاستقبال عوائد وأرباح الأفلييت والعمولات مباشرة"
      };
      this.persist();
    }
    return this.data.payoutDestination;
  }

  public updatePayoutDestination(config: Partial<PayoutDestinationConfig>): PayoutDestinationConfig {
    const current = this.getPayoutDestination();
    this.data.payoutDestination = {
      ...current,
      ...config,
      lastVerifiedAt: new Date().toISOString()
    };
    this.persist();
    return this.data.payoutDestination;
  }

  public getPayoutTransactions(limit = 50): PayoutTransactionRecord[] {
    return [...(this.data.payoutTransactions || [])].reverse().slice(0, limit);
  }

  public createPayoutTransaction(tx: Omit<PayoutTransactionRecord, "id" | "initiatedAt">): PayoutTransactionRecord {
    if (!this.data.payoutTransactions) {
      this.data.payoutTransactions = [];
    }
    const newTx: PayoutTransactionRecord = {
      ...tx,
      id: `payout_tx_${Date.now()}_${uuidv4().substring(0, 8)}`,
      initiatedAt: new Date().toISOString()
    };
    this.data.payoutTransactions.push(newTx);
    this.persist();
    return newTx;
  }

  public updatePayoutTransactionStatus(
    id: string,
    status: PayoutTransactionRecord["status"],
    txHash?: string
  ): PayoutTransactionRecord | null {
    if (!this.data.payoutTransactions) return null;
    const item = this.data.payoutTransactions.find(t => t.id === id);
    if (!item) return null;
    item.status = status;
    if (txHash) item.txHash = txHash;
    if (status === "COMPLETED" || status === "CONFIRMED_ON_CHAIN") {
      item.completedAt = new Date().toISOString();
    }
    this.persist();
    return item;
  }

  public recordAdminAuditLog(log: Omit<AdminAuditLog, "id" | "timestamp">): AdminAuditLog {
    if (!this.data.adminAuditLogs) {
      this.data.adminAuditLogs = [];
    }
    const newLog: AdminAuditLog = {
      ...log,
      id: `audit_${Date.now()}_${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toISOString()
    };
    this.data.adminAuditLogs.push(newLog);
    // Keep max 2000 logs in memory/disk
    if (this.data.adminAuditLogs.length > 2000) {
      this.data.adminAuditLogs = this.data.adminAuditLogs.slice(-2000);
    }
    this.persist();
    return newLog;
  }

  public getAdminAuditLogs(limit = 100): AdminAuditLog[] {
    return [...(this.data.adminAuditLogs || [])].reverse().slice(0, limit);
  }
}

export const db = Database.getInstance();
