import * as Tone from 'tone';

/**
 * Guitar pickup modeling. A pickup is electrically an inductor + capacitor +
 * resistor circuit whose impulse response has a resonant peak in the
 * high-mids — usually 2–5 kHz depending on type. That resonant peak is the
 * single most audible "fingerprint" of a pickup.
 *
 * We model each pickup as:
 *   - A peaking EQ at the resonant frequency
 *   - A low shelf for the relative body (humbuckers have more low-end)
 *   - A high shelf for HF rolloff above the resonant peak
 *
 * This sits between the source (synth voice or live input) and the rest of
 * the signal chain — so every effect downstream sees the "pickup-shaped"
 * signal, just like in a real rig.
 */

export type PickupId =
  | 'flat'
  | 'strat-bridge'
  | 'strat-middle'
  | 'strat-neck'
  | 'tele-bridge'
  | 'tele-neck'
  | 'p90'
  | 'humbucker-bridge'
  | 'humbucker-neck';

export interface PickupModel {
  id: PickupId;
  label: string;
  category: 'flat' | 'single' | 'p90' | 'humbucker';
  description: string;
  /** Peaking EQ — the resonant "voice" of the pickup */
  resonantFreq: number;
  resonantQ: number;
  resonantGainDb: number;
  /** Low shelf for body — humbuckers ~+3 dB, single coils ~0 to -1 dB */
  lowShelfFreq: number;
  lowShelfGainDb: number;
  /** High shelf for the HF rolloff above the resonant peak */
  highShelfFreq: number;
  highShelfGainDb: number;
  /** Output gain trim — humbuckers are hotter than singles */
  outputGainDb: number;
}

/**
 * Models tuned to roughly match published frequency-response measurements of
 * representative pickups. They're approximations — real pickups vary widely
 * even within the same family — but the relative differences are accurate.
 */
export const PICKUPS: Record<PickupId, PickupModel> = {
  flat: {
    id: 'flat',
    label: 'Flat (no pickup)',
    category: 'flat',
    description:
      'No coloration. The raw source as-is. Use this for live input from a guitar that already has its own pickup character.',
    resonantFreq: 3000,
    resonantQ: 0.1,
    resonantGainDb: 0,
    lowShelfFreq: 100,
    lowShelfGainDb: 0,
    highShelfFreq: 8000,
    highShelfGainDb: 0,
    outputGainDb: 0,
  },
  'strat-bridge': {
    id: 'strat-bridge',
    label: 'Strat Bridge',
    category: 'single',
    description:
      'Stratocaster bridge single-coil. Bright, dynamic, biting upper-mids. The classic SRV / Knopfler / Hendrix single-note clarity.',
    resonantFreq: 4400,
    resonantQ: 1.8,
    resonantGainDb: 4.5,
    lowShelfFreq: 200,
    lowShelfGainDb: -2,
    highShelfFreq: 7000,
    highShelfGainDb: -2,
    outputGainDb: -2,
  },
  'strat-middle': {
    id: 'strat-middle',
    label: 'Strat Middle',
    category: 'single',
    description:
      'Stratocaster middle pickup. Slightly darker than bridge, balanced. Position 4 (middle + neck) is "quack" territory.',
    resonantFreq: 3800,
    resonantQ: 1.6,
    resonantGainDb: 4,
    lowShelfFreq: 180,
    lowShelfGainDb: -1,
    highShelfFreq: 7000,
    highShelfGainDb: -2,
    outputGainDb: -2,
  },
  'strat-neck': {
    id: 'strat-neck',
    label: 'Strat Neck',
    category: 'single',
    description:
      'Stratocaster neck single-coil. Warm but still bright — the "vocal" position favored by John Mayer-style modern blues.',
    resonantFreq: 2900,
    resonantQ: 1.4,
    resonantGainDb: 3.5,
    lowShelfFreq: 150,
    lowShelfGainDb: 0,
    highShelfFreq: 7000,
    highShelfGainDb: -2,
    outputGainDb: -2,
  },
  'tele-bridge': {
    id: 'tele-bridge',
    label: 'Tele Bridge',
    category: 'single',
    description:
      'Telecaster bridge single-coil. Brighter and more "twangy" than a Strat bridge due to its baseplate. Country, chicken-pickin\', cutting rhythm.',
    resonantFreq: 4800,
    resonantQ: 2.2,
    resonantGainDb: 5,
    lowShelfFreq: 220,
    lowShelfGainDb: -2.5,
    highShelfFreq: 7500,
    highShelfGainDb: -1,
    outputGainDb: -1.5,
  },
  'tele-neck': {
    id: 'tele-neck',
    label: 'Tele Neck',
    category: 'single',
    description:
      'Telecaster neck pickup (covered). Dark, jazzy, mid-rich. Some classic Teles have an almost humbucker-like neck tone here.',
    resonantFreq: 2400,
    resonantQ: 1.5,
    resonantGainDb: 3,
    lowShelfFreq: 150,
    lowShelfGainDb: 1,
    highShelfFreq: 6000,
    highShelfGainDb: -3,
    outputGainDb: -2,
  },
  p90: {
    id: 'p90',
    label: 'P90',
    category: 'p90',
    description:
      'Single-coil with humbucker-like windings. Fatter and more aggressive than a Strat or Tele, brighter than a humbucker. Punk, alt-rock, blues-rock.',
    resonantFreq: 3000,
    resonantQ: 1.6,
    resonantGainDb: 5,
    lowShelfFreq: 180,
    lowShelfGainDb: 1.5,
    highShelfFreq: 6500,
    highShelfGainDb: -2,
    outputGainDb: 0,
  },
  'humbucker-bridge': {
    id: 'humbucker-bridge',
    label: 'Humbucker Bridge',
    category: 'humbucker',
    description:
      'Les Paul / SG-style bridge humbucker. Smooth, mid-forward, thick. The "rock" tone — pushes amps into nice saturation.',
    resonantFreq: 2400,
    resonantQ: 1.4,
    resonantGainDb: 4.5,
    lowShelfFreq: 150,
    lowShelfGainDb: 2.5,
    highShelfFreq: 5500,
    highShelfGainDb: -3.5,
    outputGainDb: 1,
  },
  'humbucker-neck': {
    id: 'humbucker-neck',
    label: 'Humbucker Neck',
    category: 'humbucker',
    description:
      'Les Paul-style neck humbucker. Dark, jazzy, "woolly". The Carlos Santana / B.B. King smooth lead position.',
    resonantFreq: 2000,
    resonantQ: 1.3,
    resonantGainDb: 4,
    lowShelfFreq: 130,
    lowShelfGainDb: 3,
    highShelfFreq: 5000,
    highShelfGainDb: -4,
    outputGainDb: 1.5,
  },
};

export const PICKUP_LIST: PickupModel[] = Object.values(PICKUPS);

/**
 * The audio chain that applies pickup coloration to whatever passes through.
 * Wired as: input → lowShelf → resonance → highShelf → outputGain → output.
 */
export class PickupFilter {
  readonly input: Tone.Gain;
  readonly output: Tone.Gain;

  private lowShelf: Tone.Filter;
  private resonance: Tone.Filter;
  private highShelf: Tone.Filter;
  private outputGain: Tone.Gain;

  constructor() {
    this.input = new Tone.Gain(1);
    this.output = new Tone.Gain(1);

    this.lowShelf = new Tone.Filter({
      type: 'lowshelf',
      frequency: 100,
      gain: 0,
    });
    this.resonance = new Tone.Filter({
      type: 'peaking',
      frequency: 4400,
      Q: 1.8,
      gain: 0,
    });
    this.highShelf = new Tone.Filter({
      type: 'highshelf',
      frequency: 7000,
      gain: 0,
    });
    this.outputGain = new Tone.Gain(1);

    this.input.connect(this.lowShelf);
    this.lowShelf.connect(this.resonance);
    this.resonance.connect(this.highShelf);
    this.highShelf.connect(this.outputGain);
    this.outputGain.connect(this.output);
  }

  setModel(model: PickupModel) {
    this.lowShelf.frequency.value = model.lowShelfFreq;
    this.lowShelf.gain.value = model.lowShelfGainDb;
    this.resonance.frequency.value = model.resonantFreq;
    this.resonance.Q.value = Math.max(0.1, model.resonantQ);
    this.resonance.gain.value = model.resonantGainDb;
    this.highShelf.frequency.value = model.highShelfFreq;
    this.highShelf.gain.value = model.highShelfGainDb;
    this.outputGain.gain.value = Tone.dbToGain(model.outputGainDb);
  }

  dispose() {
    [
      this.input,
      this.output,
      this.lowShelf,
      this.resonance,
      this.highShelf,
      this.outputGain,
    ].forEach((n) => n.dispose());
  }
}
