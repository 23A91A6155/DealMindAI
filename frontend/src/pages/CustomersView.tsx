import React from 'react';
import { Customer } from '../types';
import { Building2, ArrowRight, Sparkles, Users } from 'lucide-react';

interface Props {
  customers: Customer[];
  onSelectCustomer: (id: string) => void;
  onNavigate: (tab: string) => void;
}

export const CustomersView: React.FC<Props> = ({
  customers,
  onSelectCustomer,
  onNavigate
}) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Customer Accounts Directory</h2>
            <p className="text-xs text-slate-400">
              Profiles, tech stacks, stakeholder matrices, and remembered deal context
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Accounts */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c) => (
          <div
            key={c.id}
            onClick={() => onSelectCustomer(c.id)}
            className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all hover:shadow-xl hover:shadow-brand-500/5 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs text-brand-400 font-mono">{c.domain}</p>
                </div>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {c.deal_stage}
                </span>
              </div>

              <p className="text-xs text-slate-400 line-clamp-2 mt-2 leading-relaxed">
                {c.overview}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 text-[11px]">Deal Value:</span>
                  <span className="font-mono font-bold text-white">${c.deal_value.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 text-[11px]">Industry:</span>
                  <span className="truncate max-w-[170px] text-[11px]">{c.snapshot.industry}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-500 text-[11px]">Contacts:</span>
                  <span className="text-[11px] flex items-center gap-1">
                    <Users className="w-3 h-3 text-brand-400" /> {c.contacts.length} Decision Makers
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-brand-400 font-semibold">
              <span>View Account Intelligence</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
