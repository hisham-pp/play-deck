'use client';

import React, { useEffect, useRef } from 'react';
import type { HideSeekPlayer, HideSeekState } from '../engine/hide-and-seek-engine';

interface HideSeekArenaCanvasProps {
  state: HideSeekState;
  user: HideSeekPlayer;
}

export function HideSeekArenaCanvas({ state, user }: HideSeekArenaCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const { map, players, phase, radarPingPosition } = state;
      const width = map.width;
      const height = map.height;

      // 1. Arena Floor
      ctx.fillStyle = '#0b0f19'; // Deep slate floor
      ctx.fillRect(0, 0, width, height);

      // Floor grid tiles
      ctx.strokeStyle = '#141d2e';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // 2. Solid Walls
      for (const w of map.walls) {
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w.x, w.y, w.w, w.h);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.strokeRect(w.x, w.y, w.w, w.h);

        // Wall top bevel
        ctx.fillStyle = '#475569';
        ctx.fillRect(w.x + 2, w.y + 2, Math.max(0, w.w - 4), Math.min(4, w.h - 4));
      }

      // 3. Hiding Spots (Closets, Crates, Vents)
      for (const spot of map.hidingSpots) {
        const isNearUser =
          Math.hypot(user.x - (spot.x + spot.w / 2), user.y - (spot.y + spot.h / 2)) < 55;

        if (spot.type === 'closet') {
          ctx.fillStyle = isNearUser ? '#92400e' : '#78350f';
          ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
          ctx.strokeStyle = isNearUser ? '#f59e0b' : '#b45309';
          ctx.lineWidth = 2;
          ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);

          // Closet doors divider & brass handles
          ctx.strokeStyle = '#451a03';
          ctx.beginPath();
          ctx.moveTo(spot.x + spot.w / 2, spot.y);
          ctx.lineTo(spot.x + spot.w / 2, spot.y + spot.h);
          ctx.stroke();

          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(spot.x + spot.w / 2 - 4, spot.y + spot.h / 2, 2, 0, Math.PI * 2);
          ctx.arc(spot.x + spot.w / 2 + 4, spot.y + spot.h / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (spot.type === 'crate') {
          ctx.fillStyle = isNearUser ? '#b45309' : '#854d0e';
          ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
          ctx.strokeStyle = isNearUser ? '#f59e0b' : '#713f12';
          ctx.lineWidth = 2;
          ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);

          // Crate cross braces
          ctx.strokeStyle = 'rgba(0,0,0,0.3)';
          ctx.beginPath();
          ctx.moveTo(spot.x, spot.y);
          ctx.lineTo(spot.x + spot.w, spot.y + spot.h);
          ctx.moveTo(spot.x + spot.w, spot.y);
          ctx.lineTo(spot.x, spot.y + spot.h);
          ctx.stroke();
        } else if (spot.type === 'vent') {
          ctx.fillStyle = isNearUser ? '#0284c7' : '#0369a1';
          ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
          ctx.strokeStyle = isNearUser ? '#38bdf8' : '#0ea5e9';
          ctx.lineWidth = 2;
          ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);

          // Vent grates
          ctx.strokeStyle = 'rgba(0,0,0,0.5)';
          for (let gy = spot.y + 8; gy < spot.y + spot.h; gy += 8) {
            ctx.beginPath();
            ctx.moveTo(spot.x + 4, gy);
            ctx.lineTo(spot.x + spot.w - 4, gy);
            ctx.stroke();
          }
        } else {
          // Desk
          ctx.fillStyle = isNearUser ? '#64748b' : '#475569';
          ctx.fillRect(spot.x, spot.y, spot.w, spot.h);
          ctx.strokeStyle = isNearUser ? '#94a3b8' : '#334155';
          ctx.lineWidth = 2;
          ctx.strokeRect(spot.x, spot.y, spot.w, spot.h);
        }

        // Spot Label
        ctx.fillStyle = isNearUser ? '#f59e0b' : '#94a3b8';
        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(spot.name, spot.x + spot.w / 2, spot.y + spot.h + 12);
      }

      // 4. Flashlight / Sight Cones for Seekers
      for (const p of players) {
        if (p.role === 'seeker') {
          const isFrozen = phase === 'hiding_phase';
          if (!isFrozen) {
            const coneAngle = Math.PI / 3; // 60 degrees
            const coneDist = 200;

            const grad = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, coneDist);
            grad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
            grad.addColorStop(1, 'rgba(254, 240, 138, 0.0)');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.arc(
              p.x,
              p.y,
              coneDist,
              p.facingAngle - coneAngle / 2,
              p.facingAngle + coneAngle / 2,
            );
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // 5. Radar Ping Visual Wave Effect
      if (radarPingPosition && Date.now() - radarPingPosition.timestamp < 3500) {
        const elapsed = (Date.now() - radarPingPosition.timestamp) / 1000;
        const radius = (elapsed * 50) % 90;
        const opacity = Math.max(0, 1 - elapsed / 3.5);

        ctx.strokeStyle = `rgba(56, 189, 248, ${opacity})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(radarPingPosition.x, radarPingPosition.y, radius, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(56, 189, 248, ${opacity * 0.8})`;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('📡 SIGNAL DETECTED', radarPingPosition.x, radarPingPosition.y - 15);
      }

      // 6. Players
      for (const p of players) {
        // If hidden inside spot, don't render on map (unless it is the local user)
        if (p.isHiddenInSpot) {
          if (p.id === user.id) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.6)';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.fillText('👀 [HIDDEN INSIDE]', p.x, p.y - 12);
          }
          continue;
        }

        // Invisible hider check
        if (p.isInvisible && p.role === 'hider') {
          if (user.role === 'seeker' && p.id !== user.id) {
            continue; // Completely hidden from seekers!
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);

        // Disguise Rendering
        if (p.activeDisguise === 'box') {
          ctx.fillStyle = '#b45309';
          ctx.fillRect(-14, -14, 28, 28);
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 2;
          ctx.strokeRect(-14, -14, 28, 28);
          ctx.fillStyle = '#fed7aa';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('📦', 0, 4);
          ctx.restore();
          continue;
        } else if (p.activeDisguise === 'plant') {
          ctx.fillStyle = '#15803d';
          ctx.beginPath();
          ctx.arc(0, 0, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#bbf7d0';
          ctx.font = '9px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('🪴', 0, 4);
          ctx.restore();
          continue;
        }

        // Standard Player Avatar
        const isSeeker = p.role === 'seeker';
        const isLocal = p.id === user.id;

        // Invisibility ghost opacity
        if (p.isInvisible) {
          ctx.globalAlpha = 0.4;
        }

        // Facing direction indicator
        ctx.strokeStyle = isSeeker ? '#ef4444' : '#0ea5e9';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(p.facingAngle) * 18, Math.sin(p.facingAngle) * 18);
        ctx.stroke();

        // Player Circle
        ctx.fillStyle = isSeeker ? '#dc2626' : '#0284c7';
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = isLocal ? '#f59e0b' : '#ffffff';
        ctx.lineWidth = isLocal ? 3 : 1.5;
        ctx.stroke();

        // Blindfolded icon during hiding phase
        if (isSeeker && phase === 'hiding_phase') {
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('🙈', 0, 4);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(isSeeker ? '🔍' : '👤', 0, 4);
        }

        ctx.restore();

        // Player Name Badge
        ctx.fillStyle = isLocal ? '#fbbf24' : isSeeker ? '#f87171' : '#38bdf8';
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(p.name, p.x, p.y - 18);
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, user]);

  return (
    <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950">
      <canvas ref={canvasRef} width={800} height={600} className="w-full h-full block" />
    </div>
  );
}
