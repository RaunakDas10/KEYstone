import { GoogleGenAI, Type } from '@google/genai';
import type { IUser } from '../models/User';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const MAX_RESULTS = 5;
let geminiClient: GoogleGenAI | null = null;
let clientApiKey: string | null = null;

export interface TalentSearchResult {
  freelancer: IUser;
  matchReason: string;
  matchScore: number;
}

interface GeminiRanking {
  summary?: string;
  recommendations?: Array<{
    id?: string;
    reason?: string;
    matchScore?: number;
  }>;
}

const getGeminiClient = (): GoogleGenAI | null => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  if (!geminiClient || clientApiKey !== apiKey) {
    geminiClient = new GoogleGenAI({ apiKey });
    clientApiKey = apiKey;
  }
  return geminiClient;
};

const toSearchableText = (freelancer: IUser) =>
  [freelancer.name, freelancer.title, freelancer.bio, ...(freelancer.skills || [])]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

const fallbackRank = (query: string, freelancers: IUser[], limit: number): TalentSearchResult[] => {
  const terms = query.toLowerCase().match(/[a-z0-9+#.]{3,}/g) || [];

  return freelancers
    .map((freelancer) => {
      const searchableText = toSearchableText(freelancer);
      const matchedTerms = terms.filter((term) => searchableText.includes(term)).length;
      const relevance = terms.length ? (matchedTerms / terms.length) * 55 : 0;
      const trust = Math.min(Math.max(freelancer.trustScore || 0, 0), 100) * 0.3;
      const delivery = Math.min(Math.max(freelancer.onTimeRate || 0, 0), 100) * 0.1;
      const completion = Math.min(Math.max(freelancer.completionRate || 0, 0), 100) * 0.05;
      const score = Math.round(Math.min(relevance + trust + delivery + completion, 100));

      return {
        freelancer,
        matchScore: score,
        matchReason:
          matchedTerms > 0
            ? `Matches ${matchedTerms} requirement${matchedTerms === 1 ? '' : 's'} and has a KEYStone score of ${freelancer.trustScore || 0}.`
            : `Recommended for a strong KEYStone score of ${freelancer.trustScore || 0} and reliable delivery record.`,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);
};

export const findTalentWithGemini = async (
  query: string,
  freelancers: IUser[],
  requestedLimit: number
): Promise<{ results: TalentSearchResult[]; summary: string; aiUsed: boolean }> => {
  const limit = Math.min(Math.max(requestedLimit, 1), MAX_RESULTS, freelancers.length);
  const fallbackResults = fallbackRank(query, freelancers, limit);
  const client = getGeminiClient();

  if (!client) {
    return {
      results: fallbackResults,
      summary: 'Ranked from skills and KEYStone reliability signals. Add GEMINI_API_KEY to enable AI recommendations.',
      aiUsed: false,
    };
  }

  try {
    const candidateProfiles = freelancers.map((freelancer) => ({
      id: freelancer.id,
      name: freelancer.name,
      title: freelancer.title || '',
      bio: freelancer.bio || '',
      skills: freelancer.skills || [],
      keyStoneScore: freelancer.trustScore || 0,
      onTimeRate: freelancer.onTimeRate || 0,
      completionRate: freelancer.completionRate || 0,
      projectsCompleted: freelancer.projectsCompleted || 0,
      hourlyRate: freelancer.hourlyRate || 0,
      location: freelancer.location || '',
    }));

    const response = await client.models.generateContent({
      model: process.env.GEMINI_FAST_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
      contents: `You are KEYStone's talent-matching assistant. Rank the best freelancers for the user's request. Prioritize demonstrated relevant skills and profile fit, then KEYStone score, on-time rate, completion rate, and completed projects. Do not invent skills, achievements, prices, or availability. Return at most ${limit} recommendations and only use candidate ids provided. Give each reason in one concise sentence.\n\nUser request:\n${query}\n\nCandidates:\n${JSON.stringify(candidateProfiles)}`,
      config: {
        // Do not leave the dashboard waiting if the provider or network is unavailable.
        httpOptions: {
          timeout: 10_000,
          retryOptions: { attempts: 1 },
        },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  matchScore: { type: Type.NUMBER },
                },
                required: ['id', 'reason', 'matchScore'],
              },
            },
          },
          required: ['summary', 'recommendations'],
        },
      },
    });

    const ranking = JSON.parse(response.text || '{}') as GeminiRanking;
    const freelancerById = new Map(freelancers.map((freelancer) => [freelancer.id, freelancer]));
    const usedIds = new Set<string>();
    const results = (ranking.recommendations || [])
      .slice(0, limit)
      .flatMap((recommendation) => {
        const freelancer = recommendation.id ? freelancerById.get(recommendation.id) : undefined;
        if (!freelancer || usedIds.has(freelancer.id)) return [];
        usedIds.add(freelancer.id);
        return [{
          freelancer,
          matchReason: recommendation.reason?.trim() || `Recommended for relevant skills and a KEYStone score of ${freelancer.trustScore || 0}.`,
          matchScore: Math.round(Math.min(Math.max(recommendation.matchScore || 0, 0), 100)),
        }];
      });

    if (!results.length) throw new Error('Gemini did not return valid talent recommendations.');

    return {
      results,
      summary: ranking.summary?.trim() || 'AI-ranked recommendations based on your request and verified profile signals.',
      aiUsed: true,
    };
  } catch (error) {
    console.warn(`[AI Talent Search] Gemini unavailable; using reliability fallback. ${(error as Error).message}`);
    return {
      results: fallbackResults,
      summary: 'Gemini is unavailable, so these results are ranked from skills and KEYStone reliability signals.',
      aiUsed: false,
    };
  }
};
