import React from 'react';
import { cn } from '@/lib/utils';
import { softwareLogo } from '@/lib/toolsCatalog';

interface ToolIconProps {
  slug: string;
  name?: string;
  className?: string;
}

/**
 * Renders a bundled tool logo as a real image on a neutral light plate,
 * so brand marks stay legible on dark themes instead of showing as blank
 * white squares. Falls back to a compact initial badge when no logo exists.
 */
const ToolIcon: React.FC<ToolIconProps> = ({ slug, name, className }) => {
  const url = softwareLogo(slug);

  if (!url) {
    return (
      <span
        aria-hidden
        className={cn(
          'inline-flex items-center justify-center rounded-[3px] bg-primary/15 text-primary text-[9px] font-bold leading-none',
          className,
        )}
      >
        {(name || slug).charAt(0).toUpperCase()}
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex flex-shrink-0 items-center justify-center rounded-[3px] p-[2px]',
        className,
      )}
      style={{ backgroundColor: 'hsl(var(--tool-logo-bg))' }}
    >
      <img src={url} alt="" loading="lazy" className="h-full w-full object-contain" />
    </span>
  );
};


export default ToolIcon;
