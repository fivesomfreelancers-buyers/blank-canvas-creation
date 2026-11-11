import { ShieldAlert } from 'lucide-react';
import { SECURITY_WARNING } from '@/lib/contentSafety';
import SuspiciousText from './SuspiciousText';

export default function SecurityWarning({ text }: { text?: string }) {
  return (
    <div role="alert" className="flex gap-2 rounded-lg border border-destructive/50 border-l-4 border-l-primary bg-destructive/10 p-3 text-xs text-destructive">
      <ShieldAlert className="h-4 w-4 shrink-0" />
      <div className="space-y-1">
        <p className="font-semibold">{SECURITY_WARNING}</p>
        {text && <p className="text-foreground/80 break-words"><SuspiciousText text={text} /></p>}
      </div>
    </div>
  );
}
