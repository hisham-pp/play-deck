export type Direction = 'N' | 'E' | 'S' | 'W';

export type TrackPieceType =
  'straight' | 'curve' | 't-junction' | 'crossroad' | 'station' | 'bridge' | 'tunnel';

export type Rotation = 0 | 90 | 180 | 270;

export type SpecialEventType =
  'track-blockage' | 'tunnel-shortcut' | 'broken-track' | 'bonus-station' | 'time-extension';

export type TrainRushPhase = 'lobby' | 'playing' | 'round-review' | 'game-over';

export interface TrackPiece {
  id: string;
  type: TrackPieceType;
  rotation: Rotation;
  bonusPoints?: number;
}

export interface GridCell {
  x: number;
  y: number;
  type: 'empty' | 'obstacle' | 'water' | 'mountain' | 'start' | 'destination' | 'track';
  piece?: TrackPiece;
  isObstacle?: boolean;
  bonusPoints?: number;
  isPartOfRoute?: boolean;
  isStart?: boolean;
  isDestination?: boolean;
  stationName?: string;
}

export interface RouteResult {
  isComplete: boolean;
  path: Array<{ x: number; y: number }>;
  length: number;
  stationsVisited: number;
  baseScore: number;
  bonusScore: number;
  totalScore: number;
}

export interface TrainRushPlayer {
  id: string;
  name: string;
  avatar: string;
  isBot: boolean;
  score: number;
  roundScore: number;
  grid: GridCell[][];
  currentPiece: TrackPiece;
  nextPiece: TrackPiece;
  routeResult: RouteResult;
  isFinished: boolean;
  finishTime?: number;
  nextBotActionCooldown?: number;
}

export interface SpecialEvent {
  id: string;
  type: SpecialEventType;
  title: string;
  description: string;
  active: boolean;
  x?: number;
  y?: number;
}

export interface MapPreset {
  id: string;
  name: string;
  description: string;
  gridSize: number;
  startPos: { x: number; y: number; exitDirection: Direction };
  destPos: { x: number; y: number; enterDirection: Direction };
  obstacles: Array<{
    x: number;
    y: number;
    type: 'obstacle' | 'water' | 'mountain';
  }>;
  bonusStations?: Array<{ x: number; y: number; bonus: number; name: string }>;
}

export interface TrainRushConfig {
  mapId: string;
  roundDurationSeconds: number;
  totalRounds: number;
  botCount: number;
  roomCode?: string;
}

export interface TrainRushRound {
  roundNumber: number;
  totalRounds: number;
  durationSeconds: number;
  timeRemaining: number;
  map: MapPreset;
  activeEvent?: SpecialEvent;
}

export interface TrainRushState {
  phase: TrainRushPhase;
  config: TrainRushConfig;
  currentRound: TrainRushRound;
  players: TrainRushPlayer[];
  activePlayerId: string;
}

// Direction helpers
export const DIRECTION_OFFSETS: Record<Direction, { dx: number; dy: number }> = {
  N: { dx: 0, dy: -1 },
  E: { dx: 1, dy: 0 },
  S: { dx: 0, dy: 1 },
  W: { dx: -1, dy: 0 },
};

export const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  N: 'S',
  E: 'W',
  S: 'N',
  W: 'E',
};

// Clockwise direction rotation helper
export function rotateDirection(dir: Direction, rot: Rotation): Direction {
  const dirs: Direction[] = ['N', 'E', 'S', 'W'];
  const curIdx = dirs.indexOf(dir);
  const steps = (rot / 90) % 4;
  return dirs[(curIdx + steps) % 4];
}

// Base connections for piece types at 0 degrees
export const BASE_PIECE_CONNECTIONS: Record<TrackPieceType, Direction[]> = {
  straight: ['N', 'S'],
  curve: ['N', 'E'],
  't-junction': ['N', 'E', 'S'],
  crossroad: ['N', 'E', 'S', 'W'],
  station: ['N', 'S'],
  bridge: ['N', 'S'],
  tunnel: ['N', 'S'],
};

/**
 * Returns all active connected directions for a piece given its rotation.
 */
export function getPieceConnections(type: TrackPieceType, rotation: Rotation): Direction[] {
  const base = BASE_PIECE_CONNECTIONS[type] || ['N', 'S'];
  return base.map((dir) => rotateDirection(dir, rotation));
}

// Map Presets
export const MAP_PRESETS: MapPreset[] = [
  {
    id: 'meadow-crossing',
    name: 'Meadow Crossing',
    description: 'Gentle green pastures with minimal boulder obstructions.',
    gridSize: 7,
    startPos: { x: 0, y: 3, exitDirection: 'E' },
    destPos: { x: 6, y: 3, enterDirection: 'W' },
    obstacles: [
      { x: 3, y: 1, type: 'obstacle' },
      { x: 3, y: 5, type: 'obstacle' },
      { x: 2, y: 3, type: 'obstacle' },
    ],
    bonusStations: [
      { x: 1, y: 1, bonus: 150, name: 'Sunvale Depot' },
      { x: 5, y: 5, bonus: 200, name: 'Amber Junction' },
    ],
  },
  {
    id: 'canyon-pass',
    name: 'Canyon Pass',
    description: 'Challenging canyon terrain divided by a rushing mountain river.',
    gridSize: 7,
    startPos: { x: 0, y: 1, exitDirection: 'E' },
    destPos: { x: 6, y: 5, enterDirection: 'W' },
    obstacles: [
      { x: 3, y: 0, type: 'water' },
      { x: 3, y: 1, type: 'water' },
      { x: 3, y: 2, type: 'water' },
      { x: 3, y: 4, type: 'water' },
      { x: 3, y: 5, type: 'water' },
      { x: 3, y: 6, type: 'water' },
      // Cell (3,3) is the open bridge slot!
      { x: 1, y: 4, type: 'obstacle' },
      { x: 5, y: 2, type: 'obstacle' },
    ],
    bonusStations: [
      { x: 2, y: 5, bonus: 250, name: 'Gorge Vista' },
      { x: 4, y: 1, bonus: 250, name: 'Eagle Ridge' },
    ],
  },
  {
    id: 'alpine-tunnels',
    name: 'Alpine Tunnels',
    description: 'High altitude mountain ridges requiring winding switchbacks.',
    gridSize: 7,
    startPos: { x: 1, y: 0, exitDirection: 'S' },
    destPos: { x: 5, y: 6, enterDirection: 'N' },
    obstacles: [
      { x: 2, y: 2, type: 'mountain' },
      { x: 3, y: 2, type: 'mountain' },
      { x: 4, y: 2, type: 'mountain' },
      { x: 2, y: 4, type: 'mountain' },
      { x: 3, y: 4, type: 'mountain' },
      { x: 4, y: 4, type: 'mountain' },
    ],
    bonusStations: [
      { x: 0, y: 3, bonus: 300, name: 'Peak Summit' },
      { x: 6, y: 3, bonus: 300, name: 'Glacier Base' },
    ],
  },
];

/**
 * Creates a fresh blank grid populated with map obstacles, start depot, and destination.
 */
export function createGridForMap(map: MapPreset): GridCell[][] {
  const grid: GridCell[][] = [];

  for (let y = 0; y < map.gridSize; y += 1) {
    const row: GridCell[] = [];
    for (let x = 0; x < map.gridSize; x += 1) {
      row.push({
        x,
        y,
        type: 'empty',
        isObstacle: false,
      });
    }
    grid.push(row);
  }

  // Set obstacles
  for (const obs of map.obstacles) {
    if (grid[obs.y] && grid[obs.y][obs.x]) {
      grid[obs.y][obs.x].type = obs.type;
      grid[obs.y][obs.x].isObstacle = true;
    }
  }

  // Set bonus stations
  if (map.bonusStations) {
    for (const st of map.bonusStations) {
      if (grid[st.y] && grid[st.y][st.x]) {
        grid[st.y][st.x].bonusPoints = st.bonus;
        grid[st.y][st.x].stationName = st.name;
      }
    }
  }

  // Set start depot
  if (grid[map.startPos.y] && grid[map.startPos.y][map.startPos.x]) {
    grid[map.startPos.y][map.startPos.x].type = 'start';
    grid[map.startPos.y][map.startPos.x].isStart = true;
    grid[map.startPos.y][map.startPos.x].piece = {
      id: 'start-depot',
      type: 'straight',
      rotation: map.startPos.exitDirection === 'E' || map.startPos.exitDirection === 'W' ? 90 : 0,
    };
  }

  // Set destination terminus
  if (grid[map.destPos.y] && grid[map.destPos.y][map.destPos.x]) {
    grid[map.destPos.y][map.destPos.x].type = 'destination';
    grid[map.destPos.y][map.destPos.x].isDestination = true;
    grid[map.destPos.y][map.destPos.x].piece = {
      id: 'dest-terminus',
      type: 'straight',
      rotation: map.destPos.enterDirection === 'E' || map.destPos.enterDirection === 'W' ? 90 : 0,
    };
  }

  return grid;
}

/**
 * Random piece generator from balanced probability bag.
 */
export function generateRandomPiece(): TrackPiece {
  const rand = Math.random();
  let type: TrackPieceType;

  if (rand < 0.35) {
    type = 'straight';
  } else if (rand < 0.7) {
    type = 'curve';
  } else if (rand < 0.82) {
    type = 't-junction';
  } else if (rand < 0.9) {
    type = 'crossroad';
  } else if (rand < 0.96) {
    type = 'station';
  } else {
    type = 'bridge';
  }

  const rotations: Rotation[] = [0, 90, 180, 270];
  const rot = rotations[Math.floor(Math.random() * rotations.length)];

  return {
    id: `piece-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    rotation: rot,
    bonusPoints: type === 'station' ? 100 : undefined,
  };
}

/**
 * Validates route connectivity from start to destination using directional pathfinding.
 */
export function findConnectedRoute(grid: GridCell[][], map: MapPreset): RouteResult {
  const start = map.startPos;
  const dest = map.destPos;
  const path: Array<{ x: number; y: number }> = [{ x: start.x, y: start.y }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  let currentX = start.x;
  let currentY = start.y;
  let currentExitDir: Direction = start.exitDirection;
  let isComplete = false;
  let stationsVisited = 0;
  let bonusPoints = 0;

  // Maximum steps to prevent infinite loop
  const maxSteps = map.gridSize * map.gridSize;

  for (let step = 0; step < maxSteps; step += 1) {
    const nextOffset = DIRECTION_OFFSETS[currentExitDir];
    const nextX = currentX + nextOffset.dx;
    const nextY = currentY + nextOffset.dy;

    // Check bounds
    if (nextY < 0 || nextY >= map.gridSize || nextX < 0 || nextX >= map.gridSize) {
      break;
    }

    const nextCell = grid[nextY][nextX];
    const requiredEnterDir = OPPOSITE_DIRECTIONS[currentExitDir];

    // Destination reached?
    if (nextX === dest.x && nextY === dest.y) {
      path.push({ x: nextX, y: nextY });
      isComplete = true;
      break;
    }

    // Check if cell has a valid piece
    if (!nextCell.piece || nextCell.isObstacle) {
      break;
    }

    const pieceConnections = getPieceConnections(nextCell.piece.type, nextCell.piece.rotation);

    // Can we enter this piece from requiredEnterDir?
    if (!pieceConnections.includes(requiredEnterDir)) {
      break;
    }

    const coordKey = `${nextX},${nextY}`;
    if (visited.has(coordKey) && nextCell.piece.type !== 'crossroad') {
      // Loop detected
      break;
    }
    visited.add(coordKey);
    path.push({ x: nextX, y: nextY });

    if (nextCell.piece.type === 'station' || nextCell.bonusPoints) {
      stationsVisited += 1;
      bonusPoints += nextCell.piece.bonusPoints || nextCell.bonusPoints || 100;
    }

    // Find exit direction from this piece (choose opening other than requiredEnterDir)
    const availableExits = pieceConnections.filter((d) => d !== requiredEnterDir);
    if (availableExits.length === 0) {
      break;
    }

    // Advance along the primary available exit
    currentExitDir = availableExits[0];
    currentX = nextX;
    currentY = nextY;
  }

  // Scoring
  const length = path.length;
  const baseScore = isComplete ? 500 + length * 50 : length * 20;
  const totalBonus = bonusPoints;
  const totalScore = baseScore + totalBonus;

  return {
    isComplete,
    path,
    length,
    stationsVisited,
    baseScore,
    bonusScore: totalBonus,
    totalScore,
  };
}

/**
 * Places a track piece onto the player's grid and re-evaluates route connectivity.
 */
export function placeTrackPiece(
  player: TrainRushPlayer,
  map: MapPreset,
  x: number,
  y: number,
  piece: TrackPiece,
): { player: TrainRushPlayer; success: boolean } {
  // Check bounds
  if (y < 0 || y >= map.gridSize || x < 0 || x >= map.gridSize) {
    return { player, success: false };
  }

  const targetCell = player.grid[y][x];

  // Cannot place on start, destination, or non-bridge obstacle
  if (targetCell.isStart || targetCell.isDestination) {
    return { player, success: false };
  }

  if (targetCell.isObstacle) {
    // Bridges can only be placed on water
    if (targetCell.type === 'water' && piece.type === 'bridge') {
      // Allowed!
    } else {
      return { player, success: false };
    }
  }

  // Create new grid copy
  const updatedGrid = player.grid.map((row, rY) =>
    row.map((cell, cX) => {
      if (cX === x && rY === y) {
        return {
          ...cell,
          type: 'track' as const,
          piece: { ...piece },
        };
      }
      return { ...cell };
    }),
  );

  const routeResult = findConnectedRoute(updatedGrid, map);

  // Mark cells that are part of route
  const pathSet = new Set(routeResult.path.map((p) => `${p.x},${p.y}`));
  for (let r = 0; r < map.gridSize; r += 1) {
    for (let c = 0; c < map.gridSize; c += 1) {
      updatedGrid[r][c].isPartOfRoute = pathSet.has(`${c},${r}`);
    }
  }

  const isFinished = routeResult.isComplete;

  return {
    player: {
      ...player,
      grid: updatedGrid,
      currentPiece: player.nextPiece,
      nextPiece: generateRandomPiece(),
      routeResult,
      isFinished,
      roundScore: routeResult.totalScore,
    },
    success: true,
  };
}

/**
 * Removes / clears a placed track piece from cell.
 */
export function removeTrackPiece(
  player: TrainRushPlayer,
  map: MapPreset,
  x: number,
  y: number,
): TrainRushPlayer {
  if (y < 0 || y >= map.gridSize || x < 0 || x >= map.gridSize) {
    return player;
  }

  const targetCell = player.grid[y][x];
  if (targetCell.isStart || targetCell.isDestination || targetCell.isObstacle) {
    return player;
  }

  const updatedGrid = player.grid.map((row, rY) =>
    row.map((cell, cX) => {
      if (cX === x && rY === y) {
        return {
          ...cell,
          type: 'empty' as const,
          piece: undefined,
          isPartOfRoute: false,
        };
      }
      return { ...cell };
    }),
  );

  const routeResult = findConnectedRoute(updatedGrid, map);
  const pathSet = new Set(routeResult.path.map((p) => `${p.x},${p.y}`));
  for (let r = 0; r < map.gridSize; r += 1) {
    for (let c = 0; c < map.gridSize; c += 1) {
      updatedGrid[r][c].isPartOfRoute = pathSet.has(`${c},${r}`);
    }
  }

  return {
    ...player,
    grid: updatedGrid,
    routeResult,
    isFinished: routeResult.isComplete,
    roundScore: routeResult.totalScore,
  };
}

/**
 * Rotates the current held track piece clockwise by 90 degrees.
 */
export function rotateCurrentPiece(player: TrainRushPlayer): TrainRushPlayer {
  const currentRot = player.currentPiece.rotation;
  const nextRot: Rotation = ((currentRot + 90) % 360) as Rotation;

  return {
    ...player,
    currentPiece: {
      ...player.currentPiece,
      rotation: nextRot,
    },
  };
}

/**
 * Discards/skips current piece for next piece in queue with minor delay or cooldown.
 */
export function discardCurrentPiece(player: TrainRushPlayer): TrainRushPlayer {
  return {
    ...player,
    currentPiece: player.nextPiece,
    nextPiece: generateRandomPiece(),
  };
}

/**
 * Creates bot players with distinct engineer personalities.
 */
export const TRAIN_BOT_NAMES = ['SteamBot', 'RailBaron', 'ConductorCasey', 'ExpressElla'];
export const TRAIN_BOT_AVATARS = ['🚂', '🎩', '⏱️', '⚡'];

export function createTrainBotPlayers(count: number, map: MapPreset): TrainRushPlayer[] {
  const bots: TrainRushPlayer[] = [];

  for (let i = 0; i < count; i += 1) {
    const idx = i % TRAIN_BOT_NAMES.length;
    const initialGrid = createGridForMap(map);
    const initialRoute = findConnectedRoute(initialGrid, map);

    bots.push({
      id: `bot-${i + 1}`,
      name: TRAIN_BOT_NAMES[idx] + (i >= TRAIN_BOT_NAMES.length ? ` ${Math.floor(i / 4) + 1}` : ''),
      avatar: TRAIN_BOT_AVATARS[idx],
      isBot: true,
      score: 0,
      roundScore: 0,
      grid: initialGrid,
      currentPiece: generateRandomPiece(),
      nextPiece: generateRandomPiece(),
      routeResult: initialRoute,
      isFinished: false,
      nextBotActionCooldown: 1.5 + Math.random() * 2,
    });
  }

  return bots;
}

/**
 * Builds initial game state.
 */
export function createInitialTrainRushState(
  configPartial?: Partial<TrainRushConfig>,
  playerName: string = 'You',
): TrainRushState {
  const config: TrainRushConfig = {
    mapId: 'meadow-crossing',
    roundDurationSeconds: 60,
    totalRounds: 3,
    botCount: 2,
    ...configPartial,
  };

  const map = MAP_PRESETS.find((m) => m.id === config.mapId) || MAP_PRESETS[0];

  const humanGrid = createGridForMap(map);
  const humanRoute = findConnectedRoute(humanGrid, map);

  const humanPlayer: TrainRushPlayer = {
    id: 'player-1',
    name: playerName,
    avatar: '🧑‍✈️',
    isBot: false,
    score: 0,
    roundScore: 0,
    grid: humanGrid,
    currentPiece: generateRandomPiece(),
    nextPiece: generateRandomPiece(),
    routeResult: humanRoute,
    isFinished: false,
  };

  const bots = createTrainBotPlayers(config.botCount, map);
  const players = [humanPlayer, ...bots];

  return {
    phase: 'lobby',
    config,
    currentRound: {
      roundNumber: 1,
      totalRounds: config.totalRounds,
      durationSeconds: config.roundDurationSeconds,
      timeRemaining: config.roundDurationSeconds,
      map,
    },
    players,
    activePlayerId: humanPlayer.id,
  };
}

/**
 * Starts a new round with the specified map.
 */
export function startTrainRushRound(state: TrainRushState, roundNumber: number): TrainRushState {
  const map = MAP_PRESETS[(roundNumber - 1) % MAP_PRESETS.length] || state.currentRound.map;

  const resetPlayers = state.players.map((p) => {
    const grid = createGridForMap(map);
    const route = findConnectedRoute(grid, map);
    return {
      ...p,
      roundScore: 0,
      grid,
      currentPiece: generateRandomPiece(),
      nextPiece: generateRandomPiece(),
      routeResult: route,
      isFinished: false,
      finishTime: undefined,
      nextBotActionCooldown: p.isBot ? 1.5 + Math.random() * 2 : undefined,
    };
  });

  return {
    ...state,
    phase: 'playing',
    currentRound: {
      roundNumber,
      totalRounds: state.config.totalRounds,
      durationSeconds: state.config.roundDurationSeconds,
      timeRemaining: state.config.roundDurationSeconds,
      map,
      activeEvent: undefined,
    },
    players: resetPlayers,
  };
}

/**
 * Concludes active round, aggregates scores, and transitions to review or game-over.
 */
export function completeTrainRushRound(state: TrainRushState): TrainRushState {
  const updatedPlayers = state.players.map((p) => ({
    ...p,
    score: p.score + p.roundScore,
  }));

  const isFinalRound = state.currentRound.roundNumber >= state.config.totalRounds;

  return {
    ...state,
    phase: isFinalRound ? 'game-over' : 'round-review',
    players: updatedPlayers,
  };
}

/**
 * Bot AI step: Bot searches for an empty cell adjacent to the current path endpoint
 * and tries placing its piece with optimal rotation.
 */
export function stepBotPlayer(bot: TrainRushPlayer, map: MapPreset): TrainRushPlayer {
  if (bot.isFinished) return bot;

  // Identify last cell of current route
  const lastCell = bot.routeResult.path[bot.routeResult.path.length - 1];
  if (!lastCell) return bot;

  // Potential neighbors of path tip
  const neighborDeltas = [
    { dx: 1, dy: 0 },
    { dx: 0, dy: 1 },
    { dx: -1, dy: 0 },
    { dx: 0, dy: -1 },
  ];

  const rotations: Rotation[] = [0, 90, 180, 270];

  // Try neighbor cells closest to destination
  const dest = map.destPos;
  neighborDeltas.sort((a, b) => {
    const distA = Math.abs(lastCell.x + a.dx - dest.x) + Math.abs(lastCell.y + a.dy - dest.y);
    const distB = Math.abs(lastCell.x + b.dx - dest.x) + Math.abs(lastCell.y + b.dy - dest.y);
    return distA - distB;
  });

  for (const delta of neighborDeltas) {
    const targetX = lastCell.x + delta.dx;
    const targetY = lastCell.y + delta.dy;

    if (targetX >= 0 && targetX < map.gridSize && targetY >= 0 && targetY < map.gridSize) {
      const cell = bot.grid[targetY][targetX];
      if (cell.type === 'empty' && !cell.isObstacle) {
        // Try each rotation to see if it extends the route
        for (const rot of rotations) {
          const testPiece: TrackPiece = {
            ...bot.currentPiece,
            rotation: rot,
          };
          const { player: updatedBot, success } = placeTrackPiece(
            bot,
            map,
            targetX,
            targetY,
            testPiece,
          );
          if (success && updatedBot.routeResult.length > bot.routeResult.length) {
            return updatedBot;
          }
        }
      }
    }
  }

  // If no extension found, rotate or discard piece
  if (Math.random() < 0.5) {
    return rotateCurrentPiece(bot);
  }
  return discardCurrentPiece(bot);
}

/**
 * Deterministic engine step function. Advances round countdown, fires bot actions,
 * and triggers special events.
 */
export function stepTrainRushEngine(state: TrainRushState, dt: number): TrainRushState {
  if (state.phase !== 'playing') {
    return state;
  }

  const nextTimeRemaining = Math.max(0, state.currentRound.timeRemaining - dt);

  // Check if all players finished or time expired
  const allFinished = state.players.every((p) => p.isFinished);
  if (nextTimeRemaining <= 0 || allFinished) {
    return completeTrainRushRound({
      ...state,
      currentRound: {
        ...state.currentRound,
        timeRemaining: 0,
      },
    });
  }

  const currentState: TrainRushState = {
    ...state,
    currentRound: {
      ...state.currentRound,
      timeRemaining: nextTimeRemaining,
    },
  };

  // Bot simulation step
  const updatedPlayers: TrainRushPlayer[] = [];

  for (const player of currentState.players) {
    if (!player.isBot) {
      updatedPlayers.push(player);
      continue;
    }

    const cooldown = (player.nextBotActionCooldown ?? 2) - dt;
    if (cooldown <= 0) {
      const steppedBot = stepBotPlayer(player, currentState.currentRound.map);
      updatedPlayers.push({
        ...steppedBot,
        nextBotActionCooldown: 1.8 + Math.random() * 2,
      });
    } else {
      updatedPlayers.push({
        ...player,
        nextBotActionCooldown: cooldown,
      });
    }
  }

  currentState.players = updatedPlayers;
  return currentState;
}
