import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MessageSquare, Send } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2"><MessageSquare className="w-7 h-7 text-blue-400" /> Project Chat</h1>
        <p className="text-xs text-slate-400 mt-1">{selectedUser ? `Direct governance chat with ${selectedUser.name}.` : 'Keep project decisions and delivery updates in one auditable thread.'}</p>
      </div>
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <select value={projectId} onChange={(event) => setProjectId(event.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white">
          {visibleProjects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}
        </select>
        {!visibleProjects.length && <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mt-3">No project conversation exists for this user yet. Use the Email action from Users to contact them directly.</p>}
        <div className="min-h-[360px] max-h-[520px] overflow-y-auto space-y-3 py-5">
          {projectMessages.map((message) => (
            <div key={message.id} className={`max-w-[85%] p-3 rounded-2xl border ${message.senderId === currentUser.id ? 'ml-auto bg-blue-600/15 border-blue-500/30' : 'bg-slate-950 border-slate-800'}`}>
              <div className="flex justify-between gap-4 text-[10px] text-slate-400"><span className="font-bold text-slate-200">{message.senderName}</span><span>{new Date(message.timestamp).toLocaleString()}</span></div>
              <p className="text-sm text-slate-200 mt-1">{message.content}</p>
            </div>
          ))}
          {!projectMessages.length && <p className="text-center text-xs text-slate-500 py-20">No messages in this project yet.</p>}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-800 pt-4">
          <input value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a project update..." className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 text-sm text-white" />
          <Button type="submit" size="md" leftIcon={<Send className="w-4 h-4" />}>Send</Button>
        </form>
      </div>
    </div>
  );
};
