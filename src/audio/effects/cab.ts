import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance, EffectLesson } from '../../types';
import { generateCabIR, type CabModel } from './ir';

/**
 * Convolution-based cabinet simulator. Convolves the input signal with a
 * synthesized impulse response for the chosen cab model, plus a one-knob
 * high-pass / low-pass at the output for tightening or darkening.
 *
 * Replaces the older 3-filter approximation — much closer to how the
 * Headrush Prime's cab block actually works (which uses real IR files).
 */

interface CabConfig {
  id: string;
  model: CabModel;
  displayName: string;
  shortDescription: string;
  lesson: EffectLesson;
}

function createCabDef(config: CabConfig): EffectDefinition {
  return {
    id: config.id,
    displayName: config.displayName,
    category: 'cab',
    shortDescription: config.shortDescription,
    implemented: true,
    params: [
      {
        id: 'lowCut',
        label: 'Low Cut',
        min: 40,
        max: 300,
        step: 1,
        default: 90,
        unit: 'Hz',
        curve: 'log',
        description:
          'Highpass at the output. Tightens muddy low end (great for hi-gain rigs).',
      },
      {
        id: 'highCut',
        label: 'High Cut',
        min: 2000,
        max: 12000,
        step: 50,
        default: 7000,
        unit: 'Hz',
        curve: 'log',
        description:
          'Lowpass at the output. Tames fizz on high-gain tones. The IR already shapes the high end; this is an extra trim.',
      },
      {
        id: 'air',
        label: 'Air',
        min: -6,
        max: 9,
        step: 0.5,
        default: 0,
        unit: 'dB',
        description:
          'High-shelf at ~6 kHz. Adds sparkle (or removes it). The IR is the bulk of the tone; this is a fine-trim.',
      },
      {
        id: 'mix',
        label: 'Mix',
        min: 0,
        max: 1,
        step: 0.01,
        default: 1,
        description:
          'Wet/dry blend. Below 100% you hear some pre-cab signal — useful for blending in raw amp brightness, or for showing a student what a cab "removes".',
      },
    ],
    lesson: config.lesson,
    create: () => createCabInstance(config.model),
  };
}

// Track legacy id 'cab-4x12' so existing presets continue to load — it now
// points at the Greenback model.
const LEGACY_GREENBACK_ID = 'cab-4x12';

function createCabInstance(model: CabModel): EffectInstance {
  const input = new Tone.Gain(1);
  const output = new Tone.Gain(1);
  const dryBus = new Tone.Gain(0);
  const wetBus = new Tone.Gain(1);

  const convolver = new Tone.Convolver({ normalize: false });
  // Synthesized IR — same call returns a fresh AudioBuffer each time so the
  // noise component varies slightly between instantiations (a feature, not
  // a bug — real cabs aren't perfectly identical either).
  convolver.buffer = new Tone.ToneAudioBuffer(generateCabIR(model));

  const hp = new Tone.Filter({ type: 'highpass', frequency: 90, Q: 0.7 });
  const lp = new Tone.Filter({ type: 'lowpass', frequency: 7000, Q: 0.7 });
  const air = new Tone.Filter({
    type: 'highshelf',
    frequency: 6000,
    gain: 0,
  });

  // Wet: input -> convolver -> hp -> lp -> air -> wetBus
  input.connect(convolver);
  convolver.connect(hp);
  hp.connect(lp);
  lp.connect(air);
  air.connect(wetBus);
  wetBus.connect(output);

  // Dry path
  input.connect(dryBus);
  dryBus.connect(output);

  let bypass = false;
  let lastMix = 1;

  return {
    input,
    output,
    setParam(id, value) {
      switch (id) {
        case 'lowCut':
          hp.frequency.value = value;
          break;
        case 'highCut':
          lp.frequency.value = value;
          break;
        case 'air':
          air.gain.value = value;
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
      [input, output, dryBus, wetBus, convolver, hp, lp, air].forEach((n) =>
        n.dispose()
      );
    },
  };
}

const sharedTLDR =
  'A guitar cab is a heavily filtered "voicing" of the amp signal. Without a cab (or a faithful sim of one), even a great amp sounds harsh and digital.';
const sharedWhatItDoes =
  'A guitar amp head puts out a wide-spectrum, often harsh signal. A speaker cabinet — plus the microphone in front of it — acts like a complicated, frequency-dependent filter: rolls off everything below ~80 Hz (the cone can\'t move enough air), rolls off everything above ~5–6 kHz (paper-cone speakers have HF limits), and has a series of resonant peaks in the mids that give each cab its character. We capture all of this via **convolution** with an impulse response (IR).';
const sharedPhysics =
  'An impulse response is the output of a system when you feed it a single-sample impulse. Once you have it, you can convolve any signal with the IR to produce what that signal would have sounded like through the system. Convolution is a sliding sum: output[n] = sum over k of input[k] * IR[n − k]. Conceptually, every sample of input becomes a scaled, time-shifted copy of the whole IR, summed onto the output. For a 5 second IR and 44.1 kHz sample rate that\'s 220,000 multiplications per output sample — Web Audio does this efficiently via FFT-based convolution.';

const greenbackDef = createCabDef({
  id: LEGACY_GREENBACK_ID,
  model: 'greenback',
  displayName: 'Cab — Greenback 4×12',
  shortDescription:
    'Classic British 4×12 with G12M Greenback speakers. Warm, mid-forward, smooth highs. The "Marshall" cab.',
  lesson: {
    tldr: sharedTLDR,
    whatItDoes: sharedWhatItDoes,
    physics: sharedPhysics,
    signalImpact: [
      'Convolves your signal with a synthesized Greenback IR',
      'Strong upper-mid resonance around 850 Hz and 1.8 kHz gives the "British" voice',
      'Rolls off above ~5 kHz — naturally smooth, no fizz',
      'Pairs especially well with Marshall-style amps',
    ],
    headrushNotes:
      'On the Headrush Prime: the "G12M" / "Greenback" cab models, often in 4×12 configurations. Try a JCM800 or Plexi amp → this cab → mic positioned slightly off-axis.',
    paramTips: {
      lowCut:
        '85 Hz is the IR\'s natural roll-off; push to 100–120 Hz to tighten further on hi-gain. Drop to 60 Hz only on clean tones for chest-thump.',
      highCut:
        'IR rolls off above ~5 kHz already. Use the High Cut for FURTHER taming of fizz if your distortion is harsh. 5 kHz = very dark; 8 kHz = bright.',
      air: 'Add 1–3 dB for slightly brighter top end. Negative to make it darker for jazz / vintage feel.',
      mix: 'Keep at 100% for normal use. Below 100% blends in the raw pre-cab signal — useful for hearing what the cab is taking away (great as a teaching tool).',
    },
  },
});

const v30Def = createCabDef({
  id: 'cab-v30',
  model: 'v30',
  displayName: 'Cab — Vintage 30 4×12',
  shortDescription:
    'Bright, aggressive, upper-mid resonant 4×12. The modern metal / hi-gain cab.',
  lesson: {
    tldr: sharedTLDR,
    whatItDoes: sharedWhatItDoes,
    physics: sharedPhysics,
    signalImpact: [
      'Strong upper-mid resonance around 2.2 kHz gives the "bite"',
      'Slightly extended high end vs Greenback — more articulate but can sound brittle',
      'Tight low end — well suited to fast palm-muted chugging',
      'Pairs with hi-gain amps (Mesa, Diezel, EVH 5150)',
    ],
    headrushNotes:
      'On the Prime: "V30" cab models. Pair with Mesa Recto, EVH, Diezel, or 5150 amps. Many metal records use this cab; tracking with a Shure SM57 on the cap edge is the canonical setup.',
    paramTips: {
      lowCut: '100–120 Hz for tight metal chugs. 90 Hz default keeps thump.',
      highCut: '5–6 kHz tames any leftover fizz. Above 7 kHz the V30 can sound harsh.',
      air: 'Often best at -1 to -2 dB to tame the inherent brightness.',
      mix: '100% wet for normal use.',
    },
  },
});

const tweedDef = createCabDef({
  id: 'cab-tweed',
  model: 'tweed',
  displayName: 'Cab — Tweed 1×12',
  shortDescription:
    'Vintage American 1×12 Jensen-style. Warm, dark, slightly compressed. Bluesy and intimate.',
  lesson: {
    tldr: sharedTLDR,
    whatItDoes: sharedWhatItDoes,
    physics: sharedPhysics,
    signalImpact: [
      'Lower highs cutoff (~4.5 kHz) = dark, vintage character',
      'Resonance around 700 Hz gives the "honky" old-amp feel',
      'Tweed tone: warm and slightly mid-forward',
      'Pairs with Fender Tweed-era amps, Bassman, Deluxe',
    ],
    headrushNotes:
      'On the Prime: "Tweed" cab models in 1×12 or 2×12 configurations. Try with the Fender Clean amp model dropped lower or a 5E3 Deluxe model on edge of breakup.',
    paramTips: {
      lowCut: '70–80 Hz keeps it full and bassy.',
      highCut: 'The IR is already dark; pushing the high cut up to 7 kHz reveals a bit more sparkle.',
      air: '+1 to +2 dB to brighten without losing character.',
      mix: '100% wet.',
    },
  },
});

const blueDef = createCabDef({
  id: 'cab-blue',
  model: 'blue',
  displayName: 'Cab — Blue Alnico 2×12',
  shortDescription:
    'Celestion Blue Alnico 2×12. Bell-like chime, extended highs, the Vox AC30 cab.',
  lesson: {
    tldr: sharedTLDR,
    whatItDoes: sharedWhatItDoes,
    physics: sharedPhysics,
    signalImpact: [
      'Strong upper-mid resonance ~2.8 kHz — the "chime"',
      'Higher cutoff than most cabs (~6.5 kHz) — bright and bell-like',
      'Less tight low end than 4×12s — open, jangly feel',
      'Pairs with Vox-style amps (AC30, AC15)',
    ],
    headrushNotes:
      'On the Prime: "Blue Alnico" cab. Pair with the Vox Chime amp model for The Edge / Brian May / Beatles-era jangle. Classic recipe: AC30 → Blue cab → SM57.',
    paramTips: {
      lowCut: '90–100 Hz default works well.',
      highCut: 'Crank to 8–9 kHz for full chime, or drop to 5 kHz to tame the brightness.',
      air: '+1 to +3 dB for added jangle.',
      mix: '100% wet.',
    },
  },
});

export const cabGreenbackDef = greenbackDef;
export const cabV30Def = v30Def;
export const cabTweedDef = tweedDef;
export const cabBlueDef = blueDef;

/**
 * Legacy export retained so the rest of the app and existing presets that
 * reference the `cab-4x12` id keep working — it now points at the Greenback
 * convolution cab.
 */
export const cabDef = greenbackDef;
