import React from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Minus } from 'lucide-react';
import type { AIAnalysis } from '../../services/ai/aiService';
import { Link } from 'react-router-dom';

interface AIProjectHealthBadgeProps {
  analysis: AIAnalysis;
  projectId?: string;
  compact?: boolean;
}

const riskColors = {
  LOW: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', dot: 'bg-emerald-400' },
  MODERATE: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  HIGH: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', dot: 'bg-rose-400' },
  CRITICAL: { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30', dot: 'bg-red-500' },
};

export const AIProjectHealthBadge: React.FC<AIProjectHealthBadgeProps> = ({ analysis, projectId, compact = false }) => {
  const colors = riskColors[analysis.riskLevel];

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${colors.bg} ${colors.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
        <span className={`text-[10px] font-bold ${colors.text}`}>AI: {analysis.riskScore}/100</span>
        <span className={`text-[10px] ${colors.text} opacity-70`}>{analysis.riskLevel}</span>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${colors.bg} ${colors.border}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">✦ KEYStone AI</span>
          </div>
          <p className={`text-lg font-black font-mono mt-0.5 ${colors.text}`}>{analysis.riskScore}<span className="text-sm font-normal text-slate-500">/100</span></p>
          <p className={`text-xs font-bold ${colors.text}`}>{analysis.riskLevel} RISK</p>
        </div>
        {analysis.riskLevel === 'LOW' ? (
          <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
        ) : analysis.riskLevel === 'CRITICAL' ? (
          <AlertTriangle className="w-6 h-6 text-red-400 shrink-0" />
        ) : analysis.riskScore > 50 ? (
          <TrendingUp className="w-6 h-6 text-amber-400 shrink-0" />
        ) : (
          <Minus className="w-6 h-6 text-slate-400 shrink-0" />
        )}
      </div>

      {analysis.issueCount > 0 && (
        <p className="text-[11px] text-slate-400">{analysis.issueCount} recommendation{analysis.issueCount !== 1 ? 's' : ''} remaining</p>
      )}

      {projectId && (
        <Link to={`/client/projects/${projectId}`} className={`block text-center text-[11px] font-semibold py-1.5 rounded-xl border transition-all ${colors.border} ${colors.text} hover:bg-white/5`}>
          Review AI Analysis →
        </Link>
      )}

      <p className="text-[9px] text-slate-500">Last analyzed: {new Date(analysis.analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
    </div>
  );
};
