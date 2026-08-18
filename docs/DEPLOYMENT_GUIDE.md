# AuraLens Pro — Production Deployment Guide

AuraLens Pro is built as a static, client-side Progressive Web Application (PWA). It requires no backend server and can be deployed directly to Vercel, Netlify, Cloudflare Pages, or GitHub Pages.

---

## 1. Deploying to Vercel (Recommended)

### Option A: Via Vercel CLI
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Build and deploy
vercel
```

### Option B: Via GitHub & Vercel Dashboard
1. Push your repository to GitHub.
2. Open [vercel.com/new](https://vercel.com/new) and select your repository.
3. Keep default settings:
   * **Framework Preset**: `Vite`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Click **Deploy**.

> [!NOTE]
> The included `vercel.json` automatically configures SPA routing rewrites and optimal PWA service worker caching headers.

---

## 2. Deploying to Netlify

1. Create a `_redirects` file in `public/`:
   ```
   /*    /index.html   200
   ```
2. Build settings:
   * **Build command**: `npm run build`
   * **Publish directory**: `dist`

---

## 3. Deploying to Cloudflare Pages

1. Connect your GitHub repository in the Cloudflare Pages dashboard.
2. Build settings:
   * **Framework preset**: `Vite`
   * **Build command**: `npm run build`
   * **Build output directory**: `dist`

---

## 4. PWA Installation Verification

After deployment to any HTTPS domain:
1. Open the website on Google Chrome, Microsoft Edge, or Safari (iOS).
2. Look for the **"Install App"** icon in the address bar (Desktop) or choose **"Add to Home Screen"** (iOS/Android).
3. The app will launch in standalone window mode with offline shell caching enabled.

---

## 5. Environment & API Keys

AuraLens Pro is designed with **100% client-side privacy**:
* Users enter their own Google AI Studio API key in the app dialog.
* Keys are stored safely in the user's browser `localStorage` and never transmitted to any third-party intermediary servers.
