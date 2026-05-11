import type { EffectParamSpec } from '../types';
import { Knob } from './Knob';

interface Props {
  param: EffectParamSpec;
  value: number;
  onChange: (v: number) => void;
}

/**
 * Dispatches to the right control type for a given EffectParamSpec.
 * Numeric -> Knob. Toggle -> on/off button. Enum -> pill group.
 * Hidden -> nothing.
 */
export function ParamControl({ param, value, onChange }: Props) {
  if (param.type === 'hidden') return null;

  if (param.type === 'toggle') {
    const on = value > 0.5;
    return (
      <div
        className="flex flex-col items-center gap-1 select-none"
        title={param.description}
      >
        <button
          onClick={() => onChange(on ? 0 : 1)}
          className={`px-3 py-2 rounded text-[10px] uppercase tracking-wider border transition-colors w-full ${
            on
              ? 'bg-accent-amber/20 border-accent-amber text-accent-amber'
              : 'bg-bg-900 border-bg-700 text-zinc-500 hover:text-zinc-300'
          }`}
        >
          {param.options
            ? param.options.find((o) => o.value === (on ? 1 : 0))?.label ??
              (on ? 'On' : 'Off')
            : on
              ? 'On'
              : 'Off'}
        </button>
        <div className="text-[10px] uppercase tracking-wider text-zinc-400">
          {param.label}
        </div>
      </div>
    );
  }

  if (param.type === 'enum') {
    const options = param.options ?? [];
    return (
      <div
        className="flex flex-col items-stretch gap-1 select-none col-span-2"
        title={param.description}
      >
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 text-center">
          {param.label}
        </div>
        <div className="flex flex-wrap gap-1 justify-center">
          {options.map((o) => (
            <button
              key={o.value}
              onClick={() => onChange(o.value)}
              className={`px-2 py-1 text-[11px] rounded border transition-colors ${
                value === o.value
                  ? 'bg-accent-amber/20 border-accent-amber text-accent-amber'
                  : 'bg-bg-900 border-bg-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // default: numeric knob
  return (
    <Knob
      label={param.label}
      value={value}
      min={param.min}
      max={param.max}
      step={param.step}
      unit={param.unit}
      curve={param.curve}
      description={param.description}
      onChange={onChange}
    />
  );
}
