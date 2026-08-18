import React, { useState } from 'react';
import { 
  X, 
  Zap, 
  Sparkles, 
  Download, 
  CheckCircle2, 
  Sliders, 
  Cpu, 
  Layers,
  ArrowRight,
  ShieldCheck,
  User,
  TreePine,
  Image as ImageIcon
} from 'lucide-react';
import { 
  runMultiEngineUpscaler, 
  UpscaleEngineId, 
  UPSCALE_ENGINES, 
  UpscaleProgress 
} from '../../services/imageProcessor';

interface UpscaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export const UpscaleModal: React.FC<UpscaleModalProps> = ({
  isOpen,
  onClose,
  canvasRef
}) => {
  const [selectedEngine, setSelectedEngine] = useState<UpscaleEngineId>('truthful_highpass');
  const [scaleFactor, setScaleFactor] = useState<2 | 4>(2);
  const [sharpness, setSharpness] = useState<number>(45);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<UpscaleProgress | null>(null);
  const [upscaledResult, setUpscaledResult] = useState<{
    dataUrl: string;
    width: number;
    height: number;
    engineUsed: string;
  } | null>(null);

  if (!isOpen) return null;

  const currentWidth = canvasRef.current?.width || 1280;
  const currentHeight = canvasRef.current?.height || 720;
  const targetWidth = currentWidth * scaleFactor;
  const targetHeight = currentHeight * scaleFactor;

  const handleStartUpscale = async () => {
    if (!canvasRef.current) return;
    setIsProcessing(true);
    setUpscaledResult(null);

    try {
      const res = await runMultiEngineUpscaler(
        canvasRef.current,
        selectedEngine,
        scaleFactor,
        sharpness,
        (p) => setProgress(p)
      );
      setUpscaledResult(res);
    } catch (err) {
      console.error('Super-Resolution upscaling failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!upscaledResult) return;
    const a = document.createElement('a');
    a.href = upscaledResult.dataUrl;
    a.download = `AuraLens_SuperRes_${selectedEngine}_${upscaledResult.width}x${upscaledResult.height}_${Date.now()}.jpg`;
    a.click();
  };

  const getEngineIcon = (id: UpscaleEngineId) => {
    switch (id) {
      case 'truthful_highpass': return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
      case 'neural_esrgan': return <TreePine className="w-4 h-4 text-cyan-400" />;
      case 'face_codeformer': return <User className="w-4 h-4 text-accent-gold" />;
      default: return <Sparkles className="w-4 h-4 text-accent-gold" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="darkroom-card max-w-2xl w-full p-6 sm:p-7 relative border border-slate-700/80 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-all cursor-pointer disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-accent-gold to-amber-500 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-darkroom-950 rounded-[14px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-cinzel font-bold text-lg text-slate-100">
                Multi-Engine AI Super-Resolution Studio
              </h2>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                100% Free
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select the optimal AI reconstruction engine tailored for your specific photographic genre
            </p>
          </div>
        </div>

        {/* Resolution Comparison Card */}
        <div className="p-3.5 rounded-2xl bg-darkroom-950 border border-slate-800 flex items-center justify-between gap-4 text-xs font-mono">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase text-slate-500">Source Resolution</span>
            <p className="text-slate-300 font-bold text-sm">
              {currentWidth} × {currentHeight}
            </p>
          </div>

          <ArrowRight className="w-5 h-5 text-accent-gold shrink-0 animate-pulse" />

          <div className="space-y-0.5 text-right">
            <span className="text-[10px] uppercase text-cyan-400 font-bold">Upscaled Target</span>
            <p className="text-cyan-300 font-black text-sm">
              {targetWidth} × {targetHeight} ({scaleFactor === 4 ? '4K Ultra-HD' : 'Quad-HD'})
            </p>
          </div>
        </div>

        {/* Configuration Controls (When not completed) */}
        {!upscaledResult && !isProcessing && (
          <div className="space-y-4 text-xs">
            
            {/* Multi-Engine Selector (3 Cards) */}
            <div className="space-y-2">
              <span className="font-mono font-bold text-slate-300 block">
                1. Select AI Super-Resolution Architecture:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {UPSCALE_ENGINES.map((engine) => {
                  const isSelected = selectedEngine === engine.id;
                  return (
                    <button
                      key={engine.id}
                      type="button"
                      onClick={() => setSelectedEngine(engine.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-accent-gold shadow-lg shadow-amber-500/10 scale-[1.02]'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <div className="flex items-center gap-1.5 font-bold text-slate-100 text-xs">
                            {getEngineIcon(engine.id)}
                            <span className="truncate">{engine.name.split(' ')[0]}</span>
                          </div>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${engine.badgeColor}`}>
                            {engine.badge}
                          </span>
                        </div>

                        <p className="text-[10px] text-slate-400 line-clamp-3 leading-snug">
                          {engine.description}
                        </p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-800 text-[9px] font-mono text-slate-400">
                        <strong>Best for:</strong> {engine.bestFor.split(',')[0]}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scale Selector */}
            <div className="space-y-2">
              <span className="font-mono font-bold text-slate-300 block">
                2. Magnification Factor:
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setScaleFactor(2)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    scaleFactor === 2
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md shadow-cyan-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">2× Super-HD</span>
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-950">Fast</span>
                  </div>
                  <p className="text-[11px] opacity-80">
                    Ideal for web, mobile displays & social media.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setScaleFactor(4)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    scaleFactor === 4
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow-md shadow-amber-500/10'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">4× 4K Ultra-HD</span>
                    <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-accent-gold">Gallery</span>
                  </div>
                  <p className="text-[11px] opacity-80">
                    Maximum micro-texture clarity for large 4K monitors and archival prints.
                  </p>
                </button>
              </div>
            </div>

            {/* Sharpness Slider */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-mono">
                <span className="text-slate-300">High-Pass Edge Matrix Polish</span>
                <span className="text-accent-gold font-bold">{sharpness}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="80"
                value={sharpness}
                onChange={(e) => setSharpness(parseInt(e.target.value))}
                className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

          </div>
        )}

        {/* Processing Indicator */}
        {isProcessing && progress && (
          <div className="p-5 rounded-2xl bg-darkroom-950 border border-cyan-500/30 space-y-3 text-center animate-fade-in">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-slate-100 text-sm">
                {progress.phase}
              </h4>
              <p className="text-xs text-slate-400 font-mono">
                Executing {UPSCALE_ENGINES.find(e => e.id === selectedEngine)?.name}...
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-amber-400 h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
          </div>
        )}

        {/* Result Ready View */}
        {upscaledResult && (
          <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>4K Masterwork Generated ({upscaledResult.width} × {upscaledResult.height})</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {upscaledResult.engineUsed}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-slate-800 max-h-52 bg-black">
              <img
                src={upscaledResult.dataUrl}
                alt="Upscaled result"
                className="w-full h-52 object-cover object-center"
              />
              <span className="absolute bottom-2 right-2 bg-darkroom-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                100% Quality JPEG
              </span>
            </div>
          </div>
        )}

        {/* Modal Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 text-xs">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-all cursor-pointer disabled:opacity-30"
          >
            {upscaledResult ? 'Close' : 'Cancel'}
          </button>

          {!upscaledResult ? (
            <button
              type="button"
              onClick={handleStartUpscale}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-darkroom-950 font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-500/15 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4" />
              <span>Upscale with {UPSCALE_ENGINES.find(e => e.id === selectedEngine)?.name.split(' ')[0]}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleDownload}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-darkroom-950 font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download 4K Masterwork</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
