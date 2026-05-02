import { useEffect, useState } from 'react';
import { engine } from './audio/engine';
import { effectDefinitions } from './audio/effects';
import { ChordPicker } from './components/ChordPicker';
import { EffectPalette } from './components/EffectPalette';
import { LessonPanel } from './components/LessonPanel';
import { PresetBar } from './components/PresetBar';
import { SignalChain } from './components/SignalChain';
import { Visualizer } from './components/Visualizer';
import type { Preset } from './data/presets';
import type { ChainBlock, EffectDefinition } from './types';

let blockSeq = 0;
const newBlockId = () => `b${++blockSeq}`;

const defaultChain = (): ChainBlock[] => {
  // Comp -> Drive -> Amp -> EQ -> Cab -> Mod -> Delay -> Reverb (Headrush-typical order).
  // Most blocks start bypassed; the Amp + Cab + a touch of reverb are on so
  // the default tone sounds like a real guitar rig (not just a raw synth).
  const make = (
    defId: string,
    bypass = true,
    overrides: Record<string, number> = {}
  ): ChainBlock => {
    const def = effectDefinitions[defId];
    const paramValues: Record<string, number> = {};
    for (const p of def.params) paramValues[p.id] = p.default;
    Object.assign(paramValues, overrides);
    return { id: newBlockId(), defId, bypass, paramValues };
  };
  return [
    make('comp-studio'),
    make('overdrive'),
    make('amp-marshall-crunch', false, {
      gain: 3,
      bass: 0,
      mid: 2,
      treble: 3,
      presence: 1,
    }),
    make('eq-3band'),
    make('cab-4x12', false),
    make('mod-chorus'),
    make('delay-analog'),
    make('reverb-hall', false, { mix: 0.18, size: 0.45 }),
  ];
};

const blockFromPreset = (
  defId: string,
  bypass: boolean,
  paramValues: Record<string, number>
): ChainBlock => {
  const def = effectDefinitions[defId];
  // Fill in any missing params with defaults so the chain is always well-formed
  // even if a preset was authored before a new param was added.
  const merged: Record<string, number> = {};
  if (def) {
    for (const p of def.params) merged[p.id] = p.default;
  }
  Object.assign(merged, paramValues);
  return { id: newBlockId(), defId, bypass, paramValues: merged };
};

export default function App() {
  const [started, setStarted] = useState(false);
  const [chain, setChain] = useState<ChainBlock[]>(defaultChain);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [masterDb, setMasterDb] = useState(-6);

  useEffect(() => {
    engine.setChain(chain);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStart = async () => {
    await engine.start();
    engine.setChain(chain);
    engine.setMasterVolume(masterDb);
    setStarted(true);
  };

  const updateChain = (next: ChainBlock[]) => {
    setChain(next);
    engine.setChain(next);
  };

  const handleAdd = (def: EffectDefinition) => {
    const paramValues: Record<string, number> = {};
    for (const p of def.params) paramValues[p.id] = p.default;
    const block: ChainBlock = {
      id: newBlockId(),
      defId: def.id,
      bypass: false,
      paramValues,
    };
    const next = [...chain, block];
    updateChain(next);
    setSelectedId(block.id);
  };

  const handleBypass = (id: string, bypass: boolean) => {
    const next = chain.map((b) => (b.id === id ? { ...b, bypass } : b));
    updateChain(next);
    engine.setBypass(id, bypass);
  };

  const handleParam = (id: string, paramId: string, value: number) => {
    const next = chain.map((b) =>
      b.id === id
        ? { ...b, paramValues: { ...b.paramValues, [paramId]: value } }
        : b
    );
    setChain(next);
    engine.setParam(id, paramId, value);
  };

  const handleRemove = (id: string) => {
    const next = chain.filter((b) => b.id !== id);
    updateChain(next);
    if (selectedId === id) setSelectedId(null);
  };

  const handleMasterVol = (db: number) => {
    setMasterDb(db);
    engine.setMasterVolume(db);
  };

  const handleLoadPreset = (preset: Preset) => {
    const next = preset.blocks.map((b) =>
      blockFromPreset(b.defId, b.bypass, b.paramValues)
    );
    updateChain(next);
    setSelectedId(null);
  };

  const selectedBlock = chain.find((b) => b.id === selectedId) ?? null;
  const selectedDef = selectedBlock
    ? effectDefinitions[selectedBlock.defId] ?? null
    : null;

  return (
    <div className="min-h-screen bg-bg-950 text-zinc-200">
      <header className="border-b border-bg-700 bg-bg-900 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-medium tracking-tight">
              MusicProf{' '}
              <span className="text-zinc-500 text-sm font-normal">
                · Guitar Signal Chain Lab
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500">
              Modeled after the Headrush Prime · v0
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-zinc-400">
              Master
              <input
                type="range"
                min={-40}
                max={6}
                step={0.5}
                value={masterDb}
                onChange={(e) => handleMasterVol(parseFloat(e.target.value))}
                className="w-32"
              />
              <span className="font-mono text-zinc-300 w-14 text-right">
                {masterDb.toFixed(1)} dB
              </span>
            </label>
            {!started ? (
              <button
                onClick={handleStart}
                className="px-4 py-1.5 rounded bg-accent-amber text-bg-950 font-medium text-sm hover:brightness-110"
              >
                Power on
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded bg-green-600/20 border border-green-600 text-green-300 text-xs uppercase tracking-wider">
                Live
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-8 space-y-4">
          <PresetBar onLoad={handleLoadPreset} />

          <SignalChain
            chain={chain}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onBypass={handleBypass}
            onParam={handleParam}
            onRemove={handleRemove}
            onReorder={updateChain}
          />

          <Visualizer running={started} />

          <div className="bg-bg-900 border border-bg-700 rounded p-4">
            <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
              Play something
            </h2>
            <ChordPicker
              onPlayNote={(n) => engine.playNote(n)}
              onPlayChord={(notes) => engine.playChord(notes)}
              disabled={!started}
            />
            {!started && (
              <p className="mt-3 text-xs text-zinc-500">
                Click <strong>Power on</strong> in the top right to enable
                audio.
              </p>
            )}
          </div>

          <EffectPalette onAdd={handleAdd} />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <div className="lg:sticky lg:top-20">
            <LessonPanel block={selectedBlock} def={selectedDef} />
          </div>
        </div>
      </main>

      <footer className="max-w-[1600px] mx-auto p-4 text-[11px] text-zinc-600 leading-relaxed">
        <p>
          MusicProf is a teaching simulator. The plucked-string source uses
          Karplus-Strong synthesis — it sounds "like" a guitar but won't fool
          anyone. Real DSP runs on the effect blocks: drag a knob and you're
          hearing actual digital signal processing happen in your browser, the
          same way your Headrush Prime processes your real guitar.
        </p>
      </footer>
    </div>
  );
}
