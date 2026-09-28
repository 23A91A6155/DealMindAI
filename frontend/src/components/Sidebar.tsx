import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  Building2,
  MessageSquare,
  Sparkles,
  GitBranch,
  TrendingUp,
  Award,
  PlayCircle,
  Settings,
  PlusCircle
} from 'lucide-react';

interface Props {
  activeTab: string;
  onNavigate: (tab: string) => void;
  onOpenAddInteraction: () => void;
}

export const Sidebar: React.FC<Props> = ({
  activeTab,
  onNavigate,
  onOpenAddInteraction
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'deals', label: 'Active Deals', icon: Briefcase },
    { id: 'customers', label: 'Customers', icon: Building2 },
    { id: 'interactions', label: 'Interactions', icon: MessageSquare },
    { id: 'briefing', label: 'AI Briefing', icon: Sparkles, badge: 'Hindsight' },
    { id: 'timeline', label: 'Memory Timeline', icon: GitBranch, highlight: true },
    { id: 'insights', label: 'AI Insights', icon: TrendingUp },
    { id: 'evaluation', label: 'Evaluation Suite', icon: Award, badge: 'Benchmark' },
    { id: 'demo', label: 'Learning Demo', icon: PlayCircle, badge: 'Judge Demo' },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];


  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Quick Action Button */}
      <div className="p-4 border-b border-slate-800/80">
        <button
          onClick={onOpenAddInteraction}
          className="w-full py-2.5 px-4 bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-brand-600/20 transition-all hover:scale-[1.01]"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Save & Learn Interaction</span>
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Sales Intelligence
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-brand-500/15 text-brand-300 font-semibold border border-brand-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                  item.badge === 'Judge Demo'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-brand-500/20 text-brand-300'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Memory Tagline */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
          <p className="font-semibold text-white mb-0.5">DealMind AI</p>
          <p className="text-[10px] leading-relaxed italic text-slate-400">
            "Don't just close deals. Remember how."
          </p>
        </div>
      </div>
    </aside>
  );
};
