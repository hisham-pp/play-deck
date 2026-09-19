import { useEffect, useRef } from 'react';

interface UseReverseRacingLoopOptions {
  onTick: (dt: number, timeMs: number) => void;
  isActive: boolean;
}

export function useReverseRacingLoop({ onTick, isActive }: UseReverseRacingLoopOptions) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!isActive) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // Cap delta time at 50ms to avoid tunneling
      lastTime = now;

      onTickRef.current(dt, now);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive]);
}
