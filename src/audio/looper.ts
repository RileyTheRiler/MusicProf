import * as Tone from 'tone';

export type LooperState =
  | 'off' // No loop, not recording
  | 'recording' // Capturing samples into the buffer
  | 'playing' // Loop buffer is playing back
  | 'paused'; // Loop exists but playback is paused

/**
 * Real-time looper. Captures audio from `input` while recording, plays it
 * back through `output` while playing. Mono Float32 buffer, ~60 seconds max.
 *
 * Uses a deprecated ScriptProcessorNode for sample capture because Tone.js
 * doesn't ship a raw-sample tap and AudioWorklet would require shipping a
 * worklet processor file. ScriptProcessor is "deprecated" in spec but works
 * identically in all current browsers; performance is acceptable for a
 * single-band, ~10ms-buffer use case.
 */
export class Looper {
  readonly input: Tone.Gain;
  readonly output: Tone.Gain;

  private buffer: Float32Array;
  private bufferLength: number;
  /** How many samples of the buffer are actually filled with audio. */
  private loopLength = 0;
  private writePos = 0;
  private readPos = 0;
  private state: LooperState = 'off';
  private scriptProc: ScriptProcessorNode | null = null;
  private sampleRate: number;
  private listeners = new Set<() => void>();

  constructor() {
    this.input = new Tone.Gain(1);
    this.output = new Tone.Gain(0.8);
    this.sampleRate = Tone.getContext().sampleRate;
    this.bufferLength = Math.floor(this.sampleRate * 60); // 60-second max
    this.buffer = new Float32Array(this.bufferLength);
  }

  /**
   * Must be called AFTER the audio context is started — creates the
   * ScriptProcessor and wires it between input and output.
   */
  init() {
    if (this.scriptProc) return;
    const ctx = Tone.getContext().rawContext as AudioContext;
    // Buffer size 4096 = ~85ms at 48kHz. Larger = less CPU churn but more
    // latency between record-start and the first captured sample.
    this.scriptProc = ctx.createScriptProcessor(4096, 1, 1);
    this.scriptProc.onaudioprocess = (e) => this.process(e);
    // Connect: input → scriptProc → output
    // Tone.Gain.input / .output are GainNodes that ScriptProcessor can
    // connect to directly.
    (this.input.output as AudioNode).connect(this.scriptProc);
    this.scriptProc.connect(this.output.input as AudioNode);
  }

  private process(e: AudioProcessingEvent) {
    const inBuf = e.inputBuffer.getChannelData(0);
    const outBuf = e.outputBuffer.getChannelData(0);
    const len = inBuf.length;

    if (this.state === 'recording') {
      // Capture incoming samples; silence output while recording so the user
      // isn't doubled with their own playback (would echo / feedback).
      for (let i = 0; i < len; i++) {
        if (this.writePos < this.bufferLength) {
          this.buffer[this.writePos++] = inBuf[i];
        }
      }
      this.loopLength = this.writePos;
      outBuf.fill(0);
    } else if (this.state === 'playing' && this.loopLength > 0) {
      for (let i = 0; i < len; i++) {
        outBuf[i] = this.buffer[this.readPos];
        this.readPos++;
        if (this.readPos >= this.loopLength) this.readPos = 0;
      }
    } else {
      outBuf.fill(0);
    }
  }

  startRecord() {
    this.state = 'recording';
    this.writePos = 0;
    this.loopLength = 0;
    this.readPos = 0;
    this.notify();
  }

  /** Stop recording and begin playback in one action. */
  stopRecordAndPlay() {
    if (this.state !== 'recording') return;
    if (this.loopLength > 0) {
      this.readPos = 0;
      this.state = 'playing';
    } else {
      this.state = 'off';
    }
    this.notify();
  }

  /** Pause playback (loop preserved). Resumable via play(). */
  pause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      this.notify();
    }
  }

  play() {
    if (this.loopLength > 0 && this.state !== 'recording') {
      this.state = 'playing';
      this.notify();
    }
  }

  togglePlay() {
    if (this.state === 'playing') this.pause();
    else this.play();
  }

  clear() {
    this.state = 'off';
    this.loopLength = 0;
    this.writePos = 0;
    this.readPos = 0;
    this.notify();
  }

  /** Linear (not dB) — 0..1 typical. */
  setLoopVolume(linear: number) {
    this.output.gain.value = Math.max(0, Math.min(2, linear));
  }
  getLoopVolume(): number {
    return this.output.gain.value;
  }

  getState(): LooperState {
    return this.state;
  }

  /** Length of the recorded loop in seconds. 0 if no loop. */
  getLoopLengthSec(): number {
    return this.loopLength / this.sampleRate;
  }

  /** Current playback or record position as a fraction 0..1. */
  getProgress(): number {
    if (this.state === 'recording') {
      // While recording, "progress" is buffer-full meter.
      return this.writePos / this.bufferLength;
    }
    if ((this.state === 'playing' || this.state === 'paused') && this.loopLength > 0) {
      return this.readPos / this.loopLength;
    }
    return 0;
  }

  /** Recording fill — useful only while in 'recording' state. 0..1. */
  getRecordFill(): number {
    return this.writePos / this.bufferLength;
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }
  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  dispose() {
    if (this.scriptProc) {
      this.scriptProc.disconnect();
      this.scriptProc.onaudioprocess = null;
      this.scriptProc = null;
    }
    this.input.dispose();
    this.output.dispose();
  }
}
