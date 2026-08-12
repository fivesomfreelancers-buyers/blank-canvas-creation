import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface AutoGrowTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Max pixel height before the textarea starts scrolling internally. */
  maxHeight?: number;
}

/**
 * Chat composer textarea that grows vertically with its content but never
 * grows wider than its parent. Long words / URLs wrap instead of overflowing.
 */
const AutoGrowTextarea = React.forwardRef<HTMLTextAreaElement, AutoGrowTextareaProps>(
  ({ className, maxHeight = 128, value, ...props }, forwardedRef) => {
    const innerRef = useRef<HTMLTextAreaElement | null>(null);

    const setRefs = (el: HTMLTextAreaElement | null) => {
      innerRef.current = el;
      if (typeof forwardedRef === 'function') forwardedRef(el);
      else if (forwardedRef) (forwardedRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
    };

    useEffect(() => {
      const el = innerRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
      el.style.overflowY = el.scrollHeight > maxHeight ? 'auto' : 'hidden';
    }, [value, maxHeight]);

    return (
      <textarea
        ref={setRefs}
        rows={1}
        value={value}
        {...props}
        className={cn(
          'flex-1 min-w-0 w-full max-w-full resize-none border-0 bg-transparent shadow-none outline-none',
          'px-1 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus-visible:ring-0 chat-text',
          className,
        )}
      />
    );
  },
);
AutoGrowTextarea.displayName = 'AutoGrowTextarea';

export default AutoGrowTextarea;
