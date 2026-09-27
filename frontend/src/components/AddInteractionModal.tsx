import React, { useState } from 'react';
import { X, Sparkles, Check, Loader2, Plus, Trash2 } from 'lucide-react';
import { Customer, InteractionCreate } from '../types';
import { addInteraction } from '../services/api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  selectedCustomerId?: string;
  onInteractionAdded: () => void;
}

export const AddInteractionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  customers,
  selectedCustomerId,
  onInteractionAdded
}) => {
  const [customerId, setCustomerId] = useState(selectedCustomerId || (customers[0]?.id || ''));
  const [contactName, setContactName] = useState('');
  const [interactionType, setInteractionType] = useState('Technical Meeting');
  const [notes, setNotes] = useState('');
  const [outcome, setOutcome] = useState('');
  const [nextAction, setNextAction] = useState('');
  
  const [objections, setObjections] = useState<string[]>([]);
  const [newObjection, setNewObjection] = useState('');
  
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learningStep, setLearningStep] = useState<'idle' | 'learning' | 'learned'>('idle');

  if (!isOpen) return null;

  const handleAddObjection = () => {
    if (newObjection.trim() && !objections.includes(newObjection.trim())) {
      setObjections([...objections, newObjection.trim()]);
      setNewObjection('');
    }
  };

  const handleAddCompetitor = () => {
    if (newCompetitor.trim() && !competitors.includes(newCompetitor.trim())) {
      setCompetitors([...competitors, newCompetitor.trim()]);
      setNewCompetitor('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !notes.trim()) return;

    try {
      setIsSubmitting(true);
      setLearningStep('learning');

      const payload: InteractionCreate = {
        customer_id: customerId,
        contact_name: contactName || undefined,
        interaction_type: interactionType,
        notes,
        outcome: outcome || undefined,
        objections,
        competitors,
        next_action: nextAction || undefined
      };

      await addInteraction(customerId, payload);
      
      // Step to "learned" animation
      setLearningStep('learned');
      setTimeout(() => {
        setIsSubmitting(false);
        setLearningStep('idle');
        onInteractionAdded();
        onClose();
      }, 1400);

    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setLearningStep('idle');
      alert('Failed to save interaction. Please check backend connection.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Record Customer Touchpoint</h3>
              <p className="text-xs text-slate-400">Captures meeting details & retains persistent memory in Hindsight</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Customer Account *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (${c.deal_value.toLocaleString()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Interaction Type</label>
              <select
                value={interactionType}
                onChange={(e) => setInteractionType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
              >
                <option value="Discovery Call">Discovery Call</option>
                <option value="Technical Meeting">Technical Meeting</option>
                <option value="Demo">Demo</option>
                <option value="Pricing Discussion">Pricing Discussion</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Executive Call">Executive Call</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Stakeholder / Contact</label>
              <input
                type="text"
                placeholder="e.g. Sarah Lin (VP Engineering)"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Date</label>
              <input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Meeting Notes & Customer Quotes *</label>
            <textarea
              rows={3}
              required
              placeholder="What did the customer say? What objections, priorities, or pricing concerns were raised?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
            />
          </div>

          {/* Objections Tagging */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Customer Objections Raised</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Migration downtime, Pricing markup"
                value={newObjection}
                onChange={(e) => setNewObjection(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddObjection(); } }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddObjection}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {objections.map((obj, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/20 text-red-300 text-xs flex items-center gap-1.5">
                  {obj}
                  <button type="button" onClick={() => setObjections(objections.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Competitors Mentioned */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Competitors Mentioned</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="e.g. Competitor X, InferaCloud"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddCompetitor(); } }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-brand-500"
              />
              <button
                type="button"
                onClick={handleAddCompetitor}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded-lg flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {competitors.map((comp, i) => (
                <span key={i} className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-1.5">
                  {comp}
                  <button type="button" onClick={() => setCompetitors(competitors.filter((_, idx) => idx !== i))}>
                    <Trash2 className="w-3 h-3 hover:text-white" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Call Outcome</label>
              <input
                type="text"
                placeholder="e.g. Approved technical evaluation phase"
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Agreed Next Action</label>
              <input
                type="text"
                placeholder="e.g. Send migration case study"
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 text-sm"
              />
            </div>
          </div>

          {/* Footer & Submit Button with Retain Animation */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              * Automatically synthesized into Hindsight memory.
            </span>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting || !notes.trim()}
                className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  learningStep === 'learned'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : learningStep === 'learning'
                    ? 'bg-brand-700 text-white cursor-wait'
                    : 'bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-brand-600/25'
                }`}
              >
                {learningStep === 'learning' && (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Retaining to Hindsight...</span>
                  </>
                )}
                {learningStep === 'learned' && (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Memory Retained!</span>
                  </>
                )}
                {learningStep === 'idle' && (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Learn</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
