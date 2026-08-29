import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchGigResult {
  id: string;
  slug: string | null;
  title: string;
  tags: string[];
  price: number;
  image: string;
  category: string;
  subcategory: string;
  deliveryDays: number | null;
  freelancerId: string;
  freelancer: string;
  freelancerAvatar: string;
  freelancerUsername: string | null;
  freelancerLocation: string | null;
  isVerified: boolean;
  hasBlueTick: boolean;
  isFeatured: boolean;
  completedOrders: number;
  vipTierRaw: string | null;
  vipExpiresAt: string | null;
  rating: number;
  reviews: number;
  isOnline: boolean;
  relevance: number;
}

export interface GigSearchOptions {
  query?: string;
  category?: string | null;
  subcategory?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  minRating?: number | null;
  location?: string | null;
  page?: number;
  pageSize?: number;
  /** Debounce (ms) applied to the free-text query so typing feels instant but stays cheap. */
  debounceMs?: number;
}

const mapRow = (row: any): SearchGigResult => ({
  id: row.gig_id,
  slug: row.gig_slug,
  title: row.gig_title,
  tags: row.gig_tags || [],
  price: Number(row.base_price || 0),
  image: row.thumbnail_url || row.images?.[0] || '',
  category: row.category_slug || '',
  subcategory: row.subcategory_slug || '',
  deliveryDays: row.delivery_time_days ?? null,
  freelancerId: row.freelancer_id,
  freelancer: row.freelancer_name || 'Anonymous',
  freelancerAvatar: row.freelancer_avatar || '',
  freelancerUsername: row.freelancer_username ?? null,
  freelancerLocation: row.freelancer_location ?? null,
  isVerified: !!row.is_verified,
  hasBlueTick: !!row.has_blue_tick,
  isFeatured: !!row.is_featured,
  completedOrders: row.completed_orders || 0,
  vipTierRaw: row.vip_tier ?? null,
  vipExpiresAt: row.vip_expires_at ?? null,
  rating: Number(row.avg_rating || 0),
  reviews: row.review_count || 0,
  isOnline: !!row.is_online,
  relevance: Number(row.relevance || 0),
});

/**
 * Server-side gig search. All ranking (tag matches first, then title, category,
 * description, freelancer name, then quality signals) happens in the
 * `search_gigs` Postgres function so we never download the whole catalog.
 */
export const useGigSearch = (opts: GigSearchOptions) => {
  const {
    query = '',
    category = null,
    subcategory = null,
    minPrice = null,
    maxPrice = null,
    minRating = null,
    location = null,
    page = 1,
    pageSize = 18,
    debounceMs = 250,
  } = opts;

  const [gigs, setGigs] = useState<SearchGigResult[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const requestId = useRef(0);

  const run = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    const { data, error } = await (supabase as any).rpc('search_gigs', {
      p_query: query || '',
      p_category: category && category !== 'all' ? category : null,
      p_subcategory: subcategory && subcategory !== 'all' ? subcategory : null,
      p_min_price: minPrice,
      p_max_price: maxPrice,
      p_min_rating: minRating,
      p_location: location,
      p_limit: pageSize,
      p_offset: Math.max(page - 1, 0) * pageSize,
    });
    if (id !== requestId.current) return; // stale response
    if (error) {
      console.error('search_gigs failed:', error);
      setGigs([]);
      setTotal(0);
    } else {
      const rows = (data || []) as any[];
      setGigs(rows.map(mapRow));
      setTotal(rows.length ? Number(rows[0].total_count) : 0);
    }
    setLoading(false);
  }, [query, category, subcategory, minPrice, maxPrice, minRating, location, page, pageSize]);

  useEffect(() => {
    const t = setTimeout(run, query ? debounceMs : 0);
    return () => clearTimeout(t);
  }, [run, query, debounceMs]);

  // Keep results fresh the moment a gig is published or its tags change.
  useEffect(() => {
    const channel = supabase
      .channel('gig-search-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gigs' }, () => {
        run();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [run]);

  return { gigs, total, loading, refetch: run };
};

export interface TagSuggestion {
  tag: string;
  count: number;
}

/** Live tag suggestions pulled from the tags freelancers actually use on gigs. */
export const useTagSuggestions = (query: string, limit = 8, debounceMs = 180) => {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const term = query.trim();
    if (!term) {
      setSuggestions([]);
      return;
    }
    const id = ++requestId.current;
    setLoading(true);
    const t = setTimeout(async () => {
      const { data, error } = await (supabase as any).rpc('search_gig_tags', {
        p_query: term,
        p_limit: limit,
      });
      if (id !== requestId.current) return;
      if (error) {
        console.error('search_gig_tags failed:', error);
        setSuggestions([]);
      } else {
        setSuggestions(((data || []) as any[]).map((r) => ({ tag: r.tag, count: Number(r.gig_count) })));
      }
      setLoading(false);
    }, debounceMs);
    return () => clearTimeout(t);
  }, [query, limit, debounceMs]);

  return { suggestions, loading };
};
