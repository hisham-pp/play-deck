import type { Mission } from '../types/secret-mission.types';

export const MISSIONS_DATABASE: Mission[] = [
  {
    id: 'high-five-3',
    type: 'social',
    title: 'High-Five Collector',
    description: 'Get 3 players to mention greetings on voice chat',
    completionCriteria: 'Say hello to 3 different players',
  },
  {
    id: 'make-laugh',
    type: 'social',
    title: 'The Comedian',
    description: 'Make someone genuinely laugh on voice chat',
    completionCriteria: 'Cause audible laughter from another player',
  },
  {
    id: 'corner-dweller',
    type: 'behavioral',
    title: 'Corner Dweller',
    description: 'Stay quiet in voice for 30 consecutive seconds',
    completionCriteria: 'Do not speak for 30 seconds straight',
  },
  {
    id: 'question-master',
    type: 'social',
    title: 'Question Master',
    description: 'Ask 5 different questions to other players',
    completionCriteria: 'Ask 5 questions without answering any',
  },
  {
    id: 'last-voter',
    type: 'meta',
    title: 'The Last Vote',
    description: 'Be the last person to respond in any vote',
    completionCriteria: 'Cast your vote after all others',
  },
  {
    id: 'storyteller',
    type: 'social',
    title: 'Storyteller',
    description: 'Tell a short story about your day on voice chat',
    completionCriteria: 'Narrate at least 5 sentences about your day',
  },
  {
    id: 'silent-listener',
    type: 'behavioral',
    title: 'Silent Listener',
    description: 'Let 3 other players speak before you speak',
    completionCriteria: 'Do not speak until 3 others have spoken',
  },
  {
    id: 'compliment-giver',
    type: 'social',
    title: 'Compliment Giver',
    description: 'Give genuine compliments to 2 different players',
    completionCriteria: 'Compliment 2 different players',
  },
  {
    id: 'disagree-then-agree',
    type: 'social',
    title: "Devil's Advocate",
    description: 'Disagree with 2 statements then agree with one',
    completionCriteria: 'Voice disagreement twice, then agreement once',
  },
  {
    id: 'first-accusation',
    type: 'meta',
    title: 'First Blood',
    description: 'Be the first player to make an accusation',
    completionCriteria: 'Accuse someone before any other player does',
  },
  {
    id: 'mention-food',
    type: 'behavioral',
    title: 'Foodie',
    description: 'Mention 3 different foods naturally in conversation',
    completionCriteria: 'Say 3 food names without being asked',
  },
  {
    id: 'ask-about-weather',
    type: 'social',
    title: 'Small Talk Expert',
    description: 'Bring up the weather and get 2 responses',
    completionCriteria: 'Discuss weather until 2 players respond',
  },
];

export function getRandomMissions(count: number): Mission[] {
  const shuffled = [...MISSIONS_DATABASE].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
