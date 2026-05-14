/**
 * Scale and chord definitions. Each is a list of semitone intervals from
 * a root note — same data shape whether it's a 7-note scale, a 5-note
 * pentatonic, or a 3-note triad. The "category" field is for grouping
 * in the UI; the math is identical.
 */

export type ScaleCategory = 'scale' | 'mode' | 'chord' | 'arpeggio';

export interface Scale {
  id: string;
  label: string;
  intervals: number[];
  description: string;
  category: ScaleCategory;
}

export const SCALES: Record<string, Scale> = {
  // --- Diatonic scales ---
  major: {
    id: 'major',
    label: 'Major',
    category: 'scale',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description:
      'The classic "happy/bright" 7-note scale. Step pattern W-W-H-W-W-W-H.',
  },
  minor: {
    id: 'minor',
    label: 'Natural Minor',
    category: 'scale',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description:
      'The "sad/serious" 7-note scale. Step pattern W-H-W-W-H-W-W. Same notes as major starting from its 6th degree.',
  },

  // --- Pentatonic + blues ---
  'pentatonic-major': {
    id: 'pentatonic-major',
    label: 'Major Pentatonic',
    category: 'scale',
    intervals: [0, 2, 4, 7, 9],
    description:
      '5-note scale, no half-steps. Bright and country-flavored. The major scale with the 4th and 7th removed.',
  },
  'pentatonic-minor': {
    id: 'pentatonic-minor',
    label: 'Minor Pentatonic',
    category: 'scale',
    intervals: [0, 3, 5, 7, 10],
    description:
      '5-note scale. THE rock and blues lead vocabulary. Every guitarist learns it first.',
  },
  blues: {
    id: 'blues',
    label: 'Blues',
    category: 'scale',
    intervals: [0, 3, 5, 6, 7, 10],
    description:
      'Minor pentatonic + the "blue note" (flat 5). Six notes that define the blues idiom.',
  },

  // --- Modes ---
  dorian: {
    id: 'dorian',
    label: 'Dorian',
    category: 'mode',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description:
      'Minor scale with a raised 6th. Santana ("Oye Como Va"), Steely Dan, modal rock.',
  },
  mixolydian: {
    id: 'mixolydian',
    label: 'Mixolydian',
    category: 'mode',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description:
      'Major scale with a flat 7th. The "dominant 7th" mode — blues, funk, classic rock vamps.',
  },

  // --- Triads (3-note chords) ---
  'major-triad': {
    id: 'major-triad',
    label: 'Major triad (1-3-5)',
    category: 'chord',
    intervals: [0, 4, 7],
    description:
      'Root + major 3rd + perfect 5th. Three notes that make a major chord. Bright, "happy", resolved.',
  },
  'minor-triad': {
    id: 'minor-triad',
    label: 'Minor triad (1-b3-5)',
    category: 'chord',
    intervals: [0, 3, 7],
    description:
      'Root + minor 3rd + perfect 5th. The only difference from major is the flatted 3rd — which is what makes it sound "sad".',
  },
  'sus2-chord': {
    id: 'sus2-chord',
    label: 'Sus2 chord (1-2-5)',
    category: 'chord',
    intervals: [0, 2, 7],
    description:
      'Root + 2nd + 5th. The 3rd is REPLACED with a 2nd — neither major nor minor. Hollow, suspended quality.',
  },
  'sus4-chord': {
    id: 'sus4-chord',
    label: 'Sus4 chord (1-4-5)',
    category: 'chord',
    intervals: [0, 5, 7],
    description:
      'Root + 4th + 5th. The 3rd is replaced with a 4th. Creates tension that "wants to resolve" back to the major chord.',
  },
  'dim-chord': {
    id: 'dim-chord',
    label: 'Diminished (1-b3-b5)',
    category: 'chord',
    intervals: [0, 3, 6],
    description:
      'Root + minor 3rd + flat 5th. Two minor thirds stacked. Tense, unstable — used as a passing chord or for menacing colors.',
  },
  'aug-chord': {
    id: 'aug-chord',
    label: 'Augmented (1-3-#5)',
    category: 'chord',
    intervals: [0, 4, 8],
    description:
      'Root + major 3rd + sharp 5th. Two major thirds stacked. Otherworldly, dreamy — common in jazz and film scoring.',
  },
  'power-chord': {
    id: 'power-chord',
    label: 'Power chord (1-5)',
    category: 'chord',
    intervals: [0, 7],
    description:
      'Just root + 5th. No 3rd, so neither major nor minor. The fundamental sound of rock and metal — sounds huge through distortion.',
  },

  // --- Seventh chords (4-note chords) ---
  'maj7-chord': {
    id: 'maj7-chord',
    label: 'Major 7 (1-3-5-7)',
    category: 'chord',
    intervals: [0, 4, 7, 11],
    description:
      'Major triad + major 7th. Dreamy, jazzy. The "jazz cleanup chord" — adds sophistication.',
  },
  'dom7-chord': {
    id: 'dom7-chord',
    label: 'Dominant 7 (1-3-5-b7)',
    category: 'chord',
    intervals: [0, 4, 7, 10],
    description:
      'Major triad + flat 7th. The "blues chord". Wants to resolve to its IV. Used as the "V7" in tons of pop and blues.',
  },
  'm7-chord': {
    id: 'm7-chord',
    label: 'Minor 7 (1-b3-5-b7)',
    category: 'chord',
    intervals: [0, 3, 7, 10],
    description:
      'Minor triad + flat 7th. Smooth, jazzy minor. The "Smoke on the Water" main riff is essentially minor 7 voicings.',
  },
};

export const SCALE_LIST: Scale[] = Object.values(SCALES);

/** Convenience: group by category in display order. */
export const SCALE_CATEGORY_ORDER: ScaleCategory[] = [
  'scale',
  'mode',
  'chord',
  'arpeggio',
];

export const SCALE_CATEGORY_LABELS: Record<ScaleCategory, string> = {
  scale: 'Scales',
  mode: 'Modes',
  chord: 'Chords / Triads',
  arpeggio: 'Arpeggios',
};

export const NOTE_NAMES = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
];

/** Returns a set of pitch-class names (without octave) that are in the scale. */
export function getScaleNotes(rootName: string, scaleId: string): Set<string> {
  const rootIdx = NOTE_NAMES.indexOf(rootName);
  if (rootIdx < 0) return new Set();
  const scale = SCALES[scaleId];
  if (!scale) return new Set();
  return new Set(
    scale.intervals.map((iv) => NOTE_NAMES[(rootIdx + iv) % 12])
  );
}

export function isInScale(
  pitchClass: string,
  rootName: string,
  scaleId: string
): boolean {
  return getScaleNotes(rootName, scaleId).has(pitchClass);
}
