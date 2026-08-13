// Sends "new order" (to freelancer) and "work delivered" (to buyer) emails
// through Resend (Lovable connector gateway).
//
// Called by database triggers via pg_net. Requests must carry the shared hook secret.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { buildOrderEventEmail, orderEmailSubject } from "../_shared/order-email.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-hook-secret",
};

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";
const SITE_URL = "https://fivesom.net";
const FROM = "Fivesom <noreply@fivesom.net>";

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
    const kind: string = payload?.kind;
    if (kind !== "new_order" && kind !== "delivery") {
      return json({ error: "kind must be new_order or delivery" }, 400);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    let orderId: string | undefined = payload?.order_id;
    let note: string | null = null;
    let sentAt: string | null = null;

    if (kind === "delivery") {
      const deliveryId: string | undefined = payload?.delivery_id;
      if (!deliveryId) return json({ error: "delivery_id is required" }, 400);
      const { data: delivery, error } = await admin
        .from("order_deliveries")
        .select("id, order_id, delivery_message, delivered_at, created_at")
        .eq("id", deliveryId)
        .maybeSingle();
      if (error) throw error;
      if (!delivery) return json({ skipped: "delivery_not_found" });
      orderId = delivery.order_id as string;
      note = (delivery.delivery_message as string | null) ?? null;
      sentAt = (delivery.delivered_at as string | null) ?? (delivery.created_at as string | null);
    }

    if (!orderId) return json({ error: "order_id is required" }, 400);

    const { data: order, error: orderErr } = await admin
      .from("orders")
      .select("id, buyer_id, freelancer_id, gig_id, amount, package_name, requirements, created_at, gigs(title)")
      .eq("id", orderId)
      .maybeSingle();
    if (orderErr) throw orderErr;
    if (!order) return json({ skipped: "order_not_found" });

    // Freelancer row -> user id
    const { data: freelancer } = await admin
      .from("freelancers")
      .select("id, user_id")
      .eq("id", order.freelancer_id)
      .maybeSingle();
    const freelancerUserId = freelancer?.user_id as string | undefined;

    const ids = [order.buyer_id, freelancerUserId].filter(Boolean) as string[];
    const { data: people } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("id", ids);

    const buyer = people?.find((p: any) => p.id === order.buyer_id);
    const seller = people?.find((p: any) => p.id === freelancerUserId);

    const isOrder = kind === "new_order";
    const recipientId = isOrder ? freelancerUserId : (order.buyer_id as string);
    const recipient = isOrder ? seller : buyer;
    const counterpart = isOrder ? buyer : seller;

    let to = recipient?.email as string | undefined;
    if (!to && recipientId) {
      const { data: authUser } = await admin.auth.admin.getUserById(recipientId);
      to = authUser?.user?.email ?? undefined;
    }
    if (!to) return json({ skipped: "no_recipient_email" });

    const gigTitle = (order as any)?.gigs?.title ?? null;

    const html = buildOrderEventEmail({
      kind: isOrder ? "new_order" : "delivery",
      recipientName: recipient?.full_name ?? null,
      counterpartName: counterpart?.full_name ?? null,
      gigTitle,
      packageName: (order.package_name as string | null) ?? null,
      amount: order.amount as number | null,
      note: isOrder ? ((order.requirements as string | null) ?? null) : note,
      sentAt: sentAt ?? (order.created_at as string) ?? new Date().toISOString(),
      ctaUrl: isOrder
        ? `${SITE_URL}/freelancer/order/${order.id}`
        : `${SITE_URL}/buyer/order/${order.id}`,
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
        subject: orderEmailSubject(isOrder ? "new_order" : "delivery", gigTitle),
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
    console.error("send-order-email error:", err);
    return json({ error: err instanceof Error ? err.message : "Unexpected error" }, 500);
  }
});
