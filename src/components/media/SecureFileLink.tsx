import React from 'react';
import { useSignedAttachmentUrl } from '@/hooks/useSignedAttachmentUrl';

interface Props extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  url: string;
  children: React.ReactNode;
}

/**
 * Anchor that always resolves private Supabase storage URLs into short-lived
 * signed URLs, so downloads keep working in production.
 */
const SecureFileLink = ({ url, children, ...rest }: Props) => {
  const signed = useSignedAttachmentUrl(url);
  return (
    <a href={signed} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
};

export default SecureFileLink;
