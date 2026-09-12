-- ==============================================================================
-- Migration: 20250101000000_create_players_table.sql
-- Description: Future-proof players table schema, triggers, and RLS policies
-- ==============================================================================

-- 1. Create table with forward-compatible columns (including jsonb metadata)
create table if not exists public.players (
  id text primary key,
  email text,
  display_name text not null default 'Player',
  avatar text not null default '🕹️',
  is_guest boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Performance indexes
create index if not exists idx_players_email on public.players(email);
create index if not exists idx_players_is_guest on public.players(is_guest);
create index if not exists idx_players_created_at on public.players(created_at desc);

-- 3. Automatic updated_at timestamp trigger
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

-- 4. Automatic sync trigger from auth.users (Future-Proof Auth Hook)
-- When an auth.user is created (via Email/Password, OAuth, Magic Link, etc.),
-- automatically create or update their profile row in public.players.
create or replace function public.handle_new_auth_user()
returns trigger as $$
begin
  insert into public.players (
    id,
    email,
    display_name,
    avatar,
    is_guest,
    last_sign_in_at
  )
  values (
    new.id::text,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Player'),
    coalesce(new.raw_user_meta_data->>'avatar', '🕹️'),
    false,
    new.last_sign_in_at
  )
  on conflict (id) do update set
    email = coalesce(excluded.email, public.players.email),
    display_name = case 
      when public.players.display_name = 'Player' or public.players.display_name is null 
      then coalesce(excluded.display_name, public.players.display_name) 
      else public.players.display_name 
    end,
    last_sign_in_at = coalesce(excluded.last_sign_in_at, public.players.last_sign_in_at),
    updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Bind trigger to auth.users safely
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'auth' and tablename = 'users') then
    drop trigger if exists on_auth_user_created on auth.users;
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute function public.handle_new_auth_user();
  end if;
end;
$$;

-- 5. Row Level Security (RLS)
alter table public.players enable row level security;

-- Idempotent RLS policy creation
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

-- End of migration
