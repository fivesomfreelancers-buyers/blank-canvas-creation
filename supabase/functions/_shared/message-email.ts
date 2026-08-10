/**
 * Fivesom "new message" notification email.
 *
 * Table-based, inline-styled HTML so it renders identically in Gmail,
 * Outlook, Apple Mail and mobile clients (no external CSS, no flexbox).
 *
 * Usage:
 *   const html = buildMessageNotificationEmail({
 *     senderName: 'Maxamed Ali',
 *     senderRole: 'buyer',
 *     messageText: 'Asc, waxaan u baahanahay website ganacsi...',
 *     sentAt: new Date(),
 *   });
 */

export type SenderRole = 'buyer' | 'freelancer';

export interface MessageNotificationEmailParams {
  /** Full name of the person who sent the message. */
  senderName: string;
  /** Role pill shown next to the name. */
  senderRole: SenderRole;
  /** The exact message snippet to show inside the card. */
  messageText: string;
  /** When the message was sent. */
  sentAt?: Date | string;
  /** Optional avatar image URL (absolute). Falls back to an initial circle. */
  senderAvatarUrl?: string | null;
  /** Deep link to the conversation. */
  replyUrl?: string;
  /** Site origin used for logo + footer links. */
  siteUrl?: string;
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

const roleBadge = (role: SenderRole) => {
  const isBuyer = role === 'buyer';
  const label = isBuyer ? 'Buyer' : 'Freelancer';
  const bg = isBuyer ? '#e8f1ff' : '#e6f7ef';
  const fg = isBuyer ? BLUE : '#0f8f5f';
  const icon = isBuyer ? '&#128722;' : '&#128188;';
  return `<span style="display:inline-block;background:${bg};color:${fg};font-size:13px;font-weight:700;padding:5px 12px;border-radius:999px;white-space:nowrap;">${icon} ${label}</span>`;
};

const trustCell = (icon: string, title: string, sub: string) => `
  <td width="25%" valign="top" style="padding:0 10px;text-align:center;font-family:Arial,Helvetica,sans-serif;">
    <div style="font-size:22px;line-height:26px;color:${BLUE};">${icon}</div>
    <div style="font-size:13px;font-weight:700;color:${NAVY};padding-top:6px;">${title}</div>
    <div style="font-size:12px;color:${MUTED};padding-top:3px;line-height:17px;">${sub}</div>
  </td>`;

const socialIcon = (href: string, bg: string, glyph: string) => `
  <td style="padding:0 5px;">
    <a href="${href}" style="display:inline-block;width:36px;height:36px;border-radius:999px;background:${bg};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:16px;font-weight:700;line-height:36px;text-align:center;text-decoration:none;">${glyph}</a>
  </td>`;

export function buildMessageNotificationEmail({
  senderName,
  senderRole,
  messageText,
  sentAt,
  senderAvatarUrl,
  replyUrl,
  siteUrl = 'https://fivesom.net',
}: MessageNotificationEmailParams): string {
  const name = esc(senderName || 'Fivesom Member');
  const initial = esc((senderName || 'F').trim().charAt(0).toUpperCase());
  const body = esc(messageText || '').replace(/\n/g, '<br />');
  const cta = replyUrl || `${siteUrl}/messages`;
  const logo = `${siteUrl}/email-logo.png`;

  const avatar = senderAvatarUrl
    ? `<img src="${esc(senderAvatarUrl)}" width="56" height="56" alt="${name}" style="display:block;width:56px;height:56px;border-radius:999px;object-fit:cover;border:0;" />`
    : `<div style="width:56px;height:56px;border-radius:999px;background:${BLUE};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:700;line-height:56px;text-align:center;">${initial}</div>`;

  return `<!DOCTYPE html>
<html lang="so">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="x-apple-disable-message-reformatting" />
<title>Fariin Cusub oo kaga timid Fivesom</title>
</head>
<body style="margin:0;padding:0;background:#eef2f8;">
<div style="display:none;font-size:1px;color:#eef2f8;max-height:0;overflow:hidden;">${name} waxaa kuu soo diray fariin cusub oo Fivesom ah.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#eef2f8;padding:28px 12px;">
<tr><td align="center">

<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:600px;max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 6px 24px rgba(11,27,58,0.07);">

  <!-- A. Header -->
  <tr>
    <td align="center" style="padding:34px 32px 10px 32px;">
      <a href="${siteUrl}" style="text-decoration:none;">
        <img src="${logo}" width="210" alt="FIVESOM" style="display:block;width:210px;max-width:70%;height:auto;border:0;" />
      </a>
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:3px;font-weight:700;color:${NAVY};padding-top:10px;">CONNECT &bull; CREATE &bull; EARN</div>
    </td>
  </tr>

  <!-- Envelope + badge -->
  <tr>
    <td align="center" style="padding:24px 32px 0 32px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="width:88px;height:88px;background:#eaf2ff;border-radius:999px;text-align:center;vertical-align:middle;font-size:38px;line-height:88px;">&#9993;&#65039;</td>
        <td valign="top" style="padding-left:-6px;">
          <span style="display:inline-block;min-width:24px;height:24px;background:${BLUE};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:12px;font-weight:700;line-height:24px;text-align:center;border-radius:999px;border:2px solid #ffffff;margin-left:-14px;">1</span>
        </td>
      </tr></table>
    </td>
  </tr>

  <!-- B. Heading + greeting -->
  <tr>
    <td align="center" style="padding:18px 40px 0 40px;font-family:Arial,Helvetica,sans-serif;">
      <h1 style="margin:0;font-size:32px;line-height:40px;font-weight:800;color:${NAVY};">Fariin Cusub oo<br />kaga timid <span style="color:${BLUE};">Fivesom!</span></h1>
      <p style="margin:22px 0 0 0;font-size:15px;font-weight:700;color:${NAVY};">Salaam,</p>
      <p style="margin:8px 0 0 0;font-size:15px;line-height:24px;color:${TEXT};">Waxaad haysataa fariin cusub oo kaga timid isticmaalaye kale ee <strong style="color:${BLUE};">Fivesom</strong>.</p>
    </td>
  </tr>

  <!-- C. Sender card -->
  <tr>
    <td style="padding:26px 32px 0 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${CARD};border:1px solid ${BORDER};border-radius:14px;">
        <tr>
          <td style="padding:18px 20px 14px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
              <td width="56" valign="top">${avatar}</td>
              <td valign="top" style="padding-left:14px;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:17px;font-weight:700;color:${NAVY};">${name} &nbsp;${roleBadge(senderRole)}</div>
                <div style="font-size:13px;color:${MUTED};padding-top:4px;">Fivesom Member</div>
              </td>
            </tr></table>
          </td>
        </tr>
        <tr><td style="padding:0 20px;"><div style="height:1px;background:${BORDER};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
        <tr>
          <td style="padding:14px 20px 18px 20px;font-family:Arial,Helvetica,sans-serif;">
            <div style="font-size:14px;font-weight:700;color:${NAVY};">&#128172; Fariinta:</div>
            <div style="font-size:14px;line-height:23px;color:${TEXT};padding:8px 0 0 4px;">${body}</div>
            <div style="font-size:12px;color:${MUTED};padding-top:14px;">&#128337; ${formatSentAt(sentAt)}</div>
          </td>
        </tr>
      </table>
    </td>
  </tr>

  <!-- D. CTA -->
  <tr>
    <td align="center" style="padding:28px 32px 0 32px;">
      <a href="${cta}" style="display:inline-block;background:${BLUE};color:#ffffff;font-family:Arial,Helvetica,sans-serif;font-size:17px;font-weight:700;text-decoration:none;padding:16px 42px;border-radius:12px;">&#128172;&nbsp; Ka Jawaab Fariinta &nbsp;&#10132;</a>
      <p style="margin:14px 0 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${MUTED};">Ama guji link-gan: <a href="${cta}" style="color:${BLUE};text-decoration:none;">${esc(cta)}</a></p>
    </td>
  </tr>

  <!-- E. Trust badges -->
  <tr><td style="padding:26px 32px 0 32px;"><div style="height:1px;background:${BORDER};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
  <tr>
    <td style="padding:20px 22px 0 22px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        ${trustCell('&#128737;&#65039;', 'Secure Escrow', 'Lacagahaagu waa amaan')}
        ${trustCell('&#128100;', 'Verified Users', 'Xubno la xaqiijiyay')}
        ${trustCell('&#128274;', 'Safe Payments', 'Lacago ammaan ah')}
        ${trustCell('&#127758;', 'Worldwide', 'Soomaali Dunida oo dhan')}
      </tr></table>
    </td>
  </tr>

  <!-- F. Footer -->
  <tr><td style="padding:24px 32px 0 32px;"><div style="height:1px;background:${BORDER};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
  <tr>
    <td style="padding:20px 32px 0 32px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="middle" style="font-family:Arial,Helvetica,sans-serif;">
          <img src="${logo}" width="140" alt="FIVESOM" style="display:block;width:140px;height:auto;border:0;" />
          <div style="font-size:13px;line-height:20px;color:${MUTED};padding-top:10px;">Fivesom waa madal freelancing ah oo isku xirta macaamiisha iyo xirfadlayaasha.</div>
        </td>
        <td valign="middle" align="right">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
            ${socialIcon('https://facebook.com/fivesom', '#1877F2', 'f')}
            ${socialIcon('https://twitter.com/fivesom', '#1DA1F2', 'X')}
            ${socialIcon('https://instagram.com/fivesom', '#E1306C', '&#9673;')}
            ${socialIcon('https://linkedin.com/company/fivesom', '#0A66C2', 'in')}
          </tr></table>
        </td>
      </tr></table>
    </td>
  </tr>
  <tr><td style="padding:20px 32px 0 32px;"><div style="height:1px;background:${BORDER};line-height:1px;font-size:0;">&nbsp;</div></td></tr>
  <tr>
    <td style="padding:16px 32px 28px 32px;font-family:Arial,Helvetica,sans-serif;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="font-size:12px;color:${MUTED};">&copy; ${new Date().getFullYear()} Fivesom. All rights reserved.</td>
        <td align="right" style="font-size:12px;color:${MUTED};">
          <a href="${siteUrl}/legal/privacy" style="color:${MUTED};text-decoration:none;">Privacy Policy</a>
          &nbsp;|&nbsp;<a href="${siteUrl}/legal/terms" style="color:${MUTED};text-decoration:none;">Terms of Service</a>
          &nbsp;|&nbsp;<a href="${siteUrl}/support" style="color:${MUTED};text-decoration:none;">Support</a>
          &nbsp;|&nbsp;<a href="${siteUrl}" style="color:${MUTED};text-decoration:none;">Fivesom.net</a>
        </td>
      </tr></table>
    </td>
  </tr>

</table>

</td></tr>
</table>
</body>
</html>`;
}

export default buildMessageNotificationEmail;
