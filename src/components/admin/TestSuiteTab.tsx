import React, { useState } from "react";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  RefreshCw,
  AlertTriangle,
  Zap,
  Activity,
  Lock,
  Link as LinkIcon,
  MousePointerClick,
  FileCheck
} from "lucide-react";
import { adminFetch } from "../../utils/apiClient";

interface TestResult {
  name: string;
  category: "LINK_GENERATION" | "CLICK_TRACKING" | "COPY_TRACKING" | "WEBHOOK_IDEMPOTENCY" | "COMMISSION_CALCULATION" | "SECURITY_MASKING" | "PROVIDER_RESILIENCE" | "REVENUE_SYNC" | "SEARCH_NORMALIZATION" | "SEO_COMPLIANCE" | "COUPON_LIFECYCLE" | string;
  status: "PASSED" | "FAILED";
  durationMs: number;
  details: string;
  error?: string;
}

interface TestSuiteReport {
  timestamp: string;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  overallStatus: "ALL_PASSED" | "SOME_FAILED";
  results: TestResult[];
}

export const TestSuiteTab: React.FC = () => {
  const [report, setReport] = useState<TestSuiteReport | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const runTestSuite = async () => {
    setIsRunning(true);
    try {
      const res = await adminFetch("/api/admin/test-suite/run", { method: "POST" });
      const data = await res.json();
      setReport(data);
    } catch (err) {
      console.error("Failed to run test suite:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "LINK_GENERATION":
        return <LinkIcon className="w-4 h-4 text-blue-500" />;
      case "CLICK_TRACKING":
        return <MousePointerClick className="w-4 h-4 text-indigo-500" />;
      case "COPY_TRACKING":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "WEBHOOK_IDEMPOTENCY":
        return <Activity className="w-4 h-4 text-emerald-500" />;
      case "COMMISSION_CALCULATION":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "SECURITY_MASKING":
        return <Lock className="w-4 h-4 text-purple-500" />;
      case "PROVIDER_RESILIENCE":
        return <ShieldCheck className="w-4 h-4 text-teal-500" />;
      case "SEARCH_NORMALIZATION":
        return <Zap className="w-4 h-4 text-sky-500" />;
      case "SEO_COMPLIANCE":
        return <FileCheck className="w-4 h-4 text-green-500" />;
      case "REVENUE_SYNC":
        return <RefreshCw className="w-4 h-4 text-cyan-500" />;
      case "COUPON_LIFECYCLE":
        return <CheckCircle2 className="w-4 h-4 text-amber-500" />;
      default:
        return <FileCheck className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            منظومة الفحص والتحقق الآلي المستمر
          </div>
          <h2 className="text-xl md:text-2xl font-black">
            فحص توافق الروابط، منع التكرار، والتحقق من التوقيعات الرقمية
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
            يقوم هذا الاختبار بمحاكاة كاملة لدورة حياة التسويق بالعمولة: توليد روابط التتبع المخصصة عبر الـ Adapters، التقاط وسوم UTM، التحقق من التوقيعات الرقمية، منع الازدواجية في Webhooks، وحساب العمولات.
          </p>
        </div>

        <div>
          <button
            onClick={runTestSuite}
            disabled={isRunning}
            className="w-full md:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                جاري تشغيل الفحوصات...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                تشغيل الفحص الشامل الآن
              </>
            )}
          </button>
        </div>
      </div>

      {/* Results Section */}
      {report && (
        <div className="space-y-6">
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  report.overallStatus === "ALL_PASSED" ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
                }`}
              >
                {report.overallStatus === "ALL_PASSED" ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">حالة المنظومة</div>
                <div className="text-lg font-black text-slate-900">
                  {report.overallStatus === "ALL_PASSED" ? "جميع الفحوصات ناجحة 100%" : "يوجد فحوصات تتطلب مراجعة"}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">الفحوصات الناجحة</div>
                <div className="text-lg font-black text-emerald-600">
                  {report.passedTests} من أصل {report.totalTests}
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                <Zap className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <div className="text-xs text-slate-500 font-semibold uppercase">تاريخ آخر فحص</div>
                <div className="text-sm font-bold text-slate-900">
                  {new Date(report.timestamp).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </div>
              </div>
            </div>
          </div>

          {/* Test Items Details */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
            {report.results.map((test, index) => (
              <div key={index} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start gap-3.5">
                  <div className="mt-0.5 p-2 bg-slate-100 rounded-xl">
                    {getCategoryIcon(test.category)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-sm">{test.name}</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-md font-mono">
                        {test.durationMs}ms
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{test.details}</p>
                    {test.error && (
                      <div className="text-xs text-red-600 bg-red-50 p-2 rounded-lg font-mono mt-1">
                        {test.error}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {test.status === "PASSED" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-lg">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      ناجح ومطابق
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg">
                      <XCircle className="w-3.5 h-3.5" />
                      فشل الاختبار
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default Instruction Banner if not run yet */}
      {!report && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto opacity-80" />
          <h3 className="text-lg font-bold text-slate-900">جاهز لتشغيل الفحص الشامل</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            انقر على زر "تشغيل الفحص الشامل الآن" للتحقق من سلامة بناء الروابط، عزل الـ Adapters، ومعالجة التحويلات بدون أخطاء.
          </p>
        </div>
      )}
    </div>
  );
};
