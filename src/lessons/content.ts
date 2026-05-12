import type { Chapter, Lesson } from './types';

// ----------------------------------------------------------------------------
// Lesson 1 — How Sound Works
// ----------------------------------------------------------------------------

const lessonSound101: Lesson = {
  id: 'sound-101',
  title: 'How Sound Works',
  subtitle: 'Frequency, amplitude, harmonics, and why a guitar sounds like a guitar.',
  estMinutes: 6,
  body: [
    {
      kind: 'p',
      text: 'Sound is **pressure waves traveling through air**. When something vibrates — a guitar string, a vocal cord, a speaker cone — it pushes the air molecules around it back and forth. Those tiny pressure changes radiate outward, and when they hit your eardrum they push it back and forth at the same rhythm. Your brain decodes that motion as "sound".',
    },
    { kind: 'h2', text: 'Two basic measurements' },
    {
      kind: 'p',
      text: 'Every pure tone has just two numbers: how *fast* the wave is cycling (**frequency**, measured in Hertz / cycles per second) and how *strong* each cycle is (**amplitude**). Frequency = pitch. Amplitude = loudness.',
    },
    {
      kind: 'list',
      items: [
        '**Low E (open 6th string)** vibrates at about **82 Hz** — 82 cycles per second.',
        '**Middle A** is **440 Hz** — the global tuning reference.',
        'Doubling the frequency = up one **octave**. So 440 Hz → 880 Hz is the next A up.',
        'The human ear hears roughly **20 Hz to 20,000 Hz** (20 kHz). High frequencies fade with age.',
      ],
    },
    { kind: 'h2', text: 'But a real guitar note is not a single frequency' },
    {
      kind: 'p',
      text: 'If you played a pure 220 Hz sine wave, it would sound like a flute or a tuning fork — clean, but boring. A guitar string vibrates in *multiple modes simultaneously*: the whole string at 220 Hz (the **fundamental**), but also the two halves at 440 Hz, the three thirds at 660 Hz, and so on. These extra frequencies are called **harmonics** or **overtones**.',
    },
    {
      kind: 'p',
      text: 'The relative *strength* of those harmonics is what makes a guitar sound like a guitar instead of a flute or a piano or a trumpet. We call this the **timbre** (TAM-ber). Every musical instrument has a unique harmonic fingerprint.',
    },
    {
      kind: 'callout',
      flavor: 'info',
      title: 'Why this matters for effects',
      text: 'Almost every guitar effect works by either ADDING new harmonics (distortion, fuzz, octave pedals) or RESHAPING the existing ones (EQ, wah, cabinets). If you understand harmonics, you understand 80% of what an effect is doing.',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Try this — see harmonics yourself',
        description:
          'Loads a pure clean chain (cab only). Click "Low E" then look at the WET spectrum panel — you\'ll see a tall peak at the fundamental (~82 Hz) plus a series of smaller peaks at 164, 246, 328 Hz, etc. That\'s the natural harmonic series of the string.',
        chain: [
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 60,
              highCut: 9000,
              resonance: 2,
              character: 2500,
            },
          },
        ],
        play: { kind: 'note', note: 'E2', label: 'Play Low E' },
      },
    },
  ],
};

// ----------------------------------------------------------------------------
// Lesson 2 — The Electric Guitar Signal
// ----------------------------------------------------------------------------

const lessonGuitarSignal: Lesson = {
  id: 'guitar-signal',
  title: 'The Electric Guitar Signal',
  subtitle: 'How a vibrating string becomes a voltage that ends up in a speaker.',
  estMinutes: 7,
  body: [
    {
      kind: 'p',
      text: 'On an acoustic guitar, the string\'s vibration moves the bridge and the top of the body, which moves the air around it — you hear the string almost directly. An electric guitar is different. The body is solid wood and barely vibrates. So how does the signal come out?',
    },
    { kind: 'h2', text: 'A pickup is a magnet wrapped in wire' },
    {
      kind: 'p',
      text: 'Each pickup is a permanent magnet (or a row of them) wrapped in thousands of turns of very fine copper wire. The magnet creates a steady magnetic field around itself. Steel guitar strings sit just above that field, and when you pluck a string, the *steel* of the string moves through the magnetic field. Faraday\'s law of induction kicks in: any conductor moving through a changing magnetic field has a voltage induced in it. The vibration of the string disturbs the field, and that disturbance induces a tiny AC voltage in the coil.',
    },
    {
      kind: 'p',
      text: 'The voltage waveform mirrors the string\'s motion almost exactly. If the string is vibrating at 220 Hz with overtones, the pickup output is a 220 Hz waveform with overtones. Pickup → cable → amp input.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Output level: roughly **50–500 mV peak** depending on pickup type and how hard you pick. That\'s why amps need a *preamp* stage first — to bring the signal up to "line level" (~1 V) before further processing.',
        'Output impedance: **high** (thousands of ohms). This is why guitar cables matter; long cables roll off treble due to capacitance.',
        'Frequency content: roughly **80 Hz to 5 kHz** for the fundamentals + audible harmonics. There\'s harmonic content above 5 kHz but it\'s much weaker.',
      ],
    },
    { kind: 'h2', text: 'Single-coil vs Humbucker' },
    {
      kind: 'p',
      text: 'A **single-coil** pickup (Strat, Tele) is one coil. It\'s bright, articulate, dynamic — and it picks up *any* magnetic interference around it (light dimmers, computer monitors, fluorescent lights). That\'s the famous "60 Hz hum" of single-coils.',
    },
    {
      kind: 'p',
      text: 'A **humbucker** (Les Paul, SG) is *two* single coils wired in series, with their magnets reversed and their signals out of phase. The string signal comes through normally because the magnets are flipped (the disturbance to one coil is opposite to the other and the out-of-phase wiring puts them in sync). But environmental hum hits both coils the same way and CANCELS. Result: thicker, darker, hum-free.',
    },
    { kind: 'h2', text: 'Pickup position' },
    {
      kind: 'p',
      text: 'A string vibrating at, say, 220 Hz has its highest overtones near the bridge (the string moves least there but with sharpest motion). Near the neck, the motion is broader and lower-frequency. So a **bridge pickup** sounds bright/cutting and a **neck pickup** sounds warm/round. Most guitars give you both, often with a 3- or 5-way switch.',
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'In this simulator',
      text: 'We use a Karplus-Strong plucked-string synth as our "guitar source". It captures the bright transient + decay shape of a real plucked string but doesn\'t model pickup type or position. So everything sounds roughly like a generic, neutral electric guitar.',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Hear the dry pickup signal',
        description:
          'Loads no effects — just the synth source straight to the speakers. Play a chord and look at the DRY waveform: a sharp pluck transient, then a roughly sinusoidal decaying tail. That shape is what every effect block is going to manipulate.',
        chain: [],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G#3', 'B3', 'E4'] },
      },
    },
  ],
};

// ----------------------------------------------------------------------------
// Lesson 3 — What's a Signal Chain?
// ----------------------------------------------------------------------------

const lessonSignalChain: Lesson = {
  id: 'what-is-a-signal-chain',
  title: 'What\'s a Signal Chain?',
  subtitle: 'The journey from string to speaker, block by block.',
  estMinutes: 6,
  body: [
    {
      kind: 'p',
      text: 'A **signal chain** is the ordered sequence of devices your guitar signal passes through on its way to a speaker. Each device modifies the signal in some way, and the *order* in which they\'re placed matters enormously — sometimes more than the devices themselves.',
    },
    {
      kind: 'p',
      text: 'On the Headrush Prime, you\'re building a virtual signal chain by arranging blocks. The Prime ships with a default block layout that mirrors how a typical pedalboard + amp rig is wired:',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Input / Noise Gate** — clean up the source',
        '**Compressor** — even out picking dynamics',
        '**Wah / Filter** — sweepable EQ',
        '**Drive / Distortion** — add harmonics',
        '**Amp** — simulated tube amp head',
        '**EQ** — reshape the post-amp tone',
        '**Cab** — simulated speaker cabinet',
        '**Modulation** (Chorus, Flanger, Phaser, Tremolo) — periodic effects',
        '**Delay** — echoes',
        '**Reverb** — simulated room ambience',
        '**Output** — final level',
      ],
    },
    { kind: 'h2', text: 'Why this order?' },
    {
      kind: 'p',
      text: 'Roughly: effects that *generate* tone come first, effects that *shape* tone come in the middle, and effects that *add space and time* come last.',
    },
    {
      kind: 'list',
      items: [
        '**Pitch / Dynamics first.** Comp and pitch shifters need a clean attack to work with. If they came after distortion, the distortion would have squashed the picking dynamics they\'re trying to read.',
        '**Drive + Amp + EQ + Cab in the middle.** This block is where your "core tone" is created — the saturation character + frequency shape that defines what kind of sound you have.',
        '**Modulation early-late.** Modulation can go either before or after distortion. Most players put it after for clarity; some (e.g., chorus on a clean Strat) put it before.',
        '**Time-based effects last.** Reverb and delay simulate space. They need to operate on a *finished* tone — the same tone you\'d be sending to a microphone in front of a real amp.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Rule of thumb',
      text: 'If you stack reverb BEFORE distortion, the distortion treats the reverb tail as more signal to distort, and you get a muddy, washed-out mess. Reverb basically always goes last.',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Load: Classic Rock Lead chain',
        description:
          'A canonical chain: Tube Screamer → Marshall amp → Cab → Delay → Reverb. Click around the blocks to see the order; play a note and watch how the signal evolves.',
        chain: [
          {
            defId: 'overdrive',
            bypass: false,
            paramValues: { drive: 0.25, tone: 3000, level: 3, mix: 1 },
          },
          {
            defId: 'amp-marshall-crunch',
            bypass: false,
            paramValues: {
              gain: 6.5,
              bass: -2,
              mid: 4,
              treble: 5,
              presence: 4,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 100,
              highCut: 5200,
              resonance: 5,
              character: 2400,
            },
          },
          {
            defId: 'delay-analog',
            bypass: false,
            paramValues: { time: 380, feedback: 0.32, tone: 4000, mix: 0.22 },
          },
          {
            defId: 'reverb-hall',
            bypass: false,
            paramValues: { size: 0.5, dampening: 5500, preDelay: 30, mix: 0.25 },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
  ],
};

// ----------------------------------------------------------------------------
// Lesson 4 — Why Order Matters
// ----------------------------------------------------------------------------

const lessonOrderMatters: Lesson = {
  id: 'why-order-matters',
  title: 'Why Order Matters',
  subtitle: 'The same blocks in different orders sound completely different.',
  estMinutes: 8,
  body: [
    {
      kind: 'p',
      text: 'Audio effects are mathematical operations on a signal, and most of those operations are NOT commutative. f(g(x)) ≠ g(f(x)). Two effects in different orders can produce wildly different sounds even with identical settings.',
    },
    { kind: 'h2', text: 'Reverb before vs after distortion' },
    {
      kind: 'p',
      text: 'Reverb adds a long tail of echoes after each note. Distortion squashes peaks above a threshold and adds harmonics.',
    },
    {
      kind: 'list',
      items: [
        '**Reverb → Distortion**: the long, soft reverb tail gets distorted. Result: a continuous wash of buzz that never decays, because the distortion compresses the whole tail to roughly equal volume. Sounds awful for guitar (used intentionally on synths sometimes).',
        '**Distortion → Reverb**: distortion does its thing on the dry note, then reverb adds clean echoes of the distorted signal. Sounds like a distorted guitar in a real room. ✓ This is what you want.',
      ],
    },
    {
      kind: 'demo',
      demo: {
        label: 'Compare yourself',
        description:
          'Loads Reverb FIRST then Distortion (the wrong way). Play and notice the never-decaying buzz tail.',
        chain: [
          {
            defId: 'reverb-hall',
            bypass: false,
            paramValues: { size: 0.7, dampening: 6000, preDelay: 30, mix: 0.5 },
          },
          {
            defId: 'overdrive',
            bypass: false,
            paramValues: { drive: 0.65, tone: 3000, level: 0, mix: 1 },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 90,
              highCut: 5500,
              resonance: 4,
              character: 2400,
            },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    {
      kind: 'demo',
      demo: {
        label: 'Now the right way',
        description:
          'Same blocks, reverb moved to AFTER distortion. Play the same chord and hear the obvious difference.',
        chain: [
          {
            defId: 'overdrive',
            bypass: false,
            paramValues: { drive: 0.65, tone: 3000, level: 0, mix: 1 },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 90,
              highCut: 5500,
              resonance: 4,
              character: 2400,
            },
          },
          {
            defId: 'reverb-hall',
            bypass: false,
            paramValues: { size: 0.7, dampening: 6000, preDelay: 30, mix: 0.5 },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    { kind: 'h2', text: 'Tube Screamer in front of vs after a distorted amp' },
    {
      kind: 'p',
      text: 'A Tube Screamer (overdrive pedal) set to LOW gain and HIGH level acts as a "boost" — barely any distortion of its own, just makes the signal louder and slightly mid-bumped. Where you put it relative to a distorted amp completely changes its job.',
    },
    {
      kind: 'list',
      items: [
        '**Tube Screamer → Distorted Amp**: pushes the front end of the amp harder, getting more saturation out of the AMP\'s clipping stages. Tightens the low end and brings out singing sustain. Classic lead tone trick — used by SRV, EVH, and basically every blues/rock player.',
        '**Distorted Amp → Tube Screamer**: now the TS is distorting an already-distorted signal. Result: stacked, saturated mush. Loses dynamics, sounds unmusical.',
      ],
    },
    { kind: 'h2', text: 'EQ before vs after drive' },
    {
      kind: 'p',
      text: 'A 3-band EQ before a distortion shapes WHAT GETS DISTORTED. After, it shapes the FINAL TONE. Both are useful for different reasons.',
    },
    {
      kind: 'list',
      items: [
        '**EQ → Drive**: cutting bass before distortion means distortion has less low-frequency energy to chew on, so the result is *tighter*. Boosting mids before distortion gives a singing, mid-rich sustain.',
        '**Drive → EQ**: shapes the post-distortion frequency balance. Use to tame fizzy highs or scoop mids for "metal" voicing.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Power-user move',
      text: 'Many pros use BOTH — an EQ before drive to shape what gets distorted, and another EQ after for final-tone correction. The Headrush Prime lets you place EQ blocks anywhere; experiment liberally.',
    },
    { kind: 'h2', text: 'Modulation before or after?' },
    {
      kind: 'p',
      text: 'There\'s no rule here — both are valid. Putting modulation BEFORE drive makes the drive react to the modulated signal, producing more chaotic harmonic interaction. AFTER drive (more common) means clean modulation of an already-distorted tone, sounds cleaner.',
    },
    { kind: 'h2', text: 'The big picture' },
    {
      kind: 'list',
      items: [
        'Time-based effects (delay, reverb): **almost always last**.',
        'Modulation effects: **either side of drive works**, after is more common.',
        'EQ + drive: **both placements useful** for different reasons.',
        'Pitch/comp: **before drive**, so they read the clean signal.',
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// Lesson 5 — Gain Staging
// ----------------------------------------------------------------------------

const lessonGainStaging: Lesson = {
  id: 'gain-staging',
  title: 'Gain Staging',
  subtitle: 'The clean → break-up → distortion → fuzz continuum, and why every stage matters.',
  estMinutes: 8,
  body: [
    {
      kind: 'p',
      text: '**Gain** is just amplification — multiplying the signal\'s amplitude by some factor. Every stage in your signal chain has a gain (positive or negative), and they all multiply together. A 2x gain followed by a 3x gain is 6x total. So far so simple.',
    },
    {
      kind: 'p',
      text: 'But there\'s a catch: every real-world amplifier has a maximum output. Push it past that ceiling and the waveform gets clipped — peaks above the ceiling are flattened. Clipping a smooth wave generates new harmonics. Those new harmonics ARE distortion.',
    },
    { kind: 'h2', text: 'The continuum' },
    {
      kind: 'list',
      items: [
        '**Pristine clean** — amp running well below its clipping ceiling. Pure tone, full dynamics.',
        '**Edge of breakup** — amp clipping only on the loudest peaks (your hardest pick attacks). Subtle "growl" appears on dynamics. Blues territory.',
        '**Crunch** — clipping on most notes. Compressed-sounding; you can still hear the fundamental clearly. Classic rock rhythm.',
        '**High gain / saturation** — clipping is the dominant character. Notes ring out with sustain because the clipping ceiling = constant output. Modern metal, hard rock.',
        '**Fuzz** — extreme hard clipping, often with very high pre-gain. Wave is essentially square. Sounds buzzy, synth-like, often gated/garbled. Hendrix, Jack White, Black Keys.',
      ],
    },
    {
      kind: 'demo',
      demo: {
        label: 'Hear the continuum',
        description:
          'Loads a chain with a Marshall set clean. Play a chord, then click the Marshall block and slowly drag the GAIN knob from 1 to 9. You\'ll hear the continuum in real time, plus see the WET spectrum fill with new harmonic peaks.',
        chain: [
          {
            defId: 'amp-marshall-crunch',
            bypass: false,
            paramValues: {
              gain: 1,
              bass: -1,
              mid: 3,
              treble: 4,
              presence: 3,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 90,
              highCut: 5500,
              resonance: 4,
              character: 2400,
            },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    { kind: 'h2', text: 'Soft clip vs hard clip' },
    {
      kind: 'p',
      text: 'Tube amps and warm-sounding pedals use **soft clipping** — the wave\'s peak is rounded over, like a soft shoulder. Solid-state circuits and most fuzz pedals use **hard clipping** — the peak is sliced flat. Soft clip generates fewer high-frequency harmonics and sounds "warmer". Hard clip generates lots of high-order harmonics and sounds "harsh" or "buzzy".',
    },
    {
      kind: 'p',
      text: 'In the math: soft clip ≈ tanh(x), hard clip ≈ sign(x) × min(|x|, 1). Both are non-linear functions. Linear processing (volume, EQ, delay, reverb) doesn\'t generate harmonics. Non-linear processing always does.',
    },
    { kind: 'h2', text: 'Multiple gain stages' },
    {
      kind: 'p',
      text: 'A real tube amp has 2–5 gain stages in series. Each stage softly clips, then the next stage takes that already-clipped signal and clips it further. The interaction is complex and musical — much richer than a single super-clipping stage. This is why a hi-gain amp like the Mesa Rectifier doesn\'t just "turn up the volume on a Fender" — it has structurally different gain staging.',
    },
    {
      kind: 'callout',
      flavor: 'info',
      title: 'Why pre-distortion EQ matters',
      text: 'If you boost bass before a clipping stage, the bass frequencies push the stage harder than the rest, so they distort more — which sounds muddy because low-frequency distortion creates low-frequency intermodulation. That\'s why hi-gain players almost always cut bass BEFORE the amp (with an EQ block or by using a Tube Screamer, which has a built-in bass cut).',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Same gain knob, three amps',
        description:
          'Loads a chain with all three implemented amp models in parallel-ish positions. Toggle between them by bypassing two and unbypassing one at a time. Same gain setting, dramatically different character — that\'s the power of multi-stage architecture.',
        chain: [
          {
            defId: 'amp-fender-clean',
            bypass: false,
            paramValues: {
              gain: 6,
              bass: 2,
              mid: 0,
              treble: 4,
              presence: 2,
              sag: 2,
              volume: 0,
            },
          },
          {
            defId: 'amp-marshall-crunch',
            bypass: true,
            paramValues: {
              gain: 6,
              bass: -1,
              mid: 3,
              treble: 4,
              presence: 3,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'amp-mesa-higain',
            bypass: true,
            paramValues: {
              gain: 6,
              bass: -3,
              mid: -1,
              treble: 4,
              presence: 3,
              sag: 2,
              volume: 0,
            },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 90,
              highCut: 5500,
              resonance: 4,
              character: 2400,
            },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    { kind: 'h2', text: 'Setting your gain stages' },
    {
      kind: 'list',
      items: [
        'Start at the **source** (your guitar volume, pickup output) and work forward.',
        'At each stage, set its level so the next stage sees a healthy signal — not so loud it clips unintentionally, not so quiet it adds noise.',
        'Distortion = intentional clipping. Choose WHICH stage clips and how hard.',
        'Comp + drive in front of an amp can be used as a "boost" — adds output without distorting itself, but pushes the amp harder.',
        'Always A/B with bypass to confirm you\'re actually improving the tone, not just making it louder.',
      ],
    },
  ],
};

// ----------------------------------------------------------------------------
// Chapter 2 — Time, Modulation, and Putting It All Together
// ----------------------------------------------------------------------------

const lessonTimeEffects: Lesson = {
  id: 'time-effects',
  title: 'Time-Based Effects',
  subtitle: 'Delay and reverb — what they actually do.',
  estMinutes: 6,
  body: [
    {
      kind: 'p',
      text: 'Delay and reverb are the family of "time-based" effects. They store past audio and play it back later. Both create a sense of *space* — making your guitar sound like it\'s in a room rather than wired directly into your headphones.',
    },
    { kind: 'h2', text: 'Delay = discrete echoes' },
    {
      kind: 'p',
      text: 'A delay holds a buffer of past audio and replays it some milliseconds later. Feed a fraction of the delayed signal back into the buffer\'s input and you get cascading repeats, each quieter than the last (a feedback loop with gain < 1).',
    },
    {
      kind: 'list',
      items: [
        '**Time** = the gap between repeats, in milliseconds. Sync to song tempo for musical results: 60000 / BPM = milliseconds per beat.',
        '**Feedback** = how much of each repeat feeds back into the buffer. 0 = single echo; 0.5 = each repeat half as loud as the previous; 1.0 = self-oscillates forever.',
        '**Mix** = wet/dry blend. Subtle (10–20%) for ambience; heavy (40–50%) for the famous "U2" delay sound.',
      ],
    },
    {
      kind: 'p',
      text: 'Adding a low-pass filter inside the feedback loop makes each repeat darker than the previous — that\'s the warm, blurry sound of analog/tape delay. Without the filter, repeats stay bright forever (digital delay).',
    },
    { kind: 'h2', text: 'Reverb = thousands of echoes' },
    {
      kind: 'p',
      text: 'When sound bounces around a room, it doesn\'t come back as one echo — it comes back as a *cloud* of thousands of overlapping echoes from every wall, ceiling, floor, and object. That dense decay is reverb.',
    },
    {
      kind: 'p',
      text: 'There are three perceptual phases:',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Direct sound** — your dry signal arriving first.',
        '**Early reflections** — a few discrete bounces off nearby surfaces, arriving 5–50 ms later. These tell your brain about room SIZE and SHAPE.',
        '**Late reverb tail** — a dense, exponentially decaying wash. Tells your brain about how absorbent the surfaces are.',
      ],
    },
    {
      kind: 'p',
      text: 'Two implementation approaches: **algorithmic** (a network of feedback delay lines, computationally cheap, infinitely tweakable) or **convolution** (record a real space\'s impulse response and convolve your signal with it — sounds like the real space, but you can\'t easily change "size").',
    },
    {
      kind: 'callout',
      flavor: 'info',
      title: 'Reverb types',
      text: 'On the Headrush Prime, you\'ll see Hall (big & diffuse), Plate (bright, metallic — invented because hanging a metal plate was cheaper than building a real reverb chamber), Spring (boingy "tank" reverb in old Fender amps), Room (small, intimate), and Shimmer (adds a pitch-shifted +octave to the tail). Each is the same algorithm with different tuning.',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Try this — feel a long ambient delay',
        description:
          'Loads a slow Vox + long delay + big reverb chain. Play one note and let it ring — listen to the cascade of echoes from the delay slowly turning into a wash from the reverb.',
        chain: [
          {
            defId: 'amp-vox-chime',
            bypass: false,
            paramValues: {
              gain: 4,
              bass: 4,
              mid: 1,
              treble: 5,
              presence: 3,
              sag: 5,
              volume: 0,
            },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 80,
              highCut: 6000,
              resonance: 5,
              character: 2700,
            },
          },
          {
            defId: 'delay-analog',
            bypass: false,
            paramValues: { time: 480, feedback: 0.55, tone: 5500, mix: 0.4 },
          },
          {
            defId: 'reverb-hall',
            bypass: false,
            paramValues: { size: 0.85, dampening: 8000, preDelay: 50, mix: 0.55 },
          },
        ],
        play: { kind: 'note', note: 'E4', label: 'Pluck a high E' },
      },
    },
  ],
};

const lessonModulation: Lesson = {
  id: 'modulation-family',
  title: 'The Modulation Family',
  subtitle: 'Chorus, flanger, phaser, tremolo — periodic effects that make a static signal feel alive.',
  estMinutes: 7,
  body: [
    {
      kind: 'p',
      text: '**Modulation effects** all share one core idea: a slow oscillator (an LFO — low-frequency oscillator) cyclically changes some parameter of an effect over time. The parameter changes might be tiny but the *cyclic motion* is what your ear locks onto.',
    },
    { kind: 'h2', text: 'Chorus' },
    {
      kind: 'p',
      text: 'Take your signal, copy it through a short delay (~10–30 ms), modulate that delay time with an LFO. Mix the dry + delayed-and-modulated copy. Result: the copy is slightly pitch-shifted (because changing delay time mid-stream shifts pitch — a Doppler effect), constantly moving up and down by a few cents.',
    },
    {
      kind: 'p',
      text: 'Sounds like multiple guitarists playing the same part — a "chorus" of slightly out-of-tune voices. Adds thickness and stereo width.',
    },
    { kind: 'h2', text: 'Flanger' },
    {
      kind: 'p',
      text: 'Same idea as chorus but with much shorter delay (1–10 ms) and feedback. The short delay creates audible **comb filtering** — peaks and notches across the spectrum. Sweeping the delay time sweeps the comb. The feedback emphasizes the peaks, producing the characteristic resonant "jet plane" whoosh.',
    },
    { kind: 'h2', text: 'Phaser' },
    {
      kind: 'p',
      text: 'Phasers DON\'T use delay. They use a chain of all-pass filters (filters that change phase but not amplitude). When you mix the all-pass-filtered signal with the dry, the phase shifts cause cancellations at certain frequencies — creating notches. An LFO sweeps the all-pass filter cutoffs, sweeping the notches across the spectrum. Sounds smoother and less metallic than a flanger because there\'s no comb stack — just a couple of moving notches.',
    },
    { kind: 'h2', text: 'Tremolo' },
    {
      kind: 'p',
      text: 'The simplest of the four. An LFO modulates the *volume* of the signal — the entire signal swells up and down at the LFO rate. Sine wave LFO = smooth swell. Square wave LFO = on/off chop. No pitch change (that\'s vibrato; Fender mislabeled them in the 60s and the misnomer stuck).',
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Quick mnemonic',
      text: 'CHORUS = pitch wobble. FLANGER = jet plane comb sweep. PHASER = swirly notches. TREMOLO = volume chop. Once you can identify them by ear, you\'ll never confuse them again.',
    },
    {
      kind: 'demo',
      demo: {
        label: 'A/B the four modulations',
        description:
          'Loads all four modulation blocks in series, all bypassed except chorus. Play a chord, then bypass chorus and unbypass each in turn — you\'ll viscerally hear the differences.',
        chain: [
          {
            defId: 'amp-fender-clean',
            bypass: false,
            paramValues: {
              gain: 3,
              bass: 2,
              mid: 0,
              treble: 4,
              presence: 2,
              sag: 2,
              volume: 0,
            },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: {
              lowCut: 80,
              highCut: 6500,
              resonance: 3,
              character: 2400,
            },
          },
          {
            defId: 'mod-chorus',
            bypass: false,
            paramValues: { rate: 0.7, depth: 0.5, spread: 120, mix: 0.5 },
          },
          {
            defId: 'phaser',
            bypass: true,
            paramValues: { rate: 0.5, octaves: 3, baseFreq: 350, mix: 0.5 },
          },
          {
            defId: 'tremolo',
            bypass: true,
            paramValues: { rate: 5, depth: 0.7, shape: 0, spread: 0 },
          },
        ],
        play: { kind: 'chord', notes: ['C3', 'E3', 'G3', 'C4', 'E4'] },
      },
    },
  ],
};

const lessonBuildingTone: Lesson = {
  id: 'building-tone',
  title: 'Building a Tone From Scratch',
  subtitle: 'A step-by-step recipe you can apply to any rig.',
  estMinutes: 5,
  body: [
    {
      kind: 'p',
      text: 'Most beginners build tones by stacking effects until it sounds "cool". That works, but it\'s wasteful and hard to debug. Here\'s a more disciplined approach.',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        '**Start at zero.** Bypass everything. Listen to the dry pickup signal. This is your baseline; every effect you add must JUSTIFY itself relative to bypass.',
        '**Pick an amp + cab combination.** This is the foundation of your tone (50–80% of what you\'ll hear). Get this right before adding anything else.',
        '**Set the amp gain at the level of saturation you want.** Not louder, not cleaner. If you want clean, set Gain low. If you want metal, crank it.',
        '**Adjust the tone stack** (Bass / Mid / Treble / Presence) until the amp itself sounds good without anything else.',
        '**Add a drive pedal IF you want a different character of saturation than the amp gives you alone.** A Tube Screamer in front of a lightly-driven amp = sustain + tightness. Skip if amp gain alone is enough.',
        '**Add comp IF dynamics need evening out.** Funk / country: definitely. Heavy rock: usually not (the amp is already compressing).',
        '**Add EQ IF specific frequencies need fixing.** Cut what\'s offensive before boosting what\'s good.',
        '**Add modulation LAST among "tone-shaping" effects.** Chorus to thicken, phaser/flanger for movement.',
        '**Add delay and reverb LAST OF ALL.** Set them subtle — if you can clearly hear them, they\'re probably too loud. Aim for "I notice something\'s missing when I bypass them".',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'A/B everything',
      text: 'After every change, toggle bypass on the block you just adjusted. If bypass sounds the same or better, the block is doing nothing useful — remove it or rethink it. The discipline of A/B testing is the difference between a "great" tone and a "loud, busy" tone.',
    },
    { kind: 'h2', text: 'Common beginner mistakes' },
    {
      kind: 'list',
      items: [
        '**Too much reverb.** Sounds great in your headphones; sounds like a swamp in a band mix.',
        '**Too much gain.** More gain = less dynamics = less expression. Most "great rock tones" use less gain than you\'d guess.',
        '**Stacking similar effects.** Two delays, three drives, four reverbs — pick the one that\'s working and remove the rest.',
        '**Comparing tones at different volumes.** Louder always sounds "better" because of how human hearing works (Fletcher-Munson). Always level-match before A/Bing.',
        '**Ignoring the cab.** Cab choice changes tone as much as amp choice. Don\'t neglect it.',
      ],
    },
    {
      kind: 'p',
      text: 'You now have a workflow. Open the Lab, load any preset as a starting point, and start experimenting. The best way to learn what each block actually does is to BYPASS it and hear what it was doing.',
    },
  ],
};

const lessonPickupsDeepDive: Lesson = {
  id: 'pickups-deep-dive',
  title: 'Pickups Deep Dive',
  subtitle:
    'Why a Strat sounds like a Strat: single-coil vs humbucker electrical physics, and what each pickup does to your tone.',
  estMinutes: 7,
  body: [
    {
      kind: 'p',
      text: 'The single biggest factor in your guitar\'s tone — bigger than pedals, bigger than amp choice for "what guitar do I sound like" — is the pickup. A Stratocaster bridge single-coil into a clean amp will never sound like a Les Paul humbucker into the same amp, no matter what knob tweaks you do. The pickups are doing too much.',
    },
    { kind: 'h2', text: 'A pickup is an LC circuit' },
    {
      kind: 'p',
      text: 'Electrically, a pickup is three things wired together: an **inductor** (the thousands of turns of fine wire wrapped around the magnet), a **capacitance** (the coil\'s self-capacitance plus the cable plus the volume/tone pot), and some **resistance** (DC resistance of the coil). That\'s a classic RLC circuit — a damped resonant oscillator.',
    },
    {
      kind: 'p',
      text: 'An RLC circuit has a **resonant frequency** where it amplifies the input signal — a peak in the frequency response. For a guitar pickup, that peak typically sits in the upper midrange (2–5 kHz). Everything below the peak passes through roughly flat; everything above the peak rolls off steeply.',
    },
    {
      kind: 'callout',
      flavor: 'info',
      title: 'The math',
      text: 'Resonant frequency fr = 1 / (2π × √(LC)). A typical single-coil has inductance L ≈ 2.5 H. With cable capacitance C ≈ 500 pF, that gives fr ≈ 4.5 kHz. A typical humbucker has L ≈ 5 H, so fr ≈ 3.2 kHz with the same cable. That difference in resonant frequency is the BIGGEST audible difference between the two pickup types.',
    },
    { kind: 'h2', text: 'Single-coils vs humbuckers' },
    {
      kind: 'list',
      items: [
        '**Single-coil** (Strat, Tele): one coil. Lower inductance → resonant peak around 4–5 kHz → bright, clear, dynamic. Picks up 60 Hz hum from any nearby AC electrical equipment.',
        '**Humbucker** (Les Paul, SG, 335): two coils wired with reversed magnets and reversed wiring. Their string signals reinforce; any environmental hum cancels (hence "hum-bucker"). The two coils in series have ~2× the inductance → resonant peak around 2.5–3 kHz → darker, mid-richer, hotter output. No hum.',
        '**P90**: a single coil with a wider/flatter geometry. More turns than a Strat-style single, but only one coil. Inductance lands between Strat and humbucker → resonant peak ~3 kHz. Fatter than a single-coil, brighter than a humbucker. Punk rock, Mick Ronson, Leslie West.',
      ],
    },
    {
      kind: 'demo',
      demo: {
        label: 'A/B: same chord, three pickup types',
        description:
          'Plain clean Fender amp + cab. After loading, open the Input source panel above the chain and try changing the Pickup dropdown: Strat Bridge → Humbucker Bridge → P90. Same chord, dramatically different tones, with only the pickup model changing.',
        chain: [
          {
            defId: 'amp-fender-clean',
            bypass: false,
            paramValues: {
              gain: 4,
              bass: 2,
              mid: 0,
              treble: 3,
              presence: 1,
              sag: 2,
              volume: 0,
            },
          },
          {
            defId: 'cab-tweed',
            bypass: false,
            paramValues: { lowCut: 80, highCut: 6500, air: 1, mix: 1 },
          },
        ],
        play: { kind: 'chord', notes: ['C3', 'E3', 'G3', 'C4', 'E4'] },
      },
    },
    { kind: 'h2', text: 'Position matters too' },
    {
      kind: 'p',
      text: 'A given pickup\'s position under the string also shapes its tone, because the string vibrates with DIFFERENT amplitude at different points along its length. A node in the middle of the string and an antinode near the bridge means:',
    },
    {
      kind: 'list',
      items: [
        '**Bridge pickup** — close to the string\'s anchored end. The string moves least there (small overall amplitude) but with the SHARPEST motion (lots of high-frequency content). Result: bright, cutting, treble-forward tone. Good for cutting through a band mix, for rhythm, for cleans that need bite.',
        '**Neck pickup** — close to the 12th-fret antinode. The string moves the MOST there with BROADER motion (less high frequency, more low/mid). Result: warm, dark, "vocal" tone. Good for solos, jazz, ballads.',
        '**Middle pickup** (Strat) — in between. Slightly darker than bridge, slightly brighter than neck.',
        '**Quack** — combining two pickups (Strat positions 2 and 4) creates phase relationships at certain frequencies that cause notches — the iconic "out of phase" sound used by Mark Knopfler and John Mayer.',
      ],
    },
    { kind: 'h2', text: 'What pickups do NOT do' },
    {
      kind: 'p',
      text: 'A few myths to dispel:',
    },
    {
      kind: 'list',
      items: [
        '**Pickups don\'t "add sustain"** — sustain comes from the string and the guitar\'s mass. A pickup just LISTENS, it doesn\'t feed back energy.',
        '**Pickup magnets don\'t "color" tone much** — magnet type (Alnico II vs V vs ceramic) matters less than the coil\'s inductance/capacitance. Magnet type affects the magnetic field strength under the string, which subtly affects sustain and dynamics but not "tone" the way the coil shape does.',
        '**Active pickups (EMG, Fishman Fluence) are different** — they have an onboard preamp that flattens the natural resonant peak, giving a "linear" output. Sounds modern and consistent; loses the natural resonance personality.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'In this app',
      text: 'The pickup model is applied to BOTH the synthesized voice and live input. For synth: it makes the otherwise-generic Karplus-Strong source sound like a specific guitar. For live input: defaults to "Flat" since your real guitar already has a real pickup — but you can layer one on to hear what a single-coil-style EQ does to your humbucker tone (basically a coloration effect at that point).',
    },
  ],
};

const lessonReadingTheSignal: Lesson = {
  id: 'reading-the-signal',
  title: 'Reading the Signal at Each Stage',
  subtitle:
    'How to use the per-block scope to see exactly what each effect is doing.',
  estMinutes: 4,
  body: [
    {
      kind: 'p',
      text: 'The visualizer at the top of the Lab shows you the signal at the BEGINNING of the chain (DRY) and at the END (WET, post-everything). That tells you the total impact of all your effects combined — but not what each one is contributing.',
    },
    {
      kind: 'p',
      text: 'Now click any block in the signal chain. The block lights up with an amber **"scope"** badge, and a second panel appears under the main visualizer showing the signal entering the block (purple) and leaving the block (green). You\'re literally watching that one block do its work.',
    },
    { kind: 'h2', text: 'What to look for' },
    {
      kind: 'list',
      items: [
        '**Distortion / Amp blocks**: input waveform is smooth sine-ish; output has flat tops/bottoms (clipping) AND the spectrum has new peaks at integer multiples of the fundamental (harmonics being generated).',
        '**EQ / Cab**: waveform looks similar in and out, but the spectrum shape changes — peaks here, dips there. EQ is linear, so it can\'t create new frequencies, only reshape existing ones.',
        '**Delay**: clean dry signal in, plus delayed repeats out. The output waveform shows the original PLUS a quieter copy starting a few hundred ms later.',
        '**Reverb**: dry input, washed/smeared output. The output spectrum has energy in the gaps where the dry signal was silent.',
        '**Modulation (chorus, phaser, flanger)**: input and output spectra look similar, but the output\'s spectrum SHIFTS around over time as the LFO modulates. Watch the spectrum panel — it should be visibly moving.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'A pedagogy trick',
      text: 'Pick a chain (any preset). Click each block one at a time, starting from the leftmost. Play a chord. Watch how the output of one block becomes the input of the next. You\'re seeing the signal transformation cascade live. This is the kind of insight you literally cannot get from listening alone.',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Try it — load a chain and click around',
        description:
          'Loads the Classic Rock Lead chain. After loading, click the Overdrive block in the chain to see what it\'s doing; then click the Marshall to see how the amp transforms the OD\'s output; then click the cab to see the cab filter the amp\'s output.',
        chain: [
          {
            defId: 'overdrive',
            bypass: false,
            paramValues: { drive: 0.25, tone: 3000, level: 3, mix: 1 },
          },
          {
            defId: 'amp-marshall-crunch',
            bypass: false,
            paramValues: {
              gain: 6.5,
              bass: -2,
              mid: 4,
              treble: 5,
              presence: 4,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: { lowCut: 100, highCut: 5200, air: 0, mix: 1 },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    {
      kind: 'p',
      text: 'Two important caveats. (1) Bypassed blocks pass their input through unchanged, so input and output look identical — which is correct, that\'s what bypass means. (2) Some blocks (like the Wah\'s auto-mode) modulate over time, so the spectrum keeps moving even when nothing is "happening" musically. Stare for a few seconds before deciding what you\'re seeing.',
    },
  ],
};

const lessonABCompare: Lesson = {
  id: 'ab-compare',
  title: 'A/B Compare',
  subtitle:
    'How professionals actually evaluate tone changes — and why your ears lie to you without it.',
  estMinutes: 4,
  body: [
    {
      kind: 'p',
      text: 'Here\'s a hard truth about ear training: **your hearing has terrible short-term memory**. You can\'t reliably compare a tone you heard 30 seconds ago against the one you\'re hearing right now. The brain rewrites the past constantly. So if you tweak a knob, play, tweak again, play — you\'re not actually evaluating anything, you\'re just accumulating changes and hoping it sounds "better".',
    },
    {
      kind: 'p',
      text: 'The fix is **A/B testing** — keeping two versions of a tone available and flipping between them *instantly*. Your brain can compare two stimuli that are seconds apart way better than two stimuli a minute apart.',
    },
    { kind: 'h2', text: 'Using slots in this Lab' },
    {
      kind: 'p',
      text: 'Above the chain you\'ll see two tabs: **A** and **B**. Each is an independent chain. You can:',
    },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Build a tone in **A**.',
        'Click **A → B** to copy it into slot B.',
        'Click **B**, tweak something — try changing one block, one knob, or one effect order.',
        'Now flip between **A** and **B** (or press the **A** / **B** keyboard hotkeys) while playing. Your brain can hear the difference instantly.',
        'If B is better, click **B → A** to "commit" it and start a new round of tweaks.',
        'If A is better, switch back, no harm done.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Level-match first',
      text: 'A/B is meaningless if the two versions are at different volumes — louder always sounds "better" because of how human hearing works (Fletcher-Munson curves). Before evaluating, set the master or block output gains so both A and B are *equally loud*. Only then are you comparing tone instead of volume.',
    },
    { kind: 'h2', text: 'What to compare' },
    {
      kind: 'list',
      items: [
        '**Effect order**: same blocks in two different orders. Reverb → distortion vs distortion → reverb is a classic; you\'ll never confuse them again after A/Bing once.',
        '**Different cabs**: same amp + drive, just swap the cab block. The cab matters more than people think — A/B makes it obvious.',
        '**With vs without a block**: copy chain to B, then disable one block in B. Did the chain need it?',
        '**Different amps**: same drive, same cab, just swap the amp model. Hear what each amp\'s saturation character does.',
        '**Settings**: copy chain to B, change ONE knob a lot. Then A/B and ask "does the change make it better, or just different?"',
      ],
    },
    {
      kind: 'demo',
      demo: {
        label: 'A/B starter — Marshall vs Mesa',
        description:
          'Loads a Marshall-amp chain into the active slot. After loading, click "A → B" in the slot switcher, then in slot B replace the Marshall block with a Mesa Hi-Gain (Effects palette at the bottom). Now flip A / B while playing — same drive, same cab, only the amp model changes.',
        chain: [
          {
            defId: 'overdrive',
            bypass: false,
            paramValues: { drive: 0.2, tone: 3000, level: 3, mix: 1 },
          },
          {
            defId: 'amp-marshall-crunch',
            bypass: false,
            paramValues: {
              gain: 5,
              bass: -1,
              mid: 3,
              treble: 4,
              presence: 3,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'cab-v30',
            bypass: false,
            paramValues: { lowCut: 100, highCut: 5500, air: 0, mix: 1 },
          },
          {
            defId: 'reverb-hall',
            bypass: false,
            paramValues: { size: 0.4, dampening: 6000, preDelay: 20, mix: 0.18 },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    { kind: 'h2', text: 'Why this works' },
    {
      kind: 'p',
      text: 'Your auditory cortex is wired to detect change, not absolute qualities. Two consecutive stimuli ~1 second apart light up your "difference detector"; the same two stimuli minutes apart trigger memory reconstruction, which is unreliable. Pro audio engineers do A/B comparisons obsessively — for every EQ move, every compressor setting, every mixing decision. It\'s not a special skill; it\'s a basic discipline that makes them sound consistently better than people who tweak by feel.',
    },
  ],
};

// ----------------------------------------------------------------------------
// Chapter assembly
// ----------------------------------------------------------------------------

const foundations: Chapter = {
  id: 'foundations',
  title: 'Foundations',
  description:
    'How sound, guitars, and signal chains work — read top to bottom for a structured intro.',
  lessons: [
    lessonSound101,
    lessonGuitarSignal,
    lessonPickupsDeepDive,
    lessonSignalChain,
    lessonOrderMatters,
    lessonGainStaging,
    lessonReadingTheSignal,
  ],
};

const lessonCabsAndIRs: Lesson = {
  id: 'cabs-and-irs',
  title: 'Cabs and Impulse Responses',
  subtitle:
    'Why a guitar cab is more than "a speaker", and what convolution actually does to your signal.',
  estMinutes: 7,
  body: [
    {
      kind: 'p',
      text: 'When you hear "Marshall sound", "Vox sound", "Mesa sound" — half of what you\'re hearing is the AMP. The other half is the **cabinet** (and the **microphone** in front of it). Together, the cab + mic act as a complicated, frequency-dependent filter on top of the amp\'s signal. Get the cab wrong and even a beautiful amp tone collapses.',
    },
    { kind: 'h2', text: 'Why a cab matters so much' },
    {
      kind: 'list',
      items: [
        'A guitar speaker is a mechanical low-pass + resonator. The paper cone has mass and stiffness. It can\'t move fast enough to reproduce frequencies above ~5–6 kHz; it can\'t move enough air to reproduce below ~80 Hz. Inside that band, the cone has resonant modes that emphasize certain frequencies — the cab\'s "voice".',
        'The cabinet box itself adds resonances at low frequencies (50–150 Hz), like an instrument body.',
        'The microphone picks up some of the room around the cab too — early reflections off the back of the cab, the wall behind it, etc.',
        'Different speakers (Greenback, Vintage 30, Blue Alnico, Tweed Jensen) have measurably different resonant profiles. Different cabinets (open-back 1×12 vs closed-back 4×12) sound dramatically different even with the same speakers.',
      ],
    },
    { kind: 'h2', text: 'How modeling rigs reproduce this' },
    {
      kind: 'p',
      text: 'Without a cab, a raw distorted amp signal is full of energy above 5 kHz — buzzy, harsh, "digital-sounding". To replicate the natural smoothing of a real cab, modeling rigs use a math operation called **convolution** with an **impulse response** (IR).',
    },
    { kind: 'h2', text: 'What is an impulse response?' },
    {
      kind: 'p',
      text: 'An IR is the *output* of a system when you feed it a single-sample "click" (a Dirac impulse). For a cab + mic, the IR is what the mic captures after that click hits the speaker — a short ~100 ms recording that contains the cab\'s entire frequency response, resonances, and reflections. Once you have the IR, you can mathematically apply it to any signal:',
    },
    {
      kind: 'callout',
      flavor: 'info',
      title: 'Convolution in one line',
      text: 'output[n] = sum over k of input[k] × IR[n − k]. In words: every sample of input becomes a scaled, time-shifted copy of the entire IR, all summed together at the output. Linear, signal-preserving, fully captures the cab\'s tone.',
    },
    {
      kind: 'p',
      text: 'For a 100 ms IR at 44,100 samples/sec, that\'s about 4,400 multiplications PER OUTPUT SAMPLE — so 200 million multiplications per second. Web Audio handles this efficiently via FFT-based convolution.',
    },
    { kind: 'h2', text: 'Why IR cabs sound better than filter approximations' },
    {
      kind: 'p',
      text: 'My first cab implementation used three filters: a high-pass, a single resonant peak, and a low-pass. That captures the BROAD shape of a guitar cab\'s frequency response — and is enough to make a hi-gain amp listenable — but it misses the dozens of subtle resonances a real cone has, the box modes, and the slight pre-echo from the cabinet back wall.',
    },
    {
      kind: 'p',
      text: 'A real IR captures all of that for free, because it\'s a *recording* of a real cab. In MusicProf the IRs are *synthesized* (we don\'t have real recordings to ship), so they\'re still simplified — but they\'re much closer to a real cab than three filters can ever be.',
    },
    { kind: 'h2', text: 'Listening exercise' },
    {
      kind: 'p',
      text: 'The four cab models we ship — Greenback, V30, Tweed, Blue — have distinctly different IRs. Same amp, different cab = wildly different tone. Try these demos:',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Same amp, Greenback cab',
        description:
          'Marshall amp + Greenback cab. The classic 70s British rock sound. Listen to the warm upper mids around 850 Hz.',
        chain: [
          {
            defId: 'amp-marshall-crunch',
            bypass: false,
            paramValues: {
              gain: 5,
              bass: -1,
              mid: 3,
              treble: 4,
              presence: 3,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'cab-4x12',
            bypass: false,
            paramValues: { lowCut: 90, highCut: 7000, air: 0, mix: 1 },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    {
      kind: 'demo',
      demo: {
        label: 'Same amp, V30 cab',
        description:
          'Same Marshall. Now into a Vintage 30. Notice how the upper-mid resonance moves up to ~2.2 kHz — the tone becomes more "bitey", aggressive, modern. Better suited to hi-gain.',
        chain: [
          {
            defId: 'amp-marshall-crunch',
            bypass: false,
            paramValues: {
              gain: 5,
              bass: -1,
              mid: 3,
              treble: 4,
              presence: 3,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'cab-v30',
            bypass: false,
            paramValues: { lowCut: 100, highCut: 5800, air: 0, mix: 1 },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    {
      kind: 'demo',
      demo: {
        label: 'Same amp, Blue Alnico cab',
        description:
          'Now into a Vox-style Blue. Suddenly the same Marshall tone is bright, chimey, jangly — way too treble-heavy for hi-gain. This cab is built for clean amps. The mismatch teaches you that amp and cab are a pair, not independent choices.',
        chain: [
          {
            defId: 'amp-marshall-crunch',
            bypass: false,
            paramValues: {
              gain: 5,
              bass: -1,
              mid: 3,
              treble: 4,
              presence: 3,
              sag: 4,
              volume: 0,
            },
          },
          {
            defId: 'cab-blue',
            bypass: false,
            paramValues: { lowCut: 90, highCut: 8000, air: 0, mix: 1 },
          },
        ],
        play: { kind: 'chord', notes: ['E2', 'B2', 'E3', 'G3', 'B3', 'E4'] },
      },
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Picking a cab',
      text: 'Match the cab to the amp\'s natural role. Hi-gain modern amps → V30. Classic Marshall-flavor → Greenback. Vintage/blues American → Tweed. Bright jangly cleans (Vox, AC30) → Blue Alnico. The Headrush Prime offers 40+ IRs and lets you load your own — every speaker/mic/room combo has its own IR.',
    },
    { kind: 'h2', text: 'A note on real-world IRs' },
    {
      kind: 'p',
      text: 'Professional IR libraries (Two Notes Genome, ML Sound Lab, OwnHammer, etc.) ship recordings of real cabs with multiple mic types (SM57, MD421, R121 ribbon, etc.) at multiple positions (cap, edge, off-axis, room). Each combination is a different IR. A modern recording engineer rarely "mics a real cab" anymore — they record the amp\'s direct out, then load the IR after the fact, choosing among dozens of mic/cab combinations. This is why everyone\'s records sound polished now: you can iterate the cab choice without re-tracking the guitar.',
    },
  ],
};

const lessonTempoSync: Lesson = {
  id: 'tempo-sync',
  title: 'Tempo, BPM, and Synced Delays',
  subtitle:
    'Why a 380ms delay sometimes sounds magical and sometimes sounds wrong — and how to lock your delay to the music.',
  estMinutes: 5,
  body: [
    {
      kind: 'p',
      text: 'A delay set to an arbitrary millisecond value sounds OK on a single chord, but the moment you play a *song*, the delays either lock in with the rhythm or fight it. Locking the delay to the song\'s tempo turns delay from "an effect" into "a rhythmic instrument".',
    },
    { kind: 'h2', text: 'BPM — beats per minute' },
    {
      kind: 'p',
      text: 'Tempo is measured in beats per minute (BPM). Most rock songs sit around 100–140 BPM. Each beat = 60 / BPM seconds. So:',
    },
    {
      kind: 'list',
      items: [
        '**60 BPM**: one beat per second. Heart rate, slow ballad.',
        '**120 BPM**: half-second per beat. The most common pop/rock tempo.',
        '**140 BPM**: ~430 ms per beat. Punk, fast rock.',
        '**174 BPM**: ~345 ms per beat. Drum & bass standard tempo.',
      ],
    },
    { kind: 'h2', text: 'Subdivisions' },
    {
      kind: 'p',
      text: 'A beat can be subdivided into smaller rhythmic values:',
    },
    {
      kind: 'list',
      items: [
        '**Quarter note (1/4)** = 1 beat. One delay tap per beat. The default, the safest "I want delay in time".',
        '**Dotted eighth (dot 1/8)** = 0.75 beats. Three taps every two beats. This is the iconic U2 / Police / Edge sound — it creates polyrhythmic cross-talk against the song\'s downbeats.',
        '**Eighth note (1/8)** = 0.5 beats. Two taps per beat. Busier, more rhythmic.',
        '**Sixteenth note (1/16)** = 0.25 beats. Four taps per beat. Approaches "echo wash" territory.',
        '**Half note (1/2)** = 2 beats. Slow, atmospheric — pair with reverb for ambient washes.',
      ],
    },
    { kind: 'h2', text: 'How to use the tap tempo' },
    {
      kind: 'p',
      text: 'In the header, click **Tap** in time with the music — four taps is usually enough to lock in. The BPM display updates. Alternatively click the BPM number and type it in directly.',
    },
    {
      kind: 'p',
      text: 'Then click your delay block in the chain. Flip the **Sync** toggle to "Sync". Pick a **Subdivision** from the pill row. The Time knob is now ignored — delay time is computed from BPM × subdivision.',
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'The "Edge sound"',
      text: 'Brian Eno + The Edge\'s trick: set delay to dotted-eighth, feedback around 0.55–0.65, mix 40–50%. Now play strict eighth notes — the delay\'s dotted-eighth repeats land between your notes, weaving a constant 16th-note rhythm out of what your fingers are playing. Try it on "Where the Streets Have No Name".',
    },
    {
      kind: 'demo',
      demo: {
        label: 'Try: dotted-eighth delay at 120 BPM',
        description:
          'Loads a synced delay (dotted 1/8) plus a chimey Vox amp + Blue cab. Auto-plays a high E so you hear the dotted-eighth bounce. After loading, click the delay block, try switching subdivision between dotted 1/8 and 1/8 to feel the rhythmic difference.',
        chain: [
          {
            defId: 'amp-vox-chime',
            bypass: false,
            paramValues: {
              gain: 3.5,
              bass: 3,
              mid: 0,
              treble: 5,
              presence: 3,
              sag: 3,
              volume: 0,
            },
          },
          {
            defId: 'cab-blue',
            bypass: false,
            paramValues: { lowCut: 90, highCut: 8000, air: 2, mix: 1 },
          },
          {
            defId: 'delay-analog',
            bypass: false,
            paramValues: {
              time: 380,
              feedback: 0.55,
              tone: 5500,
              mix: 0.45,
              sync: 1,
              subdivision: 3, // dotted 1/8
              tempo: 120,
            },
          },
          {
            defId: 'reverb-hall',
            bypass: false,
            paramValues: { size: 0.55, dampening: 7000, preDelay: 25, mix: 0.25 },
          },
        ],
        play: { kind: 'note', note: 'E4', label: 'Pluck a high E' },
      },
    },
    { kind: 'h2', text: 'Why does this matter?' },
    {
      kind: 'p',
      text: 'Unsynced delays at the wrong tempo create rhythmic "mud" — repeats land between beats, fighting the rhythm. Sync the delay and the repeats either reinforce the song\'s pulse (quarter notes) or create deliberate counter-rhythm (dotted eighth). It\'s the same delay block in either case; the only difference is the math relating delay time to tempo.',
    },
  ],
};

const buildingBlocks: Chapter = {
  id: 'building-blocks',
  title: 'Effects & Tone-Building',
  description:
    'A closer look at the time-based and modulation effect families, plus a workflow for building tones.',
  lessons: [
    lessonTimeEffects,
    lessonModulation,
    lessonCabsAndIRs,
    lessonTempoSync,
    lessonABCompare,
    lessonBuildingTone,
  ],
};

// ----------------------------------------------------------------------------
// Chapter 3 — Going Live
// ----------------------------------------------------------------------------

const lessonLiveInput: Lesson = {
  id: 'live-input',
  title: 'Plug In Your Real Guitar',
  subtitle:
    'How to route your physical guitar through MusicProf via an audio interface.',
  estMinutes: 5,
  body: [
    {
      kind: 'p',
      text: 'Everything you\'ve built in the Lab so far has been running on a *synthesized* guitar source — a Karplus-Strong plucked-string model. It captures the shape of a plucked string but doesn\'t sound exactly like your guitar. You can run your **real** guitar through these same effects.',
    },
    { kind: 'h2', text: 'What you need' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'An **audio interface** — a small box that turns your guitar\'s 1/4" output into a signal your computer can understand. Examples: Focusrite Scarlett Solo, PreSonus AudioBox, Apogee Jam, even certain mixer-USB combos. Around $50–150 buys a good one.',
        'A **1/4" guitar cable** plugged from your guitar into the interface\'s "Instrument" or "Hi-Z" input. (This is important — the interface\'s "line" or "mic" input has the wrong impedance and will sound thin.)',
        '**Headphones**, plugged into the interface OR into your computer. **DO NOT use speakers** while live monitoring — your microphone (or a feedback loop through the interface) will create a howl.',
        'A modern **browser** that supports the Web Audio API and getUserMedia (Chrome, Firefox, Safari, Edge — all current versions work).',
      ],
    },
    { kind: 'h2', text: 'Walkthrough' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'In the Lab, find the **Input source** panel at the top of the chain editor.',
        'Click **Live guitar**. Your browser will ask for microphone permission — grant it. (Modern browsers consider audio interfaces "microphones" too.)',
        'After permission is granted, a dropdown appears with all available input devices. Pick your audio interface from the list.',
        'Watch the **DRY waveform** on the visualizer. Strum your guitar. If the waveform is flat, increase the Input gain slider until peaks hit roughly ±0.3 to ±0.5. If the waveform clips (peaks at ±1 and flatten), reduce the input gain on your *interface* (the physical knob) before reducing in software.',
        'Now play through the chain. The effects you tweak in the Lab apply to your real guitar in real time.',
      ],
    },
    { kind: 'h2', text: 'About latency' },
    {
      kind: 'p',
      text: 'There will be a small delay between when you pick a note and when you hear it back through the chain. Web Audio + decent interface = ~10–20 ms typically. That\'s noticeable but not unplayable. If it bothers you:',
    },
    {
      kind: 'list',
      items: [
        'Use your audio interface\'s **direct monitoring** feature (a knob/button on the interface that routes input to output without going through software). You\'ll hear yourself dry, instantly, but you also won\'t hear the effects on yourself in real time — only the recording.',
        'On a real performance rig you\'d use the **physical Headrush Prime**, which has sub-3 ms latency. This simulator is for learning, not gigging.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'warn',
      title: 'Feedback safety',
      text: 'If you connect a microphone (not an instrument input) and use speakers, you WILL get howling feedback. Use headphones. If you ever hear a sudden loud building tone, mute the master volume immediately.',
    },
    { kind: 'h2', text: 'Mapping to your physical Headrush Prime' },
    {
      kind: 'p',
      text: 'Once you\'ve found a tone you like in MusicProf, write down the block list and parameter values. Now sit at your physical Prime and recreate the same chain there. The block names map directly (we call ours "Marshall Crunch" — on the Prime it might be "Plexi 50" or "JCM800"; pick whichever model on the Prime sounds closest, then tweak its Gain/Bass/Mid/Treble to match what you set here). Once dialed in, save it as a rig on the Prime.',
    },
    {
      kind: 'p',
      text: 'This workflow — design tones cheaply on screen, then transfer to the hardware — is exactly how studio engineers and touring guitarists use modeling rigs.',
    },
  ],
};

const lessonTuning: Lesson = {
  id: 'tuning',
  title: 'Tuning',
  subtitle:
    'What pitch actually is, what cents mean, and how the autocorrelation tuner figures out what note you played.',
  estMinutes: 5,
  body: [
    {
      kind: 'p',
      text: 'A guitar that\'s out of tune is *unlistenable*, regardless of how great your tone is. Every guitarist eventually gets a tuner. But what is "in tune" really, and how does a digital tuner figure out what you played?',
    },
    { kind: 'h2', text: 'Pitch is just frequency' },
    {
      kind: 'p',
      text: 'A note is a sound wave that repeats at a steady frequency. "A above middle C" is 440 Hz — 440 cycles per second. Every octave doubles: A3 is 220 Hz, A4 is 440 Hz, A5 is 880 Hz. The 12-note Western chromatic scale divides each octave into 12 equally-spaced "semitones".',
    },
    {
      kind: 'p',
      text: 'But "equally spaced" in *what* sense? Not equal Hz differences — that would make the upper octaves crammed and the lower ones spread out. It\'s equal LOGARITHMIC spacing: each semitone is a multiplicative factor of 2^(1/12) ≈ 1.0595. From A=440, the next semitone up (A♯) is 440 × 1.0595 ≈ 466.16 Hz. Up another semitone (B) is 466.16 × 1.0595 ≈ 493.88 Hz. And so on for 12 steps until you reach 880 (one octave up).',
    },
    {
      kind: 'callout',
      flavor: 'info',
      title: 'Standard guitar tuning frequencies',
      text: 'E2 = 82.41 Hz · A2 = 110.00 Hz · D3 = 146.83 Hz · G3 = 196.00 Hz · B3 = 246.94 Hz · E4 = 329.63 Hz. These are the six open strings, low to high. Memorizing them isn\'t important; the spirit of "doubling = octave, ratio = semitone" is.',
    },
    { kind: 'h2', text: 'Cents — the fine resolution' },
    {
      kind: 'p',
      text: 'A semitone is divided into 100 **cents** for precise tuning. So +50 cents is exactly halfway between two semitones. Human ears can typically hear pitch differences of ~5 cents on adjacent notes. Below that, your guitar will sound "good" even though it\'s not perfectly mathematically in tune.',
    },
    {
      kind: 'list',
      items: [
        '**0 cents** = perfectly in tune.',
        '**±5 cents** = imperceptible to most listeners; in tune by any practical measure.',
        '**±15 cents** = noticeable, sounds "off". Most pros tune this tightly.',
        '**±50 cents** = halfway to the next note. Definitely wrong.',
      ],
    },
    { kind: 'h2', text: 'How does the tuner work?' },
    {
      kind: 'p',
      text: 'Our tuner uses an algorithm called **autocorrelation**. Given a short audio buffer (about 25 ms of signal), the tuner asks: "what is the smallest time-shift τ where the buffer matches itself?" That shift τ is the **fundamental period** of the signal; pitch = 1 / τ.',
    },
    {
      kind: 'p',
      text: 'Concretely, it computes c[i] = Σ buf[j] × buf[j+i] for each candidate lag i, then finds the i that maximizes c. Periodic signals (like a steady guitar note) have a sharp peak at i = one period. Then we convert period to Hz, find the nearest semitone, and compute how many cents off you are.',
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Why autocorrelation over FFT?',
      text: 'You might think you could just find the peak of the FFT. The catch: on a guitar note, the loudest peak is often the 2nd or 3rd harmonic, not the fundamental — especially through distortion. Autocorrelation operates in the time domain and locks onto the fundamental period directly, which is much more robust.',
    },
    { kind: 'h2', text: 'Using the tuner' },
    {
      kind: 'p',
      text: 'In the Lab, click **Show tuner** above the chain. Play a single string. The tuner shows the closest note + how many cents off you are. The needle is green when you\'re within ±5 cents. If you\'re flat, tighten the string; if sharp, loosen it.',
    },
    {
      kind: 'p',
      text: 'The tuner reads the DRY signal (before any effects) — this matters because heavy distortion can confuse pitch detection. It also throttles to 10 readings per second to save CPU.',
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Tuning order',
      text: 'Best practice: tune from low E up. After tuning, sanity-check with a fretted note (e.g., 5th fret of the low E should match open A). Bending strings, vibrato, and aggressive picking all stretch the string and pull pitch sharp — tune AFTER your guitar has settled into playing temperature for a minute.',
    },
  ],
};

const lessonLooperPractice: Lesson = {
  id: 'looper-practice',
  title: 'Practicing With a Looper',
  subtitle:
    'The single biggest skill multiplier for solo guitar practice. Record a backing, solo over it, repeat.',
  estMinutes: 5,
  body: [
    {
      kind: 'p',
      text: 'A **looper** captures a slice of what you just played and plays it back continuously. The world\'s simplest practice tool — and arguably the most effective. Click **Show looper** in the Lab to enable it.',
    },
    { kind: 'h2', text: 'The basic workflow' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'Set a tone you want to practice over (any preset works).',
        'Click **● Record**. Play 4 or 8 bars of a chord progression — Em → C → G → D works for everything.',
        'Click **Stop & Play** at the start of the next bar. The loop locks in and starts playing back instantly.',
        'Now play a solo over your own backing. The loop repeats indefinitely; you can practice phrases as many times as you want.',
        'Click **Clear** to erase the loop and start over.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Latency tip',
      text: 'Hit Stop & Play a tiny bit BEFORE you mean to — there\'s usually 50–100 ms of latency between click and the actual stop point. With a couple of practice loops you\'ll calibrate.',
    },
    { kind: 'h2', text: 'What makes it so useful' },
    {
      kind: 'list',
      items: [
        '**Real harmonic context** — solo over CHORDS, not over silence. You can hear if your notes are clashing or in-key.',
        '**Infinite repetition** — practice one lick 50 times without losing your place in the form.',
        '**Tone A/B in context** — change effects or amps while the loop plays. Hear instantly how the same notes sound through different rigs.',
        '**Composition** — record a part, write a counter-part over it. Layer up complete arrangements.',
      ],
    },
    { kind: 'h2', text: 'How this looper works under the hood' },
    {
      kind: 'p',
      text: 'It taps the **post-chain wet signal** — the fully-processed tone you hear. Samples are captured into a 60-second mono Float32Array buffer. On Stop & Play, playback reads from position 0 and wraps around when it hits the end. The loop is the EXACT audio you played, with all your effects baked in — not the dry guitar.',
    },
    {
      kind: 'p',
      text: 'A consequence: the loop preserves the tone you recorded it with. Change effects after recording, and the LOOP still sounds like the original tone, while your live playing through the same chain has the new tone. That\'s actually useful — it lets you A/B "rhythm vs lead tone" against the same backing.',
    },
    {
      kind: 'callout',
      flavor: 'info',
      title: 'On your Headrush Prime',
      text: 'The Prime has a much more capable looper — overdub layers, undo/redo, half-speed, reverse. This is a simplified one-layer version for browser practice. Same core skill though: the discipline of looping a few bars and improvising over them is what builds real musical fluency.',
    },
  ],
};

const lessonRhythmAndClick: Lesson = {
  id: 'rhythm-and-click',
  title: 'Rhythm, Timing, and the Click',
  subtitle:
    'Why every working musician practices to a metronome — and the easy mistake that makes "playing in time" feel impossible.',
  estMinutes: 4,
  body: [
    {
      kind: 'p',
      text: 'You can have great tone, killer technique, and zero stage presence — and if your timing is off, none of it matters. Solid timing is the difference between a "guitarist" and a "musician you want to play with".',
    },
    { kind: 'h2', text: 'What "in time" actually means' },
    {
      kind: 'p',
      text: 'When you play with a band or a recording, every note happens at a precise mathematical position relative to the song\'s pulse. Drum hits land on beats. Chord changes line up with bar boundaries. The collective brain of the band has to agree on where the pulse is — and where the *next* pulse will be.',
    },
    {
      kind: 'p',
      text: 'Practicing alone, you don\'t have a drummer. You have to BE the drummer. That\'s what a metronome (or "click track") does — it gives you a steady, unwavering pulse to align your playing against.',
    },
    { kind: 'h2', text: 'Using the click' },
    {
      kind: 'list',
      ordered: true,
      items: [
        'In the header, click **Tap** four times in a steady tempo (or just type the BPM).',
        'Click **Click** to enable the metronome. You\'ll hear a high tick on beat 1 and lower ticks on beats 2, 3, 4.',
        'Pick a 4/4 vs 3/4 time signature from the dropdown. Most songs are 4/4. Waltzes are 3/4. Some prog/odd-meter songs use 5/4, 7/4, etc.',
        'Now play. Try to land your pick attacks exactly on the click — not before, not after.',
      ],
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'The big mistake',
      text: 'Beginners try to PLAY ALONG with the click — pick attack arrives at the same time as the click sound. But you actually want to play *slightly into the click*: pick attack timed so that the click sound happens at the same moment you HEAR your note. Sound takes time to travel from amp to ear; your pick action has to lead by ~5–10 ms. Once you internalize this, the click feels "with" you instead of fighting you.',
    },
    { kind: 'h2', text: 'Subdivisions' },
    {
      kind: 'p',
      text: 'A click on every quarter note is just the START of timing practice. The harder skill is feeling subdivisions BETWEEN clicks — eighth notes (twice as fast), sixteenth notes (four times as fast), triplets (three notes per beat). Try this: count "1 e + a, 2 e + a, 3 e + a, 4 e + a" out loud while the click ticks. Each syllable is a sixteenth note.',
    },
    {
      kind: 'p',
      text: 'Once you can verbalize subdivisions, you can play them. Strum a single chord on every quarter, every eighth, every sixteenth. Notice that as you go faster, your ATTACK accuracy has to be tighter — at sixteenths against a 120 BPM click, each attack window is ~125 ms wide. Land outside that window and the rhythm collapses.',
    },
    { kind: 'h2', text: 'Combine with the looper' },
    {
      kind: 'p',
      text: 'Real practice workflow: turn on the metronome, then record a chord progression INTO the looper at the matching tempo. The loop captures whatever you played, including any timing errors. Listen back. Was it locked to the click? If not, clear and re-record. The loop will mercilessly expose timing inconsistencies that your ears miss in the moment.',
    },
    {
      kind: 'callout',
      flavor: 'tip',
      title: 'Slow down, build up',
      text: 'Pick a tempo where you can play a passage perfectly cleanly with the click. That\'s your starting tempo. Increase by 5 BPM only when the slower tempo is 100% reliable. Most "fast players" got fast by being patient — they spent a lot of time at 60 BPM building a foundation that holds up at 200.',
    },
  ],
};

const goingLive: Chapter = {
  id: 'going-live',
  title: 'Going Live',
  description:
    'How to plug your real guitar in and translate everything you\'ve learned to your physical Headrush.',
  lessons: [
    lessonLiveInput,
    lessonTuning,
    lessonRhythmAndClick,
    lessonLooperPractice,
  ],
};

export const CURRICULUM: Chapter[] = [foundations, buildingBlocks, goingLive];

export function findLesson(id: string): Lesson | null {
  for (const ch of CURRICULUM) {
    const l = ch.lessons.find((l) => l.id === id);
    if (l) return l;
  }
  return null;
}

export function lessonNeighbors(
  id: string
): { prev: Lesson | null; next: Lesson | null } {
  const flat: Lesson[] = CURRICULUM.flatMap((c) => c.lessons);
  const idx = flat.findIndex((l) => l.id === id);
  if (idx < 0) return { prev: null, next: null };
  return {
    prev: idx > 0 ? flat[idx - 1] : null,
    next: idx < flat.length - 1 ? flat[idx + 1] : null,
  };
}
