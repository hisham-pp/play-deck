'use client';

import React from 'react';
import { Modal } from '@playdeck/ui';
import type { SudokuDifficulty, SudokuStats } from '../types/sudoku.types';
import { SudokuDifficultyPicker } from './SudokuDifficultyPicker';

export interface SudokuSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDifficulty: SudokuDifficulty;
  stats: SudokuStats | null;
  onPick: (difficulty: SudokuDifficulty) => void;
}

export function SudokuSetupModal({
  isOpen,
  onClose,
  activeDifficulty,
  stats,
  onPick,
}: SudokuSetupModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Choose Your Grid"
      description="Seven levels, from a gentle Starter to a near-minimal Insane. Every puzzle is generated fresh with exactly one solution."
      size="lg"
    >
      <SudokuDifficultyPicker activeDifficulty={activeDifficulty} stats={stats} onPick={onPick} />
    </Modal>
  );
}
