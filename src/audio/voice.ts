import * as Tone from 'tone';

/**
 * A small voice-pool of PluckSynths (Karplus-Strong) so we can render chords
 * without sharing a single mono voice. Karplus-Strong gives a passable plucked
 * string timbre — bright transient + fast decay — that responds well to
 * downstream effects the way a real guitar pickup signal does.
 */
export class GuitarVoice {
  private voices: Tone.PluckSynth[] = [];
  private next = 0;
  private out: Tone.Gain;

  constructor(voiceCount = 8) {
    this.out = new Tone.Gain(1);
    for (let i = 0; i < voiceCount; i++) {
      const v = new Tone.PluckSynth({
        attackNoise: 1,
        dampening: 4000,
        resonance: 0.96,
      });
      v.volume.value = -6;
      v.connect(this.out);
      this.voices.push(v);
    }
  }

  get output(): Tone.Gain {
    return this.out;
  }

  trigger(note: string, dur: Tone.Unit.Time = '4n', time?: number) {
    const v = this.voices[this.next];
    this.next = (this.next + 1) % this.voices.length;
    try {
      v.triggerAttackRelease(note, dur, time);
    } catch (e) {
      // Tone occasionally complains if scheduling races; ignore.
      console.warn('voice trigger failed', e);
    }
  }

  triggerChord(notes: string[], dur: Tone.Unit.Time = '2n', strumMs = 12) {
    const now = Tone.now();
    notes.forEach((note, i) => {
      this.trigger(note, dur, now + (i * strumMs) / 1000);
    });
  }

  setVolumeDb(db: number) {
    this.out.gain.value = Tone.dbToGain(db);
  }

  dispose() {
    this.voices.forEach((v) => v.dispose());
    this.out.dispose();
  }
}
