import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { generateMilestones } from '../../services/ai/aiService';
import type { AIMilestone, AIProjectInput } from '../../services/ai/aiService';
import { Button } from '../ui/Button';

interface AIMilestonePanelProps {
  projectInput: AIProjectInput;
  onAccept: (milestones: AIMilestone[]) => void;
  onSkip: () => void;
}

interface EditableMilestone extends AIMilestone {
  isEditing: boolean;
  tempTitle: string;
  tempDescription: string;
  tempAmount: number;
  tempDeliverables: string[];
  tempCriteria: string[];
}

function toEditable(ms: AIMilestone): EditableMilestone {
  return { ...ms, isEditing: false, tempTitle: ms.title, tempDescription: ms.description, tempAmount: ms.suggestedAmount, tempDeliverables: [...ms.deliverables], tempCriteria: [...ms.acceptanceCriteria] };
}

export const AIMilestonePanel: React.FC<AIMilestonePanelProps> = ({ projectInput, onAccept, onSkip }) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [milestones, setMilestones] = useState<EditableMilestone[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newCriteriaInput, setNewCriteriaInput] = useState<Record<string, string>>({});
  const [newDeliverableInput, setNewDeliverableInput] = useState<Record<string, string>>({});

  const generate = async () => {
    setStatus('loading');
    try {
      const result = await generateMilestones(projectInput);
      setMilestones(result.milestones.map(toEditable));
      setExpanded(new Set(result.milestones.map((m) => m.id)));
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const startEdit = (id: string) => setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, isEditing: true } : m));
  const cancelEdit = (id: string) => setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, isEditing: false, tempTitle: m.title, tempDescription: m.description, tempAmount: m.suggestedAmount, tempDeliverables: [...m.deliverables], tempCriteria: [...m.acceptanceCriteria] } : m));
  const saveEdit = (id: string) => setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, isEditing: false, title: m.tempTitle, description: m.tempDescription, suggestedAmount: m.tempAmount, deliverables: [...m.tempDeliverables], acceptanceCriteria: [...m.tempCriteria] } : m));
  const deleteMilestone = (id: string) => setMilestones((prev) => prev.filter((m) => m.id !== id));

  const updateTemp = (id: string, field: 'tempTitle' | 'tempDescription' | 'tempAmount', value: string | number) => {
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, [field]: value } : m));
  };

  const addCriteria = (id: string) => {
    const val = newCriteriaInput[id]?.trim();
    if (!val) return;
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, tempCriteria: [...m.tempCriteria, val] } : m));
    setNewCriteriaInput((p) => ({ ...p, [id]: '' }));
  };

  const removeCriteria = (milestoneId: string, idx: number) => {
    setMilestones((prev) => prev.map((m) => m.id === milestoneId ? { ...m, tempCriteria: m.tempCriteria.filter((_, i) => i !== idx) } : m));
  };

  const addDeliverable = (id: string) => {
    const val = newDeliverableInput[id]?.trim();
    if (!val) return;
    setMilestones((prev) => prev.map((m) => m.id === id ? { ...m, tempDeliverables: [...m.tempDeliverables, val] } : m));
    setNewDeliverableInput((p) => ({ ...p, [id]: '' }));
  };

  const removeDeliverable = (milestoneId: string, idx: number) => {
    setMilestones((prev) => prev.map((m) => m.id === milestoneId ? { ...m, tempDeliverables: m.tempDeliverables.filter((_, i) => i !== idx) } : m));
  };

  const addNewMilestone = () => {
    const id = `ms_custom_${Date.now()}`;
    const last = milestones[milestones.length - 1];
    const newMs: EditableMilestone = {
      id, title: 'New Milestone', description: 'Describe this milestone.', dayStart: (last?.dayEnd ?? 0) + 1, dayEnd: (last?.dayEnd ?? 0) + 7,
      suggestedAmount: Math.round((projectInput.budget ?? 10000) * 0.1), deliverables: ['Deliverable'], acceptanceCriteria: ['Acceptance criterion'],
      isEditing: true, tempTitle: 'New Milestone', tempDescription: 'Describe this milestone.', tempAmount: Math.round((projectInput.budget ?? 10000) * 0.1),
      tempDeliverables: ['Deliverable'], tempCriteria: ['Acceptance criterion'],
    };
    setMilestones((prev) => [...prev, newMs]);
    setExpanded((prev) => new Set([...prev, id]));
  };

  const handleAccept = () => {
    // Commit any open edits before accepting
    const final = milestones.map((m) => ({
      ...m,
      title: m.isEditing ? m.tempTitle : m.title,
      description: m.isEditing ? m.tempDescription : m.description,
      suggestedAmount: m.isEditing ? m.tempAmount : m.suggestedAmount,
      deliverables: m.isEditing ? m.tempDeliverables : m.deliverables,
      acceptanceCriteria: m.isEditing ? m.tempCriteria : m.acceptanceCriteria,
    }));
    onAccept(final);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">KEYStone AI Engine</span>
            </div>
            <h2 className="text-xl font-bold text-white">Smart Milestone Generator</h2>
            <p className="text-xs text-slate-400 mt-1">AI converts your project requirements into structured, fundable milestones with objective acceptance criteria.</p>
          </div>
          <div className="shrink-0 w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
        </div>

        {status === 'idle' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" size="md" onClick={generate} leftIcon={<Sparkles className="w-4 h-4" />} className="flex-1">
              Generate Smart Milestones
            </Button>
            <Button variant="outline" size="md" onClick={onSkip}>
              Skip — Define Manually
            </Button>
          </div>
        )}

        {status === 'loading' && (
          <div className="flex items-center gap-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
            <p className="text-xs text-slate-300">KEYStone AI is structuring your milestones...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <p className="text-xs text-rose-400">Could not generate milestones. Please try again or define manually.</p>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" onClick={generate} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>Retry</Button>
              <Button variant="primary" size="sm" onClick={onSkip}>Continue Manually</Button>
            </div>
          </div>
        )}
      </div>

      {/* Milestone Cards */}
      {status === 'done' && milestones.length > 0 && (
        <>
          <div className="space-y-4">
            {milestones.map((ms, idx) => (
              <div key={ms.id} className="bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
                {/* Milestone Header */}
                <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => !ms.isEditing && toggleExpand(ms.id)}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <span className="text-xs font-black text-indigo-400">{idx + 1}</span>
                    </div>
                    {ms.isEditing ? (
                      <input
                        value={ms.tempTitle}
                        onChange={(e) => updateTemp(ms.id, 'tempTitle', e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-950 border border-slate-700 text-white text-sm font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-blue-500 flex-1"
                      />
                    ) : (
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{ms.title}</p>
                        <p className="text-[11px] text-slate-400">Days {ms.dayStart}–{ms.dayEnd} · ₹{ms.suggestedAmount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {!ms.isEditing ? (
                      <>
                        <button onClick={(e) => { e.stopPropagation(); startEdit(ms.id); }} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {milestones.length > 1 && (
                          <button onClick={(e) => { e.stopPropagation(); deleteMilestone(ms.id); }} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {expanded.has(ms.id) ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />}
                      </>
                    ) : (
                      <>
                        <button onClick={() => saveEdit(ms.id)} className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-500/10 transition-all">
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => cancelEdit(ms.id)} className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition-all">
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Milestone Body */}
                {(expanded.has(ms.id) || ms.isEditing) && (
                  <div className="px-4 pb-5 space-y-4 border-t border-slate-800">
                    {ms.isEditing ? (
                      <div className="space-y-3 pt-4">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Budget (₹)</label>
                            <input type="number" value={ms.tempAmount} onChange={(e) => updateTemp(ms.id, 'tempAmount', Number(e.target.value))}
                              className="w-full bg-slate-950 border border-slate-800 text-white text-sm font-bold font-mono rounded-xl p-2.5 focus:outline-none focus:border-blue-500" />
                          </div>
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Description</label>
                            <input value={ms.tempDescription} onChange={(e) => updateTemp(ms.id, 'tempDescription', e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-500" />
                          </div>
                        </div>

                        {/* Deliverables */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-2">Deliverables</label>
                          <div className="space-y-1.5">
                            {ms.tempDeliverables.map((d, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                                <span className="text-xs text-slate-300 flex-1">{d}</span>
                                <button onClick={() => removeDeliverable(ms.id, i)} className="text-slate-600 hover:text-rose-400"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input type="text" placeholder="Add deliverable..." value={newDeliverableInput[ms.id] ?? ''} onChange={(e) => setNewDeliverableInput((p) => ({ ...p, [ms.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && addDeliverable(ms.id)}
                                className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500" />
                              <Button variant="outline" size="sm" onClick={() => addDeliverable(ms.id)}>Add</Button>
                            </div>
                          </div>
                        </div>

                        {/* Acceptance Criteria */}
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-400 mb-2">Acceptance Criteria</label>
                          <div className="space-y-1.5">
                            {ms.tempCriteria.map((c, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                <span className="text-xs text-slate-300 flex-1 leading-relaxed">{c}</span>
                                <button onClick={() => removeCriteria(ms.id, i)} className="text-slate-600 hover:text-rose-400 shrink-0"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <div className="flex gap-2">
                              <input type="text" placeholder="Add acceptance criterion..." value={newCriteriaInput[ms.id] ?? ''} onChange={(e) => setNewCriteriaInput((p) => ({ ...p, [ms.id]: e.target.value }))}
                                onKeyDown={(e) => e.key === 'Enter' && addCriteria(ms.id)}
                                className="flex-1 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500" />
                              <Button variant="outline" size="sm" onClick={() => addCriteria(ms.id)}>Add</Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 space-y-4">
                        <p className="text-xs text-slate-400">{ms.description}</p>

                        {ms.deliverables.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Deliverables</p>
                            <div className="space-y-1">
                              {ms.deliverables.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-1 h-1 rounded-full bg-indigo-400 shrink-0" />
                                  <span className="text-xs text-slate-300">{d}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {ms.acceptanceCriteria.length > 0 && (
                          <div>
                            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Acceptance Criteria</p>
                            <div className="space-y-1">
                              {ms.acceptanceCriteria.map((c, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                                  <span className="text-xs text-slate-300 leading-relaxed">{c}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
                          <span className="text-slate-400">Suggested Allocation:</span>
                          <span className="font-black font-mono text-emerald-400">₹{ms.suggestedAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="outline" size="sm" onClick={addNewMilestone} leftIcon={<Plus className="w-3.5 h-3.5" />}>
              Add Milestone
            </Button>
            <Button variant="outline" size="sm" onClick={generate} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
              Regenerate
            </Button>
          </div>

          {/* Accept */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Review complete</p>
              <p className="text-xs text-slate-400 mt-0.5">{milestones.length} milestones defined with objective acceptance criteria.</p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Button variant="outline" size="sm" onClick={onSkip}>Use Manual Milestones</Button>
              <Button variant="emerald" size="md" onClick={handleAccept} rightIcon={<ArrowRight className="w-4 h-4" />}>
                Accept & Continue
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
