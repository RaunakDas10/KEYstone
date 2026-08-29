import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ShieldCheck, Lock, CheckCircle2, Clock, MessageSquare, ArrowRight } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { FundStateBadge } from '../../components/common/FundStateBadge';
import { FundLifecycleVisualizer } from '../../components/common/FundLifecycleVisualizer';

export const ClientOverview: React.FC = () => {
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
          <span className="text-[10px] text-amber-400/80 mt-1 block">Action Required (Demo Frozen)</span>
        </div>

        <div className="bg-slate-900/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl glow-emerald">
          <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">Completed</span>
          <span className="text-2xl font-black text-white font-mono mt-1 block">{completedCount}</span>
          <span className="text-[10px] text-emerald-400/80 mt-1 block">Zero Dispute Settlements</span>
        </div>
      </div>

      {/* Primary Visualizer Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
              Active Project Escrow Lifecycle
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Live cryptographic state machine showing milestone custody transitions
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {clientProjects[0]?.id || 'PROJ_01'}
          </span>
        </div>

        {clientProjects[0] && (
          <FundLifecycleVisualizer
            state={clientProjects[0].fundState}
            amount={clientProjects[0].budget}
            inactivityDays={clientProjects[0].inactivityDays}
          />
        )}
      </div>

      {/* Projects List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Your Managed Projects</h2>
          <span className="text-xs text-slate-400">{clientProjects.length} total projects</span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {clientProjects.map((project) => (
            <div
              key={project.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                    {project.category}
                  </span>
                  <FundStateBadge state={project.fundState} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-white">{project.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-1">{project.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                  <span>Freelancer: <strong className="text-white">{project.freelancerName || 'Open for selection'}</strong></span>
                  <span>•</span>
                  <span>Budget: <strong className="text-white font-mono">₹{project.budget.toLocaleString()}</strong></span>
                  <span>•</span>
                  <span>Milestones: <strong className="text-white">{project.milestones.length}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                <Link to={`/client/projects/${project.id}`} className="w-full md:w-auto">
                  <Button variant="primary" size="sm" fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Manage Escrow
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

export const ClientDashboard = ClientOverview;
