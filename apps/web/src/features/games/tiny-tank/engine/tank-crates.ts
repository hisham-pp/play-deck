import {
  PICKUP_AMMO,
  PICKUP_HEALTH,
  PICKUP_SHIELD,
  WEAPON_BOUNCING,
  WEAPON_HOMING,
  WEAPON_LASER,
  WEAPON_MINE,
  WEAPON_RUBBER,
  type ArenaBlock,
  type PickupCrate,
  type PickupType,
} from '../types/tiny-tank.types';
import { ARENA_HEIGHT, ARENA_WIDTH } from './tank-maps';
import { circleIntersectsAABB } from './tank-physics';

export const ALL_PICKUP_TYPES: readonly PickupType[] = [
  PICKUP_AMMO,
  PICKUP_HEALTH,
  PICKUP_SHIELD,
  WEAPON_BOUNCING,
  WEAPON_HOMING,
  WEAPON_MINE,
  WEAPON_LASER,
  WEAPON_RUBBER,
] as const;

export function spawnRandomCrate(blocks: ArenaBlock[]): PickupCrate | null {
  const type = ALL_PICKUP_TYPES[Math.floor(Math.random() * ALL_PICKUP_TYPES.length)];

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
