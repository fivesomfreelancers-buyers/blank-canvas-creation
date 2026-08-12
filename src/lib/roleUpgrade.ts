import { supabase } from '@/integrations/supabase/client';

export type PlatformRole = 'freelancer' | 'buyer' | 'user';

/**
 * Every signed-in account starts as a "normal user": they can browse, search,
 * open gigs, view freelancer profiles and read reviews — but they are not a
 * buyer or a freelancer until they explicitly upgrade.
 */
export const ensureNormalUserRole = async (userId: string) => {
  try {
    // Only seed the placeholder role when the account has no role at all —
    // profiles.role is kept in sync by a database trigger, so we never write it
    // here (that could downgrade a real freelancer/buyer).
    const { data } = await (supabase as any)
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    if (data && data.length > 0) return;
    await (supabase as any)
      .from('user_roles')
      .upsert({ user_id: userId, role: 'user' }, { onConflict: 'user_id,role' });
  } catch (err) {
    console.error('ensureNormalUserRole error:', err);
  }
};

/** Upgrades a normal user into a buyer or a freelancer. */
export const upgradeToRole = async (userId: string, role: 'buyer' | 'freelancer') => {
  const { error } = await (supabase as any)
    .from('user_roles')
    .upsert({ user_id: userId, role }, { onConflict: 'user_id,role' });
  if (error) throw error;

  // Drop the placeholder "user" role (best effort — RLS may block it).
  try {
    await (supabase as any).from('user_roles').delete().eq('user_id', userId).eq('role', 'user');
  } catch (err) {
    console.warn('Could not remove placeholder user role:', err);
  }

  await (supabase as any).from('profiles').update({ role }).eq('id', userId);

  if (role === 'freelancer') {
    await (supabase as any).from('freelancers').upsert({ user_id: userId }, { onConflict: 'user_id' });
  } else {
    await (supabase as any).from('buyers').upsert({ user_id: userId }, { onConflict: 'user_id' });
  }
};

export const NEED_BUYER_MESSAGE =
  'To order a service, please complete your Buyer Dashboard.';
