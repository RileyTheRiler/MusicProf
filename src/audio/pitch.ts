/**
 * Pitch detection via the classic autocorrelation method. Works well on the
 * monophonic, quasi-periodic signals a guitar produces.
 *
 * Reference: https://www.musicdsp.org/en/latest/Analysis/14-autocorrelation-pitch-detection.html
 *
 * Returns a frequency in Hz, or 0 if no usable pitch was found (signal too
 * quiet, polyphonic, percussive, etc.).
 */

const SILENCE_THRESHOLD = 0.01; // RMS below this → no pitch

export function detectPitch(buf: Float32Array, sampleRate: number): number {
  const SIZE = buf.length;

  // 1) RMS gate — bail out on silence.
  let sumSquares = 0;
  for (let i = 0; i < SIZE; i++) sumSquares += buf[i] * buf[i];
  const rms = Math.sqrt(sumSquares / SIZE);
  if (rms < SILENCE_THRESHOLD) return 0;

  // 2) Trim the buffer to where the signal starts and ends being "loud
  //    enough" — avoids autocorrelation noise from leading/trailing silence.
  const thres = 0.2;
  let r1 = 0;
  let r2 = SIZE - 1;
  for (let i = 0; i < SIZE / 2; i++) {
    if (Math.abs(buf[i]) >= thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < SIZE / 2; i++) {
    if (Math.abs(buf[SIZE - i]) >= thres) {
      r2 = SIZE - i;
      break;
    }
  }
  if (r2 <= r1 + 64) return 0; // Not enough usable samples.

  const trimmed = buf.subarray(r1, r2);
  const N = trimmed.length;

  // 3) Autocorrelation. Computes c[i] = sum_{j} trimmed[j] * trimmed[j+i].
  //    O(N²) — at N=900 that's ~800k multiplies. We run this throttled, not
  //    every frame, so it's fine.
  const c = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    let acc = 0;
    const max = N - i;
    for (let j = 0; j < max; j++) {
      acc += trimmed[j] * trimmed[j + i];
    }
    c[i] = acc;
  }

  // 4) Find the first dip after lag 0, then the peak after that.
  let d = 0;
  while (d + 1 < N && c[d] > c[d + 1]) d++;
  let maxVal = -Infinity;
  let maxPos = -1;
  // Lower bound on period — corresponds to ~1000 Hz at 44.1kHz (T0 = 44 samples).
  // No guitar note in standard tuning is higher than that anyway.
  const minPeriod = Math.max(d, Math.floor(sampleRate / 2000));
  for (let i = minPeriod; i < N; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  if (maxPos < 1 || maxPos >= N - 1) return 0;

  // 5) Parabolic interpolation around the peak for fractional-sample
  //    period resolution.
  const x1 = c[maxPos - 1];
  const x2 = c[maxPos];
  const x3 = c[maxPos + 1];
  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  const T0 = a !== 0 ? maxPos - b / (2 * a) : maxPos;

  return sampleRate / T0;
}

const NOTE_NAMES = [
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

const A4 = 440;
const MIDI_A4 = 69;

export interface PitchReading {
  /** Detected frequency in Hz, or 0 if no pitch. */
  freq: number;
  /** MIDI note number (e.g. 40 = E2), with fractional position for cents. */
  midi: number;
  /** Nearest note name (C, C#, D, ...). */
  note: string;
  /** Octave number (e.g. E2 → octave 2). */
  octave: number;
  /** Distance from the nearest note in cents (-50 to +50). */
  cents: number;
}

export function freqToReading(freq: number): PitchReading | null {
  if (freq <= 0) return null;
  // MIDI note number with fractional component.
  const midi = MIDI_A4 + 12 * Math.log2(freq / A4);
  const midiRounded = Math.round(midi);
  const cents = (midi - midiRounded) * 100;
  // C-1 = midi 0; C4 (middle C) = midi 60.
  const note = NOTE_NAMES[((midiRounded % 12) + 12) % 12];
  const octave = Math.floor(midiRounded / 12) - 1;
  return { freq, midi, note, octave, cents };
}

/**
 * Returns the standard-tuning open string note closest to `freq`, if there
 * is one within ~1 semitone. Lets the tuner display "E2 ↑3 cents" rather
 * than just "E ↑3" when the user is tuning a specific string.
 */
const STANDARD_TUNING = [
  { note: 'E', octave: 2 }, // 6th string, low E
  { note: 'A', octave: 2 },
  { note: 'D', octave: 3 },
  { note: 'G', octave: 3 },
  { note: 'B', octave: 3 },
  { note: 'E', octave: 4 }, // 1st string, high E
];

export function nearestStandardString(
  reading: PitchReading
): { note: string; octave: number } | null {
  for (const s of STANDARD_TUNING) {
    if (s.note === reading.note && s.octave === reading.octave) return s;
  }
  return null;
}
