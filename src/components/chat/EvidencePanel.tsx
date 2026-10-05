import React from 'react';
import {
  FileText,
  GitCommit,
  GitPullRequest,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  User,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { EvidenceItem, EngineeringDecision } from '../../types/index.js';

interface EvidencePanelProps {
  evidence: EvidenceItem[];
  decisions: EngineeringDecision[];
  isOpen: boolean;
  onClose: () => void;
}

export const EvidencePanel: React.FC<EvidencePanelProps> = ({ evidence, decisions, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-950/95 p-4 flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-cyan-400" />
          <h3 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
            Repository Evidence ({evidence.length})
          </h3>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xs">
          Close
        </button>
      </div>

      {/* Decision Summary Cards */}
      {decisions.length > 0 && (
        <div className="mb-5 space-y-3">
          <h4 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
            Grounding Decision Ledger
          </h4>
          {decisions.map((dec) => (
            <div
              key={dec.id}
              className={`rounded-xl border p-3 text-xs transition-all ${
                dec.status === 'SUPERSEDED'
                  ? 'border-slate-800 bg-slate-900/40 text-slate-400'
                  : 'border-cyan-500/30 bg-cyan-500/5 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    dec.status === 'ACTIVE'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {dec.status}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{dec.decisionDate}</span>
              </div>

              <h5 className="font-semibold text-slate-100 mb-1 leading-snug">{dec.title}</h5>
              <p className="text-slate-300 text-[11px] leading-relaxed mb-2">{dec.description}</p>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-800/60 font-mono">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-slate-400" />
                  {dec.author}
                </span>
                <span className="text-cyan-400 font-semibold">{dec.confidence} Confidence</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Evidence Items List */}
      <div className="space-y-3">
        <h4 className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase font-mono">
          Artifact Citations & Diffs
        </h4>

        {evidence.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-slate-500 text-xs">
            No specific repository evidence attached for this query.
          </div>
        ) : (
          evidence.map((item) => (
            <div key={item.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-3 text-xs hover:border-slate-700 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-cyan-400 font-medium text-[11px]">
                  {item.type === 'commit' && <GitCommit className="h-3.5 w-3.5" />}
                  {item.type === 'pull_request' && <GitPullRequest className="h-3.5 w-3.5" />}
                  {item.type === 'incident' && <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />}
                  {(item.type === 'file' || item.type === 'function' || item.type === 'config') && <FileText className="h-3.5 w-3.5" />}
                  <span className="capitalize">{item.type.replace('_', ' ')}</span>
                </div>

                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>

              <h5 className="font-medium text-slate-200 mb-1 font-mono text-[11px] leading-snug">{item.title}</h5>

              {item.snippet && <p className="text-slate-400 text-[11px] leading-relaxed mb-2 line-clamp-3">{item.snippet}</p>}

              <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800/40">
                <span>{item.author || 'Repo Contributor'}</span>
                <span>{item.date || 'Indexed'}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};
