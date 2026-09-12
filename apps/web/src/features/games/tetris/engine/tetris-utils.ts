import type {
  ActivePiece,
  GridCoordinate,
  RotationState,
  TetrisBoard,
  TetrominoType,
} from '../types/tetris.types';
import {
  BASE_GRAVITY_MS,
  COLS,
  GRAVITY_STEP_MS,
  LINES_PER_LEVEL,
  MIN_GRAVITY_MS,
  PIECE_SHAPES,
  SPAWN_COLUMN,
  SPAWN_ROW,
  TETROMINO_TYPES,
  TOTAL_ROWS,
  getKickTable,
  type KickKey,
} from './tetris-constants';

export function createEmptyBoard(): TetrisBoard {
  return Array.from({ length: TOTAL_ROWS }, () => Array<null>(COLS).fill(null));
}

export function cloneBoard(board: TetrisBoard): TetrisBoard {
  return board.map((row) => [...row]);
}

export function getPieceCells(piece: Pick<ActivePiece, 'type' | 'rotation'>): GridCoordinate[] {
  return PIECE_SHAPES[piece.type][piece.rotation];
}

export function getOccupiedCoordinates(piece: ActivePiece): GridCoordinate[] {
  return getPieceCells(piece).map((cell) => ({
    row: piece.row + cell.row,
    col: piece.col + cell.col,
  }));
}

export function isWithinBounds(row: number, col: number): boolean {
  return row >= 0 && row < TOTAL_ROWS && col >= 0 && col < COLS;
}

export function isValidPlacement(board: TetrisBoard, piece: ActivePiece): boolean {
  return getOccupiedCoordinates(piece).every(({ row, col }) => {
    if (!isWithinBounds(row, col)) return false;
    return board[row][col] === null;
  });
}

export function spawnPiece(type: TetrominoType): ActivePiece {
  return {
    type,
    rotation: 0,
    row: SPAWN_ROW,
    col: SPAWN_COLUMN[type],
  };
}

/** Fisher-Yates shuffle used to build a fresh 7-bag of tetrominoes. */
export function generateBag(random: () => number = Math.random): TetrominoType[] {
  const bag = [...TETROMINO_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

/** Ensures the queue has at least `minLength` upcoming pieces, refilling from 7-bags. */
export function refillQueue(
  queue: TetrominoType[],
  bag: TetrominoType[],
  minLength: number,
  random: () => number = Math.random,
): { queue: TetrominoType[]; bag: TetrominoType[] } {
  const nextQueue = [...queue];
  let nextBag = [...bag];
  while (nextQueue.length < minLength) {
    if (nextBag.length === 0) {
      nextBag = generateBag(random);
    }
    const piece = nextBag.shift();
    if (piece) nextQueue.push(piece);
  }
  return { queue: nextQueue, bag: nextBag };
}

export function tryRotate(
  board: TetrisBoard,
  piece: ActivePiece,
  direction: 1 | -1,
): ActivePiece | null {
  const from = piece.rotation;
  const to = ((from + direction + 4) % 4) as RotationState;
  const kicks = getKickTable(piece.type)[`${from}->${to}` as KickKey];

  for (const kick of kicks) {
    const candidate: ActivePiece = {
      ...piece,
      rotation: to,
      row: piece.row + kick.row,
      col: piece.col + kick.col,
    };
    if (isValidPlacement(board, candidate)) {
      return candidate;
    }
  }
  return null;
}

export function getGhostPiece(board: TetrisBoard, piece: ActivePiece): ActivePiece {
  let ghost = piece;
  while (isValidPlacement(board, { ...ghost, row: ghost.row + 1 })) {
    ghost = { ...ghost, row: ghost.row + 1 };
  }
  return ghost;
}

export function mergePieceIntoBoard(board: TetrisBoard, piece: ActivePiece): TetrisBoard {
  const next = cloneBoard(board);
  for (const { row, col } of getOccupiedCoordinates(piece)) {
    if (isWithinBounds(row, col)) {
      next[row][col] = piece.type;
    }
  }
  return next;
}

export function findFullRows(board: TetrisBoard): number[] {
  const fullRows: number[] = [];
  board.forEach((row, index) => {
    if (row.every((cell) => cell !== null)) {
      fullRows.push(index);
    }
  });
  return fullRows;
}

export function clearRows(board: TetrisBoard, rowIndexes: number[]): TetrisBoard {
  if (rowIndexes.length === 0) return cloneBoard(board);
  const rowsToClear = new Set(rowIndexes);
  const remaining = board.filter((_, index) => !rowsToClear.has(index));
  const emptyRows = Array.from({ length: rowIndexes.length }, () => Array<null>(COLS).fill(null));
  return [...emptyRows, ...remaining];
}

export function calculateGravityMs(level: number): number {
  return Math.max(MIN_GRAVITY_MS, BASE_GRAVITY_MS - (level - 1) * GRAVITY_STEP_MS);
}

export function calculateLevel(totalLinesCleared: number): number {
  return Math.floor(totalLinesCleared / LINES_PER_LEVEL) + 1;
}

export function calculateLineClearScore(linesCleared: number, level: number): number {
  const base = [0, 100, 300, 500, 800][Math.min(linesCleared, 4)] ?? 0;
  return base * level;
}

export function isTopRowOccupied(board: TetrisBoard): boolean {
  return board[0].some((cell) => cell !== null) || board[1].some((cell) => cell !== null);
}
