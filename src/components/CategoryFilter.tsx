"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Check, ChevronDown, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface CategoryFilterProps {
  categories: string[];
  currentCategories: string[]; // 改為陣列
}

export function CategoryFilter({ categories, currentCategories }: CategoryFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 點擊外部關閉
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCategory = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    let newCategories: string[];

    if (currentCategories.includes(category)) {
      newCategories = currentCategories.filter(c => c !== category);
    } else {
      newCategories = [...currentCategories, category];
    }

    if (newCategories.length > 0) {
      params.set('category', newCategories.join(','));
    } else {
      params.delete('category');
    }
    
    router.push(`/gages?${params.toString()}`);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    const params = new URLSearchParams(searchParams.toString());
    params.delete('category');
    router.push(`/gages?${params.toString()}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 pl-3 pr-4 py-2 border rounded-lg text-sm transition-all min-w-[200px] bg-white ${
          currentCategories.length > 0 
            ? 'border-kst-blue ring-2 ring-kst-blue/10 text-kst-blue' 
            : 'border-slate-200 text-slate-600 hover:border-slate-300'
        }`}
      >
        <Filter className={`w-4 h-4 ${currentCategories.length > 0 ? 'text-kst-blue' : 'text-slate-400'}`} />
        <span className="flex-1 text-left font-medium truncate">
          {currentCategories.length === 0 
            ? `${t('common.common.all')} ${t('calibration.gage.category')}` 
            : `${currentCategories.length} ${t('common.common.selection')}`}
        </span>
        {currentCategories.length > 0 && (
          <X 
            className="w-3.5 h-3.5 hover:text-red-500 transition-colors" 
            onClick={clearAll}
          />
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 p-2 animate-in fade-in slide-in-from-top-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2 mb-1 flex justify-between items-center">
            {t('calibration.gage.category')}
            {currentCategories.length > 0 && (
              <button onClick={clearAll} className="text-kst-blue hover:underline lowercase">{t('common.common.clear')}</button>
            )}
          </div>
          <div className="max-h-64 overflow-y-auto space-y-0.5">
            {categories.map(category => {
              const isSelected = currentCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                    isSelected 
                      ? 'bg-blue-50 text-kst-blue font-bold' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{category}</span>
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
