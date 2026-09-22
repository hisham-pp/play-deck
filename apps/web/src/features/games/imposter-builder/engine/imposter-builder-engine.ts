import type {
  BuildCell,
  ImposterBuilderPlayer,
  ImposterBuilderState,
} from '../types/imposter-builder.types';
import { getRandomInstruction } from './instructions-database';

const GRID_SIZE = 8;
const BUILD_DURATION = 90;
const DISCUSSION_DURATION = 60;
const CORRECT_VOTE_POINTS = 150;
const IMPOSTER_SURVIVES_POINTS = 250;

function createEmptyGrid(): BuildCell[][] {
  return Array.from({ length: GRID_SIZE }, (_, row) =>
    Array.from({ length: GRID_SIZE }, (_, col) => ({
      row,
      col,
      color: '#3b82f6',
      filled: false,
    })),
  );
}

export function createInitialState(
  players: Array<{
    id: string;
    displayName: string;
    avatar: string;
    isHost: boolean;
    isBot: boolean;
  }>,
  maxRounds = 3,
): ImposterBuilderState {
  const imposterIdx = Math.floor(Math.random() * players.length);
  const instruction = getRandomInstruction();

  const gamePlayers: ImposterBuilderPlayer[] = players.map((p, idx) => ({
    id: p.id,
    displayName: p.displayName,
    avatar: p.avatar,
    isHost: p.isHost,
    isBot: p.isBot,
    isImposter: idx === imposterIdx,
    grid: createEmptyGrid(),
    votedForId: null,
    score: 0,
  }));

  return {
    phase: 'building',
    players: gamePlayers,
    instruction,
    buildTimeRemaining: BUILD_DURATION,
    discussionTimeRemaining: DISCUSSION_DURATION,
    roundNumber: 1,
    maxRounds,
  };
}

export function toggleCell(
  state: ImposterBuilderState,
  playerId: string,
  row: number,
  col: number,
  color: string,
): ImposterBuilderState {
  if (state.phase !== 'building') return state;

  const updatedPlayers = state.players.map((p) => {
    if (p.id !== playerId) return p;
    const newGrid = p.grid.map((r, ri) =>
      r.map((cell, ci) => {
        if (ri === row && ci === col) {
          return { ...cell, filled: !cell.filled, color };
        }
        return cell;
      }),
    );
    return { ...p, grid: newGrid };
  });

  return { ...state, players: updatedPlayers };
}

export function revealBuilds(state: ImposterBuilderState): ImposterBuilderState {
  if (state.phase !== 'building') return state;
  return { ...state, phase: 'reveal' };
}

export function startDiscussion(state: ImposterBuilderState): ImposterBuilderState {
  if (state.phase !== 'reveal') return state;
  return { ...state, phase: 'discussion' };
}

export function startVoting(state: ImposterBuilderState): ImposterBuilderState {
  if (state.phase !== 'discussion') return state;
  return { ...state, phase: 'voting' };
}

export function castVote(
  state: ImposterBuilderState,
  voterId: string,
  suspectId: string,
): ImposterBuilderState {
  if (state.phase !== 'voting') return state;

  const updatedPlayers = state.players.map((p) =>
    p.id === voterId ? { ...p, votedForId: suspectId } : p,
  );

  const allVoted = updatedPlayers.every((p) => p.votedForId !== null);

  return {
    ...state,
    players: updatedPlayers,
    phase: allVoted ? 'game-over' : 'voting',
  };
}

export function tallyFinalScores(state: ImposterBuilderState): ImposterBuilderState {
  const imposter = state.players.find((p) => p.isImposter);
  if (!imposter) return { ...state, phase: 'game-over' };

  const votesForImposter = state.players.filter((p) => p.votedForId === imposter.id).length;
  const majority = votesForImposter > state.players.length / 2;

  const updatedPlayers = state.players.map((p) => {
    if (p.isImposter) {
      return { ...p, score: majority ? p.score : p.score + IMPOSTER_SURVIVES_POINTS };
    }
    if (p.votedForId === imposter.id) {
      return { ...p, score: p.score + CORRECT_VOTE_POINTS };
    }
    return p;
  });

  return { ...state, phase: 'game-over', players: updatedPlayers };
}
