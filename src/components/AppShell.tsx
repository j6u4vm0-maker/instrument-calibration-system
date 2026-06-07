'use client';

import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Settings, 
  Database, 
  User, 
  Bell,
  Search,
  Building,
  FileText,
  ShieldCheck,
  Building2,
  Languages,
  Hammer,
  Package
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from '@/lib/i18n/LanguageContext';
import SettingsModal from '@/components/SettingsModal';
import { NotificationBell } from '@/components/NotificationBell';
import { usePathname } from 'next/navigation';
import { logoutAction } from '@/app/actions/auth-actions';

// Helper for bilingual labels - Static version using already translated strings
const BilingualLabel = ({ zh, en }: { zh: string, en: string }) => {
  return (
    <span className="flex flex-col items-start leading-none">
      <span className="text-[13px] font-bold">
        {zh}
      </span>
      <span className="text-[10px] font-medium opacity-50 uppercase tracking-tighter mt-0.5">
        {en}
      </span>
    </span>
  );
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { t, role, language, setLanguage } = useLanguage();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const pathname = usePathname();

  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111827] text-slate-300 flex flex-col fixed h-screen z-50 print:hidden">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-500 rounded flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)]">
              <div className="w-4 h-4 border-2 border-white rounded-sm rotate-45" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">NEXUS CALIB</span>
          </Link>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname === '/' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">儀表板 Dashboard</span>
          </Link>
          <Link href="/workspace" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname.startsWith('/workspace') ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Hammer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">校正工作站 Workspace</span>
          </Link>
          <Link href="/gages" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname.startsWith('/gages') ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Database className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">設備清單 Inventory</span>
          </Link>
          <Link href="/fixtures" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname.startsWith('/fixtures') ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Package className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">檢具清冊 Fixtures</span>
          </Link>
          <Link href="/vendors" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname.startsWith('/vendors') ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Building className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">供應商管理 Vendors</span>
          </Link>
          <Link href="/reports" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname.startsWith('/reports') ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">報告中心 Reports</span>
          </Link>

          <div className="pt-6 pb-2 px-4 text-[10px] font-black text-slate-500 uppercase tracking-widest flex flex-col leading-none">
            <span>系統設定 System</span>
          </div>

          <Link href="/reminders" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname.startsWith('/reminders') ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">提醒事項 Reminders</span>
          </Link>
          <Link href="/settings/organization" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname === '/settings/organization' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Building2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">組織設定 Org</span>
          </Link>
          <Link href="/settings/standards" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname === '/settings/standards' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <ShieldCheck className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-bold tracking-wide">標準庫 Standards</span>
          </Link>
          {role === 'admin' && (
            <Link href="/settings/users" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${pathname === '/settings/users' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-bold tracking-wide">人員管理 Users</span>
            </Link>
          )}
          
          <div className="pt-4 mt-4 border-t border-slate-800/50">
            <form action={logoutAction}>
              <button type="submit" className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all group text-red-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/20">
                <LayoutDashboard className="w-5 h-5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                <span className="text-sm font-bold tracking-wide">登出系統 Logout</span>
              </button>
            </form>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen bg-[#E9F0F8] print:ml-0 print:bg-white">
        <header className="h-16 bg-[#5A738E] border-b border-[#4A637E] sticky top-0 z-[45] flex items-center justify-between px-8 print:hidden">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4 text-white/90">
            <button 
              onClick={() => setLanguage(language === 'zh-TW' ? 'en-US' : 'zh-TW')}
              className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-full text-xs font-bold transition-all border border-white/20"
              title="Switch Language"
            >
              <Languages className="w-4 h-4" />
              <span>{language === 'zh-TW' ? 'EN' : '繁中'}</span>
            </button>
            <div className="h-6 w-px bg-white/20 mx-1" />
            {/* Temporarily disabled to debug serialization error */}
            {/* <NotificationBell /> */}
            <div className="h-6 w-px bg-white/20 mx-1" />
            <form action={logoutAction}>
              <button type="submit" className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/10 rounded-full text-sm font-bold transition-all">
                <User className="w-5 h-5 text-white/70" />
                <span>登出 (Logout)</span>
              </button>
            </form>
          </div>
        </header>

        <div className="min-h-[calc(100vh-64px)]">
          {children}
        </div>
      </main>

      {isSettingsOpen && (
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
        />
      )}
    </div>
  );
}
