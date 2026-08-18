# 📷 AuraLens Pro

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.6%20%2F%203.7-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)

**Turn amateur, unpolished photographs into award-winning gallery masterworks using multi-phase Google Gemini vision reasoning, Multi-Engine 4K AI Super-Resolution, Nano Banana image editing, and an in-browser photochemical color grading suite.**

[Live Demo](#-deployment) • [Architecture Docs](docs/ARCHITECTURE.md) • [Color Science](docs/COLOR_SCIENCE_PIPELINE.md) • [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

</div>

---

## 🌟 Key Features

### 🧠 1. 5-Phase Multimodal Reasoning Engine
* **Phase 1 (Composition & Judge Pins)**: Rule-of-thirds power lines, golden ratio framing, horizon tilt angle detection, and interactive hotspot critique pins.
* **Phase 2 (Mood & Storytelling)**: Auto-genre classification, ambient lighting critique, and emotional resonance assessment.
* **Phase 3 (Color Science & Film Stocks)**: Dynamic range profiling, Kelvin temperature balance ($3200\text{K}-7500\text{K}$), dominant 4-tone palette extraction, and 12-parameter numerical grading matrix.
* **Phase 4 (Master Synthesis & Field Guide)**: Executive scoring radar ($0-100$), subject identity lock, pro camera field shooting guide, and 5-part transformation prompt.
* **Phase 5 (Dual Execution)**: Nano Banana generative rendering or the instant In-Browser Darkroom.

---

### 🚀 2. Multi-Engine 4K AI Super-Resolution Suite (100% Free)
* 🛡️ **Truthful High-Pass (100% In-Browser)**: Progressive Lanczos-3 sub-pixel grid with 4-neighborhood Laplacian edge matrix. Zero AI hallucinations, preserves authentic camera reality & organic film grain.
* 🧠 **Neural Real-ESRGAN (Free Cloud AI)**: Generative neural super-resolution network that synthesizes sub-pixel micro-textures for foliage, bark, rocks, and fabrics.
* 👤 **CodeFormer Facial Restoration (Free Cloud AI)**: Purpose-built facial prior network that reconstructs crystal-clear eye reflections, eyelashes, lip contours, and natural skin pores.
* **Magnification**: $2\times$ Super-HD ($2560\text{px}$) & $4\times$ 4K Ultra-HD ($3840\text{px}+$).

---

### 🎨 3. Pro In-Browser Computational Darkroom (Zero Quota)
* **6 Dynamic AI-Tailored Recipes**: Unique grading archetypes synthesized on-the-fly for each specific photograph.
* **Photochemical Halation & Specular Bloom**: Analog red/orange edge scattering (CineStill 800T emulation).
* **Parametric S-Curve Tone Mapping**: Monotonic cubic Hermite spline highlight roll-off preventing digital clipping.
* **Luminance-Adaptive Film Grain**: Midtone-weighted silver halide particle synthesis.
* **3-Way Split Toning Wheels**: Dedicated Shadows (Lift) and Highlights (Gain) color injection.
* **Computational `f/1.4` Optical Depth & Bokeh Simulator**: Circle-of-Confusion background blur respecting subject sharpness.
* **Virtual 3D Studio Key Light Sculptor**: Draggable studio softbox casting directional warmth and inverse-square fall-off.
* **1-Click AI Horizon Auto-Leveling**: Affine rotation matrix leveling tilted horizons automatically.

---

### 💾 4. Multi-Platform Desktop Pro Exporters
* **Adobe Lightroom Classic & Mobile Preset (`.XMP`)**: 1-Click download of standard XML sidecar presets.
* **DaVinci Resolve, Premiere Pro & Photoshop 3D LUT (`.CUBE`)**: Standard $33\times 33\times 33$ 3D LUT.
* **High-Res Master JPEG**: Export at 95% quality with AI golden-ratio crop applied.
* **CSS Filter Matrix**: Instant web filter code.

---

### 📊 5. Real-Time RGB & Luma Histogram Scope
* Live 256-bucket wave scope with real-time shadow crushing and highlight clipping warning indicators.

---

### 📱 6. Mobile-First PWA & 100% Client-Side Privacy
* **Mobile Floating Navigation Bar**: 1-thumb switching between AI Critique, Pro Darkroom, Masterwork, and New Photo.
* **Offline PWA Support**: Installable standalone application with service worker caching.
* **Privacy**: API keys and uploaded photographs are stored exclusively in your browser's encrypted `localStorage` and IndexedDB cache.

---

## 🏗️ Architecture & Pipeline

```
[Raw Photo] ──► [Phase 1: Composition] ──► [Phase 2: Mood & Intent] ──► [Phase 3: Color Science] ──► [Phase 4: Synthesis] ──► [Phase 5: Output]
                       │                           │                           │                           │                         │
                       ▼                           ▼                           ▼                           ▼                         ▼
                 Crop & Pins                 Genre & Mood                Kelvin, Tone &              Field Guide &             Multi-Engine 4K /
                 Rule of 3rds               Lighting Critique            Film Stock Matrix           Master Prompt             Pro Darkroom
```

For complete architectural details, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org) (v18 or higher)
* A free [Google AI Studio API Key](https://aistudio.google.com/app/apikey)

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/Salahalioui/auralens-pro.git
cd auralens-pro

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Project Structure

```
├── public/
│   ├── favicon.svg              # Vector aperture camera icon
│   ├── manifest.webmanifest     # PWA manifest
│   └── sw.js                    # Service worker offline cache
├── src/
│   ├── components/
│   │   ├── AnalysisDashboard/   # CompositionTab, MoodTab, ColorScienceTab, SynthesisTab, JudgePinsOverlay, FieldGuideCard
│   │   ├── DarkroomStudio/      # DarkroomStudio, HistogramWidget, UpscaleModal
│   │   ├── GenerationStage/     # MasterworkViewer, RetryStudio, ExportModal
│   │   ├── AboutModal.tsx       # About AuraLens Pro modal dialog
│   │   ├── ApiKeyModal.tsx      # Google AI Studio key & model selector
│   │   ├── Header.tsx           # Navigation bar & studio switcher
│   │   ├── ImageUploader.tsx    # Drag-and-drop zone & sample photos
│   │   ├── PhaseStepper.tsx     # 5-phase navigation ribbon
│   │   └── RateLimitHUD.tsx     # Real-time RPM/TPM quota tracker
│   ├── services/
│   │   ├── cacheService.ts      # IndexedDB image hash caching & session persistence
│   │   ├── geminiService.ts     # Gemini 3.6/3.7 Vision & image editing pipeline
│   │   ├── imageProcessor.ts    # Halation, S-curves, Multi-Engine 4K Upscaler, .XMP & .CUBE
│   │   ├── rateLimitManager.ts  # 60s sliding-window rate limiter & zero-quota detector
│   │   ├── recipeGenerator.ts   # Dynamic AI-tailored grading recipe generator
│   │   └── sampleImages.ts      # Curated 1-click amateur test shots
│   ├── types/
│   │   └── photography.ts       # Comprehensive TypeScript interfaces
│   ├── App.tsx                  # Main application shell & mobile navigation
│   └── main.tsx                 # React DOM mount point
├── docs/
│   ├── ARCHITECTURE.md          # Multi-phase reasoning and rate limiter specs
│   ├── COLOR_SCIENCE_PIPELINE.md# Splines, halation, grain, 4K upscaler and .CUBE algorithm
│   └── DEPLOYMENT_GUIDE.md      # Vercel, Netlify, and Cloudflare Pages setup
├── vercel.json                  # Vercel SPA routing & PWA caching headers
├── package.json
└── vite.config.ts
```

---

## 🌐 Deployment

AuraLens Pro is ready for instant 1-click deployment on **Vercel**:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

For step-by-step instructions across Vercel, Netlify, and Cloudflare Pages, see [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

---

## 📄 License

MIT © 2026 AuraLens Pro Contributors.
