import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Cabinet/speaker simulator approximated with a band-pass + low-pass +
 * resonance peak. Real cab sims use IRs (impulse responses) — recordings of an
 * actual cab miked up — but this filter approximation captures the essential
 * "speaker shape" for teaching purposes.
 */
export const cabDef: EffectDefinition = {
  id: 'cab-4x12',
  displayName: 'Cabinet (4x12)',
  category: 'cab',
  shortDescription:
    'Filters the signal the way a guitar speaker + microphone does — rolls off lows below ~80 Hz and highs above ~5 kHz with a "vocal" mid resonance.',
  implemented: true,
  params: [
    {
      id: 'lowCut',
      label: 'Low Cut',
      min: 40,
      max: 300,
      step: 1,
      default: 80,
      unit: 'Hz',
      curve: 'log',
      description:
        'Highpass that removes sub-bass below the speaker\'s low limit. A 4x12 doesn\'t reproduce 40 Hz like a sub does.',
    },
    {
      id: 'highCut',
      label: 'High Cut',
      min: 2000,
      max: 12000,
      step: 50,
      default: 5500,
      unit: 'Hz',
      curve: 'log',
      description:
        'Lowpass at the speaker\'s upper limit. Real guitar speakers roll off sharply above ~5 kHz; this is what removes "fizz".',
    },
    {
      id: 'resonance',
      label: 'Resonance',
      min: 0,
      max: 10,
      step: 0.1,
      default: 4,
      unit: 'dB',
      description:
        'Boost at the cab\'s natural resonant peak (~2.5 kHz). This is the "voice" of the cab — what gives guitar its midrange character.',
    },
    {
      id: 'character',
      label: 'Character',
      min: 1500,
      max: 4000,
      step: 10,
      default: 2500,
      unit: 'Hz',
      curve: 'log',
      description:
        'Frequency of the resonance peak. Lower = darker, V30/Greenback territory. Higher = bright American/Celestion Blue.',
    },
  ],
  lesson: {
    tldr: 'A cabinet is a heavily-filtered EQ shape — without it, even a great amp sounds harsh and digital.',
    whatItDoes:
      'A guitar amp head outputs a wide-spectrum, often harsh signal. A speaker cabinet (and the microphone in front of it) acts like a complicated EQ: it rolls off frequencies below ~80 Hz (the speaker can\'t move enough air for sub-bass), rolls off everything above ~5 kHz (paper cone has high-frequency limits), and has a strong resonant peak in the upper mids that gives each cab its character. The mic placement adds further filtering.',
    physics:
      'A 12-inch guitar speaker is a mechanical low-pass filter with a resonance: the cone has mass, the surround has compliance, together they form a damped harmonic oscillator. Plus the cabinet enclosure has its own resonances. Add a Shure SM57 with its mid-presence bump and you get the iconic "miked guitar amp" frequency response. In digital land, this is captured by an Impulse Response — record a known signal (sine sweep) through the rig, deconvolve to get the system\'s linear response, then convolve any signal with that IR to "sound like" it went through that rig.',
    signalImpact: [
      'Removes sub-bass and ultra-high content (huge subjective change vs. raw amp)',
      'Adds the resonant midrange peak that makes guitar sound like guitar',
      'Critical for distorted tones — without a cab, distortion sounds buzzy and digital',
      'Makes a clean amp sound darker/warmer than the raw signal',
    ],
    headrushNotes:
      'On the Headrush Prime, this maps to the Cab block, which uses real IRs (impulse responses) of cabinets like 4x12 Greenback, 1x12 Vintage 30, etc. The Prime also lets you load custom IRs. Our filter-based approximation is conceptually similar to the IR but much simpler — a real IR captures hundreds of resonances, not just one.',
    paramTips: {
      lowCut:
        '80 Hz is standard for 4x12. Try 100 Hz to "tighten" a muddy distortion. 60 Hz keeps more thump for clean tones.',
      highCut:
        '5–6 kHz feels natural. 7 kHz = bright American voicing. 3.5 kHz = very dark, vintage Greenback. Lower this if your distortion sounds fizzy.',
      resonance:
        '3–5 dB is realistic. 6–8 dB exaggerates the "voice" — useful for solos. 0 dB feels lifeless.',
      character:
        '2 kHz = warm Greenback. 2.5 kHz = balanced V30. 3.5 kHz = aggressive, bright modern. Sweep this and listen — it\'s the single biggest variable in cab sound.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);

    const hp = new Tone.Filter({ type: 'highpass', frequency: 80, Q: 0.7 });
    const reson = new Tone.Filter({
      type: 'peaking',
      frequency: 2500,
      Q: 1.5,
      gain: 4,
    });
    const lp = new Tone.Filter({ type: 'lowpass', frequency: 5500, Q: 1.0 });

    input.connect(hp);
    hp.connect(reson);
    reson.connect(lp);
    lp.connect(output);

    let bypass = false;
    let stored = { lowCut: 80, highCut: 5500, resonance: 4, character: 2500 };

    const apply = () => {
      if (bypass) {
        hp.frequency.value = 20;
        lp.frequency.value = 20000;
        reson.gain.value = 0;
      } else {
        hp.frequency.value = stored.lowCut;
        lp.frequency.value = stored.highCut;
        reson.frequency.value = stored.character;
        reson.gain.value = stored.resonance;
      }
    };

    return {
      input,
      output,
      setParam(id, value) {
        if (id === 'lowCut') stored.lowCut = value;
        if (id === 'highCut') stored.highCut = value;
        if (id === 'resonance') stored.resonance = value;
        if (id === 'character') stored.character = value;
        apply();
      },
      setBypass(b) {
        bypass = b;
        apply();
      },
      dispose() {
        [input, output, hp, reson, lp].forEach((n) => n.dispose());
      },
    };
  },
};
