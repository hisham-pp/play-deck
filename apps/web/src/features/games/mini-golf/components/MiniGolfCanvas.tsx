import React, { useEffect } from 'react';
import type { HoleDefinition, MiniGolfState, ShotPreview } from '../engine/mini-golf-types';

interface MiniGolfCanvasProps {
  state: MiniGolfState;
  shotPreview: ShotPreview | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  isDragging: boolean;
  dragCurrent: { x: number; y: number } | null;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd: () => void;
}

const WIDTH = 800;
const HEIGHT = 600;

export const MiniGolfCanvas: React.FC<MiniGolfCanvasProps> = ({
  state,
  shotPreview,
  canvasRef,
  isDragging,
  dragCurrent,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
}) => {
  const currentHole: HoleDefinition = state.holes[state.currentHoleIndex];
  const activePlayer = state.players[state.activePlayerIndex];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI support
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== WIDTH * dpr || canvas.height !== HEIGHT * dpr) {
      canvas.width = WIDTH * dpr;
      canvas.height = HEIGHT * dpr;
    }
    ctx.resetTransform();
    ctx.scale(dpr, dpr);

    // 1. Draw Turf Background & Wood Boundary
    const grad = ctx.createRadialGradient(WIDTH / 2, HEIGHT / 2, 80, WIDTH / 2, HEIGHT / 2, 480);
    grad.addColorStop(0, '#065f46'); // emerald-800
    grad.addColorStop(0.7, '#064e3b'); // emerald-900
    grad.addColorStop(1, '#022c22'); // emerald-950
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Subtle lawn pattern lines
    ctx.save();
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.04)';
    ctx.lineWidth = 18;
    for (let x = -HEIGHT; x < WIDTH + HEIGHT; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + HEIGHT, HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Sand Traps
    for (const trap of currentHole.sandTraps) {
      ctx.save();
      ctx.fillStyle = '#b45309'; // amber-700 base
      ctx.strokeStyle = '#f59e0b'; // amber-500
      ctx.lineWidth = 2;

      if ('radius' in trap) {
        ctx.beginPath();
        ctx.arc(trap.x, trap.y, trap.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(trap.x, trap.y, trap.width, trap.height, 12);
        ctx.fill();
        ctx.stroke();
      }

      // Sand texture grains
      ctx.fillStyle = '#fde68a';
      const count = 'radius' in trap ? 14 : 18;
      for (let i = 0; i < count; i++) {
        const sx =
          'radius' in trap
            ? trap.x + Math.sin(i * 3.7) * trap.radius * 0.7
            : trap.x + 8 + ((i * 27) % (trap.width - 16));
        const sy =
          'radius' in trap
            ? trap.y + Math.cos(i * 4.3) * trap.radius * 0.7
            : trap.y + 8 + ((i * 37) % (trap.height - 16));
        ctx.fillRect(sx, sy, 2, 2);
      }
      ctx.restore();
    }

    // 3. Water Hazards
    const now = Date.now() * 0.002;
    for (const water of currentHole.waterHazards) {
      ctx.save();
      const waterGrad = ctx.createLinearGradient(
        water.x,
        water.y,
        water.x + ('width' in water ? water.width : 50),
        water.y + ('height' in water ? water.height : 50),
      );
      waterGrad.addColorStop(0, '#0369a1'); // sky-700
      waterGrad.addColorStop(1, '#0c4a6e'); // sky-900
      ctx.fillStyle = waterGrad;
      ctx.strokeStyle = '#38bdf8'; // sky-400 glowing border
      ctx.lineWidth = 2;

      if ('radius' in water) {
        ctx.beginPath();
        ctx.arc(water.x, water.y, water.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.roundRect(water.x, water.y, water.width, water.height, 14);
        ctx.fill();
        ctx.stroke();
      }

      // Animated subtle ripples
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1.5;
      const rx = 'radius' in water ? water.x : water.x + water.width / 2;
      const ry = 'radius' in water ? water.y : water.y + water.height / 2;
      const rRad = 12 + ((now * 20) % 24);
      ctx.beginPath();
      ctx.arc(rx, ry, rRad, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Boosters
    for (const booster of currentHole.boosters) {
      ctx.save();
      ctx.fillStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(booster.x, booster.y, booster.width, booster.height, 8);
      ctx.fill();
      ctx.stroke();

      // Chevrons pointing in boost direction
      ctx.fillStyle = '#fef08a';
      const cx = booster.x + booster.width / 2;
      const cy = booster.y + booster.height / 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 8);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx - 10, cy + 8);
      ctx.stroke();
      ctx.restore();
    }

    // 5. Portals
    for (const portal of currentHole.portals) {
      ctx.save();
      // Entry portal
      const pGrad = ctx.createRadialGradient(
        portal.entry.x,
        portal.entry.y,
        4,
        portal.entry.x,
        portal.entry.y,
        portal.radius,
      );
      pGrad.addColorStop(0, '#ffffff');
      pGrad.addColorStop(0.5, '#38bdf8');
      pGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = pGrad;
      ctx.beginPath();
      ctx.arc(portal.entry.x, portal.entry.y, portal.radius, 0, Math.PI * 2);
      ctx.fill();

      // Exit portal
      const outGrad = ctx.createRadialGradient(
        portal.exit.x,
        portal.exit.y,
        4,
        portal.exit.x,
        portal.exit.y,
        portal.radius,
      );
      outGrad.addColorStop(0, '#ffffff');
      outGrad.addColorStop(0.5, '#fb923c');
      outGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
      ctx.fillStyle = outGrad;
      ctx.beginPath();
      ctx.arc(portal.exit.x, portal.exit.y, portal.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. Tee Mat
    ctx.save();
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(currentHole.tee.x - 16, currentHole.tee.y - 16, 32, 32, 6);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('TEE', currentHole.tee.x, currentHole.tee.y + 4);
    ctx.restore();

    // 7. Hole Cup & Pin Flag
    ctx.save();
    // Dark hole depth
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(currentHole.cup.x, currentHole.cup.y, currentHole.cup.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Flagstick
    ctx.strokeStyle = '#f8fafc';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(currentHole.cup.x, currentHole.cup.y);
    ctx.lineTo(currentHole.cup.x, currentHole.cup.y - 42);
    ctx.stroke();

    // Flag pennant
    ctx.fillStyle = '#ef4444'; // Red flag
    ctx.beginPath();
    ctx.moveTo(currentHole.cup.x, currentHole.cup.y - 42);
    ctx.lineTo(currentHole.cup.x + 22, currentHole.cup.y - 32);
    ctx.lineTo(currentHole.cup.x, currentHole.cup.y - 22);
    ctx.closePath();
    ctx.fill();

    // Hole number text on flag
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${currentHole.id}`, currentHole.cup.x + 4, currentHole.cup.y - 30);
    ctx.restore();

    // 8. Walls & Cushions
    ctx.save();
    ctx.lineCap = 'round';
    for (const wall of currentHole.walls) {
      // Drop shadow
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.moveTo(wall.p1.x, wall.p1.y + 3);
      ctx.lineTo(wall.p2.x, wall.p2.y + 3);
      ctx.stroke();

      // Outer rail
      ctx.strokeStyle = '#78350f'; // amber-900 dark timber
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(wall.p1.x, wall.p1.y);
      ctx.lineTo(wall.p2.x, wall.p2.y);
      ctx.stroke();

      // Rubber cushion strip
      ctx.strokeStyle = '#d97706'; // amber-600
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(wall.p1.x, wall.p1.y);
      ctx.lineTo(wall.p2.x, wall.p2.y);
      ctx.stroke();
    }
    ctx.restore();

    // 9. Bumpers
    for (const bumper of currentHole.bumpers) {
      ctx.save();
      const isActive = bumper.activeUntil && bumper.activeUntil > Date.now();
      const bGrad = ctx.createRadialGradient(
        bumper.x,
        bumper.y,
        2,
        bumper.x,
        bumper.y,
        bumper.radius,
      );
      bGrad.addColorStop(0, isActive ? '#fef08a' : '#f59e0b');
      bGrad.addColorStop(0.7, isActive ? '#f59e0b' : '#b45309');
      bGrad.addColorStop(1, '#78350f');

      ctx.fillStyle = bGrad;
      ctx.strokeStyle = isActive ? '#ffffff' : '#fbbf24';
      ctx.lineWidth = isActive ? 4 : 2.5;

      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner neon ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bumper.x, bumper.y, bumper.radius * 0.55, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 10. Rotators (Windmills / Barrier arms)
    for (const rot of state.rotatorsState) {
      ctx.save();
      ctx.translate(rot.x, rot.y);
      ctx.rotate(rot.angle);

      // Rotating bar
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-rot.length / 2, -rot.width / 2, rot.length, rot.width, 4);
      ctx.fill();
      ctx.stroke();

      // Center pivot hub
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(0, 0, rot.width * 0.75, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 11. Motion Trail Particles
    if (state.ball.trail.length > 1) {
      ctx.save();
      for (let i = 0; i < state.ball.trail.length; i++) {
        const pt = state.ball.trail[i];
        const alpha = ((i + 1) / state.ball.trail.length) * 0.45;
        const rad = state.ball.radius * (0.3 + (i / state.ball.trail.length) * 0.7);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 12. Golf Ball
    if (!state.ball.inHole || state.phase === 'hole-clear') {
      ctx.save();
      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(
        state.ball.x,
        state.ball.y + 3,
        state.ball.radius * 1.1,
        state.ball.radius * 0.7,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Ball sphere gradient with 3D specular highlight
      const ballGrad = ctx.createRadialGradient(
        state.ball.x - state.ball.radius * 0.35,
        state.ball.y - state.ball.radius * 0.35,
        1,
        state.ball.x,
        state.ball.y,
        state.ball.radius,
      );
      ballGrad.addColorStop(0, '#ffffff');
      ballGrad.addColorStop(0.5, activePlayer ? activePlayer.color : '#e2e8f0');
      ballGrad.addColorStop(1, '#0f172a');

      ctx.fillStyle = ballGrad;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(state.ball.x, state.ball.y, state.ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 13. Trajectory Preview Guide (Aiming line)
    if (shotPreview && shotPreview.previewPoints.length > 1 && state.phase === 'aiming') {
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);

      ctx.beginPath();
      ctx.moveTo(shotPreview.previewPoints[0].x, shotPreview.previewPoints[0].y);
      for (let i = 1; i < shotPreview.previewPoints.length; i++) {
        ctx.lineTo(shotPreview.previewPoints[i].x, shotPreview.previewPoints[i].y);
      }
      ctx.stroke();

      // Target bead at the end of preview
      const lastPt = shotPreview.previewPoints[shotPreview.previewPoints.length - 1];
      ctx.setLineDash([]);
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(lastPt.x, lastPt.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 14. Slingshot Pull Vector (Tactile drag feedback)
    if (isDragging && dragCurrent && state.phase === 'aiming') {
      ctx.save();
      // Line from ball to pointer
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(state.ball.x, state.ball.y);
      ctx.lineTo(dragCurrent.x, dragCurrent.y);
      ctx.stroke();

      // Pull grip ring
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(dragCurrent.x, dragCurrent.y, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
  }, [state, shotPreview, isDragging, dragCurrent, currentHole, activePlayer]);

  return (
    <div className="relative flex items-center justify-center w-full h-full select-none touch-none">
      <canvas
        ref={canvasRef}
        style={{
          width: '100%',
          height: '100%',
          aspectRatio: '4/3',
          maxWidth: '100%',
          maxHeight: '100%',
        }}
        className="rounded-xl shadow-2xl border-4 border-[#1c2438] bg-[#022c22] cursor-crosshair object-contain"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />
    </div>
  );
};
