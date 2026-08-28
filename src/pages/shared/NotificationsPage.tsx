import React from 'react';
import { Bell, Check } from 'lucide-react';
import { useAuthStore, useNotificationStore } from '../../store';

export const NotificationsPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { notifications, markAsRead } = useNotificationStore();
  const userNotifications = notifications.filter((notification) => notification.userId === currentUser.id || notification.userId === 'all');
  return <div className="max-w-3xl mx-auto space-y-6">
    <div><h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2"><Bell className="w-7 h-7 text-blue-400" /> Notifications</h1><p className="text-xs text-slate-400 mt-1">Project, payment, message, and governance activity for your account.</p></div>
    <div className="space-y-3">{userNotifications.map((notification) => <button key={notification.id} onClick={() => markAsRead(notification.id)} className={`w-full text-left bg-slate-900/90 border rounded-2xl p-4 flex gap-3 ${notification.read ? 'border-slate-800' : 'border-blue-500/40'}`}><div className={`w-8 h-8 rounded-xl flex items-center justify-center ${notification.read ? 'bg-slate-800 text-slate-400' : 'bg-blue-500/15 text-blue-400'}`}>{notification.read ? <Check className="w-4 h-4" /> : <Bell className="w-4 h-4" />}</div><div><p className="text-sm font-bold text-white">{notification.title}</p><p className="text-xs text-slate-400 mt-1">{notification.description}</p><span className="text-[10px] text-slate-500">{notification.timestamp}</span></div></button>)}{!userNotifications.length && <div className="text-center text-sm text-slate-500 py-16">You are all caught up.</div>}</div>
  </div>;
};
