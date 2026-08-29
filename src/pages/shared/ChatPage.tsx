import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCheck, Clock3, MessageSquare, Paperclip, Search, Send, ShieldCheck, Smile, UserRound } from 'lucide-react';
import { useAuthStore, useMessageStore, useProjectStore } from '../../store';
import { SEED_USERS } from '../../mock/seedData';
import { Button } from '../../components/ui/Button';

export const ChatPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const { messages, sendMessage } = useMessageStore();
  const [searchParams] = useSearchParams();
  const selectedUserId = searchParams.get('userId');
  const selectedUser = Object.values(SEED_USERS).find((user) => user.id === selectedUserId);
  const visibleProjects = currentUser.role === 'admin'
    ? projects.filter((project) => !selectedUserId || project.clientId === selectedUserId || project.freelancerId === selectedUserId)
    : projects.filter((p) => p.clientId === currentUser.id || p.freelancerId === currentUser.id);
  const [projectId, setProjectId] = useState(visibleProjects[0]?.id || '');
  const [content, setContent] = useState('');
  const projectMessages = messages.filter((message) => message.projectId === projectId);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!content.trim() || !projectId) return;
    sendMessage(projectId, content.trim(), currentUser);
    setContent('');
  };

  const activeProject = visibleProjects.find((project) => project.id === projectId) || visibleProjects[0];
  const otherParty = currentUser.role === 'client' ? activeProject?.freelancerName : activeProject?.clientName;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-400">Workspace communication</p><h1 className="mt-1 flex items-center gap-2 text-2xl font-black text-white sm:text-3xl"><MessageSquare className="h-7 w-7 text-blue-400" /> Messages</h1><p className="mt-1 text-xs text-slate-400">Project decisions, delivery updates, and protocol events in one place.</p></div><div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-[11px] text-emerald-300"><ShieldCheck className="h-4 w-4" /> Auditable project threads</div></div>
      <div className="grid min-h-[650px] overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 shadow-2xl lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-slate-800 lg:border-b-0 lg:border-r"><div className="border-b border-slate-800 p-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input placeholder="Search conversations" className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white" /></div></div><div className="max-h-64 overflow-y-auto p-2 lg:max-h-[570px]">{visibleProjects.map((project) => <button key={project.id} onClick={() => setProjectId(project.id)} className={`w-full rounded-2xl p-3 text-left transition-colors ${project.id === projectId ? 'bg-blue-600/15 ring-1 ring-blue-500/30' : 'hover:bg-slate-800/70'}`}><div className="flex items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-blue-400"><UserRound className="h-5 w-5" /></div><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-2"><p className="truncate text-xs font-bold text-white">{currentUser.role === 'client' ? project.freelancerName || 'Open project' : project.clientName}</p><span className="text-[10px] text-slate-500">{new Date(project.lastActivityAt).toLocaleDateString()}</span></div><p className="mt-1 truncate text-[11px] text-slate-400">{project.title}</p><span className="mt-2 inline-flex rounded bg-slate-950 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-400">{project.fundState}</span></div></div></button>)}{!visibleProjects.length && <p className="p-4 text-center text-xs text-slate-500">No conversations available.</p>}</div></aside>
        <section className="flex min-w-0 flex-col"><header className="flex items-center justify-between gap-4 border-b border-slate-800 p-4 sm:p-5"><div className="flex min-w-0 items-center gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600/15 text-blue-400"><UserRound className="h-5 w-5" /></div><div className="min-w-0"><h2 className="truncate text-sm font-bold text-white">{otherParty || 'Project conversation'}</h2><p className="truncate text-xs text-slate-400">{activeProject?.title || 'Select a project to begin'}</p></div></div><div className="hidden items-center gap-1.5 text-[10px] text-slate-500 sm:flex"><Clock3 className="h-3.5 w-3.5" /> Activity is timestamped</div></header>{!visibleProjects.length && <p className="m-5 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300">No project conversation exists for this user yet. Use the existing project workflow to create a thread.</p>}<div className="flex-1 space-y-4 overflow-y-auto bg-slate-950/30 p-4 sm:p-6">{projectMessages.map((message) => message.isSystemEvent ? <div key={message.id} className="mx-auto max-w-lg rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-2 text-center text-[10px] font-medium text-blue-300">{message.content}<span className="mt-1 block text-[9px] text-slate-500">{new Date(message.timestamp).toLocaleString()}</span></div> : <div key={message.id} className={`flex gap-2.5 ${message.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[82%] rounded-2xl px-4 py-3 ${message.senderId === currentUser.id ? 'rounded-br-md bg-blue-600 text-white' : 'rounded-bl-md border border-slate-800 bg-slate-900 text-slate-200'}`}><div className="mb-1 flex items-center gap-2 text-[10px] opacity-70"><span className="font-bold">{message.senderName}</span><span>{new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div><p className="text-sm leading-relaxed">{message.content}</p>{message.senderId === currentUser.id && <div className="mt-1 flex justify-end"><CheckCheck className="h-3.5 w-3.5 opacity-70" /></div>}</div></div>)}{!projectMessages.length && visibleProjects.length > 0 && <div className="flex h-full min-h-64 flex-col items-center justify-center text-center"><MessageSquare className="h-10 w-10 text-slate-700" /><p className="mt-3 text-sm font-semibold text-slate-300">Start the conversation</p><p className="mt-1 text-xs text-slate-500">Share a project update or ask a question.</p></div>}</div><form onSubmit={handleSubmit} className="border-t border-slate-800 bg-slate-900/80 p-4"><div className="flex items-center gap-2 rounded-2xl border border-slate-700 bg-slate-950 p-2 focus-within:border-blue-500/60"><button type="button" title="Attach a file" className="rounded-xl p-2 text-slate-500 hover:bg-slate-800 hover:text-white"><Paperclip className="h-4 w-4" /></button><input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a message or project update..." className="min-w-0 flex-1 bg-transparent px-1 text-sm text-white outline-none" /><button type="button" title="Add emoji" className="rounded-xl p-2 text-slate-500 hover:bg-slate-800 hover:text-white"><Smile className="h-4 w-4" /></button><Button type="submit" size="sm" disabled={!content.trim() || !projectId} leftIcon={<Send className="h-4 w-4" />}>Send</Button></div><p className="mt-2 text-[10px] text-slate-500">Messages are linked to the selected project audit trail.</p></form></section>
      </div>
    </div>
  );
};
