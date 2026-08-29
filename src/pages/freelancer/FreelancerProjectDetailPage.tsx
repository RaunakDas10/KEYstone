import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  FileCheck,
  Clock,
  Send,
  GitBranch,
  Flag,
} from 'lucide-react';
import { useProjectStore, useAuthStore, useMessageStore } from '../../store';
import { SEED_USERS } from '../../mock/seedData';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';
import { TimelineVisualizer } from '../../components/common/TimelineVisualizer';
import { FundStateBadge } from '../../components/common/FundStateBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const FreelancerProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, submitCheckpoint, reportUser, applyToProject } = useProjectStore();
  const { currentUser } = useAuthStore();
  const { messages, sendMessage } = useMessageStore();

  const project = projects.find((p) => p.id === id) || projects[0];
  const currentMilestone = project.milestones[project.currentMilestoneIndex] || project.milestones[0];

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [demoUrl, setDemoUrl] = useState('https://my-working-demo.keystone.app');
  const [githubUrl, setGithubUrl] = useState('https://github.com/ananyaroy/keystone-demo-repo');
  const [description, setDescription] = useState('Completed Milestone working prototype with responsive dark mode and Zustand state wiring.');
  const [notes, setNotes] = useState('Please review the live demo URL above. All interactive features are functional.');
  const [chatInput, setChatInput] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [applicationError, setApplicationError] = useState('');

  const projectMessages = messages.filter((m) => m.projectId === project.id);

  const handleSubmitDemo = (e: React.FormEvent) => {
    e.preventDefault();
    submitCheckpoint(project.id, currentMilestone.id, {
      milestoneId: currentMilestone.id,
      demoUrl,
      githubUrl,
      description,
      notes,
      completionPercentage: 100,
      attachments: [{ name: 'Lighthouse_Audit_Score.pdf', url: '#', size: '1.2 MB' }],
    });
    setIsSubmitModalOpen(false);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    sendMessage(project.id, chatInput, currentUser);
    setChatInput('');
  };
  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    reportUser(SEED_USERS.client, project.id, reportReason, reportReason, currentUser);
    setReportReason('');
    setIsReportOpen(false);
  };

  const isOpenForApplications = project.access === 'open' && !project.selectedAt && (project.status === 'selection_pending' || !project.applicationDeadline);
  const applicationDeadlinePassed = project.applicationDeadline
    ? new Date() > new Date(`${project.applicationDeadline}T23:59:59.999`)
    : false;
  const myApplication = project.applications?.find((application) => application.freelancerId === currentUser.id);

  const handleProfileSubmit = async () => {
    const submitted = await applyToProject(project.id, currentUser);
    if (!submitted) setApplicationError('This project is no longer accepting profile submissions.');
  };

  if (isOpenForApplications) {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Open project application</span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black text-white">{project.title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{project.description}</p>
          <div className={`mt-6 inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs ${applicationDeadlinePassed ? 'border-rose-500/30 bg-rose-500/10 text-rose-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'}`}><Clock className="h-4 w-4" /> Profile submission deadline: {project.applicationDeadline || 'Not set'}{applicationDeadlinePassed ? ' — closed' : ''}</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div><h2 className="text-xl font-bold text-white">Project brief</h2><p className="mt-1 text-xs text-slate-400">Review the scope, delivery dates, and payment structure before applying.</p></div>
          <div className="grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4"><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Client</span><span className="mt-1 block font-semibold text-white">{project.clientName}</span></div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Category</span><span className="mt-1 block font-semibold text-white">{project.category}</span></div><div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Project deadline</span><span className="mt-1 block font-semibold text-white">{project.deadline}</span></div><div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3"><span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-400">Total budget</span><span className="mt-1 block font-mono font-bold text-white">₹{project.budget.toLocaleString()}</span></div></div>
          <div><h3 className="text-sm font-bold text-white">Required skills</h3><div className="mt-3 flex flex-wrap gap-2">{project.skills.map((skill) => <span key={skill} className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-medium text-blue-200">{skill}</span>)}</div></div>
          <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/5 p-5"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="text-sm font-bold text-white">Payment protection</h3><p className="mt-1 text-xs leading-relaxed text-slate-400">The client has secured 100% of the project budget in KEYStone custody. Each milestone moves to review after its working demo is submitted, and becomes withdrawable after client approval.</p></div><span className="shrink-0 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300">100% funded in custody</span></div></div>
          <div><div className="flex items-center justify-between"><h3 className="text-sm font-bold text-white">Milestone and payment schedule</h3><span className="text-[11px] text-slate-500">{project.milestones.length} checkpoint{project.milestones.length === 1 ? '' : 's'}</span></div><div className="mt-3 space-y-3">{project.milestones.map((milestone, index) => <div key={milestone.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-4"><div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between"><div><span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Milestone {index + 1}</span><h4 className="mt-1 text-sm font-bold text-white">{milestone.title}</h4><p className="mt-1 text-xs text-slate-400">Due {milestone.deadline}</p></div><span className="font-mono text-sm font-bold text-emerald-400">₹{milestone.amount.toLocaleString()}</span></div><div className="mt-3 flex flex-wrap gap-1.5">{milestone.acceptanceCriteria.map((criterion) => <span key={criterion} className="rounded bg-slate-900 px-2 py-1 text-[10px] text-slate-300">{criterion}</span>)}</div></div>)}</div></div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white">Submit your freelancer profile</h2>
          <p className="mt-1 text-xs leading-relaxed text-slate-400">The client will review this snapshot of your KEYStone profile after the deadline. A selected freelancer receives the project workspace and checkpoint submission access.</p>
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950 p-5"><div className="flex items-start gap-4"><img src={currentUser.avatar} alt="" className="h-14 w-14 rounded-2xl object-cover" /><div><h3 className="font-bold text-white">{currentUser.name}</h3><p className="text-xs text-slate-400">{currentUser.title || 'Freelancer'}</p><p className="mt-2 text-[11px] text-emerald-400">Trust score: {currentUser.trustScore ?? '—'} · {currentUser.projectsCompleted ?? 0} completed projects</p></div></div><div className="mt-4 flex flex-wrap gap-1.5">{currentUser.skills?.map((skill) => <span key={skill} className="rounded bg-slate-900 px-2 py-1 text-[10px] text-slate-300">{skill}</span>)}</div></div>
          {applicationError && <p className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{applicationError}</p>}
          {myApplication ? <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-300">Your profile was submitted on {new Date(myApplication.submittedAt).toLocaleDateString()}. The client can select after the deadline.</div> : <Button variant="emerald" size="md" className="mt-6" disabled={applicationDeadlinePassed} onClick={handleProfileSubmit}>Submit my profile for review</Button>}
        </div>
      </div>
    );
  }

  if (project.freelancerId !== currentUser.id) {
    return <div className="mx-auto max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/90 p-8 text-center shadow-2xl"><Lock className="mx-auto h-8 w-8 text-slate-500" /><h1 className="mt-3 text-xl font-bold text-white">Project workspace unavailable</h1><p className="mt-2 text-xs leading-relaxed text-slate-400">Only the freelancer selected for this project can open its work and checkpoint submission tools.</p><Link to="/freelancer/overview" className="mt-5 inline-block"><Button variant="outline" size="sm">Back to Overview</Button></Link></div>;
  }

  return (
    <div className="space-y-8">
      {/* Header & Protection Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{project.category}</span>
              <FundStateBadge state={project.fundState} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{project.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Client: <strong className="text-white">{project.clientName}</strong> • Deadline: {project.deadline}
            </p>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-2.5 rounded-2xl text-left">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Payment Protection Guaranteed
            </span>
            <span className="text-base font-extrabold text-white font-mono">
              ₹{project.budget.toLocaleString()} Locked in Vault
            </span>
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsReportOpen(true)} leftIcon={<Flag className="w-3.5 h-3.5" />}>Report client</Button>
        </div>
      </div>

      {/* 3-STATE FUND LIFECYCLE */}
      <FundLifecycleVisualizer
        currentState={project.fundState}
        amountCustody={project.amountInCustody}
        amountFrozen={project.amountFrozen}
        amountWithdrawable={project.amountWithdrawable}
        totalBudget={project.budget}
      />

      {/* CHECKPOINT SUBMISSION ACTION BAR */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">Current Milestone</span>
            <h3 className="text-xl font-bold text-white">{currentMilestone.title}</h3>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-bold font-mono text-emerald-400">₹{currentMilestone.amount.toLocaleString()}</span>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsSubmitModalOpen(true)}
              leftIcon={<FileCheck className="w-4 h-4" />}
            >
              Submit Checkpoint Demo
            </Button>
          </div>
        </div>

        {/* Existing Submissions List */}
        {project.submissions.length > 0 ? (
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-white">Submitted Checkpoint Demos</h4>
            {project.submissions.map((sub) => (
              <div key={sub.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white">Working Demo Submission</span>
                  </div>
                  <Badge variant={sub.status === 'approved' ? 'emerald' : 'amber'}>
                    {sub.status === 'approved' ? 'Approved & Funds Released' : 'Awaiting Client Review'}
                  </Badge>
                </div>

                <p className="text-slate-300">{sub.description}</p>

                <div className="flex gap-3 pt-2">
                  {sub.demoUrl && (
                    <a href={sub.demoUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                      Live Demo Link <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {sub.githubUrl && (
                    <a href={sub.githubUrl} target="_blank" rel="noreferrer" className="text-slate-300 hover:underline flex items-center gap-1 font-semibold">
                      Repository <GitBranch className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">No working demo submitted yet for this milestone. Click above to submit.</p>
        )}
      </div>

      {/* PROJECT MESSAGING WITH INTEGRATED SYSTEM EVENTS */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Project Real-Time Communication & Event Log
        </h3>

        <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 h-64 overflow-y-auto space-y-3 text-xs">
          {projectMessages.map((msg) => (
            <div key={msg.id}>
              {msg.isSystemEvent ? (
                <div className="my-2 py-2 px-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-center font-mono text-[11px] text-blue-300">
                  ────── SYSTEM PROTOCOL EVENT: {msg.content} ──────
                </div>
              ) : (
                <div className={`flex gap-3 ${msg.senderRole === 'freelancer' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-md p-3 rounded-2xl ${
                      msg.senderRole === 'freelancer'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1 text-[10px] opacity-75">
                      <span className="font-bold">{msg.senderName}</span>
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            placeholder="Type a message or share an update..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
          />
          <Button variant="primary" size="md" type="submit" rightIcon={<Send className="w-4 h-4" />}>
            Send
          </Button>
        </form>
      </div>

      {/* DEMO SUBMISSION MODAL */}
      <Modal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} title="Report client" subtitle="Send a conduct or safety report to platform governance.">
        <form onSubmit={handleReport} className="space-y-4 text-xs"><textarea required rows={4} value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe the issue..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" /><div className="flex justify-end"><Button type="submit" variant="danger">Submit report</Button></div></form>
      </Modal>
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Working Demo Checkpoint"
        subtitle="Your client will evaluate this live demo before deciding on checkpoint approval."
      >
        <form onSubmit={handleSubmitDemo} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300">
            🔒 <strong>Fund Protection Notice:</strong> Submitting this demo will freeze ₹{currentMilestone.amount.toLocaleString()} during client evaluation.
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Live Working Demo URL</label>
            <input
              type="url"
              required
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">GitHub / Codebase Repository URL</label>
            <input
              type="url"
              required
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Deliverable Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsSubmitModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Submit Checkpoint Demo
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
