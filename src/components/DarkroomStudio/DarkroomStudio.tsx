import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sliders, 
  Download, 
  RefreshCw, 
  Copy, 
  Check, 
  Eye, 
  Sparkles, 
  ArrowLeft, 
  Film, 
  Sun, 
  Palette, 
  Flame, 
  Crop,
  Layers,
  FileCode,
  CheckCircle2
} from 'lucide-react';
import { 
  NumericalGrading, 
  SuggestedCrop, 
  FullAnalysisResult, 
  SplitToningSettings, 
  TailoredGradingRecipe,
  HistogramData 
} from '../../types/photography';
import { 
  applyDarkroomGrading, 
  generateCssFilter, 
  generate3DCubeLUT,
  computeHistogram 
} from '../../services/imageProcessor';
import { generateTailoredRecipes } from '../../services/recipeGenerator';
import { HistogramWidget } from './HistogramWidget';

interface DarkroomStudioProps {
  imageBase64: string;
  imageMime: string;
  initialGrading: NumericalGrading;
  suggestedCrop?: SuggestedCrop;
  analysis?: FullAnalysisResult;
  onBackToAnalysis: () => void;
}

export const DarkroomStudio: React.FC<DarkroomStudioProps> = ({
  imageBase64,
  imageMime,
  initialGrading,
  suggestedCrop,
  analysis,
  onBackToAnalysis
}) => {
  // Generate tailored recipes dynamically based on the AI reasoning result
  const tailoredRecipes: TailoredGradingRecipe[] = useMemo(() => {
    if (analysis) {
      return generateTailoredRecipes(analysis);
    }
    return [];
  }, [analysis]);

  const [activeRecipeId, setActiveRecipeId] = useState<string>(tailoredRecipes[0]?.id || 'ai-judge-master');
  const [grading, setGrading] = useState<NumericalGrading>({ ...initialGrading });
  const [splitToning, setSplitToning] = useState<SplitToningSettings>({
    shadowsHue: 200,
    shadowsSat: 20,
    highlightsHue: 35,
    highlightsSat: 20,
    balance: 0
  });
  const [halation, setHalation] = useState<number>(20);
  const [sCurveRollOff, setSCurveRollOff] = useState<number>(45);
  
  const [applyCrop, setApplyCrop] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [activeControlTab, setActiveControlTab] = useState<'tone' | 'color' | 'photochemical' | 'crop'>('tone');

  // Export notifications
  const [copiedCss, setCopiedCss] = useState(false);
  const [downloadedLut, setDownloadedLut] = useState(false);

  // Live Histogram state
  const [histogramData, setHistogramData] = useState<HistogramData>({
    r: new Array(256).fill(0),
    g: new Array(256).fill(0),
    b: new Array(256).fill(0),
    luma: new Array(256).fill(0),
    clippedShadowsPercent: 0,
    clippedHighlightsPercent: 0
  });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);

  // Load image element
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageElementRef.current = img;
      render();
    };
    img.src = `data:${imageMime || 'image/jpeg'};base64,${imageBase64}`;
  }, [imageBase64, imageMime]);

  // Main Render pipeline
  const render = () => {
    if (!canvasRef.current || !imageElementRef.current) return;
    
    if (showOriginal) {
      const ctx = canvasRef.current.getContext('2d');
      const img = imageElementRef.current;
      canvasRef.current.width = img.naturalWidth || img.width;
      canvasRef.current.height = img.naturalHeight || img.height;
      ctx?.drawImage(img, 0, 0);
    } else {
      applyDarkroomGrading(
        canvasRef.current,
        imageElementRef.current,
        grading,
        applyCrop ? suggestedCrop : null,
        splitToning,
        halation,
        sCurveRollOff
      );
    }

    // Recompute live histogram from current canvas
    const hist = computeHistogram(canvasRef.current);
    setHistogramData(hist);
  };

  useEffect(() => {
    render();
  }, [grading, splitToning, halation, sCurveRollOff, applyCrop, showOriginal]);

  // 1-Click Recipe Selection
  const handleSelectRecipe = (recipe: TailoredGradingRecipe) => {
    setActiveRecipeId(recipe.id);
    setGrading({ ...recipe.grading });
    setSplitToning({ ...recipe.splitToning });
    setHalation(recipe.halation);
    setSCurveRollOff(recipe.sCurveRollOff);
  };

  const handleResetToAI = () => {
    if (tailoredRecipes.length > 0) {
      handleSelectRecipe(tailoredRecipes[0]);
    } else {
      setGrading({ ...initialGrading });
      setHalation(20);
      setSCurveRollOff(45);
    }
  };

  // High-Res JPEG Export
  const handleDownloadImage = () => {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.95);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `auralens_mastergrade_${activeRecipeId}_${Date.now()}.jpg`;
    a.click();
  };

  // Industry-Standard .CUBE 3D LUT Export
  const handleExportCubeLUT = () => {
    const cubeData = generate3DCubeLUT(grading, splitToning, sCurveRollOff, 33);
    const blob = new Blob([cubeData], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraLens_${activeRecipeId}_33x33.cube`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedLut(true);
    setTimeout(() => setDownloadedLut(false), 2500);
  };

  const handleCopyCss = () => {
    const filter = generateCssFilter(grading);
    navigator.clipboard.writeText(`filter: ${filter};`);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  const updateParam = (key: keyof NumericalGrading, val: number) => {
    setGrading(prev => ({ ...prev, [key]: val }));
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header & Export Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-darkroom-900/95 p-4 rounded-2xl border border-slate-800 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToAnalysis}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Back to AI Critique"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="font-cinzel text-base font-bold text-slate-100 tracking-wider">
                Pro In-Browser Darkroom Studio
              </h3>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                100% Free & Zero Quota
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Photochemical color science, highlight roll-off S-curves & halation powered by Gemini's analysis.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Quick Reset */}
          <button
            type="button"
            onClick={handleResetToAI}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to AI Matrix</span>
          </button>

          {/* Export .CUBE 3D LUT */}
          <button
            type="button"
            onClick={handleExportCubeLUT}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export 33x33x33 3D LUT for DaVinci Resolve, Premiere Pro & Photoshop"
          >
            {downloadedLut ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{downloadedLut ? '.CUBE LUT Downloaded' : 'Export .CUBE 3D LUT'}</span>
          </button>

          {/* Copy CSS Filter */}
          <button
            type="button"
            onClick={handleCopyCss}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCss ? 'CSS Copied' : 'CSS LUT'}</span>
          </button>

          {/* Download Processed Image */}
          <button
            type="button"
            onClick={handleDownloadImage}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-darkroom-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/10 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Graded Photo</span>
          </button>

        </div>
      </div>

      {/* Dynamic AI-Tailored Recipes Ribbon (6 Custom AI Archetypes) */}
      {tailoredRecipes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
              <span>AI Tailored Grading Archetypes (Dynamically Synthesized for This Photo)</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">6 Dynamic Profiles</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {tailoredRecipes.map((recipe) => (
              <button
                key={recipe.id}
                type="button"
                onClick={() => handleSelectRecipe(recipe)}
                className={`p-3 rounded-2xl border text-left text-xs transition-all relative overflow-hidden flex flex-col justify-between cursor-pointer ${
                  activeRecipeId === recipe.id
                    ? 'bg-slate-800 border-accent-gold shadow-lg shadow-amber-500/15 scale-[1.02]'
                    : 'bg-darkroom-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }`}
              >
                <div className={`w-full h-1.5 rounded-full bg-gradient-to-r ${recipe.previewGradient} mb-2.5`} />
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-950/80 text-accent-gold border border-amber-500/20 truncate">
                      {recipe.badge}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-xs leading-tight mb-1">
                    {recipe.name}
                  </h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug">
                    {recipe.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Studio Grid: Left Canvas Viewer (7 cols), Right Controls (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Live Canvas Viewport & Scopes */}
        <div className="lg:col-span-7 space-y-4">
          <div className="darkroom-card p-3 relative rounded-2xl overflow-hidden bg-darkroom-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[420px]">
            
            {/* Live Canvas */}
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[520px] object-contain rounded-xl shadow-2xl mx-auto block transition-all"
            />

            {/* Hold to Compare floating pill */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between bg-darkroom-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer active:bg-amber-500 active:text-darkroom-950 select-none"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hold to View Original</span>
                </button>

                {suggestedCrop && (
                  <button
                    type="button"
                    onClick={() => setApplyCrop(!applyCrop)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      applyCrop
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Crop className="w-3.5 h-3.5" />
                    <span>{applyCrop ? `AI Crop (${suggestedCrop.targetAspectRatio || '16:9'})` : 'Original Frame'}</span>
                  </button>
                )}
              </div>

              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                Real-Time 60fps Pipeline
              </span>
            </div>

          </div>

          {/* Real-Time Histogram Widget */}
          <HistogramWidget data={histogramData} />
        </div>

        {/* Right: Studio Control Panels */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sub-Tab Navigation Bar */}
          <div className="flex items-center bg-darkroom-900 border border-slate-800 rounded-xl p-1 gap-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveControlTab('tone')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeControlTab === 'tone'
                  ? 'bg-amber-500/20 text-accent-gold border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Tone & DR</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveControlTab('color')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeControlTab === 'color'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color Science</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveControlTab('photochemical')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeControlTab === 'photochemical'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Photochemical</span>
            </button>
          </div>

          {/* Tab 1: Tone & Dynamic Range */}
          {activeControlTab === 'tone' && (
            <div className="darkroom-card p-5 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-accent-gold" />
                <span>Primary Tone & Exposure Range</span>
              </h4>

              {/* Exposure EV */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Exposure (EV)</span>
                  <span className="text-accent-gold font-bold">{grading.exposureEV > 0 ? `+${grading.exposureEV}` : grading.exposureEV} EV</span>
                </div>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  step="0.05"
                  value={grading.exposureEV}
                  onChange={(e) => updateParam('exposureEV', parseFloat(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Contrast */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Contrast</span>
                  <span className="text-slate-200 font-bold">{grading.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={grading.contrast}
                  onChange={(e) => updateParam('contrast', parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Highlights */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Highlights Recovery</span>
                  <span className="text-cyan-400 font-bold">{grading.highlights}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={grading.highlights}
                  onChange={(e) => updateParam('highlights', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Shadows */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Shadows Lift</span>
                  <span className="text-emerald-400 font-bold">{grading.shadows}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={grading.shadows}
                  onChange={(e) => updateParam('shadows', parseInt(e.target.value))}
                  className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Whites */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Whites Point</span>
                  <span className="text-slate-200 font-bold">{grading.whites}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={grading.whites}
                  onChange={(e) => updateParam('whites', parseInt(e.target.value))}
                  className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Blacks */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Blacks Anchor</span>
                  <span className="text-slate-200 font-bold">{grading.blacks}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={grading.blacks}
                  onChange={(e) => updateParam('blacks', parseInt(e.target.value))}
                  className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 2: Color Science & Split Toning */}
          {activeControlTab === 'color' && (
            <div className="darkroom-card p-5 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-400" />
                <span>White Balance & 3-Way Split Toning</span>
              </h4>

              {/* Temperature */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Color Temperature</span>
                  <span className="text-amber-400 font-bold">{grading.temperature > 0 ? `+${grading.temperature}` : grading.temperature}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={grading.temperature}
                  onChange={(e) => updateParam('temperature', parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gradient-to-r from-cyan-500 to-amber-500 rounded-lg cursor-pointer"
                />
              </div>

              {/* Tint */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Tint (Green / Magenta)</span>
                  <span className="text-purple-400 font-bold">{grading.tint > 0 ? `+${grading.tint}` : grading.tint}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={grading.tint}
                  onChange={(e) => updateParam('tint', parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-gradient-to-r from-emerald-500 to-rose-500 rounded-lg cursor-pointer"
                />
              </div>

              {/* Vibrance */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Vibrance (Smart Saturation)</span>
                  <span className="text-purple-300 font-bold">{grading.vibrance}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="80"
                  value={grading.vibrance}
                  onChange={(e) => updateParam('vibrance', parseInt(e.target.value))}
                  className="w-full accent-purple-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Saturation */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Overall Saturation</span>
                  <span className="text-slate-200 font-bold">{grading.saturation}</span>
                </div>
                <input
                  type="range"
                  min="-100"
                  max="100"
                  value={grading.saturation}
                  onChange={(e) => updateParam('saturation', parseInt(e.target.value))}
                  className="w-full accent-slate-300 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Split Toning Controls */}
              <div className="pt-3 border-t border-slate-800 space-y-3">
                <span className="text-[11px] font-mono text-cyan-400 font-bold block">
                  3-Way Split Toning Injection:
                </span>

                {/* Shadows Hue / Sat */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Shadows Hue ({splitToning.shadowsHue}°)</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={splitToning.shadowsHue}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, shadowsHue: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Shadows Sat ({splitToning.shadowsSat}%)</span>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={splitToning.shadowsSat}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, shadowsSat: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Highlights Hue / Sat */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Highlights Hue ({splitToning.highlightsHue}°)</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={splitToning.highlightsHue}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, highlightsHue: parseInt(e.target.value) }))}
                      className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 font-mono">Highlights Sat ({splitToning.highlightsSat}%)</span>
                    <input
                      type="range"
                      min="0"
                      max="80"
                      value={splitToning.highlightsSat}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, highlightsSat: parseInt(e.target.value) }))}
                      className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Photochemical & Analog Optics */}
          {activeControlTab === 'photochemical' && (
            <div className="darkroom-card p-5 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Photochemical Emulsion & Optics</span>
              </h4>

              {/* CineStill Halation Bloom */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">CineStill Photochemical Halation</span>
                  <span className="text-rose-400 font-bold">{halation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={halation}
                  onChange={(e) => setHalation(parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Simulates red wavelength scattering across high-contrast borders and specular highlights.
                </p>
              </div>

              {/* S-Curve Highlight Roll-off */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">S-Curve Highlight Roll-off</span>
                  <span className="text-amber-400 font-bold">{sCurveRollOff}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sCurveRollOff}
                  onChange={(e) => setSCurveRollOff(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Compresses bright tones into soft photographic film curves without harsh clipping.
                </p>
              </div>

              {/* Film Grain */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Luminance-Adaptive Film Grain</span>
                  <span className="text-slate-200 font-bold">{grading.grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grading.grain}
                  onChange={(e) => updateParam('grain', parseInt(e.target.value))}
                  className="w-full accent-slate-300 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Zone V midtone-weighted silver halide noise structure.
                </p>
              </div>

              {/* Vignette */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Lens Vignette Falloff</span>
                  <span className="text-slate-200 font-bold">{grading.vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={grading.vignette}
                  onChange={(e) => updateParam('vignette', parseInt(e.target.value))}
                  className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Clarity */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Micro-Contrast & Texture Clarity</span>
                  <span className="text-cyan-400 font-bold">{grading.clarity}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={grading.clarity}
                  onChange={(e) => updateParam('clarity', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
