import { RateLimitState } from '../types/photography';

class RateLimitManager {
  private requestTimestamps: number[] = [];
  private tokenCounts: { timestamp: number; tokens: number }[] = [];
  private dailyRequestCount: number = 0;
  private lastDayReset: number = Date.now();
  private subscribers: ((state: RateLimitState) => void)[] = [];

  public rpmLimit = 15;
  public tpmLimit = 1000000;
  public rpdLimit = 1500;
  public tier: RateLimitState['tier'] = 'Free Tier (15 RPM)';

  constructor() {
    this.loadFromStorage();
    // Clean up timestamps every 1 second and notify subscribers
    if (typeof window !== 'undefined') {
      window.setInterval(() => {
        this.cleanOldTimestamps();
        this.notify();
      }, 1000);
    }
  }

  private loadFromStorage() {
    try {
      const savedDaily = localStorage.getItem('auralens_rpd_count');
      const savedDate = localStorage.getItem('auralens_rpd_date');
      const today = new Date().toDateString();

      if (savedDate === today && savedDaily) {
        this.dailyRequestCount = parseInt(savedDaily, 10) || 0;
      } else {
        this.dailyRequestCount = 0;
        localStorage.setItem('auralens_rpd_date', today);
        localStorage.setItem('auralens_rpd_count', '0');
      }
    } catch {
      this.dailyRequestCount = 0;
    }
  }

  private saveToStorage() {
    try {
      const today = new Date().toDateString();
      localStorage.setItem('auralens_rpd_date', today);
      localStorage.setItem('auralens_rpd_count', this.dailyRequestCount.toString());
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  public setTier(tier: RateLimitState['tier']) {
    this.tier = tier;
    if (tier === 'Tier 1 / Pay-As-You-Go') {
      this.rpmLimit = 120;
      this.tpmLimit = 4000000;
      this.rpdLimit = 100000;
    } else {
      this.rpmLimit = 15;
      this.tpmLimit = 1000000;
      this.rpdLimit = 1500;
    }
    this.notify();
  }

  private cleanOldTimestamps() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    this.tokenCounts = this.tokenCounts.filter(t => t.timestamp > oneMinuteAgo);

    // Check if day rolled over
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('auralens_rpd_date');
    if (storedDate && storedDate !== today) {
      this.dailyRequestCount = 0;
      this.saveToStorage();
    }
  }

  public getState(): RateLimitState {
    this.cleanOldTimestamps();
    const now = Date.now();
    const oldestTimestamp = this.requestTimestamps[0] || now;
    const nextResetSeconds = this.requestTimestamps.length >= this.rpmLimit 
      ? Math.max(1, Math.ceil((oldestTimestamp + 60000 - now) / 1000))
      : 0;

    const estimatedTpm = this.tokenCounts.reduce((acc, curr) => acc + curr.tokens, 0);

    return {
      requestsInLastMinute: this.requestTimestamps.length,
      rpmLimit: this.rpmLimit,
      estimatedTpm,
      tpmLimit: this.tpmLimit,
      dailyRequests: this.dailyRequestCount,
      rpdLimit: this.rpdLimit,
      nextResetSeconds,
      tier: this.tier,
    };
  }

  public subscribe(callback: (state: RateLimitState) => void): () => void {
    this.subscribers.push(callback);
    callback(this.getState());
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notify() {
    const state = this.getState();
    this.subscribers.forEach(cb => cb(state));
  }

  /**
   * Waits for a rate limit slot before executing, preventing 429 errors.
   */
  public async waitForSlot(estimatedTokens = 1500): Promise<void> {
    while (true) {
      this.cleanOldTimestamps();
      const state = this.getState();
      
      if (state.requestsInLastMinute < this.rpmLimit) {
        // Slot is available!
        const now = Date.now();
        this.requestTimestamps.push(now);
        this.tokenCounts.push({ timestamp: now, tokens: estimatedTokens });
        this.dailyRequestCount++;
        this.saveToStorage();
        this.notify();
        return;
      }

      // Wait until the oldest request falls out of the 60s window
      const waitMs = Math.max(1000, state.nextResetSeconds * 1000);
      console.warn(`[RateLimit] Approaching ${this.rpmLimit} RPM. Throttling for ${waitMs}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitMs));
    }
  }

  /**
   * Exponential backoff retry wrapper
   */
  public async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 2,
    baseDelayMs = 1200
  ): Promise<T> {
    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await this.waitForSlot();
        return await fn();
      } catch (err: any) {
        // If quota limit is 0 on Google project, retrying will never work - throw immediately
        const isPermanentZeroQuota = 
          err?.message?.includes('limit: 0') || 
          err?.message?.includes('check your plan and billing details') ||
          err?.message?.includes('limit: 0, model:');

        if (isPermanentZeroQuota) {
          throw err;
        }

        attempt++;
        const isRateLimit = err?.status === 429 || 
          err?.message?.includes('429') || 
          err?.message?.includes('RESOURCE_EXHAUSTED') ||
          err?.message?.includes('quota');

        if (isRateLimit && attempt < maxRetries) {
          const delay = baseDelayMs * Math.pow(1.8, attempt) + Math.random() * 500;
          console.warn(`[RateLimit 429] Retrying attempt ${attempt}/${maxRetries} after ${Math.round(delay)}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          throw err;
        }
      }
    }
    throw new Error(`Execution failed after ${maxRetries} attempts.`);
  }
}

export const rateLimitManager = new RateLimitManager();
