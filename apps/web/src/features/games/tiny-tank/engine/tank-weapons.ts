import {
  WEAPON_BOUNCING,
  WEAPON_CANNON,
  WEAPON_HOMING,
  WEAPON_LASER,
  WEAPON_MINE,
  WEAPON_RUBBER,
  type Projectile,
  type ProximityMine,
  type TankPlayer,
  type Vector2D,
  type WeaponType,
} from '../types/tiny-tank.types';

export interface WeaponProfile {
  speed: number;
  damage: number;
  radius: number;
  bounces: number;
  lifetime: number;
  reload: number;
}

export const WEAPON_PROFILES: Record<WeaponType, WeaponProfile> = {
  [WEAPON_CANNON]: { speed: 440, damage: 30, radius: 4.5, bounces: 0, lifetime: 2.0, reload: 0.45 },
  [WEAPON_BOUNCING]: {
    speed: 400,
    damage: 26,
    radius: 5.0,
    bounces: 2,
    lifetime: 3.5,
    reload: 0.4,
  },
  [WEAPON_HOMING]: { speed: 220, damage: 45, radius: 6.0, bounces: 0, lifetime: 3.2, reload: 0.8 },
  [WEAPON_LASER]: { speed: 760, damage: 20, radius: 3.5, bounces: 0, lifetime: 0.9, reload: 0.18 },
  [WEAPON_RUBBER]: { speed: 520, damage: 10, radius: 6.0, bounces: 3, lifetime: 3.0, reload: 0.45 },
  [WEAPON_MINE]: { speed: 0, damage: 70, radius: 10, bounces: 0, lifetime: 30, reload: 1.0 },
};

export function createProjectile(
  player: TankPlayer,
  weapon: WeaponType,
  spawnPos: Vector2D,
  turretAngle: number,
): Projectile {
  const profile = WEAPON_PROFILES[weapon] ?? WEAPON_PROFILES[WEAPON_CANNON];
  return {
    id: `proj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    shooterId: player.id,
    weapon,
    position: spawnPos,
    velocity: {
      x: Math.cos(turretAngle) * profile.speed,
      y: Math.sin(turretAngle) * profile.speed,
    },
    angle: turretAngle,
    radius: profile.radius,
    damage: profile.damage,
    bouncesRemaining: profile.bounces,
    lifetime: profile.lifetime,
  };
}

export function createMine(player: TankPlayer, spawnPos: Vector2D): ProximityMine {
  return {
    id: `mine-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    ownerId: player.id,
    position: spawnPos,
    armTimer: 0.8,
    isArmed: false,
    triggerRadius: 28,
    blastRadius: 90,
    damage: 70,
    lifetime: 30,
  };
}
