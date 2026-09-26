/**
 * Fishing Competition Engine
 * Pure TypeScript implementation of casting, bite detection, hook reactions,
 * reel-in line tension mechanics, fish rarity tiers, multi-location environments,
 * dynamic match events, and bot simulation.
 */

export type FishRarity = 'common' | 'uncommon' | 'rare' | 'legendary';

export type FishingLocationId = 'lake' | 'river' | 'ocean' | 'swamp' | 'night';

export interface FishSpecies {
  id: string;
  name: string;
  rarity: FishRarity;
  baseWeightKg: number;
  weightVariance: number;
  basePoints: number;
  icon: string;
  fightSpeed: number; // How rapidly the fish thrashes tension
  biteDelaySeconds: [number, number]; // [min, max]
  locations: FishingLocationId[];
}

export interface CaughtFish {
  speciesId: string;
  name: string;
  rarity: FishRarity;
  weightKg: number;
  points: number;
  icon: string;
  timestamp: number;
}

export interface FishingLocation {
  id: FishingLocationId;
  name: string;
  description: string;
  ambientColor: string;
  waterColor: string;
  fishPool: string[]; // fish species IDs
}

export type FishingEventId = 'none' | 'golden_hour' | 'fish_swarm' | 'double_score' | 'lucky_lure';

export interface FishingEvent {
  id: FishingEventId;
  name: string;
  description: string;
  durationSeconds: number;
}

export type PlayerFishingStatus =
  | 'idle'
  | 'charging_cast'
  | 'waiting_for_bite'
  | 'bite_active'
  | 'reeling'
  | 'celebrating_catch'
  | 'escaped';

export interface FisherPlayer {
  id: string;
  name: string;
  isBot: boolean;
  score: number;
  catches: CaughtFish[];
  status: PlayerFishingStatus;
  castPower: number; // 0-100%
  biteTimer: number; // Countdown until bite triggers
  reactionTimer: number; // Time remaining to strike/hook
  targetFish: FishSpecies | null;
  // Reeling mechanics
  reelDistance: number; // 100% down to 0% to catch
  lineTension: number; // 0-100% (Sweet spot: 35-75%)
  tensionDangerTimer: number; // Accumulator for over/under tension
  isReeling: boolean;
  resetTimer?: number;
}

export interface FishingMatchState {
  players: FisherPlayer[];
  location: FishingLocation;
  timeRemainingSeconds: number;
  matchDurationSeconds: number;
  activeEvent: FishingEvent;
  eventCountdown: number;
  isGameOver: boolean;
  activityLog: string[];
}

export const FISH_SPECIES_CATALOG: FishSpecies[] = [
  // Lake
  {
    id: 'bluegill',
    name: 'Bluegill Sunfish',
    rarity: 'common',
    baseWeightKg: 0.6,
    weightVariance: 0.3,
    basePoints: 120,
    icon: '🐟',
    fightSpeed: 1.0,
    biteDelaySeconds: [2, 4],
    locations: ['lake'],
  },
  {
    id: 'largemouth_bass',
    name: 'Largemouth Bass',
    rarity: 'uncommon',
    baseWeightKg: 2.8,
    weightVariance: 1.2,
    basePoints: 350,
    icon: '🐠',
    fightSpeed: 1.5,
    biteDelaySeconds: [3, 6],
    locations: ['lake'],
  },
  {
    id: 'northern_pike',
    name: 'Northern Pike',
    rarity: 'rare',
    baseWeightKg: 6.5,
    weightVariance: 2.5,
    basePoints: 850,
    icon: '🐊',
    fightSpeed: 2.2,
    biteDelaySeconds: [4, 8],
    locations: ['lake'],
  },
  {
    id: 'ancient_carp',
    name: 'Ancient Golden Carp',
    rarity: 'legendary',
    baseWeightKg: 18.0,
    weightVariance: 4.5,
    basePoints: 2200,
    icon: '✨',
    fightSpeed: 3.2,
    biteDelaySeconds: [5, 10],
    locations: ['lake'],
  },

  // River
  {
    id: 'rainbow_trout',
    name: 'Rainbow Trout',
    rarity: 'common',
    baseWeightKg: 1.4,
    weightVariance: 0.6,
    basePoints: 180,
    icon: '🐟',
    fightSpeed: 1.2,
    biteDelaySeconds: [2, 5],
    locations: ['river'],
  },
  {
    id: 'chinook_salmon',
    name: 'Chinook Salmon',
    rarity: 'uncommon',
    baseWeightKg: 4.5,
    weightVariance: 1.8,
    basePoints: 480,
    icon: '🍣',
    fightSpeed: 1.8,
    biteDelaySeconds: [3, 6],
    locations: ['river'],
  },
  {
    id: 'river_sturgeon',
    name: 'White Sturgeon',
    rarity: 'rare',
    baseWeightKg: 14.0,
    weightVariance: 5.0,
    basePoints: 1100,
    icon: '🐋',
    fightSpeed: 2.4,
    biteDelaySeconds: [4, 8],
    locations: ['river'],
  },
  {
    id: 'golden_dorado',
    name: 'River King Dorado',
    rarity: 'legendary',
    baseWeightKg: 16.5,
    weightVariance: 3.5,
    basePoints: 2400,
    icon: '👑',
    fightSpeed: 3.4,
    biteDelaySeconds: [5, 10],
    locations: ['river'],
  },

  // Ocean
  {
    id: 'red_snapper',
    name: 'Red Snapper',
    rarity: 'common',
    baseWeightKg: 2.5,
    weightVariance: 1.0,
    basePoints: 220,
    icon: '🐡',
    fightSpeed: 1.3,
    biteDelaySeconds: [2, 5],
    locations: ['ocean'],
  },
  {
    id: 'yellowfin_tuna',
    name: 'Yellowfin Tuna',
    rarity: 'uncommon',
    baseWeightKg: 9.0,
    weightVariance: 3.5,
    basePoints: 600,
    icon: '🐬',
    fightSpeed: 2.0,
    biteDelaySeconds: [3, 7],
    locations: ['ocean'],
  },
  {
    id: 'blue_marlin',
    name: 'Pacific Blue Marlin',
    rarity: 'rare',
    baseWeightKg: 35.0,
    weightVariance: 10.0,
    basePoints: 1400,
    icon: '🗡️',
    fightSpeed: 2.8,
    biteDelaySeconds: [4, 9],
    locations: ['ocean'],
  },
  {
    id: 'megalodon_pup',
    name: 'Colossal Apex Shark',
    rarity: 'legendary',
    baseWeightKg: 85.0,
    weightVariance: 20.0,
    basePoints: 3000,
    icon: '🦈',
    fightSpeed: 3.8,
    biteDelaySeconds: [6, 12],
    locations: ['ocean'],
  },

  // Swamp
  {
    id: 'mud_catfish',
    name: 'Channel Catfish',
    rarity: 'common',
    baseWeightKg: 3.2,
    weightVariance: 1.2,
    basePoints: 200,
    icon: '🐟',
    fightSpeed: 1.1,
    biteDelaySeconds: [2, 4],
    locations: ['swamp'],
  },
  {
    id: 'alligator_gar',
    name: 'Alligator Gar',
    rarity: 'uncommon',
    baseWeightKg: 8.5,
    weightVariance: 3.0,
    basePoints: 550,
    icon: '🐊',
    fightSpeed: 1.9,
    biteDelaySeconds: [3, 7],
    locations: ['swamp'],
  },
  {
    id: 'swamp_leviathan',
    name: 'Emerald Leviathan',
    rarity: 'legendary',
    baseWeightKg: 28.0,
    weightVariance: 7.0,
    basePoints: 2600,
    icon: '🐉',
    fightSpeed: 3.5,
    biteDelaySeconds: [5, 11],
    locations: ['swamp'],
  },

  // Night Fishing
  {
    id: 'glow_lanternfish',
    name: 'Deep Lanternfish',
    rarity: 'common',
    baseWeightKg: 1.1,
    weightVariance: 0.4,
    basePoints: 250,
    icon: '🏮',
    fightSpeed: 1.4,
    biteDelaySeconds: [2, 4],
    locations: ['night'],
  },
  {
    id: 'moonlight_eel',
    name: 'Electric Moonlight Eel',
    rarity: 'rare',
    baseWeightKg: 7.8,
    weightVariance: 2.2,
    basePoints: 1250,
    icon: '⚡',
    fightSpeed: 2.6,
    biteDelaySeconds: [3, 8],
    locations: ['night'],
  },
  {
    id: 'spectral_stingray',
    name: 'Spectral Cosmic Ray',
    rarity: 'legendary',
    baseWeightKg: 42.0,
    weightVariance: 8.0,
    basePoints: 2800,
    icon: '🌌',
    fightSpeed: 3.6,
    biteDelaySeconds: [5, 10],
    locations: ['night'],
  },
];

export const FISHING_LOCATIONS: Record<FishingLocationId, FishingLocation> = {
  lake: {
    id: 'lake',
    name: 'Whispering Lake',
    description: 'Calm reflective waters rich in sunfish, bass, and ancient golden carp.',
    ambientColor: '#0ea5e9',
    waterColor: '#0369a1',
    fishPool: ['bluegill', 'largemouth_bass', 'northern_pike', 'ancient_carp'],
  },
  river: {
    id: 'river',
    name: 'Rapid Falls River',
    description: 'Swift white-water currents carrying fast salmon and muscular sturgeon.',
    ambientColor: '#06b6d4',
    waterColor: '#0891b2',
    fishPool: ['rainbow_trout', 'chinook_salmon', 'river_sturgeon', 'golden_dorado'],
  },
  ocean: {
    id: 'ocean',
    name: 'Deep Blue Horizon',
    description: 'Open sea pelagic waters with trophy marlin, tuna, and ferocious sharks.',
    ambientColor: '#3b82f6',
    waterColor: '#1d4ed8',
    fishPool: ['red_snapper', 'yellowfin_tuna', 'blue_marlin', 'megalodon_pup'],
  },
  swamp: {
    id: 'swamp',
    name: 'Murky Mangrove Swamp',
    description: 'Misty marshland harboring armored gar and legendary swamp leviathans.',
    ambientColor: '#10b981',
    waterColor: '#065f46',
    fishPool: ['mud_catfish', 'alligator_gar', 'swamp_leviathan'],
  },
  night: {
    id: 'night',
    name: 'Starlight Lagoon',
    description: 'Luminous midnight waters sparkling with bioluminescent rays and eels.',
    ambientColor: '#8b5cf6',
    waterColor: '#4c1d95',
    fishPool: ['glow_lanternfish', 'moonlight_eel', 'spectral_stingray'],
  },
};

export const MATCH_EVENTS: FishingEvent[] = [
  {
    id: 'none',
    name: 'Normal Weather',
    description: 'Standard fishing conditions.',
    durationSeconds: 0,
  },
  {
    id: 'golden_hour',
    name: 'Golden Hour Sunset',
    description: 'Rare and legendary fish are 3x more likely to strike!',
    durationSeconds: 20,
  },
  {
    id: 'fish_swarm',
    name: 'Baitfish Swarm',
    description: 'Fish bite speed is doubled!',
    durationSeconds: 20,
  },
  {
    id: 'double_score',
    name: 'Double Points Frenzy',
    description: 'All catches award 2x score value!',
    durationSeconds: 20,
  },
  {
    id: 'lucky_lure',
    name: 'Lucky Lure Tide',
    description: 'Reel tension sweet-spot is expanded by 40%!',
    durationSeconds: 20,
  },
];

/**
 * Initializes a new Fishing Competition match state.
 */
export function createInitialFishingState(options?: {
  locationId?: FishingLocationId;
  playerCount?: number;
  matchDuration?: number;
}): FishingMatchState {
  const locId = options?.locationId ?? 'lake';
  const location = FISHING_LOCATIONS[locId] ?? FISHING_LOCATIONS.lake;
  const count = options?.playerCount ?? 4;
  const matchDuration = options?.matchDuration ?? 90;

  const playerNames = ['You (Captain)', 'AnglerBot 3000', 'ReelMaster', 'BaitBoss'];

  const players: FisherPlayer[] = [];
  for (let i = 0; i < count; i++) {
    players.push({
      id: `p-${i + 1}`,
      name: playerNames[i] ?? `Fisher ${i + 1}`,
      isBot: i !== 0,
      score: 0,
      catches: [],
      status: 'idle',
      castPower: 0,
      biteTimer: 0,
      reactionTimer: 0,
      targetFish: null,
      reelDistance: 100,
      lineTension: 50,
      tensionDangerTimer: 0,
      isReeling: false,
    });
  }

  return {
    players,
    location,
    timeRemainingSeconds: matchDuration,
    matchDurationSeconds: matchDuration,
    activeEvent: MATCH_EVENTS[0],
    eventCountdown: 25,
    isGameOver: false,
    activityLog: [`Match started at ${location.name}! Cast your lines!`],
  };
}

/**
 * Picks a random fish from the active location pool taking active events into account.
 */
export function chooseFishForCast(
  location: FishingLocation,
  event: FishingEvent,
  castPower: number,
): FishSpecies {
  const eligible = FISH_SPECIES_CATALOG.filter((f) => f.locations.includes(location.id));

  // Determine rarity rolls (cast power boosts rare/legendary chance)
  const roll = Math.random();
  const powerBonus = (castPower / 100) * 0.15;
  const isGoldenHour = event.id === 'golden_hour';

  let targetRarity: FishRarity = 'common';
  if (isGoldenHour) {
    if (roll < 0.25) targetRarity = 'legendary';
    else if (roll < 0.6) targetRarity = 'rare';
    else if (roll < 0.85) targetRarity = 'uncommon';
    else targetRarity = 'common';
  } else {
    const legendaryThresh = 0.05 + powerBonus * 0.5;
    const rareThresh = 0.2 + powerBonus;
    const uncommonThresh = 0.5 + powerBonus * 0.5;

    if (roll < legendaryThresh) targetRarity = 'legendary';
    else if (roll < rareThresh) targetRarity = 'rare';
    else if (roll < uncommonThresh) targetRarity = 'uncommon';
    else targetRarity = 'common';
  }

  const matchingRarity = eligible.filter((f) => f.rarity === targetRarity);
  if (matchingRarity.length > 0) {
    return matchingRarity[Math.floor(Math.random() * matchingRarity.length)];
  }

  return eligible[Math.floor(Math.random() * eligible.length)] ?? FISH_SPECIES_CATALOG[0];
}

/**
 * Executes a line cast for a player.
 */
export function castLine(
  state: FishingMatchState,
  playerId: string,
  power: number,
): { success: boolean; message: string } {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return { success: false, message: 'Invalid player' };
  if (player.status !== 'idle') {
    return { success: false, message: 'Cannot cast while line is active' };
  }

  const clampedPower = Math.max(10, Math.min(100, Math.round(power)));
  player.castPower = clampedPower;
  player.status = 'waiting_for_bite';

  const fish = chooseFishForCast(state.location, state.activeEvent, clampedPower);
  player.targetFish = fish;

  // Bite delay is inversely proportional to cast power and halved during fish swarm
  const [minDelay, maxDelay] = fish.biteDelaySeconds;
  const baseDelay = minDelay + Math.random() * (maxDelay - minDelay);
  const powerReduction = (clampedPower / 100) * 0.8;
  const swarmMultiplier = state.activeEvent.id === 'fish_swarm' ? 0.5 : 1.0;

  player.biteTimer = Math.max(1.0, (baseDelay - powerReduction) * swarmMultiplier);
  player.reactionTimer = 1.6; // 1.6s to hook when bite triggers
  player.lineTension = 50;
  player.reelDistance = 100;
  player.tensionDangerTimer = 0;
  player.isReeling = false;

  return { success: true, message: `${player.name} cast their line with ${clampedPower}% power!` };
}

/**
 * Player strikes to set the hook when a bite indicator triggers.
 */
export function hookFish(player: FisherPlayer): { success: boolean; message: string } {
  if (player.status !== 'bite_active' || !player.targetFish) {
    return { success: false, message: 'No fish currently biting!' };
  }

  player.status = 'reeling';
  player.lineTension = 50;
  player.reelDistance = 100;
  player.tensionDangerTimer = 0;

  return {
    success: true,
    message: `Hooked! ${player.targetFish.name} is on the line! Reel it in!`,
  };
}

/**
 * Toggles or sets reeling state for active player.
 */
export function setReeling(player: FisherPlayer, reeling: boolean): void {
  if (player.status === 'reeling') {
    player.isReeling = reeling;
  }
}

/**
 * Ticks fishing physics: timers, line tension, reeling progress, escapes, and bot AI.
 */
export function stepFishingMatch(state: FishingMatchState, dt: number): void {
  if (state.isGameOver) return;

  // 1. Match clock countdown
  state.timeRemainingSeconds = Math.max(0, state.timeRemainingSeconds - dt);
  if (state.timeRemainingSeconds <= 0) {
    state.isGameOver = true;
    state.activityLog.unshift('Time is up! The Fishing Competition has concluded!');
    return;
  }

  // 2. Dynamic Weather / Special Events countdown
  state.eventCountdown -= dt;
  if (state.eventCountdown <= 0) {
    if (state.activeEvent.id === 'none') {
      // Pick a random exciting event
      const pool = MATCH_EVENTS.filter((e) => e.id !== 'none');
      const nextEvent = pool[Math.floor(Math.random() * pool.length)];
      state.activeEvent = nextEvent;
      state.eventCountdown = nextEvent.durationSeconds;
      state.activityLog.unshift(`EVENT TRIGGERED: ${nextEvent.name}! ${nextEvent.description}`);
    } else {
      // Return to normal weather
      state.activeEvent = MATCH_EVENTS[0];
      state.eventCountdown = 20 + Math.random() * 15;
      state.activityLog.unshift('Weather returned to normal.');
    }
  }

  // 3. Player updates
  const isLuckyLure = state.activeEvent.id === 'lucky_lure';
  const minSafeTension = isLuckyLure ? 25 : 35;
  const maxSafeTension = isLuckyLure ? 85 : 75;

  for (const player of state.players) {
    // A. Waiting for bite
    if (player.status === 'waiting_for_bite') {
      player.biteTimer -= dt;
      if (player.biteTimer <= 0) {
        player.status = 'bite_active';
        player.reactionTimer = 1.4; // 1.4s reaction window
      }
    }

    // B. Bite active: countdown hook reaction window
    else if (player.status === 'bite_active') {
      player.reactionTimer -= dt;

      // Bot hook reflex
      if (player.isBot && Math.random() < 0.45) {
        hookFish(player);
      } else if (player.reactionTimer <= 0) {
        // Missed hook window: Fish escaped!
        player.status = 'escaped';
        player.targetFish = null;
        player.resetTimer = 1.5;
      }
    }

    // C. Active Reeling & Tension Simulation
    else if (player.status === 'reeling' && player.targetFish) {
      const fish = player.targetFish;

      // Reel pull increases tension and reduces distance
      if (player.isReeling) {
        player.lineTension = Math.min(100, player.lineTension + 42 * dt);
        player.reelDistance = Math.max(0, player.reelDistance - 28 * dt);
      } else {
        // Line relaxes when not reeling
        player.lineTension = Math.max(0, player.lineTension - 30 * dt);
      }

      // Fish fighting: random surges based on fish speed
      const fightJerk = (Math.random() - 0.45) * fish.fightSpeed * 35 * dt;
      player.lineTension = Math.max(0, Math.min(100, player.lineTension + fightJerk));

      // Bot reeling AI
      if (player.isBot) {
        if (player.lineTension < 45) {
          player.isReeling = true;
        } else if (player.lineTension > 70) {
          player.isReeling = false;
        }
      }

      // Danger Check: Over-tension (> 90%) or Under-tension (< 15%)
      const isDangerous =
        player.lineTension < minSafeTension || player.lineTension > maxSafeTension;

      if (isDangerous) {
        player.tensionDangerTimer += dt;
        if (player.tensionDangerTimer > 1.25) {
          // Line snapped or hook slipped!
          player.status = 'escaped';
          state.activityLog.unshift(
            player.lineTension > 85
              ? `${player.name}'s line snapped under extreme tension! ${fish.name} escaped!`
              : `${player.name}'s line went slack! ${fish.name} spit the hook!`,
          );
          player.targetFish = null;
          player.resetTimer = 2.0;
          continue;
        }
      } else {
        // Relieve danger counter when safely in sweet spot
        player.tensionDangerTimer = Math.max(0, player.tensionDangerTimer - dt * 1.5);
      }

      // Successful Catch!
      if (player.reelDistance <= 0) {
        completeCatch(state, player, fish);
      }
    }

    // D. Celebrating Catch or Escaped cooldown
    else if (player.status === 'celebrating_catch' || player.status === 'escaped') {
      player.resetTimer = (player.resetTimer ?? 2.0) - dt;
      if (player.resetTimer <= 0) {
        player.status = 'idle';
        player.targetFish = null;
        player.isReeling = false;
        player.reelDistance = 100;
        player.lineTension = 50;
        player.tensionDangerTimer = 0;
      }
    }

    // E. Bot Auto-Cast when idle
    else if (player.isBot && player.status === 'idle') {
      if (Math.random() < 0.3) {
        const botPower = 50 + Math.random() * 45;
        castLine(state, player.id, botPower);
      }
    }
  }
}

/**
 * Awards catch points, logs the achievement, and updates player statistics.
 */
export function completeCatch(
  state: FishingMatchState,
  player: FisherPlayer,
  fish: FishSpecies,
): CaughtFish {
  const weight = Number(
    (fish.baseWeightKg + (Math.random() * 2 - 1) * fish.weightVariance).toFixed(2),
  );

  const doubleMultiplier = state.activeEvent.id === 'double_score' ? 2 : 1;
  const points = Math.max(
    10,
    Math.round(fish.basePoints * (weight / fish.baseWeightKg) * doubleMultiplier),
  );

  const caught: CaughtFish = {
    speciesId: fish.id,
    name: fish.name,
    rarity: fish.rarity,
    weightKg: weight,
    points,
    icon: fish.icon,
    timestamp: Date.now(),
  };

  player.catches.unshift(caught);
  player.score += points;
  player.status = 'celebrating_catch';
  player.resetTimer = 2.5;
  player.targetFish = null;

  state.activityLog.unshift(
    `🎣 ${player.name} landed a ${fish.rarity.toUpperCase()} ${fish.name} (${weight} kg) for +${points} pts!`,
  );

  return caught;
}
