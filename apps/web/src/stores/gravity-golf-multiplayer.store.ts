import { create } from 'zustand';
import {
  GOLF_MSG,
  type HoleResultPayload,
  type LaunchBallPayload,
  type PlaceObjectPayload,
  type RemoveObjectPayload,
  type SelectHolePayload,
} from '@/features/games/gravity-golf/multiplayer/gravity-golf-protocol';
import type {
  GolfPlayer,
  GravityObject,
  HoleScore,
} from '@/features/games/gravity-golf/types/gravity-golf.types';
import { RoomService } from '@/features/multiplayer/services/room.service';
import type {
  PlayerPresence,
  TransportMessage,
} from '@/features/multiplayer/services/supabase-transport.service';
import { SupabaseTransportService } from '@/features/multiplayer/services/supabase-transport.service';

export const GRAVITY_GOLF_GAME_ID = 'gravity-golf';
export const GRAVITY_GOLF_MAX_SEATS = 4;
export const GRAVITY_GOLF_SEAT_COLORS = ['#38bdf8', '#a855f7', '#34d399', '#f59e0b'];
const CHANNEL_NAMESPACE = 'gravity-golf';
const DEFAULT_AVATAR = '⛳';
const STATUS_ERROR = 'error';

export interface GolfRoomIdentity {
  id: string;
  displayName: string;
  avatar: string;
}

interface GravityGolfMultiplayerState {
  roomCode: string | null;
  hostId: string | null;
  localPlayerId: string | null;
  status: 'idle' | 'lobby' | 'playing' | 'error';
  seats: GolfPlayer[];
  activeHoleNumber: number;
  placedObjects: GravityObject[];
  playerScores: Record<string, Record<number, HoleScore>>;
  transport: SupabaseTransportService | null;
  error: string | null;
  lastLaunchTrigger: number | null;

  createRoom: (host: GolfRoomIdentity) => Promise<string | null>;
  joinRoomByCode: (code: string, identity: GolfRoomIdentity) => Promise<boolean>;
  leaveRoom: () => void;
  selectHole: (holeNumber: number) => void;
  placeObject: (object: GravityObject) => void;
  removeObject: (objectId: string) => void;
  clearObjects: () => void;
  broadcastLaunch: () => void;
  recordScore: (playerId: string, holeNumber: number, score: HoleScore) => void;
  setStatus: (status: GravityGolfMultiplayerState['status']) => void;
  isHost: () => boolean;
}

function reconcileSeats(presence: PlayerPresence[], hostId: string | null): GolfPlayer[] {
  const sorted = [...presence].sort((a, b) => {
    if (a.playerId === hostId) return -1;
    if (b.playerId === hostId) return 1;
    return a.playerId.localeCompare(b.playerId);
  });

  return sorted.slice(0, GRAVITY_GOLF_MAX_SEATS).map((p, idx) => ({
    id: p.playerId,
    name: p.displayName,
    avatar: p.avatar,
    seatIndex: idx,
    isHost: p.playerId === hostId,
  }));
}

export const useGravityGolfMultiplayerStore = create<GravityGolfMultiplayerState>((set, get) => {
  const attachTransportListeners = (transport: SupabaseTransportService) => {
    transport.onPresence((presence) => {
      const { hostId } = get();
      const reconciled = reconcileSeats(presence, hostId);
      set({ seats: reconciled });

      if (hostId && !presence.some((p) => p.playerId === hostId)) {
        const nextHost = reconciled[0]?.id ?? null;
        set({ hostId: nextHost });
      }
    });

    transport.onAction((msg: TransportMessage) => {
      const localId = get().localPlayerId;

      switch (msg.type) {
        case GOLF_MSG.SELECT_HOLE: {
          const payload = msg.payload as SelectHolePayload;
          set({ activeHoleNumber: payload.holeNumber, placedObjects: [] });
          break;
        }

        case GOLF_MSG.PLACE_OBJECT: {
          const payload = msg.payload as PlaceObjectPayload;
          if (payload.senderId !== localId) {
            set((state) => {
              const filtered = state.placedObjects.filter((o) => o.id !== payload.object.id);
              return { placedObjects: [...filtered, payload.object] };
            });
          }
          break;
        }

        case GOLF_MSG.REMOVE_OBJECT: {
          const payload = msg.payload as RemoveObjectPayload;
          if (payload.senderId !== localId) {
            set((state) => ({
              placedObjects: state.placedObjects.filter((o) => o.id !== payload.objectId),
            }));
          }
          break;
        }

        case GOLF_MSG.CLEAR_OBJECTS: {
          set({ placedObjects: [] });
          break;
        }

        case GOLF_MSG.LAUNCH_BALL: {
          const payload = msg.payload as LaunchBallPayload;
          set({ lastLaunchTrigger: payload.timestamp });
          break;
        }

        case GOLF_MSG.HOLE_RESULT: {
          const payload = msg.payload as HoleResultPayload;
          set((state) => {
            const updated = { ...state.playerScores };
            for (const [pid, score] of Object.entries(payload.scores)) {
              if (!updated[pid]) updated[pid] = {};
              updated[pid][payload.holeNumber] = score;
            }
            return { playerScores: updated };
          });
          break;
        }
      }
    });
  };

  return {
    roomCode: null,
    hostId: null,
    localPlayerId: null,
    status: 'idle',
    seats: [],
    activeHoleNumber: 1,
    placedObjects: [],
    playerScores: {},
    transport: null,
    error: null,
    lastLaunchTrigger: null,

    createRoom: async (host) => {
      get().leaveRoom();
      try {
        const room = await RoomService.createRoom(GRAVITY_GOLF_GAME_ID, host.id);
        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);

        const hostPresence: PlayerPresence = {
          playerId: host.id,
          displayName: host.displayName,
          avatar: host.avatar || DEFAULT_AVATAR,
          role: 'host',
        };

        set({
          roomCode: room.code,
          hostId: host.id,
          localPlayerId: host.id,
          status: 'lobby',
          seats: reconcileSeats([hostPresence], host.id),
          activeHoleNumber: 1,
          placedObjects: [],
          playerScores: {},
          transport,
          error: null,
        });

        attachTransportListeners(transport);
        await transport.connect(room.code, hostPresence);
        return room.code;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Room creation error';
        set({ error: message, status: STATUS_ERROR });
        return null;
      }
    },

    joinRoomByCode: async (code, identity) => {
      get().leaveRoom();
      const trimmed = code.trim();
      if (trimmed.length !== 6 || !/^\d{6}$/.test(trimmed)) {
        set({ error: 'Room code must be 6 digits', status: STATUS_ERROR });
        return false;
      }

      try {
        const room = await RoomService.fetchRoomByCode(trimmed, GRAVITY_GOLF_GAME_ID);
        if (!room) {
          set({ error: 'Room not found', status: STATUS_ERROR });
          return false;
        }

        const transport = new SupabaseTransportService(CHANNEL_NAMESPACE);

        const guestPresence: PlayerPresence = {
          playerId: identity.id,
          displayName: identity.displayName,
          avatar: identity.avatar || DEFAULT_AVATAR,
          role: 'guest',
        };

        set({
          roomCode: trimmed,
          hostId: room.hostId || null,
          localPlayerId: identity.id,
          status: 'lobby',
          seats: [],
          transport,
          error: null,
          placedObjects: [],
        });

        attachTransportListeners(transport);
        const connected = await transport.connect(trimmed, guestPresence);
        if (!connected) {
          set({ error: 'Could not connect to the room', status: STATUS_ERROR });
          return false;
        }

        await RoomService.joinRoom(trimmed, identity.id);
        return true;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Could not join room';
        set({ error: msg, status: STATUS_ERROR });
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
        seats: [],
        placedObjects: [],
        playerScores: {},
        transport: null,
        error: null,
      });
    },

    selectHole: (holeNumber) => {
      const { transport, localPlayerId } = get();
      set({ activeHoleNumber: holeNumber, placedObjects: [] });
      if (transport && localPlayerId) {
        transport.send(GOLF_MSG.SELECT_HOLE, { holeNumber }, localPlayerId);
      }
    },

    placeObject: (object) => {
      const { transport, localPlayerId, placedObjects } = get();
      const filtered = placedObjects.filter((o) => o.id !== object.id);
      const updated = [...filtered, object];
      set({ placedObjects: updated });

      if (transport && localPlayerId) {
        transport.send(GOLF_MSG.PLACE_OBJECT, { object, senderId: localPlayerId }, localPlayerId);
      }
    },

    removeObject: (objectId) => {
      const { transport, localPlayerId, placedObjects } = get();
      const updated = placedObjects.filter((o) => o.id !== objectId);
      set({ placedObjects: updated });

      if (transport && localPlayerId) {
        transport.send(
          GOLF_MSG.REMOVE_OBJECT,
          { objectId, senderId: localPlayerId },
          localPlayerId,
        );
      }
    },

    clearObjects: () => {
      const { transport, localPlayerId } = get();
      set({ placedObjects: [] });

      if (transport && localPlayerId) {
        transport.send(GOLF_MSG.CLEAR_OBJECTS, { senderId: localPlayerId }, localPlayerId);
      }
    },

    broadcastLaunch: () => {
      const { transport, localPlayerId, activeHoleNumber } = get();
      const timestamp = Date.now();
      set({ lastLaunchTrigger: timestamp });

      if (transport && localPlayerId) {
        transport.send(
          GOLF_MSG.LAUNCH_BALL,
          { holeNumber: activeHoleNumber, senderId: localPlayerId, timestamp },
          localPlayerId,
        );
      }
    },

    recordScore: (playerId, holeNumber, score) => {
      const { transport, localPlayerId, playerScores } = get();
      const updated = { ...playerScores };
      if (!updated[playerId]) updated[playerId] = {};
      updated[playerId][holeNumber] = score;

      set({ playerScores: updated });

      if (transport && localPlayerId) {
        transport.send(
          GOLF_MSG.HOLE_RESULT,
          { holeNumber, scores: { [playerId]: score } },
          localPlayerId,
        );
      }
    },

    setStatus: (status) => set({ status }),

    isHost: () => {
      const { hostId, localPlayerId } = get();
      return Boolean(hostId && localPlayerId && hostId === localPlayerId);
    },
  };
});
