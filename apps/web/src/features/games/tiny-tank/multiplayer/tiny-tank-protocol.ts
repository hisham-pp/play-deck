import type {
  TankInput,
  TankPlayer,
  ArenaBlock,
  Projectile,
  ProximityMine,
  PickupCrate,
  TinyTankMatchStats,
  WeaponType,
  Vector2D,
} from '../types/tiny-tank.types';

export const TINY_TANK_CHANNEL_PREFIX = 'tiny-tank-room:';

export type TinyTankWireMessage =
  | {
      type: 'TINY_TANK_JOIN';
      payload: { playerId: string; playerName: string; color: string };
    }
  | {
      type: 'TINY_TANK_READY';
      payload: { playerId: string; isReady: boolean };
    }
  | {
      type: 'TINY_TANK_START';
      payload: { roundDuration: number; startTime: number };
    }
  | {
      type: 'TINY_TANK_INPUT';
      payload: { playerId: string; input: TankInput };
    }
  | {
      type: 'TINY_TANK_FIRE';
      payload: { playerId: string; weapon: WeaponType; position: Vector2D; angle: number };
    }
  | {
      type: 'TINY_TANK_SYNC';
      payload: {
        timeRemaining: number;
        players: TankPlayer[];
        blocks: ArenaBlock[];
        projectiles: Projectile[];
        mines: ProximityMine[];
        crates: PickupCrate[];
      };
    }
  | {
      type: 'TINY_TANK_END';
      payload: {
        winnerId?: string;
        winnerName?: string;
        stats: Record<string, TinyTankMatchStats>;
      };
    };

export function isTinyTankMessage(data: unknown): data is TinyTankWireMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as { type?: unknown; payload?: unknown };
  return (
    typeof msg.type === 'string' &&
    msg.type.startsWith('TINY_TANK_') &&
    typeof msg.payload === 'object' &&
    msg.payload !== null
  );
}
