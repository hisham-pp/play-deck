import type {
  AnagramPlayer,
  AnagramRoundPlan,
  AnagramRoundRecap,
  AnagramRoundResult,
  AnagramState,
} from '../types/anagram-sprint.types';
import { MODE_SURVIVAL, STATUS_ROUND_SUMMARY } from './anagram-constants';
import { finishMatch, isMatchOver } from './anagram-outcome';
import { scoreAnswer } from './anagram-scoring';
import { activePlayers, currentRound, hasAnswered } from './anagram-state';

/**
 * Placement is decided by the clock each seat stopped, never by the order the
 * answers reached this device. Two browsers replaying the same round therefore
 * settle on the same scoreboard without anyone refereeing.
 */
function rankResults(results: readonly AnagramRoundResult[]): AnagramRoundResult[] {
  return [...results].sort((a, b) => {
    if (a.elapsedMs !== b.elapsedMs) return a.elapsedMs - b.elapsedMs;
    return a.playerId.localeCompare(b.playerId);
  });
}

function scoreResults(
  results: readonly AnagramRoundResult[],
  round: AnagramRoundPlan,
  streakBefore: Map<string, number>,
): AnagramRoundResult[] {
  return rankResults(results).map((result, index) => {
    const breakdown = scoreAnswer({
      difficulty: round.entry.difficulty,
      placement: index + 1,
      elapsedMs: result.elapsedMs,
      roundSeconds: round.seconds,
      streak: (streakBefore.get(result.playerId) ?? 0) + 1,
    });
    return {
      ...result,
      placement: index + 1,
      points: breakdown.points,
      speedBonus: breakdown.speedBonus,
      streakBonus: breakdown.streakBonus,
    };
  });
}

function creditSolver(player: AnagramPlayer, result: AnagramRoundResult): AnagramPlayer {
  const streak = player.streak + 1;
  return {
    ...player,
    score: player.score + result.points,
    streak,
    bestStreak: Math.max(player.bestStreak, streak),
    solved: player.solved + 1,
    fastestMs:
      player.fastestMs === null ? result.elapsedMs : Math.min(player.fastestMs, result.elapsedMs),
  };
}

function penaliseMiss(player: AnagramPlayer, isSurvival: boolean): AnagramPlayer {
  const lives = isSurvival ? Math.max(0, player.lives - 1) : player.lives;
  return {
    ...player,
    streak: 0,
    missed: player.missed + 1,
    lives,
    eliminated: isSurvival && lives === 0,
  };
}

function summaryMessage(round: AnagramRoundPlan, scored: readonly AnagramRoundResult[]): string {
  if (scored.length === 0) return `Nobody got it — the word was "${round.entry.word}".`;
  const [first] = scored;
  const seconds = (first.elapsedMs / 1000).toFixed(1);
  return `"${round.entry.word}" — fastest in ${seconds}s for ${first.points} points.`;
}

/**
 * Settles the word: ranks the answers, pays them out, and charges everyone who
 * did not get there. The match then either ends or waits on the next deal.
 */
export function closeRound(state: AnagramState): AnagramState {
  const round = currentRound(state);
  if (!round) return state;

  const streakBefore = new Map(state.players.map((player) => [player.id, player.streak]));
  const scored = scoreResults(state.results, round, streakBefore);
  const byPlayer = new Map(scored.map((result) => [result.playerId, result]));
  const isSurvival = state.rules.mode === MODE_SURVIVAL;

  const missedIds = activePlayers(state)
    .filter((player) => !hasAnswered(state, player.id))
    .map((player) => player.id);

  const players = state.players.map((player) => {
    const result = byPlayer.get(player.id);
    if (result) return creditSolver(player, result);
    return missedIds.includes(player.id) ? penaliseMiss(player, isSurvival) : player;
  });

  const recap: AnagramRoundRecap = {
    index: round.index,
    answer: round.entry.word,
    difficulty: round.entry.difficulty,
    category: round.entry.category,
    results: scored,
    missedIds,
  };

  const settled: AnagramState = {
    ...state,
    status: STATUS_ROUND_SUMMARY,
    players,
    results: scored,
    history: [...state.history, recap],
    lastRejection: null,
    message: summaryMessage(round, scored),
  };

  return isMatchOver(settled) ? finishMatch(settled) : settled;
}
