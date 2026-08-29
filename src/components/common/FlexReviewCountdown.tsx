import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface FlexReviewCountdownProps {
  submittedAt: string;
  reviewDays?: number;
  reviewDueAt?: string;
  milestoneTitle?: string;
  milestoneAmount?: number;
  isClientView?: boolean;
  status: string;
}

export const FlexReviewCountdown: React.FC<FlexReviewCountdownProps> = ({
  submittedAt,
  reviewDays = 7,
  reviewDueAt,
  milestoneTitle,
  milestoneAmount,
  isClientView = false,
  status,
}) => {
  const calculateDeadline = () => {
    if (reviewDueAt) return new Date(reviewDueAt).getTime();
    const start = new Date(submittedAt).getTime();
    return start + reviewDays * 24 * 60 * 60 * 1000;
  };

  const deadlineMs = calculateDeadline();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalDurationMs = Math.max(1000, reviewDays * 24 * 60 * 60 * 1000);
  const remainingMs = Math.max(0, deadlineMs - now);
  const elapsedMs = Math.min(totalDurationMs, totalDurationMs - remainingMs);
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));

  const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
  const daysRemaining = Math.floor(totalHours / 24);
  const hoursRemaining = totalHours % 24;
  const minutesRemaining = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
  const secondsRemaining = Math.floor((remainingMs % (1000 * 60)) / 1000);

  const isExpired = remainingMs <= 0;
  const isApproved = status === 'approved';

  if (isApproved) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">Checkpoint Approved & Payout Unlocked</span>
        </div>
        <Badge variant="emerald">Completed</Badge>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-slate-900/90 to-slate-950 p-5 space-y-4 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-amber-500/20 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">Flex-Review Timeline</span>
              <span className="rounded-md bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 text-[10px] font-bold text-amber-300">
                {reviewDays}-Day Window
              </span>
            </div>
            <h4 className="text-sm font-bold text-white mt-0.5">
              {milestoneTitle || 'Milestone Checkpoint Demo'}
            </h4>
          </div>
        </div>

        {milestoneAmount && (
          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Vault Amount Frozen</span>
            <span className="text-sm font-bold font-mono text-emerald-400">₹{milestoneAmount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Countdown Digits */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <span className="block font-mono text-xl sm:text-2xl font-black text-amber-400">{daysRemaining}</span>
          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500">Days</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <span className="block font-mono text-xl sm:text-2xl font-black text-amber-400">{String(hoursRemaining).padStart(2, '0')}</span>
          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500">Hours</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <span className="block font-mono text-xl sm:text-2xl font-black text-amber-400">{String(minutesRemaining).padStart(2, '0')}</span>
          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500">Mins</span>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-950/80 p-2.5">
          <span className="block font-mono text-xl sm:text-2xl font-black text-amber-400">{String(secondsRemaining).padStart(2, '0')}</span>
          <span className="block text-[9px] uppercase tracking-wider font-bold text-slate-500">Secs</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
          <span>Submitted {new Date(submittedAt).toLocaleDateString()}</span>
          <span>Auto-Approval Due: {new Date(deadlineMs).toLocaleDateString()} {new Date(deadlineMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* USP Context Message */}
      <div className="rounded-xl border border-amber-500/20 bg-slate-950/70 p-3 text-[11px] leading-relaxed text-slate-300">
        <div className="flex items-start gap-2">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-amber-300">Dynamic Auto-Approval Policy: </strong>
            {isClientView ? (
              <span>
                You have <strong>{reviewDays} days</strong> to evaluate this working demo. If you are satisfied, click <em>Approve Checkpoint</em> to release funds. If no feedback or dispute is raised by the deadline, funds will automatically transfer to the freelancer.
              </span>
            ) : (
              <span>
                Your client has a customized <strong>{reviewDays}-day Flex-Review window</strong> to test your demo. If the client goes unresponsive and does not request revisions or open a dispute, escrow funds will auto-release to you.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
