import * as Tone from 'tone';
import type {
  EffectDefinition,
  EffectInstance,
  EffectLesson,
} from '../../types';

/**
 * Shared amplifier model. A real tube guitar amp is roughly:
 *
 *   input -> preamp gain stage 1 (12AX7) -> coupling cap (HP filter)
 *         -> preamp gain stage 2 (12AX7) -> tone stack (Bass/Mid/Treble RLC)
 *         -> presence (driver / NFB loop EQ) -> phase inverter
 *         -> power amp (EL34 / 6L6 / EL84) with sag
 *         -> output transformer -> speaker
 *
 * We model this as:
 *   input -> inputGain (the "Gain" knob)
 *         -> WaveShaper(stage1Curve) -> highpass -> WaveShaper(stage2Curve)
 *         -> Bass shelf -> Mid bell -> Treble shelf -> Presence shelf
 *         -> WaveShaper(powerCurve) -> sag compressor -> Volume -> output
 *
 * Each amp model picks different curves, tone-stack frequencies, and base
 * gain — those choices are what make a Marshall sound like a Marshall and
 * a Fender sound like a Fender.
 */

type CurveType = 'fender' | 'marshall' | 'mesa' | 'vox' | 'soft';

export interface AmpConfig {
  id: string;
  displayName: string;
  shortDescription: string;
  /** Where the tone-stack BMT shelves sit in Hz. */
  bassFreq: number;
  midFreq: number;
  midQ: number;
  trebleFreq: number;
  presenceFreq: number;
  /** "Tightness" highpass between gain stages (Hz). */
  interStageHP: number;
  /** Curves for each saturation stage. */
  stage1Type: CurveType;
  stage2Type: CurveType;
  powerType: CurveType;
  /** "Voicing" multiplier on input — Mesa is hot input, Vox runs cool. */
  inputCharacterMul: number;
  lesson: EffectLesson;
}

const CURVE_LEN = 4096;

/**
 * Returns a Float32Array suitable for Tone.WaveShaper. Each curve type has a
 * different harmonic personality:
 *
 * - fender:   symmetric soft tanh, mostly odd harmonics, gentle compression
 * - marshall: asymmetric (positive clips earlier) → adds even harmonics =
 *             "warm" and "vocal" sound; the JCM family secret
 * - mesa:     harder asymmetric clip + bias → tight, focused, high-gain
 * - vox:      cubic-flavored tanh → bell-like upper harmonics, "chime"
 * - soft:     gentle tanh used for the power-amp stage
 */
function makeCurve(type: CurveType, drive: number): Float32Array {
  const curve = new Float32Array(CURVE_LEN);
  for (let i = 0; i < CURVE_LEN; i++) {
    const x = (i / (CURVE_LEN - 1)) * 2 - 1;
    let y = 0;
    switch (type) {
      case 'fender': {
        // Symmetric soft clip
        y = Math.tanh(x * drive);
        break;
      }
      case 'marshall': {
        // Asymmetric — positive side clips earlier (bias offset)
        const bias = 0.08;
        const dPos = drive * 1.15;
        const dNeg = drive * 0.92;
        if (x >= 0) y = Math.tanh(x * dPos + bias) - Math.tanh(bias);
        else y = Math.tanh(x * dNeg + bias) - Math.tanh(bias);
        break;
      }
      case 'mesa': {
        // Harder, more aggressive asymmetric clip
        const bias = 0.12;
        const d = drive * 1.4;
        y = Math.tanh(x * d + bias) - Math.tanh(bias);
        // Soften extreme negative peaks slightly (bias asymmetry)
        if (x < -0.7) y = y * 0.92;
        break;
      }
      case 'vox': {
        // tanh shaped + cubic emphasis = bell-like high harmonics
        const t = Math.tanh(x * drive);
        y = t * (1 + 0.18 * x * x);
        if (y > 1) y = 1;
        if (y < -1) y = -1;
        break;
      }
      case 'soft': {
        y = Math.tanh(x * drive * 0.7);
        break;
      }
    }
    curve[i] = Math.max(-1, Math.min(1, y));
  }
  return curve;
}

export function createAmpDef(config: AmpConfig): EffectDefinition {
  return {
    id: config.id,
    displayName: config.displayName,
    category: 'amp',
    shortDescription: config.shortDescription,
    implemented: true,
    params: [
      {
        id: 'gain',
        label: 'Gain',
        min: 0,
        max: 10,
        step: 0.1,
        default: 4,
        description:
          'Input drive into the preamp. Low gain = clean; high gain = saturated. The character of saturation is set by the amp model itself.',
      },
      {
        id: 'bass',
        label: 'Bass',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        unit: 'dB',
        description:
          'Low shelf. Cut bass before high-gain to keep tones tight; boost for fullness on cleans.',
      },
      {
        id: 'mid',
        label: 'Mid',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        unit: 'dB',
        description:
          'Midrange bell. The single most important knob for "cuts through" vs "scooped" voicing.',
      },
      {
        id: 'treble',
        label: 'Treble',
        min: -12,
        max: 12,
        step: 0.5,
        default: 0,
        unit: 'dB',
        description:
          'High shelf. Tames fizz on hi-gain or adds bite on cleans.',
      },
      {
        id: 'presence',
        label: 'Presence',
        min: -8,
        max: 8,
        step: 0.5,
        default: 0,
        unit: 'dB',
        description:
          'Upper-treble shelf at ~5 kHz, after the tone stack. Sharpens pick attack and "air".',
      },
      {
        id: 'sag',
        label: 'Sag',
        min: 0,
        max: 10,
        step: 0.1,
        default: 3,
        description:
          'Power-amp compression. Real tube amps "sag" under load — strong picking dips the supply rail, briefly compressing. More sag = squishier, more vintage.',
      },
      {
        id: 'volume',
        label: 'Volume',
        min: -24,
        max: 12,
        step: 0.5,
        default: 0,
        unit: 'dB',
        description:
          'Output level after everything. Use to match bypass when comparing amps.',
      },
    ],
    lesson: config.lesson,
    create: () => createAmpInstance(config),
  };
}

function createAmpInstance(config: AmpConfig): EffectInstance {
  const input = new Tone.Gain(1);
  const output = new Tone.Gain(1);
  const wetBus = new Tone.Gain(1);
  const dryBus = new Tone.Gain(0);

  const inputGain = new Tone.Gain(1);

  // Two saturation stages with a high-pass between them ("tight" cap)
  const stage1 = new Tone.WaveShaper(makeCurve(config.stage1Type, 6), CURVE_LEN);
  stage1.oversample = '4x';
  const interHP = new Tone.Filter({
    type: 'highpass',
    frequency: config.interStageHP,
    Q: 0.7,
  });
  const stage2 = new Tone.WaveShaper(makeCurve(config.stage2Type, 5), CURVE_LEN);
  stage2.oversample = '4x';

  // Tone stack
  const bass = new Tone.Filter({
    type: 'lowshelf',
    frequency: config.bassFreq,
    gain: 0,
  });
  const mid = new Tone.Filter({
    type: 'peaking',
    frequency: config.midFreq,
    Q: config.midQ,
    gain: 0,
  });
  const treble = new Tone.Filter({
    type: 'highshelf',
    frequency: config.trebleFreq,
    gain: 0,
  });
  const presence = new Tone.Filter({
    type: 'highshelf',
    frequency: config.presenceFreq,
    gain: 0,
  });

  // Power amp — gentler clip, plus a compressor to model "sag"
  const powerAmp = new Tone.WaveShaper(makeCurve(config.powerType, 2.2), CURVE_LEN);
  powerAmp.oversample = '4x';
  const sag = new Tone.Compressor({
    threshold: -16,
    ratio: 2,
    attack: 0.03,
    release: 0.25,
    knee: 6,
  });

  const volume = new Tone.Gain(1);

  // Wire wet path
  input.connect(inputGain);
  inputGain.connect(stage1);
  stage1.connect(interHP);
  interHP.connect(stage2);
  stage2.connect(bass);
  bass.connect(mid);
  mid.connect(treble);
  treble.connect(presence);
  presence.connect(powerAmp);
  powerAmp.connect(sag);
  sag.connect(volume);
  volume.connect(wetBus);
  wetBus.connect(output);

  // Dry bypass path
  input.connect(dryBus);
  dryBus.connect(output);

  return {
    input,
    output,
    setParam(id, value) {
      switch (id) {
        case 'gain': {
          // Gain knob 0..10 mapped to input scaling that drives into the curves.
          // Each amp's character mul biases this — Mesa runs hotter than Fender.
          const scale = (value / 5) * config.inputCharacterMul;
          inputGain.gain.value = Math.max(0.05, scale);
          break;
        }
        case 'bass':
          bass.gain.value = value;
          break;
        case 'mid':
          mid.gain.value = value;
          break;
        case 'treble':
          treble.gain.value = value;
          break;
        case 'presence':
          presence.gain.value = value;
          break;
        case 'sag': {
          // Sag knob 0..10 → threshold from -8 (no sag) to -28 (lots of sag),
          // ratio from 1.5 to 4.5, release from 0.4s to 0.15s
          const t = -8 - (value / 10) * 20;
          const r = 1.5 + (value / 10) * 3;
          const rel = 0.4 - (value / 10) * 0.25;
          sag.threshold.value = t;
          sag.ratio.value = r;
          sag.release.value = rel;
          break;
        }
        case 'volume':
          volume.gain.value = Tone.dbToGain(value);
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
      [
        input,
        output,
        wetBus,
        dryBus,
        inputGain,
        stage1,
        interHP,
        stage2,
        bass,
        mid,
        treble,
        presence,
        powerAmp,
        sag,
        volume,
      ].forEach((n) => n.dispose());
    },
  };
}

// ----------------------------------------------------------------------------
// Amp models
// ----------------------------------------------------------------------------

export const fenderCleanDef: EffectDefinition = createAmpDef({
  id: 'amp-fender-clean',
  displayName: 'Fender Clean (Twin)',
  shortDescription:
    '6L6 power tubes, scooped tone stack, massive headroom — the classic American clean.',
  bassFreq: 80,
  midFreq: 400,
  midQ: 0.5,
  trebleFreq: 3500,
  presenceFreq: 5000,
  interStageHP: 80,
  stage1Type: 'fender',
  stage2Type: 'fender',
  powerType: 'soft',
  inputCharacterMul: 0.45, // runs cool — clean even at high gain
  lesson: {
    tldr: 'A loud, sparkly, headroom-rich American clean. Famous for chord work, country, surf, and pristine pedalboard tones.',
    whatItDoes:
      'Models a Fender Twin Reverb–style amp: dual 6L6 power tubes, four 12AX7 preamp tubes, an oversize output transformer, and the famous Fender tone stack. The whole architecture is biased toward clean output — even at high gain settings, it stays mostly linear, breaking up only at extreme volumes. The tone stack has a natural midrange "smile" — bass and treble are emphasized, mids dipped, which is the iconic Fender voicing.',
    physics:
      '6L6 power tubes have softer, more symmetric clipping than EL34s, with mostly odd harmonics. The big output transformer means lots of clean current available — the amp does not "sag" easily under hard picking. The Fender tone stack is a passive RLC ladder where the controls interact: turning the treble knob also affects bass levels. We approximate it as three independent shelving filters here, but the voicing (bass shelf at 80 Hz, mid scoop at 400 Hz, treble shelf at 3.5 kHz) reproduces the signature shape.',
    signalImpact: [
      'Adds gentle, even compression and warmth',
      'Imparts a midrange dip — sounds "scooped"',
      'High headroom: distortion only enters at the very top of the gain knob',
      'Pairs especially well with single-coil pickups (Strat/Tele)',
    ],
    headrushNotes:
      'On the Headrush Prime, this is the "Twin Reverb" / "Deluxe Reverb" / "Bassman" family in the Amp block. Look for "65 Twin", "59 Bassman", "65 Deluxe Reverb". Pair with a 1×12 or 4×10 cabinet and a "Spring" reverb for full Fender authenticity.',
    paramTips: {
      gain: 'This amp stays clean almost all the way to 10. Around 4–6 starts to add subtle harmonic warmth; 8+ gets into "edge of breakup" territory popular for blues.',
      bass: 'The Fender tone stack already has lots of bass; adding more can get flubby. Try +2 to +4 dB for fullness, or cut to tighten up.',
      mid: 'Boost +2 to +4 dB to fill in the natural scoop and cut through a band mix. Default scoop is what gives Fender amps their "glassy" quality.',
      treble: 'Fenders sound right with treble fairly high (+3 to +6 dB). Single-coils especially benefit from this brightness.',
      presence: 'Adds pick attack snap. Country and chicken-pickin\' players push this; jazz players cut it.',
      sag: 'A Twin barely sags at all (large transformer, lots of current). Set 1–3 for authentic feel. Higher values move toward Deluxe / tweed territory.',
    },
  },
});

export const marshallCrunchDef: EffectDefinition = createAmpDef({
  id: 'amp-marshall-crunch',
  displayName: 'Marshall Crunch (Plexi/JCM)',
  shortDescription:
    'EL34s, mid-forward tone stack, asymmetric crunch — the sound of British rock.',
  bassFreq: 100,
  midFreq: 650,
  midQ: 0.7,
  trebleFreq: 3500,
  presenceFreq: 5500,
  interStageHP: 100,
  stage1Type: 'marshall',
  stage2Type: 'marshall',
  powerType: 'marshall',
  inputCharacterMul: 0.85,
  lesson: {
    tldr: 'The defining "British rock" amp. Mid-rich, vocal, asymmetric clipping that feels alive under your fingers.',
    whatItDoes:
      'Models a Marshall Plexi or JCM800 lead channel: two cascading 12AX7 preamp stages, a mid-forward Marshall tone stack, EL34 power tubes, and a presence control in the negative-feedback loop. The asymmetric clipping in the EL34 stage produces a rich mix of even and odd harmonics — that\'s why it sounds "warmer" and more vocal than a Fender at the same gain setting.',
    physics:
      'EL34 power tubes have an asymmetric transfer curve and break up earlier than 6L6 (Fender). The Marshall tone stack has its mid bell centered higher (~600–800 Hz) and shelves bass higher (~100 Hz vs Fender\'s 80 Hz), which is what makes it feel "midrangy". Asymmetric clipping creates 2nd-harmonic content (one octave above the fundamental) that the ear hears as "warmth" or "fattening" rather than "buzz".',
    signalImpact: [
      'Adds substantial 2nd and 3rd harmonic content (warm crunch)',
      'Compresses dynamics — pick harder, get a touch more saturation',
      'Mid-forward voicing makes it cut through dense mixes',
      'Responds dynamically to picking — back off picking, sound cleans up',
    ],
    headrushNotes:
      'On the Headrush Prime, this is the "Plexi 100", "Plexi 50", "JCM800", or "JCM900" in the Amp block. Pair with a 4×12 Greenback or V30 cab. Many players push this with a Tube Screamer or Klon for solos — the OD pedal tightens the low end and pushes the front of the amp harder without changing the overall character.',
    paramTips: {
      gain: '0–3 = clean to edge of breakup (great with single-coils for blues). 4–6 = "AC/DC" rhythm crunch. 7–9 = full lead saturation. Past 9 starts to compress noticeably.',
      bass: 'Marshalls love a slight bass cut (–2 to –4 dB) for tightness, especially with humbuckers. Boost only for cleaner/jangly stuff.',
      mid: 'Most magic happens here. +3 to +5 dB = singing solo tone. 0 dB = pleasant rhythm. –3 dB = approaches "scooped" metal voicing (not a typical Marshall sound, but it\'s your amp).',
      treble: '+3 to +5 dB is the sweet spot — adds the iconic Marshall "bite" without fizz. Higher than +6 starts to harshen.',
      presence: 'Push 2–4 dB to bring out pick attack. Cut for darker, thicker rhythm.',
      sag: 'Marshalls have meaningful sag from EL34s under load. 4–6 feels authentic. Lower for tighter modern voicing; higher for "bluesier" feel.',
    },
  },
});

export const mesaHiGainDef: EffectDefinition = createAmpDef({
  id: 'amp-mesa-higain',
  displayName: 'Mesa Hi-Gain (Mark/Recto)',
  shortDescription:
    'Cascading gain stages, tight low-end, modern saturation — the sound of metal.',
  bassFreq: 80,
  midFreq: 750,
  midQ: 1.1,
  trebleFreq: 4000,
  presenceFreq: 5500,
  interStageHP: 130,
  stage1Type: 'mesa',
  stage2Type: 'mesa',
  powerType: 'soft',
  inputCharacterMul: 1.4, // hot input — saturates fast
  lesson: {
    tldr: 'Modern American hi-gain. Multiple cascading preamp stages and aggressive high-pass filtering between them keep things tight even at extreme saturation.',
    whatItDoes:
      'Models a Mesa Mark IV or Dual/Triple Rectifier: 4–5 cascading 12AX7 preamp stages, with high-pass filters between each to keep the low end articulate, then 6L6 (Recto) or EL34 (Mark) power tubes. The asymmetric clipping curve plus the inter-stage filtering is what makes Mesa amps sound "tight" at gain settings that would make most amps mush out.',
    physics:
      'The secret sauce of high-gain amps is what happens BETWEEN gain stages. After each saturation stage, a small AC-coupling capacitor acts as a high-pass filter. Without it, low-frequency energy from the previous stage would intermodulate and create mud. Mesa\'s designers tuned these filters carefully, allowing tons of gain while keeping low strings articulate. The "Modern" Recto voicing is also slightly scooped in the low-mids; the "Vintage" voicing has more midrange.',
    signalImpact: [
      'Massive harmonic generation — every stage adds more content',
      'Dynamic range nearly disappears at high gain (heavily compressed)',
      'Inter-stage HP filters keep low strings articulate',
      'Adds significant noise floor — pair with a noise gate before the amp',
    ],
    headrushNotes:
      'On the Prime: "Mark IIC+", "Mark IV", "Recto", "Recto Modern", and the like. Always pair with a tight 4×12 cab (V30s ideal), a noise gate before the amp, and ideally an EQ block AFTER the cab to fine-tune the high-mids. Many metal players also put a Tube Screamer or similar OD in front, set to low gain + high level — this acts as a midrange boost and tightens the low end further.',
    paramTips: {
      gain: 'This amp gets dirty FAST. 2–3 = surprisingly clean. 4–6 = classic Mesa rhythm. 7+ = full saturation. Above 9 the differences become subtle — most "metal" tones live around 6–7.',
      bass: 'Almost always cut bass on hi-gain (–3 to –6 dB). The amp\'s inter-stage filters help, but bass cuts further tighten the chug.',
      mid: 'Two camps: "scooped" (–3 to –6 dB) for chuggy modern metal, or "mid-forward" (+3 to +5 dB) for solos and Mark-IV-style "honk".',
      treble: '+3 to +5 dB for definition. Push higher for brittle modern attack; cut for darker, doomier voicing.',
      presence: '+2 to +4 dB sharpens the chug. Higher gets fizzy fast — the cab\'s high cut is your friend.',
      sag: 'Mesa amps are tight by design — keep sag low (1–3) for modern feel. Higher sag pushes toward bluesier, looser response.',
    },
  },
});

export const voxChimeDef: EffectDefinition = createAmpDef({
  id: 'amp-vox-chime',
  displayName: 'Vox Chime (AC30)',
  shortDescription:
    'EL84 Class-A, "top boost" treble emphasis, bell-like overtones — British jangle.',
  bassFreq: 100,
  midFreq: 1500,
  midQ: 0.7,
  trebleFreq: 3500,
  presenceFreq: 6000,
  interStageHP: 90,
  stage1Type: 'vox',
  stage2Type: 'vox',
  powerType: 'vox',
  inputCharacterMul: 0.6,
  lesson: {
    tldr: 'Bell-like, jangly, very bright. EL84 power tubes plus the iconic "top boost" tone shape. Beatles, Queen, U2, R.E.M. — the chimey British clean.',
    whatItDoes:
      'Models a Vox AC30 with the Top Boost circuit: two channels (we model the top boost), EL84 power tubes running Class A, and a treble/bass tone control instead of the more common bass/mid/treble. EL84s break up earlier than 6L6/EL34 and produce complex upper harmonics — that "chime" sound. Class-A operation means both halves of the power tube are always conducting, leading to softer, earlier breakup and more even-harmonic richness.',
    physics:
      'EL84s have lower plate voltage and run hotter than EL34/6L6 — so they saturate sooner and add more 2nd-harmonic content. Class A push-pull operation (vs Class A/B in most amps) means no crossover distortion at low signal levels and rich even-order harmonics at all levels. The Top Boost circuit injects a high-frequency boost before the tone stack, which is why these amps sound so bright. The mid range is shaped by a bell at ~1.5 kHz which is characteristic Vox "honk".',
    signalImpact: [
      'Strong upper-mid emphasis (the "chime")',
      'Earlier breakup than American amps — even at low gain, slight saturation appears',
      'Compresses musically under hard picking — rewards dynamics',
      'Loves single-coils and bright humbuckers; can sound shrill with bright pickups',
    ],
    headrushNotes:
      'On the Headrush Prime: "AC30 Top Boost", "AC15", or sometimes "Brit Jangle". Pair with a 2×12 or 1×12 cab loaded with Celestion Blue speakers — the Blues are key to the Vox sound. Light delay (slap-back to short) and spring or plate reverb completes the classic recipe. The Edge of U2 famously runs short tape delay + AC30 + chorus.',
    paramTips: {
      gain: 'AC30s start to break up early (around 3–4 on the gain knob). 1–2 = clean. 3–4 = jangly with edge. 5–7 = classic crunch. 8+ = full saturation.',
      bass: 'AC30s have limited low end naturally — boost +3 to +5 dB for fullness. Cut for very clean, bright work.',
      mid: 'Vox tone stacks classically don\'t have a separate mid — the natural voicing is mid-forward. Try –2 dB for jangle, +3 dB for vocal solos.',
      treble: '+4 to +6 dB for full chime. The "Top Boost" circuit is essentially a permanent treble boost.',
      presence: '+2 to +4 dB adds bell-like sparkle. Cut for warmer, jazzier vibe.',
      sag: 'EL84 Class-A amps sag noticeably — try 4–6 for authentic feel. Lower values feel modern; higher values feel more vintage/spongy.',
    },
  },
});
