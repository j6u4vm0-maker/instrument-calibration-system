"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface SearchableSelectProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function SearchableSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select or type...", 
  className = "" 
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // 過濾現有選項，並排除重複
  const uniqueOptions = Array.from(new Set(options)).filter(Boolean);
  const filteredOptions = uniqueOptions.filter(opt => 
    opt.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center focus-within:ring-2 focus-within:ring-kst-blue/20 border-slate-200 hover:border-slate-300 transition-all outline-none"
      >
        <span className={value ? "text-slate-800" : "text-slate-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[110] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
          <div className="p-2 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              autoFocus
              className="w-full text-xs bg-transparent outline-none py-1"
              placeholder="Search or type new..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && search) {
                  onChange(search);
                  setIsOpen(false);
                  setSearch("");
                }
              }}
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer flex justify-between items-center transition-colors ${
                    value === opt ? 'bg-blue-50 text-kst-blue font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                  {value === opt && <div className="w-1.5 h-1.5 bg-kst-blue rounded-full" />}
                </div>
              ))
            ) : search ? (
              <div 
                onClick={() => {
                  onChange(search);
                  setIsOpen(false);
                  setSearch("");
                }}
                className="px-3 py-3 text-xs text-kst-blue font-bold hover:bg-blue-50 cursor-pointer flex items-center gap-2"
              >
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px]">+</div>
                Create "{search}"
              </div>
            ) : (
              <div className="px-3 py-6 text-center text-slate-400 text-xs italic">
                No items match your search
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
