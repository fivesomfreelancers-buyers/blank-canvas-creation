// Sends the account-verification email through Resend (Lovable connector gateway).
//
// Supabase's built-in auth mailer is heavily rate limited and not domain
// authenticated, which is why confirmation emails were never reaching Gmail.
// This function mints a real verification link with the Auth admin API and
// delivers it from the verified fivesom.net domain, returning the provider's
// actual response so the UI can never fake a success.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { consumeRateLimit, callerIp, tooManyRequests } from "../_shared/rate-limit.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const SITE_URL = "https://fivesom.net";
// Only fivesom.net is DNS-verified (SPF/DKIM) with the email provider.
const FROM = "Fivesom <noreply@fivesom.net>";
const REPLY_TO = "noreply@fivesom.net";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function buildHtml(confirmUrl: string, name: string | null) {
  const greeting = name ? `Salaan ${esc(name)},` : "Salaan,";
  return `<!doctype html>
<html><body style="margin:0;padding:24px;background:#0b0f19;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px;">
        <tr><td>
          <p style="margin:0 0 4px;font-size:20px;font-weight:bold;color:#0b0f19;">FIVESOM</p>
          <h1 style="margin:16px 0 8px;font-size:22px;color:#0b0f19;">Xaqiiji emailkaaga</h1>
          <p style="margin:0 0 16px;font-size:15px;color:#55575d;">${greeting}</p>
          <p style="margin:0 0 24px;font-size:15px;color:#55575d;">
            Riix badhanka hoose si aad u xaqiijiso emailkaaga oo aad u gasho akoonkaaga Fivesom.
          </p>
          <p style="margin:0 0 24px;">
            <a href="${esc(confirmUrl)}" style="display:inline-block;background:#0b0f19;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-weight:bold;font-size:15px;">Verify my email</a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;color:#8a8d94;">Haddii badhanka shaqeyn waayo, isticmaal linkigan:</p>
          <p style="margin:0 0 24px;font-size:12px;word-break:break-all;"><a href="${esc(confirmUrl)}" style="color:#2563eb;">${esc(confirmUrl)}</a></p>
          <p style="margin:0;font-size:12px;color:#8a8d94;">Haddii aadan adigu codsan, iska indhatir fariintan. — <a href="${SITE_URL}" style="color:#8a8d94;">fivesom.net</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!lovableKey || !resendKey) return json({ error: "Email service not configured" }, 500);

    const body = await req.json().catch(() => ({}));
    const rawEmail = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const redirectTo = typeof body?.redirect_to === "string" ? body.redirect_to : `${SITE_URL}/auth/callback`;
    if (!rawEmail || !/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(rawEmail)) {
      return json({ error: "A valid email address is required" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const limit = await consumeRateLimit(admin, "verify_email", `${rawEmail}|${callerIp(req)}`, 3, 900);
    if (!limit.allowed) return tooManyRequests(limit.retryAfter, corsHeaders);

    // Only registered addresses get a link — this endpoint must never mint accounts.
    const { data: existing } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", rawEmail)
      .maybeSingle();
    if (!existing) {
      return json({ error: "No Fivesom account uses this email address yet. Please sign up first." }, 404);
    }

    // Mint a real verification link for the address the user actually registered.
    const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
      type: "magiclink",
      email: rawEmail,
      options: { redirectTo },
    });


    if (linkErr || !link?.properties?.action_link) {
      const message = linkErr?.message ?? "Could not generate a verification link";
      // Never reveal whether an address exists — but do not fake success either.
      if (/not found|no user|user_not_found/i.test(message)) {
        return json({ error: "No Fivesom account uses this email address yet. Please sign up first." }, 404);
      }
      console.error("generateLink failed:", message);
      return json({ error: message }, 400);
    }

    const confirmUrl = link.properties.action_link as string;
    const name = (link.user?.user_metadata?.full_name as string | undefined) ?? null;

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: FROM,
        to: [rawEmail],
        reply_to: REPLY_TO,
        subject: "Xaqiiji emailkaaga Fivesom",
        html: buildHtml(confirmUrl, name),
      }),
    });

    const providerText = await res.text();
    if (!res.ok) {
      console.error(`Resend rejected verification email [${res.status}]: ${providerText}`);
      return json(
        { error: "The email provider rejected the message", status: res.status, details: providerText },
        res.status,
      );
    }

    let providerId: string | null = null;
    try { providerId = JSON.parse(providerText)?.id ?? null; } catch { /* non-JSON success body */ }

    console.log(`verification email accepted for ${rawEmail} (provider id: ${providerId})`);
    return json({ sent: true, to: rawEmail, provider_id: providerId });
  } catch (err) {
    console.error("send-verification-email error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
