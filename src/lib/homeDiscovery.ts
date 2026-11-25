import type { SearchGigResult } from '@/hooks/useGigSearch';

export const QUICK_SEARCHES = [
  { label: 'Build a professional WordPress website', query: 'WordPress' },
  { label: 'Create a modern brand identity', query: 'brand identity' },
  { label: 'Design a premium business logo', query: 'logo design' },
  { label: 'Edit professional promotional videos', query: 'video editing' },
  { label: 'Develop an AI-powered business solution', query: 'AI' },
];

/** Suggestions reflect tag prevalence on real published services, not invented search analytics. */
export const popularServiceTags = (gigs: SearchGigResult[], limit = 5) => {
  const tags = new Map<string, { label: string; count: number }>();
  for (const gig of gigs) {
    const seen = new Set<string>();
    for (const raw of gig.tags) {
      const label = raw.trim();
      const key = label.toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      const existing = tags.get(key);
      tags.set(key, { label: existing?.label ?? label, count: (existing?.count ?? 0) + 1 });
    }
  }
  return [...tags.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, limit);
};

export const DISCOVERY_GROUPS = [
  { title: 'Build Your Product', categories: ['web-development', 'web-design', 'app-development', 'app-ui-design'], category: 'web-development', tags: ['Websites', 'Apps', 'UI/UX'], description: 'Websites, apps and digital products built for your next chapter.' },
  { title: 'Create Your Visuals', categories: ['graphic-design', 'logo-design', 'video-editing', 'motion-graphics', 'ai-product-video'], category: 'graphic-design', tags: ['Brand design', 'Video editing', 'Graphics'], description: 'A distinctive identity. Compelling content. Creative work that stands out.' },
  { title: 'Grow Your Business', categories: ['digital-marketing', 'content-writing', 'data-entry', 'translation', 'voice-audio'], category: 'digital-marketing', tags: ['Marketing', 'Content', 'Business support'], description: 'Reach your audience with marketing, content and expert business support.' },
];