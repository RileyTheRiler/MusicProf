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
- **Pickup model:** 8 pickup voicings (Strat bridge/middle/neck, Tele
  bridge/neck, P90, Humbucker bridge/neck, Flat) applied at the very front
  of the chain. A/B "what would my Tele sound like as a Les Paul" through
  any chain.
- **Working effect blocks (real DSP) — full catalog implemented:**
  - Noise Gate, Studio Compressor
  - Wah (manual + auto-sweep)
  - Pitch Shifter / Octaver
  - Overdrive (Tube-Screamer style)
  - **Amp models:** Fender Clean (Twin), Marshall Crunch (Plexi/JCM),
    Mesa Hi-Gain (Mark/Recto), Vox Chime (AC30) — each with its own
    multi-stage waveshaper curves and tone-stack voicing
  - 3-Band EQ
  - **Cabinet (convolution-based):** 4 cab models — Greenback 4×12, Vintage 30
    4×12, Tweed 1×12, Blue Alnico 2×12 — each running Tone.Convolver over a
    synthesized impulse response that captures the speaker's resonant modes
  - Chorus, Flanger, Phaser, Tremolo
  - Analog Delay (with feedback filter)
  - Hall Reverb
- **Tone presets:** built-in (Pristine Clean, Blues Crunch, Classic Rock Lead,
  Modern Metal, Ambient Lead, Funk Clean) PLUS save your own — current chain
  saves to localStorage, survives reloads, click to recall.
- **Chain editor:** add, remove, reorder, and bypass blocks.
- **Visualizer:** dry vs. wet waveform + log-frequency spectrum for the whole
  chain, side-by-side. When a block is selected, a **second panel** appears
  showing the signal AT THE INPUT and AT THE OUTPUT of that block —
  literally watch each block do its work in real time.
- **Tuner:** toggle on a chromatic tuner with autocorrelation-based pitch
  detection. Note + cents needle, recognizes open-string notes in standard
  tuning, throttled to 10 Hz for low CPU.
- **Looper:** toggle on a 60-second loop recorder. Captures the post-chain
  wet signal, plays it back continuously, lets you solo over your own
  rhythm tracks. Mono Float32 buffer, sample-accurate playback.
- **Fretboard:** toggle on an interactive scale visualizer. Pick a root + a
  scale (major, minor, pentatonic, blues, dorian, mixolydian) and watch
  every fret position light up. Click any note to play it through the
  signal chain.
- **Tap Tempo + synced delays:** tap the **Tap** button in the header in time
  with the music to set the global BPM. Click the delay block, flip **Sync**
  to on, and pick a **Subdivision** (1/2, dot 1/4, 1/4, dot 1/8, 1/8, 1/16) —
  the delay time locks to the tempo math.
- **Metronome:** **Click** button in the header toggles an audible click
  track at the global BPM. Time-signature selector (3/4 through 7/4),
  visible beat-indicator dots, accent on beat 1.
- **A/B slots:** two independent chains (A and B) that you can flip between
  instantly with the tabs or `A`/`B` keyboard shortcuts. Copy A→B, tweak,
  toggle to compare. The only reliable way to evaluate tone changes.
- **Export / Import:** the **Export / Import…** action on the Preset bar
  opens a modal with three views: a human-readable **Recipe** to print or
  open on your phone while sitting at the physical Headrush, raw **JSON**
  for sharing, and an **Import** tab that accepts pasted JSON or a `.json`
  file to restore any exported tone.
- **Persistent settings:** BPM, master volume, input gain, pickup model,
  show-tuner state, and active tab survive page reloads (localStorage).
- **Lesson panel:** TL;DR + what-it-does + physics + signal impact + Headrush
  Prime mapping + per-knob tips, all updating with the currently-selected block.

### Classroom — structured curriculum

Read-through lessons that build understanding progressively. Each lesson has
"Try this" demos that load a specific chain configuration into the Lab and
auto-play a relevant chord or note. Current chapters:

- **Foundations** (7 lessons): How Sound Works · The Electric Guitar Signal ·
  Pickups Deep Dive · What's a Signal Chain · Why Order Matters · Gain Staging ·
  Reading the Signal at Each Stage
- **Effects & Tone-Building** (6 lessons): Time-Based Effects · The
  Modulation Family · Cabs and Impulse Responses · Tempo, BPM, and Synced
  Delays · A/B Compare · Building a Tone From Scratch
- **Going Live** (4 lessons): Plug In Your Real Guitar · Tuning ·
  Rhythm, Timing, and the Click · Practicing With a Looper
- **Music Theory for Guitarists** (2 lessons): Reading the Fretboard ·
  Chord Construction

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

- Convolution-based cabinet IRs using **real** recordings (currently
  synthesized; ship a couple of CC-0 IRs for ultimate authenticity)
- More lessons: recording / mixing context, music theory basics
- MIDI in for foot-switch / expression-pedal control
- Import/export user presets (JSON, share with friends)
