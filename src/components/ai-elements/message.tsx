import React from 'react';
import { cn } from '@/lib/utils';

type From = 'user' | 'assistant';

export const Message: React.FC<React.HTMLAttributes<HTMLDivElement> & { from: From }> = ({ from, className, ...p }) => (
  <div data-from={from} className={cn('group flex w-full items-end gap-1', from === 'user' ? 'justify-end' : 'justify-start', className)} {...p} />
);

export const MessageContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...p }) => (
  <div className={cn('min-w-0 max-w-[85%] sm:max-w-[70%] overflow-hidden', className)} {...p} />
);
