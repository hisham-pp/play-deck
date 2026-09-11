import { z } from 'zod';

export const SessionStatusSchema = z.enum([
  'waiting',
  'playing',
  'paused',
  'completed',
  'abandoned',
]);

export const GameSessionPlayerSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  avatar: z.string().optional(),
  isHost: z.boolean().optional(),
  score: z.number().optional(),
  rank: z.number().optional(),
});

export const GameSessionSchema = z.object({
  id: z.string().min(1),
  gameId: z.string().min(1),
  players: z.array(GameSessionPlayerSchema),
  status: SessionStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  endedAt: z.string().optional(),
  winnerPlayerId: z.string().optional(),
  state: z.unknown(),
});
