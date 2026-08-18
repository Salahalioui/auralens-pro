import React from 'react';
import { Award, Compass, Eye, Sparkles, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Phase4Synthesis } from '../../types/photography';

interface ExecutiveScorecardProps {
  synthesis: Phase4Synthesis;
}

export const ExecutiveScorecard: React.FC<ExecutiveScorecardProps> = ({ synthesis }) => {
  const overallScore = Number(synthesis?.overallScore) || 72;
  const executiveSummary = synthesis?.executiveSummary || 'Photographic foundation evaluated across composition, lighting, and color harmony.';
  const radarScores = synthesis?.radarScores || {
    composition: 70,
    lighting: 70,
    colorHarmony: 70,
    storytelling: 70,
    technicalSharpness: 70
  };

  // Qualitative rating badge
  const getRatingBadge = (score: number) => {
    if (score >= 85) return { label: 'Gallery Caliber Foundation', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 70) return { label: 'High Masterwork Potential', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    if (score >= 50) return { label: 'Diamond in the Rough', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
    return { label: 'Needs Complete Re-Imagining', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const badge = getRatingBadge(overallScore);

  const scoreCategories = [
    { label: 'Composition & Balance', score: radarScores?.composition ?? 70, color: 'bg-amber-400' },
    { label: 'Lighting & Dynamic Range', score: radarScores?.lighting ?? 70, color: 'bg-cyan-400' },
    { label: 'Color Science & Harmony', score: radarScores?.colorHarmony ?? 70, color: 'bg-emerald-400' },
    { label: 'Storytelling & Atmosphere', score: radarScores?.storytelling ?? 70, color: 'bg-purple-400' },
    { label: 'Technical Clarity & Sharpness', score: radarScores?.technicalSharpness ?? 70, color: 'bg-rose-400' },
  ];

  return (
    <div className="darkroom-card p-6 border border-slate-800 shadow-xl space-y-6">
      
      {/* Top Header & Radial Ring */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-800/80">
        
        {/* Score Ring */}
        <div className="flex items-center gap-5">
          <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.2"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-accent-gold transition-all duration-1000 ease-out"
                strokeDasharray={`${overallScore}, 100`}
                strokeWidth="3.2"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-bold font-mono text-slate-100 leading-none">
                {overallScore}
              </span>
              <span className="text-[9px] font-mono text-slate-500 mt-0.5">/ 100</span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-cinzel text-base font-bold text-slate-100 tracking-wide">
                PHOTOGRAPHY BENCHMARK
              </h3>
              <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-md">
              Multimodal critique evaluating optical balance, color grading, and narrative resonance.
            </p>
          </div>
        </div>

        {/* Transformation Potential Badge */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-accent-gold border border-amber-500/20">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">Transformation Potential</span>
            <span className="text-xs font-bold text-slate-100">
              +{100 - overallScore}% Elevation to Gallery Standard
            </span>
          </div>
        </div>

      </div>

      {/* Executive Summary */}
      <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
        <span className="text-[10px] font-mono uppercase tracking-wider text-accent-gold font-bold flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          Executive Summary & Critique
        </span>
        <p className="text-xs text-slate-200 leading-relaxed">
          {executiveSummary}
        </p>
      </div>

      {/* 5-Dimensional Radar/Bar Breakdown */}
      <div className="space-y-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
          Performance Dimensions
        </span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 text-xs">
          {scoreCategories.map((item, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-slate-300 font-medium">{item.label}</span>
                <span className="font-mono font-bold text-slate-200">{item.score}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${item.color} transition-all duration-1000 ease-out`}
                  style={{ width: `${item.score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
