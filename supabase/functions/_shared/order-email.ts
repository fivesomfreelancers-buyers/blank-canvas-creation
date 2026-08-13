/**
 * Fivesom order + delivery notification emails (English).
 *
 * - kind 'new_order'  -> sent to the freelancer when a paid order arrives.
 * - kind 'delivery'   -> sent to the buyer when the freelancer delivers work.
 *
 * Table-based, inline-styled HTML. Single call-to-action button, no raw link.
 */

import { socialRow } from './email-social.ts';

export type OrderEmailKind = 'new_order' | 'delivery';

export interface OrderEmailParams {
  kind: OrderEmailKind;
  /** Recipient first name for the greeting. */
  recipientName?: string | null;
  /** The other party's name (buyer for new_order, freelancer for delivery). */
  counterpartName?: string | null;
  gigTitle?: string | null;
  packageName?: string | null;
  amount?: number | string | null;
  /** Short note: buyer requirements or delivery message. */
  note?: string | null;
  sentAt?: Date | string;
  /** Deep link opened by the single button. */
  ctaUrl: string;
  siteUrl?: string;
}

const BLUE = '#1877F2';
const NAVY = '#0B1B3A';
const TEXT = '#3d4046';
const MUTED = '#6b7280';
const BORDER = '#e6e9ef';
const CARD = '#f7f9fc';
const GREEN = '#0f8f5f';

const esc = (v: string) =>
  v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatSentAt = (value?: Date | string) => {
  const d = value ? new Date(value) : new Date();
  if (Number.isNaN(d.getTime())) return '';
  const date = d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return `${date} &middot; ${time}`;
};

const trustCell = (icon: string, title: string, sub: string) => `
  <td width="25%" valign="top" style="padding:0 10px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
    <div style="font-size:22px;line-height:26px;color:${BLUE};">${icon}</div>
    <div style="font-size:13px;font-weight:700;color:${NAVY};padding-top:6px;">${title}</div>
    <div style="font-size:12px;color:${MUTED};padding-top:3px;line-height:17px;">${sub}</div>
  </td>`;

const row = (label: string, value: string) => `
  <tr>
    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};width:40%;">${label}</td>
    <td style="padding:6px 0;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;color:${NAVY};">${value}</td>
  </tr>`;

export function orderEmailSubject(kind: OrderEmailKind, gigTitle?: string | null): string {
  const title = gigTitle ? ` — ${gigTitle}` : '';
  return kind === 'new_order'
    ? `New order received${title}`
    : `Your order has been delivered${title}`;
}

export function buildOrderEventEmail({
  kind,
  recipientName,
  counterpartName,
  gigTitle,
  packageName,
  amount,
  note,
  sentAt,
  ctaUrl,
  siteUrl = 'https://fivesom.net',
}: OrderEmailParams): string {
  const isOrder = kind === 'new_order';
  const logo = `${siteUrl}/email-logo.png`;
  const first = recipientName ? esc(String(recipientName).split(' ')[0]) : null;
  const other = counterpartName ? esc(counterpartName) : isOrder ? 'A buyer' : 'Your freelancer';
  const icon = isOrder ? '&#128230;' : '&#127881;';
  const accent = isOrder ? BLUE : GREEN;

  const heading = isOrder
    ? `New Order on <span style="color:${BLUE};">Fivesom!</span>`
    : `Your Work Has Been <span style="color:${GREEN};">Delivered!</span>`;

  const intro = isOrder
    ? `${other} just placed a paid order with you. Please review the details and start working on it.`
    : `${other} has delivered the work for your order. Please review it and accept the delivery if you are happy.`;

  const amountText =
    amount === null || amount === undefined || amount === ''
      ? null
      : `$${Number(amount).toFixed(2)}`;

  const details = [
    gigTitle ? row('Service', esc(gigTitle)) : '',
    packageName ? row('Package', esc(packageName)) : '',
    amountText ? row(isOrder ? 'Order amount' : 'Order total', amountText) : '',
    row(isOrder ? 'Buyer' : 'Freelancer', other),
  ]
    .filter(Boolean)
    .join('');

  const noteBlock = note
    ? `<tr><td style="padding:0 20px;"><div style="height:1px;background:${BORDER};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
       <tr>
         <td style="padding:14px 20px 18px 20px;font-family:Arial,Helvetica,sans-serif;">
           <div style="font-size:14px;font-weight:700;color:${NAVY};">${isOrder ? '&#128221; Buyer note:' : '&#128172; Delivery note:'}</div>
           <div style="font-size:14px;line-height:23px;color:${TEXT};padding:8px 0 0 2px;">${esc(note).replace(/\n/g, '<br />')}</div>
         </td>
       </tr>`
    : '';

  const cta = isOrder ? '&#128230;&nbsp; View the order' : '&#127873;&nbsp; Review the delivery';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${isOrder ? 'New order on Fivesom' : 'Your order has been delivered'}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f8;">
<div style="display:none;font-size:1px;color:#eef2f8;max-height:0;overflow:hidden;">${intro}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f8;padding:28px 12px;">
<tr><td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(11,27,58,0.07);">

  <tr>
    <td align="center" style="padding:34px 32px 10px 32px;">
      <a href="${siteUrl}" style="text-decoration:none;">
        <img src="${logo}" width="210" alt="FIVESOM" style="display:block;width:210px;max-width:70%;height:auto;border:0;" />
      </a>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;font-weight:700;color:${NAVY};padding-top:10px;">CONNECT &bull; CREATE &bull; EARN</div>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:24px 32px 0 32px;">
      <div style="width:88px;height:88px;background:${isOrder ? '#eaf2ff' : '#e6f7ef'};border-radius:999px;text-align:center;font-size:38px;line-height:88px;">${icon}</div>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:18px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;">
      <h1 style="margin:0;font-size:30px;line-height:38px;font-weight:800;color:${NAVY};">${heading}</h1>
      <p style="margin:22px 0 0 0;font-size:15px;font-weight:700;color:${NAVY};">Hi${first ? ` ${first}` : ''},</p>
      <p style="margin:8px 0 0 0;font-size:15px;line-height:24px;color:${TEXT};">${intro}</p>
    </td>
  </tr>

  <tr>
    <td style="padding:26px 32px 0 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CARD};border:1px solid ${BORDER};border-radius:14px;">
        <tr>
          <td style="padding:16px 20px 14px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${details}</table>
            <div style="font-family:Arial,Helvetica,sans-serif;font-size:12px;color:${MUTED};padding-top:12px;">&#128337; ${formatSentAt(sentAt)}</div>
          </td>
        </tr>
        ${noteBlock}
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:28px 32px 0 32px;">
      <a href="${ctaUrl}" style="display:inline-block;background:${accent};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;text-decoration:none;padding:16px 42px;border-radius:12px;">${cta} &nbsp;&#10132;</a>
    </td>
  </tr>

  <tr><td style="padding:26px 32px 0 32px;"><div style="height:1px;background:${BORDER};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
  <tr>
    <td style="padding:20px 22px 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        ${trustCell('&#128737;&#65039;', 'Secure Escrow', 'Payments protected')}
        ${trustCell('&#128100;', 'Verified Users', 'Trusted members')}
        ${trustCell('&#128274;', 'Safe Payments', 'Encrypted checkout')}
        ${trustCell('&#127758;', 'Worldwide', 'Global marketplace')}
      </tr></table>
    </td>
  </tr>

  <tr><td style="padding:24px 32px 0 32px;"><div style="height:1px;background:${BORDER};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
  <tr>
    <td align="center" style="padding:20px 32px 30px 32px;font-family:Arial,Helvetica,sans-serif;">
      <img src="${logo}" width="130" alt="FIVESOM" style="display:block;width:130px;height:auto;border:0;margin:0 auto;" />
      <div style="padding-top:14px;">${socialRow()}</div>
      <p style="margin:14px 0 0 0;font-size:12px;line-height:19px;color:${MUTED};">You are receiving this email because you have a Fivesom account.</p>
      <p style="margin:10px 0 0 0;font-size:11px;color:${MUTED};">&copy; ${new Date().getFullYear()} FIVESOM. All rights reserved.</p>
    </td>
  </tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}
