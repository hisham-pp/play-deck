export interface AchievementDefinition {
  id: string; // e.g., 'summit_first_flip'
  gameId: string; // e.g., 'summit-rush'
  title: string;
  description: string;
  icon: string;
  points: number;
}

export interface PlayerAchievement {
  id: string; // uuid
  userId: string;
  achievementId: string;
  unlockedAt: string; // ISO date string
}
