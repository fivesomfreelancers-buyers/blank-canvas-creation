// Single source of truth for the 5 official Fivesom categories + their subcategories.
// Used by gig creation, explore filters, search, verification skills, and homepage.

export interface CategoryDef {
  slug: string;
  name: string;
  subcategories: { slug: string; name: string }[];
}

export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'logo-design',
    name: 'Logo Design',
    subcategories: [
      { slug: 'minimal-logo', name: 'Minimal Logo' },
      { slug: '3d-logo', name: '3D Logo' },
      { slug: 'modern-logo', name: 'Modern Logo' },
      { slug: 'business-logo', name: 'Business Logo' },
      { slug: 'mascot-logo', name: 'Mascot Logo' },
      { slug: 'typography-logo', name: 'Typography Logo' },
    ],
  },
  {
    slug: 'video-editing',
    name: 'Video Editing',
    subcategories: [
      { slug: 'short-videos', name: 'Short Videos' },
      { slug: 'youtube-editing', name: 'YouTube Editing' },
      { slug: 'tiktok-reels', name: 'TikTok / Reels' },
      { slug: 'motion-graphics', name: 'Motion Graphics' },
      { slug: 'wedding-video', name: 'Wedding Video' },
      { slug: 'commercial-video', name: 'Commercial Video' },
    ],
  },
  {
    slug: 'web-design',
    name: 'Web Design',
    subcategories: [
      { slug: 'landing-page', name: 'Landing Page' },
      { slug: 'business-website', name: 'Business Website' },
      { slug: 'portfolio-website', name: 'Portfolio Website' },
      { slug: 'ecommerce-design', name: 'E-commerce Design' },
      { slug: 'blog-design', name: 'Blog Design' },
    ],
  },
  {
    slug: 'content-writing',
    name: 'Content Writing',
    subcategories: [
      { slug: 'blog-posts', name: 'Blog Posts' },
      { slug: 'product-descriptions', name: 'Product Descriptions' },
      { slug: 'social-media-copy', name: 'Social Media Copy' },
      { slug: 'website-copy', name: 'Website Copy' },
      { slug: 'translation', name: 'Translation' },
    ],
  },
  {
    slug: 'app-ui-design',
    name: 'App UI Design',
    subcategories: [
      { slug: 'mobile-app-ui', name: 'Mobile App UI' },
      { slug: 'web-app-design', name: 'Web App Design' },
      { slug: 'dashboard-design', name: 'Dashboard Design' },
      { slug: 'wireframes', name: 'Wireframes' },
      { slug: 'ux-prototyping', name: 'UX Prototyping' },
    ],
  },
  {
    slug: 'graphic-design',
    name: 'Graphic Design',
    subcategories: [
      { slug: 'flyer-design', name: 'Flyer Design' },
      { slug: 'poster-design', name: 'Poster Design' },
      { slug: 'banner-design', name: 'Banner Design' },
      { slug: 'business-card', name: 'Business Card Design' },
      { slug: 'social-media-graphics', name: 'Social Media Graphics' },
      { slug: 'brochure-design', name: 'Brochure Design' },
      { slug: 'menu-design', name: 'Menu Design' },
      { slug: 'invitation-design', name: 'Invitation Design' },
      { slug: 'packaging-design', name: 'Packaging Design' },
      { slug: 't-shirt-design', name: 'T-Shirt Design' },
      { slug: 'book-cover-design', name: 'Book Cover Design' },
      { slug: 'infographic-design', name: 'Infographic Design' },
      { slug: 'illustration', name: 'Illustration' },
      { slug: 'photo-editing', name: 'Photo Editing' },
      { slug: 'branding-kit', name: 'Branding Kit' },
    ],
  },
];

export const getCategoryBySlug = (slug?: string | null) =>
  CATEGORIES.find((c) => c.slug === slug);

export const getCategoryName = (slug?: string | null) =>
  getCategoryBySlug(slug)?.name ?? '';

export const getSubcategoryName = (
  categorySlug?: string | null,
  subSlug?: string | null,
) =>
  getCategoryBySlug(categorySlug)?.subcategories.find((s) => s.slug === subSlug)
    ?.name ?? '';
