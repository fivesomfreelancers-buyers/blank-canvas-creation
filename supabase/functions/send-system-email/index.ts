// Emails a user when Fivesom Support replies or Fivesom News broadcasts.
//
// Invoked by a database trigger on public.system_messages (via pg_net) for
// admin/system messages. Requests must carry the shared hook secret.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildSystemNotificationEmail, systemEmailSubject } from "../_shared/system-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hook-secret",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const SITE_URL = "https://fivesom.net";
const FROM = "Fivesom <noreply@fivesom.com>";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const hookSecret = Deno.env.get("MESSAGE_EMAIL_HOOK_SECRET");
    if (!hookSecret || req.headers.get("x-hook-secret") !== hookSecret) {
      return json({ error: "Unauthorized" }, 401);
    }

    const lovableKey = Deno.env.get("LOVABLE_API_KEY");
    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!lovableKey || !resendKey) return json({ error: "Email service not configured" }, 500);

    const payload = await req.json().catch(() => ({}));
    const messageId: string | undefined = payload?.message_id ?? payload?.record?.id;
    if (!messageId || typeof messageId !== "string") {
      return json({ error: "message_id is required" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const { data: msg, error: msgErr } = await admin
      .from("system_messages")
      .select("id, conversation_id, sender_type, body, attachment_url, created_at, is_read_user")
      .eq("id", messageId)
      .maybeSingle();
    if (msgErr) throw msgErr;
    if (!msg) return json({ skipped: "message_not_found" });
    if (msg.sender_type === "user") return json({ skipped: "user_message" });
    if (msg.is_read_user) return json({ skipped: "already_read" });

    const { data: convo, error: convoErr } = await admin
      .from("system_conversations")
      .select("id, user_id, type")
      .eq("id", msg.conversation_id)
      .maybeSingle();
    if (convoErr) throw convoErr;
    if (!convo) return json({ skipped: "conversation_not_found" });

    const channel = convo.type === "news" ? "news" : "support";

    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, email")
      .eq("id", convo.user_id)
      .maybeSingle();

    let to = (profile?.email as string | undefined) ?? undefined;
    if (!to) {
      const { data: authUser } = await admin.auth.admin.getUserById(convo.user_id);
      to = authUser?.user?.email ?? undefined;
    }
    if (!to) return json({ skipped: "no_recipient_email" });

    const html = buildSystemNotificationEmail({
      channel,
      messageText: String(msg.body ?? "").slice(0, 1200),
      attachmentUrl: msg.attachment_url ?? null,
      sentAt: msg.created_at ?? new Date(),
      ctaUrl: `${SITE_URL}/messages?c=${convo.id}`,
      siteUrl: SITE_URL,
      recipientName: profile?.full_name ?? null,
    });

    const res = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: systemEmailSubject(channel),
        html,
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`Resend request failed [${res.status}]: ${details}`);
      return json({ error: "Email provider request failed", status: res.status, details }, res.status);
    }

    const sent = await res.json().catch(() => ({}));
    return json({ sent: true, channel, id: (sent as any)?.id ?? null });
  } catch (err) {
    console.error("send-system-email error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
