'use client';

import { useState, useRef, useEffect } from 'react';
import { ShieldCheck, LogIn, AlertCircle } from 'lucide-react';
import { loginAction } from '@/app/actions/auth-actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function LoginPage() {
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { t } = useLanguage();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(e => console.log("Video play error:", e));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-900">
      
      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        poster="/videoframe_6695.png"
        className="absolute inset-0 w-full h-full object-cover z-0"
      >
        <source src="/homepge-pc.webm" type="video/webm" />
      </video>
      
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-20">
        <div className="mx-auto w-20 h-20 bg-white rounded-3xl shadow-xl flex items-center justify-center border border-slate-100 rotate-3 hover:rotate-0 transition-transform">
          <ShieldCheck className="w-10 h-10 text-kst-blue" />
        </div>
        <h2 className="mt-8 text-center text-3xl font-black text-white tracking-tight">
          KST 儀器量測校正系統
        </h2>
        <p className="mt-2 text-center text-sm text-slate-300 font-medium">
          系統身分驗證 / Identity Verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-20">
        <div className="bg-white py-10 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-100 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-kst-blue via-indigo-500 to-emerald-400" />

          {error && (
            <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold flex items-start gap-3 border border-red-100 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                登入帳號 / Account
              </label>
              <div className="relative">
                <input
                  id="account"
                  name="account"
                  type="text"
                  required
                  autoFocus
                  className="appearance-none block w-full px-5 py-4 border border-slate-200 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-kst-blue/10 focus:border-kst-blue transition-all sm:text-sm font-medium bg-slate-50 focus:bg-white"
                  placeholder="admin"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                登入密碼 / Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full px-5 py-4 border border-slate-200 rounded-2xl placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-kst-blue/10 focus:border-kst-blue transition-all sm:text-sm font-medium bg-slate-50 focus:bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-4 px-4 border border-transparent rounded-2xl shadow-xl shadow-kst-blue/20 text-sm font-bold text-white bg-kst-blue hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-kst-blue/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? '登入中...' : (
                  <>
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" /> 
                    登入系統 / Sign In
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
