import { create } from 'zustand';

import type {
  BotPersonality,
  StoryPlayer,
} from '@/features/games/one-word-story/types/one-word-story.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const STORY_GAME_ID = 'one-word-story';
export const STORY_CHANNEL = 'one-word-story';
export const MIN_STORY_PLAYERS = 3;
export const MAX_STORY_PLAYERS = 8;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';

export const STORY_BOT_TEMPLATES: Array<{
  name: string;
  avatar: string;
  personality: BotPersonality;
}> = [
  { name: 'Byron (Poet)', avatar: '📜', personality: 'poet' },
  { name: 'Giggles (Chaotic)', avatar: '🤪', personality: 'chaotic' },
  { name: 'Hamlet (Dramatic)', avatar: '🎭', personality: 'dramatic' },
  { name: 'Plato (Thinker)', avatar: '🦉', personality: 'philosopher' },
];

export interface StoryRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface StoryMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: StoryPlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: StoryRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: StoryRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: StoryMultiplayerState['status']) => void;
  isHost: () => boolean;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  isBot: boolean,
  personality?: BotPersonality,
  isHost = false,
): StoryPlayer {
  return {
    id,
    displayName: name,
    avatar: avatar || '✍️',
    isBot,
    botPersonality: personality,
    isHost,
    score: 0,
    wordsContributed: 0,
    awardsReceived: [],
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: StoryPlayer[],
  hostId: string | null,
): StoryPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: StoryPlayer[] = presences.map((pres) => {
    const isHost = pres.playerId === hostId;
    return makeRosterPlayer(
      pres.playerId,
      pres.displayName + (isHost ? ' (Host)' : ''),
      pres.avatar ?? '✍️',
      false,
      undefined,
      isHost,
    );
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_STORY_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useStoryMultiplayerStore = create<StoryMultiplayerState>((set, get) => {
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

    createRoom: async (host) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const room = await RoomService.createRoom(STORY_GAME_ID, host.id);
        const transport = new SupabaseTransportService(STORY_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '✍️',
          role: 'host',
        };

        await transport.connect(room.code, presence);
        attachPresence(transport);

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
        const room = await RoomService.fetchRoomByCode(code, STORY_GAME_ID);
        if (!room) {
          set({ error: 'Room not found', status: 'error' });
          return false;
        }

        const transport = new SupabaseTransportService(STORY_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '✍️',
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
      if (players.length >= MAX_STORY_PLAYERS) return;

      const currentBots = players.filter((p) => p.isBot).length;
      const template = STORY_BOT_TEMPLATES[currentBots % STORY_BOT_TEMPLATES.length]!;
      const botId = `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const newBot = makeRosterPlayer(
        botId,
        template.name,
        template.avatar,
        true,
        template.personality,
      );

      set({ players: [...players, newBot] });
    },

    removeBot: (botId: string) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },
  };
});
