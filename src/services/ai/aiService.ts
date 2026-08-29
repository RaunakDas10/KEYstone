// ============================================================
// KEYStone AI Trust Engine — Automatic Gemini Service
//
// Automatically connects to Google Gemini API using VITE_GEMINI_API_KEY.
// Models tried in order: gemini-1.5-flash -> gemini-2.0-flash -> gemini-1.5-pro
// Seamlessly falls back to mock provider if key is unconfigured.
// No user-facing API key inputs or modals anywhere in the app.
// ============================================================

import type { AIProvider, AIProjectInput, AIAnalysis, AIMilestoneSet, AIRequirementArea } from './types';
import { mockProvider } from './mockProvider';
import { GeminiProvider } from './geminiProvider';

function getActiveProvider(): AIProvider {
  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

  if (geminiKey && geminiKey.trim() !== '' && geminiKey !== 'YOUR_GEMINI_API_KEY_HERE') {
    return new GeminiProvider(geminiKey.trim(), 'gemini-1.5-flash');
  }

  return mockProvider;
}

// ============================================================
// Public API Functions
// ============================================================

export async function analyzeProject(input: AIProjectInput): Promise<AIAnalysis> {
  const provider = getActiveProvider();
  return provider.analyzeProject(input);
}

export async function generateMilestones(input: AIProjectInput): Promise<AIMilestoneSet> {
  const provider = getActiveProvider();
  return provider.generateMilestones(input);
}

export async function analyzeRequirements(input: AIProjectInput): Promise<AIRequirementArea[]> {
  const provider = getActiveProvider();
  return provider.analyzeRequirements(input);
}

export async function generateRiskSummary(input: AIProjectInput): Promise<string> {
  const provider = getActiveProvider();
  return provider.generateRiskSummary(input);
}

export type { AIProjectInput, AIAnalysis, AIMilestoneSet, AIRequirementArea };
export type { AIRisk, AIRiskLevel, AIMilestone, AIHealthItem, AIHealthStatus, AIScoreBreakdown } from './types';
