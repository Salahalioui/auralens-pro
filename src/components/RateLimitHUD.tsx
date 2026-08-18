import React, { useEffect, useState } from 'react';
import { Activity, Clock, ShieldAlert, Cpu, AlertTriangle } from 'lucide-react';
import { rateLimitManager } from '../services/rateLimitManager';
import { RateLimitState } from '../types/photography';

export const RateLimitHUD: React.FC = () => {
  const [rateState, setRateState] = useState<RateLimitState>(rateLimitManager.getState());

  useEffect(() => {
    const unsubscribe = rateLimitManager.subscribe((newState) => {
      setRateState(newState);
    });
    return () => unsubscribe();
  }, []);

  const rpmPercent = Math.min(100, Math.round((rateState.requestsInLastMinute / rateState.rpmLimit) * 100));
  const isNearLimit = rateState.requestsInLastMinute >= rateState.rpmLimit - 2;
  const isAtLimit = rateState.requestsInLastMinute >= rateState.rpmLimit;

  return (
    <div className="bg-darkroom-900/90 border-y border-slate-800/80 px-4 py-2 text-xs">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Tier & Status Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[11px]">
            <Activity className="w-3 h-3 text-accent-gold animate-pulse" />
            <span>AI Studio Tier:</span>
            <span className="font-semibold text-accent-gold">{rateState.tier}</span>
          </div>

          {isAtLimit && (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 animate-bounce">
              <ShieldAlert className="w-3 h-3" />
              <span>Throttling: auto-resume in {rateState.nextResetSeconds}s</span>
            </div>
          )}
        </div>

        {/* Live Gauges */}
        <div className="flex items-center flex-wrap gap-4 sm:gap-6 font-mono text-[11px] text-slate-400">
          
          {/* RPM (Requests Per Minute) */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3 text-cyan-400" />
              RPM:
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`font-semibold ${
                isAtLimit ? 'text-rose-400' : isNearLimit ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {rateState.requestsInLastMinute} / {rateState.rpmLimit}
              </span>
              <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    isAtLimit ? 'bg-rose-500' : isNearLimit ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                  style={{ width: `${rpmPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Daily Quota (RPD) */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">Daily Calls:</span>
            <span className="text-slate-200 font-medium">
              {rateState.dailyRequests} <span className="text-slate-500">/ {rateState.rpdLimit} RPD</span>
            </span>
          </div>

          {/* TPM (Tokens Per Minute Estimate) */}
          <div className="hidden lg:flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span>Tokens (60s):</span>
            <span className="text-slate-200 font-medium">
              ~{rateState.estimatedTpm.toLocaleString()} <span className="text-slate-500">/ 1M TPM</span>
            </span>
          </div>

        </div>

      </div>
    </div>
  );
};
