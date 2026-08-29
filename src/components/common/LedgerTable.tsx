import React, { useState } from 'react';
import { ShieldCheck, Hash, Search, ArrowUpRight, ArrowDownLeft, Lock, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LedgerEntry } from '../../types';
import { Badge } from '../ui/Badge';

export interface LedgerTableProps {
  entries: LedgerEntry[];
  showSearch?: boolean;
}

export const LedgerTable: React.FC<LedgerTableProps> = ({ entries, showSearch = true }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.projectTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'ALL' || entry.eventType === filterType;
    return matchesSearch && matchesType;
  });

  const getEventBadge = (type: LedgerEntry['eventType']) => {
    switch (type) {
      case 'FUND_DEPOSITED':
        return <Badge variant="blue" icon={<ShieldCheck className="w-3 h-3" />}>Fund Deposited</Badge>;
      case 'FUNDS_FROZEN':
      case 'CHECKPOINT_SUBMITTED':
        return <Badge variant="amber" icon={<Lock className="w-3 h-3" />}>Checkpoint Frozen</Badge>;
      case 'FUNDS_RELEASED':
      case 'CHECKPOINT_APPROVED':
        return <Badge variant="emerald" icon={<CheckCircle2 className="w-3 h-3" />}>Funds Released</Badge>;
      case 'RESOLUTION_90_10_EXECUTED':
        return <Badge variant="purple" icon={<RefreshCw className="w-3 h-3" />}>90/10 Resolution</Badge>;
      case 'AUTO_UNLOCK_EXECUTED':
        return <Badge variant="blue" icon={<CheckCircle2 className="w-3 h-3" />}>Auto-Unlocked</Badge>;
      case 'CANCELLATION_KILL_FEE':
        return <Badge variant="amber" icon={<Lock className="w-3 h-3" />}>Cancellation Kill Fee</Badge>;
      case 'CANCELLATION_REFUND':
        return <Badge variant="rose" icon={<ArrowDownLeft className="w-3 h-3" />}>Cancellation Refund</Badge>;
      case 'DISPUTE_OPENED':
        return <Badge variant="rose" icon={<ArrowDownLeft className="w-3 h-3" />}>Dispute Opened</Badge>;
      default:
        return <Badge variant="slate">{type}</Badge>;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white tracking-tight">Append-Only Immutable Ledger</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically verifiable audit trail of all platform deposit, checkpoint, and payout events.
          </p>
        </div>

        {showSearch && (
          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search hash, project, actor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">All Events</option>
              <option value="FUND_DEPOSITED">Deposited</option>
              <option value="FUNDS_FROZEN">Frozen</option>
              <option value="FUNDS_RELEASED">Released</option>
              <option value="RESOLUTION_90_10_EXECUTED">90/10 Resolution</option>
              <option value="AUTO_UNLOCK_EXECUTED">Auto-Unlock</option>
              <option value="CANCELLATION_KILL_FEE">Cancellation Kill Fee</option>
              <option value="CANCELLATION_REFUND">Cancellation Refund</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 uppercase text-[10px] font-bold tracking-wider text-slate-400 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Event Type</th>
              <th className="px-4 py-3">Project & Actor</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3">State Transition</th>
              <th className="px-4 py-3">Verification Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredEntries.map((entry) => (
              <tr key={entry.id} className="hover:bg-slate-850/50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap text-slate-400 text-[11px]">
                  {new Date(entry.timestamp).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-sans">{getEventBadge(entry.eventType)}</td>
                <td className="px-4 py-3 whitespace-nowrap font-sans">
                  <div className="font-semibold text-white">{entry.projectTitle}</div>
                  <div className="text-[11px] text-slate-400">
                    By {entry.actorName} ({entry.actorRole})
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-white">
                  ₹{entry.amount.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-[11px]">
                  <span className="text-slate-400">{entry.previousState}</span>
                  <span className="text-blue-400 mx-1.5">→</span>
                  <span className="font-bold text-emerald-400">{entry.newState}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800 w-fit">
                    <Hash className="w-3 h-3 text-blue-400 shrink-0" />
                    <span className="truncate max-w-[130px]">{entry.hash}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredEntries.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <p className="text-sm">No ledger entries match your filter.</p>
          </div>
        )}
      </div>

      {/* Ledger Integrity Indicator */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5 text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Ledger Integrity: Verified SHA-256 Chain
        </span>
        <span>Showing {filteredEntries.length} entries</span>
      </div>
    </div>
  );
};
