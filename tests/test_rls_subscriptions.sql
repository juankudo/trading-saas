-- ==============================================================================
-- AsTrade Trading Journal SaaS — pgTAP Offline RLS Test Suite
-- Target: Supabase PostgreSQL Database Schema & Row Level Security Policies
-- Usage: Local offline execution via Supabase CLI (`supabase test db`) or pg_prove
-- ==============================================================================

begin;
select plan(20);

-- -----------------------------------------------------------------------------
-- 1. Verify RLS is explicitly enabled on all core tables (standard catalog check)
-- -----------------------------------------------------------------------------
-- Test 1: public.profiles
select is(
    (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'profiles'
    ),
    true,
    'RLS must be enabled on public.profiles'
);

-- Test 2: public.subscriptions
select is(
    (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'subscriptions'
    ),
    true,
    'RLS must be enabled on public.subscriptions'
);

-- Test 3: public.accounts
select is(
    (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'accounts'
    ),
    true,
    'RLS must be enabled on public.accounts'
);

-- Test 4: public.account_groups
select is(
    (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'account_groups'
    ),
    true,
    'RLS must be enabled on public.account_groups'
);

-- Test 5: public.backtest_sessions
select is(
    (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'backtest_sessions'
    ),
    true,
    'RLS must be enabled on public.backtest_sessions'
);

-- Test 6: public.trades
select is(
    (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'trades'
    ),
    true,
    'RLS must be enabled on public.trades'
);

-- Test 7: public.balance_snapshots
select is(
    (
        select c.relrowsecurity
        from pg_class c
        join pg_namespace n on n.oid = c.relnamespace
        where n.nspname = 'public' and c.relname = 'balance_snapshots'
    ),
    true,
    'RLS must be enabled on public.balance_snapshots'
);

-- -----------------------------------------------------------------------------
-- 2. Test Anonymous Role (Unauthenticated access rejection)
-- -----------------------------------------------------------------------------
reset role;
set local role anon;

-- Test 8: Anon cannot read subscriptions
select is_empty(
    $$ select * from public.subscriptions $$,
    'Anonymous users must not be able to read any subscription records'
);

-- Test 9: Anon cannot insert or escalate subscription
select throws_ok(
    $$ insert into public.subscriptions (user_id, status) values ('00000000-0000-0000-0000-000000000001', 'active') $$,
    '42501', -- insufficient_privilege / RLS violation
    NULL,
    'Anonymous users must not be able to insert subscription records'
);

-- Test 10: Anon cannot read trades
select is_empty(
    $$ select * from public.trades $$,
    'Anonymous users must not be able to read any trade records'
);

-- -----------------------------------------------------------------------------
-- 3. Test Authenticated Role: Client-Side Privilege Escalation Prevention
-- -----------------------------------------------------------------------------
reset role;
set local role authenticated;
set local "request.jwt.claim.sub" = '11111111-1111-1111-1111-111111111111';
set local "request.jwt.claims" = '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}';

-- Test 11: Authenticated user cannot update subscriptions (FOR SELECT only RLS yields 0 rows updated)
select results_eq(
    $$
        with updated as (
            update public.subscriptions
            set status = 'active', current_period_end = now() + interval '10 years'
            where user_id = '11111111-1111-1111-1111-111111111111'
            returning 1
        )
        select count(*)::bigint from updated
    $$,
    $$ values (0::bigint) $$,
    'Authenticated users must not be permitted to update their own subscription status (0 rows updated under RLS)'
);

-- Test 12: Authenticated user cannot insert into subscriptions directly
select throws_ok(
    $$ insert into public.subscriptions (user_id, provider, status) values ('11111111-1111-1111-1111-111111111111', 'stripe', 'active') $$,
    '42501',
    NULL,
    'Authenticated users must not be permitted to insert subscription records directly'
);

-- -----------------------------------------------------------------------------
-- 4. Test Cross-Tenant Isolation & Subscription Enforcement on Trades
-- -----------------------------------------------------------------------------
-- Test 13: Authenticated user 1111... cannot read trades belonging to 2222...
select is_empty(
    $$ select * from public.trades where user_id = '22222222-2222-2222-2222-222222222222' $$,
    'Authenticated users must never be able to read trades belonging to another tenant'
);

-- Test 14: Unsubscribed / expired-trial user cannot insert into public.trades
select throws_ok(
    $$
        insert into public.trades (id, user_id, par, orden, fecha, estado)
        values ('trade_expired_test', '11111111-1111-1111-1111-111111111111', 'EURUSD', 'Buy', '2026-11-24', 'Full TP')
    $$,
    '42501',
    NULL,
    'Authenticated users without an active subscription or trial must be blocked from inserting trades'
);

-- Test 15: Unsubscribed / expired-trial user cannot update trades (0 rows updated)
select results_eq(
    $$
        with updated as (
            update public.trades
            set estado = 'Full TP'
            where user_id = '11111111-1111-1111-1111-111111111111'
            returning 1
        )
        select count(*)::bigint from updated
    $$,
    $$ values (0::bigint) $$,
    'Authenticated users without an active subscription or trial must update 0 trades'
);

-- -----------------------------------------------------------------------------
-- 5. Test Storage Bucket Folder Isolation (storage.objects & storage.buckets)
-- -----------------------------------------------------------------------------
-- Test 16: Authenticated user 1111... cannot upload into another tenant folder (2222...)
select throws_ok(
    $$
        insert into storage.objects (bucket_id, name)
        values ('trade-screenshots', '22222222-2222-2222-2222-222222222222/hijack.png')
    $$,
    '42501',
    NULL,
    'Authenticated users must not be permitted to upload screenshots into another user folder'
);

-- Test 17: Authenticated user 1111... cannot update objects in another tenant folder (0 rows updated)
select results_eq(
    $$
        with updated as (
            update storage.objects
            set name = '22222222-2222-2222-2222-222222222222/overwritten.png'
            where bucket_id = 'trade-screenshots'
              and name like '22222222-2222-2222-2222-222222222222/%'
            returning 1
        )
        select count(*)::bigint from updated
    $$,
    $$ values (0::bigint) $$,
    'Authenticated users must update 0 storage objects outside their own auth.uid() folder'
);

-- -----------------------------------------------------------------------------
-- 6. Test Schema Hardening: Private Bucket, UNIQUE(user_id), & Search Path
-- -----------------------------------------------------------------------------
reset role;

-- Test 18: trade-screenshots storage bucket must not be public
select is(
    (
        select public
        from storage.buckets
        where id = 'trade-screenshots'
    ),
    false,
    'Storage bucket trade-screenshots must be private (public = false)'
);

-- Test 19: public.subscriptions must enforce UNIQUE(user_id)
select ok(
    exists (
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
    ),
    'public.subscriptions must enforce a UNIQUE constraint/index on user_id'
);

-- Test 20: handle_new_user function must have explicit search_path configured
select ok(
    exists (
        select 1
        from pg_proc p
        cross join unnest(coalesce(p.proconfig, '{}'::text[])) as cfg
        where p.proname = 'handle_new_user'
          and p.pronamespace = 'public'::regnamespace
          and cfg like 'search_path=%'
    ),
    'Function public.handle_new_user() must have explicit SET search_path configured to prevent search path hijacking'
);

select * from finish();
rollback;
