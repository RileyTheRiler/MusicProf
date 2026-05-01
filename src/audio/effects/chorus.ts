import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Stereo chorus: an LFO-modulated short delay mixed with the dry signal,
 * producing pitch-shimmering "doubled" voices.
 */
export const chorusDef: EffectDefinition = {
  id: 'mod-chorus',
  displayName: 'Chorus',
  category: 'mod',
  shortDescription:
    'Detunes a copy of your signal with a slow LFO, simulating multiple players in unison.',
  implemented: true,
  params: [
    {
      id: 'rate',
      label: 'Rate',
      min: 0.05,
      max: 8,
      step: 0.01,
      default: 0.8,
      unit: 'Hz',
      description:
        'How fast the LFO sweeps the delay time. Slow = lush; fast = warbly Leslie/vibrato territory.',
    },
    {
      id: 'depth',
      label: 'Depth',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      description:
        'How much pitch wobble. More depth = more dramatic chorusing/detuning.',
    },
    {
      id: 'spread',
      label: 'Spread',
      min: 0,
      max: 180,
      step: 1,
      default: 120,
      unit: 'deg',
      description:
        'Stereo width. 0° = mono. 180° = LFO is in opposite phase between L/R = wide stereo.',
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
    tldr: 'Chorus is a short, modulated delay mixed with the dry signal — the modulation creates pitch shifts that simulate multiple slightly-out-of-tune voices.',
    whatItDoes:
      'Take your dry signal, copy it into a short delay (~10–30 ms), but slowly sweep that delay time up and down with a low-frequency oscillator (LFO). When delay time changes, pitch changes (like Doppler shifting) — wobbling up and down by a few cents. Mixing this slightly-detuned copy back with the dry signal sounds like two guitarists playing the same part — a "chorus" of voices.',
    physics:
      'Why does changing delay time change pitch? Because if you read a sample faster than it was recorded, the pitch goes up; slower, it goes down. An LFO sweeping between, say, 15 ms and 25 ms does this continuously. Stereo chorus uses two delay lines with the LFO 90° or 180° out of phase between L and R, so the pitch wobble moves around the stereo field — that\'s the "spread" knob.',
    signalImpact: [
      'Thickens single notes; makes them sound like a doubled/tracked part',
      'Adds stereo width even from a mono source',
      'Reduces apparent pitch precision (good for ambient parts, bad for tight rhythm)',
      'High depth + high rate becomes pitch vibrato',
    ],
    headrushNotes:
      'On the Headrush Prime, this lives under the Modulation/FX block. Try the "Chorus" model — Rate, Depth, Mix line up directly. "Flanger" is a related effect with a much shorter delay (1–10 ms) and feedback, producing a metallic "jet-plane" sweep. "Phaser" is similar in vibe but uses notch filters instead of delay.',
    paramTips: {
      rate: '0.3–1 Hz = lush 80s rock chorus. 2–5 Hz = nervous, vintage Leslie. 6 Hz+ with high depth = synth-like vibrato.',
      depth:
        '0.2–0.4 = subtle, "is it on?" thickening. 0.5–0.7 = obvious, classic chorus. 1.0 = warbly, almost detuned-broken.',
      spread:
        '0° collapses everything to mono — useful for confirming the effect with a single speaker. 180° = max width.',
      mix: '50/50 is the textbook chorus mix. Below 30% = subtle widening. Above 70% = the dry note disappears into the wobble.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0.5);
    const wetBus = new Tone.Gain(0.5);

    const chorus = new Tone.Chorus({
      frequency: 0.8,
      delayTime: 3.5,
      depth: 0.5,
      spread: 120,
      wet: 1,
    }).start();

    input.connect(chorus);
    chorus.connect(wetBus);
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
            chorus.frequency.value = value;
            break;
          case 'depth':
            chorus.depth = value;
            break;
          case 'spread':
            chorus.spread = value;
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
        [input, output, dryBus, wetBus, chorus].forEach((n) => n.dispose());
      },
    };
  },
};
