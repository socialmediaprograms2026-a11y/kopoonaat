import React, { useState, useEffect } from "react";
import {
  Activity,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Clock,
  Filter
} from "lucide-react";
import { adminFetch } from "../../utils/apiClient";

interface IntegrationLog {
  id: string;
  provider: string;
  action: string;
  status: string;
  requestTime?: string;
  responseTime?: string;
  httpStatus?: number;
  error?: string;
  metadata?: any;
  createdAt: string;
}

export const IntegrationLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("ALL");

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminFetch("/api/admin/integrations/logs?limit=200");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (e) {
      console.error("Failed to load logs:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.error && log.error.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesProvider = providerFilter === "ALL" || log.provider.toLowerCase() === providerFilter.toLowerCase();

    return matchesSearch && matchesProvider;
  });

  const providers = Array.from(new Set(logs.map((l) => l.provider)));

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            سجلات التكاملات والـ Webhooks المباشرة
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            مراقبة شاملة لجميع أحداث الـ Webhooks، طلبات التوجيه /go/*، وتحديثات المزامنة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-emerald-600" : ""}`} />
            تحديث السجلات
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث في الإجراء أو الخطأ أو المزود..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={providerFilter}
          onChange={(e) => setProviderFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700"
        >
          <option value="ALL">جميع المزودين ({providers.length})</option>
          {providers.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200/60">
              <tr>
                <th className="p-3.5">الوقت</th>
                <th className="p-3.5">المزود / الشبكة</th>
                <th className="p-3.5">الإجراء</th>
                <th className="p-3.5 text-center">الحالة</th>
                <th className="p-3.5 text-center">رمز HTTP</th>
                <th className="p-3.5">التفاصيل والبيانات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    جاري تحميل سجلات التكاملات...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-sans">
                    لا توجد سجلات تطابق شروط البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString("ar-SA")}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 font-sans">{log.provider}</td>
                    <td className="p-3.5 text-slate-700 font-semibold">{log.action}</td>
                    <td className="p-3.5 text-center">
                      {log.status === "SUCCESS" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md font-bold font-sans">
                          <CheckCircle2 className="w-3 h-3" />
                          ناجح
                        </span>
                      ) : log.status === "WARNING" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded-md font-bold font-sans">
                          <AlertTriangle className="w-3 h-3" />
                          تنبيه
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 text-red-700 rounded-md font-bold font-sans">
                          <XCircle className="w-3 h-3" />
                          خطأ
                        </span>
                      )}
                    </td>
                    <td className="p-3.5 text-center text-slate-600">{log.httpStatus || 200}</td>
                    <td className="p-3.5 text-slate-600 max-w-xs truncate font-sans text-xs">
                      {log.error ? (
                        <span className="text-red-600 font-medium">{log.error}</span>
                      ) : log.metadata ? (
                        JSON.stringify(log.metadata)
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
