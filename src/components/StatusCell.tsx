"use client";

import React, { useState } from 'react';
import { updateGageStatusAction } from '@/app/actions/gage-actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { CheckCircle2, PauseCircle, StopCircle, Trash2, ChevronDown, Clock } from 'lucide-react';

export function StatusCell({ id, status, calculatedStatus }: { id: string, status: string, calculatedStatus: string }) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(status);

  const statuses = [
    { id: 'IN_USE', label: t('common.status.in_use') || '使用中', icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
    { id: 'SUSPENDED', label: t('common.status.suspended') || '暫停使用', icon: PauseCircle, color: 'bg-amber-50 text-amber-600 border-amber-100' },
    { id: 'SCRAPPED', label: t('common.status.scrapped') || '報廢', icon: Trash2, color: 'bg-red-50 text-red-600 border-red-100' },
  ];

  const handleUpdate = async (newStatus: string) => {
    setCurrentStatus(newStatus);
    setIsOpen(false);
    await updateGageStatusAction(id, newStatus);
  };

  const active = statuses.find(s => s.id === currentStatus) || statuses[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:shadow-sm ${active.color}`}
      >
        <active.icon className="w-3.5 h-3.5" />
        {active.label}
        <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[40]" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 mt-2 w-40 bg-white rounded-xl shadow-2xl border border-slate-100 z-[50] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {statuses.map((s) => (
              <button
                key={s.id}
                onClick={() => handleUpdate(s.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold hover:bg-slate-50 transition-colors ${
                  currentStatus === s.id ? 'text-kst-blue bg-blue-50/30' : 'text-slate-600'
                }`}
              >
                <s.icon className={`w-4 h-4 ${currentStatus === s.id ? 'text-kst-blue' : 'text-slate-400'}`} />
                {s.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
