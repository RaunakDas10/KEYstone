import React from 'react';
import { Flag } from 'lucide-react';
import { useProjectStore } from '../../store';

export const AdminReportsPage: React.FC = () => {
  const reports = useProjectStore((state) => state.reports);
  return <div className="space-y-6"><div><h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2"><Flag className="w-7 h-7 text-rose-400" /> Reports Queue</h1><p className="text-xs text-slate-400 mt-1">Review conduct and safety reports submitted by clients and freelancers.</p></div><div className="space-y-3">{reports.map((report) => <div key={report.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5"><div className="flex justify-between gap-4"><div><h3 className="text-sm font-bold text-white">{report.targetName}</h3><p className="text-xs text-slate-400 mt-1">Reported by {report.reporterName} ({report.reporterRole})</p></div><span className="text-[10px] uppercase font-bold text-amber-400">{report.status}</span></div><p className="text-sm text-slate-300 mt-4">{report.description}</p><p className="text-[10px] text-slate-500 mt-3">{new Date(report.createdAt).toLocaleString()}</p></div>)}{!reports.length && <div className="text-center text-sm text-slate-500 py-16">No reports in the queue.</div>}</div></div>;
};
