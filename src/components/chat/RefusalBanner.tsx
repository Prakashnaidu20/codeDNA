import React from 'react';
import { ShieldAlert, AlertCircle, FileSearch, CheckCircle2, HelpCircle } from 'lucide-react';

interface RefusalBannerProps {
  missingEvidence?: {
    required: string[];
    found: string[];
    missing: string[];
    explanation: string;
  };
}

export const RefusalBanner: React.FC<RefusalBannerProps> = ({ missingEvidence }) => {
  if (!missingEvidence) return null;

  return (
    <div className="my-4 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 text-xs">
      <div className="flex items-center gap-2 font-bold text-amber-400 mb-2">
        <ShieldAlert className="h-4 w-4" />
        <span>Strict Grounding Shield — Insufficient Repository Evidence</span>
      </div>

      <p className="text-slate-300 leading-relaxed mb-3">
        {missingEvidence.explanation ||
          'CodeDNA identified related source files, but found no explicit commit message, pull request rationale, or issue record in the repository supporting an explanation.'}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-500/20">
        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-emerald-400 mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Found Evidence In Graph</span>
          </div>
          <ul className="list-disc list-inside text-slate-400 space-y-0.5 font-mono text-[11px]">
            {missingEvidence.found?.map((item, idx) => (
              <li key={idx}>{item}</li>
            )) || <li>Source code files</li>}
          </ul>
        </div>

        <div className="bg-slate-900/80 rounded-lg p-2.5 border border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-amber-400 mb-1">
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Missing Supporting Proof</span>
          </div>
          <ul className="list-disc list-inside text-slate-400 space-y-0.5 font-mono text-[11px]">
            {missingEvidence.missing?.map((item, idx) => (
              <li key={idx}>{item}</li>
            )) || <li>Explicit PR or issue discussion explaining rationale</li>}
          </ul>
        </div>
      </div>
    </div>
  );
};
