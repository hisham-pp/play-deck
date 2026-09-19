import { PHASE_ESCAPE } from '../engine/giant-constants';
import type { GiantWorld } from '../types/giant.types';
import {
  FLOOR_DARK,
  FLOOR_LIGHT,
  MOSS,
  STONE,
  STONE_EDGE,
  pulse,
  withAlpha,
  type RenderOptions,
} from './render-types';

/** Flagstones. Dark enough that the glow of loot and moss does the wayfinding. */
export function drawFloor(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  const { width, height } = world.map;
  ctx.fillStyle = options.highContrast ? FLOOR_LIGHT : FLOOR_DARK;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = options.highContrast ? 'rgba(148,163,184,0.18)' : 'rgba(148,163,184,0.05)';
  ctx.lineWidth = 1;
  for (let x = 64; x < width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 64; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Moss and old rugs. Drawn as a soft pool rather than a hard disc, because the
 * damping fades in towards the centre and the picture should say so.
 */
export function drawQuietZones(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  for (const zone of world.map.quietZones) {
    const gradient = ctx.createRadialGradient(
      zone.pos.x,
      zone.pos.y,
      4,
      zone.pos.x,
      zone.pos.y,
      zone.radius,
    );
    const strength = options.highContrast ? 0.5 : 0.32;
    gradient.addColorStop(0, withAlpha(MOSS, strength));
    gradient.addColorStop(1, withAlpha(MOSS, 0));

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(zone.pos.x, zone.pos.y, zone.radius, 0, Math.PI * 2);
    ctx.fill();

    if (!options.highContrast) continue;
    ctx.strokeStyle = withAlpha(MOSS, 0.7);
    ctx.setLineDash([6, 6]);
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
  }
}

export function drawObstacles(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  for (const box of world.map.obstacles) {
    ctx.save();
    ctx.fillStyle = options.highContrast ? '#243049' : STONE;
    ctx.strokeStyle = options.highContrast ? '#94a3b8' : STONE_EDGE;
    ctx.lineWidth = options.highContrast ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * The way out. It stays a dim outline all through the heist and only lights up
 * once the escape opens, so nobody has to be told the phase changed.
 */
export function drawExit(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  const { exit } = world.map;
  const open = world.phase === PHASE_ESCAPE;
  const glow = open ? 0.35 + pulse(world.elapsedMs, 1400, options) * 0.4 : 0.12;
  const cx = exit.x + exit.w / 2;
  const cy = exit.y + exit.h / 2;

  const halo = ctx.createRadialGradient(cx, cy, 6, cx, cy, exit.h);
  halo.addColorStop(0, withAlpha('#4ade80', glow));
  halo.addColorStop(1, withAlpha('#4ade80', 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, exit.h, 0, Math.PI * 2);
  ctx.fill();

  ctx.save();
  ctx.fillStyle = withAlpha('#4ade80', open ? 0.22 : 0.08);
  ctx.strokeStyle = withAlpha('#4ade80', open ? 0.95 : 0.4);
  ctx.lineWidth = open ? 3 : 2;
  ctx.beginPath();
  ctx.roundRect(exit.x, exit.y, exit.w, exit.h, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/** Corner shadow. Keeps the eye on the middle of the room where the giant is. */
export function drawVignette(ctx: CanvasRenderingContext2D, world: GiantWorld): void {
  const { width, height } = world.map;
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    height * 0.34,
    width / 2,
    height / 2,
    height * 0.94,
  );
  gradient.addColorStop(0, 'rgba(0,0,0,0)');
  gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
