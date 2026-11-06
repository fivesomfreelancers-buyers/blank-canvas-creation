export const SITE_URL = 'https://fivesom.net';

/** Netlify serves prerendered directories at slash-terminated URLs. */
export function canonicalSeoUrl(path: string): string {
  const url = new URL(path || '/', `${SITE_URL}/`);
  if (url.origin !== SITE_URL) return url.href;
  url.search = '';
  url.hash = '';
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url.href;
}

/** Media URLs must not receive page-style trailing slashes. */
export function absoluteAssetUrl(path: string): string {
  return new URL(path || '/', `${SITE_URL}/`).href;
}