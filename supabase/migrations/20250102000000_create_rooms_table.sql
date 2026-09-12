-- ==============================================================================
-- Migration: 20250102000000_create_rooms_table.sql
-- Description: Table for tracking multiplayer rooms with 6-digit codes
-- ==============================================================================

-- 1. Create rooms table
create table if not exists public.rooms (
  id text primary key,
  code text unique not null,
  game_id text not null,
  host_id text not null,
  guest_id text,
  status text not null default 'waiting',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Indexes for fast code lookup and status queries
create index if not exists idx_rooms_code on public.rooms(code);
create index if not exists idx_rooms_status on public.rooms(status);
create index if not exists idx_rooms_game_id on public.rooms(game_id);

-- 3. Automatic updated_at trigger
drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
  before update on public.rooms
  for each row
  execute function public.handle_updated_at();

-- 4. Row Level Security (RLS)
alter table public.rooms enable row level security;

drop policy if exists "Allow public read access on rooms" on public.rooms;
create policy "Allow public read access on rooms"
  on public.rooms for select
  using (true);

drop policy if exists "Allow insert access on rooms" on public.rooms;
create policy "Allow insert access on rooms"
  on public.rooms for insert
  with check (true);

drop policy if exists "Allow update access on rooms" on public.rooms;
create policy "Allow update access on rooms"
  on public.rooms for update
  using (true);
