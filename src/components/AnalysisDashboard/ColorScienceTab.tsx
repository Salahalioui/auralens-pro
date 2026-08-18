import React from 'react';
import { Palette, Film, Sliders } from 'lucide-react';
import { Phase3ColorScience } from '../../types/photography';

interface ColorScienceTabProps {
  colorScience: Phase3ColorScience;
  onOpenDarkroom?: () => void;
}

export const ColorScienceTab: React.FC<ColorScienceTabProps> = ({
  colorScience,
  onOpenDarkroom
}) => {
  const dynamicRange = colorScience?.dynamicRange || 'Balanced Dynamic Range';
  const exposureEvaluation = colorScience?.exposureEvaluation || 'Well-balanced exposure across primary tones.';
  const colorTemperatureK = Number(colorScience?.colorTemperatureK) || 5600;
  const tint = Number(colorScience?.tint) || 0;
  const colorHarmony = colorScience?.colorHarmony || 'Complementary';

  const filmStockEmulation = colorScience?.filmStockEmulation || {
    name: 'Kodak Portra 400',
    description: 'Naturalistic skin tones and gentle highlight roll-off.',
    whyItFits: 'Suppresses harsh digital clipping while delivering authentic texture.'
  };

  const dominantPalette = Array.isArray(colorScience?.dominantPalette) && colorScience.dominantPalette.length > 0
    ? colorScience.dominantPalette
    : [
        { hex: '#f59e0b', name: 'Amber Gold', role: 'highlight' },
        { hex: '#1e293b', name: 'Slate Navy', role: 'shadow' },
        { hex: '#10b981', name: 'Emerald Forest', role: 'accent' },
        { hex: '#78716c', name: 'Muted Midtone', role: 'midtone' }
      ];

  const numericalGrading = colorScience?.numericalGrading || {
    exposureEV: 0.2,
    contrast: 15,
    highlights: -15,
    shadows: 20,
    whites: 5,
    blacks: -10,
    temperature: 10,
    tint: 5,
    vibrance: 15,
    saturation: 10,
    clarity: 15,
    vignette: 20,
    grain: 15
  };

  return (
    <div className="space-y-6">
      
      {/* Top Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Dynamic Range & Exposure */}
        <div className="darkroom-card p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Dynamic Range</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {dynamicRange}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed pt-1">
            {exposureEvaluation}
          </p>
        </div>

        {/* White Balance & Kelvin */}
        <div className="darkroom-card p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">White Balance</span>
            <span className="text-xs font-mono font-bold text-accent-gold">
              {colorTemperatureK}K (Tint {tint > 0 ? `+${tint}` : tint})
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-cyan-400 font-mono">Cool (3200K)</span>
            <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-cyan-500 via-amber-200 to-amber-500 overflow-hidden" />
            <span className="text-[11px] text-amber-400 font-mono">Warm (7500K)</span>
          </div>
          <span className="text-[11px] text-slate-400 block text-center font-mono">
            Harmony Type: <strong className="text-slate-200">{colorHarmony}</strong>
          </span>
        </div>

        {/* Film Stock Emulation */}
        <div className="darkroom-card p-5 border border-slate-800 space-y-2 bg-gradient-to-br from-amber-950/20 to-slate-900">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-accent-gold" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Recommended Emulation</span>
          </div>
          <h4 className="text-sm font-bold text-slate-100">{filmStockEmulation.name}</h4>
          <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
            {filmStockEmulation.whyItFits || filmStockEmulation.description}
          </p>
        </div>

      </div>

      {/* Dominant Color Palette Swatches */}
      <div className="darkroom-card p-5 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <Palette className="w-3.5 h-3.5 text-accent-gold" />
          Extracted Tonal Palette & Harmonic Swatches
        </h4>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {dominantPalette.map((swatch, idx) => (
            <div key={idx} className="bg-slate-900/80 rounded-xl p-3 border border-slate-800 space-y-2">
              <div
                className="w-full h-12 rounded-lg shadow-inner border border-white/10"
                style={{ backgroundColor: swatch?.hex || '#64748b' }}
              />
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate">{swatch?.name || 'Tone'}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                  {swatch?.role || 'midtone'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 block">{swatch?.hex || '#64748b'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Numerical Grading Matrix Breakdown */}
      <div className="darkroom-card p-5 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            AI-Calculated Darkroom Grading Matrix
          </h4>
          {onOpenDarkroom && (
            <button
              type="button"
              onClick={onOpenDarkroom}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              Open in Live Darkroom Studio →
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Exposure:</span>
            <span className="text-accent-gold font-bold">
              {(numericalGrading.exposureEV ?? 0) > 0 ? `+${numericalGrading.exposureEV}` : numericalGrading.exposureEV ?? 0} EV
            </span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Contrast:</span>
            <span className="text-slate-200 font-bold">{numericalGrading.contrast ?? 0}</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Highlights:</span>
            <span className="text-cyan-400 font-bold">{numericalGrading.highlights ?? 0}</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Shadows:</span>
            <span className="text-emerald-400 font-bold">{numericalGrading.shadows ?? 0}</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Temperature:</span>
            <span className="text-amber-400 font-bold">{numericalGrading.temperature ?? 0}</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Vibrance:</span>
            <span className="text-purple-400 font-bold">{numericalGrading.vibrance ?? 0}</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Vignette:</span>
            <span className="text-slate-200 font-bold">{numericalGrading.vignette ?? 0}%</span>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Film Grain:</span>
            <span className="text-slate-200 font-bold">{numericalGrading.grain ?? 0}%</span>
          </div>
        </div>
      </div>

    </div>
  );
};
