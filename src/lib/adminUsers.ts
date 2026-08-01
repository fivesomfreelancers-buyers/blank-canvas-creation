import { supabase } from '@/integrations/supabase/client';

export interface AdminProfile {
  id: string;
  full_name: string | null;
  username: string | null;
  email: string | null;
  profile_image_url: string | null;
  role: string | null;
  bio: string | null;
  professional_title: string | null;
  location: string | null;
  industry: string | null;
  member_since: string | null;
  last_seen: string | null;
  created_at: string | null;
}

/**
 * Admin-only user directory.
 * The `email` column of `profiles` is not readable by any client role, so admin
 * screens must go through the `admin_get_profiles` security-definer function,
 * which returns rows only when the caller has an admin role.
 */
export async function fetchAdminProfiles(ids: (string | null | undefined)[]): Promise<Map<string, AdminProfile>> {
  const unique = Array.from(new Set(ids.filter(Boolean))) as string[];
  if (!unique.length) return new Map();
  const { data, error } = await (supabase as any).rpc('admin_get_profiles', { _ids: unique });
  if (error) {
    console.error('admin_get_profiles failed', error);
    return new Map();
  }
  return new Map(((data || []) as AdminProfile[]).map((p) => [p.id, p]));
}

export async function fetchAdminProfile(id?: string | null): Promise<AdminProfile | null> {
  if (!id) return null;
  const map = await fetchAdminProfiles([id]);
  return map.get(id) || null;
}

/** All users (admin only). */
export async function fetchAllAdminProfiles(): Promise<AdminProfile[]> {
  const { data, error } = await (supabase as any).rpc('admin_get_profiles', { _ids: null });
  if (error) {
    console.error('admin_get_profiles failed', error);
    return [];
  }
  return (data || []) as AdminProfile[];
}

export async function findAdminProfileByEmail(email: string): Promise<AdminProfile | null> {
  const all = await fetchAllAdminProfiles();
  const needle = email.trim().toLowerCase();
  return all.find((p) => (p.email || '').toLowerCase() === needle) || null;
}

/** Display name that never shows "Unknown User". */
export function displayName(p?: { full_name?: string | null; username?: string | null; email?: string | null } | null, fallback = 'Fivesom User') {
  return p?.full_name?.trim() || p?.username?.trim() || p?.email?.trim() || fallback;
}
