import React, { useState } from 'react';
import { Flag, Send } from 'lucide-react';
import { useProjectStore } from '../../store';
import { SEED_USERS } from '../../mock/seedData';
import { Button } from '../../components/ui/Button';

export const AdminReportsPage: React.FC = () => {
  const { reports, sendUserWarning } = useProjectStore();
  const [warningReportId, setWarningReportId] = useState<string | null>(null);
  const [warningText, setWarningText] = useState('Please follow KEYStone conduct and communication policies.');
  const sortedReports = [...reports].sort((a, b) => Number(a.status !== 'open') - Number(b.status !== 'open') || b.createdAt.localeCompare(a.createdAt));
  const submitWarning = (report: (typeof reports)[number]) => {
    const target = Object.values(SEED_USERS).find((user) => user.id === report.targetId);
    if (target) sendUserWarning(target, warningText);
    setWarningReportId(null);
  };
  return <div className="space-y-6"><div><h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2"><Flag className="w-7 h-7 text-rose-400" /> Reports Queue</h1><p className="text-xs text-slate-400 mt-1">Open reports are prioritized first. Amber indicates an open report; emerald indicates reviewed or resolved.</p></div><div className="space-y-3">{sortedReports.map((report) => { const isOpen = report.status === 'open'; return <div key={report.id} className={`border rounded-2xl p-5 ${isOpen ? 'bg-rose-500/5 border-rose-500/40' : 'bg-emerald-500/5 border-emerald-500/30'}`}><div className="flex justify-between gap-4"><div><h3 className="text-sm font-bold text-white">{report.targetName}</h3><p className="text-xs text-slate-400 mt-1">Reported by {report.reporterName} ({report.reporterRole})</p></div><span className={`text-[10px] uppercase font-bold ${isOpen ? 'text-rose-400' : 'text-emerald-400'}`}>{report.status}</span></div><p className="text-sm text-slate-300 mt-4">{report.description}</p><div className="flex items-center justify-between mt-3"><p className="text-[10px] text-slate-500">{new Date(report.createdAt).toLocaleString()}</p><Button variant="outline" size="sm" leftIcon={<Send className="w-3.5 h-3.5" />} onClick={() => setWarningReportId(report.id)}>Send warning</Button></div>{warningReportId === report.id && <div className="mt-4 flex gap-2"><input value={warningText} onChange={(event) => setWarningText(event.target.value)} className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-white" /><Button variant="danger" size="sm" onClick={() => submitWarning(report)}>Send</Button></div>}</div>; })}{!reports.length && <div className="text-center text-sm text-slate-500 py-16">No reports in the queue.</div>}</div></div>;
};
