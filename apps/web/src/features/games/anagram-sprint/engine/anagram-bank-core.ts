import type { AnagramWord } from '../types/anagram-sprint.types';
import { DIFFICULTY_EASY, DIFFICULTY_HARD, DIFFICULTY_MEDIUM } from './anagram-constants';

/** `[answer, hint]`. Category and difficulty come from the bucket. */
export type BankEntry = readonly [string, string];

export function buildEntries(
  entries: readonly BankEntry[],
  category: AnagramWord['category'],
  difficulty: AnagramWord['difficulty'],
): AnagramWord[] {
  return entries.map(([word, hint]) => ({ word, hint, category, difficulty }));
}

const COMMON_EASY: readonly BankEntry[] = [
  ['garden', 'Where the tomatoes grow'],
  ['pencil', 'Writes, then erases'],
  ['window', 'Glass in a wall'],
  ['button', 'Holds a shirt together'],
  ['silver', 'Second place metal'],
  ['candle', 'Wax and a wick'],
  ['basket', 'Woven and carried'],
  ['friend', 'Someone on your side'],
  ['winter', 'The cold season'],
  ['market', 'Where the stalls are'],
  ['bridge', 'Crosses the river'],
  ['pocket', 'Holds your keys'],
  ['mirror', 'Shows you back'],
  ['ticket', 'Gets you in'],
];

const COMMON_MEDIUM: readonly BankEntry[] = [
  ['journey', 'A long way travelled'],
  ['lantern', 'A carried light'],
  ['whisper', 'Barely a voice'],
  ['harvest', 'Bringing the crop in'],
  ['blanket', 'Warmth on a bed'],
  ['compass', 'Always points north'],
  ['crystal', 'Clear and faceted'],
  ['thunder', 'Follows the flash'],
  ['village', 'Smaller than a town'],
  ['kitchen', 'Where the cooking happens'],
  ['freedom', 'No cage, no chain'],
  ['mystery', 'Nobody knows yet'],
  ['captain', 'Runs the ship'],
  ['diamond', 'Hardest of the gems'],
];

const COMMON_HARD: readonly BankEntry[] = [
  ['treasure', 'Buried and marked with an X'],
  ['midnight', 'The turn of the day'],
  ['champion', 'Nobody beat them'],
  ['confused', 'Not following at all'],
  ['sunlight', 'Straight from the star'],
  ['reminder', 'A nudge not to forget'],
  ['struggle', 'Hard going'],
  ['wildfire', 'Spreads through the forest'],
  ['keyboard', 'Where your fingers are now'],
  ['daughter', 'Not the son'],
  ['platform', 'You wait on it for a train'],
  ['sandwich', 'Filling between two slices'],
];

const ADVANCED_MEDIUM: readonly BankEntry[] = [
  ['quarrel', 'A heated disagreement'],
  ['lattice', 'A criss-crossed frame'],
  ['obscure', 'Hardly known'],
  ['plumage', 'Feathers, collectively'],
  ['sublime', 'Beautiful past words'],
  ['tangent', 'Off the point entirely'],
  ['vagrant', 'Wandering with no home'],
  ['zealous', 'Burning with enthusiasm'],
  ['cadence', 'The rhythm of speech'],
  ['enigma', 'A riddle of a thing'],
  ['fathom', 'To finally understand'],
  ['gambit', 'An opening sacrifice'],
];

const ADVANCED_HARD: readonly BankEntry[] = [
  ['ephemera', 'Things that barely last'],
  ['labyrinth', 'A maze with one path'],
  ['maelstrom', 'A violent whirlpool'],
  ['paradigm', 'The accepted model'],
  ['quixotic', 'Nobly unrealistic'],
  ['serendipity', 'A lucky accident'],
  ['ubiquitous', 'Everywhere at once'],
  ['vernacular', 'The everyday tongue'],
  ['juxtapose', 'Set side by side'],
  ['incandescent', 'Glowing white hot'],
  ['perpetual', 'Never stopping'],
  ['resilience', 'Bouncing back'],
];

export const CORE_BANK: AnagramWord[] = [
  ...buildEntries(COMMON_EASY, 'common', DIFFICULTY_EASY),
  ...buildEntries(COMMON_MEDIUM, 'common', DIFFICULTY_MEDIUM),
  ...buildEntries(COMMON_HARD, 'common', DIFFICULTY_HARD),
  ...buildEntries(ADVANCED_MEDIUM, 'advanced', DIFFICULTY_MEDIUM),
  ...buildEntries(ADVANCED_HARD, 'advanced', DIFFICULTY_HARD),
];
