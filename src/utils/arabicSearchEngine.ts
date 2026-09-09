import { StoreBrand, CouponItem } from "../types";

export interface SearchResultItem {
  id: string;
  type: "store" | "coupon" | "category" | "product" | "query_suggestion";
  title: string;
  subtitle?: string;
  arabicName?: string;
  code?: string;
  discount?: string;
  badge?: string;
  category?: string;
  logoBg?: string;
  logoText?: string;
  score: number;
  url?: string;
  affiliateUrl?: string;
  rawBrand?: StoreBrand;
  rawCoupon?: CouponItem;
}

export interface SearchEngineResponse {
  query: string;
  normalizedQuery: string;
  correctedQuery?: string;
  results: SearchResultItem[];
  groupedResults: {
    stores: SearchResultItem[];
    coupons: SearchResultItem[];
    categories: SearchResultItem[];
    suggestions: string[];
  };
  totalCount: number;
}

// 1. Arabic Text Normalization (توحيد الحروف وحذف التشكيل والتطويل)
export function normalizeArabicText(text: string): string {
  if (!text) return "";
  let clean = text.toLowerCase().trim();

  // Remove diacritics / Tashkeel (الحركات والتشكيل)
  clean = clean.replace(/[\u064B-\u065F\u0670]/g, "");

  // Remove Tatweel / Kashida (ـ)
  clean = clean.replace(/\u0640/g, "");

  // Normalize Alef variations (أ, إ, آ, ٱ -> ا)
  clean = clean.replace(/[أإآٱ]/g, "ا");

  // Normalize Yaa variations (ى, ئ -> ي)
  clean = clean.replace(/[ىئ]/g, "ي");

  // Normalize Taa Marbuta (ة -> ه)
  clean = clean.replace(/ة/g, "ه");

  // Normalize Waw with Hamza (ؤ -> و)
  clean = clean.replace(/ؤ/g, "و");

  // Replace common punctuation with space
  clean = clean.replace(/[،,.\-_/\\()!؟?+]/g, " ");

  // Collapse multiple spaces into single space
  clean = clean.replace(/\s+/g, " ").trim();

  return clean;
}

// 2. Arabic Synonyms & Common Keyword Expansions
export const ARABIC_SYNONYMS_MAP: Record<string, string[]> = {
  "خصم": ["كوبون", "كود", "قسيمة", "تخفيض", "عروض", "بروموكود", "تنزيلات", "اوفر", "توفير", "خصومات"],
  "كود": ["كوبون", "قسيمة", "رمز", "بروموكود", "خصم", "تخفيض"],
  "كوبون": ["كود", "قسيمة", "رمز ترويجي", "بروموكود", "خصم", "voucher"],
  "سوبرماركت": ["مقاضي", "تموينات", "بقالة", "اغذية", "نون ديلي", "نون", "طعام"],
  "ازياء": ["ملابس", "فساتين", "احذية", "شوزات", "شنط", "عبايات", "نمشي", "شي ان", "ستايلي", "فاشن"],
  "ملابس": ["ازياء", "فساتين", "تيشرتات", "بناطيل", "جلابيات", "عبايات", "شي ان", "نمشي"],
  "جمال": ["مكياج", "عطور", "عناية", "بشرة", "ميك اب", "نايس ون", "مستحضرات تجميل"],
  "عطور": ["جمال", "بخور", "دهن عود", "عطر", "نايس ون"],
  "مكياج": ["جمال", "ميك اب", "ارواج", "عناية بالبشرة", "نايس ون"],
  "الكترونيات": ["جوالات", "هواتف", "ايفون", "سامسونج", "لابتوب", "شاشات", "سماعات", "جرير", "امازون", "نون"],
  "جوالات": ["هواتف", "ايفون", "سامسونج", "اجهزة", "الكترونيات", "جرير", "امازون"],
  "مكتبة": ["كتب", "ادوات مدرسية", "جرير", "قرطاسية", "دفاتر"],
  "مطاعم": ["توصيل", "وجبات", "هنقرستيشن", "طعام", "اكل"],
  "توصيل": ["هنقرستيشن", "مطاعم", "شحن مجاني", "سريع"],
  "صحة": ["فيتامينات", "مكملات", "اي هيرب", "صيدلية", "اعشاب"],
  "فيتامينات": ["اي هيرب", "مكملات غذائية", "بروتين", "صحة"],
  "نون": ["noon", "نون ديلي", "مقاضي", "سوبرماركت", "الكترونيات"],
  "امازون": ["amazon", "سوق", "برايم", "امزون"],
  "نمشي": ["namshi", "ازياء", "ملابس", "احذية"],
  "شي ان": ["shein", "شين", "شيئن", "فساتين", "ملابس رخيصة"],
  "نايس ون": ["niceone", "مكياج", "عطور", "تجميل"],
  "اي هيرب": ["iherb", "ايهيرب", "مكملات", "فيتامينات"],
  "جرير": ["jarir", "مكتبة جرير", "كتب", "جوالات", "اجهزة"],
  "ستايلي": ["styli", "ازياء", "ملابس شبابية"],
  "هنقرستيشن": ["hungerstation", "مطاعم", "اكل", "توصيل"]
};

// 3. Known Store Typo Auto-Corrections (تصحيح الأخطاء الشائعة لأسماء البراندات)
export const COMMON_TYPOS: Record<string, string> = {
  "امزون": "أمازون",
  "امزون السعودية": "أمازون السعودية",
  "امازون": "أمازون السعودية",
  "amazon": "أمازون السعودية",
  "نمسشي": "نمشي",
  "نمشى": "نمشي",
  "namshi": "نمشي",
  "شين": "شي إن",
  "شيين": "شي إن",
  "شي ان": "شي إن",
  "shein": "شي إن",
  "نونديلي": "نون ديلي",
  "نون ديلى": "نون ديلي",
  "noon": "نون السعودية",
  "نايسوان": "نايس ون",
  "نايس وان": "نايس ون",
  "niceone": "نايس ون",
  "ايهرب": "آي هيرب",
  "اي هيرب": "آي هيرب",
  "iherb": "آي هيرب",
  "هنجرستيشن": "هنقرستيشن",
  "هنقر": "هنقرستيشن",
  "hungerstation": "هنقرستيشن",
  "مكتبه جرير": "مكتبة جرير",
  "jarir": "مكتبة جرير"
};

// 4. Levenshtein Distance for Arabic Fuzzy Matching
export function calculateLevenshteinDistance(a: string, b: string): number {
  const an = a ? a.length : 0;
  const bn = b ? b.length : 0;
  if (an === 0) return bn;
  if (bn === 0) return an;
  
  const matrix: number[][] = [];
  for (let i = 0; i <= bn; ++i) matrix[i] = [i];
  for (let i = 0; i <= an; ++i) matrix[0][i] = i;

  for (let i = 1; i <= bn; ++i) {
    for (let j = 1; j <= an; ++j) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }
  return matrix[bn][an];
}

// 5. Calculate Similarity Score (0.0 to 1.0)
export function calculateSimilarity(str1: string, str2: string): number {
  const norm1 = normalizeArabicText(str1);
  const norm2 = normalizeArabicText(str2);
  if (norm1 === norm2) return 1.0;
  if (norm1.includes(norm2) || norm2.includes(norm1)) return 0.85;

  const maxLen = Math.max(norm1.length, norm2.length);
  if (maxLen === 0) return 1.0;
  const distance = calculateLevenshteinDistance(norm1, norm2);
  return Math.max(0, 1 - distance / maxLen);
}

// 6. Comprehensive Smart Search Execution
export function executeSmartSearch(
  rawQuery: string,
  brands: StoreBrand[],
  categories: { id: string; name: string; icon?: any }[] = []
): SearchEngineResponse {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return {
      query: "",
      normalizedQuery: "",
      results: [],
      groupedResults: {
        stores: [],
        coupons: [],
        categories: [],
        suggestions: []
      },
      totalCount: 0
    };
  }

  const normalizedQuery = normalizeArabicText(trimmed);
  const queryWords = normalizedQuery.split(" ").filter((w) => w.length > 0);

  // Check for auto-correct suggestion
  let correctedQuery: string | undefined = undefined;
  if (COMMON_TYPOS[normalizedQuery]) {
    correctedQuery = COMMON_TYPOS[normalizedQuery];
  } else {
    for (const typo in COMMON_TYPOS) {
      if (calculateSimilarity(normalizedQuery, typo) >= 0.8) {
        correctedQuery = COMMON_TYPOS[typo];
        break;
      }
    }
  }

  // Find synonyms matching query
  const expandedSynonyms: string[] = [];
  queryWords.forEach((word) => {
    if (ARABIC_SYNONYMS_MAP[word]) {
      expandedSynonyms.push(...ARABIC_SYNONYMS_MAP[word]);
    }
  });

  const allSearchTerms = Array.from(new Set([normalizedQuery, ...queryWords, ...expandedSynonyms]));

  const scoredStores: SearchResultItem[] = [];
  const scoredCoupons: SearchResultItem[] = [];
  const scoredCategories: SearchResultItem[] = [];
  const suggestionSet = new Set<string>();

  // A. Search in Store Brands
  brands.forEach((brand) => {
    const normArabic = normalizeArabicText(brand.arabicName);
    const normEnglish = normalizeArabicText(brand.name);
    const normTagline = normalizeArabicText(brand.tagline || "");
    const normCategory = normalizeArabicText(brand.category || "");
    const normAbout = normalizeArabicText(brand.aboutStore || "");
    const normSeoTitle = normalizeArabicText(brand.seoTitle || "");

    let score = 0;

    // Exact full name match
    if (normArabic === normalizedQuery || normEnglish === normalizedQuery) {
      score += 100;
    } else if (normArabic.includes(normalizedQuery) || normEnglish.includes(normalizedQuery)) {
      score += 60;
    } else if (normalizedQuery.includes(normArabic) || normalizedQuery.includes(normEnglish)) {
      score += 50;
    }

    // Word by word matching
    queryWords.forEach((word) => {
      if (normArabic.includes(word)) score += 30;
      if (normEnglish.includes(word)) score += 25;
      if (normCategory.includes(word)) score += 20;
      if (normTagline.includes(word)) score += 15;
      if (normSeoTitle.includes(word)) score += 10;
      if (normAbout.includes(word)) score += 5;
    });

    // Synonym match
    expandedSynonyms.forEach((syn) => {
      const normSyn = normalizeArabicText(syn);
      if (normArabic.includes(normSyn) || normCategory.includes(normSyn)) {
        score += 18;
      }
    });

    // Fuzzy tolerance for small typos
    if (score === 0) {
      const simArabic = calculateSimilarity(normArabic, normalizedQuery);
      const simEnglish = calculateSimilarity(normEnglish, normalizedQuery);
      const maxSim = Math.max(simArabic, simEnglish);
      if (maxSim >= 0.65) {
        score += Math.round(maxSim * 40);
      }
    }

    if (score > 0) {
      suggestionSet.add(brand.arabicName);
      suggestionSet.add(`كود خصم ${brand.arabicName}`);

      scoredStores.push({
        id: `store-${brand.id}`,
        type: "store",
        title: brand.arabicName,
        subtitle: brand.tagline,
        arabicName: brand.arabicName,
        category: brand.category,
        logoBg: brand.logoBg,
        logoText: brand.logoText,
        score,
        affiliateUrl: brand.affiliateUrl,
        rawBrand: brand
      });

      // B. Search inside this brand's coupons
      brand.coupons.forEach((coupon) => {
        const normCode = normalizeArabicText(coupon.code);
        const normTitle = normalizeArabicText(coupon.title);
        const normDesc = normalizeArabicText(coupon.description || "");
        const normBadge = normalizeArabicText(coupon.badge || "");

        let couponScore = Math.floor(score * 0.5);

        // Code exact match
        if (normCode === normalizedQuery) {
          couponScore += 90;
        } else if (normCode.includes(normalizedQuery)) {
          couponScore += 45;
        }

        queryWords.forEach((word) => {
          if (normTitle.includes(word)) couponScore += 25;
          if (normDesc.includes(word)) couponScore += 15;
          if (normBadge.includes(word)) couponScore += 10;
        });

        if (coupon.isExclusive) couponScore += 10;

        if (couponScore > 10) {
          suggestionSet.add(`${brand.arabicName} ${coupon.code}`);
          scoredCoupons.push({
            id: `coupon-${coupon.id}`,
            type: "coupon",
            title: coupon.title,
            subtitle: `${brand.arabicName} • ${coupon.discount}`,
            arabicName: brand.arabicName,
            code: coupon.code,
            discount: coupon.discount,
            badge: coupon.badge,
            score: couponScore,
            affiliateUrl: coupon.affiliateUrl || brand.affiliateUrl,
            rawBrand: brand,
            rawCoupon: coupon
          });
        }
      });
    }
  });

  // C. Search Categories
  categories.forEach((cat) => {
    if (cat.id === "all") return;
    const normCat = normalizeArabicText(cat.name);
    let catScore = 0;

    if (normCat.includes(normalizedQuery) || normalizedQuery.includes(normCat)) {
      catScore += 50;
    }
    queryWords.forEach((w) => {
      if (normCat.includes(w)) catScore += 25;
    });
    expandedSynonyms.forEach((syn) => {
      if (normCat.includes(normalizeArabicText(syn))) catScore += 15;
    });

    if (catScore > 0) {
      suggestionSet.add(cat.name);
      scoredCategories.push({
        id: `cat-${cat.id}`,
        type: "category",
        title: cat.name,
        subtitle: "تصفح جميع كوبونات ومتاجر هذا القسم",
        score: catScore,
        category: cat.id
      });
    }
  });

  // Sort results by score descending
  scoredStores.sort((a, b) => b.score - a.score);
  scoredCoupons.sort((a, b) => b.score - a.score);
  scoredCategories.sort((a, b) => b.score - a.score);

  const combinedResults = [...scoredStores, ...scoredCoupons, ...scoredCategories].sort(
    (a, b) => b.score - a.score
  );

  return {
    query: rawQuery,
    normalizedQuery,
    correctedQuery: correctedQuery !== rawQuery && correctedQuery !== normalizedQuery ? correctedQuery : undefined,
    results: combinedResults,
    groupedResults: {
      stores: scoredStores,
      coupons: scoredCoupons,
      categories: scoredCategories,
      suggestions: Array.from(suggestionSet).slice(0, 6)
    },
    totalCount: combinedResults.length
  };
}
