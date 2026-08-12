import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { usePresenceContext } from '@/components/presence/PresenceProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Crown } from 'lucide-react';

interface FounderRow {
  user_id: string;
  full_name: string | null;
  username: string | null;
  profile_image_url: string | null;
  last_seen: string | null;
}

const initials = (name?: string | null) =>
  (name || 'F')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/** Top strip: the current founder plus the other authorized founders with live status. */
const FounderPresenceBar: React.FC = () => {
  const { user } = useAuth();
  const { isOnline, onlineIds } = usePresenceContext();
  const [founders, setFounders] = useState<FounderRow[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data, error } = await (supabase as any).rpc('list_founders');
      if (!cancelled && !error) setFounders((data || []) as FounderRow[]);
    };
    void load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const me = founders.find((f) => f.user_id === user?.id);
  const others = founders.filter((f) => f.user_id !== user?.id);

  const recentlySeen = (ts?: string | null) =>
    !!ts && Date.now() - new Date(ts).getTime() < 90_000;

  const statusOf = (f: FounderRow) => isOnline(f.user_id) || recentlySeen(f.last_seen);

  const Dot = ({ on }: { on: boolean }) => (
    <span
      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${
        on ? 'bg-emerald-500' : 'bg-muted-foreground/50'
      }`}
    />
  );

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur p-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-primary/40">
            <AvatarImage src={me?.profile_image_url || undefined} alt={me?.full_name || 'Founder'} />
            <AvatarFallback>{initials(me?.full_name)}</AvatarFallback>
          </Avatar>
          <Dot on />
        </div>
        <div className="leading-tight">
          <p className="flex items-center gap-1.5 font-semibold">
            <Crown className="h-4 w-4 text-amber-400" />
            {me?.full_name || user?.email}
          </p>
          <p className="text-xs text-emerald-500 font-medium">Online · Founder</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
          Founders ({founders.length}) · {onlineIds.size > 0 ? 'live' : 'live'}
        </span>
        {others.length === 0 && (
          <span className="text-xs text-muted-foreground">No other founders assigned yet.</span>
        )}
        {others.map((f) => {
          const on = statusOf(f);
          return (
            <div key={f.user_id} className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={f.profile_image_url || undefined} alt={f.full_name || 'Founder'} />
                  <AvatarFallback>{initials(f.full_name)}</AvatarFallback>
                </Avatar>
                <Dot on={on} />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium">{f.full_name || f.username || 'Founder'}</p>
                <p className={`text-[11px] ${on ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                  {on ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FounderPresenceBar;
