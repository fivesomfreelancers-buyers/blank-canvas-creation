import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import SEO, { SITE_URL } from '@/components/SEO';
import BlogContent from '@/components/blog/BlogContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, CalendarDays, Clock, Newspaper } from 'lucide-react';
import {
  fetchPostBySlug, fetchPublishedPosts, formatBlogDate, readingMinutes,
  blocksToPlainText, type BlogPost as Post,
} from '@/lib/blog';

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const found = slug ? await fetchPostBySlug(slug) : null;
        if (!alive) return;
        setPost(found && found.status === 'published' ? found : null);
        if (found) {
          const all = await fetchPublishedPosts();
          if (!alive) return;
          setRelated(all.filter((p) => p.id !== found.id).slice(0, 3));
        }
      } catch (e) {
        console.error('Blog article load failed', e);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const description =
    post?.excerpt?.trim() ||
    blocksToPlainText(post?.content ?? []).slice(0, 155) ||
    'FIVESOM platform news, updates and freelancing guidance.';

  return (
    <div className="min-h-screen bg-background">
      {post ? (
        <SEO
          title={`${post.title} | FIVESOM Blog`}
          description={description}
          canonical={`/blog/${post.slug}`}
          type="article"
          image={post.cover_image_url || undefined}
          jsonLd={{
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title,
            description,
            image: post.cover_image_url || undefined,
            datePublished: post.published_at ?? post.created_at,
            dateModified: post.updated_at,
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${post.slug}` },
            author: {
              '@type': 'Person',
              name: post.author_name || 'FIVESOM Team',
              jobTitle: post.author_title || undefined,
            },
            publisher: {
              '@type': 'Organization',
              name: 'FIVESOM',
              url: SITE_URL,
              logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.png` },
            },
            articleSection: post.blog_categories?.name || undefined,
          }}
        />
      ) : (
        <SEO
          title="Article not found | FIVESOM Blog"
          description="This FIVESOM blog article is not available."
          canonical="/blog"
          noindex
        />
      )}

      <Navbar />

      <main className="container mx-auto px-4 py-10 sm:py-14">
        <Button asChild variant="ghost" size="sm" className="mb-6 -ml-2">
          <Link to="/blog"><ArrowLeft className="mr-2 h-4 w-4" /> All articles</Link>
        </Button>

        {loading ? (
          <div className="mx-auto max-w-3xl space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ) : !post ? (
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-10 text-center">
            <h1 className="text-2xl font-bold text-foreground">Article not found</h1>
            <p className="mt-2 text-muted-foreground">
              This article may have been unpublished or the link is incorrect.
            </p>
            <Button asChild className="mt-6"><Link to="/blog">Back to the blog</Link></Button>
          </div>
        ) : (
          <article className="mx-auto max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {post.blog_categories?.name && <Badge variant="secondary">{post.blog_categories.name}</Badge>}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3 w-3" /> {formatBlogDate(post.published_at ?? post.created_at)}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3 w-3" /> {readingMinutes(post.content)} min read
              </span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight text-foreground">{post.title}</h1>
            {post.excerpt && <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>}

            <div className="mt-6 flex items-center gap-3 border-y border-border py-4">
              {post.author_image_url ? (
                <img
                  src={post.author_image_url}
                  alt={post.author_name || 'FIVESOM author'}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Newspaper className="h-4 w-4" />
                </div>
              )}
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">{post.author_name || 'FIVESOM Team'}</p>
                {post.author_title && <p className="text-xs text-muted-foreground">{post.author_title}</p>}
              </div>
            </div>

            {post.cover_image_url && (
              <img
                src={post.cover_image_url}
                alt={post.title}
                className="mt-8 w-full rounded-xl border border-border object-cover"
              />
            )}

            <div className="mt-8">
              <BlogContent blocks={post.content} />
            </div>

            <div className="mt-12 rounded-xl border border-border bg-card p-6">
              <h2 className="text-lg font-semibold text-foreground">Start on FIVESOM</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Hire trusted freelancers or start earning — every order is protected by FIVESOM escrow.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button asChild><Link to="/explore">Explore services</Link></Button>
                <Button asChild variant="outline"><Link to="/how-it-works">How it works</Link></Button>
              </div>
            </div>

            {related.length > 0 && (
              <section className="mt-12">
                <h2 className="text-lg font-semibold text-foreground">More from the FIVESOM blog</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  {related.map((r) => (
                    <Link
                      key={r.id}
                      to={`/blog/${r.slug}`}
                      className="rounded-xl border border-border bg-card p-4 transition hover:border-primary/50"
                    >
                      <p className="text-sm font-semibold text-foreground line-clamp-2">{r.title}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatBlogDate(r.published_at ?? r.created_at)}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
