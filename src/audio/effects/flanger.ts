import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Stereo flanger: a short delay (1–10 ms) modulated by an LFO, mixed with
 * the dry signal, with optional feedback. The short delay creates comb
 * filtering across the spectrum; the LFO sweeps it; feedback emphasizes
 * the resonant peaks.
 *
 * Tone.js doesn't ship a built-in Flanger, so we build one out of primitives.
 */
export const flangerDef: EffectDefinition = {
  id: 'flanger',
  displayName: 'Flanger',
  category: 'mod',
  shortDescription:
    'Short, LFO-modulated delay + feedback. Comb filtering produces the iconic "jet plane" sweep.',
  implemented: true,
  params: [
    {
      id: 'rate',
      label: 'Rate',
      min: 0.05,
      max: 6,
      step: 0.01,
      default: 0.3,
      unit: 'Hz',
      description:
        'How fast the LFO sweeps the delay time. Slow = lush; fast = nervous.',
    },
    {
      id: 'depth',
      label: 'Depth',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.6,
      description:
        'How much the delay time sweeps. More depth = wider sweep = more dramatic.',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      min: 0,
      max: 0.92,
      step: 0.01,
      default: 0.45,
      description:
        'How much of the delayed signal feeds back into the input. More feedback = more resonant, metallic "jet" sound. Near 1.0 self-oscillates.',
    },
    {
      id: 'mix',
      label: 'Mix',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.5,
      description:
        'Wet/dry blend. 50/50 is canonical for hearing maximum comb filtering.',
    },
  ],
  lesson: {
    tldr: 'Flanger = short delay (1–10 ms) modulated by an LFO, mixed with the dry signal, with feedback for resonance.',
    whatItDoes:
      'When you mix a signal with a 1–10 ms delayed copy of itself, you get **comb filtering** — peaks and notches at integer multiples of the delay frequency. Modulating the delay time sweeps those notches up and down — the classic "jet plane" whoosh. Feedback into the delay accentuates the peaks, making the effect more resonant and metallic.',
    physics:
      'A delay of D milliseconds creates notches at frequencies (n + 0.5) / D Hz for integer n. A 5 ms delay puts notches at 100 Hz, 300 Hz, 500 Hz... Modulating D sweeps the entire comb. Feedback effectively boosts the peaks between the notches (a positive feedback loop with gain < 1 = resonant peak). The classic "tape flanger" was created in the 60s by pressing a finger on a tape reel to slow it down briefly, mixing the slowed-down tape with a non-slowed copy.',
    signalImpact: [
      'Comb filtering — adds resonant peaks and notches across the spectrum',
      'Sweeping creates a moving "spectral fingerprint"',
      'Can be subtle (low feedback, 30% mix) or extreme/metallic (high feedback, 50/50 mix)',
      'Self-oscillates at feedback near 1.0 — sound-effect territory',
    ],
    headrushNotes:
      'On the Headrush Prime: Modulation block. Try the "Through-Zero Flanger" model for the original tape-flanger sound (where the wet and dry signals pass through each other at zero delay — produces a unique cancellation point). Eddie Van Halen used flanger extensively on Van Halen I and II; the "Unchained" intro is a great example.',
    paramTips: {
      rate: '0.2–0.6 Hz = slow, lush sweeps (Van Halen "Unchained"). 1–2 Hz = nervous wobble. 4 Hz+ = synth-y / sound-effect.',
      depth:
        '0.3–0.6 = noticeable but musical. 0.8+ becomes obvious and "showy".',
      feedback:
        '0–0.3 = chorus-like, no resonance. 0.4–0.7 = classic flanger character. 0.8+ = metallic / jet plane. 0.9+ self-oscillates and is a sound effect.',
      mix: '50/50 is canonical — you need both wet and dry for the comb to form. Lower or higher mix actually *weakens* the comb filtering.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0.5);
    const wetBus = new Tone.Gain(0.5);

    // Base delay around 5 ms; LFO modulates between (base - depth*range) and
    // (base + depth*range). We'll set the LFO output to drive delayTime.
    const baseDelayMs = 5;
    const rangeMs = 4;

    const delay = new Tone.Delay({
      delayTime: baseDelayMs / 1000,
      maxDelay: 0.05,
    });
    const feedbackGain = new Tone.Gain(0.45);
    const lfo = new Tone.LFO({
      frequency: 0.3,
      min: (baseDelayMs - rangeMs * 0.6) / 1000,
      max: (baseDelayMs + rangeMs * 0.6) / 1000,
      type: 'sine',
    }).start();

    lfo.connect(delay.delayTime);

    // Wet path with feedback
    input.connect(delay);
    delay.connect(feedbackGain);
    feedbackGain.connect(delay);
    delay.connect(wetBus);
    wetBus.connect(output);

    // Dry path
    input.connect(dryBus);
    dryBus.connect(output);

    let bypass = false;
    let lastMix = 0.5;
    let currentDepth = 0.6;

    const applyDepth = () => {
      const range = rangeMs * Math.min(1, Math.max(0, currentDepth));
      lfo.min = Math.max(0.1, baseDelayMs - range) / 1000;
      lfo.max = (baseDelayMs + range) / 1000;
    };

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'rate':
            lfo.frequency.value = value;
            break;
          case 'depth':
            currentDepth = value;
            applyDepth();
            break;
          case 'feedback':
            feedbackGain.gain.value = Math.min(0.95, Math.max(0, value));
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
        lfo.disconnect(delay.delayTime);
        [input, output, dryBus, wetBus, delay, feedbackGain, lfo].forEach((n) =>
          n.dispose()
        );
      },
    };
  },
};
