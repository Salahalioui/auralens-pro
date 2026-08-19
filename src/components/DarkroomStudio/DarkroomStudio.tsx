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
  Sun, 
  Palette, 
  Flame, 
  Crop,
  FileCode,
  CheckCircle2,
  Camera,
  Compass,
  Zap,
  SplitSquareVertical,
  Columns,
  Wand2,
  SlidersHorizontal,
  SunMedium,
  Layers,
  Bookmark,
  Info,
  Maximize2
} from 'lucide-react';
import { 
  NumericalGrading, 
  SuggestedCrop, 
  FullAnalysisResult, 
  SplitToningSettings, 
  TailoredGradingRecipe,
  HistogramData,
  OpticalBokehSettings,
  RelightingSettings,
  HslSettings,
  HslChannel,
  ComparisonMode,
  SnapshotSlot
} from '../../types/photography';
import { 
  applyDarkroomGrading, 
  generateCssFilter, 
  generate3DCubeLUT,
  generateLightroomXMP,
  computeHistogram,
  DEFAULT_HSL_SETTINGS,
  HSL_CHANNELS,
  autoBalanceGrading,
  applySplitScreenComparison
} from '../../services/imageProcessor';
import { generateTailoredRecipes } from '../../services/recipeGenerator';
import { HistogramWidget } from './HistogramWidget';
import { UpscaleModal } from './UpscaleModal';

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
  const [hslSettings, setHslSettings] = useState<HslSettings>({ ...DEFAULT_HSL_SETTINGS });
  const [selectedHslChannel, setSelectedHslChannel] = useState<HslChannel>('orange');
  const [halation, setHalation] = useState<number>(20);
  const [sCurveRollOff, setSCurveRollOff] = useState<number>(45);

  // Optical & 3D Relighting State
  const [bokehSettings, setBokehSettings] = useState<OpticalBokehSettings>({
    enabled: false,
    blurRadius: 8,
    subjectFeather: 40
  });

  const [relightingSettings, setRelightingSettings] = useState<RelightingSettings>({
    enabled: false,
    lightX: 300,
    lightY: 250,
    intensity: 35,
    colorTemp: 25,
    radius: 65
  });

  const [autoLevel, setAutoLevel] = useState<boolean>(false);
  const [applyCrop, setApplyCrop] = useState(true);
  const [showOriginal, setShowOriginal] = useState(false);
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('graded');
  const [splitPercent, setSplitPercent] = useState<number>(50);
  const [isDraggingOnCanvas, setIsDraggingOnCanvas] = useState<boolean>(false);

  // Snapshot A/B Testing Slots
  const [slotA, setSlotA] = useState<SnapshotSlot | null>(null);
  const [slotB, setSlotB] = useState<SnapshotSlot | null>(null);
  const [activeSlot, setActiveSlot] = useState<'A' | 'B' | null>(null);

  // UI Tabs & Drawers
  const [activeControlTab, setActiveControlTab] = useState<'tone' | 'color' | 'hsl' | 'photochemical' | 'optics'>('tone');
  const [isUpscaleModalOpen, setIsUpscaleModalOpen] = useState<boolean>(false);
  const [showExifDrawer, setShowExifDrawer] = useState<boolean>(false);

  // Export notifications
  const [copiedCss, setCopiedCss] = useState(false);
  const [downloadedLut, setDownloadedLut] = useState(false);
  const [downloadedXmp, setDownloadedXmp] = useState(false);
  const [autoEnhanceApplied, setAutoEnhanceApplied] = useState(false);

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
  const canvasContainerRef = useRef<HTMLDivElement>(null);
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
        sCurveRollOff,
        bokehSettings,
        relightingSettings,
        autoLevel && analysis?.phase1?.horizonLevel?.tilted ? analysis.phase1.horizonLevel : null,
        hslSettings
      );

      // If in Split Slider Comparison Mode, overlay the original wipe
      if (comparisonMode === 'split-slider') {
        applySplitScreenComparison(
          canvasRef.current,
          imageElementRef.current,
          applyCrop ? suggestedCrop : null,
          splitPercent
        );
      }
    }

    // Recompute live histogram from current canvas
    const hist = computeHistogram(canvasRef.current);
    setHistogramData(hist);
  };

  useEffect(() => {
    render();
  }, [
    grading, 
    splitToning, 
    hslSettings, 
    halation, 
    sCurveRollOff, 
    bokehSettings, 
    relightingSettings, 
    autoLevel, 
    applyCrop, 
    showOriginal, 
    comparisonMode, 
    splitPercent
  ]);

  // Canvas Mouse / Touch Interaction (Split slider dragging or 3D Light placement)
  const handleCanvasPointerDown = (e: React.PointerEvent) => {
    setIsDraggingOnCanvas(true);
    handleCanvasPointerMove(e);
  };

  const handleCanvasPointerUp = () => {
    setIsDraggingOnCanvas(false);
  };

  const handleCanvasPointerMove = (e: React.PointerEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const x = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    // Mode 1: Split Slider Dragging
    if (comparisonMode === 'split-slider' && isDraggingOnCanvas) {
      const percent = Math.max(5, Math.min(95, Math.round((x / rect.width) * 100)));
      setSplitPercent(percent);
    }

    // Mode 2: Click to place Virtual 3D Light
    if (activeControlTab === 'optics' && relightingSettings.enabled && isDraggingOnCanvas) {
      const normX = Math.round((x / rect.width) * 1000);
      const normY = Math.round((y / rect.height) * 1000);
      setRelightingSettings(prev => ({ ...prev, lightX: normX, lightY: normY }));
    }
  };

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
      setHslSettings({ ...DEFAULT_HSL_SETTINGS });
    }
  };

  // 1-Click Smart Auto-Enhance
  const handleSmartAutoEnhance = () => {
    const balanced = autoBalanceGrading(histogramData, grading);
    setGrading(balanced);
    setAutoEnhanceApplied(true);
    setTimeout(() => setAutoEnhanceApplied(false), 2000);
  };

  // Snapshot A/B Testing Handlers
  const handleSaveSnapshot = (slot: 'A' | 'B') => {
    const snap: SnapshotSlot = {
      id: slot,
      name: `Snapshot ${slot} (${activeRecipeId.split('-')[0]})`,
      timestamp: Date.now(),
      grading: { ...grading },
      splitToning: { ...splitToning },
      halation,
      sCurveRollOff,
      hslSettings: { ...hslSettings }
    };
    if (slot === 'A') setSlotA(snap);
    else setSlotB(snap);
    setActiveSlot(slot);
  };

  const handleLoadSnapshot = (slot: 'A' | 'B') => {
    const snap = slot === 'A' ? slotA : slotB;
    if (!snap) return;
    setGrading({ ...snap.grading });
    setSplitToning({ ...snap.splitToning });
    setHalation(snap.halation);
    setSCurveRollOff(snap.sCurveRollOff);
    if (snap.hslSettings) setHslSettings({ ...snap.hslSettings });
    setActiveSlot(slot);
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

  // Adobe Lightroom Preset (.XMP) Export
  const handleExportLightroomXMP = () => {
    const xmpData = generateLightroomXMP(
      grading,
      splitToning,
      `AuraLens_${activeRecipeId}`
    );
    const blob = new Blob([xmpData], { type: 'application/rdf+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AuraLens_${activeRecipeId}.xmp`;
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedXmp(true);
    setTimeout(() => setDownloadedXmp(false), 2500);
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

  const updateHslParam = (channel: HslChannel, field: 'hue' | 'saturation' | 'luminance', val: number) => {
    setHslSettings(prev => ({
      ...prev,
      [channel]: {
        ...prev[channel],
        [field]: val
      }
    }));
  };

  const resetHslChannel = (channel: HslChannel) => {
    setHslSettings(prev => ({
      ...prev,
      [channel]: { hue: 0, saturation: 0, luminance: 0 }
    }));
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
              Photochemical color science, 8-channel HSL & 3D relighting engine.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Smart AI Auto-Enhance Button */}
          <button
            type="button"
            onClick={handleSmartAutoEnhance}
            className={`px-3 py-1.5 rounded-xl border text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer ${
              autoEnhanceApplied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-md shadow-emerald-500/20'
                : 'bg-amber-500/10 hover:bg-amber-500/20 text-accent-gold border-amber-500/30 hover:border-amber-500/50'
            }`}
            title="1-Click AI Auto-Tone & Histogram Balancing"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>{autoEnhanceApplied ? 'Auto-Balanced!' : 'Smart Auto-Tone'}</span>
          </button>

          {/* Quick Reset */}
          <button
            type="button"
            onClick={handleResetToAI}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Matrix</span>
          </button>

          {/* Export Adobe Lightroom .XMP */}
          <button
            type="button"
            onClick={handleExportLightroomXMP}
            className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export Adobe Lightroom Classic & Mobile Preset (.XMP)"
          >
            {downloadedXmp ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Camera className="w-3.5 h-3.5" />}
            <span>{downloadedXmp ? '.XMP Downloaded' : 'Export .XMP'}</span>
          </button>

          {/* Export .CUBE 3D LUT */}
          <button
            type="button"
            onClick={handleExportCubeLUT}
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer"
            title="Export 33x33x33 3D LUT for DaVinci Resolve, Premiere Pro & Photoshop"
          >
            {downloadedLut ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <FileCode className="w-3.5 h-3.5" />}
            <span>{downloadedLut ? '.CUBE Downloaded' : 'Export .CUBE'}</span>
          </button>

          {/* Copy CSS Filter */}
          <button
            type="button"
            onClick={handleCopyCss}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedCss ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCss ? 'CSS Copied' : 'CSS'}</span>
          </button>

          {/* 4K AI Super-Resolution Upscaler (Free) */}
          <button
            type="button"
            onClick={() => setIsUpscaleModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 via-amber-500/20 to-cyan-500/20 hover:from-cyan-500/30 hover:to-amber-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            title="100% Free Multi-Engine 4K Super-Resolution AI Upscaler"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI 4K Upscale</span>
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
          
          {/* Comparison Mode Toolbar & A/B Snapshot Slots */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-darkroom-900/90 p-2.5 rounded-2xl border border-slate-800 text-xs">
            
            {/* Viewport Comparison Switcher */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setComparisonMode('graded')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  comparisonMode === 'graded'
                    ? 'bg-amber-500/20 text-accent-gold font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Single Grade</span>
              </button>

              <button
                type="button"
                onClick={() => setComparisonMode('split-slider')}
                className={`px-3 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  comparisonMode === 'split-slider'
                    ? 'bg-amber-500/20 text-accent-gold font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <SplitSquareVertical className="w-3.5 h-3.5" />
                <span>Live Split Wipe</span>
              </button>
            </div>

            {/* A/B Snapshot Comparison */}
            <div className="flex items-center gap-1.5 font-mono text-[11px]">
              <span className="text-slate-500 font-bold uppercase text-[9px] mr-1 hidden sm:inline">A/B Slots:</span>
              
              {/* Slot A */}
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => slotA ? handleLoadSnapshot('A') : handleSaveSnapshot('A')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    activeSlot === 'A'
                      ? 'bg-amber-500 text-darkroom-950'
                      : slotA ? 'text-amber-400 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={slotA ? `Load Slot A (${slotA.name})` : 'Save current grade to Slot A'}
                >
                  Slot A
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSnapshot('A')}
                  className="px-1 text-[9px] text-slate-500 hover:text-amber-400 cursor-pointer"
                  title="Save current grade into Slot A"
                >
                  +
                </button>
              </div>

              {/* Slot B */}
              <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => slotB ? handleLoadSnapshot('B') : handleSaveSnapshot('B')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                    activeSlot === 'B'
                      ? 'bg-cyan-500 text-darkroom-950'
                      : slotB ? 'text-cyan-400 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-300'
                  }`}
                  title={slotB ? `Load Slot B (${slotB.name})` : 'Save current grade to Slot B'}
                >
                  Slot B
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSnapshot('B')}
                  className="px-1 text-[9px] text-slate-500 hover:text-cyan-400 cursor-pointer"
                  title="Save current grade into Slot B"
                >
                  +
                </button>
              </div>

              {/* EXIF Info Trigger */}
              {analysis?.metadata && (
                <button
                  type="button"
                  onClick={() => setShowExifDrawer(!showExifDrawer)}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    showExifDrawer ? 'bg-slate-800 text-accent-gold border-amber-500/30' : 'text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Toggle EXIF Metadata HUD"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* EXIF Metadata HUD Drawer */}
          {showExifDrawer && analysis?.metadata && (
            <div className="p-3.5 rounded-2xl bg-darkroom-950/90 border border-slate-800 text-xs font-mono grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Camera Model</span>
                <p className="text-slate-200 font-bold truncate">{analysis.metadata.exifData?.camera || 'Digital Camera'}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Lens / Focal Length</span>
                <p className="text-cyan-300 font-bold truncate">{analysis.metadata.exifData?.lens || analysis.metadata.exifData?.focalLength || 'Standard Prime'}</p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Exposure Triangle</span>
                <p className="text-accent-gold font-bold">
                  {analysis.metadata.exifData?.aperture ? `f/${analysis.metadata.exifData.aperture}` : 'f/2.8'} • {analysis.metadata.exifData?.shutterSpeed || '1/250s'} • ISO {analysis.metadata.exifData?.iso || '100'}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-500 uppercase">Dimensions / Ratio</span>
                <p className="text-emerald-400 font-bold">
                  {analysis.metadata.width || 1280} × {analysis.metadata.height || 720} ({analysis.metadata.aspectRatio || '16:9'})
                </p>
              </div>
            </div>
          )}

          {/* Live Canvas Viewport */}
          <div 
            ref={canvasContainerRef}
            onPointerDown={handleCanvasPointerDown}
            onPointerUp={handleCanvasPointerUp}
            onPointerMove={handleCanvasPointerMove}
            className={`darkroom-card p-3 relative rounded-2xl overflow-hidden bg-darkroom-950 border border-slate-800 shadow-2xl flex flex-col items-center justify-center min-h-[440px] select-none ${
              comparisonMode === 'split-slider' ? 'cursor-ew-resize' : activeControlTab === 'optics' && relightingSettings.enabled ? 'cursor-crosshair' : 'cursor-default'
            }`}
          >
            
            {/* Live Canvas */}
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-[520px] object-contain rounded-xl shadow-2xl mx-auto block transition-all"
            />

            {/* Interactive 3D Light Gizmo on Canvas */}
            {activeControlTab === 'optics' && relightingSettings.enabled && (
              <div
                className="absolute pointer-events-none w-8 h-8 -ml-4 -mt-4 rounded-full border-2 border-yellow-400 shadow-lg shadow-yellow-400/50 bg-yellow-400/20 flex items-center justify-center animate-pulse"
                style={{
                  left: `${(relightingSettings.lightX / 1000) * 100}%`,
                  top: `${(relightingSettings.lightY / 1000) * 100}%`
                }}
              >
                <div className="w-2 h-2 rounded-full bg-yellow-300 shadow-sm" />
              </div>
            )}

            {/* Hold to Compare & Crop floating bar */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between bg-darkroom-950/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center gap-1.5 cursor-pointer active:bg-amber-500 active:text-darkroom-950 select-none"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Hold to Compare</span>
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

                {analysis?.phase1?.horizonLevel?.tilted && (
                  <button
                    type="button"
                    onClick={() => setAutoLevel(!autoLevel)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      autoLevel
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>{autoLevel ? `Auto-Leveled (${analysis.phase1.horizonLevel.degrees}°)` : 'Level Horizon'}</span>
                  </button>
                )}
              </div>

              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                {activeControlTab === 'optics' && relightingSettings.enabled ? 'Click canvas to move light' : 'Real-Time 60fps Pipeline'}
              </span>
            </div>

          </div>

          {/* Real-Time Histogram Widget */}
          <HistogramWidget data={histogramData} />
        </div>

        {/* Right: Studio Control Panels */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Sub-Tab Navigation Bar (Tone, Color, 8-Channel HSL, Emulsion, Optics) */}
          <div className="flex items-center bg-darkroom-900 border border-slate-800 rounded-xl p-1 gap-1 text-xs overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveControlTab('tone')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-[75px] ${
                activeControlTab === 'tone'
                  ? 'bg-amber-500/20 text-accent-gold border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              <span>Tone</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveControlTab('color')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-[75px] ${
                activeControlTab === 'color'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Color</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveControlTab('hsl')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-[85px] ${
                activeControlTab === 'hsl'
                  ? 'bg-gradient-to-r from-amber-500/20 to-cyan-500/20 text-accent-gold border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Selective HSL</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveControlTab('photochemical')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-[80px] ${
                activeControlTab === 'photochemical'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Emulsion</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveControlTab('optics')}
              className={`flex-1 py-1.5 rounded-lg font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-w-[90px] ${
                activeControlTab === 'optics'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Optics & Light</span>
            </button>
          </div>

          {/* Tab 1: Tone & Dynamic Range */}
          {activeControlTab === 'tone' && (
            <div className="darkroom-card p-5 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Sun className="w-3.5 h-3.5 text-accent-gold" />
                <span>Primary Tone & Exposure Range</span>
              </h4>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Exposure (EV)</span>
                  <span className="text-accent-gold font-bold">{grading.exposureEV > 0 ? `+${grading.exposureEV}` : grading.exposureEV} EV</span>
                </div>
                <input
                  type="range"
                  min="-200"
                  max="200"
                  value={Math.round(grading.exposureEV * 100)}
                  onChange={(e) => updateParam('exposureEV', parseFloat(e.target.value) / 100)}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Contrast</span>
                  <span className="text-accent-gold font-bold">{grading.contrast > 0 ? `+${grading.contrast}` : grading.contrast}</span>
                </div>
                <input
                  type="range"
                  min="-50"
                  max="50"
                  value={grading.contrast}
                  onChange={(e) => updateParam('contrast', parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Highlights</span>
                    <span className="text-slate-200">{grading.highlights > 0 ? `+${grading.highlights}` : grading.highlights}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={grading.highlights}
                    onChange={(e) => updateParam('highlights', parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Shadows</span>
                    <span className="text-slate-200">{grading.shadows > 0 ? `+${grading.shadows}` : grading.shadows}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={grading.shadows}
                    onChange={(e) => updateParam('shadows', parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Whites Anchor</span>
                    <span className="text-slate-200">{grading.whites > 0 ? `+${grading.whites}` : grading.whites}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={grading.whites}
                    onChange={(e) => updateParam('whites', parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Blacks Anchor</span>
                    <span className="text-slate-200">{grading.blacks > 0 ? `+${grading.blacks}` : grading.blacks}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={grading.blacks}
                    onChange={(e) => updateParam('blacks', parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-slate-800/80">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Clarity & Micro-Contrast</span>
                  <span className="text-cyan-400 font-bold">{grading.clarity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={grading.clarity}
                  onChange={(e) => updateParam('clarity', parseInt(e.target.value))}
                  className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
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

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Kelvin Temperature</span>
                  <span className="text-amber-400 font-bold">{grading.temperature > 0 ? `+${grading.temperature} (Warm)` : `${grading.temperature} (Cool)`}</span>
                </div>
                <input
                  type="range"
                  min="-80"
                  max="80"
                  value={grading.temperature}
                  onChange={(e) => updateParam('temperature', parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-gradient-to-r from-blue-500 via-slate-800 to-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Tint (Green / Magenta)</span>
                  <span className="text-purple-400 font-bold">{grading.tint > 0 ? `+${grading.tint} (Magenta)` : `${grading.tint} (Green)`}</span>
                </div>
                <input
                  type="range"
                  min="-60"
                  max="60"
                  value={grading.tint}
                  onChange={(e) => updateParam('tint', parseInt(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-gradient-to-r from-emerald-500 via-slate-800 to-fuchsia-500 rounded cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Vibrance</span>
                    <span className="text-slate-200">{grading.vibrance}%</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={grading.vibrance}
                    onChange={(e) => updateParam('vibrance', parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Saturation</span>
                    <span className="text-slate-200">{grading.saturation}%</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={grading.saturation}
                    onChange={(e) => updateParam('saturation', parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Split Toning Controls */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <span className="text-xs font-mono font-bold text-slate-300 block">3-Way Split Toning:</span>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-cyan-400">Shadows Tint (Lift)</span>
                    <span className="text-slate-400">{splitToning.shadowsHue}° • {splitToning.shadowsSat}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={splitToning.shadowsHue}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, shadowsHue: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-400 h-1.5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={splitToning.shadowsSat}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, shadowsSat: parseInt(e.target.value) }))}
                      className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-amber-400">Highlights Tint (Gain)</span>
                    <span className="text-slate-400">{splitToning.highlightsHue}° • {splitToning.highlightsSat}%</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="range"
                      min="0"
                      max="360"
                      value={splitToning.highlightsHue}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, highlightsHue: parseInt(e.target.value) }))}
                      className="w-full accent-amber-400 h-1.5 bg-gradient-to-r from-red-500 via-green-500 to-blue-500 rounded cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="60"
                      value={splitToning.highlightsSat}
                      onChange={(e) => setSplitToning(prev => ({ ...prev, highlightsSat: parseInt(e.target.value) }))}
                      className="w-full accent-amber-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: 8-Channel Selective HSL Mixer */}
          {activeControlTab === 'hsl' && (
            <div className="darkroom-card p-5 border border-slate-800 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>8-Channel Selective HSL Color Mixer</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setHslSettings({ ...DEFAULT_HSL_SETTINGS })}
                  className="text-[10px] font-mono text-slate-400 hover:text-rose-400 cursor-pointer"
                >
                  Reset All HSL
                </button>
              </div>

              {/* 8 Color Channel Buttons */}
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
                {HSL_CHANNELS.map((ch) => {
                  const isSelected = selectedHslChannel === ch.id;
                  const channelShift = hslSettings[ch.id];
                  const hasMod = channelShift.hue !== 0 || channelShift.saturation !== 0 || channelShift.luminance !== 0;

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedHslChannel(ch.id)}
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800 border-accent-gold shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div 
                        className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                        style={{ backgroundColor: ch.color }}
                      />
                      <span className="text-[10px] font-mono text-slate-300 capitalize">{ch.name.slice(0, 3)}</span>
                      {hasMod && <span className="w-1 h-1 rounded-full bg-accent-gold" />}
                    </button>
                  );
                })}
              </div>

              {/* Active Channel Sliders */}
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3 pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs capitalize text-slate-100 flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: HSL_CHANNELS.find(c => c.id === selectedHslChannel)?.color }}
                    />
                    {selectedHslChannel} Channel Adjustments:
                  </span>
                  <button
                    type="button"
                    onClick={() => resetHslChannel(selectedHslChannel)}
                    className="text-[10px] font-mono text-slate-400 hover:text-slate-200 cursor-pointer"
                  >
                    Reset Channel
                  </button>
                </div>

                {/* Hue Shift */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Hue Shift</span>
                    <span className="text-accent-gold font-bold">{hslSettings[selectedHslChannel].hue > 0 ? `+${hslSettings[selectedHslChannel].hue}°` : `${hslSettings[selectedHslChannel].hue}°`}</span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={hslSettings[selectedHslChannel].hue}
                    onChange={(e) => updateHslParam(selectedHslChannel, 'hue', parseInt(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Saturation */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Saturation</span>
                    <span className="text-emerald-400 font-bold">{hslSettings[selectedHslChannel].saturation > 0 ? `+${hslSettings[selectedHslChannel].saturation}%` : `${hslSettings[selectedHslChannel].saturation}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={hslSettings[selectedHslChannel].saturation}
                    onChange={(e) => updateHslParam(selectedHslChannel, 'saturation', parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

                {/* Luminance */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-mono">
                    <span className="text-slate-400">Luminance</span>
                    <span className="text-cyan-400 font-bold">{hslSettings[selectedHslChannel].luminance > 0 ? `+${hslSettings[selectedHslChannel].luminance}%` : `${hslSettings[selectedHslChannel].luminance}%`}</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={hslSettings[selectedHslChannel].luminance}
                    onChange={(e) => updateHslParam(selectedHslChannel, 'luminance', parseInt(e.target.value))}
                    className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                  />
                </div>

              </div>

            </div>
          )}

          {/* Tab 4: Photochemical Emulsion & Halation */}
          {activeControlTab === 'photochemical' && (
            <div className="darkroom-card p-5 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Photochemical Emulsion & Analog Optics</span>
              </h4>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Specular Halation (Red Edge Bloom)</span>
                  <span className="text-rose-400 font-bold">{halation}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={halation}
                  onChange={(e) => setHalation(parseInt(e.target.value))}
                  className="w-full accent-rose-500 h-1.5 bg-gradient-to-r from-slate-800 via-rose-950 to-rose-500 rounded cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Emulates CineStill 800T red anti-halation diffusion around specular highlights and light bulbs.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Highlight Roll-Off (S-Curve)</span>
                  <span className="text-accent-gold font-bold">{sCurveRollOff}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sCurveRollOff}
                  onChange={(e) => setSCurveRollOff(parseInt(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Cubic Hermite spline compression preventing harsh digital white clipping.
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Luminance-Adaptive Film Grain</span>
                  <span className="text-slate-200 font-bold">{grading.grain}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={grading.grain}
                  onChange={(e) => updateParam('grain', parseInt(e.target.value))}
                  className="w-full accent-slate-300 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <p className="text-[10px] text-slate-500">
                  Midtone-weighted silver halide particle noise (heaviest in Zone V, light in shadows/highlights).
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-300">Lens Vignette Fall-off</span>
                  <span className="text-slate-200 font-bold">{grading.vignette}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={grading.vignette}
                  onChange={(e) => updateParam('vignette', parseInt(e.target.value))}
                  className="w-full accent-slate-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* Tab 5: Computational Optics & 3D Relighting */}
          {activeControlTab === 'optics' && (
            <div className="darkroom-card p-5 border border-slate-800 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                <span>Computational Optics & 3D Studio Relighting</span>
              </h4>

              {/* Section 1: f/1.4 Bokeh Simulator */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SunMedium className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-slate-200 text-xs">f/1.4 Optical Bokeh Simulator</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBokehSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      bokehSettings.enabled
                        ? 'bg-amber-500/20 text-accent-gold border border-amber-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {bokehSettings.enabled ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {bokehSettings.enabled && (
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Background Optical Blur</span>
                        <span className="text-accent-gold font-bold">{bokehSettings.blurRadius}px</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="24"
                        value={bokehSettings.blurRadius}
                        onChange={(e) => setBokehSettings(prev => ({ ...prev, blurRadius: parseInt(e.target.value) }))}
                        className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Section 2: Virtual 3D Studio Relighting */}
              <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-4 h-4 text-yellow-400" />
                    <span className="font-bold text-slate-200 text-xs">Virtual 3D Key Light Sculptor</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setRelightingSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      relightingSettings.enabled
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {relightingSettings.enabled ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>

                {relightingSettings.enabled && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] text-cyan-400 font-mono">
                      💡 Tip: Click or drag anywhere on the canvas to place the key light source!
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono">Light X ({relightingSettings.lightX})</span>
                        <input
                          type="range"
                          min="50"
                          max="950"
                          value={relightingSettings.lightX}
                          onChange={(e) => setRelightingSettings(prev => ({ ...prev, lightX: parseInt(e.target.value) }))}
                          className="w-full accent-yellow-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-mono">Light Y ({relightingSettings.lightY})</span>
                        <input
                          type="range"
                          min="50"
                          max="950"
                          value={relightingSettings.lightY}
                          onChange={(e) => setRelightingSettings(prev => ({ ...prev, lightY: parseInt(e.target.value) }))}
                          className="w-full accent-yellow-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Light Output</span>
                        <span className="text-yellow-300 font-bold">{relightingSettings.intensity}%</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="80"
                        value={relightingSettings.intensity}
                        onChange={(e) => setRelightingSettings(prev => ({ ...prev, intensity: parseInt(e.target.value) }))}
                        className="w-full accent-yellow-400 h-1.5 bg-slate-800 rounded cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-slate-400">Color Temperature</span>
                        <span className="text-amber-400 font-bold">{relightingSettings.colorTemp > 0 ? `+${relightingSettings.colorTemp} (Warm)` : `${relightingSettings.colorTemp} (Cool)`}</span>
                      </div>
                      <input
                        type="range"
                        min="-50"
                        max="50"
                        value={relightingSettings.colorTemp}
                        onChange={(e) => setRelightingSettings(prev => ({ ...prev, colorTemp: parseInt(e.target.value) }))}
                        className="w-full accent-amber-500 h-1.5 bg-gradient-to-r from-cyan-500 to-amber-500 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* 4K Super-Resolution AI Upscaler Modal */}
      <UpscaleModal
        isOpen={isUpscaleModalOpen}
        onClose={() => setIsUpscaleModalOpen(false)}
        canvasRef={canvasRef}
      />

    </div>
  );
};
