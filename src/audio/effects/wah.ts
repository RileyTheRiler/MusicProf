import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * "Cry Baby"-style wah pedal: a sharp resonant bandpass filter whose center
 * frequency the user controls with a "Position" knob (in lieu of an
 * expression-pedal rocker). An "Auto" mode adds an LFO that sweeps the
 * pedal automatically.
 */
export const wahDef: EffectDefinition = {
  id: 'wah',
  displayName: 'Wah',
  category: 'wah',
  shortDescription:
    'A sweepable resonant bandpass filter — the iconic "wow-wah" vocal-like sound.',
  implemented: true,
  params: [
    {
      id: 'position',
      label: 'Position',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.4,
      description:
        'Pedal position. 0 = heel down (low resonant peak ~400 Hz), 1 = toe down (high peak ~2.2 kHz).',
    },
    {
      id: 'q',
      label: 'Q',
      min: 1,
      max: 12,
      step: 0.1,
      default: 5,
      description:
        'Resonance / sharpness of the peak. Higher = more pronounced "vocal" character.',
    },
    {
      id: 'auto',
      label: 'Auto Rate',
      min: 0,
      max: 6,
      step: 0.05,
      default: 0,
      unit: 'Hz',
      description:
        'When > 0, an LFO automatically sweeps the pedal. 0 disables auto and the Position knob controls the filter directly.',
    },
    {
      id: 'mix',
      label: 'Mix',
      min: 0,
      max: 1,
      step: 0.01,
      default: 1,
      description: 'Wet/dry blend.',
    },
  ],
  lesson: {
    tldr: 'A wah is a sweepable bandpass filter — the resonant peak moves between ~400 Hz and ~2 kHz as you rock the pedal.',
    whatItDoes:
      'A narrow, resonant bandpass filter whose center frequency is controlled by a pedal (or LFO in auto mode). Sweeping the filter through midrange creates a sound very similar to a human vocal "wah" because vowels are also formed by midrange resonances.',
    physics:
      'Originally an inductor + variable capacitor analog filter (the famous Cry Baby). Digital wahs model that response with a steep resonant bandpass. Q (resonance) is high — a sharp peak emphasizes a narrow band. The resonance often pushes nearby frequencies up by 10+ dB; that\'s why pushing a wah into a distortion stage produces wild "feedback" sounds.',
    signalImpact: [
      'Massive midrange emphasis at the swept frequency',
      'Heavy attenuation outside the filter band',
      'Makes single notes almost speak/sing',
      'Stacked with overdrive: the resonant peak adds harmonics, making notes "scream"',
    ],
    headrushNotes:
      'On the Headrush Prime, the Wah block can be tied to the expression pedal. "Cry Baby" and "Vox V846" models are classic. Often paired with overdrive — the wah\'s peak is so sharp it can self-oscillate when overdriven. Try wah → overdrive → amp for the Hendrix sound.',
    paramTips: {
      position:
        'Sweep slowly while playing — the pedal\'s "voice" changes character through the sweep. A held position works as a pseudo-EQ shape.',
      q: '3–5 = vocal, smooth. 6–8 = aggressive, almost talking. 9+ approaches self-oscillation territory and is a sound effect.',
      auto: 'Set 1–3 Hz for a wobbling envelope filter feel. 4 Hz+ becomes "robot voice" and is great with distortion for sci-fi leads.',
      mix: '100% (full wet) for normal wah. Reduce mix for parallel wah — leaves a clean signal underneath, useful for funk.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0);
    const wetBus = new Tone.Gain(1);

    const filter = new Tone.Filter({
      type: 'bandpass',
      frequency: 800,
      Q: 5,
    });
    // Slight makeup gain — bandpasses lose perceived loudness
    const makeup = new Tone.Gain(Tone.dbToGain(6));
    const lfo = new Tone.LFO({
      frequency: 0,
      min: 0,
      max: 1,
      type: 'sine',
    }).start();

    input.connect(filter);
    filter.connect(makeup);
    makeup.connect(wetBus);
    wetBus.connect(output);

    input.connect(dryBus);
    dryBus.connect(output);

    let bypass = false;
    let lastMix = 1;
    let manualPos = 0.4;
    let q = 5;
    let autoRate = 0;
    let lfoConnected = false;

    // Map normalized pedal position 0..1 to filter freq 400 Hz .. 2200 Hz
    // (log scale so the sweep sounds even by ear).
    const posToFreq = (p: number) => {
      const lmin = Math.log(400);
      const lmax = Math.log(2200);
      return Math.exp(lmin + Math.min(1, Math.max(0, p)) * (lmax - lmin));
    };

    const updateFilter = () => {
      if (autoRate > 0) {
        if (!lfoConnected) {
          // Hook up LFO to filter freq via a scaled signal
          // LFO outputs 0..1; we map that to log freq via a Scale node.
          // For simplicity we just set min/max to the desired freqs and let LFO drive frequency.
          lfo.min = 400;
          lfo.max = 2200;
          lfo.connect(filter.frequency);
          lfoConnected = true;
        }
        lfo.frequency.value = autoRate;
      } else {
        if (lfoConnected) {
          lfo.disconnect(filter.frequency);
          lfoConnected = false;
        }
        filter.frequency.value = posToFreq(manualPos);
      }
      filter.Q.value = q;
    };

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'position':
            manualPos = value;
            updateFilter();
            break;
          case 'q':
            q = value;
            updateFilter();
            break;
          case 'auto':
            autoRate = value;
            updateFilter();
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
        if (lfoConnected) lfo.disconnect(filter.frequency);
        [input, output, dryBus, wetBus, filter, makeup, lfo].forEach((n) =>
          n.dispose()
        );
      },
    };
  },
};
