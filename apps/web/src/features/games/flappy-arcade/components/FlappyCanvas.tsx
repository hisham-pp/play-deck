'use client';

import React, { useEffect, useRef } from 'react';
import { DEFAULT_FLAPPY_CONFIG } from '../engine/flappy-physics';
import type { FlappyGameState } from '../engine/flappy-types';

interface FlappyCanvasProps {
  state: FlappyGameState;
  onFlap: () => void;
}

export function FlappyCanvas({ state, onFlap }: FlappyCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Render loop synchronized with state updates
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { worldWidth, worldHeight, groundHeight, ceilingHeight } = DEFAULT_FLAPPY_CONFIG;

    // Handle high DPI
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== worldWidth * dpr || canvas.height !== worldHeight * dpr) {
      canvas.width = worldWidth * dpr;
      canvas.height = worldHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);

    // Apply screen shake
    if (state.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * state.screenShake;
      const shakeY = (Math.random() - 0.5) * state.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Background sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, worldHeight);
    skyGrad.addColorStop(0, '#090d16');
    skyGrad.addColorStop(0.65, '#0f172a');
    skyGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, worldWidth, worldHeight);

    // 2. Parallax background stars / grid
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const starOffset = (state.distanceTraveled * 0.15) % worldWidth;
    for (let i = 0; i < 35; i++) {
      const sx = (i * 47 - starOffset + worldWidth) % worldWidth;
      const sy = ((i * 31) % (worldHeight - groundHeight - 120)) + 20;
      const r = i % 3 === 0 ? 1.5 : 1;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Distant cyber skyline silhouette (scrolling slowly)
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    const skylineOffset = (state.distanceTraveled * 0.3) % 200;
    for (let x = -skylineOffset; x < worldWidth + 60; x += 50) {
      const bHeight = 80 + (Math.sin(x) + 1) * 30;
      ctx.fillRect(x, worldHeight - groundHeight - bHeight, 46, bHeight);
    }

    // 3. Render Pipes (Energy Pylons)
    for (const pipe of state.pipes) {
      const pulse = 0.5 + 0.5 * Math.sin(pipe.pulsePhase);
      const glowColor = `rgba(245, 158, 11, ${0.4 + pulse * 0.4})`;

      // Top Pipe
      const topGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      topGrad.addColorStop(0, '#1c2438');
      topGrad.addColorStop(0.3, '#2d3b55');
      topGrad.addColorStop(0.7, '#1c2438');
      topGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = topGrad;
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);

      // Top Pipe Energy Conduit Core
      ctx.fillStyle = glowColor;
      ctx.fillRect(pipe.x + pipe.width / 2 - 2, 0, 4, pipe.topHeight);

      // Top Pipe Lip / Emitter Cap
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(pipe.x - 3, pipe.topHeight - 12, pipe.width + 6, 12);
      ctx.shadowBlur = 0;

      // Bottom Pipe
      const bottomHeight = worldHeight - groundHeight - pipe.bottomY;
      const bottomGrad = ctx.createLinearGradient(pipe.x, 0, pipe.x + pipe.width, 0);
      bottomGrad.addColorStop(0, '#1c2438');
      bottomGrad.addColorStop(0.3, '#2d3b55');
      bottomGrad.addColorStop(0.7, '#1c2438');
      bottomGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = bottomGrad;
      ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, bottomHeight);

      // Bottom Pipe Energy Conduit Core
      ctx.fillStyle = glowColor;
      ctx.fillRect(pipe.x + pipe.width / 2 - 2, pipe.bottomY, 4, bottomHeight);

      // Bottom Pipe Lip / Emitter Cap
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.fillRect(pipe.x - 3, pipe.bottomY, pipe.width + 6, 12);
      ctx.shadowBlur = 0;

      // Subtle border lines
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(pipe.x, 0, pipe.width, pipe.topHeight);
      ctx.strokeRect(pipe.x, pipe.bottomY, pipe.width, bottomHeight);
    }

    // 4. Render Particles
    for (const p of state.particles) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 5. Render Cyber-Avian Glider
    const bird = state.bird;
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(bird.rotation);

    // Jet engine thruster nozzle
    ctx.fillStyle = '#334155';
    ctx.fillRect(-16, -4, 5, 8);

    // Thruster glow flame
    if (state.status === 'playing') {
      const flameLength = 6 + Math.random() * 8;
      const flameGrad = ctx.createLinearGradient(-16 - flameLength, 0, -16, 0);
      flameGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
      flameGrad.addColorStop(0.7, '#38bdf8');
      flameGrad.addColorStop(1, '#f59e0b');
      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.moveTo(-16, -3);
      ctx.lineTo(-16 - flameLength, 0);
      ctx.lineTo(-16, 3);
      ctx.closePath();
      ctx.fill();
    }

    // Aerodynamic Hull
    const hullGrad = ctx.createLinearGradient(-12, -10, 16, 10);
    hullGrad.addColorStop(0, '#f59e0b'); // PlayDeck tactical amber
    hullGrad.addColorStop(0.6, '#d97706');
    hullGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = hullGrad;
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 10;

    // Sleek faceted cyber-avian silhouette
    ctx.beginPath();
    ctx.moveTo(16, 0); // Nose tip
    ctx.lineTo(2, -10); // Top forehead
    ctx.lineTo(-12, -7); // Top back
    ctx.lineTo(-8, 0); // Tail fin indent
    ctx.lineTo(-12, 7); // Bottom back
    ctx.lineTo(2, 9); // Bottom jaw
    ctx.closePath();
    ctx.fill();

    // Wing Fin
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-9, -12);
    ctx.lineTo(-2, -2);
    ctx.closePath();
    ctx.fill();

    // Glowing Visor / Cockpit
    ctx.fillStyle = '#38bdf8';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(6, -2, 5, 3, 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // 6. Ground & Ceiling boundaries
    // Ceiling scanline
    ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
    ctx.fillRect(0, 0, worldWidth, ceilingHeight);

    // Ground platform
    const groundY = worldHeight - groundHeight;
    const groundGrad = ctx.createLinearGradient(0, groundY, 0, worldHeight);
    groundGrad.addColorStop(0, '#111827');
    groundGrad.addColorStop(0.3, '#0c121e');
    groundGrad.addColorStop(1, '#05080e');

    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, groundY, worldWidth, groundHeight);

    // Ground neon edge line
    ctx.fillStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 8;
    ctx.fillRect(0, groundY, worldWidth, 3);
    ctx.shadowBlur = 0;

    // Scrolling cyber grid on ground
    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';
    ctx.lineWidth = 1.5;
    const gridOffset = (state.distanceTraveled * 0.9) % 24;
    for (let x = -gridOffset; x < worldWidth + 24; x += 24) {
      ctx.beginPath();
      ctx.moveTo(x, groundY + 3);
      ctx.lineTo(x - 12, worldHeight);
      ctx.stroke();
    }

    // Ground horizontal scanlines
    for (let y = groundY + 14; y < worldHeight; y += 14) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(worldWidth, y);
      ctx.stroke();
    }

    // 7. Idle Prompt Overlay
    if (state.status === 'idle') {
      ctx.save();
      const pulse = 0.6 + 0.4 * Math.sin(Date.now() / 250);
      ctx.fillStyle = `rgba(245, 158, 11, ${pulse})`;
      ctx.font = '700 14px var(--font-display, "Space Grotesk", sans-serif)';
      ctx.textAlign = 'center';
      ctx.fillText('TAP OR PRESS SPACE TO FLY', worldWidth / 2, worldHeight / 2 + 60);

      ctx.fillStyle = 'rgba(156, 163, 175, 0.8)';
      ctx.font = '500 12px sans-serif';
      ctx.fillText(
        'Navigate conduits without touching boundaries',
        worldWidth / 2,
        worldHeight / 2 + 86,
      );
      ctx.restore();
    }

    ctx.restore();
  }, [state]);

  return (
    <div
      className="relative flex items-center justify-center w-full select-none cursor-pointer overflow-hidden rounded-xl border border-deck-border/60 bg-[#090d16] shadow-2xl"
      onClick={onFlap}
      role="button"
      tabIndex={0}
      aria-label="Flappy Arcade game area. Click or press space to flap"
      onKeyDown={(e) => {
        if (e.code === 'Space' || e.code === 'ArrowUp') {
          e.preventDefault();
          onFlap();
        }
      }}
    >
      <canvas
        ref={canvasRef}
        className="w-full max-w-[480px] aspect-[3/4] object-contain touch-none"
        style={{ imageRendering: 'crisp-edges' }}
      />
    </div>
  );
}
