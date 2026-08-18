import { GoogleGenAI } from '@google/genai';
import { 
  FullAnalysisResult, 
  GeneratedMasterwork, 
  PhotoMetadata, 
  StylePresetModifier 
} from '../types/photography';
import { rateLimitManager } from './rateLimitManager';
import { computeImageHash, getCachedAnalysis, saveAnalysisToCache } from './cacheService';

export const STYLE_PRESETS: StylePresetModifier[] = [
  {
    id: 'original-master',
    name: 'Award-Winning Masterwork',
    category: 'Balanced',
    promptSuffix: 'Refined to an award-winning gallery standard, impeccable lighting, authentic natural skin/material textures, balanced dynamic range.',
    description: 'Elevates shot to Hasselblad / Leica master standard while strictly preserving original subject authenticity.',
    previewGradient: 'from-amber-500 to-yellow-600'
  },
  {
    id: 'natgeo-editorial',
    name: 'National Geographic Documentary',
    category: 'Documentary',
    promptSuffix: 'National Geographic editorial style, vibrant atmospheric realism, rich organic tones, crisp optical sharpness, golden hour warmth.',
    description: 'Documentary realism, organic vibrant tones, rich atmospheric haze, environmental storytelling.',
    previewGradient: 'from-amber-600 to-emerald-700'
  },
  {
    id: 'vogue-portrait',
    name: 'Vogue Studio Portrait',
    category: 'Editorial',
    promptSuffix: 'Vogue high-fashion editorial, beauty dish soft lighting, creamy f/1.2 background separation, luminous skin tones, refined color grading.',
    description: 'High-fashion editorial lighting, soft Rembrandt illumination, creamy medium-format bokeh.',
    previewGradient: 'from-rose-500 to-purple-600'
  },
  {
    id: 'cinematic-teal-orange',
    name: 'Cinematic 35mm Film Still',
    category: 'Cinematic',
    promptSuffix: 'Anamorphic 35mm cinema still, subtle teal & orange split toning, CineStill 800T halation on highlights, atmospheric haze, moody contrast.',
    description: '35mm anamorphic film look with CineStill halation, volumetric light beams, and teal-orange split toning.',
    previewGradient: 'from-cyan-500 to-orange-600'
  },
  {
    id: 'leica-monochrome',
    name: 'Leica Monochrom High-Contrast',
    category: 'Monochrome',
    promptSuffix: 'Leica M11 Monochrom 35mm street aesthetic, rich deep blacks, luminous zone-system midtones, sharp silver-halide film grain, timeless Cartier-Bresson contrast.',
    description: 'Black and white fine art with deep silver-halide tonal graduations and decisive-moment street sharpness.',
    previewGradient: 'from-slate-700 to-slate-950'
  },
  {
    id: 'cyberpunk-neon',
    name: 'Neon Cyberpunk Noir',
    category: 'Stylized',
    promptSuffix: 'Cyberpunk nocturnal atmosphere, neon magenta and cyan rim reflections, wet reflective surfaces, volumetric foggy night glow.',
    description: 'Futuristic nocturnal styling with neon reflections, high dynamic range shadows, and wet pavement glow.',
    previewGradient: 'from-fuchsia-600 to-cyan-600'
  }
];

const MULTI_PHASE_SYSTEM_PROMPT = `
You are an Executive Photography Judge, Master Lighting Director, and World-Class Darkroom Colorist.
Your goal is to inspect the uploaded photograph, execute deep multi-phase reasoning across:
1. Composition (framing, golden ratio, rule of thirds, horizon tilt, precise crop box coordinates in 0-1000 range)
2. Mood, Genre & Storytelling Intent (genre classification, emotional tone, lighting atmosphere, narrative improvements)
3. Color Science & Lighting Profile (exposure EV balance, Kelvin temperature, dominant palette, film stock emulation, numerical grading matrix)
4. Master Synthesis & Nano Banana Image Editing Prompt (a comprehensive, high-fidelity prompt to transform this amateur shot into a world-class award-winning masterwork while strictly preserving the authenticity and identity of the subject).

You MUST output ONLY a valid JSON object matching the requested schema.
`;

const MULTI_PHASE_USER_PROMPT = `
Carefully critique and analyze this photograph. Perform the 4-phase reasoning and return the following JSON structure:

{
  "phase1": {
    "score": <number 0-100>,
    "framingCritique": "<concise professional evaluation of the framing and subject isolation>",
    "subjectPlacement": "<description of where the primary subject sits and where it should sit>",
    "ruleOfThirdsAlignment": "<how the focal points align with rule of thirds or golden ratio>",
    "leadingLinesAndDepth": "<analysis of visual flow, foreground, midground, and background depth>",
    "horizonLevel": {
      "tilted": <boolean>,
      "degrees": <number e.g. 2.5 or 0>,
      "direction": <"clockwise" | "counter-clockwise" | "level">
    },
    "suggestedCrop": {
      "ymin": <number 0 to 1000>,
      "xmin": <number 0 to 1000>,
      "ymax": <number 0 to 1000>,
      "xmax": <number 0 to 1000>,
      "rationale": "<why this crop improves visual tension and balance>",
      "targetAspectRatio": "<e.g. 16:9, 4:5, 1:1, 3:2>"
    },
    "clutterRemovalTips": ["<tip 1>", "<tip 2>"]
  },
  "phase2": {
    "score": <number 0-100>,
    "detectedGenre": <"Portrait" | "Landscape" | "Street" | "Architecture" | "Nature & Wildlife" | "Macro & Still Life" | "Documentary / Travel" | "Night / Astro" | "Fine Art">,
    "emotionalResonance": "<the mood evoked: e.g. nostalgic, serene, dramatic, energetic>",
    "photographerIntention": "<what the photographer was trying to capture>",
    "lightingAtmosphere": "<critique of existing lighting: e.g. harsh midday sun, flat overcast, dim ambient>",
    "narrativeCritique": "<how the story of the image can be elevated to gallery-level>",
    "suggestedStorytellingEdits": ["<narrative edit 1>", "<narrative edit 2>"],
    "recommendedStylePreset": "<e.g. Cinematic 35mm Film Still, National Geographic Editorial>"
  },
  "phase3": {
    "score": <number 0-100>,
    "exposureEvaluation": "<exposure evaluation: overexposed, underexposed, or flat midtones>",
    "dynamicRange": <"Crushed Shadows" | "Blown Highlights" | "Flat Midtones" | "Balanced High DR" | "Harsh Midday">,
    "colorTemperatureK": <number e.g. 5600, 3200, 6500>,
    "tint": <number -100 to 100>,
    "dominantPalette": [
      { "hex": "#...", "name": "<color name>", "role": "highlight" },
      { "hex": "#...", "name": "<color name>", "role": "shadow" },
      { "hex": "#...", "name": "<color name>", "role": "midtone" },
      { "hex": "#...", "name": "<color name>", "role": "accent" }
    ],
    "colorHarmony": <"Complementary" | "Analogous" | "Triadic" | "Monochromatic" | "Split-Complementary" | "Cinematic Muted">,
    "filmStockEmulation": {
      "name": "<e.g. Kodak Portra 400, Fujifilm Velvia 50, CineStill 800T, Ilford HP5>",
      "description": "<why this film stock fits>",
      "whyItFits": "<aesthetic justification>"
    },
    "numericalGrading": {
      "exposureEV": <number e.g. 0.3 (-3.0 to +3.0)>,
      "contrast": <number -100 to +100>,
      "highlights": <number -100 to +100>,
      "shadows": <number -100 to +100>,
      "whites": <number -100 to +100>,
      "blacks": <number -100 to +100>,
      "temperature": <number -100 to +100>,
      "tint": <number -100 to +100>,
      "vibrance": <number -100 to +100>,
      "saturation": <number -100 to +100>,
      "clarity": <number 0 to 100>,
      "vignette": <number 0 to 100>,
      "grain": <number 0 to 100>
    }
  },
  "phase4": {
    "overallScore": <number 0-100, weighted composite>,
    "executiveSummary": "<2-sentence executive summary of the photograph and its potential>",
    "radarScores": {
      "composition": <number 0-100>,
      "lighting": <number 0-100>,
      "colorHarmony": <number 0-100>,
      "storytelling": <number 0-100>,
      "technicalSharpness": <number 0-100>
    },
    "subjectPreservationRules": [
      "<Strict rule on preserving original face/subject identity and shape>",
      "<Rule on maintaining authentic core structures>"
    ],
    "lightingAndAtmosphereDirectives": [
      "<Directive on directional lighting, soft volumetric rays, or rim lights>",
      "<Directive on shadow falloff>"
    ],
    "opticsAndBokehDirectives": [
      "<Directive on lens focal length, creamy bokeh separation, optical clarity>"
    ],
    "masterPrompt": "<A comprehensive, highly descriptive 5-part prompt for Nano Banana image editing that preserves the subject identity while transforming lighting, color grading, background depth, and optical fidelity to award-winning caliber.>",
    "recommendedAspectRatio": "<e.g. 16:9, 4:5, 3:2, 1:1>"
  }
}
`;

export class GeminiService {
  private apiKey: string = '';
  private textModel: string = 'gemini-3.6-flash';
  private imageModel: string = 'gemini-3.1-flash-image';

  constructor() {
    if (typeof window !== 'undefined') {
      this.apiKey = localStorage.getItem('auralens_gemini_api_key') || '';
      this.textModel = localStorage.getItem('auralens_text_model') || 'gemini-3.6-flash';
      this.imageModel = localStorage.getItem('auralens_image_model') || 'gemini-3.1-flash-image';
    }
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('auralens_gemini_api_key', this.apiKey);
    }
  }

  public getApiKey(): string {
    return this.apiKey;
  }

  public setModels(textModel: string, imageModel: string) {
    this.textModel = textModel;
    this.imageModel = imageModel;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auralens_text_model', textModel);
      localStorage.setItem('auralens_image_model', imageModel);
    }
  }

  public hasApiKey(): boolean {
    return !!this.apiKey && this.apiKey.length > 10;
  }

  /**
   * Executes a robust multimodal generateContent request against Google AI Studio API
   */
  private async executeGenerateContent(
    model: string,
    prompt: string,
    base64Data: string,
    mimeType: string
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;
    
    const body = {
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType || 'image/jpeg',
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        responseMimeType: 'application/json'
      }
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      const message = errData?.error?.message || `API Error ${res.status}: ${res.statusText}`;
      const err: any = new Error(message);
      err.status = res.status;
      throw err;
    }

    const json = await res.json();
    const candidates = json?.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response candidates returned by Gemini model');
    }

    const textPart = candidates[0]?.content?.parts?.[0]?.text;
    if (!textPart) {
      throw new Error('Empty text content in Gemini candidate');
    }

    return textPart;
  }

  /**
   * Runs the 4-Phase Gemini Reasoning Engine on the uploaded photograph
   */
  public async analyzePhoto(
    base64Raw: string,
    mimeType: string,
    metadata: PhotoMetadata,
    onProgress?: (phase: string) => void
  ): Promise<FullAnalysisResult> {
    const imageHash = await computeImageHash(base64Raw);

    // 1. Check local IndexedDB cache first
    const cached = await getCachedAnalysis(imageHash);
    if (cached) {
      console.log('[Cache Hit] Returning cached analysis for hash:', imageHash);
      if (onProgress) onProgress('Loaded from instant cache');
      return cached;
    }

    // 2. If no API key is set, return a rich realistic simulation for immediate exploration
    if (!this.hasApiKey()) {
      return this.generateSimulatedAnalysis(base64Raw, mimeType, metadata, imageHash, onProgress);
    }

    // 3. Real API call with Rate Limit Throttling & Retry
    if (onProgress) onProgress('Connecting to Gemini Vision Engine...');

    const result = await rateLimitManager.executeWithRetry(async () => {
      if (onProgress) onProgress('Executing Multi-Phase Composition & Color Science Reasoning...');

      const promptText = `${MULTI_PHASE_SYSTEM_PROMPT}\n\n${MULTI_PHASE_USER_PROMPT}\n\nImage Metadata: ${JSON.stringify(metadata)}`;

      // Models to try in order of active availability (August 2026)
      const modelsToTry = [
        this.textModel,
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.7-flash',
        'gemini-3.1-flash-lite',
        'gemini-2.5-flash'
      ];

      // Remove duplicates
      const uniqueModels = Array.from(new Set(modelsToTry.filter(Boolean)));

      let outputText: string = '';
      let lastError: any = null;

      for (const modelName of uniqueModels) {
        try {
          if (onProgress) onProgress(`Reasoning with ${modelName}...`);
          outputText = await this.executeGenerateContent(modelName, promptText, base64Raw, mimeType);
          if (outputText) break;
        } catch (err: any) {
          console.warn(`Attempt with model ${modelName} failed:`, err?.message);
          lastError = err;
          
          // If 401/403 invalid API key, throw immediately
          if (err?.status === 401 || err?.status === 403) {
            throw err;
          }

          // If 503 (temporary high demand spike on this model), pause briefly and continue to next model
          if (err?.status === 503 || err?.message?.includes('high demand') || err?.message?.includes('503')) {
            if (onProgress) onProgress(`${modelName} busy, falling back to next available model...`);
            await new Promise(res => setTimeout(res, 800));
            continue;
          }

          // If 429 quota, wait and retry
          if (err?.status === 429) {
            await new Promise(res => setTimeout(res, 1200));
          }
        }
      }

      // If all pre-configured models failed with 404 or 503, try dynamic model discovery from API
      if (!outputText) {
        try {
          if (onProgress) onProgress('Discovering active models on your Google project...');
          const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${this.apiKey}`);
          if (listRes.ok) {
            const listData = await listRes.json();
            const availableModels: string[] = (listData?.models || [])
              .filter((m: any) => m?.supportedGenerationMethods?.includes('generateContent'))
              .map((m: any) => m.name.replace('models/', ''))
              .filter((name: string) => !uniqueModels.includes(name));

            for (const discoveredModel of availableModels.slice(0, 3)) {
              try {
                if (onProgress) onProgress(`Trying discovered model ${discoveredModel}...`);
                outputText = await this.executeGenerateContent(discoveredModel, promptText, base64Raw, mimeType);
                if (outputText) break;
              } catch (discErr) {
                console.warn(`Discovered model ${discoveredModel} failed:`, discErr);
              }
            }
          }
        } catch (discListErr) {
          console.warn('Model discovery failed:', discListErr);
        }
      }

      if (!outputText) {
        throw lastError || new Error('All Gemini Vision models are currently experiencing temporary high demand (503). Please wait a moment and try again, or use Simulation/Darkroom mode.');
      }

      // Resilient JSON extraction
      let cleanJson = outputText.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      let parsed: any;
      try {
        parsed = JSON.parse(cleanJson);
      } catch {
        const firstBrace = cleanJson.indexOf('{');
        const lastBrace = cleanJson.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          parsed = JSON.parse(cleanJson.substring(firstBrace, lastBrace + 1));
        } else {
          throw new Error('Could not parse structured analysis from Gemini response.');
        }
      }

      // Fill in defaults if any phase is missing to prevent UI crashes
      const fullResult: FullAnalysisResult = {
        id: `analysis_${Date.now()}`,
        imageHash,
        timestamp: Date.now(),
        originalImageBase64: base64Raw,
        originalImageMime: mimeType,
        metadata,
        phase1: parsed.phase1 || {
          score: 70,
          framingCritique: 'Framing provides balanced subject isolation.',
          subjectPlacement: 'Focal anchor sits near the upper rule-of-thirds.',
          ruleOfThirdsAlignment: 'Aligned with golden section power lines.',
          leadingLinesAndDepth: 'Good depth with natural leading paths.',
          horizonLevel: { tilted: false, degrees: 0, direction: 'level' },
          suggestedCrop: { ymin: 50, xmin: 50, ymax: 950, xmax: 950, rationale: 'Tightens edge margins', targetAspectRatio: '16:9' },
          clutterRemovalTips: ['Eliminate edge tangents', 'Balance highlights']
        },
        phase2: parsed.phase2 || {
          score: 75,
          detectedGenre: 'Portrait',
          emotionalResonance: 'Atmospheric and naturalistic',
          photographerIntention: 'Capturing authentic emotional character',
          lightingAtmosphere: 'Ambient natural illumination',
          narrativeCritique: 'Elevating dimensional depth and background bokeh',
          suggestedStorytellingEdits: ['Add warm golden directional light', 'Create f/1.4 background separation'],
          recommendedStylePreset: 'Cinematic 35mm Film Still'
        },
        phase3: parsed.phase3 || {
          score: 70,
          exposureEvaluation: 'Balanced dynamic range with recoverable shadows',
          dynamicRange: 'Balanced High DR',
          colorTemperatureK: 5600,
          tint: 5,
          dominantPalette: [
            { hex: '#f59e0b', name: 'Warm Amber', role: 'highlight' },
            { hex: '#1e293b', name: 'Deep Navy', role: 'shadow' },
            { hex: '#c2410c', name: 'Ochre Accent', role: 'accent' },
            { hex: '#78716c', name: 'Muted Slate', role: 'midtone' }
          ],
          colorHarmony: 'Complementary',
          filmStockEmulation: {
            name: 'Kodak Portra 400',
            description: 'Luminous skin tones and rich tonal graduation',
            whyItFits: 'Organic film curve and natural highlight roll-off'
          },
          numericalGrading: {
            exposureEV: 0.25,
            contrast: 15,
            highlights: -15,
            shadows: 20,
            whites: 5,
            blacks: -10,
            temperature: 10,
            tint: 5,
            vibrance: 18,
            saturation: 10,
            clarity: 15,
            vignette: 20,
            grain: 15
          }
        },
        phase4: parsed.phase4 || {
          overallScore: 72,
          executiveSummary: 'Strong photographic foundation ready for gallery-level transformation.',
          radarScores: {
            composition: 70,
            lighting: 72,
            colorHarmony: 75,
            storytelling: 74,
            technicalSharpness: 70
          },
          subjectPreservationRules: ['Preserve authentic face and subject structure'],
          lightingAndAtmosphereDirectives: ['Directional golden hour light with gentle rim illumination'],
          opticsAndBokehDirectives: ['35mm f/1.4 creamy background blur'],
          masterPrompt: 'Transform into an award-winning masterwork. Strictly preserve subject identity. Enhance with golden hour directional lighting, Kodak Portra 400 color science, and creamy 35mm f/1.4 bokeh.',
          recommendedAspectRatio: '16:9'
        }
      };

      return fullResult;
    });

    // Save to IndexedDB cache
    await saveAnalysisToCache(result);
    return result;
  }

  /**
   * Generates or Edits the image using Nano Banana (gemini-2.5-flash-image / gemini-3.1-flash-image)
   */
  public async generateMasterwork(
    base64Raw: string,
    mimeType: string,
    customPrompt: string,
    aspectRatio = '16:9'
  ): Promise<GeneratedMasterwork> {
    const startTime = Date.now();

    // If no API key, return simulated high-end masterwork
    if (!this.hasApiKey()) {
      await new Promise(res => setTimeout(res, 2500));
      return {
        imageUrl: `data:${mimeType};base64,${base64Raw}`,
        promptUsed: customPrompt,
        modelUsed: 'Nano Banana (Demo Mode)',
        timestamp: Date.now(),
        generationTimeMs: 2500
      };
    }

    // 1. Try Google Gemini / Nano Banana Native Image Generation
    try {
      return await rateLimitManager.executeWithRetry(async () => {
        const client = new GoogleGenAI({ apiKey: this.apiKey });
        const interaction = await client.interactions.create({
          model: this.imageModel,
          input: [
            { type: 'text', text: customPrompt },
            { type: 'image', mime_type: mimeType, data: base64Raw }
          ]
        });

        const generatedImage = interaction.output_image;
        if (generatedImage && generatedImage.data) {
          return {
            imageUrl: `data:${generatedImage.mime_type || 'image/jpeg'};base64,${generatedImage.data}`,
            promptUsed: customPrompt,
            modelUsed: `${this.imageModel} (Nano Banana 2)`,
            timestamp: Date.now(),
            generationTimeMs: Date.now() - startTime
          };
        }
        throw new Error('No image returned');
      }, 1, 1000);
    } catch (googleErr: any) {
      console.warn('Google image generation unavailable on current tier:', googleErr?.message);
      
      // 2. High-Fidelity Free Generative Fallback
      try {
        const width = aspectRatio === '9:16' ? 720 : aspectRatio === '4:5' ? 864 : aspectRatio === '1:1' ? 1024 : 1280;
        const height = aspectRatio === '9:16' ? 1280 : aspectRatio === '4:5' ? 1080 : aspectRatio === '1:1' ? 1024 : 720;
        const seed = Math.floor(Math.random() * 999999);
        const encodedPrompt = encodeURIComponent(customPrompt.slice(0, 800));
        const freeGenUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${seed}`;

        const pollRes = await fetch(freeGenUrl);
        if (pollRes.ok) {
          const blob = await pollRes.blob();
          const base64DataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          return {
            imageUrl: base64DataUrl,
            promptUsed: customPrompt,
            modelUsed: 'AuraLens Free Generative Studio (Zero-Quota)',
            timestamp: Date.now(),
            generationTimeMs: Date.now() - startTime
          };
        }
      } catch (freeErr) {
        console.warn('Free generative fallback failed:', freeErr);
      }

      throw new Error(
        'Image generation is unavailable (Google AI Studio Free Tier has 0 quota for image models). You can switch to our Instant Pro Darkroom Studio to apply the AI color grade directly!'
      );
    }
  }

  /**
   * Generates a realistic simulation for instant exploration when no API key is provided
   */
  private async generateSimulatedAnalysis(
    base64Raw: string,
    mimeType: string,
    metadata: PhotoMetadata,
    imageHash: string,
    onProgress?: (phase: string) => void
  ): Promise<FullAnalysisResult> {
    if (onProgress) onProgress('Evaluating framing geometry & horizon tilt (Demo Mode)...');
    await new Promise(r => setTimeout(r, 600));
    if (onProgress) onProgress('Deciphering mood, lighting atmosphere & emotional resonance...');
    await new Promise(r => setTimeout(r, 600));
    if (onProgress) onProgress('Synthesizing color science, Kelvin balance & film stock profile...');
    await new Promise(r => setTimeout(r, 600));
    if (onProgress) onProgress('Constructing Master Nano Banana synthesis prompt...');
    await new Promise(r => setTimeout(r, 500));

    const result: FullAnalysisResult = {
      id: `sim_${Date.now()}`,
      imageHash,
      timestamp: Date.now(),
      originalImageBase64: base64Raw,
      originalImageMime: mimeType,
      metadata,
      phase1: {
        score: 64,
        framingCritique: 'The subject is slightly off the optimal golden section, resulting in visual tension with dead space on the upper perimeter. Edge tangents clutter the right third.',
        subjectPlacement: 'The primary focal anchor sits around (X: 480, Y: 520). Shifting slightly rightward and trimming the sky increases dramatic subject isolation.',
        ruleOfThirdsAlignment: 'Focal weight sits at 48% width; aligning near the 33% or 66% vertical power line creates a far more intentional, cinematic stance.',
        leadingLinesAndDepth: 'Moderate foreground interest, but mid-ground tonal separation is compressed due to flat ambient lighting.',
        horizonLevel: {
          tilted: true,
          degrees: 1.8,
          direction: 'clockwise'
        },
        suggestedCrop: {
          ymin: 80,
          xmin: 60,
          ymax: 940,
          xmax: 920,
          rationale: 'Tightens the composition, eliminates edge tangents, and anchors the subject on the upper-right power point with a balanced 16:9 cinematic aspect ratio.',
          targetAspectRatio: '16:9'
        },
        clutterRemovalTips: [
          'Crop distracting high-contrast elements near top-left edge',
          'Level the 1.8° clockwise horizon tilt to restore grounding equilibrium',
          'Dodge the foreground path to lead the viewer eye smoothly into the focal center'
        ]
      },
      phase2: {
        score: 72,
        detectedGenre: 'Portrait',
        emotionalResonance: 'Introspective, evocative, naturalistic with untapped dramatic atmosphere',
        photographerIntention: 'Capture an authentic moment, but restricted by harsh ambient light and wide-angle depth compression.',
        lightingAtmosphere: 'Flat ambient illumination with harsh highlights on top edges and unrecovered dark shadows in the mid-tones.',
        narrativeCritique: 'The core subject possesses strong expressive character; introducing soft directional rim lighting and atmospheric depth will turn this into a gallery centerpiece.',
        suggestedStorytellingEdits: [
          'Introduce subtle golden-hour directional light entering from the left at a 45° angle',
          'Elevate the background into creamy f/1.4 optical bokeh to isolate the narrative hero',
          'Apply gentle cinematic atmospheric haze to accentuate dimensional depth'
        ],
        recommendedStylePreset: 'Cinematic 35mm Film Still'
      },
      phase3: {
        score: 68,
        exposureEvaluation: 'Slightly underexposed midtones with clipped highlight rolloff on bright surfaces.',
        dynamicRange: 'Flat Midtones',
        colorTemperatureK: 5800,
        tint: 8,
        dominantPalette: [
          { hex: '#f59e0b', name: 'Golden Amber', role: 'highlight' },
          { hex: '#1e293b', name: 'Deep Slate Navy', role: 'shadow' },
          { hex: '#c2410c', name: 'Terracotta Ochre', role: 'accent' },
          { hex: '#78716c', name: 'Muted Taupe', role: 'midtone' }
        ],
        colorHarmony: 'Complementary',
        filmStockEmulation: {
          name: 'Kodak Portra 400 + CineStill Halation',
          description: 'Luminous skin tones, warm organic highlight rolloff, and rich shadow depth.',
          whyItFits: 'Suppresses digital harshness while giving natural vibrancy and micro-contrast to textures.'
        },
        numericalGrading: {
          exposureEV: 0.35,
          contrast: 18,
          highlights: -22,
          shadows: 28,
          whites: 10,
          blacks: -12,
          temperature: 15,
          tint: 6,
          vibrance: 22,
          saturation: 12,
          clarity: 16,
          vignette: 24,
          grain: 18
        }
      },
      phase4: {
        overallScore: 68,
        executiveSummary: 'An evocative shot with tremendous foundational character. Correcting the 1.8° tilt, lifting midtone shadows, and introducing directional Leica 35mm optical color science will transform it into an award-winning masterwork.',
        radarScores: {
          composition: 64,
          lighting: 62,
          colorHarmony: 75,
          storytelling: 72,
          technicalSharpness: 68
        },
        subjectPreservationRules: [
          'Strictly preserve the facial structure, authentic expression, posture, and core geometry of the original subject.',
          'Retain the original environment and architecture while elevating its depth and atmosphere.'
        ],
        lightingAndAtmosphereDirectives: [
          'Sculpt directional golden hour side illumination with soft wrap-around falloff.',
          'Inject gentle atmospheric depth with rich cinematic shadow transitions.'
        ],
        opticsAndBokehDirectives: [
          'Emulate 35mm f/1.4 Leica Summilux optical characteristics with silky circular background bokeh.',
          'Maintain ultra-crisp focal plane resolution across subject eyes and textural details.'
        ],
        masterPrompt: 'Transform this photograph into an award-winning gallery masterpiece. Strictly preserve the original subject identity, facial features, and authentic posture. Re-compose with clean golden ratio framing, eliminating edge distractions. Upgrade lighting to soft 45-degree golden hour directional illumination with subtle warm rim light. Apply Kodak Portra 400 film color science with deep rich blacks, luminous midtones, and delicate highlight roll-off. Render with 35mm f/1.4 medium format optical depth of field, creamy background bokeh separation, and crisp textural clarity on the focal plane.',
        recommendedAspectRatio: '16:9'
      }
    };

    await saveAnalysisToCache(result);
    return result;
  }
}

export const geminiService = new GeminiService();
