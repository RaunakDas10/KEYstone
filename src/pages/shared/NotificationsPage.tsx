import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  CreditCard,
  FolderGit2,
  AlertTriangle,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  Inbox,
  CalendarDays,
  IndianRupee,
} from 'lucide-react';
import { useAuthStore, useNotificationStore, useProjectStore } from '../../store';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { Notification } from '../../types';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { notifications, markAsRead } = useNotificationStore();
  const { projects, respondToProjectInvitation } = useProjectStore();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'unread' | 'payment' | 'project'>('all');
  const [invitationProjectId, setInvitationProjectId] = useState<string | null>(null);
  const [invitationError, setInvitationError] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  const invitationProject = projects.find((project) => project.id === invitationProjectId);

  const userNotifications = notifications.filter(
    (notification) => notification.userId === currentUser.id || notification.userId === 'all'
  );

  const filteredNotifications = userNotifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'payment') return n.type === 'payment';
    if (filter === 'project') return n.type === 'project' || n.type === 'checkpoint';
    return true;
  });

  const unreadCount = userNotifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: Notification) => {
    markAsRead(notification.id);
    const isPendingInvitation = currentUser.role === 'freelancer'
      && Boolean(notification.projectId)
      && projects.some((project) => project.id === notification.projectId && project.freelancerId === currentUser.id && project.status === 'invitation_pending');
    if (isPendingInvitation) {
      setInvitationError('');
      setInvitationProjectId(notification.projectId!);
      return;
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  const handleInvitationResponse = async (response: 'accept' | 'reject') => {
    if (!invitationProject) return;
    setInvitationError('');
    setIsResponding(true);
    const responded = await respondToProjectInvitation(invitationProject.id, currentUser, response);
    setIsResponding(false);
    if (!responded) {
      setInvitationError('This invitation is no longer available. Refresh your notifications and try again.');
      return;
    }
    setInvitationProjectId(null);
    if (response === 'accept') navigate(`/freelancer/projects/${invitationProject.id}`);
  };

  const handleMarkAllAsRead = () => {
    userNotifications.filter((n) => !n.read).forEach((n) => markAsRead(n.id));
  };

  const getIconForType = (type: Notification['type'], read: boolean) => {
    const baseColor = read ? 'text-slate-400' : 'text-white';
    switch (type) {
      case 'payment':
        return <CreditCard className={`w-4 h-4 ${read ? baseColor : 'text-emerald-400'}`} />;
      case 'checkpoint':
        return <Sparkles className={`w-4 h-4 ${read ? baseColor : 'text-amber-400'}`} />;
      case 'dispute':
        return <AlertTriangle className={`w-4 h-4 ${read ? baseColor : 'text-rose-400'}`} />;
      case 'system':
        return <ShieldAlert className={`w-4 h-4 ${read ? baseColor : 'text-purple-400'}`} />;
      case 'project':
      default:
        return <FolderGit2 className={`w-4 h-4 ${read ? baseColor : 'text-blue-400'}`} />;
    }
  };

  const getBgForType = (type: Notification['type'], read: boolean) => {
    if (read) return 'bg-slate-800/80 border-slate-700/50';
    switch (type) {
      case 'payment':
        return 'bg-emerald-500/10 border-emerald-500/30';
      case 'checkpoint':
        return 'bg-amber-500/10 border-amber-500/30';
      case 'dispute':
        return 'bg-rose-500/10 border-rose-500/30';
      case 'system':
        return 'bg-purple-500/10 border-purple-500/30';
      case 'project':
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-lg shadow-blue-500/10">
              <Bell className="w-5 h-5" />
            </div>
            Activity & Notifications
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time project, escrow payment, security, and governance alerts for your account.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-xl transition-all self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: 'all', label: `All (${userNotifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'payment', label: 'Payments & Escrow' },
          { key: 'project', label: 'Projects & Milestones' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              filter === tab.key
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <div
            key={notification.id}
            onClick={() => handleNotificationClick(notification)}
            className={`group w-full text-left bg-slate-900/90 hover:bg-slate-850 border rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 transition-all cursor-pointer ${
              notification.read ? 'border-slate-800/80 opacity-80 hover:opacity-100' : 'border-blue-500/40 shadow-lg shadow-blue-500/5'
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center border shrink-0 mt-0.5 ${getBgForType(
                  notification.type,
                  notification.read
                )}`}
              >
                {getIconForType(notification.type, notification.read)}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className={`text-sm font-bold ${notification.read ? 'text-slate-200' : 'text-white'}`}>
                    {notification.title}
                  </p>
                  {!notification.read && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  )}
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50">
                    {notification.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {notification.description}
                </p>

                <p className="text-[10px] text-slate-500 pt-1 font-medium">
                  {notification.timestamp}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-center">
              {notification.link && (
                <div className="w-8 h-8 rounded-xl bg-slate-800/60 group-hover:bg-blue-600/20 group-hover:text-blue-400 text-slate-400 border border-slate-700/40 group-hover:border-blue-500/40 flex items-center justify-center transition-all">
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              )}
            </div>
          </div>
        ))}

        {!filteredNotifications.length && (
          <div className="text-center py-20 bg-slate-900/40 border border-slate-800/60 rounded-3xl space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700 flex items-center justify-center mx-auto text-slate-500">
              <Inbox className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-300">No notifications in this view</p>
            <p className="text-xs text-slate-500">You are all caught up on your account activity.</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(invitationProject)}
        onClose={() => !isResponding && setInvitationProjectId(null)}
        title="Project invitation"
        subtitle="Review the work terms before you commit."
        footer={<><Button variant="outline" onClick={() => setInvitationProjectId(null)} disabled={isResponding}>Decide later</Button><Button variant="danger" onClick={() => handleInvitationResponse('reject')} isLoading={isResponding}>Decline project</Button><Button variant="emerald" onClick={() => handleInvitationResponse('accept')} isLoading={isResponding}>Accept project</Button></>}
      >
        {invitationProject && <div className="space-y-5">
          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4"><p className="text-[10px] font-bold uppercase tracking-wider text-blue-300">Invitation from {invitationProject.clientName}</p><h4 className="mt-1 text-lg font-bold text-white">{invitationProject.title}</h4><p className="mt-2 text-xs leading-relaxed text-slate-300">{invitationProject.description || 'No additional project description was provided.'}</p></div>
          <div className="grid gap-3 sm:grid-cols-2"><InfoRow icon={<IndianRupee className="h-4 w-4" />} label="Secured project budget" value={`₹${invitationProject.budget.toLocaleString()}`} /><InfoRow icon={<CalendarDays className="h-4 w-4" />} label="Project deadline" value={new Date(`${invitationProject.deadline}T00:00:00`).toLocaleDateString()} /></div>
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-4"><p className="text-xs font-semibold text-white">{invitationProject.milestones.length} funded milestone{invitationProject.milestones.length === 1 ? '' : 's'}</p><div className="mt-3 space-y-2">{invitationProject.milestones.map((milestone, index) => <div key={milestone.id} className="flex items-center justify-between gap-3 text-xs"><span className="text-slate-300">{index + 1}. {milestone.title}</span><span className="shrink-0 font-mono font-bold text-emerald-300">₹{milestone.amount.toLocaleString()}</span></div>)}</div></div>
          <p className="text-[11px] leading-relaxed text-slate-400">Accepting activates the workspace. Declining before work begins returns the full escrow deposit to the client, with no penalty to you.</p>
          {invitationError && <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">{invitationError}</p>}
        </div>}
      </Modal>
    </div>
  );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => <div className="rounded-xl border border-slate-800 bg-slate-950 p-3"><span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{icon}{label}</span><span className="mt-1 block text-sm font-semibold text-white">{value}</span></div>;
