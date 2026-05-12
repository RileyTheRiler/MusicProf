import { useEffect, useRef, useState } from 'react';
import { engine } from '../audio/engine';
import {
  detectPitch,
  freqToReading,
  nearestStandardString,
  type PitchReading,
} from '../audio/pitch';

const UPDATE_INTERVAL_MS = 100; // 10 Hz pitch updates — saves CPU.
const STABLE_FRAMES_REQUIRED = 2; // Need 2 consecutive close readings to commit.

interface Props {
  running: boolean;
}

export function Tuner({ running }: Props) {
  const [reading, setReading] = useState<PitchReading | null>(null);
  const lastReadingRef = useRef<PitchReading | null>(null);
  const stableCountRef = useRef(0);

  useEffect(() => {
    if (!running) {
      setReading(null);
      return;
    }
    let mounted = true;

    const tick = () => {
      const wave = engine.getPreWaveform();
      if (!wave) return;
      const freq = detectPitch(wave, engine.getSampleRate());
      const r = freqToReading(freq);
      if (!r) {
        // No pitch — decay to silence display
        stableCountRef.current = 0;
        if (mounted) setReading(null);
        return;
      }
      // Stability check — guitar pitch detection produces occasional spurious
      // octave jumps. Only commit a reading if the last two are within a
      // semitone of each other.
      const prev = lastReadingRef.current;
      lastReadingRef.current = r;
      if (prev && Math.abs(r.midi - prev.midi) < 1.0) {
        stableCountRef.current = Math.min(STABLE_FRAMES_REQUIRED, stableCountRef.current + 1);
      } else {
        stableCountRef.current = 1;
      }
      if (stableCountRef.current >= STABLE_FRAMES_REQUIRED && mounted) {
        setReading(r);
      }
    };

    const id = window.setInterval(tick, UPDATE_INTERVAL_MS);
    return () => {
      mounted = false;
      window.clearInterval(id);
    };
  }, [running]);

  const tuned = reading && Math.abs(reading.cents) < 5;
  const veryFlat = reading && reading.cents < -25;
  const verySharp = reading && reading.cents > 25;
  const standardString = reading ? nearestStandardString(reading) : null;

  // Needle position: -50..+50 cents → 0..100%.
  const needlePct = reading
    ? Math.max(0, Math.min(100, 50 + reading.cents))
    : 50;

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-4">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-xs uppercase tracking-wider text-zinc-400">
          Tuner
        </h2>
        <span className="text-[10px] text-zinc-600">
          Autocorrelation · reads pre-chain signal
        </span>
      </div>

      {!running ? (
        <div className="text-xs text-zinc-500 italic">
          Press <strong>Power on</strong> and play a note.
        </div>
      ) : !reading ? (
        <div className="flex flex-col items-center py-4">
          <div className="text-5xl font-light text-zinc-700 tabular-nums">—</div>
          <div className="text-[11px] text-zinc-500 mt-2">Play a note…</div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Note name big */}
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={`text-5xl font-light tabular-nums ${
                tuned ? 'text-green-400' : 'text-zinc-100'
              }`}
            >
              {reading.note}
            </span>
            <span className="text-2xl text-zinc-500 tabular-nums">
              {reading.octave}
            </span>
            {standardString ? (
              <span className="ml-2 text-[10px] uppercase tracking-wider text-accent-amber px-2 py-0.5 border border-accent-amber/40 rounded">
                Open string
              </span>
            ) : null}
          </div>

          {/* Needle bar */}
          <div className="relative h-6 bg-bg-800 rounded border border-bg-700 overflow-hidden">
            {/* Center line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-zinc-600" />
            {/* In-tune zone (-5 to +5 cents) */}
            <div
              className="absolute top-0 bottom-0 bg-green-500/10 border-x border-green-500/20"
              style={{ left: '45%', width: '10%' }}
            />
            {/* Needle */}
            <div
              className={`absolute top-0 bottom-0 w-1 rounded-full transition-all duration-150 ${
                tuned
                  ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]'
                  : veryFlat || verySharp
                    ? 'bg-red-400'
                    : 'bg-amber-400'
              }`}
              style={{ left: `calc(${needlePct}% - 2px)` }}
            />
          </div>

          {/* Cents readout */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-500">-50¢</span>
            <span
              className={`tabular-nums ${
                tuned
                  ? 'text-green-300'
                  : veryFlat || verySharp
                    ? 'text-red-300'
                    : 'text-amber-300'
              }`}
            >
              {reading.cents > 0 ? '+' : ''}
              {reading.cents.toFixed(1)}¢
            </span>
            <span className="text-zinc-500">+50¢</span>
          </div>

          {/* Frequency readout */}
          <div className="text-[11px] text-zinc-500 text-center tabular-nums">
            {reading.freq.toFixed(2)} Hz
            {standardString ? (
              <span className="ml-2 text-zinc-600">
                · target {standardString.note}
                {standardString.octave}
              </span>
            ) : null}
          </div>

          <div className="text-[11px] text-zinc-500 leading-relaxed pt-2 border-t border-bg-800">
            {tuned
              ? 'In tune!'
              : reading.cents < 0
                ? 'Flat — tighten the string.'
                : 'Sharp — loosen the string.'}
          </div>
        </div>
      )}
    </div>
  );
}
