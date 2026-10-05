/**
 * Shared Type Definitions for CodeDNA — Temporal Engineering Decision Graph
 */

export type EntityType =
  | 'Repository'
  | 'File'
  | 'Directory'
  | 'Class'
  | 'Function'
  | 'Configuration'
  | 'Commit'
  | 'PullRequest'
  | 'Issue'
  | 'Incident'
  | 'Discussion'
  | 'Decision'
  | 'Developer'
  | 'Reviewer'
  | 'Document';

export type RelationType =
  | 'CONTAINS'
  | 'CALLS'
  | 'IMPORTS'
  | 'MODIFIED_BY'
  | 'PART_OF'
  | 'AUTHORED_BY'
  | 'REVIEWED_BY'
  | 'DISCUSSES'
  | 'MENTIONS'
  | 'MOTIVATED_BY'
  | 'AFFECTS'
  | 'INTRODUCED'
  | 'CHANGED'
  | 'DEPENDS_ON'
  | 'RELATED_TO'
  | 'SUPERSEDES'
  | 'SUPERSEDED_BY'
  | 'EVOLVED_FROM';

export type DecisionStatus = 'ACTIVE' | 'SUPERSEDED' | 'DEPRECATED' | 'UNKNOWN';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT';

export type ResponseMode = 'REPOSITORY-GROUNDED' | 'GENERAL KNOWLEDGE' | 'EXTERNAL SOURCE';

export interface GraphNode {
  id: string;
  repositoryId: string;
  type: EntityType;
  label: string;
  name: string;
  description?: string;
  properties: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
  validFrom?: string;
  validUntil?: string;
  url?: string;
}

export interface GraphEdge {
  id: string;
  repositoryId: string;
  sourceId: string;
  targetId: string;
  type: RelationType;
  label: string;
  confidence: number;
  provenance: {
    sourceType: 'commit' | 'pull_request' | 'issue' | 'code' | 'discussion' | 'doc';
    sourceId: string;
    description: string;
    url?: string;
  };
  validFrom?: string;
  validUntil?: string;
}

export interface EngineeringDecision {
  id: string;
  repositoryId: string;
  title: string;
  description: string;
  decisionDate: string;
  status: DecisionStatus;
  author: string;
  affectedEntities: string[]; // Node IDs or names (e.g., config keys, files, classes)
  motivation: string;
  supersededBy?: string; // Decision ID
  supersedes?: string;   // Decision ID
  evidenceIds: string[]; // Commit, PR, Issue, File IDs
  confidence: ConfidenceLevel;
}

export interface RepositorySummary {
  id: string;
  url: string;
  owner: string;
  name: string;
  defaultBranch: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  status: 'indexing' | 'indexed' | 'syncing' | 'error';
  lastSyncedAt: string;
  stats: {
    totalFiles: number;
    totalFunctions: number;
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalDecisions: number;
    activeDecisions: number;
    supersededDecisions: number;
  };
}

export interface EvidenceItem {
  id: string;
  type: 'commit' | 'pull_request' | 'issue' | 'incident' | 'file' | 'function' | 'config' | 'doc';
  title: string;
  snippet?: string;
  author?: string;
  date?: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  summary: string;
  category: 'architecture' | 'incident' | 'decision' | 'commit' | 'pr' | 'supersession';
  author: string;
  entityName: string;
  evidence: EvidenceItem[];
  decisionId?: string;
  status?: DecisionStatus;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  mode: ResponseMode;
  confidence: ConfidenceLevel;
  evidence: EvidenceItem[];
  decisions: EngineeringDecision[];
  timelineEvents?: TimelineEvent[];
  graphNodes?: GraphNode[];
  graphEdges?: GraphEdge[];
  missingEvidence?: {
    required: string[];
    found: string[];
    missing: string[];
    explanation: string;
  };
  timestamp: string;
}

export interface Conversation {
  id: string;
  repositoryId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  context: {
    mentionedEntities: string[];
    currentTopic?: string;
    currentFiles?: string[];
    currentDecisions?: string[];
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'Architect' | 'Senior Engineer' | 'Lead Maintainer' | 'Contributor';
  avatarUrl?: string;
  createdAt: string;
}

export interface ProjectTask {
  id: string;
  repositoryId: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Completed';
  priority: 'P0' | 'P1' | 'P2';
  assignee: string;
  dueDate: string;
  createdAt: string;
  linkedArtifacts?: string[]; // PR #, Issue #, Commit SHA
}

export interface ProjectMilestone {
  id: string;
  repositoryId: string;
  title: string;
  targetDate: string;
  status: 'Upcoming' | 'In Progress' | 'Achieved';
  progressPercentage: number;
  description: string;
  associatedTaskIds: string[];
}

export interface CodeExplanation {
  entityName: string;
  filePath: string;
  entityType: EntityType;
  whyItWasUsed: {
    summary: string;
    drivingFactors: string[];
    motivatingArtifacts: { type: string; id: string; title: string; url?: string }[];
    historicalContext: string;
  };
  howItWorks: {
    overview: string;
    keyLines: { line: string; description: string }[];
    dependencies: string[];
    performanceNotes: string;
  };
  confidence: ConfidenceLevel;
}

export interface EvalBenchmarkResult {
  id: string;
  question: string;
  expectedEvidence: string[];
  actualEvidence: string[];
  groundedRate: number; // 0..1
  evidencePrecision: number; // 0..1
  refusalCorrectness: number; // 0..1
  passed: boolean;
  notes: string;
}
