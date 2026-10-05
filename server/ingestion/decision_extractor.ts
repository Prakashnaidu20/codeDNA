import { GoogleGenAI, Type } from '@google/genai';
import { EngineeringDecision, GraphNode, GraphEdge } from '../../src/types/index.js';

export interface RawArtifact {
  id: string;
  type: 'commit' | 'pr' | 'issue' | 'file';
  title: string;
  description: string;
  author: string;
  date: string;
}

export async function extractEngineeringDecisions(
  repoId: string,
  artifacts: RawArtifact[]
): Promise<{ decisions: EngineeringDecision[]; edges: GraphEdge[] }> {
  const decisions: EngineeringDecision[] = [];
  const edges: GraphEdge[] = [];

  // Initialize Gemini API if API key is present
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const artifactSummary = artifacts
        .map((a) => `[${a.type.toUpperCase()}] ID: ${a.id} | Date: ${a.date} | Author: ${a.author}\nTitle: ${a.title}\nDesc: ${a.description}`)
        .slice(0, 30)
        .join('\n---\n');

      const prompt = `Analyze these GitHub repository artifacts (commits, PRs, issues) and extract all explicit or implied Engineering Decisions.
Determine if any decision supersedes an older decision.

Artifacts:
${artifactSummary}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert software archivist. Extract clear engineering decisions, motives, affected components, and decision status (ACTIVE or SUPERSEDED). Return valid JSON.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                decisionDate: { type: Type.STRING },
                status: { type: Type.STRING, enum: ['ACTIVE', 'SUPERSEDED', 'DEPRECATED'] },
                author: { type: Type.STRING },
                affectedEntities: { type: Type.ARRAY, items: { type: Type.STRING } },
                motivation: { type: Type.STRING },
                evidenceIds: { type: Type.ARRAY, items: { type: Type.STRING } },
                supersedesTitle: { type: Type.STRING }
              },
              required: ['title', 'description', 'decisionDate', 'status', 'author', 'affectedEntities', 'motivation', 'evidenceIds']
            }
          }
        }
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim());
        parsed.forEach((item: any, idx: number) => {
          const decId = `dec-${repoId}-${Date.now()}-${idx}`;
          decisions.push({
            id: decId,
            repositoryId: repoId,
            title: item.title,
            description: item.description,
            decisionDate: item.decisionDate || new Date().toISOString(),
            status: item.status as any,
            author: item.author || 'Contributor',
            affectedEntities: item.affectedEntities || [],
            motivation: item.motivation || '',
            evidenceIds: item.evidenceIds || [],
            confidence: 'HIGH'
          });
        });
      }
    } catch (err) {
      console.warn('Gemini decision extraction failed or fallback activated:', err);
    }
  }

  // Fallback Rule-based Extraction if no AI response
  if (decisions.length === 0) {
    artifacts.forEach((art, idx) => {
      const text = `${art.title} ${art.description}`.toLowerCase();
      const isDecision =
        text.includes('decide') ||
        text.includes('migration') ||
        text.includes('refactor') ||
        text.includes('lower') ||
        text.includes('increase') ||
        text.includes('replace') ||
        text.includes('supersed') ||
        text.includes('architecture') ||
        text.includes('deprecate');

      if (isDecision) {
        const decId = `dec-${repoId}-rule-${idx}`;
        decisions.push({
          id: decId,
          repositoryId: repoId,
          title: art.title,
          description: art.description || art.title,
          decisionDate: art.date,
          status: text.includes('supersed') || text.includes('deprecate') ? 'SUPERSEDED' : 'ACTIVE',
          author: art.author,
          affectedEntities: [art.type, art.id],
          motivation: art.description.slice(0, 200) || art.title,
          evidenceIds: [art.id],
          confidence: 'MEDIUM'
        });
      }
    });
  }

  return { decisions, edges };
}
