// ============================================================
// KEYStone AI Trust Engine — Custom AI Server / Backend Provider
// Connects to your custom AI model / server / backend API endpoint.
// ============================================================

import type {
  AIProvider,
  AIProjectInput,
  AIAnalysis,
  AIMilestoneSet,
  AIRequirementArea,
} from './types';
import { mockProvider } from './mockProvider';

export class CustomAIProvider implements AIProvider {
  private endpoint: string;
  private apiKey?: string;

  constructor(endpoint: string, apiKey?: string) {
    // Remove trailing slash if present
    this.endpoint = endpoint.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
      headers['x-api-key'] = this.apiKey;
    }
    return headers;
  }

  async analyzeProject(input: AIProjectInput): Promise<AIAnalysis> {
    const url = `${this.endpoint}/analyze-project`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        // Fallback try single endpoint if subpath failed
        const altResponse = await fetch(this.endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ action: 'analyze-project', ...input }),
        });
        if (altResponse.ok) {
          const data = await altResponse.json();
          return { ...data, analyzedAt: new Date().toISOString(), analysisVersion: 'custom-ai' };
        }
        throw new Error(`Custom AI API HTTP Error ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        analyzedAt: new Date().toISOString(),
        analysisVersion: 'custom-ai',
      };
    } catch (err) {
      console.warn('Custom AI API call failed, falling back to mock engine:', err);
      return mockProvider.analyzeProject(input);
    }
  }

  async generateMilestones(input: AIProjectInput): Promise<AIMilestoneSet> {
    const url = `${this.endpoint}/generate-milestones`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        // Fallback try single endpoint
        const altResponse = await fetch(this.endpoint, {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({ action: 'generate-milestones', ...input }),
        });
        if (altResponse.ok) {
          const data = await altResponse.json();
          return { ...data, generatedAt: new Date().toISOString() };
        }
        throw new Error(`Custom AI API HTTP Error ${response.status}`);
      }

      const data = await response.json();
      return {
        ...data,
        generatedAt: new Date().toISOString(),
      };
    } catch (err) {
      console.warn('Custom AI milestone generation failed, falling back to mock:', err);
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
