import React from 'react';
import { ShieldCheck, Lock, Banknote, RefreshCw } from 'lucide-react';
import { useProjectStore } from '../../store';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';

export const AdminFundsPage: React.FC = () => {
  const { projects } = useProjectStore();

  const custody = projects.reduce((acc, p) => acc + p.amountInCustody, 0);
  const frozen = projects.reduce((acc, p) => acc + p.amountFrozen, 0);
  const withdrawable = projects.reduce((acc, p) => acc + p.amountWithdrawable, 0);
  const refunded = projects.reduce((acc, p) => acc + p.amountRefunded, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            Platform Vault Control & Reserves
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time audit of all platform-controlled liquidity and escrow accounts.</p>
        </div>
      </div>

      <FundLifecycleVisualizer
        currentState="IN_CUSTODY"
        amountCustody={custody}
        amountFrozen={frozen}
        amountWithdrawable={withdrawable}
        totalBudget={custody + frozen + withdrawable}
      />

      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">In Custody</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{custody.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Frozen</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{frozen.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Withdrawable</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{withdrawable.toLocaleString()}</span>
        </div>

        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Refunded Volume</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{refunded.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
