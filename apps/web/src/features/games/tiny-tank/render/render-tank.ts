import { TANK_RADIUS } from '../engine/tank-physics';
import {
  TANK_COLOR_SKY_400,
  TANK_COLOR_SLATE_800,
  type TankPlayer,
} from '../types/tiny-tank.types';

function renderHull(ctx: CanvasRenderingContext2D, tank: TankPlayer, highContrast: boolean) {
  ctx.save();
  ctx.translate(tank.position.x, tank.position.y);
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
  ctx.fillStyle = highContrast ? tank.color : TANK_COLOR_SLATE_800;
  ctx.fillRect(-15, -10, 30, 20);
  ctx.strokeStyle = tank.color;
  ctx.lineWidth = 2;
  ctx.strokeRect(-15, -10, 30, 20);

  // Front grill / indicator
  ctx.fillStyle = tank.color;
  ctx.fillRect(10, -5, 5, 10);

  ctx.restore();
}

function renderTurret(ctx: CanvasRenderingContext2D, tank: TankPlayer) {
  ctx.save();
  ctx.translate(tank.position.x, tank.position.y);
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
}

function renderOverheadHud(ctx: CanvasRenderingContext2D, tank: TankPlayer, isLocal: boolean) {
  ctx.save();
  const barWidth = 32;
  const barHeight = 4;
  const barX = tank.position.x - barWidth / 2;
  const barY = tank.position.y - TANK_RADIUS - 16;

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
    ctx.fillStyle = TANK_COLOR_SKY_400;
    ctx.fillRect(barX, barY - 3, barWidth * shieldRatio, 2);
  }

  // Name Tag
  ctx.font = isLocal ? 'bold 11px sans-serif' : '10px sans-serif';
  ctx.fillStyle = isLocal ? TANK_COLOR_SKY_400 : '#e2e8f0';
  ctx.textAlign = 'center';
  ctx.fillText(tank.name, tank.position.x, barY - 5);

  ctx.restore();
}

export function renderTank(
  ctx: CanvasRenderingContext2D,
  tank: TankPlayer,
  isLocal: boolean,
  highContrast: boolean,
): void {
  if (!tank.isAlive) {
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
    ctx.strokeStyle = TANK_COLOR_SKY_400;
    ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, TANK_RADIUS + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  renderHull(ctx, tank, highContrast);
  renderTurret(ctx, tank);
  renderOverheadHud(ctx, tank, isLocal);

  ctx.restore();
}
