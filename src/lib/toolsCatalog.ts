// Single source of truth for the FIVESOM "Software & Tools" system.
// Every logo is a LOCAL bundled SVG (src/assets/tools/*.svg) so icons never break
// because of an expired or removed external CDN URL.
// Each tool is mapped to the FIVESOM category slugs (see src/lib/categories.ts)
// where freelancers realistically use it, so Tools -> Skills -> Categories stay connected.

const ICON_MODULES = import.meta.glob('../assets/tools/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const ICONS: Record<string, string> = Object.fromEntries(
  Object.entries(ICON_MODULES).map(([path, url]) => [
    path.split('/').pop()!.replace('.svg', ''),
    url,
  ]),
);

/** Returns the bundled logo URL for a tool slug, or '' when no logo exists. */
export const softwareLogo = (slug: string): string => ICONS[slug] ?? '';

export interface SoftwareDef {
  name: string;
  slug: string;
  /** FIVESOM category slugs this tool belongs to. */
  categories?: string[];
}

const D = 'logo-design';
const G = 'graphic-design';
const V = 'video-editing';
const M = 'motion-graphics';
const W = 'web-design';
const C = 'content-writing';
const U = 'app-ui-design';
const A = 'app-development';
const DEV = 'web-development';

export const SOFTWARE_CATALOG: SoftwareDef[] = [
  // ---------- Design (logo, graphic, web design, UI/UX) ----------
  { name: 'Figma', slug: 'figma', categories: [D, G, W, U] },
  { name: 'Adobe Photoshop', slug: 'adobephotoshop', categories: [D, G, W, U, V] },
  { name: 'Adobe Illustrator', slug: 'adobeillustrator', categories: [D, G, M, U] },
  { name: 'Adobe InDesign', slug: 'adobeindesign', categories: [G, C] },
  { name: 'Adobe XD', slug: 'adobexd', categories: [W, U] },
  { name: 'Adobe Lightroom', slug: 'adobelightroom', categories: [G] },
  { name: 'Adobe Creative Cloud', slug: 'adobecreativecloud', categories: [D, G, V, M] },
  { name: 'Canva', slug: 'canva', categories: [D, G, C, W] },
  { name: 'Sketch', slug: 'sketch', categories: [D, W, U] },
  { name: 'Framer', slug: 'framer', categories: [W, U] },
  { name: 'Affinity Designer', slug: 'affinitydesigner', categories: [D, G] },
  { name: 'Affinity Photo', slug: 'affinityphoto', categories: [G] },
  { name: 'CorelDRAW', slug: 'coreldraw', categories: [D, G] },
  { name: 'Inkscape', slug: 'inkscape', categories: [D, G] },
  { name: 'GIMP', slug: 'gimp', categories: [G] },
  { name: 'Procreate', slug: 'procreate', categories: [D, G] },
  { name: 'Miro', slug: 'miro', categories: [U] },
  { name: 'InVision', slug: 'invision', categories: [U] },

  // ---------- Video editing ----------
  { name: 'Adobe Premiere Pro', slug: 'adobepremierepro', categories: [V, M] },
  { name: 'DaVinci Resolve', slug: 'davinciresolve', categories: [V, M] },
  { name: 'Final Cut Pro', slug: 'finalcutpro', categories: [V] },
  { name: 'CapCut', slug: 'capcut', categories: [V] },
  { name: 'Adobe Audition', slug: 'adobeaudition', categories: [V, M] },
  { name: 'OBS Studio', slug: 'obsstudio', categories: [V] },

  // ---------- Motion graphics / 3D ----------
  { name: 'Adobe After Effects', slug: 'adobeaftereffects', categories: [M, V] },
  { name: 'Blender', slug: 'blender', categories: [M, D] },
  { name: 'Cinema 4D', slug: 'cinema4d', categories: [M] },
  { name: 'Autodesk Maya', slug: 'autodeskmaya', categories: [M] },
  { name: 'LottieFiles', slug: 'lottiefiles', categories: [M, U, W] },

  // ---------- Content writing ----------
  { name: 'Microsoft Word', slug: 'microsoftword', categories: [C] },
  { name: 'Microsoft Excel', slug: 'microsoftexcel', categories: [C] },
  { name: 'Google Docs', slug: 'googledocs', categories: [C] },
  { name: 'Google Sheets', slug: 'googlesheets', categories: [C] },
  { name: 'Notion', slug: 'notion', categories: [C, U, DEV] },
  { name: 'Grammarly', slug: 'grammarly', categories: [C] },
  { name: 'Obsidian', slug: 'obsidian', categories: [C] },
  { name: 'Google Translate', slug: 'googletranslate', categories: [C] },
  { name: 'Semrush', slug: 'semrush', categories: [C, W] },
  { name: 'Google Analytics', slug: 'googleanalytics', categories: [C, W, DEV] },
  { name: 'ChatGPT / OpenAI', slug: 'openai', categories: [C, DEV] },
  { name: 'Adobe Acrobat', slug: 'adobeacrobatreader', categories: [C, G] },

  // ---------- Web development ----------
  { name: 'HTML5', slug: 'html5', categories: [DEV, W] },
  { name: 'CSS3', slug: 'css3', categories: [DEV, W] },
  { name: 'JavaScript', slug: 'javascript', categories: [DEV, A] },
  { name: 'TypeScript', slug: 'typescript', categories: [DEV, A] },
  { name: 'React', slug: 'react', categories: [DEV, A] },
  { name: 'Next.js', slug: 'nextdotjs', categories: [DEV] },
  { name: 'Vue.js', slug: 'vuedotjs', categories: [DEV] },
  { name: 'Angular', slug: 'angular', categories: [DEV] },
  { name: 'Node.js', slug: 'nodedotjs', categories: [DEV, A] },
  { name: 'Express', slug: 'express', categories: [DEV] },
  { name: 'Redux', slug: 'redux', categories: [DEV, A] },
  { name: 'Vite', slug: 'vite', categories: [DEV] },
  { name: 'Tailwind CSS', slug: 'tailwindcss', categories: [DEV, W] },
  { name: 'Bootstrap', slug: 'bootstrap', categories: [DEV, W] },
  { name: 'Sass', slug: 'sass', categories: [DEV, W] },
  { name: 'jQuery', slug: 'jquery', categories: [DEV] },
  { name: 'PHP', slug: 'php', categories: [DEV] },
  { name: 'Laravel', slug: 'laravel', categories: [DEV] },
  { name: 'Python', slug: 'python', categories: [DEV, A] },
  { name: 'Django', slug: 'django', categories: [DEV] },
  { name: 'GraphQL', slug: 'graphql', categories: [DEV, A] },
  { name: 'Prisma', slug: 'prisma', categories: [DEV] },
  { name: 'Supabase', slug: 'supabase', categories: [DEV, A] },
  { name: 'Firebase', slug: 'firebase', categories: [DEV, A] },
  { name: 'PostgreSQL', slug: 'postgresql', categories: [DEV, A] },
  { name: 'MySQL', slug: 'mysql', categories: [DEV] },
  { name: 'MongoDB', slug: 'mongodb', categories: [DEV, A] },
  { name: 'Docker', slug: 'docker', categories: [DEV] },
  { name: 'Git', slug: 'git', categories: [DEV, A] },
  { name: 'GitHub', slug: 'github', categories: [DEV, A] },
  { name: 'GitLab', slug: 'gitlab', categories: [DEV, A] },
  { name: 'VS Code', slug: 'visualstudiocode', categories: [DEV, A] },
  { name: 'Stripe', slug: 'stripe', categories: [DEV] },

  // ---------- Web design platforms / CMS ----------
  { name: 'WordPress', slug: 'wordpress', categories: [W, DEV, C] },
  { name: 'Webflow', slug: 'webflow', categories: [W, U] },
  { name: 'Shopify', slug: 'shopify', categories: [W, DEV] },
  { name: 'Wix', slug: 'wix', categories: [W] },
  { name: 'Squarespace', slug: 'squarespace', categories: [W] },

  // ---------- App development ----------
  { name: 'Flutter', slug: 'flutter', categories: [A] },
  { name: 'Dart', slug: 'dart', categories: [A] },
  { name: 'Kotlin', slug: 'kotlin', categories: [A] },
  { name: 'Swift', slug: 'swift', categories: [A] },
  { name: 'Android Studio', slug: 'androidstudio', categories: [A] },
  { name: 'Xcode', slug: 'xcode', categories: [A] },
  { name: 'Jetpack Compose', slug: 'jetpackcompose', categories: [A] },
  { name: 'Ionic', slug: 'ionic', categories: [A] },
  { name: 'Expo', slug: 'expo', categories: [A] },
  { name: 'Android', slug: 'android', categories: [A] },
  { name: 'Apple / iOS', slug: 'apple', categories: [A] },
  { name: 'Google Play', slug: 'googleplay', categories: [A] },
  { name: 'App Store', slug: 'appstore', categories: [A] },

  // ---------- Collaboration ----------
  { name: 'Slack', slug: 'slack', categories: [DEV, A, U, C] },
  { name: 'Trello', slug: 'trello', categories: [C, DEV, U] },
  { name: 'Jira', slug: 'jira', categories: [DEV, A] },
  { name: 'Asana', slug: 'asana', categories: [C, U] },
];

export const findTool = (slug: string) => SOFTWARE_CATALOG.find((t) => t.slug === slug);

/** Tools relevant to one or more FIVESOM category slugs (empty input = all tools). */
export const toolsForCategories = (categorySlugs: string[]): SoftwareDef[] => {
  const wanted = categorySlugs.filter(Boolean);
  if (wanted.length === 0) return SOFTWARE_CATALOG;
  return SOFTWARE_CATALOG.filter((t) => (t.categories ?? []).some((c) => wanted.includes(c)));
};

/** Search helper: matches tool name or slug. */
export const searchTools = (tools: SoftwareDef[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return tools;
  return tools.filter((t) => t.name.toLowerCase().includes(q) || t.slug.includes(q));
};
