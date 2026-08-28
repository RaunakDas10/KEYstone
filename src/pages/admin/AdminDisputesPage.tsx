import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, AlertTriangle, FileText, ArrowRight, Shield } from 'lucide-react';
import { useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Badge } from '../../components/ui/Badge';
import { Dispute } from '../../types';

export const AdminDisputesPage: React.FC = () => {
  const { disputes, resolveDisputeByAdmin } = useProjectStore();

  const [selectedDispute, setSelectedDispute] = useState<Dispute | null>(disputes[0] || null);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [clientRefundPct, setClientRefundPct] = useState(50);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleExecuteResolution = () => {
    if (!selectedDispute) return;
    resolveDisputeByAdmin(selectedDispute.id, clientRefundPct);
    setIsConfirming(false);
    setIsResolveModalOpen(false);
  };

  const clientAmount = selectedDispute ? Math.round((selectedDispute.amountInDispute * clientRefundPct) / 100) : 0;
  const freelancerAmount = selectedDispute ? selectedDispute.amountInDispute - clientAmount : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-rose-400" />
            Governance Dispute Station
          </h1>
          <p className="text-xs text-slate-400 mt-1">Review evidence, audit transaction history, and execute binding financial settlements.</p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Disputes Queue Sidebar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-white">Reported Projects Queue</h3>

          <div className="space-y-3">
            {disputes.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDispute(d)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                  selectedDispute?.id === d.id
                    ? 'bg-rose-500/15 border-rose-500/50 text-white shadow-lg glow-rose'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={d.status === 'resolved' ? 'emerald' : 'rose'}>
                    {d.status === 'resolved' ? 'Resolved' : 'Under Review'}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-white">₹{d.amountInDispute.toLocaleString()}</span>
                </div>
                <h4 className="font-bold text-sm text-white line-clamp-1">{d.projectTitle}</h4>
                <p className="text-xs text-slate-400 mt-1">Raised by: {d.raisedByName}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Dispute Audit Station */}
        {selectedDispute ? (
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Dispute Case #{selectedDispute.id}</span>
                <h2 className="text-xl font-bold text-white mt-0.5">{selectedDispute.projectTitle}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Raised by: <strong className="text-white">{selectedDispute.raisedByName} ({selectedDispute.raisedByRole})</strong> vs{' '}
                  <strong className="text-white">{selectedDispute.againstName}</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">Funds Held in Lock</span>
                <span className="text-xl font-black font-mono text-rose-400">₹{selectedDispute.amountInDispute.toLocaleString()}</span>
              </div>
            </div>

            {/* Reason & Evidence */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white text-sm">Statement & Claim Reason</h4>
              <p className="text-slate-300 font-semibold">{selectedDispute.reason}</p>
              <p className="text-slate-400 leading-relaxed">{selectedDispute.description}</p>
            </div>

            {/* Governance Audit Trail Flow */}
            <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-xs">Audit Lifecycle Flow</h4>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-400">
                <span className="bg-slate-900 px-2.5 py-1 rounded text-blue-400 border border-slate-800">FUNDS DEPOSITED</span>
                <span>→</span>
                <span className="bg-slate-900 px-2.5 py-1 rounded text-purple-400 border border-slate-800">CHECKPOINT SUBMITTED</span>
                <span>→</span>
                <span className="bg-slate-900 px-2.5 py-1 rounded text-amber-400 border border-slate-800">FUNDS FROZEN</span>
                <span>→</span>
                <span className="bg-rose-500/20 text-rose-400 px-2.5 py-1 rounded border border-rose-500/30">DISPUTE RAISED</span>
                <span>→</span>
                <span className="bg-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded border border-emerald-500/30">ADMIN BINDING RESOLUTION</span>
              </div>
            </div>

            {/* Action Bar */}
            {selectedDispute.status !== 'resolved' ? (
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <Button variant="primary" size="lg" onClick={() => setIsResolveModalOpen(true)} leftIcon={<Shield className="w-4 h-4" />}>
                  Execute Admin Settlement
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300">
                ✓ <strong>Resolved by Platform Governance:</strong> {selectedDispute.resolution?.summary}
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
            Select a dispute from the queue to inspect the audit trail.
          </div>
        )}
      </div>

      {/* RESOLUTION SETTLEMENT MODAL */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Execute Binding Financial Settlement"
        subtitle="Specify settlement split percentage between Client and Freelancer."
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-300 mb-2">Client Refund Percentage ({clientRefundPct}%)</label>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={clientRefundPct}
              onChange={(e) => setClientRefundPct(Number(e.target.value))}
              className="w-full bg-slate-950 cursor-pointer accent-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Client Refund Amount ({clientRefundPct}%):</span>
              <span className="text-lg font-bold text-emerald-400">₹{clientAmount.toLocaleString()}</span>
            </div>

            <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-xl">
              <span className="text-slate-400 text-[10px] block">Freelancer Payout ({100 - clientRefundPct}%):</span>
              <span className="text-lg font-bold text-purple-400">₹{freelancerAmount.toLocaleString()}</span>
            </div>
          </div>

          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-[11px]">
            ⚠️ <strong>Admin Confirmation:</strong> This action will update the project fund state, record a ledger event, and disburse funds immediately.
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleExecuteResolution}>
              Confirm & Disburse Funds
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
