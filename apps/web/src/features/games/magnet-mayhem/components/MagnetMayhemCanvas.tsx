'use client';

import React, { useEffect } from 'react';
import { DEFAULT_ARENA_HEIGHT, DEFAULT_ARENA_WIDTH } from '../engine/magnet-engine';

export interface MagnetMayhemCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onPointerMove: (clientX: number, clientY: number) => void;
  onPointerDown: (button: number) => void;
  onPointerUp: () => void;
}

export function MagnetMayhemCanvas({
  canvasRef,
  onPointerMove,
  onPointerDown,
  onPointerUp,
}: MagnetMayhemCanvasProps) {
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = DEFAULT_ARENA_WIDTH;
      canvas.height = DEFAULT_ARENA_HEIGHT;
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  return (
    <div className="relative w-full h-full min-h-[480px] sm:min-h-[580px] flex-1 bg-[#060913] rounded-xl overflow-hidden border border-[#1e293b] shadow-2xl flex items-center justify-center select-none">
      <canvas
        ref={canvasRef}
        width={DEFAULT_ARENA_WIDTH}
        height={DEFAULT_ARENA_HEIGHT}
        className="w-full h-full object-contain block touch-none cursor-crosshair"
        onContextMenu={(e) => e.preventDefault()}
        onPointerMove={(e) => onPointerMove(e.clientX, e.clientY)}
        onPointerDown={(e) => onPointerDown(e.button)}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}
