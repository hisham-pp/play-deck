'use client';

import type { RefObject } from 'react';
import { ARENA_HEIGHT, ARENA_WIDTH } from '../engine/shadow-tag-constants';
import type { ShadowTagHud } from '../types/shadow-tag.types';

interface ShadowTagCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  hud: ShadowTagHud;
  arenaName: string;
}

/**
 * The arena surface. The canvas carries a text description rather than being
 * left as an unlabelled box, and the live state a screen reader needs is
 * published beside it rather than drawn into pixels.
 */
export function ShadowTagCanvas({ canvasRef, hud, arenaName }: ShadowTagCanvasProps) {
  return (
    <div className="relative w-full overflow-hidden border-x border-surface-border bg-[#05070d]">
      <canvas
        ref={canvasRef}
        className="block h-auto w-full touch-none"
        style={{ aspectRatio: `${ARENA_WIDTH} / ${ARENA_HEIGHT}` }}
        role="img"
        aria-label={`${arenaName}. ${hud.itName} is it. ${hud.secondsLeft} seconds left.`}
      />

      {hud.phase === 'countdown' && (
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/50">
          <span className="font-display text-6xl font-black text-amber-400">{hud.countdown}</span>
          <p className="max-w-xs text-center text-xs text-slate-300">
            Nobody can see you. Nobody can see anybody. Watch the shadows.
          </p>
        </div>
      )}

      {hud.phase === 'playing' && hud.isLocalIt && (
        <div className="pointer-events-none absolute inset-0 ring-2 ring-inset ring-rose-500/40" />
      )}
    </div>
  );
}
