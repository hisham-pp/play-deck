'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { RefObject } from 'react';

const TYPE_UNDEFINED = 'undefined';

export interface UseFullscreenOptions {
  /** Target element to make fullscreen. If omitted, targets document.documentElement. */
  targetRef?: RefObject<HTMLElement | null>;
  /** Whether to listen for global 'F' key to toggle and 'Esc' to exit. Default: true */
  enableHotkey?: boolean;
  /** Whether to lock document.body scroll while fullscreen or theater mode is active. Default: true */
  lockScroll?: boolean;
  /** Initial theater mode state. Default: false */
  initialTheater?: boolean;
  /** Callback fired whenever fullscreen state changes. */
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export interface UseFullscreenReturn {
  /** True if either native HTML5 fullscreen or CSS theater mode is active. */
  isFullscreen: boolean;
  /** True specifically when native HTML5 fullscreen is active. */
  isNative: boolean;
  /** True specifically when CSS full-viewport theater mode is active. */
  isTheater: boolean;
  /** Whether native HTML5 fullscreen is supported by the browser. (False on iOS Safari iPhone). */
  supported: boolean;
  /** Toggles native fullscreen (with automatic fallback to theater mode if unsupported or blocked). */
  toggleFullscreen: () => void;
  /** Alias for toggleFullscreen for backwards compatibility with existing HUD callers. */
  toggle: () => void;
  /** Explicitly toggles CSS full-viewport theater mode without triggering browser native fullscreen. */
  toggleTheater: () => void;
  /** Requests native fullscreen or activates theater mode. */
  enterFullscreen: () => void;
  /** Exits both native fullscreen and theater mode. */
  exitFullscreen: () => void;
}

/**
 * Robust cross-browser hook for Native Fullscreen API + CSS Full-Viewport Theater mode.
 * Solves viewport constraints across desktop, Android, and iOS Safari.
 * Supports both `useFullscreen({ targetRef, ... })` and `useFullscreen(targetRef)`.
 */
export function useFullscreen(
  optionsOrTarget?: UseFullscreenOptions | RefObject<HTMLElement | null>,
): UseFullscreenReturn {
  const options: UseFullscreenOptions =
    optionsOrTarget && 'current' in optionsOrTarget
      ? { targetRef: optionsOrTarget as RefObject<HTMLElement | null> }
      : (optionsOrTarget as UseFullscreenOptions) || {};

  const {
    targetRef,
    enableHotkey = true,
    lockScroll = true,
    initialTheater = false,
    onFullscreenChange,
  } = options;

  const [isNative, setIsNative] = useState(false);
  const [isTheater, setIsTheater] = useState(initialTheater);
  const [supported, setSupported] = useState(false);

  // Keep callback in ref to avoid re-binding event listeners
  const onFullscreenChangeRef = useRef(onFullscreenChange);
  onFullscreenChangeRef.current = onFullscreenChange;

  const isFullscreen = isNative || isTheater;

  // Detect support
  useEffect(() => {
    if (typeof document === TYPE_UNDEFINED) return;
    const isAvailable = Boolean(
      document.fullscreenEnabled ||
      (document as unknown as { webkitFullscreenEnabled?: boolean }).webkitFullscreenEnabled ||
      (document as unknown as { mozFullScreenEnabled?: boolean }).mozFullScreenEnabled ||
      (document as unknown as { msFullscreenEnabled?: boolean }).msFullscreenEnabled,
    );
    setSupported(isAvailable);
  }, []);

  // Listen to native fullscreen changes
  useEffect(() => {
    if (typeof document === TYPE_UNDEFINED) return;

    const handleFullscreenChange = () => {
      const activeEl =
        document.fullscreenElement ||
        (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
        (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
        (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement;

      const target = targetRef?.current;
      const isTargetActive = target ? activeEl === target : Boolean(activeEl);

      setIsNative(isTargetActive);
      // If native fullscreen was exited via Esc/browser controls, also reset theater state
      if (!activeEl) {
        setIsTheater(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [targetRef]);

  // Lock body scroll when in fullscreen or theater mode
  useEffect(() => {
    if (!lockScroll || typeof document === TYPE_UNDEFINED) return;

    if (isFullscreen) {
      const { body, documentElement: html } = document;
      const prevBodyOverflow = body.style.overflow;
      const prevHtmlOverflow = html.style.overflow;
      const prevOverscroll = html.style.overscrollBehavior;

      body.style.overflow = 'hidden';
      html.style.overflow = 'hidden';
      html.style.overscrollBehavior = 'none';

      return () => {
        body.style.overflow = prevBodyOverflow;
        html.style.overflow = prevHtmlOverflow;
        html.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, [isFullscreen, lockScroll]);

  // Fire change callback
  useEffect(() => {
    onFullscreenChangeRef.current?.(isFullscreen);
  }, [isFullscreen]);

  const enterFullscreen = useCallback(() => {
    if (typeof document === TYPE_UNDEFINED) return;
    const target = targetRef?.current || document.documentElement;

    // Try native requestFullscreen with fallbacks
    const reqFn =
      target.requestFullscreen ||
      (target as unknown as { webkitRequestFullscreen?: () => Promise<void> })
        .webkitRequestFullscreen ||
      (target as unknown as { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen ||
      (target as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen;

    if (reqFn) {
      // Also activate theater mode so the UI responds immediately without waiting for transition
      setIsTheater(true);
      try {
        const promise = reqFn.call(target, { navigationUI: 'hide' });
        if (promise && typeof promise.catch === 'function') {
          promise.catch(() => {
            // If native fullscreen fails or is blocked by browser permissions, theater mode handles it
            setIsTheater(true);
          });
        }
      } catch {
        setIsTheater(true);
      }
    } else {
      // Browser does not support native fullscreen (e.g. iOS Safari iPhone) -> activate Theater mode
      setIsTheater(true);
    }
  }, [targetRef]);

  const exitFullscreen = useCallback(() => {
    if (typeof document === TYPE_UNDEFINED) return;

    setIsTheater(false);

    const activeEl =
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement;

    if (activeEl) {
      const exitFn =
        document.exitFullscreen ||
        (document as unknown as { webkitExitFullscreen?: () => Promise<void> })
          .webkitExitFullscreen ||
        (document as unknown as { mozCancelFullScreen?: () => Promise<void> })
          .mozCancelFullScreen ||
        (document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen;

      if (exitFn) {
        exitFn.call(document).catch(() => {
          // ignore exit failure
        });
      }
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  const toggleTheater = useCallback(() => {
    setIsTheater((prev) => !prev);
  }, []);

  // Global hotkey: 'F' toggles fullscreen, 'Esc' exits theater mode
  useEffect(() => {
    if (!enableHotkey || typeof window === TYPE_UNDEFINED) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in form inputs, textareas, contenteditable
      const target = e.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName?.toLowerCase();
        if (
          tagName === 'input' ||
          tagName === 'textarea' ||
          tagName === 'select' ||
          target.isContentEditable
        ) {
          return;
        }
      }

      // Check for 'F' key (case insensitive), without Ctrl/Meta/Alt modifiers
      if (
        (e.key === 'f' || e.key === 'F' || e.code === 'KeyF') &&
        !e.ctrlKey &&
        !e.metaKey &&
        !e.altKey
      ) {
        e.preventDefault();
        toggleFullscreen();
        return;
      }

      // Escape exits theater mode (native fullscreen handles Esc natively)
      if (e.key === 'Escape' && isTheater && !isNative) {
        e.preventDefault();
        exitFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enableHotkey, toggleFullscreen, exitFullscreen, isTheater, isNative]);

  return {
    isFullscreen,
    isNative,
    isTheater,
    supported,
    toggleFullscreen,
    toggle: toggleFullscreen,
    toggleTheater,
    enterFullscreen,
    exitFullscreen,
  };
}
