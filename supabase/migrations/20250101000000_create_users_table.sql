-- ==============================================================================
-- Migration: 20250101000000_create_users_table.sql
-- Description: Normal table-based user credentials and profile persistence
-- ==============================================================================

-- 1. Create table with direct credentials and profile fields (no Supabase Auth)
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

-- 2. Indexes for fast lookup
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_users_is_guest on public.users(is_guest);

-- 3. Automatic updated_at trigger
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

-- 4. Row Level Security (RLS)
alter table public.users enable row level security;

-- Policies allowing table-based login, signup, and profile retrieval
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
