import { AffiliateNiche, SeoStep, AffiliateNetwork } from "../types";

export const AFFILIATE_NICHES: AffiliateNiche[] = [
  {
    id: "niche-coupons-ecommerce",
    name: "كوبونات وأكواد خصم المتاجر الإلكترونية الكبرى",
    englishName: "E-Commerce Coupons & Promo Codes",
    icon: "Tag",
    totalMonthlySearchGlobal: "85,000,000+ بحث شهرياً",
    totalMonthlySearchMena: "18,500,000+ بحث شهرياً",
    averageCommission: "3% - 15% من قيمة السلة أو 5$ - 25$ لكل طلب",
    commissionType: "CPA",
    seoCompetitionLevel: "شرس",
    suitabilityForMultiBrand: "مثالي جداً",
    overview: "النيش الأكبر على الإطلاق في حجم البحث اللحظي. يبحث المستهلكون قبل نقرة الدفع مباشرة في سلة المشتريات عن 'كود خصم نون' أو 'كوبون نمشي' للحصول على تخفيض، مما يضمن أعلى معدل تحويل بين كل أنواع مواقع الإنترنت.",
    whyHighDemand: "سلوك الشراء الأونلاين في العالم العربي ودول الخليج أصبح يعتمد بنسبة تزيد عن 70% على البحث عن كود خصم في جوجل قبل إتمام أي طلب.",
    topKeywords: [
      {
        keyword: "كود خصم نون (Noon discount code)",
        monthlySearchVolumeGlobal: "1,200,000",
        monthlySearchVolumeMena: "950,000",
        intent: "شراء وتخفيض",
        cpcValue: "$0.85",
        difficulty: "مرتفع"
      },
      {
        keyword: "كود خصم نمشي (Namshi coupon)",
        monthlySearchVolumeGlobal: "450,000",
        monthlySearchVolumeMena: "410,000",
        intent: "شراء وتخفيض",
        cpcValue: "$0.70",
        difficulty: "مرتفع"
      },
      {
        keyword: "كود خصم ايهيرب (iHerb promo code)",
        monthlySearchVolumeGlobal: "1,800,000",
        monthlySearchVolumeMena: "620,000",
        intent: "شراء وتخفيض",
        cpcValue: "$1.40",
        difficulty: "مرتفع"
      },
      {
        keyword: "كوبون خصم امازون (Amazon promo code)",
        monthlySearchVolumeGlobal: "3,500,000",
        monthlySearchVolumeMena: "580,000",
        intent: "شراء وتخفيض",
        cpcValue: "$1.10",
        difficulty: "شرس"
      },
      {
        keyword: "كود خصم شي ان (Shein discount code)",
        monthlySearchVolumeGlobal: "2,900,000",
        monthlySearchVolumeMena: "850,000",
        intent: "شراء وتخفيض",
        cpcValue: "$0.95",
        difficulty: "مرتفع"
      },
      {
        keyword: "اكواد خصم اليوم الوطني / الجمعة البيضاء",
        monthlySearchVolumeGlobal: "800,000",
        monthlySearchVolumeMena: "750,000 (موسمي)",
        intent: "شراء وتخفيض",
        cpcValue: "$1.60",
        difficulty: "متوسط"
      }
    ],
    prominentBrandsAndPrograms: ["نون (Noon)", "أمازون (Amazon)", "نمشي (Namshi)", "شي إن (Shein)", "ستايل (Styli)", "سيفورا (Sephora)", "جرير (Jarir)"],
    winningSeoTactics: [
      "تضمين الشهر والسنة الحالية في وسوم العنوان (مثلاً: كود خصم نون مارس 2026 فعال ومجرب).",
      "استخدام ترميز Schema المتقدم (Coupon/Discount Offer Schema) لعرض نجوم التقييم وتاريخ الصلاحية في نتائج بحث قوقل.",
      "إنشاء صفحات أقسام فرعية حسب التصنيف (كوبونات أزياء، كوبونات إلكترونيات، كوبونات عطور) لبناء سلطة موضعية (Topical Authority)."
    ],
    google2026Audit: {
      accuracyScore: 96,
      lastVerifiedDate: "سبتمبر 2026 (Core & Reviews Update)",
      algorithmFocus: "مكافحة صفحات الكوبونات الوهمية وتدقيق الصلاحية الحية (Live Verification)",
      complianceLevel: "دقة ممتازة (93-96%)",
      criteriaBreakdown: {
        eeatScore: 94,
        intentAccuracy: 98,
        sponsoredCompliance: 97,
        antiAiSpamScore: 95
      },
      keyAdvice2026: "يعاقب قوقل في 2026 المواقع التي تنشر أكواد منتهية الصلاحية؛ يتطلب التحديث توفير تاريخ اختبار فعلي ووسم الروابط بـ rel='sponsored'."
    }
  },
  {
    id: "niche-saas-ai-tools",
    name: "برمجيات الـ SaaS وأدوات الذكاء الاصطناعي والتسويق",
    englishName: "B2B SaaS & AI Productivity Tools",
    icon: "Cpu",
    totalMonthlySearchGlobal: "24,000,000+ بحث شهرياً",
    totalMonthlySearchMena: "2,800,000+ بحث شهرياً",
    averageCommission: "20% - 40% عمولة متكررة شهرياً مدى الحياة (Recurring) أو 50$ - 200$ CPA",
    commissionType: "Recurring",
    seoCompetitionLevel: "متوسط",
    suitabilityForMultiBrand: "مثالي جداً",
    overview: "النيش الأكثر تفضيلاً للمسوقين الأذكياء اليوم؛ نظراً لانتشار أدوات الذكاء الاصطناعي التوليدي، برامج إدارة الأعمال، وحملات البريد الإلكتروني. ميزته الخارقة هي الدخل السلبي المتكرر (طالما العميل يدفع اشتراكه الشهري، تستلم عمولتك شهرياً).",
    whyHighDemand: "الشركات ورواد الأعمال وصناع المحتوى يبحثون يومياً عن أحدث أدوات تسهيل العمل والذكاء الاصطناعي، ويبحثون في قوقل عن مقارنات وبدائل مجانية أو أرخص سعراً.",
    topKeywords: [
      {
        keyword: "أفضل أدوات الذكاء الاصطناعي لصناع المحتوى (Best AI Tools)",
        monthlySearchVolumeGlobal: "650,000",
        monthlySearchVolumeMena: "120,000",
        intent: "مقارنة واختيار",
        cpcValue: "$4.20",
        difficulty: "متوسط"
      },
      {
        keyword: "بدائل كانفا / بدائل فوتوشوب (Canva Alternatives)",
        monthlySearchVolumeGlobal: "480,000",
        monthlySearchVolumeMena: "65,000",
        intent: "مقارنة واختيار",
        cpcValue: "$3.50",
        difficulty: "منخفض"
      },
      {
        keyword: "أفضل برامج إدارة المشاريع للفرق (Best Project Management Software)",
        monthlySearchVolumeGlobal: "380,000",
        monthlySearchVolumeMena: "45,000",
        intent: "مقارنة واختيار",
        cpcValue: "$8.50",
        difficulty: "متوسط"
      },
      {
        keyword: "مقارنة أدوات التسويق عبر البريد الإلكتروني (Email Marketing Tools)",
        monthlySearchVolumeGlobal: "290,000",
        monthlySearchVolumeMena: "35,000",
        intent: "مقارنة واختيار",
        cpcValue: "$12.00",
        difficulty: "متوسط"
      },
      {
        keyword: "برامج محاسبة سحابية للشركات الصغيرة (Cloud Accounting Software)",
        monthlySearchVolumeGlobal: "310,000",
        monthlySearchVolumeMena: "55,000",
        intent: "مقارنة واختيار",
        cpcValue: "$9.80",
        difficulty: "متوسط"
      }
    ],
    prominentBrandsAndPrograms: ["Notion", "ClickUp", "Jasper AI", "Canva Pro", "HubSpot", "Shopify", "Klaviyo", "SEMrush"],
    winningSeoTactics: [
      "كتابة صفحات المقارنة الثنائية (Vs Pages) مثل: 'Notion vs ClickUp: أيهما أفضل لفريقك في 2026؟' لأن نية البحث شديدة القرب من الدفع.",
      "إعداد صفحات البدائل (Alternatives Pages) لاستهداف الكلمات التي يترك فيها العملاء برامج غالية للبحث عن خيارات أخرى.",
      "تضمين فيديوهات وصور حصرية من لوحة تحكم البرنامج لإثبات الاستخدام الشخصي المباشر أمام قوقل."
    ],
    google2026Audit: {
      accuracyScore: 98,
      lastVerifiedDate: "سبتمبر 2026 (Helpful Content & Reviews Update)",
      algorithmFocus: "إثبات التجربة الواقعية (First-Hand Experience) ولقطات الشاشة الحية والتسعير الدقيق",
      complianceLevel: "دقة استثنائية (97%+)",
      criteriaBreakdown: {
        eeatScore: 99,
        intentAccuracy: 98,
        sponsoredCompliance: 98,
        antiAiSpamScore: 97
      },
      keyAdvice2026: "تطلب عناكب قوقل في 2026 أدلة ملموسة على استخدام الأداة شخصياً مع جداول إيجابيات وسلبيات غير مكررة والابتعاد عن النصوص المُولدة آلياً بدون اختبار."
    }
  },
  {
    id: "niche-web-hosting-domains",
    name: "استضافة المواقع والسيرفرات وحجز الدومينات",
    englishName: "Web Hosting, Cloud Servers & Domains",
    icon: "Server",
    totalMonthlySearchGlobal: "12,500,000+ بحث شهرياً",
    totalMonthlySearchMena: "1,600,000+ بحث شهرياً",
    averageCommission: "60$ - 150$ لكل تسجيل جديد (أو نسبة تصل إلى 50%)",
    commissionType: "CPA",
    seoCompetitionLevel: "شرس",
    suitabilityForMultiBrand: "ممتاز",
    overview: "نيش كلاسيكي عالي الربحية ومستمر النمو منذ عقود. تدفع شركات الاستضافة عمولات سخية جداً لأن العميل يجدد اشتراكه لسنوات. يعتمد الموقع على استعراض سرعات السيرفرات ومقارنة الأسعار وتقديم كوبونات خصم الاستضافة.",
    whyHighDemand: "آلاف الأشخاص والمتاجر والشركات الجديدة تبدأ مواقعها يومياً، وأول خطوة في رحلتهم هي البحث في جوجل عن 'أفضل استضافة مواقع سريعة ورخيصة'.",
    topKeywords: [
      {
        keyword: "أفضل استضافة مواقع ووردبريس (Best WordPress Hosting)",
        monthlySearchVolumeGlobal: "420,000",
        monthlySearchVolumeMena: "95,000",
        intent: "مقارنة واختيار",
        cpcValue: "$14.50",
        difficulty: "مرتفع"
      },
      {
        keyword: "كود خصم هوستنجر (Hostinger coupon code)",
        monthlySearchVolumeGlobal: "380,000",
        monthlySearchVolumeMena: "110,000",
        intent: "شراء وتخفيض",
        cpcValue: "$3.80",
        difficulty: "متوسط"
      },
      {
        keyword: "مقارنة بين هوستنجر وبلوهوست (Hostinger vs Bluehost)",
        monthlySearchVolumeGlobal: "95,000",
        monthlySearchVolumeMena: "25,000",
        intent: "مقارنة واختيار",
        cpcValue: "$7.20",
        difficulty: "متوسط"
      },
      {
        keyword: "أرخص استضافة مواقع للمبتدئين (Cheap Web Hosting)",
        monthlySearchVolumeGlobal: "290,000",
        monthlySearchVolumeMena: "48,000",
        intent: "شراء وتخفيض",
        cpcValue: "$11.00",
        difficulty: "مرتفع"
      },
      {
        keyword: "أفضل سيرفر سحابي VPS (Best Cloud VPS)",
        monthlySearchVolumeGlobal: "180,000",
        monthlySearchVolumeMena: "32,000",
        intent: "مقارنة واختيار",
        cpcValue: "$9.40",
        difficulty: "متوسط"
      }
    ],
    prominentBrandsAndPrograms: ["Hostinger", "Cloudways", "Bluehost", "Namecheap", "SiteGround", "DigitalOcean", "Contabo"],
    winningSeoTactics: [
      "نشر اختبارات سرعة وتحميل واقعية عبر Pingdom و GTmetrix لإثبات جودة الاختبار.",
      "تقديم هدية إضافية مثل تنصيب مجاني للموقع أو قالب مجاني عند الشراء عبر رابط الإحالة الخاص بك.",
      "استهداف كلمات السيرفرات السحابية المتخصصة (Cloud Hosting, VPS) ذات المنافسة الأقل والعمولات الأكبر."
    ],
    google2026Audit: {
      accuracyScore: 97,
      lastVerifiedDate: "سبتمبر 2026 (Technical Reviews & TTFB Update)",
      algorithmFocus: "قياسات سرعة الاستجابة الحقيقية (Real Benchmark Data) وتوضيح أسعار التجديد",
      complianceLevel: "دقة استثنائية (97%+)",
      criteriaBreakdown: {
        eeatScore: 98,
        intentAccuracy: 97,
        sponsoredCompliance: 96,
        antiAiSpamScore: 97
      },
      keyAdvice2026: "تفرض قوقل لعام 2026 نشر لقطات حقيقية لاختبار سرعة زمن وصول أول بايت (TTFB) وكشف أسعار التجديد بعد السنة الأولى بوضوح تام لتجنب خفض الترتيب."
    }
  },
  {
    id: "niche-personal-finance-cards",
    name: "التمويل الشخصي، البطاقات الائتمانية والاستثمار",
    englishName: "Personal Finance, Credit Cards & Investing",
    icon: "CreditCard",
    totalMonthlySearchGlobal: "19,000,000+ بحث شهرياً",
    totalMonthlySearchMena: "2,400,000+ بحث شهرياً",
    averageCommission: "50$ - 350$ لكل بطاقة معتمدة أو حساب استثماري مفعّل",
    commissionType: "CPA",
    seoCompetitionLevel: "شرس",
    suitabilityForMultiBrand: "ممتاز",
    overview: "أعلى نيش في العالم من حيث قيمة العائد لكل زائر (Earning Per Click). البنوك وشركات الفنتك مستعدة لدفع مئات الدولارات للحصول على عميل موثوق لبطاقة ائتمانية أو محفظة استثمارية.",
    whyHighDemand: "البحث المستمر عن طرق التوفير، الاستثمار في الأسهم والصناديق، والحصول على كاش باك ونقاط طيران مجانية من البطاقات.",
    topKeywords: [
      {
        keyword: "أفضل بطاقة ائتمانية كاش باك (Best Cashback Credit Card)",
        monthlySearchVolumeGlobal: "620,000",
        monthlySearchVolumeMena: "140,000",
        intent: "مقارنة واختيار",
        cpcValue: "$18.00",
        difficulty: "مرتفع"
      },
      {
        keyword: "أفضل منصات الاستثمار وتداول الأسهم (Best Stock Trading Platforms)",
        monthlySearchVolumeGlobal: "550,000",
        monthlySearchVolumeMena: "160,000",
        intent: "مقارنة واختيار",
        cpcValue: "$22.50",
        difficulty: "شرس"
      },
      {
        keyword: "مقارنة بين حسابات التوفير بعائد مرتفع (High Yield Savings)",
        monthlySearchVolumeGlobal: "480,000",
        monthlySearchVolumeMena: "75,000",
        intent: "مقارنة واختيار",
        cpcValue: "$15.00",
        difficulty: "مرتفع"
      },
      {
        keyword: "حاسبة القروض والتمويل العقاري (Mortgage Calculator)",
        monthlySearchVolumeGlobal: "3,200,000",
        monthlySearchVolumeMena: "280,000",
        intent: "بحث تعليمي",
        cpcValue: "$8.00",
        difficulty: "شرس"
      }
    ],
    prominentBrandsAndPrograms: ["بنوك الراجحي والأهلي والإنماء (عبر شبكات تسويق)", "دراية المالية", "سهم (Sahm)", "تمرة المالية (Tamra)", "منصات eToro و Interactive Brokers"],
    winningSeoTactics: [
      "بناء حواسب مالية تفاعلية برمجية على الموقع (مثل: حاسبة كم ستكسب كاش باك سنوياً) لجذب آلاف الروابط الخلفية الطبيعية والزيارات.",
      "الالتزام الصارم بمعايير YMYL وتوضيح شروط المخاطر والتراخيص المعتمدة لضمان بقاء الموقع في قوقل.",
      "كتابة أدلة مقارنة شفافة مع جداول الرسوم والمزايا الحقيقية."
    ],
    google2026Audit: {
      accuracyScore: 99,
      lastVerifiedDate: "سبتمبر 2026 (YMYL & Financial Authority Update)",
      algorithmFocus: "تراخيص الجهات المالية الرسمية، إخلاء المسؤولية الشفاف، وتدقيق نسب الفائدة والرسوم",
      complianceLevel: "دقة استثنائية (97%+)",
      criteriaBreakdown: {
        eeatScore: 99,
        intentAccuracy: 99,
        sponsoredCompliance: 100,
        antiAiSpamScore: 98
      },
      keyAdvice2026: "تطبيق معايير YMYL بأقصى صرامة في 2026: يتوجب ذكر كاتب المقال وصفته الاستشارية وإرفاق أرقام تراخيص الهيئات المالية لكل منصة أو بطاقة بنكية."
    }
  },
  {
    id: "niche-health-wellness-supplements",
    name: "الصحة والمكملات الغذائية والعناية الشخصية",
    englishName: "Health, Fitness, Supplements & Skincare",
    icon: "HeartPulse",
    totalMonthlySearchGlobal: "38,000,000+ بحث شهرياً",
    totalMonthlySearchMena: "6,500,000+ بحث شهرياً",
    averageCommission: "8% - 25% من قيمة الطلب أو 30$ - 70$ CPA",
    commissionType: "CPA",
    seoCompetitionLevel: "مرتفع",
    suitabilityForMultiBrand: "مثالي جداً",
    overview: "نيش ضخم جداً ومستمر النمو على مدار العام، يشمل مكملات كمال الأجسام، الفيتامينات، منتجات العناية بالبشرة الكورية، والأنظمة الغذائية المتخصصة كالكيتو. ترتفع فيه نسبة تكرار الشراء لدى نفس العملاء شهرياً.",
    whyHighDemand: "الوعي الصحي والرياضي المتسارع وازدهار التجارة الإلكترونية عبر صيدليات الإنترنت ومنصات مثل iHerb و MyProtein.",
    topKeywords: [
      {
        keyword: "أفضل مكمل بروتين لبناء العضلات (Best Whey Protein)",
        monthlySearchVolumeGlobal: "510,000",
        monthlySearchVolumeMena: "180,000",
        intent: "مقارنة واختيار",
        cpcValue: "$3.50",
        difficulty: "متوسط"
      },
      {
        keyword: "أفضل فيتامينات للشعر والبشرة مجربة (Best Hair Vitamins)",
        monthlySearchVolumeGlobal: "420,000",
        monthlySearchVolumeMena: "165,000",
        intent: "مقارنة واختيار",
        cpcValue: "$2.90",
        difficulty: "متوسط"
      },
      {
        keyword: "مراجعة وتجربة كولاجين ايهيرب (iHerb Collagen Review)",
        monthlySearchVolumeGlobal: "190,000",
        monthlySearchVolumeMena: "95,000",
        intent: "مراجعة وتجربة",
        cpcValue: "$2.10",
        difficulty: "منخفض"
      },
      {
        keyword: "كود خصم ماي بروتين (MyProtein discount code)",
        monthlySearchVolumeGlobal: "340,000",
        monthlySearchVolumeMena: "80,000",
        intent: "شراء وتخفيض",
        cpcValue: "$1.80",
        difficulty: "متوسط"
      }
    ],
    prominentBrandsAndPrograms: ["iHerb", "MyProtein", "Lookfantastic", "Gymshark", "صيدلية النهدي", "Dr. Nutrition"],
    winningSeoTactics: [
      "مراجعة المكونات العلمية والجرعات بأسلوب مبسط مدعوم بمراجع طبية لتجنب عقوبات YMYL.",
      "تصميم جداول 'أفضل 5 مكملات في كل فئة' مع صور واقعية لعلب المنتجات.",
      "دمج أكواد الخصم الترويجية مباشرة داخل فقرات المراجعة لرفع نسبة التحويل الفوري."
    ],
    google2026Audit: {
      accuracyScore: 95,
      lastVerifiedDate: "سبتمبر 2026 (Health & Medical Consensus Update)",
      algorithmFocus: "الاستناد إلى دراسات سريرية موثوقة وتجنب الادعاءات العلاجية غير المثبتة",
      complianceLevel: "دقة ممتازة (93-96%)",
      criteriaBreakdown: {
        eeatScore: 96,
        intentAccuracy: 95,
        sponsoredCompliance: 96,
        antiAiSpamScore: 93
      },
      keyAdvice2026: "تجنب تماماً الترويج لأي مكمل باعتباره 'علاجاً نهائياً'، وركز على جداول المكونات المعتمدة من هيئة الغذاء والدواء مع إخلاء مسؤولية طبي واضح."
    }
  },
  {
    id: "niche-smart-home-gadgets",
    name: "الأجهزة الإلكترونية والمنزلية الذكية والجوالات",
    englishName: "Consumer Tech, Smart Home & Electronics",
    icon: "Laptop",
    totalMonthlySearchGlobal: "42,000,000+ بحث شهرياً",
    totalMonthlySearchMena: "5,200,000+ بحث شهرياً",
    averageCommission: "2% - 8% (ولكن على أسعار منتجات تتراوح بين 200$ إلى 2,000$)",
    commissionType: "CPS",
    seoCompetitionLevel: "مرتفع",
    suitabilityForMultiBrand: "مثالي جداً",
    overview: "النيش المفضل لنماذج مثل Wirecutter و RTINGS. يشمل مراجعات شاشات التلفزيون، اللابتوبات، المكانس الروبوتية، وأنظمة المنزل الذكي وكاميرات المراقبة. تمتاز الكلمات بنية شرائية بحثية هائلة قبل اتخاذ قرار الدفع.",
    whyHighDemand: "المستهلك لا يشتري لابتوب أو شاشة بقيمة 1,000 دولار إلا بعد قراءة مراجعات متعددة ومقارنة الخيارات في قوقل.",
    topKeywords: [
      {
        keyword: "أفضل لابتوب للدراسة والعمل 2026 (Best Laptop)",
        monthlySearchVolumeGlobal: "890,000",
        monthlySearchVolumeMena: "195,000",
        intent: "مقارنة واختيار",
        cpcValue: "$3.90",
        difficulty: "مرتفع"
      },
      {
        keyword: "أفضل مكنسة روبوت ذكية لغسيل السيراميك (Best Robot Vacuum)",
        monthlySearchVolumeGlobal: "640,000",
        monthlySearchVolumeMena: "110,000",
        intent: "مقارنة واختيار",
        cpcValue: "$4.50",
        difficulty: "متوسط"
      },
      {
        keyword: "مقارنة بين سماعات سوني وآبل (Sony vs Apple Headphones)",
        monthlySearchVolumeGlobal: "380,000",
        monthlySearchVolumeMena: "75,000",
        intent: "مقارنة واختيار",
        cpcValue: "$3.20",
        difficulty: "منخفض"
      },
      {
        keyword: "أفضل شاشات الألعاب بدقة 4K (Best 4K Gaming Monitors)",
        monthlySearchVolumeGlobal: "450,000",
        monthlySearchVolumeMena: "88,000",
        intent: "مقارنة واختيار",
        cpcValue: "$4.10",
        difficulty: "متوسط"
      }
    ],
    prominentBrandsAndPrograms: ["Amazon Associates", "Best Buy", "Noon", "Jarir Bookstore", "Extra Stores", "AliExpress"],
    winningSeoTactics: [
      "توفير روابط لعدة متاجر تحت كل توصية (مثلاً: قارن السعر في أمازون / نون / جرير) لزيادة احتمالية التحويل.",
      "تحديث المقالات فور نزول الموديلات الجديدة مع وسم السنة لضمان الاستحواذ على الكلمات الطازجة.",
      "تحديد خيارات واضحة للمستخدم: (الخيار الأفضل بشكل عام، الخيار الاقتصادي، الخيار الاحترافي)."
    ],
    google2026Audit: {
      accuracyScore: 97,
      lastVerifiedDate: "سبتمبر 2026 (Product Reviews & Multi-Vendor Update)",
      algorithmFocus: "تعدد خيارات الشراء، القياسات الكمية، والمقارنة مع الإصدارات السابقة",
      complianceLevel: "دقة استثنائية (97%+)",
      criteriaBreakdown: {
        eeatScore: 97,
        intentAccuracy: 97,
        sponsoredCompliance: 98,
        antiAiSpamScore: 96
      },
      keyAdvice2026: "تطلب قوقل 2026 روابط مقارنة أسعار لأكثر من متجر مع قياسات كمية حقيقية (مثل عمر البطارية بالدقائق، جودة الصوت بالديسيبل) وليس مجرد نسخ مواصفات الصانع."
    }
  },
  {
    id: "niche-travel-booking-tourism",
    name: "السياحة، حجوزات الفنادق وشرائح السفر eSIM",
    englishName: "Travel, Hotel Bookings & eSIMs",
    icon: "Plane",
    totalMonthlySearchGlobal: "32,000,000+ بحث شهرياً",
    totalMonthlySearchMena: "4,600,000+ بحث شهرياً",
    averageCommission: "4% - 10% من قيمة الحجز الفندقي أو 20% - 30% على شرائح الإنترنت وتأمين السفر",
    commissionType: "CPA",
    seoCompetitionLevel: "مرتفع",
    suitabilityForMultiBrand: "مثالي جداً",
    overview: "نيش ذو شعبية طاغية في دول الخليج والعالم العربي. يدمج الموقع بين تخطيط الرحلات واقتراح الفنادق مع روابط حجز فورية في Booking.com وشرائح الاتصال الدولية مثل Airalo و Holafly.",
    whyHighDemand: "المسافرون يبحثون في جوجل عن أدلة مفصلة قبل أشهر من رحلاتهم، ويحتاجون لتوصيات بأفضل مناطق الإقامة القريبة من الأسواق ومحطات القطار.",
    topKeywords: [
      {
        keyword: "أفضل فنادق إسطنبول المطلة على البسفور (Best Hotels Istanbul)",
        monthlySearchVolumeGlobal: "280,000",
        monthlySearchVolumeMena: "145,000",
        intent: "مقارنة واختيار",
        cpcValue: "$2.80",
        difficulty: "متوسط"
      },
      {
        keyword: "جدول سياحي في لندن لمدة 7 أيام (London 7 Days Itinerary)",
        monthlySearchVolumeGlobal: "190,000",
        monthlySearchVolumeMena: "85,000",
        intent: "بحث تعليمي",
        cpcValue: "$1.90",
        difficulty: "منخفض"
      },
      {
        keyword: "أفضل شريحة إلكترونية للإنترنت في أوروبا (Best eSIM for Europe)",
        monthlySearchVolumeGlobal: "340,000",
        monthlySearchVolumeMena: "78,000",
        intent: "مقارنة واختيار",
        cpcValue: "$3.50",
        difficulty: "منخفض"
      },
      {
        keyword: "كود خصم بوكينج (Booking.com promo code)",
        monthlySearchVolumeGlobal: "1,100,000",
        monthlySearchVolumeMena: "220,000",
        intent: "شراء وتخفيض",
        cpcValue: "$2.10",
        difficulty: "مرتفع"
      }
    ],
    prominentBrandsAndPrograms: ["Booking.com", "Agoda", "Skyscanner", "Airalo", "GetYourGuide", "Viator", "Rentalcars"],
    winningSeoTactics: [
      "تضمين خرائط تفاعلية توضح المسافة بين الفنادق وأهم المعالم السياحية ومحطات النقل.",
      "كتابة أدلة مقارنة لشرائح الـ eSIM مع تفاصيل الباقات والأسعار لأن عمولاتها تصل لـ 20-30% متكررة.",
      "تحديث المقالات بأسعار تذاكر الدخول والمواسم السياحية سنوياً."
    ],
    google2026Audit: {
      accuracyScore: 94,
      lastVerifiedDate: "سبتمبر 2026 (Local Guides & Travel Experience Update)",
      algorithmFocus: "تحديثات الأسعار الموسمية وتغطية المواصلات والخرائط التفاعلية الحية",
      complianceLevel: "دقة ممتازة (93-96%)",
      criteriaBreakdown: {
        eeatScore: 95,
        intentAccuracy: 94,
        sponsoredCompliance: 95,
        antiAiSpamScore: 92
      },
      keyAdvice2026: "يمنح قوقل في 2026 الصدارة للمقالات التي تقدم مسارات سياحية مجربة واقعياً مدعومة بصور حصرية وتفاصيل دقيقة حول شرائح الـ eSIM والمواصلات العامة."
    }
  },
  {
    id: "niche-online-learning-skills",
    name: "التعليم والدورات التدريبية والشهادات المهنية",
    englishName: "Online Learning, Certifications & Courses",
    icon: "GraduationCap",
    totalMonthlySearchGlobal: "16,000,000+ بحث شهرياً",
    totalMonthlySearchMena: "2,100,000+ بحث شهرياً",
    averageCommission: "15% - 45% لكل دورة مسجلة أو اشتراك شهري",
    commissionType: "RevShare",
    seoCompetitionLevel: "منخفض إلى متوسط",
    suitabilityForMultiBrand: "ممتاز",
    overview: "من أكثر النيشات سهولة في الاختراق عبر السيو في المحتوى العربي؛ نظراً لقلة المقارنات الاحترافية العميقة مع تعطش ملايين الشباب لتعلم البرمجة، التسويق، التصميم، وتحصيل شهادات معتمدة مثل Google و PMP.",
    whyHighDemand: "التحول الكبير نحو التعليم الذاتي والحصول على شهادات وظيفية دولية معترف بها عن بعد.",
    topKeywords: [
      {
        keyword: "أفضل دورات تعلم البرمجة للمبتدئين من الصفر (Best Coding Courses)",
        monthlySearchVolumeGlobal: "320,000",
        monthlySearchVolumeMena: "115,000",
        intent: "مقارنة واختيار",
        cpcValue: "$5.40",
        difficulty: "منخفض"
      },
      {
        keyword: "شهادات جوجل المهنية المعترف بها (Google Career Certificates)",
        monthlySearchVolumeGlobal: "280,000",
        monthlySearchVolumeMena: "90,000",
        intent: "بحث تعليمي",
        cpcValue: "$4.20",
        difficulty: "منخفض"
      },
      {
        keyword: "كوبونات وكود خصم يوديمي فعال (Udemy coupons)",
        monthlySearchVolumeGlobal: "950,000",
        monthlySearchVolumeMena: "160,000",
        intent: "شراء وتخفيض",
        cpcValue: "$1.80",
        difficulty: "متوسط"
      },
      {
        keyword: "مقارنة بين كورسيرا ويوديمي (Coursera vs Udemy)",
        monthlySearchVolumeGlobal: "120,000",
        monthlySearchVolumeMena: "42,000",
        intent: "مقارنة واختيار",
        cpcValue: "$3.90",
        difficulty: "منخفض"
      }
    ],
    prominentBrandsAndPrograms: ["Coursera", "Udemy", "edX", "DataCamp", "MasterClass", "Skillshare"],
    winningSeoTactics: [
      "مراجعة مناهج الدورات وتوضيح عدد ساعات التعلم وقيمة الشهادة في سوق العمل.",
      "استهداف الكلمات طويلة الذيل للشهادات المتخصصة (مثل: أفضل كورس PMP بالعربي 2026).",
      "تقديم ملخصات وتجارب واقعية للطلاب الذين أكملوا الدورة."
    ],
    google2026Audit: {
      accuracyScore: 93,
      lastVerifiedDate: "سبتمبر 2026 (Curriculum Value & Course Review System)",
      algorithmFocus: "مراجعة جودة المناهج، المشاريع العملية، وقيمة الاعتماد الوظيفي",
      complianceLevel: "دقة عالية (90-92%)",
      criteriaBreakdown: {
        eeatScore: 94,
        intentAccuracy: 93,
        sponsoredCompliance: 94,
        antiAiSpamScore: 91
      },
      keyAdvice2026: "تطلب خوارزميات 2026 توضيح المخرجات العملية لكل دورة وما إذا كانت توفر شهادة معتمدة فعلياً مع مراجعة مستقلة لآراء الخريجين."
    }
  }
];

export const SEO_PLAYBOOK_STEPS: SeoStep[] = [
  {
    stepNumber: 1,
    title: "هندسة بنية السايلو (Topic Clusters & Silo Structure)",
    subtitle: "تنظيم الموقع هرمياً لإقناع قوقل بالسلطة الموضعية (Topical Authority)",
    details: [
      "إنشاء صفحة رئيسية ركيزة (Pillar Page) لكل فئة كبرى (مثلاً: /coupons/fashion/ أو /reviews/smartphones/).",
      "ربط الصفحات الفرعية بالصفحة الركيزة عبر روابط داخلية محكمة (Contextual Internal Links) مع كلمات مرساة (Anchor Texts) متنوعة.",
      "عزل الفئات بحيث لا تتشتت صفحات التقنية بروابط مع صفحات العطور، مما يقوي فهم خوارزميات جوجل لاختصاص كل فرع في موقعك."
    ],
    googleGuideline: "تفضل خوارزميات جوجل المواقع التي تقدم تغطية شاملة وعميقة لمجال محدد على المواقع العامة العشوائية.",
    proTip: "كل صفحة متجر أو منتج يجب ألا تبعد أكثر من نقرتين (2 clicks) عن الصفحة الرئيسية."
  },
  {
    stepNumber: 2,
    title: "تطبيق معايير EEAT الصارمة لتفادي عقوبة HCU",
    subtitle: "إثبات التجربة الواقعية والمصداقية (Experience, Expertise, Authoritativeness, Trust)",
    details: [
      "إبراز هوية الكاتب أو فريق المراجعة في كل صفحة (صفحة كاتب مفصلة تضم سيرته وخبراته وروابط حساباته المهنية).",
      "التقاط صور أصلية أو شاشات تجربة حية للبرامج والمتاجر بدلاً من الاكتفاء بصور المتاجر الرسمية الجاهزة.",
      "ذكر العيوب ونقاط الضعف بموضوعية تامة؛ خوارزميات Google Product Reviews تخفض تصنيف المواقع التي تمدح كل شيء فقط لجني العمولة."
    ],
    googleGuideline: "تحديثات Google Helpful Content ونظام المراجعات تعاقب المواقع الرقيقة (Thin Content) التي تم إنشاؤها فقط من أجل الروابط التابعة.",
    proTip: "أضف في بداية كل مقال صندوقاً صغيراً بعنوان: 'لماذا يمكنك الوثوق بنا؟ وكيف اختبرنا هذه الخيارات'."
  },
  {
    stepNumber: 3,
    title: "تنسيق الروابط القانوني وفق إرشادات قوقل (Link Attributes)",
    subtitle: "استخدام rel='sponsored' و rel='nofollow' لحماية موقعك من العقوبات اليدوية",
    details: [
      "إلزامية وسم كافة الروابط التابعة بعلامة rel='sponsored' أو rel='nofollow' (أو كلاهما: rel='sponsored nofollow').",
      "إضافة إفصاح صريح (Affiliate Disclosure) في أعلى كل صفحة تحتوي روابط عمولة (مثلاً: 'قد نحصل على عمولة عند الشراء عبر روابطنا دون أي تكلفة إضافية عليك').",
      "توجيه الروابط التابعة عبر تحويل 302 أو مسار محمي مثل (/go/store-name) لترتيب هيكل الموقع وتتبع النقرات بدقة."
    ],
    googleGuideline: "عدم الإفصاح عن الروابط التابعة وعدم وسمها بـ rel='sponsored' يعرض موقعك لعقوبة خوارزمية فورية وتجاهل الروابط الخارجية.",
    proTip: "اجعل الإفصاح واضحاً في الهيدر أو أعلى المقال، وليس مخفياً بخط باهت في أسفل الفوتر."
  },
  {
    stepNumber: 4,
    title: "تحسين معدل النقر والظهور في SERP (Click-Through Rate Optimization)",
    subtitle: "السيطرة على المقتطفات المميزة والنتائج الغنية في الصفحة الأولى",
    details: [
      "تحديث وسم العنوان (Title Tag) بانتظام ليتضمن الشهر الحالي والسنة (مثلاً: [مارس 2026] فعال اليوم ومجرب).",
      "إدراج جداول ملخص سريعة (Quick Summary Tables) في أعلى المقال لتسهيل قراءتها والاستحواذ على المقتطف المميز (Featured Snippet).",
      "إضافة ترميز الأسئلة الشائعة (FAQ Schema) وترميز العروض الترويجية (Discount Offer Schema) لجعل نتيجتك تحتل مساحة بصرية مضاعفة في نتائج البحث."
    ],
    googleGuideline: "المواقع التي تحافظ على معلومات محدثة ومطابقة لتاريخ اليوم تحظى بأولوية زحف متكررة من عناكب Googlebot.",
    proTip: "استخدم زر تفاعلي لنسخ الكود مع فتح المتجر في تبويب جديد تلقائياً؛ هذه الحركة تضاعف نسبة التحويل بنسبة 300%."
  }
];

export const TOP_AFFILIATE_NETWORKS: AffiliateNetwork[] = [
  {
    name: "Admitad",
    region: "العالم العربي والخليج",
    type: "شبكة أفلييت كبرى للمتاجر والتجارة الإلكترونية",
    famousBrands: ["نون", "علي إكسبرس", "شي إن", "نمشي", "سيفورا", "فوغا كلوسيت"],
    payoutMethods: ["تحويل بنكي مباشر", "PayPal", "Payoneer"],
    minimumPayout: "$20",
    cookieDuration: "30 إلى 60 يوماً",
    description: "أقوى شبكة أفلييت تضم مئات المتاجر العاملة في السعودية والإمارات ومصر والشرق الأوسط، وتوفر واجهات API لتحديث الكوبونات آلياً.",
    website: "admitad.com"
  },
  {
    name: "ArabClicks",
    region: "العالم العربي والخليج",
    type: "شبكة متخصصة حصرياً في دول مجلس التعاون الخليجي",
    famousBrands: ["أمازون السعودية والإمارات", "نون", "سيفي", "إتش آند إم", "ممزورلد"],
    payoutMethods: ["تحويل بنكي بالريال والدرهم", "PayPal"],
    minimumPayout: "$50",
    cookieDuration: "تتبع بالكوبون وتتبع بالرابط",
    description: "شبكة عربية رائدة تتيح ميزة التتبع عبر الكوبون الحصري (Coupon-Based Tracking) حتى لو لم يضغط العميل على رابطك.",
    website: "arabclicks.com"
  },
  {
    name: "Impact.com",
    region: "عالمي",
    type: "منصة إدارة الشراكات والبراندات العالمية الكبرى",
    famousBrands: ["Airbnb", "Uber", "Canva", "Shopify", "Adidas", "Hostinger"],
    payoutMethods: ["تحويل بنكي دولي", "ACH", "PayPal"],
    minimumPayout: "$10",
    cookieDuration: "حسب البراند (30 إلى 90 يوماً)",
    description: "أكبر منصة تقنية تعتمد عليها كبرى الشركات العالمية لبرامجها التسويقية الخاصة، تمنحك عقوداً مباشرة مع البراند بدون وسيط.",
    website: "impact.com"
  },
  {
    name: "CJ Affiliate (Commission Junction)",
    region: "عالمي",
    type: "أقدم وأعرق شبكة أفلييت في العالم",
    famousBrands: ["Booking.com", "Priceline", "GoDaddy", "Office Depot", "Barnes & Noble"],
    payoutMethods: ["تحويل بنكي مباشر", "شيك بنكي"],
    minimumPayout: "$50",
    cookieDuration: "30 إلى 45 يوماً",
    description: "شبكة ممتازة لمواقع السفر ومقارنات السلع الاستهلاكية ومواقع التقنية التي تستهدف زوار قوقل عالمياً.",
    website: "cj.com"
  },
  {
    name: "PartnerStack",
    region: "عالمي",
    type: "المنصة الأولى عالمياً لبرمجيات الـ B2B SaaS والـ AI",
    famousBrands: ["Notion", "Webflow", "ClickUp", "Monday.com", "Gorgias", "Miro"],
    payoutMethods: ["Stripe", "PayPal"],
    minimumPayout: "$5",
    cookieDuration: "90 يوماً مع عمولات متكررة شهرياً",
    description: "الوجهة المثالية لبناء موقع مقارنات لبرمجيات الشركات وأدوات الذكاء الاصطناعي مع دفعات شهرية منتظمة.",
    website: "partnerstack.com"
  },
  {
    name: "Amazon Associates",
    region: "مختلط",
    type: "برنامج التسويق بالعمولة لشركة أمازون",
    famousBrands: ["أمازون السعودية", "أمازون الإمارات", "أمازون مصر", "Amazon Global"],
    payoutMethods: ["تحويل بنكي محلي", "بطاقات هدايا أمازون"],
    minimumPayout: "$10",
    cookieDuration: "24 ساعة (مع بقاء 90 يوماً إذا أضاف المنتج للسلة)",
    description: "أسهل برنامج للبدء في مراجعات المنتجات والإلكترونيات ومستلزمات المنزل مع ثقة شراء استثنائية من العملاء.",
    website: "affiliate-program.amazon.com"
  }
];
