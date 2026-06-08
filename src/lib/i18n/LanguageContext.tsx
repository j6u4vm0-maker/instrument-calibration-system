'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from './config';
import { useTranslation } from 'react-i18next';

export type Language = 'en-US' | 'zh-TW' | 'zh-CN' | 'en' | 'zh';
export type Role = 'admin' | 'qa_manager' | 'engineer';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  role: Role;
  setRole: (role: Role) => void;
  t: (key: string, options?: any) => string;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'zh-TW',
  setLanguage: () => {},
  role: 'admin',
  setRole: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ 
  children, 
  initialLanguage = 'zh-TW',
  initialRole = 'admin'
}: { 
  children: React.ReactNode, 
  initialLanguage?: Language,
  initialRole?: Role 
}) {
  const { t: i18nT } = useTranslation(['common', 'calibration', 'quality']);
  const [language, setLanguageState] = useState<Language>(initialLanguage);
  const [role, setRoleState] = useState<Role>(initialRole);

  useEffect(() => {
    // Sync with localStorage on mount
    const savedLang = localStorage.getItem('language') as Language;
    const validLangs = ['en-US', 'zh-TW', 'zh-CN', 'en', 'zh'];
    if (savedLang && savedLang !== language && validLangs.includes(savedLang)) {
      setLanguageState(savedLang);
      i18n.changeLanguage(savedLang);
    } else {
      i18n.changeLanguage(language);
    }
  }, []);

  useEffect(() => {
    setRoleState(initialRole);
  }, [initialRole]);

  useEffect(() => {
    if (initialLanguage !== language) {
      setLanguageState(initialLanguage);
      i18n.changeLanguage(initialLanguage);
    }
  }, [initialLanguage]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
    document.cookie = `language=${lang}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('role', newRole);
    document.cookie = `role=${newRole}; path=/; max-age=31536000`;
    window.location.reload();
  };

  const t = (key: string, options?: any): string => {
    // Attempt to translate using i18next
    const result = i18nT(key, options);
    
    // If result is the same as key, it might be a legacy key (e.g., 'nav_dashboard')
    // We can try to map legacy keys if needed, but the new system uses namespaces.
    // To support legacy keys that don't have dots, we could prefix them with a default namespace
    // if i18next doesn't find them.
    
    return String(result);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, role, setRole, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
