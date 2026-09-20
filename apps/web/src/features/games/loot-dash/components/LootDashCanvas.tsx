'use client';

import React, { useRef, useEffect } from 'react';
import { ARENA_WIDTH, ARENA_HEIGHT } from '../engine/loot-engine';
import { LootRenderer } from '../render/loot-renderer';
import type { LootDashArenaState, LootDashConfig } from '../types/loot-dash.types';

interface LootDashCanvasProps {
  arenaState: LootDashArenaState;
  config: LootDashConfig;
  onMouseMove?: (x: number, y: number) => void;
}

const renderer = new LootRenderer();

export function LootDashCanvas({ arenaState, config, onMouseMove }: LootDashCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderer.render(ctx, arenaState, {
      highContrast: config.highContrast,
      reducedMotion: config.reducedMotion,
    });
  }, [arenaState, config]);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!onMouseMove) return;
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
        className="w-full h-full block touch-none select-none"
        onPointerMove={handlePointerMove}
      />
      {arenaState.status === 'countdown' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs pointer-events-none">
          <div className="text-6xl font-black text-amber-400 tracking-wider animate-pulse">
            {Math.ceil(arenaState.countdown)}
          </div>
        </div>
      )}
    </div>
  );
}
