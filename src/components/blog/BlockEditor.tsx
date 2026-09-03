import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  ArrowDown, ArrowUp, Heading2, Heading3, Image as ImageIcon, Link2, List,
  ListOrdered, Minus, Quote, Trash2, Type, Upload, Video,
} from 'lucide-react';
import { newBlockId, uploadBlogMedia, type BlogBlock } from '@/lib/blog';
import { toast } from '@/hooks/use-toast';

interface Props {
  blocks: BlogBlock[];
  onChange: (blocks: BlogBlock[]) => void;
  userId: string;
}

const labels: Record<BlogBlock['type'], string> = {
  heading: 'Heading',
  paragraph: 'Paragraph',
  quote: 'Quote',
  list: 'List',
  image: 'Image',
  video: 'Video',
  link: 'Button / link',
  divider: 'Divider',
};

const BlockEditor = ({ blocks, onChange, userId }: Props) => {
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const add = (block: BlogBlock) => onChange([...blocks, block]);
  const update = (id: string, patch: Partial<BlogBlock>) =>
    onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as BlogBlock) : b)));
  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  const handleUpload = async (id: string, file: File, kind: 'image' | 'video') => {
    setUploadingId(id);
    try {
      const url = await uploadBlogMedia(file, userId);
      update(id, { url } as Partial<BlogBlock>);
      toast({ title: `${kind === 'image' ? 'Image' : 'Video'} uploaded` });
    } catch (e: any) {
      toast({ title: 'Upload failed', description: e?.message ?? 'Please try again.', variant: 'destructive' });
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/40 p-2">
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'heading', level: 2, text: '' })}>
          <Heading2 className="mr-1 h-3.5 w-3.5" /> H2
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'heading', level: 3, text: '' })}>
          <Heading3 className="mr-1 h-3.5 w-3.5" /> H3
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'paragraph', text: '' })}>
          <Type className="mr-1 h-3.5 w-3.5" /> Paragraph
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'list', style: 'bullet', items: [''] })}>
          <List className="mr-1 h-3.5 w-3.5" /> Bullets
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'list', style: 'number', items: [''] })}>
          <ListOrdered className="mr-1 h-3.5 w-3.5" /> Numbered
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'image', url: '', alt: '', caption: '' })}>
          <ImageIcon className="mr-1 h-3.5 w-3.5" /> Image
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'video', url: '', caption: '' })}>
          <Video className="mr-1 h-3.5 w-3.5" /> Video
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'quote', text: '', cite: '' })}>
          <Quote className="mr-1 h-3.5 w-3.5" /> Quote
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'link', url: '', label: '' })}>
          <Link2 className="mr-1 h-3.5 w-3.5" /> Button
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => add({ id: newBlockId(), type: 'divider' })}>
          <Minus className="mr-1 h-3.5 w-3.5" /> Divider
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Inside any text you can use <code>**bold**</code>, <code>*italic*</code> and{' '}
        <code>[label](https://link)</code> or <code>[label](/explore)</code>.
      </p>

      {blocks.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Add your first content block above to start writing the article.
        </div>
      )}

      {blocks.map((block, index) => (
        <div key={block.id} className="rounded-lg border border-border bg-card p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{labels[block.type]}</Badge>
            <div className="ml-auto flex items-center gap-1">
              <Button type="button" size="icon" variant="ghost" onClick={() => move(index, -1)} aria-label="Move up">
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => move(index, 1)} aria-label="Move down">
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" size="icon" variant="ghost" onClick={() => remove(block.id)} aria-label="Delete block">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>

          {block.type === 'heading' && (
            <Input
              value={block.text}
              placeholder={block.level === 2 ? 'Section heading' : 'Sub heading'}
              onChange={(e) => update(block.id, { text: e.target.value } as any)}
            />
          )}

          {block.type === 'paragraph' && (
            <Textarea
              rows={4}
              value={block.text}
              placeholder="Write the paragraph…"
              onChange={(e) => update(block.id, { text: e.target.value } as any)}
            />
          )}

          {block.type === 'quote' && (
            <div className="space-y-2">
              <Textarea
                rows={3}
                value={block.text}
                placeholder="Quote text"
                onChange={(e) => update(block.id, { text: e.target.value } as any)}
              />
              <Input
                value={block.cite ?? ''}
                placeholder="Who said it (optional)"
                onChange={(e) => update(block.id, { cite: e.target.value } as any)}
              />
            </div>
          )}

          {block.type === 'list' && (
            <div className="space-y-2">
              {block.items.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={item}
                    placeholder={`Item ${i + 1}`}
                    onChange={(e) => {
                      const items = [...block.items];
                      items[i] = e.target.value;
                      update(block.id, { items } as any);
                    }}
                  />
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    aria-label="Remove item"
                    onClick={() => update(block.id, { items: block.items.filter((_, x) => x !== i) } as any)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button type="button" size="sm" variant="outline" onClick={() => update(block.id, { items: [...block.items, ''] } as any)}>
                Add item
              </Button>
            </div>
          )}

          {(block.type === 'image' || block.type === 'video') && (
            <div className="space-y-2">
              <Input
                value={block.url}
                placeholder={block.type === 'image' ? 'Image URL' : 'Video URL (upload or YouTube link)'}
                onChange={(e) => update(block.id, { url: e.target.value } as any)}
              />
              <input
                ref={(el) => { fileInputs.current[block.id] = el; }}
                type="file"
                accept={block.type === 'image' ? 'image/*' : 'video/*'}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(block.id, file, block.type as 'image' | 'video');
                  e.target.value = '';
                }}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={uploadingId === block.id}
                  onClick={() => fileInputs.current[block.id]?.click()}
                >
                  <Upload className="mr-1 h-3.5 w-3.5" />
                  {uploadingId === block.id ? 'Uploading…' : `Upload ${block.type}`}
                </Button>
              </div>
              {block.type === 'image' && (
                <Input
                  value={block.alt ?? ''}
                  placeholder="Alt text (for accessibility and SEO)"
                  onChange={(e) => update(block.id, { alt: e.target.value } as any)}
                />
              )}
              <Input
                value={block.caption ?? ''}
                placeholder="Caption (optional)"
                onChange={(e) => update(block.id, { caption: e.target.value } as any)}
              />
              {block.url && block.type === 'image' && (
                <img src={block.url} alt={block.alt || ''} className="max-h-48 rounded-lg border border-border object-contain" />
              )}
            </div>
          )}

          {block.type === 'link' && (
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1">
                <Label className="text-xs">Button label</Label>
                <Input
                  value={block.label}
                  placeholder="Explore services"
                  onChange={(e) => update(block.id, { label: e.target.value } as any)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">URL</Label>
                <Input
                  value={block.url}
                  placeholder="/explore or https://…"
                  onChange={(e) => update(block.id, { url: e.target.value } as any)}
                />
              </div>
            </div>
          )}

          {block.type === 'divider' && <p className="text-xs text-muted-foreground">A horizontal separator line.</p>}
        </div>
      ))}
    </div>
  );
};

export default BlockEditor;
