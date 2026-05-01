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

## What's in v0

- **Audio engine** built on Tone.js + the Web Audio API. Source is a 8-voice
  Karplus-Strong plucked-string synth.
- **Working effect blocks (real DSP):**
  - Studio Compressor
  - Overdrive (Tube-Screamer style)
  - 3-Band EQ
  - Cabinet (4×12 filter approximation)
  - Chorus
  - Analog Delay (with feedback filter)
  - Hall Reverb
- **Catalog-only blocks (lessons present, audio coming soon):** Noise Gate,
  Wah, Pitch Shifter, Amp Models, Flanger, Phaser, Tremolo.
- **Chain editor:** drag blocks left/right, bypass them, remove them, add new ones.
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
      compressor.ts
      distortion.ts
      eq.ts
      cab.ts
      chorus.ts
      delay.ts
      reverb.ts
  components/          # React UI (Knob, EffectBlock, SignalChain, ...)
  data/chords.ts       # open-position chord library
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

- Real amp models (multi-stage tube saturation)
- Convolution-based cabinet IRs
- Wah pedal with mouse-controlled "rocker"
- Live guitar input via Web Audio (plug an audio interface into the browser)
- Lessons mode: structured curriculum (Signal Chain 101 → physics of pickups → ...)
- Tap-tempo + tempo-synced delay
- Save/load presets
