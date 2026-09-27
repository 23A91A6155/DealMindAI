import React from 'react';
import { X, Server, Database, Activity, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { HindsightStatus } from '../types';

interface Props {
  status: HindsightStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

export const HindsightStatusModal: React.FC<Props> = ({ status, isOpen, onClose }) => {
  if (!isOpen || !status) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-850">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${status.connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-white flex items-center gap-2">
                Hindsight Memory Engine
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  status.connected 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {status.mode}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Semantic memory layer for sales intelligence</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Database className="w-3.5 h-3.5 text-brand-400" />
                Target Memory Bank ID
              </span>
              <p className="font-mono text-white text-sm font-medium">{status.bank_id}</p>
            </div>

            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                <Activity className="w-3.5 h-3.5 text-brand-400" />
                Memory Units Stored
              </span>
              <p className="font-mono text-white text-sm font-medium">{status.memory_units_count} Units</p>
            </div>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-brand-400" />
              API Server Endpoint
            </span>
            <p className="font-mono text-xs text-slate-300 break-all bg-slate-900 px-3 py-2 rounded-lg border border-slate-800">
              {status.api_url}
            </p>
          </div>

          <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Last Memory Operation</span>
            <p className="text-xs text-slate-200 font-mono bg-slate-900/60 px-3 py-2 rounded border border-slate-800/80">
              {status.last_operation || 'System initialized with seed memories.'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50 text-xs text-slate-300 space-y-2">
            <div className="flex items-start gap-2">
              {status.connected ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <p>{status.details}</p>
            </div>
            {!status.connected && (
              <p className="text-slate-400 pl-6">
                DealMind automatically uses an in-process semantic memory simulator with full <code className="text-brand-300">retain</code>, <code className="text-brand-300">recall</code>, and <code className="text-brand-300">reflect</code> support so you can test all features without requiring external cloud accounts.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-850 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
