// ============================================================
// KEYStone AI Trust Engine — Type Definitions
// AI only ANALYZES, SUMMARIZES, RECOMMENDS, FLAGS.
// It never touches fund states, payments, or resolutions.
// ============================================================

export type AIRiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type AIHealthStatus = 'healthy' | 'warning' | 'critical';

export interface AIProjectInput {
  title: string;
  description: string;
  category: string;
  skills: string[];
  budget: number;
  deadline: string; // ISO date string
  requirements?: string;
  milestones?: { title: string; amount: number; criteria?: string }[];
}

export interface AIRisk {
  id: string;
  type: 'timeline' | 'scope' | 'budget' | 'requirements' | 'technical' | 'clarity';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  recommendation: string;
}

export interface AIScoreBreakdown {
  scopeClarity: number;       // 0–100
  budgetAdequacy: number;     // 0–100
  timelineFeasibility: number; // 0–100
  requirementCompleteness: number; // 0–100
  milestoneQuality: number;   // 0–100
}

export interface AIRequirementArea {
  id: string;
  area: string;
  question: string;
  suggestions: string[];
  resolved: boolean;
  customAnswer?: string;
}

export interface AIHealthItem {
  label: string;
  status: AIHealthStatus;
}

export interface AIAnalysis {
  riskScore: number;          // 0–100
  riskLevel: AIRiskLevel;
  confidence: number;         // 0–100
  analyzedAt: string;         // ISO timestamp
  analysisVersion: string;
  summary: string;
  scoreBreakdown: AIScoreBreakdown;
  risks: AIRisk[];
  missingRequirements: AIRequirementArea[];
  recommendations: string[];
  healthItems: AIHealthItem[];
  overallHealth: 'ready' | 'needs_attention' | 'critical';
  issueCount: number;
}

export interface AIMilestoneDeliverable {
  id: string;
  description: string;
}

export interface AIMilestone {
  id: string;
  title: string;
  description: string;
  dayStart: number;
  dayEnd: number;
  suggestedAmount: number;
  deliverables: string[];
  acceptanceCriteria: string[];
}

export interface AIMilestoneSet {
  milestones: AIMilestone[];
  totalDays: number;
  totalBudget: number;
  generatedAt: string;
}

export interface AIProvider {
  analyzeProject(input: AIProjectInput): Promise<AIAnalysis>;
  generateMilestones(input: AIProjectInput): Promise<AIMilestoneSet>;
  analyzeRequirements(input: AIProjectInput): Promise<AIRequirementArea[]>;
  generateRiskSummary(input: AIProjectInput): Promise<string>;
}
