export type Lane = -1 | 0 | 1;

export type ObstacleType =
  'roadblock' | 'oil-slick' | 'speed-bump' | 'moving-wall' | 'fake-road' | 'boost-pad';

export type VehicleStatus = 'driving' | 'jumping' | 'sliding' | 'crashed' | 'finished';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  trackId: string; // which player's track this obstacle is placed on
  distance: number; // meters from start (0 to 1000)
  lane: Lane;
  placedBy: string; // playerId of saboteur
  active: boolean;
  movingWallPhase?: number;
}

export interface VehicleState {
  playerId: string;
  playerName: string;
  avatar: string;
  color: string;
  distance: number; // track progress in meters
  lane: Lane;
  targetLane: Lane;
  lateralProgress: number; // -1 to 1 interpolation between lanes
  speed: number; // current speed in m/s
  jumpHeight: number; // vertical height in meters
  jumpVelocity: number;
  status: VehicleStatus;
  slideTimer: number; // remaining seconds of loss of steering
  crashTimer: number; // remaining seconds of recovery after crash
  crashesSuffered: number;
  finishTimeMs?: number;
  isBot?: boolean;
}

export interface SaboteurState {
  saboteurId: string;
  targetPlayerId: string;
  energy: number; // 0 to 100
  selectedObstacle: ObstacleType;
  crashesInflicted: number;
  obstaclesPlaced: number;
  sabotageScore: number;
}

export interface RacingPlayer {
  id: string;
  name: string;
  avatar: string;
  seatIndex: number;
  color: string;
  isBot?: boolean;
  isHost?: boolean;
  ready?: boolean;
  trackId?: string;
}

export interface RaceStandings {
  rank: number;
  player: RacingPlayer;
  finishTimeMs: number;
  crashesSuffered: number;
  obstaclesPlaced: number;
  crashesInflicted: number;
  sabotageScore: number;
}
