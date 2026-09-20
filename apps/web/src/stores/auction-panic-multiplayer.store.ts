import { create } from 'zustand';

import { BOT_ARCHETYPES } from '@/features/games/auction-panic/engine/auction-bot';
import { STARTING_BUDGET } from '@/features/games/auction-panic/engine/auction-engine';
import type { AuctionPlayer } from '@/features/games/auction-panic/types/auction-panic.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const AUCTION_GAME_ID = 'auction-panic';
export const AUCTION_CHANNEL = 'auction-panic';
export const MIN_AUCTION_PLAYERS = 2;
export const MAX_AUCTION_PLAYERS = 6;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';

export const AUCTION_PLAYER_COLORS = [
  '#f59e0b',
  '#06b6d4',
  '#10b981',
  '#ec4899',
  '#8b5cf6',
  '#f97316',
];

export interface AuctionRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface AuctionMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: AuctionPlayer[];
  roundCount: number;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: AuctionRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: AuctionRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: AuctionMultiplayerState['status']) => void;
  isHost: () => boolean;
  setRoundCount: (count: number) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  color: string,
  isBot: boolean,
  archetype?: string,
): AuctionPlayer {
  return {
    id,
    name,
    avatar: avatar || '🎩',
    color,
    isBot,
    coins: STARTING_BUDGET,
    startingCoins: STARTING_BUDGET,
    wonItems: [],
    currentBid: 0,
    hasPassed: false,
    archetype,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: AuctionPlayer[],
  hostId: string | null,
): AuctionPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: AuctionPlayer[] = presences.map((pres, idx) => {
    const isHost = pres.playerId === hostId;
    const color = AUCTION_PLAYER_COLORS[idx % AUCTION_PLAYER_COLORS.length]!;
    const name = pres.displayName + (isHost ? ' (Host)' : '');
    return makeRosterPlayer(pres.playerId, name, pres.avatar ?? '🎩', color, false);
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_AUCTION_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useAuctionMultiplayerStore = create<AuctionMultiplayerState>((set, get) => {
  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((presences: PlayerPresence[]) => {
      const { hostId, players, status } = get();
      if (status === 'playing') return;
      set({ players: syncPresences(presences, players, hostId) });
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: STATUS_IDLE,
    players: [],
    roundCount: 7,
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    setRoundCount: (roundCount) => set({ roundCount }),
    setStatus: (status) => set({ status }),

    createRoom: async (host) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(AUCTION_GAME_ID, host.id);
        const transport = new SupabaseTransportService(AUCTION_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '👑',
          role: 'host',
        };

        const initialPlayer = makeRosterPlayer(
          host.id,
          `${host.displayName} (Host)`,
          host.avatar,
          AUCTION_PLAYER_COLORS[0]!,
          false,
        );

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: STATUS_LOBBY,
          transport,
          players: [initialPlayer],
          error: null,
        });

        await transport.connect(room.code, presence);
        attachPresence(transport);
        return room.code;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to create auction room';
        set({ status: 'error', error });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.fetchRoomByCode(code, AUCTION_GAME_ID);
        if (!room || room.gameId !== AUCTION_GAME_ID) {
          set({ status: 'error', error: 'Auction room not found' });
          return false;
        }

        const transport = new SupabaseTransportService(AUCTION_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🎩',
          role: 'guest',
        };

        const localPlayer = makeRosterPlayer(
          identity.id,
          identity.displayName,
          identity.avatar,
          AUCTION_PLAYER_COLORS[1]!,
          false,
        );

        set({
          roomCode: code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: STATUS_LOBBY,
          transport,
          players: [localPlayer],
          error: null,
        });

        await transport.connect(code, presence);
        attachPresence(transport);
        return true;
      } catch (err) {
        const error = err instanceof Error ? err.message : 'Failed to join auction room';
        set({ status: 'error', error });
        return false;
      }
    },

    leaveRoom: () => {
      const { transport } = get();
      if (transport) {
        transport.disconnect();
      }
      set({
        roomCode: null,
        hostId: null,
        localPlayerId: null,
        status: STATUS_IDLE,
        players: [],
        transport: null,
        error: null,
      });
    },

    addBot: () => {
      const { players } = get();
      if (players.length >= MAX_AUCTION_PLAYERS) return;

      const botIndex = players.filter((p) => p.isBot).length + 1;
      const archetype = BOT_ARCHETYPES[(botIndex - 1) % BOT_ARCHETYPES.length]!;
      const color = AUCTION_PLAYER_COLORS[players.length % AUCTION_PLAYER_COLORS.length]!;
      const botNames: Record<string, string> = {
        'aggressive-tycoon': 'Lord Sterling [Bot]',
        'bargain-hunter': 'Penny Snipe [Bot]',
        'set-collector': 'Museum Curator [Bot]',
        'wild-gambler': 'Lucky Jack [Bot]',
      };

      const bot = makeRosterPlayer(
        `bot-${Date.now()}-${botIndex}`,
        botNames[archetype] ?? `Bidder Bot ${botIndex}`,
        '🤖',
        color,
        true,
        archetype,
      );

      set({ players: [...players, bot] });
    },

    removeBot: (botId) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },
  };
});
