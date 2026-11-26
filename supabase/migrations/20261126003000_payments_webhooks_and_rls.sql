-- ==============================================================================
-- Migration: Harden Subscriptions, Payment Idempotency & Subscription-Enforced RLS
-- Project: AsTrade Trading Journal SaaS (pwkesbkoqrvfrzyjolla)
-- Non-destructive & idempotent (safe to execute against live database)
-- ==============================================================================

-- 1. Ensure UNIQUE (user_id) on public.subscriptions for atomic webhook upserts
do $$
begin
    if not exists (
        select 1
        from pg_index i
        join pg_class t on t.oid = i.indrelid
        join pg_namespace n on n.oid = t.relnamespace
        join pg_attribute a on a.attrelid = t.oid and a.attnum = any(i.indkey)
        where n.nspname = 'public'
          and t.relname = 'subscriptions'
          and i.indisunique = true
          and array_length(i.indkey, 1) = 1
          and a.attname = 'user_id'
    ) then
        alter table public.subscriptions
            add constraint uq_subscriptions_user_id unique (user_id);
    end if;
end $$;

-- 2. Payment Webhook Idempotency Log (service_role only, RLS enabled with zero client policies)
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

create index if not exists idx_payment_events_user on public.payment_events(user_id);
create index if not exists idx_payment_events_processed on public.payment_events(processed_at desc);

alter table public.payment_events enable row level security;

-- 3. Pin search_path on handle_new_user() trigger function and lock down execute grants
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

revoke all on function public.handle_new_user() from public, anon, authenticated;
grant execute on function public.handle_new_user() to service_role;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- 4. Security Definer helper verifying active trial or paid subscription
create or replace function public.has_active_subscription(check_user_id uuid default auth.uid())
returns boolean
language plpgsql
security invoker
set search_path = public
as $$
begin
    if check_user_id is null or check_user_id <> (select auth.uid()) then
        return false;
    end if;

    return exists (
        select 1
        from public.subscriptions
        where user_id = check_user_id
          and (
              (status = 'active' and current_period_end > now())
              or (status = 'trialing' and trial_ends_at > now())
          )
    );
end;
$$;

revoke all on function public.has_active_subscription(uuid) from public, anon;
grant execute on function public.has_active_subscription(uuid) to authenticated, service_role;

-- 5. Hardened RLS Policies on public.subscriptions (SELECT only for authenticated owners)
drop policy if exists "Usuarios ven su suscripción" on public.subscriptions;
create policy "Usuarios ven su suscripción" on public.subscriptions
    for select to authenticated
    using ((select auth.uid()) = user_id);

-- 6. Hardened RLS Policies on public.profiles
drop policy if exists "Usuarios ven su propio perfil" on public.profiles;
create policy "Usuarios ven su propio perfil" on public.profiles
    for select to authenticated
    using ((select auth.uid()) = id);

drop policy if exists "Usuarios insertan su propio perfil" on public.profiles;
create policy "Usuarios insertan su propio perfil" on public.profiles
    for insert to authenticated
    with check ((select auth.uid()) = id);

drop policy if exists "Usuarios actualizan su propio perfil" on public.profiles;
create policy "Usuarios actualizan su propio perfil" on public.profiles
    for update to authenticated
    using ((select auth.uid()) = id)
    with check ((select auth.uid()) = id);

-- 7. Hardened RLS Policies on public.accounts (SELECT allowed for paywall backdrop; mutations require active sub/trial)
drop policy if exists "Usuarios gestionan sus cuentas" on public.accounts;
drop policy if exists "Usuarios ven sus cuentas" on public.accounts;
create policy "Usuarios ven sus cuentas" on public.accounts
    for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Usuarios activos insertan cuentas" on public.accounts;
create policy "Usuarios activos insertan cuentas" on public.accounts
    for insert to authenticated
    with check (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
    );

drop policy if exists "Usuarios activos actualizan cuentas" on public.accounts;
create policy "Usuarios activos actualizan cuentas" on public.accounts
    for update to authenticated
    using (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
    )
    with check (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
    );

drop policy if exists "Usuarios activos eliminan cuentas" on public.accounts;
create policy "Usuarios activos eliminan cuentas" on public.accounts
    for delete to authenticated
    using (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
    );

-- 8. Hardened RLS Policies on public.trades (SELECT allowed; mutations require active sub/trial + tenant ownership)
drop policy if exists "Usuarios ven y gestionan sus trades" on public.trades;
drop policy if exists "Usuarios ven sus trades" on public.trades;
create policy "Usuarios ven sus trades" on public.trades
    for select to authenticated
    using ((select auth.uid()) = user_id);

drop policy if exists "Usuarios activos insertan trades" on public.trades;
create policy "Usuarios activos insertan trades" on public.trades
    for insert to authenticated
    with check (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
        and (
            account_id is null
            or exists (
                select 1 from public.accounts a
                where a.id = trades.account_id and a.user_id = (select auth.uid())
            )
        )
        and (
            session_id is null
            or exists (
                select 1 from public.backtest_sessions s
                where s.id = trades.session_id and s.user_id = (select auth.uid())
            )
        )
    );

drop policy if exists "Usuarios activos actualizan trades" on public.trades;
create policy "Usuarios activos actualizan trades" on public.trades
    for update to authenticated
    using (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
    )
    with check (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
        and (
            account_id is null
            or exists (
                select 1 from public.accounts a
                where a.id = trades.account_id and a.user_id = (select auth.uid())
            )
        )
        and (
            session_id is null
            or exists (
                select 1 from public.backtest_sessions s
                where s.id = trades.session_id and s.user_id = (select auth.uid())
            )
        )
    );

drop policy if exists "Usuarios activos eliminan trades" on public.trades;
create policy "Usuarios activos eliminan trades" on public.trades
    for delete to authenticated
    using (
        (select auth.uid()) = user_id
        and public.has_active_subscription((select auth.uid()))
    );

-- 9. Enforce subscription checks on account_groups, backtest_sessions & balance_snapshots writes too
drop policy if exists "Usuarios gestionan sus grupos de cuentas" on public.account_groups;
create policy "Usuarios ven sus grupos de cuentas" on public.account_groups
    for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Usuarios activos gestionan sus grupos" on public.account_groups
    for insert to authenticated
    with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));
create policy "Usuarios activos actualizan sus grupos" on public.account_groups
    for update to authenticated
    using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())))
    with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));
create policy "Usuarios activos eliminan sus grupos" on public.account_groups
    for delete to authenticated
    using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

drop policy if exists "Usuarios gestionan sus sesiones de backtest" on public.backtest_sessions;
create policy "Usuarios ven sus sesiones de backtest" on public.backtest_sessions
    for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Usuarios activos insertan sesiones" on public.backtest_sessions
    for insert to authenticated
    with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));
create policy "Usuarios activos actualizan sesiones" on public.backtest_sessions
    for update to authenticated
    using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())))
    with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));
create policy "Usuarios activos eliminan sesiones" on public.backtest_sessions
    for delete to authenticated
    using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

drop policy if exists "Usuarios ven y gestionan sus instantáneas" on public.balance_snapshots;
create policy "Usuarios ven sus instantáneas" on public.balance_snapshots
    for select to authenticated
    using ((select auth.uid()) = user_id);
create policy "Usuarios activos insertan instantáneas" on public.balance_snapshots
    for insert to authenticated
    with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));
create policy "Usuarios activos actualizan instantáneas" on public.balance_snapshots
    for update to authenticated
    using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())))
    with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));
create policy "Usuarios activos eliminan instantáneas" on public.balance_snapshots
    for delete to authenticated
    using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

-- 10. Harden Storage Folder Ownership for trade-screenshots
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
