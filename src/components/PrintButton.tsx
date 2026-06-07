"use client";

import React from 'react';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="bg-slate-900 text-white px-6 py-3 rounded-full font-bold shadow-2xl hover:bg-slate-800 transition-all transform hover:scale-105"
    >
      立即列印報告 / Print Report
    </button>
  );
}
