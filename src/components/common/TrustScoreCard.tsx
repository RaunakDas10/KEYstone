import React from 'react';
import { ShieldCheck, Award, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { User } from '../../types';

export interface TrustScoreCardProps {
  user: User;
  className?: string;
}

export const TrustScoreCard: React.FC<TrustScoreCardProps> = ({ user, className = '' }) => {
  const score = user.trustScore || 98;
  const onTime = user.onTimeRate || 96;
  const completion = user.completionRate || 98;
  const dispute = user.disputeRate || 1;

  let ratingLabel = 'Excellent';
  let ratingColor = 'text-emerald-400';
  let ringColor = 'border-emerald-500';

  if (score >= 90) {
    ratingLabel = 'Excellent';
    ratingColor = 'text-emerald-400';
    ringColor = 'border-emerald-500';
  } else if (score >= 75) {
    ratingLabel = 'Good';
    ratingColor = 'text-blue-400';
    ringColor = 'border-blue-500';
  } else {
    ratingLabel = 'Average';
    ratingColor = 'text-amber-400';
    ringColor = 'border-amber-500';
  }

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-400" />
          <h4 className="text-sm font-bold text-white tracking-tight">KEYStone Trust Profile</h4>
        </div>
        {user.verified && (
          <span className="text-[11px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
            <Award className="w-3 h-3" />
            Verified Talent
          </span>
        )}
      </div>

      {/* Main Score & Radial */}
      <div className="flex items-center gap-6 mb-6">
        <div className={`relative w-20 h-20 rounded-full border-4 ${ringColor} flex items-center justify-center bg-slate-950/60 shadow-lg shrink-0`}>
          <div className="text-center">
            <span className="text-2xl font-black text-white leading-none tracking-tight">{score}</span>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">/ 100</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-extrabold ${ratingColor}`}>{ratingLabel}</span>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">Tier 1</span>
          </div>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            High integrity score calculated from on-time delivery, zero ghosting history, and verified milestone submissions.
          </p>
        </div>
      </div>

      {/* Detailed Metrics Breakdown */}
      <div className="grid grid-cols-3 gap-3 bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/60 text-center">
        <div>
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[11px] font-medium">On-Time</span>
          </div>
          <span className="text-base font-bold text-white font-mono">{onTime}%</span>
        </div>

        <div className="border-x border-slate-800/80 px-2">
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-medium">Completion</span>
          </div>
          <span className="text-base font-bold text-white font-mono">{completion}%</span>
        </div>

        <div>
          <div className="flex items-center justify-center gap-1 text-slate-400 mb-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-medium">Dispute Rate</span>
          </div>
          <span className="text-base font-bold text-white font-mono">{dispute}%</span>
        </div>
      </div>
    </div>
  );
};
