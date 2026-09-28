import React, { useState } from 'react';
import { Target, CheckCircle2, XCircle, AlertCircle, Clock, Plus, ChevronDown, ChevronUp, Sparkles, Send } from 'lucide-react';
import { StrategyAttempt, StrategyCreate, StrategyUpdateOutcome } from '../types';
import { createStrategyAttempt, updateStrategyOutcome } from '../services/api';

interface Props {
  customerId: string;
  strategies: StrategyAttempt[];
  onRefresh: () => void;
}

export const StrategyDnaCard: React.FC<Props> = ({ customerId, strategies, onRefresh }) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Form states for new strategy
  const [newType, setNewType] = useState<string>('ROI presentation');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newObjection, setNewObjection] = useState<string>('');
  const [newStakeholder, setNewStakeholder] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');

  // Form states for outcome update
  const [outcomeStatus, setOutcomeStatus] = useState<string>('SUCCESSFUL');
  const [customerResponse, setCustomerResponse] = useState<string>('');
  const [outcomeNotes, setOutcomeNotes] = useState<string>('');

  const strategyTypes = [
    'ROI presentation',
    'Product demonstration',
    'Technical case study',
    'Discount negotiation',
    'Competitor comparison',
    'Security reassurance',
    'Implementation planning',
    'Pilot proposal',
    'Executive alignment'
  ];

  const handleCreateStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDesc.trim()) return;
    setLoading(true);
    try {
      const payload: StrategyCreate = {
        customer_id: customerId,
        strategy_type: newType,
        strategy_description: newDesc,
        objection_addressed: newObjection || undefined,
        stakeholder_name: newStakeholder || undefined,
        salesperson_notes: newNotes || undefined,
        observed_outcome: 'NOT_ATTEMPTED'
      };
      await createStrategyAttempt(payload);
      setNewDesc('');
      setNewObjection('');
      setNewStakeholder('');
      setNewNotes('');
      setShowAddModal(false);
      onRefresh();
    } catch (err) {
      console.error('Failed to create strategy:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOutcome = async (stratId: string) => {
    if (!customerResponse.trim()) return;
    setLoading(true);
    try {
      const payload: StrategyUpdateOutcome = {
        observed_outcome: outcomeStatus,
        customer_response: customerResponse,
        salesperson_notes: outcomeNotes || undefined,
        outcome_confidence: 0.9
      };
      await updateStrategyOutcome(stratId, payload);
      setEditingId(null);
      setCustomerResponse('');
      setOutcomeNotes('');
      onRefresh();
    } catch (err) {
      console.error('Failed to update strategy outcome:', err);
    } finally {
      setLoading(false);
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'SUCCESSFUL':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" />
            SUCCESSFUL
          </span>
        );
      case 'UNSUCCESSFUL':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3.5 h-3.5" />
            UNSUCCESSFUL
          </span>
        );
      case 'PARTIALLY_SUCCESSFUL':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <AlertCircle className="w-3.5 h-3.5" />
            PARTIALLY SUCCESSFUL
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            <Clock className="w-3.5 h-3.5" />
            NOT ATTEMPTED
          </span>
        );
    }
  };

  const successfulCount = strategies.filter(s => s.observed_outcome === 'SUCCESSFUL').length;
  const unsuccessfulCount = strategies.filter(s => s.observed_outcome === 'UNSUCCESSFUL').length;
  const totalAttempted = successfulCount + unsuccessfulCount;
  const winRate = totalAttempted > 0 ? Math.round((successfulCount / totalAttempted) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header with Stats & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Strategy DNA Ledger</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Hindsight Outcome-Aware
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracks pitch attempts, customer reactions, and real outcomes to prevent repeating past mistakes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
            <span className="text-slate-400">Strategy Win Rate:</span>
            <span className="font-bold text-emerald-400">{winRate}%</span>
            <span className="text-slate-500">({successfulCount}W / {unsuccessfulCount}L)</span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            Add Strategy Attempt
          </button>
        </div>
      </div>

      {/* Strategy List */}
      <div className="grid gap-4">
        {strategies.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm">
            No strategies recorded yet. Click "Add Strategy Attempt" to log the first pitch approach.
          </div>
        ) : (
          strategies.map((strat) => {
            const isEditing = editingId === strat.id;

            return (
              <div
                key={strat.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white">
                      {strat.strategy_type}
                    </span>
                    {strat.stakeholder_name && (
                      <span className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                        Target: {strat.stakeholder_name}
                      </span>
                    )}
                    <span className="text-xs text-slate-500">
                      Attempted: {strat.date_attempted}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getOutcomeBadge(strat.observed_outcome)}
                    <button
                      onClick={() => setEditingId(isEditing ? null : strat.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    >
                      {isEditing ? 'Cancel' : 'Record Outcome'}
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-medium">Strategy Pitch: </span>
                    <span className="text-slate-200">{strat.strategy_description}</span>
                  </div>

                  {strat.objection_addressed && (
                    <div>
                      <span className="text-amber-400 font-medium">Target Objection: </span>
                      <span className="text-slate-300">{strat.objection_addressed}</span>
                    </div>
                  )}

                  {strat.customer_response && (
                    <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 space-y-1">
                      <div className="text-indigo-400 font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Observed Customer Reaction:
                      </div>
                      <p className="text-slate-200 italic">"{strat.customer_response}"</p>
                      {strat.salesperson_notes && (
                        <p className="text-slate-400 text-[11px] pt-1">
                          Rep Takeaway: {strat.salesperson_notes}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Inline Outcome Editor */}
                {isEditing && (
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-indigo-500/40 space-y-3 animate-fadeIn">
                    <div className="text-xs font-semibold text-indigo-300">
                      Log Real Customer Outcome into Hindsight Memory:
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Observed Outcome</label>
                        <select
                          value={outcomeStatus}
                          onChange={(e) => setOutcomeStatus(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="SUCCESSFUL">SUCCESSFUL (Customer agreed / advanced)</option>
                          <option value="UNSUCCESSFUL">UNSUCCESSFUL (Customer pushed back / rejected)</option>
                          <option value="PARTIALLY_SUCCESSFUL">PARTIALLY SUCCESSFUL (Mixed feedback)</option>
                          <option value="INCONCLUSIVE">INCONCLUSIVE (Pending further review)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">Rep Takeaway / Next Action</label>
                        <input
                          type="text"
                          value={outcomeNotes}
                          onChange={(e) => setOutcomeNotes(e.target.value)}
                          placeholder="e.g. Pivot to fixed-fee milestone contract"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Customer Reaction / Quote *</label>
                      <textarea
                        rows={2}
                        value={customerResponse}
                        onChange={(e) => setCustomerResponse(e.target.value)}
                        placeholder="What exact pushback or enthusiasm did the customer express?"
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleUpdateOutcome(strat.id)}
                        disabled={loading || !customerResponse.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50"
                      >
                        <Send className="w-3 h-3" />
                        {loading ? 'Retaining...' : 'Commit Outcome to Hindsight'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Strategy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg p-6 bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" />
                Add New Sales Strategy Attempt
              </h4>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateStrategy} className="space-y-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Strategy Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                >
                  {strategyTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Target Stakeholder</label>
                <input
                  type="text"
                  value={newStakeholder}
                  onChange={(e) => setNewStakeholder(e.target.value)}
                  placeholder="e.g. David Keller (VP Procurement)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Objection Being Addressed</label>
                <input
                  type="text"
                  value={newObjection}
                  onChange={(e) => setNewObjection(e.target.value)}
                  placeholder="e.g. Upfront professional services fees"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Strategy Description *</label>
                <textarea
                  rows={3}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Describe the exact proposal, deck, or proof point presented..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Sales Rep Notes / Hypothesis</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Testing if milestone billing unlocks legal sign-off"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !newDesc.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Register Strategy'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
