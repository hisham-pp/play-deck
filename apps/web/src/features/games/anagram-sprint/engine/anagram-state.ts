import type {
  AnagramPlayer,
  AnagramRoundPlan,
  AnagramRules,
  AnagramSeat,
  AnagramState,
} from '../types/anagram-sprint.types';
import {
  DEFAULT_AVATAR,
  DEFAULT_RULES,
  MODE_TEAM,
  STATUS_COUNTDOWN,
  STATUS_SETUP,
  TEAM_A,
  TEAM_B,
} from './anagram-constants';
import { buildRoundPlan } from './anagram-rounds';

export function createPlayer(seat: AnagramSeat, rules: AnagramRules): AnagramPlayer {
  return {
    id: seat.id,
    name: seat.name.trim() || 'Player',
    avatar: seat.avatar || DEFAULT_AVATAR,
    team: seat.team,
    score: 0,
    streak: 0,
    bestStreak: 0,
    solved: 0,
    missed: 0,
    // Every mode carries lives so the shape survives a JSON round trip;
    // only survival ever spends them.
    lives: rules.lives,
    eliminated: false,
    fastestMs: null,
  };
}

/**
 * Team mode alternates the seating so the scoreboard reads A, B, A, B — the
 * race itself is simultaneous, so seating is presentation rather than turn order.
 */
export function seatPlayers(seats: readonly AnagramSeat[], rules: AnagramRules): AnagramPlayer[] {
  const players = seats.map((seat) => createPlayer(seat, rules));
  if (rules.mode !== MODE_TEAM) return players;

  const teamA = players.filter((player) => player.team === TEAM_A);
  const teamB = players.filter((player) => player.team === TEAM_B);
  const interleaved: AnagramPlayer[] = [];

  for (let i = 0; i < Math.max(teamA.length, teamB.length); i += 1) {
    if (teamA[i]) interleaved.push(teamA[i]);
    if (teamB[i]) interleaved.push(teamB[i]);
  }
  return interleaved;
}

export function createInitialState(rules: AnagramRules = DEFAULT_RULES): AnagramState {
  return {
    status: STATUS_SETUP,
    rules,
    seed: 0,
    players: [],
    plan: [],
    roundIndex: 0,
    roundStartedAt: 0,
    attemptsUsed: {},
    results: [],
    history: [],
    lastRejection: null,
    message: '',
    winnerIds: [],
    winningTeam: null,
  };
}

export function buildStartState(
  rules: AnagramRules,
  seats: readonly AnagramSeat[],
  seed: number,
): AnagramState {
  return {
    ...createInitialState(rules),
    status: STATUS_COUNTDOWN,
    seed,
    players: seatPlayers(seats, rules),
    plan: buildRoundPlan(rules, seed),
    message: `${rules.totalRounds} words. Fastest correct answer scores most.`,
  };
}

export function currentRound(state: AnagramState): AnagramRoundPlan | null {
  return state.plan[state.roundIndex] ?? null;
}

export function activePlayers(state: AnagramState): AnagramPlayer[] {
  return state.players.filter((player) => !player.eliminated);
}

export function attemptsLeft(state: AnagramState, playerId: string): number {
  return Math.max(0, state.rules.maxAttempts - (state.attemptsUsed[playerId] ?? 0));
}

export function hasAnswered(state: AnagramState, playerId: string): boolean {
  return state.results.some((result) => result.playerId === playerId);
}

/** True once nobody left in the match can still answer the current word. */
export function everyoneIsDone(state: AnagramState): boolean {
  return activePlayers(state).every(
    (player) => hasAnswered(state, player.id) || attemptsLeft(state, player.id) === 0,
  );
}

export function findPlayer(state: AnagramState, playerId: string): AnagramPlayer | undefined {
  return state.players.find((player) => player.id === playerId);
}
