import React from 'react';
import { FileText, Download, Play, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSignedAttachmentUrl } from '@/hooks/useSignedAttachmentUrl';

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
  allowDownload?: boolean;
  lockedHint?: string;
}

const AttachmentPreview: React.FC<Props> = ({ url, isOwn, allowDownload = true, lockedHint }) => {
  const signedUrl = useSignedAttachmentUrl(url);
  const kind = getKind(url);
  const name = getFileName(url);
  const ext = (name.split('.').pop() || '').toUpperCase();

  const DownloadButton = () => (
    allowDownload ? (
      <Button
        asChild
        variant={isOwn ? 'secondary' : 'outline'}
        size="sm"
        className="flex-shrink-0"
      >
        <a href={url} target="_blank" rel="noopener noreferrer" download={name} aria-label="Download">
          <Download className="w-4 h-4 mr-2" />
          Download
        </a>
      </Button>
    ) : (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        <span>{lockedHint || 'Locked'}</span>
      </div>
    )
  );

  if (kind === 'image') {
    return (
      <div className="mt-2 inline-block">
        <img
          src={url}
          alt={name}
          onContextMenu={(e) => { if (!allowDownload) e.preventDefault(); }}
          className="max-w-[260px] max-h-[260px] rounded-lg border shadow-sm object-cover block"
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground truncate max-w-[170px]">{name}</p>
          <DownloadButton />
        </div>
      </div>
    );
  }

  if (kind === 'video') {
    return (
      <div className="mt-2 inline-block">
        <video
          src={url}
          controls
          controlsList={allowDownload ? undefined : 'nodownload'}
          onContextMenu={(e) => { if (!allowDownload) e.preventDefault(); }}
          preload="metadata"
          className="max-w-[280px] max-h-[280px] rounded-lg border bg-black block"
        >
          <source src={url} />
          Your browser does not support video.
        </video>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground truncate max-w-[170px]">{name}</p>
          <DownloadButton />
        </div>
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
      <DownloadButton />
    </div>
  );
};

export default AttachmentPreview;
