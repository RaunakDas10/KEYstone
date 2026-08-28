import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Lock, Banknote } from 'lucide-react';
import { Project } from '../../types';

export interface TimelineVisualizerProps {
  project: Project;
  className?: string;
}

export const TimelineVisualizer: React.FC<TimelineVisualizerProps> = ({ project, className = '' }) => {
  const events = [
    {
      title: 'Project Created',
      desc: `Created by ${project.clientName}`,
      timestamp: project.createdAt.split('T')[0],
      status: 'completed',
      icon: ShieldCheck,
    },
    {
      title: 'Funds Secured in Custody',
      desc: `₹${project.budget.toLocaleString()} locked in KEYStone Escrow`,
      timestamp: project.createdAt.split('T')[0],
      status: 'completed',
      icon: ShieldCheck,
    },
    {
      title: 'Checkpoint Demo Submission',
      desc: project.submissions.length > 0 ? 'Working demo link & repository submitted' : 'Awaiting freelancer demo submission',
      timestamp: project.submissions.length > 0 ? project.submissions[0].submittedAt.split('T')[0] : 'Pending',
      status: project.submissions.length > 0 ? 'completed' : 'active',
      icon: Lock,
    },
    {
      title: 'Client Checkpoint Review',
      desc: project.fundState === 'FROZEN' ? 'Client currently evaluating demo' : project.fundState === 'WITHDRAWABLE' ? 'Approved by client' : 'Pending submission',
      timestamp: project.fundState === 'FROZEN' ? 'Now' : 'Pending',
      status: project.fundState === 'FROZEN' ? 'active' : project.fundState === 'WITHDRAWABLE' ? 'completed' : 'upcoming',
      icon: Clock,
    },
    {
      title: 'Funds Withdrawable',
      desc: `₹${project.budget.toLocaleString()} available for payout`,
      timestamp: project.fundState === 'WITHDRAWABLE' ? 'Ready' : 'Pending approval',
      status: project.fundState === 'WITHDRAWABLE' ? 'completed' : 'upcoming',
      icon: Banknote,
    },
  ];

  return (
    <div className={`bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 ${className}`}>
      <h4 className="text-sm font-bold text-white tracking-tight mb-5 flex items-center gap-2">
        <Clock className="w-4 h-4 text-blue-400" />
        Project Audit Timeline
      </h4>

      <div className="relative pl-6 border-l-2 border-slate-800 space-y-6">
        {events.map((event, idx) => {
          const isCompleted = event.status === 'completed';
          const isActive = event.status === 'active';
          const Icon = event.icon;

          return (
            <div key={idx} className="relative group">
              {/* Timeline Bullet */}
              <div
                className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center border-2 ${
                  isCompleted
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                    : isActive
                    ? 'bg-blue-600 border-blue-400 text-white animate-pulse'
                    : 'bg-slate-950 border-slate-700 text-slate-600'
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : <Icon className="w-3 h-3" />}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <h5 className={`text-sm font-bold ${isCompleted ? 'text-white' : isActive ? 'text-blue-400' : 'text-slate-500'}`}>
                    {event.title}
                  </h5>
                  <span className="text-[11px] font-mono text-slate-400">{event.timestamp}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{event.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
