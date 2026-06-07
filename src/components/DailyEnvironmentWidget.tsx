'use client';

import React, { useState, useEffect } from 'react';
import { Thermometer, Droplets, Save } from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function DailyEnvironmentWidget() {
  const { t } = useLanguage();
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState('20');
  const [humidity, setHumidity] = useState('50');

  useEffect(() => {
    setIsClient(true);
    setTemp(localStorage.getItem('daily_temp') || '20');
    setHumidity(localStorage.getItem('daily_humidity') || '50');
  }, []);

  const handleSave = () => {
    localStorage.setItem('daily_temp', temp);
    localStorage.setItem('daily_humidity', humidity);
    setIsEditing(false);
  };

  if (!isClient) return null;

  return (
    <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm text-sm">
      <div className="flex items-center gap-1.5 text-slate-500">
        <Thermometer className="w-4 h-4 text-rose-500" />
        {isEditing ? (
          <input 
            type="number" 
            value={temp} 
            onChange={e => setTemp(e.target.value)}
            className="w-12 px-1 py-0.5 border border-slate-200 rounded text-center outline-none focus:border-kst-blue"
          />
        ) : (
          <span className="font-bold text-slate-700">{temp}°C</span>
        )}
      </div>
      
      <div className="w-px h-4 bg-slate-200" />
      
      <div className="flex items-center gap-1.5 text-slate-500">
        <Droplets className="w-4 h-4 text-blue-500" />
        {isEditing ? (
          <input 
            type="number" 
            value={humidity} 
            onChange={e => setHumidity(e.target.value)}
            className="w-12 px-1 py-0.5 border border-slate-200 rounded text-center outline-none focus:border-kst-blue"
          />
        ) : (
          <span className="font-bold text-slate-700">{humidity}%</span>
        )}
      </div>

      <div className="w-px h-4 bg-slate-200" />

      {isEditing ? (
        <button 
          onClick={handleSave}
          className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold"
        >
          <Save className="w-4 h-4" /> 儲存
        </button>
      ) : (
        <button 
          onClick={() => setIsEditing(true)}
          className="text-kst-blue hover:text-blue-700 font-bold"
        >
          設定今日溫濕度
        </button>
      )}
    </div>
  );
}
