'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { Plus, Edit2, Trash2, Shield, User as UserIcon } from 'lucide-react';
import { deleteUserAction } from '@/app/actions/user-actions';
import { UserFormModal } from './components/UserFormModal';

export function UserManagementClient({ initialUsers, currentUser }: { initialUsers: any[], currentUser: any }) {
  const { t } = useLanguage();
  const [users, setUsers] = useState(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const handleDelete = async (user: any) => {
    if (user.id === currentUser.id) {
      alert(t('common.users.cannot_delete_self'));
      return;
    }
    if (confirm(t('common.users.delete_confirm'))) {
      const res = await deleteUserAction(user.id);
      if (res.success) {
        setUsers(users.filter(u => u.id !== user.id));
      } else {
        alert(res.error || 'Delete failed');
      }
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <span className="px-2 py-1 bg-red-50 text-red-600 rounded-md text-xs font-bold">{t('common.users.role_admin')}</span>;
      case 'QA_MANAGER':
        return <span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-xs font-bold">{t('common.users.role_qa')}</span>;
      case 'ENGINEER':
        return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-bold">{t('common.users.role_engineer')}</span>;
      default:
        return <span className="px-2 py-1 bg-slate-50 text-slate-600 rounded-md text-xs font-bold">{role}</span>;
    }
  };

  return (
    <div className="p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <Shield className="w-8 h-8 text-kst-blue" />
            {t('common.users.title')}
          </h1>
          <p className="text-slate-500 mt-2">{t('common.users.desc')}</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-kst-blue text-white rounded-xl font-bold hover:bg-blue-800 transition-colors shadow-lg shadow-blue-100"
        >
          <Plus className="w-5 h-5" />
          {t('common.users.add_user')}
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-100 text-[#7D7DFF] uppercase tracking-wider text-xs font-bold">
            <tr>
              <th className="px-6 py-4">{t('common.users.account')}</th>
              <th className="px-6 py-4">{t('common.users.name')}</th>
              <th className="px-6 py-4">{t('common.users.role')}</th>
              <th className="px-6 py-4">{t('common.users.status')}</th>
              <th className="px-6 py-4">{t('common.common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  {user.account}
                </td>
                <td className="px-6 py-4 text-slate-600 font-bold">{user.name}</td>
                <td className="px-6 py-4">{getRoleBadge(user.role)}</td>
                <td className="px-6 py-4">
                  {user.isActive ? (
                    <span className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      {t('common.users.active')}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-slate-400 font-bold text-xs">
                      <div className="w-2 h-2 rounded-full bg-slate-300" />
                      {t('common.users.inactive')}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setEditingUser(user); setIsModalOpen(true); }}
                      className="text-slate-400 hover:text-kst-blue transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {user.id !== currentUser.id && (
                      <button 
                        onClick={() => handleDelete(user)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <UserFormModal 
          user={editingUser} 
          onClose={() => {
            setIsModalOpen(false);
            window.location.reload(); // Simple refresh for now to get fresh data
          }} 
        />
      )}
    </div>
  );
}
