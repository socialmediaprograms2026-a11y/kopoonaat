import React, { useState } from "react";
import { Search, TrendingUp, Compass, Cpu, Calculator, ShieldCheck, Sparkles, Bell, Check, ArrowRight, Tag, ShoppingBag, DollarSign, LogIn, LogOut, User as UserIcon, Target } from "lucide-react";
import { SYSTEM_NOTIFICATIONS } from "../data/notificationsData";
import { useAuth } from "../context/AuthContext";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAiModal: () => void;
  onOpenSearchModal?: () => void;
  onOpenAffiliateModal?: () => void;
  configuredAffiliateCount?: number;
  isToastDismissed?: boolean;
  onToggleToast?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onOpenAiModal,
  onOpenSearchModal,
  onOpenAffiliateModal,
  configuredAffiliateCount = 0,
  isToastDismissed,
  onToggleToast,
  unreadCount = SYSTEM_NOTIFICATIONS.length
}) => {
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const { user, isAdmin, signInWithGoogle, logout, loading: authLoading } = useAuth();

  const navItems = [
    { id: "coupons", label: "كوبونات وعروض المتاجر 🇸🇦", icon: Tag },
    { id: "products", label: "عروض المنتجات المخفضة 🔥", icon: ShoppingBag },
    { id: "competitors", label: "مراقبة المنافسين 🎯", icon: Target },
    { id: "models", label: "أفضل النماذج الناجحة", icon: Compass },
    { id: "niches", label: "النيشات وأحجام البحث", icon: TrendingUp },
    { id: "seo-playbook", label: "خارطة تصدر قوقل", icon: ShieldCheck },
    { id: "calculator", label: "حاسبة الأرباح والزيارات", icon: Calculator },
    { id: "networks", label: "شبكات الأفلييت للمتاجر", icon: Cpu }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/20 text-white font-black text-xl">
              G
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg tracking-tight text-slate-900">رادار سيو الأفلييت</span>
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Google SEO 2026
                </span>
              </div>
              <p className="text-xs text-slate-500">استخبارات نماذج مواقع التسويق بالعمولة متعددة المتاجر</p>
            </div>
          </div>

          {/* Nav items */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Area: Search, Notifications Bell & AI Analyzer */}
          <div className="flex items-center gap-2.5 relative">
            
            {/* Quick Smart Search Button */}
            {onOpenSearchModal && (
              <button
                onClick={() => onOpenSearchModal()}
                className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-colors shadow-xs cursor-pointer group"
                title="البحث الذكي في المتاجر والكوبونات (Ctrl + K)"
              >
                <Search className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <span>بحث سريع...</span>
                <span className="bg-white border border-slate-300 text-[10px] font-mono px-1.5 py-0.5 rounded text-slate-500">
                  Ctrl+K
                </span>
              </button>
            )}

            {/* Notifications Center Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  if (onToggleToast && isToastDismissed) {
                    onToggleToast();
                  } else {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                  }
                }}
                title="تحديثات معايير سيو قوقل وفرص الأفلييت"
                className={`relative p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                  !isToastDismissed
                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-600/10"
                    : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
                }`}
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-emerald-600 text-white font-black text-[10px]">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Quick Dropdown */}
              {showNotificationsDropdown && (
                <div 
                  className="absolute left-0 sm:left-auto sm:right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl p-4 text-right z-50 animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-emerald-600" />
                      تحديثات السيو وفرص الأفلييت
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      {SYSTEM_NOTIFICATIONS.length} تنبيهات نشطة
                    </span>
                  </div>

                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {SYSTEM_NOTIFICATIONS.map((notif) => (
                      <div 
                        key={notif.id}
                        onClick={() => {
                          if (notif.targetTab) {
                            setActiveTab(notif.targetTab);
                          }
                          setShowNotificationsDropdown(false);
                          if (isToastDismissed && onToggleToast) {
                            onToggleToast();
                          }
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-200/80 hover:border-emerald-300 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {notif.badge}
                          </span>
                          <span className="text-[10px] text-slate-400">{notif.timeAgo}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{notif.title}</h4>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    {isToastDismissed && onToggleToast && (
                      <button
                        onClick={() => {
                          onToggleToast();
                          setShowNotificationsDropdown(false);
                        }}
                        className="text-emerald-700 hover:text-emerald-800 font-bold text-xs flex items-center gap-1"
                      >
                        <span>إظهار الشريط العلوي</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-slate-500 hover:text-slate-800 text-xs mr-auto"
                    >
                      إغلاق القائمة
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Monetization & Affiliate Hub Button */}
            {onOpenAffiliateModal && (
              <button
                onClick={onOpenAffiliateModal}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 transition-colors shadow-xs cursor-pointer"
                title="تفعيل أرباحك وربط أكوادك وروابطك الخاصة"
              >
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="hidden md:inline">تفعيل أرباحي الحقيقية</span>
                <span className="md:hidden">أرباحي</span>
                {configuredAffiliateCount > 0 && (
                  <span className="bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {configuredAffiliateCount}
                  </span>
                )}
              </button>
            )}

            {/* Admin Portal Quick Access (Authorized Admins Only) */}
            {isAdmin && (
              <button
                onClick={() => setActiveTab("admin")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300"
                }`}
                title="لوحة تحكم المسؤول (Admin Portal)"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">لوحة الإدارة</span>
              </button>
            )}

            {/* AI Analyzer Action Button */}
            <button
              onClick={onOpenAiModal}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all transform active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">تحليل نيش</span>
            </button>

            {/* Firebase Auth User Control */}
            {user ? (
              <div className="flex items-center gap-2 pr-2 border-r border-slate-200">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "User"}
                    className="w-8 h-8 rounded-full border border-emerald-500 shadow-xs"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300">
                    <UserIcon className="w-4 h-4" />
                  </div>
                )}
                <div className="hidden xl:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user.displayName || user.email?.split("@")[0]}
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {isAdmin ? "مدير النظام (Admin)" : "عضو مسجل"}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  title="تسجيل الخروج"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => signInWithGoogle()}
                disabled={authLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                title="تسجيل الدخول باستخدام حساب قوقل لحفظ المفضلة والمزامنة"
              >
                <LogIn className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">دخول قوقل</span>
              </button>
            )}
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center justify-between overflow-x-auto py-2.5 border-t border-slate-200 scrollbar-none gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${
                  isActive
                    ? "bg-emerald-600 text-white font-bold"
                    : "text-slate-700 bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
