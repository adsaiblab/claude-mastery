-- Claude Code Mastery Path — schéma initial Supabase
-- À appliquer via `supabase db push` ou `psql < 0001_init.sql` sur la DB self-hostée.
--
-- Politique : RLS strict, un user ne voit et n'écrit que ses propres lignes.
-- La table users est synchronisée depuis auth.users via un trigger.

create extension if not exists "uuid-ossp";

-- ─── users (miroir de auth.users) ────────────────────────────────────────
create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  is_expert boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;

create policy "users_select_self"
  on public.users for select
  using (auth.uid() = id);

create policy "users_update_self"
  on public.users for update
  using (auth.uid() = id);

-- Trigger : à chaque insert dans auth.users, miroir dans public.users.
create or replace function public.handle_new_auth_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ─── progress ────────────────────────────────────────────────────────────
create table if not exists public.progress (
  user_id uuid not null references public.users (id) on delete cascade,
  module_id text not null,
  percent integer not null check (percent between 0 and 100),
  updated_at timestamptz not null default now(),
  primary key (user_id, module_id)
);

alter table public.progress enable row level security;

create policy "progress_rw_self"
  on public.progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── completions ─────────────────────────────────────────────────────────
create table if not exists public.completions (
  user_id uuid not null references public.users (id) on delete cascade,
  item_id text not null,
  kind text not null check (kind in ('quiz', 'lab_step', 'lab')),
  completed_at timestamptz not null default now(),
  primary key (user_id, item_id, kind)
);

alter table public.completions enable row level security;

create policy "completions_rw_self"
  on public.completions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ─── quiz_answers (log complet des tentatives) ──────────────────────────
create table if not exists public.quiz_answers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users (id) on delete cascade,
  quiz_id text not null,
  chosen_index integer not null check (chosen_index >= 0),
  correct boolean not null,
  answered_at timestamptz not null default now()
);

alter table public.quiz_answers enable row level security;

create policy "quiz_answers_rw_self"
  on public.quiz_answers for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists quiz_answers_user_quiz_idx
  on public.quiz_answers (user_id, quiz_id, answered_at desc);
