/**
 * Stickman Parkour — Game Engine
 * Framework-agnostic pure TypeScript simulation of rooftop freerunning,
 * momentum multipliers, gap leap physics, wall kick vaults, and obstacle slides.
 */

export type ParkourActionState = 'running' | 'jumping' | 'sliding' | 'wall_kick' | 'stumbled' | 'falling';
export type ObstacleType = 'pipe' | 'vent' | 'wall' | 'booster';

export interface ParkourObstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  cleared?: boolean;
}

export interface RooftopPlatform {
  id: string;
  x: number;
  y: number;
  width: number;
  obstacles: ParkourObstacle[];
}

export interface FloatingBonus {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  lifetime: number;
}

export interface StickmanParkourState {
  status: 'ready' | 'playing' | 'game_over';
  player: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    state: ParkourActionState;
    isGrounded: boolean;
    canDoubleJump: boolean;
    slideTimer: number;
    stumbleTimer: number;
    invincibleTimer: number;
    width: number;
    height: number;
  };
  cameraX: number;
  distanceMeters: number;
  score: number;
  highScore: number;
  momentum: number; // 1.0 to 3.0
  momentumGauge: number; // 0 to 100
  platforms: RooftopPlatform[];
  floatingBonuses: FloatingBonus[];
  stats: {
    totalDistance: number;
    wallJumps: number;
    slides: number;
    boostersHit: number;
  };
}

export const GRAVITY = 1350;
export const BASE_RUN_SPEED = 340;
export const MAX_RUN_SPEED = 680;
export const JUMP_IMPULSE = -540;
export const DOUBLE_JUMP_IMPULSE = -480;
export const WALL_JUMP_VY = -520;
export const WALL_JUMP_VX = 450;
export const SLIDE_DURATION = 0.65;
export const STANDING_HEIGHT = 52;
export const SLIDING_HEIGHT = 26;
export const PLAYER_WIDTH = 22;

let platformIdCounter = 0;
function uniquePlatformId(): string {
  return `plat_${Date.now()}_${++platformIdCounter}`;
}

export function generateInitialPlatforms(): RooftopPlatform[] {
  const platforms: RooftopPlatform[] = [];
  let currentX = 0;
  let currentY = 380;

  // Platform 0: Starting safe runway
  platforms.push({
    id: uniquePlatformId(),
    x: currentX,
    y: currentY,
    width: 700,
    obstacles: [],
  });

  currentX += 700;

  // Generate next 6 platforms with diverse layouts
  for (let i = 0; i < 6; i++) {
    const gap = 120 + Math.random() * 80;
    const roofWidth = 500 + Math.random() * 350;
    // Slight height variations
    currentY = Math.max(260, Math.min(420, currentY + (Math.random() * 80 - 40)));
    currentX += gap;

    const obstacles: ParkourObstacle[] = [];
    const obstacleCount = Math.floor(Math.random() * 2) + 1;

    for (let o = 0; o < obstacleCount; o++) {
      const obsX = currentX + 120 + o * 180;
      if (obsX + 50 > currentX + roofWidth) continue;

      const rand = Math.random();
      if (rand < 0.35) {
        // Pipe: high obstacle requiring slide
        obstacles.push({
          id: `obs_${obsX}`,
          type: 'pipe',
          x: obsX,
          y: currentY - 50,
          width: 32,
          height: 18,
        });
      } else if (rand < 0.65) {
        // Vent: ground obstacle requiring jump
        obstacles.push({
          id: `obs_${obsX}`,
          type: 'vent',
          x: obsX,
          y: currentY - 32,
          width: 28,
          height: 32,
        });
      } else if (rand < 0.85) {
        // Wall: vertical barrier suitable for wall kick
        obstacles.push({
          id: `obs_${obsX}`,
          type: 'wall',
          x: obsX,
          y: currentY - 75,
          width: 22,
          height: 75,
        });
      } else {
        // Booster pad
        obstacles.push({
          id: `obs_${obsX}`,
          type: 'booster',
          x: obsX,
          y: currentY - 8,
          width: 40,
          height: 8,
        });
      }
    }

    platforms.push({
      id: uniquePlatformId(),
      x: currentX,
      y: currentY,
      width: roofWidth,
      obstacles,
    });

    currentX += roofWidth;
  }

  return platforms;
}

export function createInitialParkourState(highScore = 0): StickmanParkourState {
  const platforms = generateInitialPlatforms();
  const startPlat = platforms[0];

  return {
    status: 'ready',
    player: {
      x: 100,
      y: startPlat.y - STANDING_HEIGHT,
      vx: BASE_RUN_SPEED,
      vy: 0,
      state: 'running',
      isGrounded: true,
      canDoubleJump: true,
      slideTimer: 0,
      stumbleTimer: 0,
      invincibleTimer: 0,
      width: PLAYER_WIDTH,
      height: STANDING_HEIGHT,
    },
    cameraX: 0,
    distanceMeters: 0,
    score: 0,
    highScore,
    momentum: 1.0,
    momentumGauge: 0,
    platforms,
    floatingBonuses: [],
    stats: {
      totalDistance: 0,
      wallJumps: 0,
      slides: 0,
      boostersHit: 0,
    },
  };
}

export function startParkourGame(state: StickmanParkourState): StickmanParkourState {
  const initial = createInitialParkourState(state.highScore);
  return {
    ...initial,
    status: 'playing',
  };
}

export function jumpPlayer(state: StickmanParkourState): StickmanParkourState {
  if (state.status !== 'playing') return state;
  const p = { ...state.player };
  const bonuses = [...state.floatingBonuses];
  let wallJumps = state.stats.wallJumps;
  let nextScore = state.score;
  const nextMomentum = state.momentum;

  // Check if near a wall for Wall Kick
  let nearWall = false;
  for (const plat of state.platforms) {
    for (const obs of plat.obstacles) {
      if (obs.type === 'wall') {
        const dist = Math.abs(p.x + p.width - obs.x);
        if (dist <= 18 && p.y + p.height >= obs.y && p.y <= obs.y + obs.height) {
          nearWall = true;
          break;
        }
      }
    }
  }

  if (nearWall) {
    // Execute Wall Kick Vault!
    p.state = 'wall_kick';
    p.vy = WALL_JUMP_VY;
    p.vx = Math.min(MAX_RUN_SPEED, p.vx + 60);
    p.isGrounded = false;
    p.canDoubleJump = true;
    wallJumps++;
    nextScore += 150 * nextMomentum;
    bonuses.push({
      id: `bonus_${Date.now()}`,
      x: p.x,
      y: p.y - 20,
      text: 'WALL VAULT! +150',
      color: '#06B6D4',
      lifetime: 0.8,
    });
  } else if (p.isGrounded) {
    // Normal Jump from ground
    p.state = 'jumping';
    p.vy = JUMP_IMPULSE;
    p.isGrounded = false;
    p.canDoubleJump = true;
    p.height = STANDING_HEIGHT;
  } else if (p.canDoubleJump) {
    // Mid-air Double Jump / Leap
    p.state = 'jumping';
    p.vy = DOUBLE_JUMP_IMPULSE;
    p.canDoubleJump = false;
    nextScore += 75;
    bonuses.push({
      id: `bonus_${Date.now()}`,
      x: p.x,
      y: p.y - 20,
      text: 'AIR LEAP! +75',
      color: '#A855F7',
      lifetime: 0.7,
    });
  }

  return {
    ...state,
    player: p,
    score: Math.round(nextScore),
    floatingBonuses: bonuses,
    stats: {
      ...state.stats,
      wallJumps,
    },
  };
}

export function slidePlayer(state: StickmanParkourState): StickmanParkourState {
  if (state.status !== 'playing') return state;
  const p = { ...state.player };

  if (p.isGrounded && p.state !== 'sliding') {
    p.state = 'sliding';
    p.slideTimer = SLIDE_DURATION;
    p.height = SLIDING_HEIGHT;
    p.y += (STANDING_HEIGHT - SLIDING_HEIGHT); // lower to ground

    return {
      ...state,
      player: p,
      stats: {
        ...state.stats,
        slides: state.stats.slides + 1,
      },
    };
  }

  return state;
}

export function stepParkourEngine(
  state: StickmanParkourState,
  deltaSec: number,
): StickmanParkourState {
  if (state.status !== 'playing') return state;

  const dt = Math.max(0, Math.min(deltaSec, 0.1));
  const p = { ...state.player };
  let { momentum, momentumGauge, score, highScore, distanceMeters } = state;
  let status: 'ready' | 'playing' | 'game_over' = state.status;
  const bonuses = [...state.floatingBonuses];
  let boostersHit = state.stats.boostersHit;

  // 1. Invincibility & Stumble timers
  if (p.invincibleTimer > 0) p.invincibleTimer -= dt;
  if (p.stumbleTimer > 0) {
    p.stumbleTimer -= dt;
    if (p.stumbleTimer <= 0 && p.isGrounded) {
      p.state = 'running';
      p.height = STANDING_HEIGHT;
    }
  }

  // 2. Slide Timer
  if (p.state === 'sliding') {
    p.slideTimer -= dt;
    if (p.slideTimer <= 0) {
      p.state = 'running';
      p.height = STANDING_HEIGHT;
      p.y -= (STANDING_HEIGHT - SLIDING_HEIGHT); // return to standing
    }
  }

  // 3. Momentum Build
  if (p.isGrounded && p.stumbleTimer <= 0) {
    momentumGauge = Math.min(100, momentumGauge + 15 * dt);
    momentum = 1.0 + (momentumGauge / 100) * 2.0; // 1.0x to 3.0x
  }

  // 4. Horizontal Velocity based on Momentum
  const targetVx = (BASE_RUN_SPEED + (momentum - 1.0) * 150);
  p.vx = p.stumbleTimer > 0 ? BASE_RUN_SPEED * 0.4 : targetVx;

  // 5. Apply Gravity & Velocity
  p.vy += GRAVITY * dt;
  p.x += p.vx * dt;
  p.y += p.vy * dt;

  // Update distance & score
  const distanceTraveled = (p.vx * dt) / 20; // 20px = 1 meter
  distanceMeters += distanceTraveled;
  score += distanceTraveled * 10 * momentum;
  highScore = Math.max(highScore, Math.round(score));

  // 6. Platform Collisions (Rooftop decks)
  let foundGround = false;

  for (const plat of state.platforms) {
    // Check if player's X overlaps platform width
    if (p.x + p.width >= plat.x && p.x <= plat.x + plat.width) {
      const feetY = p.y + p.height;
      // If falling onto rooftop surface
      if (feetY >= plat.y && feetY - p.vy * dt <= plat.y + 16 && p.vy >= 0) {
        p.y = plat.y - p.height;
        p.vy = 0;
        p.isGrounded = true;
        p.canDoubleJump = true;
        foundGround = true;

        if (p.state === 'jumping' || p.state === 'wall_kick') {
          p.state = 'running';
          p.height = STANDING_HEIGHT;
        }
        break;
      }
    }
  }

  if (!foundGround) {
    p.isGrounded = false;
    if (p.state === 'running') {
      p.state = 'jumping';
    }
  }

  // 7. Obstacle Interactions
  for (const plat of state.platforms) {
    for (const obs of plat.obstacles) {
      if (obs.cleared) continue;

      // Check AABB collision
      const pLeft = p.x;
      const pRight = p.x + p.width;
      const pTop = p.y;
      const pBottom = p.y + p.height;

      const oLeft = obs.x;
      const oRight = obs.x + obs.width;
      const oTop = obs.y;
      const oBottom = obs.y + obs.height;

      const isColliding =
        pRight >= oLeft && pLeft <= oRight && pBottom >= oTop && pTop <= oBottom;

      if (isColliding) {
        if (obs.type === 'booster') {
          // Speed Booster Pad!
          obs.cleared = true;
          boostersHit++;
          p.vx = MAX_RUN_SPEED;
          p.invincibleTimer = 1.5;
          momentumGauge = 100;
          momentum = 3.0;
          bonuses.push({
            id: `boost_${Date.now()}`,
            x: p.x,
            y: p.y - 30,
            text: 'TURBO BOOST! 3.0x',
            color: '#F59E0B',
            lifetime: 1.0,
          });
        } else if (p.invincibleTimer <= 0) {
          // Collision with pipe, vent, or wall
          p.stumbleTimer = 0.6;
          momentumGauge = 0;
          momentum = 1.0;
          obs.cleared = true;

          bonuses.push({
            id: `stumble_${Date.now()}`,
            x: p.x,
            y: p.y - 25,
            text: 'STUMBLED! -MOMENTUM',
            color: '#EF4444',
            lifetime: 0.8,
          });
        }
      }
    }
  }

  // 8. Pitfall Drop Detection (Fell into alley)
  if (p.y > 600) {
    status = 'game_over';
  }

  // 9. Camera Tracking
  const cameraX = p.x - 160;

  // 10. Endless Platform Generation & Cleanup
  let updatedPlatforms = [...state.platforms];
  // Remove platforms completely passed by camera
  updatedPlatforms = updatedPlatforms.filter((plat) => plat.x + plat.width > cameraX - 200);

  // If latest platform is near camera view, spawn new one ahead
  const lastPlat = updatedPlatforms[updatedPlatforms.length - 1];
  if (lastPlat && lastPlat.x + lastPlat.width < cameraX + 1600) {
    const gap = 120 + Math.random() * 90;
    const roofWidth = 520 + Math.random() * 320;
    const nextY = Math.max(260, Math.min(420, lastPlat.y + (Math.random() * 70 - 35)));
    const nextX = lastPlat.x + lastPlat.width + gap;

    const newObs: ParkourObstacle[] = [];
    if (Math.random() < 0.6) {
      newObs.push({
        id: `obs_${nextX + 180}`,
        type: Math.random() < 0.5 ? 'pipe' : 'vent',
        x: nextX + 180,
        y: Math.random() < 0.5 ? nextY - 50 : nextY - 32,
        width: 30,
        height: 32,
      });
    }

    updatedPlatforms.push({
      id: uniquePlatformId(),
      x: nextX,
      y: nextY,
      width: roofWidth,
      obstacles: newObs,
    });
  }

  // 11. Update Floating Bonuses
  const updatedBonuses = bonuses
    .map((b) => ({ ...b, y: b.y - 25 * dt, lifetime: b.lifetime - dt }))
    .filter((b) => b.lifetime > 0);

  return {
    ...state,
    status,
    player: p,
    cameraX,
    distanceMeters: Math.round(distanceMeters),
    score: Math.round(score),
    highScore: Math.round(highScore),
    momentum: Number(momentum.toFixed(2)),
    momentumGauge,
    platforms: updatedPlatforms,
    floatingBonuses: updatedBonuses,
    stats: {
      ...state.stats,
      totalDistance: Math.round(distanceMeters),
      boostersHit,
    },
  };
}
