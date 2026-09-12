'use client';

import React, { useEffect, useRef } from 'react';
import { COLS, HIDDEN_ROWS, VISIBLE_ROWS } from '../engine/tetris-constants';
import { getGhostPiece, getOccupiedCoordinates } from '../engine/tetris-utils';
import type {
  ActivePiece,
  TetrisBoard as TetrisBoardType,
  TetrominoType,
} from '../types/tetris.types';

interface TetrisBoardProps {
  board: TetrisBoardType;
  active: ActivePiece | null;
}

const COLOR_CANVAS_BG = '#0a0f19';
const COLOR_GRID_LINE = 'rgba(35, 47, 69, 0.45)';

const PIECE_COLORS: Record<TetrominoType, { fill: string; light: string; dark: string }> = {
  I: { fill: '#22d3ee', light: '#67e8f9', dark: '#0e7490' },
  O: { fill: '#facc15', light: '#fde047', dark: '#a16207' },
  T: { fill: '#c084fc', light: '#e9d5ff', dark: '#7e22ce' },
  S: { fill: '#4ade80', light: '#bbf7d0', dark: '#15803d' },
  Z: { fill: '#f87171', light: '#fecaca', dark: '#b91c1c' },
  J: { fill: '#60a5fa', light: '#bfdbfe', dark: '#1d4ed8' },
  L: { fill: '#fb923c', light: '#fed7aa', dark: '#c2410c' },
};

function drawGrid(ctx: CanvasRenderingContext2D, cols: number, rows: number, cellSize: number) {
  ctx.strokeStyle = COLOR_GRID_LINE;
  ctx.lineWidth = 1;
  for (let c = 1; c < cols; c++) {
    const x = c * cellSize;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, rows * cellSize);
    ctx.stroke();
  }
  for (let r = 1; r < rows; r++) {
    const y = r * cellSize;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(cols * cellSize, y);
    ctx.stroke();
  }
}

function drawCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  cellSize: number,
  type: TetrominoType,
  alpha = 1,
) {
  const colors = PIECE_COLORS[type];
  const x = col * cellSize;
  const y = row * cellSize;
  const padding = cellSize * 0.06;
  const size = cellSize - padding * 2;

  ctx.globalAlpha = alpha;
  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  gradient.addColorStop(0, colors.light);
  gradient.addColorStop(0.5, colors.fill);
  gradient.addColorStop(1, colors.dark);

  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(x + padding, y + padding, size, size, cellSize * 0.14);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.lineWidth = Math.max(1, cellSize * 0.03);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function drawGhostCell(
  ctx: CanvasRenderingContext2D,
  col: number,
  row: number,
  cellSize: number,
  type: TetrominoType,
) {
  const colors = PIECE_COLORS[type];
  const x = col * cellSize;
  const y = row * cellSize;
  const padding = cellSize * 0.1;
  const size = cellSize - padding * 2;

  ctx.strokeStyle = colors.fill;
  ctx.globalAlpha = 0.55;
  ctx.lineWidth = Math.max(1, cellSize * 0.06);
  ctx.setLineDash([cellSize * 0.12, cellSize * 0.1]);
  ctx.beginPath();
  ctx.roundRect(x + padding, y + padding, size, size, cellSize * 0.14);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;
}

export function TetrisBoard({ board, active }: TetrisBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const render = () => {
      const clientW = container.clientWidth;
      const clientH = container.clientHeight;
      if (clientW === 0 || clientH === 0) return;

      const cellSize = Math.min(clientW / COLS, clientH / VISIBLE_ROWS);
      const width = cellSize * COLS;
      const height = cellSize * VISIBLE_ROWS;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = COLOR_CANVAS_BG;
      ctx.fillRect(0, 0, width, height);

      drawGrid(ctx, COLS, VISIBLE_ROWS, cellSize);

      for (let row = HIDDEN_ROWS; row < board.length; row++) {
        for (let col = 0; col < COLS; col++) {
          const cell = board[row][col];
          if (cell) {
            drawCell(ctx, col, row - HIDDEN_ROWS, cellSize, cell);
          }
        }
      }

      if (active) {
        const ghost = getGhostPiece(board, active);
        if (ghost.row !== active.row) {
          for (const { row, col } of getOccupiedCoordinates(ghost)) {
            if (row >= HIDDEN_ROWS) {
              drawGhostCell(ctx, col, row - HIDDEN_ROWS, cellSize, active.type);
            }
          }
        }

        for (const { row, col } of getOccupiedCoordinates(active)) {
          if (row >= HIDDEN_ROWS) {
            drawCell(ctx, col, row - HIDDEN_ROWS, cellSize, active.type);
          }
        }
      }
    };

    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(container);
    return () => observer.disconnect();
  }, [board, active]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center rounded-2xl overflow-hidden border border-surface-border shadow-2xl bg-surface-base"
    >
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}
