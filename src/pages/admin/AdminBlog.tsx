import React, { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockEditor from '@/components/blog/BlockEditor';
import BlogContent from '@/components/blog/BlogContent';
import {
  fetchAllPostsForAdmin, fetchCategories, formatBlogDate, slugifyTitle, uploadBlogMedia,
  type BlogBlock, type BlogCategory, type BlogPost,
} from '@/lib/blog';
import {
  Eye, EyeOff, ExternalLink, FileText, Loader2, Pencil, Plus, Trash2, Upload,
} from 'lucide-react';

const db = supabase as any;

interface FormState {
  id?: string;
  title: string;
  slug: string;
  excerpt: string;
  cover_image_url: string;
  category_id: string;
  status: 'draft' | 'published';
  author_name: string;
  author_title: string;
  author_image_url: string;
  published_at: string;
  content: BlogBlock[];
}

const emptyForm = (name: string): FormState => ({
  title: '', slug: '', excerpt: '', cover_image_url: '', category_id: '',
  status: 'draft', author_name: name, author_title: '', author_image_url: '',
  published_at: '', content: [],
});

const toDateInput = (value?: string | null) => (value ? new Date(value).toISOString().slice(0, 10) : '');

const AdminBlog = () => {
  const { user, profile } = useAuth() as any;
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(''));
  const [catOpen, setCatOpen] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInput = useRef<HTMLInputElement | null>(null);

  const authorFallback = profile?.full_name || 'FIVESOM Team';

  const load = async () => {
    try {
      const [p, c] = await Promise.all([fetchAllPostsForAdmin(), fetchCategories()]);
      setPosts(p);
      setCategories(c);
    } catch (e: any) {
      toast({ title: 'Could not load blog posts', description: e?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('admin-blog')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, load)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_categories' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const filtered = useMemo(
    () => (filter === 'all' ? posts : posts.filter((p) => p.status === filter)),
    [posts, filter],
  );

  const openNew = () => {
    setForm(emptyForm(authorFallback));
    setPreview(false);
    setOpen(true);
  };

  const openEdit = (post: BlogPost) => {
    setForm({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt ?? '',
      cover_image_url: post.cover_image_url ?? '',
      category_id: post.category_id ?? '',
      status: post.status,
      author_name: post.author_name ?? authorFallback,
      author_title: post.author_title ?? '',
      author_image_url: post.author_image_url ?? '',
      published_at: toDateInput(post.published_at),
      content: post.content,
    });
    setPreview(false);
    setOpen(true);
  };

  const save = async (status: 'draft' | 'published') => {
    if (!form.title.trim()) {
      toast({ title: 'A title is required', variant: 'destructive' });
      return;
    }
    if (status === 'published' && form.content.length === 0) {
      toast({ title: 'Add some content before publishing', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const slug = slugifyTitle(form.slug || form.title) || `post-${Date.now()}`;
      const payload: Record<string, unknown> = {
        title: form.title.trim(),
        slug,
        excerpt: form.excerpt.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        content: form.content,
        category_id: form.category_id || null,
        status,
        author_name: form.author_name.trim() || authorFallback,
        author_title: form.author_title.trim() || null,
        author_image_url: form.author_image_url.trim() || null,
        published_at:
          status === 'published'
            ? form.published_at
              ? new Date(form.published_at).toISOString()
              : new Date().toISOString()
            : null,
      };

      if (form.id) {
        const { error } = await db.from('blog_posts').update(payload).eq('id', form.id);
        if (error) throw error;
      } else {
        const { error } = await db.from('blog_posts').insert({ ...payload, created_by: user?.id ?? null });
        if (error) throw error;
      }

      toast({ title: status === 'published' ? 'Article published' : 'Draft saved' });
      setOpen(false);
      load();
    } catch (e: any) {
      toast({ title: 'Save failed', description: e?.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (post: BlogPost) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    const { error } = await db
      .from('blog_posts')
      .update({
        status: next,
        published_at: next === 'published' ? post.published_at ?? new Date().toISOString() : null,
      })
      .eq('id', post.id);
    if (error) {
      toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: next === 'published' ? 'Article published' : 'Article unpublished' });
    load();
  };

  const removePost = async (post: BlogPost) => {
    if (!window.confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    const { error } = await db.from('blog_posts').delete().eq('id', post.id);
    if (error) {
      toast({ title: 'Delete failed', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Article deleted' });
    load();
  };

  const createCategory = async () => {
    if (!newCat.name.trim()) return;
    const { error } = await db.from('blog_categories').insert({
      name: newCat.name.trim(),
      slug: slugifyTitle(newCat.name),
      description: newCat.description.trim() || null,
    });
    if (error) {
      toast({ title: 'Could not create category', description: error.message, variant: 'destructive' });
      return;
    }
    setNewCat({ name: '', description: '' });
    toast({ title: 'Category created' });
    load();
  };

  const removeCategory = async (cat: BlogCategory) => {
    if (!window.confirm(`Delete category "${cat.name}"?`)) return;
    const { error } = await db.from('blog_categories').delete().eq('id', cat.id);
    if (error) {
      toast({ title: 'Could not delete category', description: error.message, variant: 'destructive' });
      return;
    }
    load();
  };

  const uploadCover = async (file: File) => {
    if (!user?.id) return;
    setUploadingCover(true);
    try {
      const url = await uploadBlogMedia(file, user.id);
      setForm((f) => ({ ...f, cover_image_url: url }));
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message, variant: 'destructive' });
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h2 className="text-lg font-semibold">Blog / CMS</h2>
          <p className="text-sm text-muted-foreground">
            Publish platform updates, features, announcements, tips and community news.
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setCatOpen(true)}>Categories</Button>
          <Button variant="outline" size="sm" asChild>
            <a href="/blog" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1 h-3.5 w-3.5" /> View blog
            </a>
          </Button>
          <Button size="sm" onClick={openNew}><Plus className="mr-1 h-4 w-4" /> New article</Button>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All ({posts.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({posts.filter((p) => p.status === 'published').length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({posts.filter((p) => p.status === 'draft').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading articles…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No articles here yet. Click “New article” to write the first FIVESOM post.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filtered.map((post) => (
            <Card key={post.id}>
              <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <FileText className="h-5 w-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>{post.status}</Badge>
                    {post.blog_categories?.name && <Badge variant="outline">{post.blog_categories.name}</Badge>}
                    <span className="text-xs text-muted-foreground">
                      {post.status === 'published'
                        ? formatBlogDate(post.published_at ?? post.created_at)
                        : `Updated ${formatBlogDate(post.updated_at)}`}
                    </span>
                  </div>
                  <p className="mt-1 truncate font-medium">{post.title}</p>
                  <p className="truncate text-xs text-muted-foreground">/blog/{post.slug}</p>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => openEdit(post)}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(post)}>
                    {post.status === 'published'
                      ? <><EyeOff className="mr-1 h-3.5 w-3.5" /> Unpublish</>
                      : <><Eye className="mr-1 h-3.5 w-3.5" /> Publish</>}
                  </Button>
                  {post.status === 'published' && (
                    <Button size="sm" variant="ghost" asChild>
                      <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => removePost(post)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Editor dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Edit article' : 'New article'}</DialogTitle>
          </DialogHeader>

          <div className="flex justify-end">
            <Button size="sm" variant="outline" onClick={() => setPreview((p) => !p)}>
              {preview ? 'Back to editor' : 'Preview'}
            </Button>
          </div>

          {preview ? (
            <article className="space-y-4">
              <h1 className="text-2xl font-bold">{form.title || 'Untitled article'}</h1>
              {form.excerpt && <p className="text-muted-foreground">{form.excerpt}</p>}
              {form.cover_image_url && (
                <img src={form.cover_image_url} alt={form.title} className="w-full rounded-xl border border-border" />
              )}
              <BlogContent blocks={form.content} />
            </article>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 sm:col-span-2">
                  <Label>Title *</Label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="FIVESOM launches secure escrow payouts"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>URL slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                    placeholder={slugifyTitle(form.title) || 'article-title'}
                  />
                  <p className="text-xs text-muted-foreground">
                    Public URL: /blog/{slugifyTitle(form.slug || form.title) || 'article-title'}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Short description</Label>
                  <Textarea
                    rows={2}
                    value={form.excerpt}
                    onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
                    placeholder="One or two sentences shown on the blog list and in search results."
                  />
                </div>
                <div className="space-y-1">
                  <Label>Category</Label>
                  <Select
                    value={form.category_id || 'none'}
                    onValueChange={(v) => setForm((f) => ({ ...f, category_id: v === 'none' ? '' : v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Publication date</Label>
                  <Input
                    type="date"
                    value={form.published_at}
                    onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Author name</Label>
                  <Input
                    value={form.author_name}
                    onChange={(e) => setForm((f) => ({ ...f, author_name: e.target.value }))}
                    placeholder="FIVESOM Team"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Author title</Label>
                  <Input
                    value={form.author_title}
                    onChange={(e) => setForm((f) => ({ ...f, author_title: e.target.value }))}
                    placeholder="Founder, FIVESOM"
                  />
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <Label>Author photo URL</Label>
                  <Input
                    value={form.author_image_url}
                    onChange={(e) => setForm((f) => ({ ...f, author_image_url: e.target.value }))}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Featured image</Label>
                  <Input
                    value={form.cover_image_url}
                    onChange={(e) => setForm((f) => ({ ...f, cover_image_url: e.target.value }))}
                    placeholder="Paste an image URL or upload"
                  />
                  <input
                    ref={coverInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadCover(file);
                      e.target.value = '';
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={uploadingCover}
                    onClick={() => coverInput.current?.click()}
                  >
                    <Upload className="mr-1 h-3.5 w-3.5" />
                    {uploadingCover ? 'Uploading…' : 'Upload featured image'}
                  </Button>
                  {form.cover_image_url && (
                    <img
                      src={form.cover_image_url}
                      alt="Featured"
                      className="max-h-40 rounded-lg border border-border object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Article content</Label>
                <BlockEditor
                  blocks={form.content}
                  onChange={(content) => setForm((f) => ({ ...f, content }))}
                  userId={user?.id ?? ''}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button variant="outline" onClick={() => save('draft')} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Save draft
            </Button>
            <Button onClick={() => save('published')} disabled={saving}>
              {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories dialog */}
      <Dialog open={catOpen} onOpenChange={setCatOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Blog categories</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {categories.map((c) => (
              <div key={c.id} className="flex items-center gap-2 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{c.name}</p>
                  <p className="truncate text-xs text-muted-foreground">/{c.slug}</p>
                </div>
                <Button size="icon" variant="ghost" onClick={() => removeCategory(c)} aria-label="Delete category">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm">Add category</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <Input
                value={newCat.name}
                placeholder="Category name"
                onChange={(e) => setNewCat((c) => ({ ...c, name: e.target.value }))}
              />
              <Input
                value={newCat.description}
                placeholder="Short description (optional)"
                onChange={(e) => setNewCat((c) => ({ ...c, description: e.target.value }))}
              />
              <Button size="sm" onClick={createCategory}><Plus className="mr-1 h-4 w-4" /> Add category</Button>
            </CardContent>
          </Card>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminBlog;
