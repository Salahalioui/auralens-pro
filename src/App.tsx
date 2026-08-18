import React, { useState } from 'react';
import { Header } from './components/Header';
import { RateLimitHUD } from './components/RateLimitHUD';
import { ApiKeyModal } from './components/ApiKeyModal';
import { ImageUploader } from './components/ImageUploader';
import { PhaseStepper } from './components/PhaseStepper';
import { ExecutiveScorecard } from './components/AnalysisDashboard/ExecutiveScorecard';
import { CompositionTab } from './components/AnalysisDashboard/CompositionTab';
import { MoodTab } from './components/AnalysisDashboard/MoodTab';
import { ColorScienceTab } from './components/AnalysisDashboard/ColorScienceTab';
import { SynthesisTab } from './components/AnalysisDashboard/SynthesisTab';
import { DarkroomStudio } from './components/DarkroomStudio/DarkroomStudio';
import { MasterworkViewer } from './components/GenerationStage/MasterworkViewer';
import { RetryStudio } from './components/GenerationStage/RetryStudio';
import { ExportModal } from './components/GenerationStage/ExportModal';
import { AboutModal } from './components/AboutModal';

import { 
  FullAnalysisResult, 
  AnalysisStage, 
  GeneratedMasterwork 
} from './types/photography';
import { geminiService } from './services/geminiService';
import { PreprocessedImageResult } from './services/imageProcessor';
import { 
  updateCachedMasterwork, 
  getActiveSession, 
  saveActiveSession, 
  clearActiveSession 
} from './services/cacheService';
import { Sparkles, ArrowRight, RotateCcw, AlertTriangle, Sliders, Zap } from 'lucide-react';

export const App: React.FC = () => {
  const [analysisResult, setAnalysisResult] = useState<FullAnalysisResult | null>(null);
  const [analysisStage, setAnalysisStage] = useState<AnalysisStage>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState<number>(0);
  const [activeView, setActiveView] = useState<'analysis' | 'darkroom' | 'masterwork'>('analysis');

  // Modals
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState<boolean>(false);
  const [isRetryModalOpen, setIsRetryModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Restore previous analysis session upon page refresh
  React.useEffect(() => {
    async function restoreSession() {
      try {
        const saved = await getActiveSession();
        if (saved && saved.phase4) {
          setAnalysisResult(saved);
          setAnalysisStage('completed');
          if (saved.generatedMasterwork) {
            setActiveTab(4);
          }
        }
      } catch (err) {
        console.warn('Failed to restore previous session:', err);
      }
    }
    restoreSession();
  }, []);

  const handleImageReady = async (data: PreprocessedImageResult) => {
    setErrorMsg(null);
    setAnalysisStage('phase1_composition');
    setStatusMessage('Initiating Gemini Vision reasoning...');

    try {
      const result = await geminiService.analyzePhoto(
        data.base64Raw,
        data.mimeType,
        data.metadata,
        (msg) => setStatusMessage(msg)
      );

      setAnalysisResult(result);
      await saveActiveSession(result);
      setAnalysisStage('completed');
      setStatusMessage('');
      setActiveTab(0);
      setActiveView('analysis');
    } catch (err: any) {
      console.error('Analysis error:', err);
      setAnalysisStage('error');
      setErrorMsg(err?.message || 'Failed to complete analysis. Please verify your API Key.');
    }
  };

  const handleGenerateMasterwork = async (prompt: string, aspectRatio = '16:9') => {
    if (!analysisResult) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setStatusMessage('Generating masterwork...');

    try {
      const masterwork: GeneratedMasterwork = await geminiService.generateMasterwork(
        analysisResult.originalImageBase64,
        analysisResult.originalImageMime,
        prompt,
        aspectRatio
      );

      const updated = {
        ...analysisResult,
        generatedMasterwork: masterwork
      };

      setAnalysisResult(updated);
      await updateCachedMasterwork(analysisResult.imageHash, masterwork);
      await saveActiveSession(updated);
      
      setActiveView('masterwork');
      setActiveTab(4);
    } catch (err: any) {
      setErrorMsg(
        err?.message || 'Generation failed. You can switch to the Instant Pro Darkroom Studio to apply the grade losslessly!'
      );
    } finally {
      setIsGenerating(false);
      setStatusMessage('');
    }
  };

  const handleReset = async () => {
    setAnalysisResult(null);
    setAnalysisStage('idle');
    setActiveView('analysis');
    setErrorMsg(null);
    await clearActiveSession();
  };

  return (
    <div className="min-h-screen bg-darkroom-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-accent-gold">
      
      {/* Navigation Header */}
      <Header
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
        onOpenAboutModal={() => setIsAboutModalOpen(true)}
        onOpenDarkroom={() => setActiveView('darkroom')}
        activeView={activeView}
        setActiveView={setActiveView}
        hasResult={!!analysisResult}
      />

      {/* Rate Limit HUD (Real-time quota tracker) */}
      <RateLimitHUD />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Error Banner */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-sm block">Action Required</span>
              <p className="leading-relaxed">{errorMsg}</p>
              {analysisResult && (
                <button
                  onClick={() => setActiveView('darkroom')}
                  className="mt-2 text-xs font-semibold text-cyan-400 hover:text-cyan-300 underline"
                >
                  Switch to Instant Pro Darkroom Studio (No API Quota Required) →
                </button>
              )}
            </div>
          </div>
        )}

        {/* View 1: Upload / Welcome Screen */}
        {!analysisResult && (
          <div className="space-y-8 max-w-4xl mx-auto">
            
            {/* Hero Introduction */}
            <div className="text-center space-y-3 pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-accent-gold text-xs font-mono font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Multi-Phase Gemini 3.7 Reasoning & Nano Banana Vision Studio</span>
              </div>
              <h1 className="font-cinzel text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-100">
                Transform Amateur Shots into <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-amber-300 via-accent-gold to-cyan-400 bg-clip-text text-transparent">
                  Award-Winning Masterworks
                </span>
              </h1>
              <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Upload your raw or unpolished photography. Gemini will execute deep reasoning across framing geometry, narrative intent, and color science before generating an award-caliber masterwork.
              </p>
            </div>

            {/* Upload Dropzone & Sample Photo Picker */}
            <ImageUploader
              onImageReady={handleImageReady}
              isAnalyzing={analysisStage !== 'idle' && analysisStage !== 'error'}
            />

          </div>
        )}

        {/* View 2: Analysis & Transformation Studio */}
        {analysisResult && (
          <div className="space-y-6">
            
            {/* Top Toolbar: Reset & Photo Name */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-darkroom-900/60 p-3 rounded-2xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2 font-mono text-slate-300">
                <span className="text-slate-500">File:</span>
                <span className="font-semibold text-slate-100">{analysisResult.metadata?.fileName || 'Uploaded Photo'}</span>
                <span className="text-slate-600">•</span>
                <span className="text-accent-gold">{analysisResult.phase2?.detectedGenre || 'Photography'}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleReset}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1.5 font-semibold transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Upload Another Photo</span>
                </button>
              </div>
            </div>

            {/* Mode Switch: AI Analysis Dashboard */}
            {activeView === 'analysis' && (
              <div className="space-y-6">
                
                {/* Executive Scorecard Radar & Summary */}
                {analysisResult.phase4 && <ExecutiveScorecard synthesis={analysisResult.phase4} />}

                {/* 5-Phase Navigation Stepper Ribbon */}
                <PhaseStepper
                  currentStage={analysisStage}
                  activeTab={activeTab}
                  onSelectTab={(idx) => {
                    setActiveTab(idx);
                    if (idx === 4 && analysisResult.generatedMasterwork) {
                      setActiveView('masterwork');
                    }
                  }}
                  statusMessage={statusMessage}
                />

                {/* Tabbed Phase Content */}
                <div className="transition-all duration-300">
                  {activeTab === 0 && analysisResult.phase1 && (
                    <CompositionTab
                      composition={analysisResult.phase1}
                      imageBase64={analysisResult.originalImageBase64}
                      imageMime={analysisResult.originalImageMime}
                    />
                  )}

                  {activeTab === 1 && analysisResult.phase2 && (
                    <MoodTab mood={analysisResult.phase2} />
                  )}

                  {activeTab === 2 && analysisResult.phase3 && (
                    <ColorScienceTab
                      colorScience={analysisResult.phase3}
                      onOpenDarkroom={() => setActiveView('darkroom')}
                    />
                  )}

                  {activeTab === 3 && analysisResult.phase4 && (
                    <SynthesisTab
                      synthesis={analysisResult.phase4}
                      onGenerateMasterwork={handleGenerateMasterwork}
                      onOpenDarkroom={() => setActiveView('darkroom')}
                      isGenerating={isGenerating}
                    />
                  )}

                  {activeTab === 4 && (
                    analysisResult.generatedMasterwork ? (
                      <MasterworkViewer
                        originalBase64={analysisResult.originalImageBase64}
                        originalMime={analysisResult.originalImageMime}
                        masterwork={analysisResult.generatedMasterwork}
                        onOpenRetry={() => setIsRetryModalOpen(true)}
                        onOpenExport={() => setIsExportModalOpen(true)}
                      />
                    ) : (
                      <div className="darkroom-card p-12 text-center border border-slate-800 space-y-4">
                        <Sparkles className="w-12 h-12 text-accent-gold mx-auto animate-pulse" />
                        <h4 className="font-cinzel text-lg font-bold text-slate-100">
                          Nano Banana Masterwork Not Yet Rendered
                        </h4>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Click below to execute the Phase 4 synthesis prompt with Nano Banana 2 or open the instant Pro Darkroom.
                        </p>
                        <div className="flex justify-center gap-3 pt-2">
                          <button
                            onClick={() => setActiveTab(3)}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-darkroom-950 font-bold text-xs"
                          >
                            Go to Phase 4 Synthesis & Generate
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>

              </div>
            )}

            {/* Mode Switch: Pro In-Browser Darkroom Studio */}
            {activeView === 'darkroom' && analysisResult.phase3 && (
              <DarkroomStudio
                imageBase64={analysisResult.originalImageBase64}
                imageMime={analysisResult.originalImageMime}
                initialGrading={analysisResult.phase3.numericalGrading}
                suggestedCrop={analysisResult.phase1?.suggestedCrop}
                analysis={analysisResult}
                onBackToAnalysis={() => setActiveView('analysis')}
              />
            )}

            {/* Mode Switch: Nano Banana Masterwork Comparison */}
            {activeView === 'masterwork' && analysisResult.generatedMasterwork && (
              <MasterworkViewer
                originalBase64={analysisResult.originalImageBase64}
                originalMime={analysisResult.originalImageMime}
                masterwork={analysisResult.generatedMasterwork}
                onOpenRetry={() => setIsRetryModalOpen(true)}
                onOpenExport={() => setIsExportModalOpen(true)}
              />
            )}

          </div>
        )}

      </main>

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onKeyUpdated={() => {
          // Trigger re-check
        }}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={() => setIsAboutModalOpen(false)}
      />

      {/* Retry Modal */}
      {analysisResult && (
        <RetryStudio
          isOpen={isRetryModalOpen}
          onClose={() => setIsRetryModalOpen(false)}
          initialPrompt={analysisResult.phase4?.masterPrompt || ''}
          initialAspectRatio={analysisResult.phase4?.recommendedAspectRatio || '16:9'}
          onRetry={handleGenerateMasterwork}
          isGenerating={isGenerating}
        />
      )}

      {/* Export Report Modal */}
      {analysisResult && (
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          analysis={analysisResult}
        />
      )}

      {/* Mobile Sticky Bottom Navigation (Screens < md) */}
      {analysisResult && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-darkroom-950/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-2 flex items-center justify-around shadow-2xl safe-area-pb">
          <button
            type="button"
            onClick={() => setActiveView('analysis')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              activeView === 'analysis' ? 'text-accent-gold font-bold' : 'text-slate-400'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Critique</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('darkroom')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              activeView === 'darkroom' ? 'text-cyan-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Darkroom</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (analysisResult.generatedMasterwork) {
                setActiveView('masterwork');
              } else {
                setActiveTab(3);
                setActiveView('analysis');
              }
            }}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all cursor-pointer ${
              activeView === 'masterwork' ? 'text-amber-300 font-bold' : 'text-slate-400'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Masterwork</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl text-[10px] text-slate-400 hover:text-rose-400 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>New Photo</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 mb-16 md:mb-0 text-center text-xs text-slate-500 font-mono">
        <p>
          AuraLens Pro • Built with Google Gemini Vision & Nano Banana Computational Photography Architecture
        </p>
      </footer>

    </div>
  );
};
