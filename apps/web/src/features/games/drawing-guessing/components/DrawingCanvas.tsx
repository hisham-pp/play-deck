'use client';

import { Eraser, Paintbrush, RotateCcw, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { DrawingPoint, DrawingStroke } from '../engine/drawing-guessing-engine';

export const CANVAS_WIDTH = 700;
export const CANVAS_HEIGHT = 500;

const PALETTE = [
  '#0f172a', // Slate black
  '#ffffff', // White
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#22c55e', // Green
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#78350f', // Brown
];

const STROKE_SIZES = [
  { label: 'Fine', size: 3 },
  { label: 'Medium', size: 6 },
  { label: 'Thick', size: 12 },
  { label: 'Jumbo', size: 24 },
];

interface DrawingCanvasProps {
  strokes: DrawingStroke[];
  isDrawer: boolean;
  drawerName: string;
  onAddStroke: (stroke: DrawingStroke) => void;
  onUndo: () => void;
  onClear: () => void;
}

export function DrawingCanvas({
  strokes,
  isDrawer,
  drawerName,
  onAddStroke,
  onUndo,
  onClear,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('#0f172a');
  const [selectedSize, setSelectedSize] = useState<number>(6);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[] | null>(null);

  // Redraw canvas whenever strokes or current stroke update
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background to clean paper white
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw subtle grid texture for authentic sketchbook feel
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1;
    for (let x = 25; x < CANVAS_WIDTH; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let y = 25; y < CANVAS_HEIGHT; y += 25) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }

    // Render committed strokes
    const renderStroke = (stroke: DrawingStroke) => {
      if (stroke.points.length === 0) return;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.isEraser ? '#ffffff' : stroke.color;
      ctx.lineWidth = stroke.size;

      if (stroke.points.length === 1) {
        ctx.fillStyle = stroke.isEraser ? '#ffffff' : stroke.color;
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    };

    strokes.forEach(renderStroke);

    // Render active drawing stroke
    if (currentStroke && currentStroke.length > 0) {
      renderStroke({
        id: 'active',
        color: selectedColor,
        size: selectedSize,
        points: currentStroke,
        isEraser,
      });
    }
  }, [strokes, currentStroke, selectedColor, selectedSize, isEraser]);

  // Coordinate conversion helper
  const getCanvasCoords = (clientX: number, clientY: number): DrawingPoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: Math.round((clientX - rect.left) * scaleX),
      y: Math.round((clientY - rect.top) * scaleY),
    };
  };

  // Mouse & Touch Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;
    setCurrentStroke([coords]);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawer || !currentStroke) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (!coords) return;
    setCurrentStroke((prev) => (prev ? [...prev, coords] : [coords]));
  };

  const handlePointerUp = () => {
    if (!isDrawer || !currentStroke) return;
    if (currentStroke.length > 0) {
      onAddStroke({
        id: `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        color: selectedColor,
        size: selectedSize,
        points: currentStroke,
        isEraser,
      });
    }
    setCurrentStroke(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Canvas Viewport Frame */}
      <div className="relative w-full aspect-[7/5] bg-white rounded-xl shadow-2xl border-2 border-slate-700 overflow-hidden touch-none select-none">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className={`w-full h-full block ${isDrawer ? 'cursor-crosshair' : 'cursor-default'}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />

        {/* Read-only overlay watermark for spectators/guessers */}
        {!isDrawer && (
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 text-xs font-semibold text-slate-300 flex items-center gap-2 pointer-events-none shadow-md">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>{drawerName} is drawing...</span>
          </div>
        )}
      </div>

      {/* Drawer Control Toolbar */}
      {isDrawer ? (
        <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {PALETTE.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => {
                  setSelectedColor(color);
                  setIsEraser(false);
                }}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 active:scale-95 ${
                  selectedColor === color && !isEraser
                    ? 'border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/40'
                    : 'border-slate-700'
                }`}
                style={{ backgroundColor: color }}
                title={`Color: ${color}`}
                aria-label={`Color: ${color}`}
              />
            ))}
          </div>

          {/* Stroke Sizes */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
            {STROKE_SIZES.map((item) => (
              <button
                key={item.size}
                type="button"
                onClick={() => setSelectedSize(item.size)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  selectedSize === item.size
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`${item.label} stroke`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions: Eraser, Undo, Clear */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsEraser((prev) => !prev)}
              className={`p-2 rounded-lg border transition-colors flex items-center gap-1 text-xs font-semibold ${
                isEraser
                  ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
              title="Toggle Eraser"
            >
              <Eraser className="w-4 h-4" />
              <span>Eraser</span>
            </button>

            <button
              type="button"
              onClick={onUndo}
              disabled={strokes.length === 0}
              className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Undo last stroke"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onClear}
              disabled={strokes.length === 0}
              className="p-2 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 hover:bg-red-900/60 hover:text-red-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              title="Clear entire canvas"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Paintbrush className="w-4 h-4 text-amber-400 animate-bounce" />
            <span>Watch the canvas carefully and type your guess in the chat!</span>
          </div>
          <span className="text-slate-500 font-mono">1 guesser = 1 point race</span>
        </div>
      )}
    </div>
  );
}
