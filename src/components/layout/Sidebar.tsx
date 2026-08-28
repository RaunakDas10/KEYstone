import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Store,
  MessageSquare,
  Receipt,
  Settings,
  Wallet,
  FolderGit2,
  Users,
  ShieldAlert,
  Shield,
  History,
} from 'lucide-react';
import { useAuthStore } from '../../store';

export const Sidebar: React.FC = () => {
  const { currentUser } = useAuthStore();
  const location = useLocation();

  const clientLinks = [
    { to: '/client/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/client/projects', label: 'Projects', icon: Briefcase },
    { to: '/client/messages', label: 'Messages', icon: MessageSquare },
    { to: '/client/transactions', label: 'Transactions', icon: Receipt },
    { to: '/client/settings', label: 'Settings', icon: Settings },
  ];

  const freelancerLinks = [
    { to: '/freelancer/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/freelancer/projects', label: 'My Projects', icon: Briefcase },
    { to: '/freelancer/income', label: 'Income', icon: Wallet },
    { to: '/freelancer/transactions', label: 'Ledger', icon: Receipt },
    { to: '/freelancer/portfolio', label: 'Portfolio', icon: FolderGit2 },
    { to: '/freelancer/messages', label: 'Messages', icon: MessageSquare },
    { to: '/freelancer/settings', label: 'Settings', icon: Settings },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Command Center', icon: LayoutDashboard },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/projects', label: 'All Projects', icon: Briefcase },
    { to: '/admin/disputes', label: 'Disputes Station', icon: ShieldAlert },
    { to: '/admin/funds', label: 'Vault Control', icon: Shield },
    { to: '/admin/ledger', label: 'Full Ledger', icon: History },
    { to: '/admin/messages', label: 'Project Chat', icon: MessageSquare },
    { to: '/admin/reports', label: 'Reports', icon: ShieldAlert },
    { to: '/admin/settings', label: 'Platform Config', icon: Settings },
  ];

  const links =
    currentUser.role === 'client'
      ? clientLinks
      : currentUser.role === 'freelancer'
      ? freelancerLinks
      : adminLinks;

  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800/80 shrink-0 hidden lg:block p-4 min-h-[calc(100vh-4rem)]">
      {/* Role Badge */}
      <div className="mb-6 p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.name}
          className="w-10 h-10 rounded-lg object-cover border border-slate-700"
        />
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
          <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {currentUser.role}
          </span>
        </div>
      </div>

      {/* Navigation Group */}
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location.pathname === link.to;

          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-500/5'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Security Vault Indicator */}
      <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-blue-950/40 to-indigo-950/40 border border-blue-500/20 text-xs">
        <div className="flex items-center gap-2 text-blue-400 font-bold mb-1">
          <Shield className="w-4 h-4" />
          Escrow Active
        </div>
        <p className="text-[11px] text-slate-400 leading-snug">
          100% project funds locked & protected by platform protocol rules.
        </p>
      </div>
    </aside>
  );
};
