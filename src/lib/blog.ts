import { supabase } from '@/integrations/supabase/client';

export type BlogBlock =
  | { id: string; type: 'heading'; level: 2 | 3; text: string }
  | { id: string; type: 'paragraph'; text: string }
  | { id: string; type: 'quote'; text: string; cite?: string }
  | { id: string; type: 'list'; style: 'bullet' | 'number'; items: string[] }
  | { id: string; type: 'image'; url: string; alt?: string; caption?: string }
  | { id: string; type: 'video'; url: string; caption?: string }
  | { id: string; type: 'link'; url: string; label: string }
  | { id: string; type: 'divider' };

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  content: BlogBlock[];
  category_id: string | null;
  status: 'draft' | 'published';
  author_name: string | null;
  author_title: string | null;
  author_image_url: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  blog_categories?: { name: string; slug: string } | null;
}

const db = supabase as any;

export const BLOG_SELECT =
  'id, slug, title, excerpt, cover_image_url, content, category_id, status, author_name, author_title, author_image_url, published_at, created_at, updated_at, blog_categories ( name, slug )';

export const newBlockId = () =>
  (globalThis.crypto?.randomUUID?.() ?? `b-${Date.now()}-${Math.random().toString(36).slice(2)}`);

export const slugifyTitle = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);

export const normalizeBlocks = (raw: unknown): BlogBlock[] => {
  if (!Array.isArray(raw)) return [];
  return raw.filter((b): b is BlogBlock => !!b && typeof b === 'object' && 'type' in (b as any));
};

export const blocksToPlainText = (blocks: BlogBlock[]): string =>
  blocks
    .map((b) => {
      switch (b.type) {
        case 'heading':
        case 'paragraph':
        case 'quote':
          return b.text;
        case 'list':
          return b.items.join(' ');
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join(' ');

export const readingMinutes = (blocks: BlogBlock[]) => {
  const words = blocksToPlainText(blocks).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

export const formatBlogDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

const mapPost = (row: any): BlogPost => ({ ...row, content: normalizeBlocks(row?.content) });

export const fetchPublishedPosts = async (): Promise<BlogPost[]> => {
  const { data, error } = await db
    .from('blog_posts')
    .select(BLOG_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false, nullsFirst: false });
  if (error) throw error;
  return (data ?? []).map(mapPost);
};

export const fetchPostBySlug = async (slug: string): Promise<BlogPost | null> => {
  const { data, error } = await db.from('blog_posts').select(BLOG_SELECT).eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? mapPost(data) : null;
};

export const fetchAllPostsForAdmin = async (): Promise<BlogPost[]> => {
  const { data, error } = await db
    .from('blog_posts')
    .select(BLOG_SELECT)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPost);
};

export const fetchCategories = async (): Promise<BlogCategory[]> => {
  const { data, error } = await db.from('blog_categories').select('id, name, slug, description').order('name');
  if (error) throw error;
  return (data ?? []) as BlogCategory[];
};

/** Uploads blog media into the public gig-media bucket under the author's folder. */
export const uploadBlogMedia = async (file: File, userId: string): Promise<string> => {
  const ext = file.name.split('.').pop() || 'bin';
  const path = `${userId}/blog/${newBlockId()}.${ext}`;
  const { error } = await supabase.storage.from('gig-media').upload(path, file, { upsert: true });
  if (error) throw error;
  return supabase.storage.from('gig-media').getPublicUrl(path).data.publicUrl;
};
