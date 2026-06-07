"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, User, Building2 } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  subLabel?: string;
  type?: 'staff' | 'dept' | 'loc';
}

interface SearchableObjectSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string, option?: SelectOption) => void;
  placeholder?: string;
  className?: string;
  emptyMessage?: string;
}

export function SearchableObjectSelect({ 
  options, 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "",
  emptyMessage = "No results found"
}: SearchableObjectSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(search.toLowerCase()) ||
    (opt.subLabel && opt.subLabel.toLowerCase().includes(search.toLowerCase()))
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
        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white cursor-pointer flex justify-between items-center hover:border-slate-300 transition-all outline-none min-h-[40px]"
      >
        <div className="flex flex-col truncate">
          <span className={selectedOption ? "text-slate-900 font-medium" : "text-slate-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          {selectedOption?.subLabel && (
            <span className="text-[10px] text-slate-400 truncate">{selectedOption.subLabel}</span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-[120] w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-1 duration-200 overflow-hidden">
          <div className="p-2 border-b border-slate-50 bg-slate-50/50 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <input 
              autoFocus
              className="w-full text-xs bg-transparent outline-none py-1"
              placeholder="Type to search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt, idx) => (
                <div 
                  key={idx}
                  onClick={() => {
                    onChange(opt.value, opt);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center gap-3 transition-colors ${
                    value === opt.value ? 'bg-blue-50 text-kst-blue' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    opt.type === 'staff' ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {opt.type === 'staff' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold truncate">{opt.label}</span>
                    {opt.subLabel && <span className="text-[10px] text-slate-400 truncate">{opt.subLabel}</span>}
                  </div>
                  {value === opt.value && <div className="ml-auto w-1.5 h-1.5 bg-kst-blue rounded-full" />}
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-slate-400 text-xs italic">
                {emptyMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
