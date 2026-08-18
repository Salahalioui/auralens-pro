import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Share, PlusSquare, Sparkles, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState<boolean>(false);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [showIosInstructions, setShowIosInstructions] = useState<boolean>(false);
  const [installedSuccessfully, setInstalledSuccessfully] = useState<boolean>(false);

  useEffect(() => {
    // Check if already in standalone mode (already installed)
    const checkStandalone = () => {
      const isStandaloneMode = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true;
      setIsStandalone(isStandaloneMode);
    };
    checkStandalone();

    // Check dismissal cooldown (e.g. 3 days)
    const dismissedUntil = localStorage.getItem('auralens_pwa_dismissed');
    if (dismissedUntil && Date.now() < parseInt(dismissedUntil, 10)) {
      setIsDismissed(true);
    }

    // Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);
    if (isIosDevice && isSafari) {
      setIsIos(true);
    }

    // Capture standard PWA beforeinstallprompt on Chromium / Android / Desktop
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Capture appinstalled event
    const handleAppInstalled = () => {
      setInstalledSuccessfully(true);
      setDeferredPrompt(null);
      setTimeout(() => setIsStandalone(true), 3000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // Custom trigger from Header button
    const handleOpenPwaInstall = () => {
      setIsDismissed(false);
      if (isIosDevice) {
        setShowIosInstructions(true);
      }
    };
    window.addEventListener('open-pwa-install', handleOpenPwaInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('open-pwa-install', handleOpenPwaInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosInstructions(true);
      return;
    }

    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalledSuccessfully(true);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('PWA install error:', err);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    // Dismiss for 3 days
    localStorage.setItem('auralens_pwa_dismissed', (Date.now() + 3 * 24 * 60 * 60 * 1000).toString());
  };

  // Do not show if already installed or dismissed (unless user triggers manually)
  if (isStandalone || isDismissed || (!deferredPrompt && !isIos)) {
    return null;
  }

  return (
    <>
      {/* Floating Bottom PWA Install Banner */}
      <aside 
        aria-label="Install App"
        className="fixed bottom-18 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-slide-up"
      >
        <div className="bg-darkroom-900/95 backdrop-blur-xl border border-amber-500/40 p-4 rounded-2xl shadow-2xl shadow-black/80 flex items-start gap-3.5 relative">
          
          {/* Close button */}
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            title="Dismiss for now"
          >
            <X className="w-4 h-4" />
          </button>

          {/* App Icon */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 via-accent-gold to-cyan-500 p-0.5 shadow-lg shadow-amber-500/20 shrink-0 mt-0.5">
            <div className="w-full h-full bg-darkroom-950 rounded-[10px] flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-accent-gold" />
            </div>
          </div>

          {/* Text & Actions */}
          <div className="space-y-2 pr-6">
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-bold text-xs text-slate-100 font-cinzel">
                  Install AuraLens Pro
                </h4>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  PWA App
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Enjoy full-screen in-browser darkroom editing, 4K upscaling, and offline caching on your device.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-darkroom-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                {installedSuccessfully ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-darkroom-950" />
                    <span>Installed!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Install App</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDismiss}
                className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Not Now
              </button>
            </div>
          </div>

        </div>
      </aside>

      {/* iOS Safari "Add to Home Screen" Instructions Modal */}
      {showIosInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-darkroom-950 border border-slate-700 max-w-sm w-full p-5 rounded-2xl shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-accent-gold" />
                <h3 className="font-bold text-slate-100 text-sm font-cinzel">
                  Install on iOS Safari
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIosInstructions(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Install <strong>AuraLens Pro</strong> directly to your iPhone / iPad Home Screen in 2 quick steps:
            </p>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                  <Share className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 block">1. Tap the Share Button</span>
                  <span className="text-[11px] text-slate-400">Located at the bottom of Safari's toolbar.</span>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-accent-gold flex items-center justify-center shrink-0">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-200 block">2. Tap 'Add to Home Screen'</span>
                  <span className="text-[11px] text-slate-400">Scroll down the share sheet and tap Add.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosInstructions(false)}
              className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
