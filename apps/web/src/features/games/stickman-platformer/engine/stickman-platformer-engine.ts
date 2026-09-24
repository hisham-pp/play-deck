export interface Platform {
  x: number;
  y: number;
  width: number;
  height: number;
  type?: 'solid' | 'bouncy' | 'moving';
  movingRange?: number;
  dir?: number;
  baseX?: number;
}

export interface Coin {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  value: number;
}

export interface Hazard {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'spike' | 'pit';
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  minX: number;
  maxX: number;
  alive: boolean;
}

export interface Checkpoint {
  id: number;
  x: number;
  y: number;
  active: boolean;
}

export interface LevelExit {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LevelDef {
  id: number;
  name: string;
  theme: string;
  startX: number;
  startY: number;
  worldWidth: number;
  worldHeight: number;
  platforms: Platform[];
  coins: Coin[];
  hazards: Hazard[];
  enemies: Enemy[];
  checkpoints: Checkpoint[];
  exit: LevelExit;
}

export interface PlatformerPlayer {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  facing: 'left' | 'right';
  isGrounded: boolean;
}

export interface StickmanPlatformerState {
  status: 'idle' | 'running' | 'paused' | 'level-cleared' | 'game-over' | 'victory';
  currentLevelIndex: number;
  score: number;
  coinsCollected: number;
  lives: number;
  maxLives: number;
  highScore: number;
  activeCheckpoint: { x: number; y: number } | null;
  player: PlatformerPlayer;
  level: LevelDef;
}

export interface PlatformerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
}

const GRAVITY = 960;
const MOVE_SPEED = 240;
const JUMP_VELOCITY = 490;
const BOUNCE_VELOCITY = 620;

export const PLATFORMER_LEVELS: LevelDef[] = [
  {
    id: 1,
    name: 'The Training Grotto',
    theme: 'Arcade Green',
    startX: 60,
    startY: 280,
    worldWidth: 1000,
    worldHeight: 460,
    platforms: [
      { x: 0, y: 380, width: 360, height: 80, type: 'solid' },
      { x: 420, y: 380, width: 580, height: 80, type: 'solid' },
      { x: 140, y: 290, width: 120, height: 20, type: 'solid' },
      { x: 300, y: 230, width: 130, height: 20, type: 'solid' },
      { x: 480, y: 270, width: 140, height: 20, type: 'solid' },
      { x: 670, y: 220, width: 140, height: 20, type: 'solid' },
    ],
    hazards: [{ id: 1, x: 360, y: 400, width: 60, height: 60, type: 'pit' }],
    coins: [
      { id: 1, x: 180, y: 250, radius: 10, collected: false, value: 10 },
      { id: 2, x: 360, y: 190, radius: 10, collected: false, value: 10 },
      { id: 3, x: 540, y: 230, radius: 10, collected: false, value: 10 },
      { id: 4, x: 740, y: 180, radius: 10, collected: false, value: 10 },
      { id: 5, x: 860, y: 340, radius: 10, collected: false, value: 10 },
    ],
    enemies: [
      {
        id: 1,
        x: 520,
        y: 350,
        width: 28,
        height: 30,
        vx: 60,
        minX: 440,
        maxX: 640,
        alive: true,
      },
    ],
    checkpoints: [{ id: 1, x: 460, y: 340, active: false }],
    exit: { x: 910, y: 310, width: 44, height: 70 },
  },
  {
    id: 2,
    name: 'Hazard Heights',
    theme: 'Amber Spire',
    startX: 60,
    startY: 280,
    worldWidth: 1050,
    worldHeight: 460,
    platforms: [
      { x: 0, y: 380, width: 220, height: 80, type: 'solid' },
      {
        x: 270,
        y: 340,
        width: 100,
        height: 20,
        type: 'moving',
        movingRange: 70,
        dir: 1,
        baseX: 270,
      },
      { x: 430, y: 300, width: 120, height: 20, type: 'bouncy' },
      { x: 610, y: 240, width: 140, height: 20, type: 'solid' },
      { x: 800, y: 380, width: 250, height: 80, type: 'solid' },
    ],
    hazards: [
      { id: 1, x: 220, y: 410, width: 580, height: 50, type: 'pit' },
      { id: 2, x: 650, y: 225, width: 40, height: 15, type: 'spike' },
    ],
    coins: [
      { id: 1, x: 120, y: 340, radius: 10, collected: false, value: 15 },
      { id: 2, x: 320, y: 290, radius: 10, collected: false, value: 15 },
      { id: 3, x: 490, y: 190, radius: 10, collected: false, value: 25 },
      { id: 4, x: 720, y: 200, radius: 10, collected: false, value: 15 },
      { id: 5, x: 860, y: 340, radius: 10, collected: false, value: 15 },
    ],
    enemies: [
      {
        id: 1,
        x: 840,
        y: 350,
        width: 28,
        height: 30,
        vx: 80,
        minX: 810,
        maxX: 960,
        alive: true,
      },
    ],
    checkpoints: [{ id: 1, x: 630, y: 200, active: false }],
    exit: { x: 960, y: 310, width: 44, height: 70 },
  },
  {
    id: 3,
    name: 'Spire Summit',
    theme: 'Cyber Citadel',
    startX: 50,
    startY: 280,
    worldWidth: 1100,
    worldHeight: 460,
    platforms: [
      { x: 0, y: 380, width: 180, height: 80, type: 'solid' },
      { x: 230, y: 320, width: 110, height: 20, type: 'bouncy' },
      {
        x: 390,
        y: 250,
        width: 110,
        height: 20,
        type: 'moving',
        movingRange: 80,
        dir: 1,
        baseX: 390,
      },
      { x: 570, y: 200, width: 130, height: 20, type: 'solid' },
      { x: 740, y: 260, width: 110, height: 20, type: 'bouncy' },
      { x: 890, y: 380, width: 210, height: 80, type: 'solid' },
    ],
    hazards: [
      { id: 1, x: 180, y: 410, width: 710, height: 50, type: 'pit' },
      { id: 2, x: 610, y: 185, width: 40, height: 15, type: 'spike' },
    ],
    coins: [
      { id: 1, x: 280, y: 270, radius: 10, collected: false, value: 20 },
      { id: 2, x: 440, y: 200, radius: 10, collected: false, value: 20 },
      { id: 3, x: 635, y: 140, radius: 10, collected: false, value: 30 },
      { id: 4, x: 790, y: 210, radius: 10, collected: false, value: 20 },
      { id: 5, x: 970, y: 330, radius: 10, collected: false, value: 50 },
    ],
    enemies: [
      {
        id: 1,
        x: 580,
        y: 170,
        width: 26,
        height: 30,
        vx: 90,
        minX: 570,
        maxX: 690,
        alive: true,
      },
      {
        id: 2,
        x: 920,
        y: 350,
        width: 28,
        height: 30,
        vx: 100,
        minX: 900,
        maxX: 1010,
        alive: true,
      },
    ],
    checkpoints: [{ id: 1, x: 580, y: 160, active: false }],
    exit: { x: 1010, y: 310, width: 44, height: 70 },
  },
];

function cloneLevel(level: LevelDef): LevelDef {
  return {
    ...level,
    platforms: level.platforms.map((p) => ({ ...p })),
    coins: level.coins.map((c) => ({ ...c })),
    hazards: level.hazards.map((h) => ({ ...h })),
    enemies: level.enemies.map((e) => ({ ...e })),
    checkpoints: level.checkpoints.map((cp) => ({ ...cp })),
    exit: { ...level.exit },
  };
}

export function createInitialPlatformerState(
  highScore = 0,
  levelIndex = 0,
): StickmanPlatformerState {
  const safeIndex = Math.min(Math.max(0, levelIndex), PLATFORMER_LEVELS.length - 1);
  const level = cloneLevel(PLATFORMER_LEVELS[safeIndex]);

  return {
    status: 'idle',
    currentLevelIndex: safeIndex,
    score: 0,
    coinsCollected: 0,
    lives: 3,
    maxLives: 3,
    highScore,
    activeCheckpoint: null,
    player: {
      x: level.startX,
      y: level.startY,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      facing: 'right',
      isGrounded: false,
    },
    level,
  };
}

function rectIntersects(
  r1: { x: number; y: number; width: number; height: number },
  r2: { x: number; y: number; width: number; height: number },
): boolean {
  return (
    r1.x < r2.x + r2.width &&
    r1.x + r1.width > r2.x &&
    r1.y < r2.y + r2.height &&
    r1.y + r1.height > r2.y
  );
}

export function respawnPlayer(state: StickmanPlatformerState): StickmanPlatformerState {
  const respawnPoint = state.activeCheckpoint ?? {
    x: state.level.startX,
    y: state.level.startY,
  };

  const nextLives = state.lives - 1;
  if (nextLives <= 0) {
    return {
      ...state,
      lives: 0,
      status: 'game-over',
      player: {
        ...state.player,
        x: respawnPoint.x,
        y: respawnPoint.y,
        vx: 0,
        vy: 0,
        isGrounded: false,
      },
    };
  }

  return {
    ...state,
    lives: nextLives,
    player: {
      ...state.player,
      x: respawnPoint.x,
      y: respawnPoint.y,
      vx: 0,
      vy: 0,
      isGrounded: false,
    },
  };
}

export function stepPlatformerGame(
  state: StickmanPlatformerState,
  dt: number,
  input: PlatformerInput,
): StickmanPlatformerState {
  if (state.status !== 'running') {
    if (state.status === 'idle' && (input.left || input.right || input.jump)) {
      return stepPlatformerGame({ ...state, status: 'running' }, dt, input);
    }
    return state;
  }

  const { player, level } = state;

  // 1. Move moving platforms
  const updatedPlatforms = level.platforms.map((p) => {
    if (p.type === 'moving' && p.movingRange && p.baseX !== undefined) {
      const dir = p.dir ?? 1;
      let nextX = p.x + dir * 60 * dt;
      let nextDir = dir;
      if (nextX > p.baseX + p.movingRange) {
        nextX = p.baseX + p.movingRange;
        nextDir = -1;
      } else if (nextX < p.baseX - p.movingRange) {
        nextX = p.baseX - p.movingRange;
        nextDir = 1;
      }
      return { ...p, x: nextX, dir: nextDir };
    }
    return p;
  });

  // 2. Move enemies
  const updatedEnemies = level.enemies.map((e) => {
    if (!e.alive) return e;
    let nextX = e.x + e.vx * dt;
    let nextVx = e.vx;
    if (nextX > e.maxX) {
      nextX = e.maxX;
      nextVx = -Math.abs(e.vx);
    } else if (nextX < e.minX) {
      nextX = e.minX;
      nextVx = Math.abs(e.vx);
    }
    return { ...e, x: nextX, vx: nextVx };
  });

  // 3. Player horizontal velocity
  let vx = 0;
  let facing = player.facing;
  if (input.left) {
    vx -= MOVE_SPEED;
    facing = 'left';
  }
  if (input.right) {
    vx += MOVE_SPEED;
    facing = 'right';
  }

  // 4. Player vertical velocity (gravity & jump)
  let vy = player.vy + GRAVITY * dt;
  if (input.jump && player.isGrounded) {
    vy = -JUMP_VELOCITY;
  }

  // 5. Update horizontal position & collision with platforms
  let nextX = player.x + vx * dt;
  nextX = Math.max(0, Math.min(level.worldWidth - player.width, nextX));

  // 6. Update vertical position & landing collision
  let nextY = player.y + vy * dt;
  let isGrounded = false;

  const playerBox = { x: nextX, y: nextY, width: player.width, height: player.height };

  for (const plat of updatedPlatforms) {
    // Check if falling onto the top of the platform
    const prevBottom = player.y + player.height;
    const nextBottom = nextY + player.height;

    if (
      player.x + player.width > plat.x &&
      player.x < plat.x + plat.width &&
      prevBottom <= plat.y + 12 &&
      nextBottom >= plat.y &&
      vy >= 0
    ) {
      nextY = plat.y - player.height;
      if (plat.type === 'bouncy') {
        vy = -BOUNCE_VELOCITY;
        isGrounded = false;
      } else {
        vy = 0;
        isGrounded = true;
      }
      break;
    }
  }

  // 7. Check pit hazard or falling below screen
  if (nextY > level.worldHeight + 30) {
    return respawnPlayer({
      ...state,
      level: { ...level, platforms: updatedPlatforms, enemies: updatedEnemies },
    });
  }

  // 8. Hazard collision
  for (const hazard of level.hazards) {
    if (rectIntersects(playerBox, hazard)) {
      return respawnPlayer({
        ...state,
        level: { ...level, platforms: updatedPlatforms, enemies: updatedEnemies },
      });
    }
  }

  // 9. Enemy collision (stomp or take hit)
  let scoreGain = 0;
  const resolvedEnemies = updatedEnemies.map((enemy) => {
    if (!enemy.alive) return enemy;
    if (rectIntersects(playerBox, enemy)) {
      // Stomp check: player is falling and player feet are near top of enemy
      if (player.vy > 0 && player.y + player.height <= enemy.y + 16) {
        vy = -JUMP_VELOCITY * 0.75;
        scoreGain += 50;
        return { ...enemy, alive: false };
      }
    }
    return enemy;
  });

  // Check if player took hit from any living colliding enemy
  const hitEnemy = resolvedEnemies.some((enemy) => enemy.alive && rectIntersects(playerBox, enemy));
  if (hitEnemy) {
    return respawnPlayer({
      ...state,
      level: {
        ...level,
        platforms: updatedPlatforms,
        enemies: resolvedEnemies,
      },
    });
  }

  // 10. Checkpoint collision
  let activeCheckpoint = state.activeCheckpoint;
  const updatedCheckpoints = level.checkpoints.map((cp) => {
    const cpBox = { x: cp.x, y: cp.y, width: 30, height: 40 };
    if (!cp.active && rectIntersects(playerBox, cpBox)) {
      activeCheckpoint = { x: cp.x, y: cp.y - 10 };
      scoreGain += 25;
      return { ...cp, active: true };
    }
    return cp;
  });

  // 11. Coin collection
  let coinsCollectedDelta = 0;
  const updatedCoins = level.coins.map((coin) => {
    if (coin.collected) return coin;
    const coinBox = {
      x: coin.x - coin.radius,
      y: coin.y - coin.radius,
      width: coin.radius * 2,
      height: coin.radius * 2,
    };
    if (rectIntersects(playerBox, coinBox)) {
      scoreGain += coin.value;
      coinsCollectedDelta += 1;
      return { ...coin, collected: true };
    }
    return coin;
  });

  // 12. Level exit collision
  if (rectIntersects(playerBox, level.exit)) {
    const nextLevelIndex = state.currentLevelIndex + 1;
    const isVictory = nextLevelIndex >= PLATFORMER_LEVELS.length;
    const levelClearBonus = 100 * (state.currentLevelIndex + 1);
    const newScore = state.score + scoreGain + levelClearBonus;

    if (isVictory) {
      return {
        ...state,
        status: 'victory',
        score: newScore,
        coinsCollected: state.coinsCollected + coinsCollectedDelta,
        highScore: Math.max(state.highScore, newScore),
        player: {
          ...player,
          x: nextX,
          y: nextY,
          vx,
          vy,
          facing,
          isGrounded,
        },
        level: {
          ...level,
          platforms: updatedPlatforms,
          enemies: resolvedEnemies,
          checkpoints: updatedCheckpoints,
          coins: updatedCoins,
        },
      };
    }

    return {
      ...state,
      status: 'level-cleared',
      score: newScore,
      coinsCollected: state.coinsCollected + coinsCollectedDelta,
      highScore: Math.max(state.highScore, newScore),
      player: {
        ...player,
        x: nextX,
        y: nextY,
        vx,
        vy,
        facing,
        isGrounded,
      },
      level: {
        ...level,
        platforms: updatedPlatforms,
        enemies: resolvedEnemies,
        checkpoints: updatedCheckpoints,
        coins: updatedCoins,
      },
    };
  }

  const finalScore = state.score + scoreGain;

  return {
    ...state,
    score: finalScore,
    coinsCollected: state.coinsCollected + coinsCollectedDelta,
    highScore: Math.max(state.highScore, finalScore),
    activeCheckpoint,
    player: {
      ...player,
      x: nextX,
      y: nextY,
      vx,
      vy,
      facing,
      isGrounded,
    },
    level: {
      ...level,
      platforms: updatedPlatforms,
      enemies: resolvedEnemies,
      checkpoints: updatedCheckpoints,
      coins: updatedCoins,
    },
  };
}

export function advanceToNextLevel(state: StickmanPlatformerState): StickmanPlatformerState {
  const nextIndex = state.currentLevelIndex + 1;
  if (nextIndex >= PLATFORMER_LEVELS.length) {
    return { ...state, status: 'victory' };
  }
  const nextLevel = cloneLevel(PLATFORMER_LEVELS[nextIndex]);
  return {
    ...state,
    status: 'running',
    currentLevelIndex: nextIndex,
    activeCheckpoint: null,
    player: {
      x: nextLevel.startX,
      y: nextLevel.startY,
      vx: 0,
      vy: 0,
      width: 28,
      height: 48,
      facing: 'right',
      isGrounded: false,
    },
    level: nextLevel,
  };
}
