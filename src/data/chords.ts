import type { Chord } from '../types';

/** Common open-position chords. Notes ordered low-to-high (6th string -> 1st). */
export const CHORDS: Chord[] = [
  {
    name: 'E minor',
    notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'],
    description: 'Open Em — sad, classic rock cornerstone.',
  },
  {
    name: 'E major',
    notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'],
    description: 'Open E — bright and powerful, fundamental for blues.',
  },
  {
    name: 'A minor',
    notes: ['A2', 'E3', 'A3', 'C4', 'E4'],
    description: 'Open Am — mournful, the natural minor home.',
  },
  {
    name: 'A major',
    notes: ['A2', 'E3', 'A3', 'C#4', 'E4'],
    description: 'Open A — happy, foundation of countless songs.',
  },
  {
    name: 'D major',
    notes: ['D3', 'A3', 'D4', 'F#4'],
    description: 'Open D — bright and resonant.',
  },
  {
    name: 'G major',
    notes: ['G2', 'B2', 'D3', 'G3', 'B3', 'G4'],
    description: 'Open G — full, six-string ringer.',
  },
  {
    name: 'C major',
    notes: ['C3', 'E3', 'G3', 'C4', 'E4'],
    description: 'Open C — clean, neutral, central to Western music.',
  },
  {
    name: 'Power chord (E5)',
    notes: ['E2', 'B2', 'E3'],
    description: 'Root + 5th — the iconic rock/metal stack. No 3rd, so no major/minor.',
  },
];

/** Single notes for picking exercises (E standard, low to high). */
export const SINGLE_NOTES: { label: string; note: string }[] = [
  { label: 'Low E', note: 'E2' },
  { label: 'A', note: 'A2' },
  { label: 'D', note: 'D3' },
  { label: 'G', note: 'G3' },
  { label: 'B', note: 'B3' },
  { label: 'High E', note: 'E4' },
];
