import React from 'react';
import { Bot, Sparkles, CheckCircle2, XCircle, ArrowRight, Brain } from 'lucide-react';
import { BeforeVsAfter } from '../types';

interface Props {
  data: BeforeVsAfter;
}

export const BeforeVsAfterCard: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            The Memory Differentiator
          </span>
          <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-0.5">
            Before vs. After Hindsight Memory
          </h3>
        </div>
        <div className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
          <span className="text-slate-400 font-medium">Scenario: </span>
          {data.scenario}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 relative">
        {/* WITHOUT MEMORY: Generic AI */}
        <div className="p-5 rounded-2xl bg-slate-950/90 border border-red-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm">Generic AI Assistant</h4>
                  <p className="text-[11px] text-slate-400">Without persistent memory across meetings</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> NO MEMORY
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 text-xs leading-relaxed italic">
              "{data.generic_ai}"
            </div>

            <div className="mt-4 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5 text-red-400/80">
                <span>✕</span> <span>Forgets prior objections about migration downtime</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400/80">
                <span>✕</span> <span>Oblivious to Competitor X evaluation</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400/80">
                <span>✕</span> <span>Re-pitches standard marketing deck</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
            Result: Rep wastes meeting time sounding unprepared.
          </div>
        </div>

        {/* WITH HINDSIGHT MEMORY */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-brand-950/30 to-slate-950/90 border border-brand-500/40 shadow-xl shadow-brand-500/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-white text-sm flex items-center gap-1.5">
                    DealMind AI
                    <span className="text-[10px] font-mono font-semibold text-brand-300 bg-brand-500/20 px-1.5 py-0.5 rounded">
                      + Hindsight
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-400">Continuous recall & reflection over deal history</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> PERSISTENT MEMORY
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/90 border border-brand-500/30 text-white text-xs leading-relaxed font-medium">
              "{data.dealmind_hindsight}"
            </div>

            {/* Supporting Memories */}
            <div className="mt-4 space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-brand-300 flex items-center gap-1">
                <Brain className="w-3 h-3" /> Grounded in {data.supporting_memories.length} Retained Memories:
              </span>
              {data.supporting_memories.map((m, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                  <span className="text-brand-400 font-bold shrink-0 mt-0.5">✓</span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-brand-500/20 text-[11px] text-brand-300 font-medium">
            Result: Rep leads with winning proof and neutralizes competitor upfront.
          </div>
        </div>
      </div>
    </div>
  );
};
