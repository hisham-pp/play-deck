import type {
  BoostZone,
  FloatingText,
  HazardCoil,
  MagnetArenaConfig,
  MagnetArenaState,
  MagnetPlayer,
  MetallicAnchor,
  Particle,
  RepelShockwave,
  RoundPhase,
  TargetOrb,
  TargetTier,
  Vector2D,
} from '../types/magnet-mayhem.types';
import { evaluateBotInput } from './magnet-bot';
import {
  ATTRACT_RANGE,
  BASE_DRAG,
  calculateAttractForce,
  calculateRepelForce,
  ENERGY_DRAIN_ATTRACT,
  ENERGY_DRAIN_REPEL,
  ENERGY_RECHARGE,
  findNearestAnchor,
  HAZARD_RADIUS,
  HAZARD_STUN_DURATION,
  HAZARD_ZAP_PENALTY,
  isHazardZapped,
  isTargetCollected,
  MAX_SPEED,
  PLAYER_RADIUS,
  REPEL_RANGE,
  resolveCircleCollision,
  resolveWallCollisions,
  vecAdd,
  vecDist,
  vecLength,
  vecNormalize,
  vecScale,
  vecSub,
} from './magnet-physics';

export const DEFAULT_ARENA_WIDTH = 960;
export const DEFAULT_ARENA_HEIGHT = 600;

export const DEFAULT_COLORS = [
  '#06b6d4', // Neon Cyan (Player 1)
  '#f59e0b', // Amber / Gold (Player 2)
  '#10b981', // Emerald Green (Player 3)
  '#a855f7', // Purple / Violet (Player 4)
];

/**
 * Creates initial balanced arena layout for Magnet Mayhem.
 */
export function createInitialArenaState(
  playerDefinitions: Array<{
    id: string;
    name: string;
    avatar: string;
    isBot: boolean;
    isHost: boolean;
  }>,
  config?: Partial<MagnetArenaConfig>,
): MagnetArenaState {
  const width = config?.width ?? DEFAULT_ARENA_WIDTH;
  const height = config?.height ?? DEFAULT_ARENA_HEIGHT;
  const roundDurationSec = config?.roundDurationSec ?? 60;

  // Symmetrically placed metallic anchors
  const anchors: MetallicAnchor[] = [
    {
      id: 'anchor-center',
      x: width / 2,
      y: height / 2,
      radius: 26,
      isMovable: false,
      pulsePhase: 0,
    },
    {
      id: 'anchor-top-left',
      x: width * 0.25,
      y: height * 0.28,
      radius: 22,
      isMovable: false,
      pulsePhase: 1,
    },
    {
      id: 'anchor-top-right',
      x: width * 0.75,
      y: height * 0.28,
      radius: 22,
      isMovable: false,
      pulsePhase: 2,
    },
    {
      id: 'anchor-bottom-left',
      x: width * 0.25,
      y: height * 0.72,
      radius: 22,
      isMovable: false,
      pulsePhase: 3,
    },
    {
      id: 'anchor-bottom-right',
      x: width * 0.75,
      y: height * 0.72,
      radius: 22,
      isMovable: false,
      pulsePhase: 4,
    },
  ];

  // Hazardous electric coils
  const hazards: HazardCoil[] = [
    { id: 'hazard-top', x: width / 2, y: height * 0.22, radius: 24, zapCooldown: 0, glowPhase: 0 },
    {
      id: 'hazard-bottom',
      x: width / 2,
      y: height * 0.78,
      radius: 24,
      zapCooldown: 0,
      glowPhase: Math.PI,
    },
  ];

  // Boost acceleration zones (horizontal acceleration gates)
  const boostZones: BoostZone[] = [
    {
      id: 'boost-left',
      x: width * 0.12,
      y: height * 0.44,
      width: 44,
      height: 72,
      boostDir: { x: 1, y: 0 },
      magnitude: 480,
    },
    {
      id: 'boost-right',
      x: width * 0.88 - 44,
      y: height * 0.44,
      width: 44,
      height: 72,
      boostDir: { x: -1, y: 0 },
      magnitude: 480,
    },
  ];

  // Initial Target Orbs
  const targets: TargetOrb[] = [
    createTargetOrb('target-1', width * 0.35, height * 0.5, 'normal'),
    createTargetOrb('target-2', width * 0.65, height * 0.5, 'normal'),
    createTargetOrb('target-3', width * 0.2, height * 0.2, 'normal'),
    createTargetOrb('target-4', width * 0.8, height * 0.2, 'normal'),
    createTargetOrb('target-5', width * 0.2, height * 0.8, 'gold'),
    createTargetOrb('target-6', width * 0.8, height * 0.8, 'gold'),
    createTargetOrb('target-7', width * 0.5, height * 0.5, 'star'),
  ];

  // Spawn points for up to 4 players around corners/perimeter
  const spawnPositions: Vector2D[] = [
    { x: width * 0.12, y: height * 0.18 },
    { x: width * 0.88, y: height * 0.82 },
    { x: width * 0.88, y: height * 0.18 },
    { x: width * 0.12, y: height * 0.82 },
  ];

  const players: MagnetPlayer[] = playerDefinitions.map((def, idx) => {
    const spawn = spawnPositions[idx % spawnPositions.length];
    return {
      id: def.id,
      name: def.name,
      avatar: def.avatar,
      color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
      isBot: def.isBot,
      isHost: def.isHost,
      ready: true,
      score: 0,
      position: { ...spawn },
      velocity: { x: 0, y: 0 },
      aimAngle: Math.atan2(height / 2 - spawn.y, width / 2 - spawn.x),
      action: 'idle',
      energy: 100,
      stunnedTimer: 0,
      targetHitCount: 0,
      slingshotCount: 0,
      repelHitCount: 0,
      isTethered: false,
      tetherTarget: null,
    };
  });

  return {
    width,
    height,
    players,
    anchors,
    targets,
    hazards,
    boostZones,
    particles: [],
    shockwaves: [],
    floatingTexts: [],
    elapsedSec: 0,
    roundDurationSec,
    isGameOver: false,
    winnerId: null,
    roundPhase: 'countdown',
    countdownSec: 3.0,
  };
}

export function createTargetOrb(
  id: string,
  x: number,
  y: number,
  tier: TargetTier = 'normal',
): TargetOrb {
  const value = tier === 'star' ? 50 : tier === 'gold' ? 25 : 10;
  return {
    id,
    x,
    y,
    radius: tier === 'star' ? 15 : tier === 'gold' ? 13 : 11,
    tier,
    value,
    velocity: { x: (Math.random() - 0.5) * 20, y: (Math.random() - 0.5) * 20 },
    isCollected: false,
    respawnTimer: 0,
    pulseTimer: Math.random() * Math.PI * 2,
  };
}

export interface SimulationEvents {
  onTargetCollected?: (player: MagnetPlayer, target: TargetOrb) => void;
  onHazardZapped?: (player: MagnetPlayer, hazard: HazardCoil) => void;
  onWallBounce?: (player: MagnetPlayer, speed: number) => void;
  onRepelFired?: (player: MagnetPlayer) => void;
  onAttractTether?: (player: MagnetPlayer) => void;
}

/**
 * Steps the physics simulation forward by dt (delta time in seconds).
 */
export function stepMagnetSimulation(
  state: MagnetArenaState,
  dt: number,
  events?: SimulationEvents,
): MagnetArenaState {
  if (state.isGameOver) {
    return state;
  }

  // Handle Countdown phase
  if (state.roundPhase === 'countdown') {
    const nextCountdown = state.countdownSec - dt;
    if (nextCountdown <= 0) {
      return {
        ...state,
        roundPhase: 'playing',
        countdownSec: 0,
      };
    }
    return {
      ...state,
      countdownSec: nextCountdown,
    };
  }

  const elapsedSec = state.elapsedSec + dt;
  const isTimeUp = elapsedSec >= state.roundDurationSec;

  // Clone players to mutate safely
  const updatedPlayers: MagnetPlayer[] = state.players.map((p) => ({
    ...p,
    position: { ...p.position },
    velocity: { ...p.velocity },
  }));

  const updatedTargets: TargetOrb[] = state.targets.map((t) => ({
    ...t,
    velocity: { ...t.velocity },
  }));

  const updatedHazards: HazardCoil[] = state.hazards.map((h) => ({
    ...h,
    zapCooldown: Math.max(0, h.zapCooldown - dt),
    glowPhase: (h.glowPhase + dt * 4) % (Math.PI * 2),
  }));

  const particles: Particle[] = [...state.particles];
  const shockwaves: RepelShockwave[] = [...state.shockwaves];
  const floatingTexts: FloatingText[] = [...state.floatingTexts];

  // 1. Process Player Actions & AI Bot Inputs
  for (let i = 0; i < updatedPlayers.length; i++) {
    const player = updatedPlayers[i];

    // Decrement stun
    if (player.stunnedTimer > 0) {
      player.stunnedTimer = Math.max(0, player.stunnedTimer - dt);
    }

    // Bot decision
    if (player.isBot && player.stunnedTimer <= 0) {
      const decision = evaluateBotInput(player, state);
      player.aimAngle = decision.aimAngle;
      player.action = decision.action;
    }

    // Energy management
    if (player.action === 'attract' && player.energy > 0 && player.stunnedTimer <= 0) {
      player.energy = Math.max(0, player.energy - ENERGY_DRAIN_ATTRACT * dt);
      if (player.energy === 0) player.action = 'idle';
    } else if (player.action === 'repel' && player.energy > 0 && player.stunnedTimer <= 0) {
      player.energy = Math.max(0, player.energy - ENERGY_DRAIN_REPEL * dt);
      if (player.energy === 0) player.action = 'idle';
    } else {
      player.energy = Math.min(100, player.energy + ENERGY_RECHARGE * dt);
    }

    // Reset tether
    player.isTethered = false;
    player.tetherTarget = null;

    // ATTRACT ACTION
    if (player.action === 'attract' && player.energy > 0 && player.stunnedTimer <= 0) {
      // Find nearest anchor
      const nearestAnchor = findNearestAnchor(player.position, state.anchors, ATTRACT_RANGE);

      if (nearestAnchor) {
        const pull = calculateAttractForce(player.position, {
          x: nearestAnchor.x,
          y: nearestAnchor.y,
        });
        player.velocity = vecAdd(player.velocity, vecScale(pull, dt));
        player.isTethered = true;
        player.tetherTarget = {
          x: nearestAnchor.x,
          y: nearestAnchor.y,
          id: nearestAnchor.id,
        };

        events?.onAttractTether?.(player);

        // Check for slingshot achievement (tangential velocity high)
        if (vecLength(player.velocity) > 380) {
          player.slingshotCount++;
        }
      }

      // Also attract lightweight active target orbs toward player
      for (const target of updatedTargets) {
        if (!target.isCollected) {
          const d = vecDist(player.position, { x: target.x, y: target.y });
          if (d <= ATTRACT_RANGE * 0.8) {
            const pullOrb = calculateAttractForce(
              { x: target.x, y: target.y },
              player.position,
              ATTRACT_RANGE,
            );
            target.velocity = vecAdd(target.velocity, vecScale(pullOrb, dt * 0.7));
          }
        }
      }
    }

    // REPEL ACTION
    if (player.action === 'repel' && player.energy > 0 && player.stunnedTimer <= 0) {
      // Create visual shockwave effect
      if (Math.random() < 0.35) {
        shockwaves.push({
          id: `shock-${Date.now()}-${Math.random()}`,
          x: player.position.x,
          y: player.position.y,
          currentRadius: PLAYER_RADIUS + 4,
          maxRadius: REPEL_RANGE,
          color: player.color,
          life: 0.3,
        });
        events?.onRepelFired?.(player);
      }

      // Repel rivals
      for (let j = 0; j < updatedPlayers.length; j++) {
        if (i === j) continue;
        const rival = updatedPlayers[j];
        const pushForce = calculateRepelForce(player.position, rival.position, REPEL_RANGE);
        if (pushForce.x !== 0 || pushForce.y !== 0) {
          rival.velocity = vecAdd(rival.velocity, vecScale(pushForce, dt * 1.4));
          player.repelHitCount++;
        }
      }

      // Repel target orbs
      for (const target of updatedTargets) {
        if (!target.isCollected) {
          const pushOrb = calculateRepelForce(
            player.position,
            { x: target.x, y: target.y },
            REPEL_RANGE,
          );
          if (pushOrb.x !== 0 || pushOrb.y !== 0) {
            target.velocity = vecAdd(target.velocity, vecScale(pushOrb, dt * 1.5));
          }
        }
      }
    }

    // 2. Linear Drag & Velocity Cap
    player.velocity = vecScale(player.velocity, Math.max(0, 1 - BASE_DRAG * dt));
    const speed = vecLength(player.velocity);
    if (speed > MAX_SPEED) {
      player.velocity = vecScale(player.velocity, MAX_SPEED / speed);
    }

    // 3. Move Player Position
    player.position = vecAdd(player.position, vecScale(player.velocity, dt));

    // 4. Boost Zones
    for (const boost of state.boostZones) {
      if (
        player.position.x >= boost.x &&
        player.position.x <= boost.x + boost.width &&
        player.position.y >= boost.y &&
        player.position.y <= boost.y + boost.height
      ) {
        player.velocity = vecAdd(
          player.velocity,
          vecScale(boost.boostDir, boost.magnitude * dt * 2.5),
        );
      }
    }

    // 5. Arena Wall Bounces
    const wallRes = resolveWallCollisions(
      player.position,
      player.velocity,
      PLAYER_RADIUS,
      state.width,
      state.height,
    );
    player.position = wallRes.pos;
    player.velocity = wallRes.vel;
    if (wallRes.bounced && wallRes.speed > 160) {
      events?.onWallBounce?.(player, wallRes.speed);
      spawnBounceSparks(particles, player.position, player.color);
    }

    // 6. Anchor Solid Collisions
    for (const anchor of state.anchors) {
      const col = resolveCircleCollision(
        player.position,
        player.velocity,
        PLAYER_RADIUS,
        { x: anchor.x, y: anchor.y },
        anchor.velocity || { x: 0, y: 0 },
        anchor.radius,
        1,
        100, // Anchors are stationary heavy masses
      );
      if (col.collided) {
        player.position = col.posA;
        player.velocity = col.velA;
      }
    }

    // 7. Hazard Coils (Shock Zaps)
    for (const hazard of updatedHazards) {
      if (isHazardZapped(player, hazard)) {
        player.score = Math.max(0, player.score - HAZARD_ZAP_PENALTY);
        player.stunnedTimer = HAZARD_STUN_DURATION;
        hazard.zapCooldown = 0.6;

        // Knockback away from hazard center
        const diff = vecSub(player.position, { x: hazard.x, y: hazard.y });
        const zapDir = vecLength(diff) === 0 ? { x: 0, y: -1 } : vecNormalize(diff);
        player.velocity = vecScale(zapDir, 420);

        events?.onHazardZapped?.(player, hazard);

        floatingTexts.push({
          id: `text-${Date.now()}-${Math.random()}`,
          text: `-${HAZARD_ZAP_PENALTY} ZAP!`,
          x: player.position.x,
          y: player.position.y - 20,
          color: '#ef4444',
          life: 1.0,
          maxLife: 1.0,
        });

        spawnZapSparks(particles, player.position);
      }
    }

    // 8. Motion Trail Particles
    if (speed > 120 && Math.random() < 0.4) {
      particles.push({
        id: `trail-${Date.now()}-${Math.random()}`,
        x: player.position.x + (Math.random() - 0.5) * 6,
        y: player.position.y + (Math.random() - 0.5) * 6,
        vx: -player.velocity.x * 0.15,
        vy: -player.velocity.y * 0.15,
        life: 0.3,
        maxLife: 0.3,
        color: player.color,
        size: 3,
        type: 'trail',
      });
    }
  }

  // 9. Player-to-Player Collisions
  for (let i = 0; i < updatedPlayers.length; i++) {
    for (let j = i + 1; j < updatedPlayers.length; j++) {
      const p1 = updatedPlayers[i];
      const p2 = updatedPlayers[j];
      const col = resolveCircleCollision(
        p1.position,
        p1.velocity,
        PLAYER_RADIUS,
        p2.position,
        p2.velocity,
        PLAYER_RADIUS,
        1,
        1,
      );
      if (col.collided) {
        p1.position = col.posA;
        p1.velocity = col.velA;
        p2.position = col.posB;
        p2.velocity = col.velB;
      }
    }
  }

  // 10. Target Orb Physics & Collection
  for (const target of updatedTargets) {
    if (target.isCollected) {
      target.respawnTimer -= dt;
      if (target.respawnTimer <= 0) {
        // Respawn target at random valid location away from hazards
        respawnTargetOrb(target, state.width, state.height, updatedHazards);
      }
      continue;
    }

    // Target drift motion
    target.velocity = vecScale(target.velocity, Math.max(0, 1 - 0.8 * dt));
    target.x += target.velocity.x * dt;
    target.y += target.velocity.y * dt;
    target.pulseTimer = (target.pulseTimer + dt * 3) % (Math.PI * 2);

    // Keep target inside arena bounds
    const bound = resolveWallCollisions(
      { x: target.x, y: target.y },
      target.velocity,
      target.radius,
      state.width,
      state.height,
    );
    target.x = bound.pos.x;
    target.y = bound.pos.y;
    target.velocity = bound.vel;

    // Check collection by any player
    for (const player of updatedPlayers) {
      if (isTargetCollected(player.position, PLAYER_RADIUS, target)) {
        target.isCollected = true;
        target.respawnTimer = 3.2;

        player.score += target.value;
        player.targetHitCount++;

        const tierColor =
          target.tier === 'star' ? '#c084fc' : target.tier === 'gold' ? '#fbbf24' : '#38bdf8';

        floatingTexts.push({
          id: `score-${Date.now()}-${Math.random()}`,
          text: `+${target.value}`,
          x: target.x,
          y: target.y - 15,
          color: tierColor,
          life: 0.9,
          maxLife: 0.9,
        });

        spawnPickupBurst(particles, { x: target.x, y: target.y }, tierColor);
        events?.onTargetCollected?.(player, target);
        break;
      }
    }
  }

  // 11. Update Shockwaves
  const nextShockwaves = shockwaves
    .map((s) => {
      const growth = (s.maxRadius - PLAYER_RADIUS) * (dt / 0.3);
      return {
        ...s,
        currentRadius: s.currentRadius + growth,
        life: s.life - dt,
      };
    })
    .filter((s) => s.life > 0);

  // 12. Update Particles
  const nextParticles = particles
    .map((p) => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      life: p.life - dt,
    }))
    .filter((p) => p.life > 0);

  // 13. Update Floating Texts
  const nextFloatingTexts = floatingTexts
    .map((ft) => ({
      ...ft,
      y: ft.y - 28 * dt,
      life: ft.life - dt,
    }))
    .filter((ft) => ft.life > 0);

  // 14. Win condition / Game over
  let winnerId: string | null = null;
  let isGameOver: boolean = state.isGameOver;
  let roundPhase: RoundPhase = state.roundPhase;

  if (isTimeUp && !isGameOver) {
    isGameOver = true;
    roundPhase = 'game-over';
    let highestScore = -1;
    for (const p of updatedPlayers) {
      if (p.score > highestScore) {
        highestScore = p.score;
        winnerId = p.id;
      }
    }
  }

  return {
    ...state,
    players: updatedPlayers,
    targets: updatedTargets,
    hazards: updatedHazards,
    particles: nextParticles,
    shockwaves: nextShockwaves,
    floatingTexts: nextFloatingTexts,
    elapsedSec,
    isGameOver,
    winnerId: isGameOver ? winnerId : state.winnerId,
    roundPhase,
  };
}

function respawnTargetOrb(target: TargetOrb, width: number, height: number, hazards: HazardCoil[]) {
  let valid = false;
  let attempts = 0;
  let rx = width / 2;
  let ry = height / 2;

  while (!valid && attempts < 15) {
    attempts++;
    rx = width * 0.12 + Math.random() * (width * 0.76);
    ry = height * 0.14 + Math.random() * (height * 0.72);

    let tooClose = false;
    for (const hazard of hazards) {
      if (vecDist({ x: rx, y: ry }, { x: hazard.x, y: hazard.y }) < HAZARD_RADIUS + 40) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) valid = true;
  }

  // Tier probability: 70% normal, 22% gold, 8% star
  const roll = Math.random();
  const tier: TargetTier = roll > 0.92 ? 'star' : roll > 0.7 ? 'gold' : 'normal';
  const value = tier === 'star' ? 50 : tier === 'gold' ? 25 : 10;

  target.x = rx;
  target.y = ry;
  target.tier = tier;
  target.value = value;
  target.radius = tier === 'star' ? 15 : tier === 'gold' ? 13 : 11;
  target.isCollected = false;
  target.respawnTimer = 0;
  target.velocity = { x: (Math.random() - 0.5) * 30, y: (Math.random() - 0.5) * 30 };
}

function spawnBounceSparks(particles: Particle[], pos: Vector2D, color: string) {
  for (let i = 0; i < 6; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 120;
    particles.push({
      id: `spark-${Date.now()}-${Math.random()}`,
      x: pos.x,
      y: pos.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.25,
      maxLife: 0.25,
      color,
      size: 2.5,
      type: 'spark',
    });
  }
}

function spawnZapSparks(particles: Particle[], pos: Vector2D) {
  for (let i = 0; i < 12; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 90 + Math.random() * 180;
    particles.push({
      id: `zap-${Date.now()}-${Math.random()}`,
      x: pos.x,
      y: pos.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.4,
      maxLife: 0.4,
      color: '#f87171',
      size: 3,
      type: 'spark',
    });
  }
}

function spawnPickupBurst(particles: Particle[], pos: Vector2D, color: string) {
  for (let i = 0; i < 14; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 80 + Math.random() * 160;
    particles.push({
      id: `burst-${Date.now()}-${Math.random()}`,
      x: pos.x,
      y: pos.y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0.45,
      maxLife: 0.45,
      color,
      size: 3.5,
      type: 'spark',
    });
  }
}
