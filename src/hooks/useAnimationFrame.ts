import { useEffect, useRef } from 'react';

/** Calls `callback` once per requestAnimationFrame while `enabled` is true. */
export function useAnimationFrame(callback: () => void, enabled = true) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const tick = () => {
      cbRef.current();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
}
