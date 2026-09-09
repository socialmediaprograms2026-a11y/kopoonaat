import React, { useEffect } from "react";
import { StoreBrand } from "../types";
import { SAUDI_STORE_BRANDS } from "../data/couponsData";
import { SAUDI_PRODUCTS } from "../data/productsData";
import { updateDocumentSeo } from "../utils/seoHelper";

interface SeoStructuredDataProps {
  brand?: StoreBrand | null;
  activeTab?: string;
}

export const SeoStructuredData: React.FC<SeoStructuredDataProps> = ({ 
  brand, 
  activeTab = "coupons" 
}) => {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const origin = window.location.origin;

    // Determine current page SEO metadata
    if (brand) {
      // --- STORE / BRAND DETAIL PAGE SEO ---
      const topCoupon = brand.coupons[0];
      const discountText = topCoupon ? topCoupon.discount : "خصم إضافي";
      const codeText = topCoupon ? `(${topCoupon.code})` : "";
      
      const pageTitle = brand.seoTitle || `كود خصم ${brand.arabicName} 2026 ${codeText} فعال ومجرب | ${discountText}`;
      const pageDesc = brand.seoDescription || `أقوى كود خصم ${brand.arabicName} 2026 مجرب وشغال 100%. انسخ كود الخصم ${codeText} واستمتع بتوفير ${discountText} على سلة مشترياتك في السعودية مع شحن سريع وتوصيل ميسر.`;
      const canonicalPath = `/brand/${brand.slug || brand.id}`;

      updateDocumentSeo({
        title: pageTitle,
        description: pageDesc,
        canonicalPath,
        ogType: "website",
        keywords: [
          `كود خصم ${brand.arabicName}`,
          `كوبون ${brand.arabicName}`,
          `خصم ${brand.arabicName} 2026`,
          `عروض ${brand.arabicName} السعودية`,
          `قسيمة ${brand.arabicName}`,
          topCoupon?.code ? `كود ${topCoupon.code}` : "",
          "كوبونات السعودية"
        ].filter(Boolean)
      });

      // 1. Breadcrumbs Schema
      const breadcrumbsSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: `${origin}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "كوبونات المتاجر السعودية",
            item: `${origin}/coupons`
          },
          {
            "@type": "ListItem",
            position: 3,
            name: `كود خصم ${brand.arabicName}`,
            item: `${origin}${canonicalPath}`
          }
        ]
      };

      // 2. Store & Offer Catalog Schema
      const storeSchema = {
        "@context": "https://schema.org",
        "@type": "Store",
        "@id": `${origin}${canonicalPath}#store`,
        name: brand.name,
        alternateName: [brand.arabicName, `متجر ${brand.arabicName}`],
        url: `${origin}${canonicalPath}`,
        description: brand.aboutStore || brand.tagline,
        telephone: "+966-800-00000",
        address: {
          "@type": "PostalAddress",
          addressCountry: "SA",
          addressRegion: "Riyadh"
        },
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: (brand.rating || 4.8).toString(),
          reviewCount: (brand.totalReviews || 1250).toString(),
          bestRating: "5",
          worstRating: "1"
        },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `كوبونات وعروض خصم ${brand.arabicName} 2026`,
          itemListElement: brand.coupons.map((c, index) => ({
            "@type": "Offer",
            position: index + 1,
            name: c.title,
            description: c.description,
            price: "0",
            priceCurrency: "SAR",
            availability: "https://schema.org/InStock",
            validThrough: "2026-12-31",
            category: "Coupon",
            itemOffered: {
              "@type": "Service",
              name: `قسيمة خصم ${c.discount} لمتجر ${brand.arabicName}`,
              identifier: c.code
            }
          }))
        }
      };

      // 3. HowTo Schema (Rich Step-by-Step for Google)
      const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        name: `كيفية تفعيل كود خصم ${brand.arabicName} خطوة بخطوة`,
        description: `شرح مبسط لكيفية نسخ واستخدام رمز ترويجي لمتجر ${brand.arabicName} والحصول على أعلى خصم عند الشراء.`,
        totalTime: "PT1M",
        step: [
          {
            "@type": "HowToStep",
            position: 1,
            name: `نسخ كود خصم ${brand.arabicName}`,
            text: `اضغط على زر 'نسخ الكود' لنسخ الرمز الترويجي (${topCoupon?.code || "الكود"}) إلى الحافظة.`,
            url: `${origin}${canonicalPath}`
          },
          {
            "@type": "HowToStep",
            position: 2,
            name: `إضافة المنتجات لسلة التسوق في ${brand.arabicName}`,
            text: `انتقل لمتجر أو تطبيق ${brand.arabicName} وأضف المنتجات المطلوبة إلى سلة الشراء.`,
            url: `${origin}${canonicalPath}`
          },
          {
            "@type": "HowToStep",
            position: 3,
            name: "لصق الكود وتطبيق الخصم",
            text: `في صفحة ملخص الطلب، الصق الكود في خانة 'كود الخصم / رمز القسيمة' واضغط تطبيق للاستفادة من التخفيض فوراً.`,
            url: `${origin}${canonicalPath}`
          }
        ]
      };

      // 4. FAQ Schema
      const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: brand.faqs && brand.faqs.length > 0 ? brand.faqs.map(faq => ({
          "@type": "Question",
          name: faq.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: faq.answer
          }
        })) : [
          {
            "@type": "Question",
            name: `ما هو أقوى كود خصم لمتجر ${brand.arabicName} لعام 2026؟`,
            acceptedAnswer: {
              "@type": "Answer",
              text: `أقوى كود فعال ومجرب حالياً هو (${topCoupon?.code || "PROMO"}) ويمنحك ${discountText} على إجمالي الطلب.`
            }
          }
        ]
      };

      injectSchemas([breadcrumbsSchema, storeSchema, howToSchema, faqSchema]);

    } else if (activeTab === "products") {
      // --- ALL PRODUCTS / DEALS DIRECTORY SEO ---
      updateDocumentSeo({
        title: "أفضل عروض وتخفيضات المنتجات في السعودية 2026 | صفقات حصرية يومية",
        description: "تصفح أحدث صفقات وتخفيضات الأجهزة الذكية، العطور، الأزياء، والمستلزمات بأقوى الأسعار ونسب خصم تصل حتى 70% في السعودية مع كوبونات إضافية.",
        canonicalPath: "/products",
        ogType: "website",
        keywords: [
          "عروض وتخفيضات المنتجات السعودية",
          "صفقات حصرية",
          "أرخص أسعار الجوالات",
          "عروض عطور",
          "تخفيضات نون وأمازون",
          "شراء أونلاين السعودية"
        ]
      });

      const breadcrumbsSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: `${origin}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "عروض وصفقات المنتجات",
            item: `${origin}/products`
          }
        ]
      };

      const productListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "كتالوج عروض المنتجات المخفضة في السعودية",
        itemListElement: SAUDI_PRODUCTS.slice(0, 15).map((p, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: p.arabicName || p.name,
          url: `${origin}/products`
        }))
      };

      injectSchemas([breadcrumbsSchema, productListSchema]);

    } else if (activeTab === "competitors") {
      // --- COMPETITOR MONITOR SEO ---
      updateDocumentSeo({
        title: "أداة مراقبة واستخبارات المنافسين في التسويق بالعمولة | سيو قوقل",
        description: "حلل استراتيجيات المنافسين، واكشف شبكات وروابط الأفلييت التابعة، ونقاط القوة والضعف وتصدر نتائج محرك بحث قوقل بخطة استهداف مضادة وذكية.",
        canonicalPath: "/competitors",
        ogType: "website"
      });

      const breadcrumbsSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: `${origin}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "مراقبة المنافسين",
            item: `${origin}/competitors`
          }
        ]
      };

      injectSchemas([breadcrumbsSchema]);

    } else if (activeTab === "models") {
      // --- SUCCESSFUL MODELS SEO ---
      updateDocumentSeo({
        title: "أفضل نماذج مواقع التسويق بالعمولة الناجحة وسيو قوقل 2026",
        description: "استعرض وحلل أنجح نماذج مواقع الكوبونات ومراجعات المنتجات والمقارنات الأكثر تحقيقاً للأرباح وتصدراً في محرك بحث Google.",
        canonicalPath: "/models",
        ogType: "website"
      });

      const breadcrumbsSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: `${origin}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "أفضل النماذج الناجحة",
            item: `${origin}/models`
          }
        ]
      };

      injectSchemas([breadcrumbsSchema]);

    } else if (activeTab === "niches") {
      // --- NICHES & SEARCH VOLUMES SEO ---
      updateDocumentSeo({
        title: "دليل استخبارات النيشات وأحجام البحث في السعودية والخليج 2026",
        description: "بيانات حقيقية لأحجام البحث الشهرية، والمنافسة، ونسب العمولات والربحية لأهم النيشات التجارية في السوق السعودي.",
        canonicalPath: "/niches",
        ogType: "website"
      });

      const breadcrumbsSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "الرئيسية",
            item: `${origin}/`
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "النيشات وأحجام البحث",
            item: `${origin}/niches`
          }
        ]
      };

      injectSchemas([breadcrumbsSchema]);

    } else {
      // --- HOMEPAGE / GENERAL COUPONS DIRECTORY SEO ---
      updateDocumentSeo({
        title: "كوبونات وعروض المتاجر السعودية 2026 | أحدث أكواد الخصم الحصرية",
        description: "أقوى كوبونات وأكواد خصم المتاجر الإلكترونية في السعودية لعام 2026 (نون، أمازون، نمشي، شي إن، نايس ون، آي هيرب، ستايلي). خصومات حقيقية وفورية مجربة 100%.",
        canonicalPath: "/",
        ogType: "website",
        keywords: [
          "كود خصم نون",
          "كوبون امازون",
          "كود خصم نمشي",
          "كود خصم شي ان",
          "كود خصم نايس ون",
          "كود خصم اي هيرب",
          "تخفيضات السعودية 2026",
          "عروض المتاجر الإلكترونية",
          "أكواد خصم مجربة"
        ]
      });

      // 1. WebSite Schema with Sitelinks Searchbox
      const websiteSchema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: "دليل كوبونات وعروض المتاجر السعودية 2026",
        alternateName: ["أكواد خصم السعودية", "Affiliate Coupons Radar"],
        url: `${origin}/`,
        inLanguage: "ar-SA",
        description: "منصة أكواد وكوبونات خصم حقيقية ومحدثة يومياً للمتاجر الإلكترونية في السعودية والخليج.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${origin}/?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        }
      };

      // 2. Organization Schema
      const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: "دليل استخبارات التسويق بالعمولة وسيو قوقل",
        url: `${origin}/`,
        logo: `${origin}/favicon.svg`,
        sameAs: [
          "https://twitter.com",
          "https://facebook.com"
        ],
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          availableLanguage: ["Arabic", "English"],
          areaServed: ["SA", "AE", "KW", "BH", "QA", "OM", "EG"]
        }
      };

      // 3. ItemList Schema for Featured Stores
      const storesItemListSchema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "أفضل كوبونات المتاجر المعتمدة في السعودية",
        description: "قائمة بأشهر المتاجر الإلكترونية وأكواد الخصم المفعلة 100%",
        itemListElement: SAUDI_STORE_BRANDS.slice(0, 10).map((b, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: `كود خصم ${b.arabicName}`,
          url: `${origin}/brand/${b.slug || b.id}`
        }))
      };

      // 4. FAQ Schema for Home Rich Snippets
      const homeFaqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
          {
            "@type": "Question",
            name: "كيف أستخدم كود الخصم للحصول على أعلى توفير؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "اختر متجرك المفضل من القائمة، واضغط على زر 'نسخ الكود' لنسخ الرمز الترويجي تلقائياً والتوجه لصفحة المتجر، ثم الصق الكود في صفحة الدفع قبل إتمام الشراء."
            }
          },
          {
            "@type": "Question",
            name: "هل جميع أكواد الخصم والكوبونات على الموقع مجانية ومجربة؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "نعم، جميع الأكواد مجانية تماماً وبدون أي اشتراك أو رسوم، ويتم فحص فعاليتها يومياً للتأكد من أنها توفر الخصم الفعلي المعلن للمتسوقين في السعودية."
            }
          },
          {
            "@type": "Question",
            name: "ما هي أشهر المتاجر المتاحة في دليل الكوبونات؟",
            acceptedAnswer: {
              "@type": "Answer",
              text: "يضم الدليل أشهر المتاجر الرائدة مثل نون (Noon)، أمازون السعودية (Amazon SA)، نمشي (Namshi)، شي إن (SHEIN)، نايس ون (Nice One)، آي هيرب (iHerb)، جرير، وستايلي."
            }
          }
        ]
      };

      injectSchemas([websiteSchema, organizationSchema, storesItemListSchema, homeFaqSchema]);
    }

  }, [brand, activeTab]);

  return null;
};

function injectSchemas(schemas: any[]) {
  if (typeof document === "undefined") return;
  const scriptId = "seo-json-ld-script";
  let scriptTag = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!scriptTag) {
    scriptTag = document.createElement("script");
    scriptTag.id = scriptId;
    scriptTag.type = "application/ld+json";
    document.head.appendChild(scriptTag);
  }
  scriptTag.text = JSON.stringify({
    "@context": "https://schema.org",
    "@graph": schemas
  });
}
