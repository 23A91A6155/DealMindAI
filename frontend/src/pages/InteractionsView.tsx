import React, { useState, useEffect } from 'react';
import { Customer, Interaction } from '../types';
import { fetchInteractions } from '../services/api';
import { MessageSquare, Plus, Calendar, Building2, Brain } from 'lucide-react';

interface Props {
  customers: Customer[];
  onOpenAddInteraction: () => void;
  onSelectCustomer: (id: string) => void;
}

export const InteractionsView: React.FC<Props> = ({
  customers,
  onOpenAddInteraction,
  onSelectCustomer
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('all');
  const [allInteractions, setAllInteractions] = useState<{ customer: Customer; interaction: Interaction }[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAllInteractions();
  }, [customers]);

  const loadAllInteractions = async () => {
    try {
      setLoading(true);
      const combined: { customer: Customer; interaction: Interaction }[] = [];
      for (const cust of customers) {
        try {
          const list = await fetchInteractions(cust.id);
          for (const item of list) {
            combined.push({ customer: cust, interaction: item });
          }
        } catch (e) {
          console.error(e);
        }
      }
      // Sort by date descending
      combined.sort((a, b) => (b.interaction.date || '').localeCompare(a.interaction.date || ''));
      setAllInteractions(combined);
    } finally {
      setLoading(false);
    }
  };

  const filtered = selectedCustomerId === 'all'
    ? allInteractions
    : allInteractions.filter((item) => item.customer.id === selectedCustomerId);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Customer Touchpoints & Interaction Logs</h2>
            <p className="text-xs text-slate-400">
              Meetings, calls, and email exchanges retained into Hindsight memory
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddInteraction}
          className="px-4 py-2 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-brand-600/20 transition-all hover:scale-[1.02]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save & Learn Interaction</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center space-x-3 text-xs">
        <span className="text-slate-400 font-medium">Filter by Account:</span>
        <select
          value={selectedCustomerId}
          onChange={(e) => setSelectedCustomerId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-white font-semibold focus:outline-none focus:border-brand-500 text-xs"
        >
          <option value="all">All Accounts ({allInteractions.length} touchpoints)</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Interactions List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 p-6 space-y-4">
        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading interaction logs...</div>
        ) : filtered.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">No interactions logged yet.</div>
        ) : (
          filtered.map(({ customer, interaction }) => (
            <div key={interaction.id} className="pt-4 first:pt-0 space-y-2 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div className="flex items-center gap-2">
                  <span
                    onClick={() => onSelectCustomer(customer.id)}
                    className="font-bold text-white text-sm hover:text-brand-300 cursor-pointer"
                  >
                    {customer.name}
                  </span>
                  <span className="text-slate-400">• {interaction.interaction_type}</span>
                  <span className="text-slate-500 text-[11px]">with {interaction.contact_name || 'Stakeholders'}</span>
                </div>
                <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {interaction.date}
                </span>
              </div>

              <p className="text-slate-300 leading-relaxed">{interaction.notes}</p>

              {interaction.retained_memory && (
                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/90 text-brand-300 text-xs flex items-start gap-2">
                  <Brain className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-500 font-semibold block text-[10px] uppercase">
                      Retained into Hindsight:
                    </span>
                    <span>{interaction.retained_memory}</span>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
                {interaction.objections.map((o, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                    Objection: {o}
                  </span>
                ))}
                {interaction.competitors.map((c, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Competitor: {c}
                  </span>
                ))}
                {interaction.outcome && (
                  <span className="text-slate-400">
                    Outcome: <strong className="text-slate-200">{interaction.outcome}</strong>
                  </span>
                )}
                {interaction.next_action && (
                  <span className="text-brand-300/90">
                    Next Action: <strong className="text-white">{interaction.next_action}</strong>
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
