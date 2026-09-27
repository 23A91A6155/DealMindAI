import React from 'react';
import { Customer, MemoryHealth, MemoryUnit } from '../types';
import { MemoryHealthWidget } from '../components/MemoryHealthWidget';
import {
  TrendingUp,
  Brain,
  Sparkles,
  ArrowRight,
  Shield,
  Building2,
  Calendar,
  PlayCircle,
  Plus
} from 'lucide-react';

interface Props {
  customers: Customer[];
  memoryHealth: MemoryHealth | null;
  recentMemories: MemoryUnit[];
  onSelectCustomer: (id: string) => void;
  onNavigate: (tab: string) => void;
  onOpenAddInteraction: () => void;
}

export const DashboardView: React.FC<Props> = ({
  customers,
  memoryHealth,
  recentMemories,
  onSelectCustomer,
  onNavigate,
  onOpenAddInteraction
}) => {
  const totalPipeline = customers.reduce((sum, c) => sum + c.deal_value, 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner / Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950/40 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Welcome back, Account Executive
          </span>
          <h2 className="text-xl font-bold text-white mt-1">
            Your Deal Intelligence Overview
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            DealMind is currently monitoring <strong className="text-white">{customers.length} enterprise accounts</strong> with{' '}
            <strong className="text-brand-300 font-mono">${(totalPipeline).toLocaleString()}</strong> in active pipeline. 
            All deal recommendations are grounded in persistent memories stored in Hindsight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('demo')}
            className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-2 shadow-sm transition-all"
          >
            <PlayCircle className="w-4 h-4" />
            <span>Learning Demo</span>
          </button>
          <button
            onClick={() => {
              onSelectCustomer('cust-acme');
              onNavigate('briefing');
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-all hover:scale-[1.02]"
          >
            <Sparkles className="w-4 h-4" />
            <span>Prepare Next Call</span>
          </button>
        </div>
      </div>

      {/* Memory Health Section */}
      <MemoryHealthWidget health={memoryHealth} />

      {/* Grid: Active Deals + Recent Memory Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Active Deals Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              Active Enterprise Pipeline
            </h3>
            <button
              onClick={() => onNavigate('deals')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>View all deals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {customers.map((c) => (
              <div
                key={c.id}
                onClick={() => onSelectCustomer(c.id)}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800/90 hover:border-brand-500/40 cursor-pointer transition-all hover:shadow-xl hover:shadow-brand-500/5 group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-white text-base group-hover:text-brand-300 transition-colors">
                        {c.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate max-w-[180px]">{c.snapshot.industry}</p>
                    </div>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      c.deal_stage === 'Negotiation' ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' :
                      c.deal_stage === 'Proposal' ? 'bg-blue-500/10 text-blue-300 border-blue-500/30' :
                      'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {c.deal_stage}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Deal Value</span>
                      <span className="text-lg font-bold font-mono text-white">
                        ${c.deal_value.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Probability</span>
                      <span className="text-xs font-mono font-bold text-brand-400">
                        {c.deal_probability}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-brand-500 h-1.5 rounded-full"
                      style={{ width: `${c.deal_probability}%` }}
                    ></div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="truncate">
                    {c.known_preferences.length} preferences • {c.known_objections.length} objections
                  </span>
                  <span className="text-brand-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Hindsight Learning Activity (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-400" />
              Recent Memory Activity
            </h3>
            <button
              onClick={() => onNavigate('timeline')}
              className="text-xs text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium transition-colors"
            >
              <span>Full timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/60 max-h-[460px] overflow-y-auto">
            {recentMemories.slice(0, 6).map((mem) => (
              <div key={mem.id} className="py-3 first:pt-1 last:pb-1 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    mem.category === 'Objection' ? 'bg-red-500/10 text-red-300' :
                    mem.category === 'Competitor' ? 'bg-amber-500/10 text-amber-300' :
                    mem.category === 'Preference' ? 'bg-emerald-500/10 text-emerald-300' :
                    'bg-brand-500/10 text-brand-300'
                  }`}>
                    {mem.category}
                  </span>
                  <span className="text-[10px] text-slate-500">{mem.timestamp}</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-medium mt-1">
                  {mem.memory}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate">{mem.source}</span>
                  <span className="text-slate-500 font-mono text-[10px]">{mem.importance}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
