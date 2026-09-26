import {
  BLOCK_BARREL,
  BLOCK_BRICK,
  BLOCK_STEEL,
  type ArenaBlock,
  type Vector2D,
} from '../types/tiny-tank.types';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 640;
export const BLOCK_SIZE = 40;

export const PLAYER_COLORS = [
  '#06b6d4', // Cyan (Human)
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
];

export const ARENA_SPAWN_POINTS: Vector2D[] = [
  { x: 100, y: 100 },
  { x: 860, y: 540 },
  { x: 860, y: 100 },
  { x: 100, y: 540 },
  { x: 480, y: 100 },
  { x: 480, y: 540 },
];

const BRICK_PATTERNS = [
  // Center bunker
  { x: 440, y: 280, type: BLOCK_BRICK },
  { x: 480, y: 280, type: BLOCK_BRICK },
  { x: 440, y: 320, type: BLOCK_BRICK },
  { x: 480, y: 320, type: BLOCK_BRICK },

  // Explosive Barrels in center cross
  { x: 400, y: 300, type: BLOCK_BARREL },
  { x: 520, y: 300, type: BLOCK_BARREL },
  { x: 460, y: 240, type: BLOCK_BARREL },
  { x: 460, y: 360, type: BLOCK_BARREL },

  // Left quad barriers
  { x: 200, y: 160, type: BLOCK_BRICK },
  { x: 240, y: 160, type: BLOCK_BRICK },
  { x: 200, y: 200, type: BLOCK_BRICK },
  { x: 200, y: 440, type: BLOCK_BRICK },
  { x: 240, y: 440, type: BLOCK_BRICK },
  { x: 200, y: 400, type: BLOCK_BRICK },

  // Right quad barriers
  { x: 720, y: 160, type: BLOCK_BRICK },
  { x: 680, y: 160, type: BLOCK_BRICK },
  { x: 720, y: 200, type: BLOCK_BRICK },
  { x: 720, y: 440, type: BLOCK_BRICK },
  { x: 680, y: 440, type: BLOCK_BRICK },
  { x: 720, y: 400, type: BLOCK_BRICK },

  // Corner barrels
  { x: 160, y: 280, type: BLOCK_BARREL },
  { x: 760, y: 280, type: BLOCK_BARREL },

  // Mid columns
  { x: 340, y: 120, type: BLOCK_BRICK },
  { x: 340, y: 480, type: BLOCK_BRICK },
  { x: 580, y: 120, type: BLOCK_BRICK },
  { x: 580, y: 480, type: BLOCK_BRICK },
] as const;

export function generateDefaultArena(): ArenaBlock[] {
  const blocks: ArenaBlock[] = [];
  let nextId = 1;

  // Top & Bottom perimeter walls
  for (let x = 0; x < ARENA_WIDTH; x += BLOCK_SIZE) {
    blocks.push({
      id: `steel-${nextId++}`,
      x,
      y: 0,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: BLOCK_STEEL,
      health: 9999,
      maxHealth: 9999,
    });
    blocks.push({
      id: `steel-${nextId++}`,
      x,
      y: ARENA_HEIGHT - BLOCK_SIZE,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: BLOCK_STEEL,
      health: 9999,
      maxHealth: 9999,
    });
  }

  // Left & Right perimeter walls
  for (let y = BLOCK_SIZE; y < ARENA_HEIGHT - BLOCK_SIZE; y += BLOCK_SIZE) {
    blocks.push({
      id: `steel-${nextId++}`,
      x: 0,
      y,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: BLOCK_STEEL,
      health: 9999,
      maxHealth: 9999,
    });
    blocks.push({
      id: `steel-${nextId++}`,
      x: ARENA_WIDTH - BLOCK_SIZE,
      y,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: BLOCK_STEEL,
      health: 9999,
      maxHealth: 9999,
    });
  }

  // Interior layout
  for (const item of BRICK_PATTERNS) {
    const isBarrel = item.type === BLOCK_BARREL;
    blocks.push({
      id: `${item.type}-${nextId++}`,
      x: item.x,
      y: item.y,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: item.type,
      health: isBarrel ? 30 : 60,
      maxHealth: isBarrel ? 30 : 60,
    });
  }

  return blocks;
}
