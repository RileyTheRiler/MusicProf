import { useEffect, useState } from 'react';
import { engine } from '../audio/engine';
import type { LooperState } from '../audio/looper';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

interface Props {
  running: boolean;
}

/**
 * Looper widget — records the post-chain wet signal, plays it back in a loop.
 * Useful for solo practice: record a chord progression, then play lead over
 * the loop. Mirrors the looper block on the Headrush Prime.
 */
export function Looper({ running }: Props) {
  const looper = engine.getLooper();
  const [state, setState] = useState<LooperState>(looper?.getState() ?? 'off');
  const [progress, setProgress] = useState(0);
  const [loopLengthSec, setLoopLengthSec] = useState(0);
  const [volume, setVolume] = useState(0.8);

  // Subscribe to looper state changes.
  useEffect(() => {
    if (!looper) return;
    setState(looper.getState());
    setVolume(looper.getLoopVolume());
    const unsub = looper.subscribe(() => {
      setState(looper.getState());
      setLoopLengthSec(looper.getLoopLengthSec());
    });
    return unsub;
  }, [looper]);

  // 30 Hz progress polling while playing or recording.
  useAnimationFrame(() => {
    if (!looper) return;
    if (state !== 'playing' && state !== 'recording') return;
    setProgress(looper.getProgress());
  }, state === 'playing' || state === 'recording');

  if (!running || !looper) {
    return (
      <div className="bg-bg-900 border border-bg-700 rounded p-4">
        <h2 className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
          Looper
        </h2>
        <p className="text-xs text-zinc-500 italic">
          Press <strong>Power on</strong> to enable the looper.
        </p>
      </div>
    );
  }

  const hasLoop = loopLengthSec > 0;

  const handleRecord = () => {
    if (state === 'recording') {
      looper.stopRecordAndPlay();
    } else {
      looper.startRecord();
    }
  };

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-4 space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs uppercase tracking-wider text-zinc-400">
          Looper
        </h2>
        <span className="text-[10px] text-zinc-600">
          Records the post-chain wet signal
        </span>
      </div>

      {/* State indicator */}
      <div className="flex items-center gap-2">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            state === 'recording'
              ? 'bg-red-500 animate-pulse'
              : state === 'playing'
                ? 'bg-green-500'
                : state === 'paused'
                  ? 'bg-amber-500'
                  : 'bg-zinc-600'
          }`}
        />
        <span className="text-sm text-zinc-300 capitalize">{state}</span>
        {hasLoop ? (
          <span className="text-[11px] text-zinc-500 font-mono ml-auto">
            {loopLengthSec.toFixed(1)} s
          </span>
        ) : null}
      </div>

      {/* Progress bar */}
      <div className="relative h-3 bg-bg-800 rounded border border-bg-700 overflow-hidden">
        {state === 'recording' ? (
          <div
            className="absolute top-0 bottom-0 left-0 bg-red-500/40"
            style={{ width: `${progress * 100}%` }}
          />
        ) : hasLoop ? (
          <>
            <div className="absolute top-0 bottom-0 left-0 right-0 bg-green-500/10" />
            <div
              className="absolute top-0 bottom-0 left-0 bg-green-500/40 transition-[width] duration-75 ease-linear"
              style={{ width: `${progress * 100}%` }}
            />
          </>
        ) : null}
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={handleRecord}
          className={`flex-1 px-3 py-2 rounded text-sm font-medium transition-colors border ${
            state === 'recording'
              ? 'bg-red-500/20 border-red-500 text-red-300'
              : 'bg-bg-800 border-bg-600 text-zinc-200 hover:bg-bg-700'
          }`}
        >
          {state === 'recording' ? 'Stop & Play' : '● Record'}
        </button>
        <button
          onClick={() => looper.togglePlay()}
          disabled={!hasLoop || state === 'recording'}
          className="flex-1 px-3 py-2 rounded text-sm font-medium border border-bg-600 bg-bg-800 text-zinc-200 hover:bg-bg-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state === 'playing' ? '❚❚ Pause' : '▶ Play'}
        </button>
        <button
          onClick={() => looper.clear()}
          disabled={!hasLoop && state !== 'recording'}
          className="px-3 py-2 rounded text-sm border border-bg-600 bg-bg-800 text-zinc-400 hover:text-red-300 hover:border-red-500/40 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Clear
        </button>
      </div>

      {/* Loop level */}
      <label className="flex items-center gap-3 text-xs text-zinc-400">
        Loop level
        <input
          type="range"
          min={0}
          max={1.5}
          step={0.01}
          value={volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            looper.setLoopVolume(v);
          }}
          className="flex-1"
        />
        <span className="font-mono text-zinc-300 w-10 text-right">
          {Math.round(volume * 100)}%
        </span>
      </label>

      <p className="text-[11px] text-zinc-500 leading-relaxed">
        Record a chord progression, hit <strong>Stop &amp; Play</strong>, then
        solo over the loop. The loop persists when you change effects — use
        that to practice the same line through different tones.
      </p>
    </div>
  );
}
