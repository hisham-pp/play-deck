'use client';

import React, { useMemo, useState } from 'react';
import { BombFactoryVoiceDock } from '@/features/voice/components/BombFactoryVoiceDock';
import { useBombFactoryMultiplayerStore } from '@/stores/bomb-factory-multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { usePreferencesStore } from '@/stores/preferences.store';
import { operatorSeatFor } from '../engine/blueprint';
import {
  PHASE_ASSEMBLY,
  PHASE_BRIEFING,
  PHASE_MACHINE_CLEARED,
  PHASE_MACHINE_FAILED,
  PHASE_SHIFT_COMPLETE,
} from '../engine/bomb-factory-constants';
import { useBombFactoryDossiers } from '../hooks/use-bomb-factory-dossiers';
import { useBombFactoryEngine } from '../hooks/use-bomb-factory-engine';
import { useBombFactoryOperator } from '../hooks/use-bomb-factory-operator';
import { useBombFactorySession } from '../hooks/use-bomb-factory-session';
import { useBombFactoryShift } from '../hooks/use-bomb-factory-shift';
import { useBombFactorySound } from '../hooks/use-bomb-factory-sound';
import { useBombFactoryTimer } from '../hooks/use-bomb-factory-timer';
import type { BombFactoryDifficulty, BombFactorySeat } from '../types/bomb-factory.types';
import { BombFactoryArena } from './BombFactoryArena';
import { BombFactoryBriefing } from './BombFactoryBriefing';
import { BombFactoryLobby } from './BombFactoryLobby';
import { BombFactoryLocalSetup } from './BombFactoryLocalSetup';
import { BombFactoryResult } from './BombFactoryResult';
import { BombFactoryRoomLobby } from './BombFactoryRoomLobby';

type Screen = 'lobby' | 'local-setup' | 'online-room';

export function BombFactoryGame() {
  return <BombFactoryGameInner />;
}

function BombFactoryGameInner() {
  const [screen, setScreen] = useState<Screen>('lobby');
  const reducedMotion = usePreferencesStore((s) => s.reducedMotion);
  const player = usePlayerStore((s) => s.player);

  const { engine, state } = useBombFactoryEngine();
  useBombFactorySession(state);
  useBombFactorySound(state);

  const roomCode = useBombFactoryMultiplayerStore((s) => s.roomCode);
  const transport = useBombFactoryMultiplayerStore((s) => s.transport);
  const localPlayerId = useBombFactoryMultiplayerStore((s) => s.localPlayerId);
  const isHost = useBombFactoryMultiplayerStore((s) => s.isHost());
  const leaveRoom = useBombFactoryMultiplayerStore((s) => s.leaveRoom);

  const localSeatId = state.mode === 'local' ? null : localPlayerId;

  const dossiers = useBombFactoryDossiers({
    mode: state.mode,
    spec: state.spec,
    plan: state.plan,
    localSeatId,
    roomCode,
  });

  const operator = useMemo(
    () => operatorSeatFor(state.seats, state.machineIndex),
    [state.seats, state.machineIndex],
  );

  const isOperator = Boolean(operator && (state.mode === 'local' || operator.id === localSeatId));

  const {
    beginShift,
    dealNextMachine,
    startLine,
    submit,
    broadcastSelection,
    callTime,
    remoteSelection,
  } = useBombFactoryShift({
    engine,
    state,
    dossiers,
    localSeatId,
    isHost: state.mode === 'local' ? true : isHost,
    transport: state.mode === 'local' ? null : transport,
  });

  const secondsLeft = useBombFactoryTimer(
    state,
    state.mode === 'local' || isHost ? callTime : null,
  );

  const { selection, setSelection, engage } = useBombFactoryOperator({
    state,
    operator,
    isOperator,
    onSubmit: submit,
    onSelectionBroadcast: broadcastSelection,
  });

  const handleSelectOnline = async () => {
    const store = useBombFactoryMultiplayerStore.getState();
    const ok = await store.createRoom({
      id: player?.id || 'host',
      displayName: player?.displayName || 'Host',
      avatar: player?.avatar || '🛠️',
    });
    if (ok) {
      setScreen('online-room');
    }
  };

  const handleStartLocal = (seats: BombFactorySeat[], difficulty: BombFactoryDifficulty) => {
    beginShift(difficulty, seats);
  };

  const handleStartOnline = (seats: BombFactorySeat[], difficulty: BombFactoryDifficulty) => {
    beginShift(difficulty, seats);
  };

  const handleLeaveGame = () => {
    engine.destroy();
    if (state.mode === 'online') {
      leaveRoom();
    }
    setScreen('lobby');
  };

  if (state.phase !== 'idle') {
    if (state.phase === PHASE_BRIEFING && state.spec) {
      return (
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4">
          {state.mode === 'online' && roomCode && <BombFactoryVoiceDock />}
          <BombFactoryBriefing spec={state.spec} onReady={startLine} onLeave={handleLeaveGame} />
        </div>
      );
    }

    if (state.phase === PHASE_ASSEMBLY) {
      return (
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4">
          {state.mode === 'online' && roomCode && <BombFactoryVoiceDock />}
          <BombFactoryArena
            state={state}
            mode={state.mode}
            secondsLeft={secondsLeft}
            dossiers={dossiers}
            localSeatId={localSeatId}
            operator={operator}
            selection={selection}
            onSelectionChange={setSelection}
            onEngage={engage}
            remoteSelection={remoteSelection}
            reducedMotion={reducedMotion}
            onLeave={handleLeaveGame}
          />
        </div>
      );
    }

    if (
      state.phase === PHASE_MACHINE_CLEARED ||
      state.phase === PHASE_SHIFT_COMPLETE ||
      state.phase === PHASE_MACHINE_FAILED
    ) {
      return (
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
          {state.mode === 'online' && roomCode && <BombFactoryVoiceDock />}
          <BombFactoryResult
            state={state}
            canAdvance={state.mode === 'local' || isHost}
            onNextMachine={dealNextMachine}
            onRestartShift={() => beginShift(state.difficulty, state.seats)}
            onLeave={handleLeaveGame}
          />
        </div>
      );
    }
  }

  if (screen === 'local-setup') {
    return (
      <BombFactoryLocalSetup
        hostName={player?.displayName || 'Operator 1'}
        hostAvatar={player?.avatar || '🛠️'}
        onStart={handleStartLocal}
        onBack={() => setScreen('lobby')}
      />
    );
  }

  if (screen === 'online-room' || roomCode) {
    return (
      <div className="space-y-4">
        {roomCode && <BombFactoryVoiceDock />}
        <BombFactoryRoomLobby
          onStartShift={handleStartOnline}
          onLeave={() => {
            leaveRoom();
            setScreen('lobby');
          }}
        />
      </div>
    );
  }

  return (
    <BombFactoryLobby
      onSelectLocal={() => setScreen('local-setup')}
      onSelectOnline={handleSelectOnline}
    />
  );
}
