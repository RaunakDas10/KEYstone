import React, { useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Download, Filter, Receipt, Search, ShieldCheck } from 'lucide-react';
import { useAuthStore, useLedgerStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';

const money = (value: number) => `₹${value.toLocaleString()}`;

export const TransactionsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const projects = useProjectStore((state) => state.projects);
  const entries = useLedgerStore((state) => state.entries);
  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('ALL');
  const [stateFilter, setStateFilter] = useState('ALL');

  const userProjects = useMemo(() => projects.filter((project) => currentUser.role === 'client' ? project.clientId === currentUser.id : project.freelancerId === currentUser.id), [projects, currentUser.id, currentUser.role]);
  const projectIds = useMemo(() => new Set(userProjects.map((project) => project.id)), [userProjects]);
  const userEntries = useMemo(() => entries.filter((entry) => projectIds.has(entry.projectId)), [entries, projectIds]);
  const filteredEntries = useMemo(() => userEntries.filter((entry) => {
    const query = search.toLowerCase().trim();
    const matchesSearch = !query || `${entry.projectTitle} ${entry.eventType} ${entry.referenceId} ${entry.actorName}`.toLowerCase().includes(query);
    const matchesEvent = eventFilter === 'ALL' || entry.eventType === eventFilter;
    const matchesState = stateFilter === 'ALL' || entry.newState === stateFilter;
    return matchesSearch && matchesEvent && matchesState;
  }), [userEntries, search, eventFilter, stateFilter]);

  const deposited = userEntries.filter((entry) => entry.eventType === 'FUND_DEPOSITED').reduce((sum, entry) => sum + entry.amount, 0);
  const released = userEntries.filter((entry) => ['FUNDS_RELEASED', 'PAYOUT_WITHDRAWN', 'AUTO_UNLOCK_EXECUTED'].includes(entry.eventType)).reduce((sum, entry) => sum + entry.amount, 0);
  const refunded = userEntries.filter((entry) => ['FUNDS_REFUNDED', 'RESOLUTION_90_10_EXECUTED'].includes(entry.eventType)).reduce((sum, entry) => sum + entry.amount, 0);

  const exportCsv = () => {
    const rows = [['Date', 'Project', 'Event', 'Amount', 'Previous state', 'New state', 'Reference'], ...filteredEntries.map((entry) => [entry.timestamp, entry.projectTitle, entry.eventType, String(entry.amount), entry.previousState, entry.newState, entry.referenceId])];
    const blob = new Blob([rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${currentUser.role}-transactions.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <div className="mx-auto max-w-7xl space-y-8"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">Financial history</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white sm:text-3xl"><Receipt className="h-7 w-7 text-blue-400" /> Transactions</h1><p className="mt-1 text-xs text-slate-400">Review every deposit, custody transition, release, refund, and payout connected to your projects.</p></div><Button variant="outline" size="sm" onClick={exportCsv} leftIcon={<Download className="h-4 w-4" />}>Export CSV</Button></div>
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4"><Summary label={currentUser.role === 'client' ? 'Funds deposited' : 'Funding received'} value={money(deposited)} tone="blue" /><Summary label="Funds released" value={money(released)} tone="emerald" /><Summary label="Refunds" value={money(refunded)} tone="amber" /><Summary label="Tracked projects" value={String(userProjects.length)} tone="slate" /></div>
    <div className="rounded-3xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl"><div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex items-center gap-2 text-sm font-bold text-white"><Filter className="h-4 w-4 text-blue-400" /> Filter transactions</div><div className="flex flex-col gap-2 sm:flex-row"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search project or reference" className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white sm:w-64" /></div><select value={eventFilter} onChange={(event) => setEventFilter(event.target.value)} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300"><option value="ALL">All activity</option><option value="FUND_DEPOSITED">Deposits</option><option value="FUNDS_RELEASED">Releases</option><option value="PAYOUT_WITHDRAWN">Payouts</option><option value="DISPUTE_OPENED">Disputes</option></select><select value={stateFilter} onChange={(event) => setStateFilter(event.target.value)} className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-slate-300"><option value="ALL">All states</option><option value="IN_CUSTODY">In custody</option><option value="FROZEN">Frozen</option><option value="WITHDRAWABLE">Withdrawable</option><option value="PAID">Paid</option><option value="REFUNDED">Refunded</option></select></div></div></div>
    <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/90 shadow-xl"><table className="w-full min-w-[800px] text-left text-xs text-slate-300"><thead className="border-b border-slate-800 bg-slate-950/70 text-[10px] uppercase tracking-wider text-slate-400"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Project</th><th className="px-5 py-4">Activity</th><th className="px-5 py-4 text-right">Amount</th><th className="px-5 py-4">State</th><th className="px-5 py-4">Reference</th></tr></thead><tbody className="divide-y divide-slate-800/70">{filteredEntries.map((entry) => <tr key={entry.id} className="hover:bg-slate-950/50"><td className="whitespace-nowrap px-5 py-4 text-slate-400">{new Date(entry.timestamp).toLocaleString()}</td><td className="px-5 py-4"><p className="font-semibold text-white">{entry.projectTitle}</p><p className="mt-1 text-[10px] text-slate-500">By {entry.actorName}</p></td><td className="px-5 py-4"><span className="font-semibold text-slate-200">{entry.eventType.replaceAll('_', ' ')}</span><p className="mt-1 max-w-xs text-[10px] text-slate-500">{entry.notes || 'Protocol transaction recorded.'}</p></td><td className="whitespace-nowrap px-5 py-4 text-right font-mono font-bold text-white">{money(entry.amount)}</td><td className="whitespace-nowrap px-5 py-4"><span className="text-slate-500">{entry.previousState}</span><span className="mx-1 text-blue-400">→</span><span className="font-semibold text-emerald-400">{entry.newState}</span></td><td className="whitespace-nowrap px-5 py-4 font-mono text-[10px] text-slate-500">{entry.referenceId}</td></tr>)}</tbody></table>{!filteredEntries.length && <div className="px-5 py-16 text-center text-sm text-slate-500">No transactions match these filters.</div>}<div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-[11px] text-slate-500"><span className="flex items-center gap-1.5 text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" /> Verified ledger records</span><span>{filteredEntries.length} shown</span></div></div>
  </div>;
};

const Summary: React.FC<{ label: string; value: string; tone: 'blue' | 'emerald' | 'amber' | 'slate' }> = ({ label, value, tone }) => <div className={`rounded-2xl border p-5 shadow-xl ${tone === 'blue' ? 'border-blue-500/30 bg-blue-500/5' : tone === 'emerald' ? 'border-emerald-500/30 bg-emerald-500/5' : tone === 'amber' ? 'border-amber-500/30 bg-amber-500/5' : 'border-slate-800 bg-slate-900/90'}`}><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span><span className="mt-1 block font-mono text-xl font-black text-white">{value}</span></div>;