import React, { useState, useEffect, useRef } from 'react';
import { Search, Brain, Award, Sparkles, Building2, Briefcase, MessageSquare, History, X } from 'lucide-react';
import { HindsightStatus, SearchResponse } from '../types';
import { searchGlobal } from '../services/api';

interface Props {
  hindsightStatus: HindsightStatus | null;
  onOpenStatusModal: () => void;
  onOpenJudgeModal: () => void;
  onSelectCustomer: (customerId: string) => void;
  onNavigate: (tab: string) => void;
}

export const Header: React.FC<Props> = ({
  hindsightStatus,
  onOpenStatusModal,
  onOpenJudgeModal,
  onSelectCustomer,
  onNavigate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults(null);
      setShowDropdown(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await searchGlobal(searchQuery);
        setSearchResults(res);
        setShowDropdown(true);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 backdrop-blur-md">
      {/* Brand & Subtitle */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5 cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight tracking-tight flex items-center gap-1.5">
              DealMind AI
              <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">
                v1.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              Your sales memory that gets smarter with every conversation.
            </p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6 relative" ref={searchRef}>
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search deals, accounts, objections, or memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => { if (searchResults) setShowDropdown(true); }}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setShowDropdown(false); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdown Results */}
        {showDropdown && searchResults && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 max-h-96 overflow-y-auto z-50 text-xs">
            {searchResults.total_results === 0 ? (
              <div className="p-4 text-center text-slate-500">
                No matching accounts, deals, or memories found.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Customers */}
                {searchResults.customers.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-slate-400 px-2 py-1 block">Customers</span>
                    {searchResults.customers.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCustomer(c.id);
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className="px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-brand-400" />
                          <span className="text-white font-medium">{c.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{c.subtitle}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Memories */}
                {searchResults.memories.length > 0 && (
                  <div>
                    <span className="text-[10px] uppercase font-semibold text-brand-400 px-2 py-1 block">Hindsight Memories</span>
                    {searchResults.memories.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onNavigate('timeline');
                          setShowDropdown(false);
                          setSearchQuery('');
                        }}
                        className="px-2 py-1.5 rounded-lg hover:bg-slate-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-1.5 text-brand-300 font-medium">
                          <Brain className="w-3 h-3 text-brand-400" />
                          <span>{m.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">{m.subtitle}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions & Status */}
      <div className="flex items-center space-x-3">
        {/* Judge Mode Button */}
        <button
          onClick={onOpenJudgeModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/10 to-brand-500/10 hover:from-amber-500/20 hover:to-brand-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold shadow-sm transition-all"
        >
          <Award className="w-3.5 h-3.5" />
          <span>Judge Mode</span>
        </button>

        {/* Hindsight Status Badge */}
        <button
          onClick={onOpenStatusModal}
          title="Click to view Hindsight Memory Bank diagnostics"
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs font-medium transition-all group"
        >
          <span className={`w-2 h-2 rounded-full ${hindsightStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
          <span className="text-slate-200 group-hover:text-white">
            {hindsightStatus?.connected ? 'Hindsight Connected' : 'Demo Memory Mode'}
          </span>
          <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
            ({hindsightStatus?.memory_units_count || 0} units)
          </span>
        </button>

        {/* User Avatar */}
        <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-brand-400">
            AE
          </div>
        </div>
      </div>
    </header>
  );
};
