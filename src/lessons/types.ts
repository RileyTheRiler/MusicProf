import type { PresetBlock } from '../data/presets';

export interface LessonDemo {
  /** Short label shown on the "Try this" button. */
  label: string;
  /** Optional one-liner describing what the demo shows. */
  description?: string;
  /**
   * The full chain to load. Re-uses the PresetBlock shape from data/presets.
   * If omitted, the demo just plays into whatever chain is loaded.
   */
  chain?: PresetBlock[];
  /** Optional auto-play after loading. */
  play?:
    | { kind: 'chord'; notes: string[]; label?: string }
    | { kind: 'note'; note: string; label?: string };
}

export type LessonBlock =
  | { kind: 'h2'; text: string }
  /**
   * Paragraph. Inline formatting supported in the renderer:
   *   **bold**, *italic*, `code`
   */
  | { kind: 'p'; text: string }
  | {
      kind: 'callout';
      flavor: 'tip' | 'info' | 'warn';
      title?: string;
      text: string;
    }
  | { kind: 'list'; ordered?: boolean; items: string[] }
  | { kind: 'demo'; demo: LessonDemo };

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  estMinutes: number;
  body: LessonBlock[];
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}
