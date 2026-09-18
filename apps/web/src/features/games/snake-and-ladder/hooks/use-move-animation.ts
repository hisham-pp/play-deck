'use client';

import { useEffect, useRef, useState } from 'react';
import type { SnakeLadderJumpKind, SnakeLadderMove } from '../types/snake-and-ladder.types';

export type MoveAnimationPhase = 'idle' | 'walking' | 'jumping';

export interface MoveAnimation {
  /** Seat whose token is mid-replay, or null when the board is at rest. */
  playerId: string | null;
  /** Square the moving token is drawn on, overriding its settled position. */
  square: number | null;
  phase: MoveAnimationPhase;
  jumpKind: SnakeLadderJumpKind | null;
  isAnimating: boolean;
}

const IDLE: MoveAnimation = {
  playerId: null,
  square: null,
  phase: 'idle',
  jumpKind: null,
  isAnimating: false,
};

/** One hop per square, then a longer beat for the snake or ladder itself. */
const STEP_MS = 130;
const JUMP_HOLD_MS = 320;
const JUMP_TRAVEL_MS = 520;
/** Longest walk the board will step out one square at a time. */
const MAX_STEP_MS_BUDGET = 6 * STEP_MS;

/**
 * Replays a settled move as `from -> walkTo -> to`. The engine has already
 * committed the final square, so this is presentation only: if it is cut short
 * (unmount, reduced motion, a fast follow-up roll) the board simply snaps to
 * the state the engine already holds.
 */
export function useMoveAnimation(
  move: SnakeLadderMove | null,
  reducedMotion: boolean,
): MoveAnimation {
  const [animation, setAnimation] = useState<MoveAnimation>(IDLE);

  // Only the move's identity restarts the replay; a re-render with the same
  // move must not rewind a walk that is already halfway across the board.
  const moveId = move?.moveId ?? null;
  const moveRef = useRef(move);
  moveRef.current = move;

  useEffect(() => {
    const plan = moveRef.current;
    if (!plan || moveId === null) {
      setAnimation(IDLE);
      return;
    }

    // Nothing moved (a forfeited turn, an overshoot, a held token): no replay.
    if (plan.from === plan.to && plan.walkTo === plan.from) {
      setAnimation(IDLE);
      return;
    }

    if (reducedMotion) {
      setAnimation(IDLE);
      return;
    }

    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (delay: number, run: () => void) => timers.push(setTimeout(run, delay));

    const squares: number[] = [];
    for (let square = plan.from + 1; square <= plan.walkTo; square++) {
      squares.push(square);
    }

    // Long walks compress rather than stall the turn; the hop count is unchanged.
    const stepMs = squares.length > 0 ? Math.min(STEP_MS, MAX_STEP_MS_BUDGET / squares.length) : 0;

    squares.forEach((square, index) => {
      at(index * stepMs, () =>
        setAnimation({
          playerId: plan.playerId,
          square,
          phase: 'walking',
          jumpKind: null,
          isAnimating: true,
        }),
      );
    });

    const walkEnd = squares.length * stepMs;

    if (plan.jump) {
      at(walkEnd + JUMP_HOLD_MS, () =>
        setAnimation({
          playerId: plan.playerId,
          square: plan.jump!.to,
          phase: 'jumping',
          jumpKind: plan.jump!.kind,
          isAnimating: true,
        }),
      );
      at(walkEnd + JUMP_HOLD_MS + JUMP_TRAVEL_MS, () => setAnimation(IDLE));
    } else {
      at(walkEnd, () => setAnimation(IDLE));
    }

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [moveId, reducedMotion]);

  return animation;
}
