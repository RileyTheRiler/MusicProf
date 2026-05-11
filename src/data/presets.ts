/**
 * Curated preset chains. Each one is a "complete tone" — a real-world
 * combination of blocks and settings — designed to teach how blocks combine.
 *
 * Loading a preset replaces the current chain in its entirety.
 */

export interface PresetBlock {
  defId: string;
  bypass: boolean;
  paramValues: Record<string, number>;
}

export interface Preset {
  id: string;
  name: string;
  description: string;
  use: string;
  /** Order matters — first block is closest to the guitar. */
  blocks: PresetBlock[];
}

export const PRESETS: Preset[] = [
  {
    id: 'pristine-clean',
    name: 'Pristine Clean',
    description:
      'Light comp tightens dynamics, Fender Twin gives sparkle and headroom, light hall reverb adds dimension.',
    use: 'Chord work, country, fingerstyle, surf, clean rhythm.',
    blocks: [
      {
        defId: 'comp-studio',
        bypass: false,
        paramValues: {
          threshold: -28,
          ratio: 3,
          attack: 0.005,
          release: 0.18,
          makeup: 4,
        },
      },
      {
        defId: 'amp-fender-clean',
        bypass: false,
        paramValues: {
          gain: 3.5,
          bass: 3,
          mid: 1,
          treble: 4,
          presence: 2,
          sag: 2,
          volume: 0,
        },
      },
      {
        defId: 'cab-4x12',
        bypass: false,
        paramValues: {
          lowCut: 80,
          highCut: 6500,
          resonance: 3,
          character: 2400,
        },
      },
      {
        defId: 'reverb-hall',
        bypass: false,
        paramValues: { size: 0.45, dampening: 7000, preDelay: 25, mix: 0.22 },
      },
    ],
  },
  {
    id: 'blues-crunch',
    name: 'Blues Crunch',
    description:
      'Marshall Plexi on the edge of breakup — picks dynamically respond to your attack. No drive pedal needed.',
    use: 'SRV, Hendrix-style blues, classic blues rock.',
    blocks: [
      {
        defId: 'amp-marshall-crunch',
        bypass: false,
        paramValues: {
          gain: 4.5,
          bass: -1,
          mid: 3,
          treble: 4,
          presence: 3,
          sag: 5,
          volume: 0,
        },
      },
      {
        defId: 'cab-4x12',
        bypass: false,
        paramValues: {
          lowCut: 90,
          highCut: 5500,
          resonance: 5,
          character: 2300,
        },
      },
      {
        defId: 'reverb-hall',
        bypass: false,
        paramValues: { size: 0.35, dampening: 5500, preDelay: 15, mix: 0.18 },
      },
    ],
  },
  {
    id: 'classic-rock-lead',
    name: 'Classic Rock Lead',
    description:
      'Tube Screamer in front of a Marshall pushes the front end harder for a singing solo tone, then delay + reverb to round it out.',
    use: 'AC/DC, Zeppelin, Van Halen-style classic rock leads.',
    blocks: [
      {
        defId: 'overdrive',
        bypass: false,
        paramValues: { drive: 0.25, tone: 3000, level: 3, mix: 1 },
      },
      {
        defId: 'amp-marshall-crunch',
        bypass: false,
        paramValues: {
          gain: 6.5,
          bass: -2,
          mid: 4,
          treble: 5,
          presence: 4,
          sag: 4,
          volume: 0,
        },
      },
      {
        defId: 'cab-4x12',
        bypass: false,
        paramValues: {
          lowCut: 100,
          highCut: 5200,
          resonance: 5,
          character: 2400,
        },
      },
      {
        defId: 'delay-analog',
        bypass: false,
        paramValues: { time: 380, feedback: 0.32, tone: 4000, mix: 0.22 },
      },
      {
        defId: 'reverb-hall',
        bypass: false,
        paramValues: { size: 0.5, dampening: 5500, preDelay: 30, mix: 0.25 },
      },
    ],
  },
  {
    id: 'modern-metal',
    name: 'Modern Metal',
    description:
      'Mesa Rectifier-style with cut bass and scooped mids, tight cab, light reverb. Classic chuggy metal voicing.',
    use: 'Metallica, Pantera, modern metalcore rhythm.',
    blocks: [
      {
        defId: 'comp-studio',
        bypass: true,
        paramValues: {
          threshold: -20,
          ratio: 2,
          attack: 0.005,
          release: 0.15,
          makeup: 3,
        },
      },
      {
        defId: 'overdrive',
        bypass: false,
        paramValues: { drive: 0.2, tone: 2800, level: 5, mix: 1 },
      },
      {
        defId: 'amp-mesa-higain',
        bypass: false,
        paramValues: {
          gain: 6.5,
          bass: -4,
          mid: -3,
          treble: 4,
          presence: 3,
          sag: 2,
          volume: 0,
        },
      },
      {
        defId: 'eq-3band',
        bypass: false,
        paramValues: { low: -2, midGain: -2, midFreq: 500, high: 1 },
      },
      {
        defId: 'cab-v30',
        bypass: false,
        paramValues: { lowCut: 110, highCut: 4800, air: -1, mix: 1 },
      },
      {
        defId: 'reverb-hall',
        bypass: false,
        paramValues: { size: 0.3, dampening: 4500, preDelay: 10, mix: 0.12 },
      },
    ],
  },
  {
    id: 'ambient-lead',
    name: 'Ambient Lead',
    description:
      'Vox AC30 jangle into long delay and big shimmery reverb. The Edge / Pink Floyd / Sigur Rós territory.',
    use: 'Ambient, post-rock, ethereal leads, soundscapes.',
    blocks: [
      {
        defId: 'comp-studio',
        bypass: false,
        paramValues: {
          threshold: -24,
          ratio: 4,
          attack: 0.005,
          release: 0.3,
          makeup: 5,
        },
      },
      {
        defId: 'amp-vox-chime',
        bypass: false,
        paramValues: {
          gain: 4,
          bass: 4,
          mid: 1,
          treble: 5,
          presence: 3,
          sag: 5,
          volume: 0,
        },
      },
      {
        defId: 'cab-blue',
        bypass: false,
        paramValues: { lowCut: 90, highCut: 8000, air: 2, mix: 1 },
      },
      {
        defId: 'mod-chorus',
        bypass: false,
        paramValues: { rate: 0.5, depth: 0.4, spread: 150, mix: 0.35 },
      },
      {
        defId: 'delay-analog',
        bypass: false,
        paramValues: { time: 480, feedback: 0.55, tone: 5500, mix: 0.4 },
      },
      {
        defId: 'reverb-hall',
        bypass: false,
        paramValues: { size: 0.85, dampening: 8000, preDelay: 50, mix: 0.55 },
      },
    ],
  },
  {
    id: 'funk-clean',
    name: 'Funk Clean',
    description:
      'Heavy compression squashes the picking attack flat, slow chorus thickens the chord stabs, slight EQ scoop for that "vocal" quack.',
    use: 'Chicken pickin\', funk rhythm, percussive 16th-note strumming.',
    blocks: [
      {
        defId: 'comp-studio',
        bypass: false,
        paramValues: {
          threshold: -32,
          ratio: 6,
          attack: 0.025,
          release: 0.12,
          makeup: 8,
        },
      },
      {
        defId: 'amp-fender-clean',
        bypass: false,
        paramValues: {
          gain: 3,
          bass: 1,
          mid: -2,
          treble: 5,
          presence: 4,
          sag: 1,
          volume: 0,
        },
      },
      {
        defId: 'eq-3band',
        bypass: false,
        paramValues: { low: 0, midGain: -3, midFreq: 600, high: 2 },
      },
      {
        defId: 'cab-4x12',
        bypass: false,
        paramValues: {
          lowCut: 90,
          highCut: 6500,
          resonance: 4,
          character: 2700,
        },
      },
      {
        defId: 'mod-chorus',
        bypass: false,
        paramValues: { rate: 0.4, depth: 0.25, spread: 100, mix: 0.25 },
      },
    ],
  },
];
