import { useEffect, useRef } from 'react';
import { engine } from '../audio/engine';
import { useAnimationFrame } from '../hooks/useAnimationFrame';

interface Props {
  running: boolean;
}

/**
 * Side-by-side oscilloscope (waveform) and spectrum (FFT) for the dry input
 * vs the post-chain output, drawn into a single canvas.
 *
 *   ┌─────────────────────┬─────────────────────┐
 *   │   DRY waveform      │  WET waveform       │
 *   ├─────────────────────┼─────────────────────┤
 *   │   DRY spectrum      │  WET spectrum       │
 *   └─────────────────────┴─────────────────────┘
 */
export function Visualizer({ running }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const dprRef = useRef(1);

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
  }, []);

  useAnimationFrame(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const W = c.width;
    const H = c.height;
    const halfW = W / 2;
    const halfH = H / 2;

    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, W, H);

    // Grid + dividers
    ctx.strokeStyle = '#1f1f25';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(halfW, 0);
    ctx.lineTo(halfW, H);
    ctx.moveTo(0, halfH);
    ctx.lineTo(W, halfH);
    ctx.stroke();

    if (running) {
      const pre = engine.getPreWaveform();
      const post = engine.getPostWaveform();
      const preFft = engine.getPreFFT();
      const postFft = engine.getPostFFT();

      drawWaveform(ctx, pre, 0, 0, halfW, halfH, '#22d3ee');
      drawWaveform(ctx, post, halfW, 0, halfW, halfH, '#f59e0b');
      drawSpectrum(ctx, preFft, 0, halfH, halfW, halfH, '#22d3ee');
      drawSpectrum(ctx, postFft, halfW, halfH, halfW, halfH, '#f59e0b');
    }

    // Labels
    ctx.fillStyle = '#52525b';
    ctx.font = `${10 * dprRef.current}px ui-monospace, monospace`;
    ctx.textBaseline = 'top';
    ctx.fillText('DRY · waveform', 6 * dprRef.current, 4 * dprRef.current);
    ctx.fillText('WET · waveform', halfW + 6 * dprRef.current, 4 * dprRef.current);
    ctx.fillText('DRY · spectrum', 6 * dprRef.current, halfH + 4 * dprRef.current);
    ctx.fillText('WET · spectrum', halfW + 6 * dprRef.current, halfH + 4 * dprRef.current);
  }, true);

  return (
    <div className="bg-bg-900 border border-bg-700 rounded overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-64 block" />
    </div>
  );
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

  const sampleRate = 44100; // approx; Tone uses the AudioContext's rate
  const nyquist = sampleRate / 2;
  const fmin = 40;
  const fmax = 16000;
  const logMin = Math.log10(fmin);
  const logMax = Math.log10(fmax);

  // Vertical reference lines at musical octaves
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
  // For each output column, find max bin in the corresponding freq band
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
    // dB to height: -100..0 dB -> 0..1
    const dbMin = -90;
    const dbMax = 0;
    const norm = Math.max(0, Math.min(1, (max - dbMin) / (dbMax - dbMin)));
    const barH = norm * (h - 8);
    ctx.fillRect(x, y0 + h - barH, 1, barH);
  }
  ctx.restore();
}
