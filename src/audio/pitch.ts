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

  // 3) Autocorrelation, but only over the lag range that could plausibly be
  //    a guitar pitch (40 Hz to 2 kHz fundamental). That bounds the work
  //    significantly — at 48 kHz we evaluate ~1175 lags instead of all N.
  //    Inner sum is also bounded to N - i samples.
  const minPeriod = Math.max(1, Math.floor(sampleRate / 2000));
  const maxPeriod = Math.min(N - 1, Math.ceil(sampleRate / 40));
  if (maxPeriod <= minPeriod) return 0;
  const c = new Float32Array(maxPeriod + 1);
  for (let i = minPeriod; i <= maxPeriod; i++) {
    let acc = 0;
    const max = N - i;
    for (let j = 0; j < max; j++) {
      acc += trimmed[j] * trimmed[j + i];
    }
    c[i] = acc;
  }

  // 4) Find peak in the candidate range.
  let maxVal = -Infinity;
  let maxPos = -1;
  for (let i = minPeriod; i <= maxPeriod; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }
  if (maxPos < 1 || maxPos >= maxPeriod) return 0;

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
