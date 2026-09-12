import type { Coordinate, Direction } from '../types/snake.types';
import {
  BASE_SPEED_MS,
  MIN_SPEED_MS,
  POINTS_PER_SPEED_STEP,
  SPEED_STEP_MS,
} from './snake-constants';

export function isCoordEqual(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

export function isCoordInList(coord: Coordinate, list: Coordinate[]): boolean {
  return list.some((item) => isCoordEqual(coord, item));
}

export function isWallCollision(coord: Coordinate, gridSize: number): boolean {
  return coord.x < 0 || coord.x >= gridSize || coord.y < 0 || coord.y >= gridSize;
}

export function isSelfCollision(head: Coordinate, body: Coordinate[]): boolean {
  return isCoordInList(head, body);
}

export function calculateSpeed(score: number, baseSpeedMs: number = BASE_SPEED_MS): number {
  const steps = Math.floor(score / POINTS_PER_SPEED_STEP);
  return Math.max(MIN_SPEED_MS, baseSpeedMs - steps * SPEED_STEP_MS);
}

export function spawnFood(snake: Coordinate[], gridSize: number): Coordinate {
  const totalCells = gridSize * gridSize;
  if (snake.length >= totalCells) {
    return { x: -1, y: -1 };
  }

  const occupied = new Set(snake.map((c) => `${c.x},${c.y}`));
  const emptyCoords: Coordinate[] = [];

  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      if (!occupied.has(`${x},${y}`)) {
        emptyCoords.push({ x, y });
      }
    }
  }

  const randomIndex = Math.floor(Math.random() * emptyCoords.length);
  return emptyCoords[randomIndex];
}

export function isValidDirectionChange(
  currentOrLastDir: Direction,
  nextDir: Direction,
  oppositeMap: Record<Direction, Direction>,
): boolean {
  return nextDir !== currentOrLastDir && oppositeMap[nextDir] !== currentOrLastDir;
}
