import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Wallet, Lock, CheckCircle2, Award, Clock, ArrowRight, Banknote } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { TrustScoreCard } from '../../components/common/TrustScoreCard';
import { FundStateBadge } from '../../components/common/FundStateBadge';

export const FreelancerDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();

  const visibleProjects = projects.filter((p) => p.freelancerId === currentUser.id || p.access === 'open');
  const activeProjects = visibleProjects.filter((p) => p.status === 'active');
  const withdrawableTotal = visibleProjects.reduce((acc, p) => acc + p.amountWithdrawable, 0);
  const custodyTotal = visibleProjects.reduce((acc, p) => acc + p.amountInCustody, 0);
  const frozenTotal = visibleProjects.reduce((acc, p) => acc + p.amountFrozen, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Good morning, {currentUser.name}</h1>
          <p className="text-xs text-slate-400 mt-1">Your payment protection metrics and active project hub.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/freelancer/income">
            <Button variant="emerald" size="md" leftIcon={<Banknote className="w-4 h-4" />}>
              Withdrawal Balance (₹{withdrawableTotal.toLocaleString()})
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" size="md">
              Find New Work
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl glow-emerald">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Withdrawable Balance</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{withdrawableTotal.toLocaleString()}</span>
          <span className="text-[10px] text-emerald-300 mt-1 block">Ready for Instant Payout</span>
        </div>

        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Secured in Custody</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{custodyTotal.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Guaranteed Client Funding</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Frozen in Review</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{frozenTotal.toLocaleString()}</span>
          <span className="text-[10px] text-amber-300 mt-1 block">Pending Client Decision</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Trust Score</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{currentUser.trustScore || 98} / 100</span>
          <span className="text-[10px] text-purple-400 mt-1 block">Tier 1 Top Rated</span>
        </div>
      </div>

      {/* Trust Profile Card */}
      <TrustScoreCard user={currentUser} />

      {/* Active Projects List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Active Payment-Protected Projects</h3>

        <div className="grid md:grid-cols-2 gap-6">
          {visibleProjects.map((project) => (
            <div key={project.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{project.category}</span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{project.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Client: <strong className="text-white">{project.clientName}</strong></p>
                </div>
                <FundStateBadge state={project.fundState} />
              </div>

              {/* Payment Protection Box */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Payment Protection: ₹{project.budget.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold uppercase bg-emerald-500/20 px-2 py-0.5 rounded">
                  Secured
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">Deadline: {project.deadline}</span>
                <Link to={`/freelancer/projects/${project.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Open Project Workspace
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
