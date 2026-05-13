import { NOTE_NAMES } from './scales';

/**
 * Standard E-tuning MIDI notes for each string, in 1st-to-6th order
 * (matching guitar tab convention where the 1st string is the high E).
 *
 *   string 1 (high E) → 64 (E4)
 *   string 2 (B)      → 59 (B3)
 *   string 3 (G)      → 55 (G3)
 *   string 4 (D)      → 50 (D3)
 *   string 5 (A)      → 45 (A2)
 *   string 6 (low E)  → 40 (E2)
 */
export const STRING_LABELS = ['1st', '2nd', '3rd', '4th', '5th', '6th'];
export const STRING_OPEN_MIDI = [64, 59, 55, 50, 45, 40];

export interface FretNote {
  midi: number;
  pitchClass: string;
  octave: number;
  /** Tone.js-style "E4" note name. */
  noteName: string;
}

/**
 * @param stringIdx — 0..5 where 0 is the 1st string (high E), 5 is the 6th (low E)
 * @param fret — 0 (open) to N
 */
export function noteAtFret(stringIdx: number, fret: number): FretNote {
  const midi = STRING_OPEN_MIDI[stringIdx] + fret;
  const pitchClass = NOTE_NAMES[((midi % 12) + 12) % 12];
  const octave = Math.floor(midi / 12) - 1;
  return { midi, pitchClass, octave, noteName: `${pitchClass}${octave}` };
}

/** Position of single dot fret markers. 12 is double-dot. */
export const SINGLE_DOT_FRETS = [3, 5, 7, 9, 15, 17, 19, 21];
export const DOUBLE_DOT_FRETS = [12, 24];
