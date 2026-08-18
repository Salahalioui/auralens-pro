# 📷 AuraLens Pro

<div align="center">

[![React 19](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6.4-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com)
[![Google Gemini](https://img.shields.io/badge/Google%20Gemini-3.6%20%2F%203.7-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-purple?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg?style=for-the-badge)](LICENSE)

**Turn amateur, unpolished photographs into award-winning gallery masterworks using multi-phase Google Gemini vision reasoning, Nano Banana image editing, and an in-browser photochemical color grading studio.**

[Live Demo](#-deployment) • [Architecture Docs](docs/ARCHITECTURE.md) • [Color Science](docs/COLOR_SCIENCE_PIPELINE.md) • [Deployment Guide](docs/DEPLOYMENT_GUIDE.md)

</div>

---

## 🌟 Key Features

* 🧠 **5-Phase Multimodal Reasoning Engine**:
  * **Phase 1 (Composition)**: Rule-of-thirds power intersections, golden ratio framing, horizon tilt angle detection, and normalized crop bounding boxes.
  * **Phase 2 (Mood & Storytelling)**: Auto-genre classification, ambient lighting critique, and emotional resonance.
  * **Phase 3 (Color Science)**: Dynamic range profiling, Kelvin temperature balance ($3200\text{K}-7500\text{K}$), 4-tone palette extraction, and 12-parameter grading matrix.
  * **Phase 4 (Master Synthesis)**: Executive scoring radar ($0-100$), subject identity lock, and 5-part transformation prompt.
  * **Phase 5 (Dual Execution)**: Nano Banana 2 generative rendering or the instant In-Browser Darkroom.
* 🎨 **Pro In-Browser Computational Darkroom (100% Free & Zero Quota)**:
  * **6 Dynamic AI-Tailored Recipes**: Unique grading archetypes synthesized on-the-fly for each photograph.
  * **Photochemical Halation & Specular Bloom**: Analog red/orange edge scattering (CineStill 800T emulation).
  * **Parametric S-Curve Tone Mapping**: Monotonic cubic Hermite spline highlight roll-off preventing digital clipping.
  * **Luminance-Adaptive Film Grain**: Midtone-weighted silver halide particle synthesis.
  * **3-Way Split Toning Wheels**: Dedicated Shadows (Lift) and Highlights (Gain) color injection.
* 🎬 **Industry-Standard `.CUBE` 3D LUT Export**:
  * Export $33 \times 33 \times 33$ 3D LUT files ready to load into **DaVinci Resolve, Adobe Premiere Pro, Final Cut Pro, or Photoshop**.
* 📊 **Real-Time RGB & Luma Histogram Scope**:
  * Live 256-bucket wave scope with real-time shadow crushing and highlight clipping warning indicators.
* 🛡️ **Zero UI Freezing & Rate Limit HUD**:
  * Real-time sliding 60-second RPM/TPM gauge with automatic zero-quota detection and fallback routing.
* 📱 **PWA & Mobile-First Design**:
  * Responsive touch-first UI with mobile bottom navigation bar and offline service worker caching.
* 🔒 **100% Client-Side Privacy**:
  * API keys and uploaded photographs are stored exclusively in your browser's encrypted `localStorage` and IndexedDB cache.

---

## 🏗️ Architecture & Pipeline

```
[Raw Photo] ──► [Phase 1: Composition] ──► [Phase 2: Mood & Intent] ──► [Phase 3: Color Science] ──► [Phase 4: Synthesis] ──► [Phase 5: Output]
                       │                           │                           │                           │                         │
                       ▼                           ▼                           ▼                           ▼                         ▼
                 Crop Bounds                 Genre & Mood                Kelvin, Tone &              Identity Lock &           Nano Banana /
                 Rule of 3rds               Lighting Critique            Grading Matrix              Master Prompt             Pro Darkroom
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
git clone https://github.com/your-username/auralens-pro.git
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
│   │   ├── AnalysisDashboard/   # CompositionTab, MoodTab, ColorScienceTab, SynthesisTab
│   │   ├── DarkroomStudio/      # DarkroomStudio, HistogramWidget
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
│   │   ├── imageProcessor.ts    # Halation, S-curves, .CUBE 3D LUT exporter, histogram
│   │   ├── rateLimitManager.ts  # 60s sliding-window rate limiter & zero-quota detector
│   │   ├── recipeGenerator.ts   # Dynamic AI-tailored grading recipe generator
│   │   └── sampleImages.ts      # Curated 1-click amateur test shots
│   ├── types/
│   │   └── photography.ts       # Comprehensive TypeScript interfaces
│   ├── App.tsx                  # Main application shell & mobile navigation
│   └── main.tsx                 # React DOM mount point
├── docs/
│   ├── ARCHITECTURE.md          # Multi-phase reasoning and rate limiter specs
│   ├── COLOR_SCIENCE_PIPELINE.md# Splines, halation, grain, and .CUBE algorithm
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
