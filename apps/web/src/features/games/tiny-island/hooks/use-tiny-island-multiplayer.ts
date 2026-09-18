import { useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useTinyIslandMultiplayerStore } from '@/stores/tiny-island-multiplayer.store';
import type { GameAction, IslandGameState } from '../engine/tiny-island-types';

interface UseTinyIslandMultiplayerProps {
  onRemoteAction: (action: GameAction) => void;
  onRemoteSyncState: (state: IslandGameState) => void;
  onRemoteStartGame: () => void;
}

export function useTinyIslandMultiplayer({
  onRemoteAction,
  onRemoteSyncState,
  onRemoteStartGame,
}: UseTinyIslandMultiplayerProps) {
  const { transport, roomCode, localSeatIndex, localPlayerId, isHost } =
    useTinyIslandMultiplayerStore();

  const actionRef = useRef(onRemoteAction);
  actionRef.current = onRemoteAction;

  const syncRef = useRef(onRemoteSyncState);
  syncRef.current = onRemoteSyncState;

  const startRef = useRef(onRemoteStartGame);
  startRef.current = onRemoteStartGame;

  useEffect(() => {
    if (!transport || !roomCode) return;

    const unsubscribe = transport.onAction((msg: TransportMessage) => {
      if (msg.type === 'island:action') {
        const { action } = msg.payload as { action: GameAction };
        if (action.seatIndex !== localSeatIndex) {
          actionRef.current(action);
        }
      } else if (msg.type === 'island:sync_state') {
        if (!isHost) {
          const { state } = msg.payload as { state: IslandGameState };
          syncRef.current(state);
        }
      } else if (msg.type === 'island:start_game') {
        startRef.current();
      }
    });

    return () => {
      unsubscribe();
    };
  }, [transport, roomCode, localSeatIndex, isHost]);

  const broadcastAction = (action: GameAction) => {
    if (!transport) return;
    transport.send('island:action', { action }, localPlayerId || 'player');
  };

  const broadcastSyncState = (state: IslandGameState) => {
    if (!transport || !isHost) return;
    transport.send('island:sync_state', { state }, localPlayerId || 'host');
  };

  const broadcastStartGame = () => {
    if (!transport || !isHost) return;
    transport.send('island:start_game', {}, localPlayerId || 'host');
  };

  return { broadcastAction, broadcastSyncState, broadcastStartGame };
}
