import { PRESETS, type Preset } from '../data/presets';

interface Props {
  onLoad: (preset: Preset) => void;
}

export function PresetBar({ onLoad }: Props) {
  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-3">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-xs uppercase tracking-wider text-zinc-400">
          Presets
        </h2>
        <span className="text-[10px] text-zinc-600">
          Click to load — replaces current chain
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => onLoad(p)}
            title={`${p.description}\n\nGood for: ${p.use}`}
            className="text-left px-3 py-2 rounded border border-bg-600 bg-bg-800 hover:bg-bg-700 hover:border-accent-amber/50 transition-colors text-sm"
          >
            <div className="font-medium text-zinc-100">{p.name}</div>
            <div className="text-[10px] text-zinc-500 mt-0.5 max-w-[14rem] truncate">
              {p.use}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
