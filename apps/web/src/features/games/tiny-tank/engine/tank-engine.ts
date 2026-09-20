import type {
  TinyTankArenaState,
  TankPlayer,
  ArenaBlock,
  Projectile,
  ProximityMine,
  PickupCrate,
  ExplosionEffect,
  TankInput,
  TinyTankConfig,
  TinyTankMatchStats,
  WeaponType,
  PickupType,
  Vector2D,
} from '../types/tiny-tank.types';
import { computeBotInput } from './tank-bot';
import {
  TANK_RADIUS,
  vectorDistance,
  vectorNormalize,
  vectorScale,
  vectorAdd,
  vectorSub,
  circleIntersectsAABB,
  reflectVector,
  updateTankPhysics,
  resolveTankSeparation,
  updateProjectilePhysics,
} from './tank-physics';

export const ARENA_WIDTH = 960;
export const ARENA_HEIGHT = 640;
export const BLOCK_SIZE = 40;

const PLAYER_COLORS = [
  '#06b6d4', // Cyan (Human)
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#ec4899', // Pink
];

export interface EngineEvent {
  type:
    | 'fire'
    | 'hit'
    | 'ricochet'
    | 'explosion'
    | 'barrel_boom'
    | 'crate_pickup'
    | 'tank_destroyed'
    | 'mine_arm';
  weapon?: WeaponType;
  position?: Vector2D;
}

export function generateDefaultArena(): ArenaBlock[] {
  const blocks: ArenaBlock[] = [];
  let nextId = 1;

  // Solid steel perimeter walls
  // Top & Bottom
  for (let x = 0; x < ARENA_WIDTH; x += BLOCK_SIZE) {
    blocks.push({
      id: `steel-${nextId++}`,
      x,
      y: 0,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: 'steel',
      health: 9999,
      maxHealth: 9999,
    });
    blocks.push({
      id: `steel-${nextId++}`,
      x,
      y: ARENA_HEIGHT - BLOCK_SIZE,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: 'steel',
      health: 9999,
      maxHealth: 9999,
    });
  }

  // Left & Right
  for (let y = BLOCK_SIZE; y < ARENA_HEIGHT - BLOCK_SIZE; y += BLOCK_SIZE) {
    blocks.push({
      id: `steel-${nextId++}`,
      x: 0,
      y,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: 'steel',
      health: 9999,
      maxHealth: 9999,
    });
    blocks.push({
      id: `steel-${nextId++}`,
      x: ARENA_WIDTH - BLOCK_SIZE,
      y,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: 'steel',
      health: 9999,
      maxHealth: 9999,
    });
  }

  // Interior Layout: Tactical destructible brick barriers and explosive barrels
  const brickPatterns = [
    // Center bunker
    { x: 440, y: 280, type: 'brick' as const },
    { x: 480, y: 280, type: 'brick' as const },
    { x: 440, y: 320, type: 'brick' as const },
    { x: 480, y: 320, type: 'brick' as const },

    // Explosive Barrels in center cross
    { x: 400, y: 300, type: 'barrel' as const },
    { x: 520, y: 300, type: 'barrel' as const },
    { x: 460, y: 240, type: 'barrel' as const },
    { x: 460, y: 360, type: 'barrel' as const },

    // Left quad barriers
    { x: 200, y: 160, type: 'brick' as const },
    { x: 240, y: 160, type: 'brick' as const },
    { x: 200, y: 200, type: 'brick' as const },
    { x: 200, y: 440, type: 'brick' as const },
    { x: 240, y: 440, type: 'brick' as const },
    { x: 200, y: 400, type: 'brick' as const },

    // Right quad barriers
    { x: 720, y: 160, type: 'brick' as const },
    { x: 680, y: 160, type: 'brick' as const },
    { x: 720, y: 200, type: 'brick' as const },
    { x: 720, y: 440, type: 'brick' as const },
    { x: 680, y: 440, type: 'brick' as const },
    { x: 720, y: 400, type: 'brick' as const },

    // Corner barrels
    { x: 160, y: 280, type: 'barrel' as const },
    { x: 760, y: 280, type: 'barrel' as const },

    // Mid columns
    { x: 340, y: 120, type: 'brick' as const },
    { x: 340, y: 480, type: 'brick' as const },
    { x: 580, y: 120, type: 'brick' as const },
    { x: 580, y: 480, type: 'brick' as const },
  ];

  for (const item of brickPatterns) {
    const isBarrel = item.type === 'barrel';
    blocks.push({
      id: `${item.type}-${nextId++}`,
      x: item.x,
      y: item.y,
      width: BLOCK_SIZE,
      height: BLOCK_SIZE,
      type: item.type,
      health: isBarrel ? 30 : 60,
      maxHealth: isBarrel ? 30 : 60,
    });
  }

  return blocks;
}

export const ARENA_SPAWN_POINTS: Vector2D[] = [
  { x: 100, y: 100 },
  { x: 860, y: 540 },
  { x: 860, y: 100 },
  { x: 100, y: 540 },
  { x: 480, y: 100 },
  { x: 480, y: 540 },
];

export function createInitialArenaState(
  config: TinyTankConfig,
  playerName = 'Commander',
): TinyTankArenaState {
  const blocks = generateDefaultArena();
  const totalPlayers = Math.min(6, Math.max(2, config.botCount + 1));
  const players: TankPlayer[] = [];
  const stats: Record<string, TinyTankMatchStats> = {};

  for (let i = 0; i < totalPlayers; i++) {
    const isBot = i > 0;
    const pId = isBot ? `bot-${i}` : 'player-1';
    const pName = isBot ? `Unit ${i}` : playerName;
    const spawn = ARENA_SPAWN_POINTS[i % ARENA_SPAWN_POINTS.length];
    const angle = Math.atan2(ARENA_HEIGHT / 2 - spawn.y, ARENA_WIDTH / 2 - spawn.x);

    players.push({
      id: pId,
      name: pName,
      color: PLAYER_COLORS[i % PLAYER_COLORS.length],
      isBot,
      isAlive: true,
      position: { ...spawn },
      velocity: { x: 0, y: 0 },
      angle,
      turretAngle: angle,
      health: 100,
      maxHealth: 100,
      shield: 0,
      maxShield: 50,
      ammo: 5,
      maxAmmo: 5,
      reloadTimer: 0,
      activeWeapon: 'cannon',
      weaponAmmo: {
        cannon: Infinity,
        bouncing: 0,
        homing: 0,
        mine: 0,
        laser: 0,
        rubber: 0,
      },
      score: 0,
      kills: 0,
      damageDealt: 0,
      recoilOffset: 0,
      invulnerableTimer: 1.5,
    });

    stats[pId] = {
      playerId: pId,
      playerName: pName,
      kills: 0,
      damageDealt: 0,
      shotsFired: 0,
      shotsHit: 0,
      cratesCollected: 0,
      score: 0,
    };
  }

  return {
    status: 'countdown',
    timeRemaining: config.roundDuration,
    countdown: 3,
    arenaWidth: ARENA_WIDTH,
    arenaHeight: ARENA_HEIGHT,
    players,
    blocks,
    projectiles: [],
    mines: [],
    crates: [
      { id: 'crate-init-1', type: 'ammo', position: { x: 240, y: 320 }, radius: 14, pulseTimer: 0 },
      {
        id: 'crate-init-2',
        type: 'bouncing',
        position: { x: 720, y: 320 },
        radius: 14,
        pulseTimer: 0,
      },
    ],
    explosions: [],
    particles: [],
    treadMarks: [],
    stats,
  };
}

function spawnRandomCrate(blocks: ArenaBlock[]): PickupCrate | null {
  const types: PickupType[] = [
    'ammo',
    'health',
    'shield',
    'bouncing',
    'homing',
    'mine',
    'laser',
    'rubber',
  ];
  const type = types[Math.floor(Math.random() * types.length)];

  // Pick random position away from walls
  for (let attempt = 0; attempt < 20; attempt++) {
    const rx = 60 + Math.random() * (ARENA_WIDTH - 120);
    const ry = 60 + Math.random() * (ARENA_HEIGHT - 120);

    let collides = false;
    for (const b of blocks) {
      if (b.health <= 0) continue;
      if (circleIntersectsAABB(rx, ry, 24, b.x, b.y, b.width, b.height).collides) {
        collides = true;
        break;
      }
    }

    if (!collides) {
      return {
        id: `crate-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        position: { x: rx, y: ry },
        radius: 14,
        pulseTimer: 0,
      };
    }
  }

  return null;
}

export function stepTinyTankArena(
  state: TinyTankArenaState,
  inputs: Record<string, TankInput>,
  config: TinyTankConfig,
  dt: number,
): { nextState: TinyTankArenaState; events: EngineEvent[] } {
  const events: EngineEvent[] = [];

  // Countdown state
  if (state.status === 'countdown') {
    const nextCount = state.countdown - dt;
    if (nextCount <= 0) {
      return {
        nextState: {
          ...state,
          status: 'playing',
          countdown: 0,
        },
        events,
      };
    }
    return {
      nextState: {
        ...state,
        countdown: nextCount,
      },
      events,
    };
  }

  if (state.status !== 'playing') {
    return { nextState: state, events };
  }

  // Timer step
  const newTime = Math.max(0, state.timeRemaining - dt);
  const arenaBlocks = state.blocks.map((b) => ({ ...b }));
  let players = state.players.map((p) => ({
    ...p,
    weaponAmmo: { ...p.weaponAmmo },
  }));
  const projectiles = state.projectiles.map((p) => ({ ...p }));
  const mines = state.mines.map((m) => ({ ...m }));
  const crates = state.crates.map((c) => ({ ...c }));
  const explosions = state.explosions.map((e) => ({ ...e }));
  const particles = [...state.particles];
  const treadMarks = [...state.treadMarks];
  const stats = { ...state.stats };

  // 1. Process Bot Inputs & Updates
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.isAlive) continue;

    const input = p.isBot
      ? computeBotInput(p, players, arenaBlocks, crates, mines, config.botDifficulty, dt)
      : inputs[p.id] || {
          moveForward: false,
          moveBackward: false,
          turnLeft: false,
          turnRight: false,
          turretAngle: p.turretAngle,
          fire: false,
        };

    // Weapon switch if requested
    if (input.switchWeapon && input.switchWeapon !== p.activeWeapon) {
      if (input.switchWeapon === 'cannon' || (p.weaponAmmo[input.switchWeapon] ?? 0) > 0) {
        p.activeWeapon = input.switchWeapon;
      }
    }

    // Physics step
    const updated = updateTankPhysics(p, input, arenaBlocks, ARENA_WIDTH, ARENA_HEIGHT, dt);
    players[i] = updated;

    // Tread marks on ground when moving
    if ((input.moveForward || input.moveBackward) && Math.random() < 0.25) {
      treadMarks.push({
        x: updated.position.x,
        y: updated.position.y,
        angle: updated.angle,
        alpha: 0.45,
      });
    }

    // Firing weapons
    if (input.fire && updated.reloadTimer <= 0) {
      const activeWep = updated.activeWeapon;
      const hasAmmo =
        activeWep === 'cannon' ? updated.ammo > 0 : (updated.weaponAmmo[activeWep] ?? 0) > 0;

      if (hasAmmo) {
        if (activeWep === 'cannon') {
          updated.ammo = Math.max(0, updated.ammo - 1);
        } else {
          updated.weaponAmmo[activeWep] = Math.max(0, updated.weaponAmmo[activeWep] - 1);
          if (updated.weaponAmmo[activeWep] <= 0) {
            updated.activeWeapon = 'cannon';
          }
        }

        updated.recoilOffset = 6;
        if (stats[updated.id]) {
          stats[updated.id].shotsFired += 1;
        }

        // Fire specifics
        if (activeWep === 'mine') {
          // Drop proximity mine behind tank
          const rearDir = { x: -Math.cos(updated.angle), y: -Math.sin(updated.angle) };
          const minePos = vectorAdd(updated.position, vectorScale(rearDir, TANK_RADIUS + 12));
          mines.push({
            id: `mine-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            ownerId: updated.id,
            position: minePos,
            armTimer: 1.0,
            isArmed: false,
            triggerRadius: 36,
            blastRadius: 90,
            damage: 65,
            lifetime: 25,
          });
          updated.reloadTimer = 0.9;
          events.push({ type: 'fire', weapon: 'mine', position: minePos });
        } else {
          // Fire projectile forward from turret tip
          const tipDist = TANK_RADIUS + 10;
          const spawnPos = {
            x: updated.position.x + Math.cos(input.turretAngle) * tipDist,
            y: updated.position.y + Math.sin(input.turretAngle) * tipDist,
          };

          let speed = 440;
          let dmg = 30;
          let rad = 4.5;
          let bounces = 0;
          let life = 2.0;

          if (activeWep === 'bouncing') {
            speed = 400;
            dmg = 26;
            rad = 5;
            bounces = 2;
            life = 3.5;
          } else if (activeWep === 'homing') {
            speed = 220;
            dmg = 45;
            rad = 6;
            life = 3.2;
          } else if (activeWep === 'laser') {
            speed = 760;
            dmg = 20;
            rad = 3.5;
            life = 0.9;
          } else if (activeWep === 'rubber') {
            speed = 520;
            dmg = 10;
            rad = 6;
            bounces = 3;
            life = 3.0;
          }

          projectiles.push({
            id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            shooterId: updated.id,
            weapon: activeWep,
            position: spawnPos,
            velocity: {
              x: Math.cos(input.turretAngle) * speed,
              y: Math.sin(input.turretAngle) * speed,
            },
            angle: input.turretAngle,
            radius: rad,
            damage: dmg,
            bouncesRemaining: bounces,
            lifetime: life,
          });

          // Reload timers
          updated.reloadTimer =
            activeWep === 'laser'
              ? 0.18
              : activeWep === 'homing'
                ? 0.8
                : activeWep === 'bouncing'
                  ? 0.4
                  : 0.45;

          events.push({ type: 'fire', weapon: activeWep, position: spawnPos });
        }
      }
    }

    // Passive ammo regen for standard cannon (1 shell every 1.8 seconds up to maxAmmo)
    if (updated.ammo < updated.maxAmmo) {
      updated.ammo = Math.min(updated.maxAmmo, updated.ammo + dt / 1.8);
    }
  }

  // Resolve tank-tank body collisions
  players = resolveTankSeparation(players);

  // 2. Projectile Movement & Collisions
  const remainingProjectiles: Projectile[] = [];

  for (let p of projectiles) {
    // Find target for homing missile
    let targetPos: Vector2D | null = null;
    if (p.weapon === 'homing') {
      const enemies = players.filter((pl) => pl.id !== p.shooterId && pl.isAlive);
      let closestD = Infinity;
      for (const e of enemies) {
        const d = vectorDistance(p.position, e.position);
        if (d < closestD) {
          closestD = d;
          targetPos = e.position;
        }
      }
    }

    p = updateProjectilePhysics(p, targetPos, dt);
    if (p.lifetime <= 0) continue;

    let hit = false;

    // Check hit against blocks
    for (let bi = 0; bi < arenaBlocks.length; bi++) {
      const b = arenaBlocks[bi];
      if (b.health <= 0) continue;

      const coll = circleIntersectsAABB(
        p.position.x,
        p.position.y,
        p.radius,
        b.x,
        b.y,
        b.width,
        b.height,
      );

      if (coll.collides) {
        if (p.bouncesRemaining > 0) {
          p.bouncesRemaining -= 1;
          p.velocity = reflectVector(p.velocity, coll.normalX, coll.normalY);
          p.position.x += coll.normalX * (coll.depth + 1);
          p.position.y += coll.normalY * (coll.depth + 1);
          events.push({ type: 'ricochet', position: p.position });
          break;
        } else {
          hit = true;
          // Damage block
          if (b.type === 'brick') {
            b.health -= p.damage;
            if (b.health <= 0) {
              events.push({ type: 'explosion', position: { x: b.x + 20, y: b.y + 20 } });
              // 25% chance to drop crate
              if (Math.random() < 0.25) {
                crates.push({
                  id: `crate-drop-${Date.now()}`,
                  type: Math.random() < 0.5 ? 'ammo' : 'health',
                  position: { x: b.x + 20, y: b.y + 20 },
                  radius: 14,
                  pulseTimer: 0,
                });
              }
            }
          } else if (b.type === 'barrel') {
            b.health = 0;
            events.push({ type: 'barrel_boom', position: { x: b.x + 20, y: b.y + 20 } });
            explosions.push({
              id: `exp-barrel-${Date.now()}`,
              position: { x: b.x + 20, y: b.y + 20 },
              maxRadius: 95,
              currentRadius: 10,
              duration: 0.45,
              age: 0,
              color: '#f97316',
            });

            // Radial damage from barrel
            for (const victim of players) {
              if (!victim.isAlive) continue;
              const d = vectorDistance(victim.position, { x: b.x + 20, y: b.y + 20 });
              if (d < 95) {
                const splashDmg = Math.round(65 * (1 - d / 95));
                victim.health -= splashDmg;
                if (victim.health <= 0) {
                  victim.isAlive = false;
                  events.push({ type: 'tank_destroyed', position: victim.position });
                }
              }
            }
          }
          break;
        }
      }
    }

    if (hit) {
      events.push({ type: 'hit', position: p.position });
      continue;
    }

    // Check hit against tanks
    for (const target of players) {
      if (!target.isAlive || target.id === p.shooterId || target.invulnerableTimer > 0) continue;

      const d = vectorDistance(p.position, target.position);
      if (d < p.radius + TANK_RADIUS) {
        hit = true;
        events.push({ type: 'hit', position: p.position });

        let remainingDmg = p.damage;
        if (target.shield > 0) {
          if (target.shield >= remainingDmg) {
            target.shield -= remainingDmg;
            remainingDmg = 0;
          } else {
            remainingDmg -= target.shield;
            target.shield = 0;
          }
        }

        target.health -= remainingDmg;
        target.invulnerableTimer = 0.15;

        // Rubber shell knockback
        if (p.weapon === 'rubber') {
          const knockDir = vectorNormalize(p.velocity);
          target.velocity.x += knockDir.x * 380;
          target.velocity.y += knockDir.y * 380;
        }

        if (stats[p.shooterId]) {
          stats[p.shooterId].shotsHit += 1;
          stats[p.shooterId].damageDealt += p.damage;
        }

        if (target.health <= 0) {
          target.isAlive = false;
          events.push({ type: 'tank_destroyed', position: target.position });
          explosions.push({
            id: `exp-tank-${target.id}`,
            position: { ...target.position },
            maxRadius: 75,
            currentRadius: 10,
            duration: 0.5,
            age: 0,
            color: '#ef4444',
          });

          if (stats[p.shooterId]) {
            stats[p.shooterId].kills += 1;
            stats[p.shooterId].score += 100;
          }
        }
        break;
      }
    }

    if (!hit) {
      remainingProjectiles.push(p);
    }
  }

  // 3. Proximity Mines Logic
  const remainingMines: ProximityMine[] = [];
  for (const m of mines) {
    m.lifetime -= dt;
    if (m.lifetime <= 0) continue;

    if (!m.isArmed) {
      m.armTimer -= dt;
      if (m.armTimer <= 0) {
        m.isArmed = true;
        events.push({ type: 'mine_arm', position: m.position });
      }
    }

    let triggered = false;
    if (m.isArmed) {
      for (const p of players) {
        if (!p.isAlive) continue;
        const d = vectorDistance(p.position, m.position);
        if (d < m.triggerRadius + TANK_RADIUS) {
          triggered = true;
          break;
        }
      }
    }

    if (triggered) {
      events.push({ type: 'explosion', position: m.position });
      explosions.push({
        id: `exp-mine-${m.id}`,
        position: { ...m.position },
        maxRadius: m.blastRadius,
        currentRadius: 8,
        duration: 0.45,
        age: 0,
        color: '#f59e0b',
      });

      // Apply splash damage & impulse to nearby tanks
      for (const p of players) {
        if (!p.isAlive) continue;
        const dist = vectorDistance(p.position, m.position);
        if (dist < m.blastRadius) {
          const factor = 1 - dist / m.blastRadius;
          const dmg = Math.round(m.damage * factor);
          p.health -= dmg;

          const awayDir = vectorNormalize(vectorSub(p.position, m.position));
          p.velocity.x += awayDir.x * 400 * factor;
          p.velocity.y += awayDir.y * 400 * factor;

          if (p.health <= 0) {
            p.isAlive = false;
            events.push({ type: 'tank_destroyed', position: p.position });
            if (stats[m.ownerId]) {
              stats[m.ownerId].kills += 1;
              stats[m.ownerId].score += 100;
            }
          }
        }
      }
    } else {
      remainingMines.push(m);
    }
  }

  // 4. Pickup Crates Collection
  const remainingCrates: PickupCrate[] = [];
  for (const crate of crates) {
    crate.pulseTimer += dt;
    let collected = false;

    for (const p of players) {
      if (!p.isAlive) continue;
      const d = vectorDistance(p.position, crate.position);
      if (d < crate.radius + TANK_RADIUS) {
        collected = true;
        events.push({ type: 'crate_pickup', position: crate.position });

        if (stats[p.id]) {
          stats[p.id].cratesCollected += 1;
          stats[p.id].score += 20;
        }

        // Apply crate bonus
        switch (crate.type) {
          case 'ammo':
            p.ammo = p.maxAmmo;
            break;
          case 'health':
            p.health = Math.min(p.maxHealth, p.health + 45);
            break;
          case 'shield':
            p.shield = p.maxShield;
            break;
          case 'bouncing':
            p.weaponAmmo.bouncing = (p.weaponAmmo.bouncing || 0) + 8;
            p.activeWeapon = 'bouncing';
            break;
          case 'homing':
            p.weaponAmmo.homing = (p.weaponAmmo.homing || 0) + 4;
            p.activeWeapon = 'homing';
            break;
          case 'mine':
            p.weaponAmmo.mine = (p.weaponAmmo.mine || 0) + 3;
            p.activeWeapon = 'mine';
            break;
          case 'laser':
            p.weaponAmmo.laser = (p.weaponAmmo.laser || 0) + 15;
            p.activeWeapon = 'laser';
            break;
          case 'rubber':
            p.weaponAmmo.rubber = (p.weaponAmmo.rubber || 0) + 10;
            p.activeWeapon = 'rubber';
            break;
        }
        break;
      }
    }

    if (!collected) {
      remainingCrates.push(crate);
    }
  }

  // Periodically spawn new crate if fewer than 3 active
  if (remainingCrates.length < 3 && Math.random() < dt * 0.25) {
    const newCrate = spawnRandomCrate(arenaBlocks);
    if (newCrate) remainingCrates.push(newCrate);
  }

  // 5. Update Explosions
  const activeExplosions: ExplosionEffect[] = [];
  for (const exp of explosions) {
    exp.age += dt;
    exp.currentRadius = (exp.age / exp.duration) * exp.maxRadius;
    if (exp.age < exp.duration) {
      activeExplosions.push(exp);
    }
  }

  // 6. Update Tread Marks Fade
  const activeTreads = treadMarks
    .map((t) => ({ ...t, alpha: t.alpha - dt * 0.04 }))
    .filter((t) => t.alpha > 0.05);

  // 7. Check Victory Condition
  const alivePlayers = players.filter((p) => p.isAlive);
  let status: TinyTankArenaState['status'] = 'playing';
  let winnerId: string | undefined;
  let winnerName: string | undefined;

  if (alivePlayers.length <= 1 || newTime <= 0) {
    status = 'match_over';
    if (alivePlayers.length === 1) {
      winnerId = alivePlayers[0].id;
      winnerName = alivePlayers[0].name;
    } else {
      // Tiebreak by score or highest health
      const sorted = [...players].sort(
        (a, b) => (stats[b.id]?.score ?? 0) - (stats[a.id]?.score ?? 0),
      );
      winnerId = sorted[0]?.id;
      winnerName = sorted[0]?.name;
    }
  }

  return {
    nextState: {
      ...state,
      status,
      timeRemaining: newTime,
      players,
      blocks: arenaBlocks.filter((b) => b.health > 0),
      projectiles: remainingProjectiles,
      mines: remainingMines,
      crates: remainingCrates,
      explosions: activeExplosions,
      particles,
      treadMarks: activeTreads,
      winnerId,
      winnerName,
      stats,
    },
    events,
  };
}
