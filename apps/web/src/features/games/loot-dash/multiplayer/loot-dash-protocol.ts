import type {
  DashInput,
  DashPlayer,
  LootDashMatchStats,
  LootItem,
  ObstacleBlock,
  Trap,
} from '../types/loot-dash.types';

export const LOOT_DASH_CHANNEL_PREFIX = 'loot-dash-room:';

export type LootDashWireMessage =
  | {
      type: 'LOOT_DASH_JOIN';
      payload: { playerId: string; playerName: string; color: string };
    }
  | {
      type: 'LOOT_DASH_READY';
      payload: { playerId: string; isReady: boolean };
    }
  | {
      type: 'LOOT_DASH_START';
      payload: { roundDuration: number; targetScore: number; startTime: number };
    }
  | {
      type: 'LOOT_DASH_INPUT';
      payload: { playerId: string; input: DashInput };
    }
  | {
      type: 'LOOT_DASH_SYNC';
      payload: {
        timeRemaining: number;
        players: DashPlayer[];
        loot: LootItem[];
        traps: Trap[];
        obstacles: ObstacleBlock[];
      };
    }
  | {
      type: 'LOOT_DASH_END';
      payload: {
        winnerId?: string;
        winnerName?: string;
        stats: Record<string, LootDashMatchStats>;
      };
    };

export function isLootDashMessage(data: unknown): data is LootDashWireMessage {
  if (!data || typeof data !== 'object') return false;
  const msg = data as { type?: unknown; payload?: unknown };
  return (
    typeof msg.type === 'string' &&
    msg.type.startsWith('LOOT_DASH_') &&
    typeof msg.payload === 'object' &&
    msg.payload !== null
  );
}
