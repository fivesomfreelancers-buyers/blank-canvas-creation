import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

export const Conversation: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...p }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  });
  return (
    <div ref={ref} className={cn('relative overflow-y-auto overflow-x-hidden', className)} {...p}>
      {children}
    </div>
  );
};

export const ConversationContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => (
  <div className={cn('flex flex-col', className)} {...p} />
);

export const ConversationEmptyState: React.FC<{ className?: string; title: string; description?: string }> = ({ className, title, description }) => (
  <div className={cn('flex flex-col items-center justify-center text-center p-6', className)}>
    <p className="font-medium text-foreground">{title}</p>
    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
  </div>
);

export const ConversationScrollButton: React.FC<{ className?: string }> = () => null;
