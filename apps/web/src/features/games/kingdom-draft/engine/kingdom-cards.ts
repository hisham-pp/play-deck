import type { ResourceCard } from '../types/kingdom-draft.types';

export { SECRET_OBJECTIVES } from './secret-objectives';

const CAT_DEFENSE = 'defense' as const;
const CAT_CULTURE = 'culture' as const;
const CAT_GOLD = 'gold' as const;
const CAT_FOOD = 'food' as const;
const CAT_PEOPLE = 'people' as const;
const CAT_LAND = 'land' as const;

const SYN_ADJACENT_FOOD_3 = '+3 pts adjacent to Food';
const SYN_ADJACENT_PEOPLE_3 = '+3 pts adjacent to People';
const SYN_ADJACENT_CULTURE_4 = '+4 pts adjacent to Culture';
const SYN_ADJACENT_LAND_3 = '+3 pts adjacent to Land';
const SYN_ADJACENT_LAND_2 = '+2 pts adjacent to Land';
const SYN_ADJACENT_GOLD_3 = '+3 pts adjacent to Gold';
const SYN_ADJACENT_DEFENSE_3 = '+3 pts adjacent to Defense';
const SYN_ADJACENT_DEFENSE_4 = '+4 pts adjacent to Defense';
const SYN_ADJACENT_PEOPLE_4 = '+4 pts adjacent to People';
const SYN_ADJACENT_GOLD_4 = '+4 pts adjacent to Gold';
const SYN_ADJACENT_LAND_4 = '+4 pts adjacent to Land';

function makeCard(
  id: string,
  name: string,
  category: ResourceCard['category'],
  icon: string,
  basePoints: number,
  synergyDescription: string,
  synergyPartnerCategory: ResourceCard['category'],
  synergyBonus: number,
  isRare = false,
): ResourceCard {
  return isRare
    ? {
        id,
        name,
        category,
        icon,
        basePoints,
        synergyDescription,
        synergyPartnerCategory,
        synergyBonus,
        isRare,
      }
    : {
        id,
        name,
        category,
        icon,
        basePoints,
        synergyDescription,
        synergyPartnerCategory,
        synergyBonus,
      };
}

export const KINGDOM_RESOURCE_CARDS: ResourceCard[] = [
  // Land
  makeCard('lush-meadow', 'Lush Meadow', CAT_LAND, '🌾', 2, SYN_ADJACENT_FOOD_3, CAT_FOOD, 3),
  makeCard('river-delta', 'River Delta', CAT_LAND, '🌊', 3, SYN_ADJACENT_FOOD_3, CAT_FOOD, 3),
  makeCard(
    'mountain-ridge',
    'Mountain Ridge',
    CAT_LAND,
    '⛰️',
    2,
    SYN_ADJACENT_DEFENSE_3,
    CAT_DEFENSE,
    3,
  ),
  makeCard(
    'sacred-grove',
    'Sacred Grove',
    CAT_LAND,
    '🌲',
    4,
    SYN_ADJACENT_CULTURE_4,
    CAT_CULTURE,
    4,
    true,
  ),

  // People
  makeCard(
    'peasant-hamlet',
    'Peasant Hamlet',
    CAT_PEOPLE,
    '🛖',
    2,
    SYN_ADJACENT_LAND_2,
    CAT_LAND,
    2,
  ),
  makeCard('artisan-guild', 'Artisan Guild', CAT_PEOPLE, '⚒️', 3, SYN_ADJACENT_GOLD_3, CAT_GOLD, 3),
  makeCard('harbor-town', 'Harbor Town', CAT_PEOPLE, '⛵', 3, SYN_ADJACENT_FOOD_3, CAT_FOOD, 3),
  makeCard(
    'royal-court',
    'Royal Court',
    CAT_PEOPLE,
    '👑',
    5,
    SYN_ADJACENT_CULTURE_4,
    CAT_CULTURE,
    4,
    true,
  ),

  // Food
  makeCard('wheat-farm', 'Wheat Farm', CAT_FOOD, '🚜', 2, SYN_ADJACENT_LAND_3, CAT_LAND, 3),
  makeCard(
    'orchard-vineyard',
    'Orchard Vineyard',
    CAT_FOOD,
    '🍇',
    3,
    SYN_ADJACENT_LAND_3,
    CAT_LAND,
    3,
  ),
  makeCard(
    'fishing-wharf',
    'Fishing Wharf',
    CAT_FOOD,
    '🐟',
    3,
    SYN_ADJACENT_PEOPLE_3,
    CAT_PEOPLE,
    3,
  ),
  makeCard(
    'windmill-bakery',
    'Windmill Bakery',
    CAT_FOOD,
    '🥖',
    4,
    SYN_ADJACENT_FOOD_3,
    CAT_FOOD,
    3,
    true,
  ),

  // Defense
  makeCard(
    'wooden-palisade',
    'Wooden Palisade',
    CAT_DEFENSE,
    '🪵',
    2,
    SYN_ADJACENT_LAND_2,
    CAT_LAND,
    2,
  ),
  makeCard('watchtower', 'Watchtower', CAT_DEFENSE, '🏹', 3, SYN_ADJACENT_PEOPLE_3, CAT_PEOPLE, 3),
  makeCard(
    'stone-fortress',
    'Stone Fortress',
    CAT_DEFENSE,
    '🏰',
    4,
    SYN_ADJACENT_DEFENSE_4,
    CAT_DEFENSE,
    4,
  ),
  makeCard(
    'citadel-keep',
    'Citadel Keep',
    CAT_DEFENSE,
    '🛡️',
    6,
    SYN_ADJACENT_PEOPLE_4,
    CAT_PEOPLE,
    4,
    true,
  ),

  // Gold
  makeCard('silk-bazaar', 'Silk Bazaar', CAT_GOLD, '🎪', 3, SYN_ADJACENT_PEOPLE_3, CAT_PEOPLE, 3),
  makeCard('copper-mint', 'Royal Mint', CAT_GOLD, '🪙', 3, SYN_ADJACENT_GOLD_3, CAT_GOLD, 3),
  makeCard('gold-mine', 'Gold Mine', CAT_GOLD, '⛏️', 4, SYN_ADJACENT_LAND_4, CAT_LAND, 4),
  makeCard(
    'imperial-treasury',
    'Imperial Treasury',
    CAT_GOLD,
    '💎',
    6,
    SYN_ADJACENT_GOLD_4,
    CAT_GOLD,
    4,
    true,
  ),

  // Culture
  makeCard(
    'monastery-garden',
    'Monastery Garden',
    CAT_CULTURE,
    '🕯️',
    3,
    SYN_ADJACENT_LAND_3,
    CAT_LAND,
    3,
  ),
  makeCard(
    'theater-amphitheater',
    'Grand Amphitheater',
    CAT_CULTURE,
    '🎭',
    3,
    SYN_ADJACENT_PEOPLE_3,
    CAT_PEOPLE,
    3,
  ),
  makeCard(
    'grand-library',
    'Grand Library',
    CAT_CULTURE,
    '📜',
    4,
    SYN_ADJACENT_CULTURE_4,
    CAT_CULTURE,
    4,
  ),
  makeCard(
    'royal-cathedral',
    'Spired Cathedral',
    CAT_CULTURE,
    '⛪',
    6,
    SYN_ADJACENT_CULTURE_4,
    CAT_CULTURE,
    4,
    true,
  ),
];
