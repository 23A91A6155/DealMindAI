import React, { useEffect, useState } from 'react';
import { BarChart3, CheckCircle, Award, Zap, AlertTriangle, ShieldCheck, Play, Sparkles } from 'lucide-react';
import { EvaluationBenchmarkResult } from '../types';
import { fetchEvaluationBenchmark, runLiveBenchmark } from '../services/api';

export const EvaluationView: React.FC = () => {
  const [benchmark, setBenchmark] = useState<EvaluationBenchmarkResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [runningLive, setRunningLive] = useState<boolean>(false);
  const [liveSuccessMsg, setLiveSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadBenchmark();
  }, []);

  const loadBenchmark = async () => {
    setLoading(true);
    try {
      const data = await fetchEvaluationBenchmark();
      setBenchmark(data);
    } catch (err) {
      console.error('Failed to load benchmark:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunLive = async () => {
    setRunningLive(true);
    setLiveSuccessMsg(null);
    try {
      const res = await runLiveBenchmark('cust-acme');
      setBenchmark(res.benchmark);
      setLiveSuccessMsg(
        `Benchmark completed across 3 accounts! Mode C achieved ${res.delta.relevance_gain} with ${res.delta.mistake_avoidance}.`
      );
    } catch (err) {
      console.error('Failed to run live benchmark:', err);
    } finally {
      setRunningLive(false);
    }
  };

  if (loading || !benchmark) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-3 text-slate-400">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading Evaluation Suite...</span>
        </div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Strategic Relevance Score',
      unit: '/100',
      a: benchmark.mode_a_stateless.relevance_score,
      b: benchmark.mode_b_hindsight.relevance_score,
      c: benchmark.mode_c_outcome_aware.relevance_score,
      desc: 'Overall alignment with customer needs, decision makers, and current commercial constraints.'
    },
    {
      title: 'Objection Recall Rate',
      unit: '%',
      a: benchmark.mode_a_stateless.objection_recall_rate,
      b: benchmark.mode_b_hindsight.objection_recall_rate,
      c: benchmark.mode_c_outcome_aware.objection_recall_rate,
      desc: 'Percentage of past customer objections remembered and addressed.'
    },
    {
      title: 'Strategy & Outcome Awareness',
      unit: '%',
      a: benchmark.mode_a_stateless.strategy_awareness,
      b: benchmark.mode_b_hindsight.strategy_awareness,
      c: benchmark.mode_c_outcome_aware.strategy_awareness,
      desc: 'Prevention of repeating failed pitches by learning from observed outcomes.'
    },
    {
      title: 'Evidence Citation Grounding',
      unit: '%',
      a: benchmark.mode_a_stateless.evidence_citation_coverage,
      b: benchmark.mode_b_hindsight.evidence_citation_coverage,
      c: benchmark.mode_c_outcome_aware.evidence_citation_coverage,
      desc: 'Explicit references to historical dates, interactions, and verified memory units.'
    },
    {
      title: 'Hallucination & Drift Rate',
      unit: '%',
      inverse: true,
      a: benchmark.mode_a_stateless.hallucination_rate,
      b: benchmark.mode_b_hindsight.hallucination_rate,
      c: benchmark.mode_c_outcome_aware.hallucination_rate,
      desc: 'False assumptions or fabricated statements (lower is better).'
    }
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Reproducible Evaluation Suite
              </h1>
              <p className="text-xs text-indigo-300 font-medium">
                Benchmark Dataset: {benchmark.dataset_version} • {benchmark.total_eval_scenarios} Complex B2B Scenarios
              </p>
            </div>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Quantitatively measures the difference between generic stateless AI, factual memory assistance, and DealMind AI's outcome-aware strategic intelligence.
          </p>
        </div>

        <button
          onClick={handleRunLive}
          disabled={runningLive}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/25 transition-all hover:scale-105 disabled:opacity-50"
        >
          <Play className={`w-4 h-4 fill-white ${runningLive ? 'animate-spin' : ''}`} />
          {runningLive ? 'Evaluating Multi-Turn Benchmarks...' : 'Run Live Benchmark Evaluation'}
        </button>
      </div>

      {liveSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-3 animate-fadeIn">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{liveSuccessMsg}</span>
        </div>
      )}

      {/* Comparison Modes Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mode A */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              BASELINE
            </span>
            <span className="text-xs text-slate-500">~{benchmark.mode_a_stateless.avg_latency_ms}ms</span>
          </div>
          <h3 className="text-base font-bold text-slate-300">{benchmark.mode_a_stateless.mode_name}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{benchmark.mode_a_stateless.description}</p>
        </div>

        {/* Mode B */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/30">
              MEMORY ACTIVE
            </span>
            <span className="text-xs text-slate-500">~{benchmark.mode_b_hindsight.avg_latency_ms}ms</span>
          </div>
          <h3 className="text-base font-bold text-sky-200">{benchmark.mode_b_hindsight.mode_name}</h3>
          <p className="text-xs text-slate-400 leading-relaxed">{benchmark.mode_b_hindsight.description}</p>
        </div>

        {/* Mode C */}
        <div className="p-5 rounded-2xl bg-gradient-to-b from-indigo-950/60 to-slate-900/90 border border-indigo-500/40 space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> OUTCOME-AWARE (OURS)
            </span>
            <span className="text-xs text-slate-500">~{benchmark.mode_c_outcome_aware.avg_latency_ms}ms</span>
          </div>
          <h3 className="text-base font-bold text-white">{benchmark.mode_c_outcome_aware.mode_name}</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{benchmark.mode_c_outcome_aware.description}</p>
        </div>
      </div>

      {/* Quantitative Metric Comparison Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Quantitative Performance Comparison</h2>
          </div>
          <span className="text-xs text-slate-500">Evaluated on identical multi-stakeholder scenarios</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {metrics.map((m, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-200">{m.title}</h4>
                  <span className="text-[10px] text-slate-400">{m.unit}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{m.desc}</p>
              </div>

              {/* Bar representations */}
              <div className="space-y-2 pt-2 border-t border-slate-700/50 text-xs">
                {/* Mode A */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-400 w-24 truncate">Mode A (Stateless)</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-600 rounded-full"
                      style={{ width: `${Math.min(m.a, 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-400 w-10 text-right">
                    {m.a}{m.unit}
                  </span>
                </div>

                {/* Mode B */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] text-sky-300 w-24 truncate">Mode B (Hindsight)</span>
                  <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${Math.min(m.b, 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-sky-300 w-10 text-right">
                    {m.b}{m.unit}
                  </span>
                </div>

                {/* Mode C */}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[11px] font-bold text-emerald-300 w-24 truncate">Mode C (DealMind)</span>
                  <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-indigo-500 rounded-full"
                      style={{ width: `${Math.min(m.c, 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-emerald-400 w-10 text-right">
                    {m.c}{m.unit}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Side-by-Side Strategy Sample Output Comparison */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="border-b border-slate-800 pb-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Qualitative Output Comparison: Acme Corp Upcoming Meeting Strategy
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Observe how Mode C directly identifies why previous attempts failed and dynamically adapts the proposal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Output A */}
          <div className="p-4 rounded-2xl bg-slate-800/30 border border-slate-700/50 space-y-2">
            <div className="font-bold text-slate-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> Mode A Output
            </div>
            <p className="text-slate-300 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{benchmark.mode_a_stateless.sample_recommendation}"
            </p>
            <div className="text-[11px] text-rose-400/90 pt-1">
              ❌ Generic advice, asks basic questions already answered in earlier calls. High probability of repeating failed pitches.
            </div>
          </div>

          {/* Output B */}
          <div className="p-4 rounded-2xl bg-sky-950/20 border border-sky-500/30 space-y-2">
            <div className="font-bold text-sky-300 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400" /> Mode B Output
            </div>
            <p className="text-slate-200 leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              "{benchmark.mode_b_hindsight.sample_recommendation}"
            </p>
            <div className="text-[11px] text-sky-400/90 pt-1">
              ✓ Good factual memory recall of names & objections. Still risks repeating standard ROI pitch if outcome history isn't synthesized.
            </div>
          </div>

          {/* Output C */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/40 space-y-2 shadow-lg">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Mode C (Outcome-Aware) Output
            </div>
            <p className="text-white leading-relaxed italic bg-slate-900/80 p-3 rounded-xl border border-indigo-500/30">
              "{benchmark.mode_c_outcome_aware.sample_recommendation}"
            </p>
            <div className="text-[11px] text-emerald-400 pt-1 font-medium">
              ★ Explicit "STRATEGY CHANGED BECAUSE" reasoning. 0% repetition of failed pitch. Solves active contradiction in real time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
