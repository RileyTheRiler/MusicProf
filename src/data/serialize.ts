/**
 * Chain serialization. JSON for sharing; "recipe" text for taking to a
 * physical Headrush Prime to recreate the tone by hand.
 */
import { effectDefinitions, categoryLabels } from '../audio/effects';
import { PICKUPS, type PickupId } from '../audio/pickups';
import type { PresetBlock } from './presets';

const SCHEMA_VERSION = 1;

export interface ExportPayload {
  schema: number;
  name: string;
  blocks: PresetBlock[];
  /** Optional bundled global settings. */
  pickupId?: PickupId;
  bpm?: number;
  /** ISO timestamp */
  exportedAt: string;
}

export function chainToJson(name: string, chain: PresetBlock[], extras?: { pickupId?: PickupId; bpm?: number }): string {
  const payload: ExportPayload = {
    schema: SCHEMA_VERSION,
    name: name.trim() || 'Untitled',
    blocks: chain.map((b) => ({
      defId: b.defId,
      bypass: b.bypass,
      paramValues: { ...b.paramValues },
    })),
    pickupId: extras?.pickupId,
    bpm: extras?.bpm,
    exportedAt: new Date().toISOString(),
  };
  return JSON.stringify(payload, null, 2);
}

export interface ParseResult {
  ok: true;
  payload: ExportPayload;
}
export interface ParseError {
  ok: false;
  error: string;
}

export function chainFromJson(text: string): ParseResult | ParseError {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    return { ok: false, error: 'Not valid JSON: ' + (e as Error).message };
  }
  if (!parsed || typeof parsed !== 'object') {
    return { ok: false, error: 'Top-level is not an object.' };
  }
  const o = parsed as Record<string, unknown>;
  if (typeof o.schema !== 'number' || o.schema < 1 || o.schema > SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Unsupported schema version: ${o.schema}. This app understands schema 1.`,
    };
  }
  if (!Array.isArray(o.blocks)) {
    return { ok: false, error: 'Missing "blocks" array.' };
  }
  const blocks: PresetBlock[] = [];
  for (const [i, b] of (o.blocks as unknown[]).entries()) {
    if (!b || typeof b !== 'object') {
      return { ok: false, error: `Block ${i} is not an object.` };
    }
    const bb = b as Record<string, unknown>;
    if (typeof bb.defId !== 'string') {
      return { ok: false, error: `Block ${i} missing defId.` };
    }
    if (typeof bb.bypass !== 'boolean') {
      return { ok: false, error: `Block ${i} missing bypass.` };
    }
    if (!bb.paramValues || typeof bb.paramValues !== 'object') {
      return { ok: false, error: `Block ${i} missing paramValues.` };
    }
    // Numeric-only check on paramValues — silently coerce booleans for old toggles.
    const pv: Record<string, number> = {};
    for (const [k, v] of Object.entries(bb.paramValues as Record<string, unknown>)) {
      if (typeof v === 'number') pv[k] = v;
      else if (typeof v === 'boolean') pv[k] = v ? 1 : 0;
      else
        return {
          ok: false,
          error: `Block ${i} param ${k} is not a number.`,
        };
    }
    blocks.push({ defId: bb.defId, bypass: bb.bypass, paramValues: pv });
  }
  const payload: ExportPayload = {
    schema: o.schema,
    name: typeof o.name === 'string' ? o.name : 'Imported tone',
    blocks,
    pickupId: typeof o.pickupId === 'string' ? (o.pickupId as PickupId) : undefined,
    bpm: typeof o.bpm === 'number' ? o.bpm : undefined,
    exportedAt: typeof o.exportedAt === 'string' ? o.exportedAt : new Date().toISOString(),
  };
  return { ok: true, payload };
}

/**
 * Human-readable plaintext recipe for sitting at a physical Headrush Prime
 * and recreating the tone. Lists every block in order with all its
 * parameters and current values.
 */
export function chainToRecipe(
  name: string,
  chain: PresetBlock[],
  extras?: { pickupId?: PickupId; bpm?: number }
): string {
  const lines: string[] = [];
  lines.push(`Tone: ${name || 'Untitled'}`);
  lines.push(`Exported: ${new Date().toLocaleString()}`);
  lines.push('');
  if (extras?.pickupId) {
    const p = PICKUPS[extras.pickupId];
    lines.push(`Pickup: ${p?.label ?? extras.pickupId}`);
  }
  if (typeof extras?.bpm === 'number') {
    lines.push(`Tempo: ${extras.bpm} BPM`);
  }
  if (extras?.pickupId || typeof extras?.bpm === 'number') lines.push('');

  lines.push(`Signal chain (${chain.length} block${chain.length === 1 ? '' : 's'}):`);
  lines.push('');

  chain.forEach((block, idx) => {
    const def = effectDefinitions[block.defId];
    if (!def) {
      lines.push(`${idx + 1}. [Unknown block: ${block.defId}]`);
      lines.push('');
      return;
    }
    const cat = categoryLabels[def.category] ?? def.category;
    const status = block.bypass ? 'BYPASSED' : 'active';
    lines.push(`${idx + 1}. ${def.displayName}  (${cat}, ${status})`);
    for (const p of def.params) {
      if (p.type === 'hidden') continue;
      const v = block.paramValues[p.id] ?? p.default;
      let label: string;
      if (p.type === 'enum' && p.options) {
        const opt = p.options.find((o) => o.value === Math.round(v));
        label = opt ? opt.label : String(v);
      } else if (p.type === 'toggle' && p.options) {
        const opt = p.options.find((o) => o.value === (v > 0.5 ? 1 : 0));
        label = opt ? opt.label : v > 0.5 ? 'On' : 'Off';
      } else {
        const formatted =
          Math.abs(v) >= 100
            ? v.toFixed(0)
            : Math.abs(v) >= 10
              ? v.toFixed(1)
              : v.toFixed(2);
        label = formatted + (p.unit ? ` ${p.unit}` : '');
      }
      lines.push(`     ${p.label.padEnd(14)} ${label}`);
    }
    lines.push('');
  });

  lines.push('Headrush Prime mapping:');
  lines.push(
    '  Find each block category (Compressor, Drive, Amp, EQ, Cab, Modulation, Delay, Reverb)'
  );
  lines.push(
    '  on your Prime. Pick the model closest to the names above, then dial in'
  );
  lines.push('  the listed parameter values. Save as a new rig.');
  return lines.join('\n');
}
