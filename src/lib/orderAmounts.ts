/**
 * Single source of truth for order money math.
 *
 * A buyer pays: gig price + BUYER_SERVICE_FEE.
 * The freelancer earns only the gig price — the buyer service fee belongs to Fivesom
 * and must never reach a freelancer's wallet, earnings or withdrawal balance.
 */
export const BUYER_SERVICE_FEE = 1;

/** Percentage Fivesom keeps from a freelancer's gig earnings on withdrawal. */
export const FIVESOM_FEE_PERCENT = 15;

export interface OrderAmountRow {
  amount: number | string | null;
  buyer_service_fee?: number | string | null;
  freelancer_earnings?: number | string | null;
}

/** What the buyer paid in total (gig price + buyer service fee). */
export function buyerTotal(order: OrderAmountRow): number {
  return Number(order.amount || 0);
}

/** The buyer service fee kept by Fivesom for this order. */
export function serviceFee(order: OrderAmountRow): number {
  return Number(order.buyer_service_fee || 0);
}

/** What the freelancer actually earns from this order (gig price only). */
export function freelancerEarnings(order: OrderAmountRow): number {
  if (order.freelancer_earnings != null) return Number(order.freelancer_earnings);
  return Math.max(0, buyerTotal(order) - serviceFee(order));
}

/** Sum of freelancer earnings across orders. */
export function sumFreelancerEarnings(orders: OrderAmountRow[]): number {
  return orders.reduce((s, o) => s + freelancerEarnings(o), 0);
}

/** Withdrawal breakdown from a freelancer's available (gig-earnings-only) balance. */
export function withdrawalBreakdown(balance: number) {
  const gross = Math.max(0, Number(balance) || 0);
  const fee = Math.round(gross * FIVESOM_FEE_PERCENT) / 100;
  return { gross, fee, net: Math.round((gross - fee) * 100) / 100 };
}
