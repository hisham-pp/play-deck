import { z } from 'zod';

export const PlayerSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(2).max(30),
  avatar: z.string().optional(),
  isGuest: z.boolean(),
  createdAt: z.string(),
});

export const PlayerPreferencesSchema = z.object({
  theme: z.enum(['dark', 'light', 'system']),
  soundEnabled: z.boolean(),
  reducedMotion: z.boolean(),
  autoSave: z.boolean(),
});
