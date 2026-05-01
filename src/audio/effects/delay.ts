import * as Tone from 'tone';
import type { EffectDefinition, EffectInstance } from '../../types';

/**
 * Analog-style mono feedback delay with a low-pass in the feedback path
 * to mimic the warm, decaying repeats of a bucket-brigade or tape delay.
 */
export const delayDef: EffectDefinition = {
  id: 'delay-analog',
  displayName: 'Analog Delay',
  category: 'delay',
  shortDescription:
    'Repeats your signal at a fixed time interval, with each repeat darker than the last.',
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
        'How long between each repeat. Short times sound like slap-back; long times sound like distinct echoes.',
    },
    {
      id: 'feedback',
      label: 'Feedback',
      min: 0,
      max: 0.92,
      step: 0.01,
      default: 0.4,
      description:
        'How much of the delayed signal is fed back into the delay line. More feedback = more repeats.',
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
        'Low-pass cutoff inside the feedback loop. Lower = darker analog/tape vibe; higher = clean digital repeats.',
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
  ],
  lesson: {
    tldr: 'A delay is just a buffer of past audio replayed later — feed it back into itself for cascading echoes.',
    whatItDoes:
      'Imagine holding a sample of your signal in memory and playing it back N milliseconds later. Now route a fraction of that delayed signal back into the input of the buffer — each pass is quieter, creating a series of fading repeats. That feedback loop is the "feedback" knob. Add a low-pass filter inside the loop and each repeat gets darker, mimicking the way magnetic tape and bucket-brigade chips lose treble on every pass.',
    physics:
      'Delay time, feedback, and the mix together determine the decay. With feedback at 0.5, each repeat is half the volume of the previous: 1.0 → 0.5 → 0.25 → 0.125. Subjective decay length follows roughly time × log(0.001) / log(feedback). The filter in the loop creates exponential treble loss per pass, which is what gives analog/tape delays their lush, blurry character.',
    signalImpact: [
      'Adds discrete repeats of the dry note',
      'Can lock to tempo (set time = 60000/BPM ms for quarter notes)',
      'High feedback near 1.0 self-oscillates — the loop never decays',
      'Long times + low mix create rhythmic counterpoint; short times thicken single notes',
    ],
    headrushNotes:
      'On the Headrush Prime, this maps to the Delay block. "Analog Delay" / "Tape Echo" are the warm, dark variants. "Digital Delay" has no feedback filter — repeats stay bright forever. Look for the "Tap Tempo" feature on Prime to sync delay time to a song.',
    paramTips: {
      time: '60–120 ms = "slap-back" rockabilly. 250–400 ms = standard "ballad" eighth/quarter notes. 800+ ms = ambient washes — pair with reverb.',
      feedback:
        'Below 0.3 you barely hear the second repeat. 0.4–0.6 is the sweet spot for most uses. Above 0.85 it rings out for many seconds; 0.95+ self-oscillates and is a sound effect.',
      tone: 'Around 3 kHz = classic dark tape echo. 8 kHz+ = pristine digital. The lower the cutoff, the faster the repeats "disappear" perceptually.',
      mix: '15–25% sits subtly behind the dry note. 40%+ makes the delay an obvious feature. 50/50 mix is the U2-style soaring lead sound.',
    },
  },
  create: (): EffectInstance => {
    const input = new Tone.Gain(1);
    const output = new Tone.Gain(1);
    const dryBus = new Tone.Gain(0.7);
    const wetBus = new Tone.Gain(0.3);

    // Delay loop with filter in feedback path
    const delay = new Tone.Delay({ delayTime: 0.38, maxDelay: 2 });
    const feedbackGain = new Tone.Gain(0.4);
    const fbFilter = new Tone.Filter({
      type: 'lowpass',
      frequency: 5000,
      Q: 0.5,
    });

    // Routing:
    //   input -> delay -> wetBus -> output
    //   delay -> fbFilter -> feedbackGain -> delay (feedback)
    //   input -> dryBus -> output
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

    return {
      input,
      output,
      setParam(id, value) {
        switch (id) {
          case 'time':
            delay.delayTime.rampTo(value / 1000, 0.05);
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
