import { supabase } from '@/integrations/supabase/client';

export const DELETE_GIG_CONFIRM =
  'Are you sure you want to permanently delete this gig? This action cannot be undone.';

interface StoredFile {
  bucket: string;
  path: string;
}

/**
 * Permanently deletes a gig.
 *
 * The database work happens inside the `delete_gig` RPC so it is atomic and
 * authorization is enforced server-side (owner or admin only, RLS stays on).
 * The RPC returns the storage objects that belonged to the gig, which we then
 * remove from their buckets so no orphaned files are left behind.
 */
export async function deleteGigCompletely(gigId: string): Promise<void> {
  const { data, error } = await (supabase as any).rpc('delete_gig', { _gig_id: gigId });
  if (error) throw error;

  const files: StoredFile[] = (data?.files ?? []) as StoredFile[];
  if (!files.length) return;

  // Group by bucket so each bucket is cleaned up in a single request.
  const byBucket = files.reduce<Record<string, string[]>>((acc, f) => {
    if (!f?.bucket || !f?.path) return acc;
    (acc[f.bucket] ||= []).push(f.path);
    return acc;
  }, {});

  await Promise.all(
    Object.entries(byBucket).map(async ([bucket, paths]) => {
      const { error: storageError } = await supabase.storage.from(bucket).remove(paths);
      // The gig row is already gone; a storage cleanup failure must not surface
      // as a failed deletion, but we do want it in the logs.
      if (storageError) console.warn(`Storage cleanup failed for ${bucket}`, storageError);
    })
  );
}
