import type { Collectible, Particle } from '../engine/summit-types';
import type { WorldBounds } from './terrain-layer';

function drawCoin(ctx: CanvasRenderingContext2D, c: Collectible, time: number): void {
  const spin = Math.cos(time * 3.2 + c.id * 0.7);
  const rx = 0.34 * Math.max(0.18, Math.abs(spin));
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.ellipse(c.pos.x, c.pos.y, rx, 0.34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = spin > 0 ? '#fcd34d' : '#fbbf24';
  ctx.beginPath();
  ctx.ellipse(c.pos.x, c.pos.y, rx * 0.8, 0.27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(c.pos.x - rx * 0.12, c.pos.y - 0.14, rx * 0.24, 0.28);
}

function drawGem(ctx: CanvasRenderingContext2D, c: Collectible, time: number): void {
  const bob = Math.sin(time * 2.5 + c.id) * 0.1;
  const { x } = c.pos;
  const y = c.pos.y + bob;
  const glow = ctx.createRadialGradient(x, y, 0.05, x, y, 0.9);
  glow.addColorStop(0, 'rgba(196,181,253,0.7)');
  glow.addColorStop(1, 'rgba(196,181,253,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.moveTo(x, y - 0.45);
  ctx.lineTo(x + 0.36, y + 0.1);
  ctx.lineTo(x + 0.2, y + 0.32);
  ctx.lineTo(x - 0.2, y + 0.32);
  ctx.lineTo(x - 0.36, y + 0.1);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c4b5fd';
  ctx.beginPath();
  ctx.moveTo(x, y - 0.45);
  ctx.lineTo(x + 0.14, y + 0.1);
  ctx.lineTo(x - 0.14, y + 0.1);
  ctx.closePath();
  ctx.fill();
}

function drawFuel(ctx: CanvasRenderingContext2D, c: Collectible, time: number): void {
  const bob = Math.sin(time * 2 + c.id) * 0.08;
  const x = c.pos.x;
  const y = c.pos.y + bob;
  const pulse = 0.75 + Math.sin(time * 4) * 0.15;
  ctx.strokeStyle = `rgba(74,222,128,${pulse * 0.6})`;
  ctx.lineWidth = 0.07;
  ctx.beginPath();
  ctx.arc(x, y, 0.72, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.roundRect(x - 0.32, y - 0.42, 0.64, 0.74, 0.1);
  ctx.fill();
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(x - 0.32, y - 0.42, 0.64, 0.12);
  // Handle and spout.
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 0.08;
  ctx.beginPath();
  ctx.moveTo(x - 0.2, y + 0.32);
  ctx.lineTo(x - 0.2, y + 0.46);
  ctx.lineTo(x + 0.08, y + 0.46);
  ctx.lineTo(x + 0.08, y + 0.32);
  ctx.stroke();
  ctx.fillStyle = '#fbbf24';
  ctx.fillRect(x + 0.16, y + 0.3, 0.12, 0.16);
  // Fuel drop emblem.
  ctx.fillStyle = '#fef2f2';
  ctx.beginPath();
  ctx.moveTo(x, y + 0.18);
  ctx.quadraticCurveTo(x + 0.16, y - 0.04, x, y - 0.16);
  ctx.quadraticCurveTo(x - 0.16, y - 0.04, x, y + 0.18);
  ctx.fill();
}

export function drawCollectibles(
  ctx: CanvasRenderingContext2D,
  items: Collectible[],
  b: WorldBounds,
  time: number,
): void {
  for (const c of items) {
    if (c.collected || c.pos.x < b.left - 1 || c.pos.x > b.right + 1) continue;
    if (c.kind === 'coin') drawCoin(ctx, c, time);
    else if (c.kind === 'gem') drawGem(ctx, c, time);
    else drawFuel(ctx, c, time);
  }
}

export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]): void {
  for (const p of particles) {
    const t = p.life / p.maxLife;
    ctx.globalAlpha = Math.min(1, t * 1.6) * 0.85;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.pos.x, p.pos.y, p.size * (1.4 - t * 0.4), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
