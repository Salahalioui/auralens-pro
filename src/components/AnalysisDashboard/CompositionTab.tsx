import React, { useState } from 'react';
import { Crop, Grid, Compass, Scissors, CheckCircle2 } from 'lucide-react';
import { Phase1Composition } from '../../types/photography';

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

  const ymin = Number(suggestedCrop?.ymin) || 50;
  const xmin = Number(suggestedCrop?.xmin) || 50;
  const ymax = Number(suggestedCrop?.ymax) || 950;
  const xmax = Number(suggestedCrop?.xmax) || 950;

  // Convert 0-1000 coords to percentage styles
  const cropStyle = {
    top: `${Math.min(90, Math.max(0, (ymin / 1000) * 100))}%`,
    left: `${Math.min(90, Math.max(0, (xmin / 1000) * 100))}%`,
    width: `${Math.min(100, Math.max(10, ((xmax - xmin) / 1000) * 100))}%`,
    height: `${Math.min(100, Math.max(10, ((ymax - ymin) / 1000) * 100))}%`,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left: Interactive Visual Canvas Overlay (7 cols) */}
      <div className="lg:col-span-7 space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-darkroom-950 border border-slate-800 shadow-2xl">
          
          {/* Base Image */}
          <img
            src={`data:${imageMime || 'image/jpeg'};base64,${imageBase64}`}
            alt="Composition analysis"
            className="w-full h-auto object-contain max-h-[500px] mx-auto block"
          />

          {/* SVG Overlay */}
          <div className="absolute inset-0 pointer-events-none">
            
            {/* Rule of Thirds Grid */}
            {showGrid && (
              <svg className="w-full h-full absolute inset-0 opacity-40">
                {/* Horizontal grid lines */}
                <line x1="0" y1="33.33%" x2="100%" y2="33.33%" stroke="#eab308" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="0" y1="66.66%" x2="100%" y2="66.66%" stroke="#eab308" strokeWidth="1" strokeDasharray="4 4" />
                {/* Vertical grid lines */}
                <line x1="33.33%" y1="0" x2="33.33%" y2="100%" stroke="#eab308" strokeWidth="1" strokeDasharray="4 4" />
                <line x1="66.66%" y1="0" x2="66.66%" y2="100%" stroke="#eab308" strokeWidth="1" strokeDasharray="4 4" />
                
                {/* 4 Power Intersection Points */}
                <circle cx="33.33%" cy="33.33%" r="6" fill="#eab308" opacity="0.8" />
                <circle cx="66.66%" cy="33.33%" r="6" fill="#eab308" opacity="0.8" />
                <circle cx="33.33%" cy="66.66%" r="6" fill="#eab308" opacity="0.8" />
                <circle cx="66.66%" cy="66.66%" r="6" fill="#eab308" opacity="0.8" />
              </svg>
            )}

            {/* Horizon Tilt Guide */}
            {showHorizon && horizonLevel?.tilted && (
              <div
                className="absolute inset-x-0 top-1/2 border-t-2 border-cyan-400 border-dashed opacity-80"
                style={{
                  transform: `rotate(${horizonLevel.direction === 'clockwise' ? '-' : ''}${horizonLevel.degrees || 0}deg)`
                }}
              >
                <span className="absolute -top-6 left-4 bg-cyan-500/90 text-darkroom-950 px-2 py-0.5 rounded text-[10px] font-bold font-mono">
                  Horizon Tilt: {horizonLevel.degrees || 0}° {horizonLevel.direction || 'tilt'}
                </span>
              </div>
            )}

            {/* Gemini's Suggested Crop Bounding Box */}
            {showCrop && (
              <div
                className="absolute border-2 border-emerald-400 bg-emerald-500/10 shadow-2xl transition-all duration-300"
                style={cropStyle}
              >
                {/* Crop Corner Handles */}
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
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  showGrid ? 'bg-amber-500/20 text-accent-gold border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Grid className="w-3 h-3" />
                <span>Rule of Thirds</span>
              </button>

              <button
                type="button"
                onClick={() => setShowCrop(!showCrop)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
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
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
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
      </div>

      {/* Right: Detailed Composition Critique & Action Plan (5 cols) */}
      <div className="lg:col-span-5 space-y-4">
        
        {/* Score Header */}
        <div className="darkroom-card p-5 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-cinzel text-sm font-bold text-slate-100 flex items-center gap-2">
              <Crop className="w-4 h-4 text-accent-gold" />
              Framing & Spatial Geometry
            </h4>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-accent-gold border border-amber-500/30">
              Score: {composition?.score ?? 70}/100
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Framing Assessment:</span>
              <p className="text-slate-200 leading-relaxed">{framingCritique}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Subject Placement:</span>
              <p className="text-slate-200 leading-relaxed">{subjectPlacement}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Rule of Thirds Alignment:</span>
              <p className="text-slate-200 leading-relaxed">{ruleOfThirdsAlignment}</p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block mb-0.5">Leading Lines & Depth:</span>
              <p className="text-slate-200 leading-relaxed">{leadingLinesAndDepth}</p>
            </div>
          </div>
        </div>

        {/* Clutter & Distraction Elimination Checklist */}
        <div className="darkroom-card p-5 border border-slate-800">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
            <Scissors className="w-3.5 h-3.5 text-rose-400" />
            Recommended Decluttering Directives
          </h4>
          <ul className="space-y-2">
            {clutterRemovalTips.length > 0 ? (
              clutterRemovalTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))
            ) : (
              <li className="text-xs text-slate-400 italic">No critical clutter detected.</li>
            )}
          </ul>
        </div>

      </div>

    </div>
  );
};
