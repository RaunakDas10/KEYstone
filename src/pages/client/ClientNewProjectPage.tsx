import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Lock } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { SEED_FREELANCERS } from '../../mock/seedData';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';

export const ClientNewProjectPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { createProject } = useProjectStore();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Tailwind CSS');
  const [budget, setBudget] = useState(50000);
  const [deadline, setDeadline] = useState('2026-10-15');
  const [access, setAccess] = useState<'invited' | 'open'>('open');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-09-10');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(SEED_FREELANCERS[0].id);

  const [milestones, setMilestones] = useState([
    { title: 'Milestone 1: Core Working Demo & Architecture', amount: 25000, deadline: '2026-09-15', criteria: 'Interactive prototype link & repo' },
    { title: 'Milestone 2: Final Integration & Launch', amount: 25000, deadline: '2026-10-15', criteria: 'Production deployment & zero errors' },
  ]);

  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: `Milestone ${milestones.length + 1}: Deliverable`, amount: 10000, deadline: '2026-10-15', criteria: 'Acceptance criteria' },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSecureFunds = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaymentComplete(true);

      const created = createProject({
        title: title || 'New Enterprise Platform Project',
        category,
        description: description || 'High performance modern web application.',
        skills: skillsInput.split(',').map((s) => s.trim()),
        budget: Number(budget),
        deadline,
        access,
        ...(access === 'open' ? { applicationDeadline } : {}),
        ...(access === 'invited' ? (() => { const freelancer = SEED_FREELANCERS.find((item) => item.id === selectedFreelancerId) || SEED_FREELANCERS[0]; return { freelancerId: freelancer.id, freelancerName: freelancer.name, freelancerAvatar: freelancer.avatar, freelancerTitle: freelancer.title }; })() : {}),
        clientId: currentUser.id,
        clientName: currentUser.name,
        clientAvatar: currentUser.avatar,
        milestones: milestones.map((m, idx) => ({
          id: `ms_new_${idx}`,
          projectId: 'new_proj',
          title: m.title,
          description: m.criteria,
          amount: Number(m.amount),
          deadline: m.deadline,
          acceptanceCriteria: [m.criteria],
          status: 'pending',
          fundState: 'IN_CUSTODY',
        })),
      });

      setTimeout(() => {
        navigate(`/client/projects/${created.id}`);
      }, 1500);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* Step Indicator Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
        {['Basics', 'Budget', 'Milestones', 'Review', 'Secure Funds'].map((sName, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isPassed = step > stepNum;

          return (
            <div key={sName} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isPassed
                    ? 'bg-emerald-500 text-slate-950'
                    : isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {isPassed ? <CheckCircle2 className="w-4 h-4 stroke-[3]" /> : stepNum}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${isActive ? 'text-white' : 'text-slate-500'}`}>
                {sName}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1: BASICS */}
      {step === 1 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">Step 1: Project Basics</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
              <input
                type="text"
                placeholder="e.g. Next-Gen B2B SaaS Analytics Portal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Freelancer access</label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setAccess('invited')} className={`text-left p-3 rounded-xl border ${access === 'invited' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950'}`}><strong className="block text-sm text-white">Choose a freelancer</strong><span className="text-[11px] text-slate-400">Select a verified freelancer for this contract.</span></button>
                <button type="button" onClick={() => setAccess('open')} className={`text-left p-3 rounded-xl border ${access === 'open' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}><strong className="block text-sm text-white">Open to all</strong><span className="text-[11px] text-slate-400">Collect freelancer profiles, then select one after the deadline.</span></button>
              </div>
              {access === 'invited' && <select value={selectedFreelancerId} onChange={(e) => setSelectedFreelancerId(e.target.value)} className="w-full mt-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500">{SEED_FREELANCERS.map((freelancer) => <option key={freelancer.id} value={freelancer.id}>{freelancer.name} - {freelancer.title}</option>)}</select>}
              {access === 'open' && <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3"><label className="mb-1 block text-xs font-semibold text-emerald-300">Profile submission deadline</label><input type="date" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500" /><p className="mt-2 text-[11px] leading-relaxed text-slate-400">Freelancers can submit their profiles until this date. You can choose an applicant only after it expires.</p></div>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile Apps">Mobile Apps</option>
                <option value="AI & Data Science">AI & Data Science</option>
                <option value="UI/UX Design">UI/UX Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Requirements</label>
              <textarea
                rows={4}
                placeholder="Detailed scope, technical requirements, and acceptance criteria..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills (Comma separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="primary" size="md" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Budget & Timeline
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: BUDGET & TIMELINE */}
      {step === 2 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-1xl font-bold text-white">Step 2: Budget & Timeline</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Budget (INR ₹)</label>
              <input
                type="number"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(3)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Define Milestones
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: MILESTONES */}
      {step === 3 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Step 3: Define Milestone Checkpoints</h2>
            <Button variant="outline" size="sm" onClick={handleAddMilestone} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Milestone
            </Button>
          </div>

          <div className="space-y-4">
            {milestones.map((m, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400">Milestone #{idx + 1}</span>
                  {milestones.length > 1 && (
                    <button onClick={() => handleRemoveMilestone(idx)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Milestone Title"
                    value={m.title}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].title = e.target.value;
                      setMilestones(updated);
                    }}
                    className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-2.5"
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    value={m.amount}
                    onChange={(e) => {
                      const updated = [...milestones];
                      updated[idx].amount = Number(e.target.value);
                      setMilestones(updated);
                    }}
                    className="bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold rounded-xl p-2.5"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="primary" size="md" onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: Review Summary
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & SUMMARY */}
      {step === 4 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">Step 4: Project Summary Review</h2>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Title:</span>
              <span className="font-bold text-white">{title || 'Next-Gen B2B SaaS Analytics Portal'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Total Budget:</span>
              <span className="font-bold text-emerald-400 font-mono text-base">₹{budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Assigned Freelancer:</span>
              <span className="font-bold text-white">{access === 'invited' ? `${SEED_FREELANCERS.find((item) => item.id === selectedFreelancerId)?.name} (Selected freelancer)` : 'Open to verified freelancers'}</span>
            </div>
            {access === 'open' && <div className="flex justify-between border-b border-slate-800 pb-3"><span className="text-slate-400">Profile deadline:</span><span className="font-bold text-emerald-400">{applicationDeadline}</span></div>}
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-300 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>KEYStone Payment Lock Notice:</strong>
              <p className="mt-1">
                100% of project funds (₹{budget.toLocaleString()}) will be deposited into KEYStone Escrow. The freelancer cannot withdraw funds until you approve the working demo.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="outline" size="md" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-4 h-4" />}>
              Back
            </Button>
            <Button variant="emerald" size="lg" onClick={() => setStep(5)} rightIcon={<Lock className="w-4 h-4" />}>
              Proceed to Secure Funds
            </Button>
          </div>
        </div>
      )}

      {/* STEP 5: SECURE FUNDS PAYMENT */}
      {step === 5 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          {isPaymentComplete ? (
            <div className="py-8 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-10 h-10 stroke-[3]" />
              </div>
              <h2 className="text-2xl font-black text-white">Funds Secured in Custody!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                ₹{budget.toLocaleString()} is locked safely in the KEYStone Escrow Vault. Redirecting to your active project workspace...
              </p>
            </div>
          ) : (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="w-14 h-14 bg-blue-600/20 text-blue-400 border border-blue-500/40 rounded-2xl flex items-center justify-center mx-auto">
                <Lock className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-white">Deposit Project Funds</h2>
                <p className="text-xs text-slate-400 mt-1">Simulated Razorpay / Stripe Connect Escrow Checkout</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Project Escrow Deposit:</span>
                  <span className="font-bold text-white">₹{budget.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Platform Fee (0% Hackathon):</span>
                  <span className="font-bold text-emerald-400">₹0</span>
                </div>
                <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800 text-sm">
                  <span>Total Amount Secured:</span>
                  <span className="font-mono text-blue-400">₹{budget.toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isProcessingPayment}
                onClick={handleSecureFunds}
              >
                Deposit & Lock ₹{budget.toLocaleString()} in Custody
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
