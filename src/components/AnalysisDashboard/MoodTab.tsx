import React from 'react';
import { Camera, Heart, BookOpen, Lightbulb, Sparkles, Layers } from 'lucide-react';
import { Phase2MoodAndStyle } from '../../types/photography';

interface MoodTabProps {
  mood: Phase2MoodAndStyle;
}

export const MoodTab: React.FC<MoodTabProps> = ({ mood }) => {
  const score = mood?.score ?? 75;
  const detectedGenre = mood?.detectedGenre || 'Nature & Wildlife';
  const emotionalResonance = mood?.emotionalResonance || 'Evocative and authentic naturalism';
  const photographerIntention = mood?.photographerIntention || 'Capturing the serenity of the natural environment';
  const lightingAtmosphere = mood?.lightingAtmosphere || 'Ambient diffused illumination';
  const narrativeCritique = mood?.narrativeCritique || 'Subject possesses strong visual presence that can be elevated with directional contrast';
  const suggestedStorytellingEdits = Array.isArray(mood?.suggestedStorytellingEdits) ? mood.suggestedStorytellingEdits : [];
  const recommendedStylePreset = mood?.recommendedStylePreset || 'National Geographic Documentary';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Left Column: Genre, Intent & Emotional Tone */}
      <div className="space-y-4">
        
        {/* Genre & Score Card */}
        <div className="darkroom-card p-5 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Classified Genre</span>
                <h4 className="text-base font-bold text-slate-100">{detectedGenre}</h4>
              </div>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Score: {score}/100
            </span>
          </div>

          <div className="pt-2 border-t border-slate-800 space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                Emotional Tone & Resonance:
              </span>
              <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {emotionalResonance}
              </p>
            </div>

            <div>
              <span className="text-slate-400 font-semibold flex items-center gap-1.5 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                Photographer's Intention:
              </span>
              <p className="text-slate-200 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                {photographerIntention}
              </p>
            </div>
          </div>
        </div>

        {/* Recommended Preset Ribbon */}
        <div className="bg-gradient-to-r from-purple-950/40 via-darkroom-900 to-slate-900 p-4 rounded-2xl border border-purple-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">AI Match Preset</span>
              <h5 className="text-xs font-bold text-slate-100">{recommendedStylePreset}</h5>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
            Recommended
          </span>
        </div>

      </div>

      {/* Right Column: Lighting Atmosphere & Storytelling Directives */}
      <div className="space-y-4">
        
        {/* Lighting Atmosphere Critique */}
        <div className="darkroom-card p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Lightbulb className="w-4 h-4" />
            <span>Lighting & Environmental Atmosphere</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
            {lightingAtmosphere}
          </p>
        </div>

        {/* Narrative Upgrades & Gallery Potential */}
        <div className="darkroom-card p-5 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Layers className="w-4 h-4" />
            <span>Narrative Elevation Strategy</span>
          </div>
          
          <p className="text-xs text-slate-300 leading-relaxed">
            {narrativeCritique}
          </p>

          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-mono text-slate-400 block">Suggested Narrative Transformations:</span>
            <ul className="space-y-1.5">
              {suggestedStorytellingEdits.length > 0 ? (
                suggestedStorytellingEdits.map((edit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" />
                    <span>{edit}</span>
                  </li>
                ))
              ) : (
                <li className="text-xs text-slate-400 italic">Apply cinematic color grading and selective highlight separation.</li>
              )}
            </ul>
          </div>
        </div>

      </div>

    </div>
  );
};
