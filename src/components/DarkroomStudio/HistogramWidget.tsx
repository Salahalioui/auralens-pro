import React, { useEffect, useRef, useState } from 'react';
import { HistogramData } from '../../types/photography';
import { Activity, AlertOctagon } from 'lucide-react';

interface HistogramWidgetProps {
  data: HistogramData;
}

export const HistogramWidget: React.FC<HistogramWidgetProps> = ({ data }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [channel, setChannel] = useState<'all' | 'luma' | 'r' | 'g' | 'b'>('all');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Dark grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(width * 0.25, 0); ctx.lineTo(width * 0.25, height);
    ctx.moveTo(width * 0.5, 0); ctx.lineTo(width * 0.5, height);
    ctx.moveTo(width * 0.75, 0); ctx.lineTo(width * 0.75, height);
    ctx.stroke();

    // Find max frequency to normalize
    const maxVal = Math.max(
      ...data.luma,
      ...data.r,
      ...data.g,
      ...data.b,
      1
    );

    const drawCurve = (bins: number[], strokeStyle: string, fillStyle?: string) => {
      ctx.beginPath();
      ctx.moveTo(0, height);

      for (let i = 0; i < 256; i++) {
        const x = (i / 255) * width;
        const normalized = bins[i] / maxVal;
        const y = height - normalized * (height * 0.92);
        ctx.lineTo(x, y);
      }

      ctx.lineTo(width, height);
      ctx.closePath();

      if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
      }

      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    };

    if (channel === 'all') {
      ctx.globalCompositeOperation = 'screen';
      drawCurve(data.r, 'rgba(239, 68, 68, 0.85)', 'rgba(239, 68, 68, 0.15)');
      drawCurve(data.g, 'rgba(34, 197, 94, 0.85)', 'rgba(34, 197, 94, 0.15)');
      drawCurve(data.b, 'rgba(59, 130, 246, 0.85)', 'rgba(59, 130, 246, 0.15)');
      ctx.globalCompositeOperation = 'source-over';
    } else if (channel === 'luma') {
      drawCurve(data.luma, '#f59e0b', 'rgba(245, 158, 11, 0.2)');
    } else if (channel === 'r') {
      drawCurve(data.r, '#ef4444', 'rgba(239, 68, 68, 0.25)');
    } else if (channel === 'g') {
      drawCurve(data.g, '#22c55e', 'rgba(34, 197, 94, 0.25)');
    } else if (channel === 'b') {
      drawCurve(data.b, '#3b82f6', 'rgba(59, 130, 246, 0.25)');
    }
  }, [data, channel]);

  return (
    <div className="bg-darkroom-950/90 rounded-xl border border-slate-800 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
          <Activity className="w-3.5 h-3.5 text-accent-gold" />
          <span>RGB Scope & Histogram</span>
        </div>

        {/* Channel Switcher */}
        <div className="flex items-center gap-1 text-[10px] font-mono">
          <button
            type="button"
            onClick={() => setChannel('all')}
            className={`px-1.5 py-0.5 rounded ${channel === 'all' ? 'bg-slate-700 text-slate-100 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            RGB
          </button>
          <button
            type="button"
            onClick={() => setChannel('luma')}
            className={`px-1.5 py-0.5 rounded ${channel === 'luma' ? 'bg-amber-500/20 text-accent-gold font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Luma
          </button>
          <button
            type="button"
            onClick={() => setChannel('r')}
            className={`px-1.5 py-0.5 rounded ${channel === 'r' ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            R
          </button>
          <button
            type="button"
            onClick={() => setChannel('g')}
            className={`px-1.5 py-0.5 rounded ${channel === 'g' ? 'bg-emerald-500/20 text-emerald-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            G
          </button>
          <button
            type="button"
            onClick={() => setChannel('b')}
            className={`px-1.5 py-0.5 rounded ${channel === 'b' ? 'bg-blue-500/20 text-blue-400 font-bold' : 'text-slate-500 hover:text-slate-300'}`}
          >
            B
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80">
        <canvas
          ref={canvasRef}
          width={280}
          height={80}
          className="w-full h-20 block"
        />

        {/* Dynamic Clipping Warnings */}
        <div className="absolute top-1 left-1.5 right-1.5 flex justify-between text-[9px] font-mono pointer-events-none">
          <span className={`${data.clippedShadowsPercent > 2 ? 'text-rose-400 font-bold bg-rose-950/80 px-1 rounded' : 'text-slate-600'}`}>
            Shadows: {data.clippedShadowsPercent}%
          </span>
          <span className={`${data.clippedHighlightsPercent > 2 ? 'text-rose-400 font-bold bg-rose-950/80 px-1 rounded' : 'text-slate-600'}`}>
            Highlights: {data.clippedHighlightsPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
