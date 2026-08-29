// ============================================================
// KEYStone AI Trust Engine — Real OpenAI Provider
// Uses standard fetch API for OpenAI GPT-4o / GPT-4o-mini
// ============================================================

import type {
  AIProvider,
  AIProjectInput,
  AIAnalysis,
  AIMilestoneSet,
  AIRequirementArea,
} from './types';
import { mockProvider } from './mockProvider';

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;

  constructor(
    apiKey: string,
    model: string = 'gpt-4o-mini',
    baseUrl: string = 'https://api.openai.com/v1'
  ) {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = baseUrl;
  }

  private async callOpenAI(systemPrompt: string, userPrompt: string): Promise<any> {
    const url = `${this.baseUrl}/chat/completions`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API HTTP Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const rawText = data.choices?.[0]?.message?.content;
    if (!rawText) {
      throw new Error('OpenAI API returned empty response.');
    }

    return JSON.parse(rawText);
  }

  async analyzeProject(input: AIProjectInput): Promise<AIAnalysis> {
    const systemPrompt = `You are KEYStone AI, an expert software architecture and project risk engine for a trust-first freelance marketplace.
Analyze project title, description, skills, budget, and timeline to identify ambiguity, scope creep, timeline feasibility, and budget adequacy.

Return ONLY valid JSON matching this exact structure:
{
  "riskScore": number (0-100),
  "riskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "confidence": number (0-100),
  "summary": string,
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
      const json = await this.callOpenAI(systemPrompt, userPrompt);
      return {
        ...json,
        analyzedAt: new Date().toISOString(),
        analysisVersion: '2.0.0-openai',
      };
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to mock provider:', err);
      return mockProvider.analyzeProject(input);
    }
  }

  async generateMilestones(input: AIProjectInput): Promise<AIMilestoneSet> {
    const systemPrompt = `You are KEYStone AI Smart Milestone Generator.
Convert the given freelance project details into 3-5 structured, sequential milestones with objective, measurable acceptance criteria.

Return ONLY valid JSON matching this exact structure:
{
  "milestones": [
    {
      "id": string,
      "title": string,
      "description": string,
      "dayStart": number,
      "dayEnd": number,
      "suggestedAmount": number,
      "deliverables": [string],
      "acceptanceCriteria": [string]
    }
  ],
  "totalDays": number,
  "totalBudget": number
}`;

    const userPrompt = JSON.stringify(input, null, 2);

    try {
      const json = await this.callOpenAI(systemPrompt, userPrompt);
      return {
        ...json,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('OpenAI milestone generation failed, falling back to mock:', err);
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
