import {
  WEAPON_CANNON,
  WEAPON_MINE,
  type ArenaBlock,
  type PickupCrate,
  type Projectile,
  type ProximityMine,
  type TankInput,
  type TankPlayer,
  type TinyTankConfig,
  type TinyTankMatchStats,
  type Vector2D,
  type WeaponType,
} from '../types/tiny-tank.types';
import { computeBotInput } from './tank-bot';
import { ARENA_HEIGHT, ARENA_WIDTH } from './tank-maps';
import { TANK_RADIUS, updateTankPhysics, vectorAdd, vectorScale } from './tank-physics';
import { createMine, createProjectile, WEAPON_PROFILES } from './tank-weapons';

export interface TankProcessEvent {
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

export function handleTankFire(
  updated: TankPlayer,
  turretAngle: number,
  projectiles: Projectile[],
  mines: ProximityMine[],
  stats: Record<string, TinyTankMatchStats>,
  events: TankProcessEvent[],
) {
  const activeWep = updated.activeWeapon;
  const hasAmmo =
    activeWep === WEAPON_CANNON ? updated.ammo > 0 : (updated.weaponAmmo[activeWep] ?? 0) > 0;

  if (!hasAmmo) return;

  if (activeWep === WEAPON_CANNON) {
    updated.ammo = Math.max(0, updated.ammo - 1);
  } else {
    updated.weaponAmmo[activeWep] = Math.max(0, updated.weaponAmmo[activeWep] - 1);
    if (updated.weaponAmmo[activeWep] <= 0) {
      updated.activeWeapon = WEAPON_CANNON;
    }
  }

  updated.recoilOffset = 6;
  if (stats[updated.id]) {
    stats[updated.id].shotsFired += 1;
  }

  if (activeWep === WEAPON_MINE) {
    const rearDir = { x: -Math.cos(updated.angle), y: -Math.sin(updated.angle) };
    const minePos = vectorAdd(updated.position, vectorScale(rearDir, TANK_RADIUS + 12));
    mines.push(createMine(updated, minePos));
    updated.reloadTimer = WEAPON_PROFILES[WEAPON_MINE].reload;
    events.push({ type: 'fire', weapon: WEAPON_MINE, position: minePos });
  } else {
    const tipDist = TANK_RADIUS + 10;
    const spawnPos = {
      x: updated.position.x + Math.cos(turretAngle) * tipDist,
      y: updated.position.y + Math.sin(turretAngle) * tipDist,
    };
    projectiles.push(createProjectile(updated, activeWep, spawnPos, turretAngle));
    updated.reloadTimer = WEAPON_PROFILES[activeWep]?.reload ?? 0.45;
    events.push({ type: 'fire', weapon: activeWep, position: spawnPos });
  }
}

export function processSingleTank(
  p: TankPlayer,
  players: TankPlayer[],
  inputs: Record<string, TankInput>,
  arenaBlocks: ArenaBlock[],
  crates: PickupCrate[],
  mines: ProximityMine[],
  projectiles: Projectile[],
  stats: Record<string, TinyTankMatchStats>,
  config: TinyTankConfig,
  dt: number,
  events: TankProcessEvent[],
  treadMarks: { x: number; y: number; angle: number; alpha: number }[],
): TankPlayer {
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

  if (input.switchWeapon && input.switchWeapon !== p.activeWeapon) {
    if (input.switchWeapon === WEAPON_CANNON || (p.weaponAmmo[input.switchWeapon] ?? 0) > 0) {
      p.activeWeapon = input.switchWeapon;
    }
  }

  const updated = updateTankPhysics(p, input, arenaBlocks, ARENA_WIDTH, ARENA_HEIGHT, dt);

  if ((input.moveForward || input.moveBackward) && Math.random() < 0.25) {
    treadMarks.push({
      x: updated.position.x,
      y: updated.position.y,
      angle: updated.angle,
      alpha: 0.45,
    });
  }

  if (input.fire && updated.reloadTimer <= 0) {
    handleTankFire(updated, input.turretAngle, projectiles, mines, stats, events);
  }

  if (updated.ammo < updated.maxAmmo) {
    updated.ammo = Math.min(updated.maxAmmo, updated.ammo + dt / 1.8);
  }

  return updated;
}
