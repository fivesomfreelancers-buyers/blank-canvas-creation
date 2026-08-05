import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { callerIp, consumeRateLimit, tooManyRequests } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false } },
);

// Returns the Stripe publishable key (safe to expose to the browser).
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Unauthenticated endpoint — throttle per caller IP against flooding.
  const rl = await consumeRateLimit(admin, "fn:public-config", `ip:${callerIp(req)}`, 60, 60);
  if (!rl.allowed) return tooManyRequests(rl.retryAfter, corsHeaders);

  const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY") ?? "";

  return new Response(JSON.stringify({ publishableKey }), {
    status: 200,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      // Let the CDN absorb repeat traffic instead of the function.
      "Cache-Control": "public, max-age=300",
    },
  });
});
