import React, { useState } from 'react';
import { Wallet, Banknote, ShieldCheck, CheckCircle2, ArrowDownLeft, ArrowUpRight, Lock } from 'lucide-react';
import { useProjectStore, useLedgerStore, useAuthStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LedgerTable } from '../../components/common/LedgerTable';

export const FreelancerIncomePage: React.FC = () => {
  const { projects } = useProjectStore();
  const { entries } = useLedgerStore();
  const { currentUser } = useAuthStore();
  const { withdrawPayout } = useProjectStore();

  const withdrawable = projects.reduce((acc, p) => acc + p.amountWithdrawable, 0);
  const custody = projects.reduce((acc, p) => acc + p.amountInCustody, 0);
  const frozen = projects.reduce((acc, p) => acc + p.amountFrozen, 0);
  const totalEarned = projects.reduce((acc, p) => acc + p.amountPaid + p.amountWithdrawable + p.amountFrozen, 0);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(withdrawable || 50000);
  const [payoutMethod, setPayoutMethod] = useState('bank');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleExecuteWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawPayout(withdrawAmount, currentUser, payoutMethod)) return;
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsWithdrawModalOpen(false);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Earnings & Payout Vault</h1>
          <p className="text-xs text-slate-400 mt-1">Manage withdrawable balance and inspect income custody status.</p>
        </div>

        <Button
          variant="emerald"
          size="lg"
          onClick={() => setIsWithdrawModalOpen(true)}
          leftIcon={<Banknote className="w-5 h-5" />}
        >
          Withdraw ₹{withdrawable.toLocaleString()}
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl glow-emerald">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Withdrawable Balance</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{withdrawable.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-300 mt-1 block">Unlocked & Ready</span>
        </div>

        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">In Platform Custody</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{custody.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Guaranteed Deposit</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Frozen in Review</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{frozen.toLocaleString()}</span>
          <span className="text-[10px] text-amber-300 mt-1 block">Checkpoint Submitted</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Lifetime Volume</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{totalEarned.toLocaleString()}</span>
          <span className="text-[10px] text-purple-400 mt-1 block">Zero Default History</span>
        </div>
      </div>

      {/* Visual Earnings Distribution Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white">Vault Fund Distribution</h3>

        <div className="h-6 w-full bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
          <div className="bg-emerald-500 h-full w-[45%]" title="Withdrawable" />
          <div className="bg-amber-500 h-full w-[30%]" title="Frozen" />
          <div className="bg-blue-500 h-full w-[25%]" title="In Custody" />
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Withdrawable (45%)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" /> Frozen in Review (30%)
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Secured in Custody (25%)
          </span>
        </div>
      </div>

      {/* Income Transaction Ledger */}
      <LedgerTable entries={entries} />

      {/* WITHDRAWAL MODAL */}
      <Modal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        title="Withdraw Payout Funds"
        subtitle="Direct bank transfer or UPI payout powered by KEYStone Payout Engine."
      >
        {isSuccess ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Payout Initiated Successfully!</h4>
            <p className="text-xs text-slate-400">
              ₹{withdrawAmount.toLocaleString()} has been transferred to your linked bank account. Reference ID: TXN_PAYOUT_{Date.now()}
            </p>
          </div>
        ) : (
          <form onSubmit={handleExecuteWithdrawal} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Amount to Withdraw (₹)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                max={withdrawable}
                required
                className="w-full bg-slate-950 border border-slate-800 text-white text-base font-bold font-mono rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Payout Destination</label>
              <select
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-3 focus:outline-none focus:border-blue-500"
              >
                <option value="bank">HDFC Bank •••• 8821 (IMPS / NEFT)</option>
                <option value="upi">UPI ID: ananya@upi (Instant Payout)</option>
              </select>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 text-[11px]">
              🔒 Instant payout settlement with zero withdrawal fees.
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsWithdrawModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="emerald" size="md" type="submit">
                Execute Withdrawal
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
