import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3';
import { sendNotificationEmail } from '../_shared/email-provider.ts';
const schema = z.object({ history_id: z.string().uuid(), recipient_id: z.string().uuid() });
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] ?? c));
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const secret = Deno.env.get('MESSAGE_EMAIL_HOOK_SECRET');
  if (!secret || req.headers.get('x-hook-secret') !== secret) return json({ error: 'Unauthorized' }, 401);
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return json({ error: 'Valid history_id and recipient_id required' }, 400);
    const { history_id, recipient_id } = parsed.data;
    const db = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: roles, error: roleError } = await db.from('user_roles').select('role').eq('user_id', recipient_id).in('role', ['admin', 'super_admin', 'founder']);
    if (roleError) throw roleError;
    if (!roles?.length) return json({ skipped: 'not_review_staff' });
    const { data: history, error } = await db.from('gig_review_history').select('*').eq('id', history_id).maybeSingle();
    if (error) throw error;
    if (!history || !['submitted', 'resubmitted'].includes(history.action)) return json({ skipped: 'not_submission' });
    const { data: gig, error: gigError } = await db.from('gigs').select('title, category_slug, submitted_at, freelancers(user_id)').eq('id', history.gig_id).maybeSingle();
    if (gigError) throw gigError;
    if (!gig) return json({ skipped: 'gig_removed' });
    const { data: owner } = await db.from('profiles').select('full_name').eq('id', history.freelancer_user_id).maybeSingle();
    const { data: recipient } = await db.auth.admin.getUserById(recipient_id);
    if (!recipient.user?.email) return json({ skipped: 'no_recipient_email' });
    const founder = roles.some(r => r.role === 'founder');
    const url = `https://fivesom.net/${founder ? 'founder' : 'admin'}#gigs`;
    const html = `<html><body style="font-family:Arial,sans-serif"><img src="https://fivesom.net/email-logo.png" width="180" alt="FIVESOM"><h1>New Gig Submitted — Awaiting Fivesom Review</h1><p>Freelancer: ${escape(owner?.full_name || 'Fivesom freelancer')}</p><p>Gig: ${escape(gig.title)}</p><p>Category: ${escape(gig.category_slug || 'Not specified')}</p><p>Submitted (UTC): ${escape(history.created_at)}</p><p>${history.action === 'resubmitted' ? 'Corrected gig resubmitted for review.' : 'New gig submitted for review.'}</p><p><a href="${url}">Review Gig</a></p></body></html>`;
    const sent = await sendNotificationEmail({ from: 'Fivesom <noreply@fivesom.net>', to: [recipient.user.email], subject: 'New Gig Submitted — Awaiting Fivesom Review', html }, `gig-review/${history_id}/${recipient_id}`);
    return json({ sent: true, id: sent.id });
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Email failed' }, 500); }
});