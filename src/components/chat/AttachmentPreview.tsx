import React, { useRef, useState } from 'react';
import { FileText, Download, Lock, ZoomIn, X, Eye, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useSignedAttachmentUrl } from '@/hooks/useSignedAttachmentUrl';
import SmartImage from '@/components/media/SmartImage';
import SmartVideo from '@/components/media/SmartVideo';

const IMAGE_EXT = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic'];
const VIDEO_EXT = ['mp4', 'mov', 'webm', 'ogg', 'mkv', 'avi', 'm4v'];
const PDF_EXT = ['pdf'];

function getKind(url: string): 'image' | 'video' | 'pdf' | 'doc' {
  try {
    const clean = url.split('?')[0];
    const ext = clean.split('.').pop()?.toLowerCase() || '';
    if (IMAGE_EXT.includes(ext)) return 'image';
    if (VIDEO_EXT.includes(ext)) return 'video';
    if (PDF_EXT.includes(ext)) return 'pdf';
    return 'doc';
  } catch {
    return 'doc';
  }
}

function getFileName(url: string): string {
  try {
    const clean = url.split('?')[0];
    return decodeURIComponent(clean.split('/').pop() || 'file');
  } catch {
    return 'file';
  }
}

interface Props {
  url: string;
  isOwn?: boolean;
  allowDownload?: boolean;
  lockedHint?: string;
  /** Show edit/delete controls (only for attachments the viewer is allowed to manage). */
  canManage?: boolean;
  onDelete?: () => void | Promise<unknown>;
  onReplace?: (file: File) => void | Promise<unknown>;
  managing?: boolean;
}

/** Repeated diagonal "Fivesom" watermark overlay shown on previews before payment release. */
const Watermark: React.FC = () => (
  <div
    aria-hidden
    className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg select-none"
    style={{
      backgroundImage:
        "repeating-linear-gradient(-30deg, rgba(255,255,255,0.18) 0 2px, transparent 2px 140px)",
    }}
  >
    <div className="absolute inset-0 flex flex-wrap items-center justify-center gap-8 rotate-[-25deg] opacity-40">
      {Array.from({ length: 24 }).map((_, i) => (
        <span
          key={i}
          className="text-white text-lg font-bold tracking-widest drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
        >
          FIVESOM • PREVIEW
        </span>
      ))}
    </div>
  </div>
);

const AttachmentPreview: React.FC<Props> = ({ url, isOwn, allowDownload = true, lockedHint }) => {
  const signedUrl = useSignedAttachmentUrl(url);
  const kind = getKind(url);
  const name = getFileName(url);
  const ext = (name.split('.').pop() || '').toUpperCase();
  const [zoomOpen, setZoomOpen] = useState(false);

  const ActionButton = () =>
    allowDownload ? (
      <Button
        asChild
        variant={isOwn ? 'secondary' : 'outline'}
        size="sm"
        className="flex-shrink-0"
      >
        <a href={signedUrl} target="_blank" rel="noopener noreferrer" download={name} aria-label="Download">
          <Download className="w-4 h-4 mr-2" />
          Download
        </a>
      </Button>
    ) : (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="w-3.5 h-3.5" />
        <span>{lockedHint || 'Locked'}</span>
      </div>
    );

  if (kind === 'image') {
    return (
      <>
        <div className="mt-2 inline-block">
          <div
            className="relative group cursor-zoom-in"
            onClick={() => setZoomOpen(true)}
          >
            <SmartImage
              src={signedUrl}
              alt={name}
              onContextMenu={(e) => { if (!allowDownload) e.preventDefault(); }}
              draggable={allowDownload}
              wrapperClassName="w-[260px] h-[200px] rounded-lg border shadow-sm"
              className={`w-full h-full object-cover block ${!allowDownload ? 'blur-[1px]' : ''}`}
              showRetry
            />
            {!allowDownload && <Watermark />}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
              <ZoomIn className="w-6 h-6 text-white drop-shadow" />
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground truncate max-w-[170px]">{name}</p>
            <ActionButton />
          </div>
        </div>

        {zoomOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setZoomOpen(false)}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/10"
              onClick={(e) => { e.stopPropagation(); setZoomOpen(false); }}
            >
              <X className="w-6 h-6" />
            </Button>
            <div className="relative max-w-[95vw] max-h-[90vh]">
              <img
                src={signedUrl}
                alt={name}
                onContextMenu={(e) => { if (!allowDownload) e.preventDefault(); }}
                className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg"
                onClick={(e) => e.stopPropagation()}
              />
              {!allowDownload && <Watermark />}
            </div>
          </div>
        )}
      </>
    );
  }

  if (kind === 'video') {
    return (
      <div className="mt-2 inline-block">
        <div className="relative">
          <div className="w-[320px] h-[220px] rounded-lg border bg-black overflow-hidden">
            <SmartVideo
              src={signedUrl}
              controls
              controlsList={allowDownload ? undefined : 'nodownload noremoteplayback'}
              disablePictureInPicture={!allowDownload}
              onContextMenu={(e) => { if (!allowDownload) e.preventDefault(); }}
            />
          </div>
          {!allowDownload && <Watermark />}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground truncate max-w-[170px]">{name}</p>
          <ActionButton />
        </div>
      </div>
    );
  }

  if (kind === 'pdf') {
    return (
      <div className="mt-2 w-full max-w-[520px]">
        <div className="relative">
          <iframe
            src={`${signedUrl}#toolbar=${allowDownload ? 1 : 0}&navpanes=0`}
            title={name}
            className="w-full h-[420px] rounded-lg border bg-background"
          />
          {!allowDownload && (
            <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-background/90 border text-xs text-muted-foreground shadow">
              <Eye className="w-3.5 h-3.5" />
              Preview only
            </div>
          )}
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground truncate max-w-[260px]">{name}</p>
          <ActionButton />
        </div>
      </div>
    );
  }

  // Generic doc
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
      <ActionButton />
    </div>
  );
};

export default AttachmentPreview;
