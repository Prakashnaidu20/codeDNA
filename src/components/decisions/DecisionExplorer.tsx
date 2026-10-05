import React, { useState, useEffect } from 'react';
import { BookOpen, ShieldCheck, ArrowRight, Layers, User, Calendar, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { EngineeringDecision } from '../../types/index.js';
import { fetchDecisions } from '../../api/client.js';

interface DecisionExplorerProps {
  repositoryId: string;
}

export const DecisionExplorer: React.FC<DecisionExplorerProps> = ({ repositoryId }) => {
  const [decisions, setDecisions] = useState<EngineeringDecision[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDecisions();
  }, [repositoryId]);

  const loadDecisions = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDecisions(repositoryId);
      setDecisions(data);
    } catch (err) {
      console.error('Failed to load decisions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDecisions = decisions.filter((d) => filterStatus === 'ALL' || d.status === filterStatus);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-cyan-400" />
          <h2 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
            Engineering Decision Ledger ({decisions.length} Decisions)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Decision Statuses</option>
            <option value="ACTIVE">Active Decisions</option>
            <option value="SUPERSEDED">Superseded Decisions</option>
            <option value="DEPRECATED">Deprecated Decisions</option>
          </select>

          <button
            onClick={loadDecisions}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Decision Ledger Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-10">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Fetching decision ledger records...</span>
            </div>
          ) : filteredDecisions.length === 0 ? (
            <div className="text-slate-500 text-xs py-10 text-center">No decisions found for this filter.</div>
          ) : (
            filteredDecisions.map((dec) => (
              <div
                key={dec.id}
                className={`rounded-2xl border p-6 transition-colors shadow-lg ${
                  dec.status === 'SUPERSEDED'
                    ? 'border-slate-800/80 bg-slate-900/40 opacity-80'
                    : 'border-cyan-500/30 bg-slate-900/80'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border ${
                        dec.status === 'ACTIVE'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {dec.status}
                    </span>

                    <span className="text-xs font-mono text-cyan-400">{dec.id}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5 text-slate-500" />
                      {dec.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      {dec.decisionDate}
                    </span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-100 mb-2 leading-snug">{dec.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">{dec.description}</p>

                {/* Motivation Box */}
                <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-xs mb-4">
                  <span className="font-semibold text-cyan-400 block mb-1 font-mono text-[11px]">MOTIVATION & RATIONALE</span>
                  <p className="text-slate-300 leading-relaxed">{dec.motivation}</p>
                </div>

                {/* Affected Entities & Supersession Details */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 border-t border-slate-800/80 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Affected Components:</span>
                    {dec.affectedEntities.map((e, idx) => (
                      <span key={idx} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded text-[11px]">
                        {e}
                      </span>
                    ))}
                  </div>

                  {dec.supersedes && (
                    <div className="flex items-center gap-1 text-amber-400 text-[11px]">
                      <span>Supersedes prior decision: {dec.supersedes}</span>
                    </div>
                  )}

                  {dec.supersededBy && (
                    <div className="flex items-center gap-1 text-rose-400 text-[11px]">
                      <span>Superseded by later decision: {dec.supersededBy}</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
