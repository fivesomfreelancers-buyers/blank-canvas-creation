// Scheduled deadline processor for Fivesom orders.
//
// Runs every 5 minutes via pg_cron (net.http_post with the shared hook secret).
// Two idempotent passes:
//   1. One-hour reminder: orders whose delivery_deadline is within the next hour,
//      still active, and not yet reminded -> claim deadline_reminder_sent_at, email freelancer.
//   2. Overdue: active orders past their deadline, not yet flagged -> claim overdue_at,
//      email freelancer + buyer + all admin/super_admin/founder users.
// Orders are NEVER cancelled automatically — Admin/Founder decides.

import { createClient } from "npm:@supabase/supabase-js@2.57.2";

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

async function sendEmail(to: string, subject: string, html: string) {
  const lovableKey = Deno.env.get("LOVABLE_API_KEY");
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!lovableKey || !resendKey) throw new Error("Email service not configured");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${lovableKey}`,
      "x-api-key": resendKey,
    },
    body: JSON.stringify({ from: FROM, to, subject, html }),
  });
  if (!res.ok) throw new Error(`Email send failed: ${res.status} ${await res.text()}`);
}

const fmt = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short", timeZone: "UTC" }) + " UTC";

const emailShell = (title: string, bodyHtml: string, ctaUrl: string, ctaLabel: string) => `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;background:#0B0E14;color:#E2E8F0;border-radius:12px">
    <h2 style="color:#00A3FF;margin:0 0 16px">${title}</h2>
    <div style="line-height:1.6">${bodyHtml}</div>
    <a href="${ctaUrl}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:linear-gradient(90deg,#007BFF,#00CCFF);color:#fff;text-decoration:none;border-radius:8px;font-weight:bold">${ctaLabel}</a>
    <p style="margin-top:24px;font-size:12px;color:#7aa7c4">Fivesom — Hire Skilled African Freelancers</p>
  </div>`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const hookSecret = Deno.env.get("MESSAGE_EMAIL_HOOK_SECRET");
    if (!hookSecret || req.headers.get("x-hook-secret") !== hookSecret) {
      return json({ error: "Unauthorized" }, 401);
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );

    const now = new Date();
    const inOneHour = new Date(now.getTime() + 60 * 60 * 1000);
    const ACTIVE = ["pending", "in_progress"];
    let reminders = 0;
    let overdue = 0;

    // ---- Pass 1: one-hour reminders (claim first, then email — idempotent) ----
    const { data: dueSoon, error: dueErr } = await admin
      .from("orders")
      .select("id, package_name, delivery_deadline, freelancer_id, gigs(title), freelancers(user_id)")
      .in("status", ACTIVE)
      .is("deadline_reminder_sent_at", null)
      .not("delivery_deadline", "is", null)
      .lte("delivery_deadline", inOneHour.toISOString())
      .gt("delivery_deadline", now.toISOString());
    if (dueErr) throw dueErr;

    for (const order of dueSoon || []) {
      // Claim the reminder atomically; skip if another run got there first.
      const { data: claimed } = await admin
        .from("orders")
        .update({ deadline_reminder_sent_at: now.toISOString() })
        .eq("id", order.id)
        .is("deadline_reminder_sent_at", null)
        .select("id");
      if (!claimed || claimed.length === 0) continue;

      const freelancerUserId = (order as any).freelancers?.user_id;
      if (!freelancerUserId) continue;
      const { data: profile } = await admin
        .from("profiles").select("email, full_name").eq("id", freelancerUserId).maybeSingle();
      if (!profile?.email) continue;

      const title = (order as any).gigs?.title || "your order";
      await sendEmail(
        profile.email,
        "Reminder: Your Fivesom Order Deadline Is in 1 Hour",
        emailShell(
          "⏳ Deadline in 1 hour",
          `<p>Hello ${profile.full_name || "there"},</p>
           <p>Your order <strong>${title}</strong> is approaching its delivery deadline.</p>
           <p>Package: <strong>${order.package_name || "—"}</strong><br/>
           Time remaining: approximately <strong>1 hour</strong>.<br/>
           Deadline: <strong>${fmt(order.delivery_deadline)}</strong></p>
           <p>Please submit your completed work before the deadline.</p>
           <p><strong>Important:</strong> If you miss the deadline, the order will be reviewed by the Fivesom Admin/Founder team.</p>`,
          `${SITE_URL}/freelancer/orders`,
          "Open Order and Deliver Work",
        ),
      );
      reminders++;
    }

    // ---- Pass 2: overdue detection (claim first, then notify) ----
    const { data: late, error: lateErr } = await admin
      .from("orders")
      .select("id, package_name, amount, delivery_deadline, buyer_id, freelancer_id, gigs(title), freelancers(user_id)")
      .in("status", ACTIVE)
      .is("overdue_at", null)
      .not("delivery_deadline", "is", null)
      .lt("delivery_deadline", now.toISOString());
    if (lateErr) throw lateErr;

    for (const order of late || []) {
      const { data: claimed } = await admin
        .from("orders")
        .update({ overdue_at: now.toISOString() })
        .eq("id", order.id)
        .is("overdue_at", null)
        .select("id");
      if (!claimed || claimed.length === 0) continue;

      const title = (order as any).gigs?.title || "Order";
      const freelancerUserId = (order as any).freelancers?.user_id;
      const recipients: { email: string; name: string; role: "freelancer" | "buyer" | "admin" }[] = [];

      const { data: fProfile } = freelancerUserId
        ? await admin.from("profiles").select("email, full_name").eq("id", freelancerUserId).maybeSingle()
        : { data: null };
      if (fProfile?.email) recipients.push({ email: fProfile.email, name: fProfile.full_name || "there", role: "freelancer" });

      const { data: bProfile } = await admin
        .from("profiles").select("email, full_name").eq("id", order.buyer_id).maybeSingle();
      if (bProfile?.email) recipients.push({ email: bProfile.email, name: bProfile.full_name || "there", role: "buyer" });

      const { data: adminRoles } = await admin
        .from("user_roles").select("user_id").in("role", ["admin", "super_admin", "founder"]);
      if (adminRoles?.length) {
        const { data: adminProfiles } = await admin
          .from("profiles").select("email, full_name")
          .in("id", adminRoles.map((r: any) => r.user_id));
        for (const p of adminProfiles || []) {
          if (p.email) recipients.push({ email: p.email, name: p.full_name || "Admin", role: "admin" });
        }
      }

      for (const r of recipients) {
        const isAdmin = r.role === "admin";
        const body = isAdmin
          ? `<p>Hello ${r.name},</p>
             <p>Order <strong>${title}</strong> (${order.id}) has missed its delivery deadline and needs review.</p>
             <p>Package: <strong>${order.package_name || "—"}</strong> · Amount: <strong>$${Number(order.amount).toFixed(2)}</strong><br/>
             Original deadline: <strong>${fmt(order.delivery_deadline)}</strong></p>
             <p>The order has NOT been cancelled automatically. Please review it and decide the next step.</p>`
          : r.role === "freelancer"
            ? `<p>Hello ${r.name},</p>
               <p>Your order <strong>${title}</strong> has passed its delivery deadline (${fmt(order.delivery_deadline)}).</p>
               <p>Please deliver as soon as possible. The Fivesom team has been notified and may review the order.</p>`
            : `<p>Hello ${r.name},</p>
               <p>Your order <strong>${title}</strong> has passed its expected delivery time (${fmt(order.delivery_deadline)}).</p>
               <p>We are sorry for the delay. The Fivesom team has been notified and will review the order. You can also open a dispute from your order page if you prefer.</p>`;
        await sendEmail(
          r.email,
          isAdmin ? `Overdue order needs review: ${title}` : `Order deadline passed: ${title}`,
          emailShell(
            "⚠️ Deadline missed",
            body,
            isAdmin ? `${SITE_URL}/admin` : r.role === "freelancer" ? `${SITE_URL}/freelancer/orders` : `${SITE_URL}/buyer/orders`,
            isAdmin ? "Review Overdue Orders" : "Open My Orders",
          ),
        );
      }
      overdue++;
    }

    return json({ ok: true, reminders, overdue, ran_at: now.toISOString() });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});
