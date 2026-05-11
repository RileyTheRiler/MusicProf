import { Fragment } from 'react';

/**
 * Render a string with minimal inline markdown:
 *   **bold**    — strong
 *   *italic*    — em
 *   `code`      — inline code
 *
 * Escapes are not supported — this is a teaching app, not a markdown engine.
 */
export function RichText({ text }: { text: string }) {
  return <>{renderInline(text)}</>;
}

function renderInline(text: string): React.ReactNode {
  // Tokenize. We scan left to right matching the earliest of **, *, `.
  const out: React.ReactNode[] = [];
  let rest = text;
  let key = 0;
  while (rest.length) {
    const candidates: { idx: number; len: number; kind: 'b' | 'i' | 'c' }[] = [];
    const bIdx = rest.indexOf('**');
    if (bIdx >= 0) candidates.push({ idx: bIdx, len: 2, kind: 'b' });
    const cIdx = rest.indexOf('`');
    if (cIdx >= 0) candidates.push({ idx: cIdx, len: 1, kind: 'c' });
    // Italic: single * that is NOT part of **
    let iIdx = -1;
    for (let i = 0; i < rest.length; i++) {
      if (rest[i] === '*' && rest[i + 1] !== '*' && rest[i - 1] !== '*') {
        iIdx = i;
        break;
      }
    }
    if (iIdx >= 0) candidates.push({ idx: iIdx, len: 1, kind: 'i' });

    if (candidates.length === 0) {
      out.push(<Fragment key={key++}>{rest}</Fragment>);
      break;
    }
    candidates.sort((a, b) => a.idx - b.idx);
    const c = candidates[0];
    if (c.idx > 0) {
      out.push(<Fragment key={key++}>{rest.slice(0, c.idx)}</Fragment>);
    }
    const closeMarker = c.kind === 'b' ? '**' : c.kind === 'c' ? '`' : '*';
    const start = c.idx + c.len;
    const closeIdx = rest.indexOf(closeMarker, start);
    if (closeIdx < 0) {
      // Unmatched — emit literally
      out.push(<Fragment key={key++}>{rest.slice(c.idx)}</Fragment>);
      break;
    }
    const inner = rest.slice(start, closeIdx);
    if (c.kind === 'b') {
      out.push(
        <strong key={key++} className="text-zinc-100 font-semibold">
          {inner}
        </strong>
      );
    } else if (c.kind === 'c') {
      out.push(
        <code
          key={key++}
          className="text-amber-300 bg-bg-800 px-1 py-0.5 rounded text-[0.85em] font-mono"
        >
          {inner}
        </code>
      );
    } else {
      out.push(
        <em key={key++} className="italic text-zinc-200">
          {inner}
        </em>
      );
    }
    rest = rest.slice(closeIdx + c.len);
  }
  return out;
}
