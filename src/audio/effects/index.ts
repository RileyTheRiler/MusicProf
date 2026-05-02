import type { EffectDefinition } from '../../types';
import {
  fenderCleanDef,
  marshallCrunchDef,
  mesaHiGainDef,
  voxChimeDef,
} from './amp';
import { compressorDef } from './compressor';
import { distortionDef } from './distortion';
import { eqDef } from './eq';
import { cabDef } from './cab';
import { chorusDef } from './chorus';
import { delayDef } from './delay';
import { reverbDef } from './reverb';

/**
 * Catalog-only stubs for blocks we'll implement in later passes. Showing them
 * (greyed out) gives the user a complete picture of the Headrush Prime\'s
 * signal-chain real estate even before every block has audio.
 */
const noiseGateStub: EffectDefinition = {
  id: 'gate',
  displayName: 'Noise Gate',
  category: 'input',
  shortDescription:
    'Mutes the signal below a threshold to suppress hum and pickup hiss between notes.',
  implemented: false,
  params: [],
  lesson: {
    tldr: 'A gate is a volume control that opens when you play and closes when you don\'t.',
    whatItDoes:
      'A gate watches the input level. Above the threshold, it passes signal through unchanged. Below, it cuts the volume to zero (or attenuates by a set amount). Critical for high-gain rigs where pickup hum and amp hiss are otherwise audible during pauses.',
    physics:
      'Opposite of a compressor: instead of reducing gain when loud, it reduces gain when quiet. Attack/release/hold parameters control how fast it opens and closes.',
    signalImpact: [
      'Silences signal below threshold',
      'Can chatter on slow note decay if release is too fast',
      'Best placed early in the chain (before drive/amp) to gate noise from the source',
    ],
    headrushNotes:
      'The Prime has a built-in noise gate per signal chain plus a dedicated Gate block.',
    paramTips: {},
  },
};

const wahStub: EffectDefinition = {
  id: 'wah',
  displayName: 'Wah',
  category: 'wah',
  shortDescription:
    'A bandpass filter swept by an expression pedal — the iconic "wow-wah" vocal-like sound.',
  implemented: false,
  params: [],
  lesson: {
    tldr: 'A wah is a sweepable bandpass filter — the resonant peak moves between ~400 Hz and ~2 kHz as you rock the pedal.',
    whatItDoes:
      'A narrow, resonant bandpass filter whose center frequency is controlled by a pedal. Sweeping the filter through midrange creates a sound very similar to a human vocal "wah" because vowels are also formed by midrange resonances.',
    physics:
      'Originally an inductor + variable capacitor analog filter (the famous Cry Baby). Digital wahs model that response. Q (resonance) is high — a sharp peak that emphasizes a narrow band.',
    signalImpact: [
      'Massive midrange emphasis at the swept frequency',
      'Heavy attenuation outside the filter band',
      'Makes single notes almost speak/sing',
    ],
    headrushNotes:
      'On the Prime, the Wah block ties to the expression pedal. Often paired with overdrive — the wah\'s peak is so sharp it can self-oscillate when overdriven.',
    paramTips: {},
  },
};

const flangerStub: EffectDefinition = {
  id: 'flanger',
  displayName: 'Flanger',
  category: 'mod',
  shortDescription:
    'Like chorus but with a much shorter delay and feedback — "jet plane" sweep.',
  implemented: false,
  params: [],
  lesson: {
    tldr: 'Flanger = short delay (1–10 ms) modulated by an LFO, mixed with the dry signal, with feedback for resonance.',
    whatItDoes:
      'When you mix a signal with a 1–10 ms delayed copy of itself, you get comb filtering — peaks and notches in the spectrum at integer multiples of the delay frequency. Modulating the delay time sweeps those notches up and down — the classic "jet plane" whoosh.',
    physics:
      'Delay = D milliseconds creates notches at frequencies (n+0.5)/D Hz. A 5 ms delay puts notches at 100 Hz, 300 Hz, 500 Hz... Modulating D sweeps the comb. Feedback into the delay accentuates the peaks, making the effect more resonant and metallic.',
    signalImpact: [
      'Comb filtering — adds resonant peaks/notches across the spectrum',
      'Sweeping creates a moving "spectral fingerprint"',
      'Can be subtle (low feedback) or extreme/metallic (high feedback)',
    ],
    headrushNotes:
      'Found in the Modulation/FX section. Try the "Through-Zero Flanger" model for the original tape-flanger sound.',
    paramTips: {},
  },
};

const phaserStub: EffectDefinition = {
  id: 'phaser',
  displayName: 'Phaser',
  category: 'mod',
  shortDescription:
    'All-pass filter chain that creates moving notches without delay — swirly, watery effect.',
  implemented: false,
  params: [],
  lesson: {
    tldr: 'Phaser uses a chain of all-pass filters whose phase response is swept by an LFO, creating moving notches when summed with the dry signal.',
    whatItDoes:
      'Unlike a flanger, a phaser doesn\'t use delay. It uses 2/4/6/8 all-pass filters in series, each shifting phase but not amplitude. Mixing the phase-shifted output with the dry creates comb-like notches at frequencies determined by the filter design. Modulating the all-pass cutoffs sweeps those notches.',
    physics:
      'An all-pass filter has flat magnitude but frequency-dependent phase shift. Cascading 4 of them creates 2 notches in the summed output (one per pair). Phase shift at the notch is exactly 180° so they cancel against the dry copy.',
    signalImpact: [
      'Moving notches in the spectrum (fewer, less aggressive than a flanger)',
      'No delay = no comb stack — sounds smoother',
      'Subtle; perfect for clean rhythm guitar',
    ],
    headrushNotes:
      'Modulation block — try the MXR Phase 90 / 100 models. Single knob (Rate) on the originals; Prime gives you Depth, Stages, Mix too.',
    paramTips: {},
  },
};

const tremoloStub: EffectDefinition = {
  id: 'tremolo',
  displayName: 'Tremolo',
  category: 'mod',
  shortDescription:
    'Cyclic volume modulation via LFO — "helicopter" amplitude wobble.',
  implemented: false,
  params: [],
  lesson: {
    tldr: 'Tremolo modulates the volume in a cycle. Don\'t confuse with vibrato (pitch modulation) — Fender mislabeled them in the 60s and the misnomer stuck.',
    whatItDoes:
      'A VCA (voltage-controlled amplifier) whose gain is swept by a low-frequency oscillator. Sine wave LFO = smooth swell; square wave = on/off chop; harmonic tremolo splits the signal across two filters and alternates between them.',
    physics:
      'Pure amplitude modulation. If LFO is at f_m and signal at f_s, AM creates sidebands at f_s ± f_m — but they\'re weak compared to delay-based effects.',
    signalImpact: [
      'Periodic volume changes',
      'Doesn\'t change pitch (that\'s vibrato)',
      'Square-wave tremolo = "stutter" effect',
    ],
    headrushNotes:
      'Modulation block. Look for "Bias Tremolo" (vintage Fender, smooth) and "Harmonic Tremolo" (classic brown Fender, treble/bass alternation).',
    paramTips: {},
  },
};

const pitchStub: EffectDefinition = {
  id: 'pitch-shifter',
  displayName: 'Pitch Shifter / Octaver',
  category: 'pitch',
  shortDescription:
    'Generates a copy of your signal at a different pitch — fixed interval (octaver) or any interval (harmonizer).',
  implemented: false,
  params: [],
  lesson: {
    tldr: 'Pitch shifters use granular resampling or phase vocoder algorithms to play your signal back at a different pitch without changing time.',
    whatItDoes:
      'Two main techniques: (1) granular — chop the audio into tiny grains, resample each, and overlap-add at the new pitch; (2) phase vocoder — FFT the signal, shift the bin frequencies, IFFT back. Octaver pedals (POG, OC-2) use simpler analog methods like square-wave generation from the input.',
    physics:
      'Frequency-domain shifting introduces "smearing" of transients. That\'s why octavers feel "synthy" — they trade pitch tracking accuracy for low latency and clean tone.',
    signalImpact: [
      'Adds pitched harmony at chosen interval',
      'Always introduces some latency (a few ms to ~30 ms)',
      'Tracking can fail on chords (good octavers are monophonic)',
    ],
    headrushNotes:
      'The Prime has Pitch Shifter, Whammy, Octaver, and Harmonizer models. Whammy follows an expression pedal.',
    paramTips: {},
  },
};

const allDefs: EffectDefinition[] = [
  noiseGateStub,
  compressorDef,
  wahStub,
  pitchStub,
  distortionDef,
  fenderCleanDef,
  marshallCrunchDef,
  mesaHiGainDef,
  voxChimeDef,
  eqDef,
  cabDef,
  chorusDef,
  flangerStub,
  phaserStub,
  tremoloStub,
  delayDef,
  reverbDef,
];

export const effectDefinitions: Record<string, EffectDefinition> = Object.fromEntries(
  allDefs.map((d) => [d.id, d])
);

export const effectDefinitionList: EffectDefinition[] = allDefs;

/** Display order for the category badges. */
export const categoryOrder: Record<string, number> = {
  input: 0,
  comp: 1,
  wah: 2,
  pitch: 3,
  drive: 4,
  amp: 5,
  eq: 6,
  cab: 7,
  mod: 8,
  delay: 9,
  reverb: 10,
  output: 11,
};

export const categoryLabels: Record<string, string> = {
  input: 'Input',
  comp: 'Dynamics',
  wah: 'Wah/Filter',
  pitch: 'Pitch',
  drive: 'Drive',
  amp: 'Amp',
  eq: 'EQ',
  cab: 'Cabinet',
  mod: 'Modulation',
  delay: 'Delay',
  reverb: 'Reverb',
  output: 'Output',
};

export const categoryColors: Record<string, string> = {
  input: 'bg-zinc-700',
  comp: 'bg-blue-600',
  wah: 'bg-purple-600',
  pitch: 'bg-pink-600',
  drive: 'bg-red-600',
  amp: 'bg-orange-600',
  eq: 'bg-yellow-600',
  cab: 'bg-amber-700',
  mod: 'bg-violet-600',
  delay: 'bg-cyan-600',
  reverb: 'bg-teal-600',
  output: 'bg-zinc-700',
};
