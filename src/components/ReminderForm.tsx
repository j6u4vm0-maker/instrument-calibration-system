"use client";

import React, { useState } from 'react';
import { Plus, AlertTriangle } from 'lucide-react';
import { addReminderRuleAction } from '@/app/actions/reminder-actions';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface ReminderFormProps {
  categories: string[];
  gages: any[];
}

export function ReminderForm({ categories, gages }: ReminderFormProps) {
  const { t } = useLanguage();
  const [type, setType] = useState('ALL');
  const [daysBefore, setDaysBefore] = useState<number | string>(0);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter out empty or null categories and sort them
  const validCategories = categories.filter(c => c && c.trim() !== '').sort();

  const handleSubmit = async (formData: FormData) => {
    setError(null);
    setIsPending(true);
    try {
      // Ensure daysBefore is a number even if it was a string in state
      formData.set('daysBefore', daysBefore.toString());
      
      const result = await addReminderRuleAction(formData);
      if (result && result.error) {
        setError(result.error);
      } else {
        // Success: reset form
        setType('ALL');
        setDaysBefore(0);
        setError(null);
      }
    } catch (e) {
      setError(t('unexpected_error'));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
      <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Plus className="w-5 h-5 text-kst-blue" />
        {t('common.nav.add_rule')}
      </h3>
      
      <form action={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-slate-700">{t('common.reminders.target_type')}</label>
          <select 
            name="type" 
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={isPending}
            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-kst-blue outline-none bg-white disabled:opacity-50"
          >
            <option value="ALL">{t('common.reminders.all_instruments')}</option>
            <option value="CATEGORY">{t('common.reminders.category')}</option>
            <option value="INDIVIDUAL">{t('common.reminders.individual')}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-slate-700">{t('common.reminders.target_value')}</label>
          </div>
          {type === 'ALL' && (
            <div key="field-all" className="relative animate-in fade-in duration-200">
              <input 
                disabled
                placeholder={t('common.reminders.all_selected')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-400 outline-none"
              />
              <input type="hidden" name="target" value="" />
            </div>
          )}
          
          {type === 'CATEGORY' && (
            <select 
              key="field-category"
              name="target"
              required
              disabled={isPending}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-kst-blue outline-none bg-white disabled:opacity-50 animate-in fade-in duration-200"
            >
              <option value="">{t('common.reminders.select_category')}</option>
              {validCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
              {validCategories.length === 0 && <option disabled>{t('common.reminders.no_categories_found')}</option>}
            </select>
          )}
          
          {type === 'INDIVIDUAL' && (
            <select 
              key="field-individual"
              name="target"
              required
              disabled={isPending}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-kst-blue outline-none bg-white disabled:opacity-50 animate-in fade-in duration-200"
            >
              <option value="">{t('common.reminders.select_instrument')}</option>
              {gages.map(g => (
                <option key={g.id} value={g.id}>{g.id} - {g.name}</option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-semibold text-slate-700">{t('common.reminders.lead_time')} ({t('common.reminders.days')})</label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={isPending}
              onClick={() => setDaysBefore(0)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                daysBefore === 0 ? 'bg-kst-blue text-white border-kst-blue' : 'bg-white text-slate-500 border-slate-200 hover:border-kst-blue/30'
              } disabled:opacity-50`}
            >
              {t('common.reminders.same_month')}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setDaysBefore(14)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                daysBefore === 14 ? 'bg-kst-blue text-white border-kst-blue' : 'bg-white text-slate-500 border-slate-200 hover:border-kst-blue/30'
              } disabled:opacity-50`}
            >
              {t('common.reminders.two_weeks_before')}
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={() => setDaysBefore(30)}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                daysBefore === 30 ? 'bg-kst-blue text-white border-kst-blue' : 'bg-white text-slate-500 border-slate-200 hover:border-kst-blue/30'
              } disabled:opacity-50`}
            >
              {t('common.reminders.one_month_before')}
            </button>
          </div>
          <div className="relative">
            <input 
              type="number"
              name="daysBefore"
              value={daysBefore}
              onChange={(e) => setDaysBefore(e.target.value)}
              onBlur={(e) => {
                if (e.target.value === '') setDaysBefore(0);
              }}
              min="0"
              disabled={isPending}
              className="w-full pl-3 pr-12 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-kst-blue outline-none disabled:opacity-50"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold pointer-events-none">{t('common.reminders.days')}</span>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-start gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
            <p className="text-xs text-red-600 font-medium leading-relaxed">{error}</p>
          </div>
        )}

        <button 
          type="submit"
          disabled={isPending}
          className="w-full py-3 bg-kst-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 mt-4 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            t('common.nav.add_rule')
          )}
        </button>
      </form>
    </div>
  );
}
