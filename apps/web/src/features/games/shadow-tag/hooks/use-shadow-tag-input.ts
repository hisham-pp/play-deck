'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ShadowTagInput } from '../types/shadow-tag.types';

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

const BLOCK_KEYS = new Set(['KeyE', 'Space']);
const REDIRECT_KEYS = new Set(['KeyQ']);
const SNEAK_KEYS = new Set(['ShiftLeft', 'ShiftRight']);

export interface ShadowTagControls {
  /** Reads the current intent and clears the one-shot light actions. */
  readInput: () => ShadowTagInput;
  /** Analogue stick value from the touch pad, each axis in -1..1. */
  setStick: (x: number, y: number) => void;
  setTouchSneak: (sneak: boolean) => void;
  pressBlock: () => void;
  pressRedirect: () => void;
  /** True while a key or the touch toggle is holding a sneak. */
  sneaking: boolean;
}

/**
 * One intent object shared by keyboard and touch. Movement is held state;
 * covering or turning a lamp is a one-shot that the game loop consumes, so a
 * held key cannot machine-gun the light.
 */
export function useShadowTagInput(enabled: boolean): ShadowTagControls {
  const held = useRef(new Set<string>());
  const stick = useRef({ x: 0, y: 0 });
  const touchSneak = useRef(false);
  const pending = useRef({ block: false, redirect: false });
  const [sneaking, setSneaking] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const { code } = event;
      if (MOVE_KEYS[code] || BLOCK_KEYS.has(code)) event.preventDefault();

      if (BLOCK_KEYS.has(code) && !event.repeat) pending.current.block = true;
      if (REDIRECT_KEYS.has(code) && !event.repeat) pending.current.redirect = true;
      if (SNEAK_KEYS.has(code)) setSneaking(true);
      held.current.add(code);
    };

    const onKeyUp = (event: KeyboardEvent) => {
      held.current.delete(event.code);
      if (SNEAK_KEYS.has(event.code)) setSneaking(touchSneak.current);
    };

    // A tab switch would otherwise leave a key stuck down and the runner sprinting.
    const onBlur = () => {
      held.current.clear();
      setSneaking(touchSneak.current);
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
  }, [enabled]);

  const readInput = useCallback((): ShadowTagInput => {
    let moveX = stick.current.x;
    let moveY = stick.current.y;

    for (const code of held.current) {
      const axis = MOVE_KEYS[code];
      if (!axis) continue;
      moveX += axis[0];
      moveY += axis[1];
    }

    const keyboardSneak = [...held.current].some((code) => SNEAK_KEYS.has(code));
    const input: ShadowTagInput = {
      moveX,
      moveY,
      sneak: keyboardSneak || touchSneak.current,
      block: pending.current.block,
      redirect: pending.current.redirect,
    };

    pending.current = { block: false, redirect: false };
    return input;
  }, []);

  const setStick = useCallback((x: number, y: number) => {
    stick.current = { x, y };
  }, []);

  const setTouchSneak = useCallback((next: boolean) => {
    touchSneak.current = next;
    setSneaking(next);
  }, []);

  const pressBlock = useCallback(() => {
    pending.current.block = true;
  }, []);

  const pressRedirect = useCallback(() => {
    pending.current.redirect = true;
  }, []);

  return { readInput, setStick, setTouchSneak, pressBlock, pressRedirect, sneaking };
}
