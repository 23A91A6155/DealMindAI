import React from 'react';
import { Database, MessageSquare, ThumbsUp, AlertTriangle, Shield, Eye } from 'lucide-react';
import { MemoryHealth } from '../types';

interface Props {
  health: MemoryHealth | null;
}

export const MemoryHealthWidget: React.FC<Props> = ({ health }) => {
  if (!health) return null;

  const cards = [
    {
      label: 'Memories Retained',
      value: health.memories_count,
      sub: 'Persistent Hindsight units',
      icon: Database,
      color: 'text-brand-400',
      bg: 'bg-brand-500/10 border-brand-500/20'
    },
    {
      label: 'Deal Interactions',
      value: health.interactions_count,
      sub: 'Meetings & calls recorded',
      icon: MessageSquare,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      label: 'Learned Preferences',
      value: health.preferences_count,
      sub: 'Buyer priorities tracked',
      icon: ThumbsUp,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20'
    },
    {
      label: 'Known Objections',
      value: health.objections_count,
      sub: 'Friction points identified',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20'
    },
    {
      label: 'Proven Strategies',
      value: health.successful_approaches_count,
      sub: 'Messaging that converted',
      icon: Shield,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      label: 'Competitors Tracked',
      value: health.competitors_tracked_count,
      sub: 'Market threats logged',
      icon: Eye,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20'
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse"></span>
            Hindsight Memory Health
          </h3>
          <p className="text-xs text-slate-400">Live semantic knowledge accumulated across active deals</p>
        </div>
        <span className="text-xs font-mono px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
          Auto-Sync Active
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className={`p-3.5 rounded-xl border ${c.bg} transition-all hover:scale-[1.02]`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400 font-medium truncate">{c.label}</span>
                <Icon className={`w-4 h-4 ${c.color} shrink-0`} />
              </div>
              <div className="text-2xl font-bold font-mono text-white mb-0.5">{c.value}</div>
              <div className="text-[10px] text-slate-400 truncate">{c.sub}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
