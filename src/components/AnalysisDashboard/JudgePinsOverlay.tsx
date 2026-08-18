import React, { useState } from 'react';
import { JudgePin } from '../../types/photography';
import { MapPin, Info, Sparkles, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface JudgePinsOverlayProps {
  pins: JudgePin[];
  imageSrc: string;
  className?: string;
}

export const JudgePinsOverlay: React.FC<JudgePinsOverlayProps> = ({
  pins,
  imageSrc,
  className = ''
}) => {
  const [activePinId, setActivePinId] = useState<string | null>(pins[0]?.id || null);
  const [showPins, setShowPins] = useState<boolean>(true);

  if (!pins || pins.length === 0) return null;

  const activePin = pins.find(p => p.id === activePinId) || pins[0];

  const getPinColor = (type: string) => {
    switch (type) {
      case 'composition': return 'from-amber-500 to-amber-600 border-amber-300 text-amber-950';
      case 'lighting': return 'from-yellow-400 to-amber-500 border-yellow-200 text-yellow-950';
      case 'color': return 'from-emerald-500 to-teal-600 border-emerald-300 text-emerald-950';
      case 'sharpness': return 'from-cyan-500 to-blue-600 border-cyan-300 text-cyan-950';
      default: return 'from-amber-500 to-amber-600 border-amber-300 text-amber-950';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'composition': return 'bg-amber-500/20 text-accent-gold border-amber-500/30';
      case 'lighting': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'color': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'sharpness': return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
      default: return 'bg-amber-500/20 text-accent-gold border-amber-500/30';
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Top Banner Control */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-accent-gold" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
            Interactive Judge's Critique Pins
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {pins.length} Hotspots
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowPins(!showPins)}
          className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
        >
          {showPins ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{showPins ? 'Hide Pins' : 'Show Pins'}</span>
        </button>
      </div>

      {/* Interactive Photo Canvas Box */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-darkroom-950 shadow-2xl group">
        <img
          src={imageSrc}
          alt="Judge Critique Analysis"
          className="w-full max-h-[460px] object-contain mx-auto block"
        />

        {/* Pin Anchors Overlay */}
        {showPins && pins.map((pin, idx) => {
          const isSelected = activePinId === pin.id;
          const leftPercent = Math.max(5, Math.min(95, pin.x / 10));
          const topPercent = Math.max(5, Math.min(95, pin.y / 10));

          return (
            <div
              key={pin.id || idx}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer"
              onClick={() => setActivePinId(pin.id)}
            >
              <div className="relative flex items-center justify-center">
                {/* Pulsing Aura */}
                <span className={`absolute w-8 h-8 rounded-full animate-ping opacity-60 bg-gradient-to-r ${getPinColor(pin.type)}`} />
                
                {/* Core Pin Button */}
                <button
                  type="button"
                  className={`relative w-7 h-7 rounded-full shadow-xl flex items-center justify-center font-mono font-black text-[11px] border-2 transition-all transform hover:scale-125 cursor-pointer bg-gradient-to-br ${getPinColor(pin.type)} ${
                    isSelected ? 'ring-4 ring-white/60 scale-110 z-30' : 'opacity-90'
                  }`}
                  title={`${pin.label}: ${pin.critique}`}
                >
                  {idx + 1}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Active Pin Detail Card */}
      {activePin && (
        <div className="p-4 rounded-2xl bg-darkroom-900 border border-slate-800 shadow-xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md border ${getBadgeColor(activePin.type)}`}>
                {activePin.type}
              </span>
              <h4 className="font-bold text-slate-100 text-sm">
                {activePin.label}
              </h4>
            </div>

            <span className="text-[10px] font-mono text-slate-500">
              Pin #{pins.findIndex(p => p.id === activePin.id) + 1} of {pins.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/70 border border-rose-500/20 space-y-1">
              <span className="font-mono font-bold text-rose-400 flex items-center gap-1.5 text-[11px]">
                <Info className="w-3.5 h-3.5" />
                Judge's Critique:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {activePin.critique}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/70 border border-emerald-500/20 space-y-1">
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1.5 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Photochemical / AI Fix Applied:
              </span>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                {activePin.fixApplied}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
