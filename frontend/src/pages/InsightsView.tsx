import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle2, Shield, ThumbsUp, ArrowRight, Brain, RotateCcw } from 'lucide-react';
import { InsightsOverview } from '../types';
import { fetchInsights } from '../services/api';

export const InsightsView: React.FC = () => {
  const [insights, setInsights] = useState<InsightsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLoopStep, setActiveLoopStep] = useState<number>(3);

  useEffect(() => {
    loadInsights();
  }, []);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await fetchInsights();
      setInsights(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !insights) {
    return <div className="p-12 text-center text-slate-500 text-xs">Loading sales intelligence patterns...</div>;
  }

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3 mb-1">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Macro Sales Intelligence & Deal Insights</h2>
            <p className="text-xs text-slate-400">Longitudinal pattern recognition synthesized across all stored memories</p>
          </div>
        </div>
      </div>

      {/* Memory-to-Strategy Loop Visualizer */}
      <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-brand-500/30 shadow-xl space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Hackathon Innovation
          </span>
          <h3 className="text-lg font-bold text-white mt-0.5">
            The Continuous Memory-to-Strategy Loop
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            DealMind doesn't simply store static notes. It feeds interaction outcomes back into Hindsight, 
            allowing every deal to benefit from historical wins and lessons learned.
          </p>
        </div>

        {/* Steps Ribbon */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
          {insights.loop_stages.map((stage) => {
            const isSelected = activeLoopStep === stage.step;
            return (
              <div
                key={stage.step}
                onClick={() => setActiveLoopStep(stage.step)}
                className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-brand-500/15 border-brand-500 text-white shadow-lg shadow-brand-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-brand-300">
                      0{stage.step}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Loop</span>
                  </div>
                  <h4 className="font-bold text-white text-xs mb-1">{stage.title}</h4>
                  <p className="text-[11px] leading-relaxed text-slate-300 line-clamp-3">{stage.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2x2 Intelligence Matrix */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Repeated Objections */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              Repeated Objections Across Accounts
            </h3>
            <span className="text-xs text-slate-500">Frequency Analysis</span>
          </div>

          <div className="space-y-3">
            {insights.repeated_objections.map((obj, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{obj.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                    Flagged {obj.count}x
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  {obj.details.map((d, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-red-400/80">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Proven Successful Messaging */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Proven High-Converting Messaging
            </h3>
            <span className="text-xs text-slate-500">Positive Outcomes</span>
          </div>

          <div className="space-y-3">
            {insights.successful_messaging.map((msg, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{msg.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Validated {msg.count}x
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  {msg.details.map((d, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400/80">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deal Risks */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              Active Deal Risks
            </h3>
            <span className="text-xs text-slate-500">Unresolved Concerns</span>
          </div>

          <div className="space-y-3">
            {insights.deal_risks.map((risk, i) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-850 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-white">{risk.title}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    {risk.count} Accounts
                  </span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  {risk.details.map((d, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400/80">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-brand-400" />
              Recommended Pipeline Next Actions
            </h3>
            <span className="text-xs text-slate-500">Next 7 Days</span>
          </div>

          <div className="space-y-2.5 text-xs text-slate-200">
            {insights.recommended_actions.map((act, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-950/70 border border-slate-850 flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-mono text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{act}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
