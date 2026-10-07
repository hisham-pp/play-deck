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

const BUGGY_SHAPE: readonly Vec2[] = [
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

const SPEEDSTER_SHAPE: readonly Vec2[] = [
  { x: -1.4, y: -0.05 },
  { x: 1.6, y: -0.05 },
  { x: 1.8, y: 0.15 }, // Sharp nose
  { x: 1.4, y: 0.3 },  // Low hood
  { x: 0.6, y: 0.35 }, 
  { x: 0.2, y: 0.4 },  // Cockpit
  { x: -0.6, y: 0.4 },
  { x: -1.2, y: 0.45 },
  { x: -1.5, y: 0.3 }, // Spoiler mount
];

const CLIMBER_SHAPE: readonly Vec2[] = [
  { x: -1.6, y: -0.05 },
  { x: 1.4, y: -0.05 },
  { x: 1.5, y: 0.4 },  // Tall flat front
  { x: 1.3, y: 0.65 }, // High hood
  { x: 0.7, y: 0.7 },
  { x: 0.4, y: 0.4 },  // Cockpit cut
  { x: -0.6, y: 0.4 },
  { x: -1.5, y: 0.7 }, // High flat back
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

const vehicleImages: Record<string, HTMLImageElement> = {};

function getVehicleImage(modelId: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (vehicleImages[modelId]) return vehicleImages[modelId];

  const img = new Image();
  img.src = `/images/vehicles/${modelId}.png`;
  vehicleImages[modelId] = img;
  return img;
}

function drawBody(ctx: CanvasRenderingContext2D, livery: Livery, modelId: string): void {
  const img = getVehicleImage(modelId);
  if (img && img.complete && img.naturalWidth > 0) {
    // Determine bounds to roughly align the image wheels with the physics wheels
    // Physics wheels are at roughly x=-0.9 and x=1.0. Radius 0.4.
    // Typical image width should be about 4 meters to cover x from -1.8 to 2.2
    const width = 4.2;
    const height = width * (img.naturalHeight / img.naturalWidth);
    // The physics canvas has Y pointing UP. drawImage expects +Y to point DOWN.
    // We flip the Y axis locally so the image draws right-side up.
    ctx.save();
    ctx.scale(1, -1);
    // Draw the image. The physics y=-0.4 becomes y=0.4 in the flipped space.
    // We want the bottom of the image to sit at y=0.4, so the top is at 0.4 - height.
    ctx.drawImage(img, -2.1, 0.4 - height, width, height);
    ctx.restore();
    return;
  }

  // Fallback to polygons if the image hasn't loaded yet!
  // Roll cage behind the driver.
  ctx.strokeStyle = livery.cage;
  ctx.lineWidth = 0.09;
  ctx.lineJoin = 'round';
  
  if (modelId === 'climber') {
    // Tall, boxy SUV cage
    ctx.beginPath();
    ctx.moveTo(-0.7, 0.6);
    ctx.lineTo(-0.6, 1.25);
    ctx.lineTo(0.35, 1.25);
    ctx.lineTo(0.65, 0.65);
    ctx.moveTo(-0.6, 1.25);
    ctx.lineTo(-1.3, 0.65);
    ctx.stroke();
    // Extra roof rack bars
    ctx.lineWidth = 0.05;
    ctx.beginPath();
    ctx.moveTo(-0.5, 1.3);
    ctx.lineTo(0.2, 1.3);
    ctx.moveTo(-0.4, 1.25);
    ctx.lineTo(-0.4, 1.3);
    ctx.moveTo(0.1, 1.25);
    ctx.lineTo(0.1, 1.3);
    ctx.stroke();
  } else if (modelId === 'speedster') {
    // Low slanted cage
    ctx.beginPath();
    ctx.moveTo(-0.8, 0.4);
    ctx.lineTo(-0.5, 1.05);
    ctx.lineTo(0.2, 1.05);
    ctx.lineTo(0.5, 0.4);
    ctx.moveTo(-0.5, 1.05);
    ctx.lineTo(-1.1, 0.4);
    ctx.stroke();
    // Spoiler
    ctx.fillStyle = livery.trim;
    ctx.fillRect(-1.7, 0.5, 0.5, 0.05);
    ctx.strokeStyle = livery.cage;
    ctx.beginPath();
    ctx.moveTo(-1.45, 0.3);
    ctx.lineTo(-1.45, 0.5);
    ctx.stroke();
  } else {
    // Default Buggy Cage
    ctx.beginPath();
    ctx.moveTo(-0.72, 0.5);
    ctx.lineTo(-0.62, 1.18);
    ctx.lineTo(0.3, 1.18);
    ctx.lineTo(0.62, 0.52);
    ctx.moveTo(-0.62, 1.18);
    ctx.lineTo(-1.2, 0.56);
    ctx.stroke();
  }

  // Engine block and exhaust.
  ctx.fillStyle = '#475569';
  ctx.fillRect(-1.48, 0.52, 0.5, 0.22);
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(-1.66, 0.58, 0.24, 0.08);
  
  // Exhaust pipe detailing
  ctx.fillStyle = '#1e293b'; // Pipe hole
  ctx.beginPath();
  ctx.arc(-1.66, 0.62, 0.03, 0, Math.PI * 2);
  ctx.fill();

  const shape = modelId === 'speedster' ? SPEEDSTER_SHAPE : modelId === 'climber' ? CLIMBER_SHAPE : BUGGY_SHAPE;
  polygon(ctx, shape);
  
  ctx.fillStyle = livery.body;
  ctx.fill();
  
  // Lower body shading
  ctx.fillStyle = livery.shade;
  ctx.fillRect(-1.5, -0.05, 3.1, 0.18);
  
  // Custom trim and styling
  ctx.fillStyle = livery.trim;
  if (modelId === 'climber') {
    ctx.fillRect(-1.4, 0.3, 1.0, 0.1);
    ctx.fillRect(0.6, 0.35, 0.8, 0.1);
    // Extra door lines
    ctx.strokeStyle = livery.shade;
    ctx.lineWidth = 0.04;
    ctx.strokeRect(-0.6, 0.15, 0.8, 0.4); // Back door
    ctx.strokeRect(0.25, 0.15, 0.5, 0.4); // Front door
  } else if (modelId === 'speedster') {
    // Racing stripes
    ctx.fillRect(-1.4, 0.15, 3.0, 0.08);
    ctx.fillStyle = '#fff';
    ctx.fillRect(-1.4, 0.23, 3.0, 0.03);
    // Vents
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-0.8, 0.28, 0.1, 0.1);
    ctx.fillRect(-0.65, 0.28, 0.1, 0.1);
  } else {
    // Buggy trim
    ctx.fillRect(-1.45, 0.26, 1.0, 0.07);
    ctx.fillRect(0.72, 0.3, 0.8, 0.07);
    // Vent
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-0.8, 0.2, 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fenders over the wheels.
  ctx.strokeStyle = '#1e293b'; // Dark fenders
  ctx.lineWidth = 0.14;
  for (const fx of [-1.02, 1.08]) {
    ctx.beginPath();
    ctx.arc(fx, -0.1, 0.56, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }
  
  // Headlight & glow
  ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  if (modelId === 'speedster') {
    ctx.ellipse(1.5, 0.25, 0.15, 0.05, 0.2, 0, Math.PI * 2);
  } else if (modelId === 'climber') {
    ctx.fillRect(1.42, 0.45, 0.1, 0.15); // Square lights
  } else {
    ctx.arc(1.54, 0.34, 0.08, 0, Math.PI * 2); // Round
  }
  ctx.fill();

  // Tail light
  ctx.fillStyle = '#ef4444';
  if (modelId === 'climber') {
    ctx.fillRect(-1.6, 0.4, 0.08, 0.15);
  } else {
    ctx.beginPath();
    ctx.arc(-1.48, 0.3, 0.05, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: VehiclePose,
  crashed: boolean,
  livery: Livery = PLAYER_LIVERY,
  modelId: string = 'buggy'
): void {
  for (const w of v.wheels) drawStrut(ctx, v, w);
  ctx.save();
  ctx.translate(v.pos.x, v.pos.y);
  ctx.rotate(v.angle);
  ctx.scale(1 + v.squash * 0.05, 1 - v.squash * 0.1);
  drawDriver(ctx, livery, crashed);
  drawBody(ctx, livery, modelId);
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
