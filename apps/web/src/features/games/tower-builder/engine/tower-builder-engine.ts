export type PieceShape = 'rect' | 'wide' | 'heavy' | 'bouncy' | 'wedge' | 'column';

export interface PieceDef {
  type: PieceShape;
  name: string;
  width: number;
  height: number;
  mass: number;
  color: string;
  borderColor: string;
  bounce: number;
}

export const PIECE_DEFINITIONS: Record<PieceShape, PieceDef> = {
  rect: {
    type: 'rect',
    name: 'Standard Girder',
    width: 90,
    height: 36,
    mass: 1.0,
    color: '#0284c7', // cyan/sky blue
    borderColor: '#38bdf8',
    bounce: 0.1,
  },
  wide: {
    type: 'wide',
    name: 'Reinforced Platform',
    width: 140,
    height: 30,
    mass: 1.5,
    color: '#059669', // emerald
    borderColor: '#34d399',
    bounce: 0.05,
  },
  heavy: {
    type: 'heavy',
    name: 'Titanium Block',
    width: 75,
    height: 48,
    mass: 3.0,
    color: '#6366f1', // indigo
    borderColor: '#818cf8',
    bounce: 0.02,
  },
  bouncy: {
    type: 'bouncy',
    name: 'Rubber Buffer',
    width: 85,
    height: 32,
    mass: 0.8,
    color: '#f59e0b', // amber
    borderColor: '#fbbf24',
    bounce: 0.5,
  },
  wedge: {
    type: 'wedge',
    name: 'Apex Wedge',
    width: 70,
    height: 40,
    mass: 1.1,
    color: '#ec4899', // pink
    borderColor: '#f472b6',
    bounce: 0.15,
  },
  column: {
    type: 'column',
    name: 'Pillar Column',
    width: 50,
    height: 60,
    mass: 1.8,
    color: '#8b5cf6', // purple
    borderColor: '#a78bfa',
    bounce: 0.1,
  },
};

export interface PlacedBlock {
  id: number;
  x: number;
  y: number; // Y coordinate (0 = base ground, climbs upward)
  width: number;
  height: number;
  rotation: number;
  piece: PieceDef;
  settled: boolean;
  scoreAwarded: number;
  isPerfect: boolean;
}

export interface DroppingPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  piece: PieceDef;
}

export type TowerGameStatus = 'idle' | 'playing' | 'game_over';

export interface TowerBuilderState {
  status: TowerGameStatus;
  score: number;
  highScore: number;
  combo: number;
  maxCombo: number;
  lives: number;
  maxLives: number;
  blocksPlaced: number;
  perfectDrops: number;
  highestY: number; // Height of tower in pixels
  cameraY: number;

  // Active crane dropper
  craneX: number;
  craneSpeed: number;
  craneDirection: 1 | -1;
  nextPieceShape: PieceShape;
  currentPieceShape: PieceShape;

  // Physics state
  droppingPiece: DroppingPiece | null;
  placedBlocks: PlacedBlock[];
  fallingBlocks: {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rotation: number;
    vRot: number;
    piece: PieceDef;
  }[];

  baseWidth: number;
  arenaWidth: number;
  lastMessage: string;
}

export const ARENA_WIDTH = 500;
export const BASE_PLATFORM_Y = 0;
export const BASE_PLATFORM_WIDTH = 200;
export const DROP_START_OFFSET_Y = 320; // Distance above highest block

const SHAPES_POOL: PieceShape[] = ['rect', 'wide', 'heavy', 'bouncy', 'wedge', 'column'];

export function getRandomPieceShape(): PieceShape {
  return SHAPES_POOL[Math.floor(Math.random() * SHAPES_POOL.length)];
}

export function createInitialTowerBuilderState(highScore: number = 0): TowerBuilderState {
  const firstShape = 'wide';
  const nextShape = getRandomPieceShape();

  return {
    status: 'idle',
    score: 0,
    highScore,
    combo: 0,
    maxCombo: 0,
    lives: 3,
    maxLives: 3,
    blocksPlaced: 0,
    perfectDrops: 0,
    highestY: BASE_PLATFORM_Y,
    cameraY: 0,

    craneX: ARENA_WIDTH / 2,
    craneSpeed: 180, // px per second
    craneDirection: 1,
    currentPieceShape: firstShape,
    nextPieceShape: nextShape,

    droppingPiece: null,
    placedBlocks: [],
    fallingBlocks: [],

    baseWidth: BASE_PLATFORM_WIDTH,
    arenaWidth: ARENA_WIDTH,
    lastMessage: 'Tap or press Space to drop your first construction block!',
  };
}

export function startTowerGame(state: TowerBuilderState): TowerBuilderState {
  return {
    ...createInitialTowerBuilderState(state.highScore),
    status: 'playing',
    lastMessage: 'Construction in progress! Time your drops carefully.',
  };
}

/**
 * Trigger drop of current piece from the moving crane.
 */
export function dropPiece(state: TowerBuilderState): TowerBuilderState {
  if (state.status !== 'playing' || state.droppingPiece !== null) {
    return state;
  }

  const pieceDef = PIECE_DEFINITIONS[state.currentPieceShape];
  const dropY = state.highestY + DROP_START_OFFSET_Y;

  const droppingPiece: DroppingPiece = {
    id: Date.now() + Math.random(),
    x: state.craneX,
    y: dropY,
    vx: state.craneSpeed * 0.15 * state.craneDirection,
    vy: -50, // Initial downward impulse
    rotation: 0,
    piece: pieceDef,
  };

  return {
    ...state,
    droppingPiece,
    currentPieceShape: state.nextPieceShape,
    nextPieceShape: getRandomPieceShape(),
    lastMessage: 'Block in free fall...',
  };
}

/**
 * Adjust crane position manually (for keyboard / touch drag controls).
 */
export function moveCrane(state: TowerBuilderState, targetX: number): TowerBuilderState {
  if (state.status !== 'playing') return state;
  const halfPiece = PIECE_DEFINITIONS[state.currentPieceShape].width / 2;
  const clampedX = Math.max(halfPiece, Math.min(ARENA_WIDTH - halfPiece, targetX));
  return { ...state, craneX: clampedX };
}

/**
 * Update crane oscillation and physics step for the free-falling or falling debris blocks.
 */
export function stepTowerGame(state: TowerBuilderState, dt: number): TowerBuilderState {
  if (state.status !== 'playing') return state;

  // 1. Move crane back and forth
  let craneX = state.craneX;
  let craneDirection = state.craneDirection;
  const halfWidth = PIECE_DEFINITIONS[state.currentPieceShape].width / 2;

  craneX += state.craneSpeed * craneDirection * dt;
  if (craneX >= ARENA_WIDTH - halfWidth) {
    craneX = ARENA_WIDTH - halfWidth;
    craneDirection = -1;
  } else if (craneX <= halfWidth) {
    craneX = halfWidth;
    craneDirection = 1;
  }

  // 2. Update falling debris (failed blocks falling off screen)
  const updatedFalling = state.fallingBlocks
    .map((fb) => ({
      ...fb,
      x: fb.x + fb.vx * dt,
      y: fb.y + fb.vy * dt,
      vy: fb.vy - 600 * dt, // gravity
      rotation: fb.rotation + fb.vRot * dt,
    }))
    .filter((fb) => fb.y > state.cameraY - 200); // Remove when far below camera

  let dropping = state.droppingPiece;
  const placed = [...state.placedBlocks];
  let score = state.score;
  let highScore = state.highScore;
  let combo = state.combo;
  let maxCombo = state.maxCombo;
  let lives = state.lives;
  let highestY = state.highestY;
  let blocksPlaced = state.blocksPlaced;
  let perfectDrops = state.perfectDrops;
  let status: TowerGameStatus = state.status;
  let lastMessage = state.lastMessage;

  // 3. Update active dropping piece
  if (dropping) {
    const gravity = 800; // px/s^2
    const nextY = dropping.y + dropping.vy * dt;
    const nextVy = dropping.vy - gravity * dt;
    const nextX = dropping.x + dropping.vx * dt * 0.5;

    // Target surface calculation: top of highest block or base platform
    const targetSurfaceY =
      placed.length === 0
        ? BASE_PLATFORM_Y
        : placed[placed.length - 1].y + placed[placed.length - 1].height;
    const targetSurfaceX = placed.length === 0 ? ARENA_WIDTH / 2 : placed[placed.length - 1].x;
    const targetWidth = placed.length === 0 ? BASE_PLATFORM_WIDTH : placed[placed.length - 1].width;

    // Check collision with top surface
    if (nextY <= targetSurfaceY) {
      // Landing point evaluation
      const offsetFromCenter = Math.abs(nextX - targetSurfaceX);
      const allowableTolerance = (targetWidth + dropping.piece.width) * 0.44;

      if (offsetFromCenter <= allowableTolerance) {
        // Block successfully placed!
        const isPerfect = offsetFromCenter <= 8;
        const newCombo = isPerfect ? combo + 1 : 0;
        const comboBonus = newCombo * 25;
        const baseScore = isPerfect ? 100 : 50;
        const points = baseScore + comboBonus;

        score += points;
        combo = newCombo;
        maxCombo = Math.max(maxCombo, newCombo);
        blocksPlaced += 1;
        if (isPerfect) perfectDrops += 1;

        const newBlockY = targetSurfaceY;
        highestY = newBlockY + dropping.piece.height;

        placed.push({
          id: dropping.id,
          x: nextX,
          y: newBlockY,
          width: dropping.piece.width,
          height: dropping.piece.height,
          rotation: 0,
          piece: dropping.piece,
          settled: true,
          scoreAwarded: points,
          isPerfect,
        });

        highScore = Math.max(highScore, score);
        lastMessage = isPerfect
          ? `🌟 PERFECT ALIGNMENT! Combo x${newCombo} (+${points} pts)`
          : `✅ Solid placement (+${points} pts)`;

        dropping = null;
      } else {
        // Unstable! Block missed and tumbles off
        lives -= 1;
        combo = 0;
        lastMessage = `⚠️ UNSTABLE! Block tumbled off the edge (-1 Life).`;

        updatedFalling.push({
          id: dropping.id,
          x: nextX,
          y: targetSurfaceY,
          vx: nextX > targetSurfaceX ? 120 : -120,
          vy: 150,
          rotation: 0,
          vRot: nextX > targetSurfaceX ? 3 : -3,
          piece: dropping.piece,
        });

        dropping = null;

        if (lives <= 0) {
          status = 'game_over';
          lastMessage = `💥 TOWER COLLAPSED! Final height: ${Math.round(highestY / 20)}m.`;
        }
      }
    } else {
      dropping = {
        ...dropping,
        x: nextX,
        y: nextY,
        vy: nextVy,
      };
    }
  }

  // Smooth camera tracking upward
  const targetCamY = Math.max(0, highestY - 140);
  const cameraY = state.cameraY + (targetCamY - state.cameraY) * Math.min(1, dt * 4);

  return {
    ...state,
    craneX,
    craneDirection,
    droppingPiece: dropping,
    placedBlocks: placed,
    fallingBlocks: updatedFalling,
    score,
    highScore,
    combo,
    maxCombo,
    lives,
    highestY,
    blocksPlaced,
    perfectDrops,
    cameraY,
    status,
    lastMessage,
  };
}
