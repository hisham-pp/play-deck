'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Gait, GiantInput } from '../types/giant.types';

const MOVE_KEYS: Record<string, [number, number]> = {
  KeyW: [0, -1],
  ArrowUp: [0, -1],
  KeyS: [0, 1],
  ArrowDown: [0, 1],
  KeyA: [-1, 0],
  ArrowLeft: [-1, 0],
  KeyD: [1, 0],
  ArrowRight: [1, 0],
};

const RUN_KEYS = new Set(['ShiftLeft', 'ShiftRight']);
const TIPTOE_KEYS = new Set(['KeyC', 'ControlLeft', 'ControlRight']);
const INTERACT_KEYS = new Set(['KeyE', 'Space']);

export interface GiantControls {
  /** Reads the current intent and clears the one-shot interact. */
  readInput: () => GiantInput;
  /** Analogue stick value from the touch pad, each axis in -1..1. */
  setStick: (x: number, y: number) => void;
  setTouchGait: (gait: Gait) => void;
  pressInteract: () => void;
  /** The gait currently being held, for the on-screen controls to reflect. */
  gait: Gait;
}

/**
 * One intent object shared by keyboard and touch. Movement and gait are held
 * state; reaching for something is a one-shot the game loop consumes, so a held
 * key cannot hoover up the room.
 */
export function useGiantInput(enabled: boolean): GiantControls {
  const held = useRef(new Set<string>());
  const stick = useRef({ x: 0, y: 0 });
  const touchGait = useRef<Gait>('walk');
  const pending = useRef(false);
  const [gait, setGait] = useState<Gait>('walk');

  const syncGait = useCallback(() => {
    const keys = held.current;
    const tiptoe = [...keys].some((code) => TIPTOE_KEYS.has(code));
    const run = [...keys].some((code) => RUN_KEYS.has(code));
    // A held key always wins over the touch toggle, so the two never fight.
    if (tiptoe) setGait('tiptoe');
    else if (run) setGait('run');
    else setGait(touchGait.current);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const { code } = event;
      if (MOVE_KEYS[code] || INTERACT_KEYS.has(code)) event.preventDefault();
      if (INTERACT_KEYS.has(code) && !event.repeat) pending.current = true;
      held.current.add(code);
      syncGait();
    };

    const onKeyUp = (event: KeyboardEvent) => {
      held.current.delete(event.code);
      syncGait();
    };

    // A tab switch would otherwise leave a key stuck down and a thief sprinting.
    const onBlur = () => {
      held.current.clear();
      syncGait();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      held.current.clear();
    };
  }, [enabled, syncGait]);

  const readInput = useCallback((): GiantInput => {
    let moveX = stick.current.x;
    let moveY = stick.current.y;

    for (const code of held.current) {
      const axis = MOVE_KEYS[code];
      if (!axis) continue;
      moveX += axis[0];
      moveY += axis[1];
    }

    const keys = held.current;
    const tiptoe =
      [...keys].some((code) => TIPTOE_KEYS.has(code)) || touchGait.current === 'tiptoe';
    const run = [...keys].some((code) => RUN_KEYS.has(code)) || touchGait.current === 'run';

    const input: GiantInput = { moveX, moveY, run, tiptoe, interact: pending.current };
    pending.current = false;
    return input;
  }, []);

  const setStick = useCallback((x: number, y: number) => {
    stick.current = { x, y };
  }, []);

  const setTouchGait = useCallback(
    (next: Gait) => {
      touchGait.current = next;
      syncGait();
    },
    [syncGait],
  );

  const pressInteract = useCallback(() => {
    pending.current = true;
  }, []);

  return { readInput, setStick, setTouchGait, pressInteract, gait };
}
