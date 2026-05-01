import type { ChainBlock } from '../types';
import { effectDefinitions } from '../audio/effects';
import { EffectBlock } from './EffectBlock';

interface Props {
  chain: ChainBlock[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onBypass: (id: string, bypass: boolean) => void;
  onParam: (id: string, paramId: string, value: number) => void;
  onRemove: (id: string) => void;
  onReorder: (chain: ChainBlock[]) => void;
}

export function SignalChain({
  chain,
  selectedId,
  onSelect,
  onBypass,
  onParam,
  onRemove,
  onReorder,
}: Props) {
  const move = (idx: number, dir: -1 | 1) => {
    const next = [...chain];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onReorder(next);
  };

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-4">
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        <SourceBadge label="Guitar" sub="pickup" />
        <Wire />
        {chain.length === 0 ? (
          <div className="text-zinc-500 text-sm italic px-4 py-8">
            Empty chain — your dry signal goes straight to the speakers. Add an
            effect below.
          </div>
        ) : (
          chain.map((block, idx) => {
            const def = effectDefinitions[block.defId];
            if (!def) return null;
            return (
              <div key={block.id} className="flex items-center gap-3">
                <EffectBlock
                  block={block}
                  def={def}
                  selected={selectedId === block.id}
                  onSelect={() => onSelect(block.id)}
                  onBypass={(b) => onBypass(block.id, b)}
                  onParam={(pid, v) => onParam(block.id, pid, v)}
                  onRemove={() => onRemove(block.id)}
                  onMoveLeft={() => move(idx, -1)}
                  onMoveRight={() => move(idx, 1)}
                  canMoveLeft={idx > 0}
                  canMoveRight={idx < chain.length - 1}
                />
                <Wire />
              </div>
            );
          })
        )}
        <SourceBadge label="Speakers" sub="output" />
      </div>
    </div>
  );
}

function SourceBadge({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex-shrink-0 w-24 h-24 bg-bg-800 border border-bg-600 rounded flex flex-col items-center justify-center">
      <div className="text-sm font-medium text-zinc-200">{label}</div>
      <div className="text-[10px] text-zinc-500 uppercase tracking-wider mt-1">
        {sub}
      </div>
    </div>
  );
}

function Wire() {
  return (
    <div className="flex-shrink-0 flex items-center w-8">
      <div className="h-0.5 bg-zinc-600 w-full relative">
        <div className="absolute -right-1 -top-1 w-2 h-2 border-t-2 border-r-2 border-zinc-600 rotate-45" />
      </div>
    </div>
  );
}
