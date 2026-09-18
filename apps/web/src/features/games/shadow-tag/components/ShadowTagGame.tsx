'use client';

import React, { useCallback, useState } from 'react';
import { ShadowTagVoiceDock } from '@/features/voice/components/ShadowTagVoiceDock';
import { usePlayerStore } from '@/stores/player.store';
import { useShadowTagMultiplayerStore } from '@/stores/shadow-tag-multiplayer.store';
import { PHASE_ROUND_OVER, ROUND_MS } from '../engine/shadow-tag-constants';
import { useShadowTagGame } from '../hooks/use-shadow-tag-game';
import type { ShadowTagSeat } from '../types/shadow-tag.types';
import { ShadowTagArena } from './ShadowTagArena';
import { ShadowTagLobby } from './ShadowTagLobby';
import { ShadowTagOfflineSetup } from './ShadowTagOfflineSetup';
import { ShadowTagRoomLobby } from './ShadowTagRoomLobby';
import { ShadowTagRoundOver } from './ShadowTagRoundOver';

type Screen = 'lobby' | 'offline-setup' | 'online-room' | 'playing';

export function ShadowTagGame() {
  const [screen, setScreen] = useState<Screen>(() =>
    useShadowTagMultiplayerStore.getState().roomCode ? 'online-room' : 'lobby',
  );
  const [seats, setSeats] = useState<ShadowTagSeat[]>([]);
  const [arenaId, setArenaId] = useState('atrium');
  const [roundMs, setRoundMs] = useState(ROUND_MS);
  const [isOnline, setIsOnline] = useState(false);

  const player = usePlayerStore((s) => s.player);
  const roomCode = useShadowTagMultiplayerStore((s) => s.roomCode);
  const createRoom = useShadowTagMultiplayerStore((s) => s.createRoom);
  const leaveRoom = useShadowTagMultiplayerStore((s) => s.leaveRoom);
  const isHost = useShadowTagMultiplayerStore((s) => s.isHost());
  const storeSeats = useShadowTagMultiplayerStore((s) => s.seats);

  const activeSeats = isOnline ? storeSeats : seats;

  const handleSeatsFromHost = useCallback((incoming: ShadowTagSeat[]) => {
    setSeats(incoming);
  }, []);

  const handleRoundEnd = useCallback(() => {}, []);

  const game = useShadowTagGame({
    seats: activeSeats,
    arenaId,
    roundMs,
    isOnline,
    isHost: isOnline ? isHost : true,
    localPlayerId: player?.id ?? null,
    onSeatsFromHost: handleSeatsFromHost,
    onRoundEnd: handleRoundEnd,
  });

  const handleSelectOnline = async () => {
    if (!player) return;
    const code = await createRoom({
      id: player.id,
      displayName: player.displayName,
      avatar: player.avatar || '🕹️',
    });
    if (code) {
      setIsOnline(true);
      setScreen('online-room');
    }
  };

  const handleStartOffline = (
    chosenSeats: ShadowTagSeat[],
    chosenArena: string,
    chosenRoundMs: number,
  ) => {
    setIsOnline(false);
    setSeats(chosenSeats);
    setArenaId(chosenArena);
    setRoundMs(chosenRoundMs);
    setScreen('playing');
  };

  const handleStartOnline = () => {
    setIsOnline(true);
    setScreen('playing');
  };

  const handleLeaveGame = () => {
    if (isOnline) {
      leaveRoom();
    }
    setScreen('lobby');
  };

  if (screen === 'lobby') {
    return (
      <ShadowTagLobby
        onSelectOffline={() => setScreen('offline-setup')}
        onSelectOnline={handleSelectOnline}
      />
    );
  }

  if (screen === 'offline-setup') {
    return <ShadowTagOfflineSetup onBack={() => setScreen('lobby')} onStart={handleStartOffline} />;
  }

  if (screen === 'online-room') {
    return <ShadowTagRoomLobby onStartGame={handleStartOnline} onLeave={handleLeaveGame} />;
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      {isOnline && roomCode && <ShadowTagVoiceDock />}
      <ShadowTagArena
        canvasRef={game.canvasRef}
        hud={game.hud}
        controls={game.controls}
        arenaId={arenaId}
        localPlayerId={player?.id ?? null}
        highContrast={game.highContrast}
        onToggleContrast={() => game.setHighContrast(!game.highContrast)}
        onLeave={handleLeaveGame}
      />
      {game.hud.phase === PHASE_ROUND_OVER && (
        <ShadowTagRoundOver
          standings={game.hud.standings}
          localPlayerId={player?.id ?? null}
          canRematch={isOnline ? isHost : true}
          onRematch={game.startRound}
          onExit={handleLeaveGame}
        />
      )}
    </div>
  );
}
