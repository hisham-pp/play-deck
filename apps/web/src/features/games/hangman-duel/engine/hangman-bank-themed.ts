import type { HangmanBankWord } from '../types/hangman-duel.types';
import { buildBucket } from './hangman-bank-core';
import { DIFFICULTY_EASY, DIFFICULTY_HARD, DIFFICULTY_MEDIUM } from './hangman-constants';

const MOVIES_EASY = [
  'jaws',
  'alien',
  'rocky',
  'frozen',
  'shrek',
  'brave',
  'coco',
  'dune',
  'psycho',
  'grease',
  'cars',
  'moana',
  'up',
  'arrival',
].filter((title) => title.length >= 3);

const MOVIES_MEDIUM = [
  'titanic',
  'gravity',
  'jumanji',
  'godzilla',
  'avatar',
  'parasite',
  'whiplash',
  'gladiator',
  'inception',
  'spotlight',
  'birdman',
  'skyfall',
] as const;

const MOVIES_HARD = [
  'casablanca',
  'zombieland',
  'interstellar',
  'metropolis',
  'goodfellas',
  'oppenheimer',
  'braveheart',
  'ghostbusters',
  'trainspotting',
  'nosferatu',
] as const;

const PLACES_EASY = [
  'beach',
  'paris',
  'egypt',
  'tokyo',
  'cairo',
  'river',
  'india',
  'spain',
  'desert',
  'island',
  'forest',
  'canyon',
  'peru',
  'nepal',
  'chile',
] as const;

const PLACES_MEDIUM = [
  'iceland',
  'morocco',
  'finland',
  'lagoon',
  'harbour',
  'volcano',
  'glacier',
  'plateau',
  'meadow',
  'estuary',
  'vietnam',
  'croatia',
] as const;

const PLACES_HARD = [
  'kilimanjaro',
  'amsterdam',
  'luxembourg',
  'switzerland',
  'yellowstone',
  'kathmandu',
  'reykjavik',
  'madagascar',
  'zanzibar',
  'uzbekistan',
] as const;

const PROFESSIONS_EASY = [
  'baker',
  'pilot',
  'nurse',
  'actor',
  'judge',
  'chef',
  'farmer',
  'doctor',
  'artist',
  'sailor',
  'writer',
  'dancer',
  'tailor',
  'barber',
] as const;

const PROFESSIONS_MEDIUM = [
  'plumber',
  'teacher',
  'surgeon',
  'painter',
  'builder',
  'dentist',
  'engineer',
  'lifeguard',
  'mechanic',
  'diplomat',
  'jeweller',
  'conductor',
] as const;

const PROFESSIONS_HARD = [
  'archaeologist',
  'veterinarian',
  'choreographer',
  'photographer',
  'glassblower',
  'psychologist',
  'cartographer',
  'locksmith',
  'zookeeper',
] as const;

export const THEMED_BANK: HangmanBankWord[] = [
  ...buildBucket(MOVIES_EASY, 'movies', DIFFICULTY_EASY),
  ...buildBucket(MOVIES_MEDIUM, 'movies', DIFFICULTY_MEDIUM),
  ...buildBucket(MOVIES_HARD, 'movies', DIFFICULTY_HARD),
  ...buildBucket(PLACES_EASY, 'places', DIFFICULTY_EASY),
  ...buildBucket(PLACES_MEDIUM, 'places', DIFFICULTY_MEDIUM),
  ...buildBucket(PLACES_HARD, 'places', DIFFICULTY_HARD),
  ...buildBucket(PROFESSIONS_EASY, 'professions', DIFFICULTY_EASY),
  ...buildBucket(PROFESSIONS_MEDIUM, 'professions', DIFFICULTY_MEDIUM),
  ...buildBucket(PROFESSIONS_HARD, 'professions', DIFFICULTY_HARD),
];
