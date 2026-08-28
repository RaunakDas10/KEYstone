import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, Award, Clock, Star, ExternalLink, CheckCircle2, ArrowRight, FolderGit2 } from 'lucide-react';
import { SEED_USERS, SEED_PORTFOLIO } from '../../mock/seedData';
import { TrustScoreCard } from '../../components/common/TrustScoreCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore, useNotificationStore, useProjectStore } from '../../store';

export const FreelancerProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const { currentUser } = useAuthStore();
  const { projects } = useProjectStore();
  const { addNotification } = useNotificationStore();
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const freelancer = SEED_USERS.freelancer; // default to Ananya Roy for rich view

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedProject = projects.find((project) => project.id === selectedProjectId) || projects[0];
    if (selectedProject) addNotification({ userId: freelancer.id, type: 'project', title: 'New project invitation', description: `${currentUser.name} invited you to ${selectedProject.title}.`, link: `/freelancer/projects/${selectedProject.id}` });
    setInviteSuccess(true);
    setTimeout(() => {
      setInviteSuccess(false);
      setIsInviteModalOpen(false);
    }, 2000);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <img
                src={freelancer.avatar}
                alt={freelancer.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-blue-500/40 shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-white">{freelancer.name}</h1>
                  {freelancer.verified && (
                    <Badge variant="emerald" icon={<Award className="w-3.5 h-3.5" />}>
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm font-semibold text-blue-400 mb-2">{freelancer.title}</p>
                <p className="text-xs text-slate-400 max-w-xl leading-relaxed">{freelancer.bio}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full md:w-auto">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsInviteModalOpen(true)}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Invite to Project
              </Button>
              <div className="text-center text-xs font-mono text-slate-400">
                Rate: <strong className="text-white">₹{freelancer.hourlyRate?.toLocaleString()}/hr</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Grid: Trust Score + Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <TrustScoreCard user={freelancer} />
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                KEYStone Track Record
              </h4>

              <div className="space-y-4 text-xs">
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Completed Projects:</span>
                  <span className="font-bold text-white font-mono">{freelancer.projectsCompleted}</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">On-Time Delivery Rate:</span>
                  <span className="font-bold text-emerald-400 font-mono">{freelancer.onTimeRate}%</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Completion Rate:</span>
                  <span className="font-bold text-blue-400 font-mono">{freelancer.completionRate}%</span>
                </div>
                <div className="flex justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Dispute History:</span>
                  <span className="font-bold text-emerald-400 font-mono">1% (Clean)</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 text-center">
              Member since {freelancer.joinedDate}
            </div>
          </div>
        </div>

        {/* Portfolio Gallery */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-blue-400" />
              Verified Portfolio & Deliverables
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {SEED_PORTFOLIO.map((item) => (
              <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group">
                <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{item.category}</span>
                  <h4 className="text-base font-bold text-white mt-1 mb-2">{item.title}</h4>
                  <p className="text-xs text-slate-400 mb-4">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {item.technologies.map((t) => (
                        <span key={t} className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                    {item.demoUrl && (
                      <a href={item.demoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold">
                        Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title={`Invite ${freelancer.name} to Project`}
        subtitle="Select an existing active project or start a new protected project contract."
      >
        {inviteSuccess ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h4 className="text-lg font-bold text-white">Project Invitation Sent!</h4>
            <p className="text-xs text-slate-400">{freelancer.name} will receive a notification to review your offer.</p>
          </div>
        ) : (
          <form onSubmit={handleSendInvite} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Select Project</label>
              <select value={selectedProjectId} onChange={(e) => setSelectedProjectId(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500">
                <option value="">Select a project</option>
                {projects.filter((project) => project.clientId === currentUser.id || project.access === 'open').map((project) => <option key={project.id} value={project.id}>{project.title} (₹{project.budget.toLocaleString()})</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Note / Brief</label>
              <textarea
                rows={3}
                placeholder="Briefly describe what you would like Ananya to build..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-xs text-blue-300 leading-relaxed">
              🔒 <strong>KEYStone Custody Guarantee:</strong> Project funds will remain 100% locked until you approve the working demo.
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <Button variant="outline" size="sm" type="button" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Send Invitation
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
