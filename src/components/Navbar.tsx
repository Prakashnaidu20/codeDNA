import React from 'react';
import {
  Dna,
  GitBranch,
  RefreshCw,
  PlusCircle,
  MessageSquare,
  Network,
  Clock,
  BookOpen,
  CheckCircle2,
  FolderKanban,
  Code,
  User,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { RepositorySummary } from '../types/index.js';
import { useAuth } from '../context/AuthContext.js';

interface NavbarProps {
  activeTab: 'dashboard' | 'explainer' | 'chat' | 'graph' | 'timeline' | 'decisions' | 'eval';
  setActiveTab: (tab: 'dashboard' | 'explainer' | 'chat' | 'graph' | 'timeline' | 'decisions' | 'eval') => void;
  repositories: RepositorySummary[];
  selectedRepo: RepositorySummary | null;
  onSelectRepo: (repo: RepositorySummary) => void;
  onSyncRepo: () => void;
  onOpenIngestModal: () => void;
  onOpenAuthModal: () => void;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  repositories,
  selectedRepo,
  onSelectRepo,
  onSyncRepo,
  onOpenIngestModal,
  onOpenAuthModal,
  isSyncing
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Brand Title (Single element wordmark) */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Dna className="h-5 w-5" />
          </div>
          <div>
            <span className="font-['Cabinet_Grotesk'] text-xl font-extrabold tracking-tight text-white">
              Code<span className="text-cyan-400">DNA</span>
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-slate-400 tracking-wide font-mono">
              <span>Temporal Decision Graph</span>
              <span aria-hidden="true">·</span>
              <span>Grounded RAG</span>
            </div>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5" />
            Dashboard
          </button>

          <button
            onClick={() => setActiveTab('explainer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'explainer'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Code Explainer
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'chat'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Chat &amp; Evidence
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'graph'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Network className="h-3.5 w-3.5" />
            Graph
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'timeline'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Timeline
          </button>

          <button
            onClick={() => setActiveTab('decisions')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'decisions'
                ? 'bg-slate-800 text-cyan-300 shadow-sm border border-slate-700/60'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            Ledger
          </button>

          <button
            onClick={() => setActiveTab('eval')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              activeTab === 'eval'
                ? 'bg-slate-800 text-emerald-300 shadow-sm border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Eval Suite
          </button>
        </nav>

        {/* Zone 3: Repository Selector & User Auth */}
        <div className="flex items-center gap-2">
          <div className="relative hidden sm:block">
            <select
              value={selectedRepo?.id || ''}
              onChange={(e) => {
                const found = repositories.find((r) => r.id === e.target.value);
                if (found) onSelectRepo(found);
              }}
              className="appearance-none bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium py-1.5 pl-8 pr-7 rounded-lg focus:outline-none focus:ring-1 focus:ring-cyan-500 truncate max-w-[160px]"
            >
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.owner}/{repo.name}
                </option>
              ))}
            </select>
            <GitBranch className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          <button
            onClick={onSyncRepo}
            disabled={isSyncing}
            title="Sync repository with GitHub"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* User Auth Profile Badge or Login Button */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800 font-mono text-xs">
              <div className="flex items-center gap-1.5 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-semibold text-slate-200 truncate max-w-[100px]">{user.name}</span>
              </div>
              <button
                onClick={logout}
                title="Log Out"
                className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors rounded-lg bg-slate-900 border border-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 font-semibold text-xs rounded-lg transition-colors whitespace-nowrap"
            >
              <User className="h-3.5 w-3.5" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
