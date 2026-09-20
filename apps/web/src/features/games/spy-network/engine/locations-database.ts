export const LOCATIONS: string[] = [
  'Beach',
  'Space Station',
  'Hospital',
  'Casino',
  'Submarine',
  'Medieval Castle',
  'School',
  'Circus',
  'Police Station',
  'Pirate Ship',
  'Restaurant',
  'Airport',
  'Supermarket',
  'Movie Studio',
  'Antarctic Research Base',
  'Amusement Park',
  'Bank',
  'Museum',
  'Library',
  'Football Stadium',
];

export function getRandomLocation(): string {
  return LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]!;
}
