'use client';

import React, { useEffect, useRef } from 'react';
import type {
  ConveyorGameState,
  ConveyorSegment,
  MachineObject,
  MachineObstacle,
} from '../engine/conveyor-types';

interface HumanConveyorCanvasProps {
  gameState: ConveyorGameState;
  localSeatIndex: number | null;
}

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 600;

export function HumanConveyorCanvas({ gameState, localSeatIndex }: HumanConveyorCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let renderTick = 0;

    const render = () => {
      renderTick++;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawBackground(ctx, gameState.layout.hazardY);
      drawObstacles(ctx, gameState.layout.obstacles, renderTick);
      drawSpawnChute(ctx, gameState.layout.spawnPoint);
      drawDeliveryHopper(ctx, gameState.layout.targetZone, renderTick);

      // Render conveyor platforms
      for (const seg of gameState.segments) {
        drawConveyorSegment(ctx, seg, seg.seatIndex === localSeatIndex, renderTick);
      }

      // Render moving objects
      for (const obj of gameState.objects) {
        drawMachineObject(ctx, obj);
      }

      // Render hazard floor
      drawHazardFloor(ctx, gameState.layout.hazardY, renderTick);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, localSeatIndex]);

  return (
    <div className="relative w-full aspect-[16/10] bg-[#070b14] rounded-2xl overflow-hidden border border-[#1e293b] shadow-2xl">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full object-contain block"
      />
    </div>
  );
}

function drawBackground(ctx: CanvasRenderingContext2D, hazardY: number) {
  // Industrial foundry background gradient
  const bgGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
  bgGrad.addColorStop(0, '#090e1a');
  bgGrad.addColorStop(0.6, '#0f172a');
  bgGrad.addColorStop(1, '#05070d');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // Subtle factory grid scanlines
  ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
  ctx.lineWidth = 1;
  for (let x = 0; x < CANVAS_WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, hazardY);
    ctx.stroke();
  }
  for (let y = 0; y < hazardY; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(CANVAS_WIDTH, y);
    ctx.stroke();
  }
}

function drawSpawnChute(
  ctx: CanvasRenderingContext2D,
  spawn: { x: number; y: number; vx: number },
) {
  ctx.save();
  ctx.fillStyle = '#334155';
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 3;

  // Hopper chute mouth
  ctx.beginPath();
  ctx.moveTo(spawn.x - 30, spawn.y - 60);
  ctx.lineTo(spawn.x + 35, spawn.y - 60);
  ctx.lineTo(spawn.x + 20, spawn.y + 10);
  ctx.lineTo(spawn.x - 15, spawn.y + 10);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glow beacon
  ctx.fillStyle = '#10b981';
  ctx.beginPath();
  ctx.arc(spawn.x + 2, spawn.y - 45, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawDeliveryHopper(
  ctx: CanvasRenderingContext2D,
  target: { x: number; y: number; width: number; height: number; label: string },
  tick: number,
) {
  ctx.save();
  const pulse = Math.sin(tick * 0.08) * 0.2 + 0.8;

  // Hopper basket container
  ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
  ctx.strokeStyle = `rgba(16, 185, 129, ${pulse})`;
  ctx.lineWidth = 3;
  ctx.strokeRect(target.x, target.y, target.width, target.height);
  ctx.fillRect(target.x, target.y, target.width, target.height);

  // Chevron indicator pointing inward
  ctx.strokeStyle = '#34d399';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(target.x + 20, target.y + target.height / 2 - 15);
  ctx.lineTo(target.x + 45, target.y + target.height / 2);
  ctx.lineTo(target.x + 20, target.y + target.height / 2 + 15);
  ctx.stroke();

  // Label text
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.fillStyle = '#10b981';
  ctx.textAlign = 'center';
  ctx.fillText(target.label, target.x + target.width / 2, target.y - 8);

  ctx.restore();
}

function drawHazardFloor(ctx: CanvasRenderingContext2D, hazardY: number, tick: number) {
  ctx.save();
  const height = CANVAS_HEIGHT - hazardY;

  // Warning hazard zone
  ctx.fillStyle = '#450a0a';
  ctx.fillRect(0, hazardY, CANVAS_WIDTH, height);

  // Hazard striped caution bar
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, hazardY, CANVAS_WIDTH, 14);
  ctx.clip();

  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, hazardY, CANVAS_WIDTH, 14);

  ctx.fillStyle = '#111827';
  const offset = (tick * 0.8) % 24;
  for (let x = -offset; x < CANVAS_WIDTH + 24; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, hazardY);
    ctx.lineTo(x + 12, hazardY);
    ctx.lineTo(x - 2, hazardY + 14);
    ctx.lineTo(x - 14, hazardY + 14);
    ctx.fill();
  }
  ctx.restore();

  // Warning text
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
  ctx.textAlign = 'center';
  ctx.fillText('CRUSH HAZARD PIT — KEEP PLATFORMS ALIGNED', CANVAS_WIDTH / 2, hazardY + 36);

  ctx.restore();
}

function drawObstacles(ctx: CanvasRenderingContext2D, obstacles: MachineObstacle[], tick: number) {
  for (const obs of obstacles) {
    if (obs.type === 'gear') {
      drawGear(ctx, obs, tick);
    } else if (obs.type === 'wind_tunnel') {
      drawWindTunnel(ctx, obs, tick);
    }
  }
}

function drawGear(ctx: CanvasRenderingContext2D, gear: MachineObstacle, tick: number) {
  ctx.save();
  const r = gear.radius ?? 35;
  const rot = (gear.rotationSpeed ?? 2) * tick * 0.03;

  ctx.translate(gear.x, gear.y);
  ctx.rotate(rot);

  // Outer gear teeth
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 2;

  const teeth = 8;
  for (let i = 0; i < teeth; i++) {
    const a = (i * Math.PI * 2) / teeth;
    ctx.save();
    ctx.rotate(a);
    ctx.fillRect(-6, -r - 6, 12, 12);
    ctx.restore();
  }

  // Gear body
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Axle center
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawWindTunnel(ctx: CanvasRenderingContext2D, tunnel: MachineObstacle, tick: number) {
  ctx.save();
  const w = tunnel.width ?? 100;
  const h = tunnel.height ?? 100;

  // Updraft draft beam
  const grad = ctx.createLinearGradient(0, tunnel.y + h, 0, tunnel.y);
  grad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
  grad.addColorStop(1, 'rgba(6, 182, 212, 0.02)');
  ctx.fillStyle = grad;
  ctx.fillRect(tunnel.x, tunnel.y, w, h);

  // Rising airflow ribbons
  ctx.strokeStyle = 'rgba(103, 232, 249, 0.4)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    const px = tunnel.x + 18 + i * 22;
    const offset = (tick * 3 + i * 35) % h;
    const py = tunnel.y + h - offset;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px, py - 16);
    ctx.stroke();
  }

  ctx.restore();
}

function drawConveyorSegment(
  ctx: CanvasRenderingContext2D,
  seg: ConveyorSegment,
  isLocal: boolean,
  tick: number,
) {
  ctx.save();
  const segY = seg.baseY + seg.elevation;
  ctx.translate(seg.x, segY);
  ctx.rotate(seg.angle);

  const halfL = seg.length / 2;
  const halfT = seg.thickness / 2;

  // Local player halo indicator
  if (isLocal) {
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
    ctx.lineWidth = 3;
    ctx.strokeRect(-halfL - 6, -halfT - 6, seg.length + 12, seg.thickness + 12);
  }

  // Segment platform chassis
  ctx.fillStyle = '#1e293b';
  ctx.strokeStyle = seg.color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(-halfL, -halfT, seg.length, seg.thickness, 6);
  ctx.fill();
  ctx.stroke();

  // Moving belt tread stripes
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(-halfL + 2, -halfT + 2, seg.length - 4, seg.thickness - 4, 4);
  ctx.clip();

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-halfL, -halfT, seg.length, seg.thickness);

  ctx.fillStyle = seg.color;
  const treadSpacing = 16;
  const treadOffset = (((tick * seg.speed * 0.04) % treadSpacing) + treadSpacing) % treadSpacing;
  for (let x = -halfL - treadSpacing + treadOffset; x < halfL + treadSpacing; x += treadSpacing) {
    ctx.fillRect(x, -halfT, 4, seg.thickness);
  }
  ctx.restore();

  // End rollers
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(-halfL + 4, 0, 5, 0, Math.PI * 2);
  ctx.arc(halfL - 4, 0, 5, 0, Math.PI * 2);
  ctx.fill();

  // Non-color glyph badge & player label
  ctx.rotate(-seg.angle); // Keep badge upright
  ctx.font = 'bold 12px monospace';
  ctx.fillStyle = seg.color;
  ctx.textAlign = 'center';
  ctx.fillText(`${seg.glyph} ${seg.label}`, 0, -halfT - 12);

  ctx.restore();
}

function drawMachineObject(ctx: CanvasRenderingContext2D, obj: MachineObject) {
  ctx.save();
  ctx.translate(obj.x, obj.y);
  ctx.rotate(obj.rotation);

  const r = obj.radius;

  if (obj.type === 'bouncy') {
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Rubber sphere inner ring
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(-3, -3, r * 0.45, 0, Math.PI * 2);
    ctx.stroke();
  } else if (obj.type === 'fragile') {
    ctx.fillStyle = 'rgba(244, 114, 182, 0.4)';
    ctx.strokeStyle = '#ec4899';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.rect(-r, -r, r * 2, r * 2);
    ctx.fill();
    ctx.stroke();

    // Glass shine diagonal
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-r + 4, r - 4);
    ctx.lineTo(r - 4, -r + 4);
    ctx.stroke();
  } else if (obj.type === 'heavy') {
    ctx.fillStyle = '#475569';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(-r, -r, r * 2, r * 2);
    ctx.fill();
    ctx.stroke();

    // Steel rivet bolts
    ctx.fillStyle = '#cbd5e1';
    const bOff = r - 5;
    ctx.fillRect(-bOff, -bOff, 3, 3);
    ctx.fillRect(bOff - 3, -bOff, 3, 3);
    ctx.fillRect(-bOff, bOff - 3, 3, 3);
    ctx.fillRect(bOff - 3, bOff - 3, 3, 3);
  } else if (obj.type === 'explosive') {
    ctx.fillStyle = '#dc2626';
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Fuse cap
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-3, -r - 5, 6, 5);

    // Countdown text
    ctx.font = 'bold 10px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.ceil(obj.timer).toString(), 0, 0);
  } else {
    // Standard cargo crate
    ctx.fillStyle = '#d97706';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(-2, -2, r * 0.5, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}
