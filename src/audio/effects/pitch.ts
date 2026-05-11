import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Pitch shifter / harmonizer. Built on Tone.PitchShift (granular resampling).
 * Mixed with the dry signal so you hear both original and shifted note —
 * that's the harmonizer use case. Set mix to 100% for pure octaver / whammy.
 */
export const pitchShifterDef: EffectDefinition = {
  id: 'pitch-shifter',
  displayName: 'Pitch Shifter / Octaver',
  category: 'pitch',
  shortDescription:
    'Generates a copy of your signal at a different pitch — fixed interval (octaver) or any interval (harmonizer).',
  implemented: true,
  params: [
    {
      id: 'interval',
      label: 'Interval',
      min: -24,
      max: 24,
      step: 1,
      default: -12,
      unit: 'st',
      description:
        'Shift in semitones. -12 = one octave down. +7 = perfect fifth up. +12 = one octave up. +24 = two octaves up.',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      min: 0,
      max: 0.85,
      step: 0.01,
      default: 0,
      description:
        'Feed the shifted signal back through the pitch shifter. Cascading shifts produce arpeggios at high feedback values. 0 for clean single-interval shift.',
    },
    {
      id: 'mix',
      label: 'Mix',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      description:
        'Wet/dry blend. 50/50 = harmonizer (both notes audible). 100% wet = octaver/whammy (only the shifted note).',
    },
  ],
  lesson: {
    tldr: 'Pitch shifters use granular resampling or phase vocoder algorithms to play your signal back at a different pitch without changing time.',
    whatItDoes:
      'Two main techniques: (1) **granular** — chop the audio into tiny grains (~30 ms each), resample each at a different rate, and overlap-add at the new pitch; (2) **phase vocoder** — FFT the signal, shift the bin frequencies, IFFT back. Octaver pedals like the Boss OC-2 use simpler analog methods (square-wave generation from the input) that only work on monophonic signals.',
    physics:
      'Granular pitch shifting trades latency for tracking accuracy. The grain size determines a trade-off: short grains = low latency but audible "wobble" artifacts; long grains = clean tone but ~50 ms latency, audible as a slap-back. Phase vocoder is more "clean" but introduces transient smearing — that\'s why octavers feel "synthy". Real-time pitch shifting is one of the hardest problems in DSP.',
    signalImpact: [
      'Adds pitched harmony at chosen interval',
      'Always introduces some latency (a few ms to ~30 ms)',
      'Tracking artifacts on complex sources (chords are harder than single notes)',
      'At high feedback, cascading shifts can produce arpeggio-like effects',
    ],
    headrushNotes:
      'On the Headrush Prime: Pitch block. Models include Pitch Shifter, Whammy (pedal-controlled continuous shift), Octaver, and Harmonizer (key-aware harmony — uses scale data to keep harmonies in key). Try +7 (perfect fifth) for power-chord harmonies, -12 for a bass-like octave-down doubling.',
    paramTips: {
      interval:
        '-12 = octave down (chunky bass double). -7 = fifth down. +5 = fourth up (classic Hendrix harmony). +7 = fifth up (power-chord harmony). +12 = octave up (synthy thin double).',
      feedback:
        '0 for normal use. 0.5–0.7 = cascading shift produces a stair-step pitch-rise effect (an arpeggio of intervals). 0.8+ is a special effect.',
      mix: 'Octaver: 100% wet (only the shifted note). Harmonizer: 50/50 (both audible). Subtle thickening: 20–30%.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0.5);
    const wetBus = new Tone.Gain(0.5);

    const shift = new Tone.PitchShift({
      pitch: -12,
      windowSize: 0.1,
      feedback: 0,
      wet: 1,
    });

    input.connect(shift);
    shift.connect(wetBus);
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
          case 'interval':
            shift.pitch = value;
            break;
          case 'feedback':
            shift.feedback.value = Math.min(0.9, Math.max(0, value));
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
        [input, output, dryBus, wetBus, shift].forEach((n) => n.dispose());
      },
    };
  },
};
