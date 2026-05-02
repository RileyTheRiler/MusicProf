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

## What's in here

- **Audio engine** built on Tone.js + the Web Audio API. Source is an 8-voice
  Karplus-Strong plucked-string synth.
- **Working effect blocks (real DSP):**
  - Studio Compressor
  - Overdrive (Tube-Screamer style)
  - **Amp models:** Fender Clean (Twin), Marshall Crunch (Plexi/JCM),
    Mesa Hi-Gain (Mark/Recto), Vox Chime (AC30) — each with its own
    multi-stage waveshaper curves and tone-stack voicing
  - 3-Band EQ
  - Cabinet (4×12 filter approximation)
  - Chorus
  - Analog Delay (with feedback filter)
  - Hall Reverb
- **Tone presets:** one-click load complete chains modeling real-world tones
  — Pristine Clean, Blues Crunch, Classic Rock Lead, Modern Metal,
  Ambient Lead, Funk Clean.
- **Catalog-only blocks (lessons present, audio coming soon):** Noise Gate,
  Wah, Pitch Shifter, Flanger, Phaser, Tremolo.
- **Chain editor:** add, remove, reorder, and bypass blocks.
- **Visualizer:** dry vs. wet waveform + log-frequency spectrum, side-by-side.
- **Lesson panel:** TL;DR + what-it-does + physics + signal impact + Headrush
  Prime mapping + per-knob tips, all updating with the currently-selected block.

## Project layout

```
src/
  audio/
    engine.ts          # singleton audio graph + chain manager
    voice.ts           # GuitarVoice (PluckSynth pool)
    effects/
      index.ts         # registry + categories
      amp.ts           # shared amp factory + 4 amp models
      compressor.ts
      distortion.ts
      eq.ts
      cab.ts
      chorus.ts
      delay.ts
      reverb.ts
  components/          # React UI (Knob, EffectBlock, SignalChain, ...)
  data/
    chords.ts          # open-position chord library
    presets.ts         # complete-chain tone presets
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

## Roadmap

- Convolution-based cabinet IRs (real Greenback / V30 recordings)
- Wah pedal with mouse-controlled "rocker"
- Noise gate, Flanger, Phaser, Tremolo, Pitch Shifter audio
- Live guitar input via Web Audio (plug an audio interface into the browser)
- Lessons mode: structured curriculum (Signal Chain 101 → physics of pickups → ...)
- Tap-tempo + tempo-synced delay
- User-saved presets (localStorage)
