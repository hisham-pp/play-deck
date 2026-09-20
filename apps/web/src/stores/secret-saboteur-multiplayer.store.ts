import { create } from 'zustand';

import type { SaboteurPlayer } from '@/features/games/secret-saboteur/types/secret-saboteur.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const SABOTEUR_GAME_ID = 'secret-saboteur';
export const SABOTEUR_CHANNEL = 'secret-saboteur';
export const MIN_SABOTEUR_PLAYERS = 4;
export const MAX_SABOTEUR_PLAYERS = 8;

export const SABOTEUR_PLAYER_COLORS = [
  '#06b6d4',
  '#ef4444',
  '#f59e0b',
  '#a855f7',
  '#10b981',
  '#ec4899',
  '#3b82f6',
  '#84cc16',
];

export interface SaboteurRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface SaboteurMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: SaboteurPlayer[];
  roundCount: number;
  includeInspector: boolean;
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: SaboteurRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: SaboteurRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: SaboteurMultiplayerState['status']) => void;
  isHost: () => boolean;
  setRoundCount: (count: number) => void;
  setIncludeInspector: (include: boolean) => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  color: string,
  isBot: boolean,
): SaboteurPlayer {
  return {
    id,
    name,
    avatar: avatar || '👤',
    color,
    isBot,
    role: 'worker',
    hand: [],
    selectedCard: null,
    hasLockedIn: false,
    isDetained: false,
    suspicionScore: 0,
    votesAgainst: 0,
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: SaboteurPlayer[],
  hostId: string | null,
): SaboteurPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: SaboteurPlayer[] = presences.map((pres, idx) => {
    const isHost = pres.playerId === hostId;
    const color = SABOTEUR_PLAYER_COLORS[idx % SABOTEUR_PLAYER_COLORS.length];
    const name = pres.displayName + (isHost ? ' (Host)' : '');
    return makeRosterPlayer(pres.playerId, name, pres.avatar ?? '👤', color, false);
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_SABOTEUR_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useSaboteurMultiplayerStore = create<SaboteurMultiplayerState>((set, get) => {
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
    roundCount: 6,
    includeInspector: true,
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    setRoundCount: (roundCount) => set({ roundCount }),
    setIncludeInspector: (includeInspector) => set({ includeInspector }),
    setStatus: (status) => set({ status }),

    createRoom: async (host) => {
      try {
        set({ status: 'idle', error: null });
        const room = await RoomService.createRoom(SABOTEUR_GAME_ID, host.id);
        const transport = new SupabaseTransportService(SABOTEUR_CHANNEL);
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
          SABOTEUR_PLAYER_COLORS[0],
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
        const room = await RoomService.fetchRoomByCode(code.trim().toUpperCase(), SABOTEUR_GAME_ID);
        if (!room || room.gameId !== SABOTEUR_GAME_ID) {
          throw new Error('Room not found');
        }

        const transport = new SupabaseTransportService(SABOTEUR_CHANNEL);
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
      if (players.length >= MAX_SABOTEUR_PLAYERS) return;

      const archetypes = [
        'loyal-specialist',
        'methodical-auditor',
        'erratic-tinkerer',
        'cunning-infiltrator',
      ] as const;
      const botIdx = players.filter((p) => p.isBot).length;
      const arch = archetypes[botIdx % archetypes.length];
      const botId = `bot-${Date.now()}-${botIdx}`;
      const color = SABOTEUR_PLAYER_COLORS[players.length % SABOTEUR_PLAYER_COLORS.length];

      const botPlayer: SaboteurPlayer = {
        ...makeRosterPlayer(
          botId,
          `Bot ${arch.replace('-', ' ').toUpperCase()}`,
          '🤖',
          color,
          true,
        ),
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
