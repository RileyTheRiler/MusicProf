/**
 * Scale definitions. Each scale is a list of semitone intervals from the root.
 * E.g., a major scale is whole-whole-half-whole-whole-whole-half = [0, 2, 4, 5, 7, 9, 11].
 */

export interface Scale {
  id: string;
  label: string;
  intervals: number[];
  description: string;
}

export const SCALES: Record<string, Scale> = {
  major: {
    id: 'major',
    label: 'Major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    description:
      'The classic "happy/bright" scale. Step pattern: W-W-H-W-W-W-H (whole and half steps).',
  },
  minor: {
    id: 'minor',
    label: 'Natural Minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    description:
      'The "sad/serious" scale. Step pattern: W-H-W-W-H-W-W. Same notes as the major scale starting from its 6th degree.',
  },
  'pentatonic-major': {
    id: 'pentatonic-major',
    label: 'Major Pentatonic',
    intervals: [0, 2, 4, 7, 9],
    description:
      '5-note scale, no half-steps. Bright, country-flavored. The major scale with the 4th and 7th removed.',
  },
  'pentatonic-minor': {
    id: 'pentatonic-minor',
    label: 'Minor Pentatonic',
    intervals: [0, 3, 5, 7, 10],
    description:
      '5-note scale. THE rock and blues lead vocabulary. Every guitarist learns this first; most guitarists never stop using it.',
  },
  blues: {
    id: 'blues',
    label: 'Blues',
    intervals: [0, 3, 5, 6, 7, 10],
    description:
      'Minor pentatonic + the "blue note" (flat 5). Six notes that define the blues vocabulary.',
  },
  dorian: {
    id: 'dorian',
    label: 'Dorian',
    intervals: [0, 2, 3, 5, 7, 9, 10],
    description:
      'Minor scale with a raised 6th. Modal — Santana ("Oye Como Va"), Steely Dan, jazz, modal rock.',
  },
  mixolydian: {
    id: 'mixolydian',
    label: 'Mixolydian',
    intervals: [0, 2, 4, 5, 7, 9, 10],
    description:
      'Major scale with a flat 7th. The "dominant 7th" mode — blues, funk, classic rock vamps.',
  },
};

export const SCALE_LIST: Scale[] = Object.values(SCALES);

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
