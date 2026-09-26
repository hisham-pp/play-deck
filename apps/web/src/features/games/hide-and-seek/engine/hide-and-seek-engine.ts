/**
 * Hide & Seek Multiplayer Social Game Engine
 * Pure TypeScript implementation of 2D grid/room navigation, line-of-sight & fog-of-war,
 * hiding spots (closets, vents, crates), interactive doors, disguise/invisibility abilities,
 * radar pulse detection, infection-style tagging, and AI bots.
 */

export type PlayerRole = 'hider' | 'seeker';

export type GamePhase = 'hiding_phase' | 'seeking_phase' | 'round_over' | 'game_over';

export type DisguiseType = 'none' | 'box' | 'plant' | 'barrel';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface HidingSpot extends Rect {
  id: string;
  name: string;
  type: 'closet' | 'crate' | 'vent' | 'desk';
  occupantId: string | null;
}

export interface InteractiveDoor extends Rect {
  id: string;
  isOpen: boolean;
}

export interface MapLayout {
  id: string;
  name: string;
  width: number;
  height: number;
  walls: Rect[];
  hidingSpots: HidingSpot[];
  doors: InteractiveDoor[];
  seekerSpawn: { x: number; y: number };
  hiderSpawns: { x: number; y: number }[];
}

export interface HideSeekPlayer {
  id: string;
  name: string;
  isBot: boolean;
  role: PlayerRole;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingAngle: number; // in radians
  speed: number;
  isTagged: boolean;
  isHiddenInSpot: boolean;
  hidingSpotId: string | null;
  activeDisguise: DisguiseType;
  isInvisible: boolean;
  // Timers & Cooldowns
  invisibilityTimer: number;
  speedBoostTimer: number;
  radarCooldown: number;
  dashCooldown: number;
  disguiseCooldown: number;
  invisibilityCooldown: number;
  score: number;
}

export interface HideSeekState {
  players: HideSeekPlayer[];
  map: MapLayout;
  phase: GamePhase;
  phaseTimerSeconds: number;
  hidingDurationSeconds: number;
  seekingDurationSeconds: number;
  currentRound: number;
  maxRounds: number;
  lastActionMessage: string;
  radarPingPosition: { x: number; y: number; timestamp: number } | null;
  winnerTeam: 'hiders' | 'seekers' | null;
  activityLog: string[];
}

export const MAP_PRESETS: Record<string, MapLayout> = {
  manor: {
    id: 'manor',
    name: 'Shadowstone Manor',
    width: 800,
    height: 600,
    walls: [
      // Outer Boundary Walls
      { x: 0, y: 0, w: 800, h: 20 },
      { x: 0, y: 580, w: 800, h: 20 },
      { x: 0, y: 0, w: 20, h: 600 },
      { x: 780, y: 0, w: 20, h: 600 },
      // Internal Manor Walls & Rooms
      { x: 240, y: 20, w: 20, h: 220 }, // Library divider
      { x: 540, y: 20, w: 20, h: 220 }, // Conservatory divider
      { x: 20, y: 360, w: 320, h: 20 }, // Dining Hall wall
      { x: 460, y: 360, w: 320, h: 20 }, // Lounge wall
      { x: 380, y: 220, w: 40, h: 40 }, // Grand central pillar
    ],
    hidingSpots: [
      {
        id: 'spot-1',
        name: 'Oak Closet',
        x: 50,
        y: 50,
        w: 45,
        h: 45,
        type: 'closet',
        occupantId: null,
      },
      {
        id: 'spot-2',
        name: 'Cargo Crate',
        x: 700,
        y: 60,
        w: 45,
        h: 45,
        type: 'crate',
        occupantId: null,
      },
      {
        id: 'spot-3',
        name: 'Air Vent',
        x: 60,
        y: 500,
        w: 45,
        h: 45,
        type: 'vent',
        occupantId: null,
      },
      {
        id: 'spot-4',
        name: 'Study Desk',
        x: 700,
        y: 490,
        w: 45,
        h: 45,
        type: 'desk',
        occupantId: null,
      },
      {
        id: 'spot-5',
        name: 'Grand Armoire',
        x: 380,
        y: 70,
        w: 45,
        h: 45,
        type: 'closet',
        occupantId: null,
      },
    ],
    doors: [
      { id: 'door-1', x: 240, y: 140, w: 20, h: 50, isOpen: true },
      { id: 'door-2', x: 540, y: 140, w: 20, h: 50, isOpen: true },
    ],
    seekerSpawn: { x: 400, y: 300 },
    hiderSpawns: [
      { x: 100, y: 100 },
      { x: 700, y: 120 },
      { x: 120, y: 480 },
      { x: 680, y: 460 },
    ],
  },
  warehouse: {
    id: 'warehouse',
    name: 'Industrial Depot',
    width: 800,
    height: 600,
    walls: [
      // Outer Boundary
      { x: 0, y: 0, w: 800, h: 20 },
      { x: 0, y: 580, w: 800, h: 20 },
      { x: 0, y: 0, w: 20, h: 600 },
      { x: 780, y: 0, w: 20, h: 600 },
      // Stacks of Shipping Containers
      { x: 160, y: 120, w: 120, h: 80 },
      { x: 520, y: 120, w: 120, h: 80 },
      { x: 160, y: 380, w: 120, h: 80 },
      { x: 520, y: 380, w: 120, h: 80 },
      { x: 360, y: 240, w: 80, h: 120 },
    ],
    hidingSpots: [
      {
        id: 'wh-1',
        name: 'Open Crate A',
        x: 60,
        y: 70,
        w: 45,
        h: 45,
        type: 'crate',
        occupantId: null,
      },
      {
        id: 'wh-2',
        name: 'Open Crate B',
        x: 680,
        y: 70,
        w: 45,
        h: 45,
        type: 'crate',
        occupantId: null,
      },
      {
        id: 'wh-3',
        name: 'Forklift Bay',
        x: 80,
        y: 480,
        w: 50,
        h: 50,
        type: 'vent',
        occupantId: null,
      },
      {
        id: 'wh-4',
        name: 'Pallet Stack',
        x: 670,
        y: 480,
        w: 50,
        h: 50,
        type: 'crate',
        occupantId: null,
      },
    ],
    doors: [],
    seekerSpawn: { x: 400, y: 100 },
    hiderSpawns: [
      { x: 100, y: 280 },
      { x: 700, y: 280 },
      { x: 260, y: 500 },
      { x: 540, y: 500 },
    ],
  },
};

/**
 * Initializes a new Hide & Seek match state.
 */
export function createInitialHideSeekState(options?: {
  mapId?: string;
  playerCount?: number;
  playerRole?: PlayerRole;
  maxRounds?: number;
  hidingDuration?: number;
  seekingDuration?: number;
}): HideSeekState {
  const mapId = options?.mapId ?? 'manor';
  const map = JSON.parse(JSON.stringify(MAP_PRESETS[mapId] ?? MAP_PRESETS.manor));
  const count = options?.playerCount ?? 4;
  const userRole = options?.playerRole ?? 'hider';
  const maxRounds = options?.maxRounds ?? 3;
  const hidingDuration = options?.hidingDuration ?? 12;
  const seekingDuration = options?.seekingDuration ?? 50;

  const names = ['You', 'ShadowSeeker', 'NinjaHider', 'GhostWalker'];

  const players: HideSeekPlayer[] = [];
  for (let i = 0; i < count; i++) {
    const isUser = i === 0;
    const role: PlayerRole =
      userRole === 'seeker' ? (isUser ? 'seeker' : 'hider') : i === 1 ? 'seeker' : 'hider';

    const spawn =
      role === 'seeker'
        ? map.seekerSpawn
        : (map.hiderSpawns[(i - 1 + map.hiderSpawns.length) % map.hiderSpawns.length] ?? {
            x: 100,
            y: 100,
          });

    players.push({
      id: `p-${i + 1}`,
      name: names[i] ?? `Player ${i + 1}`,
      isBot: !isUser,
      role,
      x: spawn.x,
      y: spawn.y,
      vx: 0,
      vy: 0,
      facingAngle: 0,
      speed: 130, // px per second
      isTagged: false,
      isHiddenInSpot: false,
      hidingSpotId: null,
      activeDisguise: 'none',
      isInvisible: false,
      invisibilityTimer: 0,
      speedBoostTimer: 0,
      radarCooldown: 0,
      dashCooldown: 0,
      disguiseCooldown: 0,
      invisibilityCooldown: 0,
      score: 0,
    });
  }

  return {
    players,
    map,
    phase: 'hiding_phase',
    phaseTimerSeconds: hidingDuration,
    hidingDurationSeconds: hidingDuration,
    seekingDurationSeconds: seekingDuration,
    currentRound: 1,
    maxRounds,
    lastActionMessage: 'Hiding phase started! Seekers are blindfolded—hiders, scatter!',
    radarPingPosition: null,
    winnerTeam: null,
    activityLog: ['Match initiated. 12 seconds to find a hiding spot!'],
  };
}

/**
 * Checks whether an axis-aligned box collides with any solid walls on the map.
 */
export function checkWallCollision(box: Rect, walls: Rect[]): boolean {
  for (const w of walls) {
    if (box.x < w.x + w.w && box.x + box.w > w.x && box.y < w.y + w.h && box.y + box.h > w.y) {
      return true;
    }
  }
  return false;
}

/**
 * Moves a player with wall collision resolution.
 */
export function movePlayer(
  player: HideSeekPlayer,
  dx: number,
  dy: number,
  dt: number,
  map: MapLayout,
): void {
  if (player.isHiddenInSpot) return;

  const currentSpeed = player.speed * (player.speedBoostTimer > 0 ? 1.6 : 1.0);
  const length = Math.hypot(dx, dy);

  if (length > 0) {
    const normX = dx / length;
    const normY = dy / length;
    player.facingAngle = Math.atan2(normY, normX);

    // Cancel disguise if moving
    if (player.activeDisguise !== 'none') {
      player.activeDisguise = 'none';
    }

    const stepX = normX * currentSpeed * dt;
    const stepY = normY * currentSpeed * dt;
    const radius = 14;

    // X-axis collision
    const testBoxX: Rect = {
      x: player.x + stepX - radius,
      y: player.y - radius,
      w: radius * 2,
      h: radius * 2,
    };
    if (!checkWallCollision(testBoxX, map.walls)) {
      player.x += stepX;
    }

    // Y-axis collision
    const testBoxY: Rect = {
      x: player.x - radius,
      y: player.y + stepY - radius,
      w: radius * 2,
      h: radius * 2,
    };
    if (!checkWallCollision(testBoxY, map.walls)) {
      player.y += stepY;
    }

    // Clamp within arena
    player.x = Math.max(30, Math.min(map.width - 30, player.x));
    player.y = Math.max(30, Math.min(map.height - 30, player.y));
  }
}

/**
 * Interacts with a nearby hiding spot (Closet, Crate, Vent).
 */
export function toggleHidingSpot(player: HideSeekPlayer, map: MapLayout): boolean {
  if (player.role !== 'hider' || player.isTagged) return false;

  // If already hidden, exit spot
  if (player.isHiddenInSpot && player.hidingSpotId) {
    const spot = map.hidingSpots.find((s) => s.id === player.hidingSpotId);
    if (spot) spot.occupantId = null;
    player.isHiddenInSpot = false;
    player.hidingSpotId = null;
    return true;
  }

  // Look for unoccupied spot within interaction radius (45px)
  for (const spot of map.hidingSpots) {
    const centerX = spot.x + spot.w / 2;
    const centerY = spot.y + spot.h / 2;
    const dist = Math.hypot(player.x - centerX, player.y - centerY);

    if (dist <= 45 && !spot.occupantId) {
      spot.occupantId = player.id;
      player.isHiddenInSpot = true;
      player.hidingSpotId = spot.id;
      player.x = centerX;
      player.y = centerY;
      player.activeDisguise = 'none';
      return true;
    }
  }

  return false;
}

/**
 * Seeker inspects a nearby hiding spot to reveal/tag whoever is hiding inside.
 */
export function inspectHidingSpot(
  seeker: HideSeekPlayer,
  map: MapLayout,
  state: HideSeekState,
): boolean {
  if (seeker.role !== 'seeker') return false;

  for (const spot of map.hidingSpots) {
    const centerX = spot.x + spot.w / 2;
    const centerY = spot.y + spot.h / 2;
    const dist = Math.hypot(seeker.x - centerX, seeker.y - centerY);

    if (dist <= 50 && spot.occupantId) {
      const hiddenHider = state.players.find((p) => p.id === spot.occupantId);
      if (hiddenHider) {
        hiddenHider.isHiddenInSpot = false;
        hiddenHider.hidingSpotId = null;
        spot.occupantId = null;
        tagHider(state, seeker, hiddenHider);
        state.activityLog.unshift(
          `🔍 ${seeker.name} searched ${spot.name} and caught ${hiddenHider.name}!`,
        );
        return true;
      }
    }
  }

  return false;
}

/**
 * Activates disguise ability for hider.
 */
export function useDisguise(player: HideSeekPlayer, disguise: DisguiseType): boolean {
  if (player.role !== 'hider' || player.isTagged || player.isHiddenInSpot) return false;
  if (player.disguiseCooldown > 0) return false;

  player.activeDisguise = disguise;
  player.disguiseCooldown = 6;
  return true;
}

/**
 * Activates temporary invisibility cloak for hider.
 */
export function useInvisibility(player: HideSeekPlayer): boolean {
  if (player.role !== 'hider' || player.isTagged || player.isHiddenInSpot) return false;
  if (player.invisibilityCooldown > 0) return false;

  player.isInvisible = true;
  player.invisibilityTimer = 3.5;
  player.invisibilityCooldown = 15;
  return true;
}

/**
 * Activates speed burst sprint.
 */
export function useSprint(player: HideSeekPlayer): boolean {
  if (player.isTagged || player.isHiddenInSpot) return false;
  if (player.dashCooldown > 0) return false;

  player.speedBoostTimer = 3.0;
  player.dashCooldown = 10;
  return true;
}

/**
 * Seeker activates radar pulse to ping direction of nearest active hider.
 */
export function useRadarPulse(seeker: HideSeekPlayer, state: HideSeekState): boolean {
  if (seeker.role !== 'seeker' || seeker.radarCooldown > 0) return false;

  const activeHiders = state.players.filter((p) => p.role === 'hider' && !p.isTagged);
  if (activeHiders.length === 0) return false;

  let nearest: HideSeekPlayer | null = null;
  let minDist = Infinity;

  for (const h of activeHiders) {
    const dist = Math.hypot(seeker.x - h.x, seeker.y - h.y);
    if (dist < minDist) {
      minDist = dist;
      nearest = h;
    }
  }

  if (nearest) {
    seeker.radarCooldown = 12;
    state.radarPingPosition = {
      x: nearest.x,
      y: nearest.y,
      timestamp: Date.now(),
    };
    state.activityLog.unshift(
      `📡 ${seeker.name} activated radar pulse! Signal detected ${Math.round(minDist)}m away.`,
    );
    return true;
  }

  return false;
}

/**
 * Tags a hider and converts them to the seeker team (Infection style).
 */
export function tagHider(
  state: HideSeekState,
  seeker: HideSeekPlayer,
  hider: HideSeekPlayer,
): void {
  hider.isTagged = true;
  hider.role = 'seeker'; // Joins hunters
  hider.activeDisguise = 'none';
  hider.isInvisible = false;
  seeker.score += 250;

  state.activityLog.unshift(
    `💥 ${seeker.name} tagged ${hider.name}! ${hider.name} is now a Seeker!`,
  );
  state.lastActionMessage = `${hider.name} was caught and turned into a Seeker!`;

  // Check if all hiders caught
  const remainingHiders = state.players.filter((p) => p.role === 'hider' && !p.isTagged);
  if (remainingHiders.length === 0) {
    endRound(state, 'seekers');
  }
}

/**
 * Concludes the round and awards points.
 */
export function endRound(state: HideSeekState, winningTeam: 'hiders' | 'seekers'): void {
  state.phase = 'round_over';
  state.winnerTeam = winningTeam;

  if (winningTeam === 'hiders') {
    state.lastActionMessage = 'Time expired! Surviving Hiders win the round!';
    state.activityLog.unshift('🏆 Surviving Hiders outlasted the Seekers (+300 pts)!');
    state.players.forEach((p) => {
      if (p.role === 'hider' && !p.isTagged) {
        p.score += 300;
      }
    });
  } else {
    state.lastActionMessage = 'All Hiders were caught! Seekers win the round!';
    state.activityLog.unshift('🏆 Seekers caught every hider before time expired!');
  }
}

/**
 * Advances to next round or finishes match.
 */
export function nextRound(state: HideSeekState): void {
  state.currentRound++;
  if (state.currentRound > state.maxRounds) {
    state.phase = 'game_over';
    const sorted = [...state.players].sort((a, b) => b.score - a.score);
    state.lastActionMessage = `Match finished! ${sorted[0].name} wins with ${sorted[0].score} points!`;
    return;
  }

  // Rotate roles: shift seeker to next player
  const count = state.players.length;
  const nextSeekerIndex = (state.currentRound - 1) % count;

  state.players.forEach((p, idx) => {
    p.role = idx === nextSeekerIndex ? 'seeker' : 'hider';
    p.isTagged = false;
    p.isHiddenInSpot = false;
    p.hidingSpotId = null;
    p.activeDisguise = 'none';
    p.isInvisible = false;
    p.invisibilityTimer = 0;
    p.speedBoostTimer = 0;
    p.dashCooldown = 0;
    p.radarCooldown = 0;

    const spawn =
      p.role === 'seeker'
        ? state.map.seekerSpawn
        : (state.map.hiderSpawns[idx % state.map.hiderSpawns.length] ?? { x: 100, y: 100 });
    p.x = spawn.x;
    p.y = spawn.y;
  });

  state.phase = 'hiding_phase';
  state.phaseTimerSeconds = state.hidingDurationSeconds;
  state.winnerTeam = null;
  state.radarPingPosition = null;
  state.lastActionMessage = `Round ${state.currentRound} started! Seekers are frozen—scatter!`;
}

/**
 * Ticks game physics, ability timers, tag distance detection, and Bot behaviors.
 */
export function stepHideSeekMatch(state: HideSeekState, dt: number): void {
  if (state.phase === 'round_over' || state.phase === 'game_over') return;

  state.phaseTimerSeconds = Math.max(0, state.phaseTimerSeconds - dt);

  // Transition from hiding phase to seeking phase
  if (state.phase === 'hiding_phase' && state.phaseTimerSeconds <= 0) {
    state.phase = 'seeking_phase';
    state.phaseTimerSeconds = state.seekingDurationSeconds;
    state.lastActionMessage = 'Seekers released! The hunt begins!';
    state.activityLog.unshift('🔔 Seekers unblindfolded! RUN!');
  }

  // Time expired during seeking phase -> Hiders win!
  else if (state.phase === 'seeking_phase' && state.phaseTimerSeconds <= 0) {
    endRound(state, 'hiders');
    return;
  }

  // Update Cooldowns and Buff Timers for all players
  for (const player of state.players) {
    if (player.speedBoostTimer > 0)
      player.speedBoostTimer = Math.max(0, player.speedBoostTimer - dt);
    if (player.invisibilityTimer > 0) {
      player.invisibilityTimer = Math.max(0, player.invisibilityTimer - dt);
      if (player.invisibilityTimer <= 0) player.isInvisible = false;
    }
    if (player.radarCooldown > 0) player.radarCooldown = Math.max(0, player.radarCooldown - dt);
    if (player.dashCooldown > 0) player.dashCooldown = Math.max(0, player.dashCooldown - dt);
    if (player.disguiseCooldown > 0)
      player.disguiseCooldown = Math.max(0, player.disguiseCooldown - dt);
    if (player.invisibilityCooldown > 0)
      player.invisibilityCooldown = Math.max(0, player.invisibilityCooldown - dt);
  }

  // Tag Collision Detection in Seeking Phase
  if (state.phase === 'seeking_phase') {
    const seekers = state.players.filter((p) => p.role === 'seeker');
    const hiders = state.players.filter(
      (p) => p.role === 'hider' && !p.isTagged && !p.isHiddenInSpot,
    );

    for (const seeker of seekers) {
      for (const hider of hiders) {
        // Invisible hiders cannot be tagged
        if (hider.isInvisible) continue;

        const dist = Math.hypot(seeker.x - hider.x, seeker.y - hider.y);
        const tagRadius = 34;

        if (dist <= tagRadius) {
          tagHider(state, seeker, hider);
          break;
        }
      }
    }
  }

  // Bot AI Automation
  stepBotAi(state, dt);
}

/**
 * Autonomous navigation for AI Hiders and AI Seekers.
 */
function stepBotAi(state: HideSeekState, dt: number): void {
  const bots = state.players.filter((p) => p.isBot);

  for (const bot of bots) {
    // 1. Bot Hider AI
    if (bot.role === 'hider' && !bot.isTagged) {
      // In hiding phase: find and enter a hiding spot
      if (state.phase === 'hiding_phase' && !bot.isHiddenInSpot) {
        const availableSpot = state.map.hidingSpots.find((s) => !s.occupantId);
        if (availableSpot) {
          const targetX = availableSpot.x + availableSpot.w / 2;
          const targetY = availableSpot.y + availableSpot.h / 2;
          const dist = Math.hypot(targetX - bot.x, targetY - bot.y);
          if (dist > 20) {
            movePlayer(bot, targetX - bot.x, targetY - bot.y, dt, state.map);
          } else {
            toggleHidingSpot(bot, state.map);
          }
        }
      }

      // In seeking phase: run away from closest seeker if close
      if (state.phase === 'seeking_phase' && !bot.isHiddenInSpot) {
        const seekers = state.players.filter((p) => p.role === 'seeker');
        let nearestSeeker: HideSeekPlayer | null = null;
        let minDist = Infinity;

        for (const s of seekers) {
          const d = Math.hypot(s.x - bot.x, s.y - bot.y);
          if (d < minDist) {
            minDist = d;
            nearestSeeker = s;
          }
        }

        if (nearestSeeker && minDist < 150) {
          // Trigger invisibility or sprint if threatened
          if (bot.invisibilityCooldown <= 0) useInvisibility(bot);
          else if (bot.dashCooldown <= 0) useSprint(bot);

          // Run opposite direction
          const escapeX = bot.x - nearestSeeker.x;
          const escapeY = bot.y - nearestSeeker.y;
          movePlayer(bot, escapeX, escapeY, dt, state.map);
        }
      }
    }

    // 2. Bot Seeker AI
    else if (bot.role === 'seeker') {
      if (state.phase === 'hiding_phase') {
        // Blindfolded: stationary
        continue;
      }

      if (state.phase === 'seeking_phase') {
        const activeHiders = state.players.filter(
          (p) => p.role === 'hider' && !p.isTagged && !p.isInvisible,
        );

        // Periodically use radar
        if (bot.radarCooldown <= 0 && Math.random() < 0.05) {
          useRadarPulse(bot, state);
        }

        if (activeHiders.length > 0) {
          // Hunt closest visible hider
          let target = activeHiders[0];
          let minDist = Math.hypot(target.x - bot.x, target.y - bot.y);

          for (const h of activeHiders) {
            const d = Math.hypot(h.x - bot.x, h.y - bot.y);
            if (d < minDist) {
              minDist = d;
              target = h;
            }
          }

          if (minDist < 200 && bot.dashCooldown <= 0) {
            useSprint(bot);
          }

          movePlayer(bot, target.x - bot.x, target.y - bot.y, dt, state.map);
        } else {
          // Inspect nearby hiding spots if all hiders are hidden
          inspectHidingSpot(bot, state.map, state);
          // Wander map
          movePlayer(
            bot,
            Math.cos(state.phaseTimerSeconds),
            Math.sin(state.phaseTimerSeconds),
            dt,
            state.map,
          );
        }
      }
    }
  }
}
