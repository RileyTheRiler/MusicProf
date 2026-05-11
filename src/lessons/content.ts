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
    lessonSignalChain,
    lessonOrderMatters,
    lessonGainStaging,
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

const buildingBlocks: Chapter = {
  id: 'building-blocks',
  title: 'Effects & Tone-Building',
  description:
    'A closer look at the time-based and modulation effect families, plus a workflow for building tones.',
  lessons: [
    lessonTimeEffects,
    lessonModulation,
    lessonCabsAndIRs,
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

const goingLive: Chapter = {
  id: 'going-live',
  title: 'Going Live',
  description:
    'How to plug your real guitar in and translate everything you\'ve learned to your physical Headrush.',
  lessons: [lessonLiveInput],
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
