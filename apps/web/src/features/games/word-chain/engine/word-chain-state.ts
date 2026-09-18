import type {
  WordChainPlayer,
  WordChainRules,
  WordChainSetupPlayer,
  WordChainState,
  WordChainTeam,
} from '../types/word-chain.types';
import { DEFAULT_RULES, MODE_SOLO, MODE_TEAM, TEAM_A, TEAM_B } from './word-chain-constants';
import {
  activeCategory,
  minLengthFor,
  normalizeWord,
  requiredPrefixFor,
  turnSecondsFor,
} from './word-chain-rules';

export function createPlayer(
  index: number,
  setup: WordChainSetupPlayer,
  lives: number,
): WordChainPlayer {
  return {
    id: `wc-p${index + 1}`,
    name: setup.name.trim() || `Player ${index + 1}`,
    team: setup.team,
    lives,
    score: 0,
    wordsPlayed: 0,
    longestWord: '',
    eliminated: false,
  };
}

/**
 * Team mode seats players A, B, A, B… so a plain round-robin alternates sides
 * without the turn logic needing to know anything about teams.
 */
export function seatPlayers(
  setup: WordChainSetupPlayer[],
  rules: WordChainRules,
): WordChainPlayer[] {
  const players = setup.map((entry, index) => createPlayer(index, entry, rules.lives));
  if (rules.mode !== MODE_TEAM) return players;

  const teamA = players.filter((player) => player.team === TEAM_A);
  const teamB = players.filter((player) => player.team === TEAM_B);
  const interleaved: WordChainPlayer[] = [];

  for (let i = 0; i < Math.max(teamA.length, teamB.length); i += 1) {
    if (teamA[i]) interleaved.push(teamA[i]);
    if (teamB[i]) interleaved.push(teamB[i]);
  }

  return interleaved.map((player, index) => ({ ...player, id: `wc-p${index + 1}` }));
}

export function createInitialState(rules: WordChainRules = DEFAULT_RULES): WordChainState {
  return {
    status: 'setup',
    rules,
    players: [],
    turnIndex: 0,
    turnCount: 0,
    round: 1,
    chain: [],
    usedWords: [],
    requiredPrefix: '',
    turnSeconds: rules.startingSeconds,
    turnStartedAt: 0,
    lastRejection: null,
    message: '',
    winnerIds: [],
    winningTeam: null,
  };
}

export function buildStartState(
  rules: WordChainRules,
  setup: WordChainSetupPlayer[],
  startingWord: string,
): WordChainState {
  const players = seatPlayers(setup, rules);
  const seed = normalizeWord(startingWord);

  return {
    ...createInitialState(rules),
    status: 'countdown',
    players,
    requiredPrefix: requiredPrefixFor(seed, rules.variant),
    usedWords: seed ? [seed] : [],
    turnSeconds: turnSecondsFor(rules, 0),
    message: seed ? `The chain opens with "${seed}".` : 'The chain is open — play any word.',
  };
}

export function alivePlayers(players: readonly WordChainPlayer[]): WordChainPlayer[] {
  return players.filter((player) => !player.eliminated);
}

export function aliveTeams(players: readonly WordChainPlayer[]): WordChainTeam[] {
  const teams = new Set(alivePlayers(players).map((player) => player.team));
  return [...teams];
}

/** Next seat that is still in the game, wrapping around the table. */
export function nextAliveIndex(players: readonly WordChainPlayer[], from: number): number {
  const count = players.length;
  for (let step = 1; step <= count; step += 1) {
    const candidate = (from + step) % count;
    if (!players[candidate].eliminated) return candidate;
  }
  return from;
}

export function isSoloRules(rules: WordChainRules): boolean {
  return rules.mode === MODE_SOLO;
}

/** The clock and length floor that apply to the turn at `turnCount`. */
export function turnConstraints(state: WordChainState, turnCount: number) {
  const laps = state.players.length > 0 ? Math.floor(turnCount / state.players.length) : 0;
  return {
    turnSeconds: turnSecondsFor(state.rules, laps),
    minLength: minLengthFor(state.rules, laps),
    category: activeCategory(state.rules),
    round: laps + 1,
  };
}

export const TEAM_LABELS: Record<WordChainTeam, string> = {
  [TEAM_A]: 'Team Amber',
  [TEAM_B]: 'Team Cobalt',
};
