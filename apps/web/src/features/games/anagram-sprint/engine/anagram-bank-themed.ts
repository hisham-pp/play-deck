import type { AnagramWord } from '../types/anagram-sprint.types';
import { buildEntries, type BankEntry } from './anagram-bank-core';
import { DIFFICULTY_EASY, DIFFICULTY_HARD, DIFFICULTY_MEDIUM } from './anagram-constants';

const ANIMALS_EASY: readonly BankEntry[] = [
  ['rabbit', 'Long ears, quick feet'],
  ['donkey', 'Stubborn and grey'],
  ['turtle', 'Carries its house'],
  ['falcon', 'Fastest thing with wings'],
  ['badger', 'Stripes and a burrow'],
  ['beaver', 'Builds the dam'],
  ['iguana', 'A sunbathing lizard'],
  ['walrus', 'Tusks on the ice'],
  ['weasel', 'Small, long and sly'],
  ['parrot', 'Repeats what it hears'],
];

const ANIMALS_MEDIUM: readonly BankEntry[] = [
  ['penguin', 'Dressed for dinner, cannot fly'],
  ['gorilla', 'The silverback'],
  ['dolphin', 'Clicks and leaps'],
  ['leopard', 'Spotted and silent'],
  ['pelican', 'Beak like a bucket'],
  ['tortoise', 'Beat the hare'],
  ['squirrel', 'Buries and forgets'],
  ['antelope', 'Bounds across the plain'],
  ['flamingo', 'Pink, on one leg'],
  ['hedgehog', 'Rolls into spines'],
];

const FOOD_EASY: readonly BankEntry[] = [
  ['butter', 'Melts on toast'],
  ['cheese', 'Say it for the camera'],
  ['banana', 'Peel before eating'],
  ['garlic', 'Cloves and a strong opinion'],
  ['walnut', 'Cracked at the table'],
  ['tomato', 'Botanically a fruit'],
  ['pepper', 'Beside the salt'],
  ['muffin', 'Breakfast in a cup shape'],
  ['noodle', 'Slurped from a bowl'],
  ['carrot', 'Orange and crunchy'],
];

const FOOD_MEDIUM: readonly BankEntry[] = [
  ['avocado', 'Green with a big stone'],
  ['pancake', 'Flipped in a pan'],
  ['custard', 'Poured over the pudding'],
  ['pretzel', 'Twisted and salted'],
  ['paprika', 'Red and smoky'],
  ['lasagne', 'Layers and layers'],
  ['saffron', 'The costliest spice'],
  ['espresso', 'A very short coffee'],
  ['cinnamon', 'Bark in the baking'],
  ['macaroni', 'Elbow-shaped pasta'],
];

const SCIENCE_MEDIUM: readonly BankEntry[] = [
  ['neutron', 'No charge at all'],
  ['gravity', 'Keeps you down'],
  ['oxygen', 'Every eighth element'],
  ['fossil', 'Stone that was alive'],
  ['magnet', 'Two poles, one field'],
  ['orbit', 'The path around'],
  ['enzyme', 'Speeds the reaction'],
  ['crater', 'Left by an impact'],
];

const SCIENCE_HARD: readonly BankEntry[] = [
  ['molecule', 'Atoms joined up'],
  ['spectrum', 'The whole range of light'],
  ['catalyst', 'Changes nothing but the rate'],
  ['nebula', 'A cloud between the stars'],
  ['isotope', 'Same element, heavier'],
  ['velocity', 'Speed with a direction'],
  ['membrane', 'The cell wall lining'],
  ['equation', 'Two sides, one balance'],
];

const TRAVEL_EASY: readonly BankEntry[] = [
  ['island', 'Water all the way round'],
  ['desert', 'Sand and very little rain'],
  ['canyon', 'Carved by the river'],
  ['harbor', 'Where the boats tie up'],
  ['jungle', 'Thick, green and loud'],
  ['tunnel', 'Straight through the hill'],
  ['summit', 'The very top'],
  ['runway', 'Where the wheels leave'],
];

const TRAVEL_MEDIUM: readonly BankEntry[] = [
  ['passport', 'Stamped at the border'],
  ['suitcase', 'Wheeled through the terminal'],
  ['glacier', 'A river of ice'],
  ['vineyard', 'Rows of grapes'],
  ['lagoon', 'Shallow water behind the reef'],
  ['monsoon', 'The season of rain'],
  ['carriage', 'Pulled along the rails'],
  ['festival', 'Days of it, once a year'],
];

const SPORTS_EASY: readonly BankEntry[] = [
  ['soccer', 'Eleven a side'],
  ['tennis', 'Love means nothing here'],
  ['boxing', 'Twelve rounds'],
  ['hockey', 'Sticks and a puck'],
  ['rowing', 'Backwards to the finish'],
  ['sprint', 'Over almost at once'],
  ['relay', 'Pass the baton'],
  ['squash', 'Four walls and a small ball'],
];

const SPORTS_MEDIUM: readonly BankEntry[] = [
  ['cricket', 'Stumps and an over'],
  ['marathon', 'Just over 26 miles'],
  ['javelin', 'Thrown, not fired'],
  ['referee', 'Blows the whistle'],
  ['stadium', 'Holds the crowd'],
  ['triathlon', 'Swim, ride, run'],
  ['goalkeeper', 'The only one with hands'],
  ['badminton', 'A shuttlecock sport'],
];

export const THEMED_BANK: AnagramWord[] = [
  ...buildEntries(ANIMALS_EASY, 'animals', DIFFICULTY_EASY),
  ...buildEntries(ANIMALS_MEDIUM, 'animals', DIFFICULTY_MEDIUM),
  ...buildEntries(FOOD_EASY, 'food', DIFFICULTY_EASY),
  ...buildEntries(FOOD_MEDIUM, 'food', DIFFICULTY_MEDIUM),
  ...buildEntries(SCIENCE_MEDIUM, 'science', DIFFICULTY_MEDIUM),
  ...buildEntries(SCIENCE_HARD, 'science', DIFFICULTY_HARD),
  ...buildEntries(TRAVEL_EASY, 'travel', DIFFICULTY_EASY),
  ...buildEntries(TRAVEL_MEDIUM, 'travel', DIFFICULTY_MEDIUM),
  ...buildEntries(SPORTS_EASY, 'sports', DIFFICULTY_EASY),
  ...buildEntries(SPORTS_MEDIUM, 'sports', DIFFICULTY_MEDIUM),
];
