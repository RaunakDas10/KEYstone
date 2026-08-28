import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  LayoutList,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  ArrowRight,
  Info,
} from 'lucide-react';
import { analyzeProject } from '../../services/ai/aiService';
import type { AIAnalysis, AIProjectInput, AIRequirementArea } from '../../services/ai/aiService';
import { Button } from '../ui/Button';
import { MissingRequirementsModal } from './MissingRequirementsModal';

interface AIAnalysisPanelProps {
  projectInput: AIProjectInput;
  onContinue: (analysis: AIAnalysis, resolvedRequirements: AIRequirementArea[]) => void;
  onSkip: () => void;
}

type LoadingStage = 'reading' | 'scope' | 'timeline' | 'budget' | 'recommendations' | 'done';

const loadingStages: { key: LoadingStage; label: string; ms: number }[] = [
  { key: 'reading', label: 'Reading project requirements', ms: 400 },
  { key: 'scope', label: 'Checking scope complexity', ms: 800 },
  { key: 'timeline', label: 'Evaluating timeline feasibility', ms: 1200 },
  { key: 'budget', label: 'Reviewing budget adequacy', ms: 1600 },
  { key: 'recommendations', label: 'Generating recommendations', ms: 2000 },
];

const riskLevelConfig = {
  LOW: { label: 'LOW RISK', className: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', bar: 'bg-emerald-500' },
  MODERATE: { label: 'MODERATE RISK', className: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', bar: 'bg-amber-500' },
  HIGH: { label: 'HIGH RISK', className: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', bar: 'bg-rose-500' },
  CRITICAL: { label: 'CRITICAL RISK', className: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', bar: 'bg-red-500' },
};

const severityConfig = {
  critical: { icon: '🔴', color: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/25' },
  high: { icon: '🔴', color: 'text-rose-400', bg: 'bg-rose-500/8', border: 'border-rose-500/25' },
  medium: { icon: '🟠', color: 'text-amber-400', bg: 'bg-amber-500/8', border: 'border-amber-500/25' },
  low: { icon: '🟡', color: 'text-yellow-400', bg: 'bg-yellow-500/8', border: 'border-yellow-500/25' },
};

const healthStatusConfig = {
  healthy: { icon: '🟢', label: 'Healthy' },
  warning: { icon: '🟠', label: 'Needs Attention' },
  critical: { icon: '🔴', label: 'Critical' },
};

function ScoreBar({ label, score, icon }: { label: string; score: number; icon: React.ReactNode }) {
  const color = score >= 65 ? 'bg-emerald-500' : score >= 40 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">{icon}</span>
          <span className="text-xs text-slate-300">{label}</span>
        </div>
        <span className="text-xs font-bold font-mono text-white">{score}%</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

export const AIAnalysisPanel: React.FC<AIAnalysisPanelProps> = ({ projectInput, onContinue, onSkip }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [currentStage, setCurrentStage] = useState<LoadingStage | null>(null);
  const [completedStages, setCompletedStages] = useState<LoadingStage[]>([]);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedRisks, setExpandedRisks] = useState<Set<string>>(new Set());
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [resolvedRequirements, setResolvedRequirements] = useState<AIRequirementArea[]>([]);
  const [recommendationsApplied, setRecommendationsApplied] = useState(false);

  const runAnalysis = async () => {
    setStatus('loading');
    setCompletedStages([]);
    setCurrentStage(null);
    setError(null);

    // Animate stages
    for (const stage of loadingStages) {
      await new Promise<void>((r) => setTimeout(r, stage.ms - (loadingStages[loadingStages.indexOf(stage) - 1]?.ms ?? 0)));
      setCurrentStage(stage.key);
      setCompletedStages((prev) => [...prev, stage.key]);
    }

    try {
      const result = await analyzeProject(projectInput);
      setAnalysis(result);
      setResolvedRequirements(result.missingRequirements);
      setStatus('done');
    } catch {
      setError('AI analysis is temporarily unavailable. You can continue manually.');
      setStatus('error');
    }
  };

  const toggleRisk = (id: string) => {
    setExpandedRisks((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleApplyRecommendations = () => {
    setRecommendationsApplied(true);
  };

  const handleContinue = () => {
    if (analysis) {
      onContinue(analysis, resolvedRequirements);
    }
  };

  const resolvedCount = resolvedRequirements.filter((r) => r.resolved).length;
  const remainingIssues = analysis ? Math.max(0, analysis.issueCount - resolvedCount) : 0;

  return (
    <div className="space-y-6">
      {/* AI Panel Header */}
      <div className="bg-slate-900/90 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">KEYStone AI</span>
            </div>
            <h2 className="text-xl font-bold text-white">AI Project Analysis</h2>
            <p className="text-xs text-slate-400 mt-1">Let's make your project clearer before work begins. Prevent disputes before they start.</p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {status === 'idle' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300">KEYStone AI will analyze:</p>
              <div className="grid grid-cols-2 gap-1">
                {['Project title & description', 'Scope complexity', 'Budget adequacy', 'Timeline feasibility', 'Missing requirements', 'Risk factors'].map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-indigo-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="md"
                onClick={runAnalysis}
                leftIcon={<Sparkles className="w-4 h-4" />}
                className="flex-1"
              >
                Analyze with KEYStone AI
              </Button>
              <Button variant="outline" size="md" onClick={onSkip}>
                Skip AI — Continue Manually
              </Button>
            </div>

            <p className="text-[11px] text-slate-500 text-center">AI assists your decision. You remain in control.</p>
          </div>
        )}

        {status === 'loading' && (
          <div className="space-y-4">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <p className="text-xs font-semibold text-slate-300">KEYStone AI is reviewing your project...</p>
              <div className="space-y-2.5">
                {loadingStages.map((stage) => {
                  const isDone = completedStages.includes(stage.key);
                  const isCurrent = currentStage === stage.key && !isDone;
                  return (
                    <div key={stage.key} className="flex items-center gap-2.5">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-slate-700 shrink-0" />
                      )}
                      <span className={`text-xs ${isDone ? 'text-slate-400 line-through' : isCurrent ? 'text-white font-semibold' : 'text-slate-600'}`}>
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4">
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-rose-300">AI analysis is temporarily unavailable.</p>
                <p className="text-xs text-slate-400 mt-1">{error}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={runAnalysis} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Try Again</Button>
              <Button variant="primary" size="sm" onClick={onSkip}>Continue Without AI</Button>
            </div>
          </div>
        )}
      </div>

      {/* ---- ANALYSIS RESULTS ---- */}
      {status === 'done' && analysis && (
        <>
          {/* Risk Score Card */}
          <div className={`rounded-3xl border p-6 sm:p-8 space-y-6 shadow-xl ${riskLevelConfig[analysis.riskLevel].bg} ${riskLevelConfig[analysis.riskLevel].border}`}>
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              {/* Score */}
              <div className="text-center sm:text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Project Risk Score</p>
                <p className={`text-6xl font-black font-mono ${riskLevelConfig[analysis.riskLevel].className}`}>
                  {analysis.riskScore}
                  <span className="text-2xl text-slate-500">/100</span>
                </p>
                <span className={`inline-block mt-2 px-3 py-1 rounded-xl text-xs font-bold border ${riskLevelConfig[analysis.riskLevel].bg} ${riskLevelConfig[analysis.riskLevel].border} ${riskLevelConfig[analysis.riskLevel].className}`}>
                  {riskLevelConfig[analysis.riskLevel].label}
                </span>
              </div>

              {/* Score Breakdown */}
              <div className="flex-1 space-y-3">
                <ScoreBar label="Scope Clarity" score={analysis.scoreBreakdown.scopeClarity} icon={<LayoutList className="w-3.5 h-3.5" />} />
                <ScoreBar label="Budget Adequacy" score={analysis.scoreBreakdown.budgetAdequacy} icon={<DollarSign className="w-3.5 h-3.5" />} />
                <ScoreBar label="Timeline Feasibility" score={analysis.scoreBreakdown.timelineFeasibility} icon={<Clock className="w-3.5 h-3.5" />} />
                <ScoreBar label="Requirement Completeness" score={analysis.scoreBreakdown.requirementCompleteness} icon={<FileText className="w-3.5 h-3.5" />} />
                <ScoreBar label="Milestone Quality" score={analysis.scoreBreakdown.milestoneQuality} icon={<TrendingUp className="w-3.5 h-3.5" />} />
              </div>
            </div>

            {/* Confidence */}
            <div className="flex items-start gap-2 p-3 bg-slate-900/60 border border-slate-700/50 rounded-xl">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-400">
                <strong className="text-white">AI Confidence: {analysis.confidence}%</strong> — Reflects how complete and consistent the provided project information is. Not a guarantee of project success.
              </p>
            </div>
          </div>

          {/* Risk Cards */}
          {analysis.risks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Risk Findings ({analysis.risks.length})
              </h3>
              {analysis.risks.map((risk) => {
                const sev = severityConfig[risk.severity];
                const isExpanded = expandedRisks.has(risk.id);
                return (
                  <div key={risk.id} className={`rounded-2xl border p-4 space-y-2 ${sev.bg} ${sev.border}`}>
                    <button className="w-full text-left flex items-center justify-between gap-2" onClick={() => toggleRisk(risk.id)}>
                      <div className="flex items-center gap-2">
                        <span>{sev.icon}</span>
                        <span className={`text-xs font-bold uppercase tracking-wider ${sev.color}`}>{risk.title}</span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                    </button>
                    <p className="text-xs text-slate-300">{risk.description}</p>
                    {isExpanded && (
                      <div className="pt-2 border-t border-slate-700/50">
                        <p className="text-[11px] font-semibold text-slate-400 mb-1">Recommendation:</p>
                        <p className="text-xs text-slate-300 leading-relaxed">{risk.recommendation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Missing Requirements */}
          {analysis.missingRequirements.length > 0 && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white">AI found {analysis.missingRequirements.length} areas that need clarification.</p>
                <p className="text-xs text-slate-400 mt-0.5">{resolvedCount} of {analysis.missingRequirements.length} resolved</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsReqModalOpen(true)}
                rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Review
              </Button>
            </div>
          )}

          {/* Project Health Summary */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Project Health</h3>
            <div className="grid grid-cols-2 gap-2">
              {analysis.healthItems.map((item) => {
                const cfg = healthStatusConfig[item.status];
                return (
                  <div key={item.label} className="flex items-center gap-2">
                    <span>{cfg.icon}</span>
                    <span className="text-xs text-slate-300">{item.label}</span>
                  </div>
                );
              })}
            </div>
            <div className="pt-3 border-t border-slate-800">
              {analysis.overallHealth === 'ready' ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-emerald-400">Project looks ready for funding.</span>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-amber-400">Needs Attention</p>
                    {remainingIssues > 0 && <p className="text-xs text-slate-400 mt-0.5">Resolve {remainingIssues} issue{remainingIssues !== 1 ? 's' : ''} before funding.</p>}
                  </div>
                  {remainingIssues > 0 && (
                    <Button variant="outline" size="sm" onClick={() => setIsReqModalOpen(true)}>
                      Fix Issues
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* AI Recommendation Summary */}
          <div className="bg-indigo-950/50 border border-indigo-500/20 rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">KEYStone AI Recommendation</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">{analysis.summary}</p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              {!recommendationsApplied ? (
                <Button variant="primary" size="sm" onClick={handleApplyRecommendations} className="flex-1">
                  Apply Recommendations
                </Button>
              ) : (
                <div className="flex items-center gap-2 flex-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400 font-semibold">Recommendations noted</span>
                </div>
              )}
              <Button variant="outline" size="sm" onClick={runAnalysis} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Re-analyze
              </Button>
            </div>
          </div>

          {/* Continue Actions */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Ready to continue?</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {analysis.overallHealth === 'ready'
                  ? 'Your project structure looks solid. Continue to set your budget and milestones.'
                  : 'You can continue with the current analysis or address the flagged issues first.'}
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button variant="outline" size="sm" onClick={onSkip}>Continue Anyway</Button>
              <Button variant="primary" size="md" onClick={handleContinue} rightIcon={<ArrowRight className="w-4 h-4" />}>
                {analysis.overallHealth === 'ready' ? 'Continue to Budget' : 'Continue with Analysis'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Missing Requirements Modal */}
      {analysis && (
        <MissingRequirementsModal
          isOpen={isReqModalOpen}
          onClose={() => setIsReqModalOpen(false)}
          requirements={resolvedRequirements}
          onResolve={setResolvedRequirements}
        />
      )}
    </div>
  );
};
