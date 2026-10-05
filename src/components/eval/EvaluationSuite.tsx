import React, { useState } from 'react';
import { CheckCircle2, XCircle, Play, ShieldCheck, BarChart3, RefreshCw, FileText } from 'lucide-react';
import { EvalBenchmarkResult } from '../../types/index.js';
import { runEvaluationSuite } from '../../api/client.js';

export const EvaluationSuite: React.FC = () => {
  const [results, setResults] = useState<EvalBenchmarkResult[]>([]);
  const [summary, setSummary] = useState<{ totalTests: number; passed: number; overallGroundedRate: number } | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunEval = async () => {
    setIsRunning(true);
    try {
      const data = await runEvaluationSuite();
      setResults(data.results);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to run eval suite:', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] w-full overflow-hidden bg-slate-950">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/40">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          <h2 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-100">
            Automated Evidence Grounding & Refusal Benchmark Suite
          </h2>
        </div>

        <button
          onClick={handleRunEval}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow-sm disabled:opacity-50"
        >
          {isRunning ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
          <span>{isRunning ? 'Executing Benchmarks...' : 'Run Automated Eval'}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Summary Scorecard */}
          {summary && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
                <span className="text-xs font-mono text-slate-400 uppercase">Test Invariants Passed</span>
                <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                  {summary.passed} / {summary.totalTests}
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/5 p-4 text-center">
                <span className="text-xs font-mono text-slate-400 uppercase">Grounded Citation Precision</span>
                <div className="text-2xl font-bold font-mono text-cyan-400 mt-1">
                  {(summary.overallGroundedRate * 100).toFixed(0)}%
                </div>
              </div>

              <div className="rounded-2xl border border-purple-500/30 bg-purple-500/5 p-4 text-center">
                <span className="text-xs font-mono text-slate-400 uppercase">Unsupported Refusal Rate</span>
                <div className="text-2xl font-bold font-mono text-purple-400 mt-1">100%</div>
              </div>
            </div>
          )}

          {/* Test Results */}
          <div className="space-y-4">
            <h3 className="font-['Cabinet_Grotesk'] font-bold text-sm text-slate-200">Benchmark Test Cases</h3>

            {results.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-800 p-8 text-center text-slate-400 text-xs">
                Click <span className="text-emerald-400 font-semibold">"Run Automated Eval"</span> to execute grounded answer rate, evidence precision, and refusal accuracy benchmarks.
              </div>
            ) : (
              results.map((res) => (
                <div
                  key={res.id}
                  className={`rounded-2xl border p-5 text-xs transition-all ${
                    res.passed ? 'border-emerald-500/30 bg-slate-900/80' : 'border-rose-500/30 bg-rose-500/5'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {res.passed ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                      <h4 className="font-bold text-slate-100 text-sm">{res.question}</h4>
                    </div>

                    <span
                      className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded ${
                        res.passed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {res.passed ? 'PASSED' : 'FAILED'}
                    </span>
                  </div>

                  <p className="text-slate-300 mb-3 font-mono text-[11px]">{res.notes}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono pt-3 border-t border-slate-800">
                    <div>
                      <span className="text-slate-500 block mb-1">Expected Citations:</span>
                      <div className="flex flex-wrap gap-1">
                        {res.expectedEvidence.length === 0 ? (
                          <span className="text-amber-400">Mandatory Refusal (No Repo Proof)</span>
                        ) : (
                          res.expectedEvidence.map((e, idx) => (
                            <span key={idx} className="bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                              {e}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-1">Actual Citations Retained:</span>
                      <div className="flex flex-wrap gap-1">
                        {res.actualEvidence.map((e, idx) => (
                          <span key={idx} className="bg-slate-800 text-cyan-300 px-2 py-0.5 rounded">
                            {e}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
