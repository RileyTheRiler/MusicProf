import { useEffect, useState } from 'react';
import { engine } from '../audio/engine';

const BEATS_OPTIONS = [3, 4, 5, 6, 7];

export function MetronomeWidget() {
  const m = engine.getMetronome();
  const [on, setOn] = useState(false);
  const [beat, setBeat] = useState(-1);
  const [beatsPerBar, setBeatsPerBar] = useState(4);

  useEffect(() => {
    if (!m) return;
    const sync = () => {
      setOn(m.isOn());
      setBeat(m.getCurrentBeat());
      setBeatsPerBar(m.getBeatsPerBar());
    };
    sync();
    return m.subscribe(sync);
  }, [m]);

  const handleToggle = async () => {
    if (!engine.isStarted()) {
      // Metronome wasn't created yet; spin up the engine and try again.
      await engine.start();
    }
    const live = engine.getMetronome();
    if (!live) return;
    live.toggle();
  };

  const setBeats = (n: number) => {
    if (!m) {
      setBeatsPerBar(n);
      return;
    }
    m.setBeatsPerBar(n);
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleToggle}
        title="Toggle metronome click. Tied to the global BPM (set via Tap)."
        className={`px-2.5 py-1.5 text-xs uppercase tracking-wider rounded border transition-colors ${
          on
            ? 'border-accent-amber text-accent-amber bg-amber-500/10'
            : 'border-bg-600 text-zinc-400 hover:text-zinc-200 bg-bg-800'
        }`}
      >
        Click
      </button>
      <select
        value={beatsPerBar}
        onChange={(e) => setBeats(parseInt(e.target.value, 10))}
        title="Beats per bar (numerator of the time signature)"
        className="bg-bg-800 border border-bg-600 rounded px-1.5 py-1 text-xs text-zinc-300 font-mono"
      >
        {BEATS_OPTIONS.map((n) => (
          <option key={n} value={n}>
            {n}/4
          </option>
        ))}
      </select>
      {on ? (
        <div className="flex gap-1">
          {Array.from({ length: beatsPerBar }, (_, i) => (
            <span
              key={i}
              className={`inline-block w-2 h-2 rounded-full transition-colors ${
                i === beat
                  ? i === 0
                    ? 'bg-accent-amber shadow-[0_0_4px_rgba(245,158,11,0.7)]'
                    : 'bg-zinc-200'
                  : 'bg-zinc-700'
              }`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
