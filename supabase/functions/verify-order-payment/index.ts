import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { ensurePaidOrder } from "../_shared/order-from-payment.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) throw new Error("Missing authorization header");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) throw new Error("User not authenticated");

    const body = await req.json().catch(() => ({}));
    const sessionId = typeof body.sessionId === "string" ? body.sessionId : "";
    const paymentIntentId = typeof body.paymentIntentId === "string" ? body.paymentIntentId : "";
    if (!sessionId && !paymentIntentId) {
      return new Response(JSON.stringify({ error: "sessionId or paymentIntentId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });
    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    let paid = false;
    let resolvedIntentId: string | null = paymentIntentId || null;
    let metadata: Record<string, string> = {};

    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      resolvedIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;
      metadata = (session.metadata ?? {}) as Record<string, string>;
    } else {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paid = intent.status === "succeeded" || intent.status === "processing";
      metadata = (intent.metadata ?? {}) as Record<string, string>;
    }

    if (!paid) {
      // No payment, no order. Nothing is written to the database.
      return new Response(JSON.stringify({ paid: false, orderId: null }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // The buyer in the payment metadata must be the caller.
    if (metadata.buyer_id && metadata.buyer_id !== user.id) {
      throw new Error("Not authorized for this payment");
    }

    const orderId = await ensurePaidOrder({
      admin,
      meta: metadata,
      paymentIntentId: resolvedIntentId,
      sessionId: sessionId || null,
    });

    return new Response(JSON.stringify({ paid: true, orderId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("verify-order-payment error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
