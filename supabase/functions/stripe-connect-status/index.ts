import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { consumeRateLimit, tooManyRequests } from "../_shared/rate-limit.ts";

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
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) throw new Error("Missing authorization header");

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
    const user = userData?.user;
    if (userErr || !user) throw new Error("User not authenticated");

    const body = await req.json().catch(() => ({}));
    const wantLoginLink = body?.loginLink === true;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Throttle: per-user cap on this endpoint.
    const rl = await consumeRateLimit(admin, "fn:connect-status", user.id, 60, 300);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter, corsHeaders);

    const { data: freelancer, error: fErr } = await admin
      .from("freelancers")
      .select("id, stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (fErr) throw fErr;
    if (!freelancer) throw new Error("Freelancer account not found");

    if (!freelancer.stripe_account_id) {
      return new Response(
        JSON.stringify({ connected: false, payoutsEnabled: false, chargesEnabled: false, detailsSubmitted: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const account = await stripe.accounts.retrieve(freelancer.stripe_account_id);
    const payoutsEnabled = account.payouts_enabled === true;
    const chargesEnabled = account.charges_enabled === true;
    const detailsSubmitted = account.details_submitted === true;

    await admin
      .from("freelancers")
      .update({
        stripe_payouts_enabled: payoutsEnabled,
        stripe_charges_enabled: chargesEnabled,
        stripe_details_submitted: detailsSubmitted,
        stripe_onboarded_at: detailsSubmitted && payoutsEnabled ? new Date().toISOString() : null,
      })
      .eq("id", freelancer.id);

    let loginUrl: string | null = null;
    if (wantLoginLink && detailsSubmitted) {
      try {
        const link = await stripe.accounts.createLoginLink(freelancer.stripe_account_id);
        loginUrl = link.url;
      } catch (e) {
        console.error("login link error:", e);
      }
    }

    return new Response(
      JSON.stringify({
        connected: true,
        accountId: account.id,
        payoutsEnabled,
        chargesEnabled,
        detailsSubmitted,
        requirements: account.requirements?.currently_due ?? [],
        loginUrl,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("stripe-connect-status error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
