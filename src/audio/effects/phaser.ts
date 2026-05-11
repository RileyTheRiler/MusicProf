import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Classic phaser using Tone.Phaser (cascade of all-pass filters with an LFO
 * sweeping their cutoffs).
 */
export const phaserDef: EffectDefinition = {
  id: 'phaser',
  displayName: 'Phaser',
  category: 'mod',
  shortDescription:
    'All-pass filter chain that creates moving notches without delay — swirly, watery effect.',
  implemented: true,
  params: [
    {
      id: 'rate',
      label: 'Rate',
      min: 0.05,
      max: 8,
      step: 0.01,
      default: 0.5,
      unit: 'Hz',
      description:
        'How fast the LFO sweeps the all-pass filters. Slow = lush; fast = jet/synth wobble.',
    },
    {
      id: 'octaves',
      label: 'Sweep Range',
      min: 0.5,
      max: 6,
      step: 0.1,
      default: 3,
      unit: 'oct',
      description:
        'How wide the LFO sweep is, measured in octaves. Wider = more dramatic.',
    },
    {
      id: 'baseFreq',
      label: 'Base Freq',
      min: 100,
      max: 1500,
      step: 10,
      default: 350,
      unit: 'Hz',
      curve: 'log',
      description:
        'Lowest filter frequency in the sweep. Lower = darker phasing; higher = brighter, more vocal.',
    },
    {
      id: 'mix',
      label: 'Mix',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      description: 'Wet/dry blend.',
    },
  ],
  lesson: {
    tldr: 'Phaser uses a chain of all-pass filters whose phase response is swept by an LFO, creating moving notches when summed with the dry signal.',
    whatItDoes:
      'Unlike a flanger, a phaser does NOT use delay. It uses 2/4/6/8 all-pass filters in series, each shifting phase but not amplitude. Mixing the phase-shifted output with the dry creates comb-like notches at frequencies determined by the filter design. Modulating the all-pass cutoffs sweeps those notches across the spectrum.',
    physics:
      'An all-pass filter has flat magnitude response but a frequency-dependent phase shift. Cascading 4 of them creates 2 notches in the summed (wet+dry) output (one notch per filter pair). Phase shift at the notch is exactly 180° so the wet and dry cancel against each other. Sweeping the cutoffs sweeps the notches, producing the characteristic "swirling" sound.',
    signalImpact: [
      'Moving notches in the spectrum (fewer than a flanger, smoother)',
      'No delay = no comb stack = sounds smoother than flanging',
      'Subtle and musical — perfect for clean rhythm guitar',
      'Often confused with flanger; the difference is "no delay" → no metallic ringing',
    ],
    headrushNotes:
      'On the Headrush Prime, Modulation block. Try the "Phase 90" or "Phase 100" model — single Rate knob on the originals; Prime gives you Depth, Stages, Mix too. Famous uses: Eddie Van Halen\'s rhythm tone (Phase 90), David Gilmour\'s "Have a Cigar" / many Floyd parts.',
    paramTips: {
      rate: '0.2–0.6 Hz = classic Van Halen / Floyd swirl. 1–2 Hz = more obvious wobble. 4 Hz+ = synth-y warble.',
      octaves: '2–4 octaves = standard. Below 1 = subtle "tone shift". Above 5 = wild and obvious — almost a wah.',
      baseFreq:
        'Around 300–500 Hz = traditional warm phaser. Below 200 = dark, moody. Above 800 = bright, "vocal" phaser.',
      mix: '50/50 is canonical. Lower = subtle tone movement. Higher = more "phasey"; at 100% the dry disappears and you hear pure all-pass output (sounds nearly identical to dry, since all-pass has flat magnitude).',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0.5);
    const wetBus = new Tone.Gain(0.5);

    const phaser = new Tone.Phaser({
      frequency: 0.5,
      octaves: 3,
      baseFrequency: 350,
      wet: 1,
    });

    input.connect(phaser);
    phaser.connect(wetBus);
    wetBus.connect(output);

    input.connect(dryBus);
    dryBus.connect(output);

    let bypass = false;
    let lastMix = 0.5;

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'rate':
            phaser.frequency.value = value;
            break;
          case 'octaves':
            phaser.octaves = value;
            break;
          case 'baseFreq':
            phaser.baseFrequency = value;
            break;
          case 'mix':
            lastMix = value;
            if (!bypass) {
              wetBus.gain.value = value;
              dryBus.gain.value = 1 - value;
            }
            break;
        }
      },
      setBypass(b) {
        bypass = b;
        if (b) {
          wetBus.gain.value = 0;
          dryBus.gain.value = 1;
        } else {
          wetBus.gain.value = lastMix;
          dryBus.gain.value = 1 - lastMix;
        }
      },
      dispose() {
        [input, output, dryBus, wetBus, phaser].forEach((n) => n.dispose());
      },
    };
  },
};
