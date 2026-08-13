/**
 * Fivesom "Support / News" notification email.
 *
 * Table-based, inline-styled HTML so it renders the same in Gmail, Outlook,
 * Apple Mail and mobile clients.
 */

import { socialRow } from './email-social.ts';

export type SystemChannel = 'support' | 'news';

export interface SystemNotificationEmailParams {
  channel: SystemChannel;
  /** Message body written by the admin / system. */
  messageText: string;
  /** Optional attachment image URL (absolute, public). */
  attachmentUrl?: string | null;
  sentAt?: Date | string;
  /** Deep link back into the app. */
  ctaUrl?: string;
  siteUrl?: string;
  /** Recipient first name, used in the greeting. */
  recipientName?: string | null;
}

const BLUE = '#1877F2';
const NAVY = '#0B1B3A';
const TEXT = '#3d4046';
const MUTED = '#6b7280';
const BORDER = '#e6e9ef';
const CARD = '#f7f9fc';

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

export function systemEmailSubject(channel: SystemChannel): string {
  return channel === 'news'
    ? 'Fivesom News — a new announcement'
    : 'Fivesom Support replied to you';
}

export function buildSystemNotificationEmail({
  channel,
  messageText,
  attachmentUrl,
  sentAt,
  ctaUrl,
  siteUrl = 'https://fivesom.net',
  recipientName,
}: SystemNotificationEmailParams): string {
  const isNews = channel === 'news';
  const sender = isNews ? 'Fivesom News' : 'Fivesom Support';
  const icon = isNews ? '&#128226;' : '&#127911;';
  const heading = isNews ? 'New announcement<br />from ' : 'New reply from<br />';
  const intro = isNews
    ? 'Fivesom has published a new announcement for the community.'
    : 'The Fivesom Support team has sent you a new message.';
  const cta = ctaUrl || `${siteUrl}/messages`;
  const logo = `${siteUrl}/email-logo.png`;
  const body = esc(messageText || '').replace(/\n/g, '<br />');
  const name = recipientName ? esc(String(recipientName).split(' ')[0]) : null;

  const attachment = attachmentUrl
    ? `<div style="padding-top:12px;"><img src="${esc(attachmentUrl)}" alt="Attachment" width="500" style="display:block;width:100%;max-width:500px;height:auto;border-radius:10px;border:1px solid ${BORDER};" /></div>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>${sender}</title>
</head>
<body style="margin:0;padding:0;background:#eef2f8;">
<div style="display:none;font-size:1px;color:#eef2f8;max-height:0;overflow:hidden;">${esc(messageText || '').slice(0, 120)}</div>
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
      <div style="width:88px;height:88px;background:#eaf2ff;border-radius:999px;text-align:center;font-size:38px;line-height:88px;">${icon}</div>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:18px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;">
      <h1 style="margin:0;font-size:30px;line-height:38px;font-weight:800;color:${NAVY};">${heading}<span style="color:${BLUE};">${sender}</span></h1>
      <p style="margin:22px 0 0 0;font-size:15px;font-weight:700;color:${NAVY};">Hi${name ? ` ${name}` : ''},</p>
      <p style="margin:8px 0 0 0;font-size:15px;line-height:24px;color:${TEXT};">${intro}</p>
    </td>
  </tr>

  <tr>
    <td style="padding:26px 32px 0 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CARD};border:1px solid ${BORDER};border-radius:14px;">
        <tr>
          <td style="padding:16px 20px 18px 20px;font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:14px;font-weight:700;color:${NAVY};">${icon} ${sender}</div>
            <div style="font-size:14px;line-height:23px;color:${TEXT};padding:10px 0 0 2px;">${body}</div>
            ${attachment}
            <div style="font-size:12px;color:${MUTED};padding-top:14px;">&#128337; ${formatSentAt(sentAt)}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <tr>
    <td align="center" style="padding:28px 32px 0 32px;">
      <a href="${cta}" style="display:inline-block;background:${BLUE};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;text-decoration:none;padding:16px 42px;border-radius:12px;">${isNews ? '&#128226;&nbsp; Read the announcement' : '&#128172;&nbsp; Open the conversation'} &nbsp;&#10132;</a>
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
    <td align="center" style="padding:18px 32px 30px 32px;font-family:Arial,Helvetica,sans-serif;">
      <img src="${logo}" width="130" alt="FIVESOM" style="display:block;width:130px;height:auto;border:0;margin:0 auto;" />
      <div style="padding-top:14px;">${socialRow()}</div>
      <p style="margin:12px 0 0 0;font-size:12px;line-height:19px;color:${MUTED};">You are receiving this email because you have a Fivesom account.<br />
      Questions? Write to <a href="mailto:noreply@fivesom.net" style="color:${BLUE};text-decoration:none;">noreply@fivesom.net</a></p>
      <p style="margin:10px 0 0 0;font-size:11px;color:${MUTED};">&copy; 2026 FIVESOM. All rights reserved.</p>
    </td>
  </tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}
