import { PHASE_COUNTDOWN } from '../engine/giant-constants';
import {
  drawCharms,
  drawRipples,
  drawSpawnMarkers,
  drawThieves,
  drawTreasures,
} from './actor-layer';
import { drawGiant, drawWakeFlash } from './giant-layer';
import { drawExit, drawFloor, drawObstacles, drawQuietZones, drawVignette } from './map-layer';
import type { RenderFrame } from './render-types';

/** Sizes the backing store for the display's pixel ratio and returns the 2D context. */
export function prepareCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
): CanvasRenderingContext2D | null {
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const dpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
  if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
    canvas.width = width * dpr;
    canvas.height = height * dpr;
  }
  ctx.resetTransform();
  ctx.scale(dpr, dpr);
  return ctx;
}

/**
 * Draw order is the game's readability contract: floor, then the quiet ground
 * worth standing on, then the giant, then everything small enough to be missed.
 * Ripples go on last of all, because a sound has to be visible over whatever
 * made it.
 */
export function renderFrame(ctx: CanvasRenderingContext2D, frame: RenderFrame): void {
  const { world, options } = frame;

  drawFloor(ctx, world, options);
  drawQuietZones(ctx, world, options);
  drawExit(ctx, world, options);
  drawObstacles(ctx, world, options);
  drawGiant(ctx, world, options);
  drawTreasures(ctx, world, options);
  drawCharms(ctx, world, options);
  drawThieves(ctx, world, options);
  drawRipples(ctx, world, options);

  if (world.phase === PHASE_COUNTDOWN) {
    drawSpawnMarkers(ctx, world, 1 - world.elapsedMs / world.countdownMs);
  }

  drawVignette(ctx, world);
  drawWakeFlash(ctx, world);
}
