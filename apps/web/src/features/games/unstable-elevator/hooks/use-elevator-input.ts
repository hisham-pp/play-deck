'use client';

import { useCallback, useEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';
import { createCamera, worldXFromScreen } from '../render/elevator-camera';

/** Metres the claw slides per key press, and per press with Shift held. */
const NUDGE = 0.22;
const FINE_NUDGE = 0.07;
/** Radians the claw turns per key press. */
const TURN = Math.PI / 12;

export interface ElevatorAim {
  x: number;
  angle: number;
}

export interface UseElevatorInputOptions {
  /** False whenever the local player is not the one holding the claw. */
  enabled: boolean;
  aim: ElevatorAim;
  onAim: (aim: ElevatorAim) => void;
  onDrop: () => void;
  onRestart?: () => void;
}

export interface UseElevatorInputReturn {
  onPointerDown: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: ReactPointerEvent<HTMLCanvasElement>) => void;
  nudge: (direction: -1 | 1, fine?: boolean) => void;
  turn: (direction: -1 | 1) => void;
}

/**
 * Keyboard and pointer control for the claw. Every action has a key, a button
 * and a drag, so the game plays the same with a keyboard, a mouse or a thumb.
 */
export function useElevatorInput({
  enabled,
  aim,
  onAim,
  onDrop,
  onRestart,
}: UseElevatorInputOptions): UseElevatorInputReturn {
  const latest = useRef({ enabled, aim, onAim, onDrop, onRestart });
  latest.current = { enabled, aim, onAim, onDrop, onRestart };
  const draggingRef = useRef(false);

  const nudge = useCallback((direction: -1 | 1, fine = false) => {
    const { aim: current, onAim: apply } = latest.current;
    apply({ ...current, x: current.x + direction * (fine ? FINE_NUDGE : NUDGE) });
  }, []);

  const turn = useCallback((direction: -1 | 1) => {
    const { aim: current, onAim: apply } = latest.current;
    apply({ ...current, angle: current.angle + direction * TURN });
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { enabled: live, onDrop: drop, onRestart: restart } = latest.current;
      const key = event.key.toLowerCase();

      if (key === 'r' && restart) {
        restart();
        return;
      }
      if (!live) return;

      switch (key) {
        case 'arrowleft':
        case 'a':
          nudge(-1, event.shiftKey);
          break;
        case 'arrowright':
        case 'd':
          nudge(1, event.shiftKey);
          break;
        case 'arrowup':
        case 'w':
        case 'e':
          turn(1);
          break;
        case 'arrowdown':
        case 's':
        case 'q':
          turn(-1);
          break;
        case ' ':
        case 'enter':
          drop();
          break;
        default:
          return;
      }
      event.preventDefault();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [nudge, turn]);

  const aimAtPointer = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    const { enabled: live, aim: current, onAim: apply } = latest.current;
    if (!live) return;
    const canvas = event.currentTarget;
    const bounds = canvas.getBoundingClientRect();
    const camera = createCamera(bounds.width, bounds.height);
    apply({ ...current, x: worldXFromScreen(camera, event.clientX - bounds.left) });
  }, []);

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      draggingRef.current = true;
      event.currentTarget.setPointerCapture(event.pointerId);
      aimAtPointer(event);
    },
    [aimAtPointer],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLCanvasElement>) => {
      if (!draggingRef.current) return;
      aimAtPointer(event);
    },
    [aimAtPointer],
  );

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLCanvasElement>) => {
    draggingRef.current = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, nudge, turn };
}
