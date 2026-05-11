import { useState } from 'react';
import { PRESETS, type Preset, type PresetBlock } from '../data/presets';
import { userPresets, type UserPreset } from '../data/userPresets';

interface Props {
  onLoad: (preset: Preset) => void;
  /** Current chain converted to PresetBlock[] for "Save current". */
  currentChain: PresetBlock[];
}

export function PresetBar({ onLoad, currentChain }: Props) {
  const [savedList, setSavedList] = useState<UserPreset[]>(userPresets.list());
  const [showSave, setShowSave] = useState(false);
  const [name, setName] = useState('');

  const refresh = () => setSavedList(userPresets.list());

  const handleSave = () => {
    if (!name.trim()) return;
    userPresets.add(name, currentChain);
    setName('');
    setShowSave(false);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this preset? This can\'t be undone.')) return;
    userPresets.remove(id);
    refresh();
  };

  const userPresetToPreset = (up: UserPreset): Preset => ({
    id: up.id,
    name: up.name,
    description: `Saved ${new Date(up.createdAt).toLocaleString()}`,
    use: 'Your saved tone',
    blocks: up.blocks,
  });

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-3 space-y-3">
      {/* Built-in presets */}
      <div>
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

      {/* User presets */}
      <div className="pt-2 border-t border-bg-800">
        <div className="flex items-baseline justify-between mb-2">
          <h2 className="text-xs uppercase tracking-wider text-zinc-400">
            Your presets
          </h2>
          {!showSave ? (
            <button
              onClick={() => setShowSave(true)}
              className="text-[11px] text-accent-amber hover:brightness-110"
            >
              + Save current chain
            </button>
          ) : null}
        </div>

        {showSave ? (
          <div className="flex gap-2 mb-2 items-center">
            <input
              type="text"
              autoFocus
              placeholder="Name this tone…"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') {
                  setShowSave(false);
                  setName('');
                }
              }}
              className="flex-1 bg-bg-800 border border-bg-600 rounded px-3 py-1.5 text-sm text-zinc-200 outline-none focus:border-accent-amber"
            />
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="px-3 py-1.5 rounded bg-accent-amber text-bg-950 font-medium text-sm hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Save
            </button>
            <button
              onClick={() => {
                setShowSave(false);
                setName('');
              }}
              className="px-3 py-1.5 rounded border border-bg-600 text-sm text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </button>
          </div>
        ) : null}

        {savedList.length === 0 ? (
          <div className="text-xs text-zinc-600 italic">
            No saved tones yet. Build a chain you like, then click "Save current
            chain" above.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {savedList.map((up) => (
              <div
                key={up.id}
                className="flex items-stretch border border-bg-600 bg-bg-800 rounded overflow-hidden"
              >
                <button
                  onClick={() => onLoad(userPresetToPreset(up))}
                  title={`Saved ${new Date(up.createdAt).toLocaleString()}`}
                  className="px-3 py-2 text-sm text-zinc-100 hover:bg-bg-700 transition-colors text-left"
                >
                  <div className="font-medium truncate max-w-[12rem]">
                    {up.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {up.blocks.length} block{up.blocks.length === 1 ? '' : 's'}
                  </div>
                </button>
                <button
                  onClick={() => handleDelete(up.id)}
                  title="Delete preset"
                  className="px-2 text-zinc-500 hover:bg-red-600/20 hover:text-red-300 transition-colors border-l border-bg-700"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
