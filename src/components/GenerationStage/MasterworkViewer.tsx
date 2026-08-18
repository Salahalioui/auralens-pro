import React, { useState, useRef, useEffect } from 'react';
import { Download, Columns, SplitSquareVertical, ZoomIn, ZoomOut, Sparkles, CheckCircle2, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { GeneratedMasterwork } from '../../types/photography';

interface MasterworkViewerProps {
  originalBase64: string;
  originalMime: string;
  masterwork: GeneratedMasterwork;
  onOpenRetry: () => void;
  onOpenExport: () => void;
}

export const MasterworkViewer: React.FC<MasterworkViewerProps> = ({
  originalBase64,
  originalMime,
  masterwork,
  onOpenRetry,
  onOpenExport
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'side-by-side'>('split');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Trigger celebration confetti upon viewing
  useEffect(() => {
    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#eab308', '#06b6d4', '#f59e0b', '#10b981']
      });
    } catch {
      // ignore
    }
  }, []);

  const handlePointerDown = () => setIsDragging(true);
  const handlePointerUp = () => setIsDragging(false);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = masterwork.imageUrl;
    a.download = `auralens_masterwork_${Date.now()}.jpg`;
    a.click();
  };

  const origSrc = `data:${originalMime};base64,${originalBase64}`;

  return (
    <div className="space-y-6">
      
      {/* Viewer Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-darkroom-900/90 p-4 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-gold" />
            <h3 className="font-cinzel text-base font-bold text-slate-100">
              Award-Winning Masterwork Output
            </h3>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {masterwork.modelUsed}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Rendered in {(masterwork.generationTimeMs / 1000).toFixed(1)}s • Enhanced with Multi-Phase Reasoning
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* View Toggle */}
          <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700">
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'split' ? 'bg-amber-500/20 text-accent-gold font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SplitSquareVertical className="w-3.5 h-3.5" />
              <span>Split Slider</span>
            </button>
            <button
              onClick={() => setViewMode('side-by-side')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'side-by-side' ? 'bg-amber-500/20 text-accent-gold font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
          </div>

          {/* Retry / Refine */}
          <button
            onClick={onOpenRetry}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refine & Re-roll</span>
          </button>

          {/* Full Report Export */}
          <button
            onClick={onOpenExport}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-accent-gold border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <span>Export Pro Report</span>
          </button>

          {/* Download Masterwork */}
          <button
            onClick={handleDownload}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-darkroom-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Masterwork</span>
          </button>

        </div>
      </div>

      {/* Comparison Viewport */}
      {viewMode === 'split' ? (
        <div
          ref={containerRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerUp}
          className="relative w-full max-h-[620px] aspect-[16/10] bg-darkroom-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl select-none cursor-ew-resize touch-none flex items-center justify-center"
        >
          {/* Base Layer: Generated Masterwork */}
          <img
            src={masterwork.imageUrl}
            alt="AI Masterwork"
            className="w-full h-full object-contain pointer-events-none"
          />

          {/* Overlay Layer: Original Amateur Shot (Clipped by slider position) */}
          <div
            className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center"
            style={{ clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)` }}
          >
            <img
              src={origSrc}
              alt="Original amateur shot"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Draggable Vertical Divider Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-accent-gold shadow-[0_0_15px_rgba(234,179,8,0.8)] flex items-center justify-center cursor-ew-resize"
            style={{ left: `${sliderPos}%` }}
          >
            <div className="w-8 h-8 rounded-full bg-accent-gold text-darkroom-950 shadow-2xl flex items-center justify-center font-bold text-xs border-2 border-darkroom-950">
              ↔
            </div>
          </div>

          {/* Badges */}
          <div className="absolute top-3 left-3 bg-darkroom-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
            Original Amateur Shot
          </div>
          <div className="absolute top-3 right-3 bg-amber-500/90 text-darkroom-950 font-bold px-2.5 py-1 rounded-lg text-[11px] font-mono shadow-lg">
            AuraLens AI Masterwork
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Original Box */}
          <div className="darkroom-card p-3 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Original Amateur Shot</span>
              <span>Before Transformation</span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center">
              <img
                src={origSrc}
                alt="Original"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Masterwork Box */}
          <div className="darkroom-card p-3 border border-amber-500/40 space-y-2 bg-gradient-to-b from-amber-950/10 to-darkroom-900 shadow-xl shadow-amber-500/5">
            <div className="flex items-center justify-between text-xs font-mono text-accent-gold font-bold">
              <span>Award-Winning Masterwork</span>
              <span>Nano Banana 2 Output</span>
            </div>
            <div className="rounded-xl overflow-hidden bg-slate-950 aspect-[4/3] flex items-center justify-center">
              <img
                src={masterwork.imageUrl}
                alt="Masterwork"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

        </div>
      )}

      {/* Prompt Used Summary */}
      <div className="darkroom-card p-4 border border-slate-800 text-xs space-y-1.5">
        <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px] block">
          Synthesis Prompt Fed to Nano Banana Engine:
        </span>
        <p className="text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
          {masterwork.promptUsed}
        </p>
      </div>

    </div>
  );
};
