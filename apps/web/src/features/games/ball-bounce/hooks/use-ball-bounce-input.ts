'use client';

import { useEffect } from 'react';
import type { RefObject } from 'react';
import type { BallBounceRenderer } from '../render/ball-bounce-renderer';
import type { BallBounceInput } from '../types/ball-bounce.types';

export type BallBounceKeyAction = 'primary' | 'pause';

type Direction = 'left' | 'right';
type KeyBinding = Direction | BallBounceKeyAction;

const LEFT: Direction = 'left';
const RIGHT: Direction = 'right';

const KEY_BINDINGS: Record<string, KeyBinding> = {
  ArrowLeft: LEFT,
  a: LEFT,
  A: LEFT,
  ArrowRight: RIGHT,
  d: RIGHT,
  D: RIGHT,
  ' ': 'primary',
  Enter: 'primary',
  p: 'pause',
  P: 'pause',
  Escape: 'pause',
};

/** Marks HUD / overlay elements whose taps must not steer the paddle. */
const UI_CONTROL_SELECTOR = '[data-ui-control]';

interface Options {
  inputRef: RefObject<BallBounceInput>;
  stageRef: RefObject<HTMLDivElement | null>;
  rendererRef: RefObject<BallBounceRenderer | null>;
  onKeyAction: (action: BallBounceKeyAction) => void;
  /** Called on pointer down inside the play area (serve / start). */
  onTap: () => void;
}

function isDirection(binding: KeyBinding | undefined): binding is Direction {
  return binding === LEFT || binding === RIGHT;
}

function shouldIgnoreKey(e: KeyboardEvent): boolean {
  const t = e.target;
  const typing =
    t instanceof HTMLElement &&
    (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  return typing || e.metaKey || e.ctrlKey || e.altKey;
}

function handleKeyDown(
  e: KeyboardEvent,
  input: BallBounceInput,
  onKeyAction: (action: BallBounceKeyAction) => void,
): void {
  const binding = KEY_BINDINGS[e.key];
  if (!binding || shouldIgnoreKey(e)) return;
  // Escape keeps its default so it can still leave native fullscreen.
  if (e.key !== 'Escape') e.preventDefault();

  if (isDirection(binding)) {
    input[binding] = true;
    input.pointerX = null;
  } else if (!e.repeat) {
    onKeyAction(binding);
  }
}

function useKeyboardSteering(
  inputRef: RefObject<BallBounceInput>,
  onKeyAction: (action: BallBounceKeyAction) => void,
) {
  useEffect(() => {
    const input = inputRef.current;
    const onKeyDown = (e: KeyboardEvent) => handleKeyDown(e, input, onKeyAction);
    const onKeyUp = (e: KeyboardEvent) => {
      const binding = KEY_BINDINGS[e.key];
      if (isDirection(binding)) input[binding] = false;
    };
    const onBlur = () => {
      input.left = false;
      input.right = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [inputRef, onKeyAction]);
}

function isUiControl(target: EventTarget | null): boolean {
  return target instanceof Element && target.closest(UI_CONTROL_SELECTOR) !== null;
}

function trackPointer(
  e: PointerEvent,
  stage: HTMLElement,
  input: BallBounceInput,
  renderer: BallBounceRenderer | null,
): void {
  if (!renderer) return;
  input.pointerX = renderer.toWorldX(e.clientX - stage.getBoundingClientRect().left);
}

function usePointerSteering({
  inputRef,
  stageRef,
  rendererRef,
  onTap,
}: Omit<Options, 'onKeyAction'>) {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const input = inputRef.current;

    const track = (e: PointerEvent) => trackPointer(e, stage, input, rendererRef.current);
    const onDown = (e: PointerEvent) => {
      if (isUiControl(e.target)) return;
      track(e);
      if (e.pointerType !== 'mouse') stage.setPointerCapture(e.pointerId);
      onTap();
    };
    // Mice steer on hover; touch and pen steer while pressed.
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.buttons > 0) track(e);
    };
    const onLeave = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') input.pointerX = null;
    };
    // Belt and braces: stop iOS Safari from scrolling or rubber-banding mid-game.
    const blockTouch = (e: TouchEvent) => {
      if (!isUiControl(e.target)) e.preventDefault();
    };

    stage.addEventListener('pointerdown', onDown);
    stage.addEventListener('pointermove', onMove);
    stage.addEventListener('pointerleave', onLeave);
    stage.addEventListener('touchmove', blockTouch, { passive: false });
    return () => {
      stage.removeEventListener('pointerdown', onDown);
      stage.removeEventListener('pointermove', onMove);
      stage.removeEventListener('pointerleave', onLeave);
      stage.removeEventListener('touchmove', blockTouch);
    };
  }, [inputRef, stageRef, rendererRef, onTap]);
}

/**
 * Keyboard (arrows / A-D) and pointer (mouse hover, touch drag anywhere) control.
 * Writes into a mutable input ref read by the game loop, so input never triggers re-renders.
 */
export function useBallBounceInput({ onKeyAction, ...pointer }: Options) {
  useKeyboardSteering(pointer.inputRef, onKeyAction);
  usePointerSteering(pointer);
}
