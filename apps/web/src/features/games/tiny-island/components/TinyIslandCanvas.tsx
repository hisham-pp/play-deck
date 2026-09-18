'use client';

import React, { useEffect, useRef } from 'react';
import { getAdjacentCoords, isTileWalkable } from '../engine/tiny-island-grid';
import type { GridCoord, IslandGameState, IslandPlayer } from '../engine/tiny-island-types';

export type CanvasInteractionMode =
  'select' | 'move' | 'build_bridge' | 'build_barrier' | 'push' | 'steal';

interface TinyIslandCanvasProps {
  gameState: IslandGameState;
  localSeatIndex: number | null;
  interactionMode: CanvasInteractionMode;
  onTileClick: (coord: GridCoord) => void;
  onPlayerClick: (player: IslandPlayer) => void;
}

export function TinyIslandCanvas({
  gameState,
  localSeatIndex,
  interactionMode,
  onTileClick,
  onPlayerClick,
}: TinyIslandCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activePlayer = gameState.players.find(
    (p) => p.seatIndex === gameState.currentTurnSeatIndex,
  );
  const isLocalTurn =
    activePlayer &&
    (localSeatIndex === null || activePlayer.seatIndex === localSeatIndex) &&
    !activePlayer.isBot;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Atmosphere / Ocean Background
      const isStorm = gameState.mood === 'storm';
      const isFinal = gameState.mood === 'final_stand';

      const oceanGradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        40,
        width / 2,
        height / 2,
        width * 0.7,
      );

      if (isFinal) {
        oceanGradient.addColorStop(0, '#1c1917');
        oceanGradient.addColorStop(0.6, '#450a0a');
        oceanGradient.addColorStop(1, '#0c0a09');
      } else if (isStorm) {
        oceanGradient.addColorStop(0, '#0f172a');
        oceanGradient.addColorStop(0.7, '#030712');
        oceanGradient.addColorStop(1, '#020617');
      } else {
        oceanGradient.addColorStop(0, '#0284c7');
        oceanGradient.addColorStop(0.5, '#0369a1');
        oceanGradient.addColorStop(1, '#082f49');
      }

      ctx.fillStyle = oceanGradient;
      ctx.fillRect(0, 0, width, height);

      // Ambient animated wave ripples
      ctx.strokeStyle = isFinal ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1.5;
      for (let r = 50; r < width * 0.75; r += 35) {
        const waveOffset = Math.sin(frame * 0.03 + r * 0.05) * 4;
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, r + waveOffset, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. Grid Geometry Calculation
      const size = gameState.gridSize;
      const padding = 28;
      const availableSize = Math.min(width, height) - padding * 2;
      const tileSize = availableSize / size;
      const startX = (width - tileSize * size) / 2;
      const startY = (height - tileSize * size) / 2;

      // 3. Render Tiles
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const tile = gameState.tiles[y][x];
          const px = startX + x * tileSize;
          const py = startY + y * tileSize;

          // Water tiles (submerged or outer)
          if (tile.sinkingState === 'submerged' || tile.type === 'water') {
            // Draw subtle deep water tile
            ctx.fillStyle = isFinal ? '#18181b' : 'rgba(12, 74, 110, 0.4)';
            ctx.beginPath();
            ctx.roundRect(px + 2, py + 2, tileSize - 4, tileSize - 4, 6);
            ctx.fill();

            // Bridge built over water
            if (tile.type === 'bridge') {
              ctx.fillStyle = '#b45309';
              ctx.fillRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
              ctx.strokeStyle = '#78350f';
              ctx.lineWidth = 2;
              ctx.strokeRect(px + 4, py + 4, tileSize - 8, tileSize - 8);
              // Bridge planks
              ctx.fillStyle = '#92400e';
              ctx.fillRect(px + 8, py + 8, tileSize - 16, 4);
              ctx.fillRect(px + 8, py + tileSize - 14, tileSize - 16, 4);
            }
            continue;
          }

          // Land Tiles: Sand, Grass, Rock, Grove
          let fillColor = '#fde047'; // Sand
          let borderColor = '#ca8a04';

          if (tile.type === 'grass') {
            fillColor = '#22c55e';
            borderColor = '#15803d';
          } else if (tile.type === 'rock') {
            fillColor = '#94a3b8';
            borderColor = '#475569';
          } else if (tile.type === 'grove') {
            fillColor = '#10b981';
            borderColor = '#047857';
          } else if (tile.type === 'barrier') {
            fillColor = '#64748b';
            borderColor = '#334155';
          }

          // Sinking Warning Animation (Tile tremors and flashes warning yellow/red)
          const isWarning = tile.sinkingState === 'warning';
          let shakeX = 0;
          let shakeY = 0;
          if (isWarning) {
            shakeX = Math.sin(frame * 0.4 + (x + y)) * 2;
            shakeY = Math.cos(frame * 0.4 + (x + y)) * 2;
            fillColor = Math.sin(frame * 0.15) > 0 ? '#ef4444' : '#f97316';
            borderColor = '#b91c1c';
          }

          // Tile base
          ctx.fillStyle = fillColor;
          ctx.beginPath();
          ctx.roundRect(
            px + 2 + shakeX,
            py + 2 + shakeY,
            tileSize - 4,
            tileSize - 4,
            tile.type === 'barrier' ? 4 : 8,
          );
          ctx.fill();

          ctx.strokeStyle = borderColor;
          ctx.lineWidth = isWarning ? 2.5 : 1.5;
          ctx.stroke();

          // Cracking effect on warning tiles
          if (isWarning) {
            ctx.strokeStyle = '#450a0a';
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(px + 6 + shakeX, py + 8 + shakeY);
            ctx.lineTo(px + tileSize / 2 + shakeX, py + tileSize / 2 + shakeY);
            ctx.lineTo(px + tileSize - 8 + shakeX, py + tileSize - 6 + shakeY);
            ctx.stroke();
          }

          // Resource icon / details on tile
          if (tile.resource && tile.resourceCount > 0) {
            ctx.font = `${Math.floor(tileSize * 0.42)}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const icon = tile.resource === 'wood' ? '🪵' : tile.resource === 'stone' ? '🪨' : '🥥';
            ctx.fillText(icon, px + tileSize / 2 + shakeX, py + tileSize / 2 + shakeY - 2);

            // Resource count badge if > 1
            if (tile.resourceCount > 1) {
              ctx.font = 'bold 9px sans-serif';
              ctx.fillStyle = '#ffffff';
              ctx.fillText(
                `x${tile.resourceCount}`,
                px + tileSize / 2 + shakeX,
                py + tileSize - 8 + shakeY,
              );
            }
          }

          // Barrier fortification marker
          if (tile.type === 'barrier') {
            ctx.fillStyle = '#0f172a';
            ctx.font = 'bold 11px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(`🛡️ ${tile.barrierHp ?? 2}`, px + tileSize / 2, py + tileSize / 2);
          }
        }
      }

      // 4. Interaction Highlight Overlay
      if (isLocalTurn && activePlayer) {
        const neighbors = getAdjacentCoords({ x: activePlayer.x, y: activePlayer.y }, size);

        for (const n of neighbors) {
          const nTile = gameState.tiles[n.y][n.x];
          const nPx = startX + n.x * tileSize;
          const nPy = startY + n.y * tileSize;

          if (interactionMode === 'move') {
            if (
              isTileWalkable(nTile) &&
              !gameState.players.some((p) => p.isAlive && p.x === n.x && p.y === n.y)
            ) {
              ctx.strokeStyle = '#22c55e';
              ctx.lineWidth = 3;
              ctx.setLineDash([4, 4]);
              ctx.strokeRect(nPx + 3, nPy + 3, tileSize - 6, tileSize - 6);
              ctx.setLineDash([]);
            }
          } else if (interactionMode === 'build_bridge') {
            if (nTile.type === 'water' || nTile.sinkingState === 'submerged') {
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 3;
              ctx.strokeRect(nPx + 3, nPy + 3, tileSize - 6, tileSize - 6);
            }
          } else if (interactionMode === 'build_barrier') {
            if (
              nTile.type !== 'water' &&
              nTile.sinkingState !== 'submerged' &&
              nTile.type !== 'barrier'
            ) {
              ctx.strokeStyle = '#a855f7';
              ctx.lineWidth = 3;
              ctx.strokeRect(nPx + 3, nPy + 3, tileSize - 6, tileSize - 6);
            }
          }
        }
      }

      // 5. Render Players
      for (const player of gameState.players) {
        if (!player.isAlive) continue;

        const pX = startX + player.x * tileSize + tileSize / 2;
        const pY = startY + player.y * tileSize + tileSize / 2;
        const radius = Math.floor(tileSize * 0.38);

        // Turn indicator ring
        if (player.seatIndex === gameState.currentTurnSeatIndex) {
          const pulse = Math.sin(frame * 0.1) * 3;
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(pX, pY, radius + 4 + pulse, 0, Math.PI * 2);
          ctx.stroke();

          // AP energy orbs
          for (let i = 0; i < player.ap; i++) {
            const orbAngle = frame * 0.05 + (i * Math.PI * 2) / 2;
            const orbDist = radius + 9;
            const ox = pX + Math.cos(orbAngle) * orbDist;
            const oy = pY + Math.sin(orbAngle) * orbDist;
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.arc(ox, oy, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Token shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(pX, pY + radius * 0.7, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fill();

        // Token circle
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.arc(pX, pY, radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Player Avatar Glyph
        ctx.font = `${Math.floor(radius * 1.1)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.avatar, pX, pY - 1);

        // Name tag & raft badge
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(player.displayName.slice(0, 8), pX, pY + radius + 11);

        if (player.tools.hasRaft) {
          ctx.fillText('⛵', pX + radius - 2, pY - radius + 4);
        }
      }

      // 6. Weather & Atmosphere Overlay (Rain or Embers)
      if (isStorm) {
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.25)';
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 20; i++) {
          const rx = (frame * 12 + i * 43) % width;
          const ry = (frame * 18 + i * 67) % height;
          ctx.beginPath();
          ctx.moveTo(rx, ry);
          ctx.lineTo(rx - 8, ry + 16);
          ctx.stroke();
        }
      } else if (isFinal) {
        // Floating red embers
        ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
        for (let i = 0; i < 15; i++) {
          const ex = (Math.sin(frame * 0.02 + i) * 80 + i * 45) % width;
          const ey = height - ((frame * 2 + i * 38) % height);
          ctx.beginPath();
          ctx.arc(ex, ey, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState, localSeatIndex, interactionMode]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const size = gameState.gridSize;
    const padding = 28;
    const availableSize = Math.min(canvas.width, canvas.height) - padding * 2;
    const tileSize = availableSize / size;
    const startX = (canvas.width - tileSize * size) / 2;
    const startY = (canvas.height - tileSize * size) / 2;

    const gx = Math.floor((clickX - startX) / tileSize);
    const gy = Math.floor((clickY - startY) / tileSize);

    if (gx >= 0 && gx < size && gy >= 0 && gy < size) {
      // Check if a player was clicked on this tile
      const clickedPlayer = gameState.players.find((p) => p.isAlive && p.x === gx && p.y === gy);
      if (clickedPlayer) {
        onPlayerClick(clickedPlayer);
      } else {
        onTileClick({ x: gx, y: gy });
      }
    }
  };

  return (
    <div className="relative w-full aspect-square max-w-[560px] mx-auto rounded-2xl overflow-hidden border border-surface-border bg-slate-950 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={560}
        height={560}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-pointer select-none touch-none"
      />
    </div>
  );
}
