-- ============================================================
-- Movie site initial schema
-- Run via Supabase MCP / SQL editor / `supabase db push`
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- auto-create a profile row when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- watchlist ----------
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text not null,
  poster_path text,
  added_at timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type)
);

alter table public.watchlist enable row level security;

create policy "users manage their own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists watchlist_user_idx on public.watchlist (user_id, added_at desc);

-- ---------- watch_progress ----------
create table if not exists public.watch_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  season integer,
  episode integer,
  progress_seconds numeric not null default 0,
  duration_seconds numeric not null default 0,
  progress_percent numeric not null default 0,
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  unique (user_id, tmdb_id, media_type, season, episode)
);

alter table public.watch_progress enable row level security;

create policy "users manage their own watch progress"
  on public.watch_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists watch_progress_user_idx
  on public.watch_progress (user_id, last_watched_at desc);

-- ---------- reviews (phase 2, created now so schema is stable) ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tmdb_id integer not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  rating integer not null check (rating between 1 and 10),
  comment text,
  created_at timestamptz not null default now()
);

alter table public.reviews enable row level security;

create policy "reviews are viewable by everyone"
  on public.reviews for select
  using (true);

create policy "users manage their own reviews"
  on public.reviews for insert
  with check (auth.uid() = user_id);

create policy "users update their own reviews"
  on public.reviews for update
  using (auth.uid() = user_id);

create policy "users delete their own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);
