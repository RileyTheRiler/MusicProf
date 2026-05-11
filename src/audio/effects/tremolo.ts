import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Classic tremolo: an LFO modulates the amplitude of the signal cyclically.
 * Tone.Tremolo gives us frequency, depth, type (waveform), and stereo spread.
 */
export const tremoloDef: EffectDefinition = {
  id: 'tremolo',
  displayName: 'Tremolo',
  category: 'mod',
  shortDescription:
    'Cyclic volume modulation via LFO — "helicopter" amplitude wobble.',
  implemented: true,
  params: [
    {
      id: 'rate',
      label: 'Rate',
      min: 0.5,
      max: 16,
      step: 0.1,
      default: 5,
      unit: 'Hz',
      description:
        'How fast the LFO cycles. Slow = lazy swell; fast = chopper / Leslie territory.',
    },
    {
      id: 'depth',
      label: 'Depth',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.7,
      description:
        'How much volume modulation. 0 = no effect, 1 = full mute on the LFO trough.',
    },
    {
      id: 'shape',
      label: 'Shape',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      description:
        'LFO waveform: 0 = sine (smooth swell), 1 = square (hard chop / stutter).',
    },
    {
      id: 'spread',
      label: 'Spread',
      min: 0,
      max: 180,
      step: 1,
      default: 0,
      unit: 'deg',
      description:
        'Stereo phase offset between L/R LFOs. 0 = mono. 180 = wide auto-pan effect.',
    },
  ],
  lesson: {
    tldr: 'Tremolo modulates the volume in a cycle. Don\'t confuse with vibrato (pitch modulation) — Fender mislabeled them in the 60s and the misnomer stuck.',
    whatItDoes:
      'A VCA (voltage-controlled amplifier) whose gain is swept by a low-frequency oscillator. Sine-wave LFO = smooth swell; square wave = on/off chop; harmonic tremolo splits the signal across two filters and alternates between them, producing a characteristically "watery" feel.',
    physics:
      'Pure amplitude modulation (AM). If the LFO is at frequency f_m and the carrier (your guitar note) is at f_s, AM creates sidebands at f_s ± f_m. For LFO rates below ~20 Hz, these sidebands are sub-audible and you just perceive the volume swelling. Above ~30 Hz the sidebands become audible as new pitches — that\'s why fast tremolos start to sound "ring-modulator-y".',
    signalImpact: [
      'Periodic volume changes — entire signal swells and dips',
      'Doesn\'t change pitch (that\'s vibrato)',
      'Square-wave tremolo = "stutter" / chop effect',
      'High depth + low rate is the iconic 60s surf rock vibe',
    ],
    headrushNotes:
      'On the Headrush Prime: Modulation block. Look for "Bias Tremolo" (vintage Fender, smooth) and "Harmonic Tremolo" (classic brown Fender, treble/bass alternation). Try setting rate to a tempo-synced value (e.g., 4 Hz at 120 BPM = 16th-note pulse) for rhythmic effect.',
    paramTips: {
      rate: '2–4 Hz = lazy surf swell. 5–8 Hz = nervous, vintage tremolo. 12+ Hz = chopper effect.',
      depth:
        '0.4–0.6 = audibly pulsing but musical. 0.8–1.0 = aggressive, almost stuttering.',
      shape:
        'Sine = smooth, classic. Square = abrupt on/off — great for percussive, glitchy parts and electronic-flavored guitar.',
      spread:
        '0° = mono. 180° = the L and R sides modulate in opposite phase = a wide "auto-pan" feel where the sound bounces between speakers.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0);
    const wetBus = new Tone.Gain(1);

    const trem = new Tone.Tremolo({
      frequency: 5,
      depth: 0.7,
      type: 'sine',
      spread: 0,
      wet: 1,
    }).start();

    input.connect(trem);
    trem.connect(wetBus);
    wetBus.connect(output);

    input.connect(dryBus);
    dryBus.connect(output);

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'rate':
            trem.frequency.value = value;
            break;
          case 'depth':
            trem.depth.value = value;
            break;
          case 'shape':
            trem.type = value > 0.5 ? 'square' : 'sine';
            break;
          case 'spread':
            trem.spread = value;
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
        [input, output, dryBus, wetBus, trem].forEach((n) => n.dispose());
      },
    };
  },
};
