import { TANK_RADIUS } from '../engine/tank-physics';
import type {
  TinyTankArenaState,
  TankPlayer,
  ArenaBlock,
  Projectile,
  ProximityMine,
  PickupCrate,
  ExplosionEffect,
  TreadMark,
  TinyTankConfig,
  Vector2D,
} from '../types/tiny-tank.types';

export function renderTinyTankArena(
  ctx: CanvasRenderingContext2D,
  state: TinyTankArenaState,
  config: TinyTankConfig,
  localPlayerId: string,
  mousePos: Vector2D | null,
): void {
  const { arenaWidth, arenaHeight } = state;

  // Clear & Arena Floor
  ctx.save();
  ctx.fillStyle = config.highContrast ? '#05070c' : '#0d121f';
  ctx.fillRect(0, 0, arenaWidth, arenaHeight);

  // Subtle floor grid
  ctx.strokeStyle = config.highContrast ? '#1e293b' : 'rgba(30, 41, 59, 0.4)';
  ctx.lineWidth = 1;
  const gridSize = 40;
  ctx.beginPath();
  for (let x = 0; x <= arenaWidth; x += gridSize) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, arenaHeight);
  }
  for (let y = 0; y <= arenaHeight; y += gridSize) {
    ctx.moveTo(0, y);
    ctx.lineTo(arenaWidth, y);
  }
  ctx.stroke();

  // 1. Tread Marks
  renderTreadMarks(ctx, state.treadMarks);

  // 2. Arena Blocks (Steel, Brick, Barrels)
  renderBlocks(ctx, state.blocks, config.highContrast);

  // 3. Pickup Crates
  renderCrates(ctx, state.crates);

  // 4. Proximity Mines
  renderMines(ctx, state.mines);

  // 5. Tanks
  for (const tank of state.players) {
    renderTank(ctx, tank, tank.id === localPlayerId, config.highContrast);
  }

  // 6. Projectiles
  renderProjectiles(ctx, state.projectiles);

  // 7. Explosions
  renderExplosions(ctx, state.explosions);

  // 8. Crosshair for local player
  if (mousePos && state.status === 'playing') {
    renderCrosshair(ctx, mousePos);
  }

  ctx.restore();
}

function renderTreadMarks(ctx: CanvasRenderingContext2D, marks: TreadMark[]): void {
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

function renderBlocks(
  ctx: CanvasRenderingContext2D,
  blocks: ArenaBlock[],
  highContrast: boolean,
): void {
  for (const b of blocks) {
    if (b.health <= 0) continue;

    ctx.save();
    if (b.type === 'steel') {
      // Steel wall
      ctx.fillStyle = highContrast ? '#334155' : '#1e293b';
      ctx.fillRect(b.x, b.y, b.width, b.height);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(b.x + 1, b.y + 1, b.width - 2, b.height - 2);

      // Steel Rivets
      ctx.fillStyle = '#64748b';
      const r = 2;
      ctx.beginPath();
      ctx.arc(b.x + 6, b.y + 6, r, 0, Math.PI * 2);
      ctx.arc(b.x + b.width - 6, b.y + 6, r, 0, Math.PI * 2);
      ctx.arc(b.x + 6, b.y + b.height - 6, r, 0, Math.PI * 2);
      ctx.arc(b.x + b.width - 6, b.y + b.height - 6, r, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.type === 'brick') {
      // Destructible Brick Barrier
      const damageRatio = 1 - b.health / b.maxHealth;
      ctx.fillStyle = highContrast ? '#9a3412' : '#7c2d12';
      ctx.fillRect(b.x, b.y, b.width, b.height);

      // Mortar lines
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(b.x + 1, b.y + 1, b.width - 2, b.height - 2);
      ctx.beginPath();
      ctx.moveTo(b.x, b.y + b.height / 2);
      ctx.lineTo(b.x + b.width, b.y + b.height / 2);
      ctx.moveTo(b.x + b.width / 2, b.y);
      ctx.lineTo(b.x + b.width / 2, b.y + b.height / 2);
      ctx.moveTo(b.x + b.width / 4, b.y + b.height / 2);
      ctx.lineTo(b.x + b.width / 4, b.y + b.height);
      ctx.moveTo(b.x + (b.width * 3) / 4, b.y + b.height / 2);
      ctx.lineTo(b.x + (b.width * 3) / 4, b.y + b.height);
      ctx.stroke();

      // Damage crack lines if damaged
      if (damageRatio > 0.2) {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(b.x + 8, b.y + 10);
        ctx.lineTo(b.x + 22, b.y + 24);
        if (damageRatio > 0.6) {
          ctx.lineTo(b.x + 34, b.y + 18);
          ctx.lineTo(b.x + 28, b.y + 36);
        }
        ctx.stroke();
      }
    } else if (b.type === 'barrel') {
      // Explosive Hazard Barrel
      const cx = b.x + b.width / 2;
      const cy = b.y + b.height / 2;
      const rad = b.width / 2 - 2;

      // Glow
      ctx.fillStyle = 'rgba(234, 88, 12, 0.25)';
      ctx.beginPath();
      ctx.arc(cx, cy, rad + 4, 0, Math.PI * 2);
      ctx.fill();

      // Barrel Body
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fed7aa';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Hazard Stripes / Symbol
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('!', cx, cy);
    }
    ctx.restore();
  }
}

function renderCrates(ctx: CanvasRenderingContext2D, crates: PickupCrate[]): void {
  for (const c of crates) {
    ctx.save();
    const bob = Math.sin(c.pulseTimer * 4) * 3;
    const cx = c.position.x;
    const cy = c.position.y + bob;

    let glowColor: string;
    let label: string;
    let icon: string;

    switch (c.type) {
      case 'health':
        glowColor = '#22c55e';
        label = 'HP';
        icon = '+';
        break;
      case 'shield':
        glowColor = '#06b6d4';
        label = 'SHIELD';
        icon = '🛡️';
        break;
      case 'bouncing':
        glowColor = '#f59e0b';
        label = 'BOUNCE';
        icon = '💥';
        break;
      case 'homing':
        glowColor = '#ec4899';
        label = 'ROCKET';
        icon = '🚀';
        break;
      case 'mine':
        glowColor = '#ef4444';
        label = 'MINE';
        icon = '💣';
        break;
      case 'laser':
        glowColor = '#10b981';
        label = 'LASER';
        icon = '⚡';
        break;
      case 'rubber':
        glowColor = '#a855f7';
        label = 'RUBBER';
        icon = '🟣';
        break;
      default:
        glowColor = '#eab308';
        label = 'AMMO';
        icon = '📦';
        break;
    }

    // Glow ring
    ctx.fillStyle = glowColor;
    ctx.globalAlpha = 0.25;
    ctx.beginPath();
    ctx.arc(cx, cy, c.radius + 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Crate Box
    ctx.fillStyle = '#1e293b';
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

function renderMines(ctx: CanvasRenderingContext2D, mines: ProximityMine[]): void {
  for (const m of mines) {
    ctx.save();
    const cx = m.position.x;
    const cy = m.position.y;

    // Trigger ring if armed
    if (m.isArmed) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.25)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, m.triggerRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Mine Body
    ctx.fillStyle = '#27272a';
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Spikes
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      const sx = cx + Math.cos(a) * 13;
      const sy = cy + Math.sin(a) * 13;
      ctx.fillStyle = '#71717a';
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Blinking LED
    const ledColor = m.isArmed ? '#ef4444' : '#eab308';
    ctx.fillStyle = ledColor;
    ctx.beginPath();
    ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function renderTank(
  ctx: CanvasRenderingContext2D,
  tank: TankPlayer,
  isLocal: boolean,
  highContrast: boolean,
): void {
  if (!tank.isAlive) {
    // Wreckage
    ctx.save();
    ctx.translate(tank.position.x, tank.position.y);
    ctx.rotate(tank.angle);
    ctx.fillStyle = '#18181b';
    ctx.fillRect(-14, -12, 28, 24);
    ctx.strokeStyle = '#3f3f46';
    ctx.strokeRect(-14, -12, 28, 24);
    ctx.restore();
    return;
  }

  ctx.save();
  const { x, y } = tank.position;

  // Strobe if invulnerable
  if (tank.invulnerableTimer > 0 && Math.floor(tank.invulnerableTimer * 20) % 2 === 0) {
    ctx.globalAlpha = 0.4;
  }

  // Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.arc(x + 4, y + 4, TANK_RADIUS, 0, Math.PI * 2);
  ctx.fill();

  // Shield Bubble
  if (tank.shield > 0) {
    ctx.strokeStyle = '#38bdf8';
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, TANK_RADIUS + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // Tank Hull (Rotates with tank.angle)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tank.angle);

  // Left & Right Treads
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-18, -16, 36, 6);
  ctx.fillRect(-18, 10, 36, 6);
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.strokeRect(-18, -16, 36, 6);
  ctx.strokeRect(-18, 10, 36, 6);

  // Tread Segments
  for (let tx = -14; tx <= 14; tx += 6) {
    ctx.beginPath();
    ctx.moveTo(tx, -16);
    ctx.lineTo(tx, -10);
    ctx.moveTo(tx, 10);
    ctx.lineTo(tx, 16);
    ctx.stroke();
  }

  // Chassis / Body
  ctx.fillStyle = highContrast ? tank.color : '#1e293b';
  ctx.fillRect(-15, -10, 30, 20);
  ctx.strokeStyle = tank.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(-15, -10, 30, 20);

  // Front grill / indicator
  ctx.fillStyle = tank.color;
  ctx.fillRect(10, -5, 5, 10);

  ctx.restore();

  // Turret (Rotates independently with tank.turretAngle)
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tank.turretAngle);

  // Barrel with recoil offset
  const recoil = tank.recoilOffset;
  ctx.fillStyle = '#475569';
  ctx.fillRect(6 - recoil, -3, 18, 6);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.strokeRect(6 - recoil, -3, 18, 6);

  // Turret Base Dome
  ctx.fillStyle = tank.color;
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.restore();

  // Overhead Health & Shield Bars + Name
  ctx.save();
  const barWidth = 32;
  const barHeight = 4;
  const barX = x - barWidth / 2;
  const barY = y - TANK_RADIUS - 16;

  // Background
  ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
  ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);

  // Health fill
  const hpRatio = Math.max(0, tank.health / tank.maxHealth);
  ctx.fillStyle = hpRatio > 0.5 ? '#22c55e' : hpRatio > 0.25 ? '#eab308' : '#ef4444';
  ctx.fillRect(barX, barY, barWidth * hpRatio, barHeight);

  // Shield bar if present
  if (tank.shield > 0) {
    const shieldRatio = Math.min(1, tank.shield / tank.maxShield);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(barX, barY - 3, barWidth * shieldRatio, 2);
  }

  // Name Tag
  ctx.font = isLocal ? 'bold 11px sans-serif' : '10px sans-serif';
  ctx.fillStyle = isLocal ? '#38bdf8' : '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.fillText(tank.name, x, barY - 5);

  ctx.restore();
  ctx.restore();
}

function renderProjectiles(ctx: CanvasRenderingContext2D, projectiles: Projectile[]): void {
  for (const p of projectiles) {
    ctx.save();
    const { x, y } = p.position;

    let col = '#f59e0b';
    if (p.weapon === 'bouncing') col = '#38bdf8';
    if (p.weapon === 'homing') col = '#ec4899';
    if (p.weapon === 'laser') col = '#10b981';
    if (p.weapon === 'rubber') col = '#a855f7';

    // Glow
    ctx.fillStyle = col;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(x, y, p.radius + 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Bullet core
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

function renderExplosions(ctx: CanvasRenderingContext2D, explosions: ExplosionEffect[]): void {
  for (const exp of explosions) {
    ctx.save();
    const alpha = Math.max(0, 1 - exp.age / exp.duration);

    // Shockwave ring
    ctx.strokeStyle = exp.color;
    ctx.lineWidth = 3;
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(exp.position.x, exp.position.y, exp.currentRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Fiery center
    ctx.fillStyle = exp.color;
    ctx.globalAlpha = alpha * 0.5;
    ctx.beginPath();
    ctx.arc(exp.position.x, exp.position.y, exp.currentRadius * 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

function renderCrosshair(ctx: CanvasRenderingContext2D, pos: Vector2D): void {
  ctx.save();
  ctx.strokeStyle = '#38bdf8';
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
