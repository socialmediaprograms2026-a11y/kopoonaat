import React, { useState, useEffect } from "react";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  ExternalLink,
  Layers,
  MousePointerClick,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  Users,
  Webhook,
  X,
  AlertTriangle,
  Zap,
  ChevronLeft,
  Sliders,
  BarChart3,
  FileCheck,
  Package,
  Store,
  Check,
  Sparkles,
  Wallet,
  Coins,
  Globe
} from "lucide-react";
import { IntegrationSetup } from "./IntegrationSetup";
import { ReportsTab } from "./admin/ReportsTab";
import { TestSuiteTab } from "./admin/TestSuiteTab";
import { IntegrationLogsTab } from "./admin/IntegrationLogsTab";
import { ProductsAdminTab } from "./admin/ProductsAdminTab";
import { AffiliateRevenueTab } from "./admin/AffiliateRevenueTab";
import { NicheSyncTab } from "./admin/NicheSyncTab";
import { AdminWalletView } from "./admin/AdminWalletView";
import { ProfitabilityAndLinkVerificationTab } from "./admin/ProfitabilityAndLinkVerificationTab";
import { GoogleSeoPublishingTab } from "./admin/GoogleSeoPublishingTab";
import { LazyBrandLogo } from "./common/LazyBrandLogo";
import { useAuth } from "../context/AuthContext";
import { adminFetch } from "../utils/apiClient";

interface AdminOverview {
  counts: {
    merchants: number;
    coupons: number;
    products: number;
    clicks: number;
    conversions: number;
    subscribers: number;
    integrations: number;
  };
  commissions: {
    totalRevenue: number;
    pendingCommission: number;
    approvedCommission: number;
    paidCommission: number;
    currency: string;
    totalConversions: number;
  };
  recentClicks: any[];
  recentConversions: any[];
  recentSyncJobs: any[];
  networks: any[];
}

export const AdminDashboard: React.FC = () => {
  const { user, isAdmin, loading: authLoading, signInWithGoogle, logout, firestoreConnected } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "wallet" | "googleSeo" | "revenue" | "verification" | "nicheSync" | "integrations" | "reports" | "testSuite" | "overview" | "merchants" | "coupons" | "products" | "networks" | "clicks" | "conversions" | "logs" | "subscribers" | "sync"
  >("wallet");

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [merchants, setMerchants] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [clicks, setClicks] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [networks, setNetworks] = useState<any[]>([]);
  const [syncLogs, setSyncLogs] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testingNetwork, setTestingNetwork] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ key: string; msg: string; success: boolean } | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [testingMerchantId, setTestingMerchantId] = useState<string | null>(null);

  const handleTestMerchantLink = async (merchantId: string) => {
    setTestingMerchantId(merchantId);
    try {
      const res = await adminFetch(`/api/admin/merchants/${merchantId}/verify-link`, {
        method: "POST"
      });
      if (res.ok) {
        const data = await res.json();
        setMerchants((prev) =>
          prev.map((m) => (m.id === merchantId ? { ...m, linkVerification: data.result } : m))
        );
      }
    } catch (err) {
      console.error("Test merchant link failed:", err);
    } finally {
      setTestingMerchantId(null);
    }
  };

  // New Merchant Modal State
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState({
    name: "",
    arabicName: "",
    category: "إلكترونيات وجوالات",
    websiteUrl: "",
    affiliateUrl: "",
    affiliateNetwork: "Amazon Associates",
    affiliateProgramId: "",
    affiliateTrackingId: "",
    commissionRate: "5% - 10%",
    cookieDuration: "30 يوم"
  });

  // New Coupon Modal State
  const [showAddCoupon, setShowAddCoupon] = useState(false);
  const [newCoupon, setNewCoupon] = useState({
    merchantId: "",
    code: "",
    title: "",
    discountType: "PERCENTAGE",
    discountValue: "10%",
    minimumOrder: "",
    expiryDate: "2026-12-31",
    badge: "كوبون معتمد"
  });

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [ovRes, mRes, cRes, nRes, clkRes, convRes, subRes, sRes, pRes] = await Promise.all([
        adminFetch("/api/admin/overview").then((r) => r.ok ? r.json() : null).catch(() => null),
        adminFetch("/api/admin/merchants").then((r) => r.ok ? r.json() : { merchants: [] }).catch(() => ({ merchants: [] })),
        adminFetch("/api/admin/coupons").then((r) => r.ok ? r.json() : { coupons: [] }).catch(() => ({ coupons: [] })),
        adminFetch("/api/admin/networks").then((r) => r.ok ? r.json() : { networks: [] }).catch(() => ({ networks: [] })),
        adminFetch("/api/admin/clicks").then((r) => r.ok ? r.json() : { clicks: [] }).catch(() => ({ clicks: [] })),
        adminFetch("/api/admin/conversions").then((r) => r.ok ? r.json() : { conversions: [] }).catch(() => ({ conversions: [] })),
        adminFetch("/api/admin/subscribers").then((r) => r.ok ? r.json() : { subscribers: [] }).catch(() => ({ subscribers: [] })),
        adminFetch("/api/admin/sync/logs").then((r) => r.ok ? r.json() : { logs: [] }).catch(() => ({ logs: [] })),
        adminFetch("/api/admin/products").then((r) => r.ok ? r.json() : { products: [] }).catch(() => ({ products: [] }))
      ]);

      if (ovRes && !ovRes.error && ovRes.counts) {
        setOverview(ovRes);
      } else {
        setOverview(null);
      }
      setMerchants(mRes?.merchants || []);
      setCoupons(cRes?.coupons || []);
      setNetworks(nRes?.networks || []);
      setClicks(clkRes?.clicks || []);
      setConversions(convRes?.conversions || []);
      setSubscribers(subRes?.subscribers || []);
      setSyncLogs(sRes?.logs || []);
      setProducts(pRes?.products || []);

      if (mRes?.merchants && mRes.merchants.length > 0 && !newCoupon.merchantId) {
        setNewCoupon((prev) => ({ ...prev, merchantId: mRes.merchants[0].id }));
      }
    } catch (e) {
      console.error("Failed to load admin data:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [user]);

  const handleTestNetwork = async (networkKey: string) => {
    setTestingNetwork(networkKey);
    setTestResult(null);
    try {
      const res = await adminFetch("/api/admin/networks/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ networkKey })
      });
      const data = await res.json();
      setTestResult({ key: networkKey, msg: data.message, success: data.connected });
      fetchAllData();
    } catch {
      setTestResult({ key: networkKey, msg: "فشل فحص الاتصال", success: false });
    } finally {
      setTestingNetwork(null);
    }
  };

  const handleUpdateConversionStatus = async (id: string, status: string) => {
    try {
      const res = await adminFetch(`/api/admin/conversions/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {
      console.error("Failed to update status:", e);
    }
  };

  const handleRunSync = async () => {
    setIsSyncing(true);
    try {
      await adminFetch("/api/admin/sync/run", { method: "POST" });
      await fetchAllData();
    } catch (e) {
      console.error("Sync run failed:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/admin/merchants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMerchant)
      });
      if (res.ok) {
        setShowAddMerchant(false);
        setNewMerchant({
          name: "",
          arabicName: "",
          category: "إلكترونيات وجوالات",
          websiteUrl: "",
          affiliateUrl: "",
          affiliateNetwork: "Amazon Associates",
          affiliateProgramId: "",
          affiliateTrackingId: "",
          commissionRate: "5% - 10%",
          cookieDuration: "30 يوم"
        });
        fetchAllData();
      }
    } catch (e) {
      console.error("Create merchant failed:", e);
    }
  };

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await adminFetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        setShowAddCoupon(false);
        setNewCoupon({
          merchantId: merchants[0]?.id || "",
          code: "",
          title: "",
          discountType: "PERCENTAGE",
          discountValue: "10%",
          minimumOrder: "",
          expiryDate: "2026-12-31",
          badge: "كوبون معتمد"
        });
        fetchAllData();
      }
    } catch (e) {
      console.error("Create coupon failed:", e);
    }
  };

  const handleVerifyCoupon = async (id: string) => {
    try {
      await adminFetch(`/api/admin/coupons/${id}/verify`, { method: "POST" });
      fetchAllData();
    } catch (e) {
      console.error("Verify coupon failed:", e);
    }
  };

  const handleDeleteMerchant = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا المتجر؟")) return;
    try {
      await adminFetch(`/api/admin/merchants/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (e) {
      console.error("Delete merchant failed:", e);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الكوبون؟")) return;
    try {
      await adminFetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
      fetchAllData();
    } catch (e) {
      console.error("Delete coupon failed:", e);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(key);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white flex items-center gap-2">
                لوحة تحكم منظومة الأفلييت
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Production Engine
                </span>
              </h1>
              <p className="text-xs text-slate-400">نظام إدارة العمولات والتكاملات الفعلي</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile / Login status */}
            {user ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-[10px]">
                    {user.email?.charAt(0).toUpperCase() || "A"}
                  </div>
                )}
                <span className="text-slate-200 font-medium hidden sm:inline text-[11px] truncate max-w-[140px]">
                  {user.email}
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {isAdmin ? "مسؤول معتمد" : "مستخدم"}
                </span>
                <button
                  onClick={logout}
                  className="text-slate-400 hover:text-rose-400 text-[11px] font-medium mr-1 transition-colors"
                  title="تسجيل الخروج"
                >
                  خروج
                </button>
              </div>
            ) : (
              <button
                onClick={signInWithGoogle}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm shadow-emerald-500/20"
              >
                <Zap className="w-3.5 h-3.5" />
                دخول بحساب Google
              </button>
            )}

            {/* Firebase Live Cloud Status Badge */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <span className={`w-2 h-2 rounded-full ${firestoreConnected ? "bg-amber-400 animate-pulse" : "bg-rose-500"}`}></span>
              <span className="text-slate-300 font-mono text-[11px]">
                Firestore: <strong className="text-amber-400">Connected</strong>
              </span>
            </div>

            <button
              onClick={fetchAllData}
              disabled={isLoading}
              className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs flex items-center gap-1.5 transition-all"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
            </button>

            <a
              href="/"
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              الواجهة الرئيسية
            </a>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 space-x-reverse overflow-x-auto py-2.5 no-scrollbar">
            <button
              onClick={() => setActiveTab("wallet")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "wallet"
                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black ring-2 ring-amber-400"
                  : "text-amber-400 hover:text-amber-300 hover:bg-slate-800/60 bg-amber-500/10 border border-amber-500/20"
              }`}
            >
              <Coins className="w-4 h-4" />
              المحفظة والأرباح (Wallet)
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            </button>

            <button
              onClick={() => setActiveTab("googleSeo")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "googleSeo"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black ring-2 ring-emerald-400"
                  : "text-emerald-400 hover:text-emerald-300 hover:bg-slate-800/60 bg-emerald-500/10 border border-emerald-500/20"
              }`}
            >
              <Globe className="w-4 h-4" />
              جاهزية Google والأرشفة 🌐
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-emerald-500 text-slate-950">
                100% جاهز
              </span>
            </button>

            <button
              onClick={() => setActiveTab("revenue")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "revenue"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              مزامنة الإيرادات والأرباح
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </button>

            <button
              onClick={() => setActiveTab("verification")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "verification"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              فحص الروابط والربحية
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                مباشر
              </span>
            </button>

            <button
              onClick={() => setActiveTab("nicheSync")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "nicheSync"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              وظيفة رصد النيشات (AI Job)
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                تلقائي
              </span>
            </button>

            <button
              onClick={() => setActiveTab("integrations")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "integrations"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              الربط التقني والتكاملات
            </button>

            <button
              onClick={() => setActiveTab("reports")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "reports"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              التقارير المتقدمة
            </button>

            <button
              onClick={() => setActiveTab("testSuite")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "testSuite"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <FileCheck className="w-4 h-4" />
              فحص المنظومة الآلي
            </button>

            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "overview"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Activity className="w-4 h-4" />
              الملخص العام
            </button>

            <button
              onClick={() => setActiveTab("products")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "products"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Package className="w-4 h-4" />
              المنتجات ({overview?.counts?.products ?? products.length})
            </button>

            <button
              onClick={() => setActiveTab("merchants")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "merchants"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Store className="w-4 h-4" />
              المتاجر ({overview?.counts?.merchants ?? merchants.length})
            </button>

            <button
              onClick={() => setActiveTab("coupons")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "coupons"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Tag className="w-4 h-4" />
              الكوبونات ({overview?.counts?.coupons ?? coupons.length})
            </button>

            <button
              onClick={() => setActiveTab("conversions")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "conversions"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <DollarSign className="w-4 h-4" />
              التحويلات والعمولات
            </button>

            <button
              onClick={() => setActiveTab("clicks")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "clicks"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <MousePointerClick className="w-4 h-4" />
              النقرات ({overview?.counts?.clicks ?? clicks.length})
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "logs"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Activity className="w-4 h-4" />
              سجلات الـ Webhooks
            </button>

            <button
              onClick={() => setActiveTab("subscribers")}
              className={`px-4 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === "subscribers"
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              <Users className="w-4 h-4" />
              المشتركين ({overview?.counts?.subscribers ?? subscribers.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Auth Notice Banner */}
        {!user && !authLoading && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">تسجيل الدخول كمسؤول مطلوب للتحكم الكامل</h4>
                <p className="text-xs text-slate-400">
                  لوحة التحكم مؤمنة عبر Firebase Auth. سجّل دخولك بحساب المشرف المعتمد (alhatfhsab283@gmail.com) لتنفيذ العمليات وإدارة العمولات.
                </p>
              </div>
            </div>
            <button
              onClick={signInWithGoogle}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-2 whitespace-nowrap transition-all shadow-md shadow-emerald-500/20"
            >
              <Zap className="w-4 h-4" />
              تسجيل الدخول عبر Google
            </button>
          </div>
        )}

        {user && !isAdmin && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-300">حساب غير مخول بصلاحيات الإدارة</h4>
                <p className="text-xs text-slate-400">
                  أنت مسجل بالبريد ({user.email}). الوصول الكامل مقتصر على المشرف المعتمد (alhatfhsab283@gmail.com).
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-semibold"
            >
              تبديل الحساب
            </button>
          </div>
        )}

        {/* -1. Lightweight Wallet & Binance Payouts View */}
        {activeTab === "wallet" && <AdminWalletView />}

        {/* -0.5 Google SEO & Search Console Publishing Readiness */}
        {activeTab === "googleSeo" && <GoogleSeoPublishingTab />}

        {/* 0. Automated Revenue & Earnings Sync Tab */}
        {activeTab === "revenue" && <AffiliateRevenueTab />}

        {/* 0.05 Real Link Verification & Profitability Analysis Tab */}
        {activeTab === "verification" && <ProfitabilityAndLinkVerificationTab />}

        {/* 0.1 AI Niche Analyzer Background Job Tab */}
        {activeTab === "nicheSync" && <NicheSyncTab />}

        {/* 1. Integrations Tab */}
        {activeTab === "integrations" && <IntegrationSetup />}

        {/* 2. Reports Tab */}
        {activeTab === "reports" && <ReportsTab />}

        {/* 3. Test Suite Tab */}
        {activeTab === "testSuite" && <TestSuiteTab />}

        {/* 4. Products Tab */}
        {activeTab === "products" && <ProductsAdminTab />}

        {/* 5. Logs Tab */}
        {activeTab === "logs" && <IntegrationLogsTab />}

        {/* 6. Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">إجمالي النقرات المسجلة</span>
                  <MousePointerClick className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-black text-white">{overview?.counts?.clicks || 0}</div>
                <div className="text-xs text-slate-400 mt-2">تتبع فوري عبر /go/ ومطابقة الـ SubID</div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">التحويلات المؤكدة</span>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-3xl font-black text-emerald-400">{overview?.commissions?.totalConversions || 0}</div>
                <div className="text-xs text-slate-400 mt-2">من خلال Webhooks والـ Postbacks الحقيقية</div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">العمولات المعلقة</span>
                  <Clock className="w-5 h-5 text-amber-400" />
                </div>
                <div className="text-3xl font-black text-amber-400">
                  {overview?.commissions?.pendingCommission || 0} {overview?.commissions?.currency || "SAR"}
                </div>
                <div className="text-xs text-slate-400 mt-2">بانتظار تأكيد الشبكات والمتاجر</div>
              </div>

              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-bold">العمولات المعتمدة</span>
                  <DollarSign className="w-5 h-5 text-teal-400" />
                </div>
                <div className="text-3xl font-black text-teal-400">
                  {overview?.commissions?.approvedCommission || 0} {overview?.commissions?.currency || "SAR"}
                </div>
                <div className="text-xs text-slate-400 mt-2">جاهزة للتحويل والمدفوعات</div>
              </div>
            </div>

            {/* Quick Actions & Recent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Networks Status Quick List */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    حالة ربط شبكات الأفلييت
                  </h3>
                  <button
                    onClick={() => setActiveTab("integrations")}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    إدارة التكاملات
                  </button>
                </div>

                <div className="space-y-3">
                  {networks.map((net) => (
                    <div
                      key={net.id}
                      className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-200">{net.name}</div>
                        <div className="text-slate-400 text-[11px]">{net.region}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        {net.connectionStatus === "CONNECTED" ? (
                          <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-md font-bold">
                            متصل ونشط
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded-md">
                            غير مربوط
                          </span>
                        )}

                        <button
                          onClick={() => handleTestNetwork(net.networkKey)}
                          disabled={testingNetwork === net.networkKey}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-all"
                        >
                          {testingNetwork === net.networkKey ? "فحص..." : "فحص"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" />
                    آخر التحويلات والنقرات
                  </h3>
                  <button
                    onClick={() => setActiveTab("conversions")}
                    className="text-xs text-indigo-400 hover:underline font-semibold"
                  >
                    سجل التحويلات الكامل
                  </button>
                </div>

                <div className="space-y-3">
                  {conversions.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      لم يتم تسجيل أي تحويلات بعد. ستظهر التحويلات فور ورود بيانات الـ Webhook من الشبكات.
                    </div>
                  ) : (
                    conversions.slice(0, 5).map((conv) => (
                      <div
                        key={conv.id}
                        className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>طلب #{conv.orderReference}</span>
                            <span className="text-slate-400">({conv.network})</span>
                          </div>
                          <div className="text-slate-400 text-[11px]">
                            قيمة الطلب: {conv.orderValue} {conv.currency}
                          </div>
                        </div>

                        <div className="text-left">
                          <div className="font-bold text-emerald-400">
                            +{conv.commissionAmount} {conv.currency}
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
                              conv.status === "APPROVED"
                                ? "bg-emerald-500/20 text-emerald-400"
                                : conv.status === "PENDING"
                                ? "bg-amber-500/20 text-amber-400"
                                : "bg-red-500/20 text-red-400"
                            }`}
                          >
                            {conv.status}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Management Tab */}
        {activeTab === "products" && (
          <div className="space-y-6">
            <ProductsAdminTab />
          </div>
        )}

        {/* 7. Merchants Tab */}
        {activeTab === "merchants" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-400" />
                المتاجر الإلكترونية الشريكة ({merchants.length})
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("verification")}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  جدول تدقيق الروابط والربحية
                </button>
                <button
                  onClick={() => setShowAddMerchant(true)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  إضافة متجر جديد
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {merchants.map((m) => {
                const lv = m.linkVerification;
                const isTesting = testingMerchantId === m.id;

                return (
                  <div key={m.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <LazyBrandLogo
                          logoUrl={m.logoUrl}
                          logoText={m.logoText || m.name.substring(0, 3)}
                          logoBg={m.logoBg || "bg-emerald-600 text-white"}
                          brandName={m.arabicName || m.name}
                          size="sm"
                        />
                        <div>
                          <h3 className="font-bold text-white text-sm">{m.arabicName || m.name}</h3>
                          <span className="text-xs text-slate-400">{m.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteMerchant(m.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors cursor-pointer"
                        title="حذف المتجر"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Real Link Verification Badge */}
                    {lv ? (
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400 text-[11px]">حالة الرابط الحقيقية:</span>
                          {lv.status === "REAL_ACTIVE" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              REAL ACTIVE (HTTP {lv.httpStatus || 200})
                            </span>
                          ) : lv.status === "PENDING_CONFIG" ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              PENDING CONFIG
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                              BROKEN (HTTP {lv.httpStatus || "ERR"})
                            </span>
                          )}
                        </div>

                        {lv.trackingValidation?.hasPublisherId && (
                          <div className="text-[10px] text-slate-300 flex items-center justify-between font-mono bg-slate-950 p-1.5 rounded border border-slate-800">
                            <span className="text-slate-500 font-sans text-[9px]">المعرف المعتمد:</span>
                            <span className="text-emerald-400 font-bold">
                              {lv.trackingValidation.publisherIdKey}={lv.trackingValidation.publisherIdValue}
                            </span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-2 rounded-xl bg-slate-900 text-slate-500 text-[10px] text-center border border-slate-800">
                        لم يتم الفحص بعد • اضغط "فحص الرابط" للاختبار
                      </div>
                    )}

                    <div className="space-y-1.5 text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">شبكة الأفلييت:</span>
                        <span className="font-semibold text-emerald-400">{m.affiliateNetwork}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">نسبة العمولة:</span>
                        <span className="font-semibold">{m.commissionRate || "5%"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">مدة الكوكيز:</span>
                        <span>{m.cookieDuration || "30 يوم"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                      <button
                        onClick={() => copyToClipboard(`${window.location.origin}/go/${m.slug}`, m.id)}
                        className="flex-1 py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-800 transition-all cursor-pointer"
                      >
                        {copiedUrl === m.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            تم النسخ
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            نسخ رابط /go
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleTestMerchantLink(m.id)}
                        disabled={isTesting}
                        className="py-1.5 px-2.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
                        title="فحص الرابط مباشرة وتحديث نتيجته"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? "animate-spin" : ""}`} />
                        <span>{isTesting ? "فحص..." : "فحص الرابط"}</span>
                      </button>

                      <a
                        href={`/go/${m.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800 cursor-pointer"
                        title="فتح رابط التحويل"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 8. Coupons Tab */}
        {activeTab === "coupons" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                الكوبونات والعروض الترويجية ({coupons.length})
              </h2>
              <button
                onClick={() => setShowAddCoupon(true)}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Plus className="w-4 h-4" />
                إضافة كود خصم
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((c) => {
                const merchant = merchants.find((m) => m.id === c.merchantId);
                return (
                  <div key={c.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {merchant?.arabicName || "متجر معتمد"}
                        </span>
                        <h3 className="font-bold text-white text-sm mt-2">{c.title}</h3>
                      </div>

                      <button
                        onClick={() => handleDeleteCoupon(c.id)}
                        className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                        title="حذف الكوبون"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                      <span className="font-mono font-black text-emerald-400 tracking-wider text-base">{c.code}</span>
                      <span className="text-xs text-slate-300 font-bold">{c.discountValue}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-900">
                      <span>صالح حتى: {c.expiryDate}</span>
                      <div className="flex items-center gap-2">
                        {c.verificationStatus === "VERIFIED" ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            مفحوص
                          </span>
                        ) : (
                          <button
                            onClick={() => handleVerifyCoupon(c.id)}
                            className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded font-semibold text-[11px]"
                          >
                            تأكيد الفحص
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 9. Conversions Ledger Tab */}
        {activeTab === "conversions" && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    دفتر التحويلات والعمولات المباشر
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    سجل التحويلات الواردة لحظياً من الشبكات عبر الـ Webhooks وإمكانية اعتماد الحالات.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono font-semibold">{conversions.length} تحويلة مسجلة</span>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3.5">الرقم المرجعي</th>
                      <th className="p-3.5">الشبكة</th>
                      <th className="p-3.5">المتجر</th>
                      <th className="p-3.5 text-center">قيمة الطلب</th>
                      <th className="p-3.5 text-center">العمولة</th>
                      <th className="p-3.5 text-center">الحالة</th>
                      <th className="p-3.5 text-center">تحديث الحالة</th>
                      <th className="p-3.5">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {conversions.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500 font-sans">
                          لا توجد تحويلات مسجلة بعد في دفتر العمليات.
                        </td>
                      </tr>
                    ) : (
                      conversions.map((c) => {
                        const m = merchants.find((item) => item.id === c.merchantId);
                        return (
                          <tr key={c.id} className="hover:bg-slate-900/50">
                            <td className="p-3.5 font-bold text-white font-sans">#{c.orderReference}</td>
                            <td className="p-3.5 text-slate-300 font-sans">{c.network}</td>
                            <td className="p-3.5 font-bold text-slate-200 font-sans">{m?.arabicName || c.merchantId}</td>
                            <td className="p-3.5 text-center font-semibold text-slate-300">
                              {c.orderValue} {c.currency}
                            </td>
                            <td className="p-3.5 text-center font-bold text-emerald-400">
                              +{c.commissionAmount} {c.currency}
                            </td>
                            <td className="p-3.5 text-center font-sans">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                  c.status === "APPROVED"
                                    ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                    : c.status === "PENDING"
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                    : "bg-red-500/20 text-red-400 border border-red-500/30"
                                }`}
                              >
                                {c.status}
                              </span>
                            </td>
                            <td className="p-3.5 text-center font-sans">
                              <select
                                value={c.status}
                                onChange={(e) => handleUpdateConversionStatus(c.id, e.target.value)}
                                className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2 py-1 rounded-lg"
                              >
                                <option value="PENDING">PENDING (معلق)</option>
                                <option value="APPROVED">APPROVED (معتمد)</option>
                                <option value="PAID">PAID (مدفوع)</option>
                                <option value="REJECTED">REJECTED (مرفوض)</option>
                                <option value="CANCELLED">CANCELLED (ملغي)</option>
                              </select>
                            </td>
                            <td className="p-3.5 text-slate-400 font-sans text-[11px]">
                              {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 10. Clicks Ledger Tab */}
        {activeTab === "clicks" && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <MousePointerClick className="w-5 h-5 text-blue-400" />
                    سجل النقرات والتحويلات الخارجية
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    تتبع دقيق لكافة النقرات الصادرة مع وسوم الحملات (UTMs) ومعرفات SubIDs.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono font-semibold">{clicks.length} نقرة</span>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3.5">معرف النقرة (ClickId)</th>
                      <th className="p-3.5">المتجر المستهدف</th>
                      <th className="p-3.5">نوع الجهاز</th>
                      <th className="p-3.5">الحملة (Campaign)</th>
                      <th className="p-3.5">المصدر (UTM Source)</th>
                      <th className="p-3.5">الوقت والتاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {clicks.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                          لا توجد نقرات مسجلة حتى الآن.
                        </td>
                      </tr>
                    ) : (
                      clicks.map((clk) => {
                        const m = merchants.find((item) => item.id === clk.merchantId);
                        return (
                          <tr key={clk.id} className="hover:bg-slate-900/50">
                            <td className="p-3.5 font-bold text-blue-400">{clk.clickId.substring(0, 18)}...</td>
                            <td className="p-3.5 font-bold text-slate-200 font-sans">{m?.arabicName || clk.merchantId}</td>
                            <td className="p-3.5 font-sans">
                              <span className="px-2 py-0.5 bg-slate-900 text-slate-300 rounded border border-slate-800">
                                {clk.deviceType || "desktop"}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-300 font-sans">{clk.campaign || clk.utmCampaign || "direct"}</td>
                            <td className="p-3.5 text-slate-400 font-sans">{clk.utmSource || "affiliate_site"}</td>
                            <td className="p-3.5 text-slate-400 font-sans text-[11px]">
                              {new Date(clk.timestamp || clk.createdAt).toLocaleTimeString("ar-SA")}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 11. Subscribers Tab */}
        {activeTab === "subscribers" && (
          <div className="space-y-6">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-teal-400" />
                    المشتركون في النشرات البريدية وتنبيهات العروض
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    قاعدة بيانات المشتركين المؤكدين مع تفضيلات المتاجر ونظام التنبيهات الذكي.
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-semibold">{subscribers.length} مشترك</span>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-slate-400 border-b border-slate-800 font-semibold">
                    <tr>
                      <th className="p-3.5">البريد الإلكتروني</th>
                      <th className="p-3.5">الحالة</th>
                      <th className="p-3.5">المصدر</th>
                      <th className="p-3.5">التاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {subscribers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500 font-sans">
                          لا يوجد مشتركون مسجلون حالياً.
                        </td>
                      </tr>
                    ) : (
                      subscribers.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-900/50">
                          <td className="p-3.5 font-bold text-white font-sans">{s.email}</td>
                          <td className="p-3.5 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                s.status === "ACTIVE"
                                  ? "bg-emerald-500/20 text-emerald-400"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>
                          <td className="p-3.5 text-slate-300 font-sans">{s.source || "HOME_BANNER"}</td>
                          <td className="p-3.5 text-slate-400 font-sans text-[11px]">
                            {new Date(s.createdAt).toLocaleDateString("ar-SA")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Merchant Modal */}
      {showAddMerchant && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">إضافة متجر شريك جديد</h3>
              <button onClick={() => setShowAddMerchant(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMerchant} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المتجر بالإنجليزية</label>
                <input
                  type="text"
                  value={newMerchant.name}
                  onChange={(e) => setNewMerchant({ ...newMerchant, name: e.target.value })}
                  placeholder="e.g. Amazon Saudi Arabia"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">اسم المتجر بالعربية</label>
                <input
                  type="text"
                  value={newMerchant.arabicName}
                  onChange={(e) => setNewMerchant({ ...newMerchant, arabicName: e.target.value })}
                  placeholder="مثال: أمازون السعودية"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">شبكة الأفلييت</label>
                  <select
                    value={newMerchant.affiliateNetwork}
                    onChange={(e) => setNewMerchant({ ...newMerchant, affiliateNetwork: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Amazon Associates">أمازون أسوشيتس</option>
                    <option value="Awin">أوين (Awin)</option>
                    <option value="Impact">إمباكت (Impact)</option>
                    <option value="CJ">سي جي (CJ)</option>
                    <option value="ShareASale">شير إيه سيل (ShareASale)</option>
                    <option value="Admitad">أدميتاد (Admitad)</option>
                    <option value="ArabClicks">عرب كليكس (ArabClicks)</option>
                    <option value="Generic">رابط مباشر (Generic Direct)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">التصنيف</label>
                  <input
                    type="text"
                    value={newMerchant.category}
                    onChange={(e) => setNewMerchant({ ...newMerchant, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">رابط الموقع الرسمي</label>
                <input
                  type="url"
                  value={newMerchant.websiteUrl}
                  onChange={(e) => setNewMerchant({ ...newMerchant, websiteUrl: e.target.value, affiliateUrl: e.target.value })}
                  placeholder="https://www.example.com"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddMerchant(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  حفظ المتجر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Coupon Modal */}
      {showAddCoupon && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-base">إضافة كود خصم جديد</h3>
              <button onClick={() => setShowAddCoupon(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">المتجر</label>
                <select
                  value={newCoupon.merchantId}
                  onChange={(e) => setNewCoupon({ ...newCoupon, merchantId: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.arabicName || m.name} ({m.affiliateNetwork})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">كود الخصم (Coupon Code)</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })}
                    placeholder="مثال: SAVE20"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">قيمة الخصم</label>
                  <input
                    type="text"
                    value={newCoupon.discountValue}
                    onChange={(e) => setNewCoupon({ ...newCoupon, discountValue: e.target.value })}
                    placeholder="مثال: 15% أو 50 ريال"
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">عنوان العرض</label>
                <input
                  type="text"
                  value={newCoupon.title}
                  onChange={(e) => setNewCoupon({ ...newCoupon, title: e.target.value })}
                  placeholder="مثال: خصم 15% على جميع المنتجات"
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1">تاريخ الانتهاء</label>
                <input
                  type="date"
                  value={newCoupon.expiryDate}
                  onChange={(e) => setNewCoupon({ ...newCoupon, expiryDate: e.target.value })}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCoupon(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl"
                >
                  حفظ الكوبون
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
