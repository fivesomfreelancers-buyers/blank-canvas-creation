/**
 * URL safety helpers.
 *
 * User-supplied links (order requirement links, delivery links, report context URLs)
 * must never be rendered as an <a href> or opened without checking the scheme —
 * a `javascript:` / `data:` URI would execute in the clicker's session.
 */

/** Returns the URL when it is a safe http(s) link, otherwise null. */
export function safeExternalUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString();
    return null;
  } catch {
    // Allow bare domains typed without a scheme by upgrading them to https.
    if (/^[\w-]+(\.[\w-]+)+([/?#].*)?$/.test(trimmed)) {
      try {
        const url = new URL(`https://${trimmed}`);
        return url.toString();
      } catch {
        return null;
      }
    }
    return null;
  }
}

export function isSafeExternalUrl(value?: string | null): boolean {
  return safeExternalUrl(value) !== null;
}

/** Opens a link only when it is a safe http(s) URL. */
export function openSafeUrl(value?: string | null) {
  const safe = safeExternalUrl(value);
  if (safe) window.open(safe, '_blank', 'noopener,noreferrer');
}
