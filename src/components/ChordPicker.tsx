import { CHORDS, SINGLE_NOTES } from '../data/chords';

export interface ChordPickerProps {
  onPlayChord: (notes: string[]) => void;
  onPlayNote: (note: string) => void;
  disabled?: boolean;
}

export function ChordPicker({ onPlayChord, onPlayNote, disabled }: ChordPickerProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Strings (open)
        </h3>
        <div className="flex flex-wrap gap-2">
          {SINGLE_NOTES.map((n) => (
            <button
              key={n.note}
              disabled={disabled}
              onClick={() => onPlayNote(n.note)}
              className="px-3 py-2 bg-bg-800 hover:bg-bg-700 disabled:bg-bg-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-sm rounded border border-bg-600 transition-colors font-mono"
            >
              {n.label}
              <span className="text-zinc-500 ml-1.5">{n.note}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Chords
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CHORDS.map((c) => (
            <button
              key={c.name}
              disabled={disabled}
              onClick={() => onPlayChord(c.notes)}
              title={c.description}
              className="px-3 py-2 bg-bg-800 hover:bg-bg-700 disabled:bg-bg-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-sm rounded border border-bg-600 transition-colors text-left"
            >
              <div className="font-medium">{c.name}</div>
              <div className="text-[10px] text-zinc-500 font-mono truncate">
                {c.notes.join(' ')}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
