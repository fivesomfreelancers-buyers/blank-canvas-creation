import { useCallback, useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Turnstile from './Turnstile';

/**
 * Signed-in users must hold a server-recorded human check (12h). The database refuses
 * messages, gigs, jobs and applications without it, so this prompt keeps those actions working.
 */
export default function HumanVerificationGate() {
  const { user } = useAuth();
  const [needed, setNeeded] = useState(false);

  const check = useCallback(async () => {
    if (!user) { setNeeded(false); return; }
    const { data } = await supabase.from('human_verifications' as never).select('verified_until').eq('user_id', user.id).maybeSingle();
    const until = (data as { verified_until?: string } | null)?.verified_until;
    setNeeded(!until || new Date(until).getTime() < Date.now() + 60_000);
  }, [user]);

  useEffect(() => { void check(); const t = setInterval(check, 10 * 60_000); return () => clearInterval(t); }, [check]);

  if (!needed) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="human-check-title">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-center shadow-lg">
        <ShieldCheck className="mx-auto h-10 w-10 text-primary" />
        <h2 id="human-check-title" className="mt-3 font-heading text-xl font-bold text-foreground">Verify you are human</h2>
        <p className="mt-2 text-sm text-muted-foreground">This keeps bots out of Fivesom messages, gigs and jobs. You will not be asked again for 12 hours.</p>
        <div className="mt-4 flex justify-center"><Turnstile onVerified={(ok) => { if (ok) void check(); }} /></div>
      </div>
    </div>
  );
}
