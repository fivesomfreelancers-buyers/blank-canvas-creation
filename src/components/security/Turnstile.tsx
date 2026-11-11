import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, o: Record<string, unknown>) => string; remove: (id: string) => void; reset: (id: string) => void } }
}

let siteKeyPromise: Promise<string> | null = null;
const getSiteKey = () => (siteKeyPromise ??= supabase.functions
  .invoke('turnstile-verify', { body: { action: 'config' } })
  .then(({ data }) => (data?.siteKey as string) || ''));

let scriptPromise: Promise<void> | null = null;
const loadScript = () => (scriptPromise ??= new Promise((resolve, reject) => {
  if (window.turnstile) return resolve();
  const s = document.createElement('script');
  s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async = true; s.onload = () => resolve(); s.onerror = () => { scriptPromise = null; reject(new Error('load')); };
  document.head.appendChild(s);
}));

/** Verifies the Turnstile token on the server. Signed-in users also get a 12-hour server-side pass. */
export async function verifyHumanToken(token: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('turnstile-verify', { body: { token } });
  return !error && data?.success === true;
}

interface Props { onVerified: (ok: boolean) => void }

/** Cloudflare "Verify you are human" box. Calls onVerified(true) only after the server accepts the token. */
export default function Turnstile({ onVerified }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onVerified); cb.current = onVerified;
  const [status, setStatus] = useState<'loading' | 'ready' | 'checking' | 'ok' | 'error'>('loading');

  useEffect(() => {
    let id: string | undefined; let alive = true;
    Promise.all([getSiteKey(), loadScript()]).then(([sitekey]) => {
      if (!alive || !ref.current || !window.turnstile || !sitekey) { if (alive) setStatus('error'); return; }
      setStatus('ready');
      id = window.turnstile.render(ref.current, {
        sitekey, theme: 'dark',
        callback: async (token: string) => {
          setStatus('checking');
          const ok = await verifyHumanToken(token);
          if (!alive) return;
          setStatus(ok ? 'ok' : 'error'); cb.current(ok);
          if (!ok && id) window.turnstile?.reset(id);
        },
        'expired-callback': () => { setStatus('ready'); cb.current(false); },
        'error-callback': () => { setStatus('error'); cb.current(false); },
      });
    }).catch(() => alive && setStatus('error'));
    return () => { alive = false; if (id) window.turnstile?.remove(id); };
  }, []);

  return (
    <div className="space-y-1">
      <div ref={ref} className="min-h-[65px]" />
      {status === 'checking' && <p className="text-xs text-muted-foreground">Checking…</p>}
      {status === 'error' && <p className="text-xs text-destructive">Human verification failed to load or was rejected. Refresh the page and try again.</p>}
    </div>
  );
}
