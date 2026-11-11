import { supabase } from '@/integrations/supabase/client';

export type SafetyContext = 'message' | 'dispute_message' | 'job' | 'job_application' | 'gig';
export type Finding = { type: string; match: string; reason: string };
export type Detection = { risk: 'none' | 'medium' | 'high'; findings: Finding[] };

export const SECURITY_WARNING =
  'SECURITY WARNING: Sharing external contact details or moving business transactions outside FIVESOM is not permitted. Keep communication and payments on FIVESOM to remain protected.';

/** Visual highlighter only. The database is the authority that blocks content. */
const HIGHLIGHT = /(t\.me\/\S+|wa\.me\/\S*|chat\.whatsapp\.com\/\S*|paypal\.me\/\S*|[a-z0-9._%+-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)*\.[a-z]{2,}|\+?\d[\d\s().-]{7,}\d|(?:^|(?<=[^a-z0-9_]))@[a-z][a-z0-9_]{3,31}|telegram|whats\s?app|watsapp|viber|wechat|skype|outside\s+(?:of\s+)?(?:fivesom|this platform|the platform)|off[- ]platform|pay(?:ment)?\s+(?:me\s+)?directly)/gi;

export function splitSuspicious(text: string): { text: string; bad: boolean }[] {
  const out: { text: string; bad: boolean }[] = [];
  let last = 0;
  for (const m of text.matchAll(HIGHLIGHT)) {
    const s = m.index ?? 0;
    const bad = !/^\+?\d/.test(m[0]) || m[0].replace(/\D/g, '').length >= 9;
    if (!bad) continue;
    if (s > last) out.push({ text: text.slice(last, s), bad: false });
    out.push({ text: m[0], bad: true });
    last = s + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), bad: false });
  return out;
}

export const hasSuspicious = (text: string) => splitSuspicious(text).some((p) => p.bad);

/** Server-side scan; records an incident for Admin/Founder review when risky. */
export async function scanContent(context: SafetyContext, content: string, refId?: string): Promise<Detection> {
  if (!content.trim()) return { risk: 'none', findings: [] };
  const { data, error } = await (supabase as any).rpc('report_content_scan', { _context: context, _content: content, _ref_id: refId ?? null });
  if (error || !data) return { risk: 'none', findings: [] };
  return data as Detection;
}

/** Throws a user-facing error when the server classifies content as high risk. */
export async function assertSafeContent(context: SafetyContext, content: string, refId?: string) {
  const d = await scanContent(context, content, refId);
  if (d.risk === 'high') {
    const items = [...new Set(d.findings.map((f) => f.match))].join(', ');
    throw new Error(`${SECURITY_WARNING} Please remove: ${items}`);
  }
  return d;
}
