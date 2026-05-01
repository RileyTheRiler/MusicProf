import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * "Tube Screamer-style" overdrive:
 *   pre-gain -> waveshaper distortion -> tone (tilt-ish via LP) -> output level
 *
 * Headrush analogue: the green Tube Screamer model under the Drive block.
 */
export const distortionDef: EffectDefinition = {
  id: 'overdrive',
  displayName: 'Overdrive',
  category: 'drive',
  shortDescription:
    'Soft-clipping waveshaper that adds harmonics by squashing the wave peaks.',
  implemented: true,
  params: [
    {
      id: 'drive',
      label: 'Drive',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.4,
      description:
        'How hard the signal is pushed into the waveshaper. More drive = more clipping = more harmonics.',
    },
    {
      id: 'tone',
      label: 'Tone',
      min: 500,
      max: 8000,
      step: 10,
      default: 3500,
      unit: 'Hz',
      curve: 'log',
      description:
        'Low-pass cutoff after the clipper. Lower = darker (more bass), higher = brighter (more treble fizz).',
    },
    {
      id: 'level',
      label: 'Level',
      min: -24,
      max: 12,
      step: 0.5,
      default: 0,
      unit: 'dB',
      description: 'Output volume after the effect.',
    },
    {
      id: 'mix',
      label: 'Mix',
      min: 0,
      max: 1,
      step: 0.01,
      default: 1,
      description: 'Blend of the dry vs. distorted signal. 100% = full wet.',
    },
  ],
  lesson: {
    tldr: 'Distortion clips the waveform peaks, generating new harmonics — the spiky, sustained sound of rock guitar.',
    whatItDoes:
      'A clean guitar signal looks like a smooth, decaying sine-ish wave. A distortion pedal pushes that signal through a non-linear "waveshaper" that flattens (or squares off) the peaks. Squaring a wave mathematically introduces new overtones — odd harmonics for symmetric clipping, even+odd for asymmetric. Those harmonics are what your ear hears as "grit" or "saturation".',
    physics:
      'In the time domain: peaks get chopped flat. In the frequency domain: a single 440 Hz note now contains energy at 880 Hz, 1320 Hz, 1760 Hz, etc. Soft-clipping (smooth shoulder) sounds warmer, like a tube; hard-clipping (sharp edges) sounds harsher, like a fuzz. Compression also happens "for free" — once you hit the ceiling, louder input doesn\'t produce louder output, so notes sustain longer.',
    signalImpact: [
      'Generates new harmonics not in the original signal',
      'Compresses dynamic range (quiet and loud both pushed toward the ceiling)',
      'Increases sustain dramatically',
      'Makes single notes sound thicker; makes complex chords sound mushy (intermodulation distortion)',
    ],
    headrushNotes:
      'On the Headrush Prime, this lives in the Drive block. The "Tube Screamer" and "Klon" models are soft-clipping overdrives like this one. "Big Muff" / "Rat" / "Fuzz Face" are harder-clipping distortions/fuzzes — same family, more aggressive curve.',
    paramTips: {
      drive:
        'Below ~0.3 you get gentle "edge of breakup" — barely dirty. Around 0.5 is a typical crunchy rhythm tone. Above 0.8 chords start to fall apart from intermodulation; better for single-note leads.',
      tone: 'Most overdrives sound best with a tone cut around 2–4 kHz. Higher = the "fizz" you often hear in cheap distortion. Lower = "woolly" and dark.',
      level:
        'Use this to match levels with bypass. Many drive pedals act as "boosts" by setting level above 0 dB to push the next stage harder.',
      mix: 'Blending in dry signal (parallel distortion) keeps low-end clarity — useful for bass or for chord-heavy parts.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0);
    const wetBus = new Tone.Gain(1);

    const preGain = new Tone.Gain(1);
    const shaper = new Tone.Distortion({ distortion: 0.4, oversample: '4x' });
    const tone = new Tone.Filter({ type: 'lowpass', frequency: 3500, Q: 0.7 });
    const levelGain = new Tone.Gain(1);

    // Wet path
    input.connect(preGain);
    preGain.connect(shaper);
    shaper.connect(tone);
    tone.connect(levelGain);
    levelGain.connect(wetBus);
    wetBus.connect(output);

    // Dry path
    input.connect(dryBus);
    dryBus.connect(output);

    let bypass = false;
    const bypassGainWet = wetBus;
    const bypassGainDry = dryBus;
    let lastMix = 1;

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'drive': {
            // Map drive 0..1 to: pre-gain 1..6 dB AND distortion amount 0..0.95.
            // This is more musical than just cranking one knob.
            const preDb = value * 6;
            preGain.gain.value = Tone.dbToGain(preDb);
            shaper.distortion = Math.min(0.95, value * 0.95);
            break;
          }
          case 'tone':
            tone.frequency.value = value;
            break;
          case 'level':
            levelGain.gain.value = Tone.dbToGain(value);
            break;
          case 'mix': {
            lastMix = value;
            if (!bypass) {
              bypassGainWet.gain.value = value;
              bypassGainDry.gain.value = 1 - value;
            }
            break;
          }
        }
      },
      setBypass(b) {
        bypass = b;
        if (b) {
          bypassGainWet.gain.value = 0;
          bypassGainDry.gain.value = 1;
        } else {
          bypassGainWet.gain.value = lastMix;
          bypassGainDry.gain.value = 1 - lastMix;
        }
      },
      dispose() {
        [input, output, dryBus, wetBus, preGain, shaper, tone, levelGain].forEach(
          (n) => n.dispose()
        );
      },
    };
  },
};
