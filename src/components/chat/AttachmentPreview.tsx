import React from 'react';
import { FileText, Download, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic'];
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'ogg', 'mkv', 'avi', 'm4v'];

function getKind(url: string): 'image' | 'video' | 'doc' {
  try {
    const clean = url.split('?')[0];
    const ext = clean.split('.').pop()?.toLowerCase() || '';
    if (IMAGE_EXT.includes(ext)) return 'image';
    if (VIDEO_EXT.includes(ext)) return 'video';
    return 'doc';
  } catch {
    return 'doc';
  }
}

function getFileName(url: string): string {
  try {
    const clean = url.split('?')[0];
    const name = decodeURIComponent(clean.split('/').pop() || 'file');
    return name;
  } catch {
    return 'file';
  }
}

interface Props {
  url: string;
  isOwn?: boolean;
}

const AttachmentPreview: React.FC<Props> = ({ url, isOwn }) => {
  const kind = getKind(url);
  const name = getFileName(url);
  const ext = (name.split('.').pop() || '').toUpperCase();

  if (kind === 'image') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        <img
          src={url}
          alt={name}
          className="max-w-[240px] max-h-[240px] rounded-lg border shadow-sm object-cover"
        />
      </a>
    );
  }

  if (kind === 'video') {
    return (
      <div className="mt-2">
        <video
          src={url}
          controls
          preload="metadata"
          className="max-w-[260px] max-h-[260px] rounded-lg border bg-black"
        >
          <source src={url} />
          Your browser does not support video.
        </video>
      </div>
    );
  }

  return (
    <div
      className={`mt-2 flex items-center gap-3 p-3 rounded-lg border ${
        isOwn ? 'bg-primary-foreground/10 border-primary-foreground/20' : 'bg-background border-border'
      }`}
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-md bg-muted flex items-center justify-center">
        <FileText className="w-5 h-5 text-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${isOwn ? 'text-primary-foreground' : 'text-foreground'}`}>
          {name}
        </p>
        <p className={`text-xs ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
          {ext || 'FILE'}
        </p>
      </div>
      <Button
        asChild
        variant={isOwn ? 'secondary' : 'outline'}
        size="icon"
        className="flex-shrink-0"
      >
        <a href={url} target="_blank" rel="noopener noreferrer" download={name} aria-label="Download">
          <Download className="w-4 h-4" />
        </a>
      </Button>
    </div>
  );
};

export default AttachmentPreview;
