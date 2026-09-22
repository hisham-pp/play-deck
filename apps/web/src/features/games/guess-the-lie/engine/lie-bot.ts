import type { LiePlayer, LiePrompt, SubmittedAnswer } from '../types/guess-the-lie.types';

export function generateBotAnswer(bot: LiePlayer, prompt: LiePrompt): string {
  if (bot.role === 'liar') {
    const lies = prompt.exampleLies;
    if (lies.length > 0) {
      return lies[Math.floor(Math.random() * lies.length)]!;
    }
    return 'An absolute fabrication that sounds oddly plausible.';
  }

  const truths = prompt.exampleTruths;
  if (truths.length > 0) {
    return truths[Math.floor(Math.random() * truths.length)]!;
  }
  return 'A genuine truthful fact from personal experience.';
}

export function generateBotVote(bot: LiePlayer, answers: SubmittedAnswer[]): string | null {
  // Never vote for own answer
  const eligibleAnswers = answers.filter((a) => a.authorId !== bot.id);
  if (eligibleAnswers.length === 0) return null;

  // If the bot is the Liar, it intentionally votes for a truth-teller's answer to deflect suspicion
  if (bot.role === 'liar') {
    const truthAnswers = eligibleAnswers.filter((a) => !a.isLie);
    const pool = truthAnswers.length > 0 ? truthAnswers : eligibleAnswers;
    return pool[Math.floor(Math.random() * pool.length)]!.id;
  }

  // If the bot is a Truth-teller, detection depends on persona
  const lieAnswer = eligibleAnswers.find((a) => a.isLie);
  const persona = bot.botPersona ?? 'convincing';

  let detectionProbability = 0.5;
  if (persona === 'analytical') {
    detectionProbability = 0.75;
  } else if (persona === 'blatant' || persona === 'creative') {
    detectionProbability = 0.35;
  }

  if (lieAnswer && Math.random() < detectionProbability) {
    return lieAnswer.id;
  }

  // Otherwise pick a random eligible answer
  return eligibleAnswers[Math.floor(Math.random() * eligibleAnswers.length)]!.id;
}
