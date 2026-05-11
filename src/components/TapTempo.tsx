import { useRef, useState } from 'react';

interface Props {
  bpm: number;
  onChange: (bpm: number) => void;
}

/**
 * Tap tempo widget. Click the button (or press T) several times; the average
 * interval between taps is converted to BPM. Resets after 2 seconds of no
 * taps. Manual override via the input field.
 */
export function TapTempo({ bpm, onChange }: Props) {
  const tapsRef = useRef<number[]>([]);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(bpm));

  const handleTap = () => {
    const now = performance.now();
    const taps = tapsRef.current;
    // Reset if last tap was too long ago
    if (taps.length > 0 && now - taps[taps.length - 1] > 2000) {
      taps.length = 0;
    }
    taps.push(now);
    // Keep only the last 8 taps for averaging
    if (taps.length > 8) taps.shift();
    if (taps.length < 2) return;
    // Average interval
    let sum = 0;
    for (let i = 1; i < taps.length; i++) sum += taps[i] - taps[i - 1];
    const avgMs = sum / (taps.length - 1);
    let computed = 60000 / avgMs;
    computed = Math.round(Math.max(30, Math.min(300, computed)));
    onChange(computed);
  };

  const commitDraft = () => {
    const n = parseInt(draft, 10);
    if (!Number.isNaN(n) && n >= 30 && n <= 300) {
      onChange(n);
    }
    setEditing(false);
    setDraft(String(bpm));
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleTap}
        title="Click in time with the music to set the BPM. Resets after 2s of no taps."
        className="px-3 py-1.5 rounded bg-bg-800 border border-bg-600 text-zinc-200 text-xs uppercase tracking-wider hover:bg-bg-700 hover:border-accent-amber/40 transition-colors"
      >
        Tap
      </button>
      {editing ? (
        <input
          type="number"
          min={30}
          max={300}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitDraft}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitDraft();
            if (e.key === 'Escape') {
              setEditing(false);
              setDraft(String(bpm));
            }
          }}
          autoFocus
          className="w-16 bg-bg-800 border border-bg-600 rounded px-2 py-1 text-sm font-mono text-zinc-200"
        />
      ) : (
        <button
          onClick={() => {
            setEditing(true);
            setDraft(String(bpm));
          }}
          title="Click to edit BPM directly"
          className="font-mono text-sm text-zinc-300 hover:text-accent-amber tabular-nums"
        >
          {bpm} <span className="text-zinc-500 text-[10px]">BPM</span>
        </button>
      )}
    </div>
  );
}
