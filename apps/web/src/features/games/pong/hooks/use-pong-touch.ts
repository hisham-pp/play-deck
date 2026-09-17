'use client';

import { useCallback, useRef, useState } from 'react';
import { PONG_ARENA_HEIGHT } from '../engine/pong-constants';
import type { PaddleInput, PongSide } from '../engine/pong-types';

interface TouchState {
  player1TargetY: number | null;
  player2TargetY: number | null;
}

export function usePongTouch() {
  const [touchState, setTouchState] = useState<TouchState>({
    player1TargetY: null,
    player2TargetY: null,
  });

  const activeTouchesRef = useRef<Map<number, { side: PongSide; targetY: number }>>(new Map());

  const handleTouchStartOrMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (rect.height <= 0 || rect.width <= 0) return;

    const currentTouches = activeTouchesRef.current;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      const relX = touch.clientX - rect.left;
      const relY = touch.clientY - rect.top;

      const normalizedY = (relY / rect.height) * PONG_ARENA_HEIGHT;
      const side: PongSide = relX < rect.width / 2 ? 'left' : 'right';

      currentTouches.set(touch.identifier, { side, targetY: normalizedY });
    }

    let p1Y: number | null = null;
    let p2Y: number | null = null;

    currentTouches.forEach((val) => {
      if (val.side === 'left') p1Y = val.targetY;
      if (val.side === 'right') p2Y = val.targetY;
    });

    setTouchState({
      player1TargetY: p1Y,
      player2TargetY: p2Y,
    });
  }, []);

  const handleTouchEndOrCancel = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    const currentTouches = activeTouchesRef.current;

    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      currentTouches.delete(touch.identifier);
    }

    let p1Y: number | null = null;
    let p2Y: number | null = null;

    currentTouches.forEach((val) => {
      if (val.side === 'left') p1Y = val.targetY;
      if (val.side === 'right') p2Y = val.targetY;
    });

    setTouchState({
      player1TargetY: p1Y,
      player2TargetY: p2Y,
    });
  }, []);

  const setManualTargetY = useCallback((side: PongSide, targetY: number | null) => {
    setTouchState((prev) => ({
      ...prev,
      [side === 'left' ? 'player1TargetY' : 'player2TargetY']: targetY,
    }));
  }, []);

  const getTouchPaddleInput = useCallback(
    (side: PongSide): PaddleInput => {
      const targetY = side === 'left' ? touchState.player1TargetY : touchState.player2TargetY;
      return {
        up: false,
        down: false,
        targetY,
      };
    },
    [touchState],
  );

  return {
    touchState,
    handleTouchStartOrMove,
    handleTouchEndOrCancel,
    setManualTargetY,
    getTouchPaddleInput,
  };
}
