import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertTriangle, RefreshCw, Globe, FileCode2, FileText, Link2, Image as ImageIcon } from 'lucide-react';

type CheckStatus = 'pass' | 'fail' | 'warn';

interface CheckResult {
  id: string;
  label: string;
  path: string;
  icon: React.ElementType;
  status: CheckStatus;
  details: string[];
  contentType?: string;
}

const PATHS = {
  sitemap: '/sitemap.xml',
  robots: '/robots.txt',
  ads: '/ads.txt',
  ogImage: '/og-image.png',
  home: '/',
};

async function fetchPath(path: string): Promise<{ ok: boolean; status: number; contentType: string; body: string }> {
  const res = await fetch(`${path}?_seo_check=${Date.now()}`, { cache: 'no-store' });
  const contentType = res.headers.get('content-type') || '';
  const body = await res.text();
  return { ok: res.ok, status: res.status, contentType, body };
}

function isHtml(contentType: string, body: string): boolean {
  return contentType.includes('text/html') || /^\s*<!doctype html/i.test(body);
}

function checkSitemap(r: Awaited<ReturnType<typeof fetchPath>>): CheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'pass';

  if (!r.ok) {
    return { id: 'sitemap', label: 'sitemap.xml', path: PATHS.sitemap, icon: FileCode2, status: 'fail', details: [`HTTP ${r.status} — file not reachable.`], contentType: r.contentType };
  }

  if (isHtml(r.contentType, r.body)) {
    status = 'fail';
    details.push('Served as HTML, not XML — Search Console will reject it ("Sitemap is HTML"). Check that static-file redirects exclude /sitemap.xml.');
  }

  const doc = new DOMParser().parseFromString(r.body, 'application/xml');
  const parseError = doc.querySelector('parsererror');
  if (parseError && status !== 'fail') {
    status = 'fail';
    details.push('XML parse error — the file is not valid XML.');
  }

  if (!parseError && !isHtml(r.contentType, r.body)) {
    const urls = doc.querySelectorAll('url > loc');
    if (urls.length === 0) {
      status = 'warn';
      details.push('Valid XML but no <url> entries found.');
    } else {
      details.push(`${urls.length} URLs listed.`);
    }
    const bad = Array.from(urls).filter((u) => !/^https:\/\//.test(u.textContent || ''));
    if (bad.length > 0) {
      status = 'warn';
      details.push(`${bad.length} URL(s) are not absolute https:// links.`);
    }
  }

  if (!r.contentType.includes('xml') && status === 'pass') {
    status = 'warn';
    details.push(`Content-Type is "${r.contentType || 'none'}" — Google prefers application/xml or text/xml.`);
  }

  return { id: 'sitemap', label: 'sitemap.xml', path: PATHS.sitemap, icon: FileCode2, status, details, contentType: r.contentType };
}

function checkRobots(r: Awaited<ReturnType<typeof fetchPath>>): CheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'pass';

  if (!r.ok) {
    return { id: 'robots', label: 'robots.txt', path: PATHS.robots, icon: FileText, status: 'fail', details: [`HTTP ${r.status} — file not reachable.`], contentType: r.contentType };
  }
  if (isHtml(r.contentType, r.body)) {
    return { id: 'robots', label: 'robots.txt', path: PATHS.robots, icon: FileText, status: 'fail', details: ['Served as HTML, not plain text — check static-file redirects.'], contentType: r.contentType };
  }

  if (/Disallow:\s*\/\s*$/m.test(r.body) && !/Allow:\s*\//.test(r.body)) {
    status = 'fail';
    details.push('Contains a blanket "Disallow: /" — this blocks every crawler from the whole site.');
  }
  if (!/^Sitemap:\s*https?:\/\//m.test(r.body)) {
    status = status === 'pass' ? 'warn' : status;
    details.push('No "Sitemap:" directive found — add one pointing at https://fivesom.net/sitemap.xml.');
  } else {
    details.push('Sitemap directive present.');
  }
  if (/Googlebot-Image/i.test(r.body)) details.push('Googlebot-Image rule present (gig photos can be indexed).');

  return { id: 'robots', label: 'robots.txt', path: PATHS.robots, icon: FileText, status, details, contentType: r.contentType };
}

function checkAds(r: Awaited<ReturnType<typeof fetchPath>>): CheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'pass';

  if (!r.ok) {
    return { id: 'ads', label: 'ads.txt', path: PATHS.ads, icon: FileText, status: 'fail', details: [`HTTP ${r.status} — AdSense requires this file at the domain root.`], contentType: r.contentType };
  }
  if (isHtml(r.contentType, r.body)) {
    return { id: 'ads', label: 'ads.txt', path: PATHS.ads, icon: FileText, status: 'fail', details: ['Served as HTML, not plain text — check static-file redirects.'], contentType: r.contentType };
  }
  const line = r.body.split('\n').map((l) => l.trim()).find((l) => l.startsWith('google.com'));
  if (!line) {
    status = 'fail';
    details.push('No google.com entry found — AdSense will not verify.');
  } else {
    const parts = line.split(',').map((p) => p.trim());
    if (!/^pub-\d+$/.test(parts[1] || '')) {
      status = 'fail';
      details.push('Publisher ID does not look like "pub-…".');
    } else if ((parts[2] || '').toUpperCase() !== 'DIRECT' && (parts[2] || '').toUpperCase() !== 'RESELLER') {
      status = 'fail';
      details.push(`Relationship field "${parts[2]}" should be DIRECT or RESELLER.`);
    } else {
      details.push(`Publisher entry OK: ${parts[1]} (${parts[2].toUpperCase()}).`);
    }
  }

  return { id: 'ads', label: 'ads.txt', path: PATHS.ads, icon: FileText, status, details, contentType: r.contentType };
}

function checkHome(r: Awaited<ReturnType<typeof fetchPath>>): CheckResult {
  const details: string[] = [];
  let status: CheckStatus = 'pass';

  if (!r.ok) {
    return { id: 'canonical', label: 'Homepage canonical & meta', path: PATHS.home, icon: Link2, status: 'fail', details: [`HTTP ${r.status} — homepage not reachable.`], contentType: r.contentType };
  }

  const doc = new DOMParser().parseFromString(r.body, 'text/html');
  const canonicals = Array.from(doc.querySelectorAll('link[rel="canonical"]'));
  if (canonicals.length === 0) {
    status = 'fail';
    details.push('No canonical link found in the homepage head.');
  } else if (canonicals.length > 1) {
    status = 'fail';
    details.push(`${canonicals.length} canonical links found — there must be exactly one.`);
  } else {
    const href = canonicals[0].getAttribute('href') || '';
    if (!/^https:\/\//.test(href)) {
      status = 'warn';
      details.push(`Canonical "${href}" is not an absolute https:// URL.`);
    } else {
      details.push(`Canonical: ${href}`);
    }
  }

  const robots = doc.querySelector('meta[name="robots"]')?.getAttribute('content') || '';
  if (/noindex/i.test(robots)) {
    status = 'fail';
    details.push(`meta robots says "${robots}" — the homepage is blocked from Google.`);
  } else if (robots) {
    details.push(`meta robots: ${robots}`);
  }

  const title = doc.querySelector('title')?.textContent?.trim() || '';
  const desc = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  if (!title) { status = 'fail'; details.push('Missing <title>.'); } else details.push(`Title (${title.length} chars): "${title.slice(0, 70)}${title.length > 70 ? '…' : ''}"`);
  if (!desc) { status = 'fail'; details.push('Missing meta description.'); } else details.push(`Description (${desc.length} chars).`);

  return { id: 'canonical', label: 'Homepage canonical & meta', path: PATHS.home, icon: Link2, status, details, contentType: r.contentType };
}

function checkOgImage(r: Awaited<ReturnType<typeof fetchPath>>): CheckResult {
  if (!r.ok) {
    return { id: 'ogimage', label: 'og-image.png', path: PATHS.ogImage, icon: ImageIcon, status: 'fail', details: [`HTTP ${r.status} — social share image not reachable.`], contentType: r.contentType };
  }
  if (!r.contentType.includes('image/')) {
    return { id: 'ogimage', label: 'og-image.png', path: PATHS.ogImage, icon: ImageIcon, status: 'fail', details: [`Served as "${r.contentType || 'unknown'}", not an image — check static-file redirects.`], contentType: r.contentType };
  }
  return { id: 'ogimage', label: 'og-image.png', path: PATHS.ogImage, icon: ImageIcon, status: 'pass', details: ['Served as an image — link previews will work.'], contentType: r.contentType };
}

const AdminSeoChecks = () => {
  const [results, setResults] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [ranAt, setRanAt] = useState<Date | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    const origin = window.location.origin;
    const [sitemap, robots, ads, home, og] = await Promise.all(
      [PATHS.sitemap, PATHS.robots, PATHS.ads, PATHS.home, PATHS.ogImage].map((p) =>
        fetchPath(p).catch((e) => ({ ok: false, status: 0, contentType: '', body: String(e) }))
      )
    );
    setResults([checkSitemap(sitemap), checkRobots(robots), checkAds(ads), checkHome(home), checkOgImage(og)]);
    setRanAt(new Date());
    setLoading(false);
    void origin;
  }, []);

  useEffect(() => { run(); }, [run]);

  const statusIcon = (s: CheckStatus) =>
    s === 'pass' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> :
    s === 'warn' ? <AlertTriangle className="h-5 w-5 text-yellow-500" /> :
    <XCircle className="h-5 w-5 text-destructive" />;

  const passCount = results.filter((r) => r.status === 'pass').length;
  const warnCount = results.filter((r) => r.status === 'warn').length;
  const failCount = results.filter((r) => r.status === 'fail').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5" /> Pre-publish SEO checks
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Verified against <span className="font-medium text-foreground">{typeof window !== 'undefined' ? window.location.origin : ''}</span>
            {ranAt && <> — last run {ranAt.toLocaleTimeString()}</>}
          </p>
        </div>
        <Button onClick={run} disabled={loading} size="sm" variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Re-run checks
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-emerald-500">{passCount}</p><p className="text-xs text-muted-foreground">Passing</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-yellow-500">{warnCount}</p><p className="text-xs text-muted-foreground">Warnings</p></CardContent></Card>
        <Card className="border-border bg-card"><CardContent className="pt-6"><p className="text-2xl font-bold text-destructive">{failCount}</p><p className="text-xs text-muted-foreground">Failing</p></CardContent></Card>
      </div>

      {loading && results.length === 0 ? (
        <div className="flex justify-center py-16"><div className="animate-spin h-8 w-8 border-b-2 border-primary rounded-full" /></div>
      ) : (
        <div className="space-y-4">
          {results.map((r) => (
            <Card key={r.id} className={`border-border bg-card ${r.status === 'fail' ? 'border-destructive/40' : r.status === 'warn' ? 'border-yellow-500/40' : ''}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <r.icon className="h-4 w-4" />
                    {r.label}
                    <code className="text-xs text-muted-foreground font-normal">{r.path}</code>
                  </span>
                  {statusIcon(r.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {r.details.map((d, i) => (
                  <p key={i} className="text-sm text-foreground">{d}</p>
                ))}
                {r.contentType !== undefined && (
                  <p className="text-xs text-muted-foreground">Content-Type: {r.contentType || '(none)'}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="border-border bg-card">
        <CardContent className="pt-6 text-sm text-muted-foreground space-y-1">
          <p>Run this after every publish and before resubmitting the sitemap in Google Search Console.</p>
          <p>Note: in the editor preview, checks run against the preview address — after publishing, open the live admin at fivesom.net/admin to verify the real domain.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSeoChecks;
