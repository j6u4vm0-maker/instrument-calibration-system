import React from 'react';
import { prisma } from "../../lib/prisma";
import { getTranslation } from '@/lib/i18n/server-translations';
import { GageService } from '@/services/gage-service';
import { Bell, Plus, Trash2, ShieldCheck, ShieldAlert } from 'lucide-react';
import { 
  addReminderRuleAction, 
  toggleReminderRuleAction, 
  deleteReminderRuleAction 
} from '@/app/actions/reminder-actions';
import { ReminderForm } from '@/components/ReminderForm';
import { RuleToggle } from '@/components/RuleToggle';

export default async function RemindersPage() {
  const { t } = await getTranslation();
  const rules = await prisma.reminderRule.findMany({
    orderBy: { createdAt: 'desc' }
  });
  const categories = await GageService.getCategories();
  const gages = await GageService.getAllGages();

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Bell className="w-8 h-8 text-kst-blue" />
            {t('common.nav.reminders')}
          </h1>
          <p className="text-slate-500 mt-2">{t('common.reminders.desc')}</p>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Add Rule Form */}
        <div className="lg:col-span-1">
          <ReminderForm categories={categories} gages={gages} />
        </div>

        {/* Rules List */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2 px-2">
            {t('common.reminders.rule_list')}
            <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{rules.length}</span>
          </h3>

          <div className="grid gap-4">
            {rules.map((rule) => (
              <div key={rule.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center justify-between group hover:border-kst-blue/20 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${rule.enabled ? 'bg-blue-50 text-kst-blue' : 'bg-slate-50 text-slate-300'}`}>
                    <Bell className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">
                        {rule.type === 'ALL' ? t('common.reminders.all_instruments') : rule.type === 'CATEGORY' ? `${t('common.reminders.category')}: ${rule.target}` : `${t('common.reminders.individual')}: ${rule.target}`}
                      </span>
                      {!rule.enabled && <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded uppercase font-bold">{t('common.reminders.disabled')}</span>}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-3 mt-1">
                      <span>{rule.daysBefore === 0 ? t('common.reminders.same_month') : rule.daysBefore === 14 ? t('common.reminders.two_weeks_before') : t('common.reminders.one_month_before')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <RuleToggle id={rule.id} enabled={rule.enabled} />
                  <form action={async () => {
                    'use server';
                    await deleteReminderRuleAction(rule.id);
                  }}>
                    <button className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </div>
            ))}

            {rules.length === 0 && (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
                {t('common.reminders.no_reminder_rules')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
