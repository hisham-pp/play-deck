import { z } from 'zod';

export const GameCategorySchema = z.enum([
  'all',
  'puzzle',
  'strategy',
  'arcade',
  'board',
  'card',
  'casual',
]);

export const GameStatusSchema = z.enum(['available', 'coming-soon', 'maintenance']);

export const PlayerCapacitySchema = z.object({
  min: z.number().int().min(1),
  max: z.number().int().min(1),
});

export const GameDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string(),
  category: GameCategorySchema,
  players: PlayerCapacitySchema,
  status: GameStatusSchema,
  thumbnailUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  tags: z.array(z.string()),
  featured: z.boolean().optional(),
  releaseDate: z.string().optional(),
  badge: z.string().optional(),
});

export const GameFilterSchema = z.object({
  category: GameCategorySchema.optional(),
  search: z.string().optional(),
  status: GameStatusSchema.optional(),
  featured: z.boolean().optional(),
});
