import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { getCorsHeaders, resolveReturnBaseUrl } from "../_shared/cors.ts";
import { isLaunchPromoActive, isPlanInterval, PLAN_CATALOG } from "../_shared/pricing.ts";

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
    const apiKey = Deno.env.get("NOWPAYMENTS_API_KEY")?.trim();
    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error: "NOWPAYMENTS_NOT_CONFIGURED",
          message:
            "La pasarela NOWPayments aún está pendiente de configuración de credenciales en Supabase.",
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
    const priceUsd = isLaunchPromoActive() ? plan.promoUsd : plan.regularUsd;
    const isSandbox = Deno.env.get("NOWPAYMENTS_ENV")?.trim().toLowerCase() === "sandbox";
    const apiBase = isSandbox
      ? "https://api-sandbox.nowpayments.io/v1"
      : "https://api.nowpayments.io/v1";

    const returnBase = resolveReturnBaseUrl(req);
    const orderId = `${user.id}:${rawInterval}:${Date.now()}`;

    const invoiceRes = await fetch(`${apiBase}/invoice`, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        price_amount: priceUsd,
        price_currency: "usd",
        order_id: orderId,
        order_description: `AsTrade Pro Membership (${plan.labelEn})`,
        ipn_callback_url: `${supabaseUrl}/functions/v1/nowpayments-webhook`,
        success_url: `${returnBase}/app.html?checkout=success&provider=nowpayments`,
        cancel_url: `${returnBase}/app.html?checkout=canceled`,
      }),
    });

    const invoiceData = await invoiceRes.json().catch(() => ({}));
    if (!invoiceRes.ok || !invoiceData?.invoice_url) {
      console.error("[create-nowpayments-invoice] API error:", invoiceRes.status, invoiceData);
      return new Response(
        JSON.stringify({
          error: invoiceData?.message || "Failed to generate NOWPayments invoice",
        }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        invoice_url: invoiceData.invoice_url,
        invoice_id: String(invoiceData.id ?? ""),
        price_amount: priceUsd,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown NOWPayments error";
    console.error("[create-nowpayments-invoice] Error:", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
