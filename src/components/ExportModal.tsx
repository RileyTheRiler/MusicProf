import { useEffect, useRef, useState } from 'react';
import {
  chainFromJson,
  chainToJson,
  chainToRecipe,
} from '../data/serialize';
import type { PresetBlock } from '../data/presets';
import type { PickupId } from '../audio/pickups';

interface Props {
  open: boolean;
  onClose: () => void;
  chain: PresetBlock[];
  chainName: string;
  pickupId: PickupId;
  bpm: number;
  onImport: (blocks: PresetBlock[], extras: { pickupId?: PickupId; bpm?: number; name?: string }) => void;
}

type View = 'recipe' | 'json' | 'import';

export function ExportModal({
  open,
  onClose,
  chain,
  chainName,
  pickupId,
  bpm,
  onImport,
}: Props) {
  const [view, setView] = useState<View>('recipe');
  const [name, setName] = useState(chainName);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setName(chainName);
      setView('recipe');
      setImportText('');
      setImportError(null);
      setCopied(false);
    }
  }, [open, chainName]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const json = chainToJson(name, chain, { pickupId, bpm });
  const recipe = chainToRecipe(name, chain, { pickupId, bpm });

  const copy = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((e) => {
        console.warn('Clipboard write failed', e);
      });
  };

  const downloadJson = () => {
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = name.replace(/[^a-z0-9-_]+/gi, '_') || 'tone';
    a.download = `musicprof-${safe}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadRecipe = () => {
    const blob = new Blob([recipe], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safe = name.replace(/[^a-z0-9-_]+/gi, '_') || 'tone';
    a.download = `musicprof-${safe}-recipe.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doImport = () => {
    setImportError(null);
    const result = chainFromJson(importText);
    if (!result.ok) {
      setImportError(result.error);
      return;
    }
    onImport(result.payload.blocks, {
      pickupId: result.payload.pickupId,
      bpm: result.payload.bpm,
      name: result.payload.name,
    });
    onClose();
  };

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result ?? '');
      setImportText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg-900 border border-bg-700 rounded-lg max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="border-b border-bg-700 p-4 flex items-center justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-medium">Export / Import tone</h2>
            <p className="text-[11px] text-zinc-500">
              Save the current chain as a portable file, share it, or paste
              someone else's tone here.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 text-xl leading-none px-2"
          >
            ×
          </button>
        </header>

        <div className="flex gap-1 px-4 pt-3 border-b border-bg-700">
          <TabBtn active={view === 'recipe'} onClick={() => setView('recipe')}>
            Recipe (for your Prime)
          </TabBtn>
          <TabBtn active={view === 'json'} onClick={() => setView('json')}>
            JSON
          </TabBtn>
          <TabBtn active={view === 'import'} onClick={() => setView('import')}>
            Import
          </TabBtn>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {view !== 'import' ? (
            <label className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400 text-xs">Name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-bg-800 border border-bg-600 rounded px-2 py-1 text-sm text-zinc-200 outline-none focus:border-accent-amber"
              />
            </label>
          ) : null}

          {view === 'recipe' ? (
            <>
              <p className="text-xs text-zinc-500">
                Print this or open it on your phone while sitting at the
                physical Headrush Prime. Set each block to the closest model
                and dial in the listed parameter values.
              </p>
              <pre className="bg-bg-950 border border-bg-700 rounded p-3 text-[12px] text-zinc-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                {recipe}
              </pre>
              <div className="flex gap-2">
                <button onClick={() => copy(recipe)} className={btnPrimary}>
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
                <button onClick={downloadRecipe} className={btnSecondary}>
                  Download .txt
                </button>
              </div>
            </>
          ) : view === 'json' ? (
            <>
              <p className="text-xs text-zinc-500">
                The same tone as JSON — for sharing with other MusicProf
                users. Pasting back into the Import tab restores the chain
                exactly.
              </p>
              <pre className="bg-bg-950 border border-bg-700 rounded p-3 text-[12px] text-zinc-300 font-mono whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
                {json}
              </pre>
              <div className="flex gap-2">
                <button onClick={() => copy(json)} className={btnPrimary}>
                  {copied ? 'Copied!' : 'Copy to clipboard'}
                </button>
                <button onClick={downloadJson} className={btnSecondary}>
                  Download .json
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-zinc-500">
                Paste an exported JSON below, or load a <code>.json</code> file.
                The chain will replace the currently active slot.
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                onChange={onPickFile}
                className="text-xs text-zinc-400"
              />
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='{ "schema": 1, "name": "...", "blocks": [...] }'
                rows={12}
                className="w-full bg-bg-950 border border-bg-700 rounded p-3 text-[12px] text-zinc-300 font-mono outline-none focus:border-accent-amber"
              />
              {importError ? (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded p-2">
                  {importError}
                </div>
              ) : null}
              <div className="flex gap-2">
                <button
                  onClick={doImport}
                  disabled={!importText.trim()}
                  className={`${btnPrimary} disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  Import
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const btnPrimary =
  'px-3 py-1.5 rounded bg-accent-amber text-bg-950 font-medium text-sm hover:brightness-110';
const btnSecondary =
  'px-3 py-1.5 rounded border border-bg-600 text-zinc-300 text-sm hover:border-bg-500 hover:bg-bg-800';

function TabBtn({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 text-sm rounded-t transition-colors ${
        active
          ? 'bg-bg-800 border-x border-t border-bg-700 text-zinc-100'
          : 'text-zinc-400 hover:text-zinc-200'
      }`}
    >
      {children}
    </button>
  );
}
