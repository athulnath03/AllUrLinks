create extension if not exists pgcrypto;

create table if not exists public.favourites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 100),
  url text not null check (char_length(trim(url)) between 1 and 2048),
  icon text,
  category text,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists favourites_user_position_idx on public.favourites(user_id, position);

alter table public.favourites enable row level security;

 drop policy if exists "Users can view their own favourites" on public.favourites;
create policy "Users can view their own favourites"
  on public.favourites for select
  using (auth.uid() = user_id);

 drop policy if exists "Users can insert their own favourites" on public.favourites;
create policy "Users can insert their own favourites"
  on public.favourites for insert
  with check (auth.uid() = user_id);

 drop policy if exists "Users can update their own favourites" on public.favourites;
create policy "Users can update their own favourites"
  on public.favourites for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

 drop policy if exists "Users can delete their own favourites" on public.favourites;
create policy "Users can delete their own favourites"
  on public.favourites for delete
  using (auth.uid() = user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists favourites_set_updated_at on public.favourites;
create trigger favourites_set_updated_at
before update on public.favourites
for each row execute function public.set_updated_at();
