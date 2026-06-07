'use client';

import React, { useState } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { createUserAction, updateUserAction } from '@/app/actions/user-actions';

interface UserFormModalProps {
  user: any;
  onClose: () => void;
}

export function UserFormModal({ user, onClose }: UserFormModalProps) {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!user;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const formData = new FormData(e.currentTarget);
    const isActiveChecked = formData.get('isActive') === 'on';
    formData.set('isActive', isActiveChecked.toString());

    let res;
    if (isEditing) {
      res = await updateUserAction(user.id, formData);
    } else {
      res = await createUserAction(formData);
    }

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">
            {isEditing ? t('common.users.edit_user') : t('common.users.add_user')}
          </h3>
          <button onClick={onClose} type="button" className="p-2 text-slate-400 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm font-bold flex gap-2 items-start animate-in fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('common.users.account')}</label>
              <input 
                name="account" 
                defaultValue={user?.account}
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-kst-blue outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('common.users.name')}</label>
              <input 
                name="name" 
                defaultValue={user?.name}
                required 
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-kst-blue outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('common.users.password')}</label>
              <input 
                name="password" 
                type="password"
                placeholder={isEditing ? t('common.users.password_hint_edit') : t('common.users.password_placeholder')}
                required={!isEditing}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-kst-blue outline-none transition-shadow"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">{t('common.users.role')}</label>
              <select 
                name="role" 
                defaultValue={user?.role || 'ENGINEER'}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-kst-blue outline-none transition-shadow"
              >
                <option value="ADMIN">{t('common.users.role_admin')}</option>
                <option value="QA_MANAGER">{t('common.users.role_qa')}</option>
                <option value="ENGINEER">{t('common.users.role_engineer')}</option>
              </select>
            </div>
            <div className="space-y-2 flex flex-col justify-center pt-6">
              <label className="flex items-center gap-3 cursor-pointer group w-fit">
                <input 
                  type="checkbox" 
                  name="isActive" 
                  defaultChecked={user ? user.isActive : true}
                  className="w-5 h-5 rounded border-slate-300 text-kst-blue focus:ring-kst-blue transition-all"
                />
                <span className="font-bold text-slate-700 group-hover:text-kst-blue transition-colors">
                  {t('common.users.active')}
                </span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-6 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              {t('common.common.cancel')}
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 py-3 text-white font-bold bg-kst-blue hover:bg-blue-800 rounded-xl transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-5 h-5" />
              {loading ? t('common.common.updating') : t('common.common.save_changes')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
