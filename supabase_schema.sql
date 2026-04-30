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
