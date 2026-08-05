// Shared request throttling for edge functions.
//
// Counting lives in the database (public.check_rate_limit) so limits hold across
// every isolate/region instead of per-instance memory.

import type { SupabaseClient } from "npm:@supabase/supabase-js@2.57.2";

export type RateLimitResult = {
  allowed: boolean;
  retryAfter: number;
};

/**
 * Consumes one slot for `subject` in `bucket`. Fails open (allowed) if the
 * limiter itself errors — a limiter outage must never block real payments.
 */
export async function consumeRateLimit(
  admin: SupabaseClient,
  bucket: string,
  subject: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  try {
    const { data, error } = await admin.rpc("check_rate_limit", {
      _bucket: bucket,
      _limit: limit,
      _window_seconds: windowSeconds,
      _subject: subject,
    });
    if (error) {
      console.error("rate limiter error:", error.message);
      return { allowed: true, retryAfter: 0 };
    }
    const res = (data ?? {}) as { allowed?: boolean; retry_after?: number };
    return {
      allowed: res.allowed !== false,
      retryAfter: Number(res.retry_after ?? 0),
    };
  } catch (err) {
    console.error("rate limiter exception:", err);
    return { allowed: true, retryAfter: 0 };
  }
}

/** Best-effort caller IP, used to throttle unauthenticated endpoints. */
export function callerIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for") ?? "";
  const first = fwd.split(",")[0]?.trim();
  return first || req.headers.get("cf-connecting-ip") || "unknown";
}

export function tooManyRequests(retryAfter: number, corsHeaders: Record<string, string>) {
  return new Response(
    JSON.stringify({
      error: `Too many requests. Please wait ${Math.max(retryAfter, 1)} seconds and try again.`,
      retryAfter: Math.max(retryAfter, 1),
    }),
    {
      status: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(Math.max(retryAfter, 1)),
      },
    },
  );
}
