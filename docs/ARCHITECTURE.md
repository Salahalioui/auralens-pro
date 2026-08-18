# AuraLens Pro — Architectural Specification

AuraLens Pro is a Progressive Web Application (PWA) that combines Google Gemini's multimodal vision reasoning with in-browser computational photography, multi-engine 4K AI super-resolution, and Nano Banana generative image synthesis.

---

## 1. High-Level System Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AuraLens Pro UI                                │
│    (React 19 + TypeScript + Tailwind CSS + Lucide Icons + Mobile PWA)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     Multi-Phase AI Engine     │             │  In-Browser Darkroom Studio   │
│ (Google Gemini 3.6 / 3.7)     │             │  (Canvas 2D / Photochemical)  │
├───────────────────────────────┤             ├───────────────────────────────┤
│ • Phase 1: Spatial Geometry   │             │ • 6 AI Tailored Recipes       │
│   & Interactive Judge Pins    │             │ • Photochemical Halation      │
│ • Phase 2: Mood & Intent      │             │ • S-Curve Tone Mapping        │
│ • Phase 3: Color Science      │             │ • 3-Way Split Toning Wheels   │
│ • Phase 4: Field Guide &      │             │ • f/1.4 Optical Bokeh Blur    │
│   Master Synthesis            │             │ • Virtual 3D Studio Light     │
│ • Phase 5: Generative Output  │             │ • .XMP & .CUBE Pro Exporters  │
└───────────────┬───────────────┘             └───────────────┬───────────────┘
                │                                             │
                ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│  Multi-Engine 4K AI Upscaler  │             │  Client Storage & Offline SW  │
├───────────────────────────────┤             ├───────────────────────────────┤
│ • Truthful High-Pass (Local)  │             │ • IndexedDB (idb-keyval)      │
│ • Neural Real-ESRGAN (Cloud)  │             │ • Encrypted LocalStorage      │
│ • CodeFormer Face Restorer    │             │ • Service Worker Cache        │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## 2. Multi-Phase Reasoning Pipeline

The analysis pipeline processes the uploaded photograph through 5 sequential reasoning steps:

```
[Raw Photo] ──► [Phase 1: Composition] ──► [Phase 2: Mood & Intent] ──► [Phase 3: Color Science] ──► [Phase 4: Synthesis] ──► [Phase 5: Output]
                       │                           │                           │                           │                         │
                       ▼                           ▼                           ▼                           ▼                         ▼
                 Crop & Pins                 Genre & Mood                Kelvin, Tone &              Field Guide &             Multi-Engine 4K /
                 Rule of 3rds               Lighting Critique            Grading Matrix              Master Prompt             Pro Darkroom
```

### Phase 1: Composition, Spatial Geometry & Judge Pins
* **Framing Evaluation**: Evaluates edge margins, visual tension, and dead space.
* **Interactive Hotspot Pins (`judgePins`)**: Normalized coordinates $(X, Y)$ identifying localized visual tensions with specific critique and applied fix explanations.
* **Rule-of-Thirds Grid Alignment**: Identifies power intersection points and leading lines.
* **Horizon Leveling**: Detects horizontal tilt angles with clockwise/counter-clockwise direction.
* **Suggested Crop**: Normalized coordinates (`ymin`, `xmin`, `ymax`, `xmax`) with target aspect ratio ($16:9, 4:5, 1:1, 3:2$).

### Phase 2: Mood, Genre & Storytelling Intent
* **Genre Classification**: Automatic classification (*Portrait, Landscape, Street, Nature & Wildlife, Architecture, Macro, Documentary, Astro, Fine Art*).
* **Emotional Resonance**: Mood assessment (e.g. nostalgic, contemplative, energetic).
* **Photographer's Intention**: Reverse-engineers what the photographer was attempting to convey.
* **Atmospheric Lighting Critique**: Evaluates light quality (harsh midday sun, flat overcast, golden hour).

### Phase 3: Color Science & Photochemical Matrix
* **Dynamic Range Profile**: Evaluates shadow clipping, blown highlights, and midtone contrast.
* **Kelvin Temperature & Tint**: Analyzes white balance ($3200\text{K}-7500\text{K}$) and green/magenta tint.
* **Harmonic 4-Tone Palette**: Extracts dominant Hex swatches for highlights, midtones, shadows, and accents.
* **Film Stock Emulation**: Selects the optimal photochemical analog match (*Kodak Portra 400, CineStill 800T, Fuji Velvia 50, Ilford HP5*).
* **12-Parameter Numerical Matrix**: Exact numerical values for exposure, contrast, highlights, shadows, whites, blacks, temp, tint, vibrance, saturation, clarity, vignette, and grain.

### Phase 4: Master Generative Synthesis & Field Guide
* **Executive Scorecard & Radar Profile**: Weighted composite score ($0-100$) across 5 dimensions.
* **Pro Field Shooting Guide (`fieldGuide`)**: Recommended focal length, optimal time of day, shooting stance, and camera exposure triangle (Aperture, Shutter Speed, ISO).
* **Subject Authenticity Lock**: Strict negative/positive directives to preserve facial geometry and subject identity.
* **Optical Directives**: Lens focal length emulation ($35\text{mm}, 50\text{mm}, 85\text{mm} f/1.4$) and background bokeh separation.
* **Master Prompt**: Complete 5-part descriptive prompt formatted for image transformation models.

### Phase 5: Dual Execution Paths
1. **Multi-Engine 4K AI Super-Resolution Suite**:
   * *Truthful High-Pass (100% In-Browser)*
   * *Neural Real-ESRGAN (Free Cloud AI)*
   * *CodeFormer Facial Restoration (Free Cloud AI)*
2. **Instant Pro Darkroom Studio (100% Client-Side & Free)**: Real-time 60fps in-browser execution with `.XMP` and `.CUBE` export.

---

## 3. Client-Side Performance & Privacy

* **Token Pre-Scaling**: Client downscales uploaded high-megapixel photos to max $1280\text{px}$, reducing multimodal token usage and network payload by $>75\%$.
* **Sliding-Window Rate Limiter**: Tracks request timestamps in a 60-second sliding window to guarantee adherence to Google AI Studio's free limits.
* **Zero-Quota UI Freeze Prevention**: Automatically bypasses retry loops when `limit: 0` is detected.
* **100% Client-Side Privacy**: API keys and uploaded photographs are stored exclusively in your browser's encrypted `localStorage` and IndexedDB cache.
