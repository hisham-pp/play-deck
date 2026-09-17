'use client';

import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import { MAX_COLS, MAX_ROWS, MIN_COLS, MIN_ROWS } from '../engine/minesweeper-constants';
import type { BoardDimensions } from '../types/minesweeper.types';

interface MinesweeperCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialConfig: BoardDimensions;
  onConfirm: (config: BoardDimensions) => void;
}

export function MinesweeperCustomModal({
  isOpen,
  onClose,
  initialConfig,
  onConfirm,
}: MinesweeperCustomModalProps) {
  const [rows, setRows] = useState(initialConfig.rows);
  const [cols, setCols] = useState(initialConfig.cols);
  const [mines, setMines] = useState(initialConfig.mines);

  const maxMines = Math.max(1, rows * cols - 9);
  const safeMines = Math.min(mines, maxMines);
  const density = ((safeMines / (rows * cols)) * 100).toFixed(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      rows: Math.max(MIN_ROWS, Math.min(MAX_ROWS, rows)),
      cols: Math.max(MIN_COLS, Math.min(MAX_COLS, cols)),
      mines: Math.max(1, Math.min(maxMines, mines)),
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Custom Board Configuration">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 py-2">
        <p className="text-xs text-deck-400">
          Configure a custom grid size and mine count. The first click is always guaranteed safe.
        </p>

        {/* Rows Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-deck-300">
            <span>Rows</span>
            <span className="font-mono text-amber-400">{rows}</span>
          </div>
          <input
            type="range"
            min={MIN_ROWS}
            max={MAX_ROWS}
            value={rows}
            onChange={(e) => setRows(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-deck-500 font-mono">
            <span>{MIN_ROWS}</span>
            <span>{MAX_ROWS}</span>
          </div>
        </div>

        {/* Columns Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-deck-300">
            <span>Columns</span>
            <span className="font-mono text-amber-400">{cols}</span>
          </div>
          <input
            type="range"
            min={MIN_COLS}
            max={MAX_COLS}
            value={cols}
            onChange={(e) => setCols(Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-deck-500 font-mono">
            <span>{MIN_COLS}</span>
            <span>{MAX_COLS}</span>
          </div>
        </div>

        {/* Mines Input */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs font-semibold text-deck-300">
            <span>Mines ({density}% density)</span>
            <span className="font-mono text-rose-400">{safeMines}</span>
          </div>
          <input
            type="range"
            min={1}
            max={maxMines}
            value={safeMines}
            onChange={(e) => setMines(Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-deck-500 font-mono">
            <span>1</span>
            <span>{maxMines}</span>
          </div>
        </div>

        {/* Summary Card */}
        <div className="bg-deck-950/80 border border-deck-800 p-3 rounded-lg flex justify-around text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-deck-500">Grid Size</div>
            <div className="text-sm font-mono font-bold text-white">
              {rows} × {cols}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-deck-500">Total Cells</div>
            <div className="text-sm font-mono font-bold text-white">{rows * cols}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-deck-500">Mines</div>
            <div className="text-sm font-mono font-bold text-rose-400">{safeMines}</div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Apply & Play
          </Button>
        </div>
      </form>
    </Modal>
  );
}
