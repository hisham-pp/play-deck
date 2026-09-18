'use client';

import { useEffect, useRef } from 'react';

interface UseFlappyControlsOptions {
  enabled: boolean;
  onFlap: () => void;
  onToggleFullscreen?: () => void;
}

export function useFlappyControls({
  enabled,
  onFlap,
  onToggleFullscreen,
}: UseFlappyControlsOptions) {
  const onFlapRef = useRef(onFlap);
  onFlapRef.current = onFlap;

  const onToggleFullscreenRef = useRef(onToggleFullscreen);
  onToggleFullscreenRef.current = onToggleFullscreen;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser space/arrow scrolling during play
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        onFlapRef.current();
      } else if (e.code === 'KeyF') {
        onToggleFullscreenRef.current?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}
