import { createClient, corsHeaders } from 'npm:@supabase/supabase-js@2.57.2/cors'
import { createClient as createSupabaseClient } from 'npm:@supabase/supabase-js@2.57.2'
import { z } from 'npm:zod@3.24.2'

const BodySchema = z.object({ applicationId: z.string().uuid() })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const token = (req.headers.get('Authorization') ?? '').replace(/^Bearer\s+/i, '')
    if (!token) return json({ error: 'Authentication required' }, 401)
    const auth = createSupabaseClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_ANON_KEY') ?? '')
    const { data: { user }, error: authError } = await auth.auth.getUser(token)
    if (authError || !user) return json({ error: 'Authentication required' }, 401)

    const parsed = BodySchema.safeParse(await req.json().catch(() => null))
    if (!parsed.success) return json({ error: 'A valid application is required' }, 400)

    const admin = createSupabaseClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } })
    const { data: application, error: appError } = await admin.from('blue_tick_applications')
      .select('id,user_id,status,persona_inquiry_id,liveness_status')
      .eq('id', parsed.data.applicationId).eq('user_id', user.id).maybeSingle()
    if (appError) throw appError
    if (!application || !['draft', 'more_info_requested'].includes(application.status)) return json({ error: 'Application cannot start verification' }, 403)

    const apiKey = Deno.env.get('PERSONA_API_KEY')
    const templateId = Deno.env.get('PERSONA_TEMPLATE_ID')
    if (!apiKey || !templateId) return json({ error: 'Persona verification is not configured yet' }, 503)

    const origin = req.headers.get('origin') ?? 'https://fivesom.net'
    const response = await fetch('https://api.withpersona.com/api/v1/inquiries', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Persona-Version': '2025-12-08',
        'Idempotency-Key': application.id,
      },
      body: JSON.stringify({
        data: { attributes: {
          'inquiry-template-id': templateId,
          'reference-id': user.id,
          'redirect-uri': `${origin}/freelancer-dashboard`,
        } },
        meta: { 'auto-create-account': true, 'auto-create-account-reference-id': user.id, 'auto-create-inquiry-session': true, 'auto-create-one-time-link': true },
      }),
    })
    const responseText = await response.text()
    if (!response.ok) {
      console.error(`Persona inquiry failed [${response.status}]: ${responseText}`)
      return json({ error: 'Persona could not start verification', status: response.status }, response.status)
    }
    const payload = JSON.parse(responseText)
    const inquiryId = payload?.data?.id
    const attributes = payload?.data?.attributes ?? {}
    const sessionToken = payload?.meta?.['session-token'] ?? attributes?.['session-token'] ?? null
    const oneTimeLink = payload?.meta?.['one-time-link'] ?? attributes?.['one-time-link'] ?? null
    if (typeof inquiryId !== 'string') return json({ error: 'Persona returned an invalid inquiry' }, 502)

    const { error: updateError } = await admin.from('blue_tick_applications').update({
      persona_inquiry_id: inquiryId,
      liveness_status: 'pending',
    }).eq('id', application.id).eq('user_id', user.id)
    if (updateError) throw updateError

    const verifyUrl = typeof oneTimeLink === 'string' ? oneTimeLink :
      `https://withpersona.com/verify?inquiry-id=${encodeURIComponent(inquiryId)}${sessionToken ? `&session-token=${encodeURIComponent(sessionToken)}` : ''}`
    return json({ inquiryId, verifyUrl }, 200)
  } catch (error) {
    console.error('persona-create-inquiry error:', error)
    return json({ error: 'Unable to start verification' }, 500)
  }
})

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
