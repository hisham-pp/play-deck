'use client';

import { useEffect, useRef, type RefObject } from 'react';
import type { ElevatorEngine } from '../engine/elevator-engine';
import { renderElevator } from '../render/elevator-renderer';

export interface UseElevatorLoopOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  engine: ElevatorEngine;
  /** True on the machine that owns the simulation: offline, or the room host. */
  driving: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  /** Called once per frame after the draw, for sound and snapshot broadcasts. */
  onFrame?: (deltaMs: number) => void;
}

/** Longest frame the engine is asked to swallow, in milliseconds. */
const MAX_FRAME_MS = 64;

/**
 * Drives the run and paints it. Rendering happens every frame on every client;
 * stepping physics only happens where `driving` is true, because guests take
 * their world from the host's snapshots instead.
 */
export function useElevatorLoop(options: UseElevatorLoopOptions): void {
  const { canvasRef, engine } = options;
  const latest = useRef(options);
  latest.current = options;

  useEffect(() => {
    let frameId = 0;
    let previous = performance.now();
    const started = previous;

    const frame = (now: number) => {
      const deltaMs = Math.min(MAX_FRAME_MS, now - previous);
      previous = now;

      const current = latest.current;
      if (current.driving) engine.update(deltaMs);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) {
        const ratio = Math.min(2, window.devicePixelRatio || 1);
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
          canvas.width = Math.round(width * ratio);
          canvas.height = Math.round(height * ratio);
        }
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        renderElevator(ctx, width, height, {
          state: engine.getState(),
          clawClear: engine.canDrop(),
          highContrast: current.highContrast,
          reducedMotion: current.reducedMotion,
          timeSeconds: (now - started) / 1000,
        });
      }

      current.onFrame?.(deltaMs);
      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, [canvasRef, engine]);
}
