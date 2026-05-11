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
import {
  cabBlueDef,
  cabGreenbackDef,
  cabTweedDef,
  cabV30Def,
} from './cab';
import { chorusDef } from './chorus';
import { delayDef } from './delay';
import { flangerDef } from './flanger';
import { noiseGateDef } from './gate';
import { phaserDef } from './phaser';
import { pitchShifterDef } from './pitch';
import { reverbDef } from './reverb';
import { tremoloDef } from './tremolo';
import { wahDef } from './wah';

const allDefs: EffectDefinition[] = [
  noiseGateDef,
  compressorDef,
  wahDef,
  pitchShifterDef,
  distortionDef,
  fenderCleanDef,
  marshallCrunchDef,
  mesaHiGainDef,
  voxChimeDef,
  eqDef,
  cabGreenbackDef,
  cabV30Def,
  cabTweedDef,
  cabBlueDef,
  chorusDef,
  flangerDef,
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
