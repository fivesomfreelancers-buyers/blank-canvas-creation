import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO, { SITE_URL } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, CalendarDays, Clock, Newspaper, User } from 'lucide-react';
import {
  fetchCategories, fetchPublishedPosts, formatBlogDate, readingMinutes,
  type BlogCategory, type BlogPost,
} from '@/lib/blog';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [p, c] = await Promise.all([fetchPublishedPosts(), fetchCategories()]);
      setPosts(p);
      setCategories(c);
    } catch (e) {
      console.error('Blog load failed', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const channel = supabase
      .channel('blog-public')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blog_posts' }, load)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const usedCategories = useMemo(
    () => categories.filter((c) => posts.some((p) => p.category_id === c.id)),
    [categories, posts],
  );

  const filtered = useMemo(
    () => (activeCategory === 'all' ? posts : posts.filter((p) => p.category_id === activeCategory)),
    [posts, activeCategory],
  );

  const [featured, ...rest] = filtered;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'FIVESOM Blog',
    url: `${SITE_URL}/blog`,
    description:
      'Platform updates, new features, freelancer and buyer tips, escrow guidance and community news from FIVESOM.',
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.published_at ?? p.created_at,
      author: { '@type': 'Person', name: p.author_name || 'FIVESOM Team' },
      image: p.cover_image_url || undefined,
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="FIVESOM Blog — Platform Updates, Features & Freelancing Tips"
        description="Read FIVESOM platform updates, new and upcoming features, announcements, freelancer and buyer tips, escrow safety guidance, success stories and community news."
        canonical="/blog"
        jsonLd={jsonLd}
      />
      <Navbar />

      <main className="container mx-auto px-4 py-10 sm:py-14">
        <header className="max-w-3xl">
          <Badge variant="outline" className="mb-4 gap-1">
            <Newspaper className="h-3 w-3" /> FIVESOM Blog
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            News, updates and guides from FIVESOM
          </h1>
          <p className="mt-4 text-muted-foreground">
            Everything happening on the platform: product announcements, new and upcoming features, how to earn as a
            freelancer, how to hire safely as a client, how our escrow protection works, and stories from our community
            across Africa and the diaspora.
          </p>
        </header>

        {usedCategories.length > 0 && (
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Blog categories">
            <Button
              size="sm"
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setActiveCategory('all')}
            >
              All articles
            </Button>
            {usedCategories.map((c) => (
              <Button
                key={c.id}
                size="sm"
                variant={activeCategory === c.id ? 'default' : 'outline'}
                onClick={() => setActiveCategory(c.id)}
              >
                {c.name}
              </Button>
            ))}
          </nav>
        )}

        {loading ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[0, 1, 2].map((i) => <Skeleton key={i} className="h-72 w-full rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-12 rounded-xl border border-border bg-card p-10 text-center">
            <h2 className="text-xl font-semibold text-foreground">No articles published yet</h2>
            <p className="mt-2 text-muted-foreground">
              Our first FIVESOM stories and platform updates are on the way. In the meantime, learn how the platform
              works.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild><Link to="/how-it-works">How FIVESOM works</Link></Button>
              <Button asChild variant="outline"><Link to="/explore">Explore services</Link></Button>
            </div>
          </div>
        ) : (
          <>
            {featured && (
              <article className="mt-10 grid gap-6 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-2">
                <Link to={`/blog/${featured.slug}`} className="block bg-muted">
                  {featured.cover_image_url ? (
                    <img
                      src={featured.cover_image_url}
                      alt={featured.title}
                      className="h-full max-h-80 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-56 items-center justify-center text-muted-foreground">
                      <Newspaper className="h-10 w-10" />
                    </div>
                  )}
                </Link>
                <div className="flex flex-col justify-center gap-4 p-6 sm:p-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {featured.blog_categories?.name && <Badge variant="secondary">{featured.blog_categories.name}</Badge>}
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> {formatBlogDate(featured.published_at ?? featured.created_at)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {readingMinutes(featured.content)} min read
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">
                    <Link to={`/blog/${featured.slug}`}>{featured.title}</Link>
                  </h2>
                  {featured.excerpt && <p className="text-muted-foreground">{featured.excerpt}</p>}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" /> {featured.author_name || 'FIVESOM Team'}
                  </div>
                  <Button asChild className="w-fit">
                    <Link to={`/blog/${featured.slug}`}>
                      Read more <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </article>
            )}

            {rest.length > 0 && (
              <section className="mt-12">
                <h2 className="text-xl font-semibold text-foreground">Latest articles</h2>
                <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((post) => (
                    <article
                      key={post.id}
                      className="flex flex-col overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/50"
                    >
                      <Link to={`/blog/${post.slug}`} className="block bg-muted">
                        {post.cover_image_url ? (
                          <img src={post.cover_image_url} alt={post.title} className="h-44 w-full object-cover" loading="lazy" />
                        ) : (
                          <div className="flex h-44 items-center justify-center text-muted-foreground">
                            <Newspaper className="h-8 w-8" />
                          </div>
                        )}
                      </Link>
                      <div className="flex flex-1 flex-col gap-3 p-5">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                          {post.blog_categories?.name && <Badge variant="secondary">{post.blog_categories.name}</Badge>}
                          <span className="inline-flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" /> {formatBlogDate(post.published_at ?? post.created_at)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">
                          <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                        </h3>
                        {post.excerpt && <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>}
                        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                          <span className="inline-flex items-center gap-1">
                            <User className="h-3 w-3" /> {post.author_name || 'FIVESOM Team'}
                          </span>
                          <Link to={`/blog/${post.slug}`} className="inline-flex items-center gap-1 font-medium text-primary">
                            Read more <ArrowRight className="h-3 w-3" />
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Blog;
