import { create } from 'zustand';

import type { TrustPlayer } from '@/features/games/trust-or-betray/types/trust-or-betray.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const TRUST_GAME_ID = 'trust-or-betray';
export const TRUST_CHANNEL = 'trust-or-betray';
export const MIN_TRUST_PLAYERS = 3;
export const MAX_TRUST_PLAYERS = 8;

export const TRUST_PLAYER_COLORS = [
  '#06b6d4',
  '#ef4444',
  '#f59e0b',
  '#a855f7',
  '#10b981',
  '#ec4899',
  '#3b82f6',
  '#84cc16',
];

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface TrustOrBetrayMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: TrustPlayer[];
  roundCount: number;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: TrustOrBetrayMultiplayerState['status']) => void;
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
): TrustPlayer {
  return {
    id,
    name,
    avatar: avatar || '👤',
    color,
    isBot,
    score: 0,
    currentChoice: null,
    hasLockedIn: false,
    trustRating: 50,
    trustLevel: 'neutral',
    cooperationCount: 0,
    betrayalCount: 0,
    isExiled: false,
    exileRoundsRemaining: 0,
    votesAgainst: 0,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: TrustPlayer[],
  hostId: string | null,
): TrustPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: TrustPlayer[] = presences.map((pres, idx) => {
    const isHost = pres.playerId === hostId;
    const color = TRUST_PLAYER_COLORS[idx % TRUST_PLAYER_COLORS.length];
    const name = pres.displayName + (isHost ? ' (Host)' : '');
    return makeRosterPlayer(pres.playerId, name, pres.avatar ?? '👤', color, false);
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_TRUST_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useTrustMultiplayerStore = create<TrustOrBetrayMultiplayerState>((set, get) => {
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
    status: 'idle',
    players: [],
    roundCount: 5,
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
        set({ status: 'idle', error: null });
        const room = await RoomService.createRoom(TRUST_GAME_ID, host.id);
        const transport = new SupabaseTransportService(TRUST_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '⭐',
          role: 'host',
        };

        const initialPlayer = makeRosterPlayer(
          host.id,
          `${host.displayName} (Host)`,
          host.avatar,
          TRUST_PLAYER_COLORS[0],
          false,
        );

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: 'lobby',
          players: [initialPlayer],
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);
        return room.code;
      } catch {
        set({ error: 'Room creation failed', status: 'error' });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        set({ status: 'idle', error: null });
        const room = await RoomService.fetchRoomByCode(code.trim().toUpperCase(), TRUST_GAME_ID);
        if (!room || room.gameId !== TRUST_GAME_ID) {
          throw new Error('Room not found');
        }

        const transport = new SupabaseTransportService(TRUST_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🕵️',
          role: 'guest',
        };

        set({
          roomCode: room.code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: 'lobby',
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, presence);
        return true;
      } catch {
        set({ error: 'Failed to join room', status: 'error' });
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
        status: 'idle',
        players: [],
        transport: null,
        error: null,
      });
    },

    addBot: () => {
      const { players } = get();
      if (players.length >= MAX_TRUST_PLAYERS) return;

      const archetypes = ['saint', 'opportunist', 'grudgebearer', 'wildcard'] as const;
      const botIdx = players.filter((p) => p.isBot).length;
      const arch = archetypes[botIdx % archetypes.length];
      const botId = `bot-${Date.now()}-${botIdx}`;
      const color = TRUST_PLAYER_COLORS[players.length % TRUST_PLAYER_COLORS.length];
      const botPlayer: TrustPlayer = {
        ...makeRosterPlayer(botId, `Bot ${arch.toUpperCase()}`, '🤖', color, true),
        archetype: arch,
      };

      set({ players: [...players, botPlayer] });
    },

    removeBot: (botId) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },
  };
});
