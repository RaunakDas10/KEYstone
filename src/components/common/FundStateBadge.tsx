import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, RefreshCw, AlertCircle, Banknote } from 'lucide-react';
import { FundState } from '../../types';

export interface FundStateBadgeProps {
  state: FundState;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

export const FundStateBadge: React.FC<FundStateBadgeProps> = ({ state, size = 'md', showDetails = false }) => {
  const config = {
    IN_CUSTODY: {
      label: 'Funds Secured',
      tag: 'In Custody',
      icon: ShieldCheck,
      bgColor: 'bg-blue-500/15',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/30',
      description: 'Funds locked in platform custody. Freelancer cannot withdraw yet.',
    },
    FROZEN: {
      label: 'Funds Frozen',
      tag: 'Frozen',
      icon: Lock,
      bgColor: 'bg-amber-500/15',
      textColor: 'text-amber-400',
      borderColor: 'border-amber-500/30',
      description: 'Demo submitted. Funds temporarily frozen while client reviews deliverable.',
    },
    WITHDRAWABLE: {
      label: 'Withdrawable',
      tag: 'Withdrawable',
      icon: CheckCircle2,
      bgColor: 'bg-emerald-500/15',
      textColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/30',
      description: 'Checkpoint approved! Funds are available for immediate freelancer payout.',
    },
    REFUNDED: {
      label: 'Refunded',
      tag: 'Refunded',
      icon: RefreshCw,
      bgColor: 'bg-rose-500/15',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/30',
      description: '90/10 Resolution executed. 90% returned to client.',
    },
    PAID: {
      label: 'Payout Completed',
      tag: 'Paid Out',
      icon: Banknote,
      bgColor: 'bg-purple-500/15',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/30',
      description: 'Funds withdrawn to freelancer bank account.',
    },
    DISPUTED: {
      label: 'Under Governance Review',
      tag: 'Disputed',
      icon: AlertCircle,
      bgColor: 'bg-rose-500/20',
      textColor: 'text-rose-400',
      borderColor: 'border-rose-500/40',
      description: 'Dispute opened. Funds held safely in vault until admin resolution.',
    },
  };

  const item = config[state] || config.IN_CUSTODY;
  const Icon = item.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold gap-1.5',
    md: 'px-3 py-1 text-xs font-semibold gap-2',
    lg: 'px-4 py-2 text-sm font-semibold gap-2.5',
  };

  return (
    <div className="inline-flex flex-col gap-1">
      <span
        className={`inline-flex items-center rounded-full border ${item.bgColor} ${item.textColor} ${item.borderColor} ${sizeClasses[size]}`}
      >
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : size === 'md' ? 'w-4 h-4' : 'w-5 h-5'} />
        <span>{item.tag}</span>
      </span>

      {showDetails && (
        <p className="text-[11px] text-slate-400 mt-1 max-w-xs leading-relaxed">{item.description}</p>
      )}
    </div>
  );
};
