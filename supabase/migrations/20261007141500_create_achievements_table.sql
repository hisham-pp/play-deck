-- Create Player Achievements table
CREATE TABLE public.player_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_player_achievement UNIQUE (user_id, achievement_id)
);

CREATE INDEX idx_player_achievements_user_id ON public.player_achievements(user_id);
CREATE INDEX idx_player_achievements_game_id ON public.player_achievements(game_id);

ALTER TABLE public.player_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on player_achievements"
  ON public.player_achievements FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access on player_achievements"
  ON public.player_achievements FOR INSERT
  WITH CHECK (true);
