import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "npm:stripe@17.7.0";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders, resolveReturnBaseUrl } from "../_shared/cors.ts";
import {
  computeRemainingTrialDays,
  isLaunchPromoActive,
  isPlanInterval,
  PLAN_CATALOG,
} from "../_shared/pricing.ts";

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY")?.trim();
    const monthlyPriceId = Deno.env.get("STRIPE_PRICE_MONTH")?.trim();

    if (!stripeKey || !monthlyPriceId) {
      return new Response(
        JSON.stringify({
          error: "STRIPE_NOT_CONFIGURED",
          message:
            "La pasarela Stripe aún está pendiente de configuración de credenciales en Supabase.",
        }),
        {
          status: 503,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authErr,
    } = await userClient.auth.getUser();

    if (authErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized session" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const rawInterval = body?.plan_interval ?? "month";
    if (!isPlanInterval(rawInterval)) {
      return new Response(JSON.stringify({ error: "Invalid plan_interval" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const plan = PLAN_CATALOG[rawInterval];
    const isPromo = isLaunchPromoActive();
    const returnBase = resolveReturnBaseUrl(req);
    const couponId = Deno.env.get("STRIPE_COUPON_FIRST_MONTH_20")?.trim();

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: existingSub } = await adminClient
      .from("subscriptions")
      .select("status, trial_ends_at, current_period_end, stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const stripe = new Stripe(stripeKey, {
      httpClient: Stripe.createFetchHttpClient(),
    });

    const customerConfig: { customer?: string; customer_email?: string } =
      existingSub?.stripe_customer_id
        ? { customer: existingSub.stripe_customer_id }
        : { customer_email: user.email ?? undefined };

    const successUrl = `${returnBase}/app.html?checkout=success&provider=stripe&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${returnBase}/app.html?checkout=canceled`;

    let sessionParams: Stripe.Checkout.SessionCreateParams;

    if (rawInterval === "month") {
      // Plan Mensual: Suscripción mensual estándar ($25/mes) con cupón 20% "Once" ($20 1er mes) en ventana promo
      sessionParams = {
        mode: "subscription",
        ...customerConfig,
        client_reference_id: user.id,
        line_items: [
          {
            price: monthlyPriceId,
            quantity: 1,
          },
        ],
        ...(isPromo && couponId
          ? { discounts: [{ coupon: couponId }] }
          : { allow_promotion_codes: true }),
        metadata: {
          user_id: user.id,
          plan_interval: "month",
          initial_upfront_paid: "false",
        },
        subscription_data: {
          metadata: {
            user_id: user.id,
            plan_interval: "month",
            initial_upfront_paid: "false",
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      };
    } else {
      // Planes 3M / 6M / 12M (Mixed Cart):
      // 1) Cobro único inmediato por el pack inicial ($56 / $108 / $200 en promo; $70 / $135 / $250 después)
      // 2) Suscripción mensual ($25/mes) diferida exactamente por los días iniciales + días restantes de prueba gratis
      const upfrontUsd = isPromo ? plan.promoUsd : plan.regularUsd;
      const upfrontCents = Math.round(upfrontUsd * 100);
      const remainingTrialDays = computeRemainingTrialDays(existingSub);
      const totalInitialDays = Math.min(730, plan.days + remainingTrialDays);
      const explicitProductId = Deno.env.get("STRIPE_PRODUCT_ID")?.trim();

      const packName = isPromo
        ? `AsTrade Pro — Pack Inicial ${plan.labelEs} (-20% Lanzamiento)`
        : `AsTrade Pro — Pack Inicial ${plan.labelEs}`;
      const packDesc = `Acceso completo por ${totalInitialDays} días. Luego continúa automáticamente a $25 USD/mes.`;

      const upfrontLineItem: Stripe.Checkout.SessionCreateParams.LineItem = explicitProductId
        ? {
            quantity: 1,
            price_data: {
              currency: "usd",
              product: explicitProductId,
              unit_amount: upfrontCents,
            },
          }
        : {
            quantity: 1,
            price_data: {
              currency: "usd",
              unit_amount: upfrontCents,
              product_data: {
                name: packName,
                description: packDesc,
              },
            },
          };

      sessionParams = {
        mode: "subscription",
        ...customerConfig,
        client_reference_id: user.id,
        line_items: [
          upfrontLineItem,
          {
            price: monthlyPriceId,
            quantity: 1,
          },
        ],
        metadata: {
          user_id: user.id,
          plan_interval: rawInterval,
          initial_upfront_paid: "true",
          initial_days: String(totalInitialDays),
        },
        subscription_data: {
          trial_period_days: totalInitialDays,
          description: packDesc,
          metadata: {
            user_id: user.id,
            plan_interval: rawInterval,
            initial_upfront_paid: "true",
            initial_days: String(totalInitialDays),
          },
        },
        success_url: successUrl,
        cancel_url: cancelUrl,
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return new Response(
      JSON.stringify({ url: session.url, session_id: session.id }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown Stripe error";
    console.error("[create-stripe-checkout] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
