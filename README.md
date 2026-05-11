# MusicProf

An interactive, browser-based **guitar signal-chain classroom** — modeled after
the Headrush Prime — where you can play synthesized guitar notes and chords
through a configurable chain of effects, see what each effect does to the
waveform and frequency spectrum in real time, and read a focused lesson on
each block while you tweak its knobs.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
```

Then click **Power on** in the top right to start the audio engine (browsers
require a user gesture before any audio plays).

## Two modes

Switch between them with the tabs in the header.

### Lab — interactive signal chain editor

- **Audio engine** built on Tone.js + the Web Audio API.
- **Source:** synthesized 8-voice Karplus-Strong plucked-string by default,
  or your **real guitar via an audio interface** — switch in the "Input source"
  panel. Plug in a 1/4" cable, grant mic permission, pick your device, set the
  input gain, and play through the same chain.
- **Working effect blocks (real DSP) — full catalog implemented:**
  - Noise Gate, Studio Compressor
  - Wah (manual + auto-sweep)
  - Pitch Shifter / Octaver
  - Overdrive (Tube-Screamer style)
  - **Amp models:** Fender Clean (Twin), Marshall Crunch (Plexi/JCM),
    Mesa Hi-Gain (Mark/Recto), Vox Chime (AC30) — each with its own
    multi-stage waveshaper curves and tone-stack voicing
  - 3-Band EQ
  - Cabinet (4×12 filter approximation)
  - Chorus, Flanger, Phaser, Tremolo
  - Analog Delay (with feedback filter)
  - Hall Reverb
- **Tone presets:** one-click load complete chains modeling real-world tones
  — Pristine Clean, Blues Crunch, Classic Rock Lead, Modern Metal,
  Ambient Lead, Funk Clean.
- **Chain editor:** add, remove, reorder, and bypass blocks.
- **Visualizer:** dry vs. wet waveform + log-frequency spectrum, side-by-side.
- **Lesson panel:** TL;DR + what-it-does + physics + signal impact + Headrush
  Prime mapping + per-knob tips, all updating with the currently-selected block.

### Classroom — structured curriculum

Read-through lessons that build understanding progressively. Each lesson has
"Try this" demos that load a specific chain configuration into the Lab and
auto-play a relevant chord or note. Current chapters:

- **Foundations** (5 lessons): How Sound Works · The Electric Guitar Signal ·
  What's a Signal Chain · Why Order Matters · Gain Staging
- **Effects & Tone-Building** (3 lessons): Time-Based Effects · The
  Modulation Family · Building a Tone From Scratch
- **Going Live** (1 lesson): Plug In Your Real Guitar — full audio-interface
  walkthrough and the workflow for transferring a tone you designed here to
  your physical Headrush.

## Project layout

```
src/
  audio/
    engine.ts          # singleton audio graph + chain manager
    voice.ts           # GuitarVoice (PluckSynth pool)
    effects/
      index.ts         # registry + categories
      amp.ts           # shared amp factory + 4 amp models
      cab.ts
      chorus.ts
      compressor.ts
      delay.ts
      distortion.ts
      eq.ts
      gate.ts
      phaser.ts
      reverb.ts
      tremolo.ts
      wah.ts
  components/          # React UI (Knob, EffectBlock, SignalChain, Classroom, ...)
  data/
    chords.ts          # open-position chord library
    presets.ts         # complete-chain tone presets
  lessons/
    types.ts           # Lesson / Chapter / LessonBlock types
    content.ts         # full curriculum (chapters + lessons + demos)
  hooks/               # useAnimationFrame
  types/               # shared TS types
```

## Adding a new effect

1. Create `src/audio/effects/myEffect.ts` exporting an `EffectDefinition`.
   Use the existing files as a reference — every effect needs `params`,
   a `lesson`, and a `create()` factory that returns
   `{ input, output, setParam, setBypass, dispose }`.
2. Register it in `src/audio/effects/index.ts`.
3. It shows up in the palette automatically.

## Adding a new lesson

1. Open `src/lessons/content.ts`. Define a new `Lesson` object using the
   existing ones as a template. Body is an array of `LessonBlock` items —
   `h2`, `p`, `list`, `callout`, `demo`.
2. Append it to a chapter's `lessons` array, or define a new chapter.
3. `demo` blocks can include a `chain` (array of `PresetBlock`) plus an
   optional `play` action; clicking "Try this" switches to the Lab,
   loads the chain, and auto-plays.

## Roadmap

- Convolution-based cabinet IRs (real Greenback / V30 recordings)
- More lessons: pickups deep dive, recording / mixing context, music theory
  basics for the guitarist
- Tap-tempo + tempo-synced delay
- User-saved presets (localStorage)
- Tuner block
- MIDI in for foot-switch / expression-pedal control
