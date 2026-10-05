import { EntityType, GraphEdge, GraphNode, RelationType, EngineeringDecision, TimelineEvent } from '../../src/types/index.js';

export class KnowledgeGraphStore {
  private nodes: Map<string, GraphNode> = new Map();
  private edges: Map<string, GraphEdge> = new Map();
  private decisions: Map<string, EngineeringDecision> = new Map();

  /**
   * Add or update a Node in the Knowledge Graph
   */
  public addNode(node: GraphNode): GraphNode {
    this.nodes.set(node.id, {
      ...node,
      createdAt: node.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return this.nodes.get(node.id)!;
  }

  /**
   * Add or update an Edge in the Knowledge Graph
   */
  public addEdge(edge: GraphEdge): GraphEdge {
    this.edges.set(edge.id, edge);
    return edge;
  }

  /**
   * Add or update an Engineering Decision
   */
  public addDecision(decision: EngineeringDecision): EngineeringDecision {
    this.decisions.set(decision.id, decision);
    return decision;
  }

  public getNode(id: string): GraphNode | undefined {
    return this.nodes.get(id);
  }

  public getNodesByRepo(repoId: string, filterType?: EntityType): GraphNode[] {
    const list: GraphNode[] = [];
    for (const node of this.nodes.values()) {
      if (node.repositoryId === repoId) {
        if (!filterType || node.type === filterType) {
          list.push(node);
        }
      }
    }
    return list;
  }

  public getEdgesByRepo(repoId: string): GraphEdge[] {
    const list: GraphEdge[] = [];
    for (const edge of this.edges.values()) {
      if (edge.repositoryId === repoId) {
        list.push(edge);
      }
    }
    return list;
  }

  public getDecisionsByRepo(repoId: string): EngineeringDecision[] {
    const list: EngineeringDecision[] = [];
    for (const decision of this.decisions.values()) {
      if (decision.repositoryId === repoId) {
        list.push(decision);
      }
    }
    return list.sort((a, b) => new Date(b.decisionDate).getTime() - new Date(a.decisionDate).getTime());
  }

  /**
   * Entity Resolution: Search for node by exact/partial match on name, path, or label
   */
  public findEntityByName(repoId: string, searchTerm: string): GraphNode[] {
    const normalized = searchTerm.toLowerCase().trim();
    if (!normalized) return [];

    const matches: { node: GraphNode; score: number }[] = [];

    for (const node of this.nodes.values()) {
      if (node.repositoryId !== repoId) continue;

      const nameLower = node.name.toLowerCase();
      const labelLower = node.label.toLowerCase();
      const descLower = (node.description || '').toLowerCase();

      let score = 0;

      if (nameLower === normalized) score += 1.0;
      else if (nameLower.includes(normalized) || normalized.includes(nameLower)) score += 0.7;
      else if (labelLower.includes(normalized)) score += 0.5;
      else if (descLower.includes(normalized)) score += 0.3;

      if (score > 0) {
        matches.push({ node, score });
      }
    }

    return matches.sort((a, b) => b.score - a.score).map((m) => m.node);
  }

  /**
   * Traverse Graph outward from a start node up to maxDepth
   */
  public traverse(repoId: string, startNodeId: string, maxDepth: number = 2): { nodes: GraphNode[]; edges: GraphEdge[] } {
    const visitedNodes = new Set<string>();
    const visitedEdges = new Set<string>();
    const queue: { id: string; depth: number }[] = [{ id: startNodeId, depth: 0 }];

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;
      if (visitedNodes.has(id)) continue;
      visitedNodes.add(id);

      if (depth >= maxDepth) continue;

      for (const edge of this.edges.values()) {
        if (edge.repositoryId !== repoId) continue;

        if (edge.sourceId === id) {
          visitedEdges.add(edge.id);
          if (!visitedNodes.has(edge.targetId)) {
            queue.push({ id: edge.targetId, depth: depth + 1 });
          }
        } else if (edge.targetId === id) {
          visitedEdges.add(edge.id);
          if (!visitedNodes.has(edge.sourceId)) {
            queue.push({ id: edge.sourceId, depth: depth + 1 });
          }
        }
      }
    }

    const resultNodes: GraphNode[] = [];
    for (const id of visitedNodes) {
      const n = this.nodes.get(id);
      if (n) resultNodes.push(n);
    }

    const resultEdges: GraphEdge[] = [];
    for (const id of visitedEdges) {
      const e = this.edges.get(id);
      if (e) resultEdges.push(e);
    }

    return { nodes: resultNodes, edges: resultEdges };
  }

  /**
   * Build temporal timeline of engineering decisions, incidents, commits and PRs
   */
  public getTimeline(repoId: string, entityFilter?: string): TimelineEvent[] {
    const events: TimelineEvent[] = [];

    // 1. Gather decision events
    for (const d of this.decisions.values()) {
      if (d.repositoryId !== repoId) continue;
      if (entityFilter && !d.affectedEntities.some((e) => e.toLowerCase().includes(entityFilter.toLowerCase()))) {
        continue;
      }

      events.push({
        id: `event-${d.id}`,
        date: d.decisionDate,
        title: d.title,
        summary: d.description,
        category: d.supersededBy ? 'supersession' : 'decision',
        author: d.author,
        entityName: d.affectedEntities.join(', ') || 'Architecture',
        decisionId: d.id,
        status: d.status,
        evidence: d.evidenceIds.map((eid) => {
          const node = this.nodes.get(eid);
          return {
            id: eid,
            type: (node?.type.toLowerCase() as any) || 'doc',
            title: node?.name || eid,
            snippet: node?.description,
            author: node?.properties?.author || d.author,
            date: node?.properties?.date || d.decisionDate,
            url: node?.url
          };
        })
      });
    }

    // 2. Gather commit/PR/incident nodes
    for (const node of this.nodes.values()) {
      if (node.repositoryId !== repoId) continue;
      if (node.type === 'Commit' || node.type === 'PullRequest' || node.type === 'Incident') {
        const date = node.properties?.date || node.createdAt || '2024-01-01';
        if (entityFilter && !node.name.toLowerCase().includes(entityFilter.toLowerCase())) {
          continue;
        }

        const cat = node.type === 'Incident' ? 'incident' : node.type === 'PullRequest' ? 'pr' : 'commit';

        events.push({
          id: `event-${node.id}`,
          date,
          title: node.label,
          summary: node.description || node.name,
          category: cat,
          author: node.properties?.author || 'Contributor',
          entityName: node.name,
          evidence: [
            {
              id: node.id,
              type: cat as any,
              title: node.label,
              snippet: node.description,
              author: node.properties?.author,
              date,
              url: node.url
            }
          ]
        });
      }
    }

    return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get Decision Supersession Chain
   */
  public getSupersessionChain(repoId: string, decisionId: string): EngineeringDecision[] {
    const chain: EngineeringDecision[] = [];
    let current = this.decisions.get(decisionId);

    while (current) {
      chain.push(current);
      if (current.supersededBy) {
        current = this.decisions.get(current.supersededBy);
      } else {
        break;
      }
    }

    return chain;
  }
}

export const globalGraph = new KnowledgeGraphStore();
