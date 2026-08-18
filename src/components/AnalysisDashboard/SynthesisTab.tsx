import React, { useState } from 'react';
import { Sparkles, Copy, Check, Wand2, Sliders, ShieldCheck, Camera } from 'lucide-react';
import { Phase4Synthesis, StylePresetModifier } from '../../types/photography';
import { STYLE_PRESETS } from '../../services/geminiService';
import { FieldGuideCard } from './FieldGuideCard';

interface SynthesisTabProps {
  synthesis: Phase4Synthesis;
  onGenerateMasterwork: (prompt: string, aspectRatio: string) => void;
  onOpenDarkroom: () => void;
  isGenerating: boolean;
}

export const SynthesisTab: React.FC<SynthesisTabProps> = ({
  synthesis,
  onGenerateMasterwork,
  onOpenDarkroom,
  isGenerating
}) => {
  const initialMasterPrompt = synthesis?.masterPrompt || 'Transform this photograph into an award-winning gallery masterwork with rich dynamic range, authentic textures, and cinematic lighting.';
  const initialAspect = synthesis?.recommendedAspectRatio || '16:9';

  const [selectedPreset, setSelectedPreset] = useState<string>('original-master');
  const [masterPrompt, setMasterPrompt] = useState<string>(initialMasterPrompt);
  const [aspectRatio, setAspectRatio] = useState<string>(initialAspect);
  const [copied, setCopied] = useState(false);

  const subjectPreservationRules = Array.isArray(synthesis?.subjectPreservationRules) ? synthesis.subjectPreservationRules : [
    'Preserve the core subject structure, identity, and natural proportions.',
    'Retain key environmental context while elevating depth and optical fidelity.'
  ];

  const lightingDirectives = Array.isArray(synthesis?.lightingAndAtmosphereDirectives) ? synthesis.lightingAndAtmosphereDirectives : [
    'Directional soft illumination with gentle highlight roll-off.'
  ];

  const opticsDirectives = Array.isArray(synthesis?.opticsAndBokehDirectives) ? synthesis.opticsAndBokehDirectives : [
    'Crisp focal plane resolution with creamy background separation.'
  ];

  const combinedDirectives = [...lightingDirectives, ...opticsDirectives].slice(0, 2);

  const handleSelectPreset = (preset: StylePresetModifier) => {
    setSelectedPreset(preset.id);
    if (preset.id === 'original-master') {
      setMasterPrompt(initialMasterPrompt);
    } else {
      setMasterPrompt(`${initialMasterPrompt} [Style Directive: ${preset.promptSuffix}]`);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(masterPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Pro Field Shooting Guide */}
      {synthesis?.fieldGuide && (
        <FieldGuideCard guide={synthesis.fieldGuide} />
      )}

      {/* Top Header & Dual Engines Banner */}
      <div className="darkroom-card p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent-gold" />
              <h3 className="font-cinzel text-base font-bold text-slate-100">
                Phase 4 Synthesis & Master Transformation Prompt
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Synthesizes all 4 reasoning phases into a high-fidelity prompt for Nano Banana image editing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Aspect Ratio:</span>
            <select
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-accent-gold"
            >
              <option value="16:9">16:9 Cinema</option>
              <option value="4:5">4:5 Portrait</option>
              <option value="1:1">1:1 Square</option>
              <option value="3:2">3:2 Classic 35mm</option>
              <option value="9:16">9:16 Vertical Story</option>
            </select>
          </div>
        </div>

        {/* Style Presets Filter Chips */}
        <div>
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2">
            Select Gallery Style Archetype:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all relative overflow-hidden flex flex-col justify-between ${
                  selectedPreset === preset.id
                    ? 'bg-slate-800 border-accent-gold shadow-lg shadow-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-full h-1 rounded-full bg-gradient-to-r ${preset.previewGradient} mb-2`} />
                <span className="font-bold text-[11px] text-slate-200 block truncate leading-tight">
                  {preset.name}
                </span>
                <span className="text-[9px] text-slate-400 font-mono mt-1">
                  {preset.category}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Master Prompt Editor */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
              <span>Master Prompt (Editable):</span>
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Prompt'}</span>
            </button>
          </div>

          <textarea
            value={masterPrompt}
            onChange={(e) => setMasterPrompt(e.target.value)}
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-200 focus:outline-none focus:border-accent-gold leading-relaxed resize-none selection:bg-accent-gold/20"
            placeholder="Master Prompt synthesis..."
          />
        </div>

        {/* Subject Preservation & Directives Pill Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Subject Authenticity & Identity Lock:
            </span>
            <ul className="text-slate-300 space-y-1 pl-4 list-disc text-[11px]">
              {subjectPreservationRules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
            <span className="text-cyan-400 font-bold flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5" />
              Optical & Lighting Directives:
            </span>
            <ul className="text-slate-300 space-y-1 pl-4 list-disc text-[11px]">
              {combinedDirectives.map((dir, i) => (
                <li key={i}>{dir}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dual Actions: Nano Banana Generation vs Instant Darkroom */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Instant Darkroom Studio (100% Free) */}
          <button
            type="button"
            onClick={onOpenDarkroom}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>Open in Instant Pro Darkroom (Free & Zero Quota)</span>
          </button>

          {/* Nano Banana Generative Edit */}
          <button
            type="button"
            onClick={() => onGenerateMasterwork(masterPrompt, aspectRatio)}
            disabled={isGenerating}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-accent-gold to-amber-600 hover:from-amber-400 hover:to-amber-500 text-darkroom-950 text-xs font-bold tracking-wide shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>{isGenerating ? 'Generating Masterwork...' : 'Generate AI Masterwork (Nano Banana)'}</span>
          </button>

        </div>

      </div>

    </div>
  );
};
