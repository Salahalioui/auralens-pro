import React, { useState } from 'react';
import { X, Key, ExternalLink, ShieldCheck, Eye, EyeOff, Sparkles, Zap, Info } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { rateLimitManager } from '../services/rateLimitManager';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyUpdated: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({
  isOpen,
  onClose,
  onKeyUpdated
}) => {
  const [apiKey, setApiKey] = useState(geminiService.getApiKey());
  const [showKey, setShowKey] = useState(false);
  const [textModel, setTextModel] = useState(localStorage.getItem('auralens_text_model') || 'gemini-3.7-flash');
  const [imageModel, setImageModel] = useState(localStorage.getItem('auralens_image_model') || 'gemini-3.1-flash-image');
  const [tier, setTier] = useState<'Free Tier (15 RPM)' | 'Tier 1 / Pay-As-You-Go'>(
    rateLimitManager.tier
  );

  if (!isOpen) return null;

  const handleSave = () => {
    geminiService.setApiKey(apiKey);
    geminiService.setModels(textModel, imageModel);
    rateLimitManager.setTier(tier);
    onKeyUpdated();
    onClose();
  };

  const handleUseDemo = () => {
    geminiService.setApiKey('');
    onKeyUpdated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="darkroom-card max-w-lg w-full p-6 relative border border-slate-700/80 shadow-2xl shadow-black/80">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-cyan-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-darkroom-950 rounded-[10px] flex items-center justify-center">
              <Key className="w-5 h-5 text-accent-gold" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Google AI Studio Configuration
            </h2>
            <p className="text-xs text-slate-400">
              Bring your own free or paid Gemini API Key
            </p>
          </div>
        </div>

        <div className="space-y-4">
          
          {/* API Key Input */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Google Gemini API Key</span>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-accent-gold hover:underline text-[11px] flex items-center gap-1 normal-case tracking-normal"
              >
                Get Free API Key <ExternalLink className="w-3 h-3" />
              </a>
            </label>
            
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-100 placeholder-slate-500 focus:outline-none focus:border-accent-gold focus:ring-1 focus:ring-accent-gold pr-10"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              Stored exclusively in your browser localStorage. Never sent to any external server.
            </p>
          </div>

          {/* Model Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
                Reasoning Vision Model
              </label>
              <select
                value={textModel}
                onChange={(e) => setTextModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-accent-gold"
              >
                <option value="gemini-3.6-flash">Gemini 3.6 Flash (Recommended Workhorse)</option>
                <option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (High Availability)</option>
                <option value="gemini-3.7-flash">Gemini 3.7 Flash (High Reasoning)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Image Generation Model
              </label>
              <select
                value={imageModel}
                onChange={(e) => setImageModel(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="gemini-3.1-flash-image">Nano Banana 2 (3.1 Flash Image)</option>
                <option value="gemini-3-pro-image">Nano Banana Pro (3 Pro Image)</option>
              </select>
            </div>
          </div>

          {/* Tier Selection & Quota Note */}
          <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Account Quota Tier:</span>
              <div className="flex bg-slate-800 rounded-lg p-0.5">
                <button
                  type="button"
                  onClick={() => setTier('Free Tier (15 RPM)')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    tier === 'Free Tier (15 RPM)'
                      ? 'bg-amber-500/20 text-accent-gold font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Free Tier (15 RPM)
                </button>
                <button
                  type="button"
                  onClick={() => setTier('Tier 1 / Pay-As-You-Go')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                    tier === 'Tier 1 / Pay-As-You-Go'
                      ? 'bg-cyan-500/20 text-cyan-400 font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Tier 1 / Billing
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 flex items-start gap-1.5 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
              <span>
                <strong>Free Tier Active:</strong> Both Gemini Vision reasoning (15 RPM / 1,500 RPD) and Nano Banana image editing (typically 2–5 IPM) are free of charge in Google AI Studio. Our built-in rate limiter throttles calls automatically to protect your quota.
              </span>
            </p>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <button
            onClick={handleUseDemo}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all"
          >
            Explore in Demo Mode
          </button>
          
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-darkroom-950 shadow-lg shadow-amber-500/20 transition-all"
            >
              Save Configuration
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
