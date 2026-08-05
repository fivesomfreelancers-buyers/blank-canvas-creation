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
    if (userErr || !user?.email) throw new Error("User not authenticated");

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    // Throttle: per-user cap on this endpoint.
    const rl = await consumeRateLimit(admin, "fn:connect-onboard", user.id, 10, 3600);
    if (!rl.allowed) return tooManyRequests(rl.retryAfter, corsHeaders);

    const { data: freelancer, error: fErr } = await admin
      .from("freelancers")
      .select("id, stripe_account_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (fErr) throw fErr;
    if (!freelancer) throw new Error("Freelancer account not found");

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let accountId = freelancer.stripe_account_id as string | null;

    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        business_type: "individual",
        capabilities: {
          transfers: { requested: true },
        },
        metadata: { fivesom_user_id: user.id, fivesom_freelancer_id: freelancer.id },
      });
      accountId = account.id;
      const { error: updErr } = await admin
        .from("freelancers")
        .update({ stripe_account_id: accountId })
        .eq("id", freelancer.id);
      if (updErr) throw updErr;
    }

    const origin = req.headers.get("origin") ?? "";
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      type: "account_onboarding",
      refresh_url: `${origin}/freelancer/payouts?refresh=1`,
      return_url: `${origin}/freelancer/payouts?done=1`,
    });

    return new Response(JSON.stringify({ url: accountLink.url, accountId }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("stripe-connect-onboard error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
