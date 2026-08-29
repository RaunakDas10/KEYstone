import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  FileCheck,
  Clock,
  GitBranch,
  Flag,
  Star,
  Users,
  CalendarDays,
  UserCheck,
  Sparkles,
  Eye,
  User,
} from 'lucide-react';
import { useProjectStore, useAuthStore } from '../../store';
import { SEED_USERS } from '../../mock/seedData';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';
import { TimelineVisualizer } from '../../components/common/TimelineVisualizer';
import { FundStateBadge } from '../../components/common/FundStateBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { analyzeProject } from '../../services/ai/aiService';

export const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, approveCheckpoint, rejectWith90_10Resolution, raiseDispute, reportUser, rateFreelancer, selectFreelancer, autoUnlockProject } = useProjectStore();
  const { currentUser } = useAuthStore();

  const project = projects.find((p) => p.id === id) || projects[0];

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [is9010ModalOpen, setIs9010ModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [profileModalApp, setProfileModalApp] = useState<FreelancerApplication | null>(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [selectionError, setSelectionError] = useState('');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [localAiAnalysis, setLocalAiAnalysis] = useState(project.aiAnalysis ?? null);

  const currentMilestone = project.milestones[project.currentMilestoneIndex] || project.milestones[0];
  const submission = project.submissions[0];

  const handleApprove = () => {
    approveCheckpoint(project.id, currentMilestone.id);
    setIsApproveModalOpen(false);
  };

  const handleExecute9010 = () => {
    rejectWith90_10Resolution(project.id, currentMilestone.id);
    setIs9010ModalOpen(false);
  };

  const handleOpenDispute = (e: React.FormEvent) => {
    e.preventDefault();
    raiseDispute(project.id, disputeReason, disputeDesc, currentUser);
    setIsDisputeModalOpen(false);
  };
  const handleReport = (e: React.FormEvent) => {
    e.preventDefault();
    reportUser(SEED_USERS.freelancer, project.id, reportReason, reportReason, currentUser);
    setIsReportOpen(false);
    setReportReason('');
  };

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    try {
      const result = await analyzeProject({
        title: project.title,
        description: project.description,
        category: project.category,
        skills: project.skills,
        budget: project.budget,
        deadline: project.deadline,
      });
      setLocalAiAnalysis({
        riskScore: result.riskScore,
        riskLevel: result.riskLevel,
        confidence: result.confidence,
        analyzedAt: result.analyzedAt,
        analysisVersion: result.analysisVersion,
        risks: result.risks,
        missingRequirements: result.missingRequirements.map((r) => ({ id: r.id, area: r.area, resolved: r.resolved })),
        recommendations: result.recommendations,
        issueCount: result.issueCount,
        overallHealth: result.overallHealth,
      });
    } finally {
      setIsReanalyzing(false);
    }
  };

  const totalAmount = currentMilestone?.amount || project.budget;
  const client90Pct = Math.round(totalAmount * 0.9);
  const builder10Pct = Math.round(totalAmount * 0.1);
  const isAwaitingSelection = project.access === 'open' && project.status === 'selection_pending' && !project.freelancerId;
  const selectionIsOpen = true;

  const handleSelectFreelancer = async (freelancerId: string) => {
    const selected = await selectFreelancer(project.id, freelancerId);
    if (!selected) setSelectionError('Failed to select freelancer. Please try again.');
  };

  if (isAwaitingSelection) {
    const applications = project.applications || [];
    return (
      <div className="space-y-8">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2"><span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Open project</span><span className="rounded-full bg-amber-500/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-300">Awaiting selection</span></div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">{project.title}</h1>
              <p className="mt-2 text-xs text-slate-400">Funds are secured; work remains locked until you select one submitted freelancer profile.</p>
            </div>
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-300">
              <span className="flex items-center gap-2 font-bold"><CalendarDays className="h-4 w-4" /> Profile deadline: {project.applicationDeadline || 'Not set'}</span>
              <p className="mt-1">Selection is active! You can review profiles and select your freelancer anytime.</p>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-6 flex items-center justify-between"><div><h2 className="flex items-center gap-2 text-xl font-bold text-white"><Users className="h-5 w-5 text-blue-400" /> Freelancer profiles</h2><p className="mt-1 text-xs text-slate-400">Review the submitted profile snapshots before assigning the workspace.</p></div><span className="text-sm font-mono font-bold text-white">{applications.length} submitted</span></div>
          {selectionError && <p className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{selectionError}</p>}
          {applications.length ? <div className="grid gap-4 md:grid-cols-2">{applications.map((application) => <article key={application.id} className="rounded-2xl border border-slate-800 bg-slate-950 p-5"><div className="flex items-start gap-3"><img src={application.freelancerAvatar} alt="" className="h-12 w-12 rounded-xl object-cover" /><div className="min-w-0"><h3 className="font-bold text-white">{application.freelancerName}</h3><p className="text-xs text-slate-400">{application.freelancerTitle || 'Freelancer'}{application.freelancerPronouns ? ` · ${application.freelancerPronouns}` : ''}</p></div>{application.verified && <span className="ml-auto text-[10px] font-bold text-emerald-400">VERIFIED</span>}</div><p className="mt-4 line-clamp-3 text-xs leading-relaxed text-slate-400">{application.freelancerBio || 'No profile bio provided.'}</p><div className="mt-4 grid gap-2 text-[11px] text-slate-400"><span>Email: <a href={`mailto:${application.freelancerEmail}`} className="text-blue-300 hover:underline">{application.freelancerEmail}</a></span>{application.freelancerCompany && <span>Company: {application.freelancerCompany}</span>}{application.freelancerLocation && <span>Location: {application.freelancerLocation}</span>}<div className="flex flex-wrap gap-x-3 gap-y-1">{application.freelancerWebsite && <a href={application.freelancerWebsite} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">Website</a>}{application.freelancerLinkedin && <a href={application.freelancerLinkedin} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">LinkedIn</a>}{application.freelancerGithub && <a href={application.freelancerGithub} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">GitHub</a>}{application.freelancerInstagram && <a href={application.freelancerInstagram} target="_blank" rel="noreferrer" className="text-blue-300 hover:underline">Instagram</a>}{application.freelancerXHandle && <span>X: {application.freelancerXHandle}</span>}</div></div><div className="mt-4 flex flex-wrap gap-1.5">{application.freelancerSkills?.map((skill) => <span key={skill} className="rounded bg-slate-900 px-2 py-1 text-[10px] text-slate-300">{skill}</span>)}</div><div className="mt-4 flex items-center justify-between border-t border-slate-800 pt-4"><span className="text-[11px] text-slate-400">Score {application.trustScore ?? '—'} · {application.projectsCompleted ?? 0} projects</span><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setProfileModalApp(application)} leftIcon={<Eye className="h-3.5 w-3.5 text-blue-400" />}>See profile</Button><Button variant="emerald" size="sm" onClick={() => handleSelectFreelancer(application.freelancerId)} leftIcon={<UserCheck className="h-3.5 w-3.5" />}>Select freelancer</Button></div></div></article>)}</div> : <div className="rounded-2xl border border-slate-800 bg-slate-950 p-10 text-center"><Users className="mx-auto h-8 w-8 text-slate-500" /><h3 className="mt-3 text-sm font-bold text-white">No profiles submitted yet</h3><p className="mt-1 text-xs text-slate-400">Freelancers can submit their profile until {project.applicationDeadline || 'the deadline'}.</p></div>}
        </div>

        {/* FREELANCER PROFILE PREVIEW MODAL */}
        {profileModalApp && (
          <Modal
            isOpen={!!profileModalApp}
            onClose={() => setProfileModalApp(null)}
            title={`Freelancer Profile: ${profileModalApp.freelancerName}`}
            subtitle={profileModalApp.freelancerTitle || 'Verified Developer'}
          >
            <div className="space-y-5 text-xs text-slate-300">
              <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <img src={profileModalApp.freelancerAvatar} alt="" className="h-16 w-16 rounded-2xl object-cover" />
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {profileModalApp.freelancerName}
                    {profileModalApp.verified && <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">VERIFIED</span>}
                  </h3>
                  <p className="text-xs text-slate-400">{profileModalApp.freelancerTitle}</p>
                  <p className="mt-1 text-[11px] text-emerald-400 font-semibold">
                    Trust Score: {profileModalApp.trustScore ?? 98}% · {profileModalApp.projectsCompleted ?? 0} Projects Completed
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-1">Biography</h4>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 leading-relaxed">
                  {profileModalApp.freelancerBio || 'Senior software developer with extensive experience building scalable web and mobile applications.'}
                </p>
              </div>

              {profileModalApp.freelancerSkills && profileModalApp.freelancerSkills.length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-2">Technical Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profileModalApp.freelancerSkills.map((skill) => (
                      <span key={skill} className="rounded-lg bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 text-blue-300 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 pt-2 text-[11px]">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-slate-500 block">Email Contact:</span>
                  <a href={`mailto:${profileModalApp.freelancerEmail}`} className="text-blue-400 font-semibold hover:underline">
                    {profileModalApp.freelancerEmail}
                  </a>
                </div>
                {profileModalApp.hourlyRate && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-500 block">Hourly Rate:</span>
                    <span className="text-white font-bold font-mono">₹{profileModalApp.hourlyRate.toLocaleString()}/hr</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <Link
                  to={`/freelancers/${profileModalApp.freelancerId}`}
                  target="_blank"
                  className="text-blue-400 hover:underline text-xs flex items-center gap-1 font-semibold"
                >
                  Open Full Directory Page <ExternalLink className="w-3 h-3" />
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setProfileModalApp(null)}>
                    Close
                  </Button>
                  <Button
                    variant="emerald"
                    size="md"
                    onClick={() => {
                      const fId = profileModalApp.freelancerId;
                      setProfileModalApp(null);
                      handleSelectFreelancer(fId);
                    }}
                    leftIcon={<UserCheck className="h-4 w-4" />}
                  >
                    Select Freelancer for Project
                  </Button>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{project.category}</span>
              <FundStateBadge state={project.fundState} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">{project.title}</h1>
            <p className="text-xs text-slate-400 mt-1">
              Freelancer: <strong className="text-white">{project.freelancerName}</strong> • Started: {project.startDate}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/client/messages">
              <Button variant="outline" size="md" leftIcon={<MessageSquare className="w-4 h-4 text-blue-400" />}>
                Project Chat
              </Button>
            </Link>
          </div>
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

      {/* AI PROJECT HEALTH PANEL */}
      {localAiAnalysis && (() => {
        const colors = {
          LOW: { text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
          MODERATE: { text: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
          HIGH: { text: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' },
          CRITICAL: { text: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
        }[localAiAnalysis.riskLevel];
        const healthIcons = { healthy: '🟢', warning: '🟠', critical: '🔴' } as const;
        return (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <h3 className="text-lg font-bold text-white">AI Project Health</h3>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReanalyze}
                isLoading={isReanalyzing}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Run New Analysis
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Score */}
              <div className={`p-4 rounded-2xl border ${colors.bg} ${colors.border} space-y-1`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Score</p>
                <p className={`text-3xl font-black font-mono ${colors.text}`}>{localAiAnalysis.riskScore}<span className="text-base text-slate-500">/100</span></p>
                <p className={`text-xs font-bold ${colors.text}`}>{localAiAnalysis.riskLevel} RISK</p>
              </div>

              {/* Health Items */}
              <div className="p-4 rounded-2xl border border-slate-800 bg-slate-950 space-y-2">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Health Breakdown</p>
                {localAiAnalysis.risks.slice(0, 4).map((risk) => (
                  <div key={risk.id} className="flex items-center gap-2">
                    <span>{risk.severity === 'high' || risk.severity === 'critical' ? '🔴' : risk.severity === 'medium' ? '🟠' : '🟡'}</span>
                    <span className="text-xs text-slate-300 truncate">{risk.title}</span>
                  </div>
                ))}
                {localAiAnalysis.risks.length === 0 && (
                  <div className="flex items-center gap-2">
                    <span>🟢</span>
                    <span className="text-xs text-emerald-400">No major risks detected</span>
                  </div>
                )}
              </div>
            </div>

            {localAiAnalysis.recommendations.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">AI Recommendations</p>
                {localAiAnalysis.recommendations.slice(0, 3).map((rec, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-[10px] text-indigo-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            )}

            <p className="text-[10px] text-slate-500">
              Last analyzed: {new Date(localAiAnalysis.analyzedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} · v{localAiAnalysis.analysisVersion}
            </p>
          </div>
        );
      })()}

      {/* CHECKPOINT EVALUATION CONSOLE */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Checkpoint Under Evaluation</span>
            <h3 className="text-xl font-bold text-white">{currentMilestone.title}</h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block">Milestone Vault Value</span>
            <span className="text-lg font-bold font-mono text-emerald-400">₹{currentMilestone.amount.toLocaleString()}</span>
          </div>
        </div>

        {/* Deliverable Demo Card */}
        {submission ? (
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                <span className="font-bold text-sm text-white">Working Demo Deliverable</span>
              </div>
              <Badge variant="amber">Status: Awaiting Client Review</Badge>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{submission.description}</p>

            <div className="flex flex-wrap gap-4 text-xs">
              {submission.demoUrl && (
                <a
                  href={submission.demoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  Launch Interactive Demo
                </a>
              )}
              {submission.githubUrl && (
                <a
                  href={submission.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3.5 py-2 rounded-xl font-semibold flex items-center gap-2 transition-all"
                >
                  <GitBranch className="w-4 h-4" />
                  Inspect GitHub Repository
                </a>
              )}
            </div>

            {/* Action Buttons */}
            {project.fundState !== 'WITHDRAWABLE' && project.fundState !== 'REFUNDED' && (
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="emerald" size="md" onClick={() => setIsApproveModalOpen(true)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                    Approve Checkpoint & Release Funds
                  </Button>

                  <Button variant="outline" size="md" onClick={() => setIs9010ModalOpen(true)} leftIcon={<RefreshCw className="w-4 h-4 text-purple-400" />}>
                    Trigger 90/10 Resolution
                  </Button>

                  <Button variant="outline" size="md" onClick={() => autoUnlockProject(project.id)} leftIcon={<Clock className="w-4 h-4 text-amber-400" />}>
                    Simulate 7-Day Inactivity Auto-Release & Refund
                  </Button>
                </div>

                <Button variant="danger" size="sm" onClick={() => setIsDisputeModalOpen(true)} leftIcon={<AlertTriangle className="w-3.5 h-3.5" />}>
                  Raise Dispute
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsReportOpen(true)} leftIcon={<Flag className="w-3.5 h-3.5" />}>Report freelancer</Button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 text-center space-y-2">
            <Clock className="w-8 h-8 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">Freelancer is Building</h4>
            <p className="text-xs text-slate-400">Funds remain 100% secured in KEYStone Custody until a working demo is submitted.</p>
          </div>
        )}
      </div>

      {/* Audit Timeline */}
      <TimelineVisualizer project={project} />

      {/* APPROVE CONFIRMATION MODAL */}
      <Modal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Report freelancer"
        subtitle="Send a conduct or safety report to platform governance."
      >
        <form onSubmit={handleReport} className="space-y-4 text-xs"><textarea required rows={4} value={reportReason} onChange={(e) => setReportReason(e.target.value)} placeholder="Describe the issue..." className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white" /><div className="flex justify-end"><Button type="submit" variant="danger">Submit report</Button></div></form>
      </Modal>

      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Checkpoint & Release Funds?"
        subtitle="Confirming financial state transition for this milestone."
      >
        <div className="space-y-4 text-xs text-slate-300">
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl space-y-2">
            <div className="flex justify-between font-bold text-emerald-400 text-sm">
              <span>Financial Impact:</span>
              <span>₹{totalAmount.toLocaleString()}</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Approving this checkpoint will transition ₹{totalAmount.toLocaleString()} from <strong>FROZEN</strong> status to <strong>WITHDRAWABLE</strong> status. The freelancer will immediately gain access to withdraw these funds.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsApproveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="emerald" size="md" onClick={handleApprove}>
              Confirm & Approve
            </Button>
          </div>
        </div>
      </Modal>

      {/* 90/10 RESOLUTION MODAL */}
      <Modal
        isOpen={is9010ModalOpen}
        onClose={() => setIs9010ModalOpen(false)}
        title="90/10 Automatic Fair Resolution"
        subtitle="Predefined platform rule for partial checkpoint failure."
      >
        <div className="space-y-4 text-xs text-slate-300">
          <p className="leading-relaxed">
            If the delivered demo does not meet agreed acceptance criteria at this halfway checkpoint, KEYStone automatically splits funds according to platform protocol:
          </p>

          <div className="space-y-2 font-mono">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex justify-between">
              <span>90% Client Refund Amount:</span>
              <span className="font-bold text-emerald-400 text-sm">₹{client90Pct.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex justify-between">
              <span>10% Builder Partial Fee:</span>
              <span className="font-bold text-amber-400 text-sm">₹{builder10Pct.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-400">
            This rule guarantees a predefined outcome without requiring manual human dispute delays.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIs9010ModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleExecute9010}>
              Execute 90/10 Resolution
            </Button>
          </div>
        </div>
      </Modal>

      {/* DISPUTE MODAL */}
      <Modal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        title="Open Governance Dispute"
        subtitle="Funds remain locked safely in the vault while platform risk team reviews evidence."
      >
        <form onSubmit={handleOpenDispute} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-1">Dispute Reason</label>
            <input
              type="text"
              required
              placeholder="e.g. Acceptance criteria not met"
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Detailed Explanation & Evidence Links</label>
            <textarea
              rows={4}
              required
              placeholder="Explain why the delivered demo fails acceptance criteria..."
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsDisputeModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" type="submit">
              Submit Dispute
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
