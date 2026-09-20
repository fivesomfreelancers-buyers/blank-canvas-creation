/**
 * Google Images helpers for public gig media.
 *
 * Two things matter for a gig image to be understood by Google Images:
 *  1. a descriptive, stable, public file name (never IMG_1234.jpg)
 *  2. descriptive alt text that matches the gig the image belongs to
 *
 * Both are derived from the gig title, so every gig gets this automatically.
 */

import { slugify } from '@/lib/urls';

/** Safe, readable storage file name for a gig image: "logo-design-2.webp". */
export const gigImageFileName = (title: string | null | undefined, index: number, ext: string) => {
  const base = slugify(title).slice(0, 60) || 'fivesom-gig';
  const suffix = index > 0 ? `-${index + 1}` : '';
  const safeExt = (ext || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  return `${base}${suffix}.${safeExt}`;
};

/** Alt text describing what the image actually shows, per gig and position. */
export const gigImageAlt = (
  title: string | null | undefined,
  index = 0,
  seller?: string | null,
): string => {
  const name = (title || 'Freelance service').trim();
  const by = seller ? ` by ${seller}` : '';
  if (index === 0) return `${name} — freelance service on FIVESOM${by}`;
  return `${name} — work sample ${index + 1}${by}`;
};
