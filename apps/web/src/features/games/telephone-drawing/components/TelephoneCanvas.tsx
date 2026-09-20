'use client';

import { Check, Eraser, Paintbrush, RotateCcw, Trash2 } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { Badge, Button } from '@playdeck/ui';

import { telephoneSoundService } from '../services/telephone-sound.service';

export interface TelephoneCanvasProps {
  promptText: string;
  timeRemaining: number;
  onSubmit: (drawingData: string) => void;
}

const PALETTE = [
  '#000000',
  '#ffffff',
  '#ef4444',
  '#f59e0b',
  '#10b981',
  '#3b82f6',
  '#8b5cf6',
  '#78350f',
];
const BRUSH_SIZES = [
  { label: 'S', size: 3 },
  { label: 'M', size: 7 },
  { label: 'L', size: 14 },
];

export const TelephoneCanvas: React.FC<TelephoneCanvasProps> = ({
  promptText,
  timeRemaining,
  onSubmit,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState<string>('#000000');
  const [brushSize, setBrushSize] = useState<number>(7);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [history, setHistory] = useState<ImageData[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHistory([ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const pushSnapshot = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setHistory((prev) => [...prev.slice(-15), ctx.getImageData(0, 0, canvas.width, canvas.height)]);
  }, []);

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (canvas.width / rect.width),
      y: (e.clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.setPointerCapture(e.pointerId);
    setIsDrawing(true);

    const { x, y } = getCanvasCoords(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = isEraser ? '#fdfbf7' : color;
    ctx.lineWidth = isEraser ? brushSize * 2 : brushSize;
    ctx.lineTo(x, y);
    ctx.stroke();

    telephoneSoundService.playStroke();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignored
    }
    pushSnapshot();
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;

    const nextHistory = [...history];
    nextHistory.pop();
    const previous = nextHistory[nextHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setHistory(nextHistory);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#fdfbf7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    pushSnapshot();
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto items-center">
      <div className="w-full bg-[#0c1322] border border-amber-500/40 rounded-xl p-4 text-center shadow-lg">
        <div className="text-xs uppercase font-bold tracking-widest text-amber-400 mb-1 flex items-center justify-center gap-2">
          <span>🎨 Draw This Phrase:</span>
          <Badge variant={timeRemaining <= 10 ? 'warning' : 'arcade'} className="font-mono text-xs">
            ⏱️ {timeRemaining}s
          </Badge>
        </div>
        <div className="text-xl sm:text-2xl font-black text-amber-200 tracking-wide font-sans">
          "{promptText}"
        </div>
      </div>

      <div className="relative rounded-2xl overflow-hidden border-4 border-amber-950/60 shadow-2xl bg-[#fdfbf7] touch-none">
        <canvas
          ref={canvasRef}
          width={560}
          height={380}
          className="w-full max-w-[560px] h-auto aspect-[14/9.5] cursor-crosshair block"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      <div className="w-full bg-[#0c1322]/95 border border-slate-800 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsEraser(false)}
            className={`p-2 rounded-lg border transition-all ${!isEraser ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            title="Brush"
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setIsEraser(true)}
            className={`p-2 rounded-lg border transition-all ${isEraser ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
            title="Eraser"
          >
            <Eraser className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => setBrushSize(b.size)}
              className={`px-2.5 py-1 text-xs font-bold rounded transition-colors ${brushSize === b.size ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
            >
              {b.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setColor(c);
                setIsEraser(false);
              }}
              style={{ backgroundColor: c }}
              className={`w-6 h-6 rounded-full border transition-transform ${color === c && !isEraser ? 'scale-125 border-amber-400 ring-2 ring-amber-400/40 shadow' : 'border-slate-700 hover:scale-110'}`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={handleUndo}
            disabled={history.length <= 1}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-amber-300 disabled:opacity-40 disabled:cursor-not-allowed"
            title="Undo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="p-2 rounded-lg border border-slate-800 bg-slate-900 text-slate-400 hover:text-red-400"
            title="Clear"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              const canvas = canvasRef.current;
              if (canvas) onSubmit(canvas.toDataURL('image/png'));
            }}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4"
          >
            <Check className="w-4 h-4 mr-1" />
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};
