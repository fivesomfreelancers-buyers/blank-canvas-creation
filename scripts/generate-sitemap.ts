// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Public gigs (/gig/{slug}) and public freelancer profiles (/freelancer/{username})
// are pulled from Supabase at build time, so new ones appear automatically and
// deleted / paused ones drop out on the next build.

import { writeFileSync } from "fs";
import { resolve } from "path";
import { CATEGORIES } from "../src/lib/categories";

const BASE_URL = "https://fivesom.net";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
  images?: { loc: string; title: string }[];
}

// Public, indexable routes only. Dashboards, admin, founders, messages,
// orders, settings, payment and any authenticated route are intentionally absent.
const staticEntries: SitemapEntry[] = [
  { path: "/", changefreq: "daily", priority: "1.0" },
  { path: "/explore", changefreq: "daily", priority: "0.9" },
  { path: "/services", changefreq: "weekly", priority: "0.9" },
  {
    path: "/how-it-works",
    changefreq: "monthly",
    priority: "0.7",
    images: [
      { loc: "/images/how-it-works/find-perfect-freelancer.webp", title: "Find the perfect freelancer on FIVESOM" },
      { loc: "/images/how-it-works/collaborate-securely.webp", title: "Collaborate securely on FIVESOM" },
      { loc: "/images/how-it-works/secure-escrow-payment.webp", title: "FIVESOM secure escrow payment process" },
      { loc: "/images/how-it-works/release-payment.webp", title: "Release payment after delivery on FIVESOM" },
    ],
  },
  { path: "/docs", changefreq: "monthly", priority: "0.7" },
  { path: "/vip", changefreq: "monthly", priority: "0.6" },
  { path: "/about", changefreq: "monthly", priority: "0.6" },
  { path: "/blog", changefreq: "weekly", priority: "0.8" },
  // /login and /forgot-password are intentionally excluded: they are noindex
  // and/or disallowed in robots.txt, so listing them would be a conflict.
  { path: "/register", changefreq: "yearly", priority: "0.5" },
  { path: "/register/buyer", changefreq: "yearly", priority: "0.4" },
  { path: "/register/freelancer", changefreq: "yearly", priority: "0.4" },

  { path: "/legal/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/legal/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/legal/cookies", changefreq: "yearly", priority: "0.3" },
  { path: "/delete-account", changefreq: "yearly", priority: "0.3" },
];

// Dedicated SEO landing pages: one per category and one per service type,
// straight from the app's single source of truth for categories.
const categoryEntries: SitemapEntry[] = CATEGORIES.flatMap((c) => [
  { path: `/services/${c.slug}`, changefreq: "daily" as const, priority: "0.8" },
  ...c.subcategories.map((s) => ({
    path: `/services/${c.slug}/${s.slug}`,
    changefreq: "weekly" as const,
    priority: "0.7",
  })),
]);

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function rest<T>(path: string): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) {
      console.warn(`sitemap: ${path} -> ${res.status} ${await res.text()}`);
      return [];
    }
    return (await res.json()) as T[];
  } catch (err) {
    console.warn(`sitemap: ${path} failed:`, (err as Error).message);
    return [];
  }
}

async function dynamicEntries(): Promise<SitemapEntry[]> {
  const gigs = await rest<{
    slug: string | null;
    title: string | null;
    updated_at: string | null;
    freelancer_id: string;
    thumbnail_url: string | null;
    images: string[] | null;
  }>(
    "gigs?select=slug,title,updated_at,freelancer_id,thumbnail_url,images&status=eq.active&slug=not.is.null&limit=5000",
  );

  const posts = await rest<{ slug: string; updated_at: string | null }>(
    "blog_posts?select=slug,updated_at&status=eq.published&limit=5000",
  );

  const entries: SitemapEntry[] = [];
  const activeFreelancerIds = new Set<string>();

  for (const post of posts) {
    if (!post.slug) continue;
    entries.push({
      path: `/blog/${encodeURIComponent(post.slug)}`,
      lastmod: post.updated_at ? post.updated_at.slice(0, 10) : undefined,
      changefreq: "monthly",
      priority: "0.7",
    });
  }

  for (const gig of gigs) {
    if (!gig.slug) continue;
    activeFreelancerIds.add(gig.freelancer_id);
    // Gig gallery images are listed with the Gig URL so Google Images can index
    // the real service previews (max 10 per URL, absolute public storage URLs).
    const gigTitle = (gig.title || "FIVESOM service").trim();
    const gigImages = [gig.thumbnail_url, ...(gig.images || [])]
      .filter((url): url is string => typeof url === "string" && /^https?:\/\//i.test(url))
      .filter((url, i, all) => all.indexOf(url) === i)
      .slice(0, 10)
      .map((url, i) => ({
        loc: url,
        title: escapeXml(i === 0 ? gigTitle : `${gigTitle} - preview ${i + 1}`),
      }));

    entries.push({
      path: `/gig/${encodeURIComponent(gig.slug)}`,
      lastmod: gig.updated_at ? gig.updated_at.slice(0, 10) : undefined,
      changefreq: "weekly",
      priority: "0.8",
      images: gigImages,
    });
  }

  // Only freelancers who actually have a live gig get a profile URL, so every
  // /freelancer/{username} in the sitemap renders real content (never a 404).
  if (activeFreelancerIds.size > 0) {
    const freelancers = await rest<{ id: string; user_id: string }>(
      "public_freelancers?select=id,user_id&limit=5000",
    );
    const userIds = new Set(
      freelancers.filter((f) => activeFreelancerIds.has(f.id)).map((f) => f.user_id),
    );

    const profiles = await rest<{ id: string; username: string | null }>(
      "public_profiles?select=id,username&limit=5000",
    );
    for (const p of profiles) {
      if (!p.username || !userIds.has(p.id)) continue;
      entries.push({
        path: `/freelancer/${encodeURIComponent(p.username)}`,
        changefreq: "weekly",
        priority: "0.7",
      });
    }
  }

  return entries;
}

function generateSitemap(entries: SitemapEntry[]) {
  const seen = new Set<string>();
  const urls = entries
    .filter((e) => {
      if (seen.has(e.path)) return false;
      seen.add(e.path);
      return true;
    })
    .map((e) =>
      [
        `  <url>`,
        `    <loc>${BASE_URL}${e.path}</loc>`,
        e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
        e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
        e.priority ? `    <priority>${e.priority}</priority>` : null,
        ...(e.images || []).flatMap((image) => [
          `    <image:image>`,
          `      <image:loc>${escapeXml(/^https?:\/\//i.test(image.loc) ? image.loc : `${BASE_URL}${image.loc}`)}</image:loc>`,
          `      <image:title>${image.title}</image:title>`,
          `    </image:image>`,
        ]),
        `  </url>`,
      ]
        .filter(Boolean)
        .join("\n"),
    );

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">`,
    ...urls,
    `</urlset>`,
  ].join("\n");
}

const entries = [...staticEntries, ...categoryEntries, ...(await dynamicEntries())];
writeFileSync(resolve("public/sitemap.xml"), generateSitemap(entries));
console.log(`sitemap.xml written (${entries.length} entries)`);
