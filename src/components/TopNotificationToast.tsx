import React, { useState, useEffect } from "react";
import { SystemNotification } from "../types";
import { SYSTEM_NOTIFICATIONS } from "../data/notificationsData";
import { 
  Sparkles, 
  ShieldAlert, 
  TrendingUp, 
  Flame, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Layers,
  ArrowRight,
  AlertTriangle,
  Bot
} from "lucide-react";

interface TopNotificationToastProps {
  onNavigateTab: (tab: string) => void;
  onOpenAiModalWithPrompt?: (promptText: string) => void;
  isDismissed: boolean;
  onDismiss: () => void;
  onRestore: () => void;
}

export const TopNotificationToast: React.FC<TopNotificationToastProps> = ({
  onNavigateTab,
  onOpenAiModalWithPrompt,
  isDismissed,
  onDismiss,
  onRestore
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedNotification, setSelectedNotification] = useState<SystemNotification | null>(null);

  const notifications = SYSTEM_NOTIFICATIONS;
  const currentNotif = notifications[currentIndex];

  // Auto-cycle through notifications
  useEffect(() => {
    if (isDismissed || isPaused || notifications.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % notifications.length);
    }, 8000);

    return () => clearInterval(timer);
  }, [isDismissed, isPaused, notifications.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % notifications.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + notifications.length) % notifications.length);
  };

  const handleActionClick = (notif: SystemNotification) => {
    if (notif.targetTab) {
      onNavigateTab(notif.targetTab);
    }
  };

  const getCategoryTheme = (category: SystemNotification["category"]) => {
    switch (category) {
      case "google_update":
        return {
          barBg: "from-amber-50 via-orange-50/50 to-white",
          border: "border-amber-200",
          badgeBg: "bg-amber-100 text-amber-800 border-amber-300",
          icon: ShieldAlert,
          iconColor: "text-amber-600"
        };
      case "affiliate_opportunity":
        return {
          barBg: "from-emerald-50 via-teal-50/50 to-white",
          border: "border-emerald-200",
          badgeBg: "bg-emerald-100 text-emerald-800 border-emerald-300",
          icon: Sparkles,
          iconColor: "text-emerald-600"
        };
      case "keyword_spike":
        return {
          barBg: "from-teal-50 via-cyan-50/50 to-white",
          border: "border-teal-200",
          badgeBg: "bg-teal-100 text-teal-800 border-teal-300",
          icon: Flame,
          iconColor: "text-teal-600"
        };
      case "algorithm_alert":
      default:
        return {
          barBg: "from-cyan-50 via-sky-50/50 to-white",
          border: "border-cyan-200",
          badgeBg: "bg-cyan-100 text-cyan-800 border-cyan-300",
          icon: TrendingUp,
          iconColor: "text-cyan-600"
        };
    }
  };

  if (isDismissed) {
    return null;
  }

  const theme = getCategoryTheme(currentNotif.category);
  const CategoryIcon = theme.icon;

  return (
    <>
      {/* Top Banner Toast Container */}
      <aside
        id="top-system-toast"
        aria-label="تنبيهات وتحديثات السيو والأفلييت"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className={`relative z-50 bg-gradient-to-r ${theme.barBg} border-b ${theme.border} text-right transition-all duration-300 shadow-sm backdrop-blur-md`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-2">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Left/Content Section */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto overflow-hidden">
              
              {/* Pulse Icon */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-xs">
                  <CategoryIcon className={`w-4 h-4 ${theme.iconColor}`} />
                </div>
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
                </span>
              </div>

              {/* Tag & Message */}
              <div className="flex items-center flex-wrap gap-2 text-xs truncate">
                <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] sm:text-[11px] border shrink-0 ${theme.badgeBg}`}>
                  {currentNotif.badge}
                </span>

                <span className="font-semibold text-slate-900 truncate text-xs sm:text-sm">
                  {currentNotif.title}
                </span>

                <span className="hidden md:inline text-slate-600 text-xs">
                  — {currentNotif.message.slice(0, 85)}...
                </span>
              </div>
            </div>

            {/* Right / Controls & Action Button */}
            <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              
              {/* Slide Counter & Arrows */}
              <div className="flex items-center gap-1 text-slate-500 text-xs">
                <button
                  onClick={handleNext}
                  title="الإشعار السابق"
                  className="p-1 rounded-lg hover:bg-white/80 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-slate-700 font-bold px-1">
                  {currentIndex + 1}/{notifications.length}
                </span>
                <button
                  onClick={handlePrev}
                  title="الإشعار التالي"
                  className="p-1 rounded-lg hover:bg-white/80 text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* View Details / Action Button */}
              <button
                onClick={() => setSelectedNotification(currentNotif)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-slate-50 text-emerald-800 border border-slate-200 text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <span>تفاصيل الإجراء</span>
                <ArrowRight className="w-3 h-3" />
              </button>

              {/* Close Button */}
              <button
                onClick={onDismiss}
                title="إخفاء شريط الإشعارات"
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white/80 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

            </div>

          </div>
        </div>
      </aside>

      {/* Detailed Modal Dialog */}
      {selectedNotification && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-right my-8 max-h-[90vh] overflow-y-auto">
            
            {/* Close Modal Button */}
            <button
              onClick={() => setSelectedNotification(null)}
              className="absolute left-6 top-6 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getCategoryTheme(selectedNotification.category).badgeBg}`}>
                  {selectedNotification.badge}
                </span>
                <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {selectedNotification.timeAgo}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {selectedNotification.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <span>المصدر المعتمد:</span>
                <strong className="text-slate-700">{selectedNotification.source}</strong>
              </p>
            </div>

            {/* Content Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4.5 mb-5 space-y-3 text-xs leading-relaxed text-slate-700">
              <p className="font-medium text-slate-800">
                {selectedNotification.details.summary}
              </p>
              <div className="pt-3 border-t border-slate-200">
                <strong className="text-emerald-700 block mb-1">تحليل الأثر على السيو والأرباح:</strong>
                <p className="text-slate-600">{selectedNotification.details.impactAnalysis}</p>
              </div>
              <div className="pt-3 border-t border-slate-200">
                <strong className="text-teal-700 block mb-1">التوصية المباشرة لمحرك بحث Google:</strong>
                <p className="text-slate-600">{selectedNotification.details.recommendedAction}</p>
              </div>
            </div>

            {/* Affected Niches */}
            <div className="mb-5">
              <div className="text-xs font-bold text-slate-700 mb-2">النيشات المعنية بهذا التحديث:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedNotification.details.affectedNiches.map((n, i) => (
                  <span key={i} className="text-xs bg-slate-100 text-slate-800 border border-slate-200 px-2.5 py-1 rounded-xl font-medium">
                    {n}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Checklist */}
            <div className="mb-6 bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4">
              <div className="text-xs font-bold text-emerald-800 mb-2.5">خطوات التنفيذ الموصى بها الآن:</div>
              <ul className="space-y-2 text-xs text-slate-700">
                {selectedNotification.details.actionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              
              {selectedNotification.targetTab && (
                <button
                  onClick={() => {
                    handleActionClick(selectedNotification);
                    setSelectedNotification(null);
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  <span>{selectedNotification.actionLabel}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {onOpenAiModalWithPrompt && (
                <button
                  onClick={() => {
                    onOpenAiModalWithPrompt(selectedNotification.details.affectedNiches[0] || selectedNotification.title);
                    setSelectedNotification(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <Bot className="w-3.5 h-3.5 text-emerald-700" />
                  <span>فحص بالذكاء الاصطناعي</span>
                </button>
              )}

              <button
                onClick={() => setSelectedNotification(null)}
                className="w-full sm:w-auto px-4 py-2 text-xs text-slate-500 hover:text-slate-900 transition-colors"
              >
                إغلاق
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
