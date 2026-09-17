import { useEffect, useRef } from 'react';
import type { Direction } from '../types/2048.types';

interface Use2048SwipeProps {
  onMove: (direction: Direction) => void;
  enabled?: boolean;
}

const MIN_SWIPE_DISTANCE = 30;

function resolveSwipeDirection(
  deltaX: number,
  deltaY: number,
  minDistance = MIN_SWIPE_DISTANCE,
): Direction | null {
  const absX = Math.abs(deltaX);
  const absY = Math.abs(deltaY);

  if (Math.max(absX, absY) < minDistance) {
    return null;
  }

  if (absX > absY) {
    return deltaX > 0 ? 'RIGHT' : 'LEFT';
  }
  return deltaY > 0 ? 'DOWN' : 'UP';
}

export function use2048Swipe<T extends HTMLElement = HTMLDivElement>({
  onMove,
  enabled = true,
}: Use2048SwipeProps) {
  const elementRef = useRef<T | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || !enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchStartRef.current) {
        e.preventDefault();
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      const direction = resolveSwipeDirection(deltaX, deltaY);
      if (direction) {
        onMove(direction);
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: false });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onMove, enabled]);

  return elementRef;
}
