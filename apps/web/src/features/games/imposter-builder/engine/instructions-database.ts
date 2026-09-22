import type { BuildInstruction } from '../types/imposter-builder.types';

export const INSTRUCTIONS_DATABASE: BuildInstruction[] = [
  {
    id: 'house-red',
    normalVersion: 'Build a house with a red roof',
    imposterVersion: 'Build a house with a blue roof',
    category: 'Architecture',
  },
  {
    id: 'car-big',
    normalVersion: 'Build a large 4-wheel car',
    imposterVersion: 'Build a small 2-wheel vehicle',
    category: 'Vehicles',
  },
  {
    id: 'tree-tall',
    normalVersion: 'Build a tall green tree with a brown trunk',
    imposterVersion: 'Build a short purple bush with no trunk',
    category: 'Nature',
  },
  {
    id: 'cat-ears',
    normalVersion: 'Build a cat with pointy ears and a tail',
    imposterVersion: 'Build a cat with round ears and no tail',
    category: 'Animals',
  },
  {
    id: 'castle-tower',
    normalVersion: 'Build a castle with 4 towers',
    imposterVersion: 'Build a castle with 2 towers',
    category: 'Architecture',
  },
  {
    id: 'rocket-fire',
    normalVersion: 'Build a rocket with yellow flame',
    imposterVersion: 'Build a rocket with no flame',
    category: 'Space',
  },
  {
    id: 'flower-5',
    normalVersion: 'Build a flower with 5 petals',
    imposterVersion: 'Build a flower with 3 petals',
    category: 'Nature',
  },
  {
    id: 'sun-rays',
    normalVersion: 'Build a sun with 8 rays',
    imposterVersion: 'Build a sun with 4 rays',
    category: 'Nature',
  },
  {
    id: 'boat-sail',
    normalVersion: 'Build a sailboat with one white sail',
    imposterVersion: 'Build a motorboat with no sail',
    category: 'Vehicles',
  },
  {
    id: 'robot-arms',
    normalVersion: 'Build a robot with arms raised up',
    imposterVersion: 'Build a robot with arms at its sides',
    category: 'Technology',
  },
];

export function getRandomInstruction(): BuildInstruction {
  return INSTRUCTIONS_DATABASE[Math.floor(Math.random() * INSTRUCTIONS_DATABASE.length)]!;
}
