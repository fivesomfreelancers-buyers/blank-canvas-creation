// One-off maintenance function: overwrite oversized storage images with
// pre-compressed bytes. Guarded by a shared token and restricted to image
// buckets and image content types.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

const TOKEN = Deno.env.get('IMAGE_OPTIMIZE_TOKEN') ?? '';
const ALLOWED_BUCKETS = ['gig-images', 'profile-images', 'verification-portfolio', 'gig-media'];

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const json = (body: unknown, status = 200) =>
    new Response(JSON.stringify(body), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    });

  if (!TOKEN || req.headers.get('x-optimize-token') !== TOKEN) {
    return json({ error: 'forbidden' }, 403);
  }

  let payload: { bucket?: string; path?: string; contentType?: string; base64?: string };
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'invalid json' }, 400);
  }

  const { bucket, path, contentType, base64 } = payload;
  if (!bucket || !path || !base64 || !contentType) return json({ error: 'missing fields' }, 400);
  if (!ALLOWED_BUCKETS.includes(bucket)) return json({ error: 'bucket not allowed' }, 400);
  if (!contentType.startsWith('image/')) return json({ error: 'images only' }, 400);

  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { error } = await admin.storage.from(bucket).upload(path, bytes, {
    upsert: true,
    contentType,
    cacheControl: '31536000',
  });
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, bucket, path, size: bytes.length });
});
