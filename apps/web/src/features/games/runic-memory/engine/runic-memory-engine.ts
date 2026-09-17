import type {
  ActivePlayer,
  AIDifficulty,
  DifficultyLevel,
  GameMode,
  RunicCard,
  RunicGameState,
} from '../types/runic-memory.types';
import { RunicMemoryAi } from './runic-memory-ai';
import {
  AI_THINK_DELAY_MS,
  FLIP_DELAY_MISMATCH_MS,
  GRID_CONFIGS,
  MODE_AI,
  PLAYER_2,
  STATUS_COMPLETED,
  STATUS_IDLE,
  STATUS_PLAYING,
} from './runic-memory-constants';
import {
  applyMismatchRevert,
  computeMatchResolution,
  computeMismatchState,
  createInitialRunicState,
  createResetRoundState,
  executeAiTurn,
  getNextTurn,
} from './runic-memory-utils';

export interface RunicEngineCallbacks {
  onCardFlipped?: (card: RunicCard, player: ActivePlayer) => void;
  onMatchFound?: (cards: [RunicCard, RunicCard], player: ActivePlayer, combo: number) => void;
  onMismatch?: (cards: [RunicCard, RunicCard], player: ActivePlayer) => void;
  onGameOver?: (state: RunicGameState) => void;
}

export class RunicMemoryEngine {
  private state: RunicGameState;
  private listeners: Set<(state: RunicGameState) => void> = new Set();
  private callbacks: RunicEngineCallbacks = {};
  private ai: RunicMemoryAi;
  private mismatchTimeout: NodeJS.Timeout | null = null;
  private cancelAiTurn: (() => void) | null = null;
  private timerInterval: NodeJS.Timeout | null = null;

  constructor(
    initialOptions?: {
      mode?: GameMode;
      difficulty?: DifficultyLevel;
      aiDifficulty?: AIDifficulty;
      seed?: number;
    },
    callbacks?: RunicEngineCallbacks,
  ) {
    if (callbacks) this.callbacks = callbacks;
    this.ai = new RunicMemoryAi(initialOptions?.aiDifficulty || 'medium');
    this.state = createInitialRunicState(initialOptions);
  }

  public getState(): RunicGameState {
    return { ...this.state, board: this.state.board.map((c) => ({ ...c })) };
  }

  public subscribe(listener: (state: RunicGameState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const s = this.getState();
    this.listeners.forEach((l) => l(s));
  }

  private startTimer(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      if (this.state.status === STATUS_PLAYING || this.state.status === 'checking') {
        this.state = { ...this.state, elapsedSeconds: this.state.elapsedSeconds + 1 };
        this.notify();
      }
    }, 1000);
  }

  private clearPendingTimers(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.mismatchTimeout) clearTimeout(this.mismatchTimeout);
    if (this.cancelAiTurn) this.cancelAiTurn();
  }

  public destroy(): void {
    this.clearPendingTimers();
    this.listeners.clear();
  }

  private isFlipAllowed(index: number, requestedPlayer?: ActivePlayer): boolean {
    const { board, selectedIndices, status, turn } = this.state;
    if (status === STATUS_COMPLETED || selectedIndices.length >= 2) return false;
    if (index < 0 || index >= board.length) return false;
    const card = board[index];
    if (!card || card.isFlipped || card.isMatched) return false;
    return !requestedPlayer || requestedPlayer === turn;
  }

  public flipCard(index: number, requestedPlayer?: ActivePlayer): boolean {
    if (!this.isFlipAllowed(index, requestedPlayer)) return false;

    if (this.state.status === STATUS_IDLE) {
      this.state.status = STATUS_PLAYING;
      this.state.startTime = Date.now();
      this.startTimer();
    }

    const updatedBoard = this.state.board.map((c) =>
      c.index === index ? { ...c, isFlipped: true } : c,
    );
    const newSelected = [...this.state.selectedIndices, index];

    this.ai.observeCard(updatedBoard[index]);
    this.callbacks.onCardFlipped?.(updatedBoard[index], this.state.turn);

    if (newSelected.length === 1) {
      this.state = { ...this.state, board: updatedBoard, selectedIndices: newSelected };
      this.notify();
      return true;
    }

    const [firstIdx, secondIdx] = newSelected;
    const isMatch = updatedBoard[firstIdx].runeId === updatedBoard[secondIdx].runeId;

    if (isMatch) {
      this.onMatchSuccess(firstIdx, secondIdx, updatedBoard);
    } else {
      this.onMismatchOccurred(firstIdx, secondIdx, updatedBoard);
    }
    return true;
  }

  private onMatchSuccess(firstIdx: number, secondIdx: number, board: RunicCard[]): void {
    const totalPairs = GRID_CONFIGS[this.state.difficulty].pairsCount;
    const { nextState, isOver } = computeMatchResolution(
      { ...this.state, board },
      firstIdx,
      secondIdx,
      totalPairs,
    );

    this.ai.forgetMatched([firstIdx, secondIdx]);
    this.callbacks.onMatchFound?.(
      [board[firstIdx], board[secondIdx]],
      this.state.turn,
      nextState.combo,
    );
    if (isOver) this.clearPendingTimers();

    this.state = nextState;
    this.notify();

    if (isOver) {
      this.callbacks.onGameOver?.(this.state);
    } else if (this.state.mode === MODE_AI && this.state.turn === PLAYER_2) {
      this.scheduleAiTurn();
    }
  }

  private onMismatchOccurred(firstIdx: number, secondIdx: number, board: RunicCard[]): void {
    this.state = computeMismatchState({ ...this.state, board }, firstIdx, secondIdx);
    this.notify();
    this.callbacks.onMismatch?.([board[firstIdx], board[secondIdx]], this.state.turn);

    if (this.mismatchTimeout) clearTimeout(this.mismatchTimeout);
    this.mismatchTimeout = setTimeout(() => {
      this.resolveMismatch(firstIdx, secondIdx);
    }, FLIP_DELAY_MISMATCH_MS);
  }

  public resolveMismatch(firstIdx: number, secondIdx: number): void {
    const revertedBoard = applyMismatchRevert(this.state.board, firstIdx, secondIdx);
    const nextTurn = getNextTurn(this.state.turn, this.state.mode);

    this.state = {
      ...this.state,
      board: revertedBoard,
      selectedIndices: [],
      turn: nextTurn,
      status: STATUS_PLAYING,
    };
    this.notify();

    if (this.state.mode === MODE_AI && nextTurn === PLAYER_2) {
      this.scheduleAiTurn();
    }
  }

  private scheduleAiTurn(): void {
    if (this.state.status === STATUS_COMPLETED) return;
    if (this.cancelAiTurn) this.cancelAiTurn();

    this.cancelAiTurn = executeAiTurn(
      this.ai,
      () => this.getState(),
      (idx, player) => this.flipCard(idx, player),
      (isThinking) => {
        this.state = { ...this.state, isAiThinking: isThinking };
        this.notify();
      },
      AI_THINK_DELAY_MS,
    );
  }

  public resetRound(newSeed?: number): void {
    this.clearPendingTimers();
    const seed = typeof newSeed === 'number' ? newSeed : Math.floor(Math.random() * 1000000);
    this.ai.resetMemory();
    this.state = createResetRoundState(this.state, seed);
    this.notify();
  }

  public resetMatch(
    difficulty?: DifficultyLevel,
    mode?: GameMode,
    aiDifficulty?: AIDifficulty,
    seed?: number,
  ): void {
    this.clearPendingTimers();
    const activeDiff = difficulty || this.state.difficulty;
    const activeMode = mode || this.state.mode;
    const activeAiDiff = aiDifficulty || this.state.aiDifficulty;
    const activeSeed = typeof seed === 'number' ? seed : Math.floor(Math.random() * 1000000);

    this.ai = new RunicMemoryAi(activeAiDiff);
    this.state = createInitialRunicState({
      difficulty: activeDiff,
      mode: activeMode,
      aiDifficulty: activeAiDiff,
      seed: activeSeed,
    });
    this.notify();
  }
}
