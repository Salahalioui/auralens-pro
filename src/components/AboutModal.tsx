import React from 'react';
import { 
  X, 
  Sparkles, 
  Camera, 
  Sliders, 
  ShieldCheck, 
  Wand2, 
  Layers, 
  Cpu, 
  Palette, 
  Heart,
  Globe
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="darkroom-card max-w-2xl w-full p-6 sm:p-8 relative border border-slate-700/80 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-accent-gold to-cyan-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-darkroom-950 rounded-[14px] flex items-center justify-center">
              <Camera className="w-6 h-6 text-accent-gold" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel font-extrabold text-xl sm:text-2xl text-slate-100">
                AURALENS <span className="text-accent-gold">PRO</span>
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-accent-gold border border-amber-500/30">
                v1.2.0
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              AI Photography Reasoning & Computational Color Science Studio
            </p>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-amber-950/20 via-slate-900 to-slate-900 p-4 rounded-2xl border border-amber-500/30 text-xs text-slate-200 leading-relaxed space-y-2">
          <p>
            <strong className="text-accent-gold">AuraLens Pro</strong> is an intelligent photographic transformation studio designed to elevate raw, amateur, and unpolished captures into award-winning gallery masterpieces without losing the authentic identity of the subject.
          </p>
          <p className="text-slate-400">
            Powered by multi-phase Google Gemini vision reasoning, Nano Banana image editing models, and an in-browser photochemical darkroom engine.
          </p>
        </div>

        {/* 5-Phase Reasoning Architecture */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>Multi-Phase Reasoning Pipeline</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-accent-gold flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-amber-500/20 text-[10px] flex items-center justify-center">1</span>
                Composition & Framing
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Analyzes golden section balance, rule-of-thirds power lines, horizon tilt angles, and precise crop boundaries.
              </p>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-purple-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-purple-500/20 text-[10px] flex items-center justify-center">2</span>
                Mood & Intent
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Classifies genre, lighting atmosphere, emotional resonance, and narrative elevation opportunities.
              </p>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[10px] flex items-center justify-center">3</span>
                Color Science & Light
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Extracts dynamic range, Kelvin balance, dominant 4-tone palette, film stock emulation, and 12-parameter grading matrix.
              </p>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 space-y-1">
              <span className="font-bold text-cyan-400 flex items-center gap-1.5">
                <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-[10px] flex items-center justify-center">4</span>
                Synthesis & Identity Lock
              </span>
              <p className="text-[11px] text-slate-400 leading-normal">
                Generates a master transformation prompt with strict subject identity locks and optical lens directives.
              </p>
            </div>
          </div>
        </div>

        {/* In-Browser Studio Highlights */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            <span>Computational In-Browser Color Engine</span>
          </h4>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold mt-1.5 shrink-0" />
              <span><strong>Dynamic Tailored AI Recipes:</strong> 6 custom photo-specific grading archetypes generated on the fly.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
              <span><strong>Photochemical Halation & S-Curves:</strong> Specular edge diffusion and smooth highlight roll-off.</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
              <span><strong>Industry-Standard .CUBE 3D LUT Export:</strong> $33\times 33\times 33$ 3D LUT export compatible with DaVinci Resolve, Premiere Pro & Photoshop.</span>
            </div>
          </div>
        </div>

        {/* Privacy & Client-Side Architecture */}
        <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-800/80 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-200 block">100% Client-Side Privacy</span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Your API keys and uploaded photographs are stored exclusively in your browser's encrypted local storage and IndexedDB cache. No image data is ever stored on external tracking servers.
            </p>
          </div>
        </div>

        {/* Footer info & close */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-mono">
          <div className="flex items-center gap-2">
            <span>Built with React 19, TypeScript & Tailwind CSS</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
