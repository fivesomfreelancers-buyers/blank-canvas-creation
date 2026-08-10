// Sends a "new message" email through Resend (Lovable connector gateway).
//
// Called by a database trigger on public.messages (via pg_net) right after a
// message row is inserted. Requests must carry the shared hook secret.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildMessageNotificationEmail } from "../_shared/message-email.ts";

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
      .from("messages")
      .select("id, sender_id, receiver_id, message, created_at, is_read, conversation_id")
      .eq("id", messageId)
      .maybeSingle();
    if (msgErr) throw msgErr;
    if (!msg) return json({ skipped: "message_not_found" });
    if (msg.sender_id === msg.receiver_id) return json({ skipped: "self_message" });
    if (msg.is_read) return json({ skipped: "already_read" });

    const { data: people, error: peopleErr } = await admin
      .from("profiles")
      .select("id, full_name, email, profile_image_url, role")
      .in("id", [msg.sender_id, msg.receiver_id]);
    if (peopleErr) throw peopleErr;

    const sender = people?.find((p: any) => p.id === msg.sender_id);
    const receiver = people?.find((p: any) => p.id === msg.receiver_id);

    let to = receiver?.email as string | undefined;
    if (!to) {
      const { data: authUser } = await admin.auth.admin.getUserById(msg.receiver_id);
      to = authUser?.user?.email ?? undefined;
    }
    if (!to) return json({ skipped: "no_recipient_email" });

    const html = buildMessageNotificationEmail({
      senderName: sender?.full_name || "Fivesom Member",
      senderRole: sender?.role === "freelancer" ? "freelancer" : "buyer",
      messageText: String(msg.message ?? "").slice(0, 600),
      sentAt: msg.created_at ?? new Date(),
      senderAvatarUrl: sender?.profile_image_url ?? null,
      replyUrl: message.conversation_id
        ? `${SITE_URL}/messages?c=${message.conversation_id}`
        : `${SITE_URL}/messages`,
      siteUrl: SITE_URL,
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
        subject: `New message from ${sender?.full_name || "a Fivesom member"}`,
        html,
      }),
    });

    if (!res.ok) {
      const details = await res.text();
      console.error(`Resend request failed [${res.status}]: ${details}`);
      return json({ error: "Email provider request failed", status: res.status, details }, res.status);
    }

    const sent = await res.json().catch(() => ({}));
    return json({ sent: true, id: (sent as any)?.id ?? null });
  } catch (err) {
    console.error("send-message-email error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
