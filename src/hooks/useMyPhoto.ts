import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Single source of truth for the signed-in person's own photo and name.
 *
 * Every screen used to fetch this on its own, so the website header and the
 * dashboard could end up showing two different pictures (one uploaded photo and
 * one Google photo). This hook keeps one shared value, refreshes it live when
 * the database row changes, and always prefers the photo the person uploaded.
 */

export type MyIdentity = {
  userId: string | null;
  fullName: string | null;
  photoUrl: string | null;
};

const EVENT = 'fivesom:my-photo-changed';
let cache: MyIdentity = { userId: null, fullName: null, photoUrl: null };

/** Call this right after saving a new photo so every screen updates at once. */
export function notifyMyPhotoChanged(photoUrl?: string | null) {
  if (photoUrl !== undefined) cache = { ...cache, photoUrl: photoUrl || null };
  window.dispatchEvent(new CustomEvent(EVENT));
}

async function loadIdentity(): Promise<MyIdentity> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: null, fullName: null, photoUrl: null };

  const { data } = await supabase
    .from('profiles')
    .select('full_name, profile_image_url')
    .eq('id', user.id)
    .maybeSingle();

  const meta: any = user.user_metadata || {};
  const saved = (data?.profile_image_url || '').trim();

  return {
    userId: user.id,
    fullName: data?.full_name?.trim() || meta.full_name || meta.name || user.email || null,
    // The uploaded photo always wins; the provider photo is only a fallback for
    // people who never uploaded one.
    photoUrl: saved || meta.avatar_url || meta.picture || null,
  };
}

export function useMyPhoto() {
  const [identity, setIdentity] = useState<MyIdentity>(cache);

  useEffect(() => {
    let alive = true;

    const refresh = async () => {
      const next = await loadIdentity();
      cache = next;
      if (alive) setIdentity(next);
    };

    refresh();

    const onChanged = () => { void refresh(); };
    window.addEventListener(EVENT, onChanged);

    const { data: authSub } = supabase.auth.onAuthStateChange(() => { void refresh(); });

    let channel: ReturnType<typeof supabase.channel> | null = null;
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user || !alive) return;
      channel = supabase
        .channel(`my-photo-${user.id}`)
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${user.id}` },
          () => { void refresh(); },
        )
        .subscribe();
    });

    return () => {
      alive = false;
      window.removeEventListener(EVENT, onChanged);
      authSub.subscription.unsubscribe();
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return identity;
}
