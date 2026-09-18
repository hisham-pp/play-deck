import { propShake } from '../engine/clues';
import type { LightSource, Obstacle, ShadowTagWorld, Vec2 } from '../types/shadow-tag.types';
import { FLOOR_DARK, FLOOR_LIGHT, withAlpha, type RenderOptions } from './render-types';

const OBSTACLE_SHADOW_LENGTH = 520;

export function drawFloor(
  ctx: CanvasRenderingContext2D,
  world: ShadowTagWorld,
  options: RenderOptions,
): void {
  const { width, height } = world.arena;
  ctx.fillStyle = options.highContrast ? FLOOR_LIGHT : FLOOR_DARK;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = options.highContrast ? 'rgba(148,163,184,0.16)' : 'rgba(148,163,184,0.055)';
  ctx.lineWidth = 1;
  for (let x = 60; x < width; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 60; y < height; y += 60) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  ctx.restore();
}

/** The warm pool a lamp throws on the floor. Everything readable happens inside these. */
export function drawLightPools(
  ctx: CanvasRenderingContext2D,
  lights: LightSource[],
  options: RenderOptions,
  elapsedMs: number,
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';

  for (const light of lights) {
    if (light.intensity <= 0.01) continue;
    const flicker = options.reducedMotion ? 1 : 0.94 + Math.sin(elapsedMs / 220 + light.hue) * 0.06;
    const strength = light.intensity * flicker * (options.highContrast ? 0.72 : 0.5);

    const pool = ctx.createRadialGradient(
      light.pos.x,
      light.pos.y,
      6,
      light.pos.x,
      light.pos.y,
      light.reach,
    );
    pool.addColorStop(0, `hsla(${light.hue}, 92%, 72%, ${strength})`);
    pool.addColorStop(0.45, `hsla(${light.hue}, 84%, 56%, ${strength * 0.34})`);
    pool.addColorStop(1, `hsla(${light.hue}, 80%, 46%, 0)`);

    ctx.fillStyle = pool;
    ctx.beginPath();
    ctx.arc(light.pos.x, light.pos.y, light.reach, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** The lamp fixture itself, plus the ring that shows its interaction radius. */
export function drawLamps(
  ctx: CanvasRenderingContext2D,
  lights: LightSource[],
  options: RenderOptions,
): void {
  for (const light of lights) {
    const covered = light.intensity < 0.35;
    ctx.save();
    ctx.beginPath();
    ctx.arc(light.pos.x, light.pos.y, 9, 0, Math.PI * 2);
    ctx.fillStyle = covered
      ? 'rgba(71,85,105,0.9)'
      : `hsla(${light.hue}, 96%, ${68 + light.intensity * 14}%, 1)`;
    ctx.fill();
    ctx.lineWidth = options.highContrast ? 2.5 : 1.5;
    ctx.strokeStyle = covered ? 'rgba(148,163,184,0.8)' : 'rgba(255,255,255,0.75)';
    ctx.stroke();

    if (covered) {
      ctx.beginPath();
      ctx.moveTo(light.pos.x - 6, light.pos.y - 6);
      ctx.lineTo(light.pos.x + 6, light.pos.y + 6);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function boxCorners(box: Obstacle): Vec2[] {
  return [
    { x: box.x, y: box.y },
    { x: box.x + box.w, y: box.y },
    { x: box.x + box.w, y: box.y + box.h },
    { x: box.x, y: box.y + box.h },
  ];
}

/** Extrudes the faces of a pillar that point away from a lamp — its hard shadow. */
function drawPillarShadow(
  ctx: CanvasRenderingContext2D,
  box: Obstacle,
  light: LightSource,
  alpha: number,
): void {
  const corners = boxCorners(box);

  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    // Outward normal of a clockwise-wound edge.
    const nx = b.y - a.y;
    const ny = a.x - b.x;
    if (nx * (midX - light.pos.x) + ny * (midY - light.pos.y) <= 0) continue;

    const da = Math.atan2(a.y - light.pos.y, a.x - light.pos.x);
    const db = Math.atan2(b.y - light.pos.y, b.x - light.pos.x);

    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(
      b.x + Math.cos(db) * OBSTACLE_SHADOW_LENGTH,
      b.y + Math.sin(db) * OBSTACLE_SHADOW_LENGTH,
    );
    ctx.lineTo(
      a.x + Math.cos(da) * OBSTACLE_SHADOW_LENGTH,
      a.y + Math.sin(da) * OBSTACLE_SHADOW_LENGTH,
    );
    ctx.closePath();
    ctx.fillStyle = `rgba(3, 5, 10, ${alpha})`;
    ctx.fill();
  }
}

export function drawPillars(
  ctx: CanvasRenderingContext2D,
  world: ShadowTagWorld,
  options: RenderOptions,
): void {
  ctx.save();
  for (const light of world.lights) {
    if (light.intensity <= 0.02) continue;
    for (const box of world.arena.obstacles) {
      drawPillarShadow(ctx, box, light, 0.42 * light.intensity);
    }
  }
  ctx.restore();

  for (const box of world.arena.obstacles) {
    ctx.save();
    ctx.fillStyle = options.highContrast ? '#1e293b' : '#111827';
    ctx.strokeStyle = options.highContrast ? '#94a3b8' : '#232f45';
    ctx.lineWidth = options.highContrast ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(box.x, box.y, box.w, box.h, 6);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  }
}

/** Scenery. A prop that is shaking is the clue that somebody just brushed past. */
export function drawProps(
  ctx: CanvasRenderingContext2D,
  world: ShadowTagWorld,
  options: RenderOptions,
): void {
  for (const prop of world.props) {
    const shake = propShake(prop, world.elapsedMs);
    const wobble =
      shake > 0 && !options.reducedMotion
        ? Math.sin((world.elapsedMs + prop.seed) / 34) * shake * 3
        : 0;

    ctx.save();
    ctx.translate(prop.pos.x + wobble, prop.pos.y);
    ctx.beginPath();
    ctx.roundRect(-prop.radius, -prop.radius, prop.radius * 2, prop.radius * 2, 3);
    ctx.fillStyle = options.highContrast ? '#334155' : '#1c2438';
    ctx.fill();
    ctx.lineWidth = shake > 0 ? 2 : 1;
    ctx.strokeStyle = shake > 0 ? withAlpha('#f59e0b', 0.35 + shake * 0.65) : 'rgba(35,47,69,0.9)';
    ctx.stroke();

    if (shake > 0) {
      ctx.beginPath();
      ctx.arc(0, 0, prop.radius + 8 + shake * 6, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha('#f59e0b', shake * 0.4);
      ctx.stroke();
    }
    ctx.restore();
  }
}
