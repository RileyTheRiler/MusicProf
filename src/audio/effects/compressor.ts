import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Studio-style downward compressor. Tames peaks above the threshold by ratio:1
 * with adjustable attack/release, then makeup-gain back to unity-ish.
 */
export const compressorDef: EffectDefinition = {
  id: 'comp-studio',
  displayName: 'Studio Compressor',
  category: 'comp',
  shortDescription:
    'Reduces the loudest parts of your signal so the quiet parts can be turned up — adds sustain and evens out picking.',
  implemented: true,
  params: [
    {
      id: 'threshold',
      label: 'Threshold',
      min: -60,
      max: 0,
      step: 0.5,
      default: -24,
      unit: 'dB',
      description:
        'Level above which the compressor starts reducing gain. Lower threshold = more compression.',
    },
    {
      id: 'ratio',
      label: 'Ratio',
      min: 1,
      max: 20,
      step: 0.1,
      default: 4,
      unit: ':1',
      description:
        'How aggressively to squash above threshold. 4:1 means 4 dB over threshold becomes 1 dB out.',
    },
    {
      id: 'attack',
      label: 'Attack',
      min: 0.001,
      max: 0.2,
      step: 0.001,
      default: 0.01,
      unit: 's',
      curve: 'log',
      description:
        'How fast the compressor clamps down. Fast attack catches transients; slow attack lets them through.',
    },
    {
      id: 'release',
      label: 'Release',
      min: 0.05,
      max: 2,
      step: 0.01,
      default: 0.25,
      unit: 's',
      curve: 'log',
      description:
        'How fast the gain recovers after the signal drops below threshold.',
    },
    {
      id: 'makeup',
      label: 'Makeup',
      min: 0,
      max: 24,
      step: 0.5,
      default: 6,
      unit: 'dB',
      description: 'Output gain to compensate for the volume the comp pulled out.',
    },
  ],
  lesson: {
    tldr: 'Compression squashes the dynamic range — loud parts get quieter, then everything is brought back up — making notes feel even and sustained.',
    whatItDoes:
      'A guitar pickup outputs a wide dynamic range: pick attacks are loud spikes, sustained portions of the note are much quieter. A compressor watches the signal level, and any time it exceeds your threshold, it turns the gain DOWN by a programmable ratio. Then you boost the whole signal back up with "makeup gain". Net result: quiet parts are louder relative to loud parts, so notes sound more even and seem to sustain forever.',
    physics:
      'A compressor is a feedback gain control. A side-chain detector measures input level (RMS or peak), and when it exceeds threshold, gain reduction = (input_dB − threshold) × (1 − 1/ratio). Attack time is how fast the gain reduction "engages" — fast attack squashes transients, slow lets the pick attack pop through. Release time is how fast it lets go after the signal drops, controlling the "breathing" character.',
    signalImpact: [
      'Reduces dynamic range (loud quieter, quiet relatively louder)',
      'Increases perceived sustain dramatically',
      'Slow attack preserves pick transients ("chicken pickin\'" funk tone)',
      'Heavy compression can cause "pumping" — audible volume swells as the comp recovers',
      'Pushes background noise UP along with the signal — comp before drive amplifies hiss',
    ],
    headrushNotes:
      'On the Headrush Prime, this maps to the Compressor block. The "Studio Compressor" model has these exact parameters. The "Pedal Compressor" (Dyna Comp / Boss CS-style) typically has just two knobs (Sustain + Level) — that\'s a comp with hidden, fixed ratio/attack/release. Country and clean funk players usually put comp FIRST in the chain. Some metal/rock players use it AFTER drive for a tight, even rhythm.',
    paramTips: {
      threshold:
        'Set so the comp engages only on pick attacks (look for ~3–6 dB of gain reduction on hits, none in between).',
      ratio:
        '2:1–4:1 = gentle leveling. 6:1–10:1 = pronounced "country comp" sustain. 20:1 = effectively a limiter.',
      attack:
        'Fast (1–5 ms) catches every transient, kills "snap". Medium (10–30 ms) lets the pick attack through but tames sustain. Funk/country pickers often use 20–50 ms.',
      release:
        '100–250 ms is a safe default. Long release (500 ms+) keeps the comp "down" between notes for very even sustain. Too short = audible pumping.',
      makeup:
        'Set so bypass and engaged sound about the same volume — that\'s how you A/B fairly. The classic mistake is making the comped signal louder and thinking it sounds "better" when it\'s just louder.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0);
    const wetBus = new Tone.Gain(1);

    const comp = new Tone.Compressor({
      threshold: -24,
      ratio: 4,
      attack: 0.01,
      release: 0.25,
      knee: 6,
    });
    const makeup = new Tone.Gain(Tone.dbToGain(6));

    input.connect(comp);
    comp.connect(makeup);
    makeup.connect(wetBus);
    wetBus.connect(output);

    input.connect(dryBus);
    dryBus.connect(output);

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'threshold':
            comp.threshold.value = value;
            break;
          case 'ratio':
            comp.ratio.value = value;
            break;
          case 'attack':
            comp.attack.value = value;
            break;
          case 'release':
            comp.release.value = value;
            break;
          case 'makeup':
            makeup.gain.value = Tone.dbToGain(value);
            break;
        }
      },
      setBypass(b) {
        if (b) {
          wetBus.gain.value = 0;
          dryBus.gain.value = 1;
        } else {
          wetBus.gain.value = 1;
          dryBus.gain.value = 0;
        }
      },
      dispose() {
        [input, output, dryBus, wetBus, comp, makeup].forEach((n) =>
          n.dispose()
        );
      },
    };
  },
};
