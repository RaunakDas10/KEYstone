import React from 'react';
import { Shield, UserCheck, RefreshCw, Zap, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { useAuthStore, useProjectStore, useDemoStore, DemoPreset } from '../../store';
import { UserRole } from '../../types';

export const DemoControlBar: React.FC = () => {
  const { currentUser, switchRole } = useAuthStore();
  const { setScenario, activePreset } = useDemoStore();
  const { resetAll } = useProjectStore();

  const scenarios: { id: DemoPreset; label: string; icon: any }[] = [
    { id: 'standard_success', label: '1. Standard Flow (Approval)', icon: CheckCircle2 },
    { id: 'resolution_90_10', label: '2. 90/10 Fair Resolution', icon: Zap },
    { id: 'inactivity_unlock', label: '3. 7-Day Auto-Unlock', icon: Clock },
    { id: 'dispute_active', label: '4. Dispute Station', icon: AlertTriangle },
  ];

  return (
    <div className="bg-slate-950 border-b border-blue-500/30 px-4 py-2 sticky top-0 z-50 shadow-lg text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2">
        {/* Title */}
        <div className="flex items-center gap-2">
          <span className="bg-blue-600 text-white font-black text-[10px] uppercase px-2 py-0.5 rounded tracking-wider shadow-sm">
            HACKATHON DEMO MODE
          </span>
          <span className="text-slate-400 font-medium hidden sm:inline">
            Active Persona: <strong className="text-white capitalize">{currentUser.role}</strong> ({currentUser.name})
          </span>
        </div>

        {/* Role Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <span className="text-[10px] text-slate-400 font-bold uppercase px-2">Role:</span>
          {(['client', 'freelancer', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => switchRole(r)}
              className={`px-2.5 py-1 rounded-lg font-semibold capitalize transition-all ${
                currentUser.role === r
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Quick Scenario Preset Triggers */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 md:pb-0">
          <span className="text-[10px] text-slate-400 font-bold uppercase px-1 shrink-0">Scenarios:</span>
          {scenarios.map((s) => {
            const Icon = s.icon;
            const isActive = activePreset === s.id;
            return (
              <button
                key={s.id}
                onClick={() => setScenario(s.id)}
                className={`px-2.5 py-1 rounded-lg font-medium text-[11px] flex items-center gap-1 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-purple-600/30 text-purple-300 border border-purple-500/50 font-semibold'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-850 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {s.label}
              </button>
            );
          })}

          <button
            onClick={resetAll}
            title="Reset All Demo Data"
            className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors ml-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
