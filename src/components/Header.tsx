import React from 'react';
import { Camera, Key, Trash2, Zap, Sparkles, Sliders, Info, Smartphone } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { clearAnalysisCache } from '../services/cacheService';

interface HeaderProps {
  onOpenApiKeyModal: () => void;
  onOpenAboutModal: () => void;
  onOpenDarkroom?: () => void;
  activeView: 'analysis' | 'darkroom' | 'masterwork';
  setActiveView: (view: 'analysis' | 'darkroom' | 'masterwork') => void;
  hasResult: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenApiKeyModal,
  onOpenAboutModal,
  activeView,
  setActiveView,
  hasResult
}) => {
  const hasKey = geminiService.hasApiKey();

  const handleClearCache = async () => {
    await clearAnalysisCache();
    window.location.reload();
  };

  return (
    <header className="sticky top-0 z-40 bg-darkroom-950/85 backdrop-blur-xl border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Brand Logo & Name */}
        <div 
          className="flex items-center gap-2.5 cursor-pointer shrink-0" 
          onClick={() => setActiveView('analysis')}
        >
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-accent-gold to-cyan-500 p-0.5 shadow-lg shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-darkroom-950 rounded-[10px] flex items-center justify-center">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-accent-gold" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-cyan-400 rounded-full border-2 border-darkroom-950 flex items-center justify-center">
              <Sparkles className="w-1.5 h-1.5 text-darkroom-950" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-cinzel font-extrabold text-lg sm:text-xl tracking-wider bg-gradient-to-r from-amber-200 via-accent-gold to-amber-400 bg-clip-text text-transparent">
                AURALENS
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 text-accent-gold border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden md:block">
              AI Photography Reasoning & Masterwork Studio
            </p>
          </div>
        </div>

        {/* Studio View Navigation (Desktop & Tablet) */}
        {hasResult && (
          <div className="hidden md:flex items-center bg-darkroom-900 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => setActiveView('analysis')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'analysis'
                  ? 'bg-amber-500/20 text-accent-gold border border-amber-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Critique</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('darkroom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'darkroom'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Pro Darkroom (Free)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('masterwork')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeView === 'masterwork'
                  ? 'bg-gradient-to-r from-amber-500/30 to-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Masterwork</span>
            </button>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          
          {/* PWA Install Trigger */}
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem('auralens_pwa_dismissed');
              window.dispatchEvent(new CustomEvent('open-pwa-install'));
            }}
            title="Install AuraLens Pro App"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-accent-gold bg-slate-900/80 hover:bg-slate-800 border border-slate-800/80 transition-all cursor-pointer shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5 text-accent-gold" />
            <span className="hidden xl:inline">Install App</span>
          </button>

          {/* About Modal Trigger */}
          <button
            type="button"
            onClick={onOpenAboutModal}
            title="About AuraLens Pro Architecture"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 border border-slate-800/60 transition-all cursor-pointer"
          >
            <Info className="w-4 h-4 text-cyan-400" />
          </button>

          {/* API Key Status Pill */}
          <button
            type="button"
            onClick={onOpenApiKeyModal}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
              hasKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20 animate-pulse-slow'
            }`}
          >
            <Key className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden lg:inline">
              {hasKey ? 'Google AI Studio Key Active' : 'Connect API Key'}
            </span>
            <span className="lg:hidden">{hasKey ? 'Connected' : 'API Key'}</span>
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasKey ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </button>

          {/* Clear Cache */}
          <button
            type="button"
            onClick={handleClearCache}
            title="Clear photo cache & reset"
            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 border border-slate-800/60 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
