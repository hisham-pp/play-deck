import { INTERACT_RANGE, THIEF_RADIUS, TREASURE_RADIUS } from '../engine/giant-constants';
import { rippleAge } from '../engine/noise';
import type { GiantWorld, Thief } from '../types/giant.types';
import { pulse, TIER_COLOR, withAlpha, type RenderOptions } from './render-types';

const CHARM_COLOR = { lullaby: '#38bdf8', muffle: '#4ade80' } as const;

/** Loot glows, so a dark room still reads as a room worth crossing. */
export function drawTreasures(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  for (const treasure of world.treasures) {
    if (treasure.takenBy !== null) continue;
    const color = TIER_COLOR[treasure.tier];
    const shimmer = 0.5 + pulse(world.elapsedMs + treasure.pos.x, 2200, options) * 0.5;

    const halo = ctx.createRadialGradient(
      treasure.pos.x,
      treasure.pos.y,
      2,
      treasure.pos.x,
      treasure.pos.y,
      TREASURE_RADIUS * 3.2,
    );
    halo.addColorStop(0, withAlpha(color, 0.34 * shimmer));
    halo.addColorStop(1, withAlpha(color, 0));
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(treasure.pos.x, treasure.pos.y, TREASURE_RADIUS * 3.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.translate(treasure.pos.x, treasure.pos.y);
    // A relic is the same shape turned on its point, so tier reads without colour.
    if (treasure.tier === 'relic') ctx.rotate(Math.PI / 4);
    ctx.beginPath();
    ctx.roundRect(-TREASURE_RADIUS, -TREASURE_RADIUS, TREASURE_RADIUS * 2, TREASURE_RADIUS * 2, 3);
    ctx.fillStyle = withAlpha(color, 0.9);
    ctx.fill();
    ctx.lineWidth = options.highContrast ? 2.5 : 1.5;
    ctx.strokeStyle = '#0b0f1a';
    ctx.stroke();
    ctx.restore();
  }
}

export function drawCharms(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  for (const charm of world.charms) {
    if (charm.usedBy !== null) continue;
    const color = CHARM_COLOR[charm.kind];
    const ring = TREASURE_RADIUS + 4 + pulse(world.elapsedMs, 1600, options) * 5;

    ctx.save();
    ctx.beginPath();
    ctx.arc(charm.pos.x, charm.pos.y, ring, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha(color, 0.55);
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(charm.pos.x, charm.pos.y, TREASURE_RADIUS - 2, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(color, 0.85);
    ctx.fill();
    ctx.strokeStyle = '#0b0f1a';
    ctx.lineWidth = options.highContrast ? 2.5 : 1.5;
    ctx.stroke();
    ctx.restore();
  }
}

/** A ring per sound, widening as it fades. This is how noise is taught. */
export function drawRipples(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  for (const ripple of world.ripples) {
    const age = rippleAge(ripple, world.elapsedMs);
    const radius = 14 + ripple.strength * 90 * (options.reducedMotion ? 0.6 : age);
    const alpha = (1 - age) * (0.25 + ripple.strength * 0.6);

    ctx.beginPath();
    ctx.arc(ripple.pos.x, ripple.pos.y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha('#f59e0b', alpha);
    ctx.lineWidth = options.highContrast ? 3 : 2;
    ctx.stroke();
  }
}

function drawCarryPips(
  ctx: CanvasRenderingContext2D,
  thief: Thief,
  color: string,
  options: RenderOptions,
): void {
  const pips = Math.min(thief.carriedCount, 5);
  for (let i = 0; i < pips; i++) {
    ctx.beginPath();
    ctx.arc(
      thief.pos.x - (pips - 1) * 3.5 + i * 7,
      thief.pos.y - THIEF_RADIUS - 8,
      2.6,
      0,
      Math.PI * 2,
    );
    ctx.fillStyle = color;
    ctx.fill();
    if (!options.highContrast) continue;
    ctx.strokeStyle = '#0b0f1a';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

/**
 * Every thief is drawn the same way, local or not. There is nothing hidden in
 * this game — the tension is the meter, not who can see whom.
 */
export function drawThieves(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  options: RenderOptions,
): void {
  for (const thief of world.thieves) {
    if (thief.escaped) continue;
    const color = options.colors[thief.id] ?? '#f59e0b';
    const isLocal = thief.id === options.localPlayerId;

    if (isLocal) {
      ctx.beginPath();
      ctx.arc(thief.pos.x, thief.pos.y, INTERACT_RANGE, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha(color, 0.18);
      ctx.setLineDash([4, 6]);
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.save();
    ctx.globalAlpha = thief.connected ? 1 : 0.35;
    ctx.beginPath();
    ctx.arc(thief.pos.x, thief.pos.y, THIEF_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = withAlpha(color, 0.92);
    ctx.fill();
    ctx.lineWidth = isLocal ? 3 : options.highContrast ? 2.5 : 1.5;
    ctx.strokeStyle = isLocal ? '#ffffff' : '#0b0f1a';
    ctx.stroke();

    // A tiptoeing thief is drawn tucked in; a running one throws a wake.
    if (thief.gait === 'tiptoe') {
      ctx.beginPath();
      ctx.arc(thief.pos.x, thief.pos.y, THIEF_RADIUS - 4, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha('#4ade80', 0.8);
      ctx.lineWidth = 2;
      ctx.stroke();
    } else if (thief.gait === 'run') {
      ctx.beginPath();
      ctx.arc(thief.pos.x, thief.pos.y, THIEF_RADIUS + 5, 0, Math.PI * 2);
      ctx.strokeStyle = withAlpha('#fb7185', 0.5);
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.moveTo(thief.pos.x, thief.pos.y);
    ctx.lineTo(
      thief.pos.x + Math.cos(thief.facing) * (THIEF_RADIUS + 7),
      thief.pos.y + Math.sin(thief.facing) * (THIEF_RADIUS + 7),
    );
    ctx.strokeStyle = withAlpha(color, 0.9);
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.restore();

    if (thief.carriedCount > 0) drawCarryPips(ctx, thief, color, options);
  }
}

/** The countdown rings that show everyone where they are about to be standing. */
export function drawSpawnMarkers(
  ctx: CanvasRenderingContext2D,
  world: GiantWorld,
  progress: number,
): void {
  for (const spawn of world.map.spawns) {
    ctx.beginPath();
    ctx.arc(spawn.x, spawn.y, THIEF_RADIUS + 10 + progress * 16, 0, Math.PI * 2);
    ctx.strokeStyle = withAlpha('#f59e0b', 0.15 + progress * 0.35);
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}
