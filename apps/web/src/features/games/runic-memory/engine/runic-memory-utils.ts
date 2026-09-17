import type {
  ActivePlayer,
  AIDifficulty,
  DifficultyLevel,
  GameMode,
  RunicCard,
  RunicGameState,
  RunicScores,
} from '../types/runic-memory.types';
import { MODE_SOLO, PLAYER_1, PLAYER_2, STATUS_IDLE } from './runic-memory-constants';
import { createRunicDeck } from './runic-memory-deck';

export function calculatePoints(combo: number): number {
  return 100 + (combo - 1) * 50;
}

export function resolveWinner(mode: GameMode, scores: RunicScores): ActivePlayer | 'tie' {
  if (mode === MODE_SOLO) {
    return PLAYER_1;
  }
  if (scores.P1 > scores.P2) return PLAYER_1;
  if (scores.P2 > scores.P1) return PLAYER_2;
  return 'tie';
}

export function getNextTurn(currentTurn: ActivePlayer, mode: GameMode): ActivePlayer {
  if (mode === MODE_SOLO) return PLAYER_1;
  return currentTurn === PLAYER_1 ? PLAYER_2 : PLAYER_1;
}

export function createInitialRunicState(options?: {
  mode?: GameMode;
  difficulty?: DifficultyLevel;
  aiDifficulty?: AIDifficulty;
  seed?: number;
}): RunicGameState {
  const mode = options?.mode || MODE_SOLO;
  const difficulty = options?.difficulty || 'apprentice';
  const aiDifficulty = options?.aiDifficulty || 'medium';
  const seed = options?.seed ?? Math.floor(Math.random() * 1000000);

  return {
    mode,
    difficulty,
    aiDifficulty,
    status: STATUS_IDLE,
    turn: PLAYER_1,
    board: createRunicDeck(difficulty, seed),
    selectedIndices: [],
    scores: { P1: 0, P2: 0 },
    moves: 0,
    matches: 0,
    combo: 0,
    maxCombo: 0,
    startTime: null,
    elapsedSeconds: 0,
    isAiThinking: false,
    winner: null,
    seed,
  };
}

export function createResetRoundState(prevState: RunicGameState, newSeed: number): RunicGameState {
  return {
    ...prevState,
    status: STATUS_IDLE,
    turn: PLAYER_1,
    board: createRunicDeck(prevState.difficulty, newSeed),
    selectedIndices: [],
    moves: 0,
    matches: 0,
    combo: 0,
    startTime: null,
    elapsedSeconds: 0,
    isAiThinking: false,
    winner: null,
    seed: newSeed,
  };
}

export function applyMatchToBoard(
  board: RunicCard[],
  firstIdx: number,
  secondIdx: number,
  turn: ActivePlayer,
): RunicCard[] {
  return board.map((c) =>
    c.index === firstIdx || c.index === secondIdx ? { ...c, isMatched: true, matchedBy: turn } : c,
  );
}

export function applyMismatchRevert(
  board: RunicCard[],
  firstIdx: number,
  secondIdx: number,
): RunicCard[] {
  return board.map((c) =>
    c.index === firstIdx || c.index === secondIdx ? { ...c, isFlipped: false } : c,
  );
}

export function executeAiTurn(
  ai: { chooseCard: (board: RunicCard[], selected: number[]) => number | null },
  getState: () => RunicGameState,
  flipCard: (idx: number, player: ActivePlayer) => boolean,
  onThinkingChange: (thinking: boolean) => void,
  aiThinkDelayMs: number,
): () => void {
  onThinkingChange(true);

  const timer1 = setTimeout(() => {
    const s = getState();
    if (s.turn !== PLAYER_2 || s.status === 'completed') {
      onThinkingChange(false);
      return;
    }
    const firstPick = ai.chooseCard(s.board, s.selectedIndices);
    if (firstPick === null) {
      onThinkingChange(false);
      return;
    }
    flipCard(firstPick, PLAYER_2);

    const timer2 = setTimeout(() => {
      const cur = getState();
      if (cur.turn === PLAYER_2 && cur.status !== 'completed') {
        const secondPick = ai.chooseCard(cur.board, cur.selectedIndices);
        if (secondPick !== null) flipCard(secondPick, PLAYER_2);
      }
      onThinkingChange(false);
    }, aiThinkDelayMs);

    return () => clearTimeout(timer2);
  }, aiThinkDelayMs);

  return () => clearTimeout(timer1);
}

export function computeMatchResolution(
  state: RunicGameState,
  firstIdx: number,
  secondIdx: number,
  totalPairs: number,
): { nextState: RunicGameState; isOver: boolean; points: number } {
  const { turn, combo, maxCombo, matches, moves, scores, mode } = state;
  const newCombo = combo + 1;
  const newMatches = matches + 1;
  const points = calculatePoints(newCombo);
  const newScores = { ...scores, [turn]: scores[turn] + points };
  const matchedBoard = applyMatchToBoard(state.board, firstIdx, secondIdx, turn);

  const isOver = newMatches >= totalPairs;
  const winner = isOver ? resolveWinner(mode, newScores) : null;

  const nextState: RunicGameState = {
    ...state,
    board: matchedBoard,
    selectedIndices: [],
    scores: newScores,
    moves: moves + 1,
    matches: newMatches,
    combo: newCombo,
    maxCombo: Math.max(maxCombo, newCombo),
    status: isOver ? 'completed' : 'playing',
    winner,
  };

  return { nextState, isOver, points };
}

export function computeMismatchState(
  state: RunicGameState,
  firstIdx: number,
  secondIdx: number,
): RunicGameState {
  return {
    ...state,
    selectedIndices: [firstIdx, secondIdx],
    moves: state.moves + 1,
    combo: 0,
    status: 'checking',
  };
}
