export { SharedBrainGame } from './components/SharedBrainGame';
export { COURSES_CATALOG } from './engine/course-catalog';
export { BuddyBotEngine, updateBuddyBot } from './engine/buddy-bot';
export { updatePhysics, createInitialCharacter } from './engine/platformer-physics';
export { SharedBrainSoundService } from './services/shared-brain-sound.service';
export { SharedBrainStatsRepository } from './services/shared-brain-stats-repository';
export type {
  BrainCharacterState,
  CourseDefinition,
  CourseElement,
  PlayerPair,
  SharedBrainPlayer,
  SharedBrainRole,
} from './types/shared-brain.types';
