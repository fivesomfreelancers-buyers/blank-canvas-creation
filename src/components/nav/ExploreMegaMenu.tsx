import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AppWindow, ChevronDown, ChevronRight, Clapperboard, Code2, Film, Globe, History, Palette, PenTool, Smartphone, Sparkles, Type, X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { supabase } from '@/integrations/supabase/client';
import { clearInterests, readInterests, recordInterest, topInterests, type Interest, type InterestKind } from '@/lib/exploreInterests';

const ICONS: Record<string, LucideIcon> = {
  'logo-design': PenTool, 'video-editing': Film, 'motion-graphics': Clapperboard, 'web-design': Globe,
  'content-writing': Type, 'app-ui-design': AppWindow, 'graphic-design': Palette, 'app-development': Smartphone, 'web-development': Code2,
};
export const categoryIcon = (slug: string) => ICONS[slug] ?? Sparkles;

type TagMap = Record<string, Record<string, string[]>>; // category -> subcategory -> tags
let tagCache: Promise<TagMap> | null = null;
const loadTags = () => {
  if (!tagCache) {
    tagCache = (async () => {
      const { data } = await supabase.from('gigs').select('category_slug, subcategory_slug, tags')
        .eq('status', 'active').eq('review_status', 'published').limit(1000);
      const map: TagMap = {};
      for (const g of data ?? []) {
        if (!g.category_slug) continue;
        const sub = g.subcategory_slug || '_';
        const bucket = ((map[g.category_slug] ??= {})[sub] ??= []);
        for (const t of g.tags ?? []) {
          const clean = String(t).trim();
          if (clean && !bucket.some((b) => b.toLowerCase() === clean.toLowerCase())) bucket.push(clean);
        }
      }
      return map;
    })().catch(() => ({}));
  }
  return tagCache;
};

const exploreHref = (cat?: string, sub?: string, q?: string) => {
  const p = new URLSearchParams();
  if (cat) p.set('category', cat);
  if (sub) p.set('subcategory', sub);
  if (q) p.set('q', q);
  return `/explore${p.toString() ? `?${p}` : ''}`;
};

/** Times how long a selection stays active; records it only after 10s. */
const useDwell = (sel: { kind: InterestKind; key: string; label: string; href: string } | null, onSaved: (l: Interest[]) => void) => {
  const start = useRef(0);
  useEffect(() => {
    if (!sel) return;
    start.current = Date.now();
    return () => onSaved(recordInterest(sel, (Date.now() - start.current) / 1000));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel?.kind, sel?.key]);
};

export const ExploreMegaMenu = () => {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState(CATEGORIES[0].slug);
  const [sub, setSub] = useState<string | null>(null);
  const [tags, setTags] = useState<TagMap>({});
  const [interests, setInterests] = useState<Interest[]>([]);
  const closeTimer = useRef<number>();

  useEffect(() => { if (open) { loadTags().then(setTags); setInterests(readInterests()); } }, [open]);

  const category = CATEGORIES.find((c) => c.slug === cat)!;
  const subDef = category.subcategories.find((s) => s.slug === sub);
  const focus = !open ? null : subDef
    ? { kind: 'subcategory' as const, key: `${cat}/${subDef.slug}`, label: subDef.name, href: exploreHref(cat, subDef.slug) }
    : { kind: 'category' as const, key: cat, label: category.name, href: exploreHref(cat) };
  useDwell(focus, setInterests);

  const catTags = tags[cat] ?? {};
  const shownTags = (sub ? catTags[sub] ?? [] : Object.values(catTags).flat())
    .filter((t, i, a) => a.findIndex((x) => x.toLowerCase() === t.toLowerCase()) === i).slice(0, 18);
  const recent = topInterests(interests);

  const show = () => { window.clearTimeout(closeTimer.current); setOpen(true); };
  const hide = () => { closeTimer.current = window.setTimeout(() => setOpen(false), 150); };
  const close = () => setOpen(false);

  return (
    <div className="relative" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-10 items-center gap-1.5 rounded-full px-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground aria-expanded:text-foreground"
      >
        Explore <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} aria-hidden />
      </button>

      {open && (
        <div className="absolute left-1/2 top-full z-50 w-[min(1040px,calc(100vw-2rem))] -translate-x-1/2 pt-3 animate-fade-in">
          <div className="overflow-hidden rounded-2xl border border-border bg-popover shadow-2xl shadow-primary/10">
            <div className="grid grid-cols-[240px_1fr_280px]">
              <div className="border-r border-border p-3">
                <p className="px-3 pb-2 pt-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Categories</p>
                {CATEGORIES.map((c) => {
                  const Icon = categoryIcon(c.slug);
                  const active = c.slug === cat;
                  return (
                    <button key={c.slug} type="button" onMouseEnter={() => { setCat(c.slug); setSub(null); }} onClick={() => { setCat(c.slug); setSub(null); }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors ${active ? 'bg-accent font-semibold text-primary' : 'text-foreground hover:bg-muted'}`}>
                      <Icon className="h-4 w-4 shrink-0" aria-hidden />
                      <span className="flex-1">{c.name}</span>
                      <ChevronRight className="h-4 w-4 opacity-60" aria-hidden />
                    </button>
                  );
                })}
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{category.name}</p>
                  <Link to={exploreHref(cat)} onClick={close} className="text-xs font-semibold text-primary hover:underline">View all</Link>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {category.subcategories.map((s) => (
                    <button key={s.slug} type="button" onClick={() => setSub(s.slug)}
                      className={`rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${sub === s.slug ? 'bg-accent font-semibold text-primary' : 'text-foreground hover:bg-muted'}`}>
                      {s.name}
                    </button>
                  ))}
                </div>
                {subDef && (
                  <Link to={exploreHref(cat, subDef.slug)} onClick={close}
                    className="mt-4 inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
                    Browse {subDef.name} <ChevronRight className="h-4 w-4" aria-hidden />
                  </Link>
                )}
              </div>

              <div className="border-l border-border bg-muted/40 p-5">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Skills & tags</p>
                {shownTags.length ? (
                  <div className="flex flex-wrap gap-2">
                    {shownTags.map((t) => (
                      <Link key={t} to={exploreHref(cat, sub ?? undefined, t)}
                        onClick={() => { setInterests(recordInterest({ kind: 'tag', key: t.toLowerCase(), label: t, href: exploreHref(cat, sub ?? undefined, t) }, 10)); close(); }}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary hover:text-primary">
                        {t}
                      </Link>
                    ))}
                  </div>
                ) : <p className="text-sm text-muted-foreground">No tags from published gigs here yet.</p>}

                {recent.length > 0 && (
                  <div className="mt-6">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><History className="h-3.5 w-3.5" aria-hidden />Your recent interests</p>
                      <button type="button" onClick={() => { clearInterests(); setInterests([]); }} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"><X className="h-3 w-3" aria-hidden />Clear</button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recent.map((r) => (
                        <Link key={r.kind + r.key} to={r.href} onClick={close} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/20">{r.label}</Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-6 border-t border-border px-6 py-3 text-sm font-medium">
              <Link to="/explore" onClick={close} className="inline-flex items-center gap-1 text-primary hover:underline">See all gigs <ChevronRight className="h-4 w-4" /></Link>
              <Link to="/jobs" onClick={close} className="inline-flex items-center gap-1 text-primary hover:underline">Browse jobs <ChevronRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Compact category → subcategory list for the phone menu. */
export const ExploreMobileMenu = ({ onNavigate }: { onNavigate: () => void }) => {
  const [openCat, setOpenCat] = useState<string | null>(null);
  return (
    <div className="space-y-1">
      <Link to="/explore" onClick={onNavigate} className="block py-2 font-semibold text-foreground">Explore all</Link>
      {CATEGORIES.map((c) => {
        const Icon = categoryIcon(c.slug);
        const isOpen = openCat === c.slug;
        return (
          <div key={c.slug}>
            <button type="button" onClick={() => setOpenCat(isOpen ? null : c.slug)} aria-expanded={isOpen}
              className="flex min-h-11 w-full items-center gap-3 text-left text-foreground">
              <Icon className="h-4 w-4 text-primary" aria-hidden /><span className="flex-1">{c.name}</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            {isOpen && (
              <div className="mb-2 ml-7 grid gap-1">
                <Link to={exploreHref(c.slug)} onClick={onNavigate} className="py-1.5 text-sm font-semibold text-primary">All {c.name}</Link>
                {c.subcategories.map((s) => (
                  <Link key={s.slug} to={exploreHref(c.slug, s.slug)} onClick={onNavigate} className="py-1.5 text-sm text-muted-foreground">{s.name}</Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
