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
    user_id uuid not null unique references public.profiles(id) on delete cascade,
    provider text not null default 'stripe', -- 'stripe' o 'nowpayments'
    stripe_customer_id text,
    stripe_subscription_id text,
    nowpayments_payment_id text,
    status text not null default 'trialing', -- 'trialing', 'active', 'past_due', 'canceled', 'read_only'
    plan_interval text default 'month',     -- 'month', 'quarter', 'semester', 'year'
    trial_ends_at timestamptz,
    current_period_end timestamptz,
    cancel_at_period_end boolean default false,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 3.1. REGISTRO DE IDEMPOTENCIA DE WEBHOOKS (Exclusivo service_role)
create table if not exists public.payment_events (
    event_key text primary key,
    provider text not null,
    event_type text not null,
    user_id uuid references public.profiles(id) on delete set null,
    status text,
    amount_usd numeric,
    raw_payload jsonb default '{}'::jsonb,
    processed_at timestamptz not null default now()
);

-- ==============================================================================
-- 4. TABLAS DE LA BITÁCORA CON COMPATIBILIDAD TEXT (IDs nativos de la Bitácora)
-- ==============================================================================

-- 4.1. CUENTAS DE TRADING (REALES, EVALUACIONES, FONDEADAS)
create table if not exists public.accounts (
    id text primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    stage text default 'real', -- 'real', 'prueba', 'fondeada', 'instant'
    initial_balance numeric not null default 0,
    balance_actual numeric default null,
    balance_actual_at timestamptz default null,
    config jsonb default '{}'::jsonb, -- Reglas de fondeo, drawdowns, fases, etc.
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 4.2. GRUPOS DE CUENTAS REALES
create table if not exists public.account_groups (
    id text primary key,
    user_id uuid not null references public.profiles(id) on delete cascade,
    name text not null,
    created_at timestamptz default now()
);

-- 4.3. SESIONES DE BACKTESTING
create table if not exists public.backtest_sessions (
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
create table if not exists public.trades (
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
create table if not exists public.balance_snapshots (
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
-- perfil y se le asigna su suscripción de prueba de 7 días.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
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
        now() + interval '7 days',
        now() + interval '7 days'
    )
    on conflict (user_id) do nothing;

    return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon;
grant execute on function public.handle_new_user() to authenticated, service_role;

-- Activar trigger tras registro
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- Función de seguridad para verificar suscripción activa o período de prueba
create or replace function public.has_active_subscription(check_user_id uuid default auth.uid())
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
    -- Prevenir oráculos o enumeración de UUIDs ajenos
    if check_user_id is null or check_user_id <> (select auth.uid()) then
        return false;
    end if;

    return exists (
        select 1 from public.subscriptions
        where user_id = check_user_id
          and (
              (status = 'active' and current_period_end > now())
              or (status = 'trialing' and trial_ends_at > now())
          )
    );
end;
$$;

revoke all on function public.has_active_subscription(uuid) from public;
grant execute on function public.has_active_subscription(uuid) to authenticated, service_role;

-- ==============================================================================
-- 7. SEGURIDAD ROW LEVEL SECURITY (RLS)
-- Cada trader solo tiene acceso a sus propios datos.
-- ==============================================================================

alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payment_events enable row level security;
alter table public.accounts enable row level security;
alter table public.account_groups enable row level security;
alter table public.backtest_sessions enable row level security;
alter table public.trades enable row level security;
alter table public.balance_snapshots enable row level security;

-- Políticas para Profiles
drop policy if exists "Usuarios ven su propio perfil" on public.profiles;
create policy "Usuarios ven su propio perfil" on public.profiles
    for select using ((select auth.uid()) = id);

drop policy if exists "Usuarios insertan su propio perfil" on public.profiles;
create policy "Usuarios insertan su propio perfil" on public.profiles
    for insert with check ((select auth.uid()) = id);

drop policy if exists "Usuarios actualizan su propio perfil" on public.profiles;
create policy "Usuarios actualizan su propio perfil" on public.profiles
    for update using ((select auth.uid()) = id);

-- Políticas para Subscriptions
drop policy if exists "Usuarios ven su suscripción" on public.subscriptions;
create policy "Usuarios ven su suscripción" on public.subscriptions
    for select using ((select auth.uid()) = user_id);

-- Políticas para Accounts (Lectura permitida; mutaciones requieren suscripción activa)
drop policy if exists "Usuarios gestionan sus cuentas" on public.accounts;
drop policy if exists "Usuarios ven sus cuentas" on public.accounts;
create policy "Usuarios ven sus cuentas" on public.accounts
    for select using ((select auth.uid()) = user_id);

drop policy if exists "Usuarios activos insertan cuentas" on public.accounts;
create policy "Usuarios activos insertan cuentas" on public.accounts
    for insert with check (
        (select auth.uid()) = user_id 
        and public.has_active_subscription((select auth.uid()))
    );

drop policy if exists "Usuarios activos actualizan cuentas" on public.accounts;
create policy "Usuarios activos actualizan cuentas" on public.accounts
    for update using (
        (select auth.uid()) = user_id 
        and public.has_active_subscription((select auth.uid()))
    );

drop policy if exists "Usuarios activos eliminan cuentas" on public.accounts;
create policy "Usuarios activos eliminan cuentas" on public.accounts
    for delete using (
        (select auth.uid()) = user_id 
        and public.has_active_subscription((select auth.uid()))
    );

-- Políticas para Account Groups
drop policy if exists "Usuarios gestionan sus grupos de cuentas" on public.account_groups;
create policy "Usuarios gestionan sus grupos de cuentas" on public.account_groups
    for all using ((select auth.uid()) = user_id);

-- Políticas para Backtest Sessions
drop policy if exists "Usuarios gestionan sus sesiones de backtest" on public.backtest_sessions;
create policy "Usuarios gestionan sus sesiones de backtest" on public.backtest_sessions
    for all using ((select auth.uid()) = user_id);

-- Políticas para Trades (Lectura permitida; mutaciones requieren suscripción activa)
drop policy if exists "Usuarios ven y gestionan sus trades" on public.trades;
drop policy if exists "Usuarios ven sus trades" on public.trades;
create policy "Usuarios ven sus trades" on public.trades
    for select using ((select auth.uid()) = user_id);

drop policy if exists "Usuarios activos insertan trades" on public.trades;
create policy "Usuarios activos insertan trades" on public.trades
    for insert with check (
        (select auth.uid()) = user_id 
        and public.has_active_subscription((select auth.uid()))
    );

drop policy if exists "Usuarios activos actualizan trades" on public.trades;
create policy "Usuarios activos actualizan trades" on public.trades
    for update using (
        (select auth.uid()) = user_id 
        and public.has_active_subscription((select auth.uid()))
    );

drop policy if exists "Usuarios activos eliminan trades" on public.trades;
create policy "Usuarios activos eliminan trades" on public.trades
    for delete using (
        (select auth.uid()) = user_id 
        and public.has_active_subscription((select auth.uid()))
    );

-- Políticas para Balance Snapshots
drop policy if exists "Usuarios ven y gestionan sus instantáneas" on public.balance_snapshots;
create policy "Usuarios ven y gestionan sus instantáneas" on public.balance_snapshots
    for all using ((select auth.uid()) = user_id);

-- Políticas para Storage (Capturas de trades aisladas por usuario)
drop policy if exists "Capturas visibles para todos o autenticados" on storage.objects;
create policy "Capturas visibles para todos o autenticados" on storage.objects
    for select using (bucket_id = 'trade-screenshots');

drop policy if exists "Usuarios autenticados suben capturas" on storage.objects;
drop policy if exists "Usuarios suben capturas en su carpeta" on storage.objects;
create policy "Usuarios suben capturas en su carpeta" on storage.objects
    for insert to authenticated
    with check (
        bucket_id = 'trade-screenshots'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

drop policy if exists "Usuarios actualizan sus capturas" on storage.objects;
create policy "Usuarios actualizan sus capturas" on storage.objects
    for update to authenticated
    using (
        bucket_id = 'trade-screenshots'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    )
    with check (
        bucket_id = 'trade-screenshots'
        and (storage.foldername(name))[1] = (select auth.uid())::text
    );

drop policy if exists "Usuarios eliminan sus capturas" on storage.objects;
create policy "Usuarios eliminan sus capturas" on storage.objects
    for delete to authenticated
    using (
        bucket_id = 'trade-screenshots'
        and (storage.foldername(name))[1] = (select auth.uid())::text
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
