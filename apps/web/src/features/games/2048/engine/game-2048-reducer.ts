import type { Game2048Action, Game2048State, Game2048Status, UndoStep } from '../types/2048.types';
import { MAX_UNDO_STEPS, WINNING_VALUE } from './game-2048-constants';
import {
  createEmptyGrid,
  getHighestTile,
  hasWinningTile,
  isGameOver,
  moveGrid,
  spawnTile,
  syncTilesFromGrid,
} from './game-2048-engine';

let tileCounter = 0;
export function generateTileId(): string {
  tileCounter += 1;
  return `tile-${Date.now()}-${tileCounter}-${Math.random().toString(36).slice(2, 6)}`;
}

export function createInitialState(bestScore = 0, idGen = generateTileId): Game2048State {
  let grid = createEmptyGrid();
  const firstSpawn = spawnTile(grid, idGen);
  grid = firstSpawn.grid;
  const secondSpawn = spawnTile(grid, idGen);
  grid = secondSpawn.grid;

  const tiles = [firstSpawn.tile, secondSpawn.tile].filter(Boolean) as NonNullable<
    typeof firstSpawn.tile
  >[];

  return {
    grid,
    tiles,
    score: 0,
    bestScore,
    status: 'playing',
    hasWon: false,
    isKeepGoing: false,
    moveCount: 0,
    highestTile: getHighestTile(grid),
    undoStack: [],
    lastScoreGain: 0,
  };
}

export function game2048Reducer(
  state: Game2048State,
  action: Game2048Action,
  idGen = generateTileId,
): Game2048State {
  switch (action.type) {
    case 'MOVE': {
      if (state.status === 'over' || (state.status === 'won' && !state.isKeepGoing)) {
        return state;
      }

      const { grid: movedGrid, scoreGain, hasChanged } = moveGrid(state.grid, action.direction);
      if (!hasChanged) {
        return state;
      }

      // Record current state for undo
      const undoEntry: UndoStep = {
        grid: state.grid,
        tiles: state.tiles,
        score: state.score,
        highestTile: state.highestTile,
      };
      const nextUndoStack = [...state.undoStack, undoEntry].slice(-MAX_UNDO_STEPS);

      // Intermediate sync tiles from movedGrid
      const movedTiles = syncTilesFromGrid(movedGrid, state.tiles, idGen);

      // Spawn a new tile
      const { grid: finalGrid, tile: newTile } = spawnTile(movedGrid, idGen);
      const finalTiles = newTile ? [...movedTiles, newTile] : movedTiles;

      const nextScore = state.score + scoreGain;
      const nextBestScore = Math.max(state.bestScore, nextScore);
      const nextHighestTile = getHighestTile(finalGrid);

      let nextStatus: Game2048Status = state.status;
      let nextHasWon = state.hasWon;

      // Win check: first time reaching 2048
      if (!state.hasWon && hasWinningTile(finalGrid, WINNING_VALUE)) {
        nextStatus = 'won';
        nextHasWon = true;
      } else if (isGameOver(finalGrid)) {
        nextStatus = 'over';
      }

      return {
        ...state,
        grid: finalGrid,
        tiles: finalTiles,
        score: nextScore,
        bestScore: nextBestScore,
        status: nextStatus,
        hasWon: nextHasWon,
        moveCount: state.moveCount + 1,
        highestTile: nextHighestTile,
        undoStack: nextUndoStack,
        lastScoreGain: scoreGain,
      };
    }

    case 'UNDO': {
      if (state.undoStack.length === 0) {
        return state;
      }

      const lastStep = state.undoStack[state.undoStack.length - 1];
      const remainingStack = state.undoStack.slice(0, -1);

      return {
        ...state,
        grid: lastStep.grid,
        tiles: lastStep.tiles,
        score: lastStep.score,
        highestTile: lastStep.highestTile,
        status: 'playing',
        undoStack: remainingStack,
        lastScoreGain: 0,
      };
    }

    case 'CONTINUE': {
      if (state.status === 'won') {
        return {
          ...state,
          status: 'playing',
          isKeepGoing: true,
        };
      }
      return state;
    }

    case 'RESTART': {
      return {
        ...createInitialState(state.bestScore, idGen),
        bestScore: state.bestScore,
      };
    }

    case 'SET_BEST_SCORE': {
      return {
        ...state,
        bestScore: Math.max(state.bestScore, action.bestScore),
      };
    }

    default:
      return state;
  }
}
