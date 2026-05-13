/**
 * Persisted global settings — BPM, master volume, pickup, etc. — saved in
 * localStorage so they survive page reloads. Decoupled from per-chain state
 * which lives in App slots.
 */
import type { PickupId } from '../audio/pickups';

export interface PersistedSettings {
  bpm: number;
  masterDb: number;
  inputDb: number;
  pickupId: PickupId;
  showTuner: boolean;
  showLooper: boolean;
  showFretboard: boolean;
  /** Last active tab — 'lab' or 'classroom'. */
  tab: 'lab' | 'classroom';
}

const STORAGE_KEY = 'musicprof.settings.v1';

export const DEFAULT_SETTINGS: PersistedSettings = {
  bpm: 120,
  masterDb: -6,
  inputDb: 0,
  pickupId: 'strat-bridge',
  showTuner: false,
  showLooper: false,
  showFretboard: false,
  tab: 'lab',
};

export function loadSettings(): PersistedSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return DEFAULT_SETTINGS;
    const o = parsed as Record<string, unknown>;
    // Validate each field; fall back to default per field rather than nuking.
    return {
      bpm:
        typeof o.bpm === 'number' && o.bpm >= 30 && o.bpm <= 300
          ? o.bpm
          : DEFAULT_SETTINGS.bpm,
      masterDb:
        typeof o.masterDb === 'number' && o.masterDb >= -60 && o.masterDb <= 12
          ? o.masterDb
          : DEFAULT_SETTINGS.masterDb,
      inputDb:
        typeof o.inputDb === 'number' && o.inputDb >= -24 && o.inputDb <= 36
          ? o.inputDb
          : DEFAULT_SETTINGS.inputDb,
      pickupId:
        typeof o.pickupId === 'string'
          ? (o.pickupId as PickupId)
          : DEFAULT_SETTINGS.pickupId,
      showTuner:
        typeof o.showTuner === 'boolean'
          ? o.showTuner
          : DEFAULT_SETTINGS.showTuner,
      showLooper:
        typeof o.showLooper === 'boolean'
          ? o.showLooper
          : DEFAULT_SETTINGS.showLooper,
      showFretboard:
        typeof o.showFretboard === 'boolean'
          ? o.showFretboard
          : DEFAULT_SETTINGS.showFretboard,
      tab: o.tab === 'classroom' ? 'classroom' : 'lab',
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: PersistedSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('Failed to persist settings:', e);
  }
}
