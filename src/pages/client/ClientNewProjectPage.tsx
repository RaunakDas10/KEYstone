import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2, Lock, Sparkles, Clock, Zap } from 'lucide-react';
import { useAuthStore, useProjectStore } from '../../store';
import { SEED_FREELANCERS } from '../../mock/seedData';
import { Button } from '../../components/ui/Button';
import { AIAnalysisPanel } from '../../components/ai/AIAnalysisPanel';
import { AIMilestonePanel } from '../../components/ai/AIMilestonePanel';
import type { AIAnalysis, AIRequirementArea, AIMilestone } from '../../services/ai/aiService';

// ---- Wizard Step Definitions ----
const STEPS = [
  { num: 1, label: 'Basics' },
  { num: 2, label: 'AI Analysis' },
  { num: 3, label: 'Budget' },
  { num: 4, label: 'Milestones' },
  { num: 5, label: 'Review' },
  { num: 6, label: 'Secure Funds' },
];

export const ClientNewProjectPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { createProject } = useProjectStore();
  const navigate = useNavigate();

  // ---- Step State ----
  const [step, setStep] = useState(1);

  // ---- Step 1: Basics ----
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Web Development');
  const [description, setDescription] = useState('');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Tailwind CSS');
  const [access, setAccess] = useState<'invited' | 'open'>('open');
  const [applicationDeadline, setApplicationDeadline] = useState('2026-09-10');
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(SEED_FREELANCERS[0].id);

  // ---- Step 2: AI Analysis ----
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [resolvedRequirements, setResolvedRequirements] = useState<AIRequirementArea[]>([]);

  // ---- Step 3: Budget & Timeline ----
  const [budget, setBudget] = useState(50000);
  const [deadline, setDeadline] = useState('2026-10-15');
  const [checkpointReviewDays, setCheckpointReviewDays] = useState(7);
  const [finalReviewDays, setFinalReviewDays] = useState(7);

  // ---- Step 4: AI Milestones ----
  const [milestones, setMilestones] = useState([
    { title: 'Milestone 1: Core Working Demo & Architecture', amount: 25000, deadline: '2026-09-15', criteria: 'Interactive prototype link & repo', deliverables: ['Core architecture', 'Working prototype'], reviewDays: 3 },
    { title: 'Milestone 2: Final Integration & Launch', amount: 25000, deadline: '2026-10-15', criteria: 'Production deployment & zero errors', deliverables: ['Production deployment', 'Zero critical errors'], reviewDays: 7 },
  ]);

  // ---- Step 6: Payment ----
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // ---- Helper: Build AI input from current form state ----
  const buildAIInput = () => ({
    title: title || 'Untitled Project',
    description,
    category,
    skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
    budget,
    deadline,
    requirements: description,
    milestones: milestones.map((m) => ({ title: m.title, amount: m.amount, criteria: m.criteria })),
  });

  // ---- AI Analysis handlers ----
  const handleAIAnalysisComplete = (analysis: AIAnalysis, resolved: AIRequirementArea[]) => {
    setAiAnalysis(analysis);
    setResolvedRequirements(resolved);
    setStep(3);
  };

  // ---- AI Milestone handlers ----
  const handleAIMilestonesAccepted = (aiMilestones: AIMilestone[]) => {
    setMilestones(
      aiMilestones.map((ms, idx) => ({
        title: ms.title,
        amount: ms.suggestedAmount,
        deadline,
        criteria: ms.acceptanceCriteria.join(' | '),
        deliverables: ms.deliverables,
        reviewDays: ms.reviewDays || (idx === 0 ? 3 : idx === 1 ? 7 : 14),
      }))
    );
    setStep(5);
  };

  // ---- Manual milestone management ----
  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: `Milestone ${milestones.length + 1}: Deliverable`, amount: 10000, deadline: '2026-10-15', criteria: 'Acceptance criteria', deliverables: [], reviewDays: 7 },
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  // ---- Fund Securing ----
  const handleSecureFunds = () => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setIsProcessingPayment(false);
      setIsPaymentComplete(true);

      const freelancer = SEED_FREELANCERS.find((f) => f.id === selectedFreelancerId) || SEED_FREELANCERS[0];

      const created = createProject({
        title: title || 'New Enterprise Platform Project',
        category,
        description: description || 'High performance modern web application.',
        skills: skillsInput.split(',').map((s) => s.trim()).filter(Boolean),
        budget: Number(budget),
        deadline,
        checkpointReviewDays,
        finalReviewDays,
        access,
        ...(access === 'open' ? { applicationDeadline } : {}),
        ...(access === 'invited'
          ? { freelancerId: freelancer.id, freelancerName: freelancer.name, freelancerAvatar: freelancer.avatar, freelancerTitle: freelancer.title }
          : {}),
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
          reviewDays: m.reviewDays || 7,
          acceptanceCriteria: m.criteria.split(' | ').filter(Boolean),
          deliverables: m.deliverables || [],
          status: 'pending' as const,
          fundState: 'IN_CUSTODY' as const,
        })),
        deliverables: milestones.flatMap((m, milestoneIndex) => (m.deliverables.length ? m.deliverables : m.criteria.split(' | ').filter(Boolean)).map((description, itemIndex) => ({
          id: `del_new_${milestoneIndex}_${itemIndex}`,
          description,
          milestoneId: `ms_new_${milestoneIndex}`,
          appliesTo: 'CHECKPOINT' as const,
          status: 'PENDING' as const,
        }))),
        // Attach AI analysis (advisory — never used for fund decisions)
        ...(aiAnalysis
          ? {
              aiAnalysis: {
                riskScore: aiAnalysis.riskScore,
                riskLevel: aiAnalysis.riskLevel,
                confidence: aiAnalysis.confidence,
                analyzedAt: aiAnalysis.analyzedAt,
                analysisVersion: aiAnalysis.analysisVersion,
                risks: aiAnalysis.risks,
                missingRequirements: resolvedRequirements.map((r) => ({ id: r.id, area: r.area, resolved: r.resolved })),
                recommendations: aiAnalysis.recommendations,
                issueCount: aiAnalysis.issueCount,
                overallHealth: aiAnalysis.overallHealth,
              },
            }
          : {}),
      });

      setTimeout(() => navigate(`/client/projects/${created.id}`), 1500);
    }, 2000);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      {/* ---- Step Indicator ---- */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center justify-between overflow-x-auto gap-2">
        {STEPS.map(({ num, label }) => {
          const isActive = step === num;
          const isPassed = step > num;
          const isAIStep = num === 2 || num === 4;
          return (
            <div key={num} className="flex items-center gap-2 shrink-0">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                  isPassed
                    ? 'bg-emerald-500 text-slate-950'
                    : isActive
                    ? isAIStep
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      : 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {isPassed ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                ) : isAIStep && isActive ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  num
                )}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className={`text-[10px] font-bold leading-none ${isActive ? 'text-white' : 'text-slate-500'}`}>{label}</span>
                {isAIStep && <span className={`text-[9px] ${isActive ? 'text-indigo-400' : 'text-slate-600'}`}>AI</span>}
              </div>
            </div>
          );
        })}
      </div>

      {/* ========== STEP 1: PROJECT BASICS ========== */}
      {step === 1 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">Step 1: Project Basics</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Title</label>
              <input
                type="text"
                placeholder="e.g. AI E-Commerce Platform with Admin Dashboard"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Freelancer Access</label>
              <div className="grid sm:grid-cols-2 gap-3">
                <button type="button" onClick={() => setAccess('invited')} className={`text-left p-3 rounded-xl border ${access === 'invited' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-800 bg-slate-950'}`}>
                  <strong className="block text-sm text-white">Choose a freelancer</strong>
                  <span className="text-[11px] text-slate-400">Select a verified freelancer for this contract.</span>
                </button>
                <button type="button" onClick={() => setAccess('open')} className={`text-left p-3 rounded-xl border ${access === 'open' ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 bg-slate-950'}`}>
                  <strong className="block text-sm text-white">Open to all</strong>
                  <span className="text-[11px] text-slate-400">Collect freelancer profiles, then select one after the deadline.</span>
                </button>
              </div>
              {access === 'invited' && (
                <select value={selectedFreelancerId} onChange={(e) => setSelectedFreelancerId(e.target.value)} className="w-full mt-3 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500">
                  {SEED_FREELANCERS.map((freelancer) => (
                    <option key={freelancer.id} value={freelancer.id}>{freelancer.name} - {freelancer.title}</option>
                  ))}
                </select>
              )}
              {access === 'open' && (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <label className="mb-1 block text-xs font-semibold text-emerald-300">Profile submission deadline</label>
                  <input type="date" value={applicationDeadline} onChange={(e) => setApplicationDeadline(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500" />
                  <p className="mt-2 text-[11px] leading-relaxed text-slate-400">Freelancers can submit their profiles until this date. You can choose an applicant only after it expires.</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500">
                <option>Web Development</option>
                <option>Mobile Apps</option>
                <option>AI & Data Science</option>
                <option>UI/UX Design</option>
                <option>E-Commerce</option>
                <option>SaaS Platform</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description & Requirements</label>
              <textarea
                rows={5}
                placeholder="Describe your project in detail. What features do you need? What should the final product do? The more detail you provide, the better KEYStone AI can analyze your project."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills (comma-separated)</label>
              <input
                type="text"
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* AI Teaser */}
          <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-indigo-300">Next: KEYStone AI will analyze your project</p>
              <p className="text-[11px] text-slate-400 mt-0.5">AI identifies risks, missing requirements, and generates smart milestones — before you commit funds.</p>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" size="md" onClick={() => setStep(2)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: AI Analysis
            </Button>
          </div>
        </div>
      )}

      {/* ========== STEP 2: AI PROJECT ANALYSIS ========== */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(1)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back to Basics
            </Button>
            <span className="text-xs text-slate-500">Step 2 of 6</span>
          </div>
          <AIAnalysisPanel
            projectInput={buildAIInput()}
            onContinue={handleAIAnalysisComplete}
            onSkip={() => setStep(3)}
          />
        </div>
      )}

      {/* ========== STEP 3: BUDGET & TIMELINE ========== */}
      {step === 3 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Step 3: Budget & Timeline</h2>
            {aiAnalysis && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border bg-indigo-500/10 border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span className="text-[10px] font-bold text-indigo-400">AI Risk: {aiAnalysis.riskScore}/100</span>
              </div>
            )}
          </div>

          {aiAnalysis && aiAnalysis.scoreBreakdown.budgetAdequacy < 60 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-300">
                <strong>AI flagged a budget concern.</strong> Consider increasing your budget or reducing scope before proceeding.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Budget (INR ₹)</label>
              <input
                type="number"
                min={500}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">Micro-project friendly: projects can start at ₹500; each milestone must be at least ₹1.</p>
              {aiAnalysis && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Budget adequacy score: <strong className={aiAnalysis.scoreBreakdown.budgetAdequacy >= 65 ? 'text-emerald-400' : aiAnalysis.scoreBreakdown.budgetAdequacy >= 40 ? 'text-amber-400' : 'text-rose-400'}>{aiAnalysis.scoreBreakdown.budgetAdequacy}%</strong>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Project Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
              {aiAnalysis && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Timeline feasibility score: <strong className={aiAnalysis.scoreBreakdown.timelineFeasibility >= 65 ? 'text-emerald-400' : aiAnalysis.scoreBreakdown.timelineFeasibility >= 40 ? 'text-amber-400' : 'text-rose-400'}>{aiAnalysis.scoreBreakdown.timelineFeasibility}%</strong>
                </p>
              )}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Checkpoint review window</label>
                <select value={checkpointReviewDays} onChange={(e) => setCheckpointReviewDays(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500">
                  {[2, 3, 5, 7, 10, 14, 21].map((days) => <option key={days} value={days}>{days} days</option>)}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">Time to review each working demo.</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Final review window</label>
                <select value={finalReviewDays} onChange={(e) => setFinalReviewDays(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500">
                  {[2, 3, 5, 7, 10, 14, 21, 30].map((days) => <option key={days} value={days}>{days} days</option>)}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">Time to review the final delivery.</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="md" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
            <Button variant="primary" size="md" onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: AI Milestones
            </Button>
          </div>
        </div>
      )}

      {/* ========== STEP 4: AI MILESTONE SUGGESTIONS ========== */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back
            </Button>
            <span className="text-xs text-slate-500">Step 4 of 6</span>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="md" onClick={() => setStep(2)} leftIcon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
            <Button variant="primary" size="md" onClick={() => setStep(4)} rightIcon={<ArrowRight className="w-4 h-4" />}>
              Next: AI Milestones
            </Button>
          </div>
        </div>
      )}

      {/* ========== STEP 4: AI MILESTONE SUGGESTIONS ========== */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setStep(3)} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
              Back
            </Button>
            <span className="text-xs text-slate-500">Step 4 of 6</span>
          </div>
          <AIMilestonePanel
            projectInput={{ ...buildAIInput(), budget, deadline }}
            onAccept={handleAIMilestonesAccepted}
            onSkip={() => setStep(5)}
          />
          {/* Manual milestones fallback (shown below AI panel for "skip" path) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Or define milestones manually</h3>
                <p className="text-xs text-slate-400 mt-0.5">Customize budget, acceptance criteria, and Flex-Review window per milestone.</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleAddMilestone} leftIcon={<Plus className="w-3.5 h-3.5" />}>Add Milestone</Button>
            </div>
            <div className="space-y-3">
              {milestones.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider">Milestone #{idx + 1}</span>
                    {milestones.length > 1 && (
                      <button onClick={() => handleRemoveMilestone(idx)} className="text-slate-500 hover:text-rose-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input type="text" placeholder="Title" value={m.title} onChange={(e) => { const u = [...milestones]; u[idx].title = e.target.value; setMilestones(u); }} className="bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-2.5" />
                    <input type="number" placeholder="Amount (₹)" value={m.amount} onChange={(e) => { const u = [...milestones]; u[idx].amount = Number(e.target.value); setMilestones(u); }} className="bg-slate-900 border border-slate-800 text-white text-xs font-mono font-bold rounded-xl p-2.5" />
                  </div>
                  <input type="text" placeholder="Acceptance criteria (separated by |)" value={m.criteria} onChange={(e) => { const u = [...milestones]; u[idx].criteria = e.target.value; setMilestones(u); }} className="w-full bg-slate-900 border border-slate-800 text-white text-xs rounded-xl p-2.5" />
                  
                  {/* Flex-Review Window Selector */}
                  <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-blue-300">
                        <Clock className="w-3.5 h-3.5 text-blue-400" />
                        Flex-Review Window (Dynamic Auto-Approval)
                      </label>
                      <span className="text-[10px] font-bold font-mono text-emerald-400">{m.reviewDays || 7} Days</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                      {[
                        { days: 3, label: '3d Fast', desc: 'Sketches/Copy' },
                        { days: 7, label: '7d Standard', desc: 'Prototypes' },
                        { days: 14, label: '14d Deep QA', desc: 'Full Deployments' },
                        { days: 21, label: '21d Enterprise', desc: 'Security Audits' },
                      ].map((preset) => (
                        <button
                          key={preset.days}
                          type="button"
                          onClick={() => {
                            const u = [...milestones];
                            u[idx].reviewDays = preset.days;
                            setMilestones(u);
                          }}
                          className={`rounded-lg p-2 text-left transition-all border ${
                            (m.reviewDays || 7) === preset.days
                              ? 'border-blue-500 bg-blue-500/20 text-white font-semibold shadow-sm'
                              : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="block text-[11px] font-bold">{preset.label}</span>
                          <span className="block text-[9px] opacity-75">{preset.desc}</span>
                        </button>
                      ))}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">
                      💡 <strong>Guaranteed Fair Escrow:</strong> Client has {m.reviewDays || 7} days to review the demo. If client is unresponsive, funds auto-release to freelancer.
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="primary" size="sm" onClick={() => setStep(5)} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>Continue with Milestones</Button>
            </div>
          </div>
        </div>
      )}

      {/* ========== STEP 5: REVIEW ========== */}
      {step === 5 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white">Step 5: Project Summary Review</h2>

          <div className="rounded-2xl border border-blue-500/30 bg-blue-500/10 p-4 text-xs text-blue-100">
            <strong className="text-blue-300">No-Block Parallel Milestones enabled.</strong> Once all funds are secured, the freelancer may build and submit any funded milestone independently; each submission keeps its own review and fund state.
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Title:</span>
              <span className="font-bold text-white">{title || 'New Enterprise Platform Project'}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-white">{category}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Total Budget:</span>
              <span className="font-bold text-emerald-400 font-mono text-base">₹{budget.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3">
              <span className="text-slate-400">Deadline:</span>
              <span className="font-bold text-white">{deadline}</span>
            </div>
            <div className="border-b border-slate-800 pb-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Milestones & Flex-Review Windows:</span>
                <span className="font-bold text-white">{milestones.length} Milestones</span>
              </div>
              <div className="space-y-1.5 pt-1">
                {milestones.map((m, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-900/60 p-2 rounded-lg text-[11px]">
                    <span className="text-slate-300 font-medium">#{idx + 1} {m.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-emerald-400 font-bold">₹{Number(m.amount).toLocaleString()}</span>
                      <span className="rounded bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.5 text-[10px] text-blue-300 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-400" />
                        {checkpointReviewDays}d review
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-3"><span className="text-slate-400">Checkpoint review:</span><span className="font-bold text-white">{checkpointReviewDays} days</span></div>
            <div className="flex justify-between border-b border-slate-800 pb-3"><span className="text-slate-400">Final review:</span><span className="font-bold text-white">{finalReviewDays} days</span></div>
            <div className="flex justify-between"><span className="text-slate-400">Freelancer:</span><span className="font-bold text-white">{access === 'invited' ? `${SEED_FREELANCERS.find((freelancer) => freelancer.id === selectedFreelancerId)?.name} (Selected)` : 'Open to verified freelancers'}</span></div>
            {access === 'open' && <div className="flex justify-between border-t border-slate-800 pt-3"><span className="text-slate-400">Profile deadline:</span><span className="font-bold text-emerald-400">{applicationDeadline}</span></div>}
          </div>

          {/* AI Summary in Review */}
          {aiAnalysis && (
            <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
              aiAnalysis.riskLevel === 'LOW' ? 'bg-emerald-500/10 border-emerald-500/30' :
              aiAnalysis.riskLevel === 'MODERATE' ? 'bg-amber-500/10 border-amber-500/30' :
              'bg-rose-500/10 border-rose-500/30'
            }`}>
              <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${
                aiAnalysis.riskLevel === 'LOW' ? 'text-emerald-400' :
                aiAnalysis.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'
              }`} />
              <div>
                <p className="text-xs font-bold text-white">KEYStone AI: {aiAnalysis.riskScore}/100 — {aiAnalysis.riskLevel} RISK</p>
                <p className="text-[11px] text-slate-400 mt-1">{aiAnalysis.recommendations[0] ?? 'Project analyzed. Proceed to secure funds.'}</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs text-blue-300 leading-relaxed flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <strong>KEYStone Payment Lock Notice:</strong>
              <p className="mt-1">100% of project funds (₹{budget.toLocaleString()}) will be deposited into KEYStone Escrow. The freelancer cannot withdraw funds until you approve the working demo.</p>
            </div>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="md" onClick={() => setStep(4)} leftIcon={<ArrowLeft className="w-4 h-4" />}>Back</Button>
            <Button variant="emerald" size="lg" onClick={() => setStep(6)} rightIcon={<Lock className="w-4 h-4" />}>
              Proceed to Secure Funds
            </Button>
          </div>
        </div>
      )}

      {/* ========== STEP 6: SECURE FUNDS ========== */}
      {step === 6 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center">
          {isPaymentComplete ? (
            <div className="py-8 space-y-4">
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
                  <span>Platform Fee (1% Escrow Protocol):</span>
                  <span className="font-bold text-blue-400">₹{Math.round(budget * 0.01).toLocaleString()}</span>
                </div>
                {aiAnalysis && (
                  <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2">
                    <span>AI Risk Score:</span>
                    <span className={`font-bold ${aiAnalysis.riskLevel === 'LOW' ? 'text-emerald-400' : aiAnalysis.riskLevel === 'MODERATE' ? 'text-amber-400' : 'text-rose-400'}`}>
                      {aiAnalysis.riskScore}/100 {aiAnalysis.riskLevel}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-white font-bold pt-2 border-t border-slate-800 text-sm">
                  <span>Total Amount Secured:</span>
                  <span className="font-mono text-blue-400">₹{(budget + Math.round(budget * 0.01)).toLocaleString()}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                isLoading={isProcessingPayment}
                onClick={handleSecureFunds}
              >
                Deposit & Lock ₹{(budget + Math.round(budget * 0.01)).toLocaleString()} in Custody
              </Button>

              <Button variant="outline" size="sm" className="w-full" onClick={() => setStep(5)}>
                <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Review
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
