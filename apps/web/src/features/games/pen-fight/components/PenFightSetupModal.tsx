'use client';

import { Copy, Globe, Plus, Swords } from 'lucide-react';
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
  const { createRoom, joinRoomByCode, roomCode, connectionStatus, errorMessage } =
    useMultiplayerStore();

  const [mode, setMode] = useState<PenFightMode>(currentMode);
  const [speedMode, setSpeedMode] = useState<PenSpeedMode>(currentSpeedMode);
  const [difficulty, setDifficulty] = useState<AIDifficulty>(currentDifficulty);
  const [p1Name, setP1Name] = useState(playerNames.p1);
  const [p2Name, setP2Name] = useState(playerNames.p2);
  const [p1Color, setP1Color] = useState<PenColor>(playerColors.p1);
  const [p2Color, setP2Color] = useState<PenColor>(playerColors.p2);
  const [inputCode, setInputCode] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateOnlineRoom = async () => {
    if (!player) return;
    await createRoom('pen-fight', player);
  };

  const handleJoinOnlineRoom = async () => {
    if (!player || !inputCode.trim()) return;
    const success = await joinRoomByCode(inputCode.trim(), player);
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
              ? 'Opponent'
              : p2Name.trim() || 'Player 2',
      },
      colors: { p1: p1Color, p2: p2Color },
    });
    onClose();
  };

  const copyRoomCode = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Player 1 Options */}
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

        {/* Player 2 Options for Local 2P */}
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

        {/* Online Multiplayer Section */}
        {mode === MODE_ONLINE && (
          <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Globe className={ICON_SM} />
              <span>Online Room Matchmaking</span>
            </div>

            {roomCode ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <span className="text-[11px] font-medium text-deck-400">
                  Room Created! Share code with your friend:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xl font-black tracking-widest text-amber-400">
                    {roomCode}
                  </span>
                  <button
                    type="button"
                    onClick={copyRoomCode}
                    className="inline-flex items-center gap-1 rounded bg-amber-500/20 px-2 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/30"
                  >
                    <Copy className="h-3 w-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCreateOnlineRoom}
                  disabled={connectionStatus === 'connecting'}
                  className="w-full gap-2 text-xs py-2"
                >
                  <Plus className={ICON_SM} />
                  <span>Create Host Room</span>
                </Button>

                <div className="relative my-1 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-surface-border" />
                  </div>
                  <span className="relative bg-surface-base px-2 text-[10px] uppercase font-bold text-deck-400">
                    OR JOIN EXISTING ROOM
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    maxLength={8}
                    placeholder="ENTER ROOM CODE"
                    className="flex-1 uppercase tracking-widest font-mono text-center rounded-lg border border-surface-border bg-surface-raised px-3 py-1.5 text-xs font-bold text-white outline-none focus:border-amber-500"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleJoinOnlineRoom}
                    disabled={!inputCode.trim() || connectionStatus === 'connecting'}
                    className="text-xs py-1.5"
                  >
                    Join
                  </Button>
                </div>
              </div>
            )}

            {errorMessage && (
              <div className="text-center font-mono text-[11px] text-red-400">{errorMessage}</div>
            )}
          </div>
        )}

        <Button
          type="button"
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
