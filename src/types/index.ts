import type * as Tone from 'tone';

export type EffectCategory =
  | 'input'
  | 'comp'
  | 'wah'
  | 'pitch'
  | 'drive'
  | 'amp'
  | 'eq'
  | 'cab'
  | 'mod'
  | 'delay'
  | 'reverb'
  | 'output';

export interface EffectParamSpec {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  default: number;
  unit?: string;
  /** Display curve for the knob; doesn't affect storage (always linear value). */
  curve?: 'linear' | 'log';
  description: string;
}

export interface EffectLesson {
  tldr: string;
  whatItDoes: string;
  physics: string;
  signalImpact: string[];
  headrushNotes: string;
  paramTips: Record<string, string>;
}

export interface EffectDefinition {
  id: string;
  displayName: string;
  category: EffectCategory;
  shortDescription: string;
  /** If true, the audio implementation is wired up; if false, it's catalog-only. */
  implemented: boolean;
  params: EffectParamSpec[];
  lesson: EffectLesson;
  create?: () => EffectInstance;
}

export interface EffectInstance {
  input: Tone.ToneAudioNode;
  output: Tone.ToneAudioNode;
  setParam: (paramId: string, value: number) => void;
  setBypass: (bypass: boolean) => void;
  dispose: () => void;
}

export interface ChainBlock {
  /** Unique runtime instance id. */
  id: string;
  /** EffectDefinition.id */
  defId: string;
  bypass: boolean;
  paramValues: Record<string, number>;
}

export interface Chord {
  name: string;
  notes: string[];
  description?: string;
}
