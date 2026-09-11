import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors'
import { createClient } from 'npm:@supabase/supabase-js@2.57.2'

const encoder = new TextEncoder()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)
  try {
    const secret = Deno.env.get('PERSONA_WEBHOOK_SECRET')
    if (!secret) return json({ error: 'Webhook is not configured' }, 503)
    const rawBody = await req.text()
    const signature = req.headers.get('Persona-Signature') ?? ''
    if (!(await validSignature(signature, rawBody, secret))) return json({ error: 'Invalid signature' }, 401)

    const event = JSON.parse(rawBody)
    const eventName = event?.data?.attributes?.name
    const inquiry = event?.data?.attributes?.payload?.data
    const inquiryId = inquiry?.id
    const status = inquiry?.attributes?.status
    const referenceId = inquiry?.attributes?.['reference-id']
    if (typeof inquiryId !== 'string' || typeof eventName !== 'string') return json({ received: true }, 200)

    const accepted = ['inquiry.completed', 'inquiry.approved'].includes(eventName) || ['completed', 'approved'].includes(status)
    const failed = ['inquiry.declined', 'inquiry.failed', 'inquiry.expired'].includes(eventName) || ['declined', 'failed', 'expired'].includes(status)
    if (!accepted && !failed) return json({ received: true }, 200)

    const admin = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', { auth: { persistSession: false } })
    let query = admin.from('blue_tick_applications').update({ liveness_status: accepted ? 'verified' : 'failed' }).eq('persona_inquiry_id', inquiryId)
    if (typeof referenceId === 'string') query = query.eq('user_id', referenceId)
    const { error } = await query
    if (error) throw error
    return json({ received: true }, 200)
  } catch (error) {
    console.error('persona-webhook error:', error)
    return json({ error: 'Webhook processing failed' }, 500)
  }
})

async function validSignature(header: string, rawBody: string, secret: string) {
  const parts = header.split(/[ ,]+/).filter(Boolean)
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2)
  const signatures = parts.filter((part) => part.startsWith('v1=')).map((part) => part.slice(3))
  if (!timestamp || signatures.length === 0 || Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const bytes = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${rawBody}`)))
  const expected = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return signatures.some((candidate) => constantTimeEqual(candidate, expected))
}

function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i += 1) result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return result === 0
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
