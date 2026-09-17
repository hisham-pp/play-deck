'use client';

import React, { useEffect, useRef } from 'react';
import type { Coordinate, Direction, SnakeGameStatus } from '../types/snake.types';
import { SnakeParticleSystem } from './canvas/snake-particles';
import { SnakeRenderer2D, type SnakeTheme } from './canvas/SnakeRenderer2D';

interface SnakeBoardProps {
  snake: Coordinate[];
  food: Coordinate;
  gridSize: number;
  direction: Direction;
  status: SnakeGameStatus;
  speedMs: number;
  score?: number;
  theme?: SnakeTheme;
}

export function SnakeBoard({
  snake,
  food,
  gridSize,
  direction,
  status,
  speedMs,
  score = 0,
  theme = 'grass',
}: SnakeBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<SnakeRenderer2D | null>(null);
  const particlesRef = useRef<SnakeParticleSystem | null>(null);

  const prevSnakeRef = useRef<Coordinate[]>(snake);
  const prevScoreRef = useRef<number>(score);
  const prevStatusRef = useRef<SnakeGameStatus>(status);
  const lastMoveTimeRef = useRef<number>(performance.now());
  const prevFoodRef = useRef<Coordinate>(food);

  // Initialize renderer & particles
  if (!rendererRef.current) {
    rendererRef.current = new SnakeRenderer2D({ gridSize, theme });
  }
  if (!particlesRef.current) {
    particlesRef.current = new SnakeParticleSystem();
  }

  // Update theme when changed
  useEffect(() => {
    rendererRef.current?.setTheme(theme);
  }, [theme]);

  // Update grid size when config changes
  useEffect(() => {
    rendererRef.current?.setGridSize(gridSize);
  }, [gridSize]);

  // Track snake movement and update interpolation reference
  useEffect(() => {
    prevSnakeRef.current = snake;
    lastMoveTimeRef.current = performance.now();
  }, [snake]);

  // Detect food consumed (score increased)
  useEffect(() => {
    if (score > prevScoreRef.current) {
      const cellSize =
        (canvasRef.current?.width ?? 600) / ((window.devicePixelRatio || 1) * gridSize);
      const fx = (prevFoodRef.current.x + 0.5) * cellSize;
      const fy = (prevFoodRef.current.y + 0.5) * cellSize;
      particlesRef.current?.triggerEatBurst(fx, fy);
      particlesRef.current?.triggerScorePopup(fx, fy, `+${score - prevScoreRef.current}`);
    }
    prevScoreRef.current = score;
    prevFoodRef.current = food;
  }, [score, food, gridSize]);

  // Detect game-over collision
  useEffect(() => {
    if (prevStatusRef.current !== 'game-over' && status === 'game-over') {
      const cellSize =
        (canvasRef.current?.width ?? 600) / ((window.devicePixelRatio || 1) * gridSize);
      const head = snake[0] ?? { x: 10, y: 10 };
      const hx = (head.x + 0.5) * cellSize;
      const hy = (head.y + 0.5) * cellSize;
      particlesRef.current?.triggerGameOver(hx, hy);
    }
    if (status === 'idle' || status === 'countdown') {
      particlesRef.current?.clear();
    }
    prevStatusRef.current = status;
  }, [status, snake, gridSize]);

  // Main 60fps render loop with High-DPI support
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.round(rect.width * dpr);
      const displayHeight = Math.round(rect.height * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      const logicalWidth = rect.width;
      const logicalHeight = rect.height;

      // Calculate smooth interpolation progress
      const elapsed = performance.now() - lastMoveTimeRef.current;
      const progress = status === 'playing' ? Math.min(1.0, elapsed / Math.max(20, speedMs)) : 1.0;

      if (rendererRef.current && particlesRef.current) {
        rendererRef.current.render(
          ctx,
          logicalWidth,
          logicalHeight,
          snake,
          food,
          direction,
          status,
          particlesRef.current,
          progress,
          prevSnakeRef.current,
          time,
        );
      }

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [snake, food, direction, status, speedMs, gridSize]);

  const isGrass = theme === 'grass';

  return (
    <div
      className={`relative w-full h-full aspect-square rounded-2xl overflow-hidden border shadow-2xl flex items-center justify-center select-none transition-colors duration-300 ${
        isGrass
          ? 'border-[#578a1c] bg-[#578a1c] shadow-[0_12px_36px_rgba(0,0,0,0.25)]'
          : 'border-surface-border/80 bg-[#05070c] shadow-[0_0_50px_-12px_rgba(16,185,129,0.15)]'
      }`}
    >
      <div className="relative w-full h-full rounded-xl overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block rounded-xl touch-none" />
      </div>
    </div>
  );
}
