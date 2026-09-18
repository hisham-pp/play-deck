import { interactCooldownSec } from '../engine/lights';
import { PHASE_COUNTDOWN, PHASE_ROUND_OVER } from '../engine/shadow-tag-constants';
import { drawFloor, drawLamps, drawLightPools, drawPillars, drawProps } from './arena-layer';
import { drawFootsteps, drawInteractHint, drawSpawnMarkers, drawVignette } from './clue-layer';
import type { RenderFrame } from './render-types';
import { drawReveal, drawSelf, drawShadows, drawTagPulse } from './shadow-layer';

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
 * Draw order is the game's whole readability contract: floor, then the pools a
 * lamp throws, then pillar shade, then the player shadows on top of all of it.
 * Move the shadows under the pools and the game stops working.
 */
export function renderFrame(ctx: CanvasRenderingContext2D, frame: RenderFrame): void {
  const { world, casts, options } = frame;
  const local = options.localPlayerId
    ? world.players.find((runner) => runner.id === options.localPlayerId)
    : undefined;

  drawFloor(ctx, world, options);
  drawLightPools(ctx, world.lights, options, world.elapsedMs);
  drawPillars(ctx, world, options);
  drawProps(ctx, world, options);
  drawFootsteps(ctx, world, options);
  drawShadows(ctx, casts, options);
  drawLamps(ctx, world.lights, options);

  if (world.phase === PHASE_COUNTDOWN) {
    drawSpawnMarkers(ctx, world.arena.spawns, 1 - world.elapsedMs / world.countdownMs);
  }

  drawInteractHint(
    ctx,
    world.lights,
    local,
    local ? interactCooldownSec(local, world.elapsedMs) === 0 : false,
  );
  drawTagPulse(ctx, world, options);

  if (world.phase === PHASE_ROUND_OVER) drawReveal(ctx, world, options);
  else if (local) drawSelf(ctx, local, world, options);

  drawVignette(ctx, world);
}
