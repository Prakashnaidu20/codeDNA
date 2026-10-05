import React, { useState } from 'react';
import { Github, X, PlusCircle, RefreshCw } from 'lucide-react';
import { ingestRepository } from '../../api/client.js';
import { RepositorySummary } from '../../types/index.js';

interface RepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepositoryIngested: (repo: RepositorySummary) => void;
}

export const RepoModal: React.FC<RepoModalProps> = ({ isOpen, onClose, onRepositoryIngested }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const repo = await ingestRepository(url.trim());
      onRepositoryIngested(repo);
      setUrl('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to ingest repository');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-cyan-400" />
            <h3 className="font-['Cabinet_Grotesk'] font-bold text-base text-slate-100">
              Ingest GitHub Repository
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Public GitHub Repository URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/facebook/react"
              className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
            />
          </div>

          {error && <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">{error}</div>}

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-colors"
            >
              {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <PlusCircle className="h-3.5 w-3.5" />}
              <span>{isLoading ? 'Indexing Repo...' : 'Analyze & Index'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
