import { supabase } from '@/integrations/supabase/client';

export type DeletableMessageKind = 'dm' | 'support' | 'news' | 'dispute';

interface StorageRef { bucket?: string | null; path?: string | null }

interface DeleteResult {
  deleted: boolean;
  reason?: string;
  file?: StorageRef | null;
  conversation_id?: string | null;
  broadcast?: boolean;
  removed?: number;
}

const RPC_BY_KIND: Record<DeletableMessageKind, string> = {
  dm: 'delete_message',
  support: 'delete_system_message',
  news: 'delete_system_message',
  dispute: 'delete_dispute_message',
};

/** Best-effort removal of the stored object behind a deleted attachment. */
export async function removeStoredFile(ref?: StorageRef | null): Promise<void> {
  if (!ref?.bucket || !ref?.path) return;
  try {
    const { error } = await supabase.storage.from(ref.bucket).remove([ref.path]);
    if (error) console.warn('storage cleanup failed', error.message);
  } catch (err) {
    console.warn('storage cleanup failed', err);
  }
}

/**
 * Permanently deletes a chat message through the backend.
 * The database function re-checks that the caller is the sender (or Fivesom
 * staff) and removes the row; the attached file is then removed from storage.
 * Throws with a readable message when the backend refuses.
 */
export async function deleteChatMessage(kind: DeletableMessageKind, messageId: string): Promise<DeleteResult> {
  const { data, error } = await (supabase as any).rpc(RPC_BY_KIND[kind], { _message_id: messageId });
  if (error) throw new Error(error.message || 'Could not delete message');
  const result = (data || { deleted: false }) as DeleteResult;
  if (result.deleted) await removeStoredFile(result.file);
  return result;
}
