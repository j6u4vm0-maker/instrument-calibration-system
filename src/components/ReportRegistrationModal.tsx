import React, { useState } from "react";
import { Plus, X, Search, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import CalibrationModal from "./CalibrationModal";

interface ReportRegistrationModalProps {
  gages: any[];
  vendors: any[];
}

export default function ReportRegistrationModal({ gages, vendors }: ReportRegistrationModalProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGage, setSelectedGage] = useState<any>(null);

  const filteredGages = gages.filter(g => 
    g.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).slice(0, 5);

  const handleSelectGage = (gage: any) => {
    setSelectedGage(gage);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-kst-blue text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
      >
        <Plus className="w-4 h-4" /> {t('calibration.cal.register_report')}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">{t('calibration.cal.register_report_select')}</h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </header>

        <div className="p-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('common.common.search_gage_placeholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-kst-blue/20 outline-none transition-all"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            {filteredGages.length > 0 ? (
              filteredGages.map(gage => (
                <button
                  key={gage.id}
                  onClick={() => handleSelectGage(gage)}
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-kst-blue hover:bg-blue-50/50 transition-all group text-left"
                >
                  <div>
                    <div className="font-bold text-slate-800">{gage.id}</div>
                    <div className="text-xs text-slate-400">{gage.name}</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-kst-blue group-hover:translate-x-1 transition-all" />
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">{t('calibration.cal.no_matching_gage')}</div>
            )}
          </div>
        </div>
      </div>

      {selectedGage && (
        <CalibrationModal
          isOpenExternal={true}
          gageId={selectedGage.id}
          calPoints={selectedGage.calPoints || ""}
          acceptance={selectedGage.acceptance || ""}
          calibrationCycle={selectedGage.calibrationCycle}
          vendors={vendors}
          onClose={() => {
            setSelectedGage(null);
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
}
