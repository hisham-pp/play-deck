import type {
  HangmanBankWord,
  HangmanCategory,
  HangmanDifficulty,
} from '../types/hangman-duel.types';
import { DIFFICULTY_EASY, DIFFICULTY_HARD, DIFFICULTY_MEDIUM } from './hangman-constants';

export function buildBucket(
  words: readonly string[],
  category: HangmanCategory,
  difficulty: HangmanDifficulty,
): HangmanBankWord[] {
  return words.map((word) => ({ word, category, difficulty }));
}

const ANIMALS_EASY = [
  'otter',
  'horse',
  'eagle',
  'tiger',
  'zebra',
  'sheep',
  'mouse',
  'whale',
  'camel',
  'goose',
  'shark',
  'koala',
  'llama',
  'snail',
  'robin',
] as const;

const ANIMALS_MEDIUM = [
  'dolphin',
  'penguin',
  'octopus',
  'leopard',
  'raccoon',
  'buffalo',
  'hedgehog',
  'flamingo',
  'antelope',
  'tortoise',
  'squirrel',
  'meerkat',
  'pelican',
  'walrus',
] as const;

const ANIMALS_HARD = [
  'jellyfish',
  'chameleon',
  'rhinoceros',
  'hummingbird',
  'woodpecker',
  'wolverine',
  'chimpanzee',
  'kookaburra',
  'armadillo',
  'porcupine',
  'jackrabbit',
  'orangutan',
] as const;

const FOOD_EASY = [
  'bread',
  'mango',
  'onion',
  'peach',
  'olive',
  'lemon',
  'melon',
  'toast',
  'curry',
  'salad',
  'honey',
  'bacon',
  'cocoa',
  'grape',
  'waffle',
] as const;

const FOOD_MEDIUM = [
  'noodles',
  'pancake',
  'avocado',
  'biscuit',
  'lasagne',
  'pudding',
  'custard',
  'paprika',
  'oatmeal',
  'popcorn',
  'brownie',
  'ravioli',
  'spinach',
  'chutney',
] as const;

const FOOD_HARD = [
  'guacamole',
  'cheesecake',
  'marshmallow',
  'quesadilla',
  'jambalaya',
  'watermelon',
  'artichoke',
  'buttermilk',
  'gingerbread',
  'zucchini',
] as const;

const OBJECTS_EASY = [
  'clock',
  'chair',
  'spoon',
  'brush',
  'torch',
  'kettle',
  'mirror',
  'basket',
  'candle',
  'pillow',
  'ladder',
  'button',
  'ticket',
  'pencil',
  'anchor',
] as const;

const OBJECTS_MEDIUM = [
  'umbrella',
  'keyboard',
  'scissors',
  'backpack',
  'lantern',
  'compass',
  'telescope',
  'notebook',
  'suitcase',
  'doorbell',
  'whistle',
  'binoculars',
] as const;

const OBJECTS_HARD = [
  'wheelbarrow',
  'typewriter',
  'xylophone',
  'chandelier',
  'harmonica',
  'microscope',
  'jackhammer',
  'quilting',
  'zeppelin',
  'wristwatch',
] as const;

export const CORE_BANK: HangmanBankWord[] = [
  ...buildBucket(ANIMALS_EASY, 'animals', DIFFICULTY_EASY),
  ...buildBucket(ANIMALS_MEDIUM, 'animals', DIFFICULTY_MEDIUM),
  ...buildBucket(ANIMALS_HARD, 'animals', DIFFICULTY_HARD),
  ...buildBucket(FOOD_EASY, 'food', DIFFICULTY_EASY),
  ...buildBucket(FOOD_MEDIUM, 'food', DIFFICULTY_MEDIUM),
  ...buildBucket(FOOD_HARD, 'food', DIFFICULTY_HARD),
  ...buildBucket(OBJECTS_EASY, 'objects', DIFFICULTY_EASY),
  ...buildBucket(OBJECTS_MEDIUM, 'objects', DIFFICULTY_MEDIUM),
  ...buildBucket(OBJECTS_HARD, 'objects', DIFFICULTY_HARD),
];
