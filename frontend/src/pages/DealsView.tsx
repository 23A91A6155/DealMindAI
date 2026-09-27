import React from 'react';
import { Customer } from '../types';
import { Briefcase, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

interface Props {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const DealsView: React.FC<Props> = ({
  customers,
  onSelectCustomer,
  onNavigate
}) => {
  const totalValue = customers.reduce((sum, c) => sum + c.deal_value, 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Enterprise Deals</h2>
            <p className="text-xs text-slate-400">
              Pipeline status, win probabilities, and memory-backed strategy readiness
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-medium block">Total Pipeline Value</span>
          <span className="text-xl font-bold font-mono text-white">${totalValue.toLocaleString()}</span>
        </div>
      </div>

      {/* Deals Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-850 text-slate-400 border-b border-slate-800 uppercase font-semibold text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Account & Industry</th>
                <th className="py-3 px-4">Stage</th>
                <th className="py-3 px-4">Deal Value</th>
                <th className="py-3 px-4">Win Prob.</th>
                <th className="py-3 px-4">Memory Readiness</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {customers.map((c) => (
                <tr key={c.id} className="hover:bg-slate-850/60 transition-colors">
                  <td className="py-4 px-4">
                    <div className="font-bold text-white text-sm cursor-pointer hover:text-brand-300" onClick={() => onSelectCustomer(c.id)}>
                      {c.name}
                    </div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xs">{c.snapshot.industry}</div>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full font-semibold text-[10px] border ${
                      c.deal_stage === 'Negotiation' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                      c.deal_stage === 'Proposal' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                      'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {c.deal_stage}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-white text-sm">
                    ${c.deal_value.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 font-mono text-brand-400 font-bold">
                    {c.deal_probability}%
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[11px] text-slate-300">
                      {c.known_preferences.length} Prefs • {c.known_objections.length} Objections
                    </span>
                    <div className="w-24 bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                      <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          onSelectCustomer(c.id);
                          onNavigate('briefing');
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>Briefing</span>
                      </button>
                      <button
                        onClick={() => onSelectCustomer(c.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors"
                      >
                        Open
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
