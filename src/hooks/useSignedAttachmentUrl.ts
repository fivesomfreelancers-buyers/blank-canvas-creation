import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Buckets that are private and require signed URLs to be readable.
const PRIVATE_BUCKETS = new Set([
  'order-requirements',
  'delivery-files',
  'message-attachments',
]);

interface ParsedRef {
  bucket: string;
  path: string;
}

/** Parse a Supabase storage public URL into { bucket, path }. Returns null if not a storage URL. */
function parseStorageUrl(url: string): ParsedRef | null {
  try {
    const u = new URL(url);
    // /storage/v1/object/public/<bucket>/<path...>
    // /storage/v1/object/sign/<bucket>/<path...>
    const m = u.pathname.match(/\/storage\/v1\/object\/(?:public|sign|authenticated)\/([^/]+)\/(.+)$/);
    if (!m) return null;
    return { bucket: decodeURIComponent(m[1]), path: decodeURIComponent(m[2]) };
  } catch {
    return null;
  }
}

/**
 * If the URL points to a known private storage bucket, returns a short-lived signed URL.
 * Otherwise returns the original URL unchanged.
 */
export function useSignedAttachmentUrl(url: string | null | undefined): string {
  const [resolved, setResolved] = useState<string>(url || '');

  useEffect(() => {
    if (!url) {
      setResolved('');
      return;
    }
    const ref = parseStorageUrl(url);
    if (!ref || !PRIVATE_BUCKETS.has(ref.bucket)) {
      setResolved(url);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .storage
        .from(ref.bucket)
        .createSignedUrl(ref.path, 60 * 60); // 1 hour
      if (cancelled) return;
      if (error || !data?.signedUrl) {
        setResolved(url); // best-effort fallback
      } else {
        setResolved(data.signedUrl);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  return resolved;
}
