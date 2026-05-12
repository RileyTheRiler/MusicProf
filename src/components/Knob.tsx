import { useCallback, useEffect, useRef } from 'react';

export interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  curve?: 'linear' | 'log';
  onChange: (v: number) => void;
  size?: number;
  description?: string;
}

/**
 * A round, draggable knob — vertical drag to change value, double-click to reset.
 * The angle sweep is from -135° (min) to +135° (max).
 */
export function Knob({
  label,
  value,
  min,
  max,
  step = 0.01,
  unit,
  curve = 'linear',
  onChange,
  size = 56,
  description,
}: KnobProps) {
  const drag = useRef<{
    startY: number;
    startVal: number;
    active: boolean;
  } | null>(null);

  // Map value -> 0..1 for display position (apply log curve if requested).
  const norm = (() => {
    if (curve === 'log' && min > 0) {
      const lmin = Math.log(min);
      const lmax = Math.log(max);
      const lv = Math.log(Math.max(min, value));
      return (lv - lmin) / (lmax - lmin);
    }
    return (value - min) / (max - min);
  })();

  const angle = -135 + norm * 270;

  // Convert a 0..1 normalized position back to a value
  const denorm = (n: number) => {
    n = Math.min(1, Math.max(0, n));
    if (curve === 'log' && min > 0) {
      const lmin = Math.log(min);
      const lmax = Math.log(max);
      return Math.exp(lmin + n * (lmax - lmin));
    }
    return min + n * (max - min);
  };

  const round = (v: number) => {
    if (!step) return v;
    return Math.round(v / step) * step;
  };

  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      drag.current = { startY: e.clientY, startVal: value, active: true };
      e.preventDefault();
    },
    [value]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!drag.current?.active) return;
      const dy = drag.current.startY - e.clientY;
      // 200px drag = full sweep (slower with shift)
      const speed = e.shiftKey ? 600 : 200;
      const startNorm = (() => {
        if (curve === 'log' && min > 0) {
          const lmin = Math.log(min);
          const lmax = Math.log(max);
          return (Math.log(Math.max(min, drag.current.startVal)) - lmin) / (lmax - lmin);
        }
        return (drag.current.startVal - min) / (max - min);
      })();
      const newNorm = Math.min(1, Math.max(0, startNorm + dy / speed));
      const v = round(denorm(newNorm));
      onChange(Math.min(max, Math.max(min, v)));
    };
    const onUp = () => {
      if (drag.current) drag.current.active = false;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [min, max, curve, onChange]);

  const display = (() => {
    if (Math.abs(value) >= 100) return value.toFixed(0);
    if (Math.abs(value) >= 10) return value.toFixed(1);
    return value.toFixed(2);
  })();

  return (
    <div
      className="flex flex-col items-center gap-1 select-none"
      title={description}
    >
      <div
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        style={{ width: size, height: size }}
        className="relative cursor-ns-resize"
        onMouseDown={onMouseDown}
        onDoubleClick={() => {
          // reset to mid (or default — caller can pass default via initial value)
          onChange(round((min + max) / 2));
        }}
      >
        <svg viewBox="0 0 100 100" width={size} height={size}>
          {/* background ring */}
          <circle cx="50" cy="50" r="42" fill="#1a1a20" stroke="#2f2f38" strokeWidth="2" />
          {/* arc track */}
          <path
            d={describeArc(50, 50, 38, -135, 135)}
            fill="none"
            stroke="#2f2f38"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* value arc */}
          <path
            d={describeArc(50, 50, 38, -135, angle)}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="4"
            strokeLinecap="round"
          />
          {/* indicator */}
          <line
            x1="50"
            y1="50"
            x2={50 + 30 * Math.cos((angle - 90) * (Math.PI / 180))}
            y2={50 + 30 * Math.sin((angle - 90) * (Math.PI / 180))}
            stroke="#fff"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="text-[10px] uppercase tracking-wider text-zinc-400">{label}</div>
      <div className="text-xs text-zinc-200 font-mono">
        {display}
        {unit ? <span className="text-zinc-500 ml-0.5">{unit}</span> : null}
      </div>
    </div>
  );
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
