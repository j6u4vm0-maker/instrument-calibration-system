'use client';

import React from 'react';
import InternalReportTemplate from '@/modules/reporting/components/InternalReportTemplate';
import ReviewDecisionPanel from './ReviewDecisionPanel';
import { ChevronLeft, Maximize2, Minimize2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  data: any; // Full calibration record data
}

export default function ReviewWorkbench({ data }: Props) {
  const router = useRouter();
  const [isFullWidth, setIsFullWidth] = React.useState(false);

  const handleApprove = async (notes: string) => {
    // In a real implementation, this would call a server action
    console.log('Approved with notes:', notes);
    alert('Report Approved Successfully!');
    router.push('/reports');
  };

  const handleReject = async (notes: string) => {
    console.log('Rejected with notes:', notes);
    alert('Report Rejected and Sent back for revision.');
    router.push('/reports');
  };

  return (
    <div className="fixed inset-0 bg-slate-900/10 backdrop-blur-md z-[100] flex overflow-hidden animate-in fade-in duration-300">
      
      {/* Main Review Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-kst-blue"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="h-6 w-px bg-slate-200" />
            <h1 className="font-black text-slate-800 text-sm tracking-tight uppercase">
              審查模式 / Review Mode: <span className="text-kst-blue font-mono">{data.certificateNo || data.id}</span>
            </h1>
          </div>
          
          <button 
            onClick={() => setIsFullWidth(!isFullWidth)}
            className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400"
            title={isFullWidth ? "Minimize" : "Full Width"}
          >
            {isFullWidth ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto bg-slate-100/50 p-12 custom-scrollbar">
          <div className={`mx-auto transition-all duration-500 ${isFullWidth ? 'max-w-full' : 'max-w-[210mm]'}`}>
            <InternalReportTemplate data={data} />
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <ReviewDecisionPanel 
        recordId={data.id}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
