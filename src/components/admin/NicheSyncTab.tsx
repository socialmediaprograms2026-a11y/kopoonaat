import React, { useState, useEffect } from "react";
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Search,
  ExternalLink,
  Layers,
  Globe2,
  AlertCircle,
  Database,
  ArrowUpRight,
  ShieldCheck,
  Check
} from "lucide-react";
import { adminFetch } from "../../utils/apiClient";

interface TrendingNiche {
  id: string;
  name: string;
  englishName: string;
  category: string;
  monthlySearchVolume: string;
  opportunityScore: number;
  competitionLevel: "سهل" | "متوسط" | "مرتفع" | "شرس";
  growthTrend: string;
  topKeywords: string[];
  recommendedNetworks: string[];
  averageCommission: string;
  market: "mena" | "global" | "all";
  reasonForTrend: string;
  lastAnalyzedAt: string;
}

interface NicheSyncJobReport {
  id: string;
  jobName: string;
  status: "SUCCESS" | "FAILED" | "IN_PROGRESS";
  startedAt: string;
  finishedAt: string;
  durationMs: number;
  nichesCount: number;
  topTrendingNiche: string;
  averageOpportunityScore: number;
  totalSearchVolumeEstimate: string;
  summary: string;
  triggeredBy: "CRON_SCHEDULE" | "MANUAL_ADMIN" | "INITIAL_BOOT";
  items: TrendingNiche[];
  aiModelUsed?: string;
}

export const NicheSyncTab: React.FC = () => {
  const [niches, setNiches] = useState<TrendingNiche[]>([]);
  const [latestJob, setLatestJob] = useState<NicheSyncJobReport | null>(null);
  const [history, setHistory] = useState<NicheSyncJobReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "mena" | "global">("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await adminFetch("/api/admin/trending-niches");
      if (res.ok) {
        const data = await res.json();
        setNiches(data.niches || []);
        setLatestJob(data.latestJob || null);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Failed to load trending niches admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTriggerSyncNow = async () => {
    try {
      setSyncing(true);
      setSyncSuccessMsg(null);
      const res = await adminFetch("/api/admin/trending-niches/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.success && data.report) {
        setLatestJob(data.report);
        if (data.niches) setNiches(data.niches);
        setSyncSuccessMsg(`اكتمل التحديث بنجاح خلال ${data.report.durationMs}ms! تم تحديث ${data.report.nichesCount} نيشاً.`);
        setTimeout(() => setSyncSuccessMsg(null), 6000);
      } else {
        alert("تعذر إكمال التحديث: " + (data.error || "خطأ غير معروف"));
      }
    } catch (err: any) {
      alert("خطأ أثناء الاتصال بالخادم: " + err.message);
    } finally {
      setSyncing(false);
      loadData();
    }
  };

  const filteredNiches = niches.filter(n => {
    if (selectedFilter === "all") return true;
    return n.market === selectedFilter || n.market === "all";
  });

  const getCompetitionBadge = (level: string) => {
    switch (level) {
      case "سهل":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "متوسط":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "مرتفع":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "شرس":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Quick Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-950/60 border border-slate-800 shadow-xl backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20 shrink-0">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <h2 className="text-lg sm:text-xl font-black text-white">
                وظيفة رصد وتحديث النيشات بالذكاء الاصطناعي
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Background Job Engine
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-3xl">
              وظيفة خلفية مجدولة دورياً تعمل تلقائياً كل 45 دقيقة لرصد أكثر مجالات التجارة الإلكترونية والأفلييت رواجاً في قوقل وسوق الخليج، وتحديث قاعدة البيانات ومؤشرات الفرص بصورة لحظية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleTriggerSyncNow}
            disabled={syncing}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
            <span>{syncing ? "جاري تنفيذ التحديث الفوري..." : "تشغيل التحديث الفوري الآن"}</span>
          </button>
        </div>
      </div>

      {syncSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold flex items-center gap-3 shadow-md animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{syncSuccessMsg}</span>
        </div>
      )}

      {/* Latest Run Report Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white">
              تقرير آخر تنفيذ للوظيفة الخلفية (Latest Background Sync Report)
            </h3>
          </div>
          {latestJob && (
            <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              مكتمل بنجاح (SUCCESS)
            </span>
          )}
        </div>

        {latestJob ? (
          <div className="space-y-4">
            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">وقت التحديث الأخير:</span>
                <span className="text-xs sm:text-sm font-black text-white font-mono">
                  {new Date(latestJob.finishedAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {new Date(latestJob.finishedAt).toLocaleDateString("ar-SA")}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">المدة المستغرقة:</span>
                <span className="text-xs sm:text-sm font-black text-emerald-400 font-mono">
                  {latestJob.durationMs} ms
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">سرعة استجابة فائقة</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">طريقة التشغيل:</span>
                <span className="text-xs sm:text-sm font-black text-teal-300">
                  {latestJob.triggeredBy === "CRON_SCHEDULE"
                    ? "مجدول آلياً (Cron Job)"
                    : latestJob.triggeredBy === "MANUAL_ADMIN"
                    ? "يدوي من لوحة الإدارة"
                    : "إقلاع السيرفر (Boot)"}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {latestJob.aiModelUsed || "Gemini 3.8 Flash"}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block mb-1">النيش المتصدر:</span>
                <span className="text-xs sm:text-sm font-black text-amber-400 truncate block">
                  {latestJob.topTrendingNiche}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  متوسط الفرصة: {latestJob.averageOpportunityScore}%
                </span>
              </div>
            </div>

            {/* AI Summary Box */}
            <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-800/30 text-xs text-slate-300 leading-relaxed flex items-start gap-3">
              <Database className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block mb-0.5 font-bold">ملخص السجل المحفوظ في قاعدة البيانات:</strong>
                {latestJob.summary}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            جاري تهيئة الوظيفة الخلفية وجلب التقرير...
          </div>
        )}
      </div>

      {/* Synced Niches in Database */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-black text-white">
              بيانات النيشات الأكثر رواجاً المحدثة في قاعدة البيانات ({filteredNiches.length})
            </h3>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
            <button
              onClick={() => setSelectedFilter("all")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedFilter === "all" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              الكل ({niches.length})
            </button>
            <button
              onClick={() => setSelectedFilter("mena")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedFilter === "mena" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              الخليج والسعودية (MENA)
            </button>
            <button
              onClick={() => setSelectedFilter("global")}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                selectedFilter === "global" ? "bg-emerald-500 text-slate-950" : "text-slate-400 hover:text-white"
              }`}
            >
              عالمي (Global)
            </button>
          </div>
        </div>

        {/* Niches Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNiches.map((niche, idx) => (
            <div
              key={niche.id || idx}
              className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3.5 shadow-sm relative overflow-hidden group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                      {niche.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCompetitionBadge(niche.competitionLevel)}`}>
                      تنافس: {niche.competitionLevel}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                      {niche.growthTrend}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition-colors">
                    {niche.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 font-mono">
                    {niche.englishName}
                  </p>
                </div>

                <div className="text-left shrink-0 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">مؤشر الفرصة</span>
                  <span className="text-base font-black text-emerald-400 font-mono">
                    {niche.opportunityScore}%
                  </span>
                </div>
              </div>

              {/* Progress bar of opportunity */}
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${niche.opportunityScore}%` }}
                ></div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/60">
                {niche.reasonForTrend}
              </p>

              {/* Metrics & Keywords */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block">حجم البحث الشهري:</span>
                  <span className="text-white font-bold font-mono">{niche.monthlySearchVolume}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
                  <span className="text-slate-400 block">متوسط العمولات:</span>
                  <span className="text-teal-300 font-bold truncate block">{niche.averageCommission}</span>
                </div>
              </div>

              {/* Keywords */}
              <div>
                <span className="text-[10px] text-slate-400 block mb-1 font-bold">أبرز الكلمات المفتاحية في قوقل:</span>
                <div className="flex flex-wrap gap-1.5">
                  {niche.topKeywords.map((kw, kIdx) => (
                    <span
                      key={kIdx}
                      className="px-2 py-0.5 rounded-lg bg-slate-900 text-slate-300 text-[10px] border border-slate-800"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Networks */}
              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800/80 text-slate-400">
                <span>الشبكات: <strong className="text-slate-200">{niche.recommendedNetworks.join("، ")}</strong></span>
                <span className="text-[10px] text-slate-500 font-mono">
                  تم التحديث: {new Date(niche.lastAnalyzedAt).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History Table */}
      {history.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-950/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            <h3 className="text-sm font-black text-white">
              سجل تشغيلات الوظيفة الخلفية السابقة (Background Sync History)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">معرف التشغيل</th>
                  <th className="p-3">وقت الانتهاء</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3">النيشات المحدثة</th>
                  <th className="p-3">المدة</th>
                  <th className="p-3">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.slice(0, 8).map((job) => (
                  <tr key={job.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-mono text-slate-400">{job.id}</td>
                    <td className="p-3 text-slate-300">
                      {new Date(job.finishedAt).toLocaleString("ar-SA")}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                        {job.triggeredBy}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-white">{job.nichesCount} نيشات</td>
                    <td className="p-3 font-mono text-emerald-400">{job.durationMs} ms</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {job.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
