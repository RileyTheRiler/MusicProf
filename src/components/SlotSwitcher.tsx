interface Props {
  activeSlot: 'A' | 'B';
  onSwitch: (slot: 'A' | 'B') => void;
  onCopyAToB: () => void;
  onCopyBToA: () => void;
  /** Number of blocks in each slot, for the badge */
  slotASize: number;
  slotBSize: number;
}

/**
 * A/B slot switcher. Two big tabs at the top of the chain area let the user
 * flip between two independent chain configurations. Copy buttons let you
 * clone one slot into the other so you can tweak from a known starting
 * point. Switching slots = instantly comparing tones.
 */
export function SlotSwitcher({
  activeSlot,
  onSwitch,
  onCopyAToB,
  onCopyBToA,
  slotASize,
  slotBSize,
}: Props) {
  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-3 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          A/B
        </span>
        <div className="flex bg-bg-800 border border-bg-600 rounded p-0.5">
          <SlotButton
            label="A"
            active={activeSlot === 'A'}
            count={slotASize}
            onClick={() => onSwitch('A')}
            hotkey="A"
          />
          <SlotButton
            label="B"
            active={activeSlot === 'B'}
            count={slotBSize}
            onClick={() => onSwitch('B')}
            hotkey="B"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 text-[11px]">
        <button
          onClick={onCopyAToB}
          title="Copy slot A into slot B so you can tweak from there"
          className="px-2 py-1 rounded border border-bg-600 text-zinc-400 hover:text-zinc-200 hover:border-bg-500"
        >
          A → B
        </button>
        <button
          onClick={onCopyBToA}
          title="Copy slot B into slot A"
          className="px-2 py-1 rounded border border-bg-600 text-zinc-400 hover:text-zinc-200 hover:border-bg-500"
        >
          B → A
        </button>
      </div>

      <div className="text-[11px] text-zinc-500 ml-auto leading-snug max-w-md">
        Build a tone in one slot, copy it to the other, tweak, then flip
        between them to A/B. Hotkeys <kbd className="text-zinc-300 font-mono">A</kbd>/<kbd className="text-zinc-300 font-mono">B</kbd>.
      </div>
    </div>
  );
}

function SlotButton({
  label,
  active,
  count,
  onClick,
  hotkey,
}: {
  label: string;
  active: boolean;
  count: number;
  onClick: () => void;
  hotkey: string;
}) {
  return (
    <button
      onClick={onClick}
      title={`Switch to slot ${label} (hotkey: ${hotkey})`}
      className={`px-4 py-1 rounded text-sm font-medium transition-colors flex items-center gap-2 ${
        active
          ? 'bg-accent-amber text-bg-950'
          : 'text-zinc-400 hover:text-zinc-100'
      }`}
    >
      <span>{label}</span>
      <span
        className={`text-[10px] px-1.5 py-0.5 rounded-full ${
          active ? 'bg-bg-950/30 text-bg-950' : 'bg-bg-700 text-zinc-500'
        }`}
      >
        {count}
      </span>
    </button>
  );
}
