import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  let body: { action?: string; token?: string };
  try { body = await req.json(); } catch { return json({ error: 'Invalid request' }, 400); }

  if (body.action === 'config') return json({ siteKey: Deno.env.get('TURNSTILE_SITE_KEY') ?? '' });

  const token = typeof body.token === 'string' ? body.token : '';
  if (!token || token.length > 4096) return json({ error: 'Missing verification token' }, 400);

  const form = new FormData();
  form.append('secret', Deno.env.get('TURNSTILE_SECRET_KEY') ?? '');
  form.append('response', token);
  const ip = req.headers.get('cf-connecting-ip') ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (ip) form.append('remoteip', ip);
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
  const result = await res.json().catch(() => ({ success: false }));
  if (!result.success) return json({ success: false, error: 'Human verification failed. Please try again.' }, 403);

  // Signed-in users: record a server-side verification window used by database checks.
  const auth = req.headers.get('Authorization') ?? '';
  if (auth.startsWith('Bearer ')) {
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const { data } = await admin.auth.getUser(auth.slice(7));
    if (data.user) {
      const until = new Date(Date.now() + 12 * 3600 * 1000).toISOString();
      const { error } = await admin.from('human_verifications').upsert({ user_id: data.user.id, verified_until: until });
      if (error) return json({ error: 'Could not save verification' }, 500);
      return json({ success: true, verifiedUntil: until });
    }
  }
  return json({ success: true });
});
