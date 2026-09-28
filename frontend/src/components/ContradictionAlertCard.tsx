import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, HelpCircle, ArrowRight, RefreshCw, Sparkles, MessageSquare } from 'lucide-react';
import { ContradictionRecord } from '../types';
import { updateContradictionStatus, detectCustomerContradictions } from '../services/api';

interface Props {
  customerId: string;
  contradictions: ContradictionRecord[];
  onRefresh: () => void;
}

export const ContradictionAlertCard: React.FC<Props> = ({
  customerId,
  contradictions,
  onRefresh
}) => {
  const [scanning, setScanning] = useState<boolean>(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await updateContradictionStatus(id, newStatus, `Updated via DealMind review panel to ${newStatus}`);
      onRefresh();
    } catch (err) {
      console.error('Failed to update contradiction status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleRunScan = async () => {
    setScanning(true);
    try {
      await detectCustomerContradictions(customerId);
      onRefresh();
    } catch (err) {
      console.error('Failed to run contradiction scan:', err);
    } finally {
      setScanning(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONFIRMED_CHANGE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            CONFIRMED SHIFT
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            RESOLVED
          </span>
        );
      case 'NEEDS_CLARIFICATION':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            NEEDS CLARIFICATION
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
            UNREVIEWED CONTRADICTION
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Customer Contradiction Checker</h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Cross-Turn Verification
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Detects discrepancies between earlier statements and recent meetings (e.g. budget shifts, timeline cuts, scope changes).
          </p>
        </div>

        <button
          onClick={handleRunScan}
          disabled={scanning}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-slate-950 transition-all hover:scale-105 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
          {scanning ? 'Scanning Meetings...' : 'Scan For Contradictions'}
        </button>
      </div>

      {/* Contradictions List */}
      <div className="grid gap-4">
        {contradictions.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-sm flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <span>No unresolved contradictions detected across meeting notes.</span>
          </div>
        ) : (
          contradictions.map((contra) => {
            const isUpdating = updatingId === contra.id;

            return (
              <div
                key={contra.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{contra.topic}</span>
                    <span className="text-[11px] text-slate-400">
                      (Confidence: {Math.round(contra.confidence * 100)}%)
                    </span>
                  </div>
                  <div>{getStatusBadge(contra.status)}</div>
                </div>

                {/* Earlier vs Latest Statement Diff */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                    <div className="flex items-center justify-between text-slate-400 font-medium">
                      <span>Earlier Position:</span>
                      <span className="text-[11px] text-slate-500">{contra.earlier_meeting_date || 'Previous Call'}</span>
                    </div>
                    <p className="text-slate-200 italic">"{contra.earlier_statement}"</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                    <div className="flex items-center justify-between text-amber-300 font-medium">
                      <span className="flex items-center gap-1.5">
                        <ArrowRight className="w-3.5 h-3.5" /> Shifted To (Latest Meeting):
                      </span>
                      <span className="text-[11px] text-amber-400/80">{contra.latest_meeting_date || 'Recent Call'}</span>
                    </div>
                    <p className="text-white italic font-medium">"{contra.latest_statement}"</p>
                  </div>
                </div>

                {/* Recommended Clarification Action */}
                {contra.recommended_action && (
                  <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs space-y-1">
                    <div className="text-indigo-300 font-semibold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Recommended Clarification Talking Point:
                    </div>
                    <p className="text-slate-200">{contra.recommended_action}</p>
                  </div>
                )}

                {/* Status Update Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Confirm or update classification based on your latest customer conversations:
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleStatusChange(contra.id, 'CONFIRMED_CHANGE')}
                      disabled={isUpdating || contra.status === 'CONFIRMED_CHANGE'}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/30 transition-colors disabled:opacity-40"
                    >
                      Confirm Change
                    </button>
                    <button
                      onClick={() => handleStatusChange(contra.id, 'NEEDS_CLARIFICATION')}
                      disabled={isUpdating || contra.status === 'NEEDS_CLARIFICATION'}
                      className="px-2.5 py-1 rounded-lg bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/30 transition-colors disabled:opacity-40"
                    >
                      Needs Clarification
                    </button>
                    <button
                      onClick={() => handleStatusChange(contra.id, 'RESOLVED')}
                      disabled={isUpdating || contra.status === 'RESOLVED'}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 transition-colors disabled:opacity-40"
                    >
                      Mark Resolved
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
