import React, { useState, useEffect, useRef } from 'react';
import { Network, Filter, Search, Info, ZoomIn, ZoomOut, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { GraphNode, GraphEdge, EntityType } from '../../types/index.js';
import { fetchGraph } from '../../api/client.js';

interface GraphVisualizerProps {
  repositoryId: string;
}

export const GraphVisualizer: React.FC<GraphVisualizerProps> = ({ repositoryId }) => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    loadGraphData();
  }, [repositoryId]);

  const loadGraphData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGraph(repositoryId);
      setNodes(data.nodes);
      setEdges(data.edges);

      // Compute circular/force layout coordinates
      const positions = new Map<string, { x: number; y: number }>();
      const width = 800;
      const height = 550;
      const radius = 220;

      data.nodes.forEach((node, idx) => {
        const angle = (idx / data.nodes.length) * 2 * Math.PI;
        // Offset nodes by type
        let r = radius;
        if (node.type === 'Decision') r = 100;
        else if (node.type === 'Incident' || node.type === 'PullRequest') r = 160;

        positions.set(node.id, {
          x: width / 2 + r * Math.cos(angle) + (Math.random() - 0.5) * 40,
          y: height / 2 + r * Math.sin(angle) + (Math.random() - 0.5) * 40
        });
      });

      setNodePositions(positions);
    } catch (err) {
      console.error('Failed to load graph:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getNodeColor = (type: EntityType) => {
    switch (type) {
      case 'Decision':
        return '#f59e0b'; // Amber
      case 'Incident':
        return '#ef4444'; // Red
      case 'PullRequest':
        return '#a855f7'; // Purple
      case 'Commit':
        return '#06b6d4'; // Cyan
      case 'Configuration':
        return '#10b981'; // Emerald
      case 'File':
        return '#3b82f6'; // Blue
      case 'Developer':
        return '#ec4899'; // Pink
      default:
        return '#94a3b8'; // Slate
    }
  };

  const filteredNodes = nodes.filter((n) => {
    const matchesSearch =
      n.label.toLowerCase().includes(searchTerm.toLowerCase()) || n.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'ALL' || n.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      {/* Graph Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-cyan-400" />
            <h2 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
              Temporal Decision Graph ({nodes.length} Nodes, {edges.length} Edges)
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search nodes (e.g. MAX_RETRIES, a81d)..."
                className="bg-slate-900 border border-slate-800 focus:border-cyan-500 rounded-lg py-1.5 pl-8 pr-3 text-xs text-slate-200 placeholder-slate-500 w-52 focus:outline-none"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            </div>

            {/* Entity Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-slate-200 text-xs font-medium py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Entity Types</option>
              <option value="Decision">Decisions</option>
              <option value="Incident">Incidents</option>
              <option value="PullRequest">Pull Requests</option>
              <option value="Commit">Commits</option>
              <option value="Configuration">Configurations</option>
              <option value="File">Files</option>
              <option value="Developer">Developers</option>
            </select>

            <button
              onClick={loadGraphData}
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Visual Graph View */}
        <div className="flex-1 relative bg-slate-950 p-6 flex items-center justify-center overflow-auto">
          {isLoading ? (
            <div className="flex flex-col items-center gap-3 text-slate-400 text-xs">
              <RefreshCw className="h-6 w-6 animate-spin text-cyan-400" />
              <span>Building Knowledge Graph visualization...</span>
            </div>
          ) : (
            <div className="relative w-[800px] h-[550px] bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
              {/* SVG Connector Lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {edges.map((edge) => {
                  const sourcePos = nodePositions.get(edge.sourceId);
                  const targetPos = nodePositions.get(edge.targetId);
                  if (!sourcePos || !targetPos) return null;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={sourcePos.x}
                        y1={sourcePos.y}
                        x2={targetPos.x}
                        y2={targetPos.y}
                        stroke={edge.type === 'SUPERSEDED_BY' ? '#ef4444' : edge.type === 'MOTIVATED_BY' ? '#f59e0b' : '#334155'}
                        strokeWidth={edge.type === 'MOTIVATED_BY' ? 2 : 1.5}
                        strokeDasharray={edge.type === 'SUPERSEDED_BY' ? '4,4' : undefined}
                        opacity={0.7}
                      />
                      <text
                        x={(sourcePos.x + targetPos.x) / 2}
                        y={(sourcePos.y + targetPos.y) / 2 - 4}
                        fill="#64748b"
                        fontSize="9"
                        fontFamily="monospace"
                        textAnchor="middle"
                      >
                        {edge.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Render Node Cards */}
              {filteredNodes.map((node) => {
                const pos = nodePositions.get(node.id) || { x: 400, y: 275 };
                const isSelected = selectedNode?.id === node.id;
                const color = getNodeColor(node.type);

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    style={{ left: `${pos.x - 60}px`, top: `${pos.y - 20}px` }}
                    className={`absolute flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono transition-all transform hover:scale-105 shadow-md ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 border-cyan-400 bg-slate-800 z-30'
                        : 'border-slate-800 bg-slate-900/90 hover:border-slate-700 z-10'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: color }}
                    />
                    <span className="truncate max-w-[100px] text-slate-200 font-semibold">{node.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Selected Node Details Drawer */}
      {selectedNode && (
        <aside className="w-80 shrink-0 border-l border-slate-800 bg-slate-950/95 p-4 flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-cyan-400" />
              <h3 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">Node Properties</h3>
            </div>
            <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-white text-xs">
              Close
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider">{selectedNode.type} Node</span>
              <h4 className="font-bold text-slate-100 text-sm mt-0.5">{selectedNode.label}</h4>
              <p className="text-slate-400 font-mono text-[11px] mt-1">{selectedNode.name}</p>
            </div>

            {selectedNode.description && (
              <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 text-slate-300 leading-relaxed">
                {selectedNode.description}
              </div>
            )}

            {selectedNode.url && (
              <a
                href={selectedNode.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition-colors"
              >
                <span>View Repository Artifact</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}

            {/* Properties */}
            {selectedNode.properties && (
              <div className="space-y-2 pt-2 border-t border-slate-800 font-mono">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">Properties</span>
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800 space-y-1.5 text-[11px]">
                  {Object.entries(selectedNode.properties).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400">{k}:</span>
                      <span className="text-slate-200 font-medium">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
