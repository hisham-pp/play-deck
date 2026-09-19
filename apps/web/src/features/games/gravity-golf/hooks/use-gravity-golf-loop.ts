import { useEffect, useRef } from 'react';

interface UseGravityGolfLoopOptions {
  onTick: (dt: number, timeMs: number) => void;
  isActive: boolean;
}

export function useGravityGolfLoop({ onTick, isActive }: UseGravityGolfLoopOptions) {
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!isActive) return;

    let animId: number;
    let lastTime = performance.now();

    const loop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); // Cap delta time
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
