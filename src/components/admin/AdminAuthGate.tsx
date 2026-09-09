import React, { useState, useEffect } from "react";
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  KeyRound, 
  ArrowRight, 
  LogIn, 
  LogOut, 
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Zap,
  Globe
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { AdminDashboard } from "../AdminDashboard";
import { 
  getStoredAdminKey, 
  setStoredAdminKey, 
  clearStoredAdminKey, 
  adminFetchJson 
} from "../../utils/apiClient";

interface AdminAuthGateProps {
  onBackToPublic: () => void;
}

export const AdminAuthGate: React.FC<AdminAuthGateProps> = ({ onBackToPublic }) => {
  const { user, isAdmin: isFirebaseAdmin, loading: authLoading, signInWithGoogle, logout } = useAuth();
  
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [keyAuthStatus, setKeyAuthStatus] = useState<"idle" | "validating" | "success" | "error">("idle");
  const [keyErrorMessage, setKeyErrorMessage] = useState("");
  const [isKeyAdmin, setIsKeyAdmin] = useState<boolean>(() => {
    return Boolean(getStoredAdminKey());
  });
  const [keyAdminUser, setKeyAdminUser] = useState<any>(null);

  // Validate stored admin key on mount if present
  useEffect(() => {
    const stored = getStoredAdminKey();
    if (stored) {
      adminFetchJson("/api/admin/auth/me")
        .then((res) => {
          if (res?.success && res?.user) {
            setIsKeyAdmin(true);
            setKeyAdminUser(res.user);
          } else {
            clearStoredAdminKey();
            setIsKeyAdmin(false);
          }
        })
        .catch(() => {
          clearStoredAdminKey();
          setIsKeyAdmin(false);
        });
    }
  }, []);

  const handleKeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKeyInput.trim()) return;

    setKeyAuthStatus("validating");
    setKeyErrorMessage("");

    try {
      setStoredAdminKey(apiKeyInput.trim(), false);
      const res = await adminFetchJson("/api/admin/auth/me");
      if (res?.success && res?.user) {
        setIsKeyAdmin(true);
        setKeyAdminUser(res.user);
        setKeyAuthStatus("success");
      } else {
        throw new Error("المفتاح غير معتمد كمسؤول نظام");
      }
    } catch (err: any) {
      clearStoredAdminKey();
      setIsKeyAdmin(false);
      setKeyAuthStatus("error");
      setKeyErrorMessage(err.message || "مفتاح الإدارة غير صالح أو منتهي الصلاحية.");
    }
  };

  const handleKeyLogout = () => {
    clearStoredAdminKey();
    setIsKeyAdmin(false);
    setKeyAdminUser(null);
    setApiKeyInput("");
    setKeyAuthStatus("idle");
  };

  const isAuthorized = isFirebaseAdmin || isKeyAdmin;

  // 1. Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 animate-pulse">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">فحص صلاحيات الوصول والأمان</h2>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">جارٍ التحقق من جلسة المصادقة وصلاحيات الإدارة المشفرة...</p>
      </div>
    );
  }

  // 2. Fully authorized Admin: Render Admin Dashboard
  if (isAuthorized) {
    return (
      <div className="relative">
        {/* If logged in via Admin Key, show indicator banner */}
        {isKeyAdmin && !isFirebaseAdmin && (
          <div className="bg-amber-950 border-b border-amber-800 text-amber-200 px-4 py-2 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>جلسة مسؤول عبر مفتاح الإدارة المباشر (API Key)</span>
              <span className="font-mono text-[10px] bg-amber-900/60 px-1.5 py-0.5 rounded border border-amber-700">
                {keyAdminUser?.role || "super_admin"}
              </span>
            </div>
            <button
              onClick={handleKeyLogout}
              className="hover:text-white underline text-[11px]"
            >
              إنهاء الجلسة
            </button>
          </div>
        )}
        <AdminDashboard />
      </div>
    );
  }

  // 3. User is signed in with Firebase, but lacks Admin Role (403 Forbidden Screen)
  if (user && !isFirebaseAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-rose-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
          
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />
          
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mx-auto mb-5 shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-mono tracking-widest text-rose-400 uppercase font-bold bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 inline-block mb-3">
            403 • وصول محظور (Forbidden)
          </span>

          <h2 className="text-xl font-black text-white mb-2">
            غير مصرح بالدخول للوحة التحكم
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed mb-6">
            الحساب المسجل حالياً <strong className="text-slate-200">{user.email}</strong> لا يمتلك صلاحيات إدارة النظام. يُسمح فقط للمسؤولين المعتمدين بالوصول إلى هذه اللوحة.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => logout()}
              className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج والتبديل لحساب المشرف</span>
            </button>

            <button
              onClick={onBackToPublic}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى الموقع العام</span>
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-800 text-[11px] text-slate-500">
            إذا كنت تعتقد أن هذا خطأ، يرجى مراجعة المشرف الرئيسي عبر البريد المعتمد.
          </div>
        </div>
      </div>
    );
  }

  // 4. Unauthenticated Visitor on /admin: Dedicated Secure Admin Portal Login
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 selection:bg-emerald-500 selection:text-slate-950 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-center relative overflow-hidden">
        
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500" />

        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-lg shadow-emerald-500/10">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <span className="text-[11px] font-mono tracking-widest text-emerald-400 uppercase font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block mb-3">
          Restricted Admin Access
        </span>

        <h1 className="text-xl font-black text-white mb-1">
          بوابة إدارة وتحكم المنظومة
        </h1>

        <p className="text-xs text-slate-400 leading-relaxed mb-6">
          منطقة مخصصة للمسؤولين المعتمدين والمشرفين التقنيين. يتطلب الدخول توثيقاً أمنياً معتمداً.
        </p>

        {/* Primary Action: Google Admin Sign In */}
        <div className="space-y-4">
          <button
            onClick={() => signInWithGoogle()}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer transform active:scale-98"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>تسجيل الدخول بحساب Google المشرف</span>
          </button>

          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[10px] text-slate-500 font-mono uppercase tracking-wider">
              أو عبر مفتاح الإدارة
            </span>
          </div>

          {/* Secondary Action: Direct Admin API Key */}
          <form onSubmit={handleKeyLogin} className="space-y-3">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="أدخل مفتاح الإدارة المباشر (Admin Secret Key)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-xs text-slate-200 placeholder:text-slate-600 rounded-xl pr-10 pl-3 py-2.5 outline-none transition-all font-mono"
              />
            </div>

            {keyAuthStatus === "error" && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] text-right flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{keyErrorMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={keyAuthStatus === "validating" || !apiKeyInput.trim()}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-bold transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>{keyAuthStatus === "validating" ? "جارِ التحقق..." : "تأكيد الدخول بالمفتاح"}</span>
            </button>
          </form>

          {/* Back to Public Site */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={onBackToPublic}
              className="w-full py-2.5 px-4 rounded-xl hover:bg-slate-800/50 text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة إلى الموقع العام للمستخدمين</span>
            </button>
          </div>

        </div>

        <div className="mt-6 text-[10px] text-slate-600 font-mono">
          Strict Security Mode • RBAC Active • Non-Indexed Route
        </div>

      </div>
    </div>
  );
};
