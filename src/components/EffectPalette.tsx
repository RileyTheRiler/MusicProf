import {
  categoryColors,
  categoryLabels,
  categoryOrder,
  effectDefinitionList,
} from '../audio/effects';
import type { EffectDefinition } from '../types';

interface Props {
  onAdd: (def: EffectDefinition) => void;
}

export function EffectPalette({ onAdd }: Props) {
  // Group by category in display order
  const byCat = new Map<string, EffectDefinition[]>();
  for (const def of effectDefinitionList) {
    const arr = byCat.get(def.category) ?? [];
    arr.push(def);
    byCat.set(def.category, arr);
  }
  const cats = [...byCat.keys()].sort(
    (a, b) => (categoryOrder[a] ?? 99) - (categoryOrder[b] ?? 99)
  );

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-4">
      <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
        Add an effect
      </h2>
      <p className="text-xs text-zinc-500 mb-3">
        Headrush Prime block catalog — click an implemented (colored) block to add it
        to your chain. Greyed blocks are catalog-only for reference; their lessons
        are still readable, but no audio yet.
      </p>
      <div className="space-y-3">
        {cats.map((cat) => {
          const defs = byCat.get(cat) ?? [];
          return (
            <div key={cat}>
              <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
                {categoryLabels[cat] ?? cat}
              </div>
              <div className="flex flex-wrap gap-2">
                {defs.map((def) => (
                  <button
                    key={def.id}
                    onClick={() => onAdd(def)}
                    disabled={!def.implemented}
                    title={
                      def.implemented
                        ? def.shortDescription
                        : 'Lesson available; audio not yet implemented'
                    }
                    className={`text-left px-3 py-2 rounded border text-sm transition-colors
                      ${
                        def.implemented
                          ? 'border-bg-600 bg-bg-800 hover:bg-bg-700 cursor-pointer'
                          : 'border-bg-700 bg-bg-900 text-zinc-600 cursor-not-allowed'
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2 h-2 rounded-full ${
                          def.implemented
                            ? categoryColors[def.category]
                            : 'bg-zinc-700'
                        }`}
                      />
                      {def.displayName}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
