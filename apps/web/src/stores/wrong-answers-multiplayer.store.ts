import { create } from 'zustand';

import { BOT_TEMPLATES } from '@/features/games/wrong-answers-only/engine/wrong-answers-bot';
import type {
  BotHumorStyle,
  WrongAnswersPlayer,
} from '@/features/games/wrong-answers-only/types/wrong-answers.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const WA_GAME_ID = 'wrong-answers-only';
export const WA_CHANNEL = 'wrong-answers-only';
export const MIN_WA_PLAYERS = 3;
export const MAX_WA_PLAYERS = 8;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';

export interface WaRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface WrongAnswersMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: WrongAnswersPlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: WaRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: WaRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: WrongAnswersMultiplayerState['status']) => void;
  setPlayers: (players: WrongAnswersPlayer[]) => void;
  isHost: () => boolean;
  addBot: () => void;
  removeBot: (botId: string) => void;
  updatePlayerScore: (playerId: string, score: number) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  isBot: boolean,
  style?: BotHumorStyle,
  isHost = false,
): WrongAnswersPlayer {
  return {
    id,
    displayName: name,
    avatar: avatar || '🤪',
    isHost,
    isBot,
    botStyle: style,
    score: 0,
    streak: 0,
    hasSubmitted: false,
    votedAnswerId: null,
    awardsReceived: [],
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: WrongAnswersPlayer[],
  hostId: string | null,
): WrongAnswersPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: WrongAnswersPlayer[] = presences.map((pres) => {
    const isHost = pres.playerId === hostId;
    return makeRosterPlayer(
      pres.playerId,
      pres.displayName + (isHost ? ' (Host)' : ''),
      pres.avatar ?? '🤪',
      false,
      undefined,
      isHost,
    );
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_WA_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useWrongAnswersMultiplayerStore = create<WrongAnswersMultiplayerState>((set, get) => {
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
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    setStatus: (status) => set({ status }),
    setPlayers: (players) => set({ players }),

    createRoom: async (host) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(WA_GAME_ID, host.id);
        const transport = new SupabaseTransportService(WA_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '🤪',
          role: 'host',
        };

        const initialHost = makeRosterPlayer(
          host.id,
          `${host.displayName} (Host)`,
          host.avatar,
          false,
          undefined,
          true,
        );

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: STATUS_LOBBY,
          transport,
          players: [initialHost],
        });

        await transport.connect(room.code, presence);
        attachPresence(transport);
        return room.code;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create room';
        set({ error: message, status: 'error' });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.fetchRoomByCode(code, WA_GAME_ID);
        if (!room) {
          set({ error: 'Room not found', status: 'error' });
          return false;
        }

        const transport = new SupabaseTransportService(WA_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🤪',
          role: 'guest',
        };

        const me = makeRosterPlayer(identity.id, identity.displayName, identity.avatar, false);

        set({
          roomCode: code,
          hostId: room.hostId,
          localPlayerId: identity.id,
          status: STATUS_LOBBY,
          transport,
          players: [me],
        });

        await transport.connect(code, presence);
        attachPresence(transport);
        return true;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to join room';
        set({ error: message, status: 'error' });
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
      if (players.length >= MAX_WA_PLAYERS) return;

      const botIndex = players.filter((p) => p.isBot).length;
      const template = BOT_TEMPLATES[botIndex % BOT_TEMPLATES.length]!;
      const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

      const newBot = makeRosterPlayer(
        botId,
        template.name,
        template.avatar,
        true,
        template.style,
        false,
      );

      set({ players: [...players, newBot] });
    },

    removeBot: (botId: string) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },

    updatePlayerScore: (playerId: string, score: number) => {
      const { players } = get();
      set({
        players: players.map((p) => (p.id === playerId ? { ...p, score } : p)),
      });
    },
  };
});
