import { useEffect, useState } from 'react';
import { engine, enumerateAudioInputs } from '../audio/engine';

interface Props {
  source: 'synth' | 'live';
  onSourceChange: () => void; // signal that source changed; engine has up-to-date state
  inputDb: number;
  onInputDbChange: (db: number) => void;
}

export function SourceSelector({
  source,
  onSourceChange,
  inputDb,
  onInputDbChange,
}: Props) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  // Refresh device list (labels only populated after permission granted)
  const refreshDevices = async () => {
    try {
      const list = await enumerateAudioInputs();
      setDevices(list);
      // If our currently-selected deviceId is in the list, keep it; else default.
      if (
        list.length > 0 &&
        !list.find((d) => d.deviceId === selectedDeviceId)
      ) {
        setSelectedDeviceId(list[0].deviceId);
      }
    } catch (e) {
      console.warn('enumerateInputs failed', e);
    }
  };

  useEffect(() => {
    refreshDevices();
    // Listen for device hot-plug
    const handler = () => refreshDevices();
    navigator.mediaDevices?.addEventListener?.('devicechange', handler);
    return () =>
      navigator.mediaDevices?.removeEventListener?.('devicechange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const enableLive = async (deviceId?: string) => {
    setError(null);
    setOpening(true);
    try {
      await engine.useLiveInput(deviceId);
      // Labels are now available — refresh.
      await refreshDevices();
      const dev = engine.getLiveDeviceId();
      if (dev) setSelectedDeviceId(dev);
      onSourceChange();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(`Couldn't open input: ${msg}`);
      onSourceChange();
    } finally {
      setOpening(false);
    }
  };

  const useSynth = () => {
    engine.useSynthInput();
    setError(null);
    onSourceChange();
  };

  const onSelectDevice = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    if (source === 'live') enableLive(deviceId);
  };

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-3 space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-xs uppercase tracking-wider text-zinc-400">
          Input source
        </h2>
        <span className="text-[10px] text-zinc-600">
          {source === 'live' ? 'Mic / Audio Interface' : 'Synthesized guitar'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex bg-bg-800 border border-bg-600 rounded p-0.5">
          <button
            onClick={useSynth}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              source === 'synth'
                ? 'bg-bg-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Synth
          </button>
          <button
            onClick={() => enableLive(selectedDeviceId || undefined)}
            disabled={opening}
            className={`px-3 py-1 text-sm rounded transition-colors ${
              source === 'live'
                ? 'bg-bg-700 text-zinc-100'
                : 'text-zinc-400 hover:text-zinc-200'
            } disabled:opacity-50`}
          >
            {opening ? 'Opening…' : 'Live guitar'}
          </button>
        </div>

        {source === 'live' && devices.length > 0 ? (
          <select
            value={selectedDeviceId}
            onChange={(e) => onSelectDevice(e.target.value)}
            className="bg-bg-800 border border-bg-600 rounded px-2 py-1 text-sm text-zinc-200 max-w-xs"
          >
            {devices.map((d) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label ||
                  `Audio input ${d.deviceId.slice(0, 8)}…`}
              </option>
            ))}
          </select>
        ) : null}

        <label className="flex items-center gap-2 text-xs text-zinc-400 ml-auto">
          Input
          <input
            type="range"
            min={-12}
            max={24}
            step={0.5}
            value={inputDb}
            onChange={(e) => onInputDbChange(parseFloat(e.target.value))}
            className="w-24"
          />
          <span className="font-mono text-zinc-300 w-12 text-right">
            {inputDb.toFixed(1)} dB
          </span>
        </label>
      </div>

      {error ? (
        <div className="text-xs text-red-400 leading-relaxed">{error}</div>
      ) : null}

      {source === 'live' ? (
        <div className="text-[11px] text-zinc-500 leading-relaxed">
          <strong className="text-amber-300">Use headphones!</strong> Live
          input + speakers will feedback (howl). Most guitarists need to
          boost the input gain (+12 to +20 dB) because guitar pickups output
          a hot signal but interfaces often don't add gain. Watch the DRY
          waveform — peaks should hit roughly ±0.5, not clip at ±1.
        </div>
      ) : (
        <div className="text-[11px] text-zinc-500 leading-relaxed">
          Synthesized 8-voice Karplus-Strong plucked-string. Switch to{' '}
          <strong>Live guitar</strong> to plug in a real guitar via your
          audio interface — your browser will ask for mic permission.
        </div>
      )}
    </div>
  );
}
