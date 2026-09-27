import React, { useState, useEffect } from 'react';
import { GitBranch, Brain, Filter, Plus, Calendar, Building2 } from 'lucide-react';
import { Customer, MemoryUnit } from '../types';
import { fetchTimeline } from '../services/api';

interface Props {
  customers: Customer[];
  selectedCustomerId?: string;
  onOpenAddInteraction: () => void;
}

export const TimelineView: React.FC<Props> = ({
  customers,
  selectedCustomerId,
  onOpenAddInteraction
}) => {
  const [activeCustomerId, setActiveCustomerId] = useState<string>(selectedCustomerId || 'cust-acme');
  const [timeline, setTimeline] = useState<MemoryUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    loadCustomerTimeline(activeCustomerId);
  }, [activeCustomerId]);

  const loadCustomerTimeline = async (custId: string) => {
    try {
      setLoading(true);
      const res = await fetchTimeline(custId);
      setTimeline(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTimeline = timeline.filter((m) => {
    if (categoryFilter === 'all') return true;
    return m.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const activeCustomer = customers.find((c) => c.id === activeCustomerId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <GitBranch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Memory Timeline</h2>
              <p className="text-xs text-slate-400">
                Visual demonstration that DealMind accumulates knowledge and retains customer history over time
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenAddInteraction}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Touchpoint</span>
        </button>
      </div>

      {/* Account Selector & Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Select Account:</span>
          <select
            value={activeCustomerId}
            onChange={(e) => setActiveCustomerId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 font-semibold"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} (${c.deal_value.toLocaleString()} • {c.deal_stage})
              </option>
            ))}
          </select>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 text-xs">
          <span className="text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['all', 'objection', 'preference', 'competitor', 'strategy'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize font-medium transition-all ${
                categoryFilter === cat
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Account Info Pill */}
      {activeCustomer && (
        <div className="px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <strong className="text-white">{filteredTimeline.length}</strong> persistent memory units retained for <strong className="text-brand-300">{activeCustomer.name}</strong>
          </div>
          <div className="text-slate-500 font-mono text-[11px]">
            Hindsight Bank ID: dealmind-demo
          </div>
        </div>
      )}

      {/* Chronological Timeline Stream */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading memory timeline...</div>
        ) : filteredTimeline.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">No memories found matching filter.</div>
        ) : (
          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {filteredTimeline.map((item) => (
              <div key={item.id} className="relative group">
                {/* Dot */}
                <div className={`absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  item.category === 'Objection' ? 'bg-red-400' :
                  item.category === 'Competitor' ? 'bg-amber-400' :
                  item.category === 'Preference' ? 'bg-emerald-400' :
                  item.category === 'Strategy' ? 'bg-purple-400' :
                  'bg-brand-400'
                }`}></div>

                <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 group-hover:border-slate-700 transition-all space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-400" />
                        {item.timestamp}
                      </span>
                      <span className="text-xs text-slate-400">• {item.interaction_type}</span>
                    </div>

                    <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider w-fit ${
                      item.category === 'Objection' ? 'bg-red-500/10 text-red-300 border border-red-500/20' :
                      item.category === 'Competitor' ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' :
                      item.category === 'Preference' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                      'bg-brand-500/10 text-brand-300 border border-brand-500/20'
                    }`}>
                      {item.category}
                    </span>
                  </div>

                  <div className="text-xs text-slate-200 leading-relaxed font-medium">
                    <span className="text-brand-400 font-bold mr-1.5">Memory Learned:</span>
                    {item.memory}
                  </div>

                  <div className="pt-2 border-t border-slate-900/90 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                    <span>Source: {item.source}</span>
                    <span className="font-mono text-[10px] bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Importance: {item.importance}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
