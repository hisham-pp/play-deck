import {
  DEFAULT_PLAYER_ID,
  PICKUP_AMMO,
  WEAPON_BOUNCING,
  WEAPON_CANNON,
  WEAPON_HOMING,
  WEAPON_LASER,
  WEAPON_MINE,
  WEAPON_RUBBER,
  type TankPlayer,
  type TinyTankArenaState,
  type TinyTankConfig,
  type TinyTankMatchStats,
} from '../types/tiny-tank.types';
import {
  ARENA_HEIGHT,
  ARENA_SPAWN_POINTS,
  ARENA_WIDTH,
  generateDefaultArena,
  PLAYER_COLORS,
} from './tank-maps';

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
    const pId = isBot ? `bot-${i}` : DEFAULT_PLAYER_ID;
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
      activeWeapon: WEAPON_CANNON,
      weaponAmmo: {
        [WEAPON_CANNON]: Infinity,
        [WEAPON_BOUNCING]: 0,
        [WEAPON_HOMING]: 0,
        [WEAPON_MINE]: 0,
        [WEAPON_LASER]: 0,
        [WEAPON_RUBBER]: 0,
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
      {
        id: 'crate-init-1',
        type: PICKUP_AMMO,
        position: { x: 240, y: 320 },
        radius: 14,
        pulseTimer: 0,
      },
      {
        id: 'crate-init-2',
        type: WEAPON_BOUNCING,
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
