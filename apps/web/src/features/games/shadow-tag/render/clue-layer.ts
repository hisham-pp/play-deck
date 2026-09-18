import { footstepFade } from '../engine/clues';
import { LIGHT_INTERACT_RANGE } from '../engine/shadow-tag-constants';
import type { LightSource, ShadowTagRunner, ShadowTagWorld, Vec2 } from '../types/shadow-tag.types';
import type { RenderOptions } from './render-types';

/**
 * Dust kicked up by anyone jogging. It is the only trace a player leaves when
 * no lamp can reach them, and it belongs to nobody in particular — a clue, not
 * a name tag.
 */
export function drawFootsteps(
  ctx: CanvasRenderingContext2D,
  world: ShadowTagWorld,
  options: RenderOptions,
): void {
  for (const step of world.footsteps) {
    const fade = footstepFade(step, world.elapsedMs);
    if (fade <= 0) continue;

    const drift = options.reducedMotion ? 0 : (1 - fade) * 5;
    const alpha = fade * (options.highContrast ? 0.6 : 0.34);

    ctx.save();
    ctx.beginPath();
    ctx.ellipse(
      step.pos.x + Math.cos(step.seed) * drift,
      step.pos.y + Math.sin(step.seed) * drift,
      4 + (1 - fade) * 5,
      2.5 + (1 - fade) * 3,
      step.seed,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = `rgba(203, 213, 225, ${alpha})`;
    ctx.fill();
    ctx.restore();
  }
}

/** Halo round a lamp the local player can reach, so the verbs are discoverable. */
export function drawInteractHint(
  ctx: CanvasRenderingContext2D,
  lights: LightSource[],
  runner: ShadowTagRunner | undefined,
  ready: boolean,
): void {
  if (!runner) return;

  for (const light of lights) {
    const dist = Math.hypot(light.pos.x - runner.pos.x, light.pos.y - runner.pos.y);
    if (dist > LIGHT_INTERACT_RANGE) continue;

    ctx.save();
    ctx.beginPath();
    ctx.arc(light.pos.x, light.pos.y, LIGHT_INTERACT_RANGE, 0, Math.PI * 2);
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = ready ? 'rgba(245, 158, 11, 0.7)' : 'rgba(100, 116, 139, 0.45)';
    ctx.stroke();
    ctx.restore();
  }
}

/** Spawn markers during the countdown — a moment to find yourself before the dark. */
export function drawSpawnMarkers(
  ctx: CanvasRenderingContext2D,
  spawns: Vec2[],
  alpha: number,
): void {
  if (alpha <= 0) return;
  ctx.save();
  ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.5})`;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([3, 5]);
  for (const spawn of spawns) {
    ctx.beginPath();
    ctx.arc(spawn.x, spawn.y, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

/** A soft vignette so the edges of the arena read as depth rather than a crop. */
export function drawVignette(ctx: CanvasRenderingContext2D, world: ShadowTagWorld): void {
  const { width, height } = world.arena;
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.36,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.74,
  );
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}
