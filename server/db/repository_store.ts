import { RepositorySummary, GraphNode, GraphEdge, EngineeringDecision } from '../../src/types/index.js';
import { globalGraph } from './knowledge_graph.js';

export class RepositoryStore {
  private repositories: Map<string, RepositorySummary> = new Map();

  constructor() {
    this.seedDefaultRepositories();
  }

  public getAll(): RepositorySummary[] {
    return Array.from(this.repositories.values());
  }

  public getById(id: string): RepositorySummary | undefined {
    return this.repositories.get(id);
  }

  public getByUrl(url: string): RepositorySummary | undefined {
    const cleanUrl = url.toLowerCase().trim().replace(/\/$/, '');
    for (const repo of this.repositories.values()) {
      if (repo.url.toLowerCase().trim().replace(/\/$/, '') === cleanUrl) {
        return repo;
      }
    }
    return undefined;
  }

  public save(repo: RepositorySummary): RepositorySummary {
    this.repositories.set(repo.id, repo);
    return repo;
  }

  /**
   * Seed rich pre-indexed engineering repositories and decision graphs
   */
  private seedDefaultRepositories() {
    // 1. Payment Service Benchmark Repository
    const payRepoId = 'repo-payment-service';
    const payRepo: RepositorySummary = {
      id: payRepoId,
      url: 'https://github.com/code-dna/payment-service',
      owner: 'code-dna',
      name: 'payment-service',
      defaultBranch: 'main',
      description: 'Microservice handling payment gateways, exponential retry logic, and circuit breaking.',
      stars: 1240,
      forks: 180,
      language: 'Python',
      status: 'indexed',
      lastSyncedAt: new Date().toISOString(),
      stats: {
        totalFiles: 14,
        totalFunctions: 38,
        totalCommits: 142,
        totalPRs: 29,
        totalIssues: 18,
        totalDecisions: 4,
        activeDecisions: 3,
        supersededDecisions: 1
      }
    };
    this.save(payRepo);
    this.seedPaymentServiceGraph(payRepoId);

    // 2. React (facebook/react)
    const reactRepoId = 'repo-facebook-react';
    const reactRepo: RepositorySummary = {
      id: reactRepoId,
      url: 'https://github.com/facebook/react',
      owner: 'facebook',
      name: 'react',
      defaultBranch: 'main',
      description: 'The library for web and native user interfaces.',
      stars: 228000,
      forks: 46000,
      language: 'JavaScript/TypeScript',
      status: 'indexed',
      lastSyncedAt: new Date().toISOString(),
      stats: {
        totalFiles: 1250,
        totalFunctions: 8900,
        totalCommits: 16200,
        totalPRs: 4800,
        totalIssues: 3200,
        totalDecisions: 12,
        activeDecisions: 9,
        supersededDecisions: 3
      }
    };
    this.save(reactRepo);
    this.seedReactGraph(reactRepoId);

    // 3. FastAPI (fastapi/fastapi)
    const fastapiRepoId = 'repo-fastapi';
    const fastapiRepo: RepositorySummary = {
      id: fastapiRepoId,
      url: 'https://github.com/fastapi/fastapi',
      owner: 'fastapi',
      name: 'fastapi',
      defaultBranch: 'master',
      description: 'FastAPI framework, high performance, easy to learn, fast to code, ready for production.',
      stars: 76000,
      forks: 6200,
      language: 'Python',
      status: 'indexed',
      lastSyncedAt: new Date().toISOString(),
      stats: {
        totalFiles: 320,
        totalFunctions: 2100,
        totalCommits: 3800,
        totalPRs: 1900,
        totalIssues: 2400,
        totalDecisions: 8,
        activeDecisions: 6,
        supersededDecisions: 2
      }
    };
    this.save(fastapiRepo);
    this.seedFastAPIGraph(fastapiRepoId);
  }

  private seedPaymentServiceGraph(repoId: string) {
    // Nodes
    const nConfig: GraphNode = {
      id: 'node-config-py',
      repositoryId: repoId,
      type: 'File',
      label: 'config.py',
      name: 'src/config.py',
      description: 'Configuration module containing MAX_RETRIES, TIMEOUT_SECONDS, and gateway credentials.',
      properties: { language: 'python', lines: 45 }
    };

    const nMaxRetries: GraphNode = {
      id: 'node-max-retries',
      repositoryId: repoId,
      type: 'Configuration',
      label: 'MAX_RETRIES = 3',
      name: 'MAX_RETRIES',
      description: 'Maximum number of automatic retry attempts allowed for transient payment gateway HTTP errors.',
      properties: { defaultValue: 3, historicalValues: [5, 3] }
    };

    const nServiceFile: GraphNode = {
      id: 'node-payment-service-py',
      repositoryId: repoId,
      type: 'File',
      label: 'payment_service.py',
      name: 'src/payment_service.py',
      description: 'Core payment processing logic and gateway API wrapper.',
      properties: { language: 'python', lines: 180 }
    };

    const nProcessPayment: GraphNode = {
      id: 'node-func-process-payment',
      repositoryId: repoId,
      type: 'Function',
      label: 'process_payment()',
      name: 'process_payment',
      description: 'Handles payment execution with jittered backoff and MAX_RETRIES check.',
      properties: { returns: 'PaymentResult' }
    };

    const nIssue193: GraphNode = {
      id: 'node-issue-193',
      repositoryId: repoId,
      type: 'Incident',
      label: 'Incident #193',
      name: 'Issue #193: Cascading Payment Gateway Outage due to Retry Storm',
      description: 'Under 15% gateway error rate, clients retrying 5 times caused 6x request amplification, collapsing downstream Stripe webhooks.',
      url: 'https://github.com/code-dna/payment-service/issues/193',
      properties: { date: '2023-10-12', severity: 'P1', author: 'dev-marcus' }
    };

    const nPR421: GraphNode = {
      id: 'node-pr-421',
      repositoryId: repoId,
      type: 'PullRequest',
      label: 'PR #421',
      name: 'PR #421: Reduce MAX_RETRIES to 3 and add jittered exponential backoff',
      description: 'Lowers MAX_RETRIES from 5 to 3. Approved by dev-lead-elena after load testing confirmed 70% decrease in peak retry traffic.',
      url: 'https://github.com/code-dna/payment-service/pull/421',
      properties: { date: '2023-10-14', author: 'dev-marcus', reviewer: 'dev-lead-elena', state: 'merged' }
    };

    const nCommitA81D: GraphNode = {
      id: 'node-commit-a81d',
      repositoryId: repoId,
      type: 'Commit',
      label: 'Commit a81d',
      name: 'a81d0f2',
      description: 'fix: lower MAX_RETRIES from 5 to 3 to mitigate retry storm after Incident #193',
      url: 'https://github.com/code-dna/payment-service/commit/a81d0f2',
      properties: { date: '2023-10-14', author: 'dev-marcus', sha: 'a81d0f2' }
    };

    const nCommit02F1: GraphNode = {
      id: 'node-commit-02f1',
      repositoryId: repoId,
      type: 'Commit',
      label: 'Commit 02f1',
      name: '02f1b98',
      description: 'feat: initial payment service with MAX_RETRIES=5 default configuration',
      url: 'https://github.com/code-dna/payment-service/commit/02f1b98',
      properties: { date: '2022-04-10', author: 'dev-sarah', sha: '02f1b98' }
    };

    const nDevMarcus: GraphNode = {
      id: 'node-dev-marcus',
      repositoryId: repoId,
      type: 'Developer',
      label: 'dev-marcus',
      name: 'Marcus Vance',
      description: 'Senior Infrastructure & Payment Engineer',
      properties: { role: 'Senior Engineer' }
    };

    const nDevElena: GraphNode = {
      id: 'node-dev-elena',
      repositoryId: repoId,
      type: 'Reviewer',
      label: 'dev-lead-elena',
      name: 'Elena Rostova',
      description: 'Tech Lead / Staff Engineer',
      properties: { role: 'Staff Engineer' }
    };

    [nConfig, nMaxRetries, nServiceFile, nProcessPayment, nIssue193, nPR421, nCommitA81D, nCommit02F1, nDevMarcus, nDevElena].forEach((n) =>
      globalGraph.addNode(n)
    );

    // Edges
    const edges: GraphEdge[] = [
      {
        id: 'edge-1',
        repositoryId: repoId,
        sourceId: nConfig.id,
        targetId: nMaxRetries.id,
        type: 'CONTAINS',
        label: 'defines',
        confidence: 1.0,
        provenance: { sourceType: 'code', sourceId: nConfig.id, description: 'MAX_RETRIES defined in config.py' }
      },
      {
        id: 'edge-2',
        repositoryId: repoId,
        sourceId: nProcessPayment.id,
        targetId: nMaxRetries.id,
        type: 'DEPENDS_ON',
        label: 'reads retry limit',
        confidence: 0.98,
        provenance: { sourceType: 'code', sourceId: nServiceFile.id, description: 'process_payment imports MAX_RETRIES' }
      },
      {
        id: 'edge-3',
        repositoryId: repoId,
        sourceId: nPR421.id,
        targetId: nIssue193.id,
        type: 'MOTIVATED_BY',
        label: 'resolves incident',
        confidence: 0.99,
        provenance: { sourceType: 'pull_request', sourceId: 'PR #421', description: 'PR #421 states: "Fixes Incident #193"' }
      },
      {
        id: 'edge-4',
        repositoryId: repoId,
        sourceId: nCommitA81D.id,
        targetId: nPR421.id,
        type: 'PART_OF',
        label: 'merged via',
        confidence: 1.0,
        provenance: { sourceType: 'commit', sourceId: 'a81d0f2', description: 'Commit a81d merged in PR #421' }
      },
      {
        id: 'edge-5',
        repositoryId: repoId,
        sourceId: nCommitA81D.id,
        targetId: nMaxRetries.id,
        type: 'CHANGED',
        label: 'lowered value to 3',
        confidence: 1.0,
        provenance: { sourceType: 'commit', sourceId: 'a81d0f2', description: 'Diff shows MAX_RETRIES 5 -> 3' }
      },
      {
        id: 'edge-6',
        repositoryId: repoId,
        sourceId: nPR421.id,
        targetId: nDevMarcus.id,
        type: 'AUTHORED_BY',
        label: 'authored by',
        confidence: 1.0,
        provenance: { sourceType: 'pull_request', sourceId: 'PR #421', description: 'Author: dev-marcus' }
      },
      {
        id: 'edge-7',
        repositoryId: repoId,
        sourceId: nPR421.id,
        targetId: nDevElena.id,
        type: 'REVIEWED_BY',
        label: 'approved by',
        confidence: 1.0,
        provenance: { sourceType: 'pull_request', sourceId: 'PR #421', description: 'Approved by dev-lead-elena' }
      }
    ];

    edges.forEach((e) => globalGraph.addEdge(e));

    // Decisions
    const d0: EngineeringDecision = {
      id: 'dec-000',
      repositoryId: repoId,
      title: 'Initial Payment Retry Policy (5 Retries)',
      description: 'Set MAX_RETRIES to 5 to handle flaky network calls during initial microservice rollout.',
      decisionDate: '2022-04-10',
      status: 'SUPERSEDED',
      author: 'dev-sarah',
      affectedEntities: ['MAX_RETRIES', 'config.py'],
      motivation: 'Ensure maximum request completion probability during early beta testing.',
      supersededBy: 'dec-001',
      evidenceIds: [nCommit02F1.id, nConfig.id],
      confidence: 'HIGH'
    };

    const d1: EngineeringDecision = {
      id: 'dec-001',
      repositoryId: repoId,
      title: 'Lower MAX_RETRIES from 5 to 3 with Jittered Backoff',
      description: 'Reduced max retries to 3 following Incident #193 retry storm which overloaded Stripe webhooks.',
      decisionDate: '2023-10-14',
      status: 'ACTIVE',
      author: 'dev-marcus',
      affectedEntities: ['MAX_RETRIES', 'config.py', 'payment_service.py'],
      motivation: 'Prevent request amplification storms and gateway timeouts during vendor outages.',
      supersedes: 'dec-000',
      evidenceIds: [nPR421.id, nIssue193.id, nCommitA81D.id, nConfig.id],
      confidence: 'HIGH'
    };

    globalGraph.addDecision(d0);
    globalGraph.addDecision(d1);

    // Supersession edge
    globalGraph.addEdge({
      id: 'edge-supersede-01',
      repositoryId: repoId,
      sourceId: d0.id,
      targetId: d1.id,
      type: 'SUPERSEDED_BY',
      label: 'superseded by dec-001',
      confidence: 1.0,
      provenance: { sourceType: 'code', sourceId: 'PR #421', description: 'PR #421 explicitly supersedes 5-retry policy' }
    });
  }

  private seedReactGraph(repoId: string) {
    const nFiber: GraphNode = {
      id: 'node-react-fiber',
      repositoryId: repoId,
      type: 'Class',
      label: 'ReactFiberWorkLoop',
      name: 'ReactFiberWorkLoop.js',
      description: 'Asynchronous cooperative reconciler introduced in React 16 to enable concurrent rendering.',
      properties: { architecture: 'Fiber' }
    };

    const nPRReconciler: GraphNode = {
      id: 'node-react-pr-8900',
      repositoryId: repoId,
      type: 'PullRequest',
      label: 'PR #8900',
      name: 'PR #8900: Rewrite reconciler with Fiber Architecture',
      description: 'Replaced stack reconciler with incremental Fiber rendering architecture.',
      url: 'https://github.com/facebook/react/pull/8900',
      properties: { date: '2016-09-21', author: 'acdlite', reviewer: 'gaearon' }
    };

    globalGraph.addNode(nFiber);
    globalGraph.addNode(nPRReconciler);

    const dFiber: EngineeringDecision = {
      id: 'dec-react-fiber',
      repositoryId: repoId,
      title: 'Transition from Stack Reconciler to Fiber Architecture',
      description: 'Complete overhaul of React core to allow incremental rendering and prioritize user animation frames.',
      decisionDate: '2016-09-21',
      status: 'ACTIVE',
      author: 'acdlite',
      affectedEntities: ['ReactFiberWorkLoop.js', 'ReactReconciler'],
      motivation: 'Stack reconciler was synchronous and blocked the main thread during heavy component tree updates.',
      evidenceIds: [nFiber.id, nPRReconciler.id],
      confidence: 'HIGH'
    };

    globalGraph.addDecision(dFiber);
  }

  private seedFastAPIGraph(repoId: string) {
    const nStarlette: GraphNode = {
      id: 'node-fastapi-starlette',
      repositoryId: repoId,
      type: 'File',
      label: 'applications.py',
      name: 'fastapi/applications.py',
      description: 'FastAPI application class inheriting from Starlette ASGI framework.',
      properties: { framework: 'ASGI' }
    };

    globalGraph.addNode(nStarlette);

    const dFastAPI: EngineeringDecision = {
      id: 'dec-fastapi-pydantic2',
      repositoryId: repoId,
      title: 'Upgrade FastAPI to Pydantic v2 Core',
      description: 'Migrate validation layer to Rust-backed Pydantic v2 for 5x to 20x performance improvement.',
      decisionDate: '2023-06-30',
      status: 'ACTIVE',
      author: 'tiangolo',
      affectedEntities: ['applications.py', 'pydantic'],
      motivation: 'Massive execution speedup and improved OpenAPI schema generation.',
      evidenceIds: [nStarlette.id],
      confidence: 'HIGH'
    };

    globalGraph.addDecision(dFastAPI);
  }
}

export const repositoryStore = new RepositoryStore();
