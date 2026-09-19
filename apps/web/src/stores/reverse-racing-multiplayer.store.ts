import { create } from 'zustand';
import type { RacingPlayer } from '@/features/games/reverse-racing/types/reverse-racing.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const REVERSE_RACING_GAME_ID = 'reverse-racing';
export const REVERSE_RACING_CHANNEL = 'reverse-racing';
export const MIN_RACERS = 2;
export const MAX_RACERS = 6;

const RACER_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#10b981', // Green
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
];

const DEFAULT_AVATARS = ['🏎️', '🏎️', '🏎️', '🏎️', '🏎️', '🏎️'];
const STATUS_ERROR = 'error';

export interface RoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface ReverseRacingMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: RacingPlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: RoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: RoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: ReverseRacingMultiplayerState['status']) => void;
  isHost: () => boolean;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function reconcilePlayers(
  presence: PlayerPresence[],
  hostId: string | null,
  currentBots: RacingPlayer[] = [],
): RacingPlayer[] {
  const humanPlayers = [...presence]
    .sort((a, b) => {
      if (a.playerId === hostId) return -1;
      if (b.playerId === hostId) return 1;
      return a.playerId.localeCompare(b.playerId);
    })
    .slice(0, MAX_RACERS)
    .map((person, index) => ({
      id: person.playerId,
      name: person.displayName,
      avatar: person.avatar || DEFAULT_AVATARS[index % DEFAULT_AVATARS.length],
      seatIndex: index,
      color: RACER_COLORS[index % RACER_COLORS.length],
      isBot: false,
      ready: true,
      trackId: `track-${person.playerId}`,
    }));

  const remainingSlots = Math.max(0, MAX_RACERS - humanPlayers.length);
  const botsToKeep = currentBots.slice(0, remainingSlots).map((bot, idx) => {
    const seatIndex = humanPlayers.length + idx;
    return {
      ...bot,
      seatIndex,
      color: RACER_COLORS[seatIndex % RACER_COLORS.length],
    };
  });

  return [...humanPlayers, ...botsToKeep];
}

export const useReverseRacingMultiplayerStore = create<ReverseRacingMultiplayerState>(
  (set, get) => {
    function attachPresence(transport: SupabaseTransportService) {
      transport.onPresence((present) => {
        const { hostId, players, status } = get();

        if (status === 'playing') {
          return; // During active race, roster is locked
        }

        const existingBots = players.filter((p) => p.isBot);
        set({ players: reconcilePlayers(present, hostId, existingBots) });
      });
    }

    return {
      roomCode: null,
      hostId: null,
      localPlayerId: null,
      status: 'idle',
      players: [],
      transport: null,
      error: null,

      isHost: () => {
        const { hostId, localPlayerId } = get();
        return Boolean(hostId && localPlayerId && hostId === localPlayerId);
      },

      createRoom: async (host) => {
        try {
          const room = await RoomService.createRoom(REVERSE_RACING_GAME_ID, host.id);
          const transport = new SupabaseTransportService(REVERSE_RACING_CHANNEL);
          const presence: PlayerPresence = {
            playerId: host.id,
            displayName: host.displayName,
            avatar: host.avatar || '🏎️',
            role: 'host',
          };

          set({
            roomCode: room.code,
            hostId: host.id,
            localPlayerId: host.id,
            status: 'lobby',
            players: reconcilePlayers([presence], host.id),
            transport,
            error: null,
          });

          attachPresence(transport);
          await transport.connect(room.code, presence);
          return room.code;
        } catch {
          set({ error: 'Failed to create racing room', status: STATUS_ERROR });
          return null;
        }
      },

      joinRoomByCode: async (code, identity) => {
        try {
          const room = await RoomService.fetchRoomByCode(code, REVERSE_RACING_GAME_ID);
          if (!room || room.gameId !== REVERSE_RACING_GAME_ID) {
            set({ error: 'Room not found or not Reverse Racing', status: STATUS_ERROR });
            return false;
          }

          const transport = new SupabaseTransportService(REVERSE_RACING_CHANNEL);
          set({
            roomCode: code,
            hostId: room.hostId,
            localPlayerId: identity.id,
            status: 'lobby',
            players: [],
            transport,
            error: null,
          });

          attachPresence(transport);
          const connected = await transport.connect(code, {
            playerId: identity.id,
            displayName: identity.displayName,
            avatar: identity.avatar || '🏎️',
            role: 'guest',
          });
          if (!connected) {
            set({ error: 'Could not connect to the room', status: STATUS_ERROR });
            return false;
          }

          await RoomService.joinRoom(code, identity.id);
          return true;
        } catch {
          set({ error: 'Failed to join racing room', status: STATUS_ERROR });
          return false;
        }
      },

      leaveRoom: () => {
        get().transport?.disconnect();
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

      setStatus: (status) => set({ status }),

      addBot: () => {
        const { players } = get();
        if (players.length >= MAX_RACERS) return;

        const botIndex = players.length;
        const botId = `bot-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        const botNames = ['Turbo Bot', 'Apex AI', 'Drift Bot', 'Sabotage AI', 'Nitro CPU'];
        const botName = botNames[botIndex % botNames.length] || `Bot ${botIndex + 1}`;

        const newBot: RacingPlayer = {
          id: botId,
          name: botName,
          avatar: '🤖',
          seatIndex: botIndex,
          color: RACER_COLORS[botIndex % RACER_COLORS.length],
          isBot: true,
          ready: true,
          trackId: `track-${botId}`,
        };

        set({ players: [...players, newBot] });
      },

      removeBot: (botId: string) => {
        const { players } = get();
        const updated = players
          .filter((p) => p.id !== botId)
          .map((p, idx) => ({
            ...p,
            seatIndex: idx,
            color: RACER_COLORS[idx % RACER_COLORS.length],
          }));
        set({ players: updated });
      },
    };
  },
);
