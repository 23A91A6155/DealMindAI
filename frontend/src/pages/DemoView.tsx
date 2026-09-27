import React, { useState, useEffect } from 'react';
import { PlayCircle, RotateCcw, Sparkles, Brain, CheckCircle2, Bot, ArrowRight, Loader2, Award } from 'lucide-react';
import { DemoStep, BeforeVsAfter } from '../types';
import { runLearningDemo, resetLearningDemo, fetchBeforeVsAfter } from '../services/api';
import { BeforeVsAfterCard } from '../components/BeforeVsAfterCard';

interface Props {
  onRefreshGlobalData: () => void;
}

export const DemoView: React.FC<Props> = ({ onRefreshGlobalData }) => {
  const [steps, setSteps] = useState<DemoStep[]>([]);
  const [beforeVsAfter, setBeforeVsAfter] = useState<BeforeVsAfter | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    loadBeforeVsAfter();
  }, []);

  const loadBeforeVsAfter = async () => {
    try {
      const bva = await fetchBeforeVsAfter();
      setBeforeVsAfter(bva);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRunDemo = async () => {
    try {
      setIsRunning(true);
      setSteps([]);
      setActiveStepIndex(null);

      const demoSteps = await runLearningDemo();
      
      // Animate steps sequentially so the judge can clearly watch the learning progression
      for (let i = 0; i < demoSteps.length; i++) {
        setActiveStepIndex(i);
        setSteps((prev) => [...prev, demoSteps[i]]);
        await new Promise((r) => setTimeout(r, 650));
      }
      onRefreshGlobalData();
    } catch (err) {
      console.error(err);
      alert('Error running learning demo.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsResetting(true);
      await resetLearningDemo();
      setSteps([]);
      setActiveStepIndex(null);
      onRefreshGlobalData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      {/* Demo Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-brand-950/30 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Award className="w-4 h-4" /> HackWith Hyderabad 3.0 Star Evaluation
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Learning Curve Progression Demo
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Witness how DealMind transforms across 5 sequential interactions from a generic assistant 
            into an adaptive, memory-grounded sales copilot using Hindsight.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleResetDemo}
            disabled={isResetting || isRunning}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-2 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo</span>
          </button>

          <button
            onClick={handleRunDemo}
            disabled={isRunning}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-brand-600 hover:from-amber-400 hover:to-brand-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            {isRunning ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating Learning Loop...</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4" />
                <span>Run 5-Step Learning Demo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Before vs After Memory Card */}
      {beforeVsAfter && <BeforeVsAfterCard data={beforeVsAfter} />}

      {/* 5-Step Sequence Live Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-400" />
            Live 5-Step Knowledge Accumulation
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {steps.length}/5 Steps Simulated
          </span>
        </div>

        {steps.length === 0 && !isRunning ? (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
            <PlayCircle className="w-12 h-12 text-brand-400 mx-auto opacity-70" />
            <h4 className="font-semibold text-white text-sm">Ready to Test the Learning Progression</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click <strong>"Run 5-Step Learning Demo"</strong> to watch DealMind retain 4 sequential customer inputs, 
              accumulate knowledge, and finally synthesize a personalized strategy.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {steps.map((s, idx) => (
              <div
                key={s.step_number}
                className={`p-5 rounded-2xl border transition-all animate-fadeIn ${
                  s.step_number === 5
                    ? 'bg-gradient-to-r from-brand-950/40 via-slate-900 to-slate-900 border-brand-500/50 shadow-xl'
                    : 'bg-slate-900 border-slate-800'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/80">
                  <div className="flex items-center space-x-2.5">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs ${
                      s.step_number === 5
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}>
                      {s.step_number}
                    </span>
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.step_title}</h4>
                      <span className="text-[11px] text-slate-400">Account: {s.customer_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-0.5 rounded font-mono bg-slate-950 text-slate-400 border border-slate-800">
                      Accumulated Memory: <strong className="text-brand-300">{s.accumulated_memory_count}</strong>
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                      s.action_type === 'reflect'
                        ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}>
                      {s.action_type === 'reflect' ? 'Hindsight Reflect' : 'Hindsight Retain'}
                    </span>
                  </div>
                </div>

                {/* Customer Input */}
                <div className="mb-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 text-xs">
                  <span className="text-slate-500 font-semibold block mb-0.5 text-[10px] uppercase">
                    Customer Input / Signal:
                  </span>
                  <p className="text-white italic">"{s.input_text}"</p>
                </div>

                {/* Agent Response */}
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-850 text-xs text-slate-300 leading-relaxed">
                  <span className="text-brand-400 font-semibold block mb-1 text-[10px] uppercase">
                    Agent Intelligence Output:
                  </span>
                  <div className="whitespace-pre-line">{s.agent_output}</div>
                </div>

                {/* Retained Memory */}
                {s.memory_retained && (
                  <div className="mt-2.5 pt-2 flex items-center gap-2 text-[11px] text-brand-300/90 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                    <span>Retained into Hindsight: "{s.memory_retained}"</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
