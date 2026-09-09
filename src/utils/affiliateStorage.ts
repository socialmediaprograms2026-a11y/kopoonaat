import { StoreBrand } from "../types";

export interface StoreAffiliateOverride {
  affiliateUrl?: string;
  primaryCode?: string;
  primaryDiscount?: string;
  notes?: string;
}

export interface AffiliateSettings {
  publisherName: string;
  amazonTag: string; // e.g. "mypartner-21"
  globalTrackingParam: string; // e.g. "utm_source=mydealshub&utm_medium=affiliate"
  storeOverrides: Record<string, StoreAffiliateOverride>;
  lastUpdated?: string;
  payoutMethod?: "gift_card" | "digital_wallet" | "paypal" | "crypto" | "bank";
  payoutAccountIdentifier?: string;
  payoutWalletNetwork?: string; // e.g. "BEP20 (BSC)" | "ERC20" | "TRC20"
  payoutWalletExchange?: string; // e.g. "Binance"
  universalMasterCode?: string;
}

const STORAGE_KEY = "saudi_affiliate_custom_settings_v1";

export const USER_CONFIGURED_BINANCE_WALLET = "0xddeae422ae06b08122d4f44510a7b99410ac3d19";

export const DEFAULT_AFFILIATE_SETTINGS: AffiliateSettings = {
  publisherName: "",
  amazonTag: "",
  globalTrackingParam: "",
  payoutMethod: "crypto",
  payoutAccountIdentifier: USER_CONFIGURED_BINANCE_WALLET,
  payoutWalletNetwork: "BEP20 (BNB Smart Chain) / ERC20",
  payoutWalletExchange: "Binance (بينانس)",
  universalMasterCode: "",
  storeOverrides: {
    "noon-sa": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "شبكة نون بارتنرز أو عرب كليكس (كود خصم نون يمنحك 10% عمولة)"
    },
    "amazon-sa": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "برنامج أمازون أسوشيتس السعودية (Amazon Associates KSA) - أدخل Associate Tag"
    },
    "namshi": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "شبكة عرب كليكس أو ديسيم نتورك"
    },
    "niceone": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "شبكة أوبتمايز أو عرب كليكس لمتجر نايس ون"
    },
    "iherb": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "برنامج مكافآت آي هيرب (iHerb Rewards) - كود مكافآت يمنحك 5%-10% كاش باك"
    },
    "styli": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "شبكة عرب كليكس أو ديسيم نتورك لمتجر ستايلي"
    },
    "shein": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "برنامج شي إن الرسمي أو شبكات الأفلييت العالمية"
    },
    "hungerstation": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "عرب كليكس أو نتوورك الخليج"
    },
    "jarir": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "شبكات CPA الخليجية لمكتبة جرير"
    },
    "golden-scent": {
      affiliateUrl: "",
      primaryCode: "",
      notes: "عرب كليكس أو ديسيم لقولدن سنت"
    },
    "linkaraby-portal": {
      affiliateUrl: "https://www.linkaraby.com/scripts/2xch8l8dq0?a_aid=gx333hkq2rph5",
      primaryCode: "",
      notes: "رابط الإحالة المباشر لشبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "bshti-store": {
      affiliateUrl: "https://bshti.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
      primaryCode: "BSH10",
      notes: "متجر بشتي عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "maysan-it-store": {
      affiliateUrl: "https://maysan-it.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
      primaryCode: "MAY20",
      notes: "ميسان لتقنية المعلومات عبر لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "the-right-way-store": {
      affiliateUrl: "https://the-right-way-sa.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
      primaryCode: "WAY15",
      notes: "متجر الطريق الصحيح عبر لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "kagad441-store": {
      affiliateUrl: "https://kagad441.com/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
      primaryCode: "KGD10",
      notes: "متجر كجد 441 عبر لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "rahma-store": {
      affiliateUrl: "https://rahma.store/?utm_source=linkaraby&utm_medium=referral&a_aid=gx333hkq2rph5",
      primaryCode: "RH15",
      notes: "متجر رحمة للعطور والتجميل عبر لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "saada-sa": {
      affiliateUrl: "https://saada.sa/products/p1346874801?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "SAADA25",
      notes: "صدى المستقبل عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "eyen-sa": {
      affiliateUrl: "https://eyen.sa/lens-me-soluation/p1339667227?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "EYEN50",
      notes: "عين للبصريات عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "boygirlhope-sa": {
      affiliateUrl: "https://boygirlhope-gender.com/products/%D9%85%D9%83%D9%85%D9%84-%D8%BA%D8%B0%D8%A7%D8%A6%D9%8A-%D9%84%D9%84%D8%AD%D9%85%D9%84-%D8%A8%D8%AA%D9%88%D8%A3%D9%85-twinzo/p1102928509?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "TWINZO30",
      notes: "بوي قيرل هوب عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "sukon-sa": {
      affiliateUrl: "https://sukon.sa/products/p252984006?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "SUKON30",
      notes: "سكون عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "tricycle-sa": {
      affiliateUrl: "https://tricycle.sa/products/%D9%85%D8%AC%D9%85%D9%88%D8%B9%D8%A9-%D9%85%D8%AD%D8%A7%D8%B5%D9%8A%D9%84-%D8%A7%D9%84%D8%AA%D9%82%D8%B7%D9%8A%D8%B1-%D8%A7%D9%84%D9%85%D9%85%D9%8A%D8%B2%D8%A9/p693392461?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "TRICYCLE26",
      notes: "محمصة ترايسكل عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "wadihalfa-sa": {
      affiliateUrl: "https://wadihalfa.sa/%D8%A8%D9%88%D9%83%D8%B3-%D9%81%D8%AD%D9%85-%D9%88%D8%A7%D8%AF%D9%8A-%D8%AD%D9%84%D9%81%D8%A7-%D8%B0%D9%87%D8%A8%D9%8A-%D9%85%D8%B1%D8%A8%D8%B9-80-%D9%82%D8%B1%D8%B5-%D9%85%D8%B9-%D9%85%D9%84%D9%82%D8%A7%D8%B7/p1623869923?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "WADI22",
      notes: "وادي حلفا عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "ksabeauty-sa": {
      affiliateUrl: "https://ksabeautycorner.com/products/%D9%83%D8%B1%D9%8A%D9%85-%D8%A7%D9%84%D9%84%D8%A4%D9%84%D8%A4-%D8%A7%D9%84%D8%B7%D8%A8%D9%8A%D8%B9%D9%8A-%D9%84%D8%AA%D9%81%D8%AA%D9%8A%D8%AD-%D8%A7%D9%84%D8%A8%D8%B4%D8%B1%D8%A9-30-%D8%AC%D8%B1%D8%A7%D9%85/p1216521996?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "PEARL32",
      notes: "ركن الجمال عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "castle-shemagh-sa": {
      affiliateUrl: "https://castle-shemagh.com/products/ar-%D8%B4%D9%85%D8%A7%D8%BA-%D9%83%D8%A7%D8%B3%D8%AA%D9%84-%D9%83%D9%84%D8%A7%D8%B3%D9%8A%D9%83-%D8%A3%D8%AD%D9%85%D8%B1-%D8%AF%D9%85-%D8%A7%D9%84%D8%BA%D8%B2%D8%A7%D9%84/p797825590?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "CASTLE23",
      notes: "شماغ كاستل عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "ashqer-sa": {
      affiliateUrl: "https://ashqerstore.com/products/p861364541?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "ASHQER27",
      notes: "تمور أشقر عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    },
    "bravocenters-sa": {
      affiliateUrl: "https://bravocenters.com/%D8%B2%D8%AC%D8%A7%D8%AC%D8%A9-%D8%AA%D8%AD%D9%81%D9%8A%D8%B2%D9%8A%D8%A9-%D9%84%D9%84%D8%B4%D8%B1%D8%A8/p827560598?a_aid=gx333hkq2rph5&utm_source=linkaraby",
      primaryCode: "BRAVO29",
      notes: "مراكز برافو عبر شبكة لينك عربي (a_aid=gx333hkq2rph5)"
    }
  }
};

export function getSavedAffiliateSettings(): AffiliateSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AFFILIATE_SETTINGS;
    const parsed = JSON.parse(raw) as AffiliateSettings;
    return {
      ...DEFAULT_AFFILIATE_SETTINGS,
      ...parsed,
      payoutMethod: parsed.payoutMethod || DEFAULT_AFFILIATE_SETTINGS.payoutMethod,
      payoutAccountIdentifier: parsed.payoutAccountIdentifier || DEFAULT_AFFILIATE_SETTINGS.payoutAccountIdentifier,
      payoutWalletNetwork: parsed.payoutWalletNetwork || DEFAULT_AFFILIATE_SETTINGS.payoutWalletNetwork,
      payoutWalletExchange: parsed.payoutWalletExchange || DEFAULT_AFFILIATE_SETTINGS.payoutWalletExchange,
      storeOverrides: {
        ...DEFAULT_AFFILIATE_SETTINGS.storeOverrides,
        ...(parsed.storeOverrides || {})
      }
    };
  } catch (e) {
    console.error("Failed to read affiliate settings from localStorage", e);
    return DEFAULT_AFFILIATE_SETTINGS;
  }
}

export function saveAffiliateSettings(settings: AffiliateSettings): void {
  try {
    const toSave: AffiliateSettings = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  } catch (e) {
    console.error("Failed to save affiliate settings to localStorage", e);
  }
}

export function applyAffiliateOverrides(
  brands: StoreBrand[],
  settings: AffiliateSettings
): StoreBrand[] {
  return brands.map((brand) => {
    const override = settings.storeOverrides[brand.id];
    let newAffiliateUrl = brand.affiliateUrl;

    // Special logic for Amazon if associate tag is present
    if (brand.id === "amazon-sa" && settings.amazonTag.trim()) {
      const tag = settings.amazonTag.trim();
      const base = "https://www.amazon.sa/?tag=" + encodeURIComponent(tag);
      newAffiliateUrl = base;
    }

    // Direct store URL override if provided
    if (override?.affiliateUrl && override.affiliateUrl.trim()) {
      newAffiliateUrl = override.affiliateUrl.trim();
    } else if (settings.globalTrackingParam.trim() && !newAffiliateUrl.includes(settings.globalTrackingParam.trim())) {
      // Append global tracking parameter if exists
      const sep = newAffiliateUrl.includes("?") ? "&" : "?";
      newAffiliateUrl = `${newAffiliateUrl}${sep}${settings.globalTrackingParam.trim()}`;
    }

    // Update coupons if primary code is provided
    let updatedCoupons = [...brand.coupons];
    if (override?.primaryCode && override.primaryCode.trim()) {
      const customCode = override.primaryCode.trim().toUpperCase();
      updatedCoupons = updatedCoupons.map((coupon, idx) => {
        if (idx === 0) {
          return {
            ...coupon,
            code: customCode,
            affiliateUrl: newAffiliateUrl,
            isExclusive: true,
            badge: "كودك الحصري المباشر 🌟"
          };
        }
        return {
          ...coupon,
          affiliateUrl: newAffiliateUrl
        };
      });
    } else {
      updatedCoupons = updatedCoupons.map((c) => ({
        ...c,
        affiliateUrl: newAffiliateUrl
      }));
    }

    return {
      ...brand,
      affiliateUrl: newAffiliateUrl,
      coupons: updatedCoupons
    };
  });
}

export function countConfiguredOverrides(settings: AffiliateSettings): number {
  let count = 0;
  if (settings.amazonTag.trim()) count++;
  Object.values(settings.storeOverrides).forEach((o) => {
    if ((o.affiliateUrl && o.affiliateUrl.trim()) || (o.primaryCode && o.primaryCode.trim())) {
      count++;
    }
  });
  return count;
}

export interface BrandAffiliateStatus {
  isCustomized: boolean;
  isCustomUrl: boolean;
  isCustomCode: boolean;
  isAmazonTag: boolean;
  isGlobalParam: boolean;
  customUrl?: string;
  customCode?: string;
  sourceLabel: "custom" | "original";
  badgeText: string;
  badgeDetail: string;
}

export function getBrandAffiliateStatus(
  brandId: string,
  settings: AffiliateSettings
): BrandAffiliateStatus {
  const override = settings.storeOverrides[brandId];
  const isAmazonTag = brandId === "amazon-sa" && Boolean(settings.amazonTag && settings.amazonTag.trim());
  const hasDirectUrl = Boolean(override?.affiliateUrl && override.affiliateUrl.trim());
  const isCustomUrl = hasDirectUrl || isAmazonTag;
  const isCustomCode = Boolean(override?.primaryCode && override.primaryCode.trim());
  const isGlobalParam = Boolean(settings.globalTrackingParam && settings.globalTrackingParam.trim()) && !hasDirectUrl;

  const isCustomized = isCustomUrl || isCustomCode || isGlobalParam;

  let badgeText = "رابط المتجر الأصلي";
  let badgeDetail = "الرابط الافتراضي للمتجر";

  if (isAmazonTag) {
    badgeText = "رابط أرباح مخصص (أمازون أسوشيتس)";
    badgeDetail = `معرّف التتبع: ${settings.amazonTag.trim()}`;
  } else if (hasDirectUrl) {
    badgeText = "رابط أرباح مخصص (شبكتك)";
    badgeDetail = "يتم التوجيه عبر رابط التتبع الخاص بك";
  } else if (isGlobalParam) {
    badgeText = "معامل تتبع مخصص (Global UTM)";
    badgeDetail = `معامل: ${settings.globalTrackingParam.trim()}`;
  }

  return {
    isCustomized,
    isCustomUrl,
    isCustomCode,
    isAmazonTag,
    isGlobalParam,
    customUrl: isAmazonTag ? `https://www.amazon.sa/?tag=${settings.amazonTag.trim()}` : override?.affiliateUrl?.trim(),
    customCode: override?.primaryCode?.trim(),
    sourceLabel: isCustomized ? "custom" : "original",
    badgeText,
    badgeDetail,
  };
}

export function autoApplyMasterCodeToAllStores(
  settings: AffiliateSettings,
  brands: StoreBrand[],
  masterCode: string
): AffiliateSettings {
  const updatedOverrides = { ...settings.storeOverrides };
  const cleanCode = masterCode.trim().toUpperCase();

  brands.forEach(brand => {
    updatedOverrides[brand.id] = {
      ...(updatedOverrides[brand.id] || {}),
      primaryCode: cleanCode,
      notes: `تم التفعيل التلقائي بالمعرف الموحد: ${cleanCode}`
    };
  });

  return {
    ...settings,
    universalMasterCode: cleanCode,
    storeOverrides: updatedOverrides,
    lastUpdated: new Date().toISOString()
  };
}

