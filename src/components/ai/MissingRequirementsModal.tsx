import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import type { AIRequirementArea } from '../../services/ai/aiService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface MissingRequirementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  requirements: AIRequirementArea[];
  onResolve: (updated: AIRequirementArea[]) => void;
}

export const MissingRequirementsModal: React.FC<MissingRequirementsModalProps> = ({ isOpen, onClose, requirements, onResolve }) => {
  const [local, setLocal] = useState<AIRequirementArea[]>(requirements);
  const [customInputs, setCustomInputs] = useState<Record<string, string>>({});

  const resolvedCount = local.filter((r) => r.resolved).length;

  const handleSelectSuggestion = (reqId: string, suggestion: string) => {
    setLocal((prev) =>
      prev.map((r) => r.id === reqId ? { ...r, resolved: true, customAnswer: suggestion } : r)
    );
  };

  const handleCustom = (reqId: string, value: string) => {
    setCustomInputs((prev) => ({ ...prev, [reqId]: value }));
  };

  const handleAddCustom = (reqId: string) => {
    const val = customInputs[reqId]?.trim();
    if (!val) return;
    setLocal((prev) =>
      prev.map((r) => r.id === reqId ? { ...r, resolved: true, customAnswer: val } : r)
    );
    setCustomInputs((prev) => ({ ...prev, [reqId]: '' }));
  };

  const handleUnresolve = (reqId: string) => {
    setLocal((prev) =>
      prev.map((r) => r.id === reqId ? { ...r, resolved: false, customAnswer: undefined } : r)
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Missing Requirements" subtitle={`AI found ${requirements.length} areas that need clarification. Resolving them reduces dispute risk.`}>
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        {local.map((req) => (
          <div key={req.id} className={`rounded-2xl border p-4 space-y-3 transition-all ${req.resolved ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800 bg-slate-950'}`}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{req.area}</span>
                <p className="text-xs font-semibold text-white mt-0.5">{req.question}</p>
              </div>
              {req.resolved && (
                <button onClick={() => handleUnresolve(req.id)} className="shrink-0 text-slate-500 hover:text-rose-400 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {req.resolved ? (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs text-emerald-300 font-semibold">{req.customAnswer}</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-1.5">
                  {req.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSelectSuggestion(req.id, s)}
                      className="text-left text-xs text-slate-300 hover:text-white px-3 py-2 rounded-xl border border-slate-800 hover:border-blue-500/50 hover:bg-blue-500/5 transition-all flex items-center gap-2"
                    >
                      <span className="w-3 h-3 rounded-full border-2 border-slate-600 shrink-0" />
                      {s}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Or add your own requirement..."
                    value={customInputs[req.id] ?? ''}
                    onChange={(e) => handleCustom(req.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustom(req.id)}
                    className="flex-1 bg-slate-900 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-blue-500 placeholder-slate-600"
                  />
                  <Button variant="outline" size="sm" onClick={() => handleAddCustom(req.id)}>Add</Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800 mt-4">
        <span className="text-xs text-slate-400">{resolvedCount}/{local.length} requirements resolved</span>
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
          <Button variant="emerald" size="sm" onClick={() => { onResolve(local); onClose(); }}>
            Save Resolutions
          </Button>
        </div>
      </div>
    </Modal>
  );
};
