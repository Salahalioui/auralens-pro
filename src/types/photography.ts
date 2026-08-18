export interface PhotoMetadata {
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
  aspectRatio: string;
  mimeType: string;
  hasExif: boolean;
  exifData?: {
    camera?: string;
    lens?: string;
    focalLength?: string;
    aperture?: string;
    shutterSpeed?: string;
    iso?: string;
    dateTime?: string;
  };
}

export interface HorizonAnalysis {
  tilted: boolean;
  degrees: number;
  direction: 'clockwise' | 'counter-clockwise' | 'level';
}

export interface SuggestedCrop {
  ymin: number; // 0 to 1000
  xmin: number; // 0 to 1000
  ymax: number; // 0 to 1000
  xmax: number; // 0 to 1000
  rationale: string;
  targetAspectRatio: string;
}

export interface Phase1Composition {
  score: number; // 0-100
  framingCritique: string;
  subjectPlacement: string;
  ruleOfThirdsAlignment: string;
  leadingLinesAndDepth: string;
  horizonLevel: HorizonAnalysis;
  suggestedCrop: SuggestedCrop;
  clutterRemovalTips: string[];
}

export interface Phase2MoodAndStyle {
  score: number; // 0-100
  detectedGenre: 
    | 'Portrait' 
    | 'Landscape' 
    | 'Street' 
    | 'Architecture' 
    | 'Nature & Wildlife' 
    | 'Macro & Still Life' 
    | 'Documentary / Travel' 
    | 'Night / Astro' 
    | 'Fine Art';
  emotionalResonance: string;
  photographerIntention: string;
  lightingAtmosphere: string;
  narrativeCritique: string;
  suggestedStorytellingEdits: string[];
  recommendedStylePreset: string;
}

export interface ColorSwatch {
  hex: string;
  name: string;
  role: 'highlight' | 'shadow' | 'midtone' | 'accent';
}

export interface NumericalGrading {
  exposureEV: number;     // -3.0 to +3.0
  contrast: number;       // -100 to +100
  highlights: number;     // -100 to +100
  shadows: number;        // -100 to +100
  whites: number;         // -100 to +100
  blacks: number;         // -100 to +100
  temperature: number;    // -100 (cool) to +100 (warm)
  tint: number;           // -100 (green) to +100 (magenta)
  vibrance: number;       // -100 to +100
  saturation: number;     // -100 to +100
  clarity: number;        // 0 to 100
  vignette: number;       // 0 to 100
  grain: number;          // 0 to 100
}

export interface Phase3ColorScience {
  score: number; // 0-100
  exposureEvaluation: string;
  dynamicRange: 'Crushed Shadows' | 'Blown Highlights' | 'Flat Midtones' | 'Balanced High DR' | 'Harsh Midday';
  colorTemperatureK: number;
  tint: number;
  dominantPalette: ColorSwatch[];
  colorHarmony: 'Complementary' | 'Analogous' | 'Triadic' | 'Monochromatic' | 'Split-Complementary' | 'Cinematic Muted';
  filmStockEmulation: {
    name: string;
    description: string;
    whyItFits: string;
  };
  numericalGrading: NumericalGrading;
}

export interface SplitToningSettings {
  shadowsHue: number;        // 0 to 360
  shadowsSat: number;        // 0 to 100
  highlightsHue: number;     // 0 to 360
  highlightsSat: number;     // 0 to 100
  balance: number;           // -100 (more shadows) to +100 (more highlights)
}

export interface TailoredGradingRecipe {
  id: string;
  name: string;
  category: string;
  description: string;
  badge: string;
  previewGradient: string;
  grading: NumericalGrading;
  splitToning: SplitToningSettings;
  halation: number;          // 0 to 100
  sCurveRollOff: number;     // 0 to 100
  isMonochrome?: boolean;
}

export interface HistogramData {
  r: number[];
  g: number[];
  b: number[];
  luma: number[];
  clippedShadowsPercent: number;
  clippedHighlightsPercent: number;
}

export interface RadarScores {
  composition: number;
  lighting: number;
  colorHarmony: number;
  storytelling: number;
  technicalSharpness: number;
}

export interface StylePresetModifier {
  id: string;
  name: string;
  category: string;
  promptSuffix: string;
  description: string;
  previewGradient: string;
}

export interface Phase4Synthesis {
  overallScore: number; // 0-100
  executiveSummary: string;
  radarScores: RadarScores;
  masterPrompt: string;
  subjectPreservationRules: string[];
  lightingAndAtmosphereDirectives: string[];
  opticsAndBokehDirectives: string[];
  recommendedAspectRatio: string;
}

export interface GeneratedMasterwork {
  imageUrl: string;
  promptUsed: string;
  modelUsed: string;
  timestamp: number;
  generationTimeMs: number;
}

export interface FullAnalysisResult {
  id: string;
  imageHash: string;
  timestamp: number;
  originalImageBase64: string;
  originalImageMime: string;
  metadata: PhotoMetadata;
  phase1: Phase1Composition;
  phase2: Phase2MoodAndStyle;
  phase3: Phase3ColorScience;
  phase4: Phase4Synthesis;
  generatedMasterwork?: GeneratedMasterwork;
}

export interface RateLimitState {
  requestsInLastMinute: number;
  rpmLimit: number;
  estimatedTpm: number;
  tpmLimit: number;
  dailyRequests: number;
  rpdLimit: number;
  nextResetSeconds: number;
  tier: 'Free Tier (15 RPM)' | 'Tier 1 / Pay-As-You-Go';
}

export type AnalysisStage = 
  | 'idle' 
  | 'uploading' 
  | 'phase1_composition' 
  | 'phase2_mood' 
  | 'phase3_color' 
  | 'phase4_synthesis' 
  | 'completed' 
  | 'generating_masterwork' 
  | 'error';
