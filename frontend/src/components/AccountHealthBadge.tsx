import React, { useEffect, useState } from 'react';
import { ShieldCheck, AlertTriangle, Clock, HelpCircle, Activity } from 'lucide-react';
import { AccountMemoryHealth } from '../types';
import { fetchAccountHealth } from '../services/api';

interface Props {
  customerId: string;
}

export const AccountHealthBadge: React.FC<Props> = ({ customerId }) => {
  const [health, setHealth] = useState<AccountMemoryHealth | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    fetchAccountHealth(customerId)
      .then((data) => {
        if (mounted) {
          setHealth(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Error fetching account health:', err);
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [customerId]);

  if (loading || !health) {
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-slate-800 text-slate-400 border border-slate-700 animate-pulse">
        <Activity className="w-3.5 h-3.5" />
        Checking Health...
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'FRESH':
        return {
          bg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: ShieldCheck,
          label: 'Memory Health: FRESH'
        };
      case 'NEEDS_REVIEW':
        return {
          bg: 'bg-amber-500/15 border-amber-500/40 text-amber-300',
          dot: 'bg-amber-400',
          icon: AlertTriangle,
          label: 'Memory Health: NEEDS REVIEW'
        };
      case 'OUTDATED':
        return {
          bg: 'bg-rose-500/15 border-rose-500/40 text-rose-300',
          dot: 'bg-rose-400',
          icon: Clock,
          label: 'Memory Health: OUTDATED'
        };
      default:
        return {
          bg: 'bg-slate-500/15 border-slate-500/40 text-slate-300',
          dot: 'bg-slate-400',
          icon: HelpCircle,
          label: 'Memory Health: INSUFFICIENT DATA'
        };
    }
  };

  const config = getStatusConfig(health.memory_status);
  const Icon = config.icon;

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:scale-105 ${config.bg}`}
        title="Click to view Account Memory Health diagnostics"
      >
        <span className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </button>

      {showDetails && (
        <div className="absolute right-0 top-10 z-50 w-80 p-4 bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/80 shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Icon className="w-4 h-4 text-emerald-400" />
              Account Memory Diagnostics
            </span>
            <button
              onClick={() => setShowDetails(false)}
              className="text-slate-400 hover:text-slate-200"
            >
              ✕
            </button>
          </div>

          <p className="text-slate-300 leading-relaxed">{health.status_reason}</p>

          {health.warning && (
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200">
              ⚠️ {health.warning}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 pt-1 text-slate-300">
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Total Memories</div>
              <div className="text-sm font-bold text-white">{health.memories_count}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Stakeholders</div>
              <div className="text-sm font-bold text-white">{health.stakeholders_count}</div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Strategy Outcomes</div>
              <div className="text-sm font-bold text-emerald-400">
                {health.successful_strategies_count}W / {health.unsuccessful_strategies_count}L
              </div>
            </div>
            <div className="bg-slate-800/60 p-2 rounded border border-slate-700/50">
              <div className="text-slate-400 text-[10px]">Contradictions</div>
              <div className={`text-sm font-bold ${health.unreviewed_contradictions_count > 0 ? 'text-amber-400' : 'text-slate-300'}`}>
                {health.contradictions_count} ({health.unreviewed_contradictions_count} open)
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
