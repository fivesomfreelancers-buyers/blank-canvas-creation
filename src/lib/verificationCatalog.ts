// Curated catalog used by the freelancer verification wizard.
// Categories + subcategories (skills) come from the single source of truth in
// `@/lib/categories` so the platform stays consistent everywhere.

import { CATEGORIES as PLATFORM_CATEGORIES } from './categories';

export interface CategoryDef {
  id: string;
  name: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryDef[] = PLATFORM_CATEGORIES.map((c) => ({
  id: c.slug,
  name: c.name,
  subcategories: c.subcategories.map((s) => s.name),
}));

export interface SoftwareDef {
  name: string;
  slug: string; // simple-icons slug
}

// Logos served from https://cdn.simpleicons.org/{slug}
// Curated to the top tools per platform category (Logo, Video, Web, Writing, UI).
// Duplicates across categories are listed once.
export const SOFTWARE_CATALOG: SoftwareDef[] = [
  // 🎨 Logo Design
  { name: 'Adobe Illustrator', slug: 'adobeillustrator' },
  { name: 'CorelDRAW', slug: 'coreldraw' },
  { name: 'Canva', slug: 'canva' },
  { name: 'Figma', slug: 'figma' },
  { name: 'Adobe Photoshop', slug: 'adobephotoshop' },
  // 🎬 Video Editing
  { name: 'Adobe Premiere Pro', slug: 'adobepremierepro' },
  { name: 'Adobe After Effects', slug: 'adobeaftereffects' },
  { name: 'CapCut', slug: 'capcut' },
  { name: 'DaVinci Resolve', slug: 'davinciresolve' },
  { name: 'Final Cut Pro', slug: 'finalcutpro' },
  // 💻 Web Design
  { name: 'VS Code', slug: 'visualstudiocode' },
  { name: 'Webflow', slug: 'webflow' },
  { name: 'WordPress', slug: 'wordpress' },
  { name: 'Adobe XD', slug: 'adobexd' },
  // ✍️ Content Writing
  { name: 'Google Docs', slug: 'googledocs' },
  { name: 'Microsoft Word', slug: 'microsoftword' },
  { name: 'Grammarly', slug: 'grammarly' },
  { name: 'Notion', slug: 'notion' },
  { name: 'ChatGPT', slug: 'openai' },
  // 📱 App UI Design
  { name: 'Sketch', slug: 'sketch' },
  { name: 'Framer', slug: 'framer' },
];

export const EXPERIENCE_OPTIONS = [
  'Less than 1 year',
  '1 year',
  '2 years',
  '3 years',
  '5+ years',
  '10+ years',
];

export const EDUCATION_OPTIONS = [
  'High School',
  'Diploma',
  'Bachelor Degree',
  'Master Degree',
  'PhD',
  'Self-Taught',
];

export const softwareLogo = (slug: string) => `https://cdn.simpleicons.org/${slug}`;
