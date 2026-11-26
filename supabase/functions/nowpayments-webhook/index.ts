import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  computeExtendedPeriodEndIso,
  isPlanInterval,
  PLAN_CATALOG,
} from "../_shared/pricing.ts";

function sortObjectKeys(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(sortObjectKeys);
  if (value !== null && typeof value === "object") {
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

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const signature = req.headers.get("x-nowpayments-sig")?.trim().toLowerCase();
  const ipnSecret = Deno.env.get("NOWPAYMENTS_IPN_SECRET")?.trim();

  if (!signature || !ipnSecret) {
    return new Response("Missing signature or IPN secret", { status: 400 });
  }

  try {
    const payload = await req.json();
    const canonicalJson = JSON.stringify(sortObjectKeys(payload));

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(ipnSecret),
      { name: "HMAC", hash: "SHA-512" },
      false,
      ["sign"]
    );
    const mac = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      new TextEncoder().encode(canonicalJson)
    );
    const expectedHex = Array.from(new Uint8Array(mac))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    if (!timingSafeEqualHex(signature, expectedHex)) {
      return new Response("Invalid NOWPayments signature", { status: 401 });
    }

    const paymentStatus = String(payload?.payment_status ?? "").toLowerCase();
    const paymentId = String(payload?.payment_id ?? "");
    const eventKey = `nowpayments:${paymentId}:${paymentStatus}`;

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: existingEvent } = await supabaseAdmin
      .from("payment_events")
      .select("event_key")
      .eq("event_key", eventKey)
      .maybeSingle();

    if (existingEvent) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [userId, rawInterval] = String(payload?.order_id ?? "").split(":");
    const planInterval = isPlanInterval(rawInterval) ? rawInterval : "month";
    const isFinalSuccess =
      paymentStatus === "finished" || paymentStatus === "confirmed";

    let fulfilledStatus = `ignored:${paymentStatus}`;

    if (isFinalSuccess && userId) {
      // Guard against underpayments (allow 1.5% tolerance for minor network dust/rounding)
      const payAmount = Number(payload?.pay_amount ?? 0);
      const actuallyPaid = Number(payload?.actually_paid ?? 0);
      const isAmountValid =
        payAmount <= 0 || actuallyPaid >= payAmount * 0.985;

      if (!isAmountValid) {
        fulfilledStatus = `rejected_underpaid:${actuallyPaid}_of_${payAmount}`;
      } else {
        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("status, trial_ends_at, current_period_end")
          .eq("user_id", userId)
          .maybeSingle();

        const planDays = PLAN_CATALOG[planInterval].days;
        const newEndIso = computeExtendedPeriodEndIso(existingSub, planDays);

        await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            provider: "nowpayments",
            status: "active",
            plan_interval: planInterval,
            nowpayments_payment_id: paymentId,
            stripe_subscription_id: null,
            current_period_end: newEndIso,
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );

        fulfilledStatus = "activated";
      }
    }

    await supabaseAdmin.from("payment_events").insert({
      event_key: eventKey,
      provider: "nowpayments",
      event_type: `ipn:${paymentStatus}`,
      user_id: userId || null,
      status: fulfilledStatus,
      amount_usd: Number(payload?.price_amount ?? 0) || null,
      raw_payload: {
        payment_id: paymentId,
        order_id: payload?.order_id,
        payment_status: paymentStatus,
        pay_currency: payload?.pay_currency,
      },
    });

    return new Response(JSON.stringify({ received: true, status: fulfilledStatus }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "NOWPayments IPN error";
    console.error("[nowpayments-webhook] Error:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }
});
