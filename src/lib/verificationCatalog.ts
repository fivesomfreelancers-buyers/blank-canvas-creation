// Curated catalog used by the freelancer verification wizard.
// Categories + subcategories (skills) and software/tools with simple-icons slugs.

export interface CategoryDef {
  id: string;
  name: string;
  subcategories: string[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    id: 'web-dev',
    name: 'Web Development',
    subcategories: ['Frontend', 'Backend', 'Full Stack', 'WordPress', 'Shopify', 'E-commerce'],
  },
  {
    id: 'mobile-dev',
    name: 'Mobile Development',
    subcategories: ['iOS (Swift)', 'Android (Kotlin)', 'React Native', 'Flutter'],
  },
  {
    id: 'design',
    name: 'Graphic Design',
    subcategories: ['Logo Design', 'Brand Identity', 'Illustration', 'Print Design', 'Social Media Graphics'],
  },
  {
    id: 'uiux',
    name: 'UI/UX Design',
    subcategories: ['Web Design', 'Mobile App Design', 'Wireframing', 'Prototyping', 'Design System'],
  },
  {
    id: 'video',
    name: 'Video Editing',
    subcategories: ['Short Form (TikTok/Reels)', 'YouTube Edits', 'Wedding Videos', 'Motion Graphics', 'Color Grading'],
  },
  {
    id: 'writing',
    name: 'Writing & Translation',
    subcategories: ['Copywriting', 'Article Writing', 'Translation (Somali ↔ English)', 'Proofreading'],
  },
  {
    id: 'marketing',
    name: 'Digital Marketing',
    subcategories: ['Social Media Management', 'SEO', 'Google Ads', 'Facebook Ads', 'Email Marketing'],
  },
  {
    id: 'audio',
    name: 'Audio & Voice',
    subcategories: ['Voice Over', 'Podcast Editing', 'Music Production', 'Mixing & Mastering'],
  },
];

export interface SoftwareDef {
  name: string;
  slug: string; // simple-icons slug
}

// Logos served from https://cdn.simpleicons.org/{slug}
export const SOFTWARE_CATALOG: SoftwareDef[] = [
  { name: 'Figma', slug: 'figma' },
  { name: 'Canva', slug: 'canva' },
  { name: 'Adobe Photoshop', slug: 'adobephotoshop' },
  { name: 'Adobe Illustrator', slug: 'adobeillustrator' },
  { name: 'Adobe XD', slug: 'adobexd' },
  { name: 'Adobe Premiere Pro', slug: 'adobepremierepro' },
  { name: 'Adobe After Effects', slug: 'adobeaftereffects' },
  { name: 'Adobe Lightroom', slug: 'adobelightroom' },
  { name: 'DaVinci Resolve', slug: 'davinciresolve' },
  { name: 'Final Cut Pro', slug: 'finalcutpro' },
  { name: 'Sketch', slug: 'sketch' },
  { name: 'Framer', slug: 'framer' },
  { name: 'Blender', slug: 'blender' },
  { name: 'VS Code', slug: 'visualstudiocode' },
  { name: 'IntelliJ IDEA', slug: 'intellijidea' },
  { name: 'GitHub', slug: 'github' },
  { name: 'GitLab', slug: 'gitlab' },
  { name: 'React', slug: 'react' },
  { name: 'Next.js', slug: 'nextdotjs' },
  { name: 'Vue.js', slug: 'vuedotjs' },
  { name: 'Angular', slug: 'angular' },
  { name: 'Node.js', slug: 'nodedotjs' },
  { name: 'TypeScript', slug: 'typescript' },
  { name: 'JavaScript', slug: 'javascript' },
  { name: 'Python', slug: 'python' },
  { name: 'PHP', slug: 'php' },
  { name: 'Laravel', slug: 'laravel' },
  { name: 'Django', slug: 'django' },
  { name: 'WordPress', slug: 'wordpress' },
  { name: 'Shopify', slug: 'shopify' },
  { name: 'Webflow', slug: 'webflow' },
  { name: 'Tailwind CSS', slug: 'tailwindcss' },
  { name: 'HTML5', slug: 'html5' },
  { name: 'CSS3', slug: 'css3' },
  { name: 'MongoDB', slug: 'mongodb' },
  { name: 'PostgreSQL', slug: 'postgresql' },
  { name: 'MySQL', slug: 'mysql' },
  { name: 'Firebase', slug: 'firebase' },
  { name: 'Supabase', slug: 'supabase' },
  { name: 'Flutter', slug: 'flutter' },
  { name: 'Swift', slug: 'swift' },
  { name: 'Kotlin', slug: 'kotlin' },
  { name: 'Notion', slug: 'notion' },
  { name: 'Slack', slug: 'slack' },
  { name: 'Trello', slug: 'trello' },
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
