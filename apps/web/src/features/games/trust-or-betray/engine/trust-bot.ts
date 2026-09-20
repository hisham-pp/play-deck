import type {
  BotArchetype,
  ChatMessage,
  MissionObjective,
  PlayerChoice,
  RoundResult,
  TrustPlayer,
} from '../types/trust-or-betray.types';

export interface BotDecisionContext {
  bot: TrustPlayer;
  allPlayers: TrustPlayer[];
  currentRound: number;
  mission: MissionObjective;
  cooperationStreak: number;
  history: RoundResult[];
}

export function decideBotChoice({
  bot,
  allPlayers,
  currentRound: _currentRound,
  mission,
  cooperationStreak,
  history,
}: BotDecisionContext): PlayerChoice {
  const archetype = bot.archetype ?? 'saint';

  if (archetype === 'saint') {
    // Saint cooperates 90% of the time. Only retaliates if group has suffered repeated betrayals.
    const recentBetrayals = history
      .slice(-2)
      .filter((r) => Object.values(r.choices).some((c) => c === 'betray')).length;
    if (recentBetrayals >= 2 && Math.random() < 0.25) {
      return 'betray';
    }
    return 'cooperate';
  }

  if (archetype === 'opportunist') {
    // Opportunist betrays when the payout is ripe or streak is high
    const isHighValue = mission.basePot >= 420;
    const isHighStreak = cooperationStreak >= 2;
    if (isHighStreak || isHighValue) {
      return Math.random() < 0.6 ? 'betray' : 'cooperate';
    }
    return Math.random() < 0.25 ? 'betray' : 'cooperate';
  }

  if (archetype === 'grudgebearer') {
    // Tit-for-tat retaliation
    const lastRound = history[history.length - 1];
    if (lastRound) {
      const anyBetrayed = Object.entries(lastRound.choices).some(
        ([playerId, choice]) => playerId !== bot.id && choice === 'betray',
      );
      if (anyBetrayed) {
        return Math.random() < 0.75 ? 'betray' : 'cooperate';
      }
    }
    return 'cooperate';
  }

  // Wildcard: erratic behavior
  const others = allPlayers.filter((p) => p.id !== bot.id && !p.isExiled);
  const highestScorer = [...others].sort((a, b) => b.score - a.score)[0];
  if (highestScorer && highestScorer.score > bot.score + 100) {
    return Math.random() < 0.65 ? 'betray' : 'cooperate';
  }
  return Math.random() < 0.5 ? 'betray' : 'cooperate';
}

export function decideBotTrialVote(
  bot: TrustPlayer,
  players: TrustPlayer[],
  history: RoundResult[],
): string | null {
  const candidates = players.filter((p) => p.id !== bot.id && !p.isExiled);
  if (candidates.length === 0) return null;

  const archetype = bot.archetype ?? 'saint';

  if (archetype === 'saint') {
    // Votes for the lowest trust rating if below 40%, otherwise abstains
    const lowest = [...candidates].sort((a, b) => a.trustRating - b.trustRating)[0];
    if (lowest && lowest.trustRating < 40) {
      return lowest.id;
    }
    return null;
  }

  if (archetype === 'grudgebearer') {
    // Votes for whoever betrayed most recently or has most betrayals
    const lastRound = history[history.length - 1];
    if (lastRound) {
      const recentBetrayers = candidates.filter((c) => lastRound.choices[c.id] === 'betray');
      if (recentBetrayers.length > 0) {
        return recentBetrayers[0].id;
      }
    }
    const mostBetrayals = [...candidates].sort((a, b) => b.betrayalCount - a.betrayalCount)[0];
    return mostBetrayals?.betrayalCount > 0 ? mostBetrayals.id : null;
  }

  if (archetype === 'opportunist') {
    // Votes for the top scorer with at least 1 betrayal to knock them down
    const leaders = [...candidates]
      .filter((c) => c.betrayalCount > 0)
      .sort((a, b) => b.score - a.score);
    if (leaders.length > 0) {
      return leaders[0].id;
    }
    const lowestTrust = [...candidates].sort((a, b) => a.trustRating - b.trustRating)[0];
    return lowestTrust ? lowestTrust.id : null;
  }

  // Wildcard: picks top vote target or random candidate
  const sorted = [...candidates].sort((a, b) => b.score - a.score);
  return sorted[Math.floor(Math.random() * sorted.length)]?.id ?? null;
}

const BOT_QUOTES: Record<BotArchetype, string[]> = {
  saint: [
    "Let's stay united. Cooperation guarantees everyone wins!",
    'Divided we gain nothing. Stay true to the mission.',
    'I will hold the line if everyone else does.',
    'Trust is our greatest asset. Do not throw it away.',
  ],
  opportunist: [
    'Huge pot this round. Someone is bound to turn greedy...',
    "I'm locking in cooperate, don't let me down team!",
    'We should watch the score leaders closely.',
    'Mutual cooperation gives the best expected value right now.',
  ],
  grudgebearer: [
    'I remember every betrayal. Betray me and you seal your fate.',
    'Actions have consequences. Choose wisely.',
    'I never forget a broken pact.',
    'Fool me once, shame on you. Try it twice and see what happens.',
  ],
  wildcard: [
    'Who said we have to play by the rules?',
    'Fortune favors the bold. Or does it?',
    'Chaos keeps things interesting, does it not?',
    'Nobody can predict the next twist!',
  ],
};

export function generateBotChatMessage(bot: TrustPlayer): ChatMessage {
  const archetype = bot.archetype ?? 'wildcard';
  const quotes = BOT_QUOTES[archetype] ?? BOT_QUOTES.wildcard;
  const text = quotes[Math.floor(Math.random() * quotes.length)];

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: bot.id,
    senderName: bot.name,
    text,
    timestamp: new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}
