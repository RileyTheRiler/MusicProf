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
import { noiseGateDef } from './gate';
import { phaserDef } from './phaser';
import { reverbDef } from './reverb';
import { tremoloDef } from './tremolo';
import { wahDef } from './wah';

/**
 * Catalog-only stubs for blocks we'll implement in later passes. Showing them
 * (greyed out) gives the user a complete picture of the Headrush Prime\'s
 * signal-chain real estate even before every block has audio.
 */
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
  noiseGateDef,
  compressorDef,
  wahDef,
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
  phaserDef,
  tremoloDef,
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
