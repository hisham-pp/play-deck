'use client';

import React, { useRef, useEffect } from 'react';
import { ARENA_WIDTH, ARENA_HEIGHT } from '../engine/tank-engine';
import { renderTinyTankArena } from '../render/tank-renderer';
import type { TinyTankArenaState, TinyTankConfig, Vector2D } from '../types/tiny-tank.types';

interface TinyTankCanvasProps {
  arenaState: TinyTankArenaState;
  config: TinyTankConfig;
  localPlayerId: string;
  mousePos: Vector2D | null;
  onMouseMove: (x: number, y: number) => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
}

export function TinyTankCanvas({
  arenaState,
  config,
  localPlayerId,
  mousePos,
  onMouseMove,
  onMouseDown,
  onMouseUp,
}: TinyTankCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderTinyTankArena(ctx, arenaState, config, localPlayerId, mousePos);
  }, [arenaState, config, localPlayerId, mousePos]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = ARENA_WIDTH / rect.width;
    const scaleY = ARENA_HEIGHT / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    onMouseMove(x, y);
  };

  return (
    <div className="relative w-full max-w-[960px] aspect-[3/2] mx-auto rounded-xl overflow-hidden border border-slate-700/60 shadow-2xl bg-slate-950">
      <canvas
        ref={canvasRef}
        width={ARENA_WIDTH}
        height={ARENA_HEIGHT}
        className="w-full h-full block cursor-crosshair touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerDown={onMouseDown}
        onPointerUp={onMouseUp}
      />
      {arenaState.status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <div className="text-6xl font-black text-amber-400 tracking-wider animate-ping">
            {Math.ceil(arenaState.countdown)}
          </div>
        </div>
      )}
    </div>
  );
}
