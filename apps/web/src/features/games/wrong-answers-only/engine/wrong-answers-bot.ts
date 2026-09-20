import type {
  BotHumorStyle,
  SubmittedWrongAnswer,
  WrongAnswersPlayer,
  WrongAnswersQuestion,
} from '../types/wrong-answers.types';

export const BOT_TEMPLATES: Array<{
  name: string;
  avatar: string;
  style: BotHumorStyle;
}> = [
  { name: 'Absurd Alice', avatar: '🦩', style: 'absurd' },
  { name: 'Literal Larry', avatar: '🤖', style: 'literal' },
  { name: 'Punny Pete', avatar: '🃏', style: 'punny' },
  { name: 'Conspiracy Carl', avatar: '🛸', style: 'conspiracy' },
];

export function generateBotAnswer(
  question: WrongAnswersQuestion,
  style: BotHumorStyle = 'absurd',
): string {
  if (question.botAnswers && question.botAnswers[style]) {
    return question.botAnswers[style];
  }

  // Fallbacks if prompt key missing
  switch (style) {
    case 'absurd':
      return 'A raccoon wearing a fedora accidentally tripped the master power switch.';
    case 'literal':
      return 'The dictionary definition was misprinted in 1984 and nobody bothered to fix it.';
    case 'punny':
      return 'It was an un-bear-able pun that broke the space-time continuum.';
    case 'conspiracy':
      return 'It is a clandestine experiment secretly funded by multinational pigeon conglomerates.';
  }
}

export function generateBotVote(
  bot: WrongAnswersPlayer,
  answers: SubmittedWrongAnswer[],
): string | null {
  // A bot cannot vote for its own answer
  const eligibleAnswers = answers.filter((a) => a.authorId !== bot.id);
  if (eligibleAnswers.length === 0) return null;

  // Absurd bots prefer long answers, Punny prefer punchy, etc.
  if (bot.botStyle === 'absurd') {
    eligibleAnswers.sort((a, b) => b.text.length - a.text.length);
  } else if (bot.botStyle === 'punny') {
    eligibleAnswers.sort((a, b) => a.text.length - b.text.length);
  } else {
    // Random pick with slight variance
    eligibleAnswers.sort(() => Math.random() - 0.5);
  }

  return eligibleAnswers[0]!.id;
}
