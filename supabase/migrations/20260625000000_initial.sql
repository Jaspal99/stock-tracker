create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  privy_user_id text unique,
  wallet_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  activity_type text not null check (activity_type in ('buy', 'sell', 'deposit', 'withdraw')),
  token_address text,
  token_symbol text not null,
  amount_usd numeric not null default 0,
  quantity numeric,
  price_usd numeric,
  signature text,
  network text not null default 'devnet',
  status text not null default 'simulated',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.activities enable row level security;

create policy "profiles are self-readable"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles are self-updatable"
on public.profiles for update
using (auth.uid() = id);

create policy "users can read their own activities"
on public.activities for select
using (auth.uid() = user_id);

create policy "users can insert their own activities"
on public.activities for insert
with check (auth.uid() = user_id);

create index if not exists activities_user_created_idx
on public.activities(user_id, created_at desc);

create table if not exists public.wallet_activities (
  id uuid primary key default gen_random_uuid(),
  external_id text unique not null,
  wallet_address text not null,
  activity_type text not null check (activity_type in ('buy', 'sell', 'deposit', 'withdraw')),
  token_address text,
  token_symbol text not null,
  amount_usd numeric not null default 0,
  quantity numeric,
  price_usd numeric,
  network text not null default 'devnet',
  status text not null default 'simulated',
  created_at timestamptz not null default now()
);

alter table public.wallet_activities enable row level security;

-- No public policies by design. The Cloudflare Worker writes with the service
-- role key, keeping that credential out of the mobile bundle.

create index if not exists wallet_activities_wallet_created_idx
on public.wallet_activities(wallet_address, created_at desc);
