'use client';

import { Swords } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import { useMultiplayerStore } from '@/stores/multiplayer.store';
import { usePlayerStore } from '@/stores/player.store';
import { MODE_AI, MODE_LOCAL_2P, MODE_ONLINE } from '../engine/pen-fight-constants';
import type {
  AIDifficulty,
  PenColor,
  PenFightMode,
  PenFightPlayerId,
  PenSpeedMode,
} from '../types/pen-fight.types';
import { PenFightColorPicker } from './PenFightColorPicker';
import { PenFightMatchOptions } from './PenFightMatchOptions';
import { PenFightOnlineRoomSetup } from './PenFightOnlineRoomSetup';

export interface PenFightSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: PenFightMode;
  currentSpeedMode: PenSpeedMode;
  currentDifficulty: AIDifficulty;
  playerNames: Record<PenFightPlayerId, string>;
  playerColors: Record<PenFightPlayerId, PenColor>;
  onStartMatch: (config: {
    mode: PenFightMode;
    speedMode: PenSpeedMode;
    difficulty: AIDifficulty;
    names: Record<PenFightPlayerId, string>;
    colors: Record<PenFightPlayerId, PenColor>;
  }) => void;
}

const ICON_SM = 'w-4 h-4';
const BTN_TYPE = 'button';

export function PenFightSetupModal({
  isOpen,
  onClose,
  currentMode,
  currentSpeedMode,
  currentDifficulty,
  playerNames,
  playerColors,
  onStartMatch,
}: PenFightSetupModalProps) {
  const { player } = usePlayerStore();
  const { createRoom, joinRoomByCode, roomCode, opponent, connectionStatus, errorMessage } =
    useMultiplayerStore();

  const [mode, setMode] = useState<PenFightMode>(currentMode);
  const [speedMode, setSpeedMode] = useState<PenSpeedMode>(currentSpeedMode);
  const [difficulty, setDifficulty] = useState<AIDifficulty>(currentDifficulty);
  const [p1Name, setP1Name] = useState(playerNames.p1);
  const [p2Name, setP2Name] = useState(playerNames.p2);
  const [p1Color, setP1Color] = useState<PenColor>(playerColors.p1);
  const [p2Color, setP2Color] = useState<PenColor>(playerColors.p2);

  const handleCreateOnlineRoom = async () => {
    if (!player) return;
    await createRoom('pen-fight', player);
  };

  const handleJoinOnlineRoom = async (code: string) => {
    if (!player || !code.trim()) return;
    const success = await joinRoomByCode(code.trim(), player);
    if (success) {
      handleStart();
    }
  };

  const handleStart = () => {
    onStartMatch({
      mode,
      speedMode,
      difficulty,
      names: {
        p1: p1Name.trim() || player?.displayName || 'Player 1',
        p2:
          mode === MODE_AI
            ? 'CPU Rival'
            : mode === MODE_ONLINE
              ? opponent?.displayName || 'Opponent'
              : p2Name.trim() || 'Player 2',
      },
      colors: { p1: p1Color, p2: p2Color },
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pen Fight — Match Setup"
      description="Flick your pen to knock your opponent's off the table. Best of 3 rounds wins the match."
      size="md"
    >
      <div className="flex flex-col gap-4">
        <PenFightMatchOptions
          mode={mode}
          speedMode={speedMode}
          difficulty={difficulty}
          onModeChange={setMode}
          onSpeedModeChange={setSpeedMode}
          onDifficultyChange={setDifficulty}
        />

        {mode !== MODE_ONLINE && (
          <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-base/60 p-3">
            <div className="flex items-center gap-3">
              <input
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                maxLength={16}
                placeholder="Player 1"
                className="flex-1 rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-xs font-semibold text-deck-900 dark:text-white outline-none focus:border-amber-500"
              />
            </div>
            <PenFightColorPicker selected={p1Color} taken={p2Color} onSelect={setP1Color} />
          </div>
        )}

        {mode === MODE_LOCAL_2P && (
          <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-base/60 p-3">
            <input
              value={p2Name}
              onChange={(e) => setP2Name(e.target.value)}
              maxLength={16}
              placeholder="Player 2"
              className="flex-1 rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-xs font-semibold text-deck-900 dark:text-white outline-none focus:border-amber-500"
            />
            <PenFightColorPicker selected={p2Color} taken={p1Color} onSelect={setP2Color} />
          </div>
        )}

        {mode === MODE_ONLINE && (
          <PenFightOnlineRoomSetup
            player={player}
            roomCode={roomCode}
            opponent={opponent}
            connectionStatus={connectionStatus}
            errorMessage={errorMessage}
            onCreateRoom={handleCreateOnlineRoom}
            onJoinRoom={handleJoinOnlineRoom}
          />
        )}

        <Button
          type={BTN_TYPE}
          variant="primary"
          onClick={handleStart}
          className="w-full gap-2 font-bold py-2.5 text-sm"
        >
          <Swords className={ICON_SM} />
          <span>Enter the Arena</span>
        </Button>
      </div>
    </Modal>
  );
}
