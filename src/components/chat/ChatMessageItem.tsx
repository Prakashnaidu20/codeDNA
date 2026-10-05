import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Dna,
  User,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  HelpCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { ChatMessage } from '../../types/index.js';
import { RefusalBanner } from './RefusalBanner.js';

interface ChatMessageItemProps {
  message: ChatMessage;
  onSelectPrompt?: (prompt: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message, onSelectPrompt }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mt-1">
          <Dna className="h-4 w-4" />
        </div>
      )}

      <div className={`max-w-3xl rounded-2xl p-4 text-xs sm:text-sm ${isUser ? 'bg-cyan-500 text-slate-950 font-medium' : 'bg-slate-900 border border-slate-800 text-slate-200'}`}>
        {/* Header Badges for Assistant Message */}
        {!isUser && (
          <div className="flex items-center justify-between gap-2 pb-2.5 mb-3 border-b border-slate-800/80 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                  message.mode === 'REPOSITORY-GROUNDED'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {message.mode}
              </span>

              <span
                className={`flex items-center gap-1 font-semibold text-[10px] ${
                  message.confidence === 'HIGH'
                    ? 'text-emerald-400'
                    : message.confidence === 'MEDIUM'
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {message.confidence === 'HIGH' ? (
                  <ShieldCheck className="h-3 w-3" />
                ) : (
                  <ShieldAlert className="h-3 w-3" />
                )}
                {message.confidence} Confidence
              </span>
            </div>

            <span className="text-slate-400">{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        )}

        {/* Message Content */}
        <div className="whitespace-pre-wrap leading-relaxed space-y-2">
          {message.content}
        </div>

        {/* Refusal / Missing Evidence Breakdown */}
        {!isUser && message.missingEvidence && (
          <RefusalBanner missingEvidence={message.missingEvidence} />
        )}

        {/* Follow-up Prompts for Assistant Messages */}
        {!isUser && onSelectPrompt && (
          <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap gap-1.5 font-mono text-[11px]">
            <span className="text-slate-400 text-[10px] w-full mb-1">Follow-up inquiries:</span>
            <button
              onClick={() => onSelectPrompt("Who approved this decision and when?")}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Who approved this?
            </button>
            <button
              onClick={() => onSelectPrompt("Was it always configured this way?")}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Was it always this way?
            </button>
            <button
              onClick={() => onSelectPrompt("Was this decision later superseded?")}
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              Was this superseded?
            </button>
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs mt-1">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};
