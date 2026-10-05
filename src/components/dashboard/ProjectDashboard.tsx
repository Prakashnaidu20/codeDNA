import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  ArrowUpDown,
  Star,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Plus,
  RefreshCw,
  ListTodo,
  Flag,
  ShieldCheck,
  Zap,
  RotateCw
} from 'lucide-react';
import { RepositorySummary, ProjectTask, ProjectMilestone } from '../../types/index.js';
import { syncRepository } from '../../api/client.js';

interface ProjectDashboardProps {
  repositories: RepositorySummary[];
  onSelectProject: (repo: RepositorySummary) => void;
  onOpenIngestModal: () => void;
  onRefreshRepos?: () => Promise<void>;
}

export const ProjectDashboard: React.FC<ProjectDashboardProps> = ({
  repositories,
  onSelectProject,
  onOpenIngestModal,
  onRefreshRepos
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [languageFilter, setLanguageFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'stars' | 'decisions' | 'synced'>('synced');

  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskRepoId, setNewTaskRepoId] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Local state tracking which repos are actively syncing in real-time
  const [syncingRepoIds, setSyncingRepoIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTasksAndMilestones();
  }, []);

  const loadTasksAndMilestones = async () => {
    try {
      const [resT, resM] = await Promise.all([fetch('/api/tasks'), fetch('/api/milestones')]);
      if (resT.ok) setTasks(await resT.json());
      if (resM.ok) setMilestones(await resM.json());
    } catch (err) {
      console.error('Failed to load tasks and milestones:', err);
    }
  };

  const handleCardSync = async (e: React.MouseEvent, repoId: string) => {
    e.stopPropagation();
    if (syncingRepoIds.has(repoId)) return;

    setSyncingRepoIds((prev) => new Set(prev).add(repoId));

    try {
      await syncRepository(repoId);
      if (onRefreshRepos) {
        await onRefreshRepos();
      }
    } catch (err) {
      console.error('Failed to sync repo:', repoId, err);
    } finally {
      setSyncingRepoIds((prev) => {
        const next = new Set(prev);
        next.delete(repoId);
        return next;
      });
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskRepoId) return;

    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repositoryId: newTaskRepoId,
          title: newTaskTitle.trim(),
          priority: 'P1',
          assignee: 'Current Developer'
        })
      });

      if (res.ok) {
        const created = await res.json();
        setTasks((prev) => [created, ...prev]);
        setNewTaskTitle('');
        setIsAddingTask(false);
      }
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  // Helper for relative time formatting
  const formatRelativeTime = (isoString?: string) => {
    if (!isoString) return 'Never';
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Filter & Sort Logic
  const filteredRepos = repositories
    .filter((repo) => {
      const matchesSearch =
        repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchTerm.toLowerCase());

      const isCardSyncing = syncingRepoIds.has(repo.id);
      const effectiveStatus = isCardSyncing
        ? 'syncing'
        : repo.status;

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'successful' && effectiveStatus === 'indexed') ||
        (statusFilter === 'syncing' && (effectiveStatus === 'syncing' || effectiveStatus === 'indexing')) ||
        (statusFilter === 'error' && effectiveStatus === 'error');

      const matchesLanguage =
        languageFilter === 'ALL' || repo.language.toLowerCase().includes(languageFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesLanguage;
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'stars') return b.stars - a.stars;
      if (sortBy === 'decisions') return b.stats.totalDecisions - a.stats.totalDecisions;
      if (sortBy === 'synced') return new Date(b.lastSyncedAt).getTime() - new Date(a.lastSyncedAt).getTime();
      return 0;
    });

  // Calculate Sync Summary Numbers
  const totalRepos = repositories.length;
  const successfulSyncs = repositories.filter(
    (r) => !syncingRepoIds.has(r.id) && r.status === 'indexed'
  ).length;
  const activeSyncs = repositories.filter(
    (r) => syncingRepoIds.has(r.id) || r.status === 'syncing' || r.status === 'indexing'
  ).length;
  const failedSyncs = repositories.filter((r) => r.status === 'error').length;

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <FolderKanban className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-['Cabinet_Grotesk'] font-extrabold text-base text-slate-100">
              Project Engineering Dashboard
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Overview of all repositories, real-time GitHub sync badges, key milestones, and tasks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddingTask(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-semibold text-xs rounded-xl transition-colors"
          >
            <Plus className="h-3.5 w-3.5 text-cyan-400" />
            <span>New Task</span>
          </button>

          <button
            onClick={onOpenIngestModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Project</span>
          </button>
        </div>
      </div>

      {/* Main Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Top Overview Cards with Real-Time Sync Telemetry */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
              <span className="text-[11px] text-slate-400 uppercase">Total Repositories</span>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-2xl font-bold text-slate-100">{totalRepos}</div>
                <GitBranch className="h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 flex flex-col justify-between">
              <span className="text-[11px] text-emerald-400 uppercase">Sync Successful</span>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-2xl font-bold text-emerald-400">{successfulSyncs}</div>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              </div>
            </div>

            <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 flex flex-col justify-between">
              <span className="text-[11px] text-cyan-400 uppercase">Sync In-Progress</span>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-2xl font-bold text-cyan-400">{activeSyncs}</div>
                <RefreshCw className={`h-4 w-4 text-cyan-400 ${activeSyncs > 0 ? 'animate-spin' : ''}`} />
              </div>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/5 p-4 flex flex-col justify-between">
              <span className="text-[11px] text-rose-400 uppercase">Sync Failures</span>
              <div className="flex items-baseline justify-between mt-2">
                <div className="text-2xl font-bold text-rose-400">{failedSyncs}</div>
                <AlertTriangle className="h-4 w-4 text-rose-400" />
              </div>
            </div>
          </div>

          {/* Controls: Search, Filters, Sorting */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/60 border border-slate-800 rounded-2xl">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Filter projects by name or description..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
              </div>

              {/* Real-time Sync Status Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500">Sync Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Sync States</option>
                  <option value="successful">Sync Successful</option>
                  <option value="syncing">Syncing (In Progress)</option>
                  <option value="error">Sync Failed</option>
                </select>
              </div>

              {/* Language Filter */}
              <div className="flex items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500">Language:</span>
                <select
                  value={languageFilter}
                  onChange={(e) => setLanguageFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
                >
                  <option value="ALL">All Languages</option>
                  <option value="Python">Python</option>
                  <option value="JavaScript">JavaScript / TypeScript</option>
                </select>
              </div>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 text-xs font-mono">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-950 border border-slate-800 text-slate-200 py-1.5 px-2.5 rounded-lg focus:outline-none focus:border-cyan-500"
              >
                <option value="synced">Last Synced Time</option>
                <option value="stars">Stars Count</option>
                <option value="decisions">Decisions Count</option>
                <option value="name">Name</option>
              </select>
            </div>
          </div>

          {/* Project Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRepos.map((repo) => {
              const repoTasks = tasks.filter((t) => t.repositoryId === repo.id);
              const repoMilestones = milestones.filter((m) => m.repositoryId === repo.id);
              const isCardSyncing = syncingRepoIds.has(repo.id);

              return (
                <div
                  key={repo.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 hover:border-slate-700 transition-colors shadow-lg flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Real-time Sync Status Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-800/60">
                      {/* Real-time GitHub Sync Badge */}
                      <div className="flex items-center gap-2">
                        {isCardSyncing || repo.status === 'syncing' || repo.status === 'indexing' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 animate-pulse">
                            <RotateCw className="h-3 w-3 animate-spin text-cyan-400" />
                            <span>SYNCING GITHUB...</span>
                          </div>
                        ) : repo.status === 'error' ? (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                            <XCircle className="h-3 w-3 text-rose-400" />
                            <span>SYNC FAILED</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                            <span>SYNC SUCCESSFUL</span>
                          </div>
                        )}

                        <span className="text-xs text-slate-400 font-mono">{repo.language}</span>
                      </div>

                      {/* Card Sync Action & Last Synced Timestamp */}
                      <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                        <span className="flex items-center gap-1" title={repo.lastSyncedAt}>
                          <Clock className="h-3 w-3 text-slate-500" />
                          <span>{formatRelativeTime(repo.lastSyncedAt)}</span>
                        </span>

                        <button
                          onClick={(e) => handleCardSync(e, repo.id)}
                          disabled={isCardSyncing}
                          title="Trigger immediate GitHub sync"
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-cyan-300 transition-colors disabled:opacity-50 text-[10px]"
                        >
                          <RotateCw className={`h-3 w-3 ${isCardSyncing ? 'animate-spin text-cyan-400' : ''}`} />
                          <span>{isCardSyncing ? 'Syncing' : 'Sync'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Repository Name & Star Count */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h2
                        onClick={() => onSelectProject(repo)}
                        className="text-base font-bold text-slate-100 hover:text-cyan-300 transition-colors cursor-pointer leading-snug"
                      >
                        {repo.owner} / {repo.name}
                      </h2>

                      <div className="flex items-center gap-1 text-xs text-amber-400 font-mono shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{repo.stars.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed mb-4">{repo.description}</p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800 font-mono text-[11px] mb-4">
                      <div>
                        <span className="text-slate-500 block">Files</span>
                        <span className="text-slate-200 font-semibold">{repo.stats.totalFiles}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Commits</span>
                        <span className="text-slate-200 font-semibold">{repo.stats.totalCommits}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Decisions</span>
                        <span className="text-cyan-400 font-semibold">{repo.stats.totalDecisions}</span>
                      </div>
                    </div>

                    {/* Milestones Progress */}
                    {repoMilestones.length > 0 && (
                      <div className="mb-4 space-y-2">
                        <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1">
                          <Flag className="h-3 w-3 text-cyan-400" /> Key Milestone
                        </span>
                        {repoMilestones.map((m) => (
                          <div key={m.id} className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 text-xs">
                            <div className="flex justify-between text-[11px] font-mono text-slate-300 mb-1">
                              <span className="font-semibold">{m.title}</span>
                              <span className="text-cyan-400 font-bold">{m.progressPercentage}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-cyan-400 rounded-full"
                                style={{ width: `${m.progressPercentage}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Tasks */}
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold flex items-center gap-1 mb-2">
                        <ListTodo className="h-3 w-3 text-purple-400" /> Associated Tasks ({repoTasks.length})
                      </span>
                      <div className="space-y-2">
                        {repoTasks.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs font-mono"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  t.priority === 'P0'
                                    ? 'bg-rose-500/20 text-rose-300'
                                    : t.priority === 'P1'
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {t.priority}
                              </span>
                              <span className="text-slate-200 truncate max-w-[200px]">{t.title}</span>
                            </div>

                            <span className="text-[10px] text-slate-400">{t.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-slate-800/80 flex justify-end">
                    <button
                      onClick={() => onSelectProject(repo)}
                      className="px-3.5 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold text-xs rounded-xl transition-colors"
                    >
                      Open Decision Graph & Workspace →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Task Dialog */}
      {isAddingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
            <h3 className="font-['Cabinet_Grotesk'] font-bold text-base text-slate-100">Add Associated Task</h3>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Repository</label>
                <select
                  required
                  value={newTaskRepoId}
                  onChange={(e) => setNewTaskRepoId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs py-2.5 px-3 rounded-xl focus:outline-none focus:border-cyan-500"
                >
                  <option value="">Select Project Repository</option>
                  {repositories.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.owner}/{r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement Circuit Breaker pattern"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl py-2.5 px-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
