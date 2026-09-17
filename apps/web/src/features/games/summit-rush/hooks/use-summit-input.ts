'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { ControlInput } from '../engine/summit-types';

export type Pedal = 'gas' | 'brake';

export interface SummitKeyHandlers {
  onPauseToggle?: () => void;
  onRestart?: () => void;
  /** Enter / Space, or the first press of a pedal key on a menu. */
  onConfirm?: () => void;
}

const GAS_KEYS = new Set(['d', 'arrowright']);
const BRAKE_KEYS = new Set(['a', 'arrowleft']);
const PAUSE_KEYS = new Set(['escape', 'p']);
const SCROLL_KEYS = new Set(['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ']);
const TEXT_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

function isTyping(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement && (TEXT_TAGS.has(target.tagName) || target.isContentEditable)
  );
}

/**
 * Merges keyboard and on-screen pedals into one input ref that the game loop
 * reads every frame (no React re-render per key press).
 */
export function useSummitInput(enabled: boolean, handlers: SummitKeyHandlers) {
  const inputRef = useRef<ControlInput>({ gas: false, brake: false });
  const keys = useRef({ gas: false, brake: false });
  const pedals = useRef({ gas: false, brake: false });
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const sync = useCallback(() => {
    inputRef.current = {
      gas: keys.current.gas || pedals.current.gas,
      brake: keys.current.brake || pedals.current.brake,
    };
  }, []);

  const releaseAll = useCallback(() => {
    keys.current = { gas: false, brake: false };
    pedals.current = { gas: false, brake: false };
    sync();
  }, [sync]);

  const setPedal = useCallback(
    (pedal: Pedal, pressed: boolean) => {
      pedals.current[pedal] = pressed;
      sync();
    },
    [sync],
  );

  useEffect(() => {
    if (!enabled) {
      releaseAll();
      return;
    }

    const handleKey = (event: KeyboardEvent, down: boolean) => {
      if (isTyping(event.target) || event.metaKey || event.ctrlKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (SCROLL_KEYS.has(key)) event.preventDefault();

      if (GAS_KEYS.has(key)) keys.current.gas = down;
      else if (BRAKE_KEYS.has(key)) keys.current.brake = down;
      sync();

      if (!down || event.repeat) return;
      if (PAUSE_KEYS.has(key)) handlersRef.current.onPauseToggle?.();
      else if (key === 'r') handlersRef.current.onRestart?.();
      else if (key === 'enter' || key === ' ' || GAS_KEYS.has(key))
        handlersRef.current.onConfirm?.();
    };

    const onDown = (e: KeyboardEvent) => handleKey(e, true);
    const onUp = (e: KeyboardEvent) => handleKey(e, false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    window.addEventListener('blur', releaseAll);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      window.removeEventListener('blur', releaseAll);
    };
  }, [enabled, releaseAll, sync]);

  return { inputRef, setPedal, releaseAll };
}
