import React from 'react';
import { ShieldCheck, Hash, Lock, CheckCircle2, FileText, AlertTriangle } from 'lucide-react';
import { LedgerTable } from '../../components/common/LedgerTable';
import { SEED_LEDGER_ENTRIES } from '../../mock/seedData';

export const SecurityPage: React.FC = () => {
  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            Security & Governance Architecture
          </span>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight">
            Built on Immutable Proof
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
            KEYStone eliminates arbitrary payment decisions by recording all state transitions in an append-only audit ledger backed by strict protocol rules.
          </p>
        </div>

        {/* Security Pillars */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            <h3 className="text-base font-bold text-white">Platform-Controlled Escrow</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              100% of project funds are deposited upfront. Neither client nor freelancer can unilaterally move funds outside platform protocol rules.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <Hash className="w-8 h-8 text-purple-400" />
            <h3 className="text-base font-bold text-white">Cryptographic Audit Ledger</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every deposit, demo submission, freeze, and payout produces a hash-linked ledger event recorded in an append-only sequence.
            </p>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-3">
            <Lock className="w-8 h-8 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Automated Governance</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inactivity timers, 90/10 resolution formulas, and checkpoint rules execute deterministically to ensure fairness.
            </p>
          </div>
        </div>

        {/* Live Ledger Demonstration */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Live Append-Only Ledger Demonstration</h3>
          <LedgerTable entries={SEED_LEDGER_ENTRIES} showSearch={false} />
        </div>
      </div>
    </div>
  );
};
