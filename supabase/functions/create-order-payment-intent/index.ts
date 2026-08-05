import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { consumeRateLimit, tooManyRequests } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SERVICE_FEE_USD = 1;
const PLATFORM_FEE_PERCENT = 15;

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
    if (userErr || !user?.email) throw new Error("User not authenticated");

    const body = await req.json().catch(() => ({}));
    const gigId = typeof body.gigId === "string" ? body.gigId : "";
    const packageType = typeof body.packageType === "string" ? body.packageType : "";
    const saveCard = body.saveCard === true;
    if (!gigId || !packageType) {
      return new Response(JSON.stringify({ error: "gigId and packageType are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Throttle: per-user cap on this endpoint.
    const rl = await consumeRateLimit(admin, "fn:payment-intent", user.id, 15, 600);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter, corsHeaders);

    // Price and gig data are resolved server-side — never trusted from the client.
    const { data: gig, error: gigErr } = await admin
      .from("gigs")
      .select("id, title, freelancer_id, status")
      .eq("id", gigId)
      .maybeSingle();
    if (gigErr) throw gigErr;
    if (!gig) throw new Error("Gig not found");

    const { data: pkg, error: pkgErr } = await admin
      .from("gig_packages")
      .select("name, price, package_type")
      .eq("gig_id", gigId)
      .eq("package_type", packageType)
      .maybeSingle();
    if (pkgErr) throw pkgErr;
    if (!pkg) throw new Error("Package not found for this gig");

    const { data: seller, error: sellerErr } = await admin
      .from("freelancers")
      .select("id, stripe_account_id, stripe_payouts_enabled, stripe_charges_enabled")
      .eq("id", gig.freelancer_id)
      .maybeSingle();
    if (sellerErr) throw sellerErr;

    const packageUsd = Number(pkg.price);
    const totalUsd = packageUsd + SERVICE_FEE_USD;
    if (!(totalUsd > 0)) throw new Error("Invalid package price");

    const useConnect = Boolean(
      seller?.stripe_account_id && seller.stripe_payouts_enabled && seller.stripe_charges_enabled,
    );
    const payoutMode = useConnect ? "stripe_connect" : "wallet";

    // NOTE: no order row is created here. The order is inserted only after Stripe
    // confirms the payment (see verify-order-payment / stripe-webhook).


    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId = customers.data[0]?.id;
    if (!customerId) {
      const created = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = created.id;
    }

    const totalCents = Math.round(totalUsd * 100);
    const applicationFeeCents =
      Math.round(SERVICE_FEE_USD * 100) + Math.round((packageUsd * PLATFORM_FEE_PERCENT) / 100 * 100);

    const intentParams: Stripe.PaymentIntentCreateParams = {
      amount: totalCents,
      currency: "usd",
      customer: customerId,
      description: `${gig.title} — ${pkg.name} package (incl. $${SERVICE_FEE_USD} buyer service fee)`,
      payment_method_types: ["card"],
      metadata: {
        gig_id: gig.id,
        buyer_id: user.id,
        freelancer_id: gig.freelancer_id,
        package_name: pkg.name,
        amount_usd: String(totalUsd),
        payout_mode: payoutMode,
      },
    };

    if (saveCard) {
      intentParams.setup_future_usage = "off_session";
    }

    if (useConnect) {
      // Destination charge: funds land on the seller's connected account minus platform fee.
      intentParams.application_fee_amount = Math.min(applicationFeeCents, totalCents - 1);
      intentParams.transfer_data = { destination: seller!.stripe_account_id as string };
    }

    const intent = await stripe.paymentIntents.create(intentParams);

    return new Response(
      JSON.stringify({
        clientSecret: intent.client_secret,
        paymentIntentId: intent.id,
        amount: totalUsd,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("create-order-payment-intent error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
