import React, { useState } from 'react';
import { Settings, Sparkles, Key, Check, Server, Globe } from 'lucide-react';
import { getAIConfig, setAIConfig, type AIProviderType } from '../../services/ai/aiService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({ isOpen, onClose, onSaved }) => {
  const currentConfig = getAIConfig();
  const [provider, setProvider] = useState<AIProviderType>(currentConfig.provider);
  const [customEndpoint, setCustomEndpoint] = useState(currentConfig.customEndpoint ?? 'http://localhost:8000/api/ai');
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [model, setModel] = useState(currentConfig.model ?? '');
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setAIConfig({
      provider,
      customEndpoint: customEndpoint.trim() || undefined,
      apiKey: apiKey.trim(),
      model: model.trim() || undefined,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      if (onSaved) onSaved();
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="KEYStone AI Provider Configuration"
      subtitle="Connect KEYStone to your Custom AI Backend or an external AI model."
    >
      <form onSubmit={handleSave} className="space-y-5 text-xs text-slate-300">
        <div>
          <label className="block font-semibold text-slate-300 mb-2">Select Active AI Provider</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setProvider('custom')}
              className={`p-3 rounded-xl border text-center transition-all ${
                provider === 'custom'
                  ? 'border-emerald-500 bg-emerald-500/10 text-white font-bold shadow-lg shadow-emerald-500/20'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Server className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <span>Custom AI</span>
              <span className="block text-[9px] text-emerald-400 font-normal mt-0.5">Your Backend</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider('gemini')}
              className={`p-3 rounded-xl border text-center transition-all ${
                provider === 'gemini'
                  ? 'border-blue-500 bg-blue-500/10 text-white font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Key className="w-4 h-4 mx-auto mb-1 text-blue-400" />
              <span>Gemini AI</span>
              <span className="block text-[9px] text-slate-500 mt-0.5">gemini-2.5</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider('openai')}
              className={`p-3 rounded-xl border text-center transition-all ${
                provider === 'openai'
                  ? 'border-purple-500 bg-purple-500/10 text-white font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Key className="w-4 h-4 mx-auto mb-1 text-purple-400" />
              <span>OpenAI</span>
              <span className="block text-[9px] text-slate-500 mt-0.5">gpt-4o-mini</span>
            </button>

            <button
              type="button"
              onClick={() => setProvider('mock')}
              className={`p-3 rounded-xl border text-center transition-all ${
                provider === 'mock'
                  ? 'border-slate-500 bg-slate-500/10 text-white font-bold'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 mx-auto mb-1 text-slate-400" />
              <span>Mock Engine</span>
              <span className="block text-[9px] text-slate-500 mt-0.5">Offline Demo</span>
            </button>
          </div>
        </div>

        {/* CUSTOM AI SERVER SETTINGS */}
        {provider === 'custom' && (
          <div className="space-y-3 p-4 bg-slate-950 border border-emerald-500/30 rounded-2xl animate-in fade-in-50">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white text-xs">Custom AI Server Endpoint</span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                API Base URL Endpoint
              </label>
              <input
                type="text"
                required
                placeholder="e.g. http://localhost:8000/api/ai or https://your-ai-server.com/api/ai"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-emerald-400 font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">
                KEYStone will send <code className="text-emerald-400 font-mono">POST /analyze-project</code> and <code className="text-emerald-400 font-mono">POST /generate-milestones</code> to this URL.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Auth Token / API Key (Optional)
              </label>
              <input
                type="password"
                placeholder="Bearer token or secret key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs rounded-xl p-2.5 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        )}

        {/* GEMINI / OPENAI SETTINGS */}
        {(provider === 'gemini' || provider === 'openai') && (
          <div className="space-y-3 p-4 bg-slate-950 border border-slate-800 rounded-2xl animate-in fade-in-50">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                {provider === 'gemini' ? 'Google Gemini API Key' : 'OpenAI API Key'}
              </label>
              <input
                type="password"
                required
                placeholder={provider === 'gemini' ? 'AIzaSy...' : 'sk-proj-...'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-white font-mono text-xs rounded-xl p-3 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Model Name (Optional override)
              </label>
              <input
                type="text"
                placeholder={provider === 'gemini' ? 'gemini-2.5-flash' : 'gpt-4o-mini'}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 text-slate-300 text-xs rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          {isSaved ? (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <Check className="w-4 h-4" /> AI Provider Saved!
            </span>
          ) : (
            <span className="text-[11px] text-slate-500">
              Active Engine: <strong className="text-emerald-400 uppercase">{currentConfig.provider}</strong>
            </span>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="emerald" size="sm" type="submit">
              Save AI Settings
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
