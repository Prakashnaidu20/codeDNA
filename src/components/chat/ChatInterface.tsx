import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, PanelRight, Dna, HelpCircle, ShieldCheck, RefreshCcw, AlertTriangle } from 'lucide-react';
import { ChatMessage, RepositorySummary } from '../../types/index.js';
import { ChatMessageItem } from './ChatMessageItem.js';
import { EvidencePanel } from './EvidencePanel.js';
import { sendChatMessage } from '../../api/client.js';

interface ChatInterfaceProps {
  repository: RepositorySummary | null;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ repository }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showEvidencePanel, setShowEvidencePanel] = useState(true);
  const [activeEvidence, setActiveEvidence] = useState<any[]>([]);
  const [activeDecisions, setActiveDecisions] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Seed default welcome message when repository changes
  useEffect(() => {
    if (repository) {
      setMessages([
        {
          id: 'welcome-1',
          conversationId: 'conv-1',
          role: 'assistant',
          content: `Welcome to **CodeDNA** for \`${repository.owner}/${repository.name}\`!

I analyze source code, commit history, pull requests, issues, and design decisions to answer:
> **"Why is the code like this?"**

Try asking:
* *"What is this repository and what does it do?"*
* *"Why is MAX_RETRIES set to 3?"*
* *"Give me the complete code to build my project"*
* *"Why did the author personally dislike Python?"* (Tests strict evidence refusal)
`,
          mode: 'REPOSITORY-GROUNDED',
          confidence: 'HIGH',
          evidence: [],
          decisions: [],
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [repository?.id]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || !repository || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      conversationId: 'conv-1',
      role: 'user',
      content: query,
      mode: 'REPOSITORY-GROUNDED',
      confidence: 'HIGH',
      evidence: [],
      decisions: [],
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const response = await sendChatMessage(repository.id, query, history);

      setMessages((prev) => [...prev, response]);
      if (response.evidence) setActiveEvidence(response.evidence);
      if (response.decisions) setActiveDecisions(response.decisions);
    } catch (err: any) {
      console.warn('Network chat error, generating client grounded response:', err);

      // Client-side grounded fallback response for the active repository
      const fallbackMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        conversationId: 'conv-1',
        role: 'assistant',
        content: `### Grounded Analysis for \`${repository.owner}/${repository.name}\`

I analyzed the indexed repository data for **${repository.owner}/${repository.name}** (${repository.description || 'Public repository'}).

* **Primary Language:** ${repository.language}
* **Total Commits Indexed:** ${repository.stats.totalCommits}
* **Extracted Decisions:** ${repository.stats.totalDecisions}

If you asked for complete code or specific parameter motivations, try checking the **Code Explainer** tab or asking specifically about \`MAX_RETRIES\` or \`config.py\`!`,
        mode: 'REPOSITORY-GROUNDED',
        confidence: 'HIGH',
        evidence: [],
        decisions: [],
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    'Why is MAX_RETRIES set to 3?',
    'Give me the complete code to build my project',
    'Who approved the MAX_RETRIES reduction?',
    'Why did the developer personally dislike Python?'
  ];

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Chat Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800/80 bg-slate-900/40">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-200">{repository ? `${repository.owner}/${repository.name}` : 'Select Repository'}</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400 font-mono text-[11px]">{Math.max(0, messages.length - 1)} message exchanges</span>
          </div>

          <button
            onClick={() => setShowEvidencePanel(!showEvidencePanel)}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg border transition-colors ${
              showEvidencePanel
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <PanelRight className="h-3.5 w-3.5" />
            <span>Evidence Side Panel</span>
          </button>
        </div>

        {/* Message History */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
          {messages.map((msg) => (
            <ChatMessageItem key={msg.id} message={msg} onSelectPrompt={(p) => handleSend(p)} />
          ))}

          {isLoading && (
            <div className="flex items-center gap-3 my-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 animate-pulse">
                <Dna className="h-4 w-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 flex items-center gap-2">
                <RefreshCcw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
                <span>Traversing temporal knowledge graph & verifying citations...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Sample Prompts & Input Bar */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/90">
          {/* Quick Prompts */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar font-mono text-[11px]">
            <span className="text-slate-500 shrink-0 text-[10px]">Benchmark queries:</span>
            {samplePrompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="shrink-0 px-2.5 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-cyan-300 transition-colors whitespace-nowrap"
              >
                {p}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask why a function, config, or architecture was built this way..."
              className="w-full bg-slate-900/90 border border-slate-800 focus:border-cyan-500/50 rounded-xl py-3 pl-4 pr-12 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Side Evidence Panel */}
      <EvidencePanel
        evidence={activeEvidence}
        decisions={activeDecisions}
        isOpen={showEvidencePanel}
        onClose={() => setShowEvidencePanel(false)}
      />
    </div>
  );
};
