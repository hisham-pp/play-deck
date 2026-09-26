import {
  type ExplosionEffect,
  type TankInput,
  type TankPlayer,
  type TinyTankArenaState,
  type TinyTankConfig,
  type TinyTankMatchStats,
  type Vector2D,
  type WeaponType,
} from '../types/tiny-tank.types';
import { spawnRandomCrate } from './tank-crates';
import { updateProximityMines } from './tank-mines';
import { resolveTankSeparation } from './tank-physics';
import { updateCrates } from './tank-pickups';
import { processSingleTank } from './tank-process';
import { updateProjectiles } from './tank-projectiles';

export * from './tank-init';
export * from './tank-maps';

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

function evaluateVictory(
  players: TankPlayer[],
  stats: Record<string, TinyTankMatchStats>,
  newTime: number,
): { status: TinyTankArenaState['status']; winnerId?: string; winnerName?: string } {
  const alivePlayers = players.filter((p) => p.isAlive);
  if (alivePlayers.length > 1 && newTime > 0) {
    return { status: 'playing' };
  }

  if (alivePlayers.length === 1) {
    return {
      status: 'match_over',
      winnerId: alivePlayers[0].id,
      winnerName: alivePlayers[0].name,
    };
  }

  const sorted = [...players].sort((a, b) => (stats[b.id]?.score ?? 0) - (stats[a.id]?.score ?? 0));
  return {
    status: 'match_over',
    winnerId: sorted[0]?.id,
    winnerName: sorted[0]?.name,
  };
}

export function stepTinyTankArena(
  state: TinyTankArenaState,
  inputs: Record<string, TankInput>,
  config: TinyTankConfig,
  dt: number,
): { nextState: TinyTankArenaState; events: EngineEvent[] } {
  const events: EngineEvent[] = [];

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

  for (let i = 0; i < players.length; i++) {
    if (players[i].isAlive) {
      players[i] = processSingleTank(
        players[i],
        players,
        inputs,
        arenaBlocks,
        crates,
        mines,
        projectiles,
        stats,
        config,
        dt,
        events,
        treadMarks,
      );
    }
  }

  players = resolveTankSeparation(players);

  const remainingProjectiles = updateProjectiles(
    projectiles,
    arenaBlocks,
    players,
    crates,
    explosions,
    stats,
    dt,
    {
      onHit: (pos) => events.push({ type: 'hit', position: pos }),
      onRicochet: (pos) => events.push({ type: 'ricochet', position: pos }),
      onExplosion: (pos) => events.push({ type: 'explosion', position: pos }),
      onBarrelBoom: (pos) => events.push({ type: 'barrel_boom', position: pos }),
      onTankDestroyed: (pos) => events.push({ type: 'tank_destroyed', position: pos }),
    },
  );

  const remainingMines = updateProximityMines(
    mines,
    players,
    explosions,
    stats,
    dt,
    (pos) => events.push({ type: 'mine_arm', position: pos }),
    (pos) => events.push({ type: 'explosion', position: pos }),
    (pos) => events.push({ type: 'tank_destroyed', position: pos }),
  );

  const remainingCrates = updateCrates(crates, players, stats, dt, (pos) =>
    events.push({ type: 'crate_pickup', position: pos }),
  );

  if (remainingCrates.length < 3 && Math.random() < dt * 0.25) {
    const newCrate = spawnRandomCrate(arenaBlocks);
    if (newCrate) remainingCrates.push(newCrate);
  }

  const activeExplosions: ExplosionEffect[] = [];
  for (const exp of explosions) {
    exp.age += dt;
    exp.currentRadius = (exp.age / exp.duration) * exp.maxRadius;
    if (exp.age < exp.duration) {
      activeExplosions.push(exp);
    }
  }

  const activeTreads = treadMarks
    .map((t) => ({ ...t, alpha: t.alpha - dt * 0.04 }))
    .filter((t) => t.alpha > 0.05);

  const victory = evaluateVictory(players, stats, newTime);

  return {
    nextState: {
      ...state,
      status: victory.status,
      timeRemaining: newTime,
      players,
      blocks: arenaBlocks.filter((b) => b.health > 0),
      projectiles: remainingProjectiles,
      mines: remainingMines,
      crates: remainingCrates,
      explosions: activeExplosions,
      particles,
      treadMarks: activeTreads,
      winnerId: victory.winnerId,
      winnerName: victory.winnerName,
      stats,
    },
    events,
  };
}
