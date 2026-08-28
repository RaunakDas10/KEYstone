import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { FundState } from '../../types';

export interface FundLifecycleVisualizerProps {
  currentState: FundState;
  amountCustody?: number;
  amountFrozen?: number;
  amountWithdrawable?: number;
  totalBudget?: number;
  currency?: string;
  className?: string;
}

export const FundLifecycleVisualizer: React.FC<FundLifecycleVisualizerProps> = ({
  currentState,
  amountCustody = 0,
  amountFrozen = 0,
  amountWithdrawable = 0,
  totalBudget = 0,
  currency = 'INR',
  className = '',
}) => {
  const steps = [
    {
      id: 'IN_CUSTODY',
      label: 'IN CUSTODY',
      sublabel: 'Funds Secured',
      icon: ShieldCheck,
      color: 'blue',
      amount: amountCustody,
      description: 'Client deposited 100% of project funds into platform vault.',
    },
    {
      id: 'FROZEN',
      label: 'FROZEN',
      sublabel: 'Under Checkpoint Review',
      icon: Lock,
      color: 'amber',
      amount: amountFrozen,
      description: 'Demo submitted. Funds locked during decision & evaluation.',
    },
    {
      id: 'WITHDRAWABLE',
      label: 'WITHDRAWABLE',
      sublabel: 'Available for Payout',
      icon: CheckCircle2,
      color: 'emerald',
      amount: amountWithdrawable,
      description: 'Work approved! Freelancer can withdraw instantly.',
    },
  ];

  const getStateIndex = (state: FundState) => {
    switch (state) {
      case 'IN_CUSTODY':
        return 0;
      case 'FROZEN':
        return 1;
      case 'WITHDRAWABLE':
      case 'PAID':
        return 2;
      default:
        return 0;
    }
  };

  const currentIndex = getStateIndex(currentState);

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-blue-400">KEYStone Core Protocol</span>
          <h4 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
            3-State Fund Lifecycle
          </h4>
        </div>
        {totalBudget > 0 && (
          <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs">
            <span className="text-slate-400">Total Project Vault:</span>
            <span className="font-bold text-white text-sm">₹{totalBudget.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* 3 Steps Visualization */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isActive = idx === currentIndex;
          const isPassed = idx < currentIndex;

          let cardBorder = 'border-slate-800/80 bg-slate-950/40 text-slate-400';
          let iconBg = 'bg-slate-800/60 text-slate-500';
          let badgeBg = 'bg-slate-800 text-slate-400';

          if (isActive) {
            if (step.color === 'blue') {
              cardBorder = 'border-blue-500/50 bg-blue-500/10 text-white glow-blue';
              iconBg = 'bg-blue-500 text-white';
              badgeBg = 'bg-blue-500/20 text-blue-300 border border-blue-400/30';
            } else if (step.color === 'amber') {
              cardBorder = 'border-amber-500/50 bg-amber-500/10 text-white glow-amber';
              iconBg = 'bg-amber-500 text-white';
              badgeBg = 'bg-amber-500/20 text-amber-300 border border-amber-400/30';
            } else if (step.color === 'emerald') {
              cardBorder = 'border-emerald-500/50 bg-emerald-500/10 text-white glow-emerald';
              iconBg = 'bg-emerald-500 text-white';
              badgeBg = 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30';
            }
          } else if (isPassed) {
            cardBorder = 'border-slate-700 bg-slate-900/90 text-slate-200';
            iconBg = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
            badgeBg = 'bg-emerald-500/10 text-emerald-400';
          }

          return (
            <div key={step.id} className="relative">
              <div className={`p-4 rounded-xl border transition-all duration-300 ${cardBorder}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${iconBg} transition-colors`}>
                    <Icon className="w-5 h-5" />
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeBg}`}>
                    {isPassed ? 'COMPLETED' : isActive ? 'ACTIVE STATE' : 'PENDING'}
                  </span>
                </div>

                <div className="font-bold text-sm tracking-wide text-white mb-0.5 flex items-center justify-between">
                  <span>{step.label}</span>
                  {step.amount > 0 && (
                    <span className="text-xs font-mono font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                      ₹{step.amount.toLocaleString()}
                    </span>
                  )}
                </div>

                <p className="text-[11px] font-medium text-slate-400 mb-2">{step.sublabel}</p>
                <p className="text-[11px] text-slate-400/80 leading-snug">{step.description}</p>
              </div>

              {/* Connector Arrow for Desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Bar */}
      <div className="mt-5 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          Platform Trust Protocol Active
        </span>
        <span className="font-mono text-[11px] text-slate-400">No Upfront Risk • No Ghosting</span>
      </div>
    </div>
  );
};
