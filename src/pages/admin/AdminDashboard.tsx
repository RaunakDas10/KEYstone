import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ShieldAlert, Users, Briefcase, Lock, Banknote, History, ArrowRight } from 'lucide-react';
import { useProjectStore, useLedgerStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { LedgerTable } from '../../components/common/LedgerTable';

export const AdminDashboard: React.FC = () => {
  const { projects, disputes } = useProjectStore();
  const { entries } = useLedgerStore();

  const totalInCustody = projects.reduce((acc, p) => acc + p.amountInCustody, 0);
  const totalFrozen = projects.reduce((acc, p) => acc + p.amountFrozen, 0);
  const totalWithdrawable = projects.reduce((acc, p) => acc + p.amountWithdrawable, 0);
  const totalVolume = projects.reduce((acc, p) => acc + p.budget, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-400" />
            Governance Command Center
          </h1>
          <p className="text-xs text-slate-400 mt-1">Real-time protocol vault, dispute resolution, and ledger audit.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/disputes">
            <Button variant="danger" size="md" leftIcon={<ShieldAlert className="w-4 h-4" />}>
              Disputes Station ({disputes.length})
            </Button>
          </Link>
          <Link to="/admin/ledger">
            <Button variant="outline" size="md" leftIcon={<History className="w-4 h-4" />}>
              Full Ledger Audit
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl glow-blue">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Total Funds in Custody</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{totalInCustody.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Locked in Escrow Vault</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Frozen in Review</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{totalFrozen.toLocaleString()}</span>
          <span className="text-[10px] text-amber-300 mt-1 block">Pending Checkpoint Decision</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Withdrawable Balance</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{totalWithdrawable.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Unlocked for Payouts</span>
        </div>

        <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">Active Disputes</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{disputes.length}</span>
          <span className="text-[10px] text-rose-400 mt-1 block">Under Governance Review</span>
        </div>
      </div>

      {/* Reported Disputes Quick Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Active Dispute Queue
          </h3>
          <Link to="/admin/disputes" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
            Open Dispute Console <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] font-bold text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Project Title</th>
                <th className="p-3">Raised By</th>
                <th className="p-3">Reason</th>
                <th className="p-3 text-right">Disputed Amount</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {disputes.map((d) => (
                <tr key={d.id} className="hover:bg-slate-850">
                  <td className="p-3 font-bold text-white">{d.projectTitle}</td>
                  <td className="p-3 text-slate-400">
                    {d.raisedByName} ({d.raisedByRole})
                  </td>
                  <td className="p-3 text-slate-300 max-w-xs truncate">{d.reason}</td>
                  <td className="p-3 text-right font-mono font-bold text-rose-400">
                    ₹{d.amountInDispute.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <Link to="/admin/disputes">
                      <Button variant="outline" size="sm">
                        Inspect Audit Trail
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Append-Only Ledger Table */}
      <LedgerTable entries={entries} />
    </div>
  );
};
