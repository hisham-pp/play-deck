'use client';

import React, { useEffect } from 'react';

export interface FloorIsLavaCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

export function FloorIsLavaCanvas({ canvasRef }: FloorIsLavaCanvasProps) {
  useEffect(() => {
    function handleResize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    }

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1 bg-[#140505] rounded-xl overflow-hidden border border-[#450a0a] shadow-2xl">
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
