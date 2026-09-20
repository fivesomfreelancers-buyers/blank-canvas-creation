/**
 * Per-page head metadata for public gig pages and public freelancer profiles.
 *
 * FIVESOM is a client-rendered app: the HTML that Netlify serves is always the
 * same index.html, so every /gig/... URL used to advertise the site-wide share
 * image. Google therefore showed one single picture for every gig result.
 *
 * This edge function fetches the gig (or freelancer) straight from Supabase and
 * rewrites <title>, description, canonical and the og/twitter image in the HTML
 * *before* it reaches the crawler, so each gig page carries the exact image the
 * freelancer uploaded. Only public data is read (active gigs, public_* views),
 * and only with the publishable anon key.
 */

const SUPABASE_URL = "https://afjcjjelgppctsnmtbek.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmamNqamVsZ3BwY3Rzbm10YmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzQ2MDksImV4cCI6MjA4Nzg1MDYwOX0.az4XkiqJ-kv5g8Ji7SQ3nCN78cHKV-925ufkm8m-x8A";
const SITE_URL = "https://fivesom.net";

const enc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

/** Trim to a whole word, no ellipsis — used for titles. */
const cut = (s: string, max: number) => {
  const t = s.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const short = t.slice(0, max);
  return short.slice(0, short.lastIndexOf(" ") > 20 ? short.lastIndexOf(" ") : max).trim();
};

const clean = (s: string, max: number) => {
  const t = s.replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1).trimEnd()}…` : t;
};

async function rest<T>(path: string): Promise<T[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
    });
    if (!res.ok) return [];
    return (await res.json()) as T[];
  } catch {
    return [];
  }
}

interface Meta {
  title: string;
  description: string;
  canonical: string;
  image?: string;
  imageAlt?: string;
  type: string;
}

const publicImage = (url: unknown): string | undefined =>
  typeof url === "string" && /^https:\/\/[^\s]+\/storage\/v1\/object\/public\//i.test(url)
    ? url
    : undefined;

async function gigMeta(slug: string): Promise<Meta | null> {
  const [gig] = await rest<{
    id: string;
    title: string | null;
    description: string | null;
    thumbnail_url: string | null;
    images: string[] | null;
    category_slug: string | null;
    base_price: number | null;
    delivery_time_days: number | null;
    freelancer_id: string | null;
  }>(
    `gigs?select=id,title,description,thumbnail_url,images,category_slug,base_price,delivery_time_days,freelancer_id&status=eq.active&slug=eq.${encodeURIComponent(slug)}&limit=1`,
  );
  if (!gig?.title) return null;

  let seller = "";
  if (gig.freelancer_id) {
    const [f] = await rest<{ user_id: string }>(
      `public_freelancers?select=user_id&id=eq.${gig.freelancer_id}&limit=1`,
    );
    if (f?.user_id) {
      const [p] = await rest<{ full_name: string | null }>(
        `public_profiles?select=full_name&id=eq.${f.user_id}&limit=1`,
      );
      seller = (p?.full_name || "").trim();
    }
  }

  const image =
    publicImage(gig.thumbnail_url) ||
    (gig.images || []).map(publicImage).find(Boolean) ||
    undefined;

  const price = gig.base_price ? ` From $${Number(gig.base_price).toFixed(2)}.` : "";
  const days = gig.delivery_time_days ? ` Delivery in ${gig.delivery_time_days} days.` : "";
  const by = seller ? ` by ${seller}` : "";

  return {
    title: `${cut(gig.title, 60)} | FIVESOM`,
    description: clean(
      `${gig.description || gig.title}${price}${days}${by ? ` Offered${by} on FIVESOM.` : " Hire African freelancers on FIVESOM with escrow-protected payment."}`,
      300,
    ),
    canonical: `${SITE_URL}/gig/${encodeURIComponent(slug)}`,
    image,
    imageAlt: `${clean(gig.title, 90)} — freelance service on FIVESOM${by}`,
    type: "product",
  };
}

async function freelancerMeta(username: string): Promise<Meta | null> {
  const [p] = await rest<{
    id: string;
    full_name: string | null;
    username: string | null;
    profile_image_url: string | null;
    bio: string | null;
  }>(
    `public_profiles?select=id,full_name,username,profile_image_url,bio&username=eq.${encodeURIComponent(username)}&limit=1`,
  );
  if (!p) return null;
  const name = (p.full_name || p.username || "Freelancer").trim();
  return {
    title: `${cut(name, 60)} — Freelancer on FIVESOM`,
    description: clean(
      `${p.bio || `${name} offers freelance services on FIVESOM.`} View gigs, reviews and delivery times, and order with escrow-protected payment.`,
      300,
    ),
    canonical: `${SITE_URL}/freelancer/${encodeURIComponent(username)}`,
    image: publicImage(p.profile_image_url),
    imageAlt: `${clean(name, 90)} — freelancer on FIVESOM`,
    type: "profile",
  };
}

function rewrite(html: string, meta: Meta): string {
  let out = html;

  const drop = [
    /<title>[\s\S]*?<\/title>\s*/i,
    /<meta\s+name="description"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:title"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:description"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:type"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:url"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:image"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:image:width"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:image:height"[\s\S]*?\/>\s*/i,
    /<meta\s+property="og:image:alt"[\s\S]*?\/>\s*/i,
    /<meta\s+name="twitter:image"[\s\S]*?\/>\s*/i,
    /<meta\s+name="twitter:title"[\s\S]*?\/>\s*/i,
    /<meta\s+name="twitter:description"[\s\S]*?\/>\s*/i,
  ];
  for (const re of drop) out = out.replace(re, "");

  const image = meta.image || `${SITE_URL}/og-image.png`;
  const tags = [
    `<title>${enc(meta.title)}</title>`,
    `<meta name="description" content="${enc(meta.description)}" />`,
    `<link rel="canonical" href="${enc(meta.canonical)}" />`,
    `<meta property="og:title" content="${enc(meta.title)}" />`,
    `<meta property="og:description" content="${enc(meta.description)}" />`,
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:url" content="${enc(meta.canonical)}" />`,
    `<meta property="og:image" content="${enc(image)}" />`,
    `<meta property="og:image:alt" content="${enc(meta.imageAlt || meta.title)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${enc(meta.title)}" />`,
    `<meta name="twitter:description" content="${enc(meta.description)}" />`,
    `<meta name="twitter:image" content="${enc(image)}" />`,
    // Tells the browser and image crawlers about the freelancer's own upload
    // before any JavaScript runs.
    meta.image
      ? `<link rel="preload" as="image" href="${enc(meta.image)}" fetchpriority="high" />`
      : "",
  ]
    .filter(Boolean)
    .join("\n    ");

  out = out.replace(/<\/head>/i, `  ${tags}\n  </head>`);

  if (meta.image) {
    // A real <img> for crawlers that do not execute JavaScript. React replaces
    // the contents of #root on mount, so visitors never see it.
    out = out.replace(
      /<div id="root"><\/div>/i,
      `<div id="root"><img src="${enc(meta.image)}" alt="${enc(meta.imageAlt || meta.title)}" width="1" height="1" style="position:absolute;opacity:0;pointer-events:none" /></div>`,
    );
  }
  return out;
}

export default async function handler(request: Request, context: { next: () => Promise<Response> }) {
  const response = await context.next();
  const type = response.headers.get("content-type") || "";
  if (!type.includes("text/html")) return response;

  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length !== 2) return response;
  const [section, raw] = parts;
  const slug = decodeURIComponent(raw);
  if (!/^[a-z0-9][a-z0-9._-]{0,120}$/i.test(slug)) return response;

  let meta: Meta | null = null;
  try {
    if (section === "gig") meta = await gigMeta(slug);
    else if (section === "freelancer") meta = await freelancerMeta(slug);
  } catch {
    return response;
  }
  if (!meta) return response;

  const html = await response.text();
  return new Response(rewrite(html, meta), {
    status: response.status,
    headers: response.headers,
  });
}

export const config = { path: ["/gig/*", "/freelancer/*"] };
