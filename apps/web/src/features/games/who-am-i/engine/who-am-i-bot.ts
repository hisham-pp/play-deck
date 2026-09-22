import type { IdentityItem, VoteAnswer, WhoAmIPlayer } from '../types/who-am-i.types';

const BOT_QUESTIONS = [
  'Am I a human being?',
  'Am I still alive today?',
  'Am I a fictional character?',
  'Am I an animal?',
  'Am I an inanimate object or food?',
  'Can I fly?',
  'Am I famous in history?',
  'Do I wear a special uniform or costume?',
  'Am I from a movie or television show?',
  'Am I bigger than a breadbox?',
];

export function generateBotAnswer(questionText: string, targetIdentity: IdentityItem): VoteAnswer {
  const q = questionText.toLowerCase();

  if (q.includes('human') || q.includes('person') || q.includes('people')) {
    return targetIdentity.isHuman ? 'yes' : 'no';
  }

  if (q.includes('alive') || q.includes('living')) {
    return targetIdentity.isAlive ? 'yes' : 'no';
  }

  if (q.includes('fictional') || q.includes('fake') || q.includes('story') || q.includes('movie')) {
    return targetIdentity.isFictional || targetIdentity.category === 'movie-characters'
      ? 'yes'
      : 'no';
  }

  if (q.includes('animal') || q.includes('creature') || q.includes('pet')) {
    return targetIdentity.category === 'animals' ? 'yes' : 'no';
  }

  if (q.includes('object') || q.includes('thing') || q.includes('food') || q.includes('tool')) {
    return targetIdentity.isObject ? 'yes' : 'no';
  }

  if (q.includes('fly') || q.includes('flying') || q.includes('wings')) {
    return targetIdentity.canFly ? 'yes' : 'no';
  }

  if (q.includes('history') || q.includes('historical') || q.includes('past')) {
    return targetIdentity.category === 'historical-figures' ? 'yes' : 'no';
  }

  if (q.includes('profession') || q.includes('job') || q.includes('career')) {
    return targetIdentity.category === 'professions' ? 'yes' : 'no';
  }

  // Default fallback
  const rand = Math.random();
  if (rand < 0.45) return 'yes';
  if (rand < 0.85) return 'no';
  return 'maybe';
}

export function generateBotQuestion(botPlayer: WhoAmIPlayer): string {
  const qIndex = botPlayer.questionsAsked % BOT_QUESTIONS.length;
  return BOT_QUESTIONS[qIndex] ?? 'Am I a living person?';
}

export function generateBotGuess(botPlayer: WhoAmIPlayer): string | null {
  // If bot asked 3 or more questions, it has a 60% chance to guess correctly, or guess a plausible guess
  if (botPlayer.questionsAsked >= 3) {
    const roll = Math.random();
    if (roll < 0.7) {
      return botPlayer.identity.name;
    }
    return 'Sherlock Holmes';
  }
  return null;
}
