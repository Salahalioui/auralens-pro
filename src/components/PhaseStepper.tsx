import React from 'react';
import { Crop, Compass, Palette, Sparkles, Wand2, CheckCircle2, Loader2 } from 'lucide-react';
import { AnalysisStage } from '../types/photography';

interface PhaseStepperProps {
  currentStage: AnalysisStage;
  activeTab: number;
  onSelectTab: (index: number) => void;
  statusMessage?: string;
}

export const PhaseStepper: React.FC<PhaseStepperProps> = ({
  currentStage,
  activeTab,
  onSelectTab,
  statusMessage
}) => {
  const steps = [
    {
      id: 0,
      phaseNum: 'Phase 1',
      title: 'Composition & Framing',
      icon: Crop,
      stageKey: 'phase1_composition'
    },
    {
      id: 1,
      phaseNum: 'Phase 2',
      title: 'Mood & Storytelling',
      icon: Compass,
      stageKey: 'phase2_mood'
    },
    {
      id: 2,
      phaseNum: 'Phase 3',
      title: 'Color Science & Light',
      icon: Palette,
      stageKey: 'phase3_color'
    },
    {
      id: 3,
      phaseNum: 'Phase 4',
      title: 'Synthesis & Master Prompt',
      icon: Sparkles,
      stageKey: 'phase4_synthesis'
    },
    {
      id: 4,
      phaseNum: 'Phase 5',
      title: 'Nano Banana Output',
      icon: Wand2,
      stageKey: 'generating_masterwork'
    }
  ];

  const isCompleted = currentStage === 'completed';

  return (
    <div className="space-y-3">
      
      {/* Stepper Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = activeTab === step.id;
          const isCurrentLoading = currentStage === step.stageKey;

          return (
            <button
              key={step.id}
              onClick={() => onSelectTab(step.id)}
              className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-b from-slate-900 to-darkroom-900 border-accent-gold/60 shadow-lg shadow-amber-500/10'
                  : 'bg-darkroom-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/40'
              }`}
            >
              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 via-accent-gold to-cyan-400" />
              )}

              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-accent-gold">
                  {step.phaseNum}
                </span>
                {isCurrentLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-accent-gold animate-spin" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-accent-gold' : 'text-slate-500'}`} />
                )}
              </div>

              <div>
                <h4 className={`text-xs font-semibold truncate ${
                  isActive ? 'text-slate-100' : 'text-slate-300'
                }`}>
                  {step.title}
                </h4>
              </div>
            </button>
          );
        })}
      </div>

      {/* Real-time Status Message Ribbon */}
      {statusMessage && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-ping" />
            <span className="text-slate-400">Gemini Reasoning:</span>
            <span className="text-accent-gold font-medium">{statusMessage}</span>
          </div>
          <span className="text-[11px] text-slate-500 hidden sm:block">
            High Reasoning Mode
          </span>
        </div>
      )}

    </div>
  );
};
