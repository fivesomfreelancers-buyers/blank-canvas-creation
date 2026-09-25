// Runs after `vite build` (postbuild). Writes a static HTML file for every
// public route into dist/, so crawlers that do not run JavaScript (AI search
// bots, social previews, Bing's first pass) receive a unique title,
// description, canonical, structured data, an H1, real text and plain links.
// React replaces the #root content on mount, so visitors see the normal app.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { CATEGORIES } from "../src/lib/categories";
import { getCategoryContent } from "../src/lib/seo/categoryContent";
import { MARKETS } from "../src/content/markets";
import { HOME_FAQ } from "../src/lib/seo/homeFaq";
import en from "../src/content/docs/en";
import so from "../src/content/docs/so";
import ar from "../src/content/docs/ar";
import fr from "../src/content/docs/fr";

const SITE = "https://fivesom.net";
const BRAND = "FIVESOM — African & Somali Freelancer Marketplace";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://afjcjjelgppctsnmtbek.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmamNqamVsZ3BwY3Rzbm10YmVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyNzQ2MDksImV4cCI6MjA4Nzg1MDYwOX0.az4XkiqJ-kv5g8Ji7SQ3nCN78cHKV-925ufkm8m-x8A";

const DIST = resolve("dist");
const template = readFileSync(resolve(DIST, "index.html"), "utf8");

const e = (s: string) =>
  String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const clip = (s: string, n: number) => {
  const t = String(s || "").replace(/\s+/g, " ").trim();
  return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t;
};

interface Page {
  path: string;
  title: string;
  description: string;
  h1: string;
  body: string; // inner HTML
  image?: string;
  type?: string;
  jsonLd?: object[];
  lang?: string;
}

const crumbs = (trail: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: trail.map((t, i) => ({ "@type": "ListItem", position: i + 1, name: t.name, item: `${SITE}${t.path}` })),
});
const crumbHtml = (trail: { name: string; path: string }[]) =>
  `<nav aria-label="Breadcrumb"><ol>${trail.map((t) => `<li><a href="${t.path}">${e(t.name)}</a></li>`).join("")}</ol></nav>`;
const links = (heading: string, items: { href: string; label: string }[]) =>
  items.length ? `<section><h2>${e(heading)}</h2><ul>${items.map((i) => `<li><a href="${i.href}">${e(i.label)}</a></li>`).join("")}</ul></section>` : "";

const countryLinks = links(
  "Freelancers by country",
  MARKETS.map((m) => ({ href: `/freelancers/${m.slug}`, label: m.slug === "africa" ? "Freelancers in Africa" : `${m.name} freelancers` })),
);
const serviceLinks = links(
  "Freelance services",
  CATEGORIES.map((c) => ({ href: `/services/${c.slug}`, label: `${c.name} services` })),
);
const siteNav = `<nav aria-label="FIVESOM">${[
  ["/", "FIVESOM home"], ["/explore", "Explore gigs"], ["/services", "Freelance services"],
  ["/freelancers/africa", "African freelancers"], ["/freelancers/somalia", "Somali freelancers"],
  ["/how-it-works", "How FIVESOM works"], ["/about", "About FIVESOM"], ["/docs", "Documentation"], ["/blog", "Blog"],
  ["/register/freelancer", "Join as a freelancer"], ["/register/buyer", "Hire a freelancer"],
].map(([h, l]) => `<a href="${h}">${l}</a>`).join(" · ")}</nav>`;
const footer = `<footer><p>${e(BRAND)}. FIVESOM connects African freelancers, including freelancers from Somalia, with clients worldwide. Orders are protected by escrow.</p>${countryLinks}${serviceLinks}</footer>`;

const sectionsHtml = (sections: { heading: string; body?: string; bullets?: string[] }[]) =>
  sections.map((s) => `<section><h2>${e(s.heading)}</h2>${s.body ? `<p>${e(s.body)}</p>` : ""}${s.bullets?.length ? `<ul>${s.bullets.map((b) => `<li>${e(b)}</li>`).join("")}</ul>` : ""}</section>`).join("");
const faqHtml = (faqs: { q: string; a: string }[]) =>
  faqs.length ? `<section><h2>Frequently asked questions</h2>${faqs.map((f) => `<h3>${e(f.q)}</h3><p>${e(f.a)}</p>`).join("")}</section>` : "";

function render(p: Page): string {
  let html = template;
  const drop = [
    /<title>[\s\S]*?<\/title>/i,
    /<meta\s+name="description"[\s\S]*?\/>/i,
    /<link\s+rel="canonical"[^>]*\/>/i,
    /<meta\s+property="og:(title|description|type|url|image|image:alt|image:width|image:height)"[\s\S]*?\/>/gi,
    /<meta\s+name="twitter:(title|description|image)"[\s\S]*?\/>/gi,
  ];
  for (const re of drop) html = html.replace(re, "");
  const url = `${SITE}${p.path === "/" ? "/" : p.path}`;
  const img = p.image || `${SITE}/og-image.png`;
  const head = [
    `<title>${e(p.title)}</title>`,
    `<meta name="description" content="${e(p.description)}" />`,
    `<link rel="canonical" href="${e(url)}" />`,
    `<meta property="og:title" content="${e(p.title)}" />`,
    `<meta property="og:description" content="${e(p.description)}" />`,
    `<meta property="og:type" content="${p.type || "website"}" />`,
    `<meta property="og:url" content="${e(url)}" />`,
    `<meta property="og:image" content="${e(img)}" />`,
    `<meta property="og:image:alt" content="${e(p.h1)}" />`,
    `<meta name="twitter:title" content="${e(p.title)}" />`,
    `<meta name="twitter:description" content="${e(p.description)}" />`,
    `<meta name="twitter:image" content="${e(img)}" />`,
    ...(p.jsonLd || []).map((j) => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, "\\u003c")}</script>`),
  ].join("\n    ");
  html = html.replace(/<\/head>/i, `    ${head}\n  </head>`);
  if (p.lang && p.lang !== "en") html = html.replace(/<html lang="en">/i, `<html lang="${p.lang}"${p.lang === "ar" ? ' dir="rtl"' : ""}>`);
  const main = `<div id="root"><div style="max-width:960px;margin:0 auto;padding:24px;line-height:1.6">${siteNav}<main><h1>${e(p.h1)}</h1>${p.body}</main>${footer}</div></div>`;
  return html.replace(/<div id="root"><\/div>/i, main);
}

function write(p: Page) {
  const file = p.path === "/" ? resolve(DIST, "index.html") : resolve(DIST, `.${p.path}`, "index.html");
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, render(p));
}

async function rest<T>(path: string): Promise<T[]> {
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } });
    return r.ok ? ((await r.json()) as T[]) : [];
  } catch {
    return [];
  }
}

const pages: Page[] = [];

// Home
pages.push({
  path: "/",
  title: "FIVESOM — African & Somali Freelancer Marketplace | Hire Freelancers Worldwide",
  description:
    "FIVESOM is an African and Somali freelancer marketplace connecting skilled freelancers with clients worldwide. Hire for design, web development, video and writing — payment is held in escrow until you accept the work.",
  h1: "Hire Skilled African Freelancers",
  body: `<p>FIVESOM is an African and Somali freelancer marketplace. It connects freelancers from Somalia and across Africa with clients worldwide for logo design, graphic design, web and app development, video editing and content writing.</p><p>Clients pay when they order, the payment is held in escrow, and it is released to the freelancer only after the client accepts the delivered work.</p>${serviceLinks}${countryLinks}<section><h2>Frequently asked questions</h2>${HOME_FAQ.map((f) => `<h3>${e(f.question)}</h3><p>${e(f.answer)}</p>`).join("")}</section>`,
});

// Fixed public pages
const fixed: [string, string, string, string, string][] = [
  ["/explore", "Explore Freelance Services & Gigs | FIVESOM", "Browse gigs from African and Somali freelancers on FIVESOM. Compare design, development, writing and video services, then order with escrow-protected payment.", "Explore freelance services", "Search and compare active gigs from freelancers across Africa. Each gig shows its packages, price, delivery time and seller."],
  ["/services", "Freelance Services by Category | Hire African Freelancers | FIVESOM", "All freelance service categories on FIVESOM: logo design, graphic design, web development, app development, video editing, content writing and more, delivered by African freelancers.", "Freelance services on FIVESOM", "Choose a category to see gigs from African and Somali freelancers."],
  ["/how-it-works", "How FIVESOM Works | Hire Freelancers with Escrow Protection", "How hiring and selling works on FIVESOM: find a freelancer, pay into escrow, receive the delivery, accept it and release payment. Freelancers withdraw earnings to local payout methods.", "How FIVESOM works", "1. Find a freelancer and compare gig packages. 2. Order and pay — the money is held in escrow. 3. The freelancer delivers through the order page. 4. You accept the delivery and the payment is released to the freelancer's wallet, which they can withdraw."],
  ["/about", "About FIVESOM — African & Somali Freelancer Marketplace", "FIVESOM is an African-focused, Somali-rooted freelance marketplace connecting African digital talent with clients around the world through protected, escrow-based orders.", "About FIVESOM", "FIVESOM is an African and Somali freelancer marketplace. It was founded so freelancers in Somalia and across Africa can sell their services to global clients and get paid in ways that work locally."],
  ["/blog", "FIVESOM Blog — Guides for African Freelancers and Clients", "Guides and news from FIVESOM for African freelancers and the clients who hire them: pricing, getting verified, working remotely and hiring safely.", "FIVESOM blog", "Guides for freelancers and clients using FIVESOM."],
  ["/vip", "FIVESOM VIP — Featured Seller Membership", "FIVESOM VIP gives freelancers featured placement and a VIP badge on their gigs and profile.", "FIVESOM VIP membership", "VIP freelancers are featured across the marketplace."],
  ["/support", "FIVESOM Support — Help for Buyers and Freelancers", "Contact FIVESOM support for help with orders, payments, disputes and your account.", "FIVESOM support", "Our support team helps buyers and freelancers with orders, payments and disputes."],
  ["/support/help-center", "FIVESOM Help Center", "Answers to common questions about orders, payments, escrow, verification and accounts on FIVESOM.", "FIVESOM help center", "Find answers about orders, payments and your account."],
  ["/support/trust-safety", "Trust & Safety on FIVESOM", "How FIVESOM keeps buyers and freelancers safe: escrow payments, identity verification, in-platform messaging and dispute resolution.", "Trust and safety on FIVESOM", "Escrow payments, verified sellers and support-led dispute resolution protect every order."],
  ["/support/contact", "Contact FIVESOM", "Get in touch with the FIVESOM team by email or through the support form.", "Contact FIVESOM", "Email fivesomsupport@gmail.com or use the contact form."],
  ["/register", "Join FIVESOM — Hire or Sell Freelance Services", "Create a free FIVESOM account as a buyer to hire African freelancers, or as a freelancer to sell your services worldwide.", "Join FIVESOM", "Choose whether you want to hire freelancers or sell your services."],
  ["/register/freelancer", "Become a Freelancer on FIVESOM", "Sign up free as a freelancer on FIVESOM, publish gigs and sell your skills to clients worldwide with escrow-protected payment.", "Join FIVESOM as a freelancer", "Register, complete your profile and publish your first gig."],
  ["/register/buyer", "Hire African Freelancers — Buyer Sign Up | FIVESOM", "Create a free buyer account on FIVESOM to hire African and Somali freelancers with escrow-protected orders.", "Hire freelancers on FIVESOM", "Create a buyer account to order gigs."],
  ["/legal/terms", "Terms of Service | FIVESOM", "The terms that govern using the FIVESOM freelance marketplace.", "Terms of Service", "The terms for buyers and freelancers using FIVESOM."],
  ["/legal/privacy", "Privacy Policy | FIVESOM", "How FIVESOM collects, uses and protects your personal data.", "Privacy Policy", "How FIVESOM handles your data."],
  ["/legal/cookies", "Cookie Policy | FIVESOM", "How FIVESOM uses cookies and how to manage your preferences.", "Cookie Policy", "How FIVESOM uses cookies."],
];
for (const [path, title, description, h1, text] of fixed) {
  pages.push({ path, title, description, h1, body: `<p>${e(text)}</p>${path === "/services" ? serviceLinks : ""}` });
}

// Categories + subcategories
for (const c of CATEGORIES) {
  const content = getCategoryContent(c.slug);
  const related = links(`${c.name} types`, c.subcategories.map((s) => ({ href: `/services/${c.slug}/${s.slug}`, label: `${s.name} services` })));
  pages.push({
    path: `/services/${c.slug}`,
    title: `${c.name} Services | Hire African Freelancers | FIVESOM`,
    description: clip(content?.summary || `Hire African freelancers for ${c.name.toLowerCase()} on FIVESOM with escrow-protected payment.`, 160),
    h1: `${c.name} services from African freelancers`,
    body: `${crumbHtml([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: c.name, path: `/services/${c.slug}` }])}${(content?.intro || []).map((p) => `<p>${e(p)}</p>`).join("")}${content?.deliverables?.length ? `<section><h2>What you can order</h2><ul>${content.deliverables.map((d) => `<li>${e(d)}</li>`).join("")}</ul></section>` : ""}${related}${faqHtml(content?.faqs || [])}`,
    jsonLd: [crumbs([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: c.name, path: `/services/${c.slug}` }])],
  });
  for (const s of c.subcategories) {
    const trail = [{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: c.name, path: `/services/${c.slug}` }, { name: s.name, path: `/services/${c.slug}/${s.slug}` }];
    pages.push({
      path: `/services/${c.slug}/${s.slug}`,
      title: `${s.name} Services | ${c.name} | FIVESOM`,
      description: `Order ${s.name.toLowerCase()} from African freelancers on FIVESOM. Compare packages, prices and delivery times; payment stays in escrow until you accept the work.`,
      h1: `${s.name} services`,
      body: `${crumbHtml(trail)}<p>${e(s.name)} is part of ${e(c.name)} on FIVESOM. Freelancers list packages with a clear price and delivery time.</p>${related}`,
      jsonLd: [crumbs(trail)],
    });
  }
}

// Country / market pages
for (const m of MARKETS) {
  const trail = [{ name: "Home", path: "/" }, { name: "Freelancers in Africa", path: "/freelancers/africa" }, ...(m.slug === "africa" ? [] : [{ name: `${m.name} freelancers`, path: `/freelancers/${m.slug}` }])];
  pages.push({
    path: `/freelancers/${m.slug}`,
    title: m.metaTitle.includes("FIVESOM") ? m.metaTitle : `${m.metaTitle} | FIVESOM`,
    description: clip(m.metaDescription, 160),
    h1: m.h1,
    body: `${crumbHtml(trail)}<p>${e(m.intro)}</p>${sectionsHtml(m.sections)}${serviceLinks}${countryLinks}${faqHtml(m.faqs)}`,
    jsonLd: [crumbs(trail)],
  });
}

// Documentation
const DICTS = { en, so, ar, fr } as const;
for (const [lang, d] of Object.entries(DICTS)) {
  const base = lang === "en" ? "/docs" : `/docs/${lang}`;
  const chapters = Object.entries(d.chapters);
  pages.push({
    path: base, lang, title: d.ui.metaTitle, description: clip(d.ui.metaDescription, 160), h1: d.ui.h1,
    body: `<p>${e(d.ui.intro)}</p>${links(d.ui.chaptersLabel, chapters.map(([slug, c]) => ({ href: `${base}/${slug}`, label: c.title })))}`,
  });
  for (const [slug, c] of chapters) {
    const trail = [{ name: "Home", path: "/" }, { name: d.ui.docsLabel, path: base }, { name: c.title, path: `${base}/${slug}` }];
    pages.push({
      path: `${base}/${slug}`, lang,
      title: c.metaTitle || `${c.title} | FIVESOM Docs`,
      description: clip(c.metaDescription || c.summary, 160),
      h1: c.title,
      body: `${crumbHtml(trail)}<p>${e(c.summary)}</p>${sectionsHtml(c.sections)}`,
      jsonLd: [crumbs(trail)],
    });
  }
}

async function dynamicPages() {
  const gigs = await rest<{ slug: string; title: string; description: string | null; thumbnail_url: string | null; images: string[] | null; category_slug: string | null; base_price: number | null; delivery_time_days: number | null; freelancer_id: string }>(
    "gigs?select=slug,title,description,thumbnail_url,images,category_slug,base_price,delivery_time_days,freelancer_id&status=eq.active&slug=not.is.null&limit=5000",
  );
  const freelancers = await rest<{ id: string; user_id: string }>("public_freelancers?select=id,user_id&limit=5000");
  const profiles = await rest<{ id: string; full_name: string | null; username: string | null; bio: string | null; profile_image_url: string | null; professional_title?: string | null }>(
    "public_profiles?select=id,full_name,username,bio,profile_image_url&username=not.is.null&limit=5000",
  );
  const byUser = new Map(profiles.map((p) => [p.id, p]));
  const fToProfile = new Map(freelancers.map((f) => [f.id, byUser.get(f.user_id)]));
  const gigsBySeller = new Map<string, typeof gigs>();
  const isImg = (u?: string | null) => (u && /^https:\/\//.test(u) ? u : undefined);

  for (const g of gigs) {
    const seller = fToProfile.get(g.freelancer_id);
    if (seller?.username) gigsBySeller.set(seller.username, [...(gigsBySeller.get(seller.username) || []), g]);
    const cat = CATEGORIES.find((c) => c.slug === g.category_slug);
    const image = isImg(g.thumbnail_url) || (g.images || []).map(isImg).find(Boolean);
    const trail = [{ name: "Home", path: "/" }, ...(cat ? [{ name: cat.name, path: `/services/${cat.slug}` }] : []), { name: g.title, path: `/gig/${g.slug}` }];
    const sellerName = seller?.full_name || seller?.username || "";
    pages.push({
      path: `/gig/${g.slug}`,
      title: `${clip(g.title, 60)}${cat ? ` | ${cat.name}` : ""} | FIVESOM`,
      description: clip(`${g.description || g.title}`, 160),
      h1: g.title,
      type: "product",
      image,
      body: `${crumbHtml(trail)}${image ? `<img src="${e(image)}" alt="${e(`${g.title} — freelance service on FIVESOM${sellerName ? ` by ${sellerName}` : ""}`)}" width="640" height="360" style="max-width:100%;height:auto" />` : ""}<p>${e(clip(g.description || "", 1200))}</p><ul>${g.base_price ? `<li>Starting price: $${Number(g.base_price).toFixed(2)}</li>` : ""}${g.delivery_time_days ? `<li>Delivery: ${g.delivery_time_days} days</li>` : ""}${cat ? `<li>Category: <a href="/services/${cat.slug}">${e(cat.name)}</a></li>` : ""}${seller?.username ? `<li>Seller: <a href="/freelancer/${e(seller.username)}">${e(sellerName)}</a></li>` : ""}</ul>`,
      jsonLd: [crumbs(trail)],
    });
  }

  for (const [username, list] of gigsBySeller) {
    const p = profiles.find((x) => x.username === username)!;
    const name = p.full_name || username;
    const trail = [{ name: "Home", path: "/" }, { name: name, path: `/freelancer/${username}` }];
    pages.push({
      path: `/freelancer/${username}`,
      title: `${clip(name, 50)} — Freelancer | FIVESOM`,
      description: clip(p.bio || `${name} offers freelance services on FIVESOM. View gigs, reviews and delivery times.`, 160),
      h1: name,
      type: "profile",
      image: isImg(p.profile_image_url),
      body: `${crumbHtml(trail)}${p.bio ? `<p>${e(clip(p.bio, 1200))}</p>` : ""}${links(`Gigs by ${name}`, list.map((g) => ({ href: `/gig/${g.slug}`, label: g.title })))}`,
      jsonLd: [crumbs(trail)],
    });
  }
}

await dynamicPages();
for (const p of pages) write(p);
console.log(`prerender: wrote ${pages.length} static pages`);
