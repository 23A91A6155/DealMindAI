import React from 'react';
import { Settings, Server, Database, Key, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import { HindsightStatus } from '../types';

interface Props {
  hindsightStatus: HindsightStatus | null;
}

export const SettingsView: React.FC<Props> = ({ hindsightStatus }) => {
  return (
    <div className="space-y-6 animate-fadeIn pb-12 max-w-4xl">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">System Settings & Memory Config</h2>
            <p className="text-xs text-slate-400">
              Hindsight semantic memory engine, LLM inference provider, and API connectivity
            </p>
          </div>
        </div>
      </div>

      {/* Hindsight Status Card */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-brand-400" />
            Hindsight Memory Integration
          </h3>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
            hindsightStatus?.connected
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
          }`}>
            {hindsightStatus?.mode || 'Demo Memory Mode'}
          </span>
        </div>

        <div className="grid md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Hindsight API Server</span>
            <p className="text-white font-mono">{hindsightStatus?.api_url || 'https://api.hindsight.vectorize.io'}</p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 space-y-1">
            <span className="text-slate-500 font-semibold block text-[10px] uppercase">Memory Bank ID</span>
            <p className="text-brand-300 font-mono font-bold">{hindsightStatus?.bank_id || 'dealmind-demo'}</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-850 text-xs text-slate-300 space-y-2">
          <span className="text-slate-400 font-semibold block text-[11px]">Separation of Storage Layers:</span>
          <div className="grid md:grid-cols-2 gap-3 text-[11px] text-slate-400">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-white block mb-0.5">SQLite (<code className="text-brand-300">dealmind.db</code>)</strong>
              Used strictly for relational app metadata: customers, pipeline stages, contact profiles, raw meeting logs, timestamps.
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <strong className="text-white block mb-0.5">Hindsight (<code className="text-brand-300">hindsight-client</code>)</strong>
              Dedicated semantic memory engine: retains customer objections, recalls deal facts, reflects across interactions for personalized strategy.
            </div>
          </div>
        </div>
      </div>

      {/* Environment Configuration Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-indigo-400" />
          Quickstart Environment Variables (<code className="text-brand-300">.env</code>)
        </h3>
        <p className="text-slate-400 leading-relaxed">
          To connect your own live Hindsight Cloud instance or Groq API key, update the <code className="text-brand-300">.env</code> file:
        </p>

        <div className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 border border-slate-850 space-y-1 overflow-x-auto">
          <div><span className="text-slate-500"># Hindsight Cloud or Local API</span></div>
          <div>HINDSIGHT_API_URL=https://api.hindsight.vectorize.io</div>
          <div>HINDSIGHT_API_KEY=your_hindsight_api_key_here</div>
          <div>HINDSIGHT_BANK_ID=dealmind-demo</div>
          <div className="pt-2"><span className="text-slate-500"># Groq AI Orchestration</span></div>
          <div>GROQ_API_KEY=your_groq_api_key_here</div>
          <div>AI_MODEL=openai/gpt-oss-120b</div>
        </div>
      </div>
    </div>
  );
};
