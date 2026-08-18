import { 
  FullAnalysisResult, 
  TailoredGradingRecipe, 
  NumericalGrading, 
  SplitToningSettings 
} from '../types/photography';

/**
 * Converts a hex color string to approximate HSL Hue (0-360) and Saturation (0-100)
 */
function hexToHueAndSat(hex: string): { hue: number; sat: number } {
  if (!hex || !hex.startsWith('#') || hex.length < 7) {
    return { hue: 200, sat: 20 };
  }

  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  if (d === 0) h = 0;
  else if (max === r) h = ((g - b) / d) % 6;
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;

  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  return {
    hue: Math.round(h),
    sat: Math.min(100, Math.max(0, Math.round(s * 100)))
  };
}

/**
 * Dynamically constructs 6 unique, tailored grading recipes derived from Gemini's multi-phase reasoning
 */
export function generateTailoredRecipes(analysis: FullAnalysisResult): TailoredGradingRecipe[] {
  const baseGrading = analysis.phase3?.numericalGrading || {
    exposureEV: 0.2,
    contrast: 15,
    highlights: -15,
    shadows: 20,
    whites: 5,
    blacks: -10,
    temperature: 10,
    tint: 5,
    vibrance: 15,
    saturation: 10,
    clarity: 15,
    vignette: 20,
    grain: 15
  };

  const palette = analysis.phase3?.dominantPalette || [];
  const shadowSwatch = palette.find(p => p.role === 'shadow') || { hex: '#1e293b' };
  const highlightSwatch = palette.find(p => p.role === 'highlight') || { hex: '#f59e0b' };

  const shadowHSL = hexToHueAndSat(shadowSwatch.hex);
  const highlightHSL = hexToHueAndSat(highlightSwatch.hex);

  const filmName = analysis.phase3?.filmStockEmulation?.name || 'Kodak Portra 400';
  const genre = analysis.phase2?.detectedGenre || 'Photography';

  return [
    // 1. The Judge's Master Grade
    {
      id: 'ai-judge-master',
      name: "The Judge's Master Grade",
      category: 'AI Recommended',
      badge: 'Critique Optimal',
      description: `Exact mathematical translation of Gemini's multi-phase critique for ${genre}. Restores dynamic range with authentic texture preservation.`,
      previewGradient: 'from-amber-500 via-yellow-400 to-amber-600',
      grading: { ...baseGrading },
      splitToning: {
        shadowsHue: shadowHSL.hue,
        shadowsSat: Math.min(30, shadowHSL.sat),
        highlightsHue: highlightHSL.hue,
        highlightsSat: Math.min(25, highlightHSL.sat),
        balance: 0
      },
      halation: 18,
      sCurveRollOff: 45
    },

    // 2. CineStill 800T Photochemical Halation & Cinema Glow
    {
      id: 'cinestill-halation',
      name: 'CineStill 800T Halation & Glow',
      category: 'Cinematic',
      badge: 'Specular Bloom',
      description: 'Emulates 35mm motion picture stock with photochemical red halation around high-contrast edges and cool cyan shadow separation.',
      previewGradient: 'from-rose-600 via-orange-500 to-cyan-600',
      grading: {
        ...baseGrading,
        exposureEV: baseGrading.exposureEV + 0.15,
        contrast: 22,
        highlights: -25,
        shadows: 18,
        whites: 12,
        blacks: -8,
        temperature: 15,
        tint: 8,
        vibrance: 24,
        saturation: 14,
        clarity: 12,
        vignette: 28,
        grain: 22
      },
      splitToning: {
        shadowsHue: 195, // Cool Teal
        shadowsSat: 28,
        highlightsHue: 32, // Warm Golden Amber
        highlightsSat: 24,
        balance: 10
      },
      halation: 65,
      sCurveRollOff: 75
    },

    // 3. Analog Film Emulation (Kodak Portra / Fuji Velvia)
    {
      id: 'analog-film-emulation',
      name: `${filmName} Emulation`,
      category: 'Photochemical',
      badge: 'Organic Tones',
      description: `Tailored ${filmName} photochemical curve with delicate highlight roll-off, luminous midtones, and fine silver-halide grain.`,
      previewGradient: 'from-amber-600 via-emerald-600 to-amber-700',
      grading: {
        ...baseGrading,
        exposureEV: baseGrading.exposureEV,
        contrast: 14,
        highlights: -18,
        shadows: 28,
        whites: 8,
        blacks: -12,
        temperature: 12,
        tint: 6,
        vibrance: 20,
        saturation: 8,
        clarity: 16,
        vignette: 18,
        grain: 26
      },
      splitToning: {
        shadowsHue: 210,
        shadowsSat: 15,
        highlightsHue: 42,
        highlightsSat: 20,
        balance: 5
      },
      halation: 22,
      sCurveRollOff: 60
    },

    // 4. National Geographic Editorial Naturalism
    {
      id: 'natgeo-editorial',
      name: 'NatGeo Editorial Realism',
      category: 'Documentary',
      badge: 'High Dynamic Range',
      description: 'Maximum shadow detail recovery, punchy organic foliage/earth tones, and high micro-contrast while protecting natural neutral tones.',
      previewGradient: 'from-emerald-500 via-amber-400 to-teal-700',
      grading: {
        ...baseGrading,
        exposureEV: baseGrading.exposureEV + 0.1,
        contrast: 18,
        highlights: -35,
        shadows: 40,
        whites: 15,
        blacks: -6,
        temperature: 8,
        tint: -4,
        vibrance: 32,
        saturation: 16,
        clarity: 28,
        vignette: 15,
        grain: 12
      },
      splitToning: {
        shadowsHue: 140, // Organic Earth Green/Teal
        shadowsSat: 18,
        highlightsHue: 48, // Golden Daylight
        highlightsSat: 18,
        balance: 0
      },
      halation: 0,
      sCurveRollOff: 40
    },

    // 5. Ansel Adams Zone-System Fine Art Monochrome
    {
      id: 'ansel-zone-monochrome',
      name: 'Zone-System Fine Art B&W',
      category: 'Monochrome',
      badge: 'Silver Halide',
      description: 'Classic Zone-System black and white with deep carbon blacks, luminous midtone separation, and tactile silver-gelatin grain.',
      previewGradient: 'from-slate-700 via-slate-500 to-zinc-950',
      grading: {
        ...baseGrading,
        exposureEV: baseGrading.exposureEV + 0.05,
        contrast: 34,
        highlights: -15,
        shadows: 20,
        whites: 22,
        blacks: -28,
        temperature: 0,
        tint: 0,
        vibrance: 0,
        saturation: -100, // Complete Monochrome
        clarity: 35,
        vignette: 32,
        grain: 34
      },
      splitToning: {
        shadowsHue: 0,
        shadowsSat: 0,
        highlightsHue: 0,
        highlightsSat: 0,
        balance: 0
      },
      halation: 15,
      sCurveRollOff: 80,
      isMonochrome: true
    },

    // 6. Atmospheric Moody / Cyber Noir
    {
      id: 'atmospheric-moody',
      name: 'Atmospheric Moody Noir',
      category: 'Stylized',
      badge: 'Deep Contrast',
      description: 'Dramatic shadow roll-off with deep midnight blue/teal shadows and rich highlight glow for moody cinematic storytelling.',
      previewGradient: 'from-fuchsia-600 via-purple-600 to-cyan-500',
      grading: {
        ...baseGrading,
        exposureEV: baseGrading.exposureEV - 0.2,
        contrast: 28,
        highlights: 10,
        shadows: -15,
        whites: 15,
        blacks: -20,
        temperature: -10,
        tint: 12,
        vibrance: 25,
        saturation: 15,
        clarity: 24,
        vignette: 38,
        grain: 20
      },
      splitToning: {
        shadowsHue: 220, // Midnight Slate
        shadowsSat: 36,
        highlightsHue: 335, // Neon Rose / Warm Glow
        highlightsSat: 28,
        balance: -15
      },
      halation: 45,
      sCurveRollOff: 65
    }
  ];
}
