import { HEAD_OFFSET, HEAD_RADIUS, toWorld } from '../engine/summit-constants';
import type { Vec2, CarFragment } from '../engine/summit-types';

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
  fragments?: CarFragment[];
}

const TIRE = '#1f2430';
const TIRE_TREAD = '#3a4150';
const RIM = '#e2e8f0';
const HUB = '#f59e0b';
const vehicleImages: Record<string, HTMLImageElement> = {};

function getVehicleImage(modelId: string): HTMLImageElement | null {
  if (typeof window === 'undefined') return null;
  if (vehicleImages[modelId]) return vehicleImages[modelId];

  const img = new Image();
  img.src = `/images/vehicles/${modelId}.png`;
  vehicleImages[modelId] = img;
  return img;
}

const SPRITE_CONFIGS: Record<string, { width: number; xOffset: number; yOffset: number }> = {
  buggy: { width: 3.4, xOffset: -1.7, yOffset: 0.15 },
  climber: { width: 3.6, xOffset: -1.8, yOffset: 0.3 },
  speedster: { width: 3.6, xOffset: -1.8, yOffset: 0.2 },
};

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
  
  // Brake Caliper (static, does not rotate with wheel)
  ctx.save();
  ctx.rotate(-w.angle); // counteract wheel rotation so it stays fixed relative to car... wait, wheel is rotated directly! 
  // Actually, w.angle is the visual rotation of the wheel in world space.
  // We want the caliper to be upright in the car's space. We don't have the car's angle here.
  // We'll just keep it upright in world space.
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ef4444'; // Red brembo caliper
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.42, -Math.PI / 6, Math.PI / 6);
  ctx.lineTo(r * 0.3, Math.PI / 6);
  ctx.arc(0, 0, r * 0.3, Math.PI / 6, -Math.PI / 6, true);
  ctx.fill();
  ctx.restore();

  ctx.rotate(w.angle);
  
  // Tire outer
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  
  // Aggressive off-road tread
  ctx.fillStyle = '#1f2937';
  for (let i = 0; i < 14; i++) {
    const a = (i / 14) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(r * 0.8, -0.08);
    ctx.lineTo(r * 1.05, -0.04);
    ctx.lineTo(r * 1.05, 0.04);
    ctx.lineTo(r * 0.8, 0.08);
    ctx.fill();
    ctx.restore();
  }
  
  // Tire inner sidewall ring
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 0.04;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.75, 0, Math.PI * 2);
  ctx.stroke();

  // Rim background (dark)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.fill();
  
  // Spokes (positive metallic)
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 0.12;
  ctx.lineCap = 'round';
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(r * 0.15, 0);
    ctx.lineTo(r * 0.5, 0);
    ctx.stroke();
    ctx.restore();
  }
  
  // Outer Rim edge
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 0.06;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
  ctx.stroke();

  // Hub cap
  ctx.fillStyle = HUB;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#cbd5e1';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.05, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

function drawDriver(
  ctx: CanvasRenderingContext2D,
  livery: Livery,
  crashed: boolean,
  modelId: string,
  squash: number = 0,
  distance: number = 0
): void {
  const driverY = modelId === 'speedster' ? -0.2 : modelId === 'climber' ? -0.05 : 0;
  ctx.save();
  ctx.translate(0, driverY);
  
  // Legs (Dark pants)
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 0.16;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(-0.15, 0.38); // Hip
  ctx.lineTo(0.2, 0.15); // Knee
  // Foot (if crashed, legs flail)
  if (crashed) {
    ctx.lineTo(0.4, 0.4);
  } else {
    ctx.lineTo(0.4, 0.1); 
  }
  ctx.stroke();

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

  const HELMET = '#f8fafc';
  const VISOR = '#0f172a';

  // Head bobbing based on distance and squash
  const bobX = crashed ? 0 : Math.sin(distance * 3) * 0.03 + squash * 0.1;
  const bobY = crashed ? 0 : Math.abs(Math.cos(distance * 3)) * 0.04 - squash * 0.2;
  const hx = HEAD_OFFSET.x + bobX;
  const hy = HEAD_OFFSET.y + bobY;

  ctx.fillStyle = HELMET;
  ctx.beginPath();
  ctx.arc(hx, hy, HEAD_RADIUS, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = livery.trim;
  ctx.fillRect(hx - HEAD_RADIUS * 0.95, hy + 0.02, HEAD_RADIUS * 1.2, 0.07);
  ctx.fillStyle = crashed ? '#ef4444' : VISOR;
  ctx.beginPath();
  ctx.ellipse(hx + 0.12, hy - 0.02, 0.14, 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function drawVehicle(
  ctx: CanvasRenderingContext2D,
  v: VehiclePose,
  crashed: boolean,
  livery: Livery = PLAYER_LIVERY,
  modelId: string = 'buggy'
): void {
  if (!crashed) {
    for (const w of v.wheels) drawStrut(ctx, v, w);
  }
  
  if (v.fragments && v.fragments.length > 0) {
    const img = getVehicleImage(modelId);
    if (img && img.complete && img.naturalWidth > 0) {
      const config = SPRITE_CONFIGS[modelId] || { width: 3.4, xOffset: -1.7, yOffset: 0.2 };
      const width = config.width;
      const height = width * (img.naturalHeight / img.naturalWidth);
      const centerY = -config.yOffset;
      const drawY = centerY - height / 2;

      for (const f of v.fragments) {
        ctx.save();
        ctx.translate(f.pos.x, f.pos.y);
        ctx.rotate(f.angle);
        
        if (f.partId === 'driver') {
          drawDriver(ctx, livery, true, modelId, 0, f.pos.x);
        } else {
          ctx.scale(1, -1); // flip back for image drawing
          
          const sx = f.nx * img.naturalWidth;
          const sy = f.ny * img.naturalHeight;
          const sw = f.nw * img.naturalWidth;
          const sh = f.nh * img.naturalHeight;
          
          const dx = config.xOffset + f.nx * width;
          const dy = drawY + f.ny * height;
          const dw = f.nw * width;
          const dh = f.nh * height;
          
          ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh);
        }
        ctx.restore();
      }
    }
  } else {
    ctx.save();
    ctx.translate(v.pos.x, v.pos.y);
    ctx.rotate(v.angle);
    ctx.scale(1 + v.squash * 0.05, 1 - v.squash * 0.1);
    
    // Draw driver behind the image! For the Buggy, the windows are transparent,
    // so the driver will sit perfectly behind the roll cage.
    drawDriver(ctx, livery, crashed, modelId, v.squash, v.pos.x);

    const img = getVehicleImage(modelId);
    if (img && img.complete && img.naturalWidth > 0) {
      const config = SPRITE_CONFIGS[modelId] || { width: 3.4, xOffset: -1.7, yOffset: 0.2 };
      const width = config.width;
      const height = width * (img.naturalHeight / img.naturalWidth);
      
      ctx.save();
      ctx.scale(1, -1);
      const centerY = -config.yOffset;
      const drawY = centerY - height / 2;
      ctx.drawImage(img, config.xOffset, drawY, width, height);
      ctx.restore();
    }
    
    ctx.restore();
  }
  
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
