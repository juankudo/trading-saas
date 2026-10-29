-- ==============================================================================
-- SCRIPT DE BASE DE DATOS SUPABASE — TRADING JOURNAL PRO SaaS (v2.0)
-- ==============================================================================
-- Este script crea todas las tablas, relaciones, disparadores automáticos,
-- políticas de seguridad RLS (Row Level Security) y bucket de almacenamiento.
-- 
-- Compatible con identificadores numéricos, timestamps y multi-entradas
-- de la Bitácora de Trading Pro (IDs tipo TEXT).
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

-- ==============================================================================
-- 4. TABLAS DE LA BITÁCORA CON COMPATIBILIDAD TEXT (IDs nativos de la Bitácora)
-- ==============================================================================

-- Si las tablas previas tenían tipo UUID, las recreamos limpiamente
drop table if exists public.balance_snapshots cascade;
drop table if exists public.trades cascade;
drop table if exists public.backtest_sessions cascade;
drop table if exists public.account_groups cascade;
drop table if exists public.accounts cascade;

-- 4.1. CUENTAS DE TRADING (REALES, EVALUACIONES, FONDEADAS)
create table public.accounts (
    id text primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    stage text default 'real', -- 'real', 'prueba', 'fondeada', 'instant'
    initial_balance numeric not null default 0,
    balance_actual numeric not null default 0,
    balance_actual_at timestamptz default now(),
    config jsonb default '{}'::jsonb, -- Reglas de fondeo, drawdowns, fases, etc.
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4.2. GRUPOS DE CUENTAS REALES
create table public.account_groups (
    id text primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);

-- 4.3. SESIONES DE BACKTESTING
create table public.backtest_sessions (
    id text primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    balance numeric not null default 100000,
    start_date text,
    notes text,
    data jsonb default '{}'::jsonb,
    created_at timestamptz default now()
);

-- 4.4. OPERACIONES (TRADES) — SOPORTA REAL Y BACKTESTING
create table public.trades (
    id text primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    account_id text references public.accounts(id) on delete set null,
    session_id text references public.backtest_sessions(id) on delete set null,
    mode text not null default 'real', -- 'real' o 'backtesting'
    par text not null default 'EURUSD',
    orden text not null default 'Buy',
    fecha text not null,
    hora text default '00:00',
    estado text not null default 'Ganada',
    pips_sl numeric default 0,
    pips_tp numeric default 0,
    rr numeric default 0,
    riesgo numeric default 0,
    lotaje numeric default 0,
    resultado_parcial numeric default 0,
    sesion text,
    tendencia text,
    nota_antes text,
    nota_despues text,
    link_antes text,
    link_despues text,
    multi_entry_id text,
    imagenes_antes text[] default '{}',
    imagenes_despues text[] default '{}',
    data jsonb default '{}'::jsonb, -- Objeto completo del trade para fidelidad total
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4.5. HISTORIAL DE INSTANTÁNEAS DE BALANCE
create table public.balance_snapshots (
    id text primary key default gen_random_uuid()::text,
    user_id uuid not null references public.profiles(id) on delete cascade,
    date text not null,
    snapshot_data jsonb not null default '{}'::jsonb,
    snapshot_at timestamptz default now()
);

-- ==============================================================================
-- 5. BUCKET DE ALMACENAMIENTO PARA CAPTURAS DE PANTALLA
-- ==============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
    'trade-screenshots',
    'trade-screenshots',
    true,
    5242880, -- Límite de 5 MB por imagen
    array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- ==============================================================================
-- 6. DISPARADORES AUTOMÁTICOS (TRIGGERS)
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
    )
    on conflict (id) do update set email = excluded.email;

    insert into public.subscriptions (user_id, provider, status, trial_ends_at, current_period_end)
    values (
        new.id,
        'stripe',
        'trialing',
        now() + interval '14 days',
        now() + interval '14 days'
    )
    on conflict do nothing;

    return new;
end;
$$ language plpgsql security definer;

-- Activar trigger tras registro
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ==============================================================================
-- 7. SEGURIDAD ROW LEVEL SECURITY (RLS)
-- Cada trader solo tiene acceso a sus propios datos.
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.accounts enable row level security;
alter table public.account_groups enable row level security;
alter table public.backtest_sessions enable row level security;
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

-- Políticas para Backtest Sessions
drop policy if exists "Usuarios gestionan sus sesiones de backtest" on public.backtest_sessions;
create policy "Usuarios gestionan sus sesiones de backtest" on public.backtest_sessions
    for all using (auth.uid() = user_id);

-- Políticas para Trades
drop policy if exists "Usuarios ven y gestionan sus trades" on public.trades;
create policy "Usuarios ven y gestionan sus trades" on public.trades
    for all using (auth.uid() = user_id);

-- Políticas para Balance Snapshots
drop policy if exists "Usuarios ven y gestionan sus instantáneas" on public.balance_snapshots;
create policy "Usuarios ven y gestionan sus instantáneas" on public.balance_snapshots
    for all using (auth.uid() = user_id);

-- Políticas para Storage (Capturas de trades)
drop policy if exists "Capturas visibles para todos o autenticados" on storage.objects;
create policy "Capturas visibles para todos o autenticados" on storage.objects
    for select using (bucket_id = 'trade-screenshots');

drop policy if exists "Usuarios autenticados suben capturas" on storage.objects;
create policy "Usuarios autenticados suben capturas" on storage.objects
    for insert with check (
        bucket_id = 'trade-screenshots' 
        and auth.role() = 'authenticated'
    );

drop policy if exists "Usuarios eliminan sus capturas" on storage.objects;
create policy "Usuarios eliminan sus capturas" on storage.objects
    for delete using (
        bucket_id = 'trade-screenshots' 
        and auth.uid() = owner
    );

-- ==============================================================================
-- 8. ÍNDICES DE RENDIMIENTO
-- ==============================================================================
create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_trades_account on public.trades(account_id);
create index if not exists idx_trades_session on public.trades(session_id);
create index if not exists idx_trades_user on public.trades(user_id);
create index if not exists idx_trades_fecha on public.trades(fecha);
create index if not exists idx_trades_mode on public.trades(mode);
create index if not exists idx_snapshots_user on public.balance_snapshots(user_id);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_backtest_sessions_user on public.backtest_sessions(user_id);
