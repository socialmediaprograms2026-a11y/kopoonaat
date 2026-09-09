import React, { useState, useMemo, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { TopNotificationToast } from "./components/TopNotificationToast";
import { HeroSection } from "./components/HeroSection";
import { ModelsDirectory } from "./components/ModelsDirectory";
import { NichesRankings } from "./components/NichesRankings";
import { SeoPlaybook } from "./components/SeoPlaybook";
import { RoiCalculator } from "./components/RoiCalculator";
import { AffiliateNetworksGuide } from "./components/AffiliateNetworksGuide";
import { AiNicheAnalyzer } from "./components/AiNicheAnalyzer";
import { CouponsHome } from "./components/CouponsHome";
import { BrandDetailPage } from "./components/BrandDetailPage";
import { CouponModal } from "./components/CouponModal";
import { SeoStructuredData } from "./components/SeoStructuredData";
import { AffiliateSetupModal } from "./components/AffiliateSetupModal";
import { AdminDashboard } from "./components/AdminDashboard";
import { SmartSearchModal } from "./components/SmartSearchModal";
import { AllProductsPage } from "./components/AllProductsPage";
import { CompetitorMonitor } from "./components/CompetitorMonitor";
import { SAUDI_STORE_BRANDS } from "./data/couponsData";
import { 
  getSavedAffiliateSettings, 
  applyAffiliateOverrides, 
  countConfiguredOverrides,
  AffiliateSettings 
} from "./utils/affiliateStorage";
import { StoreBrand, CouponItem } from "./types";
import { 
  Compass, 
  TrendingUp, 
  ShieldCheck, 
  Calculator, 
  Cpu, 
  Sparkles, 
  ArrowUp,
  Tag,
  ShoppingBag,
  DollarSign,
  Target
} from "lucide-react";

function parseCurrentUrl(): { tab: string; brandId: string | null } {
  if (typeof window === "undefined") return { tab: "coupons", brandId: null };

  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // 1. Brand route: /brand/:slug or /#brand/:slug
  const brandPathMatch = pathname.match(/^\/brand\/([a-z0-9_-]+)/i);
  const brandHashMatch = hash.match(/^#brand\/([a-z0-9_-]+)/i);
  const brandSlug = brandPathMatch ? brandPathMatch[1] : (brandHashMatch ? brandHashMatch[1] : null);

  if (brandSlug) {
    const found = SAUDI_STORE_BRANDS.find(
      (b) => b.slug.toLowerCase() === brandSlug || b.id.toLowerCase() === brandSlug
    );
    if (found) {
      return { tab: "coupons", brandId: found.id };
    }
  }

  // 2. Tab routes
  if (pathname.startsWith("/admin") || hash.includes("admin")) return { tab: "admin", brandId: null };
  if (pathname.startsWith("/products") || hash.includes("products")) return { tab: "products", brandId: null };
  if (pathname.startsWith("/competitors") || hash.includes("competitors")) return { tab: "competitors", brandId: null };
  if (pathname.startsWith("/models") || hash.includes("models")) return { tab: "models", brandId: null };
  if (pathname.startsWith("/niches") || hash.includes("niches")) return { tab: "niches", brandId: null };
  if (pathname.startsWith("/coupons") || hash.includes("coupons")) return { tab: "coupons", brandId: null };

  return { tab: "coupons", brandId: null };
}

export default function App() {
  const initialUrl = useMemo(() => parseCurrentUrl(), []);
  const [activeTab, setActiveTab] = useState<string>(initialUrl.tab);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(initialUrl.brandId);
  const [modalCoupon, setModalCoupon] = useState<{ coupon: CouponItem; brand: StoreBrand } | null>(null);
  const [isCouponModalOpen, setIsCouponModalOpen] = useState<boolean>(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);
  const [isAffiliateModalOpen, setIsAffiliateModalOpen] = useState<boolean>(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [searchInitialQuery, setSearchInitialQuery] = useState<string>("");
  const [aiInitialQuery, setAiInitialQuery] = useState<string>("");
  const [isToastDismissed, setIsToastDismissed] = useState<boolean>(false);

  // Synchronize browser URL history (Back/Forward navigation support)
  useEffect(() => {
    const handleLocationChange = () => {
      const parsed = parseCurrentUrl();
      setActiveTab(parsed.tab);
      setSelectedBrandId(parsed.brandId);
    };

    window.addEventListener("popstate", handleLocationChange);
    window.addEventListener("hashchange", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
      window.removeEventListener("hashchange", handleLocationChange);
    };
  }, []);

  // Global Keyboard Shortcut (Ctrl+K or Cmd+K) for Smart Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Affiliate Monetization Settings State (Synchronized with localStorage)
  const [affiliateSettings, setAffiliateSettings] = useState<AffiliateSettings>(() => getSavedAffiliateSettings());

  // Dynamic Brands list with user's customized codes and tracking links applied
  const activeBrands = useMemo(() => {
    return applyAffiliateOverrides(SAUDI_STORE_BRANDS, affiliateSettings);
  }, [affiliateSettings]);

  const configuredAffiliateCount = useMemo(() => {
    return countConfiguredOverrides(affiliateSettings);
  }, [affiliateSettings]);

  const selectedBrand = useMemo(() => {
    if (!selectedBrandId) return null;
    return activeBrands.find(b => b.id === selectedBrandId) || null;
  }, [selectedBrandId, activeBrands]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleOpenAiWithPrompt = (promptText: string) => {
    setAiInitialQuery(promptText);
    setIsAiModalOpen(true);
  };

  const handleOpenCouponModal = (coupon: CouponItem, brand: StoreBrand) => {
    setModalCoupon({ coupon, brand });
    setIsCouponModalOpen(true);
  };

  const handleSelectBrand = (brand: StoreBrand) => {
    setSelectedBrandId(brand.id);
    setActiveTab("coupons");
    const targetUrl = `/brand/${brand.slug || brand.id}`;
    if (typeof window !== "undefined" && window.location.pathname !== targetUrl) {
      window.history.pushState(null, "", targetUrl);
    }
    scrollToTop();
  };

  const handleBackToAllBrands = () => {
    setSelectedBrandId(null);
    const targetUrl = "/coupons";
    if (typeof window !== "undefined" && window.location.pathname !== targetUrl && window.location.pathname !== "/") {
      window.history.pushState(null, "", targetUrl);
    }
    scrollToTop();
  };

  const handleNavigateTab = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "coupons") {
      setSelectedBrandId(null);
    }
    const pathMap: Record<string, string> = {
      coupons: "/coupons",
      products: "/products",
      competitors: "/competitors",
      models: "/models",
      niches: "/niches",
      admin: "/admin"
    };
    const targetPath = pathMap[tab] || "/";
    if (typeof window !== "undefined" && window.location.pathname !== targetPath) {
      window.history.pushState(null, "", targetPath);
    }
    scrollToTop();
  };

  const handleOpenSearchModal = (initialQuery: string = "") => {
    setSearchInitialQuery(initialQuery);
    setIsSearchModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-['Cairo',sans-serif] selection:bg-emerald-500/20 selection:text-emerald-900">
      
      {/* Dynamic SEO Structured Schema for Google Indexing */}
      <SeoStructuredData brand={selectedBrand} activeTab={activeTab} />

      {/* Top Notification Toast Banner */}
      <TopNotificationToast
        isDismissed={isToastDismissed}
        onDismiss={() => setIsToastDismissed(true)}
        onRestore={() => setIsToastDismissed(false)}
        onNavigateTab={handleNavigateTab}
        onOpenAiModalWithPrompt={handleOpenAiWithPrompt}
      />

      {/* Top Navbar with Smart Search Trigger */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateTab}
        onOpenAiModal={() => {
          setAiInitialQuery("");
          setIsAiModalOpen(true);
        }}
        onOpenSearchModal={handleOpenSearchModal}
        onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
        configuredAffiliateCount={configuredAffiliateCount}
        isToastDismissed={isToastDismissed}
        onToggleToast={() => setIsToastDismissed(!isToastDismissed)}
      />

      {/* Hero Banner Section (Shown on research and models tabs) */}
      {activeTab !== "coupons" && (
        <HeroSection
          onExploreModels={() => handleNavigateTab("models")}
          onExploreNiches={() => handleNavigateTab("niches")}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onOpenSearchModal={handleOpenSearchModal}
        />
      )}

      {/* Main Content Area based on Tab */}
      <main className="flex-1">
        {activeTab === "coupons" && (
          selectedBrand ? (
            <BrandDetailPage
              brand={selectedBrand}
              onBack={handleBackToAllBrands}
              onSelectCouponForModal={handleOpenCouponModal}
              affiliateSettings={affiliateSettings}
              onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
              onSelectBrand={handleSelectBrand}
              allBrands={activeBrands}
            />
          ) : (
            <CouponsHome
              onSelectBrand={handleSelectBrand}
              onOpenCouponModal={handleOpenCouponModal}
              brands={activeBrands}
              onOpenAffiliateModal={() => setIsAffiliateModalOpen(true)}
              configuredAffiliateCount={configuredAffiliateCount}
              onNavigateToProducts={() => handleNavigateTab("products")}
            />
          )
        )}

        {activeTab === "products" && (
          <AllProductsPage
            onSelectBrand={handleSelectBrand}
            brands={activeBrands}
          />
        )}

        {activeTab === "competitors" && <CompetitorMonitor />}
        {activeTab === "admin" && <AdminDashboard />}
        {activeTab === "models" && <ModelsDirectory />}
        {activeTab === "niches" && (
          <NichesRankings 
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              scrollToTop();
            }}
            onOpenAiWithPrompt={handleOpenAiWithPrompt}
          />
        )}
        {activeTab === "seo-playbook" && <SeoPlaybook />}
        {activeTab === "calculator" && <RoiCalculator />}
        {activeTab === "networks" && <AffiliateNetworksGuide />}
      </main>

      {/* Floating Bottom Navigation Bar for rapid switching */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-slate-200/90 p-1.5 rounded-full shadow-2xl flex items-center gap-1">
        <button
          onClick={() => {
            setActiveTab("coupons");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "coupons" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Tag className="w-3.5 h-3.5" />
          <span>كوبونات المتاجر 🇸🇦</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("products");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "products" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>العروض والمنتجات 🔥</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("competitors");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "competitors" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Target className="w-3.5 h-3.5" />
          <span>مراقبة المنافسين 🎯</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("admin");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "admin" ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>لوحة الإدارة (Admin)</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("models");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "models" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>النماذج</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("niches");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "niches" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">النيشات والبحث</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("seo-playbook");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "seo-playbook" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">سيو قوقل</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("calculator");
            setSelectedBrandId(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
            activeTab === "calculator" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>الحاسبة</span>
        </button>

        <button
          onClick={() => setIsAffiliateModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 transition-colors"
          title="تفعيل أرباحي الحقيقية"
        >
          <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
          <span className="hidden sm:inline">أرباحي</span>
          {configuredAffiliateCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
          )}
        </button>

        <button
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md shadow-emerald-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">AI</span>
        </button>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 text-right">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-black text-sm">
                  %
                </div>
                <span className="font-bold text-slate-900 text-base">منصة كوبونات وعروض المتاجر السعودية 🇸🇦</span>
              </div>
              <p className="text-xs text-slate-500 max-w-md leading-relaxed">
                أحدث كوبونات وأكواد الخصم الحصرية للمتاجر الإلكترونية في المملكة العربية السعودية والعالم العربي، محدثة يومياً وتضمن أعلى نسبة توفير.
              </p>
            </div>

            <div className="flex items-center gap-5 text-xs text-slate-500 flex-wrap">
              <button 
                onClick={() => { setActiveTab("coupons"); setSelectedBrandId(null); scrollToTop(); }} 
                className="hover:text-emerald-600 transition-colors font-bold text-slate-900"
              >
                كوبونات المتاجر 🇸🇦
              </button>
              <button 
                onClick={() => { setActiveTab("products"); setSelectedBrandId(null); scrollToTop(); }} 
                className="hover:text-emerald-600 transition-colors font-bold text-emerald-700"
              >
                عروض المنتجات 🔥
              </button>
              <button 
                onClick={() => { setActiveTab("admin"); setSelectedBrandId(null); scrollToTop(); }} 
                className="hover:text-emerald-600 transition-colors font-bold text-slate-800"
              >
                لوحة التحكم (Admin)
              </button>
              <button onClick={() => { setActiveTab("models"); setSelectedBrandId(null); scrollToTop(); }} className="hover:text-emerald-600 transition-colors">
                أفضل النماذج
              </button>
              <button onClick={() => { setActiveTab("niches"); setSelectedBrandId(null); scrollToTop(); }} className="hover:text-emerald-600 transition-colors">
                النيشات والبحث
              </button>
              <button onClick={() => { setActiveTab("seo-playbook"); setSelectedBrandId(null); scrollToTop(); }} className="hover:text-emerald-600 transition-colors">
                معايير سيو قوقل
              </button>
              <button onClick={scrollToTop} className="p-2 rounded-xl bg-slate-100 border border-slate-200 hover:text-slate-900 text-slate-600 transition-colors" title="الرجوع للأعلى">
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>

          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400">
            جميع حقوق العلامات التجارية محفوظة لمالكيها ومتاجرها الأصلية. يتم التحقق من صحة وصلاحية الأكواد بشكل دوري لخدمة المتسوق العربي.
          </div>
        </div>
      </footer>

      {/* Smart Copy & Go Coupon Modal */}
      <CouponModal
        isOpen={isCouponModalOpen}
        coupon={modalCoupon?.coupon || null}
        brand={modalCoupon?.brand || null}
        onClose={() => setIsCouponModalOpen(false)}
        affiliateSettings={affiliateSettings}
      />

      {/* AI Niche Scanner Modal */}
      <AiNicheAnalyzer
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        initialQuery={aiInitialQuery}
      />

      {/* Instant Arabic Smart Search Modal (Ctrl + K) */}
      <SmartSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        brands={activeBrands}
        onSelectBrand={handleSelectBrand}
        onOpenCouponModal={handleOpenCouponModal}
        initialQuery={searchInitialQuery}
      />

      {/* Affiliate Monetization Setup Modal */}
      <AffiliateSetupModal
        isOpen={isAffiliateModalOpen}
        onClose={() => setIsAffiliateModalOpen(false)}
        brands={SAUDI_STORE_BRANDS}
        currentSettings={affiliateSettings}
        onSaveSettings={(newSettings) => setAffiliateSettings(newSettings)}
      />

    </div>
  );
}

