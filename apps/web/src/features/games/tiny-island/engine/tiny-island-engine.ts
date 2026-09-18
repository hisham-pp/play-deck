import {
  CENTER_COORD,
  DEFAULT_GRID_SIZE,
  calculateNextShrinkWave,
  generateIslandGrid,
  getAdjacentCoords,
  getDistanceFromCenter,
  getSpawnCoordinates,
  isAdjacent,
  isInBounds,
  isTileWalkable,
} from './tiny-island-grid';
import {
  CRAFTING_RECIPES,
  ISLAND_AVATARS,
  ISLAND_COLORS,
  type GameAction,
  type GameEventLog,
  type IslandGameState,
  type IslandPhaseMood,
  type IslandPlayer,
  type IslandTile,
  type ResourceType,
} from './tiny-island-types';

export interface PlayerSetupConfig {
  id: string;
  displayName: string;
  avatar?: string;
  color?: string;
  isBot?: boolean;
}

/** Creates a fresh game state for Tiny Island with 2–6 players. */
export function createInitialGameState(
  playerConfigs: PlayerSetupConfig[],
  gridSize = DEFAULT_GRID_SIZE,
): IslandGameState {
  const tiles = generateIslandGrid(gridSize);
  const count = Math.max(2, Math.min(6, playerConfigs.length));
  const spawnCoords = getSpawnCoordinates(count, gridSize);

  const players: IslandPlayer[] = playerConfigs.slice(0, count).map((cfg, idx) => ({
    id: cfg.id || `player-${idx}`,
    seatIndex: idx,
    displayName: cfg.displayName || `Castaway ${idx + 1}`,
    avatar: cfg.avatar || ISLAND_AVATARS[idx % ISLAND_AVATARS.length],
    color: cfg.color || ISLAND_COLORS[idx % ISLAND_COLORS.length],
    x: spawnCoords[idx].x,
    y: spawnCoords[idx].y,
    isBot: Boolean(cfg.isBot),
    isAlive: true,
    eliminatedCause: null,
    inventory: { wood: 1, stone: 0, food: 1 },
    tools: { hasRaft: false, hasSpear: false },
    ap: 2,
    stats: {
      resourcesGathered: 0,
      structuresBuilt: 0,
      playersPushed: 0,
      eliminations: 0,
    },
  }));

  const turnOrder = players.map((p) => p.seatIndex);

  const initialLogs: GameEventLog[] = [
    {
      id: 'init-1',
      round: 1,
      text: '🌴 Welcome to Tiny Island! Gather supplies, build bridges, and survive the rising ocean.',
      type: 'system',
      timestamp: Date.now(),
    },
    {
      id: 'init-2',
      round: 1,
      seatIndex: 0,
      text: `${players[0].displayName}'s turn begins! (2 Action Points)`,
      type: 'action',
      timestamp: Date.now(),
    },
  ];

  return {
    gridSize,
    tiles,
    players,
    currentTurnSeatIndex: turnOrder[0],
    turnOrder,
    turnOrderIndex: 0,
    round: 1,
    phase: 'playing',
    mood: 'calm',
    winnerSeatIndex: null,
    eventLogs: initialLogs,
    maxAp: 2,
  };
}

/** Executes a player action and returns the new game state. */
export function executeAction(state: IslandGameState, action: GameAction): IslandGameState {
  if (state.phase !== 'playing') return state;

  const player = state.players.find((p) => p.seatIndex === action.seatIndex);
  if (!player || !player.isAlive || player.seatIndex !== state.currentTurnSeatIndex) {
    return state;
  }

  // Deep clone state
  const nextTiles = state.tiles.map((row) => row.map((t) => ({ ...t })));
  const nextPlayers = state.players.map((p) => ({
    ...p,
    inventory: { ...p.inventory },
    tools: { ...p.tools },
    stats: { ...p.stats },
  }));
  const activePlayer = nextPlayers.find((p) => p.seatIndex === action.seatIndex)!;
  const newLogs: GameEventLog[] = [...state.eventLogs];

  const pushLog = (
    text: string,
    type: 'action' | 'shrink' | 'elimination' | 'system' = 'action',
  ) => {
    newLogs.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      round: state.round,
      seatIndex: activePlayer.seatIndex,
      text,
      type,
      timestamp: Date.now(),
    });
    if (newLogs.length > 50) newLogs.pop();
  };

  let actionSuccess = false;

  switch (action.type) {
    case 'MOVE': {
      if (!action.targetCoord) break;
      const { x, y } = action.targetCoord;
      if (!isInBounds(x, y, state.gridSize)) break;
      if (!isAdjacent({ x: activePlayer.x, y: activePlayer.y }, { x, y })) break;

      const targetTile = nextTiles[y][x];
      if (!isTileWalkable(targetTile)) break;

      // Cannot move onto a tile occupied by another alive player
      const isOccupied = nextPlayers.some(
        (p) => p.isAlive && p.seatIndex !== activePlayer.seatIndex && p.x === x && p.y === y,
      );
      if (isOccupied) break;

      activePlayer.x = x;
      activePlayer.y = y;
      activePlayer.ap = Math.max(0, activePlayer.ap - 1);
      actionSuccess = true;

      const tileDesc = targetTile.type === 'bridge' ? 'across a wooden bridge' : targetTile.type;
      pushLog(`${activePlayer.displayName} moved onto the ${tileDesc}.`);
      break;
    }

    case 'GATHER': {
      const currentTile = nextTiles[activePlayer.y][activePlayer.x];
      if (currentTile.resource && currentTile.resourceCount > 0) {
        const res = currentTile.resource;
        activePlayer.inventory[res] = (activePlayer.inventory[res] || 0) + 1;
        currentTile.resourceCount -= 1;
        if (currentTile.resourceCount <= 0) {
          currentTile.resource = null;
        }
        activePlayer.stats.resourcesGathered += 1;
        activePlayer.ap = Math.max(0, activePlayer.ap - 1);
        actionSuccess = true;

        const icon = res === 'wood' ? '🪵 wood' : res === 'stone' ? '🪨 stone' : '🥥 food';
        pushLog(`${activePlayer.displayName} harvested 1 ${icon}.`);
      } else {
        // Scavenge beach debris: 50% chance of driftwood or food
        const scavengeRoll = (activePlayer.x + activePlayer.y + state.round) % 2;
        const res: ResourceType = scavengeRoll === 0 ? 'wood' : 'food';
        activePlayer.inventory[res] += 1;
        activePlayer.stats.resourcesGathered += 1;
        activePlayer.ap = Math.max(0, activePlayer.ap - 1);
        actionSuccess = true;

        pushLog(
          `${activePlayer.displayName} scavenged driftwood beach debris (+1 ${res === 'wood' ? '🪵 wood' : '🥥 food'}).`,
        );
      }
      break;
    }

    case 'BUILD_BRIDGE': {
      if (!action.targetCoord) break;
      const { x, y } = action.targetCoord;
      if (!isInBounds(x, y, state.gridSize)) break;
      if (!isAdjacent({ x: activePlayer.x, y: activePlayer.y }, { x, y })) break;

      const targetTile = nextTiles[y][x];
      // Can only build bridges over open water or submerged tiles
      if (targetTile.type !== 'water' && targetTile.sinkingState !== 'submerged') break;
      if (activePlayer.inventory.wood < CRAFTING_RECIPES.bridge.wood) break;

      activePlayer.inventory.wood -= CRAFTING_RECIPES.bridge.wood;
      targetTile.type = 'bridge';
      targetTile.sinkingState = 'dry';
      activePlayer.stats.structuresBuilt += 1;
      activePlayer.ap = Math.max(0, activePlayer.ap - 1);
      actionSuccess = true;

      pushLog(`${activePlayer.displayName} built a wooden bridge over the water!`);
      break;
    }

    case 'BUILD_BARRIER': {
      if (!action.targetCoord) break;
      const { x, y } = action.targetCoord;
      if (!isInBounds(x, y, state.gridSize)) break;
      if (
        !isAdjacent({ x: activePlayer.x, y: activePlayer.y }, { x, y }) &&
        !(activePlayer.x === x && activePlayer.y === y)
      ) {
        break;
      }

      const targetTile = nextTiles[y][x];
      if (targetTile.type === 'water' || targetTile.sinkingState === 'submerged') break;
      if (targetTile.type === 'barrier' || targetTile.type === 'bridge') break;
      if (activePlayer.inventory.stone < CRAFTING_RECIPES.barrier.stone) break;

      activePlayer.inventory.stone -= CRAFTING_RECIPES.barrier.stone;
      targetTile.type = 'barrier';
      targetTile.barrierHp = 2;
      activePlayer.stats.structuresBuilt += 1;
      activePlayer.ap = Math.max(0, activePlayer.ap - 1);
      actionSuccess = true;

      pushLog(`${activePlayer.displayName} erected a stone barrier!`);
      break;
    }

    case 'CRAFT_RAFT': {
      if (
        activePlayer.inventory.wood < CRAFTING_RECIPES.raft.wood ||
        activePlayer.inventory.food < CRAFTING_RECIPES.raft.food
      ) {
        break;
      }
      activePlayer.inventory.wood -= CRAFTING_RECIPES.raft.wood;
      activePlayer.inventory.food -= CRAFTING_RECIPES.raft.food;
      activePlayer.tools.hasRaft = true;
      activePlayer.ap = Math.max(0, activePlayer.ap - 1);
      actionSuccess = true;

      pushLog(`${activePlayer.displayName} crafted an emergency escape raft ⛵!`);
      break;
    }

    case 'CRAFT_SPEAR': {
      if (
        activePlayer.inventory.wood < CRAFTING_RECIPES.spear.wood ||
        activePlayer.inventory.stone < CRAFTING_RECIPES.spear.stone
      ) {
        break;
      }
      activePlayer.inventory.wood -= CRAFTING_RECIPES.spear.wood;
      activePlayer.inventory.stone -= CRAFTING_RECIPES.spear.stone;
      activePlayer.tools.hasSpear = true;
      activePlayer.ap = Math.max(0, activePlayer.ap - 1);
      actionSuccess = true;

      pushLog(`${activePlayer.displayName} sharpened a long bamboo spear 🗡️!`);
      break;
    }

    case 'PUSH': {
      if (!action.targetPlayerId) break;
      const target = nextPlayers.find((p) => p.id === action.targetPlayerId && p.isAlive);
      if (!target) break;

      const maxPushDist = activePlayer.tools.hasSpear ? 2 : 1;
      const dist = Math.abs(target.x - activePlayer.x) + Math.abs(target.y - activePlayer.y);
      if (dist > maxPushDist || dist === 0) break;

      // Push direction
      const dx = Math.sign(target.x - activePlayer.x);
      const dy = Math.sign(target.y - activePlayer.y);
      const destX = target.x + dx;
      const destY = target.y + dy;

      activePlayer.ap = Math.max(0, activePlayer.ap - 1);
      activePlayer.stats.playersPushed += 1;
      actionSuccess = true;

      if (!isInBounds(destX, destY, state.gridSize)) {
        // Pushed off the edge of the world into open ocean!
        eliminateOrSaveWithRaft(target, activePlayer, pushLog);
      } else {
        const destTile = nextTiles[destY][destX];
        if (destTile.type === 'barrier') {
          destTile.barrierHp = (destTile.barrierHp || 2) - 1;
          if (destTile.barrierHp <= 0) {
            destTile.type = destTile.baseType;
            pushLog(`💥 ${target.displayName} slammed into the stone barrier, shattering it!`);
          } else {
            pushLog(`🛡️ ${target.displayName} was shoved into a barrier, which absorbed the blow.`);
          }
        } else if (destTile.sinkingState === 'submerged' || destTile.type === 'water') {
          // Pushed into water tile
          eliminateOrSaveWithRaft(target, activePlayer, pushLog);
        } else {
          // Check if destination tile is occupied
          const isDestOccupied = nextPlayers.some(
            (p) => p.isAlive && p.seatIndex !== target.seatIndex && p.x === destX && p.y === destY,
          );
          if (!isDestOccupied) {
            target.x = destX;
            target.y = destY;
            pushLog(`💨 ${activePlayer.displayName} shoved ${target.displayName}!`);
          } else {
            pushLog(
              `💨 ${activePlayer.displayName} shoved ${target.displayName} against another survivor!`,
            );
          }
        }
      }
      break;
    }

    case 'STEAL': {
      if (!action.targetPlayerId) break;
      const target = nextPlayers.find((p) => p.id === action.targetPlayerId && p.isAlive);
      if (!target) break;
      if (!isAdjacent({ x: activePlayer.x, y: activePlayer.y }, { x: target.x, y: target.y })) {
        break;
      }

      // Pick available resource to steal
      const availableRes: ResourceType[] = (['wood', 'stone', 'food'] as ResourceType[]).filter(
        (r) => target.inventory[r] > 0,
      );

      if (availableRes.length > 0) {
        const stolenRes =
          action.targetResource && availableRes.includes(action.targetResource)
            ? action.targetResource
            : availableRes[Math.floor(Math.random() * availableRes.length)];

        target.inventory[stolenRes] -= 1;
        activePlayer.inventory[stolenRes] += 1;
        activePlayer.ap = Math.max(0, activePlayer.ap - 1);
        actionSuccess = true;

        const icon =
          stolenRes === 'wood' ? '🪵 wood' : stolenRes === 'stone' ? '🪨 stone' : '🥥 food';
        pushLog(
          `🦹 ${activePlayer.displayName} pickpocketed 1 ${icon} from ${target.displayName}!`,
        );
      } else {
        activePlayer.ap = Math.max(0, activePlayer.ap - 1);
        actionSuccess = true;
        pushLog(
          `${activePlayer.displayName} tried to pickpocket ${target.displayName}, but their pockets were empty!`,
        );
      }
      break;
    }

    case 'PASS': {
      activePlayer.ap = 0;
      actionSuccess = true;
      pushLog(`${activePlayer.displayName} passed the remainder of their turn.`);
      break;
    }
  }

  if (!actionSuccess) {
    return state;
  }

  // Check victory condition after possible elimination
  const livingPlayers = nextPlayers.filter((p) => p.isAlive);
  if (livingPlayers.length <= 1) {
    return resolveGameOver(state, nextTiles, nextPlayers, newLogs);
  }

  // Turn management: if active player has 0 AP, advance turn
  if (activePlayer.ap <= 0) {
    return advanceTurnOrRound(state, nextTiles, nextPlayers, newLogs);
  }

  return {
    ...state,
    tiles: nextTiles,
    players: nextPlayers,
    eventLogs: newLogs,
  };
}

/** Handles pushing or dropping a player into water, checking for raft salvation. */
function eliminateOrSaveWithRaft(
  target: IslandPlayer,
  attacker: IslandPlayer | null,
  pushLog: (text: string, type?: 'action' | 'shrink' | 'elimination' | 'system') => void,
) {
  if (target.tools.hasRaft) {
    target.tools.hasRaft = false;
    pushLog(
      `⛵ ${target.displayName} fell into the crashing waves, but deployed their emergency raft and clambered back to safety!`,
    );
  } else {
    target.isAlive = false;
    target.eliminatedCause = attacker ? 'pushed' : 'drowned';
    if (attacker) attacker.stats.eliminations += 1;
    pushLog(
      `🌊 SPLASH! ${target.displayName} was lost to the ocean depths${attacker ? ` by ${attacker.displayName}` : ''}!`,
      'elimination',
    );
  }
}

/** Advances to the next player's turn, or advances the round if all players have acted. */
function advanceTurnOrRound(
  state: IslandGameState,
  tiles: IslandTile[][],
  players: IslandPlayer[],
  logs: GameEventLog[],
): IslandGameState {
  const livingPlayers = players.filter((p) => p.isAlive);
  if (livingPlayers.length <= 1) {
    return resolveGameOver(state, tiles, players, logs);
  }

  const currentOrderIndex = state.turnOrderIndex;
  const nextOrderIndex = currentOrderIndex + 1;

  // Filter turn order for currently alive players
  const aliveSeatIndices = state.turnOrder.filter((seat) =>
    players.some((p) => p.seatIndex === seat && p.isAlive),
  );

  if (nextOrderIndex < aliveSeatIndices.length) {
    // Next player in current round
    const nextSeat = aliveSeatIndices[nextOrderIndex];
    const nextPlayer = players.find((p) => p.seatIndex === nextSeat)!;
    nextPlayer.ap = state.maxAp;

    logs.unshift({
      id: `${Date.now()}-turn-${nextSeat}`,
      round: state.round,
      seatIndex: nextSeat,
      text: `${nextPlayer.displayName}'s turn begins! (2 AP)`,
      type: 'action',
      timestamp: Date.now(),
    });

    return {
      ...state,
      tiles,
      players,
      currentTurnSeatIndex: nextSeat,
      turnOrderIndex: nextOrderIndex,
      eventLogs: logs,
    };
  }

  // All alive players in round have finished -> ADVANCE ROUND (Shrink the island!)
  return advanceRound({
    ...state,
    tiles,
    players,
    eventLogs: logs,
  });
}

/** Executes island shrinking wave, marks newly sinking tiles, and resets round AP. */
export function advanceRound(state: IslandGameState): IslandGameState {
  const nextTiles = state.tiles.map((row) => row.map((t) => ({ ...t })));
  const nextPlayers = state.players.map((p) => ({
    ...p,
    inventory: { ...p.inventory },
    tools: { ...p.tools },
    stats: { ...p.stats },
  }));
  const newLogs = [...state.eventLogs];

  const pushLog = (
    text: string,
    type: 'action' | 'shrink' | 'elimination' | 'system' = 'shrink',
  ) => {
    newLogs.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      round: state.round + 1,
      text,
      type,
      timestamp: Date.now(),
    });
    if (newLogs.length > 50) newLogs.pop();
  };

  // Calculate shrink wave
  const { newlySubmerged, newlyWarning } = calculateNextShrinkWave(
    nextTiles,
    state.round,
    state.gridSize,
  );

  // Submerge previously warning tiles
  for (const coord of newlySubmerged) {
    const tile = nextTiles[coord.y][coord.x];
    tile.sinkingState = 'submerged';
    tile.type = 'water';
    tile.resource = null;
    tile.resourceCount = 0;

    // Check if any player is on this tile
    const standingPlayer = nextPlayers.find((p) => p.isAlive && p.x === coord.x && p.y === coord.y);
    if (standingPlayer) {
      eliminateOrSaveWithRaft(standingPlayer, null, pushLog);
    }
  }

  if (newlySubmerged.length > 0) {
    pushLog(`🌊 High tide! ${newlySubmerged.length} perimeter tiles sank into the sea!`);
  }

  // Mark newly warning tiles
  for (const coord of newlyWarning) {
    const tile = nextTiles[coord.y][coord.x];
    if (tile.sinkingState === 'dry') {
      tile.sinkingState = 'warning';
    }
  }

  if (newlyWarning.length > 0) {
    pushLog(
      `⚠️ The ground shakes! ${newlyWarning.length} outer tiles are destabilizing and will sink next round!`,
    );
  }

  const nextRound = state.round + 1;
  const mood: IslandPhaseMood =
    nextRound >= 6
      ? 'final_stand'
      : nextRound >= 4
        ? 'storm'
        : nextRound >= 2
          ? 'rising_tide'
          : 'calm';

  // Check victory
  const livingPlayers = nextPlayers.filter((p) => p.isAlive);
  if (livingPlayers.length <= 1) {
    return resolveGameOver({ ...state, round: nextRound, mood }, nextTiles, nextPlayers, newLogs);
  }

  // Reset AP and start from first alive player
  const aliveSeatIndices = livingPlayers.map((p) => p.seatIndex);
  for (const p of nextPlayers) {
    if (p.isAlive) p.ap = state.maxAp;
  }

  const firstSeat = aliveSeatIndices[0];
  const firstPlayer = nextPlayers.find((p) => p.seatIndex === firstSeat)!;

  pushLog(
    `🔔 Round ${nextRound} begins (${mood.replace('_', ' ').toUpperCase()}). ${firstPlayer.displayName}'s turn!`,
    'system',
  );

  return {
    ...state,
    round: nextRound,
    mood,
    tiles: nextTiles,
    players: nextPlayers,
    turnOrder: aliveSeatIndices,
    turnOrderIndex: 0,
    currentTurnSeatIndex: firstSeat,
    eventLogs: newLogs,
    phase: 'playing',
  };
}

/** Resolves game over and declares the winner or draw. */
function resolveGameOver(
  state: IslandGameState,
  tiles: IslandTile[][],
  players: IslandPlayer[],
  logs: GameEventLog[],
): IslandGameState {
  const winner = players.find((p) => p.isAlive);
  const winnerSeatIndex = winner ? winner.seatIndex : null;

  logs.unshift({
    id: `${Date.now()}-winner`,
    round: state.round,
    seatIndex: winnerSeatIndex ?? undefined,
    text: winner
      ? `🏆 VICTORY! ${winner.displayName} survived the sinking island and claimed the trophy!`
      : '💀 The entire island was swallowed by the ocean! No survivors remained.',
    type: 'system',
    timestamp: Date.now(),
  });

  return {
    ...state,
    tiles,
    players,
    phase: 'game_over',
    winnerSeatIndex,
    eventLogs: logs,
  };
}

/** Computes an intelligent heuristic move for an AI bot player. */
export function computeBotMove(state: IslandGameState, botSeatIndex: number): GameAction {
  const bot = state.players.find((p) => p.seatIndex === botSeatIndex);
  if (!bot || !bot.isAlive || bot.ap <= 0) {
    return { type: 'PASS', seatIndex: botSeatIndex };
  }

  const currentTile = state.tiles[bot.y][bot.x];
  const neighbors = getAdjacentCoords({ x: bot.x, y: bot.y }, state.gridSize);

  // 1. DANGER EVASION: If bot is on a warning or submerged tile, MOVE toward center/dry tile!
  if (currentTile.sinkingState === 'warning' || currentTile.sinkingState === 'submerged') {
    const safeNeighbors = neighbors
      .map((c) => ({ coord: c, tile: state.tiles[c.y][c.x] }))
      .filter((n) => isTileWalkable(n.tile) && n.tile.sinkingState === 'dry')
      .filter(
        (n) => !state.players.some((p) => p.isAlive && p.x === n.coord.x && p.y === n.coord.y),
      );

    if (safeNeighbors.length > 0) {
      // Pick the neighbor closest to center
      safeNeighbors.sort(
        (a, b) =>
          getDistanceFromCenter(a.coord.x, a.coord.y) - getDistanceFromCenter(b.coord.x, b.coord.y),
      );
      return { type: 'MOVE', seatIndex: botSeatIndex, targetCoord: safeNeighbors[0].coord };
    }
  }

  // 2. COMBAT: Check if an adjacent opponent can be pushed into water or barrier
  for (const n of neighbors) {
    const opponent = state.players.find(
      (p) => p.isAlive && p.seatIndex !== botSeatIndex && p.x === n.x && p.y === n.y,
    );
    if (opponent) {
      const dx = opponent.x - bot.x;
      const dy = opponent.y - bot.y;
      const pushDestX = opponent.x + dx;
      const pushDestY = opponent.y + dy;

      const willDrown =
        !isInBounds(pushDestX, pushDestY, state.gridSize) ||
        state.tiles[pushDestY][pushDestX].sinkingState === 'submerged' ||
        state.tiles[pushDestY][pushDestX].type === 'water';

      if (willDrown) {
        return { type: 'PUSH', seatIndex: botSeatIndex, targetPlayerId: opponent.id };
      }
    }
  }

  // 3. SURVIVAL CRAFTING: Craft raft if resources allow and doesn't have one
  if (
    !bot.tools.hasRaft &&
    bot.inventory.wood >= CRAFTING_RECIPES.raft.wood &&
    bot.inventory.food >= CRAFTING_RECIPES.raft.food
  ) {
    return { type: 'CRAFT_RAFT', seatIndex: botSeatIndex };
  }

  // 4. RESOURCE GATHERING: If current tile has resources, gather!
  if (currentTile.resource && currentTile.resourceCount > 0) {
    return { type: 'GATHER', seatIndex: botSeatIndex };
  }

  // 5. BRIDGE BUILDING: If blocked by water toward center, build a bridge
  if (bot.inventory.wood >= CRAFTING_RECIPES.bridge.wood) {
    const waterNeighbors = neighbors
      .map((c) => ({ coord: c, tile: state.tiles[c.y][c.x] }))
      .filter((n) => n.tile.type === 'water' || n.tile.sinkingState === 'submerged');

    if (waterNeighbors.length > 0) {
      waterNeighbors.sort(
        (a, b) =>
          getDistanceFromCenter(a.coord.x, a.coord.y) - getDistanceFromCenter(b.coord.x, b.coord.y),
      );
      return {
        type: 'BUILD_BRIDGE',
        seatIndex: botSeatIndex,
        targetCoord: waterNeighbors[0].coord,
      };
    }
  }

  // 6. STEAL: If adjacent to opponent with resources
  for (const n of neighbors) {
    const opponent = state.players.find(
      (p) => p.isAlive && p.seatIndex !== botSeatIndex && p.x === n.x && p.y === n.y,
    );
    if (opponent) {
      const oppResCount =
        opponent.inventory.wood + opponent.inventory.stone + opponent.inventory.food;
      if (oppResCount > 0) {
        return { type: 'STEAL', seatIndex: botSeatIndex, targetPlayerId: opponent.id };
      }
    }
  }

  // 7. EXPLORE / MOVE: Walk toward tile with resources or toward center
  const walkableNeighbors = neighbors
    .map((c) => ({ coord: c, tile: state.tiles[c.y][c.x] }))
    .filter((n) => isTileWalkable(n.tile))
    .filter((n) => !state.players.some((p) => p.isAlive && p.x === n.coord.x && p.y === n.coord.y));

  if (walkableNeighbors.length > 0) {
    // Prefer tile with unharvested resources
    const resourceNeighbor = walkableNeighbors.find(
      (n) => n.tile.resource && n.tile.resourceCount > 0,
    );
    if (resourceNeighbor) {
      return { type: 'MOVE', seatIndex: botSeatIndex, targetCoord: resourceNeighbor.coord };
    }

    // Otherwise move closer to center (4, 4)
    walkableNeighbors.sort(
      (a, b) =>
        getDistanceFromCenter(a.coord.x, a.coord.y, CENTER_COORD) -
        getDistanceFromCenter(b.coord.x, b.coord.y, CENTER_COORD),
    );
    return { type: 'MOVE', seatIndex: botSeatIndex, targetCoord: walkableNeighbors[0].coord };
  }

  // Default: pass
  return { type: 'PASS', seatIndex: botSeatIndex };
}
