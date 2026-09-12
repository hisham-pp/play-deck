-- ==============================================================================
-- Migration: 20250101000000_create_players_table.sql
-- Description: Table-based user credentials and profile persistence
-- ==============================================================================

-- 1. Create table with direct credentials and profile fields
create table if not exists public.players (
  id text primary key,
  email text unique not null,
  password text not null,
  display_name text not null default 'Player',
  avatar text not null default '🕹️',
  is_guest boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Indexes for fast lookup
create index if not exists idx_players_email on public.players(email);
create index if not exists idx_players_is_guest on public.players(is_guest);

-- 3. Automatic updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_players_updated_at on public.players;
create trigger set_players_updated_at
  before update on public.players
  for each row
  execute function public.handle_updated_at();

-- 4. Row Level Security (RLS)
alter table public.players enable row level security;

-- Policies allowing table-based login, signup, and profile retrieval
drop policy if exists "Allow public read access on players" on public.players;
create policy "Allow public read access on players"
  on public.players for select
  using (true);

drop policy if exists "Allow insert access on players" on public.players;
create policy "Allow insert access on players"
  on public.players for insert
  with check (true);

drop policy if exists "Allow update access on players" on public.players;
create policy "Allow update access on players"
  on public.players for update
  using (true);
