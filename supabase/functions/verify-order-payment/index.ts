import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

    if (paymentIntentId) {
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      paid = intent.status === "succeeded";
    } else {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      paid = session.payment_status === "paid";
      resolvedIntentId =
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : session.payment_intent?.id ?? null;
    }

    const query = admin.from("orders").select("id, buyer_id, freelancer_id, payment_status");
    const { data: order, error: orderErr } = paymentIntentId
      ? await query.eq("stripe_payment_intent_id", paymentIntentId).maybeSingle()
      : await query.eq("stripe_session_id", sessionId).maybeSingle();
    if (orderErr) throw orderErr;
    if (!order) throw new Error("Order not found for this payment");
    if (order.buyer_id !== user.id) throw new Error("Not authorized for this order");

    if (paid && order.payment_status !== "paid") {
      const { error: updateErr } = await admin
        .from("orders")
        .update({
          payment_status: "paid",
          status: "pending",
          stripe_payment_intent_id: resolvedIntentId,
        })
        .eq("id", order.id);
      if (updateErr) throw updateErr;

      const { data: freelancer } = await admin
        .from("freelancers")
        .select("user_id")
        .eq("id", order.freelancer_id)
        .maybeSingle();

      if (freelancer?.user_id) {
        const { error: notificationErr } = await admin.from("notifications").insert({
          user_id: freelancer.user_id,
          type: "order",
          title: "New paid order",
          message: "You received a new paid order. The funds are secured in Fivesom Escrow.",
          link: `/freelancer/order/${order.id}`,
        });
        if (notificationErr) console.error("Payment notification error:", notificationErr);
      }
    }

    return new Response(JSON.stringify({ paid, orderId: order.id }), {
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
