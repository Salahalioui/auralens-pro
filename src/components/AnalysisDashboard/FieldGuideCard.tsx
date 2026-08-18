import React from 'react';
import { FieldShootingGuide } from '../../types/photography';
import { Compass, Camera, Sun, Sliders, Sparkles, Award } from 'lucide-react';

interface FieldGuideCardProps {
  guide?: FieldShootingGuide;
}

export const FieldGuideCard: React.FC<FieldGuideCardProps> = ({ guide }) => {
  if (!guide) return null;

  return (
    <div className="darkroom-card p-5 border border-slate-800 space-y-4 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-accent-gold flex items-center justify-center border border-amber-500/30">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 font-cinzel">
              Pro Field Shooting Guide
            </h3>
            <p className="text-[11px] text-slate-400">
              Camera setup & physical positioning advice for shooting this scene in real life
            </p>
          </div>
        </div>

        <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Masterclass
        </span>
      </div>

      {/* 3-Column Advice Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        
        {/* Recommended Lens */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-accent-gold font-mono font-bold text-[11px]">
            <Camera className="w-3.5 h-3.5" />
            <span>Recommended Glass</span>
          </div>
          <p className="text-slate-200 font-medium">
            {guide.recommendedLens}
          </p>
        </div>

        {/* Ideal Time of Day */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold text-[11px]">
            <Sun className="w-3.5 h-3.5" />
            <span>Light & Time of Day</span>
          </div>
          <p className="text-slate-200 font-medium">
            {guide.idealTimeOfDay}
          </p>
        </div>

        {/* Physical Positioning */}
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-[11px]">
            <Sliders className="w-3.5 h-3.5" />
            <span>Shooting Stance</span>
          </div>
          <p className="text-slate-300 text-[11px] leading-snug">
            {guide.physicalPositioning}
          </p>
        </div>

      </div>

      {/* Exposure Triangle Badges */}
      {guide.suggestedSettings && (
        <div className="p-3 rounded-xl bg-darkroom-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <span className="text-slate-400 text-[11px]">Recommended Camera Triangle:</span>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-cyan-300 border border-cyan-500/20 font-bold">
              {guide.suggestedSettings.aperture}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-amber-300 border border-amber-500/20 font-bold">
              {guide.suggestedSettings.shutterSpeed}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-purple-300 border border-purple-500/20 font-bold">
              {guide.suggestedSettings.iso}
            </span>
          </div>
        </div>
      )}

      {/* Pro Shooting Tip */}
      {guide.proTip && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-950/20 to-slate-900 border border-amber-500/25 flex items-start gap-2.5 text-xs">
          <Sparkles className="w-4 h-4 text-accent-gold shrink-0 mt-0.5" />
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong className="text-accent-gold">Judge's Golden Rule:</strong> {guide.proTip}
          </p>
        </div>
      )}

    </div>
  );
};
