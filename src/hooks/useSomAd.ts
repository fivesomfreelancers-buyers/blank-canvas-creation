import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type SomAdPlacement = 'dashboard_banner' | 'gig_price';
export type SomAdAudience = 'all' | 'buyers' | 'freelancers';

export interface SomAd {
  id: string;
  title: string;
  placement: SomAdPlacement;
  media_path: string;
  media_type: 'image' | 'video';
  media_url: string;
  focal_x: number;
  focal_y: number;
  zoom: number;
  cta_text: string | null;
  cta_url: string | null;
  cta_style: string;
  cta_color: string;
  cta_size: string;
  cta_position: string;
  audience: SomAdAudience;
  is_active: boolean;
}

async function resolveMediaUrl(path: string): Promise<string> {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const { data, error } = await supabase.storage
    .from('somadz-media')
    .createSignedUrl(path, 60 * 60 * 6);
  if (error || !data?.signedUrl) return '';
  return data.signedUrl;
}

export function useSomAd(placement: SomAdPlacement, viewerRole?: 'buyer' | 'freelancer' | null) {
  const [ad, setAd] = useState<SomAd | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('somadz_ads')
        .select('*')
        .eq('placement', placement)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });

      if (cancelled) return;

      const filtered = (data || []).filter((row: any) => {
        if (row.audience === 'all') return true;
        if (row.audience === 'buyers') return viewerRole === 'buyer' || !viewerRole;
        if (row.audience === 'freelancers') return viewerRole === 'freelancer' || !viewerRole;
        return false;
      });

      const chosen = filtered[0];
      if (!chosen) {
        setAd(null);
        setLoading(false);
        return;
      }

      const media_url = await resolveMediaUrl(chosen.media_path);
      if (cancelled) return;
      setAd({ ...chosen, media_url });
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`somadz-${placement}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'somadz_ads' },
        () => load(),
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [placement, viewerRole]);

  return { ad, loading };
}
