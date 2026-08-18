import { get, set, del, keys } from 'idb-keyval';
import { FullAnalysisResult } from '../types/photography';

const CACHE_PREFIX = 'auralens_analysis_';

/**
 * Computes a quick cryptographic or buffer hash of an image base64 data URL
 */
export async function computeImageHash(base64Data: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(base64Data.slice(0, 10000) + base64Data.length);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } catch {
    // Fallback hash
    let hash = 0;
    for (let i = 0; i < Math.min(base64Data.length, 5000); i++) {
      hash = ((hash << 5) - hash) + base64Data.charCodeAt(i);
      hash |= 0;
    }
    return `hash_${Math.abs(hash)}_${base64Data.length}`;
  }
}

export async function getCachedAnalysis(imageHash: string): Promise<FullAnalysisResult | null> {
  try {
    const cached = await get<FullAnalysisResult>(`${CACHE_PREFIX}${imageHash}`);
    if (
      cached && 
      cached.phase1 && 
      cached.phase2 && 
      cached.phase3 && 
      cached.phase4 && 
      typeof cached.phase4.masterPrompt === 'string'
    ) {
      return cached;
    }
    if (cached) {
      // Corrupt or outdated cache schema from earlier iteration, purge it
      console.warn('[Cache Purge] Purging outdated/incomplete cache entry:', imageHash);
      await del(`${CACHE_PREFIX}${imageHash}`);
    }
    return null;
  } catch (err) {
    console.warn('Cache lookup failed:', err);
    return null;
  }
}

export async function saveAnalysisToCache(result: FullAnalysisResult): Promise<void> {
  try {
    await set(`${CACHE_PREFIX}${result.imageHash}`, result);
  } catch (err) {
    console.warn('Cache save failed:', err);
  }
}

export async function updateCachedMasterwork(
  imageHash: string, 
  masterwork: FullAnalysisResult['generatedMasterwork']
): Promise<void> {
  try {
    const current = await getCachedAnalysis(imageHash);
    if (current && masterwork) {
      current.generatedMasterwork = masterwork;
      await saveAnalysisToCache(current);
    }
  } catch (err) {
    console.warn('Failed to update cached masterwork:', err);
  }
}

export async function clearAnalysisCache(): Promise<void> {
  try {
    const allKeys = await keys();
    for (const key of allKeys) {
      if (typeof key === 'string' && key.startsWith(CACHE_PREFIX)) {
        await del(key);
      }
    }
    await del('auralens_active_session');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auralens_active_session_hash');
    }
  } catch (err) {
    console.warn('Failed to clear cache:', err);
  }
}

/**
 * Persists the current active analysis session so it survives page reloads
 */
export async function saveActiveSession(result: FullAnalysisResult): Promise<void> {
  try {
    await set('auralens_active_session', result);
    if (typeof window !== 'undefined') {
      localStorage.setItem('auralens_active_session_hash', result.imageHash);
    }
  } catch (err) {
    console.warn('Failed to save active session:', err);
  }
}

/**
 * Retrieves the last active session upon app mount
 */
export async function getActiveSession(): Promise<FullAnalysisResult | null> {
  try {
    const active = await get<FullAnalysisResult>('auralens_active_session');
    if (
      active &&
      active.phase1 &&
      active.phase2 &&
      active.phase3 &&
      active.phase4 &&
      typeof active.phase4.masterPrompt === 'string'
    ) {
      return active;
    }
    return null;
  } catch (err) {
    console.warn('Failed to restore active session:', err);
    return null;
  }
}

/**
 * Clears active session on reset/new photo upload
 */
export async function clearActiveSession(): Promise<void> {
  try {
    await del('auralens_active_session');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auralens_active_session_hash');
    }
  } catch (err) {
    console.warn('Failed to clear active session:', err);
  }
}
