import React, { useState, useEffect } from 'react';
import {
  Code,
  HelpCircle,
  Sparkles,
  FileText,
  GitPullRequest,
  AlertTriangle,
  GitCommit,
  ExternalLink,
  Zap,
  ShieldCheck,
  Copy,
  Check,
  Folder,
  Download,
  Terminal,
  Layers
} from 'lucide-react';
import { CodeExplanation } from '../../types/index.js';

interface CodeExplainerProps {
  repositoryId: string;
}

interface ProjectFile {
  path: string;
  language: string;
  content: string;
}

export const CodeExplainer: React.FC<CodeExplainerProps> = ({ repositoryId }) => {
  const [modeTab, setModeTab] = useState<'explanation' | 'fullcode'>('explanation');
  const [selectedEntity, setSelectedEntity] = useState('MAX_RETRIES');
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Full Code state
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [activeFilePath, setActiveFilePath] = useState('src/config.py');
  const [copiedFile, setCopiedFile] = useState<string | null>(null);

  useEffect(() => {
    loadExplanation();
    loadProjectCode();
  }, [repositoryId, selectedEntity]);

  const loadExplanation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/explain-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryId, entityName: selectedEntity })
      });
      if (res.ok) {
        setExplanation(await res.json());
      }
    } catch (err) {
      console.error('Failed to load code explanation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectCode = async () => {
    try {
      const res = await fetch('/api/project-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repositoryId })
      });
      if (res.ok) {
        const data = await res.json();
        setProjectFiles(data.files);
        if (data.files.length > 0 && !activeFilePath) {
          setActiveFilePath(data.files[0].path);
        }
      }
    } catch (err) {
      console.error('Failed to load project code:', err);
    }
  };

  const handleCopyCode = (path: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedFile(path);
    setTimeout(() => setCopiedFile(null), 2000);
  };

  const activeFile = projectFiles.find((f) => f.path === activeFilePath) || projectFiles[0];

  const sampleEntities = [
    { name: 'MAX_RETRIES', label: 'MAX_RETRIES = 3 (src/config.py)', type: 'Configuration' },
    { name: 'process_payment', label: 'process_payment() (src/payment_service.py)', type: 'Function' }
  ];

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-cyan-400" />
            <h2 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
              Code Inspector &amp; Full Code Generator
            </h2>
          </div>

          {/* Mode Tabs */}
          <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setModeTab('explanation')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                modeTab === 'explanation' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Why &amp; How Explanation
            </button>
            <button
              onClick={() => setModeTab('fullcode')}
              className={`px-3 py-1 rounded-lg transition-colors flex items-center gap-1.5 ${
                modeTab === 'fullcode' ? 'bg-slate-800 text-cyan-300 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Complete Project Source Code</span>
            </button>
          </div>
        </div>

        {/* Target Entity Selector (for Explanation Mode) */}
        {modeTab === 'explanation' && (
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Target Entity:</span>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-cyan-300 py-1.5 px-3 rounded-lg focus:outline-none focus:border-cyan-500 font-semibold"
            >
              {sampleEntities.map((ent) => (
                <option key={ent.name} value={ent.name}>
                  {ent.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main View Switcher */}
      <div className="flex-1 overflow-y-auto p-6">
        {modeTab === 'explanation' ? (
          <div className="max-w-5xl mx-auto space-y-6">
            {isLoading || !explanation ? (
              <div className="flex items-center justify-center py-16 text-slate-400 text-xs gap-2">
                <Sparkles className="h-5 w-5 animate-spin text-cyan-400" />
                <span>Analyzing source code AST and tracing engineering decision history...</span>
              </div>
            ) : (
              <>
                {/* Overview Banner */}
                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-5">
                  <div className="flex items-center justify-between mb-2 font-mono text-xs">
                    <span className="text-cyan-400 font-bold uppercase">{explanation.entityType} ANALYSIS</span>
                    <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {explanation.confidence} Grounding Confidence
                    </span>
                  </div>
                  <h1 className="text-lg font-extrabold text-slate-100 font-mono mb-1">{explanation.entityName}</h1>
                  <p className="text-xs text-slate-400 font-mono">{explanation.filePath}</p>
                </div>

                {/* Two Column Grid: WHY vs HOW */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* PART 1: WHY IT WAS USED */}
                  <div className="rounded-2xl border border-amber-500/30 bg-slate-900/80 p-5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                      <HelpCircle className="h-4 w-4 text-amber-400" />
                      <h3 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
                        1. Why It Was Used (Engineering Motivation)
                      </h3>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-amber-400 uppercase font-semibold block mb-1">
                        Executive Motivation Summary
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        {explanation.whyItWasUsed.summary}
                      </p>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
                        Primary Driving Factors
                      </span>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {explanation.whyItWasUsed.drivingFactors.map((factor, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-amber-400 font-bold font-mono shrink-0">•</span>
                            <span>{factor}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Motivating Artifacts */}
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
                        Supporting Repository Artifacts
                      </span>
                      <div className="space-y-2">
                        {explanation.whyItWasUsed.motivatingArtifacts.map((art) => (
                          <div
                            key={art.id}
                            className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                          >
                            <div className="flex items-center gap-2">
                              {art.type === 'issue' ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                              ) : art.type === 'pr' ? (
                                <GitPullRequest className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                              ) : (
                                <GitCommit className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                              )}
                              <span className="font-semibold text-slate-200">{art.id}:</span>
                              <span className="text-slate-300 truncate max-w-[180px]">{art.title}</span>
                            </div>

                            {art.url && (
                              <a href={art.url} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Historical Context */}
                    <div className="pt-3 border-t border-slate-800">
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                        Historical Evolution &amp; Supersession
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-mono text-[11px]">
                        {explanation.whyItWasUsed.historicalContext}
                      </p>
                    </div>
                  </div>

                  {/* PART 2: HOW IT WORKS */}
                  <div className="rounded-2xl border border-cyan-500/30 bg-slate-900/80 p-5 space-y-4 shadow-xl">
                    <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                      <Zap className="h-4 w-4 text-cyan-400" />
                      <h3 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
                        2. How It Works (Technical Breakdown)
                      </h3>
                    </div>

                    <div>
                      <span className="text-[11px] font-mono text-cyan-400 uppercase font-semibold block mb-1">
                        Execution Flow Overview
                      </span>
                      <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                        {explanation.howItWorks.overview}
                      </p>
                    </div>

                    {/* Line by Line Breakdown */}
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 uppercase font-semibold block mb-2">
                        Key Code Lines &amp; AST Behavior
                      </span>
                      <div className="space-y-2 font-mono text-[11px]">
                        {explanation.howItWorks.keyLines.map((item, idx) => (
                          <div key={idx} className="bg-slate-950 rounded-xl p-2.5 border border-slate-800">
                            <div className="text-cyan-300 font-bold mb-0.5">{item.line}</div>
                            <div className="text-slate-400 text-[10px]">{item.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dependencies & Performance */}
                    <div className="pt-3 border-t border-slate-800 space-y-2 font-mono text-xs">
                      <div>
                        <span className="text-slate-400 text-[11px] block">Connected Dependencies:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {explanation.howItWorks.dependencies.map((dep, idx) => (
                            <span key={idx} className="bg-slate-950 border border-slate-800 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                              {dep}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-slate-400 text-[11px] block mt-2">Performance Considerations:</span>
                        <p className="text-slate-300 text-[11px] mt-0.5">{explanation.howItWorks.performanceNotes}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          /* FULL PROJECT CODE & FILE EXPORTER */
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div>
                <h3 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-400" />
                  Complete Production-Ready Source Code
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Complete runnable project files with imports, classes, functions, and configuration parameters.
                </p>
              </div>

              {activeFile && (
                <button
                  onClick={() => handleCopyCode(activeFile.path, activeFile.content)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors shadow-sm font-mono"
                >
                  {copiedFile === activeFile.path ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedFile === activeFile.path ? 'Copied File Code!' : `Copy ${activeFile.path}`}</span>
                </button>
              )}
            </div>

            {/* File Tabs & Code Editor Container */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
              {/* File Browser Sidebar */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 overflow-y-auto space-y-1 font-mono text-xs">
                <span className="text-[10px] text-slate-500 uppercase px-2 font-bold tracking-wider">Project File Tree</span>
                {projectFiles.map((file) => (
                  <button
                    key={file.path}
                    onClick={() => setActiveFilePath(file.path)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      activeFilePath === file.path
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className="truncate">{file.path}</span>
                    <FileText className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                  </button>
                ))}
              </div>

              {/* Code Viewer Panel */}
              <div className="md:col-span-3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
                {activeFile ? (
                  <>
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 font-mono text-xs">
                      <span className="text-cyan-300 font-bold">{activeFile.path}</span>
                      <span className="text-slate-500 text-[10px] uppercase">{activeFile.language}</span>
                    </div>

                    <pre className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed bg-slate-950 selection:bg-cyan-500/30">
                      <code>{activeFile.content}</code>
                    </pre>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">Select a file to inspect full code.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
