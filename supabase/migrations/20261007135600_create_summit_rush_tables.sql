-- Create Summit Rush Progress table
CREATE TABLE public.summit_rush_progress (
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE PRIMARY KEY,
  coins INTEGER NOT NULL DEFAULT 0,
  best_distance INTEGER NOT NULL DEFAULT 0,
  best_score INTEGER NOT NULL DEFAULT 0,
  total_runs INTEGER NOT NULL DEFAULT 0,
  total_distance INTEGER NOT NULL DEFAULT 0,
  upgrades JSONB NOT NULL DEFAULT '{"engine":0,"suspension":0,"tires":0,"fuel":0}'::jsonb,
  unlocked_vehicles JSONB NOT NULL DEFAULT '["buggy"]'::jsonb,
  selected_vehicle TEXT NOT NULL DEFAULT 'buggy',
  unlocked_maps JSONB NOT NULL DEFAULT '["meadows"]'::jsonb,
  selected_map TEXT NOT NULL DEFAULT 'meadows',
  map_records JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.summit_rush_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on summit progress"
  ON public.summit_rush_progress FOR SELECT
  USING (true);

CREATE POLICY "Allow update access on summit progress"
  ON public.summit_rush_progress FOR UPDATE
  USING (true);

CREATE POLICY "Allow insert access on summit progress"
  ON public.summit_rush_progress FOR INSERT
  WITH CHECK (true);

-- Create Summit Rush Leaderboard table
CREATE TABLE public.summit_rush_leaderboard (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  score INTEGER NOT NULL,
  distance INTEGER NOT NULL,
  map_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.summit_rush_leaderboard ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on summit leaderboard"
  ON public.summit_rush_leaderboard FOR SELECT
  USING (true);

CREATE POLICY "Allow insert access on summit leaderboard"
  ON public.summit_rush_leaderboard FOR INSERT
  WITH CHECK (true);

-- Index for sorting by score per map
CREATE INDEX summit_rush_leaderboard_score_idx ON public.summit_rush_leaderboard(map_id, score DESC);
