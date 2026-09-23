import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, ArrowRight, Banknote, BriefcaseBusiness, Clock } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { TrustScoreCard } from '../../components/common/TrustScoreCard';
import { FundStateBadge } from '../../components/common/FundStateBadge';

export const FreelancerOverview: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const assignedProjects = projects.filter((project) => project.freelancerId === currentUser.id && project.status !== 'invitation_pending');
  const openProjects = projects.filter((project) => project.access === 'open' && project.status === 'selection_pending' && !project.freelancerId);
  const activeProjects = assignedProjects.filter((project) => project.status === 'active');
  const submittedApplications = openProjects.filter((project) => project.applications?.some((application) => application.freelancerId === currentUser.id));
  const withdrawableTotal = assignedProjects.reduce((acc, project) => acc + project.amountWithdrawable, 0);
  const custodyTotal = assignedProjects.reduce((acc, project) => acc + project.amountInCustody, 0);
  const frozenTotal = assignedProjects.reduce((acc, project) => acc + project.amountFrozen, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h1 className="text-2xl sm:text-3xl font-black text-white">Good morning, {currentUser.name}</h1><p className="mt-1 text-xs text-slate-400">Your selected projects, profile submissions, and payment protection overview.</p></div>
        <div className="flex items-center gap-3"><Link to="/freelancer/income"><Button variant="emerald" size="md" leftIcon={<Banknote className="h-4 w-4" />}>Withdrawal Balance (₹{withdrawableTotal.toLocaleString()})</Button></Link><Link to="/marketplace?view=projects"><Button variant="outline" size="md">Find New Work</Button></Link></div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Metric label="Withdrawable Balance" value={`₹${withdrawableTotal.toLocaleString()}`} note="Ready for payout" tone="emerald" />
        <Metric label="Secured in Custody" value={`₹${custodyTotal.toLocaleString()}`} note="Selected project funding" tone="blue" />
        <Metric label="Frozen in Review" value={`₹${frozenTotal.toLocaleString()}`} note="Pending client decision" tone="amber" />
        <Metric label="Profiles Submitted" value={String(submittedApplications.length)} note="Awaiting client selection" tone="slate" />
      </div>

      <TrustScoreCard user={currentUser} />

      <section className="space-y-4"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">My project workspaces</h2><p className="mt-1 text-xs text-slate-400">Only projects where you have been selected unlock work and checkpoint submission.</p></div><span className="text-xs font-mono text-slate-400">{activeProjects.length} active</span></div>{assignedProjects.length ? <div className="grid gap-6 md:grid-cols-2">{assignedProjects.map((project) => <article key={project.id} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl"><div className="flex items-start justify-between"><div><span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{project.category}</span><h3 className="mt-0.5 text-lg font-bold text-white">{project.title}</h3><p className="mt-1 text-xs text-slate-400">Client: <strong className="text-white">{project.clientName}</strong></p></div><FundStateBadge state={project.fundState} /></div><div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300"><span className="flex items-center gap-1.5 font-semibold"><ShieldCheck className="h-4 w-4" /> Payment protection: ₹{project.budget.toLocaleString()}</span><span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase">Selected</span></div><div className="flex items-center justify-between pt-2"><span className="text-xs text-slate-400">Deadline: {project.deadline}</span><Link to={`/freelancer/projects/${project.id}`}><Button variant="primary" size="sm" rightIcon={<ArrowRight className="h-3.5 w-3.5" />}>Open workspace</Button></Link></div></article>)}</div> : <EmptyState icon={<BriefcaseBusiness className="h-7 w-7" />} title="No selected projects yet" text="Browse open projects and submit your existing profile for review." />}</section>

      <section className="space-y-4"><div className="flex items-center justify-between"><div><h2 className="text-lg font-bold text-white">Open profile submissions</h2><p className="mt-1 text-xs text-slate-400">Submitting applies your full KEYStone profile; it does not unlock work until the client selects you.</p></div><span className="text-xs font-mono text-slate-400">{openProjects.length} open</span></div>{openProjects.length ? <div className="grid gap-4 md:grid-cols-2">{openProjects.map((project) => { const applied = project.applications?.some((application) => application.freelancerId === currentUser.id); const closed = project.applicationDeadline ? new Date() > new Date(`${project.applicationDeadline}T23:59:59.999`) : false; return <article key={project.id} className="rounded-2xl border border-emerald-500/20 bg-slate-900/90 p-5"><div className="flex items-start justify-between gap-3"><div><span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{project.category}</span><h3 className="mt-1 text-base font-bold text-white">{project.title}</h3></div><span className="font-mono text-sm font-bold text-white">₹{project.budget.toLocaleString()}</span></div><p className="mt-3 line-clamp-2 text-xs text-slate-400">{project.description}</p><div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-3"><span className={`flex items-center gap-1 text-[11px] ${closed ? 'text-rose-300' : 'text-slate-400'}`}><Clock className="h-3.5 w-3.5" /> {closed ? 'Profile deadline closed' : `Apply by ${project.applicationDeadline || 'the deadline'}`}</span><Link to={`/freelancer/projects/${project.id}`}><Button variant={applied ? 'outline' : 'emerald'} size="sm">{applied ? 'View submission' : 'View & apply'}</Button></Link></div></article>; })}</div> : <EmptyState icon={<Award className="h-7 w-7" />} title="No open projects right now" text="New profile-submission opportunities will appear here." />}</section>
    </div>
  );
};

export const FreelancerDashboard = FreelancerOverview;

const Metric: React.FC<{ label: string; value: string; note: string; tone: 'emerald' | 'blue' | 'amber' | 'slate' }> = ({ label, value, note, tone }) => {
  const colors = { emerald: 'border-emerald-500/30 text-emerald-400', blue: 'border-blue-500/30 text-blue-400', amber: 'border-amber-500/30 text-amber-400', slate: 'border-slate-800 text-slate-400' };
  return <div className={`rounded-2xl border bg-slate-900/90 p-5 shadow-xl ${colors[tone]}`}><span className="block text-[11px] font-bold uppercase tracking-wider">{label}</span><span className="mt-1 block text-2xl font-black text-white font-mono">{value}</span><span className="mt-1 block text-[10px] text-slate-400">{note}</span></div>;
};

const EmptyState: React.FC<{ icon: React.ReactNode; title: string; text: string }> = ({ icon, title, text }) => <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center"><div className="mx-auto w-fit text-slate-500">{icon}</div><h3 className="mt-3 text-sm font-bold text-white">{title}</h3><p className="mt-1 text-xs text-slate-400">{text}</p></div>;
