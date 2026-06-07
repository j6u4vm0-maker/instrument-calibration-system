"use client";

import { Thermometer, Droplets } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface EnvironmentalInputsProps {
  temperature: string;
  humidity: string;
  onUpdate: (data: { temperature?: string; humidity?: string }) => void;
}

export function EnvironmentalInputs({
  temperature,
  humidity,
  onUpdate
}: EnvironmentalInputsProps) {
  const { t } = useLanguage();

  return (
    <div className="bg-amber-50/30 p-6 rounded-2xl border border-amber-100/50 space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
          <Thermometer className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-slate-800">{t('calibration.cal.environment')}</h4>
      </div>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.temperature')}</label>
            <div className="relative">
              <input 
                type="number" 
                value={temperature}
                onChange={(e) => onUpdate({ temperature: e.target.value })}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">°C</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase">{t('calibration.cal.humidity')}</label>
            <div className="relative">
              <input 
                type="number" 
                value={humidity}
                onChange={(e) => onUpdate({ humidity: e.target.value })}
                className="w-full pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-400/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
