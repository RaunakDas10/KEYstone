// ============================================================
// KEYStone AI Trust Engine — Real Google Gemini Provider
// Uses standard fetch API with zero external npm dependencies.
// Model fallback order: gemini-1.5-flash -> gemini-2.0-flash -> gemini-1.5-pro
// ============================================================

import type {
  AIProvider,
  AIProjectInput,
  AIAnalysis,
  AIMilestoneSet,
  AIRequirementArea,
} from './types';
import { mockProvider } from './mockProvider';

const CANDIDATE_MODELS = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

export class GeminiProvider implements AIProvider {
  private apiKey: string;
  private primaryModel: string;

  constructor(apiKey: string, model: string = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.primaryModel = model;
  }

  private async callGeminiModel(modelName: string, systemPrompt: string, userPrompt: string): Promise<any> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${this.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: `${systemPrompt}\n\nUSER DATA:\n${userPrompt}` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json',
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API [${modelName}] HTTP Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error(`Gemini API [${modelName}] returned empty response.`);
    }

    return JSON.parse(rawText);
  }

  private async callGeminiWithFallback(systemPrompt: string, userPrompt: string): Promise<any> {
    const modelsToTry = Array.from(new Set([this.primaryModel, ...CANDIDATE_MODELS]));
    let lastError: any = null;

    for (const model of modelsToTry) {
      try {
        return await this.callGeminiModel(model, systemPrompt, userPrompt);
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini model ${model} failed, trying next candidate...`, err?.message);
      }
    }

    throw lastError ?? new Error('All Gemini model candidates failed.');
  }

  async analyzeProject(input: AIProjectInput): Promise<AIAnalysis> {
    const systemPrompt = `You are KEYStone AI, an expert software architecture and project risk engine for a trust-first freelance marketplace.
Your job is to analyze freelance project briefs to prevent disputes BEFORE work begins.
Analyze title, description, skills, budget, and deadline to identify ambiguity, scope creep, timeline feasibility, and budget adequacy.

Return ONLY valid JSON matching this structure exactly:
{
  "riskScore": number (0-100, where 0=low risk, 100=critical risk),
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "confidence": number (0-100),
  "summary": string (2-3 sentences explaining overall risk and clear next steps),
  "scoreBreakdown": {
    "scopeClarity": number (0-100),
    "budgetAdequacy": number (0-100),
    "timelineFeasibility": number (0-100),
    "requirementCompleteness": number (0-100),
    "milestoneQuality": number (0-100)
  },
  "risks": [
    {
      "id": string,
      "type": "timeline" | "scope" | "budget" | "requirements" | "technical" | "clarity",
      "severity": "critical" | "high" | "medium" | "low",
      "title": string,
      "description": string,
      "recommendation": string
    }
  ],
  "missingRequirements": [
    {
      "id": string,
      "area": string,
      "question": string,
      "suggestions": [string, string, string],
      "resolved": false
    }
  ],
  "recommendations": [string],
  "healthItems": [
    { "label": "Requirement Clarity", "status": "healthy" | "warning" | "critical" },
    { "label": "Budget", "status": "healthy" | "warning" | "critical" },
    { "label": "Timeline", "status": "healthy" | "warning" | "critical" },
    { "label": "Technical Scope", "status": "healthy" | "warning" | "critical" }
  ],
  "overallHealth": "ready" | "needs_attention" | "critical",
  "issueCount": number
}`;

    const userPrompt = JSON.stringify(input, null, 2);

    try {
      const json = await this.callGeminiWithFallback(systemPrompt, userPrompt);
      return {
        ...json,
        analyzedAt: new Date().toISOString(),
        analysisVersion: '2.0.0-gemini',
      };
    } catch (err) {
      console.warn('All Gemini model calls failed, falling back to mock provider:', err);
      return mockProvider.analyzeProject(input);
    }
  }

  async generateMilestones(input: AIProjectInput): Promise<AIMilestoneSet> {
    const systemPrompt = `You are KEYStone AI Smart Milestone Generator.
Convert the given freelance project details into 3-5 structured, sequential milestones with objective, measurable acceptance criteria.
Each milestone MUST contain deliverables and strict acceptance criteria.

Return ONLY valid JSON matching this exact structure:
{
  "milestones": [
    {
      "id": string,
      "title": string,
      "description": string,
      "dayStart": number,
      "dayEnd": number,
      "suggestedAmount": number (INR ₹ sum of all milestone suggestedAmounts MUST equal total project budget),
      "deliverables": [string],
      "acceptanceCriteria": [string]
    }
  ],
  "totalDays": number,
  "totalBudget": number
}`;

    const userPrompt = JSON.stringify(input, null, 2);

    try {
      const json = await this.callGeminiWithFallback(systemPrompt, userPrompt);
      return {
        ...json,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Gemini milestone generation failed, falling back to mock:', err);
      return mockProvider.generateMilestones(input);
    }
  }

  async analyzeRequirements(input: AIProjectInput): Promise<AIRequirementArea[]> {
    const analysis = await this.analyzeProject(input);
    return analysis.missingRequirements;
  }

  async generateRiskSummary(input: AIProjectInput): Promise<string> {
    const analysis = await this.analyzeProject(input);
    return analysis.summary;
  }
}
