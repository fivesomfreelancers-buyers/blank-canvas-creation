/**
 * Pre-deploy route and link validation.
 *
 * Runs before every build (prebuild) so a broken link or a sitemap URL without
 * a matching route is caught before the site is published.
 *
 * It checks:
 *  1. Every <loc> in public/sitemap.xml matches a route declared in src/App.tsx.
 *  2. Every internal link written in the source (to="/..." / href="/...")
 *     matches a declared route.
 *  3. A catch-all "*" route exists so genuinely invalid URLs render the
 *     in-app 404 page instead of a hosting error page.
 *  4. The SPA fallback config (public/_redirects) is present, so direct access
 *     and refresh on nested URLs work in production.
 */

import { readFileSync, existsSync } from 'fs';
import { readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

const root = resolve(process.cwd());
const appSource = readFileSync(join(root, 'src/App.tsx'), 'utf8');

/** Route patterns declared in App.tsx, e.g. "/gig/:slug" or "/admin/*". */
const routePatterns = [...appSource.matchAll(/<Route\s+path="([^"]+)"/g)].map(m => m[1]);

if (!routePatterns.includes('*')) {
  throw new Error('check-routes: no catch-all "*" route found in src/App.tsx');
}

const toRegex = (pattern: string) => {
  const body = pattern
    .split('/')
    .filter(Boolean)
    .map(seg => (seg.startsWith(':') ? '[^/]+' : seg === '*' ? '.*' : seg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    .join('/');
  return new RegExp(`^/${body}/?$`);
};

const matchers = routePatterns.filter(p => p !== '*').map(toRegex);
const matchesRoute = (path: string) => matchers.some(re => re.test(path));

const problems: string[] = [];

// ---------------------------------------------------------------- 1. sitemap
const sitemapPath = join(root, 'public/sitemap.xml');
if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, 'utf8');
  if (!xml.trimStart().startsWith('<?xml')) problems.push('public/sitemap.xml is not XML');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  for (const loc of locs) {
    let path: string;
    try {
      path = new URL(loc).pathname;
    } catch {
      problems.push(`sitemap: "${loc}" is not an absolute URL`);
      continue;
    }
    if (!matchesRoute(path)) problems.push(`sitemap URL has no matching route: ${path}`);
  }
  console.log(`check-routes: validated ${locs.length} sitemap URLs`);
} else {
  console.warn('check-routes: public/sitemap.xml not found (skipped)');
}

// ----------------------------------------------------------- 2. source links
const IGNORED_PREFIXES = ['//', '/#'];
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap(name => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : /\.(tsx|ts)$/.test(name) ? [full] : [];
  });

const linkPattern = /(?:to|href)=["'](\/[^"'`${}\s]*)["']/g;
let linkCount = 0;
for (const file of walk(join(root, 'src'))) {
  const src = readFileSync(file, 'utf8');
  for (const m of src.matchAll(linkPattern)) {
    const raw = m[1];
    if (IGNORED_PREFIXES.some(p => raw.startsWith(p))) continue;
    const path = raw.split(/[?#]/)[0] || '/';
    linkCount++;
    if (!matchesRoute(path)) {
      problems.push(`broken internal link "${raw}" in ${file.replace(`${root}/`, '')}`);
    }
  }
}
console.log(`check-routes: validated ${linkCount} internal links`);

// ------------------------------------------------------------ 3. SPA config
if (!existsSync(join(root, 'public/_redirects')) && !existsSync(join(root, 'netlify.toml'))) {
  problems.push('SPA fallback config missing: add public/_redirects or netlify.toml');
}

// ------------------------------------------------------------------- report
if (problems.length) {
  console.error(`\ncheck-routes: ${problems.length} problem(s) found:`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log('check-routes: all routes, links and sitemap URLs OK');
