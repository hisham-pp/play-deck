-- ==============================================================================
-- Migration: 20250103000000_create_friendships_and_chat_tables.sql
-- Description: Social suite: Friendships, Game Invites, and Room Chat
-- ==============================================================================

-- 1. Friendships Table
create table if not exists public.friendships (
  id text primary key,
  user_id text not null,
  friend_id text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_user_friend unique (user_id, friend_id)
);

create index if not exists idx_friendships_user_id on public.friendships(user_id);
create index if not exists idx_friendships_friend_id on public.friendships(friend_id);
create index if not exists idx_friendships_status on public.friendships(status);

drop trigger if exists set_friendships_updated_at on public.friendships;
create trigger set_friendships_updated_at
  before update on public.friendships
  for each row
  execute function public.handle_updated_at();

alter table public.friendships enable row level security;

drop policy if exists "Allow public read access on friendships" on public.friendships;
create policy "Allow public read access on friendships"
  on public.friendships for select
  using (true);

drop policy if exists "Allow insert access on friendships" on public.friendships;
create policy "Allow insert access on friendships"
  on public.friendships for insert
  with check (true);

drop policy if exists "Allow update access on friendships" on public.friendships;
create policy "Allow update access on friendships"
  on public.friendships for update
  using (true);

drop policy if exists "Allow delete access on friendships" on public.friendships;
create policy "Allow delete access on friendships"
  on public.friendships for delete
  using (true);

-- 2. Game Invites Table
create table if not exists public.game_invites (
  id text primary key,
  sender_id text not null,
  receiver_id text not null,
  game_id text not null,
  room_code text not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_game_invites_receiver on public.game_invites(receiver_id, status);
create index if not exists idx_game_invites_room_code on public.game_invites(room_code);

drop trigger if exists set_game_invites_updated_at on public.game_invites;
create trigger set_game_invites_updated_at
  before update on public.game_invites
  for each row
  execute function public.handle_updated_at();

alter table public.game_invites enable row level security;

drop policy if exists "Allow public read access on game_invites" on public.game_invites;
create policy "Allow public read access on game_invites"
  on public.game_invites for select
  using (true);

drop policy if exists "Allow insert access on game_invites" on public.game_invites;
create policy "Allow insert access on game_invites"
  on public.game_invites for insert
  with check (true);

drop policy if exists "Allow update access on game_invites" on public.game_invites;
create policy "Allow update access on game_invites"
  on public.game_invites for update
  using (true);

-- 3. Room Messages (Chat) Table
create table if not exists public.room_messages (
  id text primary key,
  room_code text not null,
  sender_id text not null,
  sender_name text not null,
  sender_avatar text not null default '🕹️',
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_room_messages_room_code on public.room_messages(room_code);

alter table public.room_messages enable row level security;

drop policy if exists "Allow public read access on room_messages" on public.room_messages;
create policy "Allow public read access on room_messages"
  on public.room_messages for select
  using (true);

drop policy if exists "Allow insert access on room_messages" on public.room_messages;
create policy "Allow insert access on room_messages"
  on public.room_messages for insert
  with check (true);
