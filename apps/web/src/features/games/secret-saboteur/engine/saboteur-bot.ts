import type {
  ChatMessage,
  ContributionCard,
  SaboteurPlayer,
  RoundSummary,
} from '../types/secret-saboteur.types';
import { ALL_CARDS, generateHand } from './saboteur-engine';

// ---------------------------------------------------------------------------
// Archetypes
// ---------------------------------------------------------------------------

export type SaboteurBotArchetype =
  | 'loyal-specialist' // Worker: always picks highest positive card
  | 'methodical-auditor' // Worker/Inspector: deliberate, accuses statistically
  | 'erratic-tinkerer' // Worker: unpredictable, sometimes picks low positive
  | 'cunning-infiltrator'; // Saboteur: blends in, strikes on critical rounds

// ---------------------------------------------------------------------------
// Card Selection
// ---------------------------------------------------------------------------

export interface BotCardContext {
  bot: SaboteurPlayer;
  round: number;
  totalRounds: number;
  reactorProgress: number;
  meltdownStrikes: number;
  history: RoundSummary[];
}

/** Pick the card a bot will play this round. */
export function decideBotCard(ctx: BotCardContext): ContributionCard {
  const { bot, round, totalRounds, reactorProgress, meltdownStrikes } = ctx;
  const hand = bot.hand.length > 0 ? bot.hand : generateHand(bot.role === 'saboteur');

  const positive = hand.filter((c) => !c.isSabotage);
  const sabotageCards = hand.filter((c) => c.isSabotage);
  const highestPositive = [...positive].sort((a, b) => b.powerDelta - a.powerDelta)[0];
  const lowestPositive = [...positive].sort((a, b) => a.powerDelta - b.powerDelta)[0];
  const highestSabotage = [...sabotageCards].sort((a, b) => a.powerDelta - b.powerDelta)[0];

  const archetype = bot.archetype as SaboteurBotArchetype | undefined;

  if (archetype === 'loyal-specialist') {
    return highestPositive ?? positive[0] ?? hand[0];
  }

  if (archetype === 'methodical-auditor') {
    // Picks second best positive card to be safe; escalates near the end
    const sorted = [...positive].sort((a, b) => b.powerDelta - a.powerDelta);
    const pick = round >= totalRounds - 1 ? sorted[0] : (sorted[1] ?? sorted[0]);
    return pick ?? hand[0];
  }

  if (archetype === 'erratic-tinkerer') {
    // Randomly picks between best and worst positive card
    return Math.random() < 0.5 ? (highestPositive ?? hand[0]) : (lowestPositive ?? hand[0]);
  }

  if (archetype === 'cunning-infiltrator') {
    // Blend in early with low positive, sabotage when progress > 60% or on critical round
    const isCritical = meltdownStrikes === 2 || reactorProgress > 70;
    const isEarlyRound = round <= 2;

    if (isEarlyRound) {
      return lowestPositive ?? highestPositive ?? hand[0];
    }
    if (isCritical && sabotageCards.length > 0) {
      return highestSabotage ?? sabotageCards[0];
    }
    if (Math.random() < 0.35 && sabotageCards.length > 0) {
      return sabotageCards[Math.floor(Math.random() * sabotageCards.length)];
    }
    return lowestPositive ?? hand[0];
  }

  // Fallback: pick random positive
  return positive[Math.floor(Math.random() * positive.length)] ?? hand[0];
}

// ---------------------------------------------------------------------------
// Trial Vote
// ---------------------------------------------------------------------------

export function decideBotTrialVote(
  bot: SaboteurPlayer,
  players: SaboteurPlayer[],
  history: RoundSummary[],
): string | null {
  const candidates = players.filter((p) => p.id !== bot.id && !p.isDetained);
  if (candidates.length === 0) return null;

  const archetype = bot.archetype as SaboteurBotArchetype | undefined;

  if (archetype === 'loyal-specialist') {
    // Vote for player with highest suspicion score
    const top = [...candidates].sort((a, b) => b.suspicionScore - a.suspicionScore)[0];
    return top && top.suspicionScore > 20 ? top.id : null;
  }

  if (archetype === 'methodical-auditor') {
    // Calculate suspicion from recent negative meltdowns and vote accordingly
    const lastRound = history[history.length - 1];
    if (lastRound?.meltdownAdded) {
      const mostSuspect = [...candidates].sort((a, b) => b.suspicionScore - a.suspicionScore)[0];
      return mostSuspect?.id ?? null;
    }
    return null;
  }

  if (archetype === 'cunning-infiltrator') {
    // Deflect by voting for the most vocal / highest suspicion (to blend in)
    const top = [...candidates].sort((a, b) => b.suspicionScore - a.suspicionScore)[0];
    return top?.id ?? null;
  }

  // Erratic tinkerer or fallback: random
  return candidates[Math.floor(Math.random() * candidates.length)]?.id ?? null;
}

// ---------------------------------------------------------------------------
// Bot Chat Messages
// ---------------------------------------------------------------------------

const BOT_LINES: Record<SaboteurBotArchetype, string[]> = {
  'loyal-specialist': [
    "Let's keep the reactor running. I'm giving everything I have.",
    'Reactor progress looks solid. Keep contributing positively.',
    'We need to maintain momentum. Anyone suspicious lately?',
    "I've been giving top cards every round—can we say the same for everyone?",
  ],
  'methodical-auditor': [
    "Based on the trend analysis, at least one person isn't performing optimally.",
    'I ran the numbers. Two consecutive negative deltas indicates infiltration.',
    'Statistically, a saboteur will try to blend in for the first two rounds.',
    "Interesting. I'll be watching the contribution patterns closely.",
  ],
  'erratic-tinkerer': [
    'Does anyone else feel like the reactor just... *breathes weirdly*?',
    "I'm just doing my thing. Don't read too much into it.",
    "Paranoia is the saboteur's best weapon. Stay calm, people!",
    'Every round is a mystery box. Love it!',
  ],
  'cunning-infiltrator': [
    "Everything I've contributed has been positive. Check the records.",
    "I'm suspicious of the quieter ones. They haven't said much.",
    'We need to focus on the mission, not point fingers randomly.',
    "Whatever you think you saw, it wasn't me.",
  ],
};

export function generateBotChatMessage(bot: SaboteurPlayer): ChatMessage {
  const archetype = (bot.archetype as SaboteurBotArchetype) ?? 'erratic-tinkerer';
  const lines = BOT_LINES[archetype] ?? BOT_LINES['erratic-tinkerer'];
  const text = lines[Math.floor(Math.random() * lines.length)];

  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    senderId: bot.id,
    senderName: bot.name,
    text,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

// ---------------------------------------------------------------------------
// Suspicion Score Update
// ---------------------------------------------------------------------------

/** Increase or decrease suspicion based on that player's net contribution. */
export function updateSuspicionScores(
  players: SaboteurPlayer[],
  contributions: { playerId: string; delta: number }[],
): SaboteurPlayer[] {
  const deltaMap: Record<string, number> = {};
  contributions.forEach(({ playerId, delta }) => {
    deltaMap[playerId] = delta;
  });

  return players.map((p) => {
    const delta = deltaMap[p.id] ?? 0;
    const change = delta < 0 ? 20 : delta < 10 ? 5 : -5;
    const score = Math.min(100, Math.max(0, p.suspicionScore + change));
    return { ...p, suspicionScore: score };
  });
}

export { ALL_CARDS };
