// Orders are created ONLY after Stripe confirms a successful payment.
// Both `verify-order-payment` (client-triggered) and `stripe-webhook` (Stripe-triggered)
// call this helper, so the creation is idempotent no matter which one arrives first.

export interface PaymentOrderMeta {
  gig_id?: string;
  buyer_id?: string;
  freelancer_id?: string;
  package_name?: string;
  amount_usd?: string;
  payout_mode?: string;
}

interface EnsureArgs {
  admin: any;
  meta: PaymentOrderMeta | Record<string, string> | null | undefined;
  paymentIntentId?: string | null;
  sessionId?: string | null;
}

/**
 * Returns the id of the paid order for this payment, creating it if it does not exist yet.
 * Returns null when the payment carries no Fivesom order metadata.
 */
export async function ensurePaidOrder({ admin, meta, paymentIntentId, sessionId }: EnsureArgs): Promise<string | null> {
  // 1. Already created?
  if (paymentIntentId) {
    const { data } = await admin
      .from("orders")
      .select("id")
      .eq("stripe_payment_intent_id", paymentIntentId)
      .maybeSingle();
    if (data?.id) {
      await admin
        .from("orders")
        .update({ payment_status: "paid", stripe_session_id: sessionId ?? undefined })
        .eq("id", data.id);
      return data.id;
    }
  }
  if (sessionId) {
    const { data } = await admin
      .from("orders")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();
    if (data?.id) {
      await admin
        .from("orders")
        .update({ payment_status: "paid", stripe_payment_intent_id: paymentIntentId ?? undefined })
        .eq("id", data.id);
      return data.id;
    }
  }

  // 2. Create from payment metadata.
  const m = (meta ?? {}) as PaymentOrderMeta;
  if (!m.gig_id || !m.buyer_id || !m.freelancer_id) return null;

  const amount = Number(m.amount_usd ?? 0);
  const { data: created, error } = await admin
    .from("orders")
    .insert({
      buyer_id: m.buyer_id,
      freelancer_id: m.freelancer_id,
      gig_id: m.gig_id,
      amount: amount,
      status: "pending",
      payment_method: "stripe",
      payment_status: "paid",
      package_name: m.package_name ?? null,
      payout_mode: m.payout_mode ?? "wallet",
      stripe_payment_intent_id: paymentIntentId ?? null,
      stripe_session_id: sessionId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    // Unique index race (webhook + client verify arriving at the same time):
    // the order already exists for this payment — return it instead of duplicating.
    if ((error as { code?: string }).code === "23505") {
      if (paymentIntentId) {
        const { data } = await admin
          .from("orders")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntentId)
          .maybeSingle();
        if (data?.id) return data.id as string;
      }
      if (sessionId) {
        const { data } = await admin
          .from("orders")
          .select("id")
          .eq("stripe_session_id", sessionId)
          .maybeSingle();
        if (data?.id) return data.id as string;
      }
    }
    throw error;
  }
  return created.id as string;
}
