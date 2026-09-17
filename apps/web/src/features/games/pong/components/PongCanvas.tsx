'use client';

import React, { useEffect, useRef } from 'react';
import { PONG_ARENA_HEIGHT, PONG_ARENA_WIDTH } from '../engine/pong-constants';
import type { Particle, PongState, TrailPoint } from '../engine/pong-types';

interface PongCanvasProps {
  state: PongState;
  particles: Particle[];
  onTouchStartOrMove?: (e: React.TouchEvent<HTMLDivElement>) => void;
  onTouchEndOrCancel?: (e: React.TouchEvent<HTMLDivElement>) => void;
}

export function PongCanvas({
  state,
  particles,
  onTouchStartOrMove,
  onTouchEndOrCancel,
}: PongCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trailRef = useRef<TrailPoint[]>([]);

  // Update ball motion trail
  useEffect(() => {
    if (state.status === 'playing' && !state.servePending) {
      trailRef.current.push({
        x: state.ball.x,
        y: state.ball.y,
        alpha: 0.6,
      });

      if (trailRef.current.length > 8) {
        trailRef.current.shift();
      }
    } else {
      trailRef.current = [];
    }
  }, [state.ball.x, state.ball.y, state.status, state.servePending]);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Logical resolution
    const w = PONG_ARENA_WIDTH;
    const h = PONG_ARENA_HEIGHT;

    // 1. Clear & Background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Subtle court border
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, w - 8, h - 8);

    // Subtle horizontal court scanlines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    for (let y = 10; y < h; y += 12) {
      ctx.fillRect(4, y, w - 8, 1);
    }

    // Center dividing line (dashed retro net)
    ctx.beginPath();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
    ctx.lineWidth = 3;
    ctx.moveTo(w / 2, 8);
    ctx.lineTo(w / 2, h - 8);
    ctx.stroke();
    ctx.setLineDash([]); // reset

    // Center circle
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, 48, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.12)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // 2. Draw Ball Trail
    const trail = trailRef.current;
    for (let i = 0; i < trail.length; i++) {
      const point = trail[i];
      const factor = (i + 1) / trail.length;
      const radius = state.ball.radius * (0.4 + factor * 0.6);

      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248, 250, 252, ${0.1 + factor * 0.35})`;
      ctx.fill();
    }

    // 3. Draw Left Paddle (Player 1 - Cyan)
    const p1 = state.player1;
    ctx.save();
    ctx.shadowColor = 'rgba(6, 182, 212, 0.5)';
    ctx.shadowBlur = 14;

    const p1Grad = ctx.createLinearGradient(p1.x, p1.y, p1.x + p1.width, p1.y);
    p1Grad.addColorStop(0, '#06b6d4');
    p1Grad.addColorStop(1, '#22d3ee');
    ctx.fillStyle = p1Grad;

    ctx.beginPath();
    ctx.roundRect(p1.x, p1.y, p1.width, p1.height, 6);
    ctx.fill();
    ctx.restore();

    // 4. Draw Right Paddle (Player 2 / AI - Amber)
    const p2 = state.player2;
    ctx.save();
    ctx.shadowColor = 'rgba(245, 158, 11, 0.5)';
    ctx.shadowBlur = 14;

    const p2Grad = ctx.createLinearGradient(p2.x, p2.y, p2.x + p2.width, p2.y);
    p2Grad.addColorStop(0, '#f59e0b');
    p2Grad.addColorStop(1, '#fbbf24');
    ctx.fillStyle = p2Grad;

    ctx.beginPath();
    ctx.roundRect(p2.x, p2.y, p2.width, p2.height, 6);
    ctx.fill();
    ctx.restore();

    // 5. Draw Particles
    for (const particle of particles) {
      const alpha = Math.max(0, particle.life / particle.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.shadowColor = particle.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Draw Ball
    const b = state.ball;
    ctx.save();
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 16;

    const ballGrad = ctx.createRadialGradient(
      b.x - b.radius * 0.3,
      b.y - b.radius * 0.3,
      1,
      b.x,
      b.y,
      b.radius,
    );
    ballGrad.addColorStop(0, '#ffffff');
    ballGrad.addColorStop(0.7, '#f8fafc');
    ballGrad.addColorStop(1, '#94a3b8');

    ctx.fillStyle = ballGrad;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 7. Serve countdown / Serve target hint
    if (state.servePending && state.status === 'playing') {
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = 'bold 13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace';
      ctx.textAlign = 'center';
      const countText =
        state.serveCountdown > 0 ? `SERVE IN ${state.serveCountdown.toFixed(1)}s` : 'SERVE!';
      ctx.fillText(countText, w / 2, h / 2 - 20);

      // Serve direction arrow
      const arrowDir = state.serverSide === 'left' ? 1 : -1;
      ctx.beginPath();
      ctx.moveTo(w / 2 + arrowDir * 20, h / 2);
      ctx.lineTo(w / 2 + arrowDir * 32, h / 2);
      ctx.strokeStyle = state.serverSide === 'left' ? '#06b6d4' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
  }, [state, particles]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-[16/10] max-h-[70vh] rounded-2xl overflow-hidden border border-surface-border/80 shadow-[0_12px_40px_rgba(0,0,0,0.6)] bg-[#080d1a] touch-none select-none"
      onTouchStart={onTouchStartOrMove}
      onTouchMove={onTouchStartOrMove}
      onTouchEnd={onTouchEndOrCancel}
      onTouchCancel={onTouchEndOrCancel}
    >
      <canvas
        ref={canvasRef}
        width={PONG_ARENA_WIDTH}
        height={PONG_ARENA_HEIGHT}
        className="w-full h-full block"
      />
    </div>
  );
}
