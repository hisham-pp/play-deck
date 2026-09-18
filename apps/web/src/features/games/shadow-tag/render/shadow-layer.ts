import { PLAYER_RADIUS, TAG_GRACE_MS } from '../engine/shadow-tag-constants';
import type { ShadowCast, ShadowTagRunner, ShadowTagWorld } from '../types/shadow-tag.types';
import { withAlpha, type RenderOptions } from './render-types';

const FALLBACK_TINT = '#94a3b8';

/** Traces the tapered capsule a shadow occupies — the exact shape tags are tested against. */
function traceShadow(ctx: CanvasRenderingContext2D, cast: ShadowCast): void {
  const dx = cast.to.x - cast.from.x;
  const dy = cast.to.y - cast.from.y;
  const angle = Math.atan2(dy, dx);
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);

  ctx.beginPath();
  ctx.moveTo(cast.from.x + nx * cast.nearRadius, cast.from.y + ny * cast.nearRadius);
  ctx.lineTo(cast.to.x + nx * cast.farRadius, cast.to.y + ny * cast.farRadius);
  ctx.arc(cast.to.x, cast.to.y, cast.farRadius, angle + Math.PI / 2, angle - Math.PI / 2, true);
  ctx.lineTo(cast.from.x - nx * cast.nearRadius, cast.from.y - ny * cast.nearRadius);
  ctx.arc(
    cast.from.x,
    cast.from.y,
    cast.nearRadius,
    angle - Math.PI / 2,
    angle + Math.PI / 2,
    true,
  );
  ctx.closePath();
}

/**
 * The thing the whole game is played on. Bodies are never drawn for opponents —
 * only this. A tint per seat keeps six shadows tellable apart without ever
 * revealing where the person actually is beyond their own feet.
 */
export function drawShadows(
  ctx: CanvasRenderingContext2D,
  casts: ShadowCast[],
  options: RenderOptions,
): void {
  for (const cast of casts) {
    const tint = options.colors[cast.playerId] ?? FALLBACK_TINT;
    const strength = options.highContrast ? Math.min(1, cast.opacity * 1.8) : cast.opacity;

    ctx.save();
    traceShadow(ctx, cast);

    const body = ctx.createLinearGradient(cast.from.x, cast.from.y, cast.to.x, cast.to.y);
    body.addColorStop(0, `rgba(2, 4, 9, ${0.72 * strength + 0.18})`);
    body.addColorStop(1, withAlpha(tint, 0.1 + 0.34 * strength));
    ctx.fillStyle = body;
    ctx.fill();

    ctx.lineWidth = options.highContrast ? 2 : 1;
    ctx.strokeStyle = withAlpha(tint, (options.highContrast ? 0.85 : 0.4) * strength + 0.08);
    ctx.stroke();
    ctx.restore();
  }
}

/**
 * You always see yourself, faintly. Opponents are drawn only when the round is
 * over, so the scoreboard can show where everybody actually was.
 */
export function drawSelf(
  ctx: CanvasRenderingContext2D,
  runner: ShadowTagRunner,
  world: ShadowTagWorld,
  options: RenderOptions,
): void {
  const tint = options.colors[runner.id] ?? FALLBACK_TINT;
  const isIt = world.itId === runner.id;
  const immune = runner.immuneUntilMs > world.elapsedMs;

  ctx.save();
  ctx.beginPath();
  ctx.arc(runner.pos.x, runner.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
  ctx.fillStyle = withAlpha(tint, runner.sneaking ? 0.2 : 0.34);
  ctx.fill();
  ctx.lineWidth = isIt ? 3 : 2;
  ctx.strokeStyle = isIt ? '#f43f5e' : withAlpha(tint, 0.95);
  ctx.setLineDash(runner.sneaking ? [4, 4] : []);
  ctx.stroke();
  ctx.setLineDash([]);

  // Facing nib, so a keyboard player can tell which way they are pointed.
  ctx.beginPath();
  ctx.moveTo(runner.pos.x, runner.pos.y);
  ctx.lineTo(
    runner.pos.x + Math.cos(runner.facing) * (PLAYER_RADIUS + 7),
    runner.pos.y + Math.sin(runner.facing) * (PLAYER_RADIUS + 7),
  );
  ctx.strokeStyle = withAlpha(tint, 0.8);
  ctx.lineWidth = 2;
  ctx.stroke();

  if (immune && !options.reducedMotion) {
    const pulse = 0.5 + 0.5 * Math.sin(world.elapsedMs / 90);
    ctx.beginPath();
    ctx.arc(runner.pos.x, runner.pos.y, PLAYER_RADIUS + 6 + pulse * 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(226, 232, 240, ${0.15 + pulse * 0.3})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

/** The ripple that marks where the mark changed hands. */
export function drawTagPulse(
  ctx: CanvasRenderingContext2D,
  world: ShadowTagWorld,
  options: RenderOptions,
): void {
  const tag = world.lastTag;
  if (!tag) return;
  const age = world.elapsedMs - tag.atMs;
  if (age < 0 || age > TAG_GRACE_MS) return;

  const progress = age / TAG_GRACE_MS;
  const radius = options.reducedMotion ? 46 : 16 + progress * 90;

  ctx.save();
  ctx.beginPath();
  ctx.arc(tag.at.x, tag.at.y, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(244, 63, 94, ${(1 - progress) * 0.85})`;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.restore();
}

/** End of round: everyone is revealed, so the arena stops lying. */
export function drawReveal(
  ctx: CanvasRenderingContext2D,
  world: ShadowTagWorld,
  options: RenderOptions,
): void {
  for (const runner of world.players) {
    if (!runner.connected) continue;
    const tint = options.colors[runner.id] ?? FALLBACK_TINT;
    ctx.save();
    ctx.beginPath();
    ctx.arc(runner.pos.x, runner.pos.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(tint, 0.55);
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = world.itId === runner.id ? '#f43f5e' : '#e2e8f0';
    ctx.stroke();
    ctx.restore();
  }
}
