-- =============================================================
-- Catch It For Me — Supabase schema
-- Run this inside your Supabase project → SQL Editor → "New query"
-- =============================================================

-- 1. PROFILES TABLE -------------------------------------------------------
-- One row per authenticated user. Replaces localStorage.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  coins integer not null default 0,

  -- Currently equipped items
  skin_id  text not null default 'default',
  bg_id    text not null default 'basic',
  sound_id text not null default 'default',

  -- Unlocked inventories (Postgres text arrays)
  owned_skins       text[] not null default array['default']::text[],
  owned_backgrounds text[] not null default array['basic']::text[],
  owned_sounds      text[] not null default array['default']::text[],

  -- Stats
  high_streak integer not null default 0,
  total_wins  integer not null default 0,
  total_fails integer not null default 0,

  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Keep updated_at fresh automatically
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();


-- 2. AUTO-CREATE PROFILE ON SIGNUP ---------------------------------------
-- When a new user signs up via Supabase Auth, create their profile row.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 3. ROW LEVEL SECURITY --------------------------------------------------
-- Users can only see and modify their OWN profile row.
alter table public.profiles enable row level security;

drop policy if exists "read own profile" on public.profiles;
create policy "read own profile"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "insert own profile" on public.profiles;
create policy "insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "update own profile" on public.profiles;
create policy "update own profile"
  on public.profiles for update
  using (auth.uid() = id);


-- 4. (Optional) GLOBAL LEADERBOARD VIEW ----------------------------------
-- A read-only view anyone (even anon) can query to see top streaks.
-- Safe because it only exposes the stat columns, not user identity.
create or replace view public.leaderboard as
  select
    substring(id::text, 1, 8) as player,
    coins,
    high_streak,
    total_wins
  from public.profiles
  order by high_streak desc, total_wins desc
  limit 100;

-- Allow everyone (including anon) to read the leaderboard view.
grant select on public.leaderboard to anon, authenticated;

-- Done. Verify by inserting a test user via Auth, then SELECT * from profiles.
