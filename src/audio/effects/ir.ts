import * as Tone from 'tone';

/**
 * Synthesized cabinet impulse responses.
 *
 * A real guitar-cab IR is a recording of an impulse (sine sweep, deconvolved)
 * played through a specific cab + mic combination. Convolving any signal with
 * that IR makes the signal "sound like" it went through that physical rig.
 *
 * We don't have real recordings to ship, so we synthesize plausible IRs from
 * physics: an initial transient + a sum of damped sinusoids at the cab's
 * dominant resonant modes + frequency-shaped noise tail.
 *
 * Length is ~120 ms — typical for guitar cabs (real ones are often shorter
 * than people assume; the bulk of the spectral character is in the first
 * 20–30 ms).
 */

export type CabModel = 'greenback' | 'v30' | 'tweed' | 'blue';

interface ResonantMode {
  /** Frequency in Hz */
  f: number;
  /** Decay time in seconds (time to reach 1/e of starting amplitude) */
  decay: number;
  /** Initial amplitude */
  amp: number;
  /** Optional phase offset to avoid all modes starting in phase */
  phase?: number;
}

interface IRProfile {
  /** Resonant modes that define the cab's "voice". */
  modes: ResonantMode[];
  /** Highpass corner — energy below this fades out (cab can't reproduce sub-bass) */
  hpHz: number;
  /** Lowpass corner — energy above this fades out (paper cone limit) */
  lpHz: number;
  /** Pre-noise transient amplitude */
  transient: number;
  /** Body of the IR — noise decay time in seconds */
  noiseDecay: number;
}

const PROFILES: Record<CabModel, IRProfile> = {
  // Celestion G12M Greenback — classic British, warm, mid-forward, ~75 W
  greenback: {
    modes: [
      { f: 95, decay: 0.06, amp: 0.55 },
      { f: 230, decay: 0.04, amp: 0.35, phase: 0.5 },
      { f: 480, decay: 0.035, amp: 0.45, phase: 1.0 },
      { f: 850, decay: 0.028, amp: 0.65 },
      { f: 1800, decay: 0.022, amp: 0.55, phase: 0.7 },
      { f: 2400, decay: 0.018, amp: 0.4 },
      { f: 3600, decay: 0.012, amp: 0.25 },
    ],
    hpHz: 85,
    lpHz: 5200,
    transient: 0.3,
    noiseDecay: 0.025,
  },

  // Celestion Vintage 30 — modern, bright, aggressive upper mids
  v30: {
    modes: [
      { f: 110, decay: 0.045, amp: 0.45 },
      { f: 280, decay: 0.035, amp: 0.3, phase: 0.5 },
      { f: 700, decay: 0.025, amp: 0.45 },
      { f: 1300, decay: 0.022, amp: 0.55, phase: 0.8 },
      { f: 2200, decay: 0.022, amp: 0.75, phase: 0.2 },
      { f: 3300, decay: 0.018, amp: 0.55 },
      { f: 4500, decay: 0.012, amp: 0.3 },
    ],
    hpHz: 95,
    lpHz: 5800,
    transient: 0.35,
    noiseDecay: 0.02,
  },

  // Jensen tweed-style — vintage American, warm, dark, slightly compressed
  tweed: {
    modes: [
      { f: 80, decay: 0.07, amp: 0.6 },
      { f: 180, decay: 0.05, amp: 0.45, phase: 0.5 },
      { f: 400, decay: 0.04, amp: 0.5 },
      { f: 700, decay: 0.03, amp: 0.55, phase: 1.0 },
      { f: 1500, decay: 0.025, amp: 0.4 },
      { f: 2400, decay: 0.018, amp: 0.25 },
    ],
    hpHz: 75,
    lpHz: 4500,
    transient: 0.22,
    noiseDecay: 0.03,
  },

  // Celestion Blue / Alnico — Vox AC30, bell-like chime, very bright
  blue: {
    modes: [
      { f: 105, decay: 0.04, amp: 0.4 },
      { f: 300, decay: 0.035, amp: 0.35, phase: 0.5 },
      { f: 900, decay: 0.025, amp: 0.5 },
      { f: 1600, decay: 0.025, amp: 0.6 },
      { f: 2800, decay: 0.02, amp: 0.7, phase: 0.5 },
      { f: 4200, decay: 0.015, amp: 0.5 },
      { f: 5800, decay: 0.01, amp: 0.3 },
    ],
    hpHz: 90,
    lpHz: 6800,
    transient: 0.4,
    noiseDecay: 0.018,
  },
};

const DURATION_S = 0.12;

/**
 * Synthesize an IR for a given cab model at the audio context's sample rate.
 * Returns an AudioBuffer ready to plug into a Tone.Convolver.
 */
export function generateCabIR(model: CabModel): AudioBuffer {
  const ctx = Tone.getContext().rawContext as AudioContext;
  const sr = ctx.sampleRate;
  const len = Math.floor(sr * DURATION_S);
  const buffer = ctx.createBuffer(1, len, sr);
  const d = buffer.getChannelData(0);
  const profile = PROFILES[model];

  // Stage 1 — short transient: 1-2 ms of decaying noise at high amplitude.
  const transientLen = Math.floor(sr * 0.002);
  for (let i = 0; i < transientLen; i++) {
    d[i] += (Math.random() * 2 - 1) * profile.transient *
      Math.exp(-i / (transientLen * 0.3));
  }

  // Stage 2 — shaped noise body: noise enveloped by exponential decay.
  // This is what gives the IR a continuous spectrum between the modes.
  const noiseDecaySamples = sr * profile.noiseDecay;
  for (let i = 0; i < len; i++) {
    const env = Math.exp(-i / noiseDecaySamples);
    d[i] += (Math.random() * 2 - 1) * 0.18 * env;
  }

  // Stage 3 — sum of damped sinusoidal modes (the cab's "voice").
  for (const mode of profile.modes) {
    const omega = (2 * Math.PI * mode.f) / sr;
    const decaySamples = sr * mode.decay;
    let phase = mode.phase ?? 0;
    for (let i = 0; i < len; i++) {
      const env = Math.exp(-i / decaySamples);
      d[i] += Math.sin(phase) * mode.amp * env;
      phase += omega;
    }
  }

  // Stage 4 — one-pole high-pass and low-pass filters to enforce the
  // speaker's frequency limits beyond what the mode distribution gives.
  // y[n] = a * (y[n-1] + x[n] - x[n-1]) for HP; y[n] = a*y[n-1] + (1-a)*x[n] for LP.
  applyOnePoleHighpass(d, profile.hpHz, sr);
  applyOnePoleLowpass(d, profile.lpHz, sr);

  // Stage 5 — normalize peak to ~0.85 so the convolver doesn't blow up the
  // signal. Convolver itself can also normalize, but doing it here gives
  // predictable level matching across the four cabs.
  let peak = 0;
  for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(d[i]));
  if (peak > 0) {
    const scale = 0.85 / peak;
    for (let i = 0; i < len; i++) d[i] *= scale;
  }

  return buffer;
}

function applyOnePoleHighpass(d: Float32Array, fc: number, sr: number) {
  const rc = 1 / (2 * Math.PI * fc);
  const dt = 1 / sr;
  const alpha = rc / (rc + dt);
  let prevIn = 0;
  let prevOut = 0;
  for (let i = 0; i < d.length; i++) {
    const x = d[i];
    const y = alpha * (prevOut + x - prevIn);
    d[i] = y;
    prevIn = x;
    prevOut = y;
  }
}

function applyOnePoleLowpass(d: Float32Array, fc: number, sr: number) {
  const rc = 1 / (2 * Math.PI * fc);
  const dt = 1 / sr;
  const alpha = dt / (rc + dt);
  let prev = 0;
  for (let i = 0; i < d.length; i++) {
    const y = prev + alpha * (d[i] - prev);
    d[i] = y;
    prev = y;
  }
}

/** Human-readable label for each cab. */
export const CAB_LABELS: Record<CabModel, string> = {
  greenback: 'Greenback 4×12',
  v30: 'Vintage 30 4×12',
  tweed: 'Tweed 1×12',
  blue: 'Blue Alnico 2×12',
};
