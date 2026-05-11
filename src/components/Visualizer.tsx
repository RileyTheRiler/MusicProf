import { useEffect, useRef } from 'react';
import { engine } from '../audio/engine';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

interface Props {
  running: boolean;
  /**
   * If provided, draw a SECOND panel showing the signal at the input and
   * output of the named block, along with its display label. Pass null to
   * only show the whole-chain DRY vs WET view.
   */
  selectedBlockLabel: string | null;
}

/**
 * Two stacked panels:
 *
 *   ┌──────────────────────────────────────────┐
 *   │ DRY waveform  │  WET waveform            │
 *   │ DRY spectrum  │  WET spectrum            │  whole chain
 *   ├───────────────┼──────────────────────────┤
 *   │ block IN wf   │  block OUT wf            │
 *   │ block IN sp   │  block OUT sp            │  selected block (optional)
 *   └──────────────────────────────────────────┘
 */
export function Visualizer({ running, selectedBlockLabel }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dprRef = useRef(1);
  const showBlock = !!selectedBlockLabel;

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    dprRef.current = dpr;
    const resize = () => {
      const rect = c.getBoundingClientRect();
      c.width = Math.floor(rect.width * dpr);
      c.height = Math.floor(rect.height * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    return () => ro.disconnect();
  }, [showBlock]);

  useAnimationFrame(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.width;
    const H = c.height;
    const halfW = W / 2;
    const dpr = dprRef.current;

    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, W, H);

    if (showBlock) {
      // Top half: whole-chain. Bottom half: selected block.
      drawChainPanel(ctx, 0, 0, W, H / 2, dpr, running);
      // Divider between panels
      ctx.strokeStyle = '#2a2a32';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      drawBlockPanel(ctx, 0, H / 2, W, H / 2, dpr, running, selectedBlockLabel!);
    } else {
      drawChainPanel(ctx, 0, 0, W, H, dpr, running);
    }

    // Center vertical divider (between left/right halves)
    ctx.strokeStyle = '#1f1f25';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, H);
    ctx.stroke();
  }, true);

  return (
    <div className="bg-bg-900 border border-bg-700 rounded overflow-hidden">
      <canvas
        ref={canvasRef}
        className={`w-full block ${showBlock ? 'h-[28rem]' : 'h-64'}`}
      />
    </div>
  );
}

function drawChainPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  dpr: number,
  running: boolean
) {
  const halfW = w / 2;
  const halfH = h / 2;

  // Horizontal divider
  ctx.strokeStyle = '#1f1f25';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + halfH);
  ctx.lineTo(x + w, y + halfH);
  ctx.stroke();

  if (running) {
    drawWaveform(ctx, engine.getPreWaveform(), x, y, halfW, halfH, '#22d3ee');
    drawWaveform(
      ctx,
      engine.getPostWaveform(),
      x + halfW,
      y,
      halfW,
      halfH,
      '#f59e0b'
    );
    drawSpectrum(
      ctx,
      engine.getPreFFT(),
      x,
      y + halfH,
      halfW,
      halfH,
      '#22d3ee'
    );
    drawSpectrum(
      ctx,
      engine.getPostFFT(),
      x + halfW,
      y + halfH,
      halfW,
      halfH,
      '#f59e0b'
    );
  }

  ctx.fillStyle = '#52525b';
  ctx.font = `${10 * dpr}px ui-monospace, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillText('DRY (chain in) · wf', x + 6 * dpr, y + 4 * dpr);
  ctx.fillText('WET (chain out) · wf', x + halfW + 6 * dpr, y + 4 * dpr);
  ctx.fillText('DRY · spectrum', x + 6 * dpr, y + halfH + 4 * dpr);
  ctx.fillText('WET · spectrum', x + halfW + 6 * dpr, y + halfH + 4 * dpr);
}

function drawBlockPanel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  dpr: number,
  running: boolean,
  label: string
) {
  const halfW = w / 2;
  const halfH = h / 2;

  ctx.strokeStyle = '#1f1f25';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, y + halfH);
  ctx.lineTo(x + w, y + halfH);
  ctx.stroke();

  if (running) {
    drawWaveform(
      ctx,
      engine.getSelectedInWaveform(),
      x,
      y,
      halfW,
      halfH,
      '#a78bfa'
    );
    drawWaveform(
      ctx,
      engine.getSelectedOutWaveform(),
      x + halfW,
      y,
      halfW,
      halfH,
      '#10b981'
    );
    drawSpectrum(
      ctx,
      engine.getSelectedInFFT(),
      x,
      y + halfH,
      halfW,
      halfH,
      '#a78bfa'
    );
    drawSpectrum(
      ctx,
      engine.getSelectedOutFFT(),
      x + halfW,
      y + halfH,
      halfW,
      halfH,
      '#10b981'
    );
  }

  ctx.fillStyle = '#52525b';
  ctx.font = `${10 * dpr}px ui-monospace, monospace`;
  ctx.textBaseline = 'top';
  ctx.fillText(`${label} INPUT · wf`, x + 6 * dpr, y + 4 * dpr);
  ctx.fillText(`${label} OUTPUT · wf`, x + halfW + 6 * dpr, y + 4 * dpr);
  ctx.fillText('INPUT · spectrum', x + 6 * dpr, y + halfH + 4 * dpr);
  ctx.fillText('OUTPUT · spectrum', x + halfW + 6 * dpr, y + halfH + 4 * dpr);
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  data: Float32Array | null,
  x0: number,
  y0: number,
  w: number,
  h: number,
  color: string
) {
  if (!data) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, w, h);
  ctx.clip();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const mid = y0 + h / 2;
  for (let i = 0; i < data.length; i++) {
    const x = x0 + (i / (data.length - 1)) * w;
    const v = Math.max(-1, Math.min(1, data[i]));
    const y = mid - v * (h / 2 - 4);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.restore();
}

function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  data: Float32Array | null,
  x0: number,
  y0: number,
  w: number,
  h: number,
  color: string
) {
  if (!data) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, w, h);
  ctx.clip();

  const sampleRate = 44100;
  const nyquist = sampleRate / 2;
  const fmin = 40;
  const fmax = 16000;
  const logMin = Math.log10(fmin);
  const logMax = Math.log10(fmax);

  ctx.strokeStyle = '#1f1f25';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (const f of [100, 1000, 10000]) {
    const xn = (Math.log10(f) - logMin) / (logMax - logMin);
    const x = x0 + xn * w;
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y0 + h);
  }
  ctx.stroke();

  ctx.fillStyle = color;
  const binCount = data.length;
  const cols = Math.floor(w);
  for (let col = 0; col < cols; col++) {
    const x = x0 + col;
    const xn = col / cols;
    const freqLow = Math.pow(10, logMin + xn * (logMax - logMin));
    const freqHigh = Math.pow(
      10,
      logMin + ((col + 1) / cols) * (logMax - logMin)
    );
    const binLow = Math.max(0, Math.floor((freqLow / nyquist) * binCount));
    const binHigh = Math.min(
      binCount - 1,
      Math.max(binLow, Math.ceil((freqHigh / nyquist) * binCount))
    );
    let max = -200;
    for (let b = binLow; b <= binHigh; b++) {
      if (data[b] > max) max = data[b];
    }
    const dbMin = -90;
    const dbMax = 0;
    const norm = Math.max(0, Math.min(1, (max - dbMin) / (dbMax - dbMin)));
    const barH = norm * (h - 8);
    ctx.fillRect(x, y0 + h - barH, 1, barH);
  }
  ctx.restore();
}
