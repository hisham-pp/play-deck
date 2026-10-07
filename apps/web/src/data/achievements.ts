import type { AchievementDefinition } from '@playdeck/game-types';

export const PLAYDECK_ACHIEVEMENTS: Record<string, AchievementDefinition> = {
  // --- Flips & Stunts ---
  summit_flip_1: { id: 'summit_flip_1', gameId: 'summit-rush', title: 'First Flip!', description: 'Complete a backflip or frontflip.', icon: '🤸', points: 50 },
  summit_flip_2: { id: 'summit_flip_2', gameId: 'summit-rush', title: 'Double Trouble', description: 'Complete a double flip.', icon: '🌪️', points: 100 },
  summit_flip_3: { id: 'summit_flip_3', gameId: 'summit-rush', title: 'Triple Threat', description: 'Complete a triple flip.', icon: '🎪', points: 250 },
  summit_flip_4: { id: 'summit_flip_4', gameId: 'summit-rush', title: 'Helicopter', description: 'Complete a quad flip in a single jump.', icon: '🚁', points: 500 },
  summit_flip_5: { id: 'summit_flip_5', gameId: 'summit-rush', title: 'Tornado', description: 'Complete a 5x flip.', icon: '🌀', points: 1000 },
  
  // --- Long Jumps ---
  summit_jump_25: { id: 'summit_jump_25', gameId: 'summit-rush', title: 'Frequent Flyer', description: 'Clear a 25m long jump.', icon: '✈️', points: 50 },
  summit_jump_50: { id: 'summit_jump_50', gameId: 'summit-rush', title: 'Orbit Achieved', description: 'Clear a 50m long jump.', icon: '🚀', points: 150 },
  summit_jump_75: { id: 'summit_jump_75', gameId: 'summit-rush', title: 'Evel Knievel', description: 'Clear a 75m long jump.', icon: '🏍️', points: 300 },
  summit_jump_100: { id: 'summit_jump_100', gameId: 'summit-rush', title: 'To Infinity', description: 'Clear a 100m long jump.', icon: '🌠', points: 500 },
  summit_jump_150: { id: 'summit_jump_150', gameId: 'summit-rush', title: 'Warp Speed', description: 'Clear a 150m long jump.', icon: '🛸', points: 1000 },
  
  // --- Air Time ---
  summit_air_3: { id: 'summit_air_3', gameId: 'summit-rush', title: 'Hang Time', description: 'Stay airborne for 3 seconds.', icon: '🎈', points: 50 },
  summit_air_5: { id: 'summit_air_5', gameId: 'summit-rush', title: 'Defying Gravity', description: 'Stay airborne for 5 seconds.', icon: '🦅', points: 150 },
  summit_air_8: { id: 'summit_air_8', gameId: 'summit-rush', title: 'No Strings Attached', description: 'Stay airborne for 8 seconds.', icon: '☁️', points: 400 },
  summit_air_12: { id: 'summit_air_12', gameId: 'summit-rush', title: 'Bird of Prey', description: 'Stay airborne for 12 seconds.', icon: '🦅', points: 1000 },
  
  // --- Single Run Distance ---
  summit_dist_500: { id: 'summit_dist_500', gameId: 'summit-rush', title: 'Sunday Drive', description: 'Drive 500m in a single run.', icon: '🛣️', points: 50 },
  summit_dist_1000: { id: 'summit_dist_1000', gameId: 'summit-rush', title: 'Kilometer Club', description: 'Drive 1,000m in a single run.', icon: '🏃', points: 100 },
  summit_dist_2500: { id: 'summit_dist_2500', gameId: 'summit-rush', title: 'Cross Country', description: 'Drive 2,500m in a single run.', icon: '🗺️', points: 250 },
  summit_dist_5000: { id: 'summit_dist_5000', gameId: 'summit-rush', title: 'Marathon', description: 'Drive 5,000m in a single run.', icon: '🏆', points: 500 },
  summit_dist_10000: { id: 'summit_dist_10000', gameId: 'summit-rush', title: 'Endurance Racer', description: 'Drive 10,000m in a single run.', icon: '⛰️', points: 1000 },
  
  // --- Single Run Score ---
  summit_score_5k: { id: 'summit_score_5k', gameId: 'summit-rush', title: 'Getting Started', description: 'Score 5,000 points in one run.', icon: '🥉', points: 50 },
  summit_score_20k: { id: 'summit_score_20k', gameId: 'summit-rush', title: 'Showoff', description: 'Score 20,000 points in one run.', icon: '🥈', points: 150 },
  summit_score_50k: { id: 'summit_score_50k', gameId: 'summit-rush', title: 'Pro Driver', description: 'Score 50,000 points in one run.', icon: '🥇', points: 300 },
  summit_score_100k: { id: 'summit_score_100k', gameId: 'summit-rush', title: 'Legendary', description: 'Score 100,000 points in one run.', icon: '👑', points: 750 },
  summit_score_250k: { id: 'summit_score_250k', gameId: 'summit-rush', title: 'Unstoppable', description: 'Score 250,000 points in one run.', icon: '🔥', points: 1500 },
  
  // --- Cumulative Coins ---
  summit_coins_100: { id: 'summit_coins_100', gameId: 'summit-rush', title: 'Spare Change', description: 'Collect 100 total coins.', icon: '🪙', points: 20 },
  summit_coins_1k: { id: 'summit_coins_1k', gameId: 'summit-rush', title: 'Piggy Bank', description: 'Collect 1,000 total coins.', icon: '🐷', points: 100 },
  summit_coins_10k: { id: 'summit_coins_10k', gameId: 'summit-rush', title: 'Vault Hunter', description: 'Collect 10,000 total coins.', icon: '🏦', points: 250 },
  summit_coins_50k: { id: 'summit_coins_50k', gameId: 'summit-rush', title: 'Millionaire', description: 'Collect 50,000 total coins.', icon: '💎', points: 500 },
  summit_coins_100k: { id: 'summit_coins_100k', gameId: 'summit-rush', title: 'Billionaire', description: 'Collect 100,000 total coins.', icon: '💰', points: 1000 },
  
  // --- Cumulative Distance ---
  summit_total_dist_10k: { id: 'summit_total_dist_10k', gameId: 'summit-rush', title: 'Daily Commute', description: 'Drive a total of 10km across all runs.', icon: '🚗', points: 100 },
  summit_total_dist_50k: { id: 'summit_total_dist_50k', gameId: 'summit-rush', title: 'Road Trip', description: 'Drive a total of 50km across all runs.', icon: '🚐', points: 250 },
  summit_total_dist_250k: { id: 'summit_total_dist_250k', gameId: 'summit-rush', title: 'Globetrotter', description: 'Drive a total of 250km across all runs.', icon: '🌍', points: 500 },
  summit_total_dist_1000k: { id: 'summit_total_dist_1000k', gameId: 'summit-rush', title: 'To The Moon', description: 'Drive a total of 1,000km across all runs.', icon: '🌕', points: 1500 },
  
  // --- Runs Completed ---
  summit_runs_10: { id: 'summit_runs_10', gameId: 'summit-rush', title: 'Just One More', description: 'Play 10 runs.', icon: '🎮', points: 25 },
  summit_runs_50: { id: 'summit_runs_50', gameId: 'summit-rush', title: 'Addicted', description: 'Play 50 runs.', icon: '🕹️', points: 100 },
  summit_runs_250: { id: 'summit_runs_250', gameId: 'summit-rush', title: 'No Life', description: 'Play 250 runs.', icon: '🧟', points: 300 },
  summit_runs_1000: { id: 'summit_runs_1000', gameId: 'summit-rush', title: 'Summit Master', description: 'Play 1,000 runs.', icon: '🗿', points: 1000 },

  // --- Upgrades ---
  summit_upgrade_first: { id: 'summit_upgrade_first', gameId: 'summit-rush', title: 'Tinkerer', description: 'Purchase your first vehicle upgrade.', icon: '🔧', points: 20 },
  summit_upgrade_max_one: { id: 'summit_upgrade_max_one', gameId: 'summit-rush', title: 'Specialist', description: 'Max out a single upgrade category.', icon: '⚙️', points: 100 },
  summit_upgrade_max_all: { id: 'summit_upgrade_max_all', gameId: 'summit-rush', title: 'Fully Loaded', description: 'Max out all upgrades on a vehicle.', icon: '🏎️', points: 500 },
  
  // --- Vehicles ---
  summit_vehicle_2: { id: 'summit_vehicle_2', gameId: 'summit-rush', title: 'Garage Expansion', description: 'Unlock a second vehicle.', icon: '🚙', points: 50 },
  summit_vehicle_all: { id: 'summit_vehicle_all', gameId: 'summit-rush', title: 'Collector', description: 'Unlock all available vehicles.', icon: '🛻', points: 500 },
  
  // --- Maps ---
  summit_map_2: { id: 'summit_map_2', gameId: 'summit-rush', title: 'New Horizons', description: 'Unlock a new map.', icon: '🏜️', points: 50 },
  summit_map_all: { id: 'summit_map_all', gameId: 'summit-rush', title: 'Explorer', description: 'Unlock all available maps.', icon: '🏔️', points: 500 },
  
  // --- Fail/Crash Specific ---
  summit_fail_gas: { id: 'summit_fail_gas', gameId: 'summit-rush', title: 'Out of Gas', description: 'Run out of fuel.', icon: '⛽', points: 10 },
  summit_fail_flip: { id: 'summit_fail_flip', gameId: 'summit-rush', title: 'Neck Brace', description: 'Crash by landing on your head.', icon: '🤕', points: 10 },
  summit_fail_quick: { id: 'summit_fail_quick', gameId: 'summit-rush', title: 'That Was Fast', description: 'Crash within the first 50m of a run.', icon: '🤦', points: 25 },
  summit_fail_tease: { id: 'summit_fail_tease', gameId: 'summit-rush', title: 'So Close', description: 'Run out of fuel within 10m of a fuel can.', icon: '🥵', points: 50 },

  // --- Map specific ---
  summit_meadows_1000: { id: 'summit_meadows_1000', gameId: 'summit-rush', title: 'Meadow Cruiser', description: 'Drive 1,000m on the Meadows map.', icon: '🌲', points: 100 },
  summit_desert_1000: { id: 'summit_desert_1000', gameId: 'summit-rush', title: 'Desert Rider', description: 'Drive 1,000m on the Desert map.', icon: '🌵', points: 100 },
  summit_snow_1000: { id: 'summit_snow_1000', gameId: 'summit-rush', title: 'Ice Drifter', description: 'Drive 1,000m on the Snow map.', icon: '⛄', points: 100 },
  summit_moon_1000: { id: 'summit_moon_1000', gameId: 'summit-rush', title: 'Lunar Rover', description: 'Drive 1,000m on the Moon map.', icon: '👽', points: 150 },

  // --- Misc ---
  summit_perfect_landing: { id: 'summit_perfect_landing', gameId: 'summit-rush', title: 'Smooth Operator', description: 'Land perfectly smooth after a jump.', icon: '🪶', points: 25 },
  summit_backwards: { id: 'summit_backwards', gameId: 'summit-rush', title: 'Wrong Way', description: 'Drive backwards for 10 meters.', icon: '🔙', points: 50 },
};
