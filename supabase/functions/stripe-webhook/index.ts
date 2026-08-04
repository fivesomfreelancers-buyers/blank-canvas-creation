import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

// Stripe webhooks are called by Stripe (no user JWT) — verify_jwt is false for this function.
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200 });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });
  const secret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
  const signature = req.headers.get("stripe-signature") ?? "";
  const raw = await req.text();

  let event: Stripe.Event;
  try {
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
    event = await stripe.webhooks.constructEventAsync(raw, signature, secret);
  } catch (err) {
    console.error("Webhook signature verification failed:", (err as Error).message);
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 400 });
  }

  const admin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } },
  );

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === "paid") {
          const paymentIntentId =
            typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
          await admin
            .from("orders")
            .update({ payment_status: "paid", stripe_payment_intent_id: paymentIntentId })
            .eq("stripe_session_id", session.id);
        }
        break;
      }
      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await admin
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("stripe_session_id", session.id)
          .neq("payment_status", "paid");
        break;
      }
      case "payment_intent.succeeded": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await admin
          .from("orders")
          .update({ payment_status: "paid", stripe_payment_intent_id: intent.id })
          .eq("stripe_payment_intent_id", intent.id);
        break;
      }
      case "payment_intent.payment_failed": {
        const intent = event.data.object as Stripe.PaymentIntent;
        await admin
          .from("orders")
          .update({ payment_status: "failed" })
          .eq("stripe_payment_intent_id", intent.id)
          .neq("payment_status", "paid");
        break;
      }

      case "account.updated": {
        const account = event.data.object as Stripe.Account;
        await admin
          .from("freelancers")
          .update({
            stripe_payouts_enabled: account.payouts_enabled === true,
            stripe_charges_enabled: account.charges_enabled === true,
            stripe_details_submitted: account.details_submitted === true,
            stripe_onboarded_at:
              account.details_submitted && account.payouts_enabled ? new Date().toISOString() : null,
          })
          .eq("stripe_account_id", account.id);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
