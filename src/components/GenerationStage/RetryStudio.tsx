import React, { useState } from 'react';
import { X, RefreshCw, Sparkles, Wand2, Ratio, Zap } from 'lucide-react';

interface RetryStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt: string;
  initialAspectRatio: string;
  onRetry: (prompt: string, aspectRatio: string) => void;
  isGenerating: boolean;
}

export const RetryStudio: React.FC<RetryStudioProps> = ({
  isOpen,
  onClose,
  initialPrompt,
  initialAspectRatio,
  onRetry,
  isGenerating
}) => {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [aspectRatio, setAspectRatio] = useState(initialAspectRatio || '16:9');
  const [selectedQuickTweak, setSelectedQuickTweak] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickTweaks = [
    { label: 'Enhance Golden Hour Glow', suffix: ' Intensify warm golden-hour rim lighting and volumetric lens haze.' },
    { label: 'Deeper 35mm Bokeh', suffix: ' Increase optical depth of field with ultra-creamy f/1.2 circular background bokeh blur.' },
    { label: 'Cinematic Muted Tones', suffix: ' Shift color grading towards desaturated cinematic shadows and teal highlights.' },
    { label: 'Hyper-Crisp Texture', suffix: ' Maximize optical micro-contrast on focal subject textures and clothing details.' }
  ];

  const handleApplyTweak = (tweak: typeof quickTweaks[0]) => {
    setSelectedQuickTweak(tweak.label);
    setPrompt(prev => `${prev}${tweak.suffix}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRetry(prompt, aspectRatio);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="darkroom-card max-w-xl w-full p-6 relative border border-slate-700/80 shadow-2xl space-y-5">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-cyan-500 p-0.5 flex items-center justify-center">
            <div className="w-full h-full bg-darkroom-950 rounded-[10px] flex items-center justify-center">
              <RefreshCw className="w-5 h-5 text-accent-gold" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              Refine & Re-Roll Masterwork
            </h3>
            <p className="text-xs text-slate-400">
              Fine-tune the generative prompt without re-running the 4 analysis phases
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Ratio className="w-3.5 h-3.5 text-accent-gold" />
              Target Output Framing:
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { val: '16:9', label: '16:9 Wide' },
                { val: '4:5', label: '4:5 Portrait' },
                { val: '3:2', label: '3:2 Leica' },
                { val: '1:1', label: '1:1 Square' },
                { val: '9:16', label: '9:16 Vertical' }
              ].map(item => (
                <button
                  type="button"
                  key={item.val}
                  onClick={() => setAspectRatio(item.val)}
                  className={`p-2 rounded-xl text-xs font-mono text-center border transition-all ${
                    aspectRatio === item.val
                      ? 'border-accent-gold bg-amber-500/20 text-accent-gold font-bold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Directives */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              1-Click Prompt Injectors:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {quickTweaks.map(tweak => (
                <button
                  type="button"
                  key={tweak.label}
                  onClick={() => handleApplyTweak(tweak)}
                  className={`p-2 rounded-xl text-left text-xs border transition-all ${
                    selectedQuickTweak === tweak.label
                      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300 font-semibold'
                      : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  + {tweak.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Editor */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Generative Nano Banana Prompt:
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              className="w-full bg-darkroom-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-accent-gold"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-darkroom-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              <Wand2 className="w-4 h-4" />
              <span>{isGenerating ? 'Rendering Variation...' : 'Re-Generate Masterwork'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
