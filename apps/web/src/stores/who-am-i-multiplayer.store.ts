import { create } from 'zustand';

import { IDENTITIES_DATABASE } from '@/features/games/who-am-i/engine/identities-database';
import type { WhoAmIPlayer } from '@/features/games/who-am-i/types/who-am-i.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const WAI_GAME_ID = 'who-am-i';
export const WAI_CHANNEL = 'who-am-i';
export const MIN_WAI_PLAYERS = 3;
export const MAX_WAI_PLAYERS = 8;

const STATUS_IDLE = 'idle';
const STATUS_LOBBY = 'lobby';

const BOT_TEMPLATES = [
  { name: 'Sherlock Bot', avatar: '🕵️‍♂️' },
  { name: 'Watson AI', avatar: '🧐' },
  { name: 'Mystery Maya', avatar: '🔮' },
  { name: 'Inspector Clouseau', avatar: '🔍' },
];

export interface WaiRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

export interface WhoAmIMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: WhoAmIPlayer[];
  transport: SupabaseTransportService | null;
  error: string | null;

  createRoom: (host: WaiRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: WaiRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  setStatus: (status: WhoAmIMultiplayerState['status']) => void;
  setPlayers: (players: WhoAmIPlayer[]) => void;
  isHost: () => boolean;
  addBot: () => void;
  removeBot: (botId: string) => void;
}

function makeRosterPlayer(
  id: string,
  name: string,
  avatar: string,
  isBot: boolean,
  isHost = false,
  index = 0,
): WhoAmIPlayer {
  return {
    id,
    displayName: name,
    avatar: avatar || '❓',
    isHost,
    isBot,
    identity: IDENTITIES_DATABASE[index % IDENTITIES_DATABASE.length]!,
    isSolved: false,
    solvedAtStep: null,
    score: 0,
    questionsAsked: 0,
    wrongGuesses: 0,
    awardsReceived: [],
  };
}

function syncPresences(
  presences: PlayerPresence[],
  existing: WhoAmIPlayer[],
  hostId: string | null,
): WhoAmIPlayer[] {
  const bots = existing.filter((p) => p.isBot);
  const realPlayers: WhoAmIPlayer[] = presences.map((pres, idx) => {
    const isHost = pres.playerId === hostId;
    return makeRosterPlayer(
      pres.playerId,
      pres.displayName + (isHost ? ' (Host)' : ''),
      pres.avatar ?? '❓',
      false,
      isHost,
      idx,
    );
  });

  const combined = [...realPlayers];
  for (const bot of bots) {
    if (combined.length < MAX_WAI_PLAYERS) {
      combined.push(bot);
    }
  }
  return combined;
}

export const useWhoAmIMultiplayerStore = create<WhoAmIMultiplayerState>((set, get) => {
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
        const room = await RoomService.createRoom(WAI_GAME_ID, host.id);
        const transport = new SupabaseTransportService(WAI_CHANNEL);
        const presence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || '❓',
          role: 'host',
        };
        await transport.connect(room.code, presence);
        attachPresence(transport);

        const hostPlayer = makeRosterPlayer(host.id, host.displayName, host.avatar, false, true, 0);

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: STATUS_LOBBY,
          players: [hostPlayer],
          transport,
          error: null,
        });
        return room.code;
      } catch (err) {
        set({
          status: 'error',
          error: err instanceof Error ? err.message : 'Failed to create room',
        });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      try {
        set({ status: STATUS_IDLE, error: null });
        const clean = code.trim().toUpperCase();
        const transport = new SupabaseTransportService(WAI_CHANNEL);
        const presence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || '❓',
          role: 'guest',
        };
        await transport.connect(clean, presence);
        attachPresence(transport);

        const local = makeRosterPlayer(
          identity.id,
          identity.displayName,
          identity.avatar,
          false,
          false,
          1,
        );

        set({
          roomCode: clean,
          hostId: null,
          localPlayerId: identity.id,
          status: STATUS_LOBBY,
          players: [local],
          transport,
          error: null,
        });
        return true;
      } catch (err) {
        set({ status: 'error', error: err instanceof Error ? err.message : 'Failed to join room' });
        return false;
      }
    },

    leaveRoom: () => {
      const { transport } = get();
      if (transport) {
        try {
          transport.disconnect();
        } catch {
          // Ignore
        }
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
      if (players.length >= MAX_WAI_PLAYERS) return;

      const botIdx = players.filter((p) => p.isBot).length;
      const t = BOT_TEMPLATES[botIdx % BOT_TEMPLATES.length]!;
      const botPlayer = makeRosterPlayer(
        `bot-wai-${Date.now()}-${botIdx}`,
        t.name,
        t.avatar,
        true,
        false,
        players.length,
      );

      set({ players: [...players, botPlayer] });
    },

    removeBot: (botId: string) => {
      const { players } = get();
      set({ players: players.filter((p) => p.id !== botId) });
    },
  };
});
