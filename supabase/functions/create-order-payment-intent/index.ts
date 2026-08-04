import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SERVICE_FEE_USD = 1;

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
    if (!gigId || !packageType) {
      return new Response(JSON.stringify({ error: "gigId and packageType are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") ?? "";
    if (!publishableKey) throw new Error("STRIPE_PUBLISHABLE_KEY is not configured");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

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

    const totalUsd = Number(pkg.price) + SERVICE_FEE_USD;
    if (!(totalUsd > 0)) throw new Error("Invalid package price");

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .insert({
        buyer_id: user.id,
        freelancer_id: gig.freelancer_id,
        gig_id: gig.id,
        amount: totalUsd,
        status: "pending",
        payment_method: "card",
        payment_status: "pending",
        package_name: pkg.name,
      })
      .select("id")
      .single();
    if (orderErr) throw orderErr;

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    const customerId = customers.data[0]?.id ??
      (await stripe.customers.create({ email: user.email })).id;

    // Card only — no Stripe Link / wallets, so the form stays fully inside Fivesom.
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(totalUsd * 100),
      currency: "usd",
      customer: customerId,
      payment_method_types: ["card"],
      description: `Fivesom — ${gig.title} (${pkg.name} package)`,
      statement_descriptor_suffix: "FIVESOM",
      metadata: { order_id: order.id, gig_id: gig.id, buyer_id: user.id },
    });

    await admin
      .from("orders")
      .update({ stripe_payment_intent_id: intent.id })
      .eq("id", order.id);

    return new Response(
      JSON.stringify({
        clientSecret: intent.client_secret,
        publishableKey,
        orderId: order.id,
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
