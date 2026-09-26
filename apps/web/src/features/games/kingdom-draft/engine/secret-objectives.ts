import type { SecretObjective } from '../types/kingdom-draft.types';

const CAT_DEFENSE = 'defense' as const;
const CAT_CULTURE = 'culture' as const;
const CAT_GOLD = 'gold' as const;
const CAT_FOOD = 'food' as const;
const CAT_PEOPLE = 'people' as const;
const CAT_DIVERSE = 'diverse' as const;

export const SECRET_OBJECTIVES: SecretObjective[] = [
  {
    id: 'imperator',
    title: "Imperator's Bulwark",
    description: 'Construct a mighty bastion: Have at least 3 Defense tiles in your realm.',
    targetCategory: CAT_DEFENSE,
    bonusPoints: 18,
  },
  {
    id: 'renaissance',
    title: 'Cultural Renaissance',
    description: 'Enlighten the populace: Have at least 3 Culture tiles in your realm.',
    targetCategory: CAT_CULTURE,
    bonusPoints: 18,
  },
  {
    id: 'merchant-prince',
    title: 'Merchant Prince',
    description: 'Amass vast commercial wealth: Have at least 3 Gold tiles in your realm.',
    targetCategory: CAT_GOLD,
    bonusPoints: 18,
  },
  {
    id: 'breadbasket',
    title: 'Breadbasket of the Realm',
    description: 'Feed the empire: Have at least 3 Food tiles in your realm.',
    targetCategory: CAT_FOOD,
    bonusPoints: 18,
  },
  {
    id: 'metropolis',
    title: 'Crowded Metropolis',
    description: 'Attract thriving citizenry: Have at least 3 People tiles in your realm.',
    targetCategory: CAT_PEOPLE,
    bonusPoints: 18,
  },
  {
    id: 'imperial-dominion',
    title: 'Imperial Harmony',
    description: 'Balance all realms: Have at least 1 tile from each of the 6 categories.',
    targetCategory: CAT_DIVERSE,
    bonusPoints: 20,
  },
];
