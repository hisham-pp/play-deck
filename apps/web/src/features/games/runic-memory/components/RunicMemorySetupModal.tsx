'use client';

import { Bot, Brain, Globe, Users } from 'lucide-react';
import React, { useState } from 'react';
import { Button, Modal } from '@playdeck/ui';
import {
  GRID_CONFIGS,
  MODE_AI,
  MODE_MULTIPLAYER,
  MODE_PASS_AND_PLAY,
  MODE_SOLO,
} from '../engine/runic-memory-constants';
import type { AIDifficulty, DifficultyLevel, GameMode } from '../types/runic-memory.types';
import { RunicMemoryOnlineSetup } from './RunicMemoryOnlineSetup';

interface RunicMemorySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: GameMode;
  currentDifficulty: DifficultyLevel;
  currentAiDifficulty: AIDifficulty;
  onStartMatch: (config: {
    mode: GameMode;
    difficulty: DifficultyLevel;
    aiDifficulty: AIDifficulty;
  }) => void;
}

const BTN_TYPE = 'button';
const INACTIVE_CARD_CLS = 'bg-surface-overlay border-surface-border text-deck-400 hover:text-white';

export function RunicMemorySetupModal({
  isOpen,
  onClose,
  currentMode,
  currentDifficulty,
  currentAiDifficulty,
  onStartMatch,
}: RunicMemorySetupModalProps) {
  const [mode, setMode] = useState<GameMode>(currentMode);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(currentDifficulty);
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(currentAiDifficulty);

  const handleStart = () => {
    onStartMatch({ mode, difficulty, aiDifficulty });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Runic Memory Configuration">
      <div className="flex flex-col gap-5 py-2">
        {/* GAME MODE SELECTION */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-deck-400 uppercase tracking-wider">
            Game Mode
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type={BTN_TYPE}
              onClick={() => setMode(MODE_SOLO)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                mode === MODE_SOLO
                  ? 'bg-purple-950/40 border-purple-500/80 text-white ring-1 ring-purple-500/40'
                  : INACTIVE_CARD_CLS
              }`}
            >
              <Brain className="w-4 h-4 text-purple-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Solitaire</span>
                <span className="text-[10px] text-deck-500">Solo Brain Training</span>
              </div>
            </button>

            <button
              type={BTN_TYPE}
              onClick={() => setMode(MODE_AI)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                mode === MODE_AI
                  ? 'bg-amber-950/40 border-amber-500/80 text-white ring-1 ring-amber-500/40'
                  : INACTIVE_CARD_CLS
              }`}
            >
              <Bot className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">VS AI Bot</span>
                <span className="text-[10px] text-deck-500">Cognitive Opponent</span>
              </div>
            </button>

            <button
              type={BTN_TYPE}
              onClick={() => setMode(MODE_PASS_AND_PLAY)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                mode === MODE_PASS_AND_PLAY
                  ? 'bg-cyan-950/40 border-cyan-500/80 text-white ring-1 ring-cyan-500/40'
                  : INACTIVE_CARD_CLS
              }`}
            >
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Pass & Play</span>
                <span className="text-[10px] text-deck-500">2-Player Shared</span>
              </div>
            </button>

            <button
              type={BTN_TYPE}
              onClick={() => setMode(MODE_MULTIPLAYER)}
              className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                mode === MODE_MULTIPLAYER
                  ? 'bg-emerald-950/40 border-emerald-500/80 text-white ring-1 ring-emerald-500/40'
                  : INACTIVE_CARD_CLS
              }`}
            >
              <Globe className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Online Duel</span>
                <span className="text-[10px] text-deck-500">Room Code + Voice</span>
              </div>
            </button>
          </div>
        </div>

        {/* ONLINE ROOM SETUP IF MULTIPLAYER */}
        {mode === MODE_MULTIPLAYER ? (
          <RunicMemoryOnlineSetup difficulty={difficulty} onStartMatch={handleStart} />
        ) : (
          <>
            {/* GRID DIFFICULTY SELECTION */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-deck-400 uppercase tracking-wider">
                Grid Size & Complexity
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(Object.keys(GRID_CONFIGS) as DifficultyLevel[]).map((level) => {
                  const cfg = GRID_CONFIGS[level];
                  const isSel = difficulty === level;
                  return (
                    <button
                      key={level}
                      type={BTN_TYPE}
                      onClick={() => setDifficulty(level)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        isSel
                          ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold'
                          : INACTIVE_CARD_CLS
                      }`}
                    >
                      <span className="text-xs font-bold capitalize">{level}</span>
                      <span className="text-[10px] text-deck-500 mt-0.5">
                        {cfg.columns}×{cfg.rows} ({cfg.pairsCount} pairs)
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* AI DIFFICULTY IF AI MODE */}
            {mode === MODE_AI && (
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-deck-400 uppercase tracking-wider">
                  AI Opponent Memory
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['easy', 'medium', 'hard'] as AIDifficulty[]).map((d) => (
                    <button
                      key={d}
                      type={BTN_TYPE}
                      onClick={() => setAiDifficulty(d)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold capitalize transition-all ${
                        aiDifficulty === d
                          ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                          : INACTIVE_CARD_CLS
                      }`}
                    >
                      {d === 'easy'
                        ? 'Novice (35%)'
                        : d === 'medium'
                          ? 'Adept (75%)'
                          : 'Elder (95%)'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* START BUTTON */}
            <Button type={BTN_TYPE} variant="primary" onClick={handleStart} className="w-full mt-2">
              Start Game
            </Button>
          </>
        )}
      </div>
    </Modal>
  );
}
