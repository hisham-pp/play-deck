import {
  PICKUP_AMMO,
  PICKUP_HEALTH,
  PICKUP_SHIELD,
  WEAPON_BOUNCING,
  WEAPON_HOMING,
  WEAPON_LASER,
  WEAPON_MINE,
  WEAPON_RUBBER,
  type PickupCrate,
  type TankPlayer,
  type TinyTankMatchStats,
} from '../types/tiny-tank.types';
import { TANK_RADIUS, vectorDistance } from './tank-physics';

export interface CratePickupResult {
  collected: boolean;
}

export function applyCrateBonus(player: TankPlayer, type: PickupCrate['type']): void {
  switch (type) {
    case PICKUP_AMMO:
      player.ammo = player.maxAmmo;
      break;
    case PICKUP_HEALTH:
      player.health = Math.min(player.maxHealth, player.health + 45);
      break;
    case PICKUP_SHIELD:
      player.shield = player.maxShield;
      break;
    case WEAPON_BOUNCING:
      player.weaponAmmo.bouncing = (player.weaponAmmo.bouncing || 0) + 8;
      player.activeWeapon = WEAPON_BOUNCING;
      break;
    case WEAPON_HOMING:
      player.weaponAmmo.homing = (player.weaponAmmo.homing || 0) + 4;
      player.activeWeapon = WEAPON_HOMING;
      break;
    case WEAPON_MINE:
      player.weaponAmmo.mine = (player.weaponAmmo.mine || 0) + 3;
      player.activeWeapon = WEAPON_MINE;
      break;
    case WEAPON_LASER:
      player.weaponAmmo.laser = (player.weaponAmmo.laser || 0) + 15;
      player.activeWeapon = WEAPON_LASER;
      break;
    case WEAPON_RUBBER:
      player.weaponAmmo.rubber = (player.weaponAmmo.rubber || 0) + 10;
      player.activeWeapon = WEAPON_RUBBER;
      break;
  }
}

export function updateCrates(
  crates: PickupCrate[],
  players: TankPlayer[],
  stats: Record<string, TinyTankMatchStats>,
  dt: number,
  onPickupEvent: (pos: PickupCrate['position']) => void,
): PickupCrate[] {
  const remainingCrates: PickupCrate[] = [];

  for (const crate of crates) {
    crate.pulseTimer += dt;
    let collected = false;

    for (const p of players) {
      if (!p.isAlive) continue;
      const d = vectorDistance(p.position, crate.position);
      if (d < crate.radius + TANK_RADIUS) {
        collected = true;
        onPickupEvent(crate.position);

        if (stats[p.id]) {
          stats[p.id].cratesCollected += 1;
          stats[p.id].score += 20;
        }

        applyCrateBonus(p, crate.type);
        break;
      }
    }

    if (!collected) {
      remainingCrates.push(crate);
    }
  }

  return remainingCrates;
}
