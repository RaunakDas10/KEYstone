import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ShieldCheck, Lock, CheckCircle2, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { FundStateBadge } from '../../components/common/FundStateBadge';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';

export const ClientDashboard: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();

  const clientProjects = projects.filter((p) => p.clientId === currentUser.id || true); // fallback for demo

  const activeCount = clientProjects.filter((p) => p.status === 'active').length;
  const totalCustody = clientProjects.reduce((acc, p) => acc + p.amountInCustody, 0);
  const totalFrozen = clientProjects.reduce((acc, p) => acc + p.amountFrozen, 0);
  const completedCount = clientProjects.filter((p) => p.status === 'completed').length;
  const pendingCheckpoints = clientProjects.filter((p) => p.fundState === 'FROZEN').length;

  return (
    <div className="space-y-8">
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Good morning, {currentUser.name}</h1>
          <p className="text-xs text-slate-400 mt-1">Here is your live project vault and custody overview.</p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/client/projects/new">
            <Button variant="primary" size="md" leftIcon={<Plus className="w-4 h-4" />}>
              Create Project
            </Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline" size="md">
              Browse Freelancers
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Active Projects</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{activeCount}</span>
          <span className="text-[10px] text-blue-400 mt-1 block">100% Escrow Protected</span>
        </div>

        <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-5 shadow-xl glow-blue">
          <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">Funds in Custody</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">₹{totalCustody.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400 mt-1 block">Locked in KEYStone Vault</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Pending Checkpoints</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{pendingCheckpoints}</span>
          <span className="text-[10px] text-amber-300 mt-1 block">₹{totalFrozen.toLocaleString()} Frozen</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Completed Projects</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{completedCount}</span>
          <span className="text-[10px] text-emerald-400 mt-1 block">Zero Dispute History</span>
        </div>
      </div>

      {/* Primary Fund Lifecycle Card */}
      <FundLifecycleVisualizer
        currentState={pendingCheckpoints > 0 ? 'FROZEN' : 'IN_CUSTODY'}
        amountCustody={totalCustody}
        amountFrozen={totalFrozen}
        amountWithdrawable={0}
        totalBudget={totalCustody + totalFrozen}
      />

      {/* Active Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Your Projects Overview</h3>
          <Link to="/client/projects" className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1">
            View All Projects <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {clientProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-slate-700 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{project.category}</span>
                  <h4 className="text-lg font-bold text-white mt-0.5">{project.title}</h4>
                  <p className="text-xs text-slate-400 mt-1">Freelancer: <strong className="text-white">{project.freelancerName}</strong></p>
                </div>
                <FundStateBadge state={project.fundState} />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Budget:</span>
                  <span className="font-bold text-white font-mono">₹{project.budget.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Milestone:</span>
                  <span className="font-semibold text-slate-200 truncate block">
                    {project.milestones[project.currentMilestoneIndex]?.title || 'Milestone 1'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-slate-400">Deadline: {project.deadline}</span>
                <Link to={`/client/projects/${project.id}`}>
                  <Button variant="outline" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    View Project
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
