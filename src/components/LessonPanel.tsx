import type { ChainBlock, EffectDefinition } from '../types';
import { categoryColors, categoryLabels } from '../audio/effects';

interface Props {
  block: ChainBlock | null;
  def: EffectDefinition | null;
}

export function LessonPanel({ block, def }: Props) {
  if (!def) {
    return (
      <div className="bg-bg-900 border border-bg-700 rounded p-5">
        <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
          Welcome to MusicProf
        </h2>
        <p className="text-zinc-300 text-sm leading-relaxed mb-3">
          You're looking at a <strong>signal chain simulator</strong>. The path
          a single guitar note takes runs left-to-right across the top: pickup
          → effect blocks → speakers.
        </p>
        <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside leading-relaxed">
          <li>Press <strong>Power on</strong> to start the audio engine.</li>
          <li>
            Click a chord or note to play your dry guitar tone — watch the
            waveform light up.
          </li>
          <li>
            Click an effect in the palette below to add it to the chain. The
            lesson for that effect appears here.
          </li>
          <li>
            Tweak the knobs while playing. Watch the WET waveform/spectrum
            change vs. the DRY one — that's the effect doing its job.
          </li>
          <li>
            Toggle <strong>Bypass</strong> on a block to A/B compare with and
            without the effect — the strongest way to hear what each one does.
          </li>
        </ol>
        <div className="mt-4 pt-3 border-t border-bg-700 text-xs text-zinc-500 leading-relaxed">
          <strong className="text-zinc-300">A note on order:</strong> the order
          of effects in the chain matters a LOT. Distortion → Reverb sounds
          completely different from Reverb → Distortion (the second one
          distorts the reverb tail, which is rarely what you want). Drag blocks
          left/right to experiment.
        </div>
      </div>
    );
  }

  const color = categoryColors[def.category] ?? 'bg-zinc-700';
  const label = categoryLabels[def.category] ?? def.category;

  return (
    <div className="bg-bg-900 border border-bg-700 rounded p-5 space-y-4">
      <div className="flex items-start gap-3">
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded text-white ${color}`}
        >
          {label}
        </span>
        <div className="flex-1">
          <h2 className="text-lg font-medium text-zinc-100 leading-tight">
            {def.displayName}
          </h2>
          <p className="text-sm text-zinc-400 mt-0.5">
            {def.shortDescription}
          </p>
        </div>
      </div>

      <Section title="TL;DR">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {def.lesson.tldr}
        </p>
      </Section>

      <Section title="What it does">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {def.lesson.whatItDoes}
        </p>
      </Section>

      <Section title="Physics & math">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {def.lesson.physics}
        </p>
      </Section>

      <Section title="What it does to the signal">
        <ul className="space-y-1 text-sm text-zinc-300">
          {def.lesson.signalImpact.map((s, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-accent-amber">•</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="On your Headrush Prime">
        <p className="text-sm text-zinc-300 leading-relaxed">
          {def.lesson.headrushNotes}
        </p>
      </Section>

      {Object.keys(def.lesson.paramTips).length > 0 && (
        <Section title="Knob tips">
          <div className="space-y-2">
            {def.params
              .filter((p) => def.lesson.paramTips[p.id])
              .map((p) => {
                const v = block?.paramValues[p.id] ?? p.default;
                return (
                  <div
                    key={p.id}
                    className="text-sm bg-bg-800 rounded p-2 border border-bg-700"
                  >
                    <div className="flex items-baseline gap-2 mb-1">
                      <span className="font-medium text-zinc-200">{p.label}</span>
                      <span className="text-xs text-zinc-500 font-mono">
                        currently{' '}
                        {Math.abs(v) >= 100
                          ? v.toFixed(0)
                          : Math.abs(v) >= 10
                          ? v.toFixed(1)
                          : v.toFixed(2)}
                        {p.unit ? ` ${p.unit}` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {def.lesson.paramTips[p.id]}
                    </p>
                  </div>
                );
              })}
          </div>
        </Section>
      )}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1.5">
        {title}
      </h3>
      {children}
    </div>
  );
}
