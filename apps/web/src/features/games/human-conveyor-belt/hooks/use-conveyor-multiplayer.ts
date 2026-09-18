import { useEffect, useRef } from 'react';
import type { TransportMessage } from '@/features/multiplayer/services/supabase-transport.service';
import { useHumanConveyorMultiplayerStore } from '@/stores/human-conveyor-multiplayer.store';

interface UseConveyorMultiplayerProps {
  onRemotePlatformUpdate: (
    seatIndex: number,
    angle: number,
    elevation: number,
    speed: number,
  ) => void;
  onRemoteStartGame: (layoutId: string) => void;
}

export function useConveyorMultiplayer({
  onRemotePlatformUpdate,
  onRemoteStartGame,
}: UseConveyorMultiplayerProps) {
  const { transport, roomCode, localSeatIndex, localPlayerId } = useHumanConveyorMultiplayerStore();

  const updateRef = useRef(onRemotePlatformUpdate);
  updateRef.current = onRemotePlatformUpdate;

  const startRef = useRef(onRemoteStartGame);
  startRef.current = onRemoteStartGame;

  useEffect(() => {
    if (!transport || !roomCode) return;

    const unsubscribe = transport.onAction((msg: TransportMessage) => {
      if (msg.type === 'conveyor:platform_update') {
        const { seatIndex, angle, elevation, speed } = msg.payload as {
          seatIndex: number;
          angle: number;
          elevation: number;
          speed: number;
        };
        if (seatIndex !== localSeatIndex) {
          updateRef.current(seatIndex, angle, elevation, speed);
        }
      } else if (msg.type === 'conveyor:start_game') {
        const { layoutId } = msg.payload as { layoutId: string };
        startRef.current(layoutId);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [transport, roomCode, localSeatIndex]);

  const broadcastPlatformUpdate = (
    seatIndex: number,
    angle: number,
    elevation: number,
    speed: number,
  ) => {
    if (!transport) return;
    transport.send(
      'conveyor:platform_update',
      { seatIndex, angle, elevation, speed },
      localPlayerId || 'player',
    );
  };

  return { broadcastPlatformUpdate };
}
