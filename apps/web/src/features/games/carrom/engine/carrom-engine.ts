/**
 * Carrom 2D Physics Board Game Engine
 * Pure TypeScript implementation of official carrom board geometry,
 * circle collision physics, pocket dynamics, official carrom rules,
 * queen cover mechanics, fouls, and multi-difficulty AI bot calculations.
 */

export type CarromPieceType = 'white' | 'black' | 'queen' | 'striker';

export interface CarromPiece {
  id: string;
  type: CarromPieceType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  isPocketed: boolean;
  pocketId?: number;
}

export interface CarromPocket {
  id: number;
  x: number;
  y: number;
  radius: number;
}

export type CarromPlayer = 'player1' | 'player2';
export type CarromGameMode = 'vs-ai' | 'pass-and-play' | 'practice';
export type CarromBotDifficulty = 'easy' | 'medium' | 'hard';
export type CarromSetupType = 'classic' | 'blitz';

export type CarromPhase = 'positioning' | 'aiming' | 'simulating' | 'turn-resolved' | 'game-over';

export interface CarromCollisionEvent {
  pieceAId: string;
  pieceBId: string;
  intensity: number;
}

export interface CarromPocketEvent {
  pieceId: string;
  type: CarromPieceType;
  pocketId: number;
}

export interface CarromTurnResult {
  player: CarromPlayer;
  whitePocketed: number;
  blackPocketed: number;
  queenPocketed: boolean;
  strikerFoul: boolean;
  queenCovered: boolean;
  queenReturned: boolean;
  extraTurn: boolean;
  message: string;
}

export interface CarromConfig {
  boardSize: number;
  innerBorder: number;
  coinRadius: number;
  strikerRadius: number;
  pocketRadius: number;
  friction: number;
  restitution: number;
  cushionRestitution: number;
  maxPower: number;
  mode: CarromGameMode;
  setupType: CarromSetupType;
  botDifficulty: CarromBotDifficulty;
  winningScore: number;
}

export interface CarromState {
  config: CarromConfig;
  phase: CarromPhase;
  activePlayer: CarromPlayer;
  score: {
    player1: number;
    player2: number;
  };
  coinsPocketedCount: {
    white: number;
    black: number;
  };
  queenState: {
    isPocketed: boolean;
    coveredBy: CarromPlayer | null;
    pendingCoverBy: CarromPlayer | null;
  };
  striker: CarromPiece;
  coins: CarromPiece[];
  pockets: CarromPocket[];
  // Baseline bounds for positioning
  baseline: {
    player1Y: number;
    player2Y: number;
    minX: number;
    maxX: number;
  };
  aimAngle: number; // in radians
  aimPower: number; // 0 to 100
  winner: CarromPlayer | 'draw' | null;
  lastTurnResult: CarromTurnResult | null;
  turnCount: number;
  consecutiveFouls: {
    player1: number;
    player2: number;
  };
}

export const DEFAULT_CARROM_CONFIG: CarromConfig = {
  boardSize: 800,
  innerBorder: 44,
  coinRadius: 15,
  strikerRadius: 21,
  pocketRadius: 36,
  friction: 0.985, // continuous deceleration per step
  restitution: 0.92, // elastic coin bounce
  cushionRestitution: 0.82, // bumper elasticity
  maxPower: 1650, // maximum shot impulse
  mode: 'vs-ai',
  setupType: 'classic',
  botDifficulty: 'medium',
  winningScore: 25,
};

/**
 * Initializes pockets positioned at the four corners of the playing surface.
 */
export function createPockets(
  boardSize: number,
  innerBorder: number,
  radius: number,
): CarromPocket[] {
  const offset = innerBorder + radius * 0.78;
  const far = boardSize - offset;

  return [
    { id: 0, x: offset, y: offset, radius }, // Top-Left
    { id: 1, x: far, y: offset, radius }, // Top-Right
    { id: 2, x: offset, y: far, radius }, // Bottom-Left
    { id: 3, x: far, y: far, radius }, // Bottom-Right
  ];
}

/**
 * Creates the standard carrom coin formation around the central queen.
 * Classic: 9 White, 9 Black, 1 Red Queen (19 coins).
 * Blitz: 4 White, 4 Black, 1 Red Queen (9 coins).
 */
export function createCoins(
  center: number,
  coinRadius: number,
  setupType: CarromSetupType = 'classic',
): CarromPiece[] {
  const coins: CarromPiece[] = [];

  // Red Queen at exact center
  coins.push({
    id: 'queen',
    type: 'queen',
    x: center,
    y: center,
    vx: 0,
    vy: 0,
    radius: coinRadius,
    mass: 1.05,
    isPocketed: false,
  });

  if (setupType === 'blitz') {
    // 8 coins in single ring alternating
    const ringRadius = coinRadius * 2.1;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const type: CarromPieceType = i % 2 === 0 ? 'white' : 'black';
      coins.push({
        id: `coin-${type}-${i}`,
        type,
        x: center + Math.cos(angle) * ringRadius,
        y: center + Math.sin(angle) * ringRadius,
        vx: 0,
        vy: 0,
        radius: coinRadius,
        mass: 1.0,
        isPocketed: false,
      });
    }
    return coins;
  }

  // Classic Carrom Formation (19 coins)
  // Ring 1: 6 coins around queen (White & Black alternating)
  const ring1Radius = coinRadius * 2.05;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const type: CarromPieceType = i % 2 === 0 ? 'white' : 'black';
    coins.push({
      id: `coin-r1-${type}-${i}`,
      type,
      x: center + Math.cos(angle) * ring1Radius,
      y: center + Math.sin(angle) * ring1Radius,
      vx: 0,
      vy: 0,
      radius: coinRadius,
      mass: 1.0,
      isPocketed: false,
    });
  }

  // Ring 2: 12 coins around Ring 1
  const ring2Radius = coinRadius * 4.08;
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6 + Math.PI / 12;
    // Alternate 6 white and 6 black
    const type: CarromPieceType = i % 2 === 0 ? 'white' : 'black';
    coins.push({
      id: `coin-r2-${type}-${i}`,
      type,
      x: center + Math.cos(angle) * ring2Radius,
      y: center + Math.sin(angle) * ring2Radius,
      vx: 0,
      vy: 0,
      radius: coinRadius,
      mass: 1.0,
      isPocketed: false,
    });
  }

  return coins;
}

/**
 * Creates the striker piece positioned at the player's baseline.
 */
export function createStriker(
  player: CarromPlayer,
  baselineY: { player1Y: number; player2Y: number },
  centerX: number,
  radius: number,
): CarromPiece {
  const y = player === 'player1' ? baselineY.player1Y : baselineY.player2Y;
  return {
    id: 'striker',
    type: 'striker',
    x: centerX,
    y,
    vx: 0,
    vy: 0,
    radius,
    mass: 3.2,
    isPocketed: false,
  };
}

/**
 * Initializes a new carrom match state.
 */
export function createCarromGame(partialConfig?: Partial<CarromConfig>): CarromState {
  const config = { ...DEFAULT_CARROM_CONFIG, ...partialConfig };
  const center = config.boardSize / 2;
  const pockets = createPockets(config.boardSize, config.innerBorder, config.pocketRadius);
  const coins = createCoins(center, config.coinRadius, config.setupType);

  const baseline = {
    player1Y: config.boardSize - config.innerBorder - 85,
    player2Y: config.innerBorder + 85,
    minX: config.innerBorder + 120,
    maxX: config.boardSize - config.innerBorder - 120,
  };

  const striker = createStriker('player1', baseline, center, config.strikerRadius);
  const defaultAimAngle = -Math.PI / 2; // Upwards towards board center for player 1

  return {
    config,
    phase: 'positioning',
    activePlayer: 'player1',
    score: {
      player1: 0,
      player2: 0,
    },
    coinsPocketedCount: {
      white: 0,
      black: 0,
    },
    queenState: {
      isPocketed: false,
      coveredBy: null,
      pendingCoverBy: null,
    },
    striker,
    coins,
    pockets,
    baseline,
    aimAngle: defaultAimAngle,
    aimPower: 50,
    winner: null,
    lastTurnResult: null,
    turnCount: 1,
    consecutiveFouls: {
      player1: 0,
      player2: 0,
    },
  };
}

/**
 * Validates and updates the striker baseline position.
 * Returns true if position is valid (not overlapping existing coins).
 */
export function setStrikerPosition(state: CarromState, targetX: number): boolean {
  if (state.phase !== 'positioning' && state.phase !== 'aiming') return false;

  const clampedX = Math.max(state.baseline.minX, Math.min(state.baseline.maxX, targetX));
  const baselineY =
    state.activePlayer === 'player1' ? state.baseline.player1Y : state.baseline.player2Y;

  // Verify striker does not intersect with any unpocketed coin
  const overlapsCoin = state.coins.some((coin) => {
    if (coin.isPocketed) return false;
    const dist = Math.hypot(clampedX - coin.x, baselineY - coin.y);
    return dist < state.striker.radius + coin.radius;
  });

  if (overlapsCoin) return false;

  state.striker.x = clampedX;
  state.striker.y = baselineY;
  state.striker.vx = 0;
  state.striker.vy = 0;
  state.striker.isPocketed = false;

  return true;
}

/**
 * Updates aim direction and shot power.
 */
export function setStrikerAim(state: CarromState, angle: number, power: number): void {
  state.aimAngle = angle;
  state.aimPower = Math.max(5, Math.min(100, power));
  if (state.phase === 'positioning') {
    state.phase = 'aiming';
  }
}

/**
 * Releases the striker, applying impulse and transitioning to simulation phase.
 */
export function shootStriker(state: CarromState): boolean {
  if (state.phase !== 'aiming' && state.phase !== 'positioning') return false;

  const impulse = (state.aimPower / 100) * state.config.maxPower;
  state.striker.vx = Math.cos(state.aimAngle) * impulse;
  state.striker.vy = Math.sin(state.aimAngle) * impulse;
  state.phase = 'simulating';

  return true;
}

/**
 * Checks whether all pieces on the board have come to rest.
 */
export function areAllPiecesStopped(state: CarromState, threshold = 1.5): boolean {
  if (
    !state.striker.isPocketed &&
    (Math.abs(state.striker.vx) > threshold || Math.abs(state.striker.vy) > threshold)
  ) {
    return false;
  }

  for (const coin of state.coins) {
    if (coin.isPocketed) continue;
    if (Math.abs(coin.vx) > threshold || Math.abs(coin.vy) > threshold) {
      return false;
    }
  }

  return true;
}

/**
 * Simulates a single physics time step (dt in seconds).
 * Resolves wall cushions, pockets, coin-to-coin and striker-to-coin collisions.
 */
export function stepPhysics(
  state: CarromState,
  dt: number,
): {
  collisions: CarromCollisionEvent[];
  pockets: CarromPocketEvent[];
} {
  const collisions: CarromCollisionEvent[] = [];
  const pocketEvents: CarromPocketEvent[] = [];

  const subSteps = 4;
  const subDt = dt / subSteps;
  const boardMin = state.config.innerBorder;
  const boardMax = state.config.boardSize - state.config.innerBorder;

  for (let s = 0; s < subSteps; s++) {
    // 1. Move all active pieces
    const activePieces: CarromPiece[] = [];
    if (!state.striker.isPocketed) activePieces.push(state.striker);
    for (const c of state.coins) {
      if (!c.isPocketed) activePieces.push(c);
    }

    for (const p of activePieces) {
      p.x += p.vx * subDt;
      p.y += p.vy * subDt;

      // Velocity damping / friction
      p.vx *= Math.pow(state.config.friction, subDt * 60);
      p.vy *= Math.pow(state.config.friction, subDt * 60);

      // Stop near zero
      if (Math.hypot(p.vx, p.vy) < 2.0) {
        p.vx = 0;
        p.vy = 0;
      }

      // 2. Pocket detection
      for (const pocket of state.pockets) {
        const dist = Math.hypot(p.x - pocket.x, p.y - pocket.y);
        // Striker or coin falls into pocket when center is inside the pocket capture zone
        const captureRadius = pocket.radius * 0.95;
        if (dist < captureRadius) {
          p.isPocketed = true;
          p.pocketId = pocket.id;
          p.vx = 0;
          p.vy = 0;
          p.x = pocket.x;
          p.y = pocket.y;
          pocketEvents.push({
            pieceId: p.id,
            type: p.type,
            pocketId: pocket.id,
          });
          break;
        }
      }

      if (p.isPocketed) continue;

      // 3. Wall Cushion Collisions
      const minX = boardMin + p.radius;
      const maxX = boardMax - p.radius;
      const minY = boardMin + p.radius;
      const maxY = boardMax - p.radius;

      if (p.x < minX) {
        p.x = minX;
        p.vx = -p.vx * state.config.cushionRestitution;
      } else if (p.x > maxX) {
        p.x = maxX;
        p.vx = -p.vx * state.config.cushionRestitution;
      }

      if (p.y < minY) {
        p.y = minY;
        p.vy = -p.vy * state.config.cushionRestitution;
      } else if (p.y > maxY) {
        p.y = maxY;
        p.vy = -p.vy * state.config.cushionRestitution;
      }
    }

    // 4. Elastic 2D Circle-to-Circle Collisions
    const unpocketed = activePieces.filter((p) => !p.isPocketed);
    for (let i = 0; i < unpocketed.length; i++) {
      for (let j = i + 1; j < unpocketed.length; j++) {
        const p1 = unpocketed[i];
        const p2 = unpocketed[j];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        const minDist = p1.radius + p2.radius;

        if (dist < minDist && dist > 0.0001) {
          const nx = dx / dist;
          const ny = dy / dist;
          const overlap = minDist - dist;

          // Mass-weighted position separation
          const totalMass = p1.mass + p2.mass;
          p1.x -= nx * overlap * (p2.mass / totalMass);
          p1.y -= ny * overlap * (p2.mass / totalMass);
          p2.x += nx * overlap * (p1.mass / totalMass);
          p2.y += ny * overlap * (p1.mass / totalMass);

          // Relative velocity along collision normal
          const rvx = p1.vx - p2.vx;
          const rvy = p1.vy - p2.vy;
          const velAlongNormal = rvx * nx + rvy * ny;

          if (velAlongNormal > 0) {
            const restitution = state.config.restitution;
            const impulse = ((1 + restitution) * velAlongNormal) / (1 / p1.mass + 1 / p2.mass);

            p1.vx -= (impulse / p1.mass) * nx;
            p1.vy -= (impulse / p1.mass) * ny;
            p2.vx += (impulse / p2.mass) * nx;
            p2.vy += (impulse / p2.mass) * ny;

            collisions.push({
              pieceAId: p1.id,
              pieceBId: p2.id,
              intensity: Math.min(1, Math.abs(velAlongNormal) / 800),
            });
          }
        }
      }
    }
  }

  return { collisions, pockets: pocketEvents };
}

/**
 * Returns a penalty coin to the center circle after a foul (e.g. pocketing striker).
 */
export function returnPenaltyCoinToCenter(
  state: CarromState,
  coinType: 'white' | 'black',
): boolean {
  const pocketedCoin = state.coins.find((c) => c.isPocketed && c.type === coinType);
  if (!pocketedCoin) return false;

  const center = state.config.boardSize / 2;
  pocketedCoin.isPocketed = false;
  pocketedCoin.x = center + (Math.random() - 0.5) * 10;
  pocketedCoin.y = center + (Math.random() - 0.5) * 10;
  pocketedCoin.vx = 0;
  pocketedCoin.vy = 0;
  pocketedCoin.pocketId = undefined;

  if (coinType === 'white') {
    state.coinsPocketedCount.white = Math.max(0, state.coinsPocketedCount.white - 1);
  } else {
    state.coinsPocketedCount.black = Math.max(0, state.coinsPocketedCount.black - 1);
  }

  return true;
}

/**
 * Returns the Queen back to the center circle if not covered.
 */
export function returnQueenToCenter(state: CarromState): void {
  const queen = state.coins.find((c) => c.type === 'queen');
  if (!queen) return;

  const center = state.config.boardSize / 2;
  queen.isPocketed = false;
  queen.x = center;
  queen.y = center;
  queen.vx = 0;
  queen.vy = 0;
  queen.pocketId = undefined;

  state.queenState.isPocketed = false;
  state.queenState.pendingCoverBy = null;
  state.queenState.coveredBy = null;
}

/**
 * Resolves the turn once all pieces have come to a complete stop.
 * Enforces official Carrom rules:
 * - Striker foul (due penalty)
 * - Queen pocketing and covering
 * - Extra turn conditions
 * - Win condition checks
 */
export function resolveTurn(
  state: CarromState,
  pocketEvents: CarromPocketEvent[],
): CarromTurnResult {
  const active = state.activePlayer;
  const playerColor: CarromPieceType = active === 'player1' ? 'white' : 'black';

  let whitePocketed = 0;
  let blackPocketed = 0;
  let queenPocketedThisShot = false;
  let strikerFoul = false;

  for (const event of pocketEvents) {
    if (event.type === 'white') whitePocketed++;
    else if (event.type === 'black') blackPocketed++;
    else if (event.type === 'queen') queenPocketedThisShot = true;
    else if (event.type === 'striker') strikerFoul = true;
  }

  state.coinsPocketedCount.white += whitePocketed;
  state.coinsPocketedCount.black += blackPocketed;

  let extraTurn: boolean;
  let queenCovered = false;
  let queenReturned = false;
  let message: string;

  const myCoinsPocketed = active === 'player1' ? whitePocketed : blackPocketed;
  const oppCoinsPocketed = active === 'player1' ? blackPocketed : whitePocketed;

  // 1. Striker Foul Check
  if (strikerFoul) {
    state.consecutiveFouls[active]++;
    message = `${active === 'player1' ? 'Player 1' : 'Player 2'} pocketed the striker! Foul!`;

    // Penalty: return one of player's coins to center
    const returned = returnPenaltyCoinToCenter(state, playerColor);
    if (returned) {
      message += ' Penalty coin returned to center.';
    }

    // If Queen was pending cover, it also returns to center
    if (state.queenState.pendingCoverBy === active) {
      returnQueenToCenter(state);
      queenReturned = true;
      message += ' Uncovered Queen returned to center.';
    }

    extraTurn = false;
  } else {
    state.consecutiveFouls[active] = 0;

    // 2. Queen Mechanics
    if (queenPocketedThisShot) {
      state.queenState.isPocketed = true;
      if (myCoinsPocketed > 0) {
        // Covered immediately on the same shot!
        state.queenState.coveredBy = active;
        state.queenState.pendingCoverBy = null;
        queenCovered = true;
        extraTurn = true;
        message = `${active === 'player1' ? 'Player 1' : 'Player 2'} pocketed and covered the Queen!`;
      } else {
        // Must cover on the next shot
        state.queenState.pendingCoverBy = active;
        extraTurn = true;
        message = `Queen pocketed! Must cover with a ${playerColor} coin next shot.`;
      }
    } else if (state.queenState.pendingCoverBy === active) {
      if (myCoinsPocketed > 0) {
        // Successfully covered!
        state.queenState.coveredBy = active;
        state.queenState.pendingCoverBy = null;
        queenCovered = true;
        extraTurn = true;
        message = `Queen successfully covered!`;
      } else {
        // Failed to cover: Queen returns to center
        returnQueenToCenter(state);
        queenReturned = true;
        extraTurn = false;
        message = `Failed to cover Queen. Queen returns to center.`;
      }
    } else if (myCoinsPocketed > 0) {
      // Pocketed player's own coin -> earns another shot!
      extraTurn = true;
      message = `${active === 'player1' ? 'Player 1' : 'Player 2'} pocketed a coin! Extra turn.`;
    } else if (oppCoinsPocketed > 0) {
      // Pocketed opponent coin without own coin -> no extra turn
      message = `${active === 'player1' ? 'Player 1' : 'Player 2'} pocketed opponent's coin.`;
      extraTurn = false;
    } else {
      // Clean miss
      message = `No coins pocketed.`;
      extraTurn = false;
    }
  }

  // Check board clear & winning conditions
  const remainingWhite = state.coins.filter((c) => !c.isPocketed && c.type === 'white').length;
  const remainingBlack = state.coins.filter((c) => !c.isPocketed && c.type === 'black').length;

  if (remainingWhite === 0 || remainingBlack === 0) {
    state.phase = 'game-over';

    const p1Score = (state.config.setupType === 'classic' ? 9 : 4) - remainingWhite;
    const p2Score = (state.config.setupType === 'classic' ? 9 : 4) - remainingBlack;
    const queenBonus = 3;

    let p1Final = p1Score;
    let p2Final = p2Score;
    if (state.queenState.coveredBy === 'player1') p1Final += queenBonus;
    if (state.queenState.coveredBy === 'player2') p2Final += queenBonus;

    state.score.player1 = p1Final;
    state.score.player2 = p2Final;

    if (p1Final > p2Final) {
      state.winner = 'player1';
      message = `Player 1 wins with ${p1Final} points!`;
    } else if (p2Final > p1Final) {
      state.winner = 'player2';
      message = `Player 2 wins with ${p2Final} points!`;
    } else {
      state.winner = 'draw';
      message = `Match ended in a draw!`;
    }
  } else {
    // Switch turn if no extra turn
    if (!extraTurn) {
      state.activePlayer = state.activePlayer === 'player1' ? 'player2' : 'player1';
    }
    state.turnCount++;

    // Reset striker to new active player's baseline
    const center = state.config.boardSize / 2;
    state.striker = createStriker(
      state.activePlayer,
      state.baseline,
      center,
      state.config.strikerRadius,
    );
    state.aimAngle = state.activePlayer === 'player1' ? -Math.PI / 2 : Math.PI / 2;
    state.aimPower = 50;
    state.phase = 'positioning';
  }

  const turnResult: CarromTurnResult = {
    player: active,
    whitePocketed,
    blackPocketed,
    queenPocketed: queenPocketedThisShot,
    strikerFoul,
    queenCovered,
    queenReturned,
    extraTurn,
    message,
  };

  state.lastTurnResult = turnResult;
  return turnResult;
}

/**
 * Intelligent AI Bot Shot Calculator.
 * Evaluates candidate targets (bot's color + Queen), tests lines of sight to pockets,
 * determines optimal striker baseline position, aim angle, and strike power.
 */
export function calculateBotShot(state: CarromState): {
  strikerX: number;
  angle: number;
  power: number;
} {
  const isPlayer2 = state.activePlayer === 'player2';
  const targetColor: CarromPieceType = isPlayer2 ? 'black' : 'white';
  const baselineY = isPlayer2 ? state.baseline.player2Y : state.baseline.player1Y;

  // Candidates: bot coins, and queen if not yet pocketed
  const candidates = state.coins.filter((c) => {
    if (c.isPocketed) return false;
    return c.type === targetColor || c.type === 'queen';
  });

  if (candidates.length === 0) {
    // Fallback: hit any remaining coin
    const fallbackCoins = state.coins.filter((c) => !c.isPocketed);
    if (fallbackCoins.length > 0) {
      candidates.push(fallbackCoins[0]);
    }
  }

  interface ShotCandidate {
    strikerX: number;
    angle: number;
    power: number;
    score: number;
  }

  let bestShot: ShotCandidate | null = null;

  for (const coin of candidates) {
    for (const pocket of state.pockets) {
      // Vector from coin to pocket
      const toPocketX = pocket.x - coin.x;
      const toPocketY = pocket.y - coin.y;
      const distToPocket = Math.hypot(toPocketX, toPocketY);
      if (distToPocket < 1) continue;

      const normPocketX = toPocketX / distToPocket;
      const normPocketY = toPocketY / distToPocket;

      // Contact point behind the coin along pocket direction
      const contactDist = coin.radius + state.striker.radius;
      const ghostStrikerX = coin.x - normPocketX * contactDist;
      const ghostStrikerY = coin.y - normPocketY * contactDist;

      // Ensure ghost striker is in front of the bot's baseline
      if (isPlayer2 && ghostStrikerY < baselineY) continue;
      if (!isPlayer2 && ghostStrikerY > baselineY) continue;

      // Aim line from baseline to ghost striker
      // Test 5 baseline candidate positions near ghostStrikerX
      for (let offset = -40; offset <= 40; offset += 20) {
        const testX = Math.max(
          state.baseline.minX,
          Math.min(state.baseline.maxX, ghostStrikerX + offset),
        );

        const dx = ghostStrikerX - testX;
        const dy = ghostStrikerY - baselineY;
        const distToGhost = Math.hypot(dx, dy);
        if (distToGhost < 10) continue;

        const shotAngle = Math.atan2(dy, dx);

        // Power scaled by distance
        const totalDist = distToGhost + distToPocket;
        const calculatedPower = Math.min(100, Math.max(35, totalDist * 0.11));

        // Evaluate shot quality score (lower distance + queen priority)
        let score = 1000 - totalDist;
        if (coin.type === 'queen') score += 200;

        // Angle alignment score between shot trajectory and coin-to-pocket vector
        const shotNormX = dx / distToGhost;
        const shotNormY = dy / distToGhost;
        const dot = shotNormX * normPocketX + shotNormY * normPocketY;
        if (dot < 0.2) continue; // Skip severe slice cuts

        score += dot * 300;

        if (!bestShot || score > bestShot.score) {
          bestShot = {
            strikerX: testX,
            angle: shotAngle,
            power: calculatedPower,
            score,
          };
        }
      }
    }
  }

  // If no clear pocket shot found, aim directly at nearest candidate coin
  if (!bestShot && candidates.length > 0) {
    const coin = candidates[0];
    const dx = coin.x - state.config.boardSize / 2;
    const dy = coin.y - baselineY;
    const angle = Math.atan2(dy, dx);
    bestShot = {
      strikerX: state.config.boardSize / 2,
      angle,
      power: 65,
      score: 50,
    };
  }

  if (!bestShot) {
    const center = state.config.boardSize / 2;
    return {
      strikerX: center,
      angle: isPlayer2 ? Math.PI / 2 : -Math.PI / 2,
      power: 60,
    };
  }

  // Apply difficulty noise
  let noiseAngle = 0;
  let noisePower = 0;
  if (state.config.botDifficulty === 'easy') {
    noiseAngle = (Math.random() - 0.5) * 0.16; // ~ ±5 degrees
    noisePower = (Math.random() - 0.5) * 15;
  } else if (state.config.botDifficulty === 'medium') {
    noiseAngle = (Math.random() - 0.5) * 0.06; // ~ ±2 degrees
    noisePower = (Math.random() - 0.5) * 6;
  }

  return {
    strikerX: bestShot.strikerX,
    angle: bestShot.angle + noiseAngle,
    power: Math.max(25, Math.min(100, bestShot.power + noisePower)),
  };
}
