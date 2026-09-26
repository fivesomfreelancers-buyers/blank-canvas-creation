import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy, Link2 } from 'lucide-react';
import { toast } from 'sonner';

interface CopyLinkButtonProps {
  /** Absolute or root-relative link to copy (e.g. /freelancer/username). */
  url: string;
  label?: string;
  copiedLabel?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

/** Shared "copy link" button: copies a shareable public URL to the clipboard. */
const CopyLinkButton: React.FC<CopyLinkButtonProps> = ({
  url,
  label = 'Copy link',
  copiedLabel = 'Copied!',
  className,
  variant = 'outline',
  size = 'default',
}) => {
  const [copied, setCopied] = useState(false);

  const absoluteUrl = url.startsWith('http')
    ? url
    : `${typeof window !== 'undefined' ? window.location.origin : ''}${url.startsWith('/') ? '' : '/'}${url}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absoluteUrl);
      } else {
        const input = document.createElement('input');
        input.value = absoluteUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      toast.success('Link copied', { description: absoluteUrl });
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy the link', { description: absoluteUrl });
    }
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleCopy}
      aria-label={`${label}: ${absoluteUrl}`}
      title={absoluteUrl}
    >
      {copied ? (
        <Check className="w-4 h-4 mr-2" />
      ) : size === 'icon' ? (
        <Link2 className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4 mr-2" />
      )}
      {size === 'icon' ? null : copied ? copiedLabel : label}
    </Button>
  );
};

export default CopyLinkButton;
