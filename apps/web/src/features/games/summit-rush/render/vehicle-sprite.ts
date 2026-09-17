import { HEAD_OFFSET, HEAD_RADIUS, toWorld } from '../engine/summit-constants';
import type { Vec2 } from '../engine/summit-types';

export interface Livery {
  body: string;
  shade: string;
  trim: string;
  cage: string;
  jacket: string;
}

export const PLAYER_LIVERY: Livery = {
  body: '#14b8a6',
  shade: '#0f766e',
  trim: '#f59e0b',
  cage: '#f97316',
  jacket: '#3b82f6',
};

export const RIVAL_LIVERY: Livery = {
  body: '#e879f9',
  shade: '#a21caf',
  trim: '#fde047',
  cage: '#6366f1',
  jacket: '#f43f5e',
};

/** The subset of vehicle state needed to draw one — live vehicles and ghosts both fit. */
export interface WheelPose {
  pos: Vec2;
  angle: number;
  radius: number;
  mount: Vec2;
}

export interface VehiclePose {
  pos: Vec2;
  angle: number;
  squash: number;
  wheels: readonly WheelPose[];
}

const TIRE = '#1f2430';
const TIRE_TREAD = '#3a4150';
const RIM = '#e2e8f0';
const HUB = '#f59e0b';
const HELMET = '#f8fafc';
const VISOR = '#0f172a';

const BODY_SHAPE: readonly Vec2[] = [
  { x: -1.5, y: -0.02 },
  { x: 1.4, y: -0.02 },
  { x: 1.64, y: 0.22 },
  { x: 1.56, y: 0.5 },
  { x: 0.6, y: 0.54 },
  { x: 0.34, y: 0.4 },
  { x: -0.55, y: 0.4 },
  { x: -0.78, y: 0.56 },
  { x: -1.52, y: 0.56 },
];

function polygon(ctx: CanvasRenderingContext2D, pts: readonly Vec2[]): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();
}

function drawStrut(ctx: CanvasRenderingContext2D, v: VehiclePose, w: WheelPose): void {
  const anchor = toWorld(v.pos, v.angle, w.mount);
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 0.14;
  ctx.beginPath();
  ctx.moveTo(anchor.x, anchor.y);
  ctx.lineTo(w.pos.x, w.pos.y);
  ctx.stroke();
  // Coil spring zig-zag.
  const dx = w.pos.x - anchor.x;
  const dy = w.pos.y - anchor.y;
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 0.05;
  ctx.beginPath();
  const coils = 7;
  for (let i = 0; i <= coils; i++) {
    const t = 0.1 + (i / coils) * 0.6;
    const side = i % 2 === 0 ? 0.11 : -0.11;
    const px = anchor.x + dx * t + nx * side;
    const py = anchor.y + dy * t + ny * side;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
}

function drawWheel(ctx: CanvasRenderingContext2D, w: WheelPose): void {
  const r = w.radius;
  ctx.save();
  ctx.translate(w.pos.x, w.pos.y);
  ctx.rotate(w.angle);
  ctx.fillStyle = TIRE;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  // Chunky tread blocks make the rotation readable at speed.
  ctx.fillStyle = TIRE_TREAD;
  for (let i = 0; i < 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.fillRect(r * 0.78, -0.05, r * 0.22, 0.1);
    ctx.restore();
  }
  ctx.fillStyle = RIM;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.52, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 0.05;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.moveTo(0, 0);
    ctx.lineTo(Math.cos(a) * r * 0.48, Math.sin(a) * r * 0.48);
  }
  ctx.stroke();
  ctx.fillStyle = HUB;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawDriver(ctx: CanvasRenderingContext2D, livery: Livery, crashed: boolean): void {
  // Torso and arm reaching for the wheel.
  ctx.fillStyle = livery.jacket;
  ctx.beginPath();
  ctx.moveTo(-0.42, 0.38);
  ctx.lineTo(0.02, 0.38);
  ctx.lineTo(-0.02, 0.92);
  ctx.lineTo(-0.32, 0.92);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = livery.jacket;
  ctx.lineWidth = 0.12;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-0.1, 0.82);
  ctx.lineTo(0.28, 0.62);
  ctx.stroke();
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 0.07;
  ctx.beginPath();
  ctx.moveTo(0.22, 0.46);
  ctx.lineTo(0.36, 0.72);
  ctx.stroke();

  const { x, y } = HEAD_OFFSET;
  ctx.fillStyle = HELMET;
  ctx.beginPath();
  ctx.arc(x, y, HEAD_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = livery.trim;
  ctx.fillRect(x - HEAD_RADIUS * 0.95, y + 0.02, HEAD_RADIUS * 1.2, 0.07);
  ctx.fillStyle = crashed ? '#ef4444' : VISOR;
  ctx.beginPath();
  ctx.ellipse(x + 0.12, y - 0.02, 0.14, 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
}

function drawBody(ctx: CanvasRenderingContext2D, livery: Livery): void {
  // Roll cage behind the driver.
  ctx.strokeStyle = livery.cage;
  ctx.lineWidth = 0.09;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-0.72, 0.5);
  ctx.lineTo(-0.62, 1.18);
  ctx.lineTo(0.3, 1.18);
  ctx.lineTo(0.62, 0.52);
  ctx.moveTo(-0.62, 1.18);
  ctx.lineTo(-1.2, 0.56);
  ctx.stroke();

  // Engine block and exhaust.
  ctx.fillStyle = '#475569';
  ctx.fillRect(-1.48, 0.52, 0.5, 0.22);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-1.66, 0.58, 0.24, 0.08);

  polygon(ctx, BODY_SHAPE);
  ctx.fillStyle = livery.body;
  ctx.fill();
  ctx.fillStyle = livery.shade;
  ctx.fillRect(-1.5, -0.02, 2.95, 0.16);
  ctx.fillStyle = livery.trim;
  ctx.fillRect(-1.45, 0.26, 1.0, 0.07);
  ctx.fillRect(0.72, 0.3, 0.8, 0.07);

  // Fenders over the wheels.
  ctx.strokeStyle = livery.shade;
  ctx.lineWidth = 0.12;
  for (const fx of [-1.02, 1.08]) {
    ctx.beginPath();
    ctx.arc(fx, -0.1, 0.56, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  // Headlight.
  ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  ctx.arc(1.54, 0.34, 0.08, 0, Math.PI * 2);
  ctx.fill();
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: VehiclePose,
  crashed: boolean,
  livery: Livery = PLAYER_LIVERY,
): void {
  for (const w of v.wheels) drawStrut(ctx, v, w);
  ctx.save();
  ctx.translate(v.pos.x, v.pos.y);
  ctx.rotate(v.angle);
  ctx.scale(1 + v.squash * 0.05, 1 - v.squash * 0.1);
  drawDriver(ctx, livery, crashed);
  drawBody(ctx, livery);
  ctx.restore();
  for (const w of v.wheels) drawWheel(ctx, w);
}

/** Cartoon stars circling the helmet after a bonk. */
export function drawDizzyStars(ctx: CanvasRenderingContext2D, v: VehiclePose, time: number): void {
  const head = toWorld(v.pos, v.angle, HEAD_OFFSET);
  ctx.fillStyle = '#fde047';
  for (let i = 0; i < 3; i++) {
    const a = time * 5 + (i / 3) * Math.PI * 2;
    const x = head.x + Math.cos(a) * 0.5;
    const y = head.y + 0.45 + Math.sin(a) * 0.15;
    ctx.beginPath();
    for (let k = 0; k < 10; k++) {
      const rr = k % 2 === 0 ? 0.13 : 0.055;
      const ang = (k / 10) * Math.PI * 2 + Math.PI / 2;
      ctx.lineTo(x + Math.cos(ang) * rr, y + Math.sin(ang) * rr);
    }
    ctx.closePath();
    ctx.fill();
  }
}
