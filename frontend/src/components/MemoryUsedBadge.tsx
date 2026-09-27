import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, Info, ShieldCheck } from 'lucide-react';

interface Props {
  memories: string[];
  whyRecommended?: string;
  sourceCount?: number;
}

export const MemoryUsedBadge: React.FC<Props> = ({
  memories,
  whyRecommended,
  sourceCount
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  if (!memories || memories.length === 0) return null;

  return (
    <div className="mt-2.5 pt-2 border-t border-slate-800/80">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/20 text-xs font-medium transition-colors"
        >
          <Brain className="w-3.5 h-3.5 text-brand-400" />
          <span>Memories Used ({sourceCount || memories.length})</span>
          {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
        </button>

        {whyRecommended && (
          <button
            onClick={() => setShowWhyModal(true)}
            className="text-[11px] text-slate-400 hover:text-brand-300 flex items-center gap-1 underline underline-offset-2 transition-colors"
          >
            <Info className="w-3 h-3" />
            Why did DealMind recommend this?
          </button>
        )}
      </div>

      {isExpanded && (
        <div className="mt-2 p-3 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 animate-fadeIn">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1">
            Grounded Hindsight Memory Traces:
          </span>
          {memories.map((m, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="text-brand-400 shrink-0 mt-0.5">•</span>
              <span className="leading-relaxed">{m}</span>
            </div>
          ))}
        </div>
      )}

      {/* Why Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-white text-sm">Strategic Grounding Rationale</h4>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {whyRecommended}
            </p>
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 mb-4 space-y-1">
              <span className="text-slate-300 font-medium block">Hindsight Epistemic Guarantee:</span>
              <p>
                DealMind never generates sales advice from generic training data alone. Every point is anchored to empirical facts and stakeholder concerns remembered from past interactions.
              </p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowWhyModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs text-white rounded-lg transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
