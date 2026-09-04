import React from 'react';
import { cn } from '@/lib/utils';
import { softwareLogo } from '@/lib/toolsCatalog';

interface ToolIconProps {
  slug: string;
  name?: string;
  className?: string;
}

/**
 * Renders a bundled tool logo as a CSS mask tinted with `currentColor`,
 * so it stays visible on any theme and can never appear as a broken image.
 * Falls back to a compact initial badge when a logo is unavailable.
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
      className={cn('inline-block flex-shrink-0 bg-current', className)}
      style={{
        maskImage: `url(${url})`,
        WebkitMaskImage: `url(${url})`,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
        maskSize: 'contain',
        WebkitMaskSize: 'contain',
      }}
    />
  );
};

export default ToolIcon;
