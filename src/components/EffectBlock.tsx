import type { ChainBlock, EffectDefinition } from '../types';
import { categoryColors, categoryLabels } from '../audio/effects';
import { Knob } from './Knob';

interface Props {
  block: ChainBlock;
  def: EffectDefinition;
  selected: boolean;
  onSelect: () => void;
  onBypass: (b: boolean) => void;
  onParam: (paramId: string, value: number) => void;
  onRemove: () => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
}

export function EffectBlock({
  block,
  def,
  selected,
  onSelect,
  onBypass,
  onParam,
  onRemove,
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
}: Props) {
  const color = categoryColors[def.category] ?? 'bg-zinc-700';
  const label = categoryLabels[def.category] ?? def.category;

  return (
    <div
      onClick={onSelect}
      className={`flex-shrink-0 w-60 bg-bg-800 border rounded p-3 cursor-pointer transition-all
        ${selected ? 'border-accent-amber shadow-lg shadow-amber-500/10' : 'border-bg-600 hover:border-bg-700'}
        ${block.bypass ? 'opacity-50' : ''}
      `}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded text-white ${color}`}>
          {label}
        </span>
        <div className="flex gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft();
            }}
            disabled={!canMoveLeft}
            title="Move earlier in chain"
            className="text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-xs px-1"
          >
            ◀
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight();
            }}
            disabled={!canMoveRight}
            title="Move later in chain"
            className="text-zinc-400 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed text-xs px-1"
          >
            ▶
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            title="Remove block"
            className="text-zinc-400 hover:text-red-400 text-xs px-1"
          >
            ×
          </button>
        </div>
      </div>

      <div className="text-sm font-medium mb-1 text-zinc-100">{def.displayName}</div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onBypass(!block.bypass);
        }}
        className={`w-full text-[10px] uppercase tracking-wider py-1 mb-3 rounded border transition-colors
          ${
            block.bypass
              ? 'bg-bg-900 border-bg-700 text-zinc-500'
              : 'bg-green-600/20 border-green-600 text-green-300'
          }
        `}
      >
        {block.bypass ? 'Bypassed' : 'Active'}
      </button>

      <div className="grid grid-cols-2 gap-3">
        {def.params.map((p) => (
          <Knob
            key={p.id}
            label={p.label}
            value={block.paramValues[p.id] ?? p.default}
            min={p.min}
            max={p.max}
            step={p.step}
            unit={p.unit}
            curve={p.curve}
            description={p.description}
            onChange={(v) => onParam(p.id, v)}
          />
        ))}
      </div>
    </div>
  );
}
