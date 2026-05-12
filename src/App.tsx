import { useEffect, useState } from 'react';
import { engine } from './audio/engine';
import type { SourceKind } from './audio/engine';
import { effectDefinitions } from './audio/effects';
import type { PickupId } from './audio/pickups';
import { ChordPicker } from './components/ChordPicker';
import { Classroom } from './components/Classroom';
import { EffectPalette } from './components/EffectPalette';
import { ExportModal } from './components/ExportModal';
import { LessonPanel } from './components/LessonPanel';
import { Looper } from './components/Looper';
import { MetronomeWidget } from './components/MetronomeWidget';
import { PresetBar } from './components/PresetBar';
import { SignalChain } from './components/SignalChain';
import { SlotSwitcher } from './components/SlotSwitcher';
import { SourceSelector } from './components/SourceSelector';
import { TapTempo } from './components/TapTempo';
import { Tuner } from './components/Tuner';
import { Visualizer } from './components/Visualizer';
import type { Preset, PresetBlock } from './data/presets';
import { loadSettings, saveSettings, type PersistedSettings } from './data/settings';
import type { LessonDemo } from './lessons/types';
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

/** Deep-clone a chain with fresh block IDs — used by "Copy A → B" etc. */
const cloneChain = (chain: ChainBlock[]): ChainBlock[] =>
  chain.map((b) => ({
    id: newBlockId(),
    defId: b.defId,
    bypass: b.bypass,
    paramValues: { ...b.paramValues },
  }));

type Tab = 'lab' | 'classroom';
type Slot = 'A' | 'B';

// Load persisted settings once at module init so they're synchronous on mount.
const INITIAL_SETTINGS: PersistedSettings = loadSettings();

export default function App() {
  const [tab, setTab] = useState<Tab>(INITIAL_SETTINGS.tab);
  const [started, setStarted] = useState(false);

  // A/B slots — two independent chains. Active slot's chain is what feeds the
  // engine; switching slots rebuilds the engine's audio graph.
  const [chainA, setChainA] = useState<ChainBlock[]>(defaultChain);
  const [chainB, setChainB] = useState<ChainBlock[]>(() => cloneChain(defaultChain()));
  const [activeSlot, setActiveSlot] = useState<Slot>('A');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [masterDb, setMasterDb] = useState(INITIAL_SETTINGS.masterDb);
  const [source, setSource] = useState<SourceKind>('synth');
  const [inputDb, setInputDb] = useState(INITIAL_SETTINGS.inputDb);
  const [pickupId, setPickupId] = useState<PickupId>(INITIAL_SETTINGS.pickupId);
  const [showTuner, setShowTuner] = useState(INITIAL_SETTINGS.showTuner);
  const [showLooper, setShowLooper] = useState(INITIAL_SETTINGS.showLooper);
  const [bpm, setBpm] = useState(INITIAL_SETTINGS.bpm);
  const [exportOpen, setExportOpen] = useState(false);

  const chain = activeSlot === 'A' ? chainA : chainB;
  const setChainForSlot = (slot: Slot, next: ChainBlock[]) => {
    if (slot === 'A') setChainA(next);
    else setChainB(next);
  };

  useEffect(() => {
    engine.setChain(chain);
    // Push loaded settings into the engine — most apply before audio is
    // started (pickup/tempo are stored in engine state and used when start()
    // creates the audio nodes).
    engine.setPickupModel(INITIAL_SETTINGS.pickupId);
    engine.setTempo(INITIAL_SETTINGS.bpm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist user settings whenever they change. localStorage is synchronous
  // but the write is cheap; running on every change is fine.
  useEffect(() => {
    saveSettings({
      bpm,
      masterDb,
      inputDb,
      pickupId,
      showTuner,
      showLooper,
      tab,
    });
  }, [bpm, masterDb, inputDb, pickupId, showTuner, showLooper, tab]);

  const handleStart = async () => {
    await engine.start();
    engine.setChain(chain);
    engine.setMasterVolume(masterDb);
    // Push input gain that may have been adjusted before start (slider works
    // even when audio isn't running).
    engine.setInputGainDb(inputDb);
    setStarted(true);
  };

  const updateChain = (next: ChainBlock[]) => {
    setChainForSlot(activeSlot, next);
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
    setChainForSlot(activeSlot, next);
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

  const handleInputDb = (db: number) => {
    setInputDb(db);
    engine.setInputGainDb(db);
  };

  const handleSourceChange = () => {
    setSource(engine.getSource());
    setPickupId(engine.getPickupId());
  };

  const handlePickupChange = (id: PickupId) => {
    setPickupId(id);
    engine.setPickupModel(id);
  };

  const handleBpmChange = (next: number) => {
    setBpm(next);
    engine.setTempo(next);
  };

  const handleLoadPreset = (preset: Preset) => {
    const next = preset.blocks.map((b) =>
      blockFromPreset(b.defId, b.bypass, b.paramValues)
    );
    updateChain(next);
    setSelectedId(null);
  };

  const handleImport = (
    blocks: PresetBlock[],
    extras: { pickupId?: PickupId; bpm?: number; name?: string }
  ) => {
    const next = blocks.map((b) =>
      blockFromPreset(b.defId, b.bypass, b.paramValues)
    );
    updateChain(next);
    setSelectedId(null);
    if (extras.pickupId) handlePickupChange(extras.pickupId);
    if (typeof extras.bpm === 'number') handleBpmChange(extras.bpm);
  };

  const handleSwitchSlot = (slot: Slot) => {
    if (slot === activeSlot) return;
    setActiveSlot(slot);
    const next = slot === 'A' ? chainA : chainB;
    engine.setChain(next);
    // Drop selection — it points at the old slot's block IDs.
    setSelectedId(null);
  };

  const handleCopyAToB = () => {
    const copy = cloneChain(chainA);
    setChainB(copy);
    if (activeSlot === 'B') {
      engine.setChain(copy);
      setSelectedId(null);
    }
  };

  const handleCopyBToA = () => {
    const copy = cloneChain(chainB);
    setChainA(copy);
    if (activeSlot === 'A') {
      engine.setChain(copy);
      setSelectedId(null);
    }
  };

  const handleTryDemo = async (demo: LessonDemo) => {
    if (!started) {
      await engine.start();
      setStarted(true);
      engine.setMasterVolume(masterDb);
    }
    if (demo.chain) {
      const next = demo.chain.map((b) =>
        blockFromPreset(b.defId, b.bypass, b.paramValues)
      );
      updateChain(next);
      setSelectedId(null);
    }
    setTab('lab');
    if (demo.play) {
      setTimeout(() => {
        if (demo.play!.kind === 'note') engine.playNote(demo.play!.note);
        else engine.playChord(demo.play!.notes);
      }, 250);
    }
  };

  const selectedBlock = chain.find((b) => b.id === selectedId) ?? null;
  const selectedDef = selectedBlock
    ? effectDefinitions[selectedBlock.defId] ?? null
    : null;

  // Tell the engine which block to tap with the per-block analyzers.
  useEffect(() => {
    engine.setSelectedBlock(selectedId);
  }, [selectedId]);

  // A/B hotkeys. Ignore when the user is typing in an input or contenteditable.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      )
        return;
      if (e.key === 'a' || e.key === 'A') handleSwitchSlot('A');
      else if (e.key === 'b' || e.key === 'B') handleSwitchSlot('B');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSlot, chainA, chainB]);

  return (
    <div className="min-h-screen bg-bg-950 text-zinc-200">
      <header className="border-b border-bg-700 bg-bg-900 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-lg font-medium tracking-tight">
                MusicProf{' '}
                <span className="text-zinc-500 text-sm font-normal">
                  · Guitar Signal Chain Lab
                </span>
              </h1>
              <p className="text-[11px] text-zinc-500">
                Modeled after the Headrush Prime
              </p>
            </div>
            <nav className="flex gap-1 bg-bg-800 border border-bg-600 rounded p-0.5">
              <TabButton
                active={tab === 'lab'}
                onClick={() => setTab('lab')}
                label="Lab"
              />
              <TabButton
                active={tab === 'classroom'}
                onClick={() => setTab('classroom')}
                label="Classroom"
              />
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <TapTempo bpm={bpm} onChange={handleBpmChange} />
            <MetronomeWidget />
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

      <main className="max-w-[1600px] mx-auto p-4">
        {tab === 'lab' ? (
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-12 lg:col-span-8 space-y-4">
              <SourceSelector
                source={source}
                onSourceChange={handleSourceChange}
                inputDb={inputDb}
                onInputDbChange={handleInputDb}
                pickupId={pickupId}
                onPickupChange={handlePickupChange}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setShowTuner((s) => !s)}
                  className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                    showTuner
                      ? 'border-accent-amber text-accent-amber bg-amber-500/10'
                      : 'border-bg-600 text-zinc-400 hover:text-zinc-200 bg-bg-800'
                  }`}
                >
                  {showTuner ? 'Hide tuner' : 'Show tuner'}
                </button>
                <button
                  onClick={() => setShowLooper((s) => !s)}
                  className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                    showLooper
                      ? 'border-accent-amber text-accent-amber bg-amber-500/10'
                      : 'border-bg-600 text-zinc-400 hover:text-zinc-200 bg-bg-800'
                  }`}
                >
                  {showLooper ? 'Hide looper' : 'Show looper'}
                </button>
              </div>

              {showTuner ? <Tuner running={started} /> : null}
              {showLooper ? <Looper running={started} /> : null}

              <SlotSwitcher
                activeSlot={activeSlot}
                onSwitch={handleSwitchSlot}
                onCopyAToB={handleCopyAToB}
                onCopyBToA={handleCopyBToA}
                slotASize={chainA.length}
                slotBSize={chainB.length}
              />

              <PresetBar
                onLoad={handleLoadPreset}
                currentChain={chain.map((b) => ({
                  defId: b.defId,
                  bypass: b.bypass,
                  paramValues: { ...b.paramValues },
                }))}
                onOpenExport={() => setExportOpen(true)}
              />

              <SignalChain
                chain={chain}
                selectedId={selectedId}
                onSelect={setSelectedId}
                onBypass={handleBypass}
                onParam={handleParam}
                onRemove={handleRemove}
                onReorder={updateChain}
              />

              <Visualizer
                running={started}
                selectedBlockLabel={selectedDef ? selectedDef.displayName : null}
              />

              <div className="bg-bg-900 border border-bg-700 rounded p-4">
                <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
                  Play something
                </h2>
                <ChordPicker
                  onPlayNote={(n) => engine.playNote(n)}
                  onPlayChord={(notes) => engine.playChord(notes)}
                  disabled={!started || source === 'live'}
                />
                {!started ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    Click <strong>Power on</strong> in the top right to enable
                    audio.
                  </p>
                ) : source === 'live' ? (
                  <p className="mt-3 text-xs text-zinc-500">
                    Synth playback is disabled while Live Guitar is the source.
                    Just play your real guitar.
                  </p>
                ) : null}
              </div>

              <EffectPalette onAdd={handleAdd} />
            </div>

            <div className="col-span-12 lg:col-span-4">
              <div className="lg:sticky lg:top-20">
                <LessonPanel block={selectedBlock} def={selectedDef} />
              </div>
            </div>
          </div>
        ) : (
          <Classroom onTryDemo={handleTryDemo} />
        )}
      </main>

      <ExportModal
        open={exportOpen}
        onClose={() => setExportOpen(false)}
        chain={chain.map((b) => ({
          defId: b.defId,
          bypass: b.bypass,
          paramValues: { ...b.paramValues },
        }))}
        chainName={`Slot ${activeSlot}`}
        pickupId={pickupId}
        bpm={bpm}
        onImport={handleImport}
      />

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

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1 rounded text-sm transition-colors ${
        active
          ? 'bg-bg-700 text-zinc-100'
          : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {label}
    </button>
  );
}
