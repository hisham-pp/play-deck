import type { AnagramPlayer, AnagramState, AnagramTeam } from '../types/anagram-sprint.types';
import { MODE_SURVIVAL, MODE_TEAM, STATUS_FINISHED, TEAM_A, TEAM_B } from './anagram-constants';
import { rankPlayers, teamScore } from './anagram-scoring';
import { activePlayers } from './anagram-state';

/** Seats sharing the top score — a tie hands the match to all of them. */
function topScorers(players: readonly AnagramPlayer[]): AnagramPlayer[] {
  const ranked = rankPlayers(players);
  const best = ranked[0]?.score ?? 0;
  return ranked.filter((player) => player.score === best);
}

function winningTeamOf(players: readonly AnagramPlayer[]): AnagramTeam | null {
  const a = teamScore(players, TEAM_A);
  const b = teamScore(players, TEAM_B);
  if (a === b) return null;
  return a > b ? TEAM_A : TEAM_B;
}

/**
 * Survival ends the moment one seat is left standing — or, with a single seat,
 * when that seat runs out of lives. Every other mode plays the full card.
 */
export function isMatchOver(state: AnagramState): boolean {
  const played = state.roundIndex + 1;
  if (played >= state.rules.totalRounds) return true;
  if (state.rules.mode !== MODE_SURVIVAL) return false;

  const alive = activePlayers(state);
  return state.players.length > 1 ? alive.length <= 1 : alive.length === 0;
}

export function finishMatch(state: AnagramState): AnagramState {
  const survivors = activePlayers(state);
  const isSurvival = state.rules.mode === MODE_SURVIVAL;
  // Running out of lives is a loss, even when there is nobody else to lose to:
  // a solo survival run that ends in elimination has no winner at all.
  if (isSurvival && survivors.length === 0) {
    return {
      ...state,
      status: STATUS_FINISHED,
      winnerIds: [],
      winningTeam: null,
      message: 'Out of lives.',
    };
  }

  // A survival match is won by outlasting, not outscoring — unless the clock
  // ran the full card out with several seats still alive.
  const contenders =
    isSurvival && survivors.length < state.players.length ? survivors : state.players;

  const winningTeam = state.rules.mode === MODE_TEAM ? winningTeamOf(state.players) : null;
  const winners =
    winningTeam !== null
      ? state.players.filter((player) => player.team === winningTeam)
      : topScorers(contenders);

  return {
    ...state,
    status: STATUS_FINISHED,
    winnerIds: winners.map((player) => player.id),
    winningTeam,
    message: winners.length === 0 ? 'Nobody made it through.' : `${winners[0].name} takes it.`,
  };
}
