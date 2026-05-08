-- ACT Lab — Supabase schema
-- Supabase Dashboard → SQL Editor'de çalıştır

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  plan text not null default 'free' check (plan in ('free', 'premium')),
  sim_count int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "users can read own profile"
  on public.profiles for select
  using (auth.uid() = user_id);

create policy "users can update own profile"
  on public.profiles for update
  using (auth.uid() = user_id);

-- ── SESSIONS ────────────────────────────────────────────────────────────────

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  profile_id text,
  messages_json jsonb,
  supervisor_feedback text,
  score int check (score >= 0 and score <= 100),
  created_at timestamptz not null default now()
);

alter table public.sessions enable row level security;

create policy "users can read own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "service role can insert sessions"
  on public.sessions for insert
  with check (true);

-- ── PROGRESS ────────────────────────────────────────────────────────────────

create table if not exists public.progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  module text not null,
  total_sessions int not null default 0,
  avg_score numeric(5,2),
  last_session_at timestamptz,
  primary key (user_id, module)
);

alter table public.progress enable row level security;

create policy "users can read own progress"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "service role can upsert progress"
  on public.progress for all
  with check (true);
