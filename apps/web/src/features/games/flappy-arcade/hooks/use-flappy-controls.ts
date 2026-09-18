'use client';

import { useEffect, useRef } from 'react';

interface UseFlappyControlsOptions {
  enabled: boolean;
  onFlap: () => void;
}

export function useFlappyControls({ enabled, onFlap }: UseFlappyControlsOptions) {
  const onFlapRef = useRef(onFlap);
  onFlapRef.current = onFlap;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser space/arrow scrolling during play
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        onFlapRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}
