'use client';

import React, { useEffect, useRef } from 'react';
import { SharedBrainRenderer } from '../render/shared-brain-renderer';
import type { CourseDefinition, PlayerPair } from '../types/shared-brain.types';

interface SharedBrainCanvasProps {
  course: CourseDefinition;
  pairs: PlayerPair[];
  focusedPairId: string | null;
  collectedTokenIds: Set<string>;
  activeSwitchIds: Set<string>;
  doorStates: Map<string, number>;
}

export function SharedBrainCanvas({
  course,
  pairs,
  focusedPairId,
  collectedTokenIds,
  activeSwitchIds,
  doorStates,
}: SharedBrainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<SharedBrainRenderer | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    rendererRef.current = new SharedBrainRenderer(ctx);
  }, []);

  useEffect(() => {
    let animId: number;

    const renderLoop = () => {
      if (rendererRef.current) {
        rendererRef.current.render(
          course,
          pairs,
          focusedPairId,
          collectedTokenIds,
          activeSwitchIds,
          doorStates,
        );
      }
      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [activeSwitchIds, collectedTokenIds, course, doorStates, focusedPairId, pairs]);

  return (
    <div className="relative mx-auto flex w-full max-w-4xl items-center justify-center overflow-hidden rounded-xl border border-deck-border bg-deck-900 shadow-2xl">
      <canvas
        ref={canvasRef}
        width={800}
        height={460}
        className="block h-[460px] w-full max-w-[800px] cursor-crosshair touch-none"
      />
    </div>
  );
}
