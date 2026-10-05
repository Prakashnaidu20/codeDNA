import { RepositorySummary, GraphNode, GraphEdge, EngineeringDecision, TimelineEvent, ChatMessage, EvalBenchmarkResult } from '../types/index.js';

async function parseResponse<T>(res: Response, defaultMessage: string): Promise<T> {
  if (!res.ok) {
    let errorMsg = defaultMessage;
    try {
      const data = await res.json();
      errorMsg = data.error || errorMsg;
    } catch (_) {
      const text = await res.text();
      if (text && !text.startsWith('<!doctype')) {
        errorMsg = text.slice(0, 120);
      }
    }
    throw new Error(errorMsg);
  }
  return res.json();
}

export async function fetchRepositories(): Promise<RepositorySummary[]> {
  const res = await fetch('/api/repositories');
  return parseResponse<RepositorySummary[]>(res, 'Failed to fetch repositories');
}

export async function ingestRepository(url: string): Promise<RepositorySummary> {
  const res = await fetch('/api/repositories/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url })
  });
  return parseResponse<RepositorySummary>(res, 'Failed to ingest repository');
}

export async function syncRepository(id: string): Promise<RepositorySummary> {
  const res = await fetch(`/api/repositories/${id}/sync`, { method: 'POST' });
  return parseResponse<RepositorySummary>(res, 'Failed to sync repository');
}

export async function fetchGraph(repoId: string): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const res = await fetch(`/api/repositories/${repoId}/graph`);
  return parseResponse<{ nodes: GraphNode[]; edges: GraphEdge[] }>(res, 'Failed to fetch graph');
}

export async function fetchDecisions(repoId: string): Promise<EngineeringDecision[]> {
  const res = await fetch(`/api/repositories/${repoId}/decisions`);
  return parseResponse<EngineeringDecision[]>(res, 'Failed to fetch decisions');
}

export async function fetchTimeline(repoId: string): Promise<TimelineEvent[]> {
  const res = await fetch(`/api/repositories/${repoId}/timeline`);
  return parseResponse<TimelineEvent[]>(res, 'Failed to fetch timeline');
}

export async function sendChatMessage(repositoryId: string, message: string, history: { role: string; content: string }[] = []): Promise<ChatMessage> {
  const res = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ repositoryId, message, conversationHistory: history })
  });
  return parseResponse<ChatMessage>(res, 'Failed to process message');
}

export async function runEvaluationSuite(): Promise<{
  summary: { totalTests: number; passed: number; overallGroundedRate: number };
  results: EvalBenchmarkResult[];
}> {
  const res = await fetch('/api/evaluate', { method: 'POST' });
  return parseResponse<{ summary: { totalTests: number; passed: number; overallGroundedRate: number }; results: EvalBenchmarkResult[] }>(res, 'Failed to run evaluation suite');
}
