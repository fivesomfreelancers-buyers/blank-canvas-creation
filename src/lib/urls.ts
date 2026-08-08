/**
 * Public URL helpers.
 *
 * Public pages are addressed by human-readable slugs, never by database UUIDs:
 *   /gig/{slug}            e.g. /gig/modern-business-website
 *   /freelancer/{username} e.g. /freelancer/aden-yusuf
 *
 * The UUID stays internal (primary key / relations only).
 */

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value?: string | null): boolean => !!value && UUID_RE.test(value);

/** Mirrors the database `slugify()` function so the client can build links locally. */
export const slugify = (text?: string | null): string =>
  (text || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);

/** Path for a gig. Falls back to the id only when a slug is genuinely missing. */
export const gigPath = (gig: { slug?: string | null; id?: string | null } | null | undefined): string => {
  if (!gig) return '/explore';
  return `/gig/${gig.slug || gig.id}`;
};

/** Path for a public freelancer profile. */
export const freelancerPath = (
  ref: { username?: string | null; id?: string | null } | string | null | undefined
): string => {
  if (!ref) return '/explore';
  if (typeof ref === 'string') return `/freelancer/${ref}`;
  return `/freelancer/${ref.username || ref.id}`;
};

/** Absolute URL for sharing (WhatsApp, social, copy-link). */
export const absoluteUrl = (path: string): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://fivesom.net';
  return `${origin}${path.startsWith('/') ? path : `/${path}`}`;
};
