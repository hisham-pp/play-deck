'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import type { Coordinate, WordSearchGrid } from '../types/word-search.types';

interface Props {
  grid: WordSearchGrid;
  localPlayerId: string | null;
  onSelectionCommit: (cells: Coordinate[]) => void;
}

// Player colors for claimed words
const CLAIM_COLORS: Record<string, string> = {};
const COLOR_POOL = ['#f59e0b', '#06b6d4', '#a78bfa', '#34d399', '#fb923c', '#f472b6'];
let colorIdx = 0;

function getPlayerColor(id: string): string {
  if (!CLAIM_COLORS[id]) {
    CLAIM_COLORS[id] = COLOR_POOL[colorIdx++ % COLOR_POOL.length];
  }
  return CLAIM_COLORS[id];
}

function isStraightLine(a: Coordinate, b: Coordinate, c: Coordinate): boolean {
  const dr1 = b.row - a.row;
  const dc1 = b.col - a.col;
  const dr2 = c.row - b.row;
  const dc2 = c.col - b.col;
  return dr1 === dr2 && dc1 === dc2;
}

function coordKey(c: Coordinate) {
  return `${c.row}-${c.col}`;
}

export function WordSearchGridView({ grid, localPlayerId, onSelectionCommit }: Props) {
  const [dragging, setDragging] = useState(false);
  const [cells, setCells] = useState<Coordinate[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  // Build a map of each cell -> claimed player
  const claimedCells = new Map<string, string>();
  for (const p of grid.placements) {
    if (p.found && p.claimedBy) {
      for (const coord of p.coordinates) {
        claimedCells.set(coordKey(coord), p.claimedBy);
      }
    }
  }

  const getCoordFromEvent = useCallback(
    (clientX: number, clientY: number): Coordinate | null => {
      const el = gridRef.current;
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      const cellSize = rect.width / grid.size;
      const col = Math.floor((clientX - rect.left) / cellSize);
      const row = Math.floor((clientY - rect.top) / cellSize);
      if (row < 0 || row >= grid.size || col < 0 || col >= grid.size) return null;
      return { row, col };
    },
    [grid.size],
  );

  const addCell = useCallback((coord: Coordinate) => {
    setCells((prev) => {
      if (prev.length === 0) return [coord];
      const last = prev[prev.length - 1];
      if (coordKey(last) === coordKey(coord)) return prev;
      // Only extend if it keeps a straight line
      if (prev.length === 1) return [...prev, coord];
      const secondLast = prev[prev.length - 2];
      if (isStraightLine(secondLast, last, coord)) return [...prev, coord];
      return prev;
    });
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    const coord = getCoordFromEvent(e.clientX, e.clientY);
    if (!coord) return;
    setDragging(true);
    setCells([coord]);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    const coord = getCoordFromEvent(e.clientX, e.clientY);
    if (coord) addCell(coord);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    onSelectionCommit(cells);
    setCells([]);
  };

  const selectedSet = new Set(cells.map(coordKey));

  const cellSize = Math.min(42, Math.floor(500 / grid.size));

  return (
    <div
      ref={gridRef}
      className="relative select-none touch-none cursor-crosshair"
      style={{ width: cellSize * grid.size, height: cellSize * grid.size }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Grid cells */}
      {grid.letters.map((row, r) =>
        row.map((letter, c) => {
          const key = `${r}-${c}`;
          const claimed = claimedCells.get(key);
          const isSelected = selectedSet.has(key);
          const isLocalClaim = claimed === localPlayerId;

          let bg = 'bg-slate-800/70 border-slate-700/40';
          let textColor = 'text-slate-200';

          if (isSelected) {
            bg = 'bg-amber-500/80 border-amber-400';
            textColor = 'text-slate-950 font-bold';
          } else if (claimed) {
            const color = getPlayerColor(claimed);
            const claimedTextColor = isLocalClaim
              ? 'text-white font-semibold'
              : 'text-white/90 font-medium';
            return (
              <div
                key={key}
                className={`absolute flex items-center justify-center text-xs font-bold border rounded-sm ${claimedTextColor}`}
                style={{
                  top: r * cellSize,
                  left: c * cellSize,
                  width: cellSize - 1,
                  height: cellSize - 1,
                  backgroundColor: color + '55',
                  borderColor: color + 'cc',
                  fontSize: Math.max(10, cellSize * 0.45),
                }}
              >
                {letter}
              </div>
            );
          }

          return (
            <div
              key={key}
              className={`absolute flex items-center justify-center border rounded-sm transition-colors duration-75 ${bg} ${textColor}`}
              style={{
                top: r * cellSize,
                left: c * cellSize,
                width: cellSize - 1,
                height: cellSize - 1,
                fontSize: Math.max(10, cellSize * 0.45),
              }}
            >
              {letter}
            </div>
          );
        }),
      )}
    </div>
  );
}

// Keyboard selection helper: exported for the game shell to attach keydown
export function useKeyboardGridNav(
  _grid: WordSearchGrid | null,
  _onCommit: (cells: Coordinate[]) => void,
) {
  // (Reserved for future keyboard navigation implementation)
  useEffect(() => {}, []);
}
