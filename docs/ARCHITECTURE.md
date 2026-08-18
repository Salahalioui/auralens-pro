# AuraLens Pro — Architectural Specification

AuraLens Pro is a Progressive Web Application (PWA) that combines Google Gemini's multimodal vision reasoning with in-browser computational photography and Nano Banana generative image synthesis.

---

## 1. High-Level System Topology

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              AuraLens Pro UI                                │
│        (React 19 + TypeScript + Tailwind CSS + Lucide Icons + PWA)          │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
            ┌──────────────────────────┴──────────────────────────┐
            ▼                                                     ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│     Multi-Phase AI Engine     │             │  In-Browser Darkroom Studio   │
│ (Google Gemini 3.6 / 3.7)     │             │  (Canvas 2D / Photochemical)  │
├───────────────────────────────┤             ├───────────────────────────────┤
│ • Phase 1: Spatial Geometry   │             │ • 6 AI Tailored Recipes       │
│ • Phase 2: Mood & Intent      │             │ • Photochemical Halation      │
│ • Phase 3: Color Science      │             │ • S-Curve Tone Mapping        │
│ • Phase 4: Master Synthesis   │             │ • 3-Way Split Toning Wheels   │
│ • Phase 5: Generative Output  │             │ • .CUBE 3D LUT Exporter       │
└───────────────┬───────────────┘             └───────────────┬───────────────┘
                │                                             │
                ▼                                             ▼
┌───────────────────────────────┐             ┌───────────────────────────────┐
│    Rate Limiter & Quota HUD   │             │  Client Storage & Offline SW  │
│ (Sliding Window RPM / TPM)    │             │  (IndexedDB / idb-keyval)     │
└───────────────────────────────┘             └───────────────────────────────┘
```

---

## 2. Multi-Phase Reasoning Pipeline

The analysis pipeline processes the uploaded photograph through 5 sequential reasoning steps:

```
[Raw Photo] ──► [Phase 1: Composition] ──► [Phase 2: Mood & Intent] ──► [Phase 3: Color Science] ──► [Phase 4: Synthesis] ──► [Phase 5: Output]
                       │                           │                           │                           │                         │
                       ▼                           ▼                           ▼                           ▼                         ▼
                 Crop Bounds                 Genre & Mood                Kelvin, Tone &              Identity Lock &           Nano Banana /
                 Rule of 3rds               Lighting Critique            Grading Matrix              Master Prompt             Pro Darkroom
```

### Phase 1: Composition & Spatial Geometry
* **Framing Evaluation**: Evaluates edge margins, visual tension, and dead space.
* **Focal Anchor Localization**: Identifies subject coordinate centers on normalized $0-1000$ coordinates.
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

### Phase 4: Master Generative Synthesis
* **Executive Scorecard & Radar Profile**: Weighted composite score ($0-100$) across 5 dimensions.
* **Subject Authenticity Lock**: Strict negative/positive directives to preserve facial geometry and subject identity.
* **Optical Directives**: Lens focal length emulation ($35\text{mm}, 50\text{mm}, 85\text{mm} f/1.4$) and background bokeh separation.
* **Master Prompt**: Complete 5-part descriptive prompt formatted for image transformation models.

### Phase 5: Dual Execution Paths
1. **Nano Banana 2 Generative Model (`gemini-3.1-flash-image`)**: AI generative transformation with strict subject identity preservation.
2. **Instant Pro Darkroom Studio (100% Client-Side & Free)**: Real-time 60fps in-browser execution with `.CUBE` 3D LUT export.

---

## 3. Client-Side Performance & Rate Limiter

* **Token Pre-Scaling**: Client downscales uploaded high-megapixel photos to max $1280\text{px}$, reducing multimodal token usage and network payload by $>75\%$.
* **Sliding-Window Rate Limiter**: Tracks request timestamps in a 60-second sliding window to guarantee adherence to Google AI Studio's 15 RPM / 1M TPM free limits.
* **Zero-Quota UI Freeze Prevention**: Immediately detects permanent `limit: 0` responses without freezing browser threads with useless retry loops.
* **State Persistence**: Uses IndexedDB (`idb-keyval`) to cache previous analyses by image SHA-256 hash, restoring active sessions automatically upon page reloads.
