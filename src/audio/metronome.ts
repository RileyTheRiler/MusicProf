import * as Tone from 'tone';

/**
 * Audible click-track metronome. Uses Tone.Transport for sample-accurate
 * timing — much tighter than setInterval would give. Plays a higher-pitched
 * "accent" click on beat 1 of each bar, lower clicks on the other beats.
 *
 * Time signature affects only how many beats per bar (numerator). The
 * denominator (note value of one beat) stays as quarter notes — that's how
 * most musicians count anyway: "1, 2, 3, 4" not "1, 2, 3, 4, 5, 6, 7, 8"
 * for 6/8.
 */
export class Metronome {
  private synth: Tone.MembraneSynth;
  private loop: Tone.Loop | null = null;
  private isRunning = false;
  private bpm = 120;
  private beatsPerBar = 4;
  private currentBeat = 0;
  private listeners = new Set<() => void>();

  constructor() {
    this.synth = new Tone.MembraneSynth({
      pitchDecay: 0.008,
      octaves: 2,
      envelope: {
        attack: 0.001,
        decay: 0.04,
        sustain: 0,
        release: 0.01,
      },
    }).toDestination();
    this.synth.volume.value = -8;
  }

  start() {
    if (this.isRunning) return;
    Tone.getTransport().bpm.value = this.bpm;
    this.currentBeat = 0;
    this.loop = new Tone.Loop((time) => {
      const isAccent = this.currentBeat % this.beatsPerBar === 0;
      // Accent = higher pitch + slightly louder.
      const note = isAccent ? 'C5' : 'G4';
      this.synth.triggerAttackRelease(note, '64n', time);
      this.currentBeat++;
      // Use Draw to schedule the React-state update on the audio clock.
      Tone.getDraw().schedule(() => this.notify(), time);
    }, '4n').start(0);

    if (Tone.getTransport().state !== 'started') {
      Tone.getTransport().start();
    }
    this.isRunning = true;
    this.notify();
  }

  stop() {
    if (this.loop) {
      this.loop.stop();
      this.loop.dispose();
      this.loop = null;
    }
    this.isRunning = false;
    this.currentBeat = 0;
    this.notify();
  }

  toggle() {
    if (this.isRunning) this.stop();
    else this.start();
  }

  setBpm(bpm: number) {
    this.bpm = bpm;
    Tone.getTransport().bpm.value = bpm;
  }

  setBeatsPerBar(n: number) {
    this.beatsPerBar = Math.max(1, Math.min(12, Math.round(n)));
    if (this.currentBeat >= this.beatsPerBar) {
      this.currentBeat = 0;
    }
    this.notify();
  }

  setVolumeDb(db: number) {
    this.synth.volume.value = db;
    this.notify();
  }

  isOn(): boolean {
    return this.isRunning;
  }
  getBeatsPerBar(): number {
    return this.beatsPerBar;
  }
  getCurrentBeat(): number {
    // Beat counter starts at 0; for display return 0..beatsPerBar-1.
    if (!this.isRunning) return -1;
    // currentBeat is incremented AFTER scheduling — display the most recent
    // beat (currentBeat - 1 mod beatsPerBar).
    const last = (this.currentBeat - 1 + this.beatsPerBar * 2) % this.beatsPerBar;
    return last;
  }
  getVolumeDb(): number {
    return this.synth.volume.value;
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
    this.stop();
    this.synth.dispose();
  }
}
