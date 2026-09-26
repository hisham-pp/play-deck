import {
  PICKUP_HEALTH,
  PICKUP_SHIELD,
  TANK_COLOR_SKY_400,
  TANK_COLOR_SLATE_800,
  WEAPON_BOUNCING,
  WEAPON_HOMING,
  WEAPON_LASER,
  WEAPON_MINE,
  WEAPON_RUBBER,
  type ExplosionEffect,
  type PickupCrate,
  type Projectile,
  type ProximityMine,
  type TreadMark,
  type Vector2D,
} from '../types/tiny-tank.types';

export function renderTreadMarks(ctx: CanvasRenderingContext2D, marks: TreadMark[]): void {
  ctx.save();
  for (const tm of marks) {
    ctx.save();
    ctx.translate(tm.x, tm.y);
    ctx.rotate(tm.angle);
    ctx.fillStyle = `rgba(0, 0, 0, ${tm.alpha * 0.4})`;
    ctx.fillRect(-12, -14, 8, 4);
    ctx.fillRect(-12, 10, 8, 4);
    ctx.restore();
  }
  ctx.restore();
}

function getCrateVisuals(type: PickupCrate['type']): {
  glowColor: string;
  label: string;
  icon: string;
} {
  switch (type) {
    case PICKUP_HEALTH:
      return { glowColor: '#22c55e', label: 'HEALTH', icon: '+' };
    case PICKUP_SHIELD:
      return { glowColor: '#06b6d4', label: 'SHIELD', icon: '🛡️' };
    case WEAPON_BOUNCING:
      return { glowColor: '#f59e0b', label: 'BOUNCE', icon: '💥' };
    case WEAPON_HOMING:
      return { glowColor: '#ec4899', label: 'ROCKET', icon: '🚀' };
    case WEAPON_MINE:
      return { glowColor: '#ef4444', label: 'MINE', icon: '💣' };
    case WEAPON_LASER:
      return { glowColor: '#10b981', label: 'LASER', icon: '⚡' };
    case WEAPON_RUBBER:
      return { glowColor: '#a855f7', label: 'RUBBER', icon: '🟣' };
    default:
      return { glowColor: '#eab308', label: 'AMMO', icon: '📦' };
  }
}

export function renderCrates(ctx: CanvasRenderingContext2D, crates: PickupCrate[]): void {
  for (const c of crates) {
    ctx.save();
    const cx = c.position.x;
    const cy = c.position.y;
    const { glowColor, label, icon } = getCrateVisuals(c.type);

    // Glow ring
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(cx, cy, c.radius + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Crate Box
    ctx.fillStyle = TANK_COLOR_SLATE_800;
    ctx.fillRect(cx - c.radius, cy - c.radius, c.radius * 2, c.radius * 2);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(cx - c.radius, cy - c.radius, c.radius * 2, c.radius * 2);

    // Icon / Label
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, cx, cy);

    ctx.font = '9px monospace';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(label, cx, cy + c.radius + 10);

    ctx.restore();
  }
}

export function renderMines(ctx: CanvasRenderingContext2D, mines: ProximityMine[]): void {
  for (const m of mines) {
    ctx.save();
    const cx = m.position.x;
    const cy = m.position.y;

    if (m.isArmed) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, m.triggerRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    ctx.stroke();

    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const sx = cx + Math.cos(a) * 13;
      const sy = cy + Math.sin(a) * 13;
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = m.isArmed ? '#ef4444' : '#eab308';
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export function renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const p of projectiles) {
    ctx.save();
    const { x, y } = p.position;

    let col = '#f59e0b';
    if (p.weapon === WEAPON_BOUNCING) col = TANK_COLOR_SKY_400;
    if (p.weapon === WEAPON_HOMING) col = '#ec4899';
    if (p.weapon === WEAPON_LASER) col = '#10b981';
    if (p.weapon === WEAPON_RUBBER) col = '#a855f7';

    ctx.fillStyle = col;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, p.radius + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, p.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = col;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }
}

export function renderExplosions(
  ctx: CanvasRenderingContext2D,
  explosions: ExplosionEffect[],
): void {
  for (const exp of explosions) {
    ctx.save();
    const alpha = Math.max(0, 1 - exp.age / exp.duration);

    ctx.strokeStyle = exp.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(exp.position.x, exp.position.y, exp.currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = exp.color;
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(exp.position.x, exp.position.y, exp.currentRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export function renderCrosshair(ctx: CanvasRenderingContext2D, pos: Vector2D): void {
  ctx.save();
  ctx.strokeStyle = TANK_COLOR_SKY_400;
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(pos.x - 12, pos.y);
  ctx.lineTo(pos.x - 4, pos.y);
  ctx.moveTo(pos.x + 4, pos.y);
  ctx.lineTo(pos.x + 12, pos.y);
  ctx.moveTo(pos.x, pos.y - 12);
  ctx.lineTo(pos.x, pos.y - 4);
  ctx.moveTo(pos.x, pos.y + 4);
  ctx.lineTo(pos.x, pos.y + 12);
  ctx.stroke();

  ctx.restore();
}
