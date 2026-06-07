"use client";

import React, { useState, useEffect } from 'react';
import { Bell, Calendar, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import Link from 'next/link';

export function NotificationBell() {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotifications(data);
        }
      });
  }, []);

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2 rounded-full transition-all relative ${
          notifications.length > 0 ? 'text-amber-500 bg-amber-50 hover:bg-amber-100' : 'text-slate-400 hover:text-kst-blue hover:bg-slate-50'
        }`}
      >
        <Bell className="w-5 h-5" />
        {notifications.length > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-[50] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <header className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-700 text-sm">{t('notifications')}</span>
              <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full font-bold">
                {notifications.length} {t('all')}
              </span>
            </header>

            <div className="max-h-96 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <Link 
                    key={n.gage.id}
                    href={`/gages/${encodeURIComponent(n.gage.id)}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-start gap-3 p-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{n.gage.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t('next_cal_date')}: {new Date(n.gage.nextCalDate).toLocaleDateString()}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                  </Link>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 text-sm">
                  {t('no_notifications')}
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <Link 
                href="/pending-calibrations"
                onClick={() => setIsOpen(false)}
                className="block p-3 text-center text-xs font-bold text-kst-blue bg-blue-50/50 hover:bg-blue-50 transition-colors"
              >
                {t('view_all')}
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}
