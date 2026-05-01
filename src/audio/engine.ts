import * as Tone from 'tone';
import type { ChainBlock, EffectInstance } from '../types';
import { effectDefinitions } from './effects';
import { GuitarVoice } from './voice';

/**
 * Singleton audio engine. Lazy-init on first user gesture (browser autoplay
 * policies require it). Maintains a serial signal chain:
 *
 *   GuitarVoice → preChainTap → [block1] → [block2] → ... → postChainTap → master → speakers
 *
 * Both taps feed Tone.Analyser nodes so the UI can show the dry vs wet
 * waveforms / spectra.
 */
class AudioEngine {
  private started = false;

  private voice: GuitarVoice | null = null;
  private master: Tone.Gain | null = null;
  private chainHead: Tone.Gain | null = null;
  private chainTail: Tone.Gain | null = null;
  private preTap: Tone.Gain | null = null;
  private postTap: Tone.Gain | null = null;

  private preWave: Tone.Analyser | null = null;
  private postWave: Tone.Analyser | null = null;
  private preFFT: Tone.Analyser | null = null;
  private postFFT: Tone.Analyser | null = null;

  private blocks: ChainBlock[] = [];
  private instances: Map<string, EffectInstance> = new Map();

  private listeners = new Set<() => void>();

  /** Browser audio context state — useful for showing "click to start". */
  isStarted() {
    return this.started;
  }

  async start() {
    if (this.started) return;
    await Tone.start();

    this.voice = new GuitarVoice(8);
    this.master = new Tone.Gain(0.85);

    this.preTap = new Tone.Gain(1);
    this.postTap = new Tone.Gain(1);
    this.chainHead = new Tone.Gain(1);
    this.chainTail = new Tone.Gain(1);

    this.preWave = new Tone.Analyser('waveform', 1024);
    this.postWave = new Tone.Analyser('waveform', 1024);
    this.preFFT = new Tone.Analyser('fft', 1024);
    this.postFFT = new Tone.Analyser('fft', 1024);
    this.preFFT.smoothing = 0.6;
    this.postFFT.smoothing = 0.6;

    // voice -> preTap -> (analysers) -> chainHead
    this.voice.output.connect(this.preTap);
    this.preTap.connect(this.preWave);
    this.preTap.connect(this.preFFT);
    this.preTap.connect(this.chainHead);

    // chainTail -> postTap -> (analysers) -> master -> destination
    this.chainTail.connect(this.postTap);
    this.postTap.connect(this.postWave);
    this.postTap.connect(this.postFFT);
    this.postTap.connect(this.master);
    this.master.toDestination();

    this.started = true;
    this.rewire();
    this.notify();
  }

  /** Subscribe to state changes (chain rewiring, etc.). */
  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private notify() {
    this.listeners.forEach((fn) => fn());
  }

  /** Replace the entire chain definition. Adds/removes/disposes instances and re-wires. */
  setChain(chain: ChainBlock[]) {
    this.blocks = chain.map((b) => ({ ...b, paramValues: { ...b.paramValues } }));
    if (!this.started) {
      this.notify();
      return;
    }
    this.rewire();
    this.notify();
  }

  getChain(): ChainBlock[] {
    return this.blocks;
  }

  setParam(blockId: string, paramId: string, value: number) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (block) block.paramValues[paramId] = value;

    const inst = this.instances.get(blockId);
    if (inst) inst.setParam(paramId, value);
    this.notify();
  }

  setBypass(blockId: string, bypass: boolean) {
    const block = this.blocks.find((b) => b.id === blockId);
    if (block) block.bypass = bypass;

    const inst = this.instances.get(blockId);
    if (inst) inst.setBypass(bypass);
    this.notify();
  }

  setMasterVolume(db: number) {
    if (this.master) this.master.gain.value = Tone.dbToGain(db);
  }

  playNote(note: string, duration: Tone.Unit.Time = '4n') {
    if (!this.started || !this.voice) return;
    this.voice.trigger(note, duration);
  }

  playChord(notes: string[], duration: Tone.Unit.Time = '2n') {
    if (!this.started || !this.voice) return;
    this.voice.triggerChord(notes, duration);
  }

  getPreWaveform(): Float32Array | null {
    return (this.preWave?.getValue() as Float32Array) ?? null;
  }
  getPostWaveform(): Float32Array | null {
    return (this.postWave?.getValue() as Float32Array) ?? null;
  }
  getPreFFT(): Float32Array | null {
    return (this.preFFT?.getValue() as Float32Array) ?? null;
  }
  getPostFFT(): Float32Array | null {
    return (this.postFFT?.getValue() as Float32Array) ?? null;
  }

  /**
   * Rebuild the audio graph: input -> [block.input -> block.output]* -> output.
   * Spawns new effect instances for new blocks; reuses existing ones; disposes
   * removed ones.
   */
  private rewire() {
    if (!this.started) return;

    const seen = new Set<string>();

    // Tear down only the EXTERNAL wires between blocks. Don't touch
    // inst.input.disconnect() — that would also kill the effect's internal
    // wiring (input -> ... -> output). The wires we set up externally are:
    //   chainHead -> block[0].input
    //   block[i].output -> block[i+1].input  (or chainTail)
    this.chainHead!.disconnect();
    for (const inst of this.instances.values()) {
      inst.output.disconnect();
    }

    // Make sure each block has an instance (and apply current param values)
    for (const block of this.blocks) {
      seen.add(block.id);
      const def = effectDefinitions[block.defId];
      if (!def || !def.implemented || !def.create) continue;

      let inst = this.instances.get(block.id);
      if (!inst) {
        inst = def.create();
        this.instances.set(block.id, inst);
      }
      // Apply params
      for (const p of def.params) {
        const v = block.paramValues[p.id] ?? p.default;
        inst.setParam(p.id, v);
      }
      inst.setBypass(block.bypass);
    }

    // Dispose orphan instances
    for (const [id, inst] of this.instances) {
      if (!seen.has(id)) {
        inst.dispose();
        this.instances.delete(id);
      }
    }

    // Wire: chainHead -> block1.in -> block1.out -> block2.in -> ... -> chainTail
    let prev: Tone.ToneAudioNode = this.chainHead!;
    for (const block of this.blocks) {
      const def = effectDefinitions[block.defId];
      const inst = this.instances.get(block.id);
      if (!def || !def.implemented || !inst) continue;
      prev.connect(inst.input);
      prev = inst.output;
    }
    prev.connect(this.chainTail!);
  }
}

export const engine = new AudioEngine();
