import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * 3-band parametric-ish EQ: low shelf, mid bell, high shelf.
 * Matches the "Bass / Mid / Treble" stack found on most amps and the Headrush
 * "Studio EQ" / "Parametric EQ" blocks.
 */
export const eqDef: EffectDefinition = {
  id: 'eq-3band',
  displayName: '3-Band EQ',
  category: 'eq',
  shortDescription:
    'Boosts or cuts low, mid, and high frequencies — the most fundamental tone-shaping tool.',
  implemented: true,
  params: [
    {
      id: 'low',
      label: 'Bass',
      min: -15,
      max: 15,
      step: 0.5,
      default: 0,
      unit: 'dB',
      description:
        'Low shelf at ~120 Hz. Boosts/cuts everything below — body, thump, low-end weight.',
    },
    {
      id: 'midGain',
      label: 'Mid',
      min: -15,
      max: 15,
      step: 0.5,
      default: 0,
      unit: 'dB',
      description:
        'Bell-shaped boost/cut at the Mid Freq. Most of "guitar tone" lives here.',
    },
    {
      id: 'midFreq',
      label: 'Mid Freq',
      min: 250,
      max: 4000,
      step: 10,
      default: 800,
      unit: 'Hz',
      curve: 'log',
      description:
        'Where the mid bell is centered. 400 Hz = "honk", 800 Hz = "vowel-y", 2 kHz = "bite", 3 kHz = "presence".',
    },
    {
      id: 'high',
      label: 'Treble',
      min: -15,
      max: 15,
      step: 0.5,
      default: 0,
      unit: 'dB',
      description:
        'High shelf at ~3 kHz. Boosts/cuts everything above — air, sparkle, fizz.',
    },
  ],
  lesson: {
    tldr: 'EQ lets you turn up or down specific frequency ranges — like a volume knob per pitch.',
    whatItDoes:
      'Every sound is a sum of frequencies. EQ filters let you select a frequency range and either boost or cut its level, leaving the rest untouched. A "shelving" filter affects everything above (or below) a corner frequency. A "bell" (or peaking) filter boosts/cuts a band centered on a frequency, controlled by Q (width).',
    physics:
      'Filters are built from feedback networks of delays and gains (digitally) or RC circuits (analog). A boost/cut in dB is multiplicative (not additive) — +6 dB = 2× amplitude, +12 dB = 4× amplitude. Cutting is generally more "transparent" than boosting; pros routinely cut problem frequencies rather than boost good ones, because cutting doesn\'t add noise or saturation.',
    signalImpact: [
      'Reshapes the timbre without changing pitch or rhythm',
      'Cutting bass before distortion makes the distortion feel "tighter"',
      'Boosting mids = the signal cuts through a band mix; scooped mids = "metal" sound that disappears in a band',
      'Excessive boosts can clip the next stage; trim the output to compensate',
    ],
    headrushNotes:
      'On the Headrush Prime, EQ blocks include "Studio EQ" (full parametric), "Graphic EQ" (10-band sliders), and the per-amp tone stacks. Putting EQ BEFORE drive shapes what the drive distorts (e.g., cut bass to keep distortion tight). Putting EQ AFTER drive shapes the final tone (e.g., scoop mids for "metal" voicing).',
    paramTips: {
      low: 'Cut −3 to −6 dB before a distortion to clean up muddy chords. Boost +2–4 dB after the cab for body.',
      midGain:
        'A +3 dB mid bump at 800 Hz makes leads "sing". A −6 dB cut at 500 Hz is the classic "scooped" metal sound.',
      midFreq:
        '400 Hz lives behind kick drums and bass guitar — boosting here can clash. 1–2 kHz is "presence" — boost to cut through. 3 kHz+ is "bite".',
      high: 'High-shelf cuts (−3 dB) tame fizzy distortion. Boosts (+2 dB) restore air after dark cabinets.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);

    const low = new Tone.Filter({
      type: 'lowshelf',
      frequency: 120,
      gain: 0,
    });
    const mid = new Tone.Filter({
      type: 'peaking',
      frequency: 800,
      Q: 1.0,
      gain: 0,
    });
    const high = new Tone.Filter({
      type: 'highshelf',
      frequency: 3000,
      gain: 0,
    });

    input.connect(low);
    low.connect(mid);
    mid.connect(high);
    high.connect(output);

    let bypass = false;
    let stored = { low: 0, midGain: 0, midFreq: 800, high: 0 };

    const apply = () => {
      if (bypass) {
        low.gain.value = 0;
        mid.gain.value = 0;
        high.gain.value = 0;
      } else {
        low.gain.value = stored.low;
        mid.gain.value = stored.midGain;
        mid.frequency.value = stored.midFreq;
        high.gain.value = stored.high;
      }
    };

    return {
      input,
      output,
      setParam(id, value) {
        if (id === 'low') stored.low = value;
        if (id === 'midGain') stored.midGain = value;
        if (id === 'midFreq') stored.midFreq = value;
        if (id === 'high') stored.high = value;
        apply();
      },
      setBypass(b) {
        bypass = b;
        apply();
      },
      dispose() {
        [input, output, low, mid, high].forEach((n) => n.dispose());
      },
    };
  },
};
