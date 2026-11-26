import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "jsr:@supabase/supabase-js@2";
import {
  computeRemainingTrialDays,
  isPlanInterval,
  PLAN_CATALOG,
} from "../_shared/pricing.ts";

const cryptoProvider = Stripe.createSubtleCryptoProvider();

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")?.trim();
  const signature = req.headers.get("stripe-signature");

  if (!stripeKey || !webhookSecret || !signature) {
    return new Response("Missing Stripe configuration or signature", { status: 400 });
  }

  const stripe = new Stripe(stripeKey, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const rawBody = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    );

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const eventKey = `stripe:${event.id}`;
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

    let affectedUserId: string | null = null;
    let amountUsd: number | null = null;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const paymentOk =
          session.payment_status === "paid" ||
          session.payment_status === "no_payment_required";

        if (!paymentOk || !session.subscription) {
          break;
        }

        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription.id;
        const sub = await stripe.subscriptions.retrieve(subId);

        const userId =
          session.client_reference_id ||
          session.metadata?.user_id ||
          sub.metadata?.user_id ||
          null;

        if (!userId) break;
        affectedUserId = userId;
        amountUsd = session.amount_total ? session.amount_total / 100 : null;

        const rawInterval =
          session.metadata?.plan_interval || sub.metadata?.plan_interval || "month";
        const planInterval = isPlanInterval(rawInterval) ? rawInterval : "month";
        const isMixedUpfront =
          sub.metadata?.initial_upfront_paid === "true" ||
          session.metadata?.initial_upfront_paid === "true";

        const { data: existingSub } = await supabaseAdmin
          .from("subscriptions")
          .select("status, trial_ends_at, current_period_end")
          .eq("user_id", userId)
          .maybeSingle();

        let periodEndIso: string;
        if (isMixedUpfront) {
          // Mixed Cart: Stripe's sub.trial_end already represents upfrontDays + bonusRemainingTrialDays
          const endUnix = sub.trial_end || sub.current_period_end;
          periodEndIso = new Date(endUnix * 1000).toISOString();
        } else {
          // Monthly plan: start from Stripe's current_period_end and credit unused trial days
          const stripeEndMs = sub.current_period_end * 1000;
          const bonusDays = computeRemainingTrialDays(existingSub);
          const planDaysMs = PLAN_CATALOG[planInterval].days * 86_400_000;
          const minWithBonusMs = Date.now() + planDaysMs + bonusDays * 86_400_000;
          periodEndIso = new Date(Math.max(stripeEndMs, minWithBonusMs)).toISOString();
        }

        const customerId =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id ?? null;

        await supabaseAdmin.from("subscriptions").upsert(
          {
            user_id: userId,
            provider: "stripe",
            status: "active",
            plan_interval: planInterval,
            stripe_customer_id: customerId,
            stripe_subscription_id: sub.id,
            current_period_end: periodEndIso,
            cancel_at_period_end: Boolean(sub.cancel_at_period_end),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        );
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;

        // Ignore the initial invoice already processed by checkout.session.completed
        if (!subId || invoice.billing_reason === "subscription_create") {
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subId);
        const lineEndUnix = invoice.lines?.data?.[0]?.period?.end;
        const periodEndUnix = lineEndUnix || sub.current_period_end;
        const newEndIso = new Date(periodEndUnix * 1000).toISOString();
        amountUsd = invoice.amount_paid ? invoice.amount_paid / 100 : null;

        const { data: updatedRows } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "active",
            plan_interval: "month",
            current_period_end: newEndIso,
            cancel_at_period_end: Boolean(sub.cancel_at_period_end),
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId)
          .select("user_id");

        affectedUserId = updatedRows?.[0]?.user_id ?? sub.metadata?.user_id ?? null;
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const subId =
          typeof invoice.subscription === "string"
            ? invoice.subscription
            : invoice.subscription?.id ?? null;

        if (!subId) break;

        const { data: updatedRows } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subId)
          .select("user_id");

        affectedUserId = updatedRows?.[0]?.user_id ?? null;
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const isMixedUpfront = sub.metadata?.initial_upfront_paid === "true";

        let mappedStatus = "active";
        if (sub.status === "past_due" || sub.status === "unpaid") {
          mappedStatus = "past_due";
        } else if (sub.status === "canceled" || sub.status === "incomplete_expired") {
          mappedStatus = "canceled";
        } else if (sub.status === "trialing" && !isMixedUpfront) {
          mappedStatus = "trialing";
        }

        const endUnix =
          sub.status === "trialing" && sub.trial_end
            ? sub.trial_end
            : sub.current_period_end;

        const updatePayload: Record<string, unknown> = {
          status: mappedStatus,
          cancel_at_period_end: Boolean(sub.cancel_at_period_end),
          updated_at: new Date().toISOString(),
        };

        if (endUnix) {
          updatePayload.current_period_end = new Date(endUnix * 1000).toISOString();
        }

        const { data: updatedRows } = await supabaseAdmin
          .from("subscriptions")
          .update(updatePayload)
          .eq("stripe_subscription_id", sub.id)
          .select("user_id");

        affectedUserId = updatedRows?.[0]?.user_id ?? sub.metadata?.user_id ?? null;
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const { data: updatedRows } = await supabaseAdmin
          .from("subscriptions")
          .update({
            status: "canceled",
            cancel_at_period_end: false,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", sub.id)
          .select("user_id");

        affectedUserId = updatedRows?.[0]?.user_id ?? sub.metadata?.user_id ?? null;
        break;
      }

      default:
        break;
    }

    await supabaseAdmin.from("payment_events").insert({
      event_key: eventKey,
      provider: "stripe",
      event_type: event.type,
      user_id: affectedUserId,
      status: "processed",
      amount_usd: amountUsd,
      raw_payload: { stripe_event_id: event.id, type: event.type },
    });

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Webhook verification failed";
    console.error("[stripe-webhook] Error:", msg);
    return new Response(`Webhook Error: ${msg}`, { status: 400 });
  }
});
