import { useState } from 'react';
import { engine } from '../audio/engine';
import {
  DOUBLE_DOT_FRETS,
  noteAtFret,
  SINGLE_DOT_FRETS,
} from '../music/fretboard';
import { isInScale, NOTE_NAMES, SCALE_LIST, SCALES } from '../music/scales';

const NUM_FRETS = 15;
const FRET_WIDTH = 56;
const NUT_WIDTH = 14;
const STRING_SPACING = 28;
const TOP_PAD = 20;
const STRINGS = 6;

const SVG_WIDTH = NUT_WIDTH + FRET_WIDTH * NUM_FRETS + 24;
const SVG_HEIGHT = TOP_PAD + STRINGS * STRING_SPACING + 28;

/**
 * Interactive fretboard. Highlights notes in the chosen scale, lets you click
 * any position to play that note through the current signal chain.
 *
 * Strings are drawn high-E (1st) on top, low-E (6th) on bottom — matching
 * guitar tab convention used by Songsterr, Guitar Pro, Fretboard Trainer, etc.
 */
export function FretboardView() {
  const [root, setRoot] = useState('A');
  const [scaleId, setScaleId] = useState('pentatonic-minor');

  const scale = SCALES[scaleId];

  const playNote = (stringIdx: number, fret: number) => {
    const n = noteAtFret(stringIdx, fret);
    engine.playNote(n.noteName);
  };

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-4 space-y-3">
      <div className="flex items-baseline justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xs uppercase tracking-wider text-zinc-400">
            Fretboard
          </h2>
          <label className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">Root</span>
            <select
              value={root}
              onChange={(e) => setRoot(e.target.value)}
              className="bg-bg-800 border border-bg-600 rounded px-2 py-1 text-sm text-zinc-200 font-mono"
            >
              {NOTE_NAMES.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-500">Scale</span>
            <select
              value={scaleId}
              onChange={(e) => setScaleId(e.target.value)}
              className="bg-bg-800 border border-bg-600 rounded px-2 py-1 text-sm text-zinc-200"
            >
              {SCALE_LIST.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="text-[10px] text-zinc-600">
          Click any note to play it through the signal chain
        </div>
      </div>

      {scale ? (
        <p className="text-[11px] text-zinc-500 leading-snug">
          <span className="text-accent-amber font-mono">{root} {scale.label}:</span>{' '}
          {scale.description}
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <svg
          width={SVG_WIDTH}
          height={SVG_HEIGHT}
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="block"
        >
          {/* Fretboard background */}
          <rect
            x={NUT_WIDTH}
            y={TOP_PAD - 6}
            width={FRET_WIDTH * NUM_FRETS}
            height={STRINGS * STRING_SPACING - STRING_SPACING + 12}
            fill="#1a1a20"
            stroke="#2f2f38"
            strokeWidth={1}
          />

          {/* Nut */}
          <rect
            x={NUT_WIDTH - 6}
            y={TOP_PAD - 6}
            width={6}
            height={STRINGS * STRING_SPACING - STRING_SPACING + 12}
            fill="#e5e7eb"
          />

          {/* Fret wires + numbers */}
          {Array.from({ length: NUM_FRETS + 1 }, (_, i) => {
            const x = NUT_WIDTH + i * FRET_WIDTH;
            return (
              <g key={i}>
                {i > 0 ? (
                  <line
                    x1={x}
                    y1={TOP_PAD - 4}
                    x2={x}
                    y2={TOP_PAD + (STRINGS - 1) * STRING_SPACING + 4}
                    stroke="#52525b"
                    strokeWidth={1}
                  />
                ) : null}
                {i > 0 ? (
                  <text
                    x={x - FRET_WIDTH / 2}
                    y={TOP_PAD + STRINGS * STRING_SPACING + 8}
                    fontSize={10}
                    fill="#52525b"
                    textAnchor="middle"
                    fontFamily="monospace"
                  >
                    {i}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Fret dot markers */}
          {SINGLE_DOT_FRETS.filter((f) => f <= NUM_FRETS).map((f) => {
            const x = NUT_WIDTH + (f - 0.5) * FRET_WIDTH;
            const yMid =
              TOP_PAD + ((STRINGS - 1) * STRING_SPACING) / 2;
            return (
              <circle
                key={`d-${f}`}
                cx={x}
                cy={yMid}
                r={4}
                fill="#27272a"
              />
            );
          })}
          {DOUBLE_DOT_FRETS.filter((f) => f <= NUM_FRETS).map((f) => {
            const x = NUT_WIDTH + (f - 0.5) * FRET_WIDTH;
            const y1 = TOP_PAD + 1 * STRING_SPACING;
            const y2 = TOP_PAD + 4 * STRING_SPACING;
            return (
              <g key={`dd-${f}`}>
                <circle cx={x} cy={y1} r={4} fill="#27272a" />
                <circle cx={x} cy={y2} r={4} fill="#27272a" />
              </g>
            );
          })}

          {/* Strings */}
          {Array.from({ length: STRINGS }, (_, sIdx) => {
            const y = TOP_PAD + sIdx * STRING_SPACING;
            const thickness = 0.5 + sIdx * 0.25; // thinner at top (high E), thicker at bottom
            return (
              <line
                key={`s-${sIdx}`}
                x1={NUT_WIDTH - 6}
                y1={y}
                x2={SVG_WIDTH - 6}
                y2={y}
                stroke="#a1a1aa"
                strokeWidth={thickness}
              />
            );
          })}

          {/* String labels at the left */}
          {Array.from({ length: STRINGS }, (_, sIdx) => {
            const y = TOP_PAD + sIdx * STRING_SPACING;
            const open = noteAtFret(sIdx, 0);
            return (
              <text
                key={`sl-${sIdx}`}
                x={4}
                y={y + 3}
                fontSize={9}
                fill="#52525b"
                fontFamily="monospace"
              >
                {open.pitchClass}
              </text>
            );
          })}

          {/* Notes — render only ones in scale */}
          {Array.from({ length: STRINGS }, (_, sIdx) =>
            Array.from({ length: NUM_FRETS + 1 }, (_, fret) => {
              const note = noteAtFret(sIdx, fret);
              const inScale = isInScale(note.pitchClass, root, scaleId);
              if (!inScale) return null;
              const isRoot = note.pitchClass === root;
              const cx =
                fret === 0
                  ? NUT_WIDTH / 2 - 3
                  : NUT_WIDTH + (fret - 0.5) * FRET_WIDTH;
              const cy = TOP_PAD + sIdx * STRING_SPACING;
              return (
                <g
                  key={`n-${sIdx}-${fret}`}
                  onClick={() => playNote(sIdx, fret)}
                  className="cursor-pointer"
                >
                  <circle
                    cx={cx}
                    cy={cy}
                    r={11}
                    fill={isRoot ? '#f59e0b' : '#10b981'}
                    fillOpacity={isRoot ? 1 : 0.85}
                    stroke={isRoot ? '#fbbf24' : '#34d399'}
                    strokeWidth={1.5}
                  />
                  <text
                    x={cx}
                    y={cy + 3}
                    fontSize={10}
                    fill={isRoot ? '#0a0a0c' : '#0a0a0c'}
                    textAnchor="middle"
                    fontFamily="monospace"
                    fontWeight={isRoot ? 700 : 500}
                    pointerEvents="none"
                  >
                    {note.pitchClass}
                  </text>
                </g>
              );
            })
          )}
        </svg>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-zinc-500">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-accent-amber" />
          Root
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
          In scale
        </span>
        <span className="ml-auto text-zinc-600">
          Strings: 1st (high E) on top → 6th (low E) on bottom
        </span>
      </div>
    </div>
  );
}
