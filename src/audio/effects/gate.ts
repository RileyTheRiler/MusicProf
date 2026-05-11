import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Noise gate. Cuts the signal below a threshold to silence hum and pickup
 * noise during pauses. Tone.Gate uses a Follower-driven side-chain that
 * compares the input envelope to a threshold; below threshold the signal is
 * muted, above it passes through.
 */
export const noiseGateDef: EffectDefinition = {
  id: 'gate',
  displayName: 'Noise Gate',
  category: 'input',
  shortDescription:
    'Mutes the signal below a threshold to suppress hum and pickup hiss between notes.',
  implemented: true,
  params: [
    {
      id: 'threshold',
      label: 'Threshold',
      min: -80,
      max: -20,
      step: 0.5,
      default: -50,
      unit: 'dB',
      description:
        'Level below which the signal is silenced. Set just above the noise floor of your guitar.',
    },
    {
      id: 'smoothing',
      label: 'Smoothing',
      min: 0.005,
      max: 0.2,
      step: 0.005,
      default: 0.05,
      unit: 's',
      description:
        'How fast the gate opens and closes. Faster = snappier (can chatter); slower = smoother but may swallow note attacks.',
    },
  ],
  lesson: {
    tldr: 'A gate is a volume control that opens when you play and closes when you don\'t.',
    whatItDoes:
      'A gate watches the input level. Above the threshold, it passes signal through unchanged. Below, it cuts the volume to zero (or attenuates by a set amount). Critical for high-gain rigs where pickup hum and amp hiss are otherwise audible during pauses.',
    physics:
      'Opposite of a compressor: instead of reducing gain when loud, it reduces gain when quiet. Internally, an envelope follower (Follower) tracks the input level using a low-pass on the rectified signal. That envelope is compared to the threshold; when below, output gain ramps to zero with a smoothing time.',
    signalImpact: [
      'Silences signal below threshold',
      'Can chatter on slow note decay if smoothing is too fast',
      'Best placed early in the chain (before drive/amp) to gate noise from the source',
      'For high-gain metal, often placed AFTER drive too, with a faster setting',
    ],
    headrushNotes:
      'The Prime has a built-in noise gate per signal chain plus a dedicated Gate block. Set threshold so the gate opens cleanly on pick attack but closes between notes. Pair with high-gain amps to tame hum.',
    paramTips: {
      threshold:
        'Start at -60 dB. If you hear chatter (gate opening/closing during note tails), lower the threshold by a few dB. If notes get cut off, raise it.',
      smoothing:
        '50 ms (default) is a good starting point. 5–20 ms feels snappier — useful for percussive djent. 100 ms+ is gentle and natural for cleans.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0);
    const wetBus = new Tone.Gain(1);

    const gate = new Tone.Gate({ threshold: -50, smoothing: 0.05 });

    input.connect(gate);
    gate.connect(wetBus);
    wetBus.connect(output);

    input.connect(dryBus);
    dryBus.connect(output);

    return {
      input,
      output,
      setParam(id, value) {
        if (id === 'threshold') gate.threshold = value;
        if (id === 'smoothing') gate.smoothing = value;
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
        [input, output, dryBus, wetBus, gate].forEach((n) => n.dispose());
      },
    };
  },
};
