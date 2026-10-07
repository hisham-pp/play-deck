export interface MapDefinition {
  id: string;
  name: string;
  description: string;
  biomeIndex: number; // Locks the terrain to a specific biome
  difficultyMultiplier: number;
  unlockCost: number;
  environment: string;
}

export const MAPS: readonly MapDefinition[] = [
  {
    id: 'meadows',
    name: 'Clover Meadows',
    description: 'A gentle introductory drive. Rolling green hills and easy jumps.',
    biomeIndex: 0,
    difficultyMultiplier: 0.8,
    unlockCost: 0,
    environment: 'Meadows',
  },
  {
    id: 'canyon',
    name: 'Sunset Canyon',
    description: 'Steeper inclines and rockier terrain. Watch your fuel consumption.',
    biomeIndex: 1,
    difficultyMultiplier: 1.2,
    unlockCost: 200,
    environment: 'Canyon',
  },
  {
    id: 'ridge',
    name: 'Frostbite Ridge',
    description: 'Treacherous ice and harsh drops. Needs precise throttle control.',
    biomeIndex: 2,
    difficultyMultiplier: 1.6,
    unlockCost: 800,
    environment: 'Snow',
  },
  {
    id: 'dunes',
    name: 'Moonlit Dunes',
    description: 'Extreme bumps and gaps under the moonlight. Only for the brave.',
    biomeIndex: 3,
    difficultyMultiplier: 2.2,
    unlockCost: 2000,
    environment: 'Desert',
  },
];
