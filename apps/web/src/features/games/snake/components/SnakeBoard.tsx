'use client';

import React, { useEffect, useRef } from 'react';
import type { Coordinate, Direction, SnakeGameStatus } from '../types/snake.types';

interface SnakeBoardProps {
  snake: Coordinate[];
  food: Coordinate;
  gridSize: number;
  direction: Direction;
  status: SnakeGameStatus;
}

const COLOR_CANVAS_BG = '#0a0f19';
const COLOR_GRID_LINE = 'rgba(35, 47, 69, 0.45)';
const COLOR_FOOD = '#f59e0b';
const COLOR_FOOD_GLOW = 'rgba(245, 158, 11, 0.35)';
const COLOR_SNAKE_HEAD = '#fbbf24';
const COLOR_SNAKE_BODY = '#10b981';
const COLOR_EYE = '#0f172a';

function drawGrid(ctx: CanvasRenderingContext2D, size: number, cellSize: number) {
  ctx.strokeStyle = COLOR_GRID_LINE;
  ctx.lineWidth = 1;
  for (let i = 1; i < size; i++) {
    const pos = i * cellSize;
    ctx.beginPath();
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, size * cellSize);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, pos);
    ctx.lineTo(size * cellSize, pos);
    ctx.stroke();
  }
}

function drawFood(ctx: CanvasRenderingContext2D, food: Coordinate, cellSize: number) {
  if (food.x < 0 || food.y < 0) return;
  const cx = food.x * cellSize + cellSize / 2;
  const cy = food.y * cellSize + cellSize / 2;
  const radius = cellSize * 0.38;

  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.5);
  gradient.addColorStop(0, COLOR_FOOD);
  gradient.addColorStop(0.7, COLOR_FOOD);
  gradient.addColorStop(1, COLOR_FOOD_GLOW);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawSnake(
  ctx: CanvasRenderingContext2D,
  snake: Coordinate[],
  cellSize: number,
  dir: Direction,
) {
  snake.forEach((segment, index) => {
    const x = segment.x * cellSize;
    const y = segment.y * cellSize;
    const isHead = index === 0;
    const padding = cellSize * 0.08;
    const segSize = cellSize - padding * 2;

    ctx.fillStyle = isHead ? COLOR_SNAKE_HEAD : COLOR_SNAKE_BODY;
    ctx.beginPath();
    ctx.roundRect(x + padding, y + padding, segSize, segSize, isHead ? 6 : 4);
    ctx.fill();

    if (isHead) {
      drawEyes(ctx, x, y, cellSize, dir);
    }
  });
}

function drawEyes(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cellSize: number,
  dir: Direction,
) {
  ctx.fillStyle = COLOR_EYE;
  const eyeRadius = cellSize * 0.09;
  const off1 = cellSize * 0.3;
  const off2 = cellSize * 0.7;
  let ex1 = x + off1;
  let ey1 = y + off1;
  let ex2 = x + off2;
  let ey2 = y + off1;

  if (dir === 'DOWN') {
    ey1 = y + off2;
    ey2 = y + off2;
  } else if (dir === 'LEFT') {
    ex1 = x + off1;
    ex2 = x + off1;
    ey2 = y + off2;
  } else if (dir === 'RIGHT') {
    ex1 = x + off2;
    ex2 = x + off2;
    ey2 = y + off2;
  }

  ctx.beginPath();
  ctx.arc(ex1, ey1, eyeRadius, 0, Math.PI * 2);
  ctx.arc(ex2, ey2, eyeRadius, 0, Math.PI * 2);
  ctx.fill();
}

export function SnakeBoard({ snake, food, gridSize, direction }: SnakeBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const render = () => {
      const width = container.clientWidth;
      if (width === 0) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = width * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${width}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(dpr, dpr);
      ctx.fillStyle = COLOR_CANVAS_BG;
      ctx.fillRect(0, 0, width, width);

      const cellSize = width / gridSize;
      drawGrid(ctx, gridSize, cellSize);
      drawFood(ctx, food, cellSize);
      drawSnake(ctx, snake, cellSize, direction);
    };

    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(container);
    return () => observer.disconnect();
  }, [snake, food, gridSize, direction]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full aspect-square rounded-xl overflow-hidden border border-surface-border shadow-2xl bg-surface-base"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}
