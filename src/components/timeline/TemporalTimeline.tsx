import React, { useState, useEffect } from 'react';
import { Clock, GitCommit, GitPullRequest, AlertTriangle, ShieldCheck, User, Calendar, RefreshCw } from 'lucide-react';
import { TimelineEvent } from '../../types/index.js';
import { fetchTimeline } from '../../api/client.js';

interface TemporalTimelineProps {
  repositoryId: string;
}

export const TemporalTimeline: React.FC<TemporalTimelineProps> = ({ repositoryId }) => {
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
  }, [repositoryId]);

  const loadTimeline = async () => {
    setIsLoading(true);
    try {
      const data = await fetchTimeline(repositoryId);
      setTimeline(data);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTimeline = timeline.filter((evt) => filterCategory === 'ALL' || evt.category === filterCategory);

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-cyan-400" />
          <h2 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
            Temporal Engineering Timeline ({timeline.length} Events)
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Event Categories</option>
            <option value="decision">Decisions</option>
            <option value="incident">Incidents</option>
            <option value="pr">Pull Requests</option>
            <option value="commit">Commits</option>
            <option value="supersession">Supersessions</option>
          </select>

          <button
            onClick={loadTimeline}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto relative pl-6 border-l border-slate-800 space-y-8">
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-10">
              <RefreshCw className="h-4 w-4 animate-spin text-cyan-400" />
              <span>Fetching timeline records...</span>
            </div>
          ) : filteredTimeline.length === 0 ? (
            <div className="text-slate-500 text-xs py-10">No events match the selected category filter.</div>
          ) : (
            filteredTimeline.map((evt) => (
              <div key={evt.id} className="relative group">
                {/* Timeline Node Dot */}
                <div
                  className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-slate-950 ${
                    evt.category === 'incident'
                      ? 'border-rose-500 text-rose-400'
                      : evt.category === 'decision'
                      ? 'border-amber-400 text-amber-400'
                      : evt.category === 'supersession'
                      ? 'border-purple-400 text-purple-400'
                      : 'border-cyan-400 text-cyan-400'
                  }`}
                />

                {/* Event Card */}
                <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 p-5 hover:border-slate-700 transition-colors shadow-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          evt.category === 'incident'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : evt.category === 'decision'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : evt.category === 'supersession'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {evt.category}
                      </span>

                      <span className="text-xs text-slate-400 font-mono font-medium">{evt.entityName}</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                      <Calendar className="h-3 w-3" />
                      <span>{evt.date}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-slate-100 mb-1.5 leading-snug">{evt.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">{evt.summary}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-800/60 font-mono">
                    <span className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      {evt.author}
                    </span>

                    {evt.status && (
                      <span className={`font-semibold ${evt.status === 'ACTIVE' ? 'text-emerald-400' : 'text-slate-500'}`}>
                        Status: {evt.status}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
