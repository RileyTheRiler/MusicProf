import { useState } from 'react';
import { CURRICULUM, findLesson, lessonNeighbors } from '../lessons/content';
import type { Lesson, LessonBlock, LessonDemo } from '../lessons/types';
import { RichText } from './RichText';

interface Props {
  /** Called when a "Try this in the Lab" button is clicked. */
  onTryDemo: (demo: LessonDemo) => void;
}

export function Classroom({ onTryDemo }: Props) {
  const [currentId, setCurrentId] = useState<string>(
    CURRICULUM[0].lessons[0].id
  );
  const lesson = findLesson(currentId);
  const { prev, next } = lessonNeighbors(currentId);

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* TOC sidebar */}
      <aside className="col-span-12 lg:col-span-3">
        <div className="bg-bg-900 border border-bg-700 rounded p-4 lg:sticky lg:top-20">
          <h2 className="text-sm uppercase tracking-wider text-zinc-400 mb-3">
            Curriculum
          </h2>
          <div className="space-y-4">
            {CURRICULUM.map((ch) => (
              <div key={ch.id}>
                <div className="text-xs font-medium text-zinc-300 mb-1">
                  {ch.title}
                </div>
                <p className="text-[11px] text-zinc-500 mb-2 leading-snug">
                  {ch.description}
                </p>
                <ul className="space-y-0.5">
                  {ch.lessons.map((l, idx) => (
                    <li key={l.id}>
                      <button
                        onClick={() => setCurrentId(l.id)}
                        className={`w-full text-left px-2 py-1 rounded text-sm transition-colors flex items-start gap-2 ${
                          currentId === l.id
                            ? 'bg-bg-700 text-zinc-100'
                            : 'text-zinc-400 hover:bg-bg-800 hover:text-zinc-200'
                        }`}
                      >
                        <span className="text-[10px] text-zinc-500 mt-0.5 font-mono">
                          {idx + 1}
                        </span>
                        <span className="flex-1">{l.title}</span>
                        <span className="text-[10px] text-zinc-600 mt-0.5">
                          {l.estMinutes}m
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Lesson reader */}
      <article className="col-span-12 lg:col-span-9">
        <div className="bg-bg-900 border border-bg-700 rounded p-6 max-w-3xl">
          {lesson ? (
            <LessonView lesson={lesson} onTryDemo={onTryDemo} />
          ) : (
            <p className="text-zinc-500">Lesson not found.</p>
          )}

          <div className="mt-10 pt-6 border-t border-bg-700 flex items-center justify-between">
            <div>
              {prev ? (
                <button
                  onClick={() => setCurrentId(prev.id)}
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
                >
                  ← {prev.title}
                </button>
              ) : null}
            </div>
            <div>
              {next ? (
                <button
                  onClick={() => setCurrentId(next.id)}
                  className="text-sm text-accent-amber hover:brightness-110 transition-colors"
                >
                  {next.title} →
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}

function LessonView({
  lesson,
  onTryDemo,
}: {
  lesson: Lesson;
  onTryDemo: (demo: LessonDemo) => void;
}) {
  return (
    <div>
      <div className="mb-6">
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
          Lesson · {lesson.estMinutes} min read
        </div>
        <h1 className="text-3xl font-medium text-zinc-100 leading-tight">
          {lesson.title}
        </h1>
        <p className="text-zinc-400 mt-2 text-lg">{lesson.subtitle}</p>
      </div>

      <div className="space-y-4 leading-relaxed">
        {lesson.body.map((b, idx) => (
          <BlockView key={idx} block={b} onTryDemo={onTryDemo} />
        ))}
      </div>
    </div>
  );
}

function BlockView({
  block,
  onTryDemo,
}: {
  block: LessonBlock;
  onTryDemo: (demo: LessonDemo) => void;
}) {
  switch (block.kind) {
    case 'h2':
      return (
        <h2 className="text-xl font-medium text-zinc-100 mt-8 mb-2">
          {block.text}
        </h2>
      );
    case 'p':
      return (
        <p className="text-zinc-300">
          <RichText text={block.text} />
        </p>
      );
    case 'list': {
      const Tag = block.ordered ? 'ol' : 'ul';
      return (
        <Tag
          className={`pl-5 space-y-2 text-zinc-300 ${
            block.ordered ? 'list-decimal' : 'list-disc'
          }`}
        >
          {block.items.map((item, i) => (
            <li key={i}>
              <RichText text={item} />
            </li>
          ))}
        </Tag>
      );
    }
    case 'callout': {
      const colors =
        block.flavor === 'tip'
          ? 'border-accent-amber/40 bg-amber-500/5'
          : block.flavor === 'warn'
          ? 'border-red-500/40 bg-red-500/5'
          : 'border-cyan-500/40 bg-cyan-500/5';
      return (
        <aside className={`border-l-2 ${colors} pl-4 py-3 my-4 rounded-r`}>
          {block.title ? (
            <div className="text-[10px] uppercase tracking-wider text-zinc-400 mb-1">
              {block.title}
            </div>
          ) : null}
          <div className="text-sm text-zinc-300">
            <RichText text={block.text} />
          </div>
        </aside>
      );
    }
    case 'demo':
      return <DemoBlock demo={block.demo} onTryDemo={onTryDemo} />;
  }
}

function DemoBlock({
  demo,
  onTryDemo,
}: {
  demo: LessonDemo;
  onTryDemo: (demo: LessonDemo) => void;
}) {
  return (
    <div className="my-5 border border-accent-amber/30 bg-bg-800/60 rounded p-4">
      <div className="flex items-start gap-3">
        <div className="text-[10px] uppercase tracking-wider text-accent-amber font-medium px-2 py-1 bg-amber-500/10 rounded">
          Try this
        </div>
        <div className="flex-1">
          <div className="font-medium text-zinc-100 mb-1">{demo.label}</div>
          {demo.description ? (
            <p className="text-sm text-zinc-400 leading-relaxed">
              {demo.description}
            </p>
          ) : null}
        </div>
      </div>
      <button
        onClick={() => onTryDemo(demo)}
        className="mt-3 px-4 py-2 rounded bg-accent-amber text-bg-950 font-medium text-sm hover:brightness-110"
      >
        {demo.play
          ? demo.chain
            ? 'Open in Lab + play'
            : `Play ${demo.play.kind === 'note' ? demo.play.note : demo.play.notes.join(' ')}`
          : 'Load chain in Lab'}
      </button>
    </div>
  );
}
