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
const HELMET = '#f8fafc';
const VISOR = '#0f172a';

function drawChassisShape(ctx: CanvasRenderingContext2D, modelId: string) {
  ctx.beginPath();
  if (modelId === 'buggy') {
    ctx.moveTo(-1.5, -0.05);
    ctx.lineTo(1.3, -0.05);
    ctx.quadraticCurveTo(1.6, -0.05, 1.65, 0.2);
    ctx.lineTo(1.56, 0.5);
    ctx.quadraticCurveTo(1.2, 0.55, 0.6, 0.54);
    ctx.quadraticCurveTo(0.4, 0.5, 0.34, 0.4);
    ctx.lineTo(-0.55, 0.4);
    ctx.quadraticCurveTo(-0.7, 0.4, -0.78, 0.56);
    ctx.lineTo(-1.45, 0.56);
    ctx.quadraticCurveTo(-1.52, 0.56, -1.52, 0.4);
    ctx.lineTo(-1.5, -0.05);
  } else if (modelId === 'speedster') {
    ctx.moveTo(-1.4, -0.05);
    ctx.lineTo(1.6, -0.05);
    ctx.bezierCurveTo(1.8, -0.05, 1.9, 0.1, 1.8, 0.15);
    ctx.quadraticCurveTo(1.6, 0.2, 1.4, 0.3);
    ctx.lineTo(0.6, 0.35);
    ctx.quadraticCurveTo(0.4, 0.38, 0.2, 0.4);
    ctx.lineTo(-0.6, 0.4);
    ctx.quadraticCurveTo(-1.0, 0.42, -1.2, 0.45);
    ctx.lineTo(-1.5, 0.3);
    ctx.lineTo(-1.4, -0.05);
  } else if (modelId === 'climber') {
    ctx.moveTo(-1.6, -0.05);
    ctx.lineTo(1.4, -0.05);
    ctx.quadraticCurveTo(1.5, -0.05, 1.5, 0.1);
    ctx.lineTo(1.5, 0.4);
    ctx.quadraticCurveTo(1.4, 0.65, 1.3, 0.65);
    ctx.lineTo(0.7, 0.7);
    ctx.quadraticCurveTo(0.5, 0.7, 0.4, 0.4);
    ctx.lineTo(-0.6, 0.4);
    ctx.quadraticCurveTo(-1.4, 0.4, -1.5, 0.7);
    ctx.lineTo(-1.6, 0.6);
    ctx.lineTo(-1.6, -0.05);
  }
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

function drawDriver(ctx: CanvasRenderingContext2D, livery: Livery, crashed: boolean, modelId: string): void {
  const driverY = modelId === 'speedster' ? -0.2 : modelId === 'climber' ? -0.05 : 0;
  ctx.save();
  ctx.translate(0, driverY);
  
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
  ctx.restore();
}

function drawCarPart(ctx: CanvasRenderingContext2D, livery: Livery, modelId: string, partId: string): void {
  const isSpeedster = modelId === 'speedster';
  const isClimber = modelId === 'climber';

  if (partId === 'chassis') {
    // Main body with metallic gradient
    const grad = ctx.createLinearGradient(-1.5, 0.6, 1.5, -0.2);
    grad.addColorStop(0, livery.body);
    grad.addColorStop(0.3, livery.body);
    grad.addColorStop(1, livery.shade);
    
    ctx.fillStyle = grad;
    drawChassisShape(ctx, modelId);
    ctx.fill();
    
    // Lower body shading
    ctx.fillStyle = livery.shade;
    ctx.fillRect(-1.5, -0.05, 3.1, 0.18);
    
    // Custom trim and styling
    ctx.fillStyle = livery.trim;
    if (isClimber) {
      ctx.fillRect(-1.4, 0.3, 1.0, 0.1);
      ctx.fillRect(0.6, 0.35, 0.8, 0.1);
      ctx.strokeStyle = livery.shade;
      ctx.lineWidth = 0.04;
      ctx.strokeRect(-0.6, 0.15, 0.8, 0.4); 
      ctx.strokeRect(0.25, 0.15, 0.5, 0.4); 
    } else if (isSpeedster) {
      ctx.fillRect(-1.4, 0.15, 3.0, 0.08);
      ctx.fillStyle = '#fff';
      ctx.fillRect(-1.4, 0.23, 3.0, 0.03);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-0.8, 0.28, 0.1, 0.1);
      ctx.fillRect(-0.65, 0.28, 0.1, 0.1);
    } else {
      ctx.fillRect(-1.45, 0.26, 1.0, 0.07);
      ctx.fillRect(0.72, 0.3, 0.8, 0.07);
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(-0.8, 0.2, 0.1, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fenders
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 0.18;
    for (const fx of [-1.02, 1.08]) {
      ctx.beginPath();
      ctx.arc(fx, -0.1, 0.56, 0.2, Math.PI - 0.2);
      ctx.stroke();
      // Inner fender shadow
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 0.08;
      ctx.beginPath();
      ctx.arc(fx, -0.1, 0.48, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }
    
    // Panel lines (doors, hood)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 0.03;
    ctx.beginPath();
    if (isClimber) {
      ctx.moveTo(-0.6, 0.4); ctx.lineTo(-0.6, 0); // back door seam
      ctx.moveTo(0.25, 0.4); ctx.lineTo(0.25, 0); // front door seam
      ctx.moveTo(1.2, 0.4); ctx.lineTo(1.2, 0.1); // hood seam
    } else if (isSpeedster) {
      ctx.moveTo(-0.2, 0.4); ctx.lineTo(-0.2, 0); // door seam
      ctx.moveTo(0.9, 0.35); ctx.lineTo(1.2, 0.2); // hood seam
    } else {
      ctx.moveTo(-0.4, 0.4); ctx.lineTo(-0.4, 0); // buggy panel
      ctx.moveTo(0.4, 0.45); ctx.lineTo(0.6, 0.1); // buggy hood
    }
    ctx.stroke();
    
    // Windows for enclosed cars
    if (isClimber) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
      ctx.beginPath();
      ctx.moveTo(-0.5, 0.4);
      ctx.lineTo(-0.5, 0.6);
      ctx.lineTo(0.3, 0.6);
      ctx.lineTo(0.3, 0.4);
      ctx.fill();
    } else if (isSpeedster) {
      ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
      ctx.beginPath();
      ctx.moveTo(0.2, 0.4);
      ctx.lineTo(0.6, 0.4);
      ctx.lineTo(0.9, 0.3);
      ctx.lineTo(0.5, 0.3);
      ctx.fill();
    }
    
    // Decals & Text
    ctx.save();
    ctx.scale(1, -1); // Flip text to be upright in physics space
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (isClimber) {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 0.2px sans-serif';
      ctx.fillText('4x4', -1.0, -0.15);
      ctx.font = '900 0.15px sans-serif';
      ctx.fillStyle = livery.trim;
      ctx.fillText('MNTN', -1.0, -0.35);
    } else if (isSpeedster) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'italic 900 0.25px sans-serif';
      ctx.fillText('99', 0, -0.15);
      ctx.fillStyle = livery.trim;
      ctx.font = '900 0.1px sans-serif';
      ctx.fillText('TURBO', 0.8, -0.2);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 0.2px sans-serif';
      ctx.fillText('77', -0.2, -0.2);
      ctx.fillStyle = livery.trim;
      ctx.beginPath();
      ctx.arc(-1.1, -0.25, 0.08, 0, Math.PI*2);
      ctx.fill();
    }
    ctx.restore();
    
    // Lights
    ctx.fillStyle = '#fef9c3';
    ctx.beginPath();
    if (isSpeedster) {
      ctx.ellipse(1.5, 0.25, 0.15, 0.05, 0.2, 0, Math.PI * 2);
    } else if (isClimber) {
      ctx.fillRect(1.42, 0.45, 0.1, 0.15);
    } else {
      ctx.arc(1.54, 0.34, 0.08, 0, Math.PI * 2);
    }
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    if (isClimber) {
      ctx.fillRect(-1.6, 0.4, 0.08, 0.15);
    } else {
      ctx.beginPath();
      ctx.arc(-1.48, 0.3, 0.05, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (partId === 'roof') {
    ctx.strokeStyle = livery.cage;
    ctx.lineWidth = 0.09;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    if (isClimber) {
      ctx.beginPath();
      ctx.moveTo(-0.7, 0.6);
      ctx.lineTo(-0.6, 1.25);
      ctx.lineTo(0.35, 1.25);
      ctx.lineTo(0.65, 0.65);
      ctx.moveTo(-0.6, 1.25);
      ctx.lineTo(-1.3, 0.65);
      ctx.stroke();
      ctx.lineWidth = 0.05;
      ctx.beginPath();
      ctx.moveTo(-0.5, 1.3);
      ctx.lineTo(0.2, 1.3);
      ctx.moveTo(-0.4, 1.25);
      ctx.lineTo(-0.4, 1.3);
      ctx.moveTo(0.1, 1.25);
      ctx.lineTo(0.1, 1.3);
      ctx.stroke();
    } else if (isSpeedster) {
      ctx.beginPath();
      ctx.moveTo(-0.8, 0.4);
      ctx.lineTo(-0.5, 1.05);
      ctx.lineTo(0.2, 1.05);
      ctx.lineTo(0.5, 0.4);
      ctx.moveTo(-0.5, 1.05);
      ctx.lineTo(-1.1, 0.4);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(-0.72, 0.5);
      ctx.lineTo(-0.62, 1.18);
      ctx.lineTo(0.3, 1.18);
      ctx.lineTo(0.62, 0.52);
      ctx.moveTo(-0.62, 1.18);
      ctx.lineTo(-1.2, 0.56);
      ctx.stroke();
    }
  } else if (partId === 'engine') {
    ctx.fillStyle = '#475569';
    ctx.fillRect(-1.48, 0.52, 0.5, 0.22);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-1.66, 0.58, 0.24, 0.08);
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(-1.66, 0.62, 0.03, 0, Math.PI * 2);
    ctx.fill();
  } else if (partId === 'spoiler') {
    if (isSpeedster) {
      ctx.fillStyle = livery.trim;
      ctx.fillRect(-1.7, 0.5, 0.5, 0.05);
      ctx.strokeStyle = livery.cage;
      ctx.lineWidth = 0.09;
      ctx.beginPath();
      ctx.moveTo(-1.45, 0.3);
      ctx.lineTo(-1.45, 0.5);
      ctx.stroke();
    }
  } else if (partId === 'driver') {
    drawDriver(ctx, livery, true, modelId);
  }
}

function drawBody(ctx: CanvasRenderingContext2D, livery: Livery, modelId: string): void {
  drawCarPart(ctx, livery, modelId, 'roof');
  drawCarPart(ctx, livery, modelId, 'engine');
  drawCarPart(ctx, livery, modelId, 'spoiler');
  drawCarPart(ctx, livery, modelId, 'chassis');
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
    for (const f of v.fragments) {
      ctx.save();
      ctx.translate(f.pos.x, f.pos.y);
      ctx.rotate(f.angle);
      drawCarPart(ctx, livery, modelId, f.partId);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.translate(v.pos.x, v.pos.y);
    ctx.rotate(v.angle);
    ctx.scale(1 + v.squash * 0.05, 1 - v.squash * 0.1);
    drawDriver(ctx, livery, crashed, modelId);
    drawBody(ctx, livery, modelId);
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
