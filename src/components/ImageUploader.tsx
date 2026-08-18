import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, RefreshCw, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';
import { preprocessImage, preprocessImageUrl, PreprocessedImageResult } from '../services/imageProcessor';
import { SAMPLE_PHOTOS, SamplePhoto } from '../services/sampleImages';

interface ImageUploaderProps {
  onImageReady: (data: PreprocessedImageResult) => void;
  isAnalyzing: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageReady,
  isAnalyzing
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const [preprocessed, setPreprocessed] = useState<PreprocessedImageResult | null>(null);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    setError(null);
    try {
      const result = await preprocessImage(file);
      setPreprocessed(result);
      setSelectedPreview(result.dataUrl);
    } catch (err: any) {
      setError(err?.message || 'Failed to process image');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSampleClick = async (sample: SamplePhoto) => {
    setError(null);
    setLoadingSample(sample.id);
    try {
      const result = await preprocessImageUrl(sample.url, `${sample.id}.jpg`);
      setPreprocessed(result);
      setSelectedPreview(result.dataUrl);
    } catch (err: any) {
      setError('Could not fetch sample image. Check internet connection.');
    } finally {
      setLoadingSample(null);
    }
  };

  const handleStartAnalysis = () => {
    if (preprocessed) {
      onImageReady(preprocessed);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Upload Dropzone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative darkroom-card p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 border-2 border-dashed ${
          dragOver 
            ? 'border-accent-gold bg-amber-500/10 scale-[1.01]' 
            : selectedPreview 
              ? 'border-emerald-500/50 bg-slate-900/60' 
              : 'border-slate-700/80 hover:border-accent-gold/60 hover:bg-slate-900/40'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {selectedPreview && preprocessed ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative max-w-md max-h-72 rounded-xl overflow-hidden shadow-2xl border border-slate-700">
              <img
                src={selectedPreview}
                alt="Selected preview"
                className="w-full h-full object-cover max-h-72"
              />
              <div className="absolute top-2 right-2 bg-darkroom-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Ready for Vision Reasoning</span>
              </div>
            </div>

            {/* Metadata Summary Pill */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-300 font-mono bg-slate-950/70 px-4 py-2 rounded-xl border border-slate-800">
              <span>{preprocessed.metadata.width} × {preprocessed.metadata.height}px</span>
              <span className="text-slate-600">•</span>
              <span>Ratio: {preprocessed.metadata.aspectRatio}</span>
              <span className="text-slate-600">•</span>
              <span>{(preprocessed.metadata.fileSize / 1024).toFixed(0)} KB</span>
            </div>

            <p className="text-xs text-slate-400">
              Click or drag another image to replace
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-accent-gold/10 to-cyan-500/20 border border-amber-500/30 flex items-center justify-center text-accent-gold shadow-lg shadow-amber-500/10">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-100">
                Drop your raw or amateur shot here
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Upload portraits, street scenes, landscape or night photos. Supports JPEG, PNG, WebP up to 25MB.
              </p>
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 text-xs font-semibold text-slate-300 border border-slate-700">
              <ImageIcon className="w-3.5 h-3.5 text-accent-gold" />
              <span>Browse Photos from Device</span>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Action Button */}
      {preprocessed && (
        <div className="flex justify-center">
          <button
            onClick={handleStartAnalysis}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-accent-gold to-amber-600 hover:from-amber-400 hover:to-amber-500 text-darkroom-950 font-bold text-sm tracking-wide shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2.5 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Critiquing & Analyzing Multi-Phase Reasoning...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-darkroom-950" />
                <span>Begin Multi-Phase Gemini Photography Analysis</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Sample Photos Gallery */}
      <div className="pt-4 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-accent-gold" />
            Or Try A Curated Amateur Shot
          </h4>
          <span className="text-[11px] text-slate-500 hidden sm:block">Click to test instant reasoning</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SAMPLE_PHOTOS.map((sample) => (
            <div
              key={sample.id}
              onClick={() => handleSampleClick(sample)}
              className={`group relative rounded-xl overflow-hidden cursor-pointer border transition-all ${
                selectedPreview === sample.url
                  ? 'border-accent-gold ring-2 ring-accent-gold/40'
                  : 'border-slate-800 hover:border-slate-600 bg-slate-900/60'
              }`}
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-slate-950">
                <img
                  src={sample.thumbnail}
                  alt={sample.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-2.5 bg-darkroom-900/90">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-accent-gold tracking-wider">
                    {sample.category}
                  </span>
                  {loadingSample === sample.id && (
                    <RefreshCw className="w-3 h-3 text-accent-gold animate-spin" />
                  )}
                </div>
                <h5 className="text-xs font-semibold text-slate-200 truncate mt-0.5">
                  {sample.title}
                </h5>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-tight">
                  {sample.amateurIssue}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
