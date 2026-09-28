import React, { useState } from 'react';
import { Users, User, Shield, Briefcase, ThumbsUp, AlertCircle, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { StakeholderNode, StakeholderGraphData } from '../types';

interface Props {
  stakeholders: StakeholderNode[];
  graphData?: StakeholderGraphData;
  customerName: string;
}

export const StakeholderGraphView: React.FC<Props> = ({
  stakeholders,
  customerName
}) => {
  const [selectedStakeholder, setSelectedStakeholder] = useState<StakeholderNode | null>(
    stakeholders.length > 0 ? stakeholders[0] : null
  );

  const getPowerColor = (power: string) => {
    switch (power) {
      case 'Decision Maker':
        return { text: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/40', fill: '#8b5cf6' };
      case 'Champion':
        return { text: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/40', fill: '#10b981' };
      case 'Procurement Stakeholder':
      case 'Procurement':
        return { text: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/40', fill: '#f59e0b' };
      case 'Technical Evaluator':
        return { text: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/40', fill: '#0ea5e9' };
      default:
        return { text: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/40', fill: '#6366f1' };
    }
  };

  // SVG dimensions & node placement
  const width = 500;
  const height = 360;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 130;

  // Calculate node positions in circle around center
  const nodeCount = Math.max(stakeholders.length, 1);
  const nodePositions = stakeholders.map((stk, idx) => {
    const angle = (idx * 2 * Math.PI) / nodeCount - Math.PI / 2;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    return { stk, x, y };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-sky-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-bold text-white">Stakeholder Influence & Memory Graph</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Interactive Topology
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Visualizes multi-stakeholder power dynamics, individual objections, priorities, and historical strategy responses.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Showing <span className="font-semibold text-white">{stakeholders.length}</span> mapped stakeholders
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Network Visualizer */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="text-[11px] text-slate-500 mb-2">
            Click any stakeholder node to inspect memory profile & strategy history:
          </div>

          <svg width={width} height={height} className="overflow-visible select-none max-w-full">
            {/* Edge lines */}
            {nodePositions.map(({ stk, x, y }) => {
              const isSelected = selectedStakeholder?.id === stk.id;
              const powerStyle = getPowerColor(stk.decision_power);

              return (
                <g key={`edge-${stk.id}`}>
                  <line
                    x1={centerX}
                    y1={centerY}
                    x2={x}
                    y2={y}
                    stroke={isSelected ? powerStyle.fill : '#334155'}
                    strokeWidth={isSelected ? 3 : 1.5}
                    strokeDasharray={isSelected ? 'none' : '4,4'}
                    className="transition-all duration-300"
                  />
                </g>
              );
            })}

            {/* Center Account Node */}
            <g transform={`translate(${centerX}, ${centerY})`}>
              <circle
                r="44"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2.5"
                className="filter drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]"
              />
              <text
                textAnchor="middle"
                dy="-6"
                fill="#f8fafc"
                fontSize="11"
                fontWeight="bold"
              >
                {customerName.length > 12 ? customerName.slice(0, 11) + '..' : customerName}
              </text>
              <text
                textAnchor="middle"
                dy="12"
                fill="#38bdf8"
                fontSize="9"
                fontWeight="500"
              >
                Account Hub
              </text>
            </g>

            {/* Stakeholder Nodes */}
            {nodePositions.map(({ stk, x, y }) => {
              const isSelected = selectedStakeholder?.id === stk.id;
              const powerStyle = getPowerColor(stk.decision_power);

              return (
                <g
                  key={`node-${stk.id}`}
                  transform={`translate(${x}, ${y})`}
                  className="cursor-pointer group"
                  onClick={() => setSelectedStakeholder(stk)}
                >
                  <circle
                    r={isSelected ? 32 : 28}
                    fill="#1e293b"
                    stroke={powerStyle.fill}
                    strokeWidth={isSelected ? 3 : 1.5}
                    className={`transition-all duration-200 ${
                      isSelected ? 'filter drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]' : ''
                    } group-hover:scale-110`}
                  />
                  <text
                    textAnchor="middle"
                    dy="-3"
                    fill="#f8fafc"
                    fontSize="10"
                    fontWeight="600"
                  >
                    {stk.name.split(' ')[0]}
                  </text>
                  <text
                    textAnchor="middle"
                    dy="11"
                    fill="#94a3b8"
                    fontSize="8"
                  >
                    {stk.decision_power.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Decision Maker
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Technical Evaluator
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Procurement
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Champion
            </span>
          </div>
        </div>

        {/* Selected Stakeholder Detail Panel */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
          {selectedStakeholder ? (
            <>
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-sky-400" />
                    <h4 className="text-base font-bold text-white">{selectedStakeholder.name}</h4>
                  </div>
                  <p className="text-xs text-slate-400">{selectedStakeholder.role}</p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    getPowerColor(selectedStakeholder.decision_power).bg
                  } ${getPowerColor(selectedStakeholder.decision_power).text} ${
                    getPowerColor(selectedStakeholder.decision_power).border
                  }`}
                >
                  {selectedStakeholder.decision_power}
                </span>
              </div>

              {/* Stakeholder Priorities */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                  Primary Priorities:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStakeholder.priorities.map((p, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>

              {/* Stakeholder Objections */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  Known Objections & Constraints:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStakeholder.objections.map((o, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30"
                    >
                      {o}
                    </span>
                  ))}
                </div>
              </div>

              {/* Buying Preferences */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-sky-400" />
                  Communication Preferences:
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-4 list-disc">
                  {selectedStakeholder.preferences.map((pref, i) => (
                    <li key={i}>{pref}</li>
                  ))}
                </ul>
              </div>

              {/* Strategies Presented to Stakeholder */}
              {selectedStakeholder.strategies_presented && selectedStakeholder.strategies_presented.length > 0 && (
                <div className="pt-2 border-t border-slate-800 space-y-2">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    Historical Strategies Tested:
                  </span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedStakeholder.strategies_presented.map((strat, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-slate-800/70 border border-slate-700 text-xs space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-white">{strat.strategy_type}</span>
                          {strat.observed_outcome === 'SUCCESSFUL' ? (
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> SUCCESS
                            </span>
                          ) : (
                            <span className="text-[10px] text-rose-400 font-bold flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> FAILED
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 text-[11px] italic">"{strat.customer_response}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-slate-500 py-12 text-xs">
              Select a stakeholder from the graph to inspect memory details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
