'use client';

import { useEffect, useRef, type MutableRefObject, type RefObject } from 'react';
import { advanceWorld, nextFuelDistance, runScore } from '../engine/summit-engine';
import type { ControlInput, Vec2, World, WorldEvent } from '../engine/summit-types';
import type { GhostView } from '../render/ghost-layer';
import { renderWorld, type Viewport } from '../render/summit-renderer';

export interface HudSnapshot {
  distance: number;
  coins: number;
  score: number;
  fuel: number;
  fuelCapacity: number;
  speedKmh: number;
  nextFuel: number | null;
  airborne: boolean;
  status: World['status'];
}

export interface SummitLoopOptions {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  worldRef: MutableRefObject<World | null>;
  inputRef: MutableRefObject<ControlInput>;
  /** Whether physics should advance this frame (false while paused / on menus). */
  simulate: boolean;
  bestDistance: number;
  hudInset: number;
  reducedMotion: boolean;
  getGhosts: () => GhostView[];
  getFocus: () => Vec2 | null;
  onEvents: (events: WorldEvent[]) => void;
  /** Called every frame after simulation (race sync, end detection). */
  onFrame: (world: World, now: number) => void;
  /** Throttled HUD sample (~10 Hz). */
  onHud: (hud: HudSnapshot) => void;
}

const HUD_INTERVAL_MS = 100;
const NO_INPUT: ControlInput = { gas: false, brake: false };
const MAX_DPR = 2;

export function sampleHud(world: World): HudSnapshot {
  const v = world.vehicle;
  return {
    distance: Math.floor(world.stats.distance),
    coins: world.stats.coins,
    score: runScore(world),
    fuel: world.fuel,
    fuelCapacity: v.spec.fuelCapacity,
    speedKmh: Math.round(Math.hypot(v.vel.x, v.vel.y) * 3.6),
    nextFuel: nextFuelDistance(world),
    airborne: world.air.airborne,
    status: world.status,
  };
}

function resizeCanvas(canvas: HTMLCanvasElement, container: HTMLElement, viewport: Viewport): void {
  const rect = container.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
  viewport.width = Math.max(1, rect.width);
  viewport.height = Math.max(1, rect.height);
  viewport.dpr = dpr;
  canvas.width = Math.round(viewport.width * dpr);
  canvas.height = Math.round(viewport.height * dpr);
}

/** Owns the requestAnimationFrame loop, canvas sizing and HUD throttling. */
export function useSummitLoop(options: SummitLoopOptions): void {
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    const canvas = options.canvasRef.current;
    const container = options.containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const viewport: Viewport = { width: 1, height: 1, dpr: 1 };
    resizeCanvas(canvas, container, viewport);
    const observer = new ResizeObserver(() => resizeCanvas(canvas, container, viewport));
    observer.observe(container);

    let raf = 0;
    let last = performance.now();
    let lastHud = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const opts = optsRef.current;
      const world = opts.worldRef.current;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (!world) return;

      if (opts.simulate) {
        const input = world.status === 'running' ? opts.inputRef.current : NO_INPUT;
        const events = advanceWorld(world, input, dt, opts.getFocus());
        if (events.length > 0) opts.onEvents(events);
      }
      opts.onFrame(world, now);
      renderWorld(ctx, world, viewport, {
        bestDistance: opts.bestDistance,
        hudInset: opts.hudInset,
        reducedMotion: opts.reducedMotion,
        ghosts: opts.getGhosts(),
      });
      if (now - lastHud >= HUD_INTERVAL_MS) {
        lastHud = now;
        opts.onHud(sampleHud(world));
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
    // The loop reads everything else through optsRef; only the DOM nodes matter here.
  }, [options.canvasRef, options.containerRef]);
}
