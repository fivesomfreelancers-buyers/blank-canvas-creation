import React from 'react';
import { Link } from 'react-router-dom';
import type { BlogBlock } from '@/lib/blog';
import { safeExternalUrl } from '@/lib/safeUrl';

/** Renders **bold**, *italic* and [label](url) inside a text block. */
const Inline = ({ text }: { text: string }) => {
  const nodes: React.ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('[')) {
      const label = token.slice(1, token.indexOf(']'));
      const url = token.slice(token.indexOf('(') + 1, -1);
      const internal = url.startsWith('/');
      nodes.push(
        internal ? (
          <Link key={key++} to={url} className="text-primary underline underline-offset-4">
            {label}
          </Link>
        ) : (
          <a
            key={key++}
            href={safeExternalUrl(url) || '#'}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="text-primary underline underline-offset-4"
          >
            {label}
          </a>
        ),
      );
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <>{nodes}</>;
};

const youtubeEmbed = (url: string): string | null => {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : null;
};

const BlogContent = ({ blocks }: { blocks: BlogBlock[] }) => (
  <div className="space-y-6">
    {blocks.map((block) => {
      switch (block.type) {
        case 'heading':
          return block.level === 3 ? (
            <h3 key={block.id} className="text-xl font-semibold text-foreground">
              <Inline text={block.text} />
            </h3>
          ) : (
            <h2 key={block.id} className="text-2xl font-bold text-foreground">
              <Inline text={block.text} />
            </h2>
          );
        case 'paragraph':
          return (
            <p key={block.id} className="text-base leading-relaxed text-muted-foreground whitespace-pre-line">
              <Inline text={block.text} />
            </p>
          );
        case 'quote':
          return (
            <blockquote
              key={block.id}
              className="border-l-4 border-primary/60 bg-muted/40 rounded-r-lg px-5 py-4 italic text-foreground"
            >
              <Inline text={block.text} />
              {block.cite && <footer className="mt-2 text-sm not-italic text-muted-foreground">— {block.cite}</footer>}
            </blockquote>
          );
        case 'list':
          return block.style === 'number' ? (
            <ol key={block.id} className="list-decimal space-y-2 pl-6 text-muted-foreground">
              {block.items.map((item, i) => (
                <li key={i}><Inline text={item} /></li>
              ))}
            </ol>
          ) : (
            <ul key={block.id} className="list-disc space-y-2 pl-6 text-muted-foreground">
              {block.items.map((item, i) => (
                <li key={i}><Inline text={item} /></li>
              ))}
            </ul>
          );
        case 'image':
          return block.url ? (
            <figure key={block.id} className="space-y-2">
              <img
                src={block.url}
                alt={block.alt || block.caption || 'FIVESOM blog illustration'}
                loading="lazy"
                className="w-full rounded-xl border border-border bg-muted object-contain"
              />
              {block.caption && (
                <figcaption className="text-center text-sm text-muted-foreground">{block.caption}</figcaption>
              )}
            </figure>
          ) : null;
        case 'video': {
          if (!block.url) return null;
          const embed = youtubeEmbed(block.url);
          return (
            <figure key={block.id} className="space-y-2">
              {embed ? (
                <div className="aspect-video w-full overflow-hidden rounded-xl border border-border">
                  <iframe
                    src={embed}
                    title={block.caption || 'FIVESOM blog video'}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                    className="h-full w-full"
                  />
                </div>
              ) : (
                <video src={block.url} controls className="w-full rounded-xl border border-border bg-black" />
              )}
              {block.caption && (
                <figcaption className="text-center text-sm text-muted-foreground">{block.caption}</figcaption>
              )}
            </figure>
          );
        }
        case 'link': {
          if (!block.url) return null;
          const internal = block.url.startsWith('/');
          const classes =
            'inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition';
          return internal ? (
            <Link key={block.id} to={block.url} className={classes}>
              {block.label || 'Learn more'}
            </Link>
          ) : (
            <a
              key={block.id}
              href={safeExternalUrl(block.url) || '#'}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className={classes}
            >
              {block.label || 'Learn more'}
            </a>
          );
        }
        case 'divider':
          return <hr key={block.id} className="border-border" />;
        default:
          return null;
      }
    })}
  </div>
);

export default BlogContent;
