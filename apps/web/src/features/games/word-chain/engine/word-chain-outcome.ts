import type { WordChainPlayer, WordChainState } from '../types/word-chain.types';
import { MODE_POINTS, MODE_SOLO, MODE_TEAM, STATUS_FINISHED } from './word-chain-constants';
import { applySurvivalBonuses, topScorers } from './word-chain-scoring';
import { TEAM_LABELS, alivePlayers, aliveTeams } from './word-chain-state';

function winnerNames(players: readonly WordChainPlayer[], ids: readonly string[]): string {
  return players
    .filter((player) => ids.includes(player.id))
    .map((player) => player.name)
    .join(' & ');
}

function soloOutcome(state: WordChainState, players: WordChainPlayer[]): WordChainState {
  const chainLength = state.chain.length;
  return {
    ...state,
    status: STATUS_FINISHED,
    players,
    winnerIds: players.map((player) => player.id),
    winningTeam: null,
    message: `Run over — ${chainLength} ${chainLength === 1 ? 'word' : 'words'} in the chain.`,
  };
}

function pointsOutcome(state: WordChainState, players: WordChainPlayer[]): WordChainState {
  const winnerIds = topScorers(players);
  const label = winnerNames(players, winnerIds);
  return {
    ...state,
    status: STATUS_FINISHED,
    players,
    winnerIds,
    winningTeam: null,
    message:
      winnerIds.length > 1 ? `It is a tie — ${label} share the win.` : `${label} wins on points.`,
  };
}

function teamOutcome(state: WordChainState, players: WordChainPlayer[]): WordChainState {
  const remaining = aliveTeams(players);
  const winningTeam = remaining.length === 1 ? remaining[0] : null;
  const winnerIds = winningTeam
    ? alivePlayers(players)
        .filter((player) => player.team === winningTeam)
        .map((player) => player.id)
    : [];

  return {
    ...state,
    status: STATUS_FINISHED,
    players,
    winnerIds,
    winningTeam,
    message: winningTeam ? `${TEAM_LABELS[winningTeam]} takes it.` : 'Everyone is out — no winner.',
  };
}

function classicOutcome(state: WordChainState, players: WordChainPlayer[]): WordChainState {
  const survivors = alivePlayers(players);
  const winnerIds = survivors.map((player) => player.id);
  return {
    ...state,
    status: STATUS_FINISHED,
    players,
    winnerIds,
    winningTeam: null,
    message: winnerIds.length
      ? `${winnerNames(players, winnerIds)} is the last one standing.`
      : 'Everyone is out — no winner.',
  };
}

/**
 * Survival bonuses land before the winner is read off, so the scoreboard shown
 * on the results screen is the same one that decided a points-mode tie.
 */
export function finishGame(state: WordChainState): WordChainState {
  const { mode } = state.rules;
  const players = mode === MODE_POINTS ? state.players : applySurvivalBonuses(state.players);

  if (mode === MODE_SOLO) return soloOutcome(state, players);
  if (mode === MODE_POINTS) return pointsOutcome(state, players);
  if (mode === MODE_TEAM) return teamOutcome(state, players);
  return classicOutcome(state, players);
}

/** Whether the game is over the moment `turnCount` turns have been played. */
export function isGameOver(
  state: WordChainState,
  players: readonly WordChainPlayer[],
  turnCount: number,
): boolean {
  const { mode, totalRounds } = state.rules;
  if (mode === MODE_POINTS) {
    const seats = players.length || 1;
    return turnCount >= totalRounds * seats;
  }
  if (mode === MODE_SOLO) return alivePlayers(players).length === 0;
  if (mode === MODE_TEAM) return aliveTeams(players).length <= 1;
  return alivePlayers(players).length <= 1;
}
