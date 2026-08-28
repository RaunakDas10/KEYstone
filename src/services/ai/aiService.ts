// ============================================================
// KEYStone AI Trust Engine — Provider-Agnostic Facade
//
// IMPORTANT: AI only ANALYZES, SUMMARIZES, RECOMMENDS, FLAGS.
// It NEVER manipulates fund states, approves payments,
// releases funds, or resolves disputes.
//
// Financial decisions remain exclusively in the KEYStone
// deterministic rule engine (src/store).
// ============================================================

import type { AIProvider, AIProjectInput, AIAnalysis, AIMilestoneSet, AIRequirementArea } from './types';
import { mockProvider } from './mockProvider';

// ---- Provider Selection ----
// Reads VITE_AI_PROVIDER from environment.
// Defaults to 'mock' so no API key is ever required for demo.
// To add a real provider: implement the AIProvider interface
// in a new file and add it to the map below.

const AI_PROVIDER = (import.meta.env.VITE_AI_PROVIDER as string) ?? 'mock';

function getProvider(): AIProvider {
  switch (AI_PROVIDER) {
    case 'mock':
    default:
      return mockProvider;
    // Future providers (connect via backend to avoid exposing keys):
    // case 'gemini': return geminiProvider;
    // case 'openai': return openaiProvider;
  }
}

const provider = getProvider();

// ============================================================
// Public API — use these in React components, never call
// providers directly.
// ============================================================

/**
 * Analyzes a project for risk, missing requirements, and recommendations.
 * Returns an AIAnalysis object. Does NOT touch fund states.
 */
export async function analyzeProject(input: AIProjectInput): Promise<AIAnalysis> {
  return provider.analyzeProject(input);
}

/**
 * Generates smart milestones based on project details.
 * Returns suggested milestone breakdowns. User must accept/edit.
 */
export async function generateMilestones(input: AIProjectInput): Promise<AIMilestoneSet> {
  return provider.generateMilestones(input);
}

/**
 * Analyzes a project description for missing or ambiguous requirements.
 */
export async function analyzeRequirements(input: AIProjectInput): Promise<AIRequirementArea[]> {
  return provider.analyzeRequirements(input);
}

/**
 * Generates a human-readable risk summary paragraph.
 */
export async function generateRiskSummary(input: AIProjectInput): Promise<string> {
  return provider.generateRiskSummary(input);
}

export type { AIProjectInput, AIAnalysis, AIMilestoneSet, AIRequirementArea };
export type { AIRisk, AIRiskLevel, AIMilestone, AIHealthItem, AIHealthStatus, AIScoreBreakdown } from './types';
