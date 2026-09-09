import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Shield,
  Activity,
  Zap,
  Database,
  Mail,
  Bot,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  ToggleLeft,
  ToggleRight,
  Info,
  Layers,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { adminFetch } from "../utils/apiClient";

export type IntegrationState = "CONNECTED" | "MISSING_CREDENTIALS" | "NOT_CONFIGURED" | "CONNECTION_FAILED";

export interface EnvVariableDoc {
  name: string;
  type: string;
  isRequired: boolean;
  isSet: boolean;
  previewValue?: string;
  serviceName: string;
  dashboardLocation: string;
  requiresApproval: boolean;
  approvalDetails: string;
  description: string;
}

export interface ServiceIntegrationStatus {
  id: string;
  name: string;
  arabicName: string;
  category: "database" | "affiliate" | "email" | "ai";
  status: IntegrationState;
  isEnabled: boolean;
  statusMessage: string;
  lastTestedAt?: string;
  isInitialTarget: boolean;
  variables: EnvVariableDoc[];
}

export const IntegrationSetup: React.FC = () => {
  const [integrations, setIntegrations] = useState<ServiceIntegrationStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({
    database: true,
    amazon: true
  });
  const [categoryFilter, setCategoryFilter] = useState<"all" | "database" | "affiliate" | "email" | "ai">("all");
  const [copiedVar, setCopiedVar] = useState<string | null>(null);

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/api/admin/integrations");
      const data = await res.json();
      if (data.integrations) {
        setIntegrations(data.integrations);
      }
    } catch (err) {
      console.error("Failed to load integrations status:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleTestService = async (serviceId: string) => {
    setTestingId(serviceId);
    try {
      const res = await adminFetch("/api/admin/integrations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId })
      });
      const result = await res.json();

      setIntegrations((prev) =>
        prev.map((item) =>
          item.id === serviceId
            ? {
                ...item,
                status: result.status,
                statusMessage: result.message,
                lastTestedAt: new Date().toISOString()
              }
            : item
        )
      );
    } catch (err) {
      console.error("Test failed:", err);
    } finally {
      setTestingId(null);
    }
  };

  const handleToggle = async (serviceId: string, currentEnabled: boolean) => {
    const nextState = !currentEnabled;
    try {
      await adminFetch("/api/admin/integrations/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serviceId, isEnabled: nextState })
      });
      setIntegrations((prev) =>
        prev.map((item) => (item.id === serviceId ? { ...item, isEnabled: nextState } : item))
      );
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVar(id);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  const toggleExpand = (id: string) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status: IntegrationState) => {
    switch (status) {
      case "CONNECTED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>✅ Connected (تم الاتصال واختبار API بنجاح)</span>
          </div>
        );
      case "MISSING_CREDENTIALS":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 text-xs font-bold shadow-sm">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>🟡 Missing Credentials (بيانات الاعتماد ناقصة)</span>
          </div>
        );
      case "CONNECTION_FAILED":
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-xs font-bold shadow-sm">
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
            <span>🔴 Connection Failed (فشل اختبار الاتصال)</span>
          </div>
        );
      case "NOT_CONFIGURED":
      default:
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/60 text-slate-300 border border-slate-600 text-xs font-bold shadow-sm">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>⚪ Not Configured (التكامل غير مفعّل)</span>
          </div>
        );
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "database":
        return <Database className="w-4 h-4 text-sky-400" />;
      case "affiliate":
        return <Zap className="w-4 h-4 text-emerald-400" />;
      case "email":
        return <Mail className="w-4 h-4 text-amber-400" />;
      case "ai":
        return <Bot className="w-4 h-4 text-purple-400" />;
      default:
        return <Layers className="w-4 h-4 text-slate-400" />;
    }
  };

  const filtered = integrations.filter((item) =>
    categoryFilter === "all" ? true : item.category === categoryFilter
  );

  return (
    <div className="space-y-8 text-right" dir="rtl">
      {/* Top Banner with Current Phase Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/40">
            <Shield className="w-3.5 h-3.5" />
            <span>نظام التكامل المعياري (Modular Integration Hub)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mb-2">
            إعداد وتفعيل خدمات النظام والربط الحقيقي
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            كافة التكاملات هنا اختيارية ومعيارية بالكامل (Modular). نبدأ أولاً بـ{" "}
            <strong className="text-emerald-400 font-bold">قاعدة البيانات (DATABASE_URL)</strong> وشبكة الأفلييت الأولى{" "}
            <strong className="text-emerald-400 font-bold">أمازون أسوشيتس السعودية (Amazon.sa)</strong>، دون الحاجة لإدخال مفاتيح الشبكات الأخرى حتى تقرر تفعيلها.
          </p>

          {/* Current Step Tracker */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">
            <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-400">المرحلة الأولى (الحالية)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-white">قاعدة البيانات السحابية</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">DATABASE_URL (PostgreSQL)</div>
            </div>

            <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-2xl">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-emerald-400">المرحلة الثانية (الحالية)</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs font-bold text-white">أول شبكة أفلييت</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">AMAZON_ASSOCIATES_TAG</div>
            </div>

            <div className="bg-slate-950/40 border border-slate-700/60 p-4 rounded-2xl opacity-75">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold text-slate-400">المرحلة الثالثة (اختيارية)</span>
                <span className="w-2 h-2 rounded-full bg-slate-600" />
              </div>
              <div className="text-xs font-bold text-slate-300">الشبكات ومزود البريد</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Awin, Impact, CJ, Email...</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          {[
            { id: "all", label: "جميع الخدمات", count: integrations.length },
            { id: "database", label: "قواعد البيانات", count: integrations.filter((i) => i.category === "database").length },
            { id: "affiliate", label: "شبكات الأفلييت", count: integrations.filter((i) => i.category === "affiliate").length },
            { id: "email", label: "البريد الإلكتروني", count: integrations.filter((i) => i.category === "email").length },
            { id: "ai", label: "الذكاء الاصطناعي", count: integrations.filter((i) => i.category === "ai").length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                categoryFilter === tab.id
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 border border-slate-700"
              }`}
            >
              <span>{tab.label}</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900/60 text-[10px]">{tab.count}</span>
            </button>
          ))}
        </div>

        <button
          onClick={fetchIntegrations}
          disabled={isLoading}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition-all cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-400" : ""}`} />
          <span>إعادة فحص كافة الخدمات</span>
        </button>
      </div>

      {/* Integrations List */}
      <div className="space-y-6">
        {filtered.map((item) => {
          const isExpanded = expandedCards[item.id] ?? false;
          const isTesting = testingId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-slate-800/90 border rounded-3xl overflow-hidden transition-all shadow-lg ${
                item.isInitialTarget
                  ? "border-emerald-500/40 ring-1 ring-emerald-500/20 bg-slate-800"
                  : "border-slate-700/80"
              }`}
            >
              {/* Card Header */}
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-white">{item.arabicName}</h3>
                        <span className="text-xs text-slate-400 font-mono">({item.name})</span>
                        {item.isInitialTarget && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            المرحلة الحالية
                          </span>
                        )}
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions (Toggle, Test, Expand) */}
                  <div className="flex items-center gap-2.5 self-end lg:self-center">
                    {/* Enable/Disable Toggle */}
                    <button
                      onClick={() => handleToggle(item.id, item.isEnabled)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                        item.isEnabled
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-slate-900 text-slate-500 border-slate-700"
                      }`}
                      title="تفعيل أو تعطيل هذا التكامل معمارياً"
                    >
                      {item.isEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                          <span>مُفعّل</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-slate-500" />
                          <span>معطّل</span>
                        </>
                      )}
                    </button>

                    {/* Test Live API Connection */}
                    <button
                      onClick={() => handleTestService(item.id)}
                      disabled={isTesting}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <Activity className={`w-3.5 h-3.5 ${isTesting ? "animate-spin text-white" : ""}`} />
                      <span>{isTesting ? "جارِ فحص API..." : "اختبار الاتصال المباشر"}</span>
                    </button>

                    {/* Expand/Collapse */}
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer"
                      title={isExpanded ? "طي التفاصيل" : "عرض تفاصيل المتغيرات"}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Status Message */}
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-700/80 text-xs text-slate-300 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">
                    <span className="font-bold text-slate-200">النتيجة الحالية: </span>
                    {item.statusMessage}
                    {item.lastTestedAt && (
                      <span className="text-[10px] text-slate-500 mr-2 font-mono">
                        (آخر فحص: {new Date(item.lastTestedAt).toLocaleTimeString("ar-SA")})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Variable Docs & Details (Expanded) */}
              {isExpanded && (
                <div className="border-t border-slate-700/80 bg-slate-900/40 p-6 space-y-4">
                  <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    <span>دليل متغيرات البيئة (Environment Variables) الخاصة بـ {item.arabicName}:</span>
                  </h4>

                  <div className="grid grid-cols-1 gap-4">
                    {item.variables.map((v) => (
                      <div
                        key={v.name}
                        className="bg-slate-900/90 border border-slate-700/90 rounded-2xl p-4 text-xs space-y-3"
                      >
                        {/* Header of Variable */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-black text-emerald-400 text-sm">{v.name}</span>
                            <button
                              onClick={() => copyText(v.name, v.name)}
                              className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                              title="نسخ اسم المتغير"
                            >
                              {copiedVar === v.name ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[10px] font-mono">
                              {v.type}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                v.isRequired
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                                  : "bg-slate-800 text-slate-400 border-slate-700"
                              }`}
                            >
                              {v.isRequired ? "إلزامي للتفعيل" : "اختياري"}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                v.isSet
                                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                  : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                              }`}
                            >
                              {v.isSet ? `موجود (${v.previewValue || "Set"})` : "غير مسجل في .env"}
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-slate-300 leading-relaxed">{v.description}</p>

                        {/* Exact Source & Dashboard Guide */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                            <div className="text-[10px] text-slate-500 font-bold mb-1">الخدمة المصدرية:</div>
                            <div className="text-slate-200 font-medium">{v.serviceName}</div>
                          </div>

                          <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                            <div className="text-[10px] text-slate-500 font-bold mb-1">المكان الدقيق في لوحة التحكم:</div>
                            <div className="text-emerald-300 font-mono text-[11px] leading-relaxed">
                              {v.dashboardLocation}
                            </div>
                          </div>
                        </div>

                        {/* Approval Requirements */}
                        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 flex items-start gap-2">
                          <Info className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-slate-300">متطلبات الحساب والموافقة: </span>
                            {v.approvalDetails}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
