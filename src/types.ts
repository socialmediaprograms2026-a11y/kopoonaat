export interface BenchmarkSite {
  name: string;
  url: string;
  monthlyVisits: string;
  organicTrafficShare: string;
  estimatedAnnualRevenue: string;
  keyStrength: string;
}

export interface AffiliateModel {
  id: string;
  title: string;
  englishTitle: string;
  shortDescription: string;
  fullDescription: string;
  category: "reviews" | "coupons" | "saas" | "finance" | "affiliate-directory" | "travel";
  googleSeoStrategy: {
    primaryKeywordsPattern: string[];
    serpIntent: "Commercial" | "Transactional" | "Informational" | "Navigational" | "Mixed";
    contentFormat: string;
    updateFrequency: string;
    schemaTypes: string[];
  };
  brandIntegration: {
    method: string;
    displayType: string;
    numberOfBrands: string;
    typicalLinksStyle: string;
  };
  financialMetrics: {
    commissionModel: string;
    avgCommissionRange: string;
    conversionRate: string;
    difficulty: "سهل" | "متوسط" | "تنافسي" | "عالي جداً";
  };
  benchmarks: BenchmarkSite[];
  whyGoogleRanksIt: string[];
  keyRisksAndHcuWarnings: string[];
}

export interface NicheKeyword {
  keyword: string;
  monthlySearchVolumeGlobal: string;
  monthlySearchVolumeMena: string;
  intent: "شراء وتخفيض" | "مقارنة واختيار" | "مراجعة وتجربة" | "بحث تعليمي";
  cpcValue: string;
  difficulty: "منخفض" | "متوسط" | "مرتفع" | "شرس";
}

export interface Google2026Audit {
  accuracyScore: number; // e.g. 97%
  lastVerifiedDate: string; // e.g. "سبتمبر 2026"
  algorithmFocus: string; // e.g. "تحديث قوقل الأساسي ونظام المراجعات (Core & Reviews 2026)"
  complianceLevel: "دقة استثنائية (97%+)" | "دقة ممتازة (93-96%)" | "دقة عالية (90-92%)";
  criteriaBreakdown: {
    eeatScore: number; // Experience & Trust
    intentAccuracy: number; // Real Search Intent
    sponsoredCompliance: number; // rel="sponsored" & transparency
    antiAiSpamScore: number; // Unique added value
  };
  keyAdvice2026: string;
}

export interface AffiliateNiche {
  id: string;
  name: string;
  englishName: string;
  icon: string;
  totalMonthlySearchGlobal: string;
  totalMonthlySearchMena: string;
  averageCommission: string;
  commissionType: "CPA" | "CPS" | "RevShare" | "Recurring" | "Hybrid";
  seoCompetitionLevel: "منخفض" | "منخفض إلى متوسط" | "متوسط" | "مرتفع" | "شرس";
  suitabilityForMultiBrand: "مثالي جداً" | "ممتاز" | "جيد";
  overview: string;
  whyHighDemand: string;
  topKeywords: NicheKeyword[];
  prominentBrandsAndPrograms: string[];
  winningSeoTactics: string[];
  google2026Audit?: Google2026Audit;
}

export interface SeoStep {
  stepNumber: number;
  title: string;
  subtitle: string;
  details: string[];
  googleGuideline: string;
  proTip: string;
}

export interface AffiliateNetwork {
  name: string;
  region: "عالمي" | "العالم العربي والخليج" | "مختلط";
  type: string;
  famousBrands: string[];
  payoutMethods: string[];
  minimumPayout: string;
  cookieDuration: string;
  description: string;
  website: string;
}

export type NotificationCategory = "google_update" | "affiliate_opportunity" | "algorithm_alert" | "keyword_spike";

export interface SystemNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  badge: string;
  timeAgo: string;
  impactLevel: "عالي الأهمية" | "فرصة ذهبية" | "تنبيه خوارزمي" | "تحديث عاجل";
  actionLabel: string;
  targetTab?: "models" | "niches" | "seo-playbook" | "calculator" | "networks" | "coupons";
  source: string;
  details: {
    summary: string;
    impactAnalysis: string;
    recommendedAction: string;
    affectedNiches: string[];
    actionItems: string[];
  };
}

export interface CouponItem {
  id: string;
  code: string;
  title: string;
  discount: string;
  description: string;
  expiryDate: string;
  verifiedDate: string;
  badge?: string;
  isExclusive?: boolean;
  successRate: string;
  affiliateUrl: string;
  type: "coupon" | "deal";
  minSpend?: string;
  timesUsedToday?: number;
  imageUrl?: string;
}

export interface ProductItem {
  id: string;
  slug: string;
  merchantId: string;
  name: string;
  arabicName: string;
  description?: string;
  image: string;
  price: number;
  oldPrice?: number;
  discountPercentage?: number;
  currency: string;
  productUrl: string;
  affiliateUrl: string;
  brand?: string;
  rating?: number;
  reviewsCount?: number;
  category?: string;
  availability?: "IN_STOCK" | "OUT_OF_STOCK" | "PREORDER";
}

export interface AffiliateConfig {
  network: string; // e.g. "Amazon Associates", "CJ", "Impact", "LinkAraby", "ArabClicks", "Awin"
  affiliateUrl: string;
  campaignId?: string;
  trackingParameters?: Record<string, string>;
}

export interface StoreBrand {
  id: string;
  slug: string;
  name: string;
  arabicName: string;
  tagline: string;
  logoText: string;
  logoBg: string;
  logoUrl?: string;
  bannerImage?: string;
  primaryColor: string;
  category: "أزياء وموضة" | "إلكترونيات وجوالات" | "عطور وتجميل" | "توصيل ومطاعم" | "سوبرماركت ومستلزمات" | "صحة ومكملات" | "خدمات وسياحة" | "خدمات واشتراكات" | "المنزل والمطبخ" | "أطعمة ومشروبات";
  featured: boolean;
  rating: number;
  totalReviews: number;
  country: "السعودية" | "المملكة العربية السعودية" | "السعودية والخليج" | "عالمي متاح بالسعودية" | "السعودية والوطن العربي";
  affiliateUrl: string;
  affiliateConfig?: AffiliateConfig;
  products?: ProductItem[];
  seoTitle: string;
  seoDescription: string;
  aboutStore: string;
  coupons: CouponItem[];
  savingTips: string[];
  faqs: { question: string; answer: string }[];
}

export interface CompetitorAnalysisResult {
  competitorName: string;
  analyzedUrl: string;
  targetNiche: string;
  overallThreatScore: number; // 0 - 100
  strengthsScore: number; // 0 - 100
  weaknessesScore: number; // 0 - 100
  detectedAffiliateFootprint: {
    primaryNetworks: string[];
    redirectPattern: string;
    trackingParameters: string[];
    disclosureCompliance: string;
  };
  seoStrategyComparison: {
    domainAuthorityRating: string;
    contentStructure: string;
    primaryTargetKeywords: string[];
    richSnippetsStrategy: string;
  };
  strengths: string[];
  weaknesses: string[];
  counterStrategyActionPlan: string[];
  trafficAndMonetizationEstimate: {
    estimatedTraffic: string;
    estimatedRevenue: string;
    competitiveDifficulty: string;
  };
}

