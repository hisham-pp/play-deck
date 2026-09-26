import {
  type ExplosionEffect,
  type ProximityMine,
  type TankPlayer,
  type TinyTankMatchStats,
} from '../types/tiny-tank.types';
import { TANK_RADIUS, vectorDistance, vectorNormalize, vectorSub } from './tank-physics';

function isMineTriggered(m: ProximityMine, players: TankPlayer[]): boolean {
  if (!m.isArmed) return false;
  for (const p of players) {
    if (!p.isAlive) continue;
    const d = vectorDistance(p.position, m.position);
    if (d < m.triggerRadius + TANK_RADIUS) {
      return true;
    }
  }
  return false;
}

function applyMineBlast(
  m: ProximityMine,
  players: TankPlayer[],
  stats: Record<string, TinyTankMatchStats>,
  onTankDestroyed: (pos: TankPlayer['position']) => void,
) {
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
        onTankDestroyed(p.position);
        if (stats[m.ownerId]) {
          stats[m.ownerId].kills += 1;
          stats[m.ownerId].score += 100;
        }
      }
    }
  }
}

export function updateProximityMines(
  mines: ProximityMine[],
  players: TankPlayer[],
  explosions: ExplosionEffect[],
  stats: Record<string, TinyTankMatchStats>,
  dt: number,
  onMineArm: (pos: ProximityMine['position']) => void,
  onMineExplode: (pos: ProximityMine['position']) => void,
  onTankDestroyed: (pos: TankPlayer['position']) => void,
): ProximityMine[] {
  const remainingMines: ProximityMine[] = [];

  for (const m of mines) {
    m.lifetime -= dt;
    if (m.lifetime <= 0) continue;

    if (!m.isArmed) {
      m.armTimer -= dt;
      if (m.armTimer <= 0) {
        m.isArmed = true;
        onMineArm(m.position);
      }
    }

    if (isMineTriggered(m, players)) {
      onMineExplode(m.position);
      explosions.push({
        id: `exp-mine-${m.id}`,
        position: { ...m.position },
        maxRadius: m.blastRadius,
        currentRadius: 8,
        duration: 0.45,
        age: 0,
        color: '#f59e0b',
      });

      applyMineBlast(m, players, stats, onTankDestroyed);
    } else {
      remainingMines.push(m);
    }
  }

  return remainingMines;
}
