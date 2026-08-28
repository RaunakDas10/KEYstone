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
} from 'lucide-react';
import { useProjectStore, useAuthStore } from '../../store';
import { SEED_USERS } from '../../mock/seedData';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';
import { TimelineVisualizer } from '../../components/common/TimelineVisualizer';
import { FundStateBadge } from '../../components/common/FundStateBadge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';

export const ClientProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { projects, approveCheckpoint, rejectWith90_10Resolution, raiseDispute, reportUser } = useProjectStore();
  const { currentUser } = useAuthStore();

  const project = projects.find((p) => p.id === id) || projects[0];

  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [is9010ModalOpen, setIs9010ModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [reportReason, setReportReason] = useState('');
  const [isReportOpen, setIsReportOpen] = useState(false);

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

  const totalAmount = currentMilestone?.amount || project.budget;
  const client90Pct = Math.round(totalAmount * 0.9);
  const builder10Pct = Math.round(totalAmount * 0.1);

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
                <div className="flex items-center gap-2">
                  <Button variant="emerald" size="md" onClick={() => setIsApproveModalOpen(true)} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
                    Approve Checkpoint & Release Funds
                  </Button>

                  <Button variant="outline" size="md" onClick={() => setIs9010ModalOpen(true)} leftIcon={<RefreshCw className="w-4 h-4 text-purple-400" />}>
                    Trigger 90/10 Resolution
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
