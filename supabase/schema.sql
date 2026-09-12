-- ==============================================================================
-- PlayDeck Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ==============================================================================

-- 1. Table-based User credentials & profiles (no Supabase Auth needed)
create table if not exists public.users (
  id text primary key,
  email text unique not null,
  password text not null default '',
  display_name text not null default 'Player',
  avatar text not null default '🕹️',
  is_guest boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_is_guest on public.users(is_guest);

-- 2. Automatic updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- 3. Row Level Security (RLS) for users
alter table public.users enable row level security;

drop policy if exists "Allow public read access on users" on public.users;
create policy "Allow public read access on users"
  on public.users for select
  using (true);

drop policy if exists "Allow insert access on users" on public.users;
create policy "Allow insert access on users"
  on public.users for insert
  with check (true);

drop policy if exists "Allow update access on users" on public.users;
create policy "Allow update access on users"
  on public.users for update
  using (true);

-- 4. Multiplayer Rooms Table
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

create index if not exists idx_rooms_code on public.rooms(code);
create index if not exists idx_rooms_status on public.rooms(status);
create index if not exists idx_rooms_game_id on public.rooms(game_id);

drop trigger if exists set_rooms_updated_at on public.rooms;
create trigger set_rooms_updated_at
  before update on public.rooms
  for each row
  execute function public.handle_updated_at();

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
