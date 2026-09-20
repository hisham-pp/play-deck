import type {
  LootDashArenaState,
  DashPlayer,
  LootItem,
  Trap,
  ObstacleBlock,
  FloatingScore,
  DashInput,
  LootDashConfig,
  LootDashMatchStats,
  PowerUpType,
  LootRarity,
  Vector2D,
} from '../types/loot-dash.types';
import { computeLootBotInput } from './loot-bot';
import {
  PLAYER_RADIUS,
  vectorDistance,
  circleIntersectsAABB,
  updatePlayerPhysics,
  resolvePlayerBumps,
  updateLootMagnets,
  clamp,
} from './loot-physics';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 640;

const PLAYER_COLORS = [
  '#06b6d4', // Cyan (Human P1)
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#10b981', // Emerald
  '#a855f7', // Purple
  '#ef4444', // Red
];

export interface LootEngineEvent {
  type:
    | 'coin_pickup'
    | 'gem_pickup'
    | 'chest_pickup'
    | 'powerup_activate'
    | 'trap_trigger'
    | 'steal'
    | 'bump'
    | 'jackpot';
  position?: Vector2D;
  value?: number;
  powerUp?: PowerUpType;
}

export function generateDefaultObstacles(): ObstacleBlock[] {
  return [
    // Top-left block
    { id: 'obs-tl', x: 200, y: 140, width: 80, height: 40, type: 'wall' },
    // Top-right block
    { id: 'obs-tr', x: 680, y: 140, width: 80, height: 40, type: 'wall' },
    // Bottom-left block
    { id: 'obs-bl', x: 200, y: 460, width: 80, height: 40, type: 'wall' },
    // Bottom-right block
    { id: 'obs-br', x: 680, y: 460, width: 80, height: 40, type: 'wall' },

    // Center divider pillars
    { id: 'obs-c1', x: 440, y: 200, width: 80, height: 30, type: 'wall' },
    { id: 'obs-c2', x: 440, y: 410, width: 80, height: 30, type: 'wall' },

    // Kinetic Bumpers
    { id: 'bump-1', x: 300, y: 300, width: 40, height: 40, type: 'bumper' },
    { id: 'bump-2', x: 620, y: 300, width: 40, height: 40, type: 'bumper' },
  ];
}

export function generateDefaultTraps(): Trap[] {
  return [
    // 4 Cyclic Spike Traps
    {
      id: 'trap-spike-1',
      type: 'spikes',
      position: { x: 320, y: 160 },
      width: 48,
      height: 48,
      isActive: false,
      cycleTimer: 0,
    },
    {
      id: 'trap-spike-2',
      type: 'spikes',
      position: { x: 592, y: 160 },
      width: 48,
      height: 48,
      isActive: false,
      cycleTimer: 1.5,
    },
    {
      id: 'trap-spike-3',
      type: 'spikes',
      position: { x: 320, y: 432 },
      width: 48,
      height: 48,
      isActive: false,
      cycleTimer: 3.0,
    },
    {
      id: 'trap-spike-4',
      type: 'spikes',
      position: { x: 592, y: 432 },
      width: 48,
      height: 48,
      isActive: false,
      cycleTimer: 4.5,
    },

    // 2 Slime Slowdown Pools
    {
      id: 'trap-slime-1',
      type: 'slime',
      position: { x: 120, y: 280 },
      width: 64,
      height: 80,
      isActive: true,
      cycleTimer: 0,
    },
    {
      id: 'trap-slime-2',
      type: 'slime',
      position: { x: 776, y: 280 },
      width: 64,
      height: 80,
      isActive: true,
      cycleTimer: 0,
    },
  ];
}

export const ARENA_SPAWNS: Vector2D[] = [
  { x: 100, y: 100 },
  { x: 860, y: 540 },
  { x: 860, y: 100 },
  { x: 100, y: 540 },
  { x: 480, y: 100 },
  { x: 480, y: 540 },
];

function createRandomLoot(obstacles: ObstacleBlock[], traps: Trap[]): LootItem | null {
  const rarities: { type: LootRarity; value: number; radius: number; weight: number }[] = [
    { type: 'bronze_coin', value: 5, radius: 9, weight: 40 },
    { type: 'silver_coin', value: 10, radius: 10, weight: 25 },
    { type: 'gold_bar', value: 25, radius: 12, weight: 15 },
    { type: 'gem', value: 50, radius: 13, weight: 12 },
    { type: 'chest', value: 75, radius: 15, weight: 8 },
  ];

  const totalWeight = rarities.reduce((sum, r) => sum + r.weight, 0);
  let rand = Math.random() * totalWeight;
  let chosen = rarities[0];

  for (const r of rarities) {
    if (rand < r.weight) {
      chosen = r;
      break;
    }
    rand -= r.weight;
  }

  // Pick power-up reward if chest
  let powerUpReward: PowerUpType | undefined;
  if (chosen.type === 'chest') {
    const powerUps: PowerUpType[] = ['speed', 'magnet', 'shield', 'thief', 'decoy_drop'];
    powerUpReward = powerUps[Math.floor(Math.random() * powerUps.length)];
  }

  // Find clear position
  for (let attempt = 0; attempt < 15; attempt++) {
    const rx = 60 + Math.random() * (ARENA_WIDTH - 120);
    const ry = 60 + Math.random() * (ARENA_HEIGHT - 120);

    let collides = false;
    for (const obs of obstacles) {
      if (
        circleIntersectsAABB(rx, ry, chosen.radius + 6, obs.x, obs.y, obs.width, obs.height)
          .collides
      ) {
        collides = true;
        break;
      }
    }
    for (const trap of traps) {
      if (
        circleIntersectsAABB(
          rx,
          ry,
          chosen.radius + 6,
          trap.position.x,
          trap.position.y,
          trap.width,
          trap.height,
        ).collides
      ) {
        collides = true;
        break;
      }
    }

    if (!collides) {
      return {
        id: `loot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type: chosen.type,
        position: { x: rx, y: ry },
        radius: chosen.radius,
        value: chosen.value,
        pulseTimer: Math.random() * Math.PI * 2,
        powerUpReward,
      };
    }
  }

  return null;
}

export function createInitialLootDashState(
  config: LootDashConfig,
  playerName = 'Sprinter',
): LootDashArenaState {
  const obstacles = generateDefaultObstacles();
  const traps = generateDefaultTraps();
  const totalPlayers = Math.min(6, Math.max(2, config.botCount + 1));
  const players: DashPlayer[] = [];
  const stats: Record<string, LootDashMatchStats> = {};

  for (let i = 0; i < totalPlayers; i++) {
    const isBot = i > 0;
    const pId = isBot ? `bot-${i}` : 'player-1';
    const pName = isBot ? `Runner ${i}` : playerName;
    const spawn = ARENA_SPAWNS[i % ARENA_SPAWNS.length];

    players.push({
      id: pId,
      name: pName,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      isBot,
      isAlive: true,
      position: { ...spawn },
      velocity: { x: 0, y: 0 },
      angle: 0,
      radius: PLAYER_RADIUS,
      score: 0,
      coinsCollected: 0,
      gemsCollected: 0,
      trapsTriggered: 0,
      stealsCount: 0,
      activePowerUp: null,
      powerUpTimeRemaining: 0,
      stunTimer: 0,
      slowTimer: 0,
      invulnerableTimer: 1.5,
    });

    stats[pId] = {
      playerId: pId,
      playerName: pName,
      score: 0,
      lootCollected: 0,
      trapsTriggered: 0,
      stealsCount: 0,
      powerUpsUsed: 0,
    };
  }

  // Pre-populate initial loot
  const initialLoot: LootItem[] = [];
  for (let i = 0; i < 16; i++) {
    const item = createRandomLoot(obstacles, traps);
    if (item) initialLoot.push(item);
  }

  return {
    status: 'countdown',
    timeRemaining: config.roundDuration,
    countdown: 3,
    targetScore: config.targetScore,
    arenaWidth: ARENA_WIDTH,
    arenaHeight: ARENA_HEIGHT,
    players,
    loot: initialLoot,
    traps,
    obstacles,
    scores: [],
    particles: [],
    stats,
  };
}

export function stepLootDashArena(
  state: LootDashArenaState,
  inputs: Record<string, DashInput>,
  config: LootDashConfig,
  dt: number,
): { nextState: LootDashArenaState; events: LootEngineEvent[] } {
  const events: LootEngineEvent[] = [];

  // 1. Countdown Transition
  if (state.status === 'countdown') {
    const nextCount = state.countdown - dt;
    if (nextCount <= 0) {
      return {
        nextState: { ...state, status: 'playing', countdown: 0 },
        events,
      };
    }
    return {
      nextState: { ...state, countdown: nextCount },
      events,
    };
  }

  if (state.status !== 'playing') {
    return { nextState: state, events };
  }

  const newTime = Math.max(0, state.timeRemaining - dt);
  let players = state.players.map((p) => ({ ...p }));
  let lootList = state.loot.map((l) => ({ ...l, pulseTimer: l.pulseTimer + dt * 3 }));
  const traps = state.traps.map((t) => ({ ...t }));
  const obstacles = state.obstacles;
  const floatingScores: FloatingScore[] = [];
  const stats = { ...state.stats };

  // 2. Update Spike Traps Cycle (2.5s active, 3.5s inactive)
  for (const trap of traps) {
    if (trap.type === 'spikes') {
      trap.cycleTimer += dt;
      const cycleLength = 6.0;
      const progress = trap.cycleTimer % cycleLength;
      trap.isActive = progress < 2.5;
    }
  }

  // 3. Process Player Inputs & Physics
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.isAlive) continue;

    const input = p.isBot
      ? computeLootBotInput(p, players, lootList, traps, obstacles, config.botDifficulty)
      : inputs[p.id] || { moveX: 0, moveY: 0, activateTrap: false };

    // Drop decoy trap if player uses power-up
    if (input.activateTrap && p.activePowerUp === 'decoy_drop') {
      p.activePowerUp = null;
      p.powerUpTimeRemaining = 0;
      traps.push({
        id: `decoy-${Date.now()}-${p.id}`,
        type: 'decoy',
        position: { x: p.position.x - 20, y: p.position.y - 20 },
        width: 40,
        height: 40,
        isActive: true,
        cycleTimer: 0,
        ownerId: p.id,
      });
      events.push({ type: 'trap_trigger', position: p.position });
    }

    const updated = updatePlayerPhysics(p, input, obstacles, ARENA_WIDTH, ARENA_HEIGHT, dt);
    players[i] = updated;
  }

  // 4. Resolve Player Bumps & Thief Steals
  const bumpResult = resolvePlayerBumps(players);
  players = bumpResult.updatedPlayers;

  for (const steal of bumpResult.steals) {
    events.push({ type: 'steal', value: steal.amount });
    floatingScores.push({
      id: `steal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: `STOLEN -${steal.amount}!`,
      x: players.find((p) => p.id === steal.victimId)?.position.x ?? 480,
      y: (players.find((p) => p.id === steal.victimId)?.position.y ?? 320) - 20,
      color: '#ef4444',
      lifetime: 1.2,
      maxLifetime: 1.2,
    });
    floatingScores.push({
      id: `gain-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text: `+${steal.amount}!`,
      x: players.find((p) => p.id === steal.thiefId)?.position.x ?? 480,
      y: (players.find((p) => p.id === steal.thiefId)?.position.y ?? 320) - 20,
      color: '#10b981',
      lifetime: 1.2,
      maxLifetime: 1.2,
    });
    if (stats[steal.thiefId]) {
      stats[steal.thiefId].stealsCount += 1;
      stats[steal.thiefId].score += steal.amount;
    }
  }

  // 5. Update Loot Magnets
  lootList = updateLootMagnets(lootList, players, dt);

  // 6. Check Loot Collection
  const remainingLoot: LootItem[] = [];
  for (const item of lootList) {
    let collectedBy: DashPlayer | null = null;

    for (const p of players) {
      if (!p.isAlive) continue;
      const d = vectorDistance(p.position, item.position);
      if (d < PLAYER_RADIUS + item.radius) {
        collectedBy = p;
        break;
      }
    }

    if (collectedBy) {
      collectedBy.score += item.value;
      collectedBy.coinsCollected += 1;
      if (item.type === 'gem' || item.type === 'chest') {
        collectedBy.gemsCollected += 1;
      }

      if (stats[collectedBy.id]) {
        stats[collectedBy.id].score += item.value;
        stats[collectedBy.id].lootCollected += 1;
      }

      // Floating score popup
      floatingScores.push({
        id: `score-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        text: `+${item.value}`,
        x: item.position.x,
        y: item.position.y - 12,
        color: item.type === 'gem' ? '#ec4899' : item.type === 'chest' ? '#38bdf8' : '#fbbf24',
        lifetime: 1.0,
        maxLifetime: 1.0,
      });

      // Power-up grant
      if (item.powerUpReward) {
        collectedBy.activePowerUp = item.powerUpReward;
        collectedBy.powerUpTimeRemaining = 6.0;
        events.push({
          type: 'powerup_activate',
          powerUp: item.powerUpReward,
          position: item.position,
        });
        if (stats[collectedBy.id]) {
          stats[collectedBy.id].powerUpsUsed += 1;
        }
      }

      const evType =
        item.type === 'chest' ? 'chest_pickup' : item.type === 'gem' ? 'gem_pickup' : 'coin_pickup';
      events.push({ type: evType, position: item.position, value: item.value });
    } else {
      remainingLoot.push(item);
    }
  }

  // 7. Check Traps Collisions
  const remainingTraps: Trap[] = [];
  for (const trap of traps) {
    let triggered = false;

    for (const p of players) {
      if (!p.isAlive) continue;

      const coll = circleIntersectsAABB(
        p.position.x,
        p.position.y,
        PLAYER_RADIUS,
        trap.position.x,
        trap.position.y,
        trap.width,
        trap.height,
      );

      if (coll.collides && trap.isActive) {
        // Shield absorbs trap completely
        if (p.activePowerUp === 'shield') {
          continue;
        }

        if (trap.type === 'slime') {
          p.slowTimer = 0.4;
        } else if (trap.type === 'spikes' && p.invulnerableTimer <= 0) {
          triggered = true;
          p.stunTimer = 0.8;
          p.invulnerableTimer = 1.4;
          p.trapsTriggered += 1;

          // Drop 15% of coins
          const lostCoins = Math.min(30, Math.round(p.score * 0.15));
          p.score = Math.max(0, p.score - lostCoins);

          events.push({ type: 'trap_trigger', position: p.position });
          floatingScores.push({
            id: `spike-${Date.now()}-${p.id}`,
            text: `SPIKES! -${lostCoins}`,
            x: p.position.x,
            y: p.position.y - 18,
            color: '#ef4444',
            lifetime: 1.2,
            maxLifetime: 1.2,
          });

          // Scatter dropped bronze coins around player
          for (let c = 0; c < 3; c++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = 35 + Math.random() * 20;
            remainingLoot.push({
              id: `drop-${Date.now()}-${c}`,
              type: 'bronze_coin',
              position: {
                x: clamp(p.position.x + Math.cos(angle) * dist, 60, ARENA_WIDTH - 60),
                y: clamp(p.position.y + Math.sin(angle) * dist, 60, ARENA_HEIGHT - 60),
              },
              radius: 9,
              value: 5,
              pulseTimer: 0,
            });
          }
        } else if (trap.type === 'decoy' && trap.ownerId !== p.id) {
          triggered = true;
          p.stunTimer = 1.2;
          p.invulnerableTimer = 1.6;
          p.trapsTriggered += 1;
          events.push({ type: 'trap_trigger', position: p.position });
          floatingScores.push({
            id: `decoy-${Date.now()}-${p.id}`,
            text: 'DECOY TRAP!',
            x: p.position.x,
            y: p.position.y - 18,
            color: '#a855f7',
            lifetime: 1.2,
            maxLifetime: 1.2,
          });
        }
      }
    }

    // Decoys disappear once detonated; spikes and slime stay
    if (!(trap.type === 'decoy' && triggered)) {
      remainingTraps.push(trap);
    }
  }

  // 8. Spawn Director: Maintain 16–22 loot items
  if (remainingLoot.length < 18 && Math.random() < dt * 1.4) {
    const newItem = createRandomLoot(obstacles, remainingTraps);
    if (newItem) remainingLoot.push(newItem);
  }

  // 9. Periodic Jackpot Center Burst (every 30s)
  if (Math.floor(newTime) > 0 && Math.floor(newTime) % 25 === 0 && Math.random() < dt * 1.5) {
    events.push({ type: 'jackpot', position: { x: 480, y: 320 } });
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      remainingLoot.push({
        id: `jackpot-${Date.now()}-${a}`,
        type: 'gold_bar',
        position: {
          x: 480 + Math.cos(a) * 60,
          y: 320 + Math.sin(a) * 60,
        },
        radius: 12,
        value: 25,
        pulseTimer: 0,
      });
    }
  }

  // 10. Update Floating Score Popups
  const activeScores: FloatingScore[] = [
    ...state.scores
      .map((s) => ({ ...s, y: s.y - dt * 25, lifetime: s.lifetime - dt }))
      .filter((s) => s.lifetime > 0),
    ...floatingScores,
  ];

  // 11. Victory Condition Check
  let status: LootDashArenaState['status'] = 'playing';
  let winnerId: string | undefined;
  let winnerName: string | undefined;

  const targetReachedPlayer = players.find((p) => p.score >= state.targetScore);
  if (targetReachedPlayer || newTime <= 0) {
    status = 'match_over';
    const sorted = [...players].sort((a, b) => b.score - a.score);
    winnerId = sorted[0]?.id;
    winnerName = sorted[0]?.name;
  }

  return {
    nextState: {
      ...state,
      status,
      timeRemaining: newTime,
      players,
      loot: remainingLoot,
      traps: remainingTraps,
      scores: activeScores,
      winnerId,
      winnerName,
      stats,
    },
    events,
  };
}
