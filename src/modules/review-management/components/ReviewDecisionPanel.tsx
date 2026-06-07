'use client';

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  History
} from 'lucide-react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

interface Props {
  recordId: string;
  onApprove: (notes: string) => Promise<void>;
  onReject: (notes: string) => Promise<void>;
  historicalData?: any[];
}

export default function ReviewDecisionPanel({ recordId, onApprove, onReject, historicalData = [] }: Props) {
  const { t } = useLanguage();
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const Label = ({ zh, en }: { zh: string, en: string }) => (
    <div className="flex flex-col leading-none">
      <span className="text-[12px] font-bold text-slate-700">{zh}</span>
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{en}</span>
    </div>
  );

  const handleAction = async (action: 'APPROVE' | 'REJECT') => {
    if (action === 'REJECT' && !notes.trim()) {
      alert('退回時請務必填寫原因 / Please provide a reason for rejection.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (action === 'APPROVE') await onApprove(notes);
      else await onReject(notes);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-100 shadow-[-10px_0_30px_rgba(0,0,0,0.02)] z-10 w-[400px]">
      <header className="p-6 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-kst-blue rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-800">審查決策工作台</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review Decision Workbench</p>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        
        {/* Historical Insight Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-kst-blue" />
            <Label zh="歷史數據洞察" en="Historical Insights" />
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-slate-500">誤差趨勢 (Error Trend)</span>
              <History className="w-3.5 h-3.5 text-slate-300" />
            </div>
            {/* Placeholder for actual chart component */}
            <div className="h-24 flex items-end gap-1 px-2">
              {[40, 60, 35, 70, 50, 45, 80].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-kst-blue/20 rounded-t-sm hover:bg-kst-blue transition-all cursor-help" 
                  style={{ height: `${h}%` }}
                  title={`Record ${i+1}: ${h}% error margin`}
                />
              ))}
            </div>
            <p className="text-[9px] text-slate-400 mt-3 text-center italic">顯示過去 6 次校正的平均誤差波動</p>
          </div>
        </section>

        {/* Notes Input Section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-kst-blue" />
            <Label zh="審核意見與指導" en="Reviewer Comments & Guidance" />
          </div>
          <div className="relative">
            <textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="請輸入審核意見或退回原因..."
              className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm focus:bg-white focus:ring-4 focus:ring-kst-blue/5 outline-none transition-all resize-none border-dashed focus:border-kst-blue/30"
            />
            {!notes && (
              <div className="absolute top-4 right-4 opacity-20 pointer-events-none">
                <AlertCircle className="w-5 h-5 text-slate-400" />
              </div>
            )}
          </div>
        </section>

        {/* Quick Suggestions */}
        <div className="flex flex-wrap gap-2">
          {['數據完整', '符合標準', '母儀過期', '誤差過大', '附件缺失'].map(s => (
            <button 
              key={s}
              onClick={() => setNotes(prev => prev ? `${prev}, ${s}` : s)}
              className="text-[10px] px-3 py-1 bg-slate-100 text-slate-500 rounded-full font-bold hover:bg-kst-blue hover:text-white transition-all"
            >
              + {s}
            </button>
          ))}
        </div>
      </div>

      <footer className="p-6 bg-slate-50/50 border-t border-slate-100 flex flex-col gap-3">
        <button 
          disabled={isSubmitting}
          onClick={() => handleAction('APPROVE')}
          className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
        >
          <CheckCircle2 className="w-5 h-5" />
          <div className="flex flex-col items-start leading-none">
            <span>核准報告</span>
            <span className="text-[9px] opacity-70 uppercase tracking-tighter">Approve Report</span>
          </div>
        </button>
        
        <button 
          disabled={isSubmitting}
          onClick={() => handleAction('REJECT')}
          className="w-full py-3 bg-white border-2 border-red-100 text-red-500 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 hover:bg-red-50 transition-all disabled:opacity-50"
        >
          <XCircle className="w-5 h-5" />
          <div className="flex flex-col items-start leading-none">
            <span>退回修改</span>
            <span className="text-[9px] opacity-70 uppercase tracking-tighter">Reject & Revise</span>
          </div>
        </button>
      </footer>
    </div>
  );
}
