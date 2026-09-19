'use client';

import type { RefObject } from 'react';
import { MAP_HEIGHT, MAP_WIDTH, PHASE_COUNTDOWN } from '../engine/giant-constants';
import type { GiantHud } from '../types/giant.types';

interface GiantCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hud: GiantHud;
  mapName: string;
}

/**
 * The chamber itself. The canvas carries a text description rather than being
 * left as an unlabelled box, and the prompt for whatever is in reach is real
 * markup beside it rather than pixels drawn into the scene.
 */
export function GiantCanvas({ canvasRef, hud, mapName }: GiantCanvasProps) {
  const restless = hud.mood === 'restless' || hud.mood === 'awake';

  return (
    <div className="relative w-full overflow-hidden border-x border-surface-border bg-[#080b13]">
      <canvas
        ref={canvasRef}
        className="block h-auto w-full touch-none"
        style={{ aspectRatio: `${MAP_WIDTH} / ${MAP_HEIGHT}` }}
        role="img"
        aria-label={`${mapName}. The giant is ${hud.mood}. Noise at ${hud.noisePercent} per cent. ${hud.secondsLeft} seconds left.`}
      />

      {hud.phase === PHASE_COUNTDOWN && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/60">
          <span className="font-display text-6xl font-black text-amber-400">{hud.countdown}</span>
          <p className="max-w-xs text-center text-xs text-slate-300">
            Everything you do makes a sound. Move slowly, and talk quietly.
          </p>
        </div>
      )}

      {hud.prompt && (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center px-4">
          <span className="rounded-full border border-amber-500/30 bg-slate-950/85 px-3 py-1.5 text-center text-[11px] font-medium text-amber-200">
            {hud.prompt}
          </span>
        </div>
      )}

      {restless && (
        <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-rose-500/40" />
      )}
    </div>
  );
}
