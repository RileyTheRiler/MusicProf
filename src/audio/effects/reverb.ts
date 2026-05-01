import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Algorithmic hall reverb (Schroeder/Freeverb-style). Live-tweakable params,
 * unlike convolution reverb which has to regenerate impulses on size change.
 */
export const reverbDef: EffectDefinition = {
  id: 'reverb-hall',
  displayName: 'Hall Reverb',
  category: 'reverb',
  shortDescription:
    'Simulates the diffuse, lingering reflections of a large room.',
  implemented: true,
  params: [
    {
      id: 'size',
      label: 'Size',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.7,
      description:
        'How big the simulated space is. Bigger room = longer decay, more diffuse tail.',
    },
    {
      id: 'dampening',
      label: 'Dampening',
      min: 1000,
      max: 16000,
      step: 100,
      default: 6000,
      unit: 'Hz',
      curve: 'log',
      description:
        'How quickly high frequencies fade in the tail. Lower = darker, plush hall; higher = bright, cathedral-shimmery.',
    },
    {
      id: 'preDelay',
      label: 'Pre-Delay',
      min: 0,
      max: 200,
      step: 1,
      default: 30,
      unit: 'ms',
      description:
        'Silent gap between the dry note and the start of the reverb. Adds clarity by separating direct sound from reflections.',
    },
    {
      id: 'mix',
      label: 'Mix',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.35,
      description:
        'Wet/dry blend. 0 = no reverb, 1 = only the reverberated signal (no dry).',
    },
  ],
  lesson: {
    tldr: 'Reverb is thousands of overlapping echoes simulating sound bouncing around a real space.',
    whatItDoes:
      'When you play a note in a room, the sound radiates in every direction, hits walls/ceiling/floor, bounces back at slightly different times and angles, and arrives at your ears as a dense cloud of attenuated copies. Reverb effects synthesize that cloud digitally — either with a network of feedback delay lines (algorithmic) or by convolving your signal with a recording of a real space (convolution / IR).',
    physics:
      'A reverb has three perceptual phases: (1) the direct sound — your dry signal — arriving first; (2) "early reflections" — a few discrete bounces off nearby surfaces, arriving 5–50 ms later, telling your brain the size and shape of the room; (3) the "late reverb tail" — a dense, exponentially decaying wash. The decay length depends on room size and how absorbent the surfaces are. High frequencies always decay faster than lows in real rooms, because air and soft materials absorb treble more.',
    signalImpact: [
      'Adds energy after the note ends, extending perceived sustain',
      'Smears transients in time, softening pick attack',
      'Pushes the sound "back" in the mix (depth/distance cue)',
      'Can mask pitch detail and muddy busy chord progressions if overused',
    ],
    headrushNotes:
      'On the Headrush Prime, this maps to the Reverb block. Try the "Hall" model — its Decay knob = our "Size", Damping knob = our "Dampening", Mix and Pre-Delay are identical. "Plate" is brighter and metallic; "Spring" mimics the boingy reverb tank in old Fender amps; "Shimmer" adds a pitch-shifted +octave to the tail.',
    paramTips: {
      size: 'Below 0.3 = small room. 0.4–0.6 = studio/medium hall. 0.7+ = cathedral / ambient pad territory.',
      dampening:
        'Around 4–6 kHz feels natural — like a wood-paneled hall. Crank to 16 kHz for bright, glassy reverbs. Drop to 1.5 kHz for a dark, blanket-on-the-amp vibe.',
      preDelay:
        '0–10 ms = reverb glued to the note. 30–60 ms = vocal-style separation. 80–120 ms approaches "slap echo + reverb" territory.',
      mix: '20–35% is a typical "ambience" setting where you sense the room without it being obvious. 50%+ is an "effect" setting — clearly washy. 100% is a pad.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0.65);
    const wetBus = new Tone.Gain(0.35);

    const preDelay = new Tone.Delay({ delayTime: 0.03, maxDelay: 0.5 });
    const reverb = new Tone.Freeverb({ roomSize: 0.7, dampening: 6000 });
    reverb.wet.value = 1; // we control mix externally via dry/wet bus gains

    // Wet path
    input.connect(preDelay);
    preDelay.connect(reverb);
    reverb.connect(wetBus);
    wetBus.connect(output);

    // Dry path
    input.connect(dryBus);
    dryBus.connect(output);

    let bypass = false;
    let lastMix = 0.35;

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'size':
            reverb.roomSize.value = Math.min(0.99, Math.max(0, value));
            break;
          case 'dampening':
            reverb.dampening = value;
            break;
          case 'preDelay':
            preDelay.delayTime.value = value / 1000;
            break;
          case 'mix': {
            lastMix = value;
            if (!bypass) {
              wetBus.gain.value = value;
              dryBus.gain.value = 1 - value;
            }
            break;
          }
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
        [input, output, dryBus, wetBus, preDelay, reverb].forEach((n) =>
          n.dispose()
        );
      },
    };
  },
};
