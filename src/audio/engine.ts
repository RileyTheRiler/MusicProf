import * as Tone from 'tone';
import type { ChainBlock, EffectInstance } from '../types';
import { effectDefinitions } from './effects';
import { GuitarVoice } from './voice';

export type SourceKind = 'synth' | 'live';

/**
 * Singleton audio engine. Lazy-init on first user gesture (browser autoplay
 * policies require it). Maintains a serial signal chain:
 *
 *   [GuitarVoice or live mic] → preChainTap → [block1] → [block2] → ... → postChainTap → master → speakers
 *
 * Both taps feed Tone.Analyser nodes so the UI can show the dry vs wet
 * waveforms / spectra.
 */
class AudioEngine {
  private started = false;

  private voice: GuitarVoice | null = null;
  private liveInput: Tone.UserMedia | null = null;
  private inputGain: Tone.Gain | null = null;
  private master: Tone.Gain | null = null;
  private chainHead: Tone.Gain | null = null;
  private chainTail: Tone.Gain | null = null;
  private preTap: Tone.Gain | null = null;
  private postTap: Tone.Gain | null = null;

  private preWave: Tone.Analyser | null = null;
  private postWave: Tone.Analyser | null = null;
  private preFFT: Tone.Analyser | null = null;
  private postFFT: Tone.Analyser | null = null;

  // Analyzers that tap the input and output of the user-selected block.
  // The same physical nodes are re-routed when selection changes — they're
  // additional destinations of the block's input/output, so they don't
  // disturb the main signal path.
  private selInWave: Tone.Analyser | null = null;
  private selOutWave: Tone.Analyser | null = null;
  private selInFFT: Tone.Analyser | null = null;
  private selOutFFT: Tone.Analyser | null = null;
  private selBlockId: string | null = null;

  private blocks: ChainBlock[] = [];
  private instances: Map<string, EffectInstance> = new Map();
  private source: SourceKind = 'synth';
  private liveDeviceId: string | null = null;

  private listeners = new Set<() => void>();

  /** Browser audio context state — useful for showing "click to start". */
  isStarted() {
    return this.started;
  }
  getSource(): SourceKind {
    return this.source;
  }
  getLiveDeviceId(): string | null {
    return this.liveDeviceId;
  }

  async start() {
    if (this.started) return;
    await Tone.start();

    this.voice = new GuitarVoice(8);
    this.master = new Tone.Gain(0.85);

    // inputGain sits BETWEEN the source (synth/live) and preTap. Lets the user
    // trim a hot or quiet input source independent of master volume.
    this.inputGain = new Tone.Gain(1);
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

    this.selInWave = new Tone.Analyser('waveform', 1024);
    this.selOutWave = new Tone.Analyser('waveform', 1024);
    this.selInFFT = new Tone.Analyser('fft', 1024);
    this.selOutFFT = new Tone.Analyser('fft', 1024);
    this.selInFFT.smoothing = 0.6;
    this.selOutFFT.smoothing = 0.6;

    // Default source is the synth voice.
    this.voice.output.connect(this.inputGain);
    this.inputGain.connect(this.preTap);
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

  /**
   * Switch the input source from the synth voice to the user's microphone /
   * audio interface. Requires user permission via getUserMedia. Throws if
   * the user denies or no input is available.
   */
  async useLiveInput(deviceId?: string): Promise<void> {
    if (!this.started) await this.start();
    if (!this.inputGain || !this.voice) return;

    // Disconnect the synth from the input chain so we don't double-up.
    this.voice.output.disconnect();

    // Close any existing live device first (e.g., switching devices).
    if (this.liveInput) {
      this.liveInput.close();
      this.liveInput.dispose();
      this.liveInput = null;
    }

    this.liveInput = new Tone.UserMedia();
    try {
      await this.liveInput.open(deviceId);
    } catch (e) {
      // Permission denied or no device — revert to synth source.
      this.liveInput.dispose();
      this.liveInput = null;
      this.voice.output.connect(this.inputGain);
      this.source = 'synth';
      this.notify();
      throw e;
    }
    this.liveInput.connect(this.inputGain);
    this.source = 'live';
    this.liveDeviceId = this.liveInput.deviceId ?? null;
    this.notify();
  }

  /** Switch back to the synthesized guitar voice (close live mic). */
  useSynthInput(): void {
    if (!this.inputGain || !this.voice) return;
    if (this.liveInput) {
      this.liveInput.close();
      this.liveInput.disconnect();
      this.liveInput.dispose();
      this.liveInput = null;
    }
    this.voice.output.disconnect();
    this.voice.output.connect(this.inputGain);
    this.source = 'synth';
    this.liveDeviceId = null;
    this.notify();
  }

  setInputGainDb(db: number): void {
    if (this.inputGain) this.inputGain.gain.value = Tone.dbToGain(db);
  }

  /**
   * Enumerate available audio input devices. Note: device labels are only
   * populated after the user has granted microphone permission at least once.
   */
  static async enumerateInputs(): Promise<MediaDeviceInfo[]> {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices) return [];
    return Tone.UserMedia.enumerateDevices();
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

  /** Returns the waveform AT THE INPUT of the currently-selected block. */
  getSelectedInWaveform(): Float32Array | null {
    return (this.selInWave?.getValue() as Float32Array) ?? null;
  }
  /** Returns the waveform AT THE OUTPUT of the currently-selected block. */
  getSelectedOutWaveform(): Float32Array | null {
    return (this.selOutWave?.getValue() as Float32Array) ?? null;
  }
  getSelectedInFFT(): Float32Array | null {
    return (this.selInFFT?.getValue() as Float32Array) ?? null;
  }
  getSelectedOutFFT(): Float32Array | null {
    return (this.selOutFFT?.getValue() as Float32Array) ?? null;
  }

  /**
   * Re-route the per-block analyzers to tap the input and output of the
   * given block. Pass null to detach (in which case the per-block view will
   * just show zeros).
   *
   * Connect/disconnect operates by specific destination — Web Audio nodes can
   * fan out to multiple destinations, so adding an analyzer tap does NOT
   * affect the main signal path.
   */
  setSelectedBlock(blockId: string | null) {
    this.selBlockId = blockId;
    this.applySelectedTaps();
    this.notify();
  }

  getSelectedBlockId(): string | null {
    return this.selBlockId;
  }

  /** Stored separately from rewire() so we can reuse it after rewire() too. */
  private applySelectedTaps() {
    if (
      !this.selInWave ||
      !this.selOutWave ||
      !this.selInFFT ||
      !this.selOutFFT
    )
      return;

    // Disconnect from everything first. disconnect() with no args removes the
    // analyzer's *outgoing* connections — analyzers don't connect outward
    // (they're terminal nodes), so this is a no-op for them. To clear
    // INCOMING connections (which is what we have), we need the source side
    // to call disconnect(destination). Since we don't know the previous
    // source, we instead use a defensive approach: walk every effect
    // instance's input/output and disconnect our analyzers from each. Any
    // that weren't connected are silently no-ops.
    for (const inst of this.instances.values()) {
      try {
        inst.input.disconnect(this.selInWave);
      } catch {/* not connected */}
      try {
        inst.input.disconnect(this.selInFFT);
      } catch {/* not connected */}
      try {
        inst.output.disconnect(this.selOutWave);
      } catch {/* not connected */}
      try {
        inst.output.disconnect(this.selOutFFT);
      } catch {/* not connected */}
    }

    if (!this.selBlockId) return;
    const inst = this.instances.get(this.selBlockId);
    if (!inst) return;

    inst.input.connect(this.selInWave);
    inst.input.connect(this.selInFFT);
    inst.output.connect(this.selOutWave);
    inst.output.connect(this.selOutFFT);
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

    // The instances map may have been refreshed; re-apply the per-block taps
    // so the analyzers stay attached to the right instance.
    this.applySelectedTaps();
  }
}

export const engine = new AudioEngine();

/** Module-level convenience: list available audio input devices. */
export const enumerateAudioInputs = (): Promise<MediaDeviceInfo[]> =>
  AudioEngine.enumerateInputs();
