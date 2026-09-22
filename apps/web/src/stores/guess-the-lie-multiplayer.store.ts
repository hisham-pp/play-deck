import { create } from 'zustand';

import type {
  BotPersona,
  LiePlayer,
} from '@/features/games/guess-the-lie/types/guess-the-lie.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const LIE_GAME_ID = 'guess-the-lie';
export const LIE_CHANNEL = 'guess-the-lie';
export const MIN_LIE_PLAYERS = 3;
export const MAX_LIE_PLAYERS = 8;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';

export const LIE_BOT_TEMPLATES: Array<{
  name: string;
  avatar: string;
  persona: BotPersona;
}> = [
  { name: 'Sherlock Sam', avatar: '🕵️', persona: 'analytical' },
  { name: 'Smooth Sally', avatar: '🦊', persona: 'convincing' },
  { name: 'Dreamy Dave', avatar: '🎨', persona: 'creative' },
  { name: 'Honest Hank', avatar: '🤠', persona: 'blatant' },
];

export interface LieRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface GuessTheLieMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: LiePlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: LieRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: LieRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: GuessTheLieMultiplayerState['status']) => void;
  setPlayers: (players: LiePlayer[]) => void;
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
  persona?: BotPersona,
  isHost = false,
): LiePlayer {
  return {
    id,
    displayName: name,
    avatar: avatar || '🎭',
    isHost,
    isBot,
    botPersona: persona,
    role: 'truth_teller',
    score: 0,
    hasSubmitted: false,
    votedAnswerId: null,
    awardsReceived: [],
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: LiePlayer[],
  hostId: string | null,
): LiePlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: LiePlayer[] = presences.map((pres) => {
    const isHost = pres.playerId === hostId;
    return makeRosterPlayer(
      pres.playerId,
      pres.displayName + (isHost ? ' (Host)' : ''),
      pres.avatar ?? '🎭',
      false,
      undefined,
      isHost,
    );
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_LIE_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useLieMultiplayerStore = create<GuessTheLieMultiplayerState>((set, get) => {
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
        const room = await RoomService.createRoom(LIE_GAME_ID, host.id);
        const transport = new SupabaseTransportService(LIE_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '🎭',
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
        const room = await RoomService.fetchRoomByCode(code, LIE_GAME_ID);
        if (!room) {
          set({ error: 'Room not found', status: 'error' });
          return false;
        }

        const transport = new SupabaseTransportService(LIE_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '🎭',
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
      if (players.length >= MAX_LIE_PLAYERS) return;

      const botIndex = players.filter((p) => p.isBot).length;
      const template = LIE_BOT_TEMPLATES[botIndex % LIE_BOT_TEMPLATES.length]!;
      const botId = `bot-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;

      const newBot = makeRosterPlayer(
        botId,
        template.name,
        template.avatar,
        true,
        template.persona,
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
