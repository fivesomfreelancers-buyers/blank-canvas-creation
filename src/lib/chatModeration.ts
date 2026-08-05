/**
 * Chat moderation has been removed.
 *
 * Messages are no longer filtered, scored, or blocked on the client, and there is
 * no automatic suspension. Moderation is handled manually by administrators.
 *
 * These functions are kept as no-op shims so existing call sites keep working.
 */

export type ModerationResult =
  | { allowed: true }
  | { allowed: false; reason: 'nsfw' | 'profanity'; message: string };

const ALLOWED: ModerationResult = { allowed: true };

const LEGACY_KEYS = ['fivesom_chat_strikes', 'fivesom_chat_block', 'chat_strikes', 'chat_block'];

// Clear any suspension left over from the old system so previously blocked users
// can chat immediately.
try {
  if (typeof localStorage !== 'undefined') {
    Object.keys(localStorage).forEach((key) => {
      if (LEGACY_KEYS.some((k) => key.startsWith(k)) || /chat[_-]?(strike|block|suspend)/i.test(key)) {
        localStorage.removeItem(key);
      }
    });
  }
} catch {
  /* ignore storage errors */
}

export function moderateText(_text: string): ModerationResult {
  return ALLOWED;
}

export async function moderateImageFile(_file: File): Promise<ModerationResult> {
  return ALLOWED;
}

export function recordStrike(_userId: string): { count: number; blocked: boolean; warning: string } {
  return { count: 0, blocked: false, warning: '' };
}

export function isChatBlocked(_userId: string): { blocked: boolean; minutesLeft: number } {
  return { blocked: false, minutesLeft: 0 };
}
