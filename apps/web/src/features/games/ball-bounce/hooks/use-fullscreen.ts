'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';

/** Native Fullscreen API toggle for an element. `supported` is false on iOS Safari (iPhone). */
export function useFullscreen(targetRef: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported(typeof document !== 'undefined' && !!document.fullscreenEnabled);
    const onChange = () => setIsFullscreen(document.fullscreenElement !== null);
    document.addEventListener('fullscreenchange', onChange);
    return () => document.removeEventListener('fullscreenchange', onChange);
  }, []);

  const toggle = useCallback(() => {
    const el = targetRef.current;
    if (!el) return;
    const request = document.fullscreenElement
      ? document.exitFullscreen()
      : el.requestFullscreen({ navigationUI: 'hide' });
    request.catch(() => {
      // Denied or unsupported: the fixed full-viewport layout still applies.
    });
  }, [targetRef]);

  return { isFullscreen, supported, toggle };
}
