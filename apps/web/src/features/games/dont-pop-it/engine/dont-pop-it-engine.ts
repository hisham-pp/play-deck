export type TileType = 'safe' | 'bonus' | 'double' | 'shield' | 'extra_turn' | 'scout' | 'pop';

export interface BoardTile {
  id: number;
  row: number;
  col: number;
  type: TileType;
  revealed: boolean;
  hintScouted?: boolean;
}

export interface PlayerState {
  id: string;
  name: string;
  isAi: boolean;
  score: number;
  hasShield: boolean;
  isEliminated: boolean;
}

export type GameStatus = 'waiting' | 'playing' | 'round_over' | 'game_over';

export interface DontPopItState {
  gridSize: number; // e.g. 5 for 5x5
  tiles: BoardTile[];
  players: PlayerState[];
  currentTurnIndex: number;
  status: GameStatus;
  round: number;
  maxRounds: number;
  popTileCount: number;
  popsTriggered: number;
  lastActionMessage: string;
  lastRevealedTile: {
    tileId: number;
    type: TileType;
    playerName: string;
    shieldSaved?: boolean;
  } | null;
  tensionPercentage: number;
}

export interface CreateGameConfig {
  gridSize?: number;
  players?: { name: string; isAi: boolean }[];
  maxRounds?: number;
  popCount?: number;
}

/**
 * Creates a shuffled hidden tile layout.
 */
export function generateBoardTiles(gridSize: number = 5, popCount: number = 3): BoardTile[] {
  const totalTiles = gridSize * gridSize;
  const types: TileType[] = [];

  // Add Pop tiles (traps)
  for (let i = 0; i < popCount; i++) {
    types.push('pop');
  }

  // Add special utility tiles
  types.push('shield');
  types.push('shield');
  types.push('extra_turn');
  types.push('scout');
  types.push('double');
  types.push('bonus');
  types.push('bonus');
  types.push('bonus');

  // Fill remainder with safe tiles
  while (types.length < totalTiles) {
    types.push('safe');
  }

  // Fisher-Yates shuffle
  for (let i = types.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = types[i];
    types[i] = types[j];
    types[j] = temp;
  }

  return types.map((type, idx) => ({
    id: idx,
    row: Math.floor(idx / gridSize),
    col: idx % gridSize,
    type,
    revealed: false,
  }));
}

/**
 * Calculates current balloon tension (0 to 100%) based on unrevealed pop risk.
 */
export function calculateTension(tiles: BoardTile[], _popCount: number = 3): number {
  const unrevealedTiles = tiles.filter((t) => !t.revealed);
  if (unrevealedTiles.length === 0) return 100;
  const unrevealedPops = unrevealedTiles.filter((t) => t.type === 'pop').length;
  const riskRatio = unrevealedPops / unrevealedTiles.length;
  return Math.min(100, Math.round(riskRatio * 180));
}

/**
 * Initialize a new Don't Pop It match.
 */
export function createDontPopItGame(config?: CreateGameConfig): DontPopItState {
  const gridSize = config?.gridSize ?? 5;
  const popCount = config?.popCount ?? 3;
  const maxRounds = config?.maxRounds ?? 3;
  const tiles = generateBoardTiles(gridSize, popCount);

  const defaultPlayers = config?.players ?? [
    { name: 'Player 1', isAi: false },
    { name: 'Pop-Bot 3000', isAi: true },
  ];

  const players: PlayerState[] = defaultPlayers.map((p, idx) => ({
    id: `p-${idx + 1}`,
    name: p.name,
    isAi: p.isAi,
    score: 0,
    hasShield: false,
    isEliminated: false,
  }));

  return {
    gridSize,
    tiles,
    players,
    currentTurnIndex: 0,
    status: 'playing',
    round: 1,
    maxRounds,
    popTileCount: popCount,
    popsTriggered: 0,
    lastActionMessage: 'Round 1 begins! Tap a tile to test your luck.',
    lastRevealedTile: null,
    tensionPercentage: calculateTension(tiles, popCount),
  };
}

/**
 * Resolve a player selecting a tile on their turn.
 */
export function selectTile(state: DontPopItState, tileId: number): DontPopItState {
  if (state.status !== 'playing') {
    return state;
  }

  const tile = state.tiles.find((t) => t.id === tileId);
  if (!tile || tile.revealed) {
    return state;
  }

  const activePlayer = state.players[state.currentTurnIndex];
  if (!activePlayer || activePlayer.isEliminated) {
    return state;
  }

  // Clone state
  const updatedTiles = state.tiles.map((t) =>
    t.id === tileId ? { ...t, revealed: true } : { ...t },
  );
  const updatedPlayers = state.players.map((p) => ({ ...p }));
  const player = updatedPlayers[state.currentTurnIndex];

  let nextTurnIndex = state.currentTurnIndex;
  let status: GameStatus = state.status;
  let message: string;
  let shieldSaved = false;
  let popsTriggered = state.popsTriggered;

  switch (tile.type) {
    case 'pop': {
      popsTriggered += 1;
      if (player.hasShield) {
        player.hasShield = false;
        shieldSaved = true;
        message = `💥 POP TRIGGERED! ${player.name}'s shield shattered to absorb the explosion!`;
        // Advance turn after pop
        nextTurnIndex = getNextActivePlayerIndex(updatedPlayers, state.currentTurnIndex);
      } else {
        player.isEliminated = true;
        message = `💥 POP! ${player.name} popped the balloon and is knocked out of the round!`;
        const activeRemaining = updatedPlayers.filter((p) => !p.isEliminated);
        if (activeRemaining.length <= 1) {
          // Award survival bonus to remaining active players
          activeRemaining.forEach((p) => {
            p.score += 50;
          });
          status = 'round_over';
          message +=
            activeRemaining.length === 1
              ? ` ${activeRemaining[0].name} survives and wins the round (+50 bonus points)!`
              : ' Round ended!';
        } else {
          nextTurnIndex = getNextActivePlayerIndex(updatedPlayers, state.currentTurnIndex);
        }
      }
      break;
    }

    case 'bonus': {
      player.score += 25;
      message = `✨ ${player.name} discovered a Bonus Crystal (+25 points)!`;
      nextTurnIndex = getNextActivePlayerIndex(updatedPlayers, state.currentTurnIndex);
      break;
    }

    case 'double': {
      player.score = player.score > 0 ? player.score * 2 : 20;
      message = `⚡ ${player.name} triggered 2X Multiplier! Current score doubled!`;
      nextTurnIndex = getNextActivePlayerIndex(updatedPlayers, state.currentTurnIndex);
      break;
    }

    case 'shield': {
      player.hasShield = true;
      player.score += 15;
      message = `🛡️ ${player.name} equipped a Kinetic Shield (+15 pts)! Immune to the next Pop!`;
      nextTurnIndex = getNextActivePlayerIndex(updatedPlayers, state.currentTurnIndex);
      break;
    }

    case 'extra_turn': {
      player.score += 10;
      message = `🎯 ${player.name} got an Extra Turn (+10 pts)! Choose again!`;
      // Turn does not advance!
      break;
    }

    case 'scout': {
      player.score += 15;
      // Reveal scout hints on adjacent tiles
      const adjTiles = getAdjacentTiles(state.gridSize, tile.row, tile.col);
      adjTiles.forEach((id) => {
        const adj = updatedTiles.find((t) => t.id === id);
        if (adj && !adj.revealed) {
          adj.hintScouted = true;
        }
      });
      message = `📡 ${player.name} deployed Radar! Adjacent tiles scouted (+15 pts).`;
      nextTurnIndex = getNextActivePlayerIndex(updatedPlayers, state.currentTurnIndex);
      break;
    }

    case 'safe':
    default: {
      player.score += 10;
      message = `✅ Safe tile! ${player.name} earns +10 points.`;
      nextTurnIndex = getNextActivePlayerIndex(updatedPlayers, state.currentTurnIndex);
      break;
    }
  }

  // Check if all safe tiles are revealed (round cleared)
  const remainingUnrevealed = updatedTiles.filter((t) => !t.revealed && t.type !== 'pop');
  if (remainingUnrevealed.length === 0 && status === 'playing') {
    status = 'round_over';
    message = '🎉 Board cleared without triggering remaining pops! Round complete!';
  }

  const tension = calculateTension(updatedTiles, state.popTileCount);

  return {
    ...state,
    tiles: updatedTiles,
    players: updatedPlayers,
    currentTurnIndex: nextTurnIndex,
    status,
    popsTriggered,
    lastActionMessage: message,
    lastRevealedTile: {
      tileId,
      type: tile.type,
      playerName: activePlayer.name,
      shieldSaved,
    },
    tensionPercentage: tension,
  };
}

/**
 * Move to next round or end game if max rounds reached.
 */
export function startNextRound(state: DontPopItState): DontPopItState {
  if (state.round >= state.maxRounds) {
    return {
      ...state,
      status: 'game_over',
      lastActionMessage: 'Game over! Check final scores and see who won!',
    };
  }

  const nextRound = state.round + 1;
  const tiles = generateBoardTiles(state.gridSize, state.popTileCount);

  // Reset elimination and shields for the new round
  const players = state.players.map((p) => ({
    ...p,
    hasShield: false,
    isEliminated: false,
  }));

  return {
    ...state,
    tiles,
    players,
    round: nextRound,
    currentTurnIndex: (nextRound - 1) % players.length,
    status: 'playing',
    popsTriggered: 0,
    lastRevealedTile: null,
    lastActionMessage: `Round ${nextRound} of ${state.maxRounds} begins!`,
    tensionPercentage: calculateTension(tiles, state.popTileCount),
  };
}

/**
 * AI Decision Maker for Solo Play:
 * Evaluates best unrevealed tile, avoiding known scouted hazards when possible.
 */
export function getAiTileSelection(state: DontPopItState): number {
  const unrevealed = state.tiles.filter((t) => !t.revealed);
  if (unrevealed.length === 0) return 0;

  // Prefer scouted tiles that are NOT pop
  const scoutedSafe = unrevealed.filter((t) => t.hintScouted && t.type !== 'pop');
  if (scoutedSafe.length > 0) {
    return scoutedSafe[Math.floor(Math.random() * scoutedSafe.length)].id;
  }

  // Otherwise pick any unrevealed tile that is not scouted as pop
  const plausible = unrevealed.filter((t) => !(t.hintScouted && t.type === 'pop'));
  const pool = plausible.length > 0 ? plausible : unrevealed;
  return pool[Math.floor(Math.random() * pool.length)].id;
}

function getNextActivePlayerIndex(players: PlayerState[], currentIndex: number): number {
  const count = players.length;
  for (let i = 1; i <= count; i++) {
    const nextIdx = (currentIndex + i) % count;
    if (!players[nextIdx].isEliminated) {
      return nextIdx;
    }
  }
  return currentIndex;
}

function getAdjacentTiles(gridSize: number, row: number, col: number): number[] {
  const neighbors: number[] = [];
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  for (const [dr, dc] of deltas) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
      neighbors.push(nr * gridSize + nc);
    }
  }

  return neighbors;
}
