/**
 * Persisted user presets — saved in browser localStorage so they survive
 * page reloads. Decoupled from the built-in presets in presets.ts (which
 * ship with the app).
 */
import type { PresetBlock } from './presets';

export interface UserPreset {
  id: string;
  name: string;
  /** ISO timestamp string */
  createdAt: string;
  blocks: PresetBlock[];
}

const STORAGE_KEY = 'musicprof.userPresets.v1';

function load(): UserPreset[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidPreset);
  } catch {
    return [];
  }
}

function save(list: UserPreset[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to save user presets:', e);
  }
}

function isValidPreset(x: unknown): x is UserPreset {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.name === 'string' &&
    typeof p.createdAt === 'string' &&
    Array.isArray(p.blocks)
  );
}

export const userPresets = {
  list(): UserPreset[] {
    return load();
  },

  add(name: string, blocks: PresetBlock[]): UserPreset {
    const list = load();
    const preset: UserPreset = {
      id: `up_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Untitled',
      createdAt: new Date().toISOString(),
      // Deep copy — caller's mutations shouldn't affect storage
      blocks: blocks.map((b) => ({
        defId: b.defId,
        bypass: b.bypass,
        paramValues: { ...b.paramValues },
      })),
    };
    list.unshift(preset);
    save(list);
    return preset;
  },

  remove(id: string): void {
    const list = load().filter((p) => p.id !== id);
    save(list);
  },

  rename(id: string, name: string): void {
    const list = load();
    const p = list.find((x) => x.id === id);
    if (p) {
      p.name = name.trim() || p.name;
      save(list);
    }
  },
};
