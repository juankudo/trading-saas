-- ==============================================================================
-- SCRIPT DE BASE DE DATOS SUPABASE — TRADING JOURNAL PRO SaaS
-- ==============================================================================
-- Este script crea todas las tablas, relaciones, disparadores automáticos
-- y políticas de seguridad RLS (Row Level Security) para el SaaS.
--
-- INSTRUCCIONES:
-- 1. Ve a tu panel en https://supabase.com y abre tu proyecto.
-- 2. Entra en "SQL Editor" (menú lateral izquierdo).
-- 3. Pega todo este código y haz clic en "Run" (Ejecutar).
-- ==============================================================================

-- 1. EXTENSIONES
create extension if not exists "uuid-ossp";

-- 2. TABLA DE PERFILES DE USUARIO
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text not null,
    full_name text,
    avatar_url text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3. TABLA DE SUSCRIPCIONES Y ESTADO DE PRUEBA
create table if not exists public.subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    provider text not null default 'stripe', -- 'stripe' o 'nowpayments'
    stripe_customer_id text,
    stripe_subscription_id text,
    nowpayments_payment_id text,
    status text not null default 'trialing', -- 'trialing', 'active', 'past_due', 'canceled', 'read_only'
    plan_interval text default 'month',     -- 'month', 'quarter', 'year'
    trial_ends_at timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4. TABLA DE CUENTAS DE TRADING (REALES, EVALUACIONES, FONDEADAS)
create table if not exists public.accounts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    stage text default 'real', -- 'real', 'prueba', 'fondeada', 'instant'
    initial_balance numeric not null default 0,
    balance_actual numeric not null default 0,
    balance_actual_at timestamptz default now(),
    config jsonb default '{}'::jsonb, -- Reglas de fondeo, drawdowns, consistencia, etc.
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 5. TABLA DE GRUPOS DE CUENTAS
create table if not exists public.account_groups (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);

-- 6. TABLA DE OPERACIONES (TRADES)
create table if not exists public.trades (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    account_id uuid not null references public.accounts(id) on delete cascade,
    symbol text not null,
    direction text not null check (direction in ('buy', 'sell')),
    entry_price numeric,
    exit_price numeric,
    stop_loss numeric,
    take_profit numeric,
    lot_size numeric,
    pnl numeric not null default 0,
    result_pct numeric default 0,
    open_time timestamptz not null default now(),
    close_time timestamptz,
    status text default 'closed',
    notes text,
    tags text[] default '{}',
    details jsonb default '{}'::jsonb, -- Almacena capturas, comisiones, swap, etc.
    created_at timestamptz default now()
);

-- 7. TABLA DE INSTANTÁNEAS DE BALANCE (BALANCE HISTORY)
create table if not exists public.balance_snapshots (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references public.profiles(id) on delete cascade,
    account_id uuid references public.accounts(id) on delete cascade,
    balance numeric not null default 0,
    snapshot_data jsonb default '{}'::jsonb,
    snapshot_at timestamptz default now()
);

-- ==============================================================================
-- DISPARADORES AUTOMÁTICOS (TRIGGERS)
-- ==============================================================================

-- Cuando un usuario se registra en Supabase Auth, se crea automáticamente su
-- perfil y se le asigna su suscripción de prueba de 14 días.
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, full_name)
    values (
        new.id, 
        new.email, 
        coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
    );

    insert into public.subscriptions (user_id, provider, status, trial_ends_at, current_period_end)
    values (
        new.id,
        'stripe',
        'trialing',
        now() + interval '14 days',
        now() + interval '14 days'
    );

    return new;
end;
$$ language plpgsql security definer;

-- Activar trigger tras registro
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- SEGURIDAD ROW LEVEL SECURITY (RLS)
-- Cada trader solo tiene acceso a sus propios datos.
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.accounts enable row level security;
alter table public.account_groups enable row level security;
alter table public.trades enable row level security;
alter table public.balance_snapshots enable row level security;

-- Políticas para Profiles
drop policy if exists "Usuarios ven su propio perfil" on public.profiles;
create policy "Usuarios ven su propio perfil" on public.profiles
    for select using (auth.uid() = id);

drop policy if exists "Usuarios insertan su propio perfil" on public.profiles;
create policy "Usuarios insertan su propio perfil" on public.profiles
    for insert with check (auth.uid() = id);

drop policy if exists "Usuarios actualizan su propio perfil" on public.profiles;
create policy "Usuarios actualizan su propio perfil" on public.profiles
    for update using (auth.uid() = id);

-- Políticas para Subscriptions
drop policy if exists "Usuarios ven su suscripción" on public.subscriptions;
create policy "Usuarios ven su suscripción" on public.subscriptions
    for select using (auth.uid() = user_id);

-- Políticas para Accounts
drop policy if exists "Usuarios gestionan sus cuentas" on public.accounts;
create policy "Usuarios gestionan sus cuentas" on public.accounts
    for all using (auth.uid() = user_id);

-- Políticas para Account Groups
drop policy if exists "Usuarios gestionan sus grupos de cuentas" on public.account_groups;
create policy "Usuarios gestionan sus grupos de cuentas" on public.account_groups
    for all using (auth.uid() = user_id);

-- Políticas para Trades
drop policy if exists "Usuarios ven y gestionan sus trades" on public.trades;
create policy "Usuarios ven y gestionan sus trades" on public.trades
    for all using (auth.uid() = user_id);

-- Políticas para Balance Snapshots
drop policy if exists "Usuarios ven y gestionan sus instantáneas" on public.balance_snapshots;
create policy "Usuarios ven y gestionan sus instantáneas" on public.balance_snapshots
    for all using (auth.uid() = user_id);

-- ==============================================================================
-- ÍNDICES DE RENDIMIENTO
-- ==============================================================================
create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_trades_account on public.trades(account_id);
create index if not exists idx_trades_user on public.trades(user_id);
create index if not exists idx_trades_open_time on public.trades(open_time);
create index if not exists idx_snapshots_user on public.balance_snapshots(user_id);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
