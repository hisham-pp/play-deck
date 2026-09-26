import { create } from 'zustand';
import { generateId } from '@playdeck/shared';
import { LUDO_BOT_DEFINITIONS } from '@/features/games/ludo/bots/bot-registry';
import { colorForSeat } from '@/features/games/ludo/engine/board-layout';
import type { LudoAction, LudoPlayer } from '@/features/games/ludo/types/ludo.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type { PlayerPresence } from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

const GAME_ID = 'ludo';
const CHANNEL_NAMESPACE = 'ludo';
const MAX_SEATS = 6;
const TYPE_HUMAN = 'human';
const TYPE_BOT = 'bot';

function toPresence(player: LudoPlayer, hostId: string | null): PlayerPresence {
  return {
    playerId: player.id,
    displayName: player.displayName,
    avatar: player.avatar || '🕹️',
    role: player.id === hostId ? 'host' : 'guest',
  };
}

function reconcileSeats(
  presences: PlayerPresence[],
  hostId: string | null,
  bots: LudoPlayer[],
): LudoPlayer[] {
  const sortedHumans = [...presences].sort((a, b) => {
    if (a.playerId === hostId) return -1;
    if (b.playerId === hostId) return 1;
    return a.playerId.localeCompare(b.playerId);
  });

  const seated: LudoPlayer[] = [];

  for (const human of sortedHumans) {
    if (seated.length >= MAX_SEATS) break;
    seated.push({
      id: human.playerId,
      displayName: human.displayName || `Player ${seated.length + 1}`,
      avatar: human.avatar || '🕹️',
      type: TYPE_HUMAN,
      color: 'red',
      seatIndex: seated.length,
      status: 'connected',
      ready: true,
    });
  }

  for (const bot of bots) {
    if (seated.length >= MAX_SEATS) break;
    seated.push({
      ...bot,
      seatIndex: seated.length,
    });
  }

  const totalCount = seated.length;
  return seated.map((seat, index) => ({
    ...seat,
    seatIndex: index,
    color: colorForSeat(index, totalCount),
  }));
}

interface LudoMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  players: LudoPlayer[];
  disconnectedIds: string[];
  transport: SupabaseTransportService | null;
  error: string | null;

  isHost: () => boolean;
  createRoom: (hostPlayer: {
    id: string;
    displayName: string;
    avatar: string;
  }) => Promise<string | null>;
  joinRoomByCode: (
    code: string,
    player: { id: string; displayName: string; avatar: string },
  ) => Promise<boolean>;
  leaveRoom: () => void;
  addBot: () => void;
  removeBot: (botId: string) => void;
  fillRemainingWithBots: (targetSeatCount?: number) => void;
  toggleReady: (playerId: string) => void;
  publishSeats: (seats: LudoPlayer[]) => void;
  adoptSeats: (seats: LudoPlayer[]) => void;
  setStatus: (status: 'idle' | 'lobby' | 'playing' | 'error') => void;
  broadcastAction: (action: LudoAction) => void;
}

export const useLudoMultiplayerStore = create<LudoMultiplayerState>((set, get) => {
  let bots: LudoPlayer[] = [];

  function rebuildFromSeats(): LudoPlayer[] {
    const { players: currentSeats, hostId } = get();
    const humans = currentSeats.filter((s) => s.type === TYPE_HUMAN);
    return reconcileSeats(
      humans.map((s) => toPresence(s, hostId)),
      hostId,
      bots,
    );
  }

  function attachPresence(transport: SupabaseTransportService) {
    transport.onPresence((present) => {
      const { hostId, players: currentSeats, status } = get();
      const presentIds = new Set(present.map((p) => p.playerId));

      const disconnectedIds = currentSeats
        .filter((seat) => seat.type === TYPE_HUMAN && !presentIds.has(seat.id))
        .map((seat) => seat.id);

      if (status === 'playing') {
        set({
          disconnectedIds,
          players: currentSeats.map((seat) =>
            seat.type === TYPE_HUMAN
              ? { ...seat, status: presentIds.has(seat.id) ? 'connected' : 'disconnected' }
              : seat,
          ),
        });
        return;
      }

      const nextSeats = reconcileSeats(present, hostId, bots);
      set({ players: nextSeats, disconnectedIds: [] });
      if (get().isHost()) {
        get().publishSeats(nextSeats);
      }
    });
  }

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: 'idle',
    players: [],
    disconnectedIds: [],
    transport: null,
    error: null,

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },

    createRoom: async (hostPlayer) => {
      try {
        const room = await RoomService.createRoom(GAME_ID, hostPlayer.id);
        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);
        bots = [];

        const hostPresence: PlayerPresence = {
          playerId: hostPlayer.id,
          displayName: hostPlayer.displayName,
          avatar: hostPlayer.avatar,
          role: 'host',
        };

        const initialSeats = reconcileSeats([hostPresence], hostPlayer.id, []);

        set({
          roomCode: room.code,
          hostId: hostPlayer.id,
          localPlayerId: hostPlayer.id,
          status: 'lobby',
          players: initialSeats,
          disconnectedIds: [],
          transport,
          error: null,
        });

        attachPresence(transport);
        await transport.connect(room.code, hostPresence);
        return room.code;
      } catch {
        set({ error: 'Failed to create room', status: 'error' });
        return null;
      }
    },

    joinRoomByCode: async (code, player) => {
      try {
        const room = await RoomService.fetchRoomByCode(code, GAME_ID);
        if (!room || room.gameId !== GAME_ID) {
          set({ error: 'That room is not a Ludo room', status: 'error' });
          return false;
        }

        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);
        bots = [];

        set({
          roomCode: code,
          hostId: room.hostId,
          localPlayerId: player.id,
          status: 'lobby',
          players: [],
          disconnectedIds: [],
          transport,
          error: null,
        });

        attachPresence(transport);
        const guestPresence: PlayerPresence = {
          playerId: player.id,
          displayName: player.displayName,
          avatar: player.avatar,
          role: 'guest',
        };

        const connected = await transport.connect(code, guestPresence);
        if (!connected) {
          set({ error: 'Could not connect to room', status: 'error' });
          return false;
        }

        await RoomService.joinRoom(code, player.id);
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
      bots = [];
      set({
        roomCode: null,
        hostId: null,
        localPlayerId: null,
        status: 'idle',
        players: [],
        disconnectedIds: [],
        transport: null,
        error: null,
      });
    },

    addBot: () => {
      if (get().players.length >= MAX_SEATS) return;
      const botDef = LUDO_BOT_DEFINITIONS[bots.length % LUDO_BOT_DEFINITIONS.length];
      const botNumber = bots.length + 1;

      bots = [
        ...bots,
        {
          id: generateId(TYPE_BOT),
          displayName: `${botDef.name} ${botNumber}`,
          avatar: '🤖',
          type: TYPE_BOT,
          color: 'green',
          seatIndex: 0,
          status: 'connected',
          ready: true,
          botConfig: {
            difficulty: botDef.difficulty,
            personality: botDef.personality,
            botDefinitionId: botDef.id,
          },
        },
      ];

      const next = rebuildFromSeats();
      set({ players: next });
      get().publishSeats(next);
    },

    removeBot: (botId: string) => {
      bots = bots.filter((b) => b.id !== botId);
      const next = rebuildFromSeats();
      set({ players: next });
      get().publishSeats(next);
    },

    fillRemainingWithBots: (targetSeatCount = 4) => {
      const currentCount = get().players.length;
      const target = Math.min(MAX_SEATS, Math.max(currentCount, targetSeatCount));
      const needed = target - currentCount;

      for (let i = 0; i < needed; i++) {
        const botDef = LUDO_BOT_DEFINITIONS[bots.length % LUDO_BOT_DEFINITIONS.length];
        const botNumber = bots.length + 1;
        bots.push({
          id: generateId(TYPE_BOT),
          displayName: `${botDef.name} ${botNumber}`,
          avatar: '🤖',
          type: TYPE_BOT,
          color: 'yellow',
          seatIndex: 0,
          status: 'connected',
          ready: true,
          botConfig: {
            difficulty: botDef.difficulty,
            personality: botDef.personality,
            botDefinitionId: botDef.id,
          },
        });
      }

      const next = rebuildFromSeats();
      set({ players: next });
      get().publishSeats(next);
    },

    toggleReady: (playerId: string) => {
      set((state) => ({
        players: state.players.map((p) => (p.id === playerId ? { ...p, ready: !p.ready } : p)),
      }));
    },

    publishSeats: (seats: LudoPlayer[]) => {
      const { transport, hostId } = get();
      if (!transport || !hostId) return;
      transport.send('SEATS', { seats }, hostId);
    },

    adoptSeats: (seats: LudoPlayer[]) => set({ players: seats }),

    setStatus: (status) => set({ status }),

    broadcastAction: (action: LudoAction) => {
      const { transport, localPlayerId } = get();
      if (transport && localPlayerId) {
        transport.send('ludo-action', action, localPlayerId);
      }
    },
  };
});
