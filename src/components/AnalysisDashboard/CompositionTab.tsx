import React, { useState } from 'react';
import { Crop, Grid, Compass, Scissors, CheckCircle2, MapPin, Sparkles } from 'lucide-react';
import { Phase1Composition } from '../../types/photography';
import { JudgePinsOverlay } from './JudgePinsOverlay';

interface CompositionTabProps {
  composition: Phase1Composition;
  imageBase64: string;
  imageMime: string;
}

export const CompositionTab: React.FC<CompositionTabProps> = ({
  composition,
  imageBase64,
  imageMime
}) => {
  const [visualMode, setVisualMode] = useState<'geometry' | 'pins'>('geometry');
  const [showGrid, setShowGrid] = useState(true);
  const [showCrop, setShowCrop] = useState(true);
  const [showHorizon, setShowHorizon] = useState(true);

  // Safe defaults
  const suggestedCrop = composition?.suggestedCrop || {
    ymin: 50,
    xmin: 50,
    ymax: 950,
    xmax: 950,
    rationale: 'Balanced crop maintaining visual center.',
    targetAspectRatio: '16:9'
  };

  const horizonLevel = composition?.horizonLevel || {
    tilted: false,
    degrees: 0,
    direction: 'level'
  };

  const framingCritique = composition?.framingCritique || 'Framing evaluated for subject placement and balance.';
  const subjectPlacement = composition?.subjectPlacement || 'Subject positioned along visual flow.';
  const ruleOfThirdsAlignment = composition?.ruleOfThirdsAlignment || 'Focal elements align with golden section power points.';
  const leadingLinesAndDepth = composition?.leadingLinesAndDepth || 'Natural depth and perspective balance.';
  const clutterRemovalTips = Array.isArray(composition?.clutterRemovalTips) ? composition.clutterRemovalTips : [];
  const judgePins = Array.isArray(composition?.judgePins) ? composition.judgePins : [];

  const ymin = Number(suggestedCrop?.ymin) || 50;
  const xmin = Number(suggestedCrop?.xmin) || 50;
  const ymax = Number(suggestedCrop?.ymax) || 950;
  const xmax = Number(suggestedCrop?.xmax) || 950;

  const cropStyle = {
    top: `${Math.min(90, Math.max(0, (ymin / 1000) * 100))}%`,
    left: `${Math.min(90, Math.max(0, (xmin / 1000) * 100))}%`,
    width: `${Math.min(100, Math.max(10, ((xmax - xmin) / 1000) * 100))}%`,
    height: `${Math.min(100, Math.max(10, ((ymax - ymin) / 1000) * 100))}%`,
  };

  const fullImageSrc = `data:${imageMime || 'image/jpeg'};base64,${imageBase64}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left: Interactive Visual Canvas Overlay (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        
        {/* Mode Selector Pill (Geometry vs Judge Pins) */}
        <div className="flex items-center justify-between bg-darkroom-900 border border-slate-800 rounded-xl p-1 text-xs">
          <button
            type="button"
            onClick={() => setVisualMode('geometry')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              visualMode === 'geometry'
                ? 'bg-amber-500/20 text-accent-gold border border-amber-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Framing & Horizon Grid</span>
          </button>

          <button
            type="button"
            onClick={() => setVisualMode('pins')}
            className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              visualMode === 'pins'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Interactive Judge Pins ({judgePins.length || 4})</span>
          </button>
        </div>

        {visualMode === 'geometry' ? (
          <>
            <div className="relative rounded-2xl overflow-hidden bg-darkroom-950 border border-slate-800 shadow-2xl">
              <div className="relative">
                <img
                  src={fullImageSrc}
                  alt="Original Composition Analysis"
                  className="w-full max-h-[460px] object-contain mx-auto block"
                />

                {/* Rule of Thirds 3x3 Grid Overlay */}
                {showGrid && (
                  <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-b border-white/20" />
                    <div className="border-r border-b border-white/20" />
                    <div className="border-r border-b border-white/20 relative">
                      <div className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-accent-gold shadow-lg shadow-amber-500/80 animate-pulse" />
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-gold shadow-lg shadow-amber-500/80 animate-pulse" />
                      <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-full bg-accent-gold shadow-lg shadow-amber-500/80 animate-pulse" />
                      <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-accent-gold shadow-lg shadow-amber-500/80 animate-pulse" />
                    </div>
                    <div className="border-b border-white/20" />
                    <div className="border-r border-white/20" />
                    <div className="border-r border-white/20" />
                    <div />
                  </div>
                )}

                {/* Horizon Level Line */}
                {showHorizon && horizonLevel?.tilted && (
                  <div 
                    className="absolute left-0 right-0 top-1/2 border-t-2 border-dashed border-cyan-400 pointer-events-none flex items-center justify-end pr-4 transition-transform duration-500"
                    style={{ 
                      transform: `rotate(${horizonLevel.direction === 'clockwise' ? -horizonLevel.degrees : horizonLevel.degrees}deg)` 
                    }}
                  >
                    <span className="bg-cyan-500/90 backdrop-blur-md text-darkroom-950 px-2 py-0.5 rounded text-[10px] font-bold font-mono shadow-lg">
                      Tilted: {horizonLevel.degrees}° {horizonLevel.direction}
                    </span>
                  </div>
                )}

                {/* Gemini's Suggested Crop Bounding Box */}
                {showCrop && (
                  <div
                    className="absolute border-2 border-emerald-400 bg-emerald-500/10 shadow-2xl transition-all duration-300"
                    style={cropStyle}
                  >
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-emerald-400 border border-slate-900" />
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-emerald-400 border border-slate-900" />
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-emerald-400 border border-slate-900" />
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-emerald-400 border border-slate-900" />

                    <div className="absolute top-2 left-2 bg-emerald-500/90 backdrop-blur-md text-darkroom-950 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                      Suggested Crop ({suggestedCrop.targetAspectRatio || '16:9'})
                    </div>
                  </div>
                )}

              </div>

              {/* Overlay Controls Bar */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-darkroom-950/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs z-10">
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  Visual Overlays:
                </span>
                
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGrid(!showGrid)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      showGrid ? 'bg-amber-500/20 text-accent-gold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Grid className="w-3 h-3" />
                    <span>Rule of Thirds</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCrop(!showCrop)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                      showCrop ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Scissors className="w-3 h-3" />
                    <span>Suggested Crop</span>
                  </button>

                  {horizonLevel?.tilted && (
                    <button
                      type="button"
                      onClick={() => setShowHorizon(!showHorizon)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                        showHorizon ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <Compass className="w-3 h-3" />
                      <span>Horizon ({horizonLevel.degrees}°)</span>
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* Crop Rationale Card */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs">
              <span className="font-bold text-accent-gold flex items-center gap-1 mb-1">
                <Crop className="w-3.5 h-3.5" />
                Crop & Aspect Ratio Strategy:
              </span>
              <p className="text-slate-300 leading-relaxed">
                {suggestedCrop.rationale || 'Centered golden ratio framing.'}
              </p>
            </div>
          </>
        ) : (
          <JudgePinsOverlay
            pins={judgePins.length > 0 ? judgePins : [
              {
                id: 'p1',
                x: 150,
                y: 120,
                type: 'composition',
                label: 'Edge Distraction',
                critique: 'High-contrast edge tangents pull the viewer gaze away.',
                fixApplied: 'Crop boundary isolates subject on golden ratio point.'
              },
              {
                id: 'p2',
                x: 480,
                y: 520,
                type: 'lighting',
                label: 'Hero Subject',
                critique: 'Shadows on the subject are slightly flat and underexposed.',
                fixApplied: '+0.35 EV exposure lift + Zone V micro-contrast.'
              },
              {
                id: 'p3',
                x: 820,
                y: 280,
                type: 'sharpness',
                label: 'Optical Depth',
                critique: 'Background detail competes with the hero subject.',
                fixApplied: 'f/1.4 optical bokeh separation blurs the background.'
              }
            ]}
            imageSrc={fullImageSrc}
          />
        )}

      </div>

      {/* Right: Detailed Structured Critique (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Score & Summary Card */}
        <div className="darkroom-card p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-cinzel font-bold text-base text-slate-100 flex items-center gap-2">
              <Crop className="w-4 h-4 text-accent-gold" />
              <span>Compositional Critique</span>
            </h3>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30">
              <span className="text-[10px] font-mono uppercase text-slate-400">Score</span>
              <span className="font-mono font-bold text-sm text-accent-gold">
                {composition?.score || 65}/100
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {framingCritique}
          </p>
        </div>

        {/* Structured Geometry Details */}
        <div className="space-y-2.5">
          
          {/* Subject Placement */}
          <div className="bg-darkroom-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
              Focal Anchor Placement
            </span>
            <p className="text-slate-200 leading-relaxed">
              {subjectPlacement}
            </p>
          </div>

          {/* Rule of Thirds */}
          <div className="bg-darkroom-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
              Rule of Thirds & Golden Section
            </span>
            <p className="text-slate-200 leading-relaxed">
              {ruleOfThirdsAlignment}
            </p>
          </div>

          {/* Leading Lines & Depth */}
          <div className="bg-darkroom-900/80 p-3.5 rounded-xl border border-slate-800 text-xs space-y-1">
            <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
              Leading Lines & Perspective Depth
            </span>
            <p className="text-slate-200 leading-relaxed">
              {leadingLinesAndDepth}
            </p>
          </div>

          {/* Clutter Removal Checklist */}
          {clutterRemovalTips.length > 0 && (
            <div className="p-4 rounded-xl bg-darkroom-900/80 border border-slate-800 space-y-2">
              <span className="font-mono font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                Recommended Tangent & Clutter Fixes
              </span>
              <ul className="space-y-1.5">
                {clutterRemovalTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
