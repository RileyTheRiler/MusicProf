import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Subdivision factor in beats. A quarter note = 1 beat, an eighth = 0.5, etc.
 * Index = subdivision enum value. Order matters: must match the labels below.
 */
const SUBDIVISIONS: { label: string; beats: number }[] = [
  { label: '1/2', beats: 2 },
  { label: 'dot 1/4', beats: 1.5 },
  { label: '1/4', beats: 1 },
  { label: 'dot 1/8', beats: 0.75 },
  { label: '1/8', beats: 0.5 },
  { label: '1/16', beats: 0.25 },
];

/**
 * Analog-style mono feedback delay with a low-pass in the feedback path
 * to mimic the warm, decaying repeats of a bucket-brigade or tape delay.
 *
 * Supports optional tempo-sync: when the 'sync' toggle is on, the delay
 * time is computed from the global tempo (BPM) and a subdivision
 * (quarter, dotted eighth, etc.) instead of from the Time knob.
 */
export const delayDef: EffectDefinition = {
  id: 'delay-analog',
  displayName: 'Analog Delay',
  category: 'delay',
  shortDescription:
    'Repeats your signal at a fixed time interval, with each repeat darker than the last. Can sync to global tempo.',
  implemented: true,
  params: [
    {
      id: 'time',
      label: 'Time',
      min: 30,
      max: 1500,
      step: 1,
      default: 380,
      unit: 'ms',
      description:
        'How long between each repeat. Used when Sync is off. Short = slap-back; long = distinct echoes.',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      min: 0,
      max: 0.92,
      step: 0.01,
      default: 0.4,
      description:
        'How much of the delayed signal is fed back. More feedback = more repeats.',
    },
    {
      id: 'tone',
      label: 'Tone',
      min: 1500,
      max: 12000,
      step: 50,
      default: 5000,
      unit: 'Hz',
      curve: 'log',
      description:
        'Low-pass cutoff inside the feedback loop. Lower = darker analog/tape vibe.',
    },
    {
      id: 'mix',
      label: 'Mix',
      min: 0,
      max: 1,
      step: 0.01,
      default: 0.3,
      description: 'Wet/dry blend.',
    },
    {
      id: 'sync',
      label: 'Sync',
      type: 'toggle',
      min: 0,
      max: 1,
      step: 1,
      default: 0,
      options: [
        { value: 0, label: 'Free' },
        { value: 1, label: 'Sync' },
      ],
      description:
        'When on, delay time is locked to the global tempo and Subdivision knob (the Time knob is ignored).',
    },
    {
      id: 'subdivision',
      label: 'Subdivision',
      type: 'enum',
      min: 0,
      max: SUBDIVISIONS.length - 1,
      step: 1,
      default: 2, // 1/4 note
      options: SUBDIVISIONS.map((s, i) => ({ value: i, label: s.label })),
      description:
        'When Sync is on, this picks the rhythmic value of each delay tap. "1/4" = quarter note (one tap per beat).',
    },
    {
      id: 'tempo',
      label: 'Tempo',
      type: 'hidden',
      min: 30,
      max: 300,
      default: 120,
      unit: 'BPM',
      description: 'Global tempo, set from the header. Not a per-block control.',
    },
  ],
  lesson: {
    tldr: 'A delay is just a buffer of past audio replayed later — feed it back into itself for cascading echoes. Tempo-sync locks each tap to a musical subdivision.',
    whatItDoes:
      'Imagine holding a sample of your signal in memory and playing it back N milliseconds later. Now route a fraction of that delayed signal back into the input of the buffer — each pass is quieter, creating a series of fading repeats. That feedback loop is the "feedback" knob. Add a low-pass filter inside the loop and each repeat gets darker, mimicking how tape and bucket-brigade chips lose treble per pass.',
    physics:
      'Delay time, feedback, and the mix together determine the decay. With feedback at 0.5, each repeat is half the volume of the previous: 1.0 → 0.5 → 0.25 → 0.125. Subjective decay length follows roughly time × log(0.001) / log(feedback). The filter in the loop creates exponential treble loss per pass, which is what gives analog/tape delays their lush, blurry character. Sync mode just sets time = (60000 / BPM) × beat-value.',
    signalImpact: [
      'Adds discrete repeats of the dry note',
      'Can lock to tempo (60 / BPM = seconds per beat)',
      'High feedback near 1.0 self-oscillates — the loop never decays',
      'Long times + low mix create rhythmic counterpoint; short times thicken single notes',
    ],
    headrushNotes:
      'On the Headrush Prime, this maps to the Delay block. "Analog Delay" / "Tape Echo" are the warm, dark variants. "Digital Delay" has no feedback filter — repeats stay bright forever. The Prime has a Tap Tempo footswitch that sets global tempo by tapping in time.',
    paramTips: {
      time: '60–120 ms = "slap-back" rockabilly. 250–400 ms = standard "ballad" eighth/quarter notes. 800+ ms = ambient washes — pair with reverb.',
      feedback:
        'Below 0.3 you barely hear the second repeat. 0.4–0.6 is the sweet spot. Above 0.85 rings out for many seconds; 0.95+ self-oscillates and is a sound effect.',
      tone: 'Around 3 kHz = classic dark tape echo. 8 kHz+ = pristine digital. The lower the cutoff, the faster the repeats "disappear" perceptually.',
      mix: '15–25% sits subtly behind the dry note. 40%+ makes the delay an obvious feature. 50/50 mix is the U2-style soaring lead sound.',
      sync: 'Off = use the Time knob freely. On = lock to global tempo. Click "Tap Tempo" in the header to set the BPM.',
      subdivision:
        '1/4 = one tap per beat (standard). Dotted 1/8 = three taps per two beats (the iconic "Edge from U2" sound). 1/8 = two taps per beat (faster, busier). 1/16 = four taps per beat (echo-y wash).',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0.7);
    const wetBus = new Tone.Gain(0.3);

    const delay = new Tone.Delay({ delayTime: 0.38, maxDelay: 4 });
    const feedbackGain = new Tone.Gain(0.4);
    const fbFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 5000,
      Q: 0.5,
    });

    input.connect(delay);
    delay.connect(fbFilter);
    fbFilter.connect(feedbackGain);
    feedbackGain.connect(delay);
    delay.connect(wetBus);
    wetBus.connect(output);

    input.connect(dryBus);
    dryBus.connect(output);

    let bypass = false;
    let lastMix = 0.3;
    let timeMs = 380;
    let sync = false;
    let subdivisionIdx = 2;
    let tempo = 120;

    const applyDelayTime = () => {
      let ms: number;
      if (sync) {
        const beats = SUBDIVISIONS[subdivisionIdx]?.beats ?? 1;
        ms = (60000 / tempo) * beats;
      } else {
        ms = timeMs;
      }
      // Clamp to the maxDelay of the underlying Tone.Delay (4s).
      ms = Math.min(ms, 4000);
      delay.delayTime.rampTo(ms / 1000, 0.05);
    };

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'time':
            timeMs = value;
            applyDelayTime();
            break;
          case 'feedback':
            feedbackGain.gain.value = Math.min(0.95, Math.max(0, value));
            break;
          case 'tone':
            fbFilter.frequency.value = value;
            break;
          case 'mix':
            lastMix = value;
            if (!bypass) {
              wetBus.gain.value = value;
              dryBus.gain.value = 1 - value;
            }
            break;
          case 'sync':
            sync = value > 0.5;
            applyDelayTime();
            break;
          case 'subdivision':
            subdivisionIdx = Math.round(value);
            if (sync) applyDelayTime();
            break;
          case 'tempo':
            tempo = Math.max(30, value);
            if (sync) applyDelayTime();
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
        [input, output, dryBus, wetBus, delay, feedbackGain, fbFilter].forEach(
          (n) => n.dispose()
        );
      },
    };
  },
};
